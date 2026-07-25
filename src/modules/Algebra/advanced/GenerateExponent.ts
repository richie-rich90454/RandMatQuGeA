/**
 * Exponential expressions: evaluate, solve, apply laws, growth factor, compare.
 * @fileoverview Generates exponent questions with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-03-29
 * @returns QuestionDto
 */
import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
export function generateExponent(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["basic","solve","laws","growth","compare"];
	let type=types[Math.floor(rng()*types.length)];
	let maxBase=getMaxForDifficulty(difficulty,4);
	let base=Math.floor(rng()*maxBase)+2;
	let exponent=Math.floor(rng()*5)+2;
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	switch (type){
		case "basic":{
			let val=Math.pow(base,exponent).toString();
			correct=val;
			alternate=val;
			display=val;
			hint="Enter a number";
			mathExpression=`Evaluate: \\( ${base}^{${exponent}} \\)`;
			let numVal=parseInt(val);
			choices=[val];
			choices.push((numVal+1).toString());
			choices.push((numVal-1).toString());
			choices.push((numVal*2).toString());
			choices.push((numVal/2).toString());
			break;
		}
		case "solve":{
			let power=Math.pow(base,exponent);
			correct=exponent.toString();
			alternate=correct;
			display=correct;
			hint="Enter a whole number";
			mathExpression=`Solve for \\( x \\): \\( ${base}^{x}=${power} \\)`;
			choices=[correct];
			choices.push((exponent+1).toString());
			choices.push((exponent-1).toString());
			choices.push((Math.log(power)/Math.log(base)).toFixed(2));
			choices.push("0");
			break;
		}
		case "laws":{
			let a=Math.floor(rng()*3)+2;
			let b=Math.floor(rng()*3)+2;
			let ansVal=Math.pow(base,a+b);
			let ansStr=ansVal.toString();
			let altExpr=`${base}^${a+b}`;
			correct=ansStr;
			alternate=altExpr;
			display=ansStr;
			hint="Enter a number (e.g., 32) or an expression (e.g., 2^5)";
			mathExpression=`Simplify: \\( (${base}^{${a}}) \\times (${base}^{${b}}) \\)`;
			let numVal=parseInt(ansStr);
			choices=[ansStr];
			choices.push((numVal+1).toString());
			choices.push((numVal-1).toString());
			choices.push(Math.pow(base,a).toString());
			choices.push(Math.pow(base,b).toString());
			break;
		}
		case "growth":{
			let rate=(rng()*20+5).toFixed(1);
			let factor=(1+parseFloat(rate)/100).toFixed(3);
			correct=factor;
			alternate=factor;
			display=factor;
			hint="Enter a decimal (e.g., 1.05)";
			mathExpression=`A population grows at \\( ${rate}\\% \\) annually. What is the growth factor?`;
			let factorNum=parseFloat(factor);
			choices=[factor];
			choices.push((factorNum+0.01).toFixed(3));
			choices.push((factorNum-0.01).toFixed(3));
			choices.push((1+parseFloat(rate)/100).toFixed(2));
			choices.push((parseFloat(rate)/100).toFixed(3));
			break;
		}
		case "compare":{
			let b1=Math.floor(rng()*3)+2;
			let b2=Math.floor(rng()*3)+2;
			let e1=Math.floor(rng()*4)+2;
			let e2=Math.floor(rng()*4)+2;
			let val1=Math.pow(b1,e1);
			let val2=Math.pow(b2,e2);
			let largerVal=Math.max(val1,val2);
			let largerExpr=val1>val2?`${b1}^${e1}`:`${b2}^${e2}`;
			correct=largerVal.toString();
			alternate=largerExpr;
			display=correct;
			hint="Enter the larger value (e.g., 32) or the expression (e.g., 2^5)";
			mathExpression=`Which is larger: \\( ${b1}^{${e1}} \\) or \\( ${b2}^{${e2}} \\)?`;
			let smaller=Math.min(val1,val2);
			choices=[correct];
			choices.push(smaller.toString());
			choices.push((largerVal+1).toString());
			choices.push((largerVal-1).toString());
			choices.push((smaller+1).toString());
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correct)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let latex=mathExpression;
	return {
		latex,
		correct,
		alternate,
		display,
		choices: uniqueChoices,
		expectedFormat: hint
	};
}
