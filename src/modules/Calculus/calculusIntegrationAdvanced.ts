/**
 * Generates a random advanced integration or differential equations question.
 *
 * This function randomly selects a topic from a comprehensive list covering
 * applications of integration (average value, area between curves, volumes,
 * arc length), advanced integration techniques (integration by parts, partial
 * fractions, improper integrals), and differential equations (modeling,
 * verification, slope fields, Euler's method, separation of variables,
 * exponential and logistic models). It constructs a LaTeX expression for the
 * problem, computes the correct answer (as a plain‑text string), appends the
 * formatted question to the global `questionArea` element, triggers MathJax
 * rendering, and sets global variables for answer validation.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`)
 *                     that influences the maximum coefficient value used in
 *                     generated expressions. If omitted, a default moderate value
 *                     is used (via `getMaxCoeff` from `./calculusUtils.js`).
 *
 * @remarks
 * The function relies on several imported utilities:
 * - `questionArea` (DOM element) from `../../script.js`
 * - `getMaxCoeff` from `./calculusUtils.js` (the import of `latexToPlain` is
 *   currently unused and marked with `@ts-expect-error` for potential future use)
 * - `window.MathJax` (optional) for LaTeX rendering.
 *
 * **Question types** (selected randomly from an array):
 * - **Average value** (`avgValue`): average value of x² on a random interval.
 * - **Area between curves**:
 *   - `areaBetweenX`: area between y = x² and y = ax (intersection at x = a).
 *   - `areaBetweenY`: area between x = y² and x = y + a.
 *   - `areaMultiple`: area between sin x and cos x from 0 to 2π (answer 4).
 * - **Volumes**:
 *   - `volumeCrossSquare`: base bounded by y = x² and y = a, cross sections perpendicular to y‑axis are squares.
 *   - `volumeCrossSemi`: same base, cross sections perpendicular to x‑axis are semicircles.
 *   - `volumeDisc`: solid of revolution (disc method) for y = √x about x‑axis.
 *   - `volumeDiscOther`: disc method with axis y = -1.
 *   - `volumeWasher`: washer method for region between y = x² and y = ax about x‑axis.
 *   - `volumeWasherOther`: same region revolved about y = -1.
 * - **Arc length** (`arcLength`): length of y = x^(3/2) from 0 to a.
 * - **Integration techniques**:
 *   - `parts`: ∫ x e^(ax) dx (integration by parts).
 *   - `partialFractions`: ∫ 1/(x² - a) dx (requires partial fractions).
 *   - `improper`: ∫₁^∞ 1/x^a dx (converges if a > 1, else diverges).
 *   - `selectTechnique`: multiple choice on the best technique for ∫ dx/√(4-x²).
 * - **Differential equations**:
 *   - `diffEqModel`: write a DE for proportional growth.
 *   - `verifySolution`: verify that y = e^(ax) solves y'' - a²y = 0.
 *   - `slopeField`: slope of dy/dx = x - y at (0,0).
 *   - `euler`: one step of Euler's method for dy/dx = x + ay.
 *   - `separationGeneral`: general solution of dy/dx = a x y.
 *   - `separationParticular`: particular solution with initial condition.
 *   - `exponentialModel`: find decay constant from half‑life.
 *   - `logisticModel`: write logistic DE given carrying capacity and growth rate.
 *
 * **Side effects**:
 * - Clears `questionArea.innerHTML`.
 * - Appends a new `<div>` containing the LaTeX question.
 * - Calls `window.MathJax.typesetPromise` (if available) to render the math.
 * - Sets `window.correctAnswer` to an object with `correct`, `alternate`, and `display`
 *   properties. `correct` and `alternate` hold the plain‑text answer for validation;
 *   `display` holds a LaTeX‑formatted version for rendering with KaTeX.
 * - Sets `window.expectedFormat` to a string describing the expected answer format
 *   (e.g., `"Enter a number"`, `"Enter expression"`, `"Enter equation"`, etc.).
 *
 * @example
 * ```typescript
 * // Generate a default‑difficulty advanced integration question
 * generateIntegrationAdvanced();
 *
 * // Generate a hard question
 * generateIntegrationAdvanced("hard");
 * ```
 */
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
	let latexAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	switch (questionType){
		case "avgValue": {
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Average value of } f(x)=x^2 \\text{ on } [${b},${a}]. \\]`;
			let val=(((a*a*a - b*b*b)/3) / (a - b));
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
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
			break;
		}
		case "areaBetweenY":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Area between } x=y^2 \\text{ and } x=y+${a}. \\]`;
			let intersect1= (1-Math.sqrt(1+4*a))/2;
			let intersect2= (1+Math.sqrt(1+4*a))/2;
			let area= Math.abs((intersect2**3/3 + a*intersect2**2/2) - (intersect1**3/3 + a*intersect1**2/2));
			plainCorrectAnswer=area.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			break;
		}
		case "areaMultiple":{
			mathExpression=`\\[ \\text{Area between } y=\\sin x \\text{ and } y=\\cos x \\text{ from } 0 \\text{ to } 2\\pi. \\]`;
			plainCorrectAnswer="4";
			latexAnswer="4";
			expectedFormat="Enter a number";
			break;
		}
		case "volumeCrossSquare":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Base: } y=x^2, y=${a}. \\text{ Cross sections perpendicular to y-axis are squares. Volume?} \\]`;
			let val=(a**2)/2;
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			break;
		}
		case "volumeCrossSemi":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Base: } y=x^2, y=${a}. \\text{ Cross sections perpendicular to x-axis are semicircles. Volume?} \\]`;
			let val=Math.PI/8*a**2;
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			break;
		}
		case "volumeDisc":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Volume when } y=\\sqrt{x} \\text{ from } 0 \\text{ to } ${a} \\text{ revolved about x-axis.} \\]`;
			let val=Math.PI*a*a /2;
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			break;
		}
		case "volumeDiscOther":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Volume when } y=x^2, y=0, x=0 \\text{ to } ${a} \\text{ revolved about } y=-1. \\]`;
			let val=Math.PI*(a**5/5 + 2*a**3/3 + a);
			plainCorrectAnswer=val.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
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
			break;
		}
		case "arcLength":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Length of } y=x^{3/2} \\text{ from } 0 \\text{ to } ${a}. \\]`;
			let len=(2/27)*( (9*a/4+1)**(3/2) -1);
			plainCorrectAnswer=len.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			break;
		}
		case "parts":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int x e^{${a}x} \\,dx \\]`;
			plainCorrectAnswer=`(1/${a})x e^(${a}x) - (1/${a*a}) e^(${a}x) + C`;
			latexAnswer=`\\frac{1}{${a}}x e^{${a}x} - \\frac{1}{${a*a}} e^{${a}x} + C`;
			expectedFormat="Enter expression";
			break;
		}
		case "partialFractions":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let sqrtA=Math.sqrt(a).toFixed(2);
			mathExpression=`\\[ \\int \\frac{1}{x^2-${a}} \\,dx \\]`;
			plainCorrectAnswer=`(1/(2*${sqrtA})) ln| (x-${sqrtA})/(x+${sqrtA}) | + C`;
			latexAnswer=`\\frac{1}{2\\sqrt{${a}}} \\ln\\left|\\frac{x-\\sqrt{${a}}}{x+\\sqrt{${a}}}\\right| + C`;
			expectedFormat="Enter expression";
			break;
		}
		case "improper":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int_1^\\infty \\frac{1}{x^{${a}}} \\,dx \\]`;
			if (a>1){
				let val=(1/(a-1)).toFixed(2);
				plainCorrectAnswer=val;
				latexAnswer=val;
			}
			else{
				plainCorrectAnswer="diverges";
				latexAnswer="\\text{diverges}";
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
			break;
		}
		case "diffEqModel": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\text{Rate of growth proportional to population with constant ${a}. Write DE.} \\]`;
			plainCorrectAnswer=`dP/dt=${a}P`;
			latexAnswer=`\\frac{dP}{dt}=${a}P`;
			expectedFormat="Enter equation";
			break;
		}
		case "verifySolution":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Verify } y=e^{${a}x} \\text{ solves } y''-${a*a}y=0. \\]`;
			plainCorrectAnswer="yes";
			latexAnswer="\\text{yes}";
			expectedFormat="Enter yes or no";
			break;
		}
		case "slopeField":{
			mathExpression=`\\[ \\frac{dy}{dx}=x-y \\text{ at } (0,0). \\]`;
			plainCorrectAnswer="slope 0";
			latexAnswer="\\text{slope }0";
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
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			break;
		}
		case "separationGeneral":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\frac{dy}{dx}=${a}xy \\]`;
			let halfA=(a/2).toFixed(2);
			plainCorrectAnswer=`y=C e^(${halfA}x^2)`;
			latexAnswer=`y=Ce^{\\frac{${a}}{2}x^{2}}`;
			expectedFormat="Enter expression";
			break;
		}
		case "separationParticular": {
			let a=Math.floor(Math.random()*maxCoeff) + 1;
			mathExpression=`\\[ \\frac{dy}{dx}=${a}xy, y(0)=1 \\]`;
			let halfA=(a/2).toFixed(2);
			plainCorrectAnswer=`y=e^(${halfA}x^2)`;
			latexAnswer=`y=e^{\\frac{${a}}{2}x^{2}}`;
			expectedFormat="Enter expression";
			break;
		}
		case "exponentialModel":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Half-life } ${a} \\text{ years, find decay constant.} \\]`;
			let val=Math.LN2/a;
			plainCorrectAnswer=val.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			break;
		}
		case "logisticModel":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Carrying capacity } ${a}0, \\text{ growth rate }0.5, \\text{ write logistic DE.} \\]`;
			plainCorrectAnswer=`dP/dt=0.5P(1 - P/${a}0)`;
			latexAnswer=`\\frac{dP}{dt}=0.5P\\left(1-\\frac{P}{${a}0}\\right)`;
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
		correct: plainCorrectAnswer,
		alternate: plainCorrectAnswer,
		display: latexAnswer
	};
	window.expectedFormat=expectedFormat;
}