import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Function transformations: translation, reflection, stretch.
 * @fileoverview Generates function transformation questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateTransformations(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["translation","reflection","stretch"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	const h=Math.floor(Math.random()*max)+1;
	const k=Math.floor(Math.random()*max)+1;
	const a=Math.floor(Math.random()*2)+1;
	switch(type){
		case "translation":{
			mathExpression=`If the graph of \\( y=x^2 \\) is shifted right by ${h} and up by ${k}, what is the new equation?`;
			const eq=`y = (x - ${h})^2 + ${k}`;
			correct=eq;
			alternate=eq;
			display=eq;
			choices=[eq];
			choices.push(`y = (x + ${h})^2 + ${k}`);
			choices.push(`y = (x - ${h})^2 - ${k}`);
			choices.push(`y = (x - ${h-1})^2 + ${k}`);
			choices.push(`y = (x - ${h})^2 + ${k+1}`);
			expectedFormat="Enter as y = (x-h)^2 + k";
			break;
		}
		case "reflection":{
			const axis=Math.random()<0.5?"x-axis":"y-axis";
			mathExpression=`If the graph of \\( y=\\sqrt{x} \\) is reflected across the ${axis}, what is the new equation?`;
			let eq=axis==="x-axis"?"y = -√x":"y = √(-x)";
			correct=eq;
			alternate=eq;
			display=eq;
			choices=[eq];
			if(axis==="x-axis"){
				choices.push("y = √(-x)");
				choices.push("y = √x");
				choices.push("y = -√(-x)");
				choices.push("y = √x + 1");
			}
			else{
				choices.push("y = -√x");
				choices.push("y = √x");
				choices.push("y = √(x+1)");
				choices.push("y = √(x-1)");
			}
			expectedFormat="Enter equation";
			break;
		}
		case "stretch":{
			mathExpression=`If the graph of \\( y=|x| \\) is stretched vertically by a factor of ${a}, what is the new equation?`;
			const eq=`y = ${a}|x|`;
			correct=eq;
			alternate=eq;
			display=eq;
			choices=[eq];
			choices.push(`y = |${a}x|`);
			choices.push(`y = ${a+1}|x|`);
			choices.push(`y = ${a-1}|x|`);
			choices.push(`y = |x| + ${a}`);
			expectedFormat="Enter equation";
			break;
		}
		default:
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=expectedFormat;
}