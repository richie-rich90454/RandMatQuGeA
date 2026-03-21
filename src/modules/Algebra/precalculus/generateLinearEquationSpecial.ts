/**
 * Linear equation special: identity or contradiction.
 * @fileoverview Generates special linear equation questions.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

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
			alternate:"identity",
			display:"identity"
		};
		hint="Enter 'identity', 'contradiction', or the solution";
	}
	else{
		const a=Math.floor(Math.random()*max)+1;
		const b=Math.floor(Math.random()*max)+1;
		const c=a;
		const d=b+1;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		questionArea.innerHTML=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		window.correctAnswer={
			correct:"contradiction",
			alternate:"contradiction",
			display:"contradiction"
		};
		hint="Enter 'identity', 'contradiction', or the solution";
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}