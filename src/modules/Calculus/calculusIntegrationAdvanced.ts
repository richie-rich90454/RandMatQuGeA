/**
 * Generates a random advanced integration or differential equations question.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * This function randomly selects a topic from a comprehensive list covering
 * applications of integration (average value, area between curves, volumes,
 * arc length), advanced integration techniques (integration by parts, partial
 * fractions, improper integrals), and differential equations (modeling,
 * verification, slope fields, Euler's method, separation of variables,
 * exponential and logistic models), plus additional topics: logistic model full analysis,
 * improper integrals with vertical asymptote, polar arc length, parametric arc length,
 * and completing the square before inverse trig integration.
 * It constructs a LaTeX expression for the problem, computes the correct answer
 * (as a plain‑text string), appends the formatted question to the global `questionArea`
 * element, triggers MathJax rendering, and sets global variables for answer validation.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`)
 *                     that influences the maximum coefficient value used in
 *                     generated expressions. If omitted, a default moderate value
 *                     is used (via `getMaxCoeff` from `./calculusUtils.js`).
 * @returns void
 * @date 2026-04-02
 *
 * @example
 * generateIntegrationAdvanced();
 * generateIntegrationAdvanced("hard");
 */
import {questionArea} from "../../script.js";
// @ts-expect-error - latexToPlain is imported for potential future use
import {getMaxCoeff, latexToPlain} from "./calculusUtils.js";
export function generateIntegrationAdvanced(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["avgValue","areaBetweenX","areaBetweenY","areaMultiple","volumeCrossSquare","volumeCrossSemi","volumeDisc","volumeDiscOther","volumeWasher","volumeWasherOther","arcLength","parts","partialFractions","improper","selectTechnique","diffEqModel","verifySolution","slopeField","euler","separationGeneral","separationParticular","exponentialModel","logisticModel","logisticFullAnalysis","improperVerticalAsymptote","polarArcLength","parametricArcLength","completingSquareInverseTrig"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	let choices: string[]=[];
	switch (questionType){
		case "avgValue": {
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			if (a<b){ let t=a; a=b; b=t; }
			mathExpression=`\\[ \\text{Average value of } f(x)=x^2 \\text{ on } [${b},${a}]. \\]`;
			let val=(((a*a*a - b*b*b)/3) / (a - b));
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((correctNum*1.1).toFixed(2));
			choices.push(((a*a + b*b)/2).toFixed(2));
			break;
		}
		case "areaBetweenX": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\text{Area between } y=x^2 \\text{ and } y=${a}x. \\]`;
			let intersect=a;
			let val=(intersect*intersect*intersect) / 6;
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((correctNum*1.5).toFixed(2));
			choices.push(((intersect*intersect)/2).toFixed(2));
			break;
		}
		case "areaBetweenY":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Area between } x=y^2 \\text{ and } x=y+${a}. \\]`;
			let intersect1= (1-Math.sqrt(1+4*a))/2;
			let intersect2= (1+Math.sqrt(1+4*a))/2;
			let area=Math.abs((intersect2**2/2 + a*intersect2 - intersect2**3/3) - (intersect1**2/2 + a*intersect1 - intersect1**3/3));
			plainCorrectAnswer=area.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((correctNum*0.8).toFixed(2));
			choices.push(((intersect2-intersect1)*a).toFixed(2));
			break;
		}
		case "areaMultiple":{
			mathExpression=`\\[ \\text{Area between } y=\\sin x \\text{ and } y=\\cos x \\text{ from } 0 \\text{ to } 2\\pi. \\]`;
			let correctVal=4*Math.sqrt(2);
			plainCorrectAnswer=correctVal.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum-1).toFixed(2));
			choices.push((correctNum+1).toFixed(2));
			choices.push((4).toFixed(2));
			choices.push((2*Math.sqrt(2)).toFixed(2));
			break;
		}
		case "volumeCrossSquare":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Base: } y=x^2, y=${a}. \\text{ Cross sections perpendicular to y-axis are squares. Volume?} \\]`;
			let val=2*a*a;
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((a*a).toFixed(2));
			choices.push((4*a*a).toFixed(2));
			break;
		}
		case "volumeCrossSemi":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Base: } y=x^2, y=${a}. \\text{ Cross sections perpendicular to x-axis are semicircles. Volume?} \\]`;
			let val=(2*Math.PI/15)*Math.pow(a, 2.5);
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((Math.PI/8*Math.pow(a,2.5)).toFixed(2));
			choices.push((Math.PI/5*Math.pow(a,2.5)).toFixed(2));
			break;
		}
		case "volumeDisc":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Volume when } y=\\sqrt{x} \\text{ from } 0 \\text{ to } ${a} \\text{ revolved about x-axis.} \\]`;
			let val=Math.PI*a*a /2;
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((Math.PI*a).toFixed(2));
			choices.push((Math.PI*a*a/3).toFixed(2));
			break;
		}
		case "volumeDiscOther":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Volume when } y=x^2, y=0, x=0 \\text{ to } ${a} \\text{ revolved about } y=-1. \\]`;
			let val=Math.PI*(a**5/5 + 2*a**3/3 + a);
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((Math.PI*(a**5/5 + a**3/3 + a)).toFixed(2));
			choices.push((Math.PI*(a**5/5 + a)).toFixed(2));
			break;
		}
		case "volumeWasher": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\text{Volume when region between } y=x^2 \\text{ and } y=${a}x \\text{ revolved about x-axis.} \\]`;
			let intersect=a;
			let val=Math.PI*(intersect**5 / 3 - intersect**5 / 5);
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((Math.PI*intersect**5/3).toFixed(2));
			choices.push((Math.PI*intersect**5/5).toFixed(2));
			break;
		}
		case "volumeWasherOther": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\text{Volume when same region revolved about } y=-1. \\]`;
			let intersect=a; 
			let val=Math.PI*((intersect**5 / 3 + 2*intersect**3 / 3 + intersect) - (intersect**5 / 5 + 2*intersect**3 / 3 + intersect));
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((Math.PI*intersect**5/3).toFixed(2));
			choices.push((Math.PI*intersect**5/5).toFixed(2));
			break;
		}
		case "arcLength":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Length of } y=x^{3/2} \\text{ from } 0 \\text{ to } ${a}. \\]`;
			let len=(8/27)*(Math.pow(1 + 9*a/4, 1.5) - 1);
			plainCorrectAnswer=len.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((Math.pow(1+9*a/4,1.5)).toFixed(2));
			choices.push((a*Math.sqrt(1+9*a/4)).toFixed(2));
			break;
		}
		case "parts":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int x e^{${a}x} \\,dx \\]`;
			plainCorrectAnswer=`(1/${a})x e^(${a}x) - (1/${a*a}) e^(${a}x) + C`;
			latexAnswer=`\\frac{1}{${a}}x e^{${a}x} - \\frac{1}{${a*a}} e^{${a}x} + C`;
			expectedFormat="Enter expression";
			let normalizedCorrect=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`(1/${a})x e^(${a}x) + C`.replace(/\s/g,"").toLowerCase());
			choices.push(`(1/${a}) e^(${a}x) + C`.replace(/\s/g,"").toLowerCase());
			choices.push(`(1/${a})x e^(${a}x) - (1/${a}) e^(${a}x) + C`.replace(/\s/g,"").toLowerCase());
			choices.push(`(1/${a})x^2 e^(${a}x) + C`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "partialFractions":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let sqrtA=Math.sqrt(a).toFixed(2);
			mathExpression=`\\[ \\int \\frac{1}{x^2-${a}} \\,dx \\]`;
			plainCorrectAnswer=`(1/(2*${sqrtA})) ln| (x-${sqrtA})/(x+${sqrtA}) | + C`;
			latexAnswer=`\\frac{1}{2\\sqrt{${a}}} \\ln\\left|\\frac{x-\\sqrt{${a}}}{x+\\sqrt{${a}}}\\right| + C`;
			expectedFormat="Enter expression";
			let normalizedCorrect=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`(1/(2*${sqrtA})) ln| (x-${sqrtA})/(x-${sqrtA}) | + C`.replace(/\s/g,"").toLowerCase());
			choices.push(`(1/(2*${sqrtA})) ln| (x+${sqrtA})/(x-${sqrtA}) | + C`.replace(/\s/g,"").toLowerCase());
			choices.push(`(1/(2*${sqrtA})) ln| x^2-${a} | + C`.replace(/\s/g,"").toLowerCase());
			choices.push(`(1/(2*${a})) ln| (x-${sqrtA})/(x+${sqrtA}) | + C`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "improper":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int_1^\\infty \\frac{1}{x^{${a}}} \\,dx \\]`;
			if (a>1){
				let val=(1/(a-1)).toFixed(2);
				plainCorrectAnswer=val;
				latexAnswer=val;
				let correctNum=parseFloat(plainCorrectAnswer);
				choices=[plainCorrectAnswer];
				choices.push((correctNum+1).toFixed(2));
				choices.push((correctNum-1).toFixed(2));
				choices.push((1/(a)).toFixed(2));
				choices.push("diverges");
			}
			else{
				plainCorrectAnswer="diverges";
				latexAnswer="\\text{diverges}";
				choices=["diverges","converges to 1","converges to 0","diverges to infinity"];
			}
			expectedFormat="Enter number or 'diverges'";
			break;
		}
		case "selectTechnique":{
			let options=["Substitution", "Partial fractions", "Integration by parts", "Trig substitution"];
			let correctIdx=Math.floor(Math.random()*options.length);
			plainCorrectAnswer=options[correctIdx];
			latexAnswer=`\\text{${options[correctIdx]}}`;
			mathExpression=`\\[ \\int \\frac{dx}{\\sqrt{4-x^2}} \\] Best technique? A) ${options[0]} B) ${options[1]} C) ${options[2]} D) ${options[3]}`;
			expectedFormat="Enter letter";
			choices=[options[correctIdx]];
			for (let i=0;i<options.length;i++) if (i!==correctIdx) choices.push(options[i]);
			break;
		}
		case "diffEqModel": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\text{Rate of growth proportional to population with constant ${a}. Write DE.} \\]`;
			plainCorrectAnswer=`dP/dt=${a}P`;
			latexAnswer=`\\frac{dP}{dt}=${a}P`;
			expectedFormat="Enter equation";
			let normalizedCorrect=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`dP/dt=${a}`.replace(/\s/g,"").toLowerCase());
			choices.push(`dP/dt=P+${a}`.replace(/\s/g,"").toLowerCase());
			choices.push(`dP/dt=${a}/P`.replace(/\s/g,"").toLowerCase());
			choices.push(`dP/dt=${a}t`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "verifySolution":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Verify } y=e^{${a}x} \\text{ solves } y''-${a*a}y=0. \\]`;
			plainCorrectAnswer="yes";
			latexAnswer="\\text{yes}";
			expectedFormat="Enter yes or no";
			choices=["yes","no","maybe","only if x=0"];
			break;
		}
		case "slopeField":{
			mathExpression=`\\[ \\frac{dy}{dx}=x-y \\text{ at } (0,0). \\]`;
			plainCorrectAnswer="slope 0";
			latexAnswer="\\text{slope }0";
			expectedFormat="Describe slope";
			choices=["slope 0","slope 1","slope -1","slope undefined"];
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
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.1).toFixed(3));
			choices.push((correctNum-0.1).toFixed(3));
			choices.push((correctNum*1.1).toFixed(3));
			choices.push((correctNum*0.9).toFixed(3));
			break;
		}
		case "separationGeneral":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\frac{dy}{dx}=${a}xy \\]`;
			let halfA=(a/2).toFixed(2);
			plainCorrectAnswer=`y=C e^(${halfA}x^2)`;
			latexAnswer=`y=Ce^{\\frac{${a}}{2}x^{2}}`;
			expectedFormat="Enter expression";
			let normalizedCorrect=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`y=C e^(${halfA}x)`.replace(/\s/g,"").toLowerCase());
			choices.push(`y=C e^(${a}x^2)`.replace(/\s/g,"").toLowerCase());
			choices.push(`y=C x^${halfA}`.replace(/\s/g,"").toLowerCase());
			choices.push(`y=C e^(${halfA}x^2)+1`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "separationParticular": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\frac{dy}{dx}=${a}xy, y(0)=1 \\]`;
			let halfA=(a/2).toFixed(2);
			plainCorrectAnswer=`y=e^(${halfA}x^2)`;
			latexAnswer=`y=e^{\\frac{${a}}{2}x^{2}}`;
			expectedFormat="Enter expression";
			let normalizedCorrect=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`y=e^(${halfA}x)`.replace(/\s/g,"").toLowerCase());
			choices.push(`y=e^(${a}x^2)`.replace(/\s/g,"").toLowerCase());
			choices.push(`y=x^${halfA}`.replace(/\s/g,"").toLowerCase());
			choices.push(`y=e^(${halfA}x^2)+1`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "exponentialModel":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Half-life } ${a} \\text{ years, find decay constant.} \\]`;
			let val=Math.LN2/a;
			plainCorrectAnswer=val.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.05).toFixed(3));
			choices.push((correctNum-0.05).toFixed(3));
			choices.push((Math.LN2/(a+1)).toFixed(3));
			choices.push((Math.LN2/(a-1)).toFixed(3));
			break;
		}
		case "logisticModel":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Carrying capacity } ${a}0, \\text{ growth rate }0.5, \\text{ write logistic DE.} \\]`;
			plainCorrectAnswer=`dP/dt=0.5P(1 - P/${a}0)`;
			latexAnswer=`\\frac{dP}{dt}=0.5P\\left(1-\\frac{P}{${a}0}\\right)`;
			expectedFormat="Enter equation";
			let normalizedCorrect=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`dP/dt=0.5P`.replace(/\s/g,"").toLowerCase());
			choices.push(`dP/dt=0.5P(1 - P/${a}0)`.replace(/\s/g,"").toLowerCase());
			choices.push(`dP/dt=0.5P(1 - ${a}0/P)`.replace(/\s/g,"").toLowerCase());
			choices.push(`dP/dt=0.5P(1 - P)`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "logisticFullAnalysis":{
			let K=Math.floor(Math.random()*maxCoeff*2)+20;
			let r=0.05;
			let P0=Math.floor(K/10)+5;
			mathExpression=`\\[ \\text{The population of a fish farm follows } \\frac{dP}{dt}=${r}P\\left(1-\\frac{P}{${K}}\\right),\\ P(0)=${P0}. \\] \\[ \\text{(a) What is the carrying capacity? (b) When is the population growing fastest? (c) Find } \\lim_{t\\to\\infty} P(t). \\]`;
			let fastest=K/2;
			plainCorrectAnswer=`K=${K}, fastest at P=${fastest.toFixed(1)}, limit=${K}`;
			latexAnswer=`K=${K},\\ \\text{fastest at }P=${fastest.toFixed(1)},\\ \\lim_{t\\to\\infty}P(t)=${K}`;
			expectedFormat="Enter K, fastest P, limit";
			choices=[plainCorrectAnswer];
			choices.push(`K=${K-5}, fastest at P=${fastest.toFixed(1)}, limit=${K}`);
			choices.push(`K=${K}, fastest at P=${(fastest+10).toFixed(1)}, limit=${K}`);
			choices.push(`K=${K}, fastest at P=${fastest.toFixed(1)}, limit=${K-10}`);
			break;
		}
		case "improperVerticalAsymptote":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int_0^1 \\frac{1}{\\sqrt{${a*a}-x^2}} \\,dx \\]`;
			let val=Math.PI/2;
			plainCorrectAnswer=val.toFixed(4);
			latexAnswer=`\\frac{\\pi}{2}`;
			expectedFormat="Enter number or π/2";
			choices=[plainCorrectAnswer, (val+0.5).toFixed(4), (val-0.5).toFixed(4), "diverges"];
			break;
		}
		case "polarArcLength":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Find the length of the polar curve } r=${a}(1+\\cos\\theta) \\text{ from } \\theta=0 \\text{ to } \\theta=\\pi. \\]`;
			let len=4*a;
			plainCorrectAnswer=len.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer, (len+1).toFixed(2), (len-1).toFixed(2), (len*1.5).toFixed(2)];
			break;
		}
		case "parametricArcLength":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Find the arc length of } x=t^${a+1},\\ y=t^${a} \\text{ from } t=0 \\text{ to } t=1. \\]`;
			let val=(8/27)*(Math.pow(1+9/4,1.5)-1);
			let len=val*a;
			plainCorrectAnswer=len.toFixed(4);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.5).toFixed(4));
			choices.push((correctNum-0.5).toFixed(4));
			choices.push((correctNum*1.2).toFixed(4));
			break;
		}
		case "completingSquareInverseTrig":{
			let a=Math.floor(Math.random()*maxCoeff)+2;
			mathExpression=`\\[ \\int \\frac{dx}{\\sqrt{${2*a}x - x^2}} \\]`;
			plainCorrectAnswer=`arcsin((x-${a})/${a})+C`;
			latexAnswer=`\\arcsin\\left(\\frac{x-${a}}{${a}}\\right)+C`;
			expectedFormat="Enter expression";
			let normalizedCorrect=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`arcsin(x/${a})+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`arcsin((x-${a})/${2*a})+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`arctan((x-${a})/${a})+C`.replace(/\s/g,"").toLowerCase());
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
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(plainCorrectAnswer)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=plainCorrectAnswer;
		else uniqueChoices=[plainCorrectAnswer];
	}
	window.correctAnswer={
		correct: plainCorrectAnswer,
		alternate: plainCorrectAnswer,
		display: latexAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat=expectedFormat;
}