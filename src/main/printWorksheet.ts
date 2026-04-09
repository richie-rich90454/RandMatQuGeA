/**
 * @file printWorksheet.ts - Handles printable worksheet generation (Kuta-style)
 * @date 2026-04-09
 * @description Generates a standalone HTML document with questions and optional answer key,
 * using MathJax for LaTeX rendering. Properly cleans up #question-area after each generation
 * so no canvas, Three.js, or other artifacts remain in the main UI.
 */
import { topics, scopeTopics } from "./constants";
import { generateQuestion as callGenerator } from "./questionGenerator";
import * as dom from "./dom";
let modal: HTMLElement|null=null;
let questionCountSelect: HTMLSelectElement|null=null;
let topicSelect: HTMLSelectElement|null=null;
let scopeSelect: HTMLSelectElement|null=null;
let difficultySelect: HTMLSelectElement|null=null;
let answerKeyCheckbox: HTMLInputElement|null=null;
function escapeHtml(str: string): string{
	return str.replace(/[&<>]/g, (m)=>{
		if (m==="&") return "&amp;";
		if (m==="<") return "&lt;";
		if (m===">") return "&gt;";
		return m;
	});
}
function wrapLatexIfNeeded(text: string): string{
	if (!text) return "";
	if (text.match(/\\\(.*\\\)/)||text.match(/\$\$.*\$\$/)||text.match(/\$.*\$/)) return text;
	if (/\\[a-zA-Z]+|[_^]|[{}]|\\[(){}\[\]]/.test(text)){
		return `\\(${text}\\)`;
	}
	return text;
}
function captureInnerHTMLAssignment(target: HTMLElement, generator: ()=>void): string{
	let captured="";
	const originalDescriptor=Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
	if (!originalDescriptor||!originalDescriptor.set) return "";
	const originalSetter=originalDescriptor.set;
	Object.defineProperty(target, "innerHTML", {
		set(value: string){
			captured=value;
			if (originalSetter) originalSetter.call(this, value);
		},
		get(){
			return originalDescriptor.get?.call(this)||"";
		},
		configurable: true
	});
	try{
		generator();
	}
	finally{
		Object.defineProperty(target, "innerHTML", {
			set: originalSetter,
			get: originalDescriptor.get,
			configurable: true
		});
	}
	return captured;
}
function extractLaTeXFromCapturedHTML(html: string): string{
	const temp=document.createElement("div");
	temp.innerHTML=html;
	temp.querySelectorAll("canvas, script, style, [data-threejs]").forEach(el=>el.remove());
	const mjx=temp.querySelector("mjx-container");
	if (mjx){
		const assistive=mjx.querySelector("mjx-assistive-mml math annotation[encoding='application/x-tex']");
		if (assistive?.textContent) return assistive.textContent.trim();
	}
	const pre=temp.querySelector("script[type='math/tex'], script[type='math/tex; mode=display']");
	if (pre?.textContent) return pre.textContent.trim();
	return temp.innerHTML;
}
async function generateQuestionText(topicId: string, difficulty: string): Promise<{ html: string; answerDisplay: string }>{
	if (!dom.questionArea) return { html: "Error: Question area not found", answerDisplay: "" };
	const originalHtml=dom.questionArea.innerHTML;
	const originalCorrectAnswer=(window as any).correctAnswer;
	try{
		dom.questionArea.innerHTML="";
		const capturedHTML=captureInnerHTMLAssignment(dom.questionArea, ()=>callGenerator(topicId, difficulty));
		const latexSource=extractLaTeXFromCapturedHTML(capturedHTML);
		const ansObj=(window as any).correctAnswer;
		const answer=ansObj?.correct||"";
		const answerDisplay=wrapLatexIfNeeded(ansObj?.display||answer);
		return { html: latexSource, answerDisplay };
	}
	finally{
		dom.questionArea.innerHTML=originalHtml;
		(window as any).correctAnswer=originalCorrectAnswer;
	}
}
function updateTopicDropdown(): void{
	if (!topicSelect||!scopeSelect) return;
	let scope=scopeSelect.value;
	let allowedIds=scopeTopics[scope as keyof typeof scopeTopics]||scopeTopics.all;
	let filteredTopics=topics.filter(t=>allowedIds.includes(t.id));
	topicSelect.innerHTML="<option value=\"all\">All topics (from selected scope)</option>";
	for (let t of filteredTopics){
		let opt=document.createElement("option");
		opt.value=t.id;
		opt.textContent=t.name;
		topicSelect.appendChild(opt);
	}
}
async function generateWorksheet(): Promise<void>{
	let count=parseInt(questionCountSelect?.value||"10", 10);
	let topic=topicSelect?.value||"all";
	let scope=scopeSelect?.value||"all";
	let difficulty=difficultySelect?.value||"medium";
	let includeAnswers=answerKeyCheckbox?.checked||false;
	let topicList: string[]=[];
	if (topic==="all"){
		let allowedIds=scopeTopics[scope as keyof typeof scopeTopics]||scopeTopics.all;
		topicList=allowedIds;
	}
	else{
		topicList=[topic];
	}
	if (topicList.length===0){
		alert("No topics available in this scope.");
		return;
	}
	let questions: Array<{ html: string; answerDisplay: string }>=[];
	for (let i=0; i<count; i++){
		let selectedTopic=topicList[Math.floor(Math.random()*topicList.length)];
		let diff=difficulty==="mixed"?["easy","medium","hard"][Math.floor(Math.random()*3)]:difficulty;
		try{
			let q=await generateQuestionText(selectedTopic, diff);
			questions.push(q);
		}
		catch (err){
			console.error("Question generation failed:", err);
			questions.push({ html: "\\text{[Error generating question]}", answerDisplay: "" });
		}
	}
	let docHtml=`<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Math Worksheet</title>
	<script>
		window.MathJax={
			tex: {
				inlineMath: [["$", "$"], ["\\\\(", "\\\\)"]],
				displayMath: [["$$", "$$"], ["\\\\[", "\\\\]"]]
			},
			svg: { fontCache: "global" },
			options: { ignoreHtmlClass: "tex2jax_ignore", processHtmlClass: "tex2jax_process" }
		};
	</script>
	<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" defer></script>
	<style>
		body{
			font-family: "Times New Roman", serif;
			font-size: 12pt;
			margin: 0.75in;
			padding: 0;
			background: white;
			color: black;
			line-height: 1.45;
		}
		@page { margin: 0.75in; }
		h1, h2 { text-align: center; }
		hr { margin: 25px 0; }
		.questions-list{
			list-style: none;
			counter-reset: question-counter;
			padding-left: 0;
		}
		.question-item{
			margin-bottom: 45px;
			counter-increment: question-counter;
			position: relative;
			padding-left: 38px;
		}
		.question-item:before{
			content: counter(question-counter) ".";
			position: absolute;
			left: 0;
			font-weight: bold;
		}
		.question-text{
			margin-bottom: 12px;
			display: block;
		}
		.answer-space{
			height: 1.4em;
			border-bottom: 1px solid #000;
			width: 70%;
			margin-top: 8px;
		}
		.answer-key{
			page-break-before: always;
		}
		.answer-key ol{
			margin-top: 15px;
		}
	</style>
</head>
<body>
	<div class="worksheet">
		<h1>Math Worksheet</h1>
		<p>Topic: ${topic==="all"?`Scope: ${scope}`:(topics.find(t=>t.id===topic)?.name||topic)}</p>
		<p>Difficulty: ${difficulty}</p>
		<hr>
		<ol class="questions-list">`;
	for (let q of questions){
		docHtml+=`
			<li class="question-item">
				<div class="question-text tex2jax_process">${q.html}</div>
				<div class="answer-space"></div>
			</li>`;
	}
	docHtml+=`</ol>`;
	if (includeAnswers){
		docHtml+=`<div class="answer-key"><h2>Answer Key</h2><ol class="tex2jax_process">`;
		for (let q of questions){
			docHtml+=`<li>${wrapLatexIfNeeded(q.answerDisplay)}</li>`;
		}
		docHtml+=`</ol></div>`;
	}
	docHtml+=`
	</div>
	<script>
		window.addEventListener("load", function(){
			if (window.MathJax&&typeof window.MathJax.typesetPromise==="function"){
				window.MathJax.typesetPromise()
					.then(()=>{ setTimeout(()=>window.print(), 800); })
					.catch(()=>{ setTimeout(()=>window.print(), 1500); });
			}
			else{
				setTimeout(()=>window.print(), 2000);
			}
		});
	</script>
</body>
</html>`;
	let printWindow=window.open("", "_blank", "width=1200,height=900");
	if (printWindow){
		printWindow.document.write(docHtml);
		printWindow.document.close();
		printWindow.focus();
	}
	else{
		alert("Popup was blocked. Please allow pop-ups for this website.");
	}
}
export function openPrintModal(): void{
	modal?.classList.add("show");
}
export function initPrintModal(): void{
	modal=document.getElementById("print-modal");
	if (!modal) return;
	questionCountSelect=document.getElementById("print-question-count") as HTMLSelectElement;
	topicSelect=document.getElementById("print-topic") as HTMLSelectElement;
	scopeSelect=document.getElementById("print-scope") as HTMLSelectElement;
	difficultySelect=document.getElementById("print-difficulty") as HTMLSelectElement;
	answerKeyCheckbox=document.getElementById("print-answer-key") as HTMLInputElement;
	let generateBtn=document.getElementById("print-generate");
	let closeBtn=document.getElementById("print-close");
	if (closeBtn) closeBtn.addEventListener("click", ()=>modal?.classList.remove("show"));
	if (generateBtn) generateBtn.addEventListener("click", generateWorksheet);
	scopeSelect?.addEventListener("change", updateTopicDropdown);
	updateTopicDropdown();
}