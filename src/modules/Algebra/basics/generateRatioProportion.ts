import {questionArea} from "../../../script.js";
import {gcd, getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a ratio/proportion question (simplify ratio, solve proportion, map scale, or unit rate).
 * @param difficulty - Optional difficulty level to adjust the range of numbers.
 * @returns void
 */
export function generateRatioProportion(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["ratio", "proportion", "scale", "unit_rate"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty, 20);
	let hint="";
	switch (type){
		case "ratio":{
			let a=Math.floor(Math.random()*maxVal)+1;
			let b=Math.floor(Math.random()*maxVal)+1;
			questionArea.innerHTML=`Simplify the ratio \\( ${a}:${b} \\) to lowest terms.`;
			let g=gcd(a,b);
			window.correctAnswer={
				correct: `${a/g}:${b/g}`,
				alternate: `${a/g}/${b/g}`
			};
			hint="Enter as a:b or a/b";
			break;
		}
		case "proportion":{
			let a=Math.floor(Math.random()*5)+2;
			let b=Math.floor(Math.random()*5)+2;
			let c=Math.floor(Math.random()*10)+5;
			let x=Math.round(c*a/b);
			questionArea.innerHTML=`Solve for x: \\( \\frac{${a}}{${b}}=\\frac{${c}}{x} \\)`;
			window.correctAnswer={
				correct: x.toString(),
				alternate: x.toString()
			};
			hint="Enter a number";
			break;
		}
		case "scale":{
			let map=Math.floor(Math.random()*10)+1;
			let actual=Math.floor(Math.random()*50)+10;
			let scaled=Math.round(actual/map);
			questionArea.innerHTML=`On a map with scale 1:${map}, a distance measures ${scaled} cm. What is the actual distance in cm?`;
			window.correctAnswer={
				correct: actual.toString(),
				alternate: actual.toString()
			};
			hint="Enter a number";
			break;
		}
		case "unit_rate":{
			let quantity=Math.floor(Math.random()*100)+20;
			let units=Math.floor(Math.random()*10)+2;
			let rate=Math.round(quantity/units);
			questionArea.innerHTML=`If ${quantity} items cost $${units}, what is the unit price? (nearest cent)`;
			window.correctAnswer={
				correct: rate.toFixed(2),
				alternate: rate.toString()
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