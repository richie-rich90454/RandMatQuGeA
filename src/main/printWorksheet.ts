/**
 * @file printWorksheet.ts - Worksheet generation with PDF export
 * @date 2026-04-09
 * @description Generates math worksheets with KaTeX-rendered questions and exports
 * them as PDF files using jsPDF + html2canvas. Supports header fields (title,
 * name, date, period), configurable answer-key modes, page numbers, metadata,
 * and a live preview pane.
 */
import { topics, scopeTopics } from "./constants";
import { generateQuestionDto } from "./questionGenerator";
import { invoke } from "@tauri-apps/api/core";
import { seededRng } from "./core/rng";
import type { RngFn } from "../types/global";
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
let lastWorksheetEl: HTMLElement | null = null;
let lastWorksheetOpts: WorksheetOptions | null = null;
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
	for (let i = 0; i < opts.count; i++){
		let selectedTopic = pickTopic(topicList, rng);
		let diff = pickDifficulty(opts.difficulty, rng);
		let topicName = topics.find(t=>t.id === selectedTopic)?.name || selectedTopic;
		try{
			let dto = await generateQuestionDto(selectedTopic, diff, rng);
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
			questions.push({
				html: "\\text{[Error generating question]}",
				answerDisplay: "",
				topicId: selectedTopic,
				topicName,
				difficulty: diff
			});
		}
	}
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
		if (opts.answerKeyMode === "separate" || opts.answerKeyMode === "only"){
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
async function exportToPdf(worksheetEl: HTMLElement, opts: WorksheetOptions): Promise<void>{
	let jspdfModule: any = null;
	let html2canvasModule: any = null;
	try{
		[jspdfModule, html2canvasModule] = await Promise.all([
			import("jspdf"),
			import("html2canvas")
		]);
	}
	catch (err){
		console.error("Failed to load PDF libraries:", err);
		alert("Failed to load PDF libraries. Please check your installation.");
		return;
	}
	let jsPDF = jspdfModule?.jsPDF || jspdfModule?.default;
	let html2canvas = html2canvasModule?.default || html2canvasModule;
	if (!jsPDF || !html2canvas){
		alert("PDF libraries not available.");
		return;
	}
	let pdf: any;
	try{
		pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
	}
	catch (err){
		console.error("Failed to create PDF:", err);
		alert("Failed to create PDF document.");
		return;
	}
	let canvas: HTMLCanvasElement;
	try{
		canvas = await html2canvas(worksheetEl, {
			scale: 2,
			backgroundColor: "#ffffff",
			useCORS: true,
			logging: false
		});
	}
	catch (err){
		console.error("html2canvas failed:", err);
		alert("Failed to render worksheet for PDF export.");
		return;
	}
	let pageWidth = pdf.internal.pageSize.getWidth();
	let pageHeight = pdf.internal.pageSize.getHeight();
	let margin = 36;
	let contentWidth = pageWidth - 2 * margin;
	let imgWidth = contentWidth;
	let imgHeight = (canvas.height * imgWidth) / canvas.width;
	let pageContentHeight = pageHeight - 2 * margin;
	if (imgHeight <= pageContentHeight){
		let imgData = canvas.toDataURL("image/png");
		pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
	}
	else{
		let renderedHeight = 0;
		let totalHeight = imgHeight;
		while (renderedHeight < totalHeight){
			let sliceHeight = Math.min(pageContentHeight, totalHeight - renderedHeight);
			let sourceSliceHeight = (sliceHeight * canvas.width) / imgWidth;
			let sourceY = (renderedHeight * canvas.width) / imgWidth;
			let sliceCanvas = document.createElement("canvas");
			sliceCanvas.width = canvas.width;
			sliceCanvas.height = Math.ceil(sourceSliceHeight);
			let ctx = sliceCanvas.getContext("2d");
			if (!ctx) break;
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
			ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceSliceHeight, 0, 0, canvas.width, sourceSliceHeight);
			let imgData = sliceCanvas.toDataURL("image/png");
			pdf.addImage(imgData, "PNG", margin, margin, imgWidth, sliceHeight);
			renderedHeight += sliceHeight;
			if (renderedHeight < totalHeight){
				pdf.addPage();
			}
		}
	}
	if (opts.pageNumbers){
		let pageCount = pdf.internal.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++){
			pdf.setPage(i);
			pdf.setFontSize(9);
			pdf.setTextColor(120, 120, 120);
			pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 12, { align: "center" });
		}
	}
	let filename = (opts.title || "worksheet").replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";
	try{
		pdf.save(filename);
	}
	catch (err){
		console.error("Failed to save PDF:", err);
		alert("Failed to save PDF file.");
	}
}
async function updatePreview(worksheetEl: HTMLElement): Promise<void>{
	if (!previewPane) return;
	let html2canvasModule: any;
	try{
		html2canvasModule = await import("html2canvas");
	}
	catch{
		previewPane.innerHTML = "<p class=\"ws-preview-error\">Preview unavailable (html2canvas failed to load).</p>";
		return;
	}
	let html2canvas = html2canvasModule?.default || html2canvasModule;
	if (!html2canvas){
		previewPane.innerHTML = "<p class=\"ws-preview-error\">Preview unavailable.</p>";
		return;
	}
	try{
		let canvas = await html2canvas(worksheetEl, {
			scale: 1,
			backgroundColor: "#ffffff",
			useCORS: true,
			logging: false
		});
		previewPane.innerHTML = "";
		let wrapper = document.createElement("div");
		wrapper.className = "ws-preview-wrapper";
		let img = document.createElement("img");
		img.src = canvas.toDataURL("image/png");
		img.alt = "Worksheet preview";
		img.className = "ws-preview-img";
		wrapper.appendChild(img);
		previewPane.appendChild(wrapper);
	}
	catch (err){
		console.error("Preview render failed:", err);
		previewPane.innerHTML = "<p class=\"ws-preview-error\">Preview failed to render.</p>";
	}
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
		lastWorksheetEl = worksheetEl;
		lastWorksheetOpts = opts;
		if (seedInput) seedInput.value = String(seed);
		if (copySeedBtn) copySeedBtn.classList.remove("hidden");
		await updatePreview(worksheetEl);
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
	if (!lastWorksheetEl || !lastWorksheetOpts){
		alert("Please generate a worksheet preview first.");
		return;
	}
	if (exportBtn){
		exportBtn.disabled = true;
		exportBtn.textContent = "Exporting...";
	}
	try{
		await exportToPdf(lastWorksheetEl, lastWorksheetOpts);
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
	if (scopeSelect) scopeSelect.addEventListener("change", updateTopicDropdown);
	updateTopicDropdown();
}
