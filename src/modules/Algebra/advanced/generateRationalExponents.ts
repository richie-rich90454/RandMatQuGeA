import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generateRationalExponents(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["convert_to_radical", "convert_to_exponent", "evaluate"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty, 5);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+2;
	let m=Math.floor(Math.random()*2)+2;
	let n=Math.floor(Math.random()*2)+2;
	switch (type){
		case "convert_to_radical":{
			questionArea.innerHTML=`Write \\( x^{${m}/${n}} \\) in radical form.`;
			window.correctAnswer={
				correct: `\\sqrt[${n}]{x^{${m}}}`,
				alternate: `x^(${m}/${n})`
			};
			hint="Enter as n√(x^m)";
			break;
		}
		case "convert_to_exponent":{
			questionArea.innerHTML=`Write \\( \\sqrt[${n}]{x^{${m}}} \\) using a rational exponent.`;
			window.correctAnswer={
				correct: `x^{${m}/${n}}`,
				alternate: `x^(${m}/${n})`
			};
			hint="Enter as x^(m/n)";
			break;
		}
		case "evaluate":{
			let base=a;
			let exponent=m/n;
			let result=Math.pow(base, exponent).toFixed(2);
			questionArea.innerHTML=`Evaluate: \\( ${a}^{${m}/${n}} \\)`;
			window.correctAnswer={
				correct: result,
				alternate: result
			};
			hint="Enter a decimal";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}