import {questionArea} from "../../script.js";
// @ts-expect-error - latexToPlain is imported for potential future use
import {getMaxCoeff, latexToPlain} from "./calculusUtils.js";
export function generateLimitsContinuity(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["limitNotation","limitFromTable","limitProperties","limitManipulation","limitSqueeze","discontinuityType","continuityConditions","continuityInterval","removeDiscontinuity","verticalAsymptote","horizontalAsymptote","ivt","selectProcedure"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	switch (questionType){
		case "limitNotation":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*5);
			mathExpression=`\\[ \\text{Use limit notation to describe the behavior of } f(x)=\\frac{${a}x^2-${b}}{x-${c}} \\text{ as } x \\to ${c}. \\]`;
			plainCorrectAnswer=`\\lim_{x\\to ${c}} f(x)=${a*c+b}`;
			expectedFormat="Enter the limit statement, e.g., \\lim_{x\\to 2} f(x)=5";
			break;
		}
		case "limitFromTable":{
			let x0=Math.floor(Math.random()*3)+2;
			let values: number[]=[];
			for (let i=0; i<5; i++){
				values.push(Math.random()*10);
			}
			let tableStr="";
			for (let i=0; i<5; i++){
				tableStr+=`x=${x0-2+i} & f(x)=${values[i].toFixed(2)}\\\\`;
			}
			mathExpression=`\\[ \\text{Given the table:} \\begin{array}{c|c} ${tableStr} \\end{array} \\text{ estimate } \\lim_{x\\to ${x0}} f(x). \\]`;
			plainCorrectAnswer=values[2].toFixed(2);
			expectedFormat="Enter a decimal number";
			break;
		}
		case "limitProperties":{
			let limF=Math.floor(Math.random()*10)+1;
			let limG=Math.floor(Math.random()*10)+1;
			let coeff1=Math.floor(Math.random()*maxCoeff)+1;
			let coeff2=Math.floor(Math.random()*maxCoeff)+1;
			let result=coeff1*limF+coeff2*limG;
			mathExpression=`\\[ \\text{If } \\lim_{x\\to 3}f(x)=${limF} \\text{ and } \\lim_{x\\to 3}g(x)=${limG}, \\text{ find } \\lim_{x\\to 3}[${coeff1}f(x)+${coeff2}g(x)]. \\]`;
			plainCorrectAnswer=result.toString();
			expectedFormat="Enter a number";
			break;
		}
		case "limitManipulation":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*5)+1;
			mathExpression=`\\[ \\lim_{x\\to ${c}} \\frac{${a}x-${a*c}}{${b}\\sqrt{x}-${b}\\sqrt{${c}}} \\]`;
			plainCorrectAnswer=((a*2*Math.sqrt(c)) / b).toString();
			expectedFormat="Enter a number (e.g., 4)";
			break;
		}
		case "limitSqueeze":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x\\to 0} x^${a} \\cos\\left(\\frac{1}{x}\\right) \\]`;
			plainCorrectAnswer="0";
			expectedFormat="Enter 0";
			break;
		}
		case "discontinuityType":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=\\frac{${a}x^2-${b}}{x-${Math.sqrt(b/a)}} \\]`;
			plainCorrectAnswer="removable";
			expectedFormat="Enter removable, jump, or infinite";
			break;
		}
		case "continuityConditions":{
			mathExpression=`\\[ \\text{State the three conditions for continuity at } x=c. \\]`;
			plainCorrectAnswer="f(c) defined, limit exists, limit equals f(c)";
			expectedFormat="Enter the three conditions separated by commas";
			break;
		}
		case "continuityInterval":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Find the interval(s) where } f(x)=\\sqrt{${a}-x^2} \\text{ is continuous.} \\]`;
			plainCorrectAnswer=`[-${Math.sqrt(a)},${Math.sqrt(a)}]`;
			expectedFormat="Enter interval like [-2,2]";
			break;
		}
		case "removeDiscontinuity": {
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*5)+1;
			mathExpression=`\\[ \\text{Define } f(${c}) \\text{ so that } f(x)=\\frac{${a}x^2-${a*c*c}}{x-${c}} \\text{ is continuous at } x=${c}. \\]`;
			plainCorrectAnswer=(2*a*c).toString();
			expectedFormat="Enter a number";
			break;
		}
		case "verticalAsymptote":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Find vertical asymptotes of } f(x)=\\frac{${a}x+1}{x^2-${b}}. \\]`;
			plainCorrectAnswer=`x=${Math.sqrt(b)}, x=-${Math.sqrt(b)}`;
			expectedFormat="Enter equations like x=2, x=-2";
			break;
		}
		case "horizontalAsymptote":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x\\to\\infty} \\frac{${a}x^2-${b}}{${a}x^2+1} \\]`;
			plainCorrectAnswer="1";
			expectedFormat="Enter a number";
			break;
		}
		case "ivt":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Show that } f(x)=x^3-${a}x-${b} \\text{ has a root in } [1,2]. \\]`;
			plainCorrectAnswer="f(1)<0, f(2)>0, so IVT applies";
			expectedFormat="Explain briefly";
			break;
		}
		case "selectProcedure":{
			let options=["Factoring", "Rationalizing", "Squeeze theorem", "Direct substitution"];
			let correctIdx=Math.floor(Math.random()*options.length);
			plainCorrectAnswer=options[correctIdx];
			mathExpression=`\\[ \\lim_{x\\to 0} \\frac{\\sin ${maxCoeff}x}{x} \\] Which procedure is most efficient? A) ${options[0]} B) ${options[1]} C) ${options[2]} D) ${options[3]}`;
			expectedFormat="Enter the letter of the correct option (A, B, C, or D)";
			break;
		}
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	window.correctAnswer={
		correct: plainCorrectAnswer.replace(/\s+/g, "").toLowerCase(),
		alternate: plainCorrectAnswer
	};
	window.expectedFormat=expectedFormat;
}