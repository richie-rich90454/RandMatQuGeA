// src/main/printWorksheet.ts
/**
 * @file printWorksheet.ts - Handles printable worksheet generation (Kuta-style)
 * @date 2026-04-05
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
		if (m==='&') return '&amp;';
		if (m==='<') return '&lt;';
		if (m==='>') return '&gt;';
		return m;
	});
}
function wrapLatexIfNeeded(text: string): string{
	if (!text) return '';
	if (text.match(/\\\(.*\\\)/)||text.match(/\$\$.*\$\$/)||text.match(/\$.*\$/)) return text;
	if (/\\[a-zA-Z]+|[_^]|[{}]|\\[(){}\[\]]/.test(text)){
		return `\\(${text}\\)`;
	}
	return text;
}
function cleanQuestionText(html: string): string{
	let tempDiv=document.createElement('div');
	tempDiv.innerHTML=html;
	tempDiv.querySelectorAll('canvas, script, style, [data-threejs]').forEach(el=>el.remove());
	let lines: string[]=[];
	let walk=(node: Node)=>{
		if (node.nodeType===Node.TEXT_NODE){
			let text=node.textContent?.trim()||'';
			if (text) lines.push(text);
		}
		else if (node.nodeType===Node.ELEMENT_NODE){
			let el=node as Element;
			if (el.tagName==='BR'){
				lines.push('');
			}
			else if (el.tagName==='P'||el.tagName==='DIV'){
				walkChildren(el);
				lines.push('');
			}
			else{
				walkChildren(el);
			}
		}
	};
	let walkChildren=(parent: Element)=>{
		for (let child of parent.childNodes) walk(child);
	};
	walkChildren(tempDiv);
	let cleaned=lines.filter((line, idx, arr)=>line!==''||(idx>0&&arr[idx-1]!==''));
	return cleaned.map(l=>l===''?'<br>':`<span class="question-line">${escapeHtml(l)}</span>`).join('');
}
async function waitForQuestionContent(timeoutMs: number=2000): Promise<void>{
	let start=Date.now();
	let lastHtml='';
	let stableCount=0;
	let requiredStable=2;
	while (Date.now()-start<timeoutMs){
		let current=dom.questionArea?.innerHTML||'';
		if (current&&current===lastHtml){
			stableCount++;
			if (stableCount>=requiredStable) return;
		}
		else{
			stableCount=0;
		}
		lastHtml=current;
		await new Promise(r=>setTimeout(r, 50));
	}
}
async function generateQuestionText(topicId: string, difficulty: string): Promise<{ html: string; answerDisplay: string }>{
	if (!dom.questionArea){
		return { html: "Error: Question area not found", answerDisplay: "" };
	}
	let originalHtml=dom.questionArea.innerHTML;
	let originalCorrectAnswer=(window as any).correctAnswer;
	try{
		dom.questionArea.innerHTML='';
		callGenerator(topicId, difficulty);
		await waitForQuestionContent(3000);
		let rawHtml=dom.questionArea.innerHTML||'';
		let cleanedHtml=cleanQuestionText(rawHtml);
		let ansObj=(window as any).correctAnswer;
		let answer=ansObj?.correct||'';
		let answerDisplay=ansObj?.display||answer;
		answerDisplay=wrapLatexIfNeeded(answerDisplay);
		return { html: cleanedHtml, answerDisplay };
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
	topicSelect.innerHTML='<option value="all">All topics (from selected scope)</option>';
	for (let t of filteredTopics){
		let opt=document.createElement('option');
		opt.value=t.id;
		opt.textContent=t.name;
		topicSelect.appendChild(opt);
	}
}
async function generateWorksheet(): Promise<void>{
	let count=parseInt(questionCountSelect?.value||'10', 10);
	let topic=topicSelect?.value||'all';
	let scope=scopeSelect?.value||'all';
	let difficulty=difficultySelect?.value||'medium';
	let includeAnswers=answerKeyCheckbox?.checked||false;
	let topicList: string[]=[];
	if (topic==='all'){
		let allowedIds=scopeTopics[scope as keyof typeof scopeTopics]||scopeTopics.all;
		topicList=allowedIds;
	}
	else{
		topicList=[topic];
	}
	if (topicList.length===0){
		alert('No topics available in this scope.');
		return;
	}
	let questions: Array<{ html: string; answerDisplay: string }>=[];
	for (let i=0; i<count; i++){
		let selectedTopic=topicList[Math.floor(Math.random()*topicList.length)];
		let diff=difficulty==='mixed'
			? ['easy', 'medium', 'hard'][Math.floor(Math.random()*3)]
			: difficulty;
		try{
			let q=await generateQuestionText(selectedTopic, diff);
			questions.push(q);
		}
		catch (err){
			console.error('Question generation failed:', err);
			questions.push({
				html: '<span class="question-line">[Error generating question]</span>',
				answerDisplay: ''
			});
		}
	}
	let docHtml=`<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Math Worksheet</title>
	<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" defer></script>
	<style>
		body{
			font-family: serif;
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
            display: inline-flex;
		}
		.question-line{
			display: block;
			margin: 3px 0;
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
		<p>Topic: ${topic==='all'?`Scope: ${scope}`:(topics.find(t=>t.id===topic)?.name||topic)}</p>
		<p>Difficulty: ${difficulty}</p>
		<hr>
		<ol class="questions-list">`;
	for (let q of questions){
		docHtml+=`
			<li class="question-item">
				<div class="question-text">${q.html}</div>
				<div class="answer-space"></div>
			</li>`;
	}
	docHtml+=`</ol>`;
	if (includeAnswers){
		docHtml+=`<div class="answer-key"><h2>Answer Key</h2><ol>`;
		for (let q of questions){
			docHtml+=`<li>${wrapLatexIfNeeded(q.answerDisplay)}</li>`;
		}
		docHtml+=`</ol></div>`;
	}
	docHtml+=`
	</div>
	<script>
		window.addEventListener('load', function(){
			if (window.MathJax&&typeof window.MathJax.typesetPromise==='function'){
				window.MathJax.typesetPromise()
					.then(()=>{
						setTimeout(()=>window.print(), 800);
					})
					.catch(()=>{
						setTimeout(()=>window.print(), 1500);
					});
			}
			else{
				setTimeout(()=>window.print(), 2000);
			}
		});
	</script>
</body>
</html>`;
	let printWindow=window.open('', '_blank', 'width=1200,height=900');
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
	modal?.classList.add('show');
}
export function initPrintModal(): void{
	modal=document.getElementById('print-modal');
	if (!modal) return;
	questionCountSelect=document.getElementById('print-question-count') as HTMLSelectElement;
	topicSelect=document.getElementById('print-topic') as HTMLSelectElement;
	scopeSelect=document.getElementById('print-scope') as HTMLSelectElement;
	difficultySelect=document.getElementById('print-difficulty') as HTMLSelectElement;
	answerKeyCheckbox=document.getElementById('print-answer-key') as HTMLInputElement;
	let generateBtn=document.getElementById('print-generate');
	let closeBtn=document.getElementById('print-close');
	if (closeBtn) closeBtn.addEventListener('click', ()=>modal?.classList.remove('show'));
	if (generateBtn) generateBtn.addEventListener('click', generateWorksheet);
	scopeSelect?.addEventListener('change', updateTopicDropdown);
	updateTopicDropdown();
}