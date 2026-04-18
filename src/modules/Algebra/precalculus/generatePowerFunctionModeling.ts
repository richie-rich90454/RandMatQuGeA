import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Power function modeling: direct, inverse, power variation.
 * @fileoverview Generates power function modeling questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generatePowerFunctionModeling(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["direct","inverse","power"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	const k=Math.floor(Math.random()*max)+1;
	const x1=Math.floor(Math.random()*max)+1;
	const y1=k*x1;
	const x2=Math.floor(Math.random()*max)+1;
	switch(type){
		case "direct":{
			mathExpression=`If y varies directly with x, and y=${y1} when x=${x1}, find y when x=${x2}.`;
			const y2=k*x2;
			const ans=y2.toString();
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseInt(ans);
			choices=[ans];
			choices.push((numAns+1).toString());
			choices.push((numAns-1).toString());
			choices.push((k).toString());
			choices.push((x2).toString());
			expectedFormat="Enter a number";
			break;
		}
		case "inverse":{
			const kInv=x1*y1;
			mathExpression=`If y varies inversely with x, and y=${y1} when x=${x1}, find y when x=${x2}.`;
			const y2=kInv/x2;
			const ans=y2.toFixed(2);
			correct=ans;
			alternate=y2.toString();
			display=ans;
			let numAns=parseFloat(ans);
			choices=[ans];
			choices.push((numAns+0.5).toFixed(2));
			choices.push((numAns-0.5).toFixed(2));
			choices.push((kInv).toString());
			choices.push((kInv/(x2+1)).toFixed(2));
			expectedFormat="Enter a number";
			break;
		}
		case "power":{
			const exp=Math.floor(Math.random()*2)+2;
			const y1pow=k*Math.pow(x1,exp);
			mathExpression=`If y varies as the ${exp}rd power of x, and y=${y1pow} when x=${x1}, find y when x=${x2}.`;
			const y2=k*Math.pow(x2,exp);
			const ans=y2.toString();
			correct=ans;
			alternate=ans;
			display=ans;
			let numAns=parseInt(ans);
			choices=[ans];
			choices.push((numAns+1).toString());
			choices.push((numAns-1).toString());
			choices.push((k*Math.pow(x2,exp+1)).toString());
			choices.push((k*Math.pow(x2,exp-1)).toString());
			expectedFormat="Enter a number";
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