/**
 * Generates an order‑of‑operations question (basic, with exponents, or with parentheses).
 * @fileoverview Order of operations evaluation. Sets window.correctAnswer with numeric result.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateOrderOfOperations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic","with_exponents","with_parentheses"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "basic":{
			let expr=`${a} + ${b} \\times ${c}`;
			let result=a + b*c;
			let ans=result.toString();
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number";
			break;
		}
		case "with_exponents":{
			let expr=`${a} + ${b}^2`;
			let result=a + b*b;
			let ans=result.toString();
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number";
			break;
		}
		case "with_parentheses":{
			let expr=`(${a} + ${b}) \\times ${c}`;
			let result=(a+b)*c;
			let ans=result.toString();
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}