import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateRadicalSimplify(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["simplify", "add", "subtract", "multiply", "divide", "rationalize"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty, 20);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "simplify":{
			let radicand=a*a*b;
			questionArea.innerHTML=`Simplify: \\( \\sqrt{${radicand}} \\)`;
			window.correctAnswer={
				correct: `${a}\\sqrt{${b}}`,
				alternate: `${a}√${b}`
			};
			hint="Enter as a√b";
			break;
		}
		case "add":{
			questionArea.innerHTML=`Simplify: \\( ${a}\\sqrt{${b}} + ${c}\\sqrt{${b}} \\)`;
			let coeff=a+c;
			window.correctAnswer={
				correct: `${coeff}\\sqrt{${b}}`,
				alternate: `${coeff}√${b}`
			};
			hint="Enter as a√b";
			break;
		}
		case "subtract":{
			questionArea.innerHTML=`Simplify: \\( ${a}\\sqrt{${b}} - ${c}\\sqrt{${b}} \\)`;
			let coeff=a-c;
			window.correctAnswer={
				correct: `${coeff}\\sqrt{${b}}`,
				alternate: `${coeff}√${b}`
			};
			hint="Enter as a√b";
			break;
		}
		case "multiply":{
			questionArea.innerHTML=`Multiply: \\( \\sqrt{${a}} \\times \\sqrt{${b}} \\)`;
			let product=a*b;
			window.correctAnswer={
				correct: `\\sqrt{${product}}`,
				alternate: `√${product}`
			};
			hint="Enter as √n";
			break;
		}
		case "divide":{
			questionArea.innerHTML=`Divide: \\( \\frac{\\sqrt{${a}}}{\\sqrt{${b}}} \\)`;
			let quotient=a/b;
			window.correctAnswer={
				correct: `\\sqrt{${quotient}}`,
				alternate: `√${quotient}`
			};
			hint="Enter as √n";
			break;
		}
		case "rationalize":{
			questionArea.innerHTML=`Rationalize: \\( \\frac{1}{\\sqrt{${a}}} \\)`;
			window.correctAnswer={
				correct: `\\frac{\\sqrt{${a}}}{${a}}`,
				alternate: `√${a}/${a}`
			};
			hint="Enter as √a/a";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}