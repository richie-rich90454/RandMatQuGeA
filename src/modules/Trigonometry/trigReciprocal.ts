/**
 * Reciprocal trigonometric functions: cosecant, secant, cotangent.
 * @fileoverview Generates questions on reciprocal trig functions with MCQ distractors. Returns a QuestionDto with LaTeX display, plain text alternate, and plausible wrong answers.
 * @date 2026-04-18
 */
import type {RngFn, QuestionDto} from "../../types/global";
export function generateCosecant(_difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	let types=["evaluate","relationship","asymptote"];
	let type=types[Math.floor(rng()*types.length)];
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let latex="";
	switch(type){
		case "evaluate":{
			let angles=[Math.PI/6,5*Math.PI/6,7*Math.PI/6,11*Math.PI/6];
			let labels=["\\frac{\\pi}{6}","\\frac{5\\pi}{6}","\\frac{7\\pi}{6}","\\frac{11\\pi}{6}"];
			let idx=Math.floor(rng()*angles.length);
			let angle=angles[idx];
			let value=(1/Math.sin(angle)).toFixed(2);
			correct=value;
			alternate=value;
			display=value;
			latex=`Evaluate \\( \\csc(${labels[idx]}) \\)`;
			choices=[correct];
			let wrong1=(1/Math.sin(angle+0.1)).toFixed(2);
			let wrong2=(1/Math.sin(angle-0.1)).toFixed(2);
			let wrong3=(1/Math.cos(angle)).toFixed(2);
			let wrong4=(-1/Math.sin(angle)).toFixed(2);
			choices.push(wrong1,wrong2,wrong3,wrong4);
			break;
		}
		case "relationship":{
			let angleNum=Math.floor(rng()*360);
			correct=`\\frac{1}{\\sin(${angleNum}°)}`;
			alternate=`1/sin(${angleNum}°)`;
			display=`\\frac{1}{\\sin(${angleNum}°)}`;
			latex=`Express \\( \\csc(${angleNum}°) \\) in terms of sine.`;
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
			latex=`Find the vertical asymptotes of \\( y=\\csc(x) \\) (in radians).`;
			choices=[correct];
			choices.push(`x = \\frac{\\pi}{2} + n\\pi`);
			choices.push(`x = n\\pi + \\frac{\\pi}{2}`);
			choices.push(`x = 2n\\pi`);
			choices.push(`x = n\\pi + \\frac{\\pi}{4}`);
			break;
		}
		default:
			return {latex: "Unknown cosecant question type", correct: ""};
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex,
		correct,
		alternate,
		display,
		choices: uniqueChoices,
		expectedFormat: ""
	};
}
export function generateSecant(_difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	let type=rng()<0.5?"evaluate":"identity";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let latex="";
	switch(type){
		case "evaluate":{
			let angles=[0,Math.PI/3,Math.PI,5*Math.PI/3];
			let labels=["0","\\frac{\\pi}{3}","\\pi","\\frac{5\\pi}{3}"];
			let idx=Math.floor(rng()*angles.length);
			let angle=angles[idx];
			let value=(1/Math.cos(angle)).toFixed(2);
			correct=value;
			alternate=value;
			display=value;
			latex=`Evaluate \\( \\sec(${labels[idx]}) \\)`;
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
			latex=`Complete the identity: \\( \\sec^2\\theta-\\tan^2\\theta=? \\)`;
			choices=["1","0","-1","sec^2θ+tan^2θ"];
			break;
		}
		default:
			return {latex: "Unknown secant question type", correct: ""};
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex,
		correct,
		alternate,
		display,
		choices: uniqueChoices,
		expectedFormat: ""
	};
}
export function generateCotangent(_difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	let type=rng()<0.5?"evaluate":"relationship";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	let latex="";
	switch(type){
		case "evaluate":{
			let angles=[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4];
			let labels=["\\frac{\\pi}{4}","\\frac{3\\pi}{4}","\\frac{5\\pi}{4}","\\frac{7\\pi}{4}"];
			let idx=Math.floor(rng()*angles.length);
			let angle=angles[idx];
			let value=(1/Math.tan(angle)).toFixed(2);
			correct=value;
			alternate=value;
			display=value;
			latex=`Evaluate \\( \\cot(${labels[idx]}) \\)`;
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
			latex=`Express \\( \\cot\\theta \\) in terms of tangent.`;
			choices=[correct];
			choices.push("\\frac{1}{\\sin\\theta}");
			choices.push("\\frac{1}{\\cos\\theta}");
			choices.push("\\tan\\theta");
			choices.push("\\frac{\\cos\\theta}{\\sin\\theta}");
			break;
		}
		default:
			return {latex: "Unknown cotangent question type", correct: ""};
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex,
		correct,
		alternate,
		display,
		choices: uniqueChoices,
		expectedFormat: ""
	};
}
