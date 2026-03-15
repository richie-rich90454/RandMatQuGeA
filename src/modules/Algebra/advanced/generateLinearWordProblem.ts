/**
 * Linear word problems: consecutive integers, money, distance, age, mixture.
 * @fileoverview Generates linear word problems. Sets window.correctAnswer with correct result and display.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateLinearWordProblem(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["consecutive_integers","money","distance","age","mixture"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,20);
	let hint="";
	switch (type){
		case "consecutive_integers":{
			let n=Math.floor(Math.random()*maxVal)+1;
			let sum=n+(n+1);
			questionArea.innerHTML=`The sum of two consecutive integers is ${sum}. Find the smaller integer.`;
			window.correctAnswer={
				correct: n.toString(),
				alternate: n.toString(),
				display: n.toString()
			};
			hint="Enter a whole number";
			break;
		}
		case "money":{
			let quarters=Math.floor(Math.random()*5)+2;
			let dimes=Math.floor(Math.random()*5)+2;
			let total=quarters*25+dimes*10;
			questionArea.innerHTML=`You have ${quarters} quarters and ${dimes} dimes. How much money do you have in cents?`;
			window.correctAnswer={
				correct: total.toString(),
				alternate: total.toString(),
				display: total.toString()
			};
			hint="Enter a number (cents)";
			break;
		}
		case "distance":{
			let rate=Math.floor(Math.random()*30)+20;
			let time=Math.floor(Math.random()*3)+2;
			let dist=rate*time;
			questionArea.innerHTML=`A car travels at ${rate} mph for ${time} hours. How far does it travel?`;
			window.correctAnswer={
				correct: dist.toString(),
				alternate: dist.toString(),
				display: dist.toString()
			};
			hint="Enter a number (miles)";
			break;
		}
		case "age":{
			let now=Math.floor(Math.random()*20)+10;
			let past=Math.floor(Math.random()*5)+2;
			let ago=now-past;
			questionArea.innerHTML=`A person is ${now} years old. How old were they ${past} years ago?`;
			window.correctAnswer={
				correct: ago.toString(),
				alternate: ago.toString(),
				display: ago.toString()
			};
			hint="Enter a number";
			break;
		}
		case "mixture":{
			let total=Math.floor(Math.random()*20)+10;
			let percent=Math.floor(Math.random()*30)+20;
			let amount=Math.round(total*percent/100);
			questionArea.innerHTML=`A ${total} gallon mixture contains ${percent}% alcohol. How many gallons of alcohol are in it?`;
			window.correctAnswer={
				correct: amount.toString(),
				alternate: amount.toString(),
				display: amount.toString()
			};
			hint="Enter a number (gallons)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}