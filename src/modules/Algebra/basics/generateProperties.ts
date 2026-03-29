/**
 * Generates a question about basic algebraic properties (commutative, associative, distributive, identity, inverse) with MCQ distractors.
 * @fileoverview Algebraic properties identification. Sets window.correctAnswer with plain text property name and plausible wrong answers.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
export function generateProperties(_difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["commutative","associative","distributive","identity","inverse"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(_difficulty,5);
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "commutative":{
			questionArea.innerHTML=`Which property is illustrated? \\( ${a} + ${b}=${b} + ${a} \\)`;
			correct="commutative property of addition";
			alternate="commutative";
			display=correct;
			choices=[correct];
			choices.push("associative property of addition");
			choices.push("distributive property");
			choices.push("identity property");
			choices.push("inverse property");
			break;
		}
		case "associative":{
			questionArea.innerHTML=`Which property is illustrated? \\( (${a} + ${b}) + ${c}=${a} + (${b} + ${c}) \\)`;
			correct="associative property of addition";
			alternate="associative";
			display=correct;
			choices=[correct];
			choices.push("commutative property of addition");
			choices.push("distributive property");
			choices.push("identity property");
			choices.push("inverse property");
			break;
		}
		case "distributive":{
			questionArea.innerHTML=`Which property is illustrated? \\( ${a}(${b} + ${c})=${a}${b} + ${a}${c} \\)`;
			correct="distributive property";
			alternate="distributive";
			display=correct;
			choices=[correct];
			choices.push("commutative property");
			choices.push("associative property");
			choices.push("identity property");
			choices.push("inverse property");
			break;
		}
		case "identity":{
			questionArea.innerHTML=`Which property is illustrated? \\( ${a} + 0=${a} \\)`;
			correct="identity property of addition";
			alternate="identity";
			display=correct;
			choices=[correct];
			choices.push("commutative property");
			choices.push("associative property");
			choices.push("distributive property");
			choices.push("inverse property");
			break;
		}
		case "inverse":{
			questionArea.innerHTML=`Which property is illustrated? \\( ${a} + (-${a})=0 \\)`;
			correct="inverse property of addition";
			alternate="inverse";
			display=correct;
			choices=[correct];
			choices.push("commutative property");
			choices.push("associative property");
			choices.push("distributive property");
			choices.push("identity property");
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