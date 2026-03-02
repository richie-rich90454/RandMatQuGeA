import {questionArea} from "../../script.js";
// @ts-expect-error - latexToPlain is imported for potential future use
import {getMaxCoeff, latexToPlain} from "./calculusUtils.js";
export function generateIntegrationAdvanced(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["avgValue","areaBetweenX","areaBetweenY","areaMultiple","volumeCrossSquare","volumeCrossSemi","volumeDisc","volumeDiscOther","volumeWasher","volumeWasherOther","arcLength","parts","partialFractions","improper","selectTechnique","diffEqModel","verifySolution","slopeField","euler","separationGeneral","separationParticular","exponentialModel","logisticModel"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	switch (questionType){
		case "avgValue": {
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Average value of } f(x)=x^2 \\text{ on } [${b},${a}]. \\]`;
			plainCorrectAnswer=(((a*a*a - b*b*b)/3) / (a - b)).toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "areaBetweenX": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\text{Area between } y=x^2 \\text{ and } y=${a}x. \\]`;
			let intersect=a;
			plainCorrectAnswer=((intersect*intersect*intersect) / 6).toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "areaBetweenY":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Area between } x=y^2 \\text{ and } x=y+${a}. \\]`;
			let intersect1= (1-Math.sqrt(1+4*a))/2;
			let intersect2= (1+Math.sqrt(1+4*a))/2;
			let area= Math.abs((intersect2**3/3 + a*intersect2**2/2) - (intersect1**3/3 + a*intersect1**2/2));
			plainCorrectAnswer=area.toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "areaMultiple":{
			mathExpression=`\\[ \\text{Area between } y=\\sin x \\text{ and } y=\\cos x \\text{ from } 0 \\text{ to } 2\\pi. \\]`;
			plainCorrectAnswer="4";
			expectedFormat="Enter a number";
			break;
		}
		case "volumeCrossSquare":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Base: } y=x^2, y=${a}. \\text{ Cross sections perpendicular to y-axis are squares. Volume?} \\]`;
			plainCorrectAnswer=((a**2)/2).toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "volumeCrossSemi":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Base: } y=x^2, y=${a}. \\text{ Cross sections perpendicular to x-axis are semicircles. Volume?} \\]`;
			plainCorrectAnswer=(Math.PI/8*a**2).toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "volumeDisc":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Volume when } y=\\sqrt{x} \\text{ from } 0 \\text{ to } ${a} \\text{ revolved about x-axis.} \\]`;
			plainCorrectAnswer=(Math.PI*a*a /2).toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "volumeDiscOther":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Volume when } y=x^2, y=0, x=0 \\text{ to } ${a} \\text{ revolved about } y=-1. \\]`;
			plainCorrectAnswer=(Math.PI*(a**5/5 + 2*a**3/3 + a)).toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "volumeWasher": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\text{Volume when region between } y=x^2 \\text{ and } y=${a}x \\text{ revolved about x-axis.} \\]`;
			let intersect=a;
			plainCorrectAnswer=(Math.PI*(intersect**5 / 3 - intersect**5 / 5)).toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "volumeWasherOther": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\text{Volume when same region revolved about } y=-1. \\]`;
			let intersect=a; 
			plainCorrectAnswer=(Math.PI*((intersect**5 / 3 + 2*intersect**3 / 3 + intersect) - (intersect**5 / 5 + 2*intersect**3 / 3 + intersect))).toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "arcLength":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Length of } y=x^{3/2} \\text{ from } 0 \\text{ to } ${a}. \\]`;
			let len=(2/27)*( (9*a/4+1)**(3/2) -1);
			plainCorrectAnswer=len.toFixed(2);
			expectedFormat="Enter a number";
			break;
		}
		case "parts":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int x e^{${a}x} \\,dx \\]`;
			plainCorrectAnswer=`(1/${a})x e^(${a}x) - (1/${a*a}) e^(${a}x) + C`;
			expectedFormat="Enter expression";
			break;
		}
		case "partialFractions":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int \\frac{1}{x^2-${a}} \\,dx \\]`;
			plainCorrectAnswer=`(1/(2*${Math.sqrt(a)})) ln| (x-${Math.sqrt(a)})/(x+${Math.sqrt(a)}) | + C`;
			expectedFormat="Enter expression";
			break;
		}
		case "improper":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int_1^\\infty \\frac{1}{x^{${a}}} \\,dx \\]`;
			plainCorrectAnswer= a>1 ? (1/(a-1)).toFixed(2) : "diverges";
			expectedFormat="Enter number or 'diverges'";
			break;
		}
		case "selectTechnique":{
			let options=["Substitution", "Partial fractions", "Integration by parts", "Trig substitution"];
			let correctIdx=Math.floor(Math.random()*options.length);
			plainCorrectAnswer=options[correctIdx];
			mathExpression=`\\[ \\int \\frac{dx}{\\sqrt{4-x^2}} \\] Best technique? A) ${options[0]} B) ${options[1]} C) ${options[2]} D) ${options[3]}`;
			expectedFormat="Enter letter";
			break;
		}
		case "diffEqModel": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\text{Rate of growth proportional to population with constant ${a}. Write DE.} \\]`;
			plainCorrectAnswer=`dP/dt=${a}P`;
			expectedFormat="Enter equation";
			break;
		}
		case "verifySolution":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Verify } y=e^{${a}x} \\text{ solves } y''-${a*a}y=0. \\]`;
			plainCorrectAnswer="yes";
			expectedFormat="Enter yes or no";
			break;
		}
		case "slopeField":{
			mathExpression=`\\[ \\frac{dy}{dx}=x-y \\text{ at } (0,0). \\]`;
			plainCorrectAnswer="slope 0";
			expectedFormat="Describe slope";
			break;
		}
		case "euler": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\frac{dy}{dx}=x+${a}y, y(1)=0, \\text{ step }0.1, \\text{ approximate } y(1.2). \\]`;
			let y=0;
			let x=1;
			for (let i=0; i < 2; i++) {
				y += 0.1*(x + a*y);
				x += 0.1;
			}
			plainCorrectAnswer=y.toFixed(3);
			expectedFormat="Enter number";
			break;
		}
		case "separationGeneral":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\frac{dy}{dx}=${a}xy \\]`;
			plainCorrectAnswer=`y=C e^(${a/2}x^2)`;
			expectedFormat="Enter expression";
			break;
		}
		case "separationParticular": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\frac{dy}{dx}=${a}xy, y(0)=1 \\]`;
			plainCorrectAnswer=`y=e^(${a/2}x^2)`;
			expectedFormat="Enter expression";
			break;
		}
		case "exponentialModel":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Half-life } ${a} \\text{ years, find decay constant.} \\]`;
			plainCorrectAnswer=(Math.LN2/a).toFixed(3);
			expectedFormat="Enter number";
			break;
		}
		case "logisticModel":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Carrying capacity } ${a}0, \\text{ growth rate }0.5, \\text{ write logistic DE.} \\]`;
			plainCorrectAnswer=`dP/dt=0.5P(1 - P/${a}0)`;
			expectedFormat="Enter equation";
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