/**
 * Linear equation special: identity or contradiction.
 * @fileoverview Generates special linear equation questions with MCQ distractors.
 * @date 2026-03-29
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
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	if (type==="identity"){
		const a=Math.floor(Math.random()*max)+1;
		const b=Math.floor(Math.random()*max)+1;
		const c=a;
		const d=b;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		questionArea.innerHTML=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		correct="identity";
		alternate="identity";
		display="identity";
		choices=["identity","contradiction","conditional","x=0"];
		hint="Enter 'identity', 'contradiction', or the solution";
	}
	else{
		const a=Math.floor(Math.random()*max)+1;
		const b=Math.floor(Math.random()*max)+1;
		const c=a;
		const d=b+1;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		questionArea.innerHTML=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		correct="contradiction";
		alternate="contradiction";
		display="contradiction";
		choices=["contradiction","identity","conditional","no solution"];
		hint="Enter 'identity', 'contradiction', or the solution";
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correct)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}