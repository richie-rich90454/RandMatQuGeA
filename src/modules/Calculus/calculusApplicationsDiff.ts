import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";
/**
 * Generates and displays a random "applications of derivatives" question in the global `questionArea`.
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
 * 2. Randomly selects a question type from a predefined list.
 * 3. Constructs a LaTeX expression and a plain‑text correct answer based on the selected type.
 * 4. Generates plausible incorrect answers (distractors) for MCQ mode.
 * 5. Appends a `<div>` containing the LaTeX to `questionArea`.
 * 6. Triggers MathJax (if available) to render the math.
 * 7. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, `display`, and `choices` properties.
 *      `correct` and `alternate` hold the plain‑text answer; `display` holds a LaTeX version for rendering.
 *    - `window.expectedFormat` – a string describing the expected input format.
 *
 * **Question types** (each uses random coefficients scaled by `difficulty`):
 * - `linearization`      – approximate a square root using linear approximation.
 * - `lhopital`           – evaluate a limit using l'Hôpital's rule.
 * - `mvt`                – find a point `c` satisfying the Mean Value Theorem.
 * - `evt`                – find critical points on a closed interval (Extreme Value Theorem).
 * - `incDec`             – determine intervals where a function is increasing.
 * - `firstDerivativeTest`– classify critical points as local maxima/minima.
 * - `candidatesTest`     – find the absolute maximum on a closed interval.
 * - `concavity`          – find intervals of concavity and inflection points.
 * - `secondDerivativeTest`– apply the second derivative test at a point.
 * - `graphSketch`        – describe the shape of `f` from conditions on `f'` and `f''`.
 * - `connecting`         – relate the signs of `f'` and `f''` to the behavior of `f`.
 * - `optimization`       – maximize the product of two numbers given their sum.
 * - `implicitBehavior`   – find the slope of a tangent line to an implicitly defined curve.
 *
 * @example
 * generateApplicationsDiff();
 * generateApplicationsDiff("hard");
 */
export function generateApplicationsDiff(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["linearization","lhopital","mvt","evt","incDec","firstDerivativeTest","candidatesTest","concavity","secondDerivativeTest","graphSketch","connecting","optimization","implicitBehavior"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	let choices: string[]=[];
	switch (questionType){
		case "linearization":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let x0=Math.floor(Math.random()*5)+1;
			let point=a*x0+b;
			let approx=Math.sqrt(point)+(0.1)/(2*Math.sqrt(point));
			mathExpression=`\\[ \\text{Use linear approximation to estimate } \\sqrt{${point+0.1}}. \\]`;
			plainCorrectAnswer=approx.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a decimal";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.05).toFixed(3));
			choices.push((correctNum-0.05).toFixed(3));
			choices.push((Math.sqrt(point+0.1)).toFixed(3));
			choices.push((Math.sqrt(point+0.1)+0.05).toFixed(3));
			break;
		}
		case "lhopital":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x\\to 0} \\frac{e^{${a}x}-1}{x} \\]`;
			plainCorrectAnswer=a.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			choices=[plainCorrectAnswer];
			choices.push((a+1).toString());
			choices.push((a-1).toString());
			choices.push((a/2).toFixed(2));
			choices.push("0");
			break;
		}
		case "mvt":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=x^3-${a}x \\text{ on } [-1,1]. \\text{ Find } c \\text{ satisfying MVT.} \\]`;
			let c=1/Math.sqrt(3);
			plainCorrectAnswer=c.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((0.5).toFixed(2));
			choices.push((0.8).toFixed(2));
			choices.push((0.3).toFixed(2));
			choices.push((-correctNum).toFixed(2));
			break;
		}
		case "evt":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Find critical points of } f(x)=x^3-${a}x^2+2 \\text{ on } [0,3]. \\]`;
			let cp1=0;
			let cp2=(2*a)/3;
			plainCorrectAnswer=`${cp1}, ${cp2.toFixed(2)}`;
			latexAnswer=`${cp1},\\ ${cp2.toFixed(2)}`;
			expectedFormat="Enter numbers separated by commas";
			choices=[plainCorrectAnswer];
			choices.push(`${cp1}, ${(cp2+0.5).toFixed(2)}`);
			choices.push(`${(cp1+0.5).toFixed(2)}, ${cp2.toFixed(2)}`);
			choices.push(`${(cp2/2).toFixed(2)}, ${cp2.toFixed(2)}`);
			choices.push(`${cp1}`);
			break;
		}
		case "incDec":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Intervals where } f(x)=x^3-${a}x^2+1 \\text{ is increasing.} \\]`;
			let cp=2*a/3;
			plainCorrectAnswer=`(${cp.toFixed(2)}, \\infty)`;
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter interval like (1, infinity)";
			choices=[plainCorrectAnswer];
			choices.push(`(-\\infty, ${cp.toFixed(2)})`);
			choices.push(`(${cp.toFixed(2)}, ${(cp+1).toFixed(2)})`);
			choices.push(`(-\\infty, \\infty)`);
			choices.push(`(${cp.toFixed(2)}, 0)`);
			break;
		}
		case "firstDerivativeTest":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=x^4-${a}x^3. \\text{ Classify critical points.} \\]`;
			let cp2=(3*a)/4;
			plainCorrectAnswer=`x=0 local max, x=${cp2.toFixed(2)} local min`;
			latexAnswer=`x=0\\text{ local max},\\ x=${cp2.toFixed(2)}\\text{ local min}`;
			expectedFormat="Describe";
			choices=[plainCorrectAnswer];
			choices.push(`x=0 local min, x=${cp2.toFixed(2)} local max`);
			choices.push(`x=0 local max, x=${cp2.toFixed(2)} saddle`);
			choices.push(`x=0 saddle, x=${cp2.toFixed(2)} local min`);
			choices.push(`x=0 local min, x=${cp2.toFixed(2)} local min`);
			break;
		}
		case "candidatesTest":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=x^3-${a}x \\text{ on } [0,3]. \\text{ Find absolute max.} \\]`;
			let maxVal=Math.max(0, 27-3*a, Math.pow(Math.sqrt(a/3),3)-a*Math.sqrt(a/3));
			if (isNaN(maxVal)) maxVal=Math.max(0,27-3*a);
			plainCorrectAnswer=maxVal.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((27-3*a).toFixed(2));
			choices.push("0");
			break;
		}
		case "concavity":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=x^3-${a}x^2. \\text{ Intervals of concavity.} \\]`;
			let inflection=a/3;
			plainCorrectAnswer=`down on (-\\infty, ${inflection.toFixed(2)}), up on (${inflection.toFixed(2)}, \\infty)`;
			latexAnswer=`\\text{down on } (-\\infty, ${inflection.toFixed(2)}),\\ \\text{up on } (${inflection.toFixed(2)}, \\infty)`;
			expectedFormat="Describe";
			choices=[plainCorrectAnswer];
			choices.push(`up on (-\\infty, ${inflection.toFixed(2)}), down on (${inflection.toFixed(2)}, \\infty)`);
			choices.push(`down on (-\\infty, ${(inflection+0.5).toFixed(2)}), up on (${(inflection+0.5).toFixed(2)}, \\infty)`);
			choices.push(`up everywhere`);
			choices.push(`down everywhere`);
			break;
		}
		case "secondDerivativeTest":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=x^3-${a}x. \\text{ Use second derivative test at } x=0. \\]`;
			plainCorrectAnswer="inconclusive";
			latexAnswer=`\\text{inconclusive}`;
			expectedFormat="Enter max, min, or inconclusive";
			choices=[plainCorrectAnswer];
			choices.push("local maximum");
			choices.push("local minimum");
			choices.push("saddle point");
			choices.push("inflection point");
			break;
		}
		case "graphSketch":{
			mathExpression=`\\[ \\text{Given } f'(x)>0 \\text{ for } x<2, f'(x)<0 \\text{ for } x>2, f''(x)>0 \\text{ for all } x, \\text{ sketch } f. \\]`;
			plainCorrectAnswer="increasing concave up then decreasing concave up";
			latexAnswer=`\\text{increasing concave up then decreasing concave up}`;
			expectedFormat="Describe";
			choices=[plainCorrectAnswer];
			choices.push("increasing concave down then decreasing concave down");
			choices.push("decreasing concave up then increasing concave up");
			choices.push("increasing then decreasing, with an inflection point");
			choices.push("decreasing then increasing, always concave down");
			break;
		}
		case "connecting":{
			mathExpression=`\\[ \\text{If } f'(x)>0 \\text{ and } f''(x)<0 \\text{ for all } x, \\text{ what is true?} \\]`;
			plainCorrectAnswer="f increasing, concave down";
			latexAnswer=`\\text{f increasing, concave down}`;
			expectedFormat="Describe";
			choices=[plainCorrectAnswer];
			choices.push("f increasing, concave up");
			choices.push("f decreasing, concave down");
			choices.push("f decreasing, concave up");
			choices.push("f constant");
			break;
		}
		case "optimization":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Two numbers sum to } ${a}. \\text{ Maximize product.} \\]`;
			let numVal=a/2;
			let numStr=numVal.toString();
			plainCorrectAnswer=numStr+", "+numStr;
			latexAnswer=`${numStr},\\ ${numStr}`;
			expectedFormat="Enter two numbers separated by comma";
			choices=[plainCorrectAnswer];
			choices.push((numVal-1).toString()+", "+(numVal+1).toString());
			choices.push((numVal+0.5).toString()+", "+(numVal-0.5).toString());
			choices.push(a+", 0");
			choices.push((a-1).toString()+", 1");
			break;
		}
		case "implicitBehavior":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let yVal=Math.sqrt(a-1);
			if (isNaN(yVal)){
				a=Math.max(a,2);
				yVal=Math.sqrt(a-1);
			}
			mathExpression=`\\[ \\text{Slope of tangent to } x^2+y^2=${a} \\text{ at } (1,${yVal.toFixed(2)}). \\]`;
			let slope=(-1/yVal).toFixed(2);
			plainCorrectAnswer=slope;
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.5).toFixed(2));
			choices.push((correctNum-0.5).toFixed(2));
			choices.push((1/yVal).toFixed(2));
			choices.push("0");
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
	window.expectedFormat=expectedFormat;
}