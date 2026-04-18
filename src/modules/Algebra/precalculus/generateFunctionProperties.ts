import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Function properties: continuity, extrema, symmetry, asymptotes, end behavior.
 * @fileoverview Generates function property questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateFunctionProperties(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["continuity","extrema","symmetry","asymptotes","endbehavior"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	switch(type){
		case "continuity":{
			const a=Math.floor(Math.random()*max)+1;
			const functions=[
				`f(x)=\\frac{1}{x-${a}}`,
				`f(x)=\\sqrt{x-${a}}`,
				`f(x)=x^2+${a}`
			];
			const chosen=functions[Math.floor(Math.random()*functions.length)];
			mathExpression=`Where is \\( ${chosen} \\) discontinuous? (Enter x-value or 'none' or interval)`;
			let answer="";
			if(chosen.includes("frac")) answer=`x = ${a}`;
			else if(chosen.includes("sqrt")) answer=`x < ${a}`;
			else answer="none";
			correct=answer;
			alternate=answer;
			display=answer;
			if(answer==="none"){
				choices=["none","x=0","x=1","all reals"];
			}
			else if(answer.includes("x =")){
				choices=[answer,`x = ${a+1}`,`x = ${a-1}`,`x = 0`];
			}
			else{
				choices=[answer,`x ≤ ${a}`,`x > ${a}`,`x ≥ ${a}`];
			}
			expectedFormat="Enter x value, interval, or 'none'";
			break;
		}
		case "extrema":{
			const a=Math.floor(Math.random()*max)+1;
			const b=Math.floor(Math.random()*max)+1;
			mathExpression=`Does \\( f(x)=x^2 - ${a}x + ${b} \\) have a local minimum or maximum? (Enter 'min' or 'max')`;
			correct="min";
			alternate="minimum";
			display="min";
			choices=["min","max","neither","both"];
			expectedFormat="Enter 'min' or 'max'";
			break;
		}
		case "symmetry":{
			const functions=[
				{expr:"f(x)=x^2",type:"even"},
				{expr:"f(x)=x^3",type:"odd"},
				{expr:"f(x)=x^2+x",type:"neither"}
			];
			const chosen=functions[Math.floor(Math.random()*functions.length)];
			mathExpression=`Is \\( ${chosen.expr} \\) even, odd, or neither?`;
			correct=chosen.type;
			alternate=chosen.type;
			display=chosen.type;
			choices=["even","odd","neither"];
			expectedFormat="Enter 'even', 'odd', or 'neither'";
			break;
		}
		case "asymptotes":{
			const a=Math.floor(Math.random()*max)+1;
			const b=Math.floor(Math.random()*max)+1;
			const expr=`\\frac{${a}x+${b}}{x-${a}}`;
			mathExpression=`Find the vertical asymptote of \\( ${expr} \\). (Enter x=value)`;
			const ans=`x=${a}`;
			correct=ans;
			alternate=ans;
			display=ans;
			choices=[ans,`x=${a+1}`,`x=${a-1}`,`y=0`];
			expectedFormat="Enter x = number";
			break;
		}
		case "endbehavior":{
			const aSign=Math.floor(Math.random()*2)+1;
			const deg=Math.floor(Math.random()*2)+3;
			const sign=aSign===1?"positive":"negative";
			const evenOdd=deg%2===0?"even":"odd";
			let desc="";
			if(evenOdd==="even"){
				desc=sign==="positive"?"both ends up":"both ends down";
			}else{
				desc=sign==="positive"?"left down, right up":"left up, right down";
			}
			mathExpression=`Describe the end behavior of a polynomial with leading coefficient ${sign} and degree ${deg}.`;
			correct=desc;
			alternate=desc;
			display=desc;
			let wrong1="both ends up";
			let wrong2="both ends down";
			let wrong3="left down, right up";
			let wrong4="left up, right down";
			choices=[desc];
			for(let w of [wrong1,wrong2,wrong3,wrong4]){
				if(w!==desc) choices.push(w);
				if(choices.length>=4) break;
			}
			expectedFormat="Enter description like 'both ends up'";
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