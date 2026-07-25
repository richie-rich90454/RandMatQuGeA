import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty, getOrdinal} from "../algebraUtils.js";
interface SeriesType{
	expr: string;
	conv: string;
}
/**
 * Series: arithmetic sum, geometric sum, convergence, nth term.
 * @fileoverview Generates series questions with MCQ distractors.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateSeries(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["arithmetic_sum","geometric_sum","convergence","nth_term"];
	let type=types[Math.floor(rng()*types.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let expectedFormat="";
	let maxVal=getMaxForDifficulty(difficulty,10);
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch(type){
		case "arithmetic_sum":{
			let a1=Math.floor(rng()*maxVal)+1;
			let d=Math.floor(rng()*(maxVal/2))+1;
			let n=Math.floor(rng()*maxVal)+5;
			let sum=(n/2)*(2*a1+(n-1)*d);
			mathExpression=`Find the sum of the first ${n} terms of the arithmetic sequence: \\[ S_n=\\frac{n}{2} [2a_1+(n-1)d] \\] where \\( a_1=${a1} \\) and \\( d=${d} \\).`;
			plainCorrectAnswer=sum.toString();
			alternate=plainCorrectAnswer;
			display=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let numSum=parseInt(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((numSum+1).toString());
			choices.push((numSum-1).toString());
			choices.push((numSum*2).toString());
			choices.push((numSum/2).toString());
			break;
		}
		case "geometric_sum":{
			let a1=Math.floor(rng()*maxVal/2)+1;
			let rValue=(rng()<0.5?-1:1)*(rng()*0.9+0.1);
			let r=rValue.toFixed(2);
			let n=Math.floor(rng()*8)+3;
			let sum=a1*(1-Math.pow(rValue,n))/(1-rValue);
			mathExpression=`Find the sum of the first ${n} terms of the geometric sequence: \\[ S_n=a_1 \\frac{1-r^n}{1-r} \\] where \\( a_1=${a1} \\) and \\( r=${r} \\).`;
			plainCorrectAnswer=sum.toFixed(2);
			alternate=`(${a1}*(1-${r}^${n}))/(1-${r})`;
			display=plainCorrectAnswer;
			expectedFormat="Enter a decimal number";
			let numSum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((numSum+0.5).toFixed(2));
			choices.push((numSum-0.5).toFixed(2));
			choices.push((a1*(1-Math.pow(rValue,n+1))/(1-rValue)).toFixed(2));
			choices.push((a1*(1-Math.pow(rValue,n-1))/(1-rValue)).toFixed(2));
			break;
		}
		case "convergence":{
			let seriesTypes: SeriesType[]=[{ expr:"\\frac{1}{n^2}", conv:"converges" }, { expr:"\\frac{1}{\\sqrt{n}}", conv:"diverges" }, { expr:"(-1)^n \\frac{1}{n}", conv:"converges" }];
			let chosen=seriesTypes[Math.floor(rng()*seriesTypes.length)];
			mathExpression=`Determine if the series converges or diverges: \\[ \\sum_{n=1}^{\\infty} ${chosen.expr} \\]`;
			plainCorrectAnswer=chosen.conv;
			alternate=chosen.conv==="converges"?"converge":"diverge";
			display=plainCorrectAnswer;
			expectedFormat="Enter 'converges' or 'diverges'";
			choices=[plainCorrectAnswer];
			choices.push(chosen.conv==="converges"?"diverges":"converges");
			choices.push("absolutely convergent");
			choices.push("conditionally convergent");
			choices.push("inconclusive");
			break;
		}
		case "nth_term":{
			let a1=Math.floor(rng()*maxVal)+1;
			let d=Math.floor(rng()*(maxVal/2))+1;
			let n=Math.floor(rng()*maxVal)+5;
			let an=a1+(n-1)*d;
			mathExpression=`Find the ${n}${getOrdinal(n)} term of the arithmetic sequence: \\[ a_n=a_1+(n-1)d \\] where \\( a_1=${a1} \\) and \\( d=${d} \\).`;
			plainCorrectAnswer=an.toString();
			alternate=plainCorrectAnswer;
			display=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let numAn=parseInt(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((numAn+1).toString());
			choices.push((numAn-1).toString());
			choices.push((a1+n*d).toString());
			choices.push((a1+(n+1)*d).toString());
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(plainCorrectAnswer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=plainCorrectAnswer;
		else uniqueChoices=[plainCorrectAnswer];
	}
	let latex=mathExpression;
	return {
		latex,
		correct: plainCorrectAnswer,
		alternate,
		display,
		choices: uniqueChoices,
		expectedFormat
	};
}
