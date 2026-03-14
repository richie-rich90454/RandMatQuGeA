import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about function operations: composition, sum, or product.
 * @param difficulty - Optional difficulty level to adjust coefficients.
 * @returns void
 */
export function generateFunctionOperations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["composition","sum","product"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;

	switch (type){
		case "composition":{
			const f=`${a}x + ${b}`;
			const g=`x^2`;
			const xVal=Math.floor(Math.random()*max)+1;
			questionArea.innerHTML=`Given \\( f(x)=${f} \\) and \\( g(x)=${g} \\), find \\( (f \\circ g)(${xVal}) \\).`;
			const result=a*(xVal*xVal)+b;
			window.correctAnswer={
				correct:result.toString(),
				alternate:result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "sum":{
			const f=`${a}x + ${b}`;
			const g=`${c}x^2`;
			questionArea.innerHTML=`Find \\( (f+g)(x) \\) for \\( f(x)=${f} \\) and \\( g(x)=${g} \\).`;
			const sum=`${c}x^2 + ${a}x + ${b}`;
			window.correctAnswer={
				correct:sum,
				alternate:sum.replace(/\s+/g,'')
			};
			hint="Enter as polynomial";
			break;
		}
		case "product":{
			const f=`${a}x + ${b}`;
			const g=`${c}x + 1`;
			questionArea.innerHTML=`Find \\( (f \\cdot g)(x) \\) for \\( f(x)=${f} \\) and \\( g(x)=${g} \\).`;
			const prod=`${a*c}x^2 + ${a*1+b*c}x + ${b*1}`;
			window.correctAnswer={
				correct:prod,
				alternate:prod.replace(/\s+/g,'')
			};
			hint="Enter as polynomial";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}