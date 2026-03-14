import {questionArea} from "../../../script.js";
import {gcd, getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Generates a fraction arithmetic question (add, subtract, multiply, divide, simplify, or convert decimal to fraction).
 * @param difficulty - Optional difficulty level to adjust the range of numbers used.
 * @returns void
 */
export function generateFraction(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["add", "subtract", "multiply", "divide", "simplify", "convert"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty, 12);
	let hint="";
	let num1=Math.floor(Math.random()*maxVal)+1;
	let den1=Math.floor(Math.random()*(maxVal-1))+2;
	let num2=Math.floor(Math.random()*maxVal)+1;
	let den2=Math.floor(Math.random()*(maxVal-1))+2;
	switch (type){
		case "add":{
			let commonDen=den1*den2;
			let newNum1=num1*den2;
			let newNum2=num2*den1;
			let sumNum=newNum1+newNum2;
			let g=gcd(sumNum, commonDen);
			let simplified=`${sumNum/g}/${commonDen/g}`;
			questionArea.innerHTML=`Add: \\( \\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}} \\)`;
			window.correctAnswer={
				correct: simplified,
				alternate: `${sumNum}/${commonDen}`
			};
			hint="Enter as a fraction (e.g., 3/4)";
			break;
		}
		case "subtract":{
			let commonDen=den1*den2;
			let newNum1=num1*den2;
			let newNum2=num2*den1;
			let diffNum=newNum1-newNum2;
			let g=gcd(diffNum, commonDen);
			let simplified=`${diffNum/g}/${commonDen/g}`;
			questionArea.innerHTML=`Subtract: \\( \\frac{${num1}}{${den1}} - \\frac{${num2}}{${den2}} \\)`;
			window.correctAnswer={
				correct: simplified,
				alternate: `${diffNum}/${commonDen}`
			};
			hint="Enter as a fraction (e.g., 1/2)";
			break;
		}
		case "multiply":{
			let prodNum=num1*num2;
			let prodDen=den1*den2;
			let g=gcd(prodNum, prodDen);
			let simplified=`${prodNum/g}/${prodDen/g}`;
			questionArea.innerHTML=`Multiply: \\( \\frac{${num1}}{${den1}} \\times \\frac{${num2}}{${den2}} \\)`;
			window.correctAnswer={
				correct: simplified,
				alternate: `${prodNum}/${prodDen}`
			};
			hint="Enter as a fraction (e.g., 5/8)";
			break;
		}
		case "divide":{
			let quotNum=num1*den2;
			let quotDen=den1*num2;
			let g=gcd(quotNum, quotDen);
			let simplified=`${quotNum/g}/${quotDen/g}`;
			questionArea.innerHTML=`Divide: \\( \\frac{${num1}}{${den1}} \\div \\frac{${num2}}{${den2}} \\)`;
			window.correctAnswer={
				correct: simplified,
				alternate: `${quotNum}/${quotDen}`
			};
			hint="Enter as a fraction (e.g., 7/3)";
			break;
		}
		case "simplify":{
			let num=Math.floor(Math.random()*30)+2;
			let den=Math.floor(Math.random()*30)+2;
			let g=gcd(num, den);
			let simplified=`${num/g}/${den/g}`;
			questionArea.innerHTML=`Simplify: \\( \\frac{${num}}{${den}} \\)`;
			window.correctAnswer={
				correct: simplified,
				alternate: simplified
			};
			hint="Enter as a fraction in lowest terms";
			break;
		}
		case "convert":{
			let decimal=(Math.random()*10).toFixed(2);
			let fraction=`${Math.round(parseFloat(decimal)*100)}/100`;
			questionArea.innerHTML=`Convert \\( ${decimal} \\) to a fraction in simplest form.`;
			window.correctAnswer={
				correct: fraction,
				alternate: fraction
			};
			hint="Enter as a fraction (e.g., 3/4)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}