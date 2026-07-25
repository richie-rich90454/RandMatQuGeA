import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Linear equation special: identity or contradiction.
 * @fileoverview Generates special linear equation questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateLinearEquationSpecial(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	const types=["identity","contradiction"];
	const type=types[Math.floor(rng()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	if(type==="identity"){
		const a=Math.floor(rng()*max)+1;
		const b=Math.floor(rng()*max)+1;
		const c=a;
		const d=b;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		mathExpression=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		correct="identity";
		alternate="identity";
		display="identity";
		choices=["identity","contradiction","conditional","x=0"];
		expectedFormat="Enter 'identity', 'contradiction', or the solution";
	}
	else{
		const a=Math.floor(rng()*max)+1;
		const b=Math.floor(rng()*max)+1;
		const c=a;
		const d=b+1;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		mathExpression=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		correct="contradiction";
		alternate="contradiction";
		display="contradiction";
		choices=["contradiction","identity","conditional","no solution"];
		expectedFormat="Enter 'identity', 'contradiction', or the solution";
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex: mathExpression,
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices,
		expectedFormat: expectedFormat
	};
}
