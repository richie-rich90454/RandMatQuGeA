import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a unit conversion question (US length, metric length, area, volume, or multi‑step) with MCQ distractors.
 * @fileoverview Unit conversions. Sets window.correctAnswer with numeric result and plausible wrong answers.
 * @date 2026-04-18
 */
export function generateUnitConversion(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["length_us","length_metric","area","volume","multi_step"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,50);
	let expectedFormat="Enter a number";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	let value=Math.floor(Math.random()*maxVal)+1;
	switch(type){
		case "length_us":{
			let conversions=[
				{from:"ft",to:"in",factor:12},
				{from:"yd",to:"ft",factor:3},
				{from:"mi",to:"ft",factor:5280}
			];
			let c=conversions[Math.floor(Math.random()*conversions.length)];
			let result=value*c.factor;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Convert \\( ${value} \\text{ ${c.from}} \\) to \\( \\text{${c.to}} \\).`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((value+c.factor).toString());
			choices.push((value).toString());
			break;
		}
		case "length_metric":{
			let conversions=[
				{from:"m",to:"cm",factor:100},
				{from:"km",to:"m",factor:1000},
				{from:"cm",to:"mm",factor:10}
			];
			let c=conversions[Math.floor(Math.random()*conversions.length)];
			let result=value*c.factor;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Convert \\( ${value} \\text{ ${c.from}} \\) to \\( \\text{${c.to}} \\).`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((value+c.factor).toString());
			choices.push((value).toString());
			break;
		}
		case "area":{
			let value2=Math.floor(Math.random()*10)+1;
			let result=value2*9;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Convert \\( ${value2} \\text{ yd}^2 \\) to \\( \\text{ft}^2 \\). (1 yd=3 ft)`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((value2*3).toString());
			choices.push((value2).toString());
			break;
		}
		case "volume":{
			let value2=Math.floor(Math.random()*5)+1;
			let result=value2*1000;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Convert \\( ${value2} \\text{ L} \\) to \\( \\text{mL} \\).`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((value2*100).toString());
			choices.push((value2).toString());
			break;
		}
		case "multi_step":{
			let value2=Math.floor(Math.random()*10)+1;
			let result=value2*12*3;
			correct=result.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Convert \\( ${value2} \\text{ yd} \\) to \\( \\text{in} \\). (1 yd=3 ft, 1 ft=12 in)`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((value2*12).toString());
			choices.push((value2*3).toString());
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