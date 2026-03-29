/**
 * Radical equations: one radical or two radicals.
 * @fileoverview Generates radical equation questions with MCQ distractors. Sets window.correctAnswer with correct value and display.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
export function generateRadicalEquation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["one_radical","two_radicals"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch (type){
		case "one_radical":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			let sol=b*b-a;
			correct=sol.toString();
			alternate=correct;
			display=correct;
			questionArea.innerHTML=`Solve: \\( \\sqrt{x + ${a}}=${b} \\)`;
			let numSol=parseInt(correct);
			choices=[correct];
			choices.push((numSol+1).toString());
			choices.push((numSol-1).toString());
			choices.push((b*b).toString());
			choices.push((b*b-a-1).toString());
			break;
		}
		case "two_radicals":{
			let b=Math.floor(Math.random()*maxVal)+1;
			let a=b*b+Math.floor(Math.random()*maxVal)+1;
			let sol=((a-b*b)/(2*b));
			sol=sol*sol;
			correct=sol.toFixed(2);
			alternate=sol.toString();
			display=correct;
			questionArea.innerHTML=`Solve: \\( \\sqrt{x + ${a}} - \\sqrt{x}=${b} \\) (Enter solution)`;
			let numSol=parseFloat(correct);
			choices=[correct];
			choices.push((numSol+0.5).toFixed(2));
			choices.push((numSol-0.5).toFixed(2));
			choices.push((((a-b*b)/(2*b)).toFixed(2)));
			choices.push((((a+b*b)/(2*b)).toFixed(2)));
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