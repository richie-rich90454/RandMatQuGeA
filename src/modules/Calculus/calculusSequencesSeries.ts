/**
 * Generates and displays a random sequences and series question in the global `questionArea`.
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
 * 6. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, and `display` properties.
 *      `correct` and `alternate` hold the plain‑text answer for validation;
 *      `display` holds a LaTeX‑formatted version for rendering with KaTeX.
 *    - `window.expectedFormat` – a string describing the expected input format.
 *
 * **Question types** (each uses random coefficients scaled by `difficulty` where applicable):
 * - `integralTest`      – apply the integral test to determine convergence of ∑ 1/(n²+p).
 * - `pSeries`           – determine convergence of a p‑series with random p.
 * - `comparisonTest`    – compare ∑ 1/(n²+p) to ∑ 1/n².
 * - `alternatingTest`   – classify convergence of the alternating harmonic series.
 * - `ratioTest`         – apply the ratio test to ∑ aⁿ/n!.
 * - `absCond`           – classify absolute/conditional convergence of ∑ (-1)ⁿ⁺¹/n³.
 * - `altError`          – estimate error of an alternating series using first 3 terms.
 * - `taylorPoly`        – write the 3rd degree Taylor polynomial for e^{ax} at x=0.
 * - `lagrangeError`     – estimate the Lagrange error bound for the Taylor polynomial.
 * - `radiusInterval`    – find the interval of convergence for ∑ xⁿ/aⁿ.
 * - `maclaurin`         – recall the Maclaurin series for sin x.
 * - `powerSeries`       – express 1/(1‑x) as a power series.
 *
 * **External dependencies**:
 * - `questionArea` (imported from `../../script.js`) – must be a DOM element.
 * - `getMaxCoeff` (imported from `./calculusUtils.js`) – provides the coefficient limit.
 * - `window.MathJax` – optional; if present, `MathJax.typesetPromise` is called.
 *
 * @example
 * ```typescript
 * // Generate a question with default difficulty
 * generateSequencesSeries();
 *
 * // Generate a hard question
 * generateSequencesSeries("hard");
 * ```
 */
import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";
export function generateSequencesSeries(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["integralTest","pSeries","comparisonTest","alternatingTest","ratioTest","absCond","altError","taylorPoly","lagrangeError","radiusInterval","maclaurin","powerSeries"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	switch (questionType){
		case "integralTest":{
			let p=Math.floor(Math.random()*3)+2;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{1}{n^2+${p}} \\text{ use integral test.} \\]`;
			plainCorrectAnswer="converges";
			latexAnswer="\\text{converges}";
			expectedFormat="Enter converges or diverges";
			break;
		}
		case "pSeries":{
			let p=(Math.random()*2).toFixed(1);
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{1}{n^{${p}}} \\text{ converges for?} \\]`;
			plainCorrectAnswer= parseFloat(p)>1 ? "converges" : "diverges";
			latexAnswer= parseFloat(p)>1 ? "\\text{converges}" : "\\text{diverges}";
			expectedFormat="Enter converges or diverges";
			break;
		}
		case "comparisonTest":{
			let p=Math.floor(Math.random()*3)+2;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{1}{n^2+${p}} \\text{ compare to } \\sum \\frac{1}{n^2}. \\]`;
			plainCorrectAnswer="converges";
			latexAnswer="\\text{converges}";
			expectedFormat="Enter converges or diverges";
			break;
		}
		case "alternatingTest":{
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n} \\text{ converges?} \\]`;
			plainCorrectAnswer="conditionally";
			latexAnswer="\\text{conditionally}";
			expectedFormat="Enter absolutely, conditionally, or diverges";
			break;
		}
		case "ratioTest":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{${a}^n}{n!} \\text{ use ratio test.} \\]`;
			plainCorrectAnswer="converges";
			latexAnswer="\\text{converges}";
			expectedFormat="Enter converges or diverges";
			break;
		}
		case "absCond":{
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n^3} \\text{ classify.} \\]`;
			plainCorrectAnswer="absolutely";
			latexAnswer="\\text{absolutely}";
			expectedFormat="Enter absolutely, conditionally, or diverges";
			break;
		}
		case "altError":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n^${a}} \\text{ error using first 3 terms.} \\]`;
			let error=1/Math.pow(4, a);
			plainCorrectAnswer=error.toFixed(4);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			break;
		}
		case "taylorPoly":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{3rd degree Taylor for } e^{${a}x} \\text{ at } x=0. \\]`;
			plainCorrectAnswer=`1 + ${a}x + ${a*a/2}x^2 + ${a*a*a/6}x^3`;
			latexAnswer=`1 + ${a}x + \\frac{${a*a}}{2}x^{2} + \\frac{${a*a*a}}{6}x^{3}`;
			expectedFormat="Enter polynomial";
			break;
		}
		case "lagrangeError":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let xVal=0.5;
			let error=Math.pow(a,4) * Math.exp(a*xVal) * Math.pow(xVal,4) / 24;
			mathExpression=`\\[ \\text{Max error using 3rd Taylor for } e^{${a}x} \\text{ at } x=${xVal}. \\]`;
			plainCorrectAnswer=error.toFixed(4);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			break;
		}
		case "radiusInterval":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=0}^\\infty \\frac{x^n}{${a}^n} \\text{ interval of convergence.} \\]`;
			plainCorrectAnswer=`(-${a}, ${a})`;
			latexAnswer=`(-${a},${a})`;
			expectedFormat="Enter interval";
			break;
		}
		case "maclaurin":{
			mathExpression=`\\[ \\text{Maclaurin series for } \\sin x. \\]`;
			plainCorrectAnswer="x - x^3/3! + x^5/5! - ...";
			latexAnswer="x - \\frac{x^{3}}{3!} + \\frac{x^{5}}{5!} - \\cdots";
			expectedFormat="Enter series";
			break;
		}
		case "powerSeries":{
			mathExpression=`\\[ \\frac{1}{1-x} \\text{ as power series.} \\]`;
			plainCorrectAnswer="∑ x^n, |x|<1";
			latexAnswer="\\sum_{n=0}^{\\infty} x^{n},\\ |x|<1";
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
		alternate: plainCorrectAnswer,
		display: latexAnswer
	};
	window.expectedFormat=expectedFormat;
}