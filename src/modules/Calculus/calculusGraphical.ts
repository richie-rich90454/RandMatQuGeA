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
 * @returns void
 * @date 2026-04-02
 *
 * @example
 * generateGraphicalCalculus();
 * generateGraphicalCalculus("hard");
 */
import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";

function getAppropriateStep(range: number, targetTicks: number=6): number{
	if (range<=0) return 1;
	let rawStep=range/targetTicks;
	let magnitude=Math.pow(10, Math.floor(Math.log10(rawStep)));
	let normalized=rawStep/magnitude;
	if (normalized < 1.5) return magnitude*1;
	else if (normalized < 3) return magnitude*2;
	else if (normalized < 7) return magnitude*5;
	else return magnitude*10;
}
export function generateGraphicalCalculus(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["limitFromGraph","multipleReps","estimateDerivTable","diffContinuity","inverseFunc","invTrigDeriv","selectProcedure","derivContext","riemannSum","riemannNotation","accumFTC","accumBehavior","definiteProps","longDivision","flowAccum","instantChange","derivativeLimit","sketchSlopeField","matchSlopeField","reasonSlopeField","equilibriumSolutions","phaseLine"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	let canvas: HTMLCanvasElement|null=null;
	let choices: string[]=[];
	switch (questionType){
		case "limitFromGraph":{
			let coeff=Math.floor(Math.random()*maxCoeff)+1;
			let holeX=Math.floor(Math.random()*3);
			let holeY=coeff*holeX*holeX;
			canvas=drawLimitGraph(coeff, holeX, holeY);
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
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*4)+1;
			canvas=drawQuadraticGraph(a, b, -2, 4);
			let table=`\\begin{array}{c|c} x & f(x) \\\\ ${c-0.1} & ${a*(c-0.1)**2+b} \\\\ ${c+0.1} & ${a*(c+0.1)**2+b} \\end{array}`;
			mathExpression=`\\[ \\text{Graph and table given, find } \\lim_{x\\to ${c}} f(x). \\] ${table}`;
			let correctVal=a*c*c+b;
			plainCorrectAnswer=correctVal.toString();
			latexAnswer=plainCorrectAnswer;
			expectedFormat="Enter a number";
			choices=[plainCorrectAnswer];
			choices.push((correctVal+1).toString());
			choices.push((correctVal-1).toString());
			choices.push((a*(c+0.1)*(c+0.1)+b).toString());
			choices.push((a*(c-0.1)*(c-0.1)+b).toString());
			break;
		}
		case "estimateDerivTable":{
			let x0=Math.floor(Math.random()*3)+2;
			let h=0.1;
			let vals=[];
			for (let i=-2; i<=2; i++){
				vals.push(Math.exp(x0+i*h));
			}
			let tableStr="";
			for (let i=0; i<5; i++){
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
			let x0=Math.floor(Math.random()*3);
			canvas=drawAbsoluteGraph(x0);
			mathExpression=`\\[ \\text{Is } f(x)=|x-${x0}| \\text{ differentiable at } x=${x0}? \\]`;
			plainCorrectAnswer="no";
			latexAnswer="\\text{no}";
			expectedFormat="Enter yes or no";
			choices=["no", "yes", "maybe", "only if continuous"];
			break;
		}
		case "inverseFunc":{
			let fVal=Math.floor(Math.random()*5)+2;
			let fPrime=Math.floor(Math.random()*maxCoeff)+1;
			let a=Math.floor(Math.random()*5)+1;
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
			let a=Math.floor(Math.random()*maxCoeff)+1;
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
			let correctIdx=Math.floor(Math.random()*options.length);
			plainCorrectAnswer=options[correctIdx];
			latexAnswer=`\\text{${options[correctIdx]}}`;
			mathExpression=`\\[ f(x)=x^2 e^{${maxCoeff}x} \\cos x \\] Which rule(s)? A) ${options[0]} B) ${options[1]} C) ${options[2]} D) ${options[3]}`;
			expectedFormat="Enter letter";
			choices=[options[correctIdx]];
			for (let i=0;i<options.length;i++){
				if (i!==correctIdx) choices.push(options[i]);
			}
			break;
		}
		case "derivContext":{
			let rate=Math.floor(Math.random()*10)+5;
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
			let a=Math.floor(Math.random()*3)+1;
			let b=a+Math.floor(Math.random()*3)+2;
			let n=Math.floor(Math.random()*3)+4;
			canvas=drawRiemannSum(a, b, n);
			mathExpression=`\\[ \\text{Left Riemann sum for } \\int_{${a}}^{${b}} x^2 \\,dx \\text{ with } n=${n}. \\]`;
			let delta=(b-a)/n;
			let sum=0;
			for (let i=0; i<n; i++){
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
			let a=Math.floor(Math.random()*3)+1;
			let b=a+Math.floor(Math.random()*3)+2;
			let n=Math.floor(Math.random()*10)+10;
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
			let a=Math.floor(Math.random()*3)+1;
			let x0=Math.floor(Math.random()*3)+2;
			canvas=drawAccumGraph(a, x0);
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
			let a=Math.floor(Math.random()*3)+1;
			canvas=drawAccumGraph2(a);
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
			let int1=Math.floor(Math.random()*5)+1;
			let int2=Math.floor(Math.random()*5)+1;
			let a=Math.floor(Math.random()*3)+1;
			let b=a+Math.floor(Math.random()*3)+1;
			let c=b+Math.floor(Math.random()*3)+1;
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
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int \\frac{x^3}{x^2+${a}} \\,dx \\]`;
			plainCorrectAnswer=`(1/2)x^2 - ${a}ln|x^2+${a}| + C`;
			latexAnswer=`\\frac{1}{2}x^{2} - ${a}\\ln|x^{2}+${a}| + C`;
			expectedFormat="Enter expression";
			choices=[plainCorrectAnswer];
			choices.push(`(1/2)x^2 + ${a}ln|x^2+${a}| + C`);
			choices.push(`x - ${a}ln|x^2+${a}| + C`);
			choices.push(`(1/2)x^2 - ${a}ln|x^2| + C`);
			choices.push(`x^2 - ${a}ln|x^2+${a}| + C`);
			break;
		}
		case "flowAccum":{
			let rate=Math.floor(Math.random()*5)+5;
			let tMax=Math.floor(Math.random()*3)+3;
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
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
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
			let a=Math.floor(Math.random()*maxCoeff)+1;
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
			let correctIdx=Math.floor(Math.random()*eqs.length);
			plainCorrectAnswer=eqs[correctIdx];
			latexAnswer=`\\text{${eqs[correctIdx]}}`;
			mathExpression=`\\[ \\text{Which DE matches slope field with horizontal lines at y=0 and y=2?} \\] A) ${eqs[0]} B) ${eqs[1]} C) ${eqs[2]} D) ${eqs[3]}`;
			expectedFormat="Enter letter";
			choices=[plainCorrectAnswer];
			for (let i=0;i<eqs.length;i++) if (i!==correctIdx) choices.push(eqs[i]);
			break;
		}
		case "reasonSlopeField":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\frac{dy}{dx}=${a}x^2-y \\] Sketch solution through (0,1). Long-term behavior as x→∞?`;
			plainCorrectAnswer="y grows like quadratic";
			latexAnswer="\\text{y grows like quadratic}";
			expectedFormat="Describe behavior";
			choices=["y→∞", "y→0", "y→constant", "oscillates"];
			break;
		}
		case "equilibriumSolutions":{
			let K=Math.floor(Math.random()*maxCoeff)+3;
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
			let a=Math.floor(Math.random()*maxCoeff)+2;
			mathExpression=`\\[ \\frac{dy}{dt}=y^2-${a}y \\] Draw phase line.`;
			plainCorrectAnswer=`equilibria at y=0 and y=${a}; 0 unstable, ${a} stable`;
			latexAnswer=`y=0\\text{ unstable}, y=${a}\\text{ stable}`;
			expectedFormat="Describe phase line";
			choices=[plainCorrectAnswer];
			choices.push(`0 stable, ${a} unstable`);
			choices.push(`0 semi-stable, ${a} stable`);
			choices.push(`both unstable`);
			break;
		}
	}
	if (canvas){
		questionArea.appendChild(canvas);
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(plainCorrectAnswer)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=plainCorrectAnswer;
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
function drawLimitGraph(coeff: number, holeX: number, holeY: number): HTMLCanvasElement{
	let canvas=document.createElement("canvas");
	canvas.width=300;
	canvas.height=200;
	let ctx=canvas.getContext("2d");
	if (!ctx) return canvas;
	ctx.clearRect(0,0,300,200);
	let xMin=-2, xMax=2;
	let yMax=coeff*Math.max(xMin*xMin, xMax*xMax);
	let scaleY=150/yMax;
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	ctx.moveTo(150,50);
	ctx.lineTo(150,150);
	ctx.stroke();
	ctx.fillStyle="#000";
	ctx.font="10px sans-serif";
	ctx.textAlign="center";
	ctx.textBaseline="top";
	for (let x=-2; x<=2; x+=1){
		let screenX=150+50*x;
		ctx.beginPath();
		ctx.moveTo(screenX, 145);
		ctx.lineTo(screenX, 155);
		ctx.strokeStyle="#888";
		ctx.lineWidth=1;
		ctx.stroke();
		ctx.fillText(x.toString(), screenX, 160);
	}
	ctx.textAlign="right";
	ctx.textBaseline="middle";
	let yStep=getAppropriateStep(yMax, 6);
	for (let y=0; y<=yMax; y+=yStep){
		let screenY=150 - scaleY*y;
		if (screenY < 50 || screenY > 150) continue;
		ctx.beginPath();
		ctx.moveTo(145, screenY);
		ctx.lineTo(155, screenY);
		ctx.stroke();
		ctx.fillText(y.toFixed(yStep>=1?0:1), 140, screenY);
	}
	ctx.fillStyle="#000";
	ctx.font="12px sans-serif";
	ctx.fillText("x", 240, 140);
	ctx.fillText("y", 160, 60);
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	for (let x=-2; x<=2; x+=0.1){
		let screenX=150+50*x;
		let y=coeff*x*x;
		let screenY=150 - scaleY*y;
		if (x===-2) ctx.moveTo(screenX, screenY);
		else ctx.lineTo(screenX, screenY);
	}
	ctx.stroke();
	ctx.beginPath();
	let holeScreenX=150+50*holeX;
	let holeScreenY=150 - scaleY*holeY;
	ctx.arc(holeScreenX, holeScreenY, 3, 0, 2*Math.PI);
	ctx.fillStyle="white";
	ctx.fill();
	ctx.strokeStyle="red";
	ctx.stroke();
	return canvas;
}
function drawAbsoluteGraph(cornerX: number): HTMLCanvasElement{
	let canvas=document.createElement("canvas");
	canvas.width=300;
	canvas.height=200;
	let ctx=canvas.getContext("2d");
	if (!ctx) return canvas;
	ctx.clearRect(0,0,300,200);
	let xMin=cornerX - 2;
	let xMax=cornerX + 2;
	let scaleX=200/(xMax - xMin);
	let yMax=Math.max(Math.abs(xMin - cornerX), Math.abs(xMax - cornerX));
	let scaleY=150/yMax;
	let xAxisScreen=50 + (0 - xMin)*scaleX;
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	if (xAxisScreen >= 50&&xAxisScreen<=250){
		ctx.moveTo(xAxisScreen, 50);
		ctx.lineTo(xAxisScreen, 150);
	}
	ctx.stroke();
	ctx.fillStyle="#000";
	ctx.font="10px sans-serif";
	ctx.textAlign="center";
	ctx.textBaseline="top";
	let xStep=1;
	for (let x=Math.ceil(xMin); x<=Math.floor(xMax); x+=xStep){
		let screenX=50 + (x - xMin)*scaleX;
		if (screenX < 50 || screenX > 250) continue;
		ctx.beginPath();
		ctx.moveTo(screenX, 145);
		ctx.lineTo(screenX, 155);
		ctx.strokeStyle="#888";
		ctx.lineWidth=1;
		ctx.stroke();
		ctx.fillText(x.toString(), screenX, 160);
	}
	if (xAxisScreen >= 50&&xAxisScreen<=250){
		ctx.textAlign="right";
		ctx.textBaseline="middle";
		let yStep=getAppropriateStep(yMax, 6);
		for (let y=0; y<=yMax; y+=yStep){
			let screenY=150 - scaleY*y;
			if (screenY < 50 || screenY > 150) continue;
			ctx.beginPath();
			ctx.moveTo(xAxisScreen - 5, screenY);
			ctx.lineTo(xAxisScreen + 5, screenY);
			ctx.stroke();
			ctx.fillText(y.toFixed(yStep>=1?0:1), xAxisScreen - 8, screenY);
		}
	}
	ctx.fillStyle="#000";
	ctx.font="12px sans-serif";
	ctx.fillText("x", 240, 140);
	ctx.fillText("y", 160, 60);
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	for (let x=xMin; x<=xMax; x+=0.05){
		let screenX=50 + (x - xMin)*scaleX;
		let y=Math.abs(x - cornerX);
		let screenY=150 - scaleY*y;
		if (x===xMin) ctx.moveTo(screenX, screenY);
		else ctx.lineTo(screenX, screenY);
	}
	ctx.stroke();
	return canvas;
}
function drawQuadraticGraph(a: number, b: number, xMin: number, xMax: number): HTMLCanvasElement{
	let canvas=document.createElement("canvas");
	canvas.width=300;
	canvas.height=200;
	let ctx=canvas.getContext("2d");
	if (!ctx) return canvas;
	ctx.clearRect(0,0,300,200);
	let yMin=Infinity, yMax=-Infinity;
	for (let x=xMin; x<=xMax; x+=0.1){
		let y=a*x*x + b;
		if (y < yMin) yMin=y;
		if (y > yMax) yMax=y;
	}
	let k=Infinity;
	if (yMax > 0) k=Math.min(k, 150/yMax);
	if (yMin < 0) k=Math.min(k, 50/Math.abs(yMin));
	if (k === Infinity) k=1;
	let scaleX=200/(xMax - xMin);
	let xAxisScreen=50 + (0 - xMin)*scaleX;
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	if (xAxisScreen >= 50&&xAxisScreen<=250){
		ctx.moveTo(xAxisScreen, 50);
		ctx.lineTo(xAxisScreen, 150);
	}
	ctx.stroke();
	ctx.fillStyle="#000";
	ctx.font="10px sans-serif";
	ctx.textAlign="center";
	ctx.textBaseline="top";
	let xStep=(xMax - xMin)<=4 ? 1 : 2;
	for (let x=Math.ceil(xMin); x<=Math.floor(xMax); x+=xStep){
		let screenX=50 + (x - xMin)*scaleX;
		if (screenX < 50 || screenX > 250) continue;
		ctx.beginPath();
		ctx.moveTo(screenX, 145);
		ctx.lineTo(screenX, 155);
		ctx.strokeStyle="#888";
		ctx.lineWidth=1;
		ctx.stroke();
		ctx.fillText(x.toString(), screenX, 160);
	}
	if (xAxisScreen >= 50&&xAxisScreen<=250){
		ctx.textAlign="right";
		ctx.textBaseline="middle";
		let yRange=yMax - yMin;
		let yStep=getAppropriateStep(yRange, 6);
		for (let y=Math.ceil(yMin/yStep)*yStep; y<=yMax; y+=yStep){
			let screenY=150 - k*y;
			if (screenY < 50 || screenY > 200) continue;
			ctx.beginPath();
			ctx.moveTo(xAxisScreen - 5, screenY);
			ctx.lineTo(xAxisScreen + 5, screenY);
			ctx.stroke();
			ctx.fillText(y.toFixed(yStep>=1?0:1), xAxisScreen - 8, screenY);
		}
	}
	ctx.fillStyle="#000";
	ctx.font="12px sans-serif";
	ctx.fillText("x", 240, 140);
	ctx.fillText("y", 160, 60);
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	for (let x=xMin; x<=xMax; x+=0.05){
		let screenX=50 + (x - xMin)*scaleX;
		let y=a*x*x + b;
		let screenY=150 - k*y;
		if (x===xMin) ctx.moveTo(screenX, screenY);
		else ctx.lineTo(screenX, screenY);
	}
	ctx.stroke();
	return canvas;
}
function drawRiemannSum(a: number, b: number, n: number): HTMLCanvasElement{
	let canvas=document.createElement("canvas");
	canvas.width=300;
	canvas.height=200;
	let ctx=canvas.getContext("2d");
	if (!ctx) return canvas;
	ctx.clearRect(0,0,300,200);
	let yMax=Math.max(a*a, b*b);
	let scaleY=150/yMax;
	let scaleX=200/(b - a);
	let xAxisScreen=50 + (0 - a)*scaleX;
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	if (xAxisScreen >= 50&&xAxisScreen<=250){
		ctx.moveTo(xAxisScreen, 50);
		ctx.lineTo(xAxisScreen, 150);
	}
	ctx.stroke();
	ctx.fillStyle="#000";
	ctx.font="10px sans-serif";
	ctx.textAlign="center";
	ctx.textBaseline="top";
	let xStep=(b - a)<=4 ? 1 : 2;
	for (let x=Math.ceil(a); x<=Math.floor(b); x+=xStep){
		let screenX=50 + (x - a)*scaleX;
		if (screenX < 50 || screenX > 250) continue;
		ctx.beginPath();
		ctx.moveTo(screenX, 145);
		ctx.lineTo(screenX, 155);
		ctx.strokeStyle="#888";
		ctx.lineWidth=1;
		ctx.stroke();
		ctx.fillText(x.toString(), screenX, 160);
	}
	if (xAxisScreen >= 50&&xAxisScreen<=250){
		ctx.textAlign="right";
		ctx.textBaseline="middle";
		let yStep=getAppropriateStep(yMax, 6);
		for (let y=0; y<=yMax; y+=yStep){
			let screenY=150 - scaleY*y;
			if (screenY < 50 || screenY > 150) continue;
			ctx.beginPath();
			ctx.moveTo(xAxisScreen - 5, screenY);
			ctx.lineTo(xAxisScreen + 5, screenY);
			ctx.stroke();
			ctx.fillText(y.toFixed(yStep>=1?0:1), xAxisScreen - 8, screenY);
		}
	}
	ctx.fillStyle="#000";
	ctx.font="12px sans-serif";
	ctx.fillText("x", 240, 140);
	ctx.fillText("y", 160, 60);
	let delta=(b - a)/n;
	for (let i=0; i<n; i++){
		let xLeft=a + i*delta;
		let xRight=xLeft + delta;
		let y=xLeft*xLeft;
		let screenX1=50 + (xLeft - a)*scaleX;
		let screenX2=50 + (xRight - a)*scaleX;
		let screenY=150 - scaleY*y;
		ctx.fillStyle="rgba(0,0,255,0.2)";
		ctx.fillRect(screenX1, screenY, screenX2 - screenX1, 150 - screenY);
	}
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	for (let x=a; x<=b; x+=0.05){
		let screenX=50 + (x - a)*scaleX;
		let y=x*x;
		let screenY=150 - scaleY*y;
		if (x===a) ctx.moveTo(screenX, screenY);
		else ctx.lineTo(screenX, screenY);
	}
	ctx.stroke();
	return canvas;
}
function drawAccumGraph(a: number, x0: number): HTMLCanvasElement{
	let canvas=document.createElement("canvas");
	canvas.width=300;
	canvas.height=200;
	let ctx=canvas.getContext("2d");
	if (!ctx) return canvas;
	ctx.clearRect(0,0,300,200);
	let xMin=-1, xMax=4;
	let scaleX=200/(xMax - xMin);
	let yMin=xMin, yMax=xMax;
	let k=Infinity;
	if (yMax > 0) k=Math.min(k, 150/yMax);
	if (yMin < 0) k=Math.min(k, 50/Math.abs(yMin));
	if (k === Infinity) k=1;
	let xAxisScreen=50 + (0 - xMin)*scaleX;
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	if (xAxisScreen >= 50&&xAxisScreen<=250){
		ctx.moveTo(xAxisScreen, 50);
		ctx.lineTo(xAxisScreen, 150);
	}
	ctx.stroke();
	ctx.fillStyle="#000";
	ctx.font="10px sans-serif";
	ctx.textAlign="center";
	ctx.textBaseline="top";
	let xStep=1;
	for (let x=Math.ceil(xMin); x<=Math.floor(xMax); x+=xStep){
		let screenX=50 + (x - xMin)*scaleX;
		if (screenX < 50 || screenX > 250) continue;
		ctx.beginPath();
		ctx.moveTo(screenX, 145);
		ctx.lineTo(screenX, 155);
		ctx.strokeStyle="#888";
		ctx.lineWidth=1;
		ctx.stroke();
		ctx.fillText(x.toString(), screenX, 160);
	}
	if (xAxisScreen >= 50&&xAxisScreen<=250){
		ctx.textAlign="right";
		ctx.textBaseline="middle";
		let yRange=yMax - yMin;
		let yStep=getAppropriateStep(yRange, 6);
		for (let y=Math.ceil(yMin/yStep)*yStep; y<=yMax; y+=yStep){
			let screenY=150 - k*y;
			if (screenY < 50 || screenY > 200) continue;
			ctx.beginPath();
			ctx.moveTo(xAxisScreen - 5, screenY);
			ctx.lineTo(xAxisScreen + 5, screenY);
			ctx.stroke();
			ctx.fillText(y.toFixed(yStep>=1?0:1), xAxisScreen - 8, screenY);
		}
	}
	ctx.fillStyle="#000";
	ctx.font="12px sans-serif";
	ctx.fillText("x", 240, 140);
	ctx.fillText("y", 160, 60);
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	for (let x=xMin; x<=xMax; x+=0.05){
		let screenX=50 + (x - xMin)*scaleX;
		let y=x;
		let screenY=150 - k*y;
		if (x===xMin) ctx.moveTo(screenX, screenY);
		else ctx.lineTo(screenX, screenY);
	}
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle="green";
	ctx.setLineDash([5,3]);
	let aScreenX=50 + (a - xMin)*scaleX;
	ctx.moveTo(aScreenX, 50);
	ctx.lineTo(aScreenX, 150);
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.fillStyle="red";
	ctx.beginPath();
	let pointX=50 + (x0 - xMin)*scaleX;
	let pointY=150 - k*x0;
	ctx.arc(pointX, pointY, 4, 0, 2*Math.PI);
	ctx.fill();
	ctx.stroke();
	return canvas;
}
function drawAccumGraph2(a: number): HTMLCanvasElement{
	let canvas=document.createElement("canvas");
	canvas.width=300;
	canvas.height=200;
	let ctx=canvas.getContext("2d");
	if (!ctx) return canvas;
	ctx.clearRect(0,0,300,200);
	let xMin=-2, xMax=4;
	let scaleX=200/(xMax - xMin);
	let yMin=-1, yMax=1;
	let k=Math.min(150/yMax, 50/Math.abs(yMin));
	let xAxisScreen=50 + (0 - xMin)*scaleX;
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	if (xAxisScreen >= 50&&xAxisScreen<=250){
		ctx.moveTo(xAxisScreen, 50);
		ctx.lineTo(xAxisScreen, 150);
	}
	ctx.stroke();
	ctx.fillStyle="#000";
	ctx.font="10px sans-serif";
	ctx.textAlign="center";
	ctx.textBaseline="top";
	let xStep=1;
	for (let x=Math.ceil(xMin); x<=Math.floor(xMax); x+=xStep){
		let screenX=50 + (x - xMin)*scaleX;
		if (screenX < 50 || screenX > 250) continue;
		ctx.beginPath();
		ctx.moveTo(screenX, 145);
		ctx.lineTo(screenX, 155);
		ctx.strokeStyle="#888";
		ctx.lineWidth=1;
		ctx.stroke();
		ctx.fillText(x.toString(), screenX, 160);
	}
	if (xAxisScreen >= 50&&xAxisScreen<=250){
		ctx.textAlign="right";
		ctx.textBaseline="middle";
		let yStep=1;
		for (let y=yMin; y<=yMax; y+=yStep){
			let screenY=150 - k*y;
			if (screenY < 50 || screenY > 200) continue;
			ctx.beginPath();
			ctx.moveTo(xAxisScreen - 5, screenY);
			ctx.lineTo(xAxisScreen + 5, screenY);
			ctx.stroke();
			ctx.fillText(y.toString(), xAxisScreen - 8, screenY);
		}
	}
	ctx.fillStyle="#000";
	ctx.font="12px sans-serif";
	ctx.fillText("x", 240, 140);
	ctx.fillText("y", 160, 60);
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	let segments=[
		{ start: xMin, end: a, value: -1 },
		{ start: a, end: a+2, value: 1 },
		{ start: a+2, end: xMax, value: -1 }
	];
	for (let seg of segments){
		let xStart=Math.max(seg.start, xMin);
		let xEnd=Math.min(seg.end, xMax);
		if (xStart >= xEnd) continue;
		let screenX1=50 + (xStart - xMin)*scaleX;
		let screenX2=50 + (xEnd - xMin)*scaleX;
		let screenY=150 - k*seg.value;
		ctx.beginPath();
		ctx.moveTo(screenX1, screenY);
		ctx.lineTo(screenX2, screenY);
		ctx.stroke();
	}
	return canvas;
}