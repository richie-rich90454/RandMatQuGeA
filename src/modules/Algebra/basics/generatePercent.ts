import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a percentage question (percent of, increase, decrease, simple interest, or markup) with MCQ distractors.
 * @fileoverview Percentage calculations. Sets window.correctAnswer with numeric result and plausible wrong answers.
 * @date 2026-04-18
 */
export function generatePercent(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["percent_of","increase","decrease","interest","markup"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,100);
	let expectedFormat="Enter a number";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	let percent=Math.floor(Math.random()*50)+10;
	let whole=Math.floor(Math.random()*maxVal)+10;
	let part=Math.round(whole*percent/100);
	switch(type){
		case "percent_of":{
			correct=part.toString();
			alternate=correct;
			display=correct;
			mathExpression=`What is \\( ${percent}\\% \\) of \\( ${whole} \\)?`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((whole*percent/100+1).toString());
			choices.push((whole).toString());
			break;
		}
		case "increase":{
			let increase=Math.floor(Math.random()*50)+5;
			let newVal=whole+Math.round(whole*increase/100);
			correct=newVal.toString();
			alternate=correct;
			display=correct;
			mathExpression=`If \\( ${whole} \\) increases by \\( ${increase}\\% \\), what is the new value?`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((whole+increase).toString());
			choices.push((whole).toString());
			break;
		}
		case "decrease":{
			let decrease=Math.floor(Math.random()*30)+5;
			let newVal=whole-Math.round(whole*decrease/100);
			correct=newVal.toString();
			alternate=correct;
			display=correct;
			mathExpression=`If \\( ${whole} \\) decreases by \\( ${decrease}\\% \\), what is the new value?`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((whole-decrease).toString());
			choices.push((whole).toString());
			break;
		}
		case "interest":{
			let principal=Math.floor(Math.random()*1000)+500;
			let rate=(Math.random()*5+2).toFixed(1);
			let time=Math.floor(Math.random()*3)+1;
			let interest=Math.round(principal*parseFloat(rate)/100*time);
			correct=interest.toString();
			alternate=correct;
			display=correct;
			mathExpression=`Simple interest on \\( $${principal} \\) at \\( ${rate}\\% \\) for \\( ${time} \\) years?`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((principal*parseFloat(rate)/100).toFixed(0));
			choices.push((principal*time).toString());
			break;
		}
		case "markup":{
			let cost=Math.floor(Math.random()*50)+10;
			let markup=Math.floor(Math.random()*40)+20;
			let price=cost+Math.round(cost*markup/100);
			correct=price.toString();
			alternate=correct;
			display=correct;
			mathExpression=`A store buys an item for \\( $${cost} \\) and marks it up \\( ${markup}\\% \\). What is the selling price?`;
			let numRes=parseInt(correct);
			choices=[correct];
			choices.push((numRes+1).toString());
			choices.push((numRes-1).toString());
			choices.push((cost+markup).toString());
			choices.push((cost).toString());
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