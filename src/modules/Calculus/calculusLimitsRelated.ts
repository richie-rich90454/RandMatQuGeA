import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";

/**
 * Generates and displays a random limit question in the global `questionArea`.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, or `"hard"`).
 *                     Influences the maximum coefficient value used in generated expressions
 *                     (via `getMaxCoeff`). If omitted, a moderate default is used.
 * @returns void
 * @date 2026-03-29
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a limit type from a predefined list.
 * 3. Constructs a LaTeX expression and a plain‑text correct answer based on the selected type,
 *    along with plausible distractors for MCQ mode.
 * 4. Appends a `<div>` containing the LaTeX to `questionArea`.
 * 5. Triggers MathJax (if available) to render the math.
 * 6. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, `display`, and `choices` properties.
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
 * @example
 * generateLimit();
 * generateLimit("hard");
 */
export function generateLimit(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["polynomial", "rational", "infinity", "trig"];
	let type=types[Math.floor(Math.random()*types.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let maxCoeff=getMaxCoeff(difficulty);
	let choices: string[]=[];
	switch (type){
		case "polynomial":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*10)-5;
			let x0=Math.floor(Math.random()*5);
			let limit=a*x0*x0+c;
			mathExpression=`\\[ \\lim_{x \\to ${x0}} (${a}x^2+${c}) \\]`;
			plainCorrectAnswer=limit.toString();
			latexAnswer=plainCorrectAnswer;
			choices=[plainCorrectAnswer];
			choices.push((limit+1).toString());
			choices.push((limit-1).toString());
			choices.push((a*x0*x0).toString());
			choices.push((c).toString());
			break;
		}
		case "rational":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+2; // ensure denominator nonzero at x0
			let x0=Math.floor(Math.random()*5)+1;
			let limit=(a*x0+1)/(b*x0-1);
			let exactNum=a*x0+1;
			let exactDen=b*x0-1;
			let exactFraction=`${exactNum}/${exactDen}`;
			plainCorrectAnswer=limit.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			let altNum=exactNum+1;
			let altDen=exactDen-1;
			choices=[plainCorrectAnswer];
			choices.push(exactFraction);
			choices.push((limit+0.1).toFixed(2));
			choices.push((limit-0.1).toFixed(2));
			choices.push(`${altNum}/${altDen}`);
			break;
		}
		case "infinity":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x \\to \\infty} \\frac{${a}x^2+x}{x^2-1} \\]`;
			plainCorrectAnswer=a.toString();
			latexAnswer=plainCorrectAnswer;
			choices=[plainCorrectAnswer];
			choices.push((a+1).toString());
			choices.push((a-1).toString());
			choices.push("0");
			choices.push("∞");
			break;
		}
		case "trig":{
			mathExpression=`\\[ \\lim_{x \\to 0} \\frac{\\sin(x)}{x} \\]`;
			plainCorrectAnswer="1";
			latexAnswer="1";
			choices=["1","0","∞","does not exist"];
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(plainCorrectAnswer)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=plainCorrectAnswer;
		else uniqueChoices=[plainCorrectAnswer];
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
		alternate: plainCorrectAnswer,
		display: latexAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a number";
}

/**
 * Generates and displays a random related rates problem in the global `questionArea`.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, or `"hard"`).
 *                     Scales the numerical values in the problem (ladder length, distances,
 *                     rates, etc.) via `getMaxCoeff`. If omitted, a moderate default is used.
 * @returns void
 * @date 2026-03-29
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a related rates scenario.
 * 3. Constructs descriptive problem text and a LaTeX expression for the unknown rate,
 *    along with plausible distractors for MCQ mode.
 * 4. Appends the problem text (with class `"problem-text"`) followed by a `<div>` containing the LaTeX.
 * 5. Triggers MathJax (if available) to render the math.
 * 6. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, `display`, and `choices` properties.
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
 * @example
 * generateRelatedRates();
 * generateRelatedRates("easy");
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
	let choices: string[]=[];
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
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.5).toFixed(2));
			choices.push((correctNum-0.5).toFixed(2));
			choices.push((dx_dt).toFixed(2));
			choices.push((-(x/y)*dx_dt*0.5).toFixed(2));
			break;
		}
		case "cone":{
			let r=3*scale/5;
			let h=9*scale/5;
			let dr_dt=0.5*scale/5;
			// V = (1/3)π r² h, h constant → dV/dt = (2/3)π r h dr/dt
			let dV_dt=(2/3)*Math.PI*r*h*dr_dt;
			problemText=`A conical tank has radius ${r.toFixed(1)} ft and height ${h.toFixed(1)} ft. The radius increases at ${dr_dt.toFixed(2)} ft/s while the height remains constant. Find the rate of change of volume.`;
			mathExpression=`\\[ \\frac{dV}{dt}=? \\]`;
			plainCorrectAnswer=dV_dt.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((correctNum*0.5).toFixed(2));
			choices.push((Math.PI*r*h*dr_dt).toFixed(2));
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(plainCorrectAnswer)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=plainCorrectAnswer;
		else uniqueChoices=[plainCorrectAnswer];
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
		display: latexAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a number (ft/s or ft³/s, e.g., -1.5)";
}