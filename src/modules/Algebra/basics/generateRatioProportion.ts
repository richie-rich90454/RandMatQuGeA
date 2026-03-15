/**
 * Generates a ratio/proportion question (simplify ratio, solve proportion, map scale, or unit rate).
 * @fileoverview Ratios, proportions, scales, unit rates. Sets window.correctAnswer with numeric or plain ratio.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {gcd, getMaxForDifficulty} from "../algebraUtils.js";

export function generateRatioProportion(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["ratio","proportion","scale","unit_rate"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,20);
	let hint="";
	switch (type){
		case "ratio":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			questionArea.innerHTML=`Simplify the ratio \\( ${a}:${b} \\) to lowest terms.`;
			let g=gcd(a,b);
			let plain=`${a/g}:${b/g}`;
			window.correctAnswer={
				correct: plain,
				alternate: `${a/g}/${b/g}`,
				display: plain
			};
			hint="Enter as a:b or a/b";
			break;
		}
		case "proportion":{
			let a=Math.floor(Math.random()*5)+2;
			let b=Math.floor(Math.random()*5)+2;
			let c=Math.floor(Math.random()*10)+5;
			let x=Math.round(c*a/b);
			let ans=x.toString();
			questionArea.innerHTML=`Solve for x: \\( \\frac{${a}}{${b}}=\\frac{${c}}{x} \\)`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number";
			break;
		}
		case "scale":{
			let map=Math.floor(Math.random()*10)+1;
			let actual=Math.floor(Math.random()*50)+10;
			let scaled=Math.round(actual/map);
			let ans=actual.toString();
			questionArea.innerHTML=`On a map with scale 1:${map}, a distance measures ${scaled} cm. What is the actual distance in cm?`;
			window.correctAnswer={
				correct: ans,
				alternate: ans,
				display: ans
			};
			hint="Enter a number";
			break;
		}
		case "unit_rate":{
			let quantity=Math.floor(Math.random()*100)+20;
			let units=Math.floor(Math.random()*10)+2;
			let rate=Math.round(quantity/units);
			let ans=rate.toFixed(2);
			questionArea.innerHTML=`If ${quantity} items cost $${units}, what is the unit price? (nearest cent)`;
			window.correctAnswer={
				correct: ans,
				alternate: rate.toString(),
				display: ans
			};
			hint="Enter a number (e.g., 2.50)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}