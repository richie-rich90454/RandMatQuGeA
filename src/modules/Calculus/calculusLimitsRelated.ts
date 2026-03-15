/**
 * Generates and displays a random limit question in the global `questionArea`.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, or `"hard"`).
 *                     Influences the maximum coefficient value used in generated expressions
 *                     (via `getMaxCoeff`). If omitted, a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a limit type from a predefined list.
 * 3. Constructs a LaTeX expression and a plain‑text correct answer based on the selected type.
 * 4. Appends a `<div>` containing the LaTeX to `questionArea`.
 * 5. Triggers MathJax (if available) to render the math.
 * 6. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, and `display` properties.
 *      `correct` and `alternate` hold the plain‑text answer for validation;
 *      `display` holds a LaTeX‑formatted version for rendering with KaTeX.
 *    - `window.expectedFormat` – a string describing the expected input format.
 *
 * **Limit types**:
 * - `polynomial` – limit of a quadratic polynomial at a random point.
 * - `rational`   – limit of a simple rational function at a random point (answer may be decimal).
 * - `infinity`   – limit of a rational function as x → ∞ (leading coefficient ratio).
 * - `trig`       – fundamental limit lim_{x→0} sin(x)/x = 1.
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getMaxCoeff` (imported from `./calculusUtils.js`) – provides the coefficient limit.
 * - `window.MathJax` – optional; if present, `MathJax.typesetPromise` is called.
 *
 * @example
 * ```typescript
 * // Generate a limit question with default difficulty
 * generateLimit();
 *
 * // Generate a hard limit question
 * generateLimit("hard");
 * ```
 */
import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";
export function generateLimit(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["polynomial", "rational", "infinity", "trig"];
	let type=types[Math.floor(Math.random()*types.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let maxCoeff=getMaxCoeff(difficulty);
	switch (type){
		case "polynomial":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*10)-5;
			let x0=Math.floor(Math.random()*5);
			let limit=a*x0*x0+c;
			mathExpression=`\\[ \\lim_{x \\to ${x0}} (${a}x^2+${c}) \\]`;
			plainCorrectAnswer=limit.toString();
			latexAnswer=plainCorrectAnswer;
			break;
		}
		case "rational":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let x0=Math.floor(Math.random()*5)+1;
			let limit=(a*x0+1)/(b*x0-1);
			mathExpression=`\\[ \\lim_{x \\to ${x0}} \\frac{${a}x+1}{${b}x-1} \\]`;
			plainCorrectAnswer=limit.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			break;
		}
		case "infinity":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x \\to \\infty} \\frac{${a}x^2+x}{x^2-1} \\]`;
			plainCorrectAnswer=a.toString();
			latexAnswer=plainCorrectAnswer;
			break;
		}
		case "trig":{
			mathExpression=`\\[ \\lim_{x \\to 0} \\frac{\\sin(x)}{x} \\]`;
			plainCorrectAnswer="1";
			latexAnswer="1";
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
	if (type==="rational"){
		let a=Math.floor(Math.random()*maxCoeff)+1;
		let b=Math.floor(Math.random()*maxCoeff)+1;
		let x0=Math.floor(Math.random()*5)+1;
		window.correctAnswer={
			correct: plainCorrectAnswer,
			alternate: `${a*x0+1}/${b*x0-1}`,
			display: latexAnswer
		};
		window.expectedFormat="Enter a decimal number (e.g., 2.5) or a fraction (e.g., 7/3)";
	}
	else{
		window.correctAnswer={
			correct: plainCorrectAnswer,
			alternate: plainCorrectAnswer,
			display: latexAnswer
		};
		window.expectedFormat="Enter a number";
	}
}

/**
 * Generates and displays a random related rates problem in the global `questionArea`.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, or `"hard"`).
 *                     Scales the numerical values in the problem (ladder length, distances,
 *                     rates, etc.) via `getMaxCoeff`. If omitted, a moderate default is used.
 * @returns void
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a related rates scenario.
 * 3. Constructs descriptive problem text and a LaTeX expression for the unknown rate.
 * 4. Appends the problem text (with class `"problem-text"`) followed by a `<div>` containing the LaTeX.
 * 5. Triggers MathJax (if available) to render the math.
 * 6. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, and `display` properties.
 *      `correct` and `alternate` hold the plain‑text answer for validation;
 *      `display` holds a LaTeX‑formatted version for rendering with KaTeX.
 *    - `window.expectedFormat` – a string describing the expected input format (including units).
 *
 * **Problem types**:
 * - `ladder` – classic ladder against a wall: given bottom distance and its rate,
 *              find the rate at which the top slides down.
 * - `cone`   – conical tank: given radius and height, and rate of radius increase,
 *              find the rate of change of volume.
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getMaxCoeff` (imported from `./calculusUtils.js`) – provides the scaling factor.
 * - `window.MathJax` – optional; if present, `MathJax.typesetPromise` is called.
 *
 * @example
 * ```typescript
 * // Generate a related rates question with default difficulty
 * generateRelatedRates();
 *
 * // Generate an easy related rates question
 * generateRelatedRates("easy");
 * ```
 */
export function generateRelatedRates(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["ladder", "cone"];
	let type=types[Math.floor(Math.random()*types.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let problemText="";
	let scale=getMaxCoeff(difficulty);
	switch (type){
		case "ladder":{
			let ladder=10*scale/5;
			let x=6*scale/5;
			let dx_dt=2*scale/5;
			let y=Math.sqrt(ladder*ladder-x*x);
			let dy_dt=-(x/y)*dx_dt;
			problemText=`A ${ladder.toFixed(1)}-ft ladder leans against a wall. The bottom is ${x.toFixed(1)} ft from the wall, moving away at ${dx_dt.toFixed(1)} ft/s. Find the rate at which the top is sliding down.`;
			mathExpression=`\\[ \\frac{dy}{dt}=? \\]`;
			plainCorrectAnswer=dy_dt.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			break;
		}
		case "cone":{
			let r=3*scale/5;
			let h=9*scale/5;
			let dr_dt=0.5*scale/5;
			let dV_dt=Math.PI*r*h*dr_dt;
			problemText=`A conical tank has radius ${r.toFixed(1)} ft and height ${h.toFixed(1)} ft. The radius increases at ${dr_dt.toFixed(2)} ft/s. Find the rate of change of volume.`;
			mathExpression=`\\[ \\frac{dV}{dt}=? \\]`;
			plainCorrectAnswer=dV_dt.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			break;
		}
	}
	let textContainer=document.createElement("div");
	textContainer.textContent=problemText;
	textContainer.classList.add("problem-text");
	questionArea.appendChild(textContainer);
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
		alternate: plainCorrectAnswer,
		display: latexAnswer
	};
	if (type==="ladder"){
		window.expectedFormat="Enter a number (ft/s, e.g., -1.5)";
	}
	else{
		window.expectedFormat="Enter a number (ft³/s, e.g., 42.41)";
	}
}