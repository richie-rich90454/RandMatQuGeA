import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateScientificNotation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["to_standard", "to_scientific", "multiply", "divide"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty, 1000);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*3)+1;
	switch (type){
		case "to_standard":{
			let sci=`${a} \\times 10^{${b}}`;
			let std=a*Math.pow(10, b);
			questionArea.innerHTML=`Convert to standard notation: \\( ${sci} \\)`;
			window.correctAnswer={
				correct: std.toString(),
				alternate: std.toString()
			};
			hint="Enter a number";
			break;
		}
		case "to_scientific":{
			let std=a*100;
			let sci=std.toExponential(1).replace('e+', '×10^');
			questionArea.innerHTML=`Write in scientific notation: \\( ${std} \\)`;
			window.correctAnswer={
				correct: sci,
				alternate: sci
			};
			hint="Enter as a×10^b";
			break;
		}
		case "multiply":{
			let sci1=`(${a} \\times 10^{${b}})`;
			let sci2=`(${a} \\times 10^{${b+1}})`;
			let product=a*a*Math.pow(10, 2*b+1);
			questionArea.innerHTML=`Multiply: \\( ${sci1} \\times ${sci2} \\)`;
			window.correctAnswer={
				correct: product.toExponential(2).replace('e+', '×10^'),
				alternate: product.toString()
			};
			hint="Enter in scientific notation";
			break;
		}
		case "divide":{
			let sci1=`(${a} \\times 10^{${b+1}})`;
			let sci2=`(${a} \\times 10^{${b}})`;
			let quotient=10;
			questionArea.innerHTML=`Divide: \\( \\frac{${sci1}}{${sci2}} \\)`;
			window.correctAnswer={
				correct: quotient.toString(),
				alternate: quotient.toString()
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