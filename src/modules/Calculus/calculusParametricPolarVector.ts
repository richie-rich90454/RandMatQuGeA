import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";
/**
 * Generates and displays a random question involving parametric equations, polar coordinates, or vector-valued functions.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, or `"hard"`).
 *                     Influences the maximum coefficient value used in generated expressions
 *                     (via `getMaxCoeff`). If omitted, a moderate default is used.
 * @returns void
 * @date 2026-04-18
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a question type from a predefined list.
 * 3. Constructs a LaTeX expression and a plain‑text correct answer based on the selected type,
 *    along with plausible distractors for MCQ mode.
 * 4. Appends a `<div>` containing the LaTeX to `questionArea`.
 * 5. Triggers MathJax (if available) to render the math.
 * 6. Sets global variables for answer validation.
 *
 * **Question types** (each uses random coefficients scaled by `difficulty`):
 * - `parametricDeriv`         – first derivative dy/dx of a parametric curve at a given t.
 * - `parametricSecond`        – second derivative d²y/dx² of a parametric curve at a given t.
 * - `arcLengthParam`          – arc length of a simple linear parametric curve.
 * - `vectorDeriv`             – derivative of a vector‑valued function r(t) = ⟨t², e^(at)⟩.
 * - `vectorIntegral`          – definite integral of a vector‑valued function from 0 to 1.
 * - `motionParam`             – speed of a particle given by r(t) = ⟨cos(at), sin(at)⟩.
 * - `polarDeriv`              – slope dy/dx of a polar curve r = 1 + a cos θ at θ = π/2.
 * - `polarArea`               – area enclosed by a limaçon r = 1 + a cos θ.
 * - `polarAreaBetween`        – area inside one polar curve and outside another.
 * - `polarArcLength`          – arc length of a polar curve r = a(1+cosθ) from 0 to π.
 * - `parametricArcLengthGeneral` – arc length of a non‑linear parametric curve x = t³, y = t².
 * - `polarAreaBetweenGeneral` – area between two polar curves r = a + b cos θ and r = a.
 * - `vectorDotDeriv`          – derivative of dot product of two vector‑valued functions.
 *
 * @example
 * generateParametricPolarVector();
 * generateParametricPolarVector("hard");
 */
export function generateParametricPolarVector(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["parametricDeriv","parametricSecond","arcLengthParam","vectorDeriv","vectorIntegral","motionParam","polarDeriv","polarArea","polarAreaBetween","polarArcLength","parametricArcLengthGeneral","polarAreaBetweenGeneral","vectorDotDeriv"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	let choices: string[]=[];
	switch(questionType){
		case "parametricDeriv":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let t=Math.floor(Math.random()*3)+1;
			mathExpression=`\\[ x=${a}t^2+1,\\ y=t^3-${b}t, \\text{ find } \\frac{dy}{dx} \\text{ at } t=${t}. \\]`;
			let dx=2*a*t;
			let dy=3*t*t - b;
			let deriv=dy/dx;
			plainCorrectAnswer=deriv.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((deriv+0.1).toFixed(3));
			choices.push((deriv-0.1).toFixed(3));
			choices.push((dy/dx*dx).toFixed(3));
			choices.push((dy/dx/dx).toFixed(3));
			break;
		}
		case "parametricSecond":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let t=Math.floor(Math.random()*3)+1;
			mathExpression=`\\[ x=t^2,\\ y=t^3-${a}t, \\text{ find } \\frac{d^2y}{dx^2} \\text{ at } t=${t}. \\]`;
			let dx=2*t;
			let dy=3*t*t - a;
			let ddx=2;
			let ddy=6*t;
			let second=(ddy*dx - dy*ddx)/(dx*dx*dx);
			plainCorrectAnswer=second.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((second+0.1).toFixed(3));
			choices.push((second-0.1).toFixed(3));
			choices.push((dy/dx).toFixed(3));
			choices.push((dy/dx/dx).toFixed(3));
			break;
		}
		case "arcLengthParam":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let t0=0;
			let t1=Math.floor(Math.random()*3)+2;
			mathExpression=`\\[ x=${a}t,\\ y=${a}t, \\text{ length from } t=${t0} \\text{ to } t=${t1}. \\]`;
			let len=Math.sqrt(2)*a*(t1-t0);
			plainCorrectAnswer=len.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((len+0.5).toFixed(3));
			choices.push((len-0.5).toFixed(3));
			choices.push((a*(t1-t0)).toFixed(3));
			choices.push((Math.sqrt(2)*a).toFixed(3));
			break;
		}
		case "vectorDeriv":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\mathbf{r}(t)=\\langle t^2, e^{${a}t} \\rangle, \\text{ find } \\mathbf{r}'(t). \\]`;
			plainCorrectAnswer=`<2t, ${a}e^(${a}t)>`;
			latexAnswer=`\\langle 2t,\\ ${a}e^{${a}t} \\rangle`;
			expectedFormat="Enter vector";
			let correctNorm=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[correctNorm];
			choices.push(`<2t, e^(${a}t)>`.replace(/\s/g,"").toLowerCase());
			choices.push(`<2, ${a}e^(${a}t)>`.replace(/\s/g,"").toLowerCase());
			choices.push(`<2t, ${a}e^(${a}t) + C>`.replace(/\s/g,"").toLowerCase());
			choices.push(`<t^2, ${a}e^(${a}t)>`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "vectorIntegral":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int_0^1 \\mathbf{r}(t)\\,dt \\text{ for } \\mathbf{r}(t)=\\langle t, ${a}t^2 \\rangle. \\]`;
			let intX=0.5;
			let intY=a/3;
			plainCorrectAnswer=`<${intX.toFixed(3)}, ${intY.toFixed(3)}>`;
			latexAnswer=`\\langle ${intX.toFixed(3)},\\ ${intY.toFixed(3)} \\rangle`;
			expectedFormat="Enter vector";
			let correctNorm=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[correctNorm];
			choices.push(`<0.5, ${a/2}>`.replace(/\s/g,"").toLowerCase());
			choices.push(`<1, ${a}>`.replace(/\s/g,"").toLowerCase());
			choices.push(`<0.5, ${a}>`.replace(/\s/g,"").toLowerCase());
			choices.push(`<1, ${a/3}>`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "motionParam":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\mathbf{r}(t)=\\langle \\cos(${a}t), \\sin(${a}t) \\rangle, \\text{ find speed.} \\]`;
			let speed=a;
			plainCorrectAnswer=speed.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((a+1).toString());
			choices.push((a-1).toString());
			choices.push((a*a).toString());
			choices.push("1");
			break;
		}
		case "polarDeriv":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let theta=Math.PI/2;
			mathExpression=`\\[ r=1+${a}\\cos\\theta, \\text{ find } \\frac{dy}{dx} \\text{ at } \\theta=\\frac{\\pi}{2}. \\]`;
			let dr=-a*Math.sin(theta);
			let r=1+a*Math.cos(theta);
			let dx_dtheta= dr*Math.cos(theta) - r*Math.sin(theta);
			let dy_dtheta= dr*Math.sin(theta) + r*Math.cos(theta);
			let deriv=dy_dtheta/dx_dtheta;
			plainCorrectAnswer=deriv.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((deriv+0.1).toFixed(3));
			choices.push((deriv-0.1).toFixed(3));
			choices.push((dy_dtheta).toFixed(3));
			choices.push((dx_dtheta).toFixed(3));
			break;
		}
		case "polarArea":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Area inside } r=1+${a}\\cos\\theta. \\]`;
			let area=Math.PI*(1 + a*a/2);
			plainCorrectAnswer=area.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((area+1).toFixed(3));
			choices.push((area-1).toFixed(3));
			choices.push((Math.PI).toFixed(3));
			choices.push((Math.PI*a*a/2).toFixed(3));
			break;
		}
		case "polarAreaBetween":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Area inside } r=${a}(1-\\cos\\theta) \\text{ and outside } r=${a}. \\]`;
			let area=(Math.PI/2)*a*a;
			plainCorrectAnswer=area.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((area+1).toFixed(3));
			choices.push((area-1).toFixed(3));
			choices.push((Math.PI*a*a).toFixed(3));
			choices.push((Math.PI*a*a/4).toFixed(3));
			break;
		}
		case "polarArcLength":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Length of } r=${a}(1+\\cos\\theta),\\ 0\\le\\theta\\le\\pi. \\]`;
			let len=4*a;
			plainCorrectAnswer=len.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((len+1).toFixed(3));
			choices.push((len-1).toFixed(3));
			choices.push((2*a).toFixed(3));
			choices.push((Math.PI*a).toFixed(3));
			break;
		}
		case "parametricArcLengthGeneral":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Arc length of } x=${a}t^3,\\ y=${a}t^2,\\ 0\\le t\\le 1. \\]`;
			let len=a*(13*Math.sqrt(13)-8)/27;
			plainCorrectAnswer=len.toFixed(4);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.5).toFixed(4));
			choices.push((correctNum-0.5).toFixed(4));
			choices.push((correctNum*1.2).toFixed(4));
			choices.push((a*2).toFixed(4));
			break;
		}
		case "polarAreaBetweenGeneral":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			while(b>=a){
				b=Math.floor(Math.random()*maxCoeff)+1;
			}
			mathExpression=`\\[ \\text{Area inside } r=${a}+${b}\\cos\\theta \\text{ and outside } r=${a}. \\]`;
			let area=Math.PI*b*b/2;
			plainCorrectAnswer=area.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((area+1).toFixed(3));
			choices.push((area-1).toFixed(3));
			choices.push((Math.PI*a*a).toFixed(3));
			choices.push((Math.PI*b*b).toFixed(3));
			break;
		}
		case "vectorDotDeriv":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\mathbf{u}(t)=\\langle t, t^2 \\rangle,\\ \\mathbf{v}(t)=\\langle e^{${a}t}, \\sin(${b}t) \\rangle, \\text{ find } \\frac{d}{dt}(\\mathbf{u}\\cdot\\mathbf{v}). \\]`;
			let dotDeriv=`e^(${a}t) + ${a}*t*e^(${a}t) + 2*t*sin(${b}t) + ${b}*t^2*cos(${b}t)`;
			plainCorrectAnswer=dotDeriv;
			latexAnswer=`e^{${a}t} + ${a}te^{${a}t} + 2t\\sin(${b}t) + ${b}t^{2}\\cos(${b}t)`;
			expectedFormat="Enter expression";
			let correctNorm=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[correctNorm];
			choices.push(`e^(${a}t) + t^2*${b}cos(${b}t)`.replace(/\s/g,"").toLowerCase());
			choices.push(`2t*${a}e^(${a}t) + 2t*${b}cos(${b}t)`.replace(/\s/g,"").toLowerCase());
			choices.push(`e^(${a}t) + 2t*${a}e^(${a}t) + t^2*${b}cos(${b}t)`.replace(/\s/g,"").toLowerCase());
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	let found=false;
	for(let i=0;i<uniqueChoices.length;i++){
		if(uniqueChoices[i]===plainCorrectAnswer){
			found=true;
			break;
		}
	}
	if(!found){
		if(uniqueChoices.length>0){
			uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=plainCorrectAnswer;
		}
		else{
			uniqueChoices=[plainCorrectAnswer];
		}
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	window.correctAnswer={
		correct: plainCorrectAnswer,
		alternate: plainCorrectAnswer,
		display: latexAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat=expectedFormat;
}