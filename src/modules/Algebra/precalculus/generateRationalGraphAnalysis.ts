/**
 * Rational graph analysis: domain, asymptotes, holes.
 * @fileoverview Generates rational graph analysis questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateRationalGraphAnalysis(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["domain","asymptotes","holes"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;
	switch (type){
		case "domain":{
			const expr=`\\frac{x+${a}}{x-${b}}`;
			questionArea.innerHTML=`Find the domain of \\( ${expr} \\). (Enter interval)`;
			const ans=`(-∞, ${b}) ∪ (${b}, ∞)`;
			correct=ans;
			alternate=`(-infinity,${b}) U (${b},infinity)`;
			display=ans;
			choices=[ans];
			choices.push(`(-∞, ${b}] ∪ [${b}, ∞)`);
			choices.push(`(-∞, ${b})`);
			choices.push(`(${b}, ∞)`);
			choices.push(`all real numbers`);
			hint="Enter intervals";
			break;
		}
		case "asymptotes":{
			const expr=`\\frac{${a}x+${b}}{x-${c}}`;
			questionArea.innerHTML=`Find the vertical and horizontal asymptotes of \\( ${expr} \\).`;
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
			hint="Enter as 'VA: x=..., HA: y=...'";
			break;
		}
		case "holes":{
			const holeX=a;
			const expr=`\\frac{(x-${holeX})(x+${b})}{x-${holeX}}`;
			questionArea.innerHTML=`Does the graph of \\( ${expr} \\) have a hole? If so, at what x-value?`;
			const ans=`x = ${holeX}`;
			correct=ans;
			alternate=`${holeX}`;
			display=ans;
			choices=[ans];
			choices.push(`x = ${holeX+1}`);
			choices.push(`x = ${holeX-1}`);
			choices.push(`none`);
			choices.push(`x = 0`);
			hint="Enter x = value or 'none'";
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
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}