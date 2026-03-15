/**
 * Generates a percentage question (percent of, increase, decrease, simple interest, or markup).
 * @fileoverview Percentage calculations. Sets window.correctAnswer with numeric result.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generatePercent(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["percent_of","increase","decrease","interest","markup"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,100);
	let hint="";
	let percent=Math.floor(Math.random()*50)+10;
	let whole=Math.floor(Math.random()*maxVal)+10;
	let part=Math.round(whole*percent/100);
	switch (type){
		case "percent_of":{
			questionArea.innerHTML=`What is \\( ${percent}\\% \\) of \\( ${whole} \\)?`;
			let ans=part.toString();
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number";
			break;
		}
		case "increase":{
			let increase=Math.floor(Math.random()*50)+5;
			let newVal=whole+Math.round(whole*increase/100);
			let ans=newVal.toString();
			questionArea.innerHTML=`If \\( ${whole} \\) increases by \\( ${increase}\\% \\), what is the new value?`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number";
			break;
		}
		case "decrease":{
			let decrease=Math.floor(Math.random()*30)+5;
			let newVal=whole-Math.round(whole*decrease/100);
			let ans=newVal.toString();
			questionArea.innerHTML=`If \\( ${whole} \\) decreases by \\( ${decrease}\\% \\), what is the new value?`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number";
			break;
		}
		case "interest":{
			let principal=Math.floor(Math.random()*1000)+500;
			let rate=(Math.random()*5+2).toFixed(1);
			let time=Math.floor(Math.random()*3)+1;
			let interest=Math.round(principal*parseFloat(rate)/100*time);
			let ans=interest.toString();
			questionArea.innerHTML=`Simple interest on \\( $${principal} \\) at \\( ${rate}\\% \\) for \\( ${time} \\) years?`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a whole number (nearest dollar)";
			break;
		}
		case "markup":{
			let cost=Math.floor(Math.random()*50)+10;
			let markup=Math.floor(Math.random()*40)+20;
			let price=cost+Math.round(cost*markup/100);
			let ans=price.toString();
			questionArea.innerHTML=`A store buys an item for \\( $${cost} \\) and marks it up \\( ${markup}\\% \\). What is the selling price?`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number (nearest dollar)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}