/**
 * Radical equations: one radical or two radicals.
 * @fileoverview Generates radical equation questions. Sets window.correctAnswer with correct value and display.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateRadicalEquation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["one_radical","two_radicals"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "one_radical":{
			let sol=b*b-a;
			questionArea.innerHTML=`Solve: \\( \\sqrt{x + ${a}}=${b} \\)`;
			window.correctAnswer={
				correct: sol.toString(),
				alternate: sol.toString(),
				display: sol.toString()
			};
			hint="Enter a number";
			break;
		}
		case "two_radicals":{
			let sol=(b*b-a)/(2*b);
			sol=sol*sol;
			questionArea.innerHTML=`Solve: \\( \\sqrt{x + ${a}} - \\sqrt{x}=${b} \\) (Enter solution)`;
			window.correctAnswer={
				correct: sol.toFixed(2),
				alternate: sol.toString(),
				display: sol.toFixed(2)
			};
			hint="Enter a decimal";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}