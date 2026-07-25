import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
/**
 * Generates a percentage question (percent of, increase, decrease, simple interest, or markup) with MCQ distractors.
 * @fileoverview Percentage calculations. Sets window.correctAnswer with numeric result and plausible wrong answers.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generatePercent(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["percent_of","increase","decrease","interest","markup"];
	let type=types[Math.floor(rng()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,100);
	let expectedFormat="Enter a number";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	let percent=Math.floor(rng()*50)+10;
	let whole=Math.floor(rng()*maxVal)+10;
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
			let increase=Math.floor(rng()*50)+5;
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
			let decrease=Math.floor(rng()*30)+5;
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
			let principal=Math.floor(rng()*1000)+500;
			let rate=(rng()*5+2).toFixed(1);
			let time=Math.floor(rng()*3)+1;
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
			let cost=Math.floor(rng()*50)+10;
			let markup=Math.floor(rng()*40)+20;
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
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let latex=mathExpression;
	return {
		latex,
		correct,
		alternate,
		display,
		choices: uniqueChoices,
		expectedFormat
	};
}
