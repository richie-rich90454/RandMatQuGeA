/**
 * Generates an order‑of‑operations question (basic, with exponents, or with parentheses) with MCQ distractors.
 * @fileoverview Order of operations evaluation. Sets window.correctAnswer with numeric result and plausible wrong answers.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
export function generateOrderOfOperations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic","with_exponents","with_parentheses"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "basic":{
			let expr=`${a} + ${b} \\times ${c}`;
			let result=a + b*c;
			correct=result.toString();
			alternate=correct;
			display=correct;
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
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
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
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
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((a+b*c).toString());
			choices.push((a+b).toString());
			break;
		}
		default:
			return;
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
	if (window.MathJax&&window.MathJax.typeset) window.MathJax.typeset();
}