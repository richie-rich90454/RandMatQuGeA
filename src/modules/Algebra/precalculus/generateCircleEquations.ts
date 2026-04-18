import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Circle equations: standard form, center/radius, complete the square.
 * @fileoverview Generates circle equation questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateCircleEquations(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["standard","center_radius","complete_square"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	switch(type){
		case "standard":{
			const h=Math.floor(Math.random()*max*2)-max;
			const k=Math.floor(Math.random()*max*2)-max;
			const r=Math.floor(Math.random()*max)+1;
			mathExpression=`Write the equation of a circle with center \\( (${h}, ${k}) \\) and radius \\( ${r} \\).`;
			const eq=`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 = ${r}^2`;
			const displayEq=`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 = ${r}^2`;
			correct=eq;
			alternate=eq;
			display=displayEq;
			let wrongH=h+1;
			let wrongK=k+1;
			choices=[correct];
			choices.push(`(x ${wrongH>=0?'-':'+'} ${Math.abs(wrongH)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 = ${r}^2`);
			choices.push(`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${wrongK>=0?'-':'+'} ${Math.abs(wrongK)})^2 = ${r}^2`);
			choices.push(`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 = ${(r+1)}^2`);
			choices.push(`(x ${h>=0?'+':'-'} ${Math.abs(h)})^2 + (y ${k>=0?'+':'-'} ${Math.abs(k)})^2 = ${r}^2`);
			expectedFormat="Enter as (x-h)^2 + (y-k)^2 = r^2";
			break;
		}
		case "center_radius":{
			const h=Math.floor(Math.random()*max*2)-max;
			const k=Math.floor(Math.random()*max*2)-max;
			const r=Math.floor(Math.random()*max)+1;
			const eq=`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 = ${r}^2`;
			mathExpression=`Find the center and radius of the circle: \\( ${eq} \\).`;
			const ans=`center (${h}, ${k}), radius ${r}`;
			correct=ans;
			alternate=`(${h},${k}), ${r}`;
			display=ans;
			choices=[correct];
			choices.push(`center (${h+1}, ${k}), radius ${r}`);
			choices.push(`center (${h}, ${k+1}), radius ${r}`);
			choices.push(`center (${h}, ${k}), radius ${r+1}`);
			choices.push(`center (${-h}, ${k}), radius ${r}`);
			expectedFormat="Enter as 'center (h,k), radius r'";
			break;
		}
		case "complete_square":{
			const h=Math.floor(Math.random()*max)+1;
			const k=Math.floor(Math.random()*max)+1;
			const r=Math.floor(Math.random()*max)+1;
			const xCoeff=-2*h;
			const yCoeff=-2*k;
			const constTerm=h*h+k*k-r*r;
			const eq=`x^2 + y^2 ${xCoeff>=0?'+':'-'} ${Math.abs(xCoeff)}x ${yCoeff>=0?'+':'-'} ${Math.abs(yCoeff)}y ${constTerm>=0?'+':'-'} ${Math.abs(constTerm)} = 0`;
			mathExpression=`Complete the square to find the center and radius: \\( ${eq} \\).`;
			const ans=`center (${h}, ${k}), radius ${r}`;
			correct=ans;
			alternate=`(${h},${k}), ${r}`;
			display=ans;
			choices=[correct];
			choices.push(`center (${h+1}, ${k}), radius ${r}`);
			choices.push(`center (${h}, ${k+1}), radius ${r}`);
			choices.push(`center (${h}, ${k}), radius ${r+1}`);
			choices.push(`center (${-h}, ${-k}), radius ${r}`);
			expectedFormat="Enter as 'center (h,k), radius r'";
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