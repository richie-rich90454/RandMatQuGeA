import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Rational exponents: convert to radical, convert to exponent, evaluate.
 * @fileoverview Generates rational exponent questions with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-04-18
 */
export function generateRationalExponents(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["convert_to_radical","convert_to_exponent","evaluate"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let a=Math.floor(Math.random()*maxVal)+2;
	let m=Math.floor(Math.random()*2)+2;
	let n=Math.floor(Math.random()*2)+2;
	let mathExpression="";
	let correct="";
	let alternate="";
	let display="";
	let expectedFormat="";
	let choices: string[]=[];
	switch(type){
		case "convert_to_radical":{
			mathExpression=`\\( x^{${m}/${n}} \\) in radical form.`;
			correct=`\\sqrt[${n}]{x^{${m}}}`;
			alternate=`x^(${m}/${n})`;
			display=correct;
			expectedFormat="Enter as \\sqrt[n]{x^m}";
			choices=[correct];
			choices.push(`\\sqrt[${n+1}]{x^{${m}}}`);
			choices.push(`\\sqrt[${n}]{x^{${m+1}}}`);
			choices.push(`x^{${m+1}/${n}}`);
			choices.push(`\\sqrt[${n}]{x^{${m-1}}}`);
			break;
		}
		case "convert_to_exponent":{
			mathExpression=`\\( \\sqrt[${n}]{x^{${m}}} \\) using a rational exponent.`;
			correct=`x^{${m}/${n}}`;
			alternate=`x^(${m}/${n})`;
			display=correct;
			expectedFormat="Enter as x^(m/n)";
			choices=[correct];
			choices.push(`x^{${m+1}/${n}}`);
			choices.push(`x^{${m}/${n+1}}`);
			choices.push(`x^{${m*n}}`);
			choices.push(`x^{${m+n}}`);
			break;
		}
		case "evaluate":{
			let base=a;
			let exponent=m/n;
			let result=Math.pow(base,exponent).toFixed(2);
			mathExpression=`\\( ${a}^{${m}/${n}} \\)`;
			correct=result;
			alternate=result;
			display=result;
			expectedFormat="Enter a decimal number";
			let correctNum=parseFloat(correct);
			choices=[correct];
			choices.push((correctNum+0.1).toFixed(2));
			choices.push((correctNum-0.1).toFixed(2));
			choices.push((correctNum*1.1).toFixed(2));
			choices.push((correctNum*0.9).toFixed(2));
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