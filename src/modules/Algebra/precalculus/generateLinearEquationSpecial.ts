import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about special linear equations: identities or contradictions.
 * @param difficulty - Optional difficulty level to adjust coefficients.
 * @returns void
 */
export function generateLinearEquationSpecial(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["identity","contradiction"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	if (type==="identity"){
		const a=Math.floor(Math.random()*max)+1;
		const b=Math.floor(Math.random()*max)+1;
		const c=a;
		const d=b;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		questionArea.innerHTML=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		window.correctAnswer={
			correct:"identity",
			alternate:"identity"
		};
		hint="Enter 'identity', 'contradiction', or the solution";
	}else{
		const a=Math.floor(Math.random()*max)+1;
		const b=Math.floor(Math.random()*max)+1;
		const c=a;
		const d=b+1;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		questionArea.innerHTML=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		window.correctAnswer={
			correct:"contradiction",
			alternate:"contradiction"
		};
		hint="Enter 'identity', 'contradiction', or the solution";
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}