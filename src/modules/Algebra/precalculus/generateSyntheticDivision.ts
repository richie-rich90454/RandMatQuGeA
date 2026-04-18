import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Synthetic division: divide, remainder, factor.
 * @fileoverview Generates synthetic division questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateSyntheticDivision(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["divide","remainder","factor"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;
	const d=Math.floor(Math.random()*max)+1;
	switch(type){
		case "divide":{
			const dividend=`${a}x^3 + ${b}x^2 + ${c}x + ${d}`;
			const divisor=`x - ${a}`;
			mathExpression=`Use synthetic division to divide \\( ${dividend} \\) by \\( ${divisor} \\). (Enter quotient)`;
			const coeffs=[a,b,c,d];
			const root=a;
			const result: number[]=[];
			let carry=0;
			for(let i=0;i<coeffs.length;i++){
				carry=coeffs[i]+carry*root;
				result.push(carry);
			}
			const quotient=`${result[0]}x^2 + ${result[1]}x + ${result[2]}`;
			correct=quotient;
			alternate=quotient;
			display=quotient;
			let q0=result[0];
			let q1=result[1];
			let q2=result[2];
			choices=[quotient];
			choices.push(`${q0+1}x^2 + ${q1}x + ${q2}`);
			choices.push(`${q0}x^2 + ${q1+1}x + ${q2}`);
			choices.push(`${q0}x^2 + ${q1}x + ${q2+1}`);
			choices.push(`${q0-1}x^2 + ${q1}x + ${q2}`);
			expectedFormat="Enter polynomial";
			break;
		}
		case "remainder":{
			const remainder=a*d*d+b*d+c;
			const ans=remainder.toString();
			correct=ans;
			alternate=ans;
			display=ans;
			const numRem=remainder;
			choices=[ans];
			choices.push((numRem+1).toString());
			choices.push((numRem-1).toString());
			choices.push((a*d*d+b*d).toString());
			choices.push((a*d+b).toString());
			mathExpression=`Use the Remainder Theorem to find the remainder when \\( ${a}x^2 + ${b}x + ${c} \\) is divided by \\( x - ${d} \\).`;
			expectedFormat="Enter a number";
			break;
		}
		case "factor":{
			const root=a;
			const poly=`x^3 - ${a}x^2 + ${b}x - ${a*b}`;
			mathExpression=`Is \\( x - ${root} \\) a factor of \\( ${poly} \\)? (yes/no)`;
			correct="yes";
			alternate="yes";
			display="yes";
			choices=["yes","no","maybe","only if b=0"];
			expectedFormat="Enter 'yes' or 'no'";
			break;
		}
		default:
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=expectedFormat;
}