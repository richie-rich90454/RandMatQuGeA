/**
 * Generates and displays a random question involving parametric equations, polar coordinates, or vector-valued functions.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, or `"hard"`).
 *                     Influences the maximum coefficient value used in generated expressions
 *                     (via `getMaxCoeff`). If omitted, a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a question type from a predefined list.
 * 3. Constructs a LaTeX expression and a plain‑text correct answer based on the selected type.
 * 4. Appends a `<div>` containing the LaTeX to `questionArea`.
 * 5. Triggers MathJax (if available) to render the math.
 * 6. Sets two global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct` and `alternate` properties (both equal to the answer).
 *    - `window.expectedFormat` – a string describing the expected input format (e.g., "Enter number").
 *
 * **Question types** (each uses random coefficients scaled by `difficulty`):
 * - `parametricDeriv`     – first derivative dy/dx of a parametric curve at a given t.
 * - `parametricSecond`    – second derivative d²y/dx² of a parametric curve at a given t.
 * - `arcLengthParam`      – arc length of a simple linear parametric curve.
 * - `vectorDeriv`         – derivative of a vector‑valued function r(t) = ⟨t², e^(at)⟩.
 * - `vectorIntegral`      – definite integral of a vector‑valued function from 0 to 1.
 * - `motionParam`         – speed of a particle given by r(t) = ⟨cos(at), sin(at)⟩.
 * - `polarDeriv`          – slope dy/dx of a polar curve r = 1 + a cos θ at θ = π/2.
 * - `polarArea`           – area enclosed by a limaçon r = 1 + a cos θ.
 * - `polarAreaBetween`    – area inside one polar curve and outside another.
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getMaxCoeff` (imported from `./calculusUtils.js`) – provides the coefficient limit.
 * - `window.MathJax` – optional; if present, `MathJax.typesetPromise` is called.
 *
 * @example
 * ```typescript
 * // Generate a question with default difficulty
 * generateParametricPolarVector();
 *
 * // Generate a hard question
 * generateParametricPolarVector("hard");
 * ```
 */
import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";
export function generateParametricPolarVector(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["parametricDeriv","parametricSecond","arcLengthParam","vectorDeriv","vectorIntegral","motionParam","polarDeriv","polarArea","polarAreaBetween"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	switch (questionType){
		case "parametricDeriv":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let t=Math.floor(Math.random()*3)+1;
			mathExpression=`\\[ x=${a}t^2+1,\\ y=t^3-${b}t, \\text{ find } \\frac{dy}{dx} \\text{ at } t=${t}. \\]`;
			let dx=2*a*t;
			let dy=3*t*t - b;
			let deriv=dy/dx;
			plainCorrectAnswer=deriv.toFixed(3);
			expectedFormat="Enter number";
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
			expectedFormat="Enter number";
			break;
		}
		case "arcLengthParam":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let t0=0;
			let t1=Math.floor(Math.random()*3)+2;
			mathExpression=`\\[ x=${a}t,\\ y=${a}t, \\text{ length from } t=${t0} \\text{ to } t=${t1}. \\]`;
			let len=Math.sqrt(2)*a*(t1-t0);
			plainCorrectAnswer=len.toFixed(3);
			expectedFormat="Enter number";
			break;
		}
		case "vectorDeriv":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\mathbf{r}(t)=\\langle t^2, e^{${a}t} \\rangle, \\text{ find } \\mathbf{r}'(t). \\]`;
			plainCorrectAnswer=`<2t, ${a}e^(${a}t)>`;
			expectedFormat="Enter vector";
			break;
		}
		case "vectorIntegral":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int_0^1 \\mathbf{r}(t)\\,dt \\text{ for } \\mathbf{r}(t)=\\langle t, ${a}t^2 \\rangle. \\]`;
			let intX=0.5;
			let intY=a/3;
			plainCorrectAnswer=`<${intX.toFixed(3)}, ${intY.toFixed(3)}>`;
			expectedFormat="Enter vector";
			break;
		}
		case "motionParam":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\mathbf{r}(t)=\\langle \\cos(${a}t), \\sin(${a}t) \\rangle, \\text{ find speed.} \\]`;
			let speed=a;
			plainCorrectAnswer=speed.toString();
			expectedFormat="Enter number";
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
			expectedFormat="Enter number";
			break;
		}
		case "polarArea":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Area inside } r=1+${a}\\cos\\theta. \\]`;
			let area=Math.PI*(1 + a*a/2);
			plainCorrectAnswer=area.toFixed(3);
			expectedFormat="Enter number";
			break;
		}
		case "polarAreaBetween":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Area inside } r=${a} \\text{ and outside } r=${a}(1-\\cos\\theta). \\]`;
			let area=a*a*(2 - Math.PI/2);
			plainCorrectAnswer=area.toFixed(3);
			expectedFormat="Enter number";
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