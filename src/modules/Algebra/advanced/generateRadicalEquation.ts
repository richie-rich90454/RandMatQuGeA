import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Radical equations: one radical or two radicals.
 * @fileoverview Generates radical equation questions with MCQ distractors. Sets window.correctAnswer with correct value and display.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateRadicalEquation(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["one_radical","two_radicals"];
	let type=types[Math.floor(rng()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let expectedFormat="Enter a number";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	switch(type){
		case "one_radical":{
			let a=Math.floor(rng()*maxVal)+1;
			let b=Math.floor(rng()*maxVal)+1;
			let sol=b*b-a;
			correct=sol.toString();
			alternate=correct;
			display=correct;
			mathExpression=`\\( \\sqrt{x + ${a}} = ${b} \\)`;
			let numSol=parseInt(correct);
			choices=[correct];
			choices.push((numSol+1).toString());
			choices.push((numSol-1).toString());
			choices.push((b*b).toString());
			choices.push((b*b-a-1).toString());
			break;
		}
		case "two_radicals":{
			let b=Math.floor(rng()*maxVal)+1;
			let a=b*b+Math.floor(rng()*maxVal)+1;
			let sol=((a-b*b)/(2*b));
			sol=sol*sol;
			correct=sol.toFixed(2);
			alternate=sol.toString();
			display=correct;
			mathExpression=`\\( \\sqrt{x + ${a}} - \\sqrt{x} = ${b} \\)`;
			let numSol=parseFloat(correct);
			choices=[correct];
			choices.push((numSol+0.5).toFixed(2));
			choices.push((numSol-0.5).toFixed(2));
			choices.push((((a-b*b)/(2*b)).toFixed(2)));
			choices.push((((a+b*b)/(2*b)).toFixed(2)));
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
