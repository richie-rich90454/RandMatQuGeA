import {questionArea} from "../../script.js";
// @ts-expect-error - latexToPlain is imported for potential future use
import {getMaxCoeff, latexToPlain} from "./calculusUtils.js";
/**
 * Generates a random limits and continuity question and displays it in the global question area.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * The function randomly selects a question type from a predefined list covering limit notation,
 * estimation from tables, limit properties, algebraic manipulation, the Squeeze theorem,
 * discontinuity types, continuity conditions, continuity intervals, removable discontinuities,
 * asymptotes, the Intermediate Value Theorem (IVT), selection of appropriate limit procedures,
 * and the conceptual connection between average and instantaneous rates of change.
 * It constructs a LaTeX expression for the problem, computes the correct answer (as a plain‑text
 * string), appends the formatted question to the DOM, triggers MathJax rendering, and sets global
 * variables for answer validation.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that influences
 *                     the maximum coefficient value used in generated expressions. If omitted,
 *                     a default moderate value is used (via `getMaxCoeff` from `./calculusUtils.js`).
 * @returns void
 * @date 2026-04-18
 *
 * @example
 * generateLimitsContinuity();
 * generateLimitsContinuity("hard");
 */
export function generateLimitsContinuity(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["limitNotation","limitFromTable","limitProperties","limitManipulation","limitSqueeze","discontinuityType","continuityConditions","continuityInterval","removeDiscontinuity","verticalAsymptote","horizontalAsymptote","ivt","selectProcedure","instantaneousRateConceptual"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	let choices: string[]=[];
	switch(questionType){
		case "limitNotation":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*5)+1;
			let b=a*c*c;
			mathExpression=`\\[ \\text{Use limit notation to describe the behavior of } f(x)=\\frac{${a}x^2-${b}}{x-${c}} \\text{ as } x \\to ${c}. \\]`;
			let val=2*a*c;
			plainCorrectAnswer=`\\lim_{x\\to ${c}} f(x)=${val}`;
			latexAnswer=`\\lim_{x\\to ${c}} f(x)=${val}`;
			expectedFormat="Enter the limit statement, e.g., \\lim_{x\\to 2} f(x)=5";
			choices=[plainCorrectAnswer];
			choices.push(`\\lim_{x\\to ${c}} f(x)=${val+1}`);
			choices.push(`\\lim_{x\\to ${c}} f(x)=${val-1}`);
			choices.push(`\\lim_{x\\to ${c}} f(x)=\\infty`);
			choices.push(`\\lim_{x\\to ${c}} f(x)=-\\infty`);
			break;
		}
		case "limitFromTable":{
			let x0=Math.floor(Math.random()*3)+2;
			let values: number[]=[];
			for(let i=0;i<5;i++){
				values.push(Math.random()*10);
			}
			let tableStr="";
			for(let i=0;i<5;i++){
				tableStr+=`${x0-2+i} & ${values[i].toFixed(2)}\\\\`;
			}
			mathExpression=`\\[ \\text{Given the table:} \\begin{array}{c|c} x & f(x) \\\\ ${tableStr} \\end{array} \\text{ estimate } \\lim_{x\\to ${x0}} f(x). \\]`;
			plainCorrectAnswer=values[2].toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a decimal number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.1).toFixed(2));
			choices.push((correctNum-0.1).toFixed(2));
			choices.push(values[1].toFixed(2));
			choices.push(values[3].toFixed(2));
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
			choices=[plainCorrectAnswer];
			choices.push((result+1).toString());
			choices.push((result-1).toString());
			choices.push((coeff1*limF-coeff2*limG).toString());
			choices.push((coeff1*limF).toString());
			break;
		}
		case "limitManipulation":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*5)+1;
			let result=(2*a*Math.sqrt(c))/b;
			mathExpression=`\\[ \\lim_{x\\to ${c}} \\frac{${a}x-${a*c}}{${b}\\sqrt{x}-${b}\\sqrt{${c}}} \\]`;
			plainCorrectAnswer=result.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number (e.g., 4)";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.5).toFixed(2));
			choices.push((correctNum-0.5).toFixed(2));
			choices.push((a*c/b).toFixed(2));
			choices.push("0");
			break;
		}
		case "limitSqueeze":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x\\to 0} x^${a} \\cos\\left(\\frac{1}{x}\\right) \\]`;
			plainCorrectAnswer="0";
			latexAnswer="0";
			expectedFormat="Enter 0";
			choices=["0","1","-1","does not exist"];
			break;
		}
		case "discontinuityType":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let root=Math.sqrt(b/a).toFixed(2);
			mathExpression=`\\[ f(x)=\\frac{${a}x^2-${b}}{x-${root}} \\]`;
			plainCorrectAnswer="removable";
			latexAnswer="\\text{removable}";
			expectedFormat="Enter removable, jump, or infinite";
			choices=["removable","jump","infinite","oscillating"];
			break;
		}
		case "continuityConditions":{
			mathExpression=`\\[ \\text{State the three conditions for continuity at } x=c. \\]`;
			plainCorrectAnswer="f(c) defined, limit exists, limit equals f(c)";
			latexAnswer="f(c) \\text{ defined}, \\lim_{x\\to c}f(x) \\text{ exists}, \\lim_{x\\to c}f(x)=f(c)";
			expectedFormat="Enter the three conditions separated by commas";
			choices=[plainCorrectAnswer];
			choices.push("f(c) defined, limit exists");
			choices.push("limit exists, limit equals f(c)");
			choices.push("f(c) defined, limit equals f(c)");
			choices.push("f is differentiable");
			break;
		}
		case "continuityInterval":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let sqrtA=Math.sqrt(a).toFixed(2);
			mathExpression=`\\[ \\text{Find the interval(s) where } f(x)=\\sqrt{${a}-x^2} \\text{ is continuous.} \\]`;
			plainCorrectAnswer=`[-${sqrtA},${sqrtA}]`;
			latexAnswer=`[-${sqrtA},${sqrtA}]`;
			expectedFormat="Enter interval like [-2,2]";
			choices=[plainCorrectAnswer];
			choices.push(`(-${sqrtA},${sqrtA})`);
			choices.push(`[-${sqrtA},${sqrtA})`);
			choices.push(`(-${sqrtA},${sqrtA}]`);
			choices.push(`[0,${sqrtA}]`);
			break;
		}
		case "removeDiscontinuity":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*5)+1;
			let val=2*a*c;
			mathExpression=`\\[ \\text{Define } f(${c}) \\text{ so that } f(x)=\\frac{${a}x^2-${a*c*c}}{x-${c}} \\text{ is continuous at } x=${c}. \\]`;
			plainCorrectAnswer=val.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toString());
			choices.push((correctNum-1).toString());
			choices.push((2*a).toString());
			choices.push((a*c).toString());
			break;
		}
		case "verticalAsymptote":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let sqrtBVal=Math.sqrt(b);
			let sqrtBStr=sqrtBVal.toFixed(2);
			mathExpression=`\\[ \\text{Find vertical asymptotes of } f(x)=\\frac{${a}x+1}{x^2-${b}}. \\]`;
			plainCorrectAnswer=`x=${sqrtBStr}, x=-${sqrtBStr}`;
			latexAnswer=`x=${sqrtBStr},\\ x=-${sqrtBStr}`;
			expectedFormat="Enter equations like x=2, x=-2";
			choices=[plainCorrectAnswer];
			choices.push(`x=${sqrtBStr}`);
			choices.push(`x=-${sqrtBStr}`);
			choices.push(`x=0`);
			let halfSqrt=(sqrtBVal/2).toFixed(2);
			choices.push(`x=${halfSqrt}`);
			break;
		}
		case "horizontalAsymptote":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x\\to\\infty} \\frac{${a}x^2-${b}}{${a}x^2+1} \\]`;
			plainCorrectAnswer="1";
			latexAnswer="1";
			expectedFormat="Enter a number";
			choices=["1","0","-1","∞"];
			break;
		}
		case "ivt":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let f1=1-a-b;
			let f2=8-2*a-b;
			while(f1*f2>=0){
				a=Math.floor(Math.random()*maxCoeff)+1;
				b=Math.floor(Math.random()*maxCoeff)+1;
				f1=1-a-b;
				f2=8-2*a-b;
			}
			mathExpression=`\\[ \\text{Show that } f(x)=x^3-${a}x-${b} \\text{ has a root in } [1,2]. \\]`;
			let desc=f1<0 && f2>0 ? "f(1)<0, f(2)>0" : "f(1)>0, f(2)<0";
			plainCorrectAnswer=desc;
			latexAnswer=desc;
			expectedFormat="Explain briefly";
			choices=[desc];
			choices.push("f(1)>0, f(2)>0");
			choices.push("f(1)<0, f(2)<0");
			choices.push("f(1)=0, f(2)=0");
			choices.push("f is continuous");
			break;
		}
		case "selectProcedure":{
			let options=["Factoring","Rationalizing","Squeeze theorem","Direct substitution"];
			let correctIdx=2;
			plainCorrectAnswer=options[correctIdx];
			latexAnswer=`\\text{${options[correctIdx]}}`;
			mathExpression=`\\[ \\lim_{x\\to 0} \\frac{\\sin ${maxCoeff}x}{x} \\] Which procedure is most efficient? A) ${options[0]} B) ${options[1]} C) ${options[2]} D) ${options[3]}`;
			expectedFormat="Enter the letter of the correct option (A, B, C, or D)";
			choices=[options[correctIdx]];
			for(let i=0;i<options.length;i++) if(i!==correctIdx) choices.push(options[i]);
			break;
		}
		case "instantaneousRateConceptual":{
			let t0=Math.floor(Math.random()*3)+1;
			let s=(t: number)=>t*t;
			let avgVelOverInterval=(s(t0+0.1)-s(t0))/0.1;
			let exactInstVel=2*t0;
			mathExpression=`\\[ \\text{The position of a particle is given by } s(t)=t^2 \\text{ (meters).} \\] \\[ \\text{(a) Find the average velocity from } t=${t0} \\text{ to } t=${(t0+0.1).toFixed(1)}. \\] \\[ \\text{(b) Find the instantaneous velocity at } t=${t0} \\text{ using the limit definition.} \\] \\[ \\text{(c) Explain why the limit gives the instantaneous rate of change.} \\]`;
			plainCorrectAnswer=`avg=${avgVelOverInterval.toFixed(2)} inst=${exactInstVel} The limit of average velocities as the time interval shrinks to zero gives the exact instantaneous rate.`;
			latexAnswer=`\\text{avg}=${avgVelOverInterval.toFixed(2)},\\ \\text{inst}=${exactInstVel}`;
			expectedFormat="Enter avg=..., inst=... and a brief explanation";
			choices=[`avg=${avgVelOverInterval.toFixed(2)} inst=${exactInstVel}`];
			choices.push(`avg=${(avgVelOverInterval+0.5).toFixed(2)} inst=${exactInstVel}`);
			choices.push(`avg=${avgVelOverInterval.toFixed(2)} inst=${exactInstVel+1}`);
			choices.push(`avg=${(avgVelOverInterval-0.5).toFixed(2)} inst=${exactInstVel-1}`);
			break;
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
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(plainCorrectAnswer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=plainCorrectAnswer;
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