import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a unit conversion question (US length, metric length, area, volume, or multi‑step).
 * @param difficulty - Optional difficulty level to adjust the value range.
 * @returns void
 */
export function generateUnitConversion(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["length_us", "length_metric", "area", "volume", "multi_step"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty, 50);
	let hint="";
	let value=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "length_us":{
			let conversions=[
				{from:"ft", to:"in", factor:12},
				{from:"yd", to:"ft", factor:3},
				{from:"mi", to:"ft", factor:5280}
			];
			let c=conversions[Math.floor(Math.random()*conversions.length)];
			let result=value*c.factor;
			questionArea.innerHTML=`Convert \\( ${value} \\text{ ${c.from}} \\) to \\( \\text{${c.to}} \\).`;
			window.correctAnswer={
				correct: result.toString(),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "length_metric":{
			let conversions=[
				{from:"m", to:"cm", factor:100},
				{from:"km", to:"m", factor:1000},
				{from:"cm", to:"mm", factor:10}
			];
			let c=conversions[Math.floor(Math.random()*conversions.length)];
			let result=value*c.factor;
			questionArea.innerHTML=`Convert \\( ${value} \\text{ ${c.from}} \\) to \\( \\text{${c.to}} \\).`;
			window.correctAnswer={
				correct: result.toString(),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "area":{
			let value2=Math.floor(Math.random()*10)+1;
			let result=value2*9;
			questionArea.innerHTML=`Convert \\( ${value2} \\text{ yd}^2 \\) to \\( \\text{ft}^2 \\). (1 yd=3 ft)`;
			window.correctAnswer={
				correct: result.toString(),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "volume":{
			let value2=Math.floor(Math.random()*5)+1;
			let result=value2*1000;
			questionArea.innerHTML=`Convert \\( ${value2} \\text{ L} \\) to \\( \\text{mL} \\).`;
			window.correctAnswer={
				correct: result.toString(),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "multi_step":{
			let value2=Math.floor(Math.random()*10)+1;
			let result=value2*12*3;
			questionArea.innerHTML=`Convert \\( ${value2} \\text{ yd} \\) to \\( \\text{in} \\). (1 yd=3 ft, 1 ft=12 in)`;
			window.correctAnswer={
				correct: result.toString(),
				alternate: result.toString()
			};
			hint="Enter a number";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}