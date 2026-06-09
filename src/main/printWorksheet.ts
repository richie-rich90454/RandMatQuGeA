/**
 * @file printWorksheet.ts - Handles printable worksheet generation
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
function escapeHtml(text: string): string{
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function wrapLatexIfNeeded(text: string): string{
    if (!text) return "";
    if (text.match(/\\\(.*\\\)/)||text.match(/\$\$.*\$\$/)||text.match(/\$.*\$/)) return text;
    if (/\\[a-zA-Z]+|[_^]|[{}]|\\[(){}\[\]]/.test(text)){
        return `\\(${text}\\)`;
    }
    return text;
}
function escapeLatexForJs(latex: string): string{
    return latex.replace(/\\/g, "\\\\");
}
function captureRawLatexDuringGeneration(generator: ()=>void): string{
    let originalMathJaxTypesetPromise=(window as any).MathJax?.typesetPromise;
    let originalMathJaxTypeset=(window as any).MathJax?.typeset;
    let originalKatexRender=(window as any).katex?.render;
    let originalKatexRenderToString=(window as any).katex?.renderToString;
    let capturedLatex="";
    let captureMathJaxElement=(el: HTMLElement)=>{
        if (!capturedLatex){
            capturedLatex=el.innerHTML;
        }
    };
    let captureKatex=(latex: string, element: HTMLElement)=>{
        if (!capturedLatex){
            capturedLatex=latex;
        }
        if (originalKatexRender){
            originalKatexRender(latex, element);
        }
        else{
            element.innerHTML=latex;
        }
    };
    if ((window as any).MathJax){
        if (originalMathJaxTypesetPromise){
            (window as any).MathJax.typesetPromise=async (elements?: any[])=>{
                if (elements && elements.length){
                    for (let el of elements){
                        if (el instanceof HTMLElement){
                            captureMathJaxElement(el);
                            break;
                        }
                    }
                }
                return originalMathJaxTypesetPromise.call((window as any).MathJax, elements);
            };
        }
        if (originalMathJaxTypeset){
            (window as any).MathJax.typeset=(elements?: any[])=>{
                if (elements && elements.length){
                    for (let el of elements){
                        if (el instanceof HTMLElement){
                            captureMathJaxElement(el);
                            break;
                        }
                    }
                }
                return originalMathJaxTypeset.call((window as any).MathJax, elements);
            };
        }
    }
    if ((window as any).katex){
        (window as any).katex.render=captureKatex;
        if (originalKatexRenderToString){
            (window as any).katex.renderToString=(latex: string)=>{
                if (!capturedLatex){
                    capturedLatex=latex;
                }
                return originalKatexRenderToString(latex);
            };
        }
    }
    try{
        dom.questionArea!.innerHTML="";
        generator();
    }
    finally{
        if (originalMathJaxTypesetPromise) (window as any).MathJax.typesetPromise=originalMathJaxTypesetPromise;
        if (originalMathJaxTypeset) (window as any).MathJax.typeset=originalMathJaxTypeset;
        if (originalKatexRender) (window as any).katex.render=originalKatexRender;
        if (originalKatexRenderToString) (window as any).katex.renderToString=originalKatexRenderToString;
    }
    if (!capturedLatex && dom.questionArea){
        let temp=document.createElement("div");
        temp.innerHTML=dom.questionArea.innerHTML;
        temp.querySelectorAll("canvas, script, style, [data-threejs]").forEach(el=>el.remove());
        capturedLatex=temp.innerHTML;
    }
    let cleanDiv=document.createElement("div");
    cleanDiv.innerHTML=capturedLatex;
    cleanDiv.querySelectorAll("canvas, script, style, [data-threejs]").forEach(el=>el.remove());
    return cleanDiv.innerHTML;
}
async function generateQuestionText(topicId: string, difficulty: string): Promise<{ html: string; answerDisplay: string }>{
    if (!dom.questionArea){
        return { html: "\\text{Error: Question area not found}", answerDisplay: "" };
    }
    let originalHtml=dom.questionArea.innerHTML;
    let originalCorrectAnswer=(window as any).correctAnswer;
    try{
        let latexSource=captureRawLatexDuringGeneration(()=>callGenerator(topicId, difficulty));
        let ansObj=(window as any).correctAnswer;
        let answerDisplay=wrapLatexIfNeeded(ansObj?.display||ansObj?.correct||"");
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
    let questionsHtml="";
    for (let q of questions){
        questionsHtml+=`
            <li class="question-item">
                <div class="question-text">${escapeLatexForJs(q.html)}</div>
                <div class="answer-space"></div>
            </li>`;
    }
    let answersHtml="";
    if (includeAnswers){
        answersHtml=`<div class="answer-key"><h2>Answer Key</h2><ol id="answer-key" class="no-mathjax">`;
        for (let q of questions){
            answersHtml+=`<li>${escapeLatexForJs(q.answerDisplay)}</li>`;
        }
        answersHtml+=`</ol></div>`;
    }
    const topicDisplay=topic==="all"
        ? `Scope: ${scope}`
        : (topics.find(t=>t.id===topic)?.name||topic);
    const topicDisplaySafe=escapeHtml(topicDisplay);
    const difficultySafe=escapeHtml(difficulty);
    let fullHtml=`<!DOCTYPE html>
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
            options: { ignoreHtmlClass: "no-mathjax", processHtmlClass: "mathjax-process" }
        };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" defer></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
        onload="renderMathInElement(document.getElementById('answer-key'), { delimiters: [{left: '\\\\\\\\(', right: '\\\\\\\\)', display: false}] });"></script>
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
        <p>Topic: ${topicDisplaySafe}</p>
        <p>Difficulty: ${difficultySafe}</p>
        <hr>
        <ol class="questions-list mathjax-process">
            ${questionsHtml}
        </ol>
        ${answersHtml}
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
        printWindow.document.write(fullHtml);
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
    let printBtn=document.getElementById("print-button");
    let generateBtn=document.getElementById("print-generate");
    let closeBtn=document.getElementById("print-close");
    if (printBtn) printBtn.addEventListener("click", ()=>window.print());
    if (closeBtn) closeBtn.addEventListener("click", ()=>modal?.classList.remove("show"));
    if (generateBtn) generateBtn.addEventListener("click", generateWorksheet);
    scopeSelect?.addEventListener("change", updateTopicDropdown);
    updateTopicDropdown();
}