import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Exponent rules: product, quotient, power, negative, zero.
 * @fileoverview Generates questions on exponent rules with MCQ distractors. Sets window.correctAnswer with correct expression and display.
 * @date 2026-04-18
 */
export function generateExponentRules(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["product","quotient","power","negative","zero"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxBase=getMaxForDifficulty(difficulty,4);
	let base=Math.floor(Math.random()*maxBase)+2;
	let m=Math.floor(Math.random()*3)+1;
	let n=Math.floor(Math.random()*3)+1;
	let expectedFormat="Enter an expression like 2^3 or 1/2^3";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	switch(type){
		case "product":{
			correct=`${base}^{${m+n}}`;
			alternate=correct;
			display=correct;
			mathExpression=`\\( ${base}^{${m}} \\times ${base}^{${n}} \\)`;
			choices=[correct];
			choices.push(`${base}^${m}`);
			choices.push(`${base}^${n}`);
			choices.push(`${base}^${m*n}`);
			choices.push(`${base}^${m+n+1}`);
			break;
		}
		case "quotient":{
			correct=`${base}^{${m}}`;
			alternate=correct;
			display=correct;
			mathExpression=`\\( \\frac{${base}^{${m+n}}}{${base}^{${n}}} \\)`;
			choices=[correct];
			choices.push(`${base}^${m+n}`);
			choices.push(`${base}^${m-1}`);
			choices.push(`${base}^${m+1}`);
			choices.push(`1`);
			break;
		}
		case "power":{
			correct=`${base}^{${m*n}}`;
			alternate=correct;
			display=correct;
			mathExpression=`\\( (${base}^{${m}})^{${n}} \\)`;
			choices=[correct];
			choices.push(`${base}^${m+n}`);
			choices.push(`${base}^${m}`);
			choices.push(`${base}^${n}`);
			choices.push(`${base}^${m*n+1}`);
			break;
		}
		case "negative":{
			correct=`\\frac{1}{${base}^{${m}}}`;
			alternate=`1/${base}^${m}`;
			display=correct;
			mathExpression=`\\( ${base}^{-${m}} \\)`;
			choices=[correct];
			choices.push(`${base}^${-m}`);
			choices.push(`${base}^${m}`);
			choices.push(`\\frac{1}{${base}^{${m-1}}}`);
			choices.push(`\\frac{1}{${base}}`);
			break;
		}
		case "zero":{
			correct="1";
			alternate="1";
			display="1";
			mathExpression=`\\( ${base}^{0} \\)`;
			choices=["1","0","-1","undefined"];
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