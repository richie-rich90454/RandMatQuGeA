import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates an order‑of‑operations question (basic, with exponents, or with parentheses).
 * @param difficulty - Optional difficulty level to adjust the range of numbers.
 * @returns void
 */
export function generateOrderOfOperations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic", "with_exponents", "with_parentheses"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty, 5);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "basic":{
			let expr=`${a} + ${b} \\times ${c}`;
			let result=a + b*c;
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
			window.correctAnswer={
				correct: result.toString(),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "with_exponents":{
			let expr=`${a} + ${b}^2`;
			let result=a + b*b;
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
			window.correctAnswer={
				correct: result.toString(),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "with_parentheses":{
			let expr=`(${a} + ${b}) \\times ${c}`;
			let result=(a+b)*c;
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
			window.correctAnswer={
				correct: result.toString(),
				alternate: result.toString()
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