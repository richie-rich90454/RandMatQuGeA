import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a question about basic algebraic properties (commutative, associative, distributive, identity, inverse) with MCQ distractors.
 * @fileoverview Algebraic properties identification. Sets window.correctAnswer with plain text property name and plausible wrong answers.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateProperties(_difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["commutative","associative","distributive","identity","inverse"];
	let type=types[Math.floor(rng()*types.length)];
	let maxVal=getMaxForDifficulty(_difficulty,5);
	let expectedFormat="Enter the property name";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	let a=Math.floor(rng()*maxVal)+1;
	let b=Math.floor(rng()*maxVal)+1;
	let c=Math.floor(rng()*maxVal)+1;
	switch(type){
		case "commutative":{
			correct="commutative property of addition";
			alternate="commutative";
			display=correct;
			mathExpression=`Which property is illustrated? \\( ${a} + ${b}=${b} + ${a} \\)`;
			choices=[correct];
			choices.push("associative property of addition");
			choices.push("distributive property");
			choices.push("identity property");
			choices.push("inverse property");
			break;
		}
		case "associative":{
			correct="associative property of addition";
			alternate="associative";
			display=correct;
			mathExpression=`Which property is illustrated? \\( (${a} + ${b}) + ${c}=${a} + (${b} + ${c}) \\)`;
			choices=[correct];
			choices.push("commutative property of addition");
			choices.push("distributive property");
			choices.push("identity property");
			choices.push("inverse property");
			break;
		}
		case "distributive":{
			correct="distributive property";
			alternate="distributive";
			display=correct;
			mathExpression=`Which property is illustrated? \\( ${a}(${b} + ${c})=${a}${b} + ${a}${c} \\)`;
			choices=[correct];
			choices.push("commutative property");
			choices.push("associative property");
			choices.push("identity property");
			choices.push("inverse property");
			break;
		}
		case "identity":{
			correct="identity property of addition";
			alternate="identity";
			display=correct;
			mathExpression=`Which property is illustrated? \\( ${a} + 0=${a} \\)`;
			choices=[correct];
			choices.push("commutative property");
			choices.push("associative property");
			choices.push("distributive property");
			choices.push("inverse property");
			break;
		}
		case "inverse":{
			correct="inverse property of addition";
			alternate="inverse";
			display=correct;
			mathExpression=`Which property is illustrated? \\( ${a} + (-${a})=0 \\)`;
			choices=[correct];
			choices.push("commutative property");
			choices.push("associative property");
			choices.push("distributive property");
			choices.push("identity property");
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
