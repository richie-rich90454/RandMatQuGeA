/**
 * Generates an expression evaluation question (linear, quadratic, or with substitution of two variables).
 * @fileoverview Expression evaluation: linear, quadratic, two-variable substitution. Sets window.correctAnswer with numeric result.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateExpressionEvaluation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["linear","quadratic","with_substitution"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let x=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "linear":{
			questionArea.innerHTML=`Evaluate \\( ${a}x + ${b} \\) when \\( x=${x} \\).`;
			let result=a*x+b;
			let ans=result.toString();
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number";
			break;
		}
		case "quadratic":{
			questionArea.innerHTML=`Evaluate \\( ${a}x^2 + ${b}x + 1 \\) when \\( x=${x} \\).`;
			let result=a*x*x + b*x + 1;
			let ans=result.toString();
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number";
			break;
		}
		case "with_substitution":{
			let y=Math.floor(Math.random()*maxVal)+1;
			questionArea.innerHTML=`Evaluate \\( ${a}x + ${b}y \\) when \\( x=${x} \\) and \\( y=${y} \\).`;
			let result=a*x + b*y;
			let ans=result.toString();
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