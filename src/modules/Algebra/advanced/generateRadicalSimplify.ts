/**
 * Radical simplification: simplify, add, subtract, multiply, divide, rationalize.
 * @fileoverview Generates radical simplification questions. Sets window.correctAnswer with LaTeX expression and display.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateRadicalSimplify(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["simplify","add","subtract","multiply","divide","rationalize"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,20);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "simplify":{
			let radicand=a*a*b;
			questionArea.innerHTML=`Simplify: \\( \\sqrt{${radicand}} \\)`;
			let ans=`${a}\\sqrt{${b}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `${a}√${b}`,
				display: ans
			};
			hint="Enter as a√b";
			break;
		}
		case "add":{
			questionArea.innerHTML=`Simplify: \\( ${a}\\sqrt{${b}} + ${c}\\sqrt{${b}} \\)`;
			let coeff=a+c;
			let ans=`${coeff}\\sqrt{${b}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `${coeff}√${b}`,
				display: ans
			};
			hint="Enter as a√b";
			break;
		}
		case "subtract":{
			questionArea.innerHTML=`Simplify: \\( ${a}\\sqrt{${b}} - ${c}\\sqrt{${b}} \\)`;
			let coeff=a-c;
			let ans=`${coeff}\\sqrt{${b}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `${coeff}√${b}`,
				display: ans
			};
			hint="Enter as a√b";
			break;
		}
		case "multiply":{
			questionArea.innerHTML=`Multiply: \\( \\sqrt{${a}} \\times \\sqrt{${b}} \\)`;
			let product=a*b;
			let ans=`\\sqrt{${product}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `√${product}`,
				display: ans
			};
			hint="Enter as √n";
			break;
		}
		case "divide":{
			questionArea.innerHTML=`Divide: \\( \\frac{\\sqrt{${a}}}{\\sqrt{${b}}} \\)`;
			let quotient=a/b;
			let ans=`\\sqrt{${quotient}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `√${quotient}`,
				display: ans
			};
			hint="Enter as √n";
			break;
		}
		case "rationalize":{
			questionArea.innerHTML=`Rationalize: \\( \\frac{1}{\\sqrt{${a}}} \\)`;
			let ans=`\\frac{\\sqrt{${a}}}{${a}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `√${a}/${a}`,
				display: ans
			};
			hint="Enter as √a/a";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}