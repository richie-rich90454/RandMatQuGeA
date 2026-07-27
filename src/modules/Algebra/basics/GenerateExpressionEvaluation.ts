﻿import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
/**
 * Generates an expression evaluation question (linear, quadratic, or with substitution of two variables) with MCQ distractors.
 * @fileoverview Expression evaluation: linear, quadratic, two-variable substitution. Sets window.correctAnswer with numeric result and plausible wrong answers.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateExpressionEvaluation(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["linear","quadratic","with_substitution"];
	let type=types[Math.floor(rng()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let expectedFormat="Enter a number";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	let a=Math.floor(rng()*maxVal)+1;
	let b=Math.floor(rng()*maxVal)+1;
	let x=Math.floor(rng()*maxVal)+1;
	switch(type){
		case "linear":{
			let result=a*x+b;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Evaluate \\( ${a}x + ${b} \\) when \\( x=${x} \\).`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((a*x).toString());
			choices.push((b).toString());
			break;
		}
		case "quadratic":{
			let result=a*x*x + b*x + 1;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Evaluate \\( ${a}x^2 + ${b}x + 1 \\) when \\( x=${x} \\).`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((a*x*x+b*x).toString());
			choices.push((a*x*x).toString());
			break;
		}
		case "with_substitution":{
			let y=Math.floor(rng()*maxVal)+1;
			let result=a*x + b*y;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Evaluate \\( ${a}x + ${b}y \\) when \\( x=${x} \\) and \\( y=${y} \\).`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((a*x).toString());
			choices.push((b*y).toString());
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
