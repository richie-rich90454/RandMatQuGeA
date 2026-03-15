/**
 * Generates a random limits and continuity question and displays it in the global question area.
 *
 * The function randomly selects a question type from a predefined list covering limit notation,
 * estimation from tables, limit properties, algebraic manipulation, the Squeeze theorem,
 * discontinuity types, continuity conditions, continuity intervals, removable discontinuities,
 * asymptotes, the Intermediate Value Theorem (IVT), and selection of appropriate limit procedures.
 * It constructs a LaTeX expression for the problem, computes the correct answer (as a plain‑text
 * string), appends the formatted question to the DOM, triggers MathJax rendering, and sets global
 * variables for answer validation.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences
 *                     the maximum coefficient value used in generated expressions. If omitted,
 *                     a default moderate value is used (via `getMaxCoeff` from `./calculusUtils.js`).
 *
 * @remarks
 * The function relies on several imported utilities:
 * - `questionArea` (DOM element) from `../../script.js`
 * - `getMaxCoeff` from `./calculusUtils.js` (the import of `latexToPlain` is currently unused
 *   and marked with `@ts-expect-error` for potential future use)
 * - `window.MathJax` (optional) for LaTeX rendering.
 *
 * **Question types** (selected randomly from an array):
 * - `limitNotation`        – use limit notation to describe behavior of a rational function near a point.
 * - `limitFromTable`       – estimate a limit from a table of function values.
 * - `limitProperties`      – apply limit laws (linear combination) given two limits.
 * - `limitManipulation`    – algebraically simplify a limit expression (e.g., rationalizing).
 * - `limitSqueeze`         – evaluate a limit using the Squeeze theorem (xⁿ cos(1/x) → 0).
 * - `discontinuityType`    – classify a discontinuity (removable, jump, infinite) for a given rational function.
 * - `continuityConditions` – list the three conditions for continuity at a point.
 * - `continuityInterval`   – find the interval(s) where a function (e.g., √(a-x²)) is continuous.
 * - `removeDiscontinuity`  – define a function value to remove a removable discontinuity.
 * - `verticalAsymptote`    – find vertical asymptotes of a rational function.
 * - `horizontalAsymptote`  – evaluate a limit at infinity to find a horizontal asymptote.
 * - `ivt`                  – apply the Intermediate Value Theorem to show existence of a root.
 * - `selectProcedure`      – choose the most efficient method for evaluating a given limit (multiple choice).
 *
 * **Side effects**:
 * - Clears `questionArea.innerHTML`.
 * - Appends a new `<div>` containing the LaTeX question.
 * - Calls `window.MathJax.typesetPromise` (if available) to render the math.
 * - Sets `window.correctAnswer` to an object with `correct`, `alternate`, and `display`
 *   properties. `correct` and `alternate` hold the plain‑text answer for validation;
 *   `display` holds a LaTeX‑formatted version for rendering with KaTeX.
 * - Sets `window.expectedFormat` to a string describing the expected answer format
 *   (e.g., `"Enter a number"`, `"Enter the limit statement"`, `"Enter removable, jump, or infinite"`,
 *   `"Enter interval like [-2,2]"`, `"Enter the letter of the correct option"`, etc.).
 *
 * @example
 * ```typescript
 * // Generate a default‑difficulty limits and continuity question
 * generateLimitsContinuity();
 *
 * // Generate a hard question
 * generateLimitsContinuity("hard");
 * ```
 */
import {questionArea} from "../../script.js";
// @ts-expect-error - latexToPlain is imported for potential future use
import {getMaxCoeff, latexToPlain} from "./calculusUtils.js";
export function generateLimitsContinuity(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["limitNotation","limitFromTable","limitProperties","limitManipulation","limitSqueeze","discontinuityType","continuityConditions","continuityInterval","removeDiscontinuity","verticalAsymptote","horizontalAsymptote","ivt","selectProcedure"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	switch (questionType){
		case "limitNotation":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*5);
			mathExpression=`\\[ \\text{Use limit notation to describe the behavior of } f(x)=\\frac{${a}x^2-${b}}{x-${c}} \\text{ as } x \\to ${c}. \\]`;
			let val=a*c+b;
			plainCorrectAnswer=`\\lim_{x\\to ${c}} f(x)=${val}`;
			latexAnswer=`\\lim_{x\\to ${c}} f(x)=${val}`;
			expectedFormat="Enter the limit statement, e.g., \\lim_{x\\to 2} f(x)=5";
			break;
		}
		case "limitFromTable":{
			let x0=Math.floor(Math.random()*3)+2;
			let values: number[]=[];
			for (let i=0; i<5; i++){
				values.push(Math.random()*10);
			}
			let tableStr="";
			for (let i=0; i<5; i++){
				tableStr+=`x=${x0-2+i} & f(x)=${values[i].toFixed(2)}\\\\`;
			}
			mathExpression=`\\[ \\text{Given the table:} \\begin{array}{c|c} ${tableStr} \\end{array} \\text{ estimate } \\lim_{x\\to ${x0}} f(x). \\]`;
			plainCorrectAnswer=values[2].toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a decimal number";
			break;
		}
		case "limitProperties":{
			let limF=Math.floor(Math.random()*10)+1;
			let limG=Math.floor(Math.random()*10)+1;
			let coeff1=Math.floor(Math.random()*maxCoeff)+1;
			let coeff2=Math.floor(Math.random()*maxCoeff)+1;
			let result=coeff1*limF+coeff2*limG;
			mathExpression=`\\[ \\text{If } \\lim_{x\\to 3}f(x)=${limF} \\text{ and } \\lim_{x\\to 3}g(x)=${limG}, \\text{ find } \\lim_{x\\to 3}[${coeff1}f(x)+${coeff2}g(x)]. \\]`;
			plainCorrectAnswer=result.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			break;
		}
		case "limitManipulation":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*5)+1;
			let result=(a*2*Math.sqrt(c))/b;
			mathExpression=`\\[ \\lim_{x\\to ${c}} \\frac{${a}x-${a*c}}{${b}\\sqrt{x}-${b}\\sqrt{${c}}} \\]`;
			plainCorrectAnswer=result.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number (e.g., 4)";
			break;
		}
		case "limitSqueeze":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x\\to 0} x^${a} \\cos\\left(\\frac{1}{x}\\right) \\]`;
			plainCorrectAnswer="0";
			latexAnswer="0";
			expectedFormat="Enter 0";
			break;
		}
		case "discontinuityType":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=\\frac{${a}x^2-${b}}{x-${Math.sqrt(b/a)}} \\]`;
			plainCorrectAnswer="removable";
			latexAnswer="\\text{removable}";
			expectedFormat="Enter removable, jump, or infinite";
			break;
		}
		case "continuityConditions":{
			mathExpression=`\\[ \\text{State the three conditions for continuity at } x=c. \\]`;
			plainCorrectAnswer="f(c) defined, limit exists, limit equals f(c)";
			latexAnswer="f(c) \\text{ defined}, \\lim_{x\\to c}f(x) \\text{ exists}, \\lim_{x\\to c}f(x)=f(c)";
			expectedFormat="Enter the three conditions separated by commas";
			break;
		}
		case "continuityInterval":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let sqrtA=Math.sqrt(a).toFixed(2);
			mathExpression=`\\[ \\text{Find the interval(s) where } f(x)=\\sqrt{${a}-x^2} \\text{ is continuous.} \\]`;
			plainCorrectAnswer=`[-${sqrtA},${sqrtA}]`;
			latexAnswer=`[-${sqrtA},${sqrtA}]`;
			expectedFormat="Enter interval like [-2,2]";
			break;
		}
		case "removeDiscontinuity": {
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*5)+1;
			let val=2*a*c;
			mathExpression=`\\[ \\text{Define } f(${c}) \\text{ so that } f(x)=\\frac{${a}x^2-${a*c*c}}{x-${c}} \\text{ is continuous at } x=${c}. \\]`;
			plainCorrectAnswer=val.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			break;
		}
		case "verticalAsymptote":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let sqrtB=Math.sqrt(b).toFixed(2);
			mathExpression=`\\[ \\text{Find vertical asymptotes of } f(x)=\\frac{${a}x+1}{x^2-${b}}. \\]`;
			plainCorrectAnswer=`x=${sqrtB}, x=-${sqrtB}`;
			latexAnswer=`x=${sqrtB},\\ x=-${sqrtB}`;
			expectedFormat="Enter equations like x=2, x=-2";
			break;
		}
		case "horizontalAsymptote":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x\\to\\infty} \\frac{${a}x^2-${b}}{${a}x^2+1} \\]`;
			plainCorrectAnswer="1";
			latexAnswer="1";
			expectedFormat="Enter a number";
			break;
		}
		case "ivt":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Show that } f(x)=x^3-${a}x-${b} \\text{ has a root in } [1,2]. \\]`;
			plainCorrectAnswer="f(1)<0, f(2)>0, so IVT applies";
			latexAnswer="f(1)<0,\\ f(2)>0,\\ \\text{so IVT applies}";
			expectedFormat="Explain briefly";
			break;
		}
		case "selectProcedure":{
			let options=["Factoring", "Rationalizing", "Squeeze theorem", "Direct substitution"];
			let correctIdx=Math.floor(Math.random()*options.length);
			plainCorrectAnswer=options[correctIdx];
			latexAnswer=`\\text{${options[correctIdx]}}`;
			mathExpression=`\\[ \\lim_{x\\to 0} \\frac{\\sin ${maxCoeff}x}{x} \\] Which procedure is most efficient? A) ${options[0]} B) ${options[1]} C) ${options[2]} D) ${options[3]}`;
			expectedFormat="Enter the letter of the correct option (A, B, C, or D)";
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