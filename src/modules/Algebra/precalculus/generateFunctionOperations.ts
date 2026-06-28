import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Function operations: composition, sum, product.
 * @fileoverview Generates function operation questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateFunctionOperations(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	const types=["composition","sum","product"];
	const type=types[Math.floor(rng()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	const a=Math.floor(rng()*max)+1;
	const b=Math.floor(rng()*max)+1;
	const c=Math.floor(rng()*max)+1;
	switch(type){
		case "composition":{
			const f=`${a}x + ${b}`;
			const g=`x^2`;
			const xVal=Math.floor(rng()*max)+1;
			mathExpression=`Given \\( f(x)=${f} \\) and \\( g(x)=${g} \\), find \\( (f \\circ g)(${xVal}) \\).`;
			const result=a*(xVal*xVal)+b;
			const ans=result.toString();
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseInt(ans);
			choices=[ans];
			choices.push((numAns+1).toString());
			choices.push((numAns-1).toString());
			choices.push((a*xVal+b).toString());
			choices.push((xVal*xVal).toString());
			expectedFormat="Enter a number";
			break;
		}
		case "sum":{
			const f=`${a}x + ${b}`;
			const g=`${c}x^2`;
			mathExpression=`Find \\( (f+g)(x) \\) for \\( f(x)=${f} \\) and \\( g(x)=${g} \\).`;
			const sum=`${c}x^2 + ${a}x + ${b}`;
			correct=sum;
			alternate=sum.replace(/\s+/g,'');
			display=sum;
			choices=[sum];
			choices.push(`${c}x^2 + ${a+1}x + ${b}`);
			choices.push(`${c}x^2 + ${a}x + ${b+1}`);
			choices.push(`${c+1}x^2 + ${a}x + ${b}`);
			choices.push(`${c}x^2 + ${a-1}x + ${b}`);
			expectedFormat="Enter as polynomial";
			break;
		}
		case "product":{
			const f=`${a}x + ${b}`;
			const g=`${c}x + 1`;
			mathExpression=`Find \\( (f \\cdot g)(x) \\) for \\( f(x)=${f} \\) and \\( g(x)=${g} \\).`;
			const prod=`${a*c}x^2 + ${a*1+b*c}x + ${b*1}`;
			correct=prod;
			alternate=prod.replace(/\s+/g,'');
			display=prod;
			choices=[prod];
			choices.push(`${a*c}x^2 + ${a*1+b*c+1}x + ${b}`);
			choices.push(`${a*c}x^2 + ${a*1+b*c}x + ${b+1}`);
			choices.push(`${a*c+1}x^2 + ${a*1+b*c}x + ${b}`);
			choices.push(`${a*c}x^2 + ${a*1+b*c-1}x + ${b}`);
			expectedFormat="Enter as polynomial";
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex: mathExpression,
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices,
		expectedFormat: expectedFormat
	};
}
