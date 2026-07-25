import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
/**
 * Exponent rules: product, quotient, power, negative, zero.
 * @fileoverview Generates questions on exponent rules with MCQ distractors. Sets window.correctAnswer with correct expression and display.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateExponentRules(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["product","quotient","power","negative","zero"];
	let type=types[Math.floor(rng()*types.length)];
	let maxBase=getMaxForDifficulty(difficulty,4);
	let base=Math.floor(rng()*maxBase)+2;
	let m=Math.floor(rng()*3)+1;
	let n=Math.floor(rng()*3)+1;
	let expectedFormat="Enter an expression like 2^3 or 1/2^3";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	switch(type){
		case "product":{
			correct=base+"^"+(m+n);
			alternate=correct;
			display=correct;
			expectedFormat="Enter as a^b";
			mathExpression="Simplify: \\( " + base + "^{" + m + "} \\times " + base + "^{" + n + "} \\)";
			choices=[correct];
			choices.push(`${base}^${m}`);
			choices.push(`${base}^${n}`);
			choices.push(`${base}^${m*n}`);
			choices.push(`${base}^${m+n+1}`);
			break;
		}
		case "quotient":{
			correct=base+"^"+m;
			alternate=correct;
			display=correct;
			mathExpression="Simplify: \\( \\frac{" + base + "^{" + (m+n) + "}}{" + base + "^{" + n + "}} \\)";
			choices=[correct];
			choices.push(`${base}^${m+n}`);
			choices.push(`${base}^${m-1}`);
			choices.push(`${base}^${m+1}`);
			choices.push(`1`);
			break;
		}
		case "power":{
			correct=base+"^"+(m*n);
			alternate=correct;
			display=correct;
			mathExpression="Simplify: \\( (" + base + "^{" + m + "})^{" + n + "} \\)";
			choices=[correct];
			choices.push(`${base}^${m+n}`);
			choices.push(`${base}^${m}`);
			choices.push(`${base}^${n}`);
			choices.push(`${base}^${m*n+1}`);
			break;
		}
		case "negative":{
			correct=`\\frac{1}{${base}^{${m}}}`;
			alternate=`1/${base}^${m}`;
			display=correct;
			expectedFormat="Enter as 1/a^b";
			mathExpression="Write with a positive exponent: \\( " + base + "^{-" + m + "} \\)";
			choices=[correct];
			choices.push(`${base}^${-m}`);
			choices.push(`${base}^${m}`);
			choices.push(`\\frac{1}{${base}^{${m-1}}}`);
			choices.push(`\\frac{1}{${base}}`);
			break;
		}
		case "zero":{
			correct="1";
			alternate="1";
			display="1";
			expectedFormat="Enter 1";
			mathExpression="Evaluate: \\( " + base + "^{0} \\)";
			choices=["1","0","-1","undefined"];
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let latex=mathExpression;
	return {
		latex,
		correct,
		alternate,
		display,
		choices: uniqueChoices,
		expectedFormat
	};
}
