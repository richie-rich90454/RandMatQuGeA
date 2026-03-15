//generateLogisticFunctions
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about logistic functions: identification, carrying capacity, or evaluation.
 * @param difficulty - Optional difficulty level to adjust parameters.
 * @returns void
 */
export function generateLogisticFunctions(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["identify","limit","value"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";

	const c=Math.floor(Math.random()*max)+5;
	const a=Math.floor(Math.random()*5)+1;
	const k=(Math.random()*0.5+0.2).toFixed(2);
	const x=Math.floor(Math.random()*5)+1;

	switch (type){
		case "identify":{
			const expr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			questionArea.innerHTML=`Identify the type of function: \\( ${expr} \\) (logistic, exponential, logarithmic, etc.)`;
			window.correctAnswer={
				correct:"logistic",
				alternate:"logistic",
				display:"logistic"
			};
			hint="Enter function type";
			break;
		}
		case "limit":{
			const expr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			questionArea.innerHTML=`What is the carrying capacity (limit as x→∞) of \\( ${expr} \\)?`;
			const ans=c.toString();
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter a number";
			break;
		}
		case "value":{
			const expr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			const val=(c/(1+a*Math.exp(-k*x))).toFixed(2);
			questionArea.innerHTML=`Evaluate \\( ${expr} \\) at \\( x=${x} \\).`;
			window.correctAnswer={
				correct:val,
				alternate:val,
				display:val
			};
			hint="Enter decimal";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}