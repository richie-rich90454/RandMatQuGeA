import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Linear word problems: consecutive integers, money, distance, age, mixture.
 * @fileoverview Generates linear word problems with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-04-18
 */
export function generateLinearWordProblem(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["consecutive_integers","money","distance","age","mixture"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,20);
	let expectedFormat="Enter a number";
	let correct="";
	let alternate="";
	let display="";
	let problemText="";
	let choices:string[]=[];
	switch(type){
		case "consecutive_integers":{
			let n=Math.floor(Math.random()*maxVal)+1;
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
			let quarters=Math.floor(Math.random()*5)+2;
			let dimes=Math.floor(Math.random()*5)+2;
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
			let rate=Math.floor(Math.random()*30)+20;
			let time=Math.floor(Math.random()*3)+2;
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
			let now=Math.floor(Math.random()*20)+10;
			let past=Math.floor(Math.random()*5)+2;
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
			let total=Math.floor(Math.random()*20)+10;
			let percent=Math.floor(Math.random()*30)+20;
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
		default:
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let textContainer=document.createElement("div");
	textContainer.textContent=problemText;
	textContainer.classList.add("problem-text");
	questionArea.appendChild(textContainer);
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=`\\[ \\text{Answer: } \\]`;
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