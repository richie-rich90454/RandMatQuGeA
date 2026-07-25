import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
/**
 * Inverse functions: find, verify, one-to-one.
 * @fileoverview Generates inverse function questions with MCQ distractors.
 * @date 2026-03-29
 */
export function generateInverseFunctions(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	const types=["find","verify","onetoone"];
	const type=types[Math.floor(rng()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	const a=Math.floor(rng()*max)+1;
	const b=Math.floor(rng()*max)+1;
	switch(type){
		case "find":{
			const fExpr=`${a}x + ${b}`;
			mathExpression=`Find the inverse of \\( f(x)=${fExpr} \\).`;
			const inv=`f^{-1}(x) = \\frac{x - ${b}}{${a}}`;
			const plain=`(x-${b})/${a}`;
			correct=inv;
			alternate=plain;
			display=inv;
			choices=[inv];
			choices.push(`f^{-1}(x) = \\frac{x + ${b}}{${a}}`);
			choices.push(`f^{-1}(x) = \\frac{x - ${b}}{${a+1}}`);
			choices.push(`f^{-1}(x) = \\frac{x - ${b-1}}{${a}}`);
			choices.push(`f^{-1}(x) = ${a}x - ${b}`);
			hint="Enter as (x-b)/a";
			break;
		}
		case "verify":{
			const fExpr=`${a}x + ${b}`;
			const invExpr=`\\frac{x - ${b}}{${a}}`;
			mathExpression=`Verify that \\( f(x)=${fExpr} \\) and \\( g(x)=${invExpr} \\) are inverses. (Enter true/false)`;
			correct="true";
			alternate="true";
			display="true";
			choices=["true","false","maybe","only if a=1"];
			hint="Enter 'true' or 'false'";
			break;
		}
		case "onetoone":{
			mathExpression=`Is \\( f(x)=x^2 \\) one-to-one on its natural domain? (yes/no)`;
			correct="no";
			alternate="no";
			display="no";
			choices=["no","yes","only on [0,∞)","only on (-∞,0]"];
			hint="Enter 'yes' or 'no'";
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
		expectedFormat: hint
	};
}
