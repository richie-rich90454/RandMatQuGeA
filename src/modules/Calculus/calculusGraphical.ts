import type {RngFn, QuestionDto} from "../../types/global";
import {getMaxCoeff} from "./calculusUtils.js";
/**
 * Generates a random "graphical calculus" question involving visual or tabular data.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * The function randomly selects a question type from a predefined list, constructs
 * a mathematical expression (often including LaTeX tables or references to drawn
 * graphs), draws an appropriate canvas if needed, and appends the content to the
 * global `questionArea` element. It triggers MathJax rendering and sets global
 * variables for answer validation.
 *
 * Added AP topics: slope field sketching, matching DE to slope field, reasoning
 * from slope field, equilibrium solutions, phase lines.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`)
 *                     that influences the maximum coefficient value used in
 *                     generated expressions. If omitted, a default moderate value
 *                     is used (via `getMaxCoeff`).
 * @returns QuestionDto
 * @date 2026-04-18
 *
 * @example
 * generateGraphicalCalculus();
 * generateGraphicalCalculus("hard");
 */
export function generateGraphicalCalculus(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let questionTypes=["limitFromGraph","multipleReps","estimateDerivTable","diffContinuity","inverseFunc","invTrigDeriv","selectProcedure","derivContext","riemannSum","riemannNotation","accumFTC","accumBehavior","definiteProps","longDivision","flowAccum","instantChange","derivativeLimit","sketchSlopeField","matchSlopeField","reasonSlopeField","equilibriumSolutions","phaseLine"];
	let questionType=questionTypes[Math.floor(rng()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	let choices: string[]=[];
	switch(questionType){
		case "limitFromGraph":{
			let coeff=Math.floor(rng()*maxCoeff)+1;
			let holeX=Math.floor(rng()*3);
			let holeY=coeff*holeX*holeX;
			mathExpression=`\\[ \\lim_{x\\to ${holeX}} f(x)=? \\]`;
			plainCorrectAnswer=holeY.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			choices=[plainCorrectAnswer];
			choices.push((holeY+1).toString());
			choices.push((holeY-1).toString());
			choices.push((coeff*(holeX+1)*(holeX+1)).toString());
			choices.push((coeff*(holeX-1)*(holeX-1)).toString());
			break;
		}
		case "multipleReps":{
			let a=Math.floor(rng()*maxCoeff)+1;
			let b=Math.floor(rng()*maxCoeff)+1;
			let c=Math.floor(rng()*4)+1;
			let table=`\\begin{array}{c|c} x & f(x) \\\\ ${c-0.1} & ${a*Math.pow(c-0.1,2)+b} \\\\ ${c+0.1} & ${a*Math.pow(c+0.1,2)+b} \\end{array}`;
			mathExpression=`\\[ \\text{Graph and table given, find } \\lim_{x\\to ${c}} f(x). \\] ${table}`;
			let correctVal=a*c*c+b;
			plainCorrectAnswer=correctVal.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			choices=[plainCorrectAnswer];
			choices.push((correctVal+1).toString());
			choices.push((correctVal-1).toString());
			choices.push((a*Math.pow(c+0.1,2)+b).toString());
			choices.push((a*Math.pow(c-0.1,2)+b).toString());
			break;
		}
		case "estimateDerivTable":{
			let x0=Math.floor(rng()*3)+2;
			let h=0.1;
			let vals=[];
			for(let i=-2;i<=2;i++){
				vals.push(Math.exp(x0+i*h));
			}
			let tableStr="";
			for(let i=0;i<5;i++){
				tableStr+=`${(x0+(i-2)*h).toFixed(1)} & ${vals[i].toFixed(4)}\\\\`;
			}
			mathExpression=`\\[ \\text{Table:} \\begin{array}{c|c} x & f(x) \\\\ ${tableStr} \\end{array} \\text{ Estimate } f'(${x0}). \\]`;
			let derivEst=(vals[3]-vals[1])/(2*h);
			plainCorrectAnswer=derivEst.toFixed(4);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a decimal";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.1).toFixed(4));
			choices.push((correctNum-0.1).toFixed(4));
			choices.push(((vals[4]-vals[0])/(4*h)).toFixed(4));
			choices.push(((vals[2]-vals[2])/(h)).toFixed(4));
			break;
		}
		case "diffContinuity":{
			let x0=Math.floor(rng()*3);
			mathExpression=`\\[ \\text{Is } f(x)=|x-${x0}| \\text{ differentiable at } x=${x0}? \\]`;
			plainCorrectAnswer="no";
			latexAnswer="\\text{no}";
			expectedFormat="Enter yes or no";
			choices=["no","yes","maybe","only if continuous"];
			break;
		}
		case "inverseFunc":{
			let fVal=Math.floor(rng()*5)+2;
			let fPrime=Math.floor(rng()*maxCoeff)+1;
			let a=Math.floor(rng()*5)+1;
			mathExpression=`\\[ f(${a})=${fVal}, f'(${a})=${fPrime}. \\text{ Find } (f^{-1})'(${fVal}). \\]`;
			let correct=1/fPrime;
			plainCorrectAnswer=correct.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			choices=[plainCorrectAnswer];
			choices.push((1/(fPrime+1)).toFixed(3));
			choices.push((1/(fPrime-1)).toFixed(3));
			choices.push(fPrime.toFixed(3));
			choices.push((1/fVal).toFixed(3));
			break;
		}
		case "invTrigDeriv":{
			let a=Math.floor(rng()*maxCoeff)+1;
			mathExpression=`\\[ \\frac{d}{dx}[\\arctan(${a}x)] \\]`;
			plainCorrectAnswer=`${a}/(1+${a*a}x^2)`;
			latexAnswer=`\\frac{${a}}{1+${a*a}x^{2}}`;
			expectedFormat="Enter expression";
			choices=[plainCorrectAnswer];
			choices.push(`${a}/(1+x^2)`);
			choices.push(`${a}/(1+${a*a}x)`);
			choices.push(`${a}/(1+${a*a}x^2)*${a}`);
			choices.push(`${a}*x/(1+${a*a}x^2)`);
			break;
		}
		case "selectProcedure":{
			let options=["Product and chain","Chain only","Quotient","Product only"];
			let correctIdx=Math.floor(rng()*options.length);
			let correctLetter=String.fromCharCode(65+correctIdx);
			plainCorrectAnswer=correctLetter;
			latexAnswer=`\\text{${options[correctIdx]}}`;
			mathExpression=`\\[ f(x)=x^2 e^{${maxCoeff}x} \\cos x \\] Which rule(s)? A) ${options[0]} B) ${options[1]} C) ${options[2]} D) ${options[3]}`;
			expectedFormat="Enter letter (A, B, C, or D)";
			choices=["A","B","C","D"];
			break;
		}
		case "derivContext":{
			let rate=Math.floor(rng()*10)+5;
			mathExpression=`\\[ \\text{Volume increasing at } ${rate} \\text{ cm}^3/s. \\text{ What does } V'(t) \\text{ represent?} \\]`;
			plainCorrectAnswer="rate of change of volume";
			latexAnswer="\\text{rate of change of volume}";
			expectedFormat="Enter description";
			choices=[plainCorrectAnswer];
			choices.push("volume");
			choices.push("rate of change of radius");
			choices.push("acceleration");
			choices.push("speed");
			break;
		}
		case "riemannSum":{
			let a=Math.floor(rng()*3)+1;
			let b=a+Math.floor(rng()*3)+2;
			let n=Math.floor(rng()*3)+4;
			mathExpression=`\\[ \\text{Left Riemann sum for } \\int_{${a}}^{${b}} x^2 \\,dx \\text{ with } n=${n}. \\]`;
			let delta=(b-a)/n;
			let sum=0;
			for(let i=0;i<n;i++){
				let x=a+i*delta;
				sum+=x*x*delta;
			}
			plainCorrectAnswer=sum.toFixed(3);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.5).toFixed(3));
			choices.push((correctNum-0.5).toFixed(3));
			choices.push((correctNum*1.1).toFixed(3));
			choices.push((correctNum*0.9).toFixed(3));
			break;
		}
		case "riemannNotation":{
			let a=Math.floor(rng()*3)+1;
			let b=a+Math.floor(rng()*3)+2;
			let n=Math.floor(rng()*10)+10;
			let delta=(b-a)/n;
			mathExpression=`\\[ \\lim_{n\\to\\infty} \\sum_{i=1}^n \\left(${a}+${delta}i\\right)^2 \\cdot ${delta} \\text{ as definite integral.} \\]`;
			plainCorrectAnswer=`\\int_{${a}}^{${b}} x^2 \\,dx`;
			latexAnswer=`\\int_{${a}}^{${b}} x^{2}\\,dx`;
			expectedFormat="Enter integral";
			choices=[plainCorrectAnswer];
			choices.push(`\\int_{${a}}^{${b}} x \\,dx`);
			choices.push(`\\int_{${a}}^{${b}} x^3 \\,dx`);
			choices.push(`\\int_{${a}}^{${b}} (x^2+1) \\,dx`);
			choices.push(`\\int_{${a}}^{${b}} 2x \\,dx`);
			break;
		}
		case "accumFTC":{
			let a=Math.floor(rng()*3)+1;
			let x0=Math.floor(rng()*3)+2;
			mathExpression=`\\[ F(x)=\\int_{${a}}^x f(t)\\,dt, \\text{ find } F'(${x0}). \\]`;
			plainCorrectAnswer=(x0).toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((x0+1).toString());
			choices.push((x0-1).toString());
			choices.push((a).toString());
			choices.push((x0*a).toString());
			break;
		}
		case "accumBehavior":{
			let a=Math.floor(rng()*2)+1;
			mathExpression=`\\[ g(x)=\\int_0^x f(t)\\,dt, \\text{ where increasing?} \\]`;
			plainCorrectAnswer=`(${a}, ${a+2})`;
			latexAnswer=`(${a},${a+2})`;
			expectedFormat="Enter interval";
			choices=[plainCorrectAnswer];
			choices.push(`(${a-1}, ${a+1})`);
			choices.push(`(${a+1}, ${a+3})`);
			choices.push(`(${0}, ${a})`);
			choices.push(`(${a+2}, ${a+4})`);
			break;
		}
		case "definiteProps":{
			let int1=Math.floor(rng()*5)+1;
			let int2=Math.floor(rng()*5)+1;
			let a=Math.floor(rng()*3)+1;
			let b=a+Math.floor(rng()*3)+1;
			let c=b+Math.floor(rng()*3)+1;
			mathExpression=`\\[ \\int_{${a}}^{${b}} f=${int1}, \\int_{${b}}^{${c}} f=${int2}, \\text{ find } \\int_{${a}}^{${c}} f. \\]`;
			let correct=int1+int2;
			plainCorrectAnswer=correct.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			choices=[plainCorrectAnswer];
			choices.push((int1-int2).toString());
			choices.push((int2-int1).toString());
			choices.push((int1*int2).toString());
			choices.push((int1/int2).toString());
			break;
		}
		case "longDivision":{
			let a=Math.floor(rng()*maxCoeff)+1;
			mathExpression=`\\[ \\int \\frac{x^3}{x^2+${a}} \\,dx \\]`;
			plainCorrectAnswer=`(1/2)x^2 - ${a/2}ln|x^2+${a}| + C`;
			latexAnswer=`\\frac{1}{2}x^{2} - \\frac{${a}}{2}\\ln|x^{2}+${a}| + C`;
			expectedFormat="Enter expression";
			choices=[plainCorrectAnswer];
			choices.push(`(1/2)x^2 + ${a/2}ln|x^2+${a}| + C`);
			choices.push(`x - ${a}ln|x^2+${a}| + C`);
			choices.push(`(1/2)x^2 - ${a}ln|x^2| + C`);
			choices.push(`x^2 - ${a/2}ln|x^2+${a}| + C`);
			break;
		}
		case "flowAccum":{
			let rate=Math.floor(rng()*5)+5;
			let tMax=Math.floor(rng()*3)+3;
			mathExpression=`\\[ r(t)=${rate}-t \\text{ gal/min. Water from } t=0 \\text{ to } t=${tMax}. \\]`;
			let accum=rate*tMax - tMax*tMax/2;
			plainCorrectAnswer=accum.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter number";
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((rate*tMax).toFixed(2));
			choices.push((tMax*tMax/2).toFixed(2));
			break;
		}
		case "instantChange":{
			mathExpression=`\\[ \\text{Explain how limits give instantaneous velocity.} \\]`;
			plainCorrectAnswer="average velocity approaches instantaneous as interval shrinks";
			latexAnswer="\\text{average velocity approaches instantaneous as interval shrinks}";
			expectedFormat="Enter explanation";
			choices=[plainCorrectAnswer];
			choices.push("velocity is constant");
			choices.push("instantaneous velocity is the slope of the secant line");
			choices.push("limit of average velocity as time interval goes to zero");
			choices.push("derivative of position gives velocity");
			break;
		}
		case "derivativeLimit":{
			let a=Math.floor(rng()*maxCoeff)+1;
			let b=Math.floor(rng()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=${a}x+${b}, \\text{ use limit definition to find } f'(x). \\]`;
			plainCorrectAnswer=a.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter expression";
			choices=[plainCorrectAnswer];
			choices.push((a+1).toString());
			choices.push((a-1).toString());
			choices.push((b).toString());
			choices.push(`${a}x+${b}`);
			break;
		}
		case "sketchSlopeField":{
			let a=Math.floor(rng()*maxCoeff)+1;
			mathExpression=`\\[ \\frac{dy}{dx}=${a}x-y \\] Sketch slope field at points (-1,-1), (-1,0), (-1,1), (0,-1), (0,0), (0,1), (1,-1), (1,0), (1,1). Describe pattern.`;
			plainCorrectAnswer="slopes: left negative, center zero, right positive; increases with x";
			latexAnswer="\\text{slopes increase with }x";
			expectedFormat="Describe slope field";
			choices=[plainCorrectAnswer];
			choices.push("all slopes positive");
			choices.push("all slopes negative");
			choices.push("slopes depend only on y");
			break;
		}
		case "matchSlopeField":{
			let eqs=["dy/dx = y(2-y)", "dy/dx = y", "dy/dx = x", "dy/dx = -y"];
			let correctIdx=Math.floor(rng()*eqs.length);
			let correctLetter=String.fromCharCode(65+correctIdx);
			plainCorrectAnswer=correctLetter;
			latexAnswer=`\\text{${eqs[correctIdx]}}`;
			mathExpression=`\\[ \\text{Which DE matches slope field with horizontal lines at y=0 and y=2?} \\] A) ${eqs[0]} B) ${eqs[1]} C) ${eqs[2]} D) ${eqs[3]}`;
			expectedFormat="Enter letter (A, B, C, or D)";
			choices=["A","B","C","D"];
			break;
		}
		case "reasonSlopeField":{
			let a=Math.floor(rng()*maxCoeff)+1;
			mathExpression=`\\[ \\frac{dy}{dx}=${a}x^2-y \\] Sketch solution through (0,1). Long-term behavior as x→∞?`;
			plainCorrectAnswer="y grows like quadratic";
			latexAnswer="\\text{y grows like quadratic}";
			expectedFormat="Describe behavior";
			choices=["y→∞","y→0","y→constant","oscillates"];
			break;
		}
		case "equilibriumSolutions":{
			let K=Math.floor(rng()*maxCoeff)+3;
			mathExpression=`\\[ \\frac{dy}{dx}=y(${K}-y) \\] Find equilibria and classify.`;
			plainCorrectAnswer=`y=0 unstable, y=${K} stable`;
			latexAnswer=`y=0\\text{ unstable}, y=${K}\\text{ stable}`;
			expectedFormat="Enter equilibria and stability";
			choices=[plainCorrectAnswer];
			choices.push(`y=0 stable, y=${K} unstable`);
			choices.push(`y=0 semi-stable, y=${K} stable`);
			choices.push(`y=0 unstable, y=${K} unstable`);
			break;
		}
		case "phaseLine":{
			let a=Math.floor(rng()*maxCoeff)+2;
			mathExpression=`\\[ \\frac{dy}{dt}=y^2-${a}y \\] Draw phase line.`;
			plainCorrectAnswer=`equilibria at y=0 and y=${a}; 0 stable, ${a} unstable`;
			latexAnswer=`y=0\\text{ stable}, y=${a}\\text{ unstable}`;
			expectedFormat="Describe phase line";
			choices=[plainCorrectAnswer];
			choices.push(`0 unstable, ${a} stable`);
			choices.push(`0 semi-stable, ${a} stable`);
			choices.push(`both unstable`);
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(plainCorrectAnswer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=plainCorrectAnswer;
		else uniqueChoices=[plainCorrectAnswer];
	}
	return {
		latex: mathExpression,
		correct: plainCorrectAnswer,
		alternate: plainCorrectAnswer,
		display: latexAnswer,
		choices: uniqueChoices,
		expectedFormat
	};
}
