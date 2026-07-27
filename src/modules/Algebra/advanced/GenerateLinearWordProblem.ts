﻿import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
/**
 * Linear word problems: consecutive integers, money, distance, age, mixture.
 * @fileoverview Generates linear word problems with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateLinearWordProblem(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let types=["consecutive_integers","money","distance","age","mixture"];
	let type=types[Math.floor(rng()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,20);
	let expectedFormat="Enter a number";
	let expectedFormats: Record<string,string>={
		consecutive_integers: "Enter a whole number",
		money: "Enter a number (cents)",
		distance: "Enter a number (miles)",
		age: "Enter a number",
		mixture: "Enter a number (gallons)"
	};
	let correct="";
	let alternate="";
	let display="";
	let problemText="";
	let choices:string[]=[];
	switch(type){
		case "consecutive_integers":{
			let n=Math.floor(rng()*maxVal)+1;
			let sum=n+(n+1);
			correct=n.toString();
			alternate=correct;
			display=correct;
			problemText=`The sum of two consecutive integers is ${sum}. Find the smaller integer.`;
			choices=[correct];
			choices.push((n+1).toString());
			choices.push((n-1).toString());
			choices.push((n+2).toString());
			choices.push((sum).toString());
			break;
		}
		case "money":{
			let quarters=Math.floor(rng()*5)+2;
			let dimes=Math.floor(rng()*5)+2;
			let total=quarters*25+dimes*10;
			correct=total.toString();
			alternate=correct;
			display=correct;
			problemText=`You have ${quarters} quarters and ${dimes} dimes. How much money do you have in cents?`;
			choices=[correct];
			choices.push((total+5).toString());
			choices.push((total-5).toString());
			choices.push((quarters*25).toString());
			choices.push((dimes*10).toString());
			break;
		}
		case "distance":{
			let rate=Math.floor(rng()*30)+20;
			let time=Math.floor(rng()*3)+2;
			let dist=rate*time;
			correct=dist.toString();
			alternate=correct;
			display=correct;
			problemText=`A car travels at ${rate} mph for ${time} hours. How far does it travel?`;
			choices=[correct];
			choices.push((dist+rate).toString());
			choices.push((dist-rate).toString());
			choices.push((rate).toString());
			choices.push((time).toString());
			break;
		}
		case "age":{
			let now=Math.floor(rng()*20)+10;
			let past=Math.floor(rng()*5)+2;
			let ago=now-past;
			correct=ago.toString();
			alternate=correct;
			display=correct;
			problemText=`A person is ${now} years old. How old were they ${past} years ago?`;
			choices=[correct];
			choices.push((now).toString());
			choices.push((ago+1).toString());
			choices.push((ago-1).toString());
			choices.push((past).toString());
			break;
		}
		case "mixture":{
			let total=Math.floor(rng()*20)+10;
			let percent=Math.floor(rng()*30)+20;
			let amount=Math.round(total*percent/100);
			correct=amount.toString();
			alternate=correct;
			display=correct;
			problemText=`A ${total} gallon mixture contains ${percent}% alcohol. How many gallons of alcohol are in it?`;
			choices=[correct];
			choices.push((amount+1).toString());
			choices.push((amount-1).toString());
			choices.push((total).toString());
			choices.push((Math.round(total*percent/1000)).toString());
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	expectedFormat=expectedFormats[type]||"Enter a number";
	let latex=problemText;
	return {
		latex,
		correct,
		alternate,
		display,
		choices: uniqueChoices,
		expectedFormat
	};
}
