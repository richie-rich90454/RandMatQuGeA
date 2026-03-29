/**
 * Logistic functions: identify, carrying capacity, evaluation.
 * @fileoverview Generates logistic function questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateLogisticFunctions(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["identify","limit","value"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	const c=Math.floor(Math.random()*max)+5;
	const a=Math.floor(Math.random()*5)+1;
	const kRaw=(Math.random()*0.5+0.2);
	const k=kRaw.toFixed(2);
	const kNum=parseFloat(k);
	const x=Math.floor(Math.random()*5)+1;
	switch (type){
		case "identify":{
			const exprStr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			questionArea.innerHTML=`Identify the type of function: \\( ${exprStr} \\) (logistic, exponential, logarithmic, etc.)`;
			correct="logistic";
			alternate="logistic";
			display="logistic";
			choices=["logistic","exponential","logarithmic","linear"];
			hint="Enter function type";
			break;
		}
		case "limit":{
			const exprStr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			questionArea.innerHTML=`What is the carrying capacity (limit as x→∞) of \\( ${exprStr} \\)?`;
			const ans=c.toString();
			correct=ans;
			alternate=ans;
			display=ans;
			choices=[ans];
			choices.push((c+1).toString());
			choices.push((c-1).toString());
			choices.push((c/2).toString());
			choices.push((c*2).toString());
			hint="Enter a number";
			break;
		}
		case "value":{
			const exprStr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			questionArea.innerHTML=`Evaluate \\( ${exprStr} \\) at \\( x=${x} \\).`;
			const val=(c/(1+a*Math.exp(-kNum*x))).toFixed(2);
			correct=val;
			alternate=val;
			display=val;
			const numVal=parseFloat(val);
			choices=[val];
			choices.push((numVal+0.1).toFixed(2));
			choices.push((numVal-0.1).toFixed(2));
			const wrongVal1=(c/(1+a*Math.exp(-kNum*(x+1)))).toFixed(2);
			const wrongVal2=(c/(1+a*Math.exp(-kNum*(x-1)))).toFixed(2);
			choices.push(wrongVal1);
			choices.push(wrongVal2);
			hint="Enter decimal";
			break;
		}
		default:
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correct)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}