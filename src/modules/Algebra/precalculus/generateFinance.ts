/**
 * Finance: compound interest, continuous, APY, annuity.
 * @fileoverview Generates finance questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";

export function generateFinance(): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["compound","continuous","apy","annuity"];
	const type=types[Math.floor(Math.random()*types.length)];
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	const principal=Math.floor(Math.random()*5000)+1000;
	const rate=(Math.random()*0.05+0.02).toFixed(3);
	const years=Math.floor(Math.random()*10)+1;
	const n=Math.floor(Math.random()*4)+1;
	switch (type){
		case "compound":{
			questionArea.innerHTML=`Find the amount after ${years} years if $${principal} is invested at ${(parseFloat(rate)*100).toFixed(1)}% compounded ${n} times per year.`;
			const amount=principal*Math.pow(1+parseFloat(rate)/n,n*years);
			const ans=amount.toFixed(2);
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+1).toFixed(2));
			choices.push((numAns-1).toFixed(2));
			choices.push((principal*Math.pow(1+parseFloat(rate)/n,n*years+1)).toFixed(2));
			choices.push((principal*Math.pow(1+parseFloat(rate)/n,n*years-1)).toFixed(2));
			hint="Enter decimal (two decimals)";
			break;
		}
		case "continuous":{
			questionArea.innerHTML=`Find the amount after ${years} years if $${principal} is invested at ${(parseFloat(rate)*100).toFixed(1)}% compounded continuously.`;
			const amount=principal*Math.exp(parseFloat(rate)*years);
			const ans=amount.toFixed(2);
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+1).toFixed(2));
			choices.push((numAns-1).toFixed(2));
			choices.push((principal*Math.exp(parseFloat(rate)*(years+1))).toFixed(2));
			choices.push((principal*Math.exp(parseFloat(rate)*(years-1))).toFixed(2));
			hint="Enter decimal";
			break;
		}
		case "apy":{
			questionArea.innerHTML=`Find the APY for a nominal rate of ${(parseFloat(rate)*100).toFixed(1)}% compounded ${n} times per year. (as a percentage)`;
			const apy=(Math.pow(1+parseFloat(rate)/n,n)-1)*100;
			const ans=apy.toFixed(2);
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+0.1).toFixed(2));
			choices.push((numAns-0.1).toFixed(2));
			choices.push((parseFloat(rate)*100).toFixed(2));
			choices.push((apy+0.5).toFixed(2));
			hint="Enter percentage (e.g., 5.25)";
			break;
		}
		case "annuity":{
			const payment=Math.floor(Math.random()*500)+100;
			questionArea.innerHTML=`You deposit $${payment} at the end of each year into an account earning ${(parseFloat(rate)*100).toFixed(1)}% compounded annually. Find the future value after ${years} years.`;
			const fv=payment*((Math.pow(1+parseFloat(rate),years)-1)/parseFloat(rate));
			const ans=fv.toFixed(2);
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+1).toFixed(2));
			choices.push((numAns-1).toFixed(2));
			choices.push((payment*((Math.pow(1+parseFloat(rate),years+1)-1)/parseFloat(rate))).toFixed(2));
			choices.push((payment*((Math.pow(1+parseFloat(rate),years-1)-1)/parseFloat(rate))).toFixed(2));
			hint="Enter decimal";
			break;
		}
		default:
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correct)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}