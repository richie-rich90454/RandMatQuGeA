import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
/**
 * Rational graph analysis: domain, asymptotes, holes.
 * @fileoverview Generates rational graph analysis questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateRationalGraphAnalysis(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	const types=["domain","asymptotes","holes"];
	const type=types[Math.floor(rng()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	const a=Math.floor(rng()*max)+1;
	const b=Math.floor(rng()*max)+1;
	const c=Math.floor(rng()*max)+1;
	switch(type){
		case "domain":{
			const expr=`\\frac{x+${a}}{x-${b}}`;
			mathExpression=`Find the domain of \\( ${expr} \\). (Enter interval)`;
			const ans=`(-∞, ${b}) ∪ (${b}, ∞)`;
			correct=ans;
			alternate=`(-infinity,${b}) U (${b},infinity)`;
			display=ans;
			choices=[ans];
			choices.push(`(-∞, ${b}] ∪ [${b}, ∞)`);
			choices.push(`(-∞, ${b})`);
			choices.push(`(${b}, ∞)`);
			choices.push(`all real numbers`);
			expectedFormat="Enter intervals";
			break;
		}
		case "asymptotes":{
			const expr=`\\frac{${a}x+${b}}{x-${c}}`;
			mathExpression=`Find the vertical and horizontal asymptotes of \\( ${expr} \\).`;
			const va=`x=${c}`;
			const ha=`y=${a}`;
			const ans=`VA: ${va}, HA: ${ha}`;
			correct=ans;
			alternate=ans;
			display=ans;
			choices=[ans];
			choices.push(`VA: x=${c+1}, HA: y=${a}`);
			choices.push(`VA: x=${c}, HA: y=${a+1}`);
			choices.push(`VA: x=${c-1}, HA: y=${a}`);
			choices.push(`VA: x=${c}, HA: y=${a-1}`);
			expectedFormat="Enter as 'VA: x=..., HA: y=...'";
			break;
		}
		case "holes":{
			const holeX=a;
			const expr=`\\frac{(x-${holeX})(x+${b})}{x-${holeX}}`;
			mathExpression=`Does the graph of \\( ${expr} \\) have a hole? If so, at what x-value?`;
			const ans=`x = ${holeX}`;
			correct=ans;
			alternate=`${holeX}`;
			display=ans;
			choices=[ans];
			choices.push(`x = ${holeX+1}`);
			choices.push(`x = ${holeX-1}`);
			choices.push(`none`);
			choices.push(`x = 0`);
			expectedFormat="Enter x = value or 'none'";
			break;
		}
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
