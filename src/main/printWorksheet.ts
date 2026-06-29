/**
 * @file printWorksheet.ts - Worksheet generation with PDF export
 * @date 2026-04-09
 * @description Generates math worksheets with KaTeX-rendered questions and exports
 * them as PDF files via Rust (printpdf) in Tauri mode, or window.print() in web mode.
 * Supports header fields (title, name, date, period), configurable answer-key modes,
 * page numbers, metadata, seeded reproducibility, and a live preview pane.
 */
import { topics, scopeTopics } from "./constants";
import { generateQuestionDto } from "./questionGenerator";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { seededRng } from "./core/rng";
import { showNotification } from "./ui";
import type { RngFn, QuestionDto } from "../types/global";
let modal: HTMLElement | null = null;
let questionCountSelect: HTMLSelectElement | null = null;
let topicSelect: HTMLSelectElement | null = null;
let scopeSelect: HTMLSelectElement | null = null;
let difficultySelect: HTMLSelectElement | null = null;
let answerKeyModeSelect: HTMLSelectElement | null = null;
let pageNumbersCheckbox: HTMLInputElement | null = null;
let showMetadataCheckbox: HTMLInputElement | null = null;
let titleInput: HTMLInputElement | null = null;
let nameInput: HTMLInputElement | null = null;
let dateInput: HTMLInputElement | null = null;
let periodInput: HTMLInputElement | null = null;
let seedInput: HTMLInputElement | null = null;
let copySeedBtn: HTMLButtonElement | null = null;
let previewPane: HTMLElement | null = null;
let exportBtn: HTMLButtonElement | null = null;
let closeBtn: HTMLButtonElement | null = null;
let lastWorksheetOpts: WorksheetOptions | null = null;
let lastWorksheetDtos: QuestionDto[] = [];
let isGenerating = false;
interface WorksheetOptions{
	count: number;
	topic: string;
	scope: string;
	difficulty: string;
	answerKeyMode: "none" | "append" | "separate" | "only";
	pageNumbers: boolean;
	showMetadata: boolean;
	title: string;
	studentName: string;
	date: string;
	period: string;
	seed: number;
}
interface GeneratedQuestion{
	html: string;
	answerDisplay: string;
	topicId: string;
	topicName: string;
	difficulty: string;
}
function escapeHtml(text: string): string{
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}
export function wrapLatexIfNeeded(text: string): string{
	if (!text) return "";
	if (/\\\((.+?)\\\)/.test(text) || /\$\$(.+?)\$\$/.test(text) || /\$([^$]+?)\$/.test(text)) return text;
	if (/\\[a-zA-Z]+|[_^]|[{}]|\\[(){}\[\]]/.test(text)){
		return `\\(${text}\\)`;
	}
	return text;
}
function updateTopicDropdown(): void{
	if (!topicSelect || !scopeSelect) return;
	let scope = scopeSelect.value;
	let allowedIds = scopeTopics[scope as keyof typeof scopeTopics] || scopeTopics.all;
	let filteredTopics = topics.filter(t=>allowedIds.includes(t.id));
	topicSelect.innerHTML = "<option value=\"all\">All topics (from selected scope)</option>";
	for (let t of filteredTopics){
		let opt = document.createElement("option");
		opt.value = t.id;
		opt.textContent = t.name;
		topicSelect.appendChild(opt);
	}
}
function readOptions(): WorksheetOptions{
	let count = parseInt(questionCountSelect?.value || "10", 10);
	if (isNaN(count) || count < 1) count = 10;
	if (count > 100) count = 100;
	let answerKeyMode = (answerKeyModeSelect?.value || "append") as WorksheetOptions["answerKeyMode"];
	if (!["none", "append", "separate", "only"].includes(answerKeyMode)) answerKeyMode = "append";
	let today = new Date().toISOString().split("T")[0];
	return {
		count,
		topic: topicSelect?.value || "all",
		scope: scopeSelect?.value || "all",
		difficulty: difficultySelect?.value || "medium",
		answerKeyMode,
		pageNumbers: pageNumbersCheckbox?.checked ?? false,
		showMetadata: showMetadataCheckbox?.checked ?? true,
		title: titleInput?.value?.trim() || "Math Worksheet",
		studentName: nameInput?.value?.trim() || "",
		date: dateInput?.value || today,
		period: periodInput?.value?.trim() || "",
		seed: 0
	};
}
function pickDifficulty(difficulty: string, rng: RngFn): string{
	if (difficulty === "mixed"){
		let levels = ["easy", "medium", "hard"];
		return levels[Math.floor(rng() * 3)];
	}
	return difficulty;
}
function pickTopic(topicList: string[], rng: RngFn): string{
	return topicList[Math.floor(rng() * topicList.length)];
}
function buildTopicList(opts: WorksheetOptions): string[]{
	if (opts.topic === "all"){
		let allowedIds = scopeTopics[opts.scope as keyof typeof scopeTopics] || scopeTopics.all;
		return allowedIds;
	}
	return [opts.topic];
}
function isTauriAvailable(): boolean{
	return typeof (window as any).__TAURI_INTERNALS__ !== "undefined" || typeof (window as any).__TAURI__ !== "undefined";
}
async function resolveSeed(): Promise<number>{
	let inputVal = seedInput?.value?.trim() || "";
	if (inputVal){
		let parsed = parseInt(inputVal, 10);
		if (!isNaN(parsed) && parsed > 0) return parsed;
	}
	if (isTauriAvailable()){
		try{
			let seed = await invoke<number>("generate_worksheet_seed");
			if (typeof seed === "number" && seed > 0) return seed;
		}
		catch (err){
			console.error("Failed to invoke generate_worksheet_seed:", err);
		}
	}
	// Web-mode fallback: derive a seed from Date.now() XOR Math.random()
	return ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
}
async function generateQuestions(opts: WorksheetOptions, rng: RngFn): Promise<GeneratedQuestion[]>{
	let topicList = buildTopicList(opts);
	if (topicList.length === 0) return [];
	let questions: GeneratedQuestion[] = [];
	let dtos: QuestionDto[] = [];
	for (let i = 0; i < opts.count; i++){
		let selectedTopic = pickTopic(topicList, rng);
		let diff = pickDifficulty(opts.difficulty, rng);
		let topicName = topics.find(t=>t.id === selectedTopic)?.name || selectedTopic;
		try{
			let dto = await generateQuestionDto(selectedTopic, diff, rng);
			dtos.push(dto);
			questions.push({
				html: dto.latex,
				answerDisplay: wrapLatexIfNeeded(dto.display || dto.correct || ""),
				topicId: selectedTopic,
				topicName,
				difficulty: diff
			});
		}
		catch (err){
			console.error("Question generation failed:", err);
			dtos.push({ latex: "\\text{[Error]}", correct: "" });
			questions.push({
				html: "\\text{[Error generating question]}",
				answerDisplay: "",
				topicId: selectedTopic,
				topicName,
				difficulty: diff
			});
		}
	}
	lastWorksheetDtos = dtos;
	return questions;
}
function buildHeaderHtml(opts: WorksheetOptions): string{
	let title = escapeHtml(opts.title);
	let lines: string[] = [];
	lines.push(`<h1 class="ws-title">${title}</h1>`);
	let metaRow: string[] = [];
	if (opts.studentName) metaRow.push(`<span class="ws-field"><strong>Name:</strong> ${escapeHtml(opts.studentName)}</span>`);
	if (opts.date) metaRow.push(`<span class="ws-field"><strong>Date:</strong> ${escapeHtml(opts.date)}</span>`);
	if (opts.period) metaRow.push(`<span class="ws-field"><strong>Period:</strong> ${escapeHtml(opts.period)}</span>`);
	if (metaRow.length > 0){
		lines.push(`<div class="ws-header-row">${metaRow.join("")}</div>`);
	}
	if (opts.showMetadata){
		let scopeDisplay = opts.topic === "all" ? opts.scope : (topics.find(t=>t.id === opts.topic)?.name || opts.topic);
		lines.push(`<div class="ws-meta"><span>Topic: ${escapeHtml(scopeDisplay)}</span><span>Difficulty: ${escapeHtml(opts.difficulty)}</span></div>`);
	}
	lines.push("<hr class=\"ws-divider\">");
	return lines.join("");
}
function buildQuestionsHtml(questions: GeneratedQuestion[]): string{
	if (questions.length === 0){
		return "<p class=\"ws-empty\">No questions could be generated. Try a different topic or scope.</p>";
	}
	let items = questions.map((q)=>{
		return `<li class="ws-question"><div class="ws-question-text">${q.html}</div><div class="ws-answer-space"></div></li>`;
	}).join("");
	return `<ol class="ws-questions">${items}</ol>`;
}
function buildAnswerKeyHtml(questions: GeneratedQuestion[]): string{
	if (questions.length === 0) return "";
	let items = questions.map((q)=>{
		return `<li class="ws-answer">${q.answerDisplay || "\\text{(no answer)}"}</li>`;
	}).join("");
	return `<div class="ws-answer-key"><h2 class="ws-answer-title">Answer Key</h2><ol class="ws-answer-list">${items}</ol></div>`;
}
function buildWorksheetHtml(questions: GeneratedQuestion[], opts: WorksheetOptions): string{
	let header = buildHeaderHtml(opts);
	let body = "";
	let answerKey = "";
	let showQuestions = opts.answerKeyMode !== "only";
	let showAnswers = opts.answerKeyMode !== "none";
	if (showQuestions){
		body = buildQuestionsHtml(questions);
	}
	if (showAnswers){
		answerKey = buildAnswerKeyHtml(questions);
		// Always start the answer key on a new page when questions are shown,
		// so the worksheet is safe to print without answers bleeding onto the
		// question page. In "only" mode there are no questions, so no break needed.
		if (showQuestions){
			answerKey = `<div class="ws-page-break"></div>${answerKey}`;
		}
	}
	return `<div class="ws-document">${header}${body}${answerKey}</div>`;
}
function renderToHiddenDiv(html: string): HTMLElement{
	let existing = document.getElementById("ws-render-container");
	if (existing) existing.remove();
	let container = document.createElement("div");
	container.id = "ws-render-container";
	container.style.position = "absolute";
	container.style.left = "-9999px";
	container.style.top = "0";
	container.style.width = "612px";
	container.style.background = "#ffffff";
	container.style.color = "#000000";
	container.style.fontFamily = "'Times New Roman', serif";
	container.style.fontSize = "12pt";
	container.style.lineHeight = "1.45";
	container.style.padding = "54px";
	container.style.boxSizing = "border-box";
	container.innerHTML = html;
	document.body.appendChild(container);
	return container;
}
export function renderKatexInElement(el: HTMLElement): void{
	let katexRef: any = (window as any).katex;
	if (!katexRef) return;
	let renderToString = (latex: string, displayMode: boolean): string=>{
		try{
			return katexRef.renderToString(latex, { throwOnError: false, displayMode });
		}
		catch{
			return latex;
		}
	};
	let splitAndRender = (text: string, displayMode: boolean): string=>{
		let pattern = displayMode ? /(\$\$.+?\$\$)/g : /(\\\(.+?\\\)|\$\$.+?\$\$|\$[^$]+?\$)/g;
		let parts = text.split(pattern);
		let result = "";
		for (let part of parts){
			if (!part) continue;
			if (displayMode && /^\$\$.+\$\$$/.test(part)){
				let inner = part.slice(2, -2);
				result += renderToString(inner, true);
			}
			else if (/^\\\(.+\\\)$/.test(part)){
				let inner = part.slice(2, -2);
				result += renderToString(inner, false);
			}
			else if (/^\$\$.+\$\$$/.test(part)){
				let inner = part.slice(2, -2);
				result += renderToString(inner, true);
			}
			else if (/^\$[^$]+\$$/.test(part)){
				let inner = part.slice(1, -1);
				result += renderToString(inner, false);
			}
			else{
				result += part;
			}
		}
		return result;
	};
	let processNode = (node: HTMLElement)=>{
		let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
		let textNodes: Text[] = [];
		let current: Node | null;
		while (current = walker.nextNode()){
			textNodes.push(current as Text);
		}
		for (let textNode of textNodes){
			let text = textNode.nodeValue || "";
			let parent = textNode.parentElement;
			if (!parent) continue;
			let isDisplay = parent.tagName === "DIV" && (parent.className || "").includes("ws-question-text");
			let rendered = splitAndRender(text, isDisplay);
			if (rendered !== text){
				let span = document.createElement("span");
				span.innerHTML = rendered;
				parent.replaceChild(span, textNode);
			}
		}
	};
	processNode(el);
}
async function exportToPdf(opts: WorksheetOptions, dtos: QuestionDto[]): Promise<void>{
	// Primary path: Rust PDF export. Each LaTeX math expression is rendered to
	// a PNG by the pure-Rust RaTeX engine (KaTeX-compatible) and embedded as an
	// image in the PDF, giving perfect rendering of fractions, matrices,
	// integrals, Greek letters, etc. If the Rust command fails for any reason,
	// fall back to window.print(), which reuses the KaTeX-rendered HTML from
	// the live preview via #ws-print-container.
	if (isTauriAvailable()){
		try{
			let filename=(opts.title || "worksheet").replace(/[^a-zA-Z0-9_-]/g, "_")+".pdf";
			let filepath=await save({
				defaultPath: filename,
				filters: [{ name: "PDF", extensions: ["pdf"] }]
			});
			if (!filepath) return;
			await invoke("export_worksheet_pdf", { questions: dtos, opts, filepath });
			showNotification("PDF exported successfully.", "info");
			return;
		}
		catch (err){
			console.error("Rust PDF export failed, falling back to window.print():", err);
			showNotification("Rust PDF export failed; using browser print fallback.", "warning");
		}
	}
	populatePrintContainer(opts, dtos);
	window.print();
}
function populatePrintContainer(opts: WorksheetOptions, dtos: QuestionDto[]): void{
	let container = document.getElementById("ws-print-container");
	if (!container){
		container = document.createElement("div");
		container.id = "ws-print-container";
		document.body.appendChild(container);
	}
	let questions: GeneratedQuestion[] = dtos.map(dto=>({
		html: dto.latex,
		answerDisplay: wrapLatexIfNeeded(dto.display || dto.correct || ""),
		topicId: "",
		topicName: "",
		difficulty: ""
	}));
	let html = buildWorksheetHtml(questions, opts);
	container.innerHTML = html;
	renderKatexInElement(container);
}
function updatePreview(worksheetEl: HTMLElement): void{
	if (!previewPane) return;
	previewPane.innerHTML = "";
	let wrapper = document.createElement("div");
	wrapper.className = "ws-preview-wrapper";
	wrapper.innerHTML = worksheetEl.innerHTML;
	previewPane.appendChild(wrapper);
}
async function generateWorksheet(): Promise<void>{
	if (isGenerating) return;
	isGenerating = true;
	if (exportBtn){
		exportBtn.disabled = true;
		exportBtn.textContent = "Generating...";
	}
	if (previewPane){
		previewPane.innerHTML = "<div class=\"ws-preview-loading\"><div class=\"spinner\"></div><p>Generating preview...</p></div>";
	}
	try{
		let opts = readOptions();
		let seed = await resolveSeed();
		opts.seed = seed;
		let rng = seededRng(seed);
		let questions = await generateQuestions(opts, rng);
		if (questions.length === 0){
			alert("No questions could be generated. Please select a different topic or scope.");
			if (previewPane) previewPane.innerHTML = "";
			return;
		}
		let html = buildWorksheetHtml(questions, opts);
		let worksheetEl = renderToHiddenDiv(html);
		renderKatexInElement(worksheetEl);
		lastWorksheetOpts = opts;
		if (seedInput) seedInput.value = String(seed);
		if (copySeedBtn) copySeedBtn.classList.remove("hidden");
		updatePreview(worksheetEl);
	}
	catch (err){
		console.error("Worksheet generation failed:", err);
		alert("Failed to generate worksheet. Please try again.");
		if (previewPane) previewPane.innerHTML = "";
	}
	finally{
		isGenerating = false;
		if (exportBtn){
			exportBtn.disabled = false;
			exportBtn.textContent = "Export PDF";
		}
	}
}
async function handleExportPdf(): Promise<void>{
	if (!lastWorksheetOpts || lastWorksheetDtos.length === 0){
		alert("Please generate a worksheet preview first.");
		return;
	}
	if (exportBtn){
		exportBtn.disabled = true;
		exportBtn.textContent = "Exporting...";
	}
	try{
		await exportToPdf(lastWorksheetOpts, lastWorksheetDtos);
	}
	catch (err){
		console.error("PDF export failed:", err);
		alert("Failed to export PDF. Please try again.");
	}
	finally{
		if (exportBtn){
			exportBtn.disabled = false;
			exportBtn.textContent = "Export PDF";
		}
	}
}
async function handleCopySeed(): Promise<void>{
	if (!seedInput) return;
	let seedVal = seedInput.value.trim();
	if (!seedVal){
		showNotification("No seed to copy yet. Generate a worksheet first.","warning");
		return;
	}
	try{
		await navigator.clipboard.writeText(seedVal);
		showNotification(`Seed ${seedVal} copied to clipboard.`,"info");
	}
	catch (err){
		console.error("Clipboard write failed:", err);
		showNotification("Failed to copy seed to clipboard.","warning");
	}
}
export function openPrintModal(): void{
	modal?.classList.remove("hidden");
	modal?.classList.add("show");
	let today = new Date().toISOString().split("T")[0];
	if (dateInput && !dateInput.value) dateInput.value = today;
}
export function closePrintModal(): void{
	modal?.classList.remove("show");
	modal?.classList.add("hidden");
}
export function initPrintModal(): void{
	modal = document.getElementById("print-modal");
	if (!modal) return;
	questionCountSelect = document.getElementById("print-question-count") as HTMLSelectElement;
	topicSelect = document.getElementById("print-topic") as HTMLSelectElement;
	scopeSelect = document.getElementById("print-scope") as HTMLSelectElement;
	difficultySelect = document.getElementById("print-difficulty") as HTMLSelectElement;
	answerKeyModeSelect = document.getElementById("print-answer-key-mode") as HTMLSelectElement;
	pageNumbersCheckbox = document.getElementById("print-page-numbers") as HTMLInputElement;
	showMetadataCheckbox = document.getElementById("print-show-metadata") as HTMLInputElement;
	titleInput = document.getElementById("print-title-input") as HTMLInputElement;
	nameInput = document.getElementById("print-name-input") as HTMLInputElement;
	dateInput = document.getElementById("print-date-input") as HTMLInputElement;
	periodInput = document.getElementById("print-period-input") as HTMLInputElement;
	seedInput = document.getElementById("print-seed-input") as HTMLInputElement;
	copySeedBtn = document.getElementById("print-copy-seed") as HTMLButtonElement;
	previewPane = document.getElementById("print-preview");
	exportBtn = document.getElementById("print-export-pdf") as HTMLButtonElement;
	closeBtn = document.getElementById("print-close") as HTMLButtonElement;
	let generateBtn = document.getElementById("print-generate") as HTMLButtonElement;
	if (closeBtn) closeBtn.addEventListener("click", closePrintModal);
	if (generateBtn) generateBtn.addEventListener("click", ()=>{ generateWorksheet().catch((err: unknown)=>console.error("generateWorksheet failed:", err)); });
	if (exportBtn) exportBtn.addEventListener("click", ()=>{ handleExportPdf().catch((err: unknown)=>console.error("handleExportPdf failed:", err)); });
	if (copySeedBtn) copySeedBtn.addEventListener("click", ()=>{ handleCopySeed().catch((err: unknown)=>console.error("handleCopySeed failed:", err)); });
	if (scopeSelect) scopeSelect.addEventListener("change", updateTopicDropdown);
	updateTopicDropdown();
}
