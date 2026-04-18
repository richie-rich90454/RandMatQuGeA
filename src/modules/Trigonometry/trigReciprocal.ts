/**
 * Reciprocal trigonometric functions: cosecant, secant, cotangent.
 * @fileoverview Generates questions on reciprocal trig functions with MCQ distractors. Sets window.correctAnswer with LaTeX display, plain text alternate, and plausible wrong answers.
 * @date 2026-04-18
 */
import {questionArea} from "../../script.js";
export function generateCosecant(_difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["evaluate","relationship","asymptote"];
	let type=types[Math.floor(Math.random()*types.length)];
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch(type){
		case "evaluate":{
			let angles=[Math.PI/6,5*Math.PI/6,7*Math.PI/6,11*Math.PI/6];
			let labels=["\\frac{\\pi}{6}","\\frac{5\\pi}{6}","\\frac{7\\pi}{6}","\\frac{11\\pi}{6}"];
			let idx=Math.floor(Math.random()*angles.length);
			let angle=angles[idx];
			let value=(1/Math.sin(angle)).toFixed(2);
			correct=value;
			alternate=value;
			display=value;
			questionArea.innerHTML=`Evaluate \\( \\csc(${labels[idx]}) \\)`;
			choices=[correct];
			let wrong1=(1/Math.sin(angle+0.1)).toFixed(2);
			let wrong2=(1/Math.sin(angle-0.1)).toFixed(2);
			let wrong3=(1/Math.cos(angle)).toFixed(2);
			let wrong4=(-1/Math.sin(angle)).toFixed(2);
			choices.push(wrong1,wrong2,wrong3,wrong4);
			break;
		}
		case "relationship":{
			let angleNum=Math.floor(Math.random()*360);
			correct=`\\frac{1}{\\sin(${angleNum}°)}`;
			alternate=`1/sin(${angleNum}°)`;
			display=`\\frac{1}{\\sin(${angleNum}°)}`;
			questionArea.innerHTML=`Express \\( \\csc(${angleNum}°) \\) in terms of sine.`;
			choices=[correct];
			choices.push(`\\frac{1}{\\cos(${angleNum}°)}`);
			choices.push(`\\frac{1}{\\tan(${angleNum}°)}`);
			choices.push(`\\sin(${angleNum}°)`);
			choices.push(`\\cos(${angleNum}°)`);
			break;
		}
		case "asymptote":{
			correct=`x = n\\pi`;
			alternate="x=nπ";
			display=`x = n\\pi`;
			questionArea.innerHTML=`Find the vertical asymptotes of \\( y=\\csc(x) \\) (in radians).`;
			choices=[correct];
			choices.push(`x = \\frac{\\pi}{2} + n\\pi`);
			choices.push(`x = n\\pi + \\frac{\\pi}{2}`);
			choices.push(`x = 2n\\pi`);
			choices.push(`x = n\\pi + \\frac{\\pi}{4}`);
			break;
		}
		default:
			questionArea.innerHTML="Unknown cosecant question type";
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=window.expectedFormat||"";
	window.MathJax?.typeset();
}
export function generateSecant(_difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let type=Math.random()<0.5?"evaluate":"identity";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch(type){
		case "evaluate":{
			let angles=[0,Math.PI/3,Math.PI,5*Math.PI/3];
			let labels=["0","\\frac{\\pi}{3}","\\pi","\\frac{5\\pi}{3}"];
			let idx=Math.floor(Math.random()*angles.length);
			let angle=angles[idx];
			let value=(1/Math.cos(angle)).toFixed(2);
			correct=value;
			alternate=value;
			display=value;
			questionArea.innerHTML=`Evaluate \\( \\sec(${labels[idx]}) \\)`;
			choices=[correct];
			let wrong1=(1/Math.cos(angle+0.1)).toFixed(2);
			let wrong2=(1/Math.cos(angle-0.1)).toFixed(2);
			let wrong3=(1/Math.sin(angle)).toFixed(2);
			let wrong4=(-1/Math.cos(angle)).toFixed(2);
			choices.push(wrong1,wrong2,wrong3,wrong4);
			break;
		}
		case "identity":{
			correct="1";
			alternate="1";
			display="1";
			questionArea.innerHTML=`Complete the identity: \\( \\sec^2\\theta-\\tan^2\\theta=? \\)`;
			choices=["1","0","-1","sec^2θ+tan^2θ"];
			break;
		}
		default:
			questionArea.innerHTML="Unknown secant question type";
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=window.expectedFormat||"";
	window.MathJax?.typeset();
}
export function generateCotangent(_difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let type=Math.random()<0.5?"evaluate":"relationship";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch(type){
		case "evaluate":{
			let angles=[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4];
			let labels=["\\frac{\\pi}{4}","\\frac{3\\pi}{4}","\\frac{5\\pi}{4}","\\frac{7\\pi}{4}"];
			let idx=Math.floor(Math.random()*angles.length);
			let angle=angles[idx];
			let value=(1/Math.tan(angle)).toFixed(2);
			correct=value;
			alternate=value;
			display=value;
			questionArea.innerHTML=`Evaluate \\( \\cot(${labels[idx]}) \\)`;
			choices=[correct];
			let wrong1=(1/Math.tan(angle+0.1)).toFixed(2);
			let wrong2=(1/Math.tan(angle-0.1)).toFixed(2);
			let wrong3=(1/Math.sin(angle)).toFixed(2);
			let wrong4=(1/Math.cos(angle)).toFixed(2);
			choices.push(wrong1,wrong2,wrong3,wrong4);
			break;
		}
		case "relationship":{
			correct="\\frac{1}{\\tan\\theta}";
			alternate="1/tanθ";
			display="\\frac{1}{\\tan\\theta}";
			questionArea.innerHTML=`Express \\( \\cot\\theta \\) in terms of tangent.`;
			choices=[correct];
			choices.push("\\frac{1}{\\sin\\theta}");
			choices.push("\\frac{1}{\\cos\\theta}");
			choices.push("\\tan\\theta");
			choices.push("\\frac{\\cos\\theta}{\\sin\\theta}");
			break;
		}
		default:
			questionArea.innerHTML="Unknown cotangent question type";
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=window.expectedFormat||"";
	window.MathJax?.typeset();
}