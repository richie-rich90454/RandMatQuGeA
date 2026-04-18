import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";
/**
 * Generates and displays a random sequences and series question in the global `questionArea`.
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
 * - `geometricSeries`   – determine convergence and sum of a geometric series.
 * - `nthTermTest`       – apply the nth term test for divergence.
 * - `limitComparison`   – use limit comparison test on a rational series.
 * - `taylorCos`         – Maclaurin series for cos x.
 * - `taylorLn`          – Maclaurin series for ln(1+x) by integrating geometric series.
 * - `seriesOperations`  – find power series for x·e^{ax} by multiplying known series.
 *
 * @example
 * generateSequencesSeries();
 * generateSequencesSeries("hard");
 */
export function generateSequencesSeries(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["integralTest","pSeries","comparisonTest","alternatingTest","ratioTest","absCond","altError","taylorPoly","lagrangeError","radiusInterval","maclaurin","powerSeries","geometricSeries","nthTermTest","limitComparison","taylorCos","taylorLn","seriesOperations"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	let choices: string[]=[];
	switch(questionType){
		case "integralTest":{
			let p=Math.floor(Math.random()*3)+2;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{1}{n^2+${p}} \\text{ use integral test.} \\]`;
			plainCorrectAnswer="converges";
			latexAnswer="\\text{converges}";
			expectedFormat="Enter converges or diverges";
			choices=["converges","diverges","converges conditionally","inconclusive"];
			break;
		}
		case "pSeries":{
			let pVal=(Math.random()*2).toFixed(1);
			let pNum=parseFloat(pVal);
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{1}{n^{${pVal}}} \\text{ converges for?} \\]`;
			if(pNum>1){
				plainCorrectAnswer="converges";
				latexAnswer="\\text{converges}";
			}
			else{
				plainCorrectAnswer="diverges";
				latexAnswer="\\text{diverges}";
			}
			expectedFormat="Enter converges or diverges";
			choices=["converges","diverges"];
			break;
		}
		case "comparisonTest":{
			let p=Math.floor(Math.random()*3)+2;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{1}{n^2+${p}} \\text{ compare to } \\sum \\frac{1}{n^2}. \\]`;
			plainCorrectAnswer="converges";
			latexAnswer="\\text{converges}";
			expectedFormat="Enter converges or diverges";
			choices=["converges","diverges","inconclusive","comparison fails"];
			break;
		}
		case "alternatingTest":{
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n} \\text{ converges?} \\]`;
			plainCorrectAnswer="conditionally";
			latexAnswer="\\text{conditionally}";
			expectedFormat="Enter absolutely, conditionally, or diverges";
			choices=["conditionally","absolutely","diverges","converges absolutely"];
			break;
		}
		case "ratioTest":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{${a}^n}{n!} \\text{ use ratio test.} \\]`;
			plainCorrectAnswer="converges";
			latexAnswer="\\text{converges}";
			expectedFormat="Enter converges or diverges";
			choices=["converges","diverges","inconclusive","ratio = 1"];
			break;
		}
		case "absCond":{
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n^3} \\text{ classify.} \\]`;
			plainCorrectAnswer="absolutely";
			latexAnswer="\\text{absolutely}";
			expectedFormat="Enter absolutely, conditionally, or diverges";
			choices=["absolutely","conditionally","diverges","absolutely convergent"];
			break;
		}
		case "altError":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n^{${a}}} \\text{ error using first 3 terms.} \\]`;
			let error=1/Math.pow(4, a);
			plainCorrectAnswer=error.toFixed(4);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.05).toFixed(4));
			choices.push((correctNum-0.05).toFixed(4));
			choices.push((1/Math.pow(3,a)).toFixed(4));
			choices.push((1/Math.pow(5,a)).toFixed(4));
			break;
		}
		case "taylorPoly":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{3rd degree Taylor for } e^{${a}x} \\text{ at } x=0. \\]`;
			let terms=[`1`, `${a}x`, `${(a*a/2).toFixed(2)}x^2`, `${(a*a*a/6).toFixed(2)}x^3`];
			plainCorrectAnswer=terms.join(" + ");
			latexAnswer=`1 + ${a}x + \\frac{${a*a}}{2}x^{2} + \\frac{${a*a*a}}{6}x^{3}`;
			expectedFormat="Enter polynomial";
			let normalizedCorrect=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`1+${a}x+${(a*a/2).toFixed(2)}x^2+${(a*a*a/6).toFixed(2)}x^4`.replace(/\s/g,"").toLowerCase());
			choices.push(`1+${a}x+${(a*a/2).toFixed(2)}x^2+${(a*a*a/6).toFixed(2)}x^3+x^4`.replace(/\s/g,"").toLowerCase());
			choices.push(`1+${a+1}x+${((a+1)*(a+1)/2).toFixed(2)}x^2+${((a+1)*(a+1)*(a+1)/6).toFixed(2)}x^3`.replace(/\s/g,"").toLowerCase());
			choices.push(`1+${a}x+${(a*a/2).toFixed(2)}x^2`.replace(/\s/g,"").toLowerCase());
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
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.1).toFixed(4));
			choices.push((correctNum-0.1).toFixed(4));
			choices.push((error*0.5).toFixed(4));
			choices.push((error*2).toFixed(4));
			break;
		}
		case "radiusInterval":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=0}^\\infty \\frac{x^n}{${a}^n} \\text{ interval of convergence.} \\]`;
			plainCorrectAnswer=`(-${a}, ${a})`;
			latexAnswer=`(-${a},${a})`;
			expectedFormat="Enter interval";
			choices=[plainCorrectAnswer];
			choices.push(`[-${a}, ${a}]`);
			choices.push(`(-${a}, ${a}]`);
			choices.push(`[-${a}, ${a})`);
			choices.push(`(-${a}, ${a+1})`);
			break;
		}
		case "maclaurin":{
			mathExpression=`\\[ \\text{Maclaurin series for } \\sin x. \\]`;
			plainCorrectAnswer="x - x^3/3! + x^5/5! - ...";
			latexAnswer="x - \\frac{x^{3}}{3!} + \\frac{x^{5}}{5!} - \\cdots";
			expectedFormat="Enter series";
			choices=[plainCorrectAnswer];
			choices.push("x + x^3/3! + x^5/5! + ...");
			choices.push("1 - x^2/2! + x^4/4! - ...");
			choices.push("x - x^2/2! + x^3/3! - ...");
			choices.push("∑ x^n/n!");
			break;
		}
		case "powerSeries":{
			mathExpression=`\\[ \\frac{1}{1-x} \\text{ as power series.} \\]`;
			plainCorrectAnswer="∑ x^n, |x|<1";
			latexAnswer="\\sum_{n=0}^{\\infty} x^{n},\\ |x|<1";
			expectedFormat="Enter series";
			choices=[plainCorrectAnswer];
			choices.push("∑ x^n, |x|>1");
			choices.push("∑ nx^n, |x|<1");
			choices.push("∑ (-x)^n, |x|<1");
			choices.push("∑ 1/x^n, |x|>1");
			break;
		}
		case "geometricSeries":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let r=0.5;
			mathExpression=`\\[ \\sum_{n=0}^\\infty ${a} \\cdot (${r})^n \\text{ converges? If so, find sum.} \\]`;
			let sum=a/(1-r);
			plainCorrectAnswer=`converges, sum=${sum.toFixed(2)}`;
			latexAnswer=`\\text{converges, sum}=${sum.toFixed(2)}`;
			expectedFormat="Enter converges/diverges and sum";
			choices=[plainCorrectAnswer];
			choices.push(`converges, sum=${(sum+1).toFixed(2)}`);
			choices.push(`converges, sum=${(sum-1).toFixed(2)}`);
			choices.push(`diverges`);
			choices.push(`converges, sum=${(sum*2).toFixed(2)}`);
			break;
		}
		case "nthTermTest":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{n}{${a}n+1} \\text{ apply nth term test.} \\]`;
			let limit=1/a;
			plainCorrectAnswer=`limit=${limit.toFixed(2)} ≠ 0, diverges`;
			latexAnswer=`\\lim_{n\\to\\infty} a_n = ${limit.toFixed(2)} \\neq 0,\\ \\text{diverges}`;
			expectedFormat="Enter conclusion";
			choices=[plainCorrectAnswer];
			choices.push(`limit=0, inconclusive`);
			choices.push(`limit=${(limit+0.2).toFixed(2)}, diverges`);
			choices.push(`limit=∞, diverges`);
			break;
		}
		case "limitComparison":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\sum_{n=1}^\\infty \\frac{${a}n^2+1}{n^4+3} \\text{ use limit comparison test with } \\sum \\frac{1}{n^2}. \\]`;
			let limitRatio=a;
			plainCorrectAnswer=`converges (limit = ${limitRatio})`;
			latexAnswer=`\\text{converges}\\ (\\lim = ${limitRatio})`;
			expectedFormat="Enter converges or diverges";
			choices=[plainCorrectAnswer];
			choices.push(`diverges (limit = ${limitRatio})`);
			choices.push(`converges (limit = ${limitRatio+1})`);
			choices.push(`diverges (limit = ${limitRatio-1})`);
			break;
		}
		case "taylorCos":{
			mathExpression=`\\[ \\text{Maclaurin series for } \\cos x \\text{ by differentiating } \\sin x \\text{ series.} \\]`;
			plainCorrectAnswer="1 - x^2/2! + x^4/4! - x^6/6! + ...";
			latexAnswer="1 - \\frac{x^{2}}{2!} + \\frac{x^{4}}{4!} - \\frac{x^{6}}{6!} + \\cdots";
			expectedFormat="Enter series";
			choices=[plainCorrectAnswer];
			choices.push("x - x^3/3! + x^5/5! - ...");
			choices.push("1 + x^2/2! + x^4/4! + ...");
			choices.push("x + x^3/3! + x^5/5! + ...");
			choices.push("1 - x^2/2 + x^4/24 - ...");
			break;
		}
		case "taylorLn":{
			mathExpression=`\\[ \\text{Maclaurin series for } \\ln(1+x) \\text{ by integrating } \\frac{1}{1+x}. \\]`;
			plainCorrectAnswer="x - x^2/2 + x^3/3 - x^4/4 + ...";
			latexAnswer="x - \\frac{x^{2}}{2} + \\frac{x^{3}}{3} - \\frac{x^{4}}{4} + \\cdots";
			expectedFormat="Enter series";
			choices=[plainCorrectAnswer];
			choices.push("x + x^2/2 + x^3/3 + ...");
			choices.push("1 - x + x^2 - x^3 + ...");
			choices.push("x - x^2/2! + x^3/3! - ...");
			choices.push("∑ x^n/n");
			break;
		}
		case "seriesOperations":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Given } e^x = \\sum_{n=0}^\\infty \\frac{x^n}{n!}, \\text{ find the power series for } x e^{${a}x}. \\]`;
			plainCorrectAnswer=`∑_{n=0}^∞ ${a}^n x^{n+1}/n!`;
			latexAnswer=`\\sum_{n=0}^{\\infty} \\frac{${a}^{n}}{n!}x^{n+1}`;
			expectedFormat="Enter series";
			let normalizedCorrect=plainCorrectAnswer.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`∑_{n=0}^∞ ${a}^n x^n/n!`.replace(/\s/g,"").toLowerCase());
			choices.push(`∑_{n=1}^∞ ${a}^{n-1} x^n/(n-1)!`.replace(/\s/g,"").toLowerCase());
			choices.push(`∑_{n=0}^∞ ${a}^{n+1} x^{n+1}/n!`.replace(/\s/g,"").toLowerCase());
			choices.push(`∑_{n=0}^∞ x^{n+1}/n!`.replace(/\s/g,"").toLowerCase());
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