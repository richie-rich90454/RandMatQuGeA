import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Logistic functions: identify, carrying capacity, evaluation.
 * @fileoverview Generates logistic function questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateLogisticFunctions(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	const types=["identify","limit","value"];
	const type=types[Math.floor(rng()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	const c=Math.floor(rng()*max)+5;
	const a=Math.floor(rng()*5)+1;
	const kRaw=(rng()*0.5+0.2);
	const k=kRaw.toFixed(2);
	const kNum=parseFloat(k);
	const x=Math.floor(rng()*5)+1;
	switch(type){
		case "identify":{
			const exprStr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			mathExpression=`Identify the type of function: \\( ${exprStr} \\) (logistic, exponential, logarithmic, etc.)`;
			correct="logistic";
			alternate="logistic";
			display="logistic";
			choices=["logistic","exponential","logarithmic","linear"];
			expectedFormat="Enter function type";
			break;
		}
		case "limit":{
			const exprStr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			mathExpression=`What is the carrying capacity (limit as x→∞) of \\( ${exprStr} \\)?`;
			const ans=c.toString();
			correct=ans;
			alternate=ans;
			display=ans;
			choices=[ans];
			choices.push((c+1).toString());
			choices.push((c-1).toString());
			choices.push((c/2).toString());
			choices.push((c*2).toString());
			expectedFormat="Enter a number";
			break;
		}
		case "value":{
			const exprStr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			mathExpression=`Evaluate \\( ${exprStr} \\) at \\( x=${x} \\).`;
			const val=(c/(1+a*Math.exp(-kNum*x))).toFixed(2);
			correct=val;
			alternate=val;
			display=val;
			const numVal=parseFloat(val);
			choices=[val];
			choices.push((numVal+0.1).toFixed(2));
			choices.push((numVal-0.1).toFixed(2));
			const wrongVal1=(c/(1+a*Math.exp(-kNum*(x+1)))).toFixed(2);
			const wrongVal2=(c/(1+a*Math.exp(-kNum*(x-1)))).toFixed(2);
			choices.push(wrongVal1);
			choices.push(wrongVal2);
			expectedFormat="Enter decimal";
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
