import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Rational exponents: convert to radical, convert to exponent, evaluate.
 * @fileoverview Generates rational exponent questions with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateRationalExponents(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["convert_to_radical","convert_to_exponent","evaluate"];
	let type=types[Math.floor(rng()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let a=Math.floor(rng()*maxVal)+2;
	let m=Math.floor(rng()*2)+2;
	let n=Math.floor(rng()*2)+2;
	let mathExpression="";
	let correct="";
	let alternate="";
	let display="";
	let expectedFormat="";
	let choices: string[]=[];
	switch(type){
		case "convert_to_radical":{
			mathExpression=`\\( x^{${m}/${n}} \\) in radical form.`;
			correct=`\\sqrt[${n}]{x^{${m}}}`;
			alternate=`x^(${m}/${n})`;
			display=correct;
			expectedFormat="Enter as \\sqrt[n]{x^m}";
			choices=[correct];
			choices.push(`\\sqrt[${n+1}]{x^{${m}}}`);
			choices.push(`\\sqrt[${n}]{x^{${m+1}}}`);
			choices.push(`x^{${m+1}/${n}}`);
			choices.push(`\\sqrt[${n}]{x^{${m-1}}}`);
			break;
		}
		case "convert_to_exponent":{
			mathExpression=`\\( \\sqrt[${n}]{x^{${m}}} \\) using a rational exponent.`;
			correct=`x^{${m}/${n}}`;
			alternate=`x^(${m}/${n})`;
			display=correct;
			expectedFormat="Enter as x^(m/n)";
			choices=[correct];
			choices.push(`x^{${m+1}/${n}}`);
			choices.push(`x^{${m}/${n+1}}`);
			choices.push(`x^{${m*n}}`);
			choices.push(`x^{${m+n}}`);
			break;
		}
		case "evaluate":{
			let base=a;
			let exponent=m/n;
			let result=Math.pow(base,exponent).toFixed(2);
			mathExpression=`\\( ${a}^{${m}/${n}} \\)`;
			correct=result;
			alternate=result;
			display=result;
			expectedFormat="Enter a decimal number";
			let correctNum=parseFloat(correct);
			choices=[correct];
			choices.push((correctNum+0.1).toFixed(2));
			choices.push((correctNum-0.1).toFixed(2));
			choices.push((correctNum*1.1).toFixed(2));
			choices.push((correctNum*0.9).toFixed(2));
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
