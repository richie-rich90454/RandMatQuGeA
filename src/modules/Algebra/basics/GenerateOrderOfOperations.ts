﻿import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
/**
 * Generates an order‑of‑operations question (basic, with exponents, or with parentheses) with MCQ distractors.
 * @fileoverview Order of operations evaluation. Sets window.correctAnswer with numeric result and plausible wrong answers.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateOrderOfOperations(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["basic","with_exponents","with_parentheses"];
	let type=types[Math.floor(rng()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let expectedFormat="Enter a number";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	let a=Math.floor(rng()*maxVal)+1;
	let b=Math.floor(rng()*maxVal)+1;
	let c=Math.floor(rng()*maxVal)+1;
	switch(type){
		case "basic":{
			let expr=`${a} + ${b} \\times ${c}`;
			let result=a + b*c;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Evaluate: \\( ${expr} \\)`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((a+b*c).toString());
			choices.push(((a+b)*c).toString());
			break;
		}
		case "with_exponents":{
			let expr=`${a} + ${b}^2`;
			let result=a + b*b;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Evaluate: \\( ${expr} \\)`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((a+b).toString());
			choices.push((a+b*b+1).toString());
			break;
		}
		case "with_parentheses":{
			let expr=`(${a} + ${b}) \\times ${c}`;
			let result=(a+b)*c;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Evaluate: \\( ${expr} \\)`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((a+b*c).toString());
			choices.push((a+b).toString());
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
