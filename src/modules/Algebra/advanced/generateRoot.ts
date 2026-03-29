/**
 * Roots: simplify nth roots.
 * @fileoverview Generates root simplification questions with MCQ distractors. Sets window.correctAnswer with correct value and display.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
export function generateRoot(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let maxRoot=getMaxForDifficulty(difficulty,4);
	let maxBase=getMaxForDifficulty(difficulty,10);
	let root=Math.floor((Math.random()*maxRoot))+2;
	let base=Math.floor((Math.random()*maxBase))+1;
	let radicand=Math.pow(base,root);
	let rootExpression="";
	if (root===2){
		rootExpression=`\\[ \\sqrt{${radicand}}=? \\]`;
	}
	else{
		rootExpression=`\\[ \\sqrt[${root}]{${radicand}}=? \\]`;
	}
	let correctRoot=base.toString();
	let choices=[correctRoot];
	choices.push((base+1).toString());
	choices.push((base-1).toString());
	choices.push((base*2).toString());
	choices.push((Math.pow(radicand,1/root+0.1)).toFixed(2));
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=rootExpression;
	questionArea.appendChild(mathContainer);
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correctRoot)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctRoot;
		else uniqueChoices=[correctRoot];
	}
	window.correctAnswer={
		correct: correctRoot,
		alternate: correctRoot,
		display: correctRoot,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a whole number";
}