import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Rational equation: simple or extraneous.
 * @fileoverview Generates rational equation questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateRationalEquation(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const max=getMaxForDifficulty(difficulty,5);
	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;
	const type=Math.random()<0.5?"simple":"extraneous";
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	if(type==="simple"){
		const d=Math.floor(Math.random()*max)+1;
		const e=Math.floor(Math.random()*max)+1;
		const numA=Math.floor(Math.random()*max)+1;
		const numB=Math.floor(Math.random()*max)+1;
		const denC=Math.floor(Math.random()*max)+1;
		const denD=d;
		const denominatorVal=denC*e;
		let x: number;
		if(numA===denominatorVal){
			x=(e*denD-numB)/(numA-denominatorVal);
		}
		else{
			x=(e*denD-numB)/(numA-denominatorVal);
		}
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
		correct="no solution";
		alternate="no solution";
		display="no solution";
		choices=["no solution",`x = ${extraneousVal}`,`x = ${extraneousVal+1}`,`x = ${extraneousVal-1}`];
		expectedFormat="Enter 'no solution' or the solution";
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