import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";
export function generateApplicationsDiff(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["linearization","lhopital","mvt","evt","incDec","firstDerivativeTest","candidatesTest","concavity","secondDerivativeTest","graphSketch","connecting","optimization","implicitBehavior"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	switch (questionType){
		case "linearization":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let x0=Math.floor(Math.random()*5)+1;
			let approx=Math.sqrt(a*x0+b);
			mathExpression=`\\[ \\text{Use linear approximation to estimate } \\sqrt{${a*x0+b+0.1}}. \\]`;
			plainCorrectAnswer=approx.toFixed(3);
			expectedFormat="Enter a decimal";
			break;
		}
		case "lhopital":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x\\to 0} \\frac{e^{${a}x}-1}{x} \\]`;
			plainCorrectAnswer=a.toString();
			expectedFormat="Enter a number";
			break;
		}
		case "mvt":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=x^3-${a}x \\text{ on } [-1,1]. \\text{ Find } c \\text{ satisfying MVT.} \\]`;
			let c=Math.sqrt((1+a)/3);
			plainCorrectAnswer=c.toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "evt":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Find critical points of } f(x)=x^3-${a}x^2+2 \\text{ on } [0,3]. \\]`;
			let cp1=0;
			let cp2=(2*a)/3;
			plainCorrectAnswer=`${cp1}, ${cp2.toFixed(2)}`;
			expectedFormat="Enter numbers separated by commas";
			break;
		}
		case "incDec":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Intervals where } f(x)=x^3-${a}x^2+1 \\text{ is increasing.} \\]`;
			let cp=2*a/3;
			plainCorrectAnswer=`(${cp.toFixed(2)}, \\infty)`;
			expectedFormat="Enter interval like (1, infinity)";
			break;
		}
		case "firstDerivativeTest":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=x^4-${a}x^3. \\text{ Classify critical points.} \\]`;
			plainCorrectAnswer="x=0 local max, x="+(3*a/4).toFixed(2)+" local min";
			expectedFormat="Describe";
			break;
		}
		case "candidatesTest":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=x^3-${a}x \\text{ on } [0,3]. \\text{ Find absolute max.} \\]`;
			let maxVal=Math.max(0, 27-3*a, Math.pow(Math.sqrt(a/3),3)-a*Math.sqrt(a/3));
			plainCorrectAnswer=maxVal.toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "concavity":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=x^3-${a}x^2. \\text{ Intervals of concavity.} \\]`;
			let inflection=a/3;
			plainCorrectAnswer=`down on (-\\infty, ${inflection.toFixed(2)}), up on (${inflection.toFixed(2)}, \\infty)`;
			expectedFormat="Describe";
			break;
		}
		case "secondDerivativeTest":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=x^3-${a}x. \\text{ Use second derivative test at } x=0. \\]`;
			plainCorrectAnswer="inconclusive";
			expectedFormat="Enter max, min, or inconclusive";
			break;
		}
		case "graphSketch":{
			mathExpression=`\\[ \\text{Given } f'(x)>0 \\text{ for } x<2, f'(x)<0 \\text{ for } x>2, f''(x)>0 \\text{ for all } x, \\text{ sketch } f. \\]`;
			plainCorrectAnswer="increasing concave up then decreasing concave up";
			expectedFormat="Describe";
			break;
		}
		case "connecting":{
			mathExpression=`\\[ \\text{If } f'(x)>0 \\text{ and } f''(x)<0 \\text{ for all } x, \\text{ what is true?} \\]`;
			plainCorrectAnswer="f increasing, concave down";
			expectedFormat="Describe";
			break;
		}
		case "optimization":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Two numbers sum to } ${a}. \\text{ Maximize product.} \\]`;
			plainCorrectAnswer=(a/2).toString()+", "+(a/2).toString();
			expectedFormat="Enter two numbers separated by comma";
			break;
		}
		case "implicitBehavior":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Slope of tangent to } x^2+y^2=${a} \\text{ at } (1,${Math.sqrt(a-1).toFixed(2)}). \\]`;
			plainCorrectAnswer=(-1/Math.sqrt(a-1)).toFixed(2);
			expectedFormat="Enter a number";
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