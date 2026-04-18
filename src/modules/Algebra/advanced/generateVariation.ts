import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Variation: direct, inverse, joint.
 * @fileoverview Generates variation questions with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-04-18
 */
export function generateVariation(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["direct","inverse","joint"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let x=Math.floor(Math.random()*maxVal)+1;
	let y=Math.floor(Math.random()*maxVal)+1;
	switch(type){
		case "direct":{
			let k=a/b;
			let result=k*x;
			correct=result.toFixed(2);
			alternate=result.toString();
			display=correct;
			mathExpression=`If y varies directly with x, and y=${a} when x=${b}, find y when x=${x}.`;
			expectedFormat="Enter a decimal number";
			let numRes=parseFloat(correct);
			choices=[correct];
			choices.push((numRes+0.5).toFixed(2));
			choices.push((numRes-0.5).toFixed(2));
			choices.push((a*x/b).toFixed(2));
			choices.push((a*b/x).toFixed(2));
			break;
		}
		case "inverse":{
			let k=a*b;
			let result=k/x;
			correct=result.toFixed(2);
			alternate=result.toString();
			display=correct;
			mathExpression=`If y varies inversely with x, and y=${a} when x=${b}, find y when x=${x}.`;
			expectedFormat="Enter a decimal number";
			let numRes=parseFloat(correct);
			choices=[correct];
			choices.push((numRes+0.5).toFixed(2));
			choices.push((numRes-0.5).toFixed(2));
			choices.push((a*b/x).toFixed(2));
			choices.push((a*x/b).toFixed(2));
			break;
		}
		case "joint":{
			let c=Math.floor(Math.random()*maxVal)+1;
			let k=a/(b*c);
			let result=k*x*y;
			correct=result.toFixed(2);
			alternate=result.toString();
			display=correct;
			mathExpression=`If z varies jointly with x and y, and z=${a} when x=${b}, y=${c}, find z when x=${x}, y=${y}.`;
			expectedFormat="Enter a decimal number";
			let numRes=parseFloat(correct);
			choices=[correct];
			choices.push((numRes+0.5).toFixed(2));
			choices.push((numRes-0.5).toFixed(2));
			choices.push((a*x*y/(b*c)).toFixed(2));
			choices.push((a*b*c/(x*y)).toFixed(2));
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