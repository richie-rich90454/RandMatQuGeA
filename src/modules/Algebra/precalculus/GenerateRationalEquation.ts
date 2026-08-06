import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
/**
 * Rational equation: simple or extraneous.
 * @fileoverview Generates rational equation questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateRationalEquation(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	const max=getMaxForDifficulty(difficulty,5);
	const a=Math.floor(rng()*max)+1;
	const b=Math.floor(rng()*max)+1;
	const c=Math.floor(rng()*max)+1;
	const type=rng()<0.5?"simple":"extraneous";
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	if(type==="simple"){
		const d=Math.floor(rng()*max)+1;
		const e=Math.floor(rng()*max)+1;
		let numA=Math.floor(rng()*max)+1;
		const numB=Math.floor(rng()*max)+1;
		const denC=Math.floor(rng()*max)+1;
		const denD=d;
		const denominatorVal=denC*e;
		let guard=0;
		while(numA===denominatorVal&&guard<20){
			numA=Math.floor(rng()*max)+1;
			guard++;
		}
		if(numA===denominatorVal) numA=denominatorVal+1;
		const x=(e*denD-numB)/(numA-denominatorVal);
		const ans=x.toFixed(2);
		correct=ans;
		alternate=x.toString();
		display=ans;
		mathExpression=`Solve: \\( \\frac{${numA}x + ${numB}}{${denC}x + ${denD}} = ${e} \\)`;
		const xNum=parseFloat(ans);
		choices=[ans];
		choices.push((xNum+0.1).toFixed(2));
		choices.push((xNum-0.1).toFixed(2));
		choices.push((e).toString());
		choices.push("no solution");
		expectedFormat="Enter decimal answer";
	}
	else{
		const extraneousVal=a;
		const eq=`\\frac{1}{x - ${extraneousVal}} = \\frac{${b}}{x - ${extraneousVal}} + ${c}`;
		mathExpression=`Solve and check for extraneous solutions: \\( ${eq} \\)`;
		if(b===1){
			correct="no solution";
			alternate="no solution";
			display="no solution";
			choices=["no solution",`x = ${extraneousVal}`,`x = ${extraneousVal+1}`,`x = ${extraneousVal-1}`];
		}
		else{
			const sol=a+(1-b)/c;
			correct=sol.toFixed(2);
			alternate=sol.toString();
			display=correct;
			choices=[correct];
			choices.push((sol+0.1).toFixed(2));
			choices.push((sol-0.1).toFixed(2));
			choices.push("no solution");
			choices.push(`x = ${extraneousVal}`);
		}
		expectedFormat="Enter 'no solution' or the solution";
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
