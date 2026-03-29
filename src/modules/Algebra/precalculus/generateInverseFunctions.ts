/**
 * Inverse functions: find, verify, one-to-one.
 * @fileoverview Generates inverse function questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateInverseFunctions(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["find","verify","onetoone"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	switch (type){
		case "find":{
			const fExpr=`${a}x + ${b}`;
			questionArea.innerHTML=`Find the inverse of \\( f(x)=${fExpr} \\).`;
			const inv=`f^{-1}(x) = \\frac{x - ${b}}{${a}}`;
			const plain=`(x-${b})/${a}`;
			correct=inv;
			alternate=plain;
			display=inv;
			choices=[inv];
			choices.push(`f^{-1}(x) = \\frac{x + ${b}}{${a}}`);
			choices.push(`f^{-1}(x) = \\frac{x - ${b}}{${a+1}}`);
			choices.push(`f^{-1}(x) = \\frac{x - ${b-1}}{${a}}`);
			choices.push(`f^{-1}(x) = ${a}x - ${b}`);
			hint="Enter as (x-b)/a";
			break;
		}
		case "verify":{
			const fExpr=`${a}x + ${b}`;
			const invExpr=`\\frac{x - ${b}}{${a}}`;
			questionArea.innerHTML=`Verify that \\( f(x)=${fExpr} \\) and \\( g(x)=${invExpr} \\) are inverses. (Enter true/false)`;
			correct="true";
			alternate="true";
			display="true";
			choices=["true","false","maybe","only if a=1"];
			hint="Enter 'true' or 'false'";
			break;
		}
		case "onetoone":{
			questionArea.innerHTML=`Is \\( f(x)=x^2 \\) one-to-one on its natural domain? (yes/no)`;
			correct="no";
			alternate="no";
			display="no";
			choices=["no","yes","only on [0,∞)","only on (-∞,0]"];
			hint="Enter 'yes' or 'no'";
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