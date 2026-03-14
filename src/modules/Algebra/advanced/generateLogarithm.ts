import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateLogarithm(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic", "change_base", "equation", "properties", "exponential_form"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxBase=getMaxForDifficulty(difficulty, 4);
	let base=Math.floor(Math.random()*maxBase)+2;
	let arg=Math.pow(base, Math.floor(Math.random()*4)+1);
	let newBase=Math.floor(Math.random()*3)+2;
	let hint="";
	switch (type){
		case "basic":{
			let answer=(Math.log(arg)/Math.log(base)).toFixed(2);
			questionArea.innerHTML=`Evaluate: \\( \\log_{${base}} ${arg} \\)`;
			window.correctAnswer={
				correct: answer,
				alternate: answer
			};
			hint="Enter a decimal number, e.g., 2.5";
			break;
		}
		case "change_base":{
			let numerator=Math.log(arg)/Math.log(newBase);
			let denominator=Math.log(base)/Math.log(newBase);
			let numericAnswer=(numerator/denominator).toFixed(2);
			let expr=`log_${newBase}(${arg})/log_${newBase}(${base})`;
			questionArea.innerHTML=`Express \\( \\log_{${base}} ${arg} \\) in base \\( ${newBase} \\)`;
			window.correctAnswer={
				correct: numericAnswer,
				alternate: expr
			};
			hint="Enter as fraction (e.g., log3(8)/log3(2)) or decimal";
			break;
		}
		case "equation":{
			let exponent=Math.floor(Math.random()*3)+2;
			questionArea.innerHTML=`Solve for \\( x \\): \\( ${base}^{x}=${Math.pow(base, exponent)} \\)`;
			window.correctAnswer={
				correct: exponent.toString(),
				alternate: exponent.toString()
			};
			hint="Enter a whole number";
			break;
		}
		case "properties":{
			let a=Math.floor(Math.random()*8)+2;
			let b=Math.floor(Math.random()*8)+2;
			let logSum=(Math.log(a*b)/Math.log(base)).toFixed(2);
			questionArea.innerHTML=`Evaluate: \\( \\log_{${base}} (${a} \\times ${b}) \\)`;
			window.correctAnswer={
				correct: logSum,
				alternate: `\\log_{${base}} ${a}+\\log_{${base}} ${b}=${(Math.log(a)/Math.log(base)).toFixed(2)}+${(Math.log(b)/Math.log(base)).toFixed(2)}=${logSum}`
			};
			break;
		}
		case "exponential_form":{
			let exponent=Math.floor(Math.random()*3)+2;
			let result=Math.pow(base, exponent);
			questionArea.innerHTML=`If \\( \\log_{${base}} x=${exponent} \\), find \\( x \\)`;
			window.correctAnswer={
				correct: result.toString(),
				alternate: `${base}^${exponent}`
			};
			hint="Enter a number or expression (e.g., 8 or 2^3)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}