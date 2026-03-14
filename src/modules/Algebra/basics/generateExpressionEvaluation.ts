import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates an expression evaluation question (linear, quadratic, or with substitution of two variables).
 * @param difficulty - Optional difficulty level to adjust the range of numbers.
 * @returns void
 */
export function generateExpressionEvaluation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["linear", "quadratic", "with_substitution"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty, 10);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let x=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "linear":{
			questionArea.innerHTML=`Evaluate \\( ${a}x + ${b} \\) when \\( x=${x} \\).`;
			let result=a*x+b;
			window.correctAnswer={
				correct: result.toString(),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "quadratic":{
			questionArea.innerHTML=`Evaluate \\( ${a}x^2 + ${b}x + 1 \\) when \\( x=${x} \\).`;
			let result=a*x*x + b*x + 1;
			window.correctAnswer={
				correct: result.toString(),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "with_substitution":{
			let expr=`${a}x + ${b}y`;
			let y=Math.floor(Math.random()*maxVal)+1;
			questionArea.innerHTML=`Evaluate \\( ${expr} \\) when \\( x=${x} \\) and \\( y=${y} \\).`;
			let result=a*x + b*y;
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