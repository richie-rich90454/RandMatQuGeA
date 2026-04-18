import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Linear equation special: identity or contradiction.
 * @fileoverview Generates special linear equation questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateLinearEquationSpecial(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["identity","contradiction"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	if(type==="identity"){
		const a=Math.floor(Math.random()*max)+1;
		const b=Math.floor(Math.random()*max)+1;
		const c=a;
		const d=b;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		mathExpression=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		correct="identity";
		alternate="identity";
		display="identity";
		choices=["identity","contradiction","conditional","x=0"];
		expectedFormat="Enter 'identity', 'contradiction', or the solution";
	}
	else{
		const a=Math.floor(Math.random()*max)+1;
		const b=Math.floor(Math.random()*max)+1;
		const c=a;
		const d=b+1;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		mathExpression=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		correct="contradiction";
		alternate="contradiction";
		display="contradiction";
		choices=["contradiction","identity","conditional","no solution"];
		expectedFormat="Enter 'identity', 'contradiction', or the solution";
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