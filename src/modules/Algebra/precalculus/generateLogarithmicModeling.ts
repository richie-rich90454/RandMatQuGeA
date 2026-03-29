/**
 * Logarithmic modeling: Richter scale, pH, decibels.
 * @fileoverview Generates logarithmic modeling questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../../script.js";

export function generateLogarithmicModeling(): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["richter","ph","decibel"];
	const type=types[Math.floor(Math.random()*types.length)];
	let hint="";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	const intensity=Math.floor(Math.random()*1000)+100;
	switch (type){
		case "richter":{
			questionArea.innerHTML=`An earthquake has intensity ${intensity} times the reference intensity. Find its magnitude on the Richter scale (M = log(I/I0)).`;
			const mag=Math.log10(intensity);
			const ans=mag.toFixed(2);
			correct=ans;
			alternate=ans;
			display=ans;
			const numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+0.1).toFixed(2));
			choices.push((numAns-0.1).toFixed(2));
			choices.push(Math.log10(intensity+1).toFixed(2));
			choices.push(intensity.toString());
			hint="Enter decimal";
			break;
		}
		case "ph":{
			const exponent=-Math.floor(Math.random()*7)-1;
			const hConcVal=Math.pow(10,exponent);
			const hConcStr=hConcVal.toExponential(1);
			questionArea.innerHTML=`A solution has [H+] = ${hConcStr} M. Find its pH (pH = -log[H+]).`;
			const ph=-Math.log10(hConcVal);
			const ans=ph.toFixed(2);
			correct=ans;
			alternate=ans;
			display=ans;
			const numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+0.1).toFixed(2));
			choices.push((numAns-0.1).toFixed(2));
			const wrongPh=-Math.log10(hConcVal+0.01);
			choices.push(wrongPh.toFixed(2));
			choices.push(hConcStr);
			hint="Enter decimal";
			break;
		}
		case "decibel":{
			const power=Math.floor(Math.random()*1000)+10;
			questionArea.innerHTML=`A sound has intensity ${power} times the threshold. Find the sound level in decibels (dB = 10 log(I/I0)).`;
			const db=10*Math.log10(power);
			const ans=db.toFixed(2);
			correct=ans;
			alternate=ans;
			display=ans;
			const numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+0.5).toFixed(2));
			choices.push((numAns-0.5).toFixed(2));
			const wrongDb=10*Math.log10(power+1);
			choices.push(wrongDb.toFixed(2));
			choices.push(power.toString());
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