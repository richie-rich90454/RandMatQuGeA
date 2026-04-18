import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Exponential modeling: growth, decay, half-life, Newton's Law of Cooling.
 * @fileoverview Generates exponential modeling questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateExponentialModeling(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["growth","decay","half-life","cooling"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	const initial=Math.floor(Math.random()*max*10)+50;
	const rate=(Math.random()*0.1+0.05).toFixed(3);
	const time=Math.floor(Math.random()*5)+1;
	switch(type){
		case "growth":{
			mathExpression=`A population of ${initial} grows continuously at a rate of ${(parseFloat(rate)*100).toFixed(1)}% per year. Find the population after ${time} years. (Use continuous compounding formula)`;
			const result=initial*Math.exp(parseFloat(rate)*time);
			const ans=result.toFixed(0);
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseInt(ans);
			choices=[ans];
			choices.push((numAns+1).toString());
			choices.push((numAns-1).toString());
			choices.push((Math.floor(initial*Math.exp(parseFloat(rate)*(time+1)))).toString());
			choices.push((Math.floor(initial*Math.exp(parseFloat(rate)*(time-1)))).toString());
			expectedFormat="Enter whole number";
			break;
		}
		case "decay":{
			mathExpression=`A radioactive substance decays at a rate of ${(parseFloat(rate)*100).toFixed(1)}% per year. If you start with ${initial} grams, how much remains after ${time} years?`;
			const result=initial*Math.exp(-parseFloat(rate)*time);
			const ans=result.toFixed(2);
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+0.1).toFixed(2));
			choices.push((numAns-0.1).toFixed(2));
			choices.push((initial*Math.exp(-parseFloat(rate)*(time+1))).toFixed(2));
			choices.push((initial*Math.exp(-parseFloat(rate)*(time-1))).toFixed(2));
			expectedFormat="Enter decimal";
			break;
		}
		case "half-life":{
			const halfLife=Math.floor(Math.random()*max)+5;
			mathExpression=`The half-life of a substance is ${halfLife} years. If you start with ${initial} grams, how much remains after ${time} years?`;
			const k=Math.LN2/halfLife;
			const result=initial*Math.exp(-k*time);
			const ans=result.toFixed(2);
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+0.1).toFixed(2));
			choices.push((numAns-0.1).toFixed(2));
			choices.push((initial*Math.pow(0.5,time/halfLife+0.1)).toFixed(2));
			choices.push((initial*Math.pow(0.5,time/halfLife-0.1)).toFixed(2));
			expectedFormat="Enter decimal";
			break;
		}
		case "cooling":{
			const ambient=20;
			const initialTemp=100;
			const k=(Math.random()*0.1*(max/5)+0.05).toFixed(3);
			const t=Math.floor(Math.random()*10)+1;
			mathExpression=`Newton's Law of Cooling: A body at ${initialTemp}°C is placed in room at ${ambient}°C. If k = ${k}, find temperature after ${t} minutes.`;
			const temp=ambient+(initialTemp-ambient)*Math.exp(-parseFloat(k)*t);
			const ans=temp.toFixed(1);
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+0.5).toFixed(1));
			choices.push((numAns-0.5).toFixed(1));
			choices.push((ambient+(initialTemp-ambient)*Math.exp(-parseFloat(k)*(t+1))).toFixed(1));
			choices.push((ambient+(initialTemp-ambient)*Math.exp(-parseFloat(k)*(t-1))).toFixed(1));
			expectedFormat="Enter decimal";
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