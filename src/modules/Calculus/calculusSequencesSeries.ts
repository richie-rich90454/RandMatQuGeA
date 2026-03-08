import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";
export function generateSequencesSeries(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["integralTest","pSeries","comparisonTest","alternatingTest","ratioTest","absCond","altError","taylorPoly","lagrangeError","radiusInterval","maclaurin","powerSeries"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	switch (questionType){
		case "integralTest":{
			let p=Math.floor(Math.random()*3)+2;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{1}{n^2+${p}} \\text{ use integral test.} \\]`;
			plainCorrectAnswer="converges";
			expectedFormat="Enter converges or diverges";
			break;
		}
		case "pSeries":{
			let p=(Math.random()*2).toFixed(1);
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{1}{n^{${p}}} \\text{ converges for?} \\]`;
			plainCorrectAnswer= parseFloat(p)>1 ? "converges" : "diverges";
			expectedFormat="Enter converges or diverges";
			break;
		}
		case "comparisonTest":{
			let p=Math.floor(Math.random()*3)+2;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{1}{n^2+${p}} \\text{ compare to } \\sum \\frac{1}{n^2}. \\]`;
			plainCorrectAnswer="converges";
			expectedFormat="Enter converges or diverges";
			break;
		}
		case "alternatingTest":{
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n} \\text{ converges?} \\]`;
			plainCorrectAnswer="conditionally";
			expectedFormat="Enter absolutely, conditionally, or diverges";
			break;
		}
		case "ratioTest":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{${a}^n}{n!} \\text{ use ratio test.} \\]`;
			plainCorrectAnswer="converges";
			expectedFormat="Enter converges or diverges";
			break;
		}
		case "absCond":{
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n^3} \\text{ classify.} \\]`;
			plainCorrectAnswer="absolutely";
			expectedFormat="Enter absolutely, conditionally, or diverges";
			break;
		}
		case "altError":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n^${a}} \\text{ error using first 3 terms.} \\]`;
			let error=1/Math.pow(4, a);
			plainCorrectAnswer=error.toFixed(4);
			expectedFormat="Enter number";
			break;
		}
		case "taylorPoly":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{3rd degree Taylor for } e^{${a}x} \\text{ at } x=0. \\]`;
			plainCorrectAnswer=`1 + ${a}x + ${a*a/2}x^2 + ${a*a*a/6}x^3`;
			expectedFormat="Enter polynomial";
			break;
		}
		case "lagrangeError":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let xVal=0.5;
			let error=Math.pow(a,4) * Math.exp(a*xVal) * Math.pow(xVal,4) / 24;
			mathExpression=`\\[ \\text{Max error using 3rd Taylor for } e^{${a}x} \\text{ at } x=${xVal}. \\]`;
			plainCorrectAnswer=error.toFixed(4);
			expectedFormat="Enter number";
			break;
		}
		case "radiusInterval":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=0}^\\infty \\frac{x^n}{${a}^n} \\text{ interval of convergence.} \\]`;
			plainCorrectAnswer=`(-${a}, ${a})`;
			expectedFormat="Enter interval";
			break;
		}
		case "maclaurin":{
			mathExpression=`\\[ \\text{Maclaurin series for } \\sin x. \\]`;
			plainCorrectAnswer="x - x^3/3! + x^5/5! - ...";
			expectedFormat="Enter series";
			break;
		}
		case "powerSeries":{
			mathExpression=`\\[ \\frac{1}{1-x} \\text{ as power series.} \\]`;
			plainCorrectAnswer="∑ x^n, |x|<1";
			expectedFormat="Enter series";
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
		correct: plainCorrectAnswer,
		alternate: plainCorrectAnswer
	};
	window.expectedFormat=expectedFormat;
}