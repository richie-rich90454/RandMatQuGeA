import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about graph analysis of rational functions: domain, asymptotes, or holes.
 * @param difficulty - Optional difficulty level to adjust numbers.
 * @returns void
 */
export function generateRationalGraphAnalysis(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["domain","asymptotes","holes"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;

	switch (type){
		case "domain":{
			const expr=`\\frac{x+${a}}{x-${b}}`;
			questionArea.innerHTML=`Find the domain of \\( ${expr} \\). (Enter interval)`;
			window.correctAnswer={
				correct:`(-∞, ${b}) ∪ (${b}, ∞)`,
				alternate:`(-infinity,${b}) U (${b},infinity)`
			};
			hint="Enter intervals";
			break;
		}
		case "asymptotes":{
			const expr=`\\frac{${a}x+${b}}{x-${c}}`;
			questionArea.innerHTML=`Find the vertical and horizontal asymptotes of \\( ${expr} \\).`;
			const va=`x=${c}`;
			const ha=`y=${a}`;
			window.correctAnswer={
				correct:`VA: ${va}, HA: ${ha}`,
				alternate:`VA: ${va}, HA: ${ha}`
			};
			hint="Enter as 'VA: x=..., HA: y=...'";
			break;
		}
		case "holes":{
			const holeX=a;
			const expr=`\\frac{(x-${holeX})(x+${b})}{x-${holeX}}`;
			questionArea.innerHTML=`Does the graph of \\( ${expr} \\) have a hole? If so, at what x-value?`;
			window.correctAnswer={
				correct:`x = ${holeX}`,
				alternate:`${holeX}`
			};
			hint="Enter x = value or 'none'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}