/**
 * Scientific notation: convert to standard, to scientific, multiply, divide.
 * @fileoverview Generates scientific notation questions. Sets window.correctAnswer with correct result and display.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

function formatScientific(value: number, precision: number): { mantissa: number; exponent: number }{
	let exponent=Math.floor(Math.log10(Math.abs(value)));
	let mantissa=value/Math.pow(10,exponent);
	mantissa=Number(mantissa.toFixed(precision));
	if (Math.abs(mantissa)>=10){
		mantissa/=10;
		exponent++;
	}
	else if (Math.abs(mantissa)<1 && mantissa!==0){
		mantissa*=10;
		exponent--;
	}
	return { mantissa, exponent };
}
export function generateScientificNotation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["to_standard","to_scientific","multiply","divide"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,1000);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*3)+1;
	switch (type){
		case "to_standard":{
			let sci=`${a} \\times 10^{${b}}`;
			let std=a*Math.pow(10,b);
			questionArea.innerHTML=`Convert to standard notation: \\( ${sci} \\)`;
			window.correctAnswer={
				correct: std.toString(),
				alternate: std.toString(),
				display: std.toString()
			};
			hint="Enter a number";
			break;
		}
		case "to_scientific":{
			let std=a*100;
			let sciFormatted=formatScientific(std,1);
			let displaySci=`${sciFormatted.mantissa} \\times 10^{${sciFormatted.exponent}}`;
			let correctSci=std.toExponential(1);
			questionArea.innerHTML=`Write in scientific notation: \\( ${std} \\)`;
			window.correctAnswer={
				correct: correctSci,
				alternate: correctSci,
				display: displaySci
			};
			hint="Enter as a×10^b (e.g., 1.2e3 or 1.2×10^3)";
			break;
		}
		case "multiply":{
			let sci1=`(${a} \\times 10^{${b}})`;
			let sci2=`(${a} \\times 10^{${b+1}})`;
			let product=a*a*Math.pow(10,2*b+1);
			let sciFormatted=formatScientific(product,2);
			let displaySci=`${sciFormatted.mantissa} \\times 10^{${sciFormatted.exponent}}`;
			let correctSci=product.toExponential(2);
			questionArea.innerHTML=`Multiply: \\( ${sci1} \\times ${sci2} \\)`;
			window.correctAnswer={
				correct: correctSci,
				alternate: product.toString(),
				display: displaySci
			};
			hint="Enter in scientific notation (e.g., 1.23e4)";
			break;
		}
		case "divide":{
			let sci1=`(${a} \\times 10^{${b+1}})`;
			let sci2=`(${a} \\times 10^{${b}})`;
			let quotient=10;
			questionArea.innerHTML=`Divide: \\( \\frac{${sci1}}{${sci2}} \\)`;
			window.correctAnswer={
				correct: quotient.toString(),
				alternate: quotient.toString(),
				display: quotient.toString()
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