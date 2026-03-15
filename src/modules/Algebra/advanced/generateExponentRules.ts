/**
 * Exponent rules: product, quotient, power, negative, zero.
 * @fileoverview Generates questions on exponent rules. Sets window.correctAnswer with correct expression and display.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateExponentRules(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["product","quotient","power","negative","zero"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxBase=getMaxForDifficulty(difficulty,4);
	let base=Math.floor(Math.random()*maxBase)+2;
	let m=Math.floor(Math.random()*3)+1;
	let n=Math.floor(Math.random()*3)+1;
	let hint="";
	switch (type){
		case "product":{
			questionArea.innerHTML=`Simplify: \\( ${base}^{${m}} \\times ${base}^{${n}} \\)`;
			let ans=`${base}^${m+n}`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter as a^b";
			break;
		}
		case "quotient":{
			questionArea.innerHTML=`Simplify: \\( \\frac{${base}^{${m+n}}}{${base}^{${n}}} \\)`;
			let ans=`${base}^${m}`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter as a^b";
			break;
		}
		case "power":{
			questionArea.innerHTML=`Simplify: \\( (${base}^{${m}})^{${n}} \\)`;
			let ans=`${base}^${m*n}`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter as a^b";
			break;
		}
		case "negative":{
			questionArea.innerHTML=`Write with a positive exponent: \\( ${base}^{-${m}} \\)`;
			let ans=`\\frac{1}{${base}^{${m}}}`;
			window.correctAnswer={
				correct: ans,
				alternate: `1/${base}^${m}`,
				display: ans
			};
			hint="Enter as 1/a^b";
			break;
		}
		case "zero":{
			questionArea.innerHTML=`Evaluate: \\( ${base}^{0} \\)`;
			window.correctAnswer={
				correct: "1",
				alternate: "1",
				display: "1"
			};
			hint="Enter 1";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}