/**
 * Generates an expression evaluation question (linear, quadratic, or with substitution of two variables) with MCQ distractors.
 * @fileoverview Expression evaluation: linear, quadratic, two-variable substitution. Sets window.correctAnswer with numeric result and plausible wrong answers.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
export function generateExpressionEvaluation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["linear","quadratic","with_substitution"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let x=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "linear":{
			questionArea.innerHTML=`Evaluate \\( ${a}x + ${b} \\) when \\( x=${x} \\).`;
			let result=a*x+b;
			correct=result.toString();
			alternate=correct;
			display=correct;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((a*x).toString());
			choices.push((b).toString());
			break;
		}
		case "quadratic":{
			questionArea.innerHTML=`Evaluate \\( ${a}x^2 + ${b}x + 1 \\) when \\( x=${x} \\).`;
			let result=a*x*x + b*x + 1;
			correct=result.toString();
			alternate=correct;
			display=correct;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((a*x*x+b*x).toString());
			choices.push((a*x*x).toString());
			break;
		}
		case "with_substitution":{
			let y=Math.floor(Math.random()*maxVal)+1;
			questionArea.innerHTML=`Evaluate \\( ${a}x + ${b}y \\) when \\( x=${x} \\) and \\( y=${y} \\).`;
			let result=a*x + b*y;
			correct=result.toString();
			alternate=correct;
			display=correct;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((a*x).toString());
			choices.push((b*y).toString());
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