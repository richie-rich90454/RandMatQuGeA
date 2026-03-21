/**
 * Exponential modeling: growth, decay, half-life, Newton's Law of Cooling.
 * @fileoverview Generates exponential modeling questions.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateExponentialModeling(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["growth","decay","half-life","cooling"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";
	const initial=Math.floor(Math.random()*max*10)+50;
	const rate=(Math.random()*0.1+0.05).toFixed(3);
	const time=Math.floor(Math.random()*5)+1;
	switch (type){
		case "growth":{
			questionArea.innerHTML=`A population of ${initial} grows continuously at a rate of ${(parseFloat(rate)*100).toFixed(1)}% per year. Find the population after ${time} years. (Use continuous compounding formula)`;
			const result=initial*Math.exp(parseFloat(rate)*time);
			const ans=result.toFixed(0);
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter whole number";
			break;
		}
		case "decay":{
			questionArea.innerHTML=`A radioactive substance decays at a rate of ${(parseFloat(rate)*100).toFixed(1)}% per year. If you start with ${initial} grams, how much remains after ${time} years?`;
			const result=initial*Math.exp(-parseFloat(rate)*time);
			const ans=result.toFixed(2);
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter decimal";
			break;
		}
		case "half-life":{
			const halfLife=Math.floor(Math.random()*max)+5;
			questionArea.innerHTML=`The half-life of a substance is ${halfLife} years. If you start with ${initial} grams, how much remains after ${time} years?`;
			const k=Math.LN2/halfLife;
			const result=initial*Math.exp(-k*time);
			const ans=result.toFixed(2);
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter decimal";
			break;
		}
		case "cooling":{
			const ambient=20;
			const initialTemp=100;
			const k=(Math.random()*0.1*(max/5)+0.05).toFixed(3);
			const t=Math.floor(Math.random()*10)+1;
			questionArea.innerHTML=`Newton's Law of Cooling: A body at ${initialTemp}°C is placed in room at ${ambient}°C. If k = ${k}, find temperature after ${t} minutes.`;
			const temp=ambient+(initialTemp-ambient)*Math.exp(-parseFloat(k)*t);
			const ans=temp.toFixed(1);
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter decimal";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}