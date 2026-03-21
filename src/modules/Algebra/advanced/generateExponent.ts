/**
 * Exponential expressions: evaluate, solve, apply laws, growth factor, compare.
 * @fileoverview Generates exponent questions. Sets window.correctAnswer with correct result and display.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateExponent(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic","solve","laws","growth","compare"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxBase=getMaxForDifficulty(difficulty,4);
	let base=Math.floor(Math.random()*maxBase)+2;
	let exponent=Math.floor(Math.random()*5)+2;
	let hint="";
	switch (type){
		case "basic":{
			questionArea.innerHTML=`Evaluate: \\( ${base}^{${exponent}} \\)`;
			let val=Math.pow(base,exponent).toString();
			window.correctAnswer={
				correct: val,
				alternate: val,
				display: val
			};
			hint="Enter a number";
			break;
		}
		case "solve":{
			let power=Math.pow(base,exponent);
			questionArea.innerHTML=`Solve for \\( x \\): \\( ${base}^{x}=${power} \\)`;
			window.correctAnswer={
				correct: exponent.toString(),
				alternate: exponent.toString(),
				display: exponent.toString()
			};
			hint="Enter a whole number";
			break;
		}
		case "laws":{
			let a=Math.floor(Math.random()*3)+2;
			let b=Math.floor(Math.random()*3)+2;
			questionArea.innerHTML=`Simplify: \\( (${base}^{${a}}) \\times (${base}^{${b}}) \\)`;
			let ans=Math.pow(base,a+b).toString();
			let alt=`${base}^${a+b}`;
			window.correctAnswer={
				correct: ans,
				alternate: alt,
				display: ans
			};
			hint="Enter a number (e.g., 32) or an expression (e.g., 2^5)";
			break;
		}
		case "growth":{
			let rate=(Math.random()*20+5).toFixed(1);
			questionArea.innerHTML=`A population grows at \\( ${rate}\\% \\) annually. What is the growth factor?`;
			let factor=(1+parseFloat(rate)/100).toFixed(3);
			window.correctAnswer={
				correct: factor,
				alternate: factor,
				display: factor
			};
			hint="Enter a decimal (e.g., 1.05)";
			break;
		}
		case "compare":{
			let b1=Math.floor(Math.random()*3)+2;
			let b2=Math.floor(Math.random()*3)+2;
			let e1=Math.floor(Math.random()*4)+2;
			let e2=Math.floor(Math.random()*4)+2;
			questionArea.innerHTML=`Which is larger: \\( ${b1}^{${e1}} \\) or \\( ${b2}^{${e2}} \\)?`;
			let vals=[Math.pow(b1,e1),Math.pow(b2,e2)];
			let larger=Math.max(...vals).toString();
			let largerExpr=vals[0]>vals[1]?`${b1}^${e1}`:`${b2}^${e2}`;
			window.correctAnswer={
				correct: larger,
				alternate: largerExpr,
				display: larger
			};
			hint="Enter the larger value (e.g., 32) or the expression (e.g., 2^5)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}