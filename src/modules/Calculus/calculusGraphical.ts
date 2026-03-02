import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";
export function generateGraphicalCalculus(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["limitFromGraph","multipleReps","estimateDerivTable","diffContinuity","inverseFunc","invTrigDeriv","selectProcedure","derivContext","riemannSum","riemannNotation","accumFTC","accumBehavior","definiteProps","longDivision","flowAccum","instantChange","derivativeLimit"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let expectedFormat="Enter your answer";
	let maxCoeff=getMaxCoeff(difficulty);
	let canvas: HTMLCanvasElement|null=null;
	switch (questionType){
		case "limitFromGraph":{
			let coeff=Math.floor(Math.random()*maxCoeff)+1;
			let holeX=Math.floor(Math.random()*3)+2;
			let holeY=Math.floor(Math.random()*5)+1;
			canvas=drawLimitGraph(coeff, holeX, holeY);
			mathExpression=`\\[ \\lim_{x\\to ${holeX}} f(x) = ? \\]`;
			plainCorrectAnswer=(coeff*holeY*holeY).toString();
			expectedFormat="Enter a number";
			break;
		}
		case "multipleReps":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*5)+1;
			canvas=drawQuadraticGraph(a, b, -2, 4);
			let table=`\\begin{array}{c|c} x & f(x) \\\\ ${c-0.1} & ${a*(c-0.1)**2+b} \\\\ ${c+0.1} & ${a*(c+0.1)**2+b} \\end{array}`;
			mathExpression=`\\[ \\text{Graph and table given, find } \\lim_{x\\to ${c}} f(x). \\] ${table}`;
			plainCorrectAnswer=(a*c*c+b).toString();
			expectedFormat="Enter a number";
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
			expectedFormat="Enter a decimal";
			break;
		}
		case "diffContinuity":{
			let x0=Math.floor(Math.random()*3)+1;
			canvas=drawAbsoluteGraph(x0);
			mathExpression=`\\[ \\text{Is } f(x)=|x-${x0}| \\text{ differentiable at } x=${x0}? \\]`;
			plainCorrectAnswer="no";
			expectedFormat="Enter yes or no";
			break;
		}
		case "inverseFunc":{
			let fVal=Math.floor(Math.random()*5)+2;
			let fPrime=Math.floor(Math.random()*maxCoeff)+1;
			let a=Math.floor(Math.random()*5)+1;
			mathExpression=`\\[ f(${a})=${fVal}, f'(${a})=${fPrime}. \\text{ Find } (f^{-1})'(${fVal}). \\]`;
			plainCorrectAnswer=(1/fPrime).toFixed(3);
			expectedFormat="Enter a number";
			break;
		}
		case "invTrigDeriv":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\frac{d}{dx}[\\arctan(${a}x)] \\]`;
			plainCorrectAnswer=`${a}/(1+${a*a}x^2)`;
			expectedFormat="Enter expression";
			break;
		}
		case "selectProcedure":{
			let options=["Product and chain","Chain only","Quotient","Product only"];
			let correctIdx=Math.floor(Math.random()*options.length);
			plainCorrectAnswer=options[correctIdx];
			mathExpression=`\\[ f(x)=x^2 e^{${maxCoeff}x} \\cos x \\] Which rule(s)? A) ${options[0]} B) ${options[1]} C) ${options[2]} D) ${options[3]}`;
			expectedFormat="Enter letter";
			break;
		}
		case "derivContext":{
			let rate=Math.floor(Math.random()*10)+5;
			mathExpression=`\\[ \\text{Volume increasing at } ${rate} \\text{ cm}^3/s. \\text{ What does } V'(t) \\text{ represent?} \\]`;
			plainCorrectAnswer="rate of change of volume";
			expectedFormat="Enter description";
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
			expectedFormat="Enter number";
			break;
		}
        case "riemannNotation":{
            let a=Math.floor(Math.random()*3)+1;
            let b=a+Math.floor(Math.random()*3)+2;
            let n=Math.floor(Math.random()*10)+10;
            let delta=(b-a)/n;
            mathExpression=`\\[ \\lim_{n\\to\\infty} \\sum_{i=1}^n \\left(${a}+${delta}i\\right)^2 \\cdot ${delta} \\text{ as definite integral.} \\]`;
            plainCorrectAnswer=`\\int_{${a}}^{${b}} x^2 \\,dx`;
            expectedFormat="Enter integral";
            break;
        }
		case "accumFTC":{
			let a=Math.floor(Math.random()*3)+1;
			let x0=Math.floor(Math.random()*3)+2;
			canvas=drawAccumGraph(a, x0);
			mathExpression=`\\[ F(x)=\\int_{${a}}^x f(t)\\,dt, \\text{ find } F'(${x0}). \\]`;
			plainCorrectAnswer=(x0).toString();
			expectedFormat="Enter number";
			break;
		}
		case "accumBehavior":{
			let a=Math.floor(Math.random()*3)+1;
			canvas=drawAccumGraph2(a);
			mathExpression=`\\[ g(x)=\\int_0^x f(t)\\,dt, \\text{ where increasing?} \\]`;
			plainCorrectAnswer=`(${a}, ${a+2})`;
			expectedFormat="Enter interval";
			break;
		}
		case "definiteProps":{
			let int1=Math.floor(Math.random()*5)+1;
			let int2=Math.floor(Math.random()*5)+1;
			let a=Math.floor(Math.random()*3)+1;
			let b=a+Math.floor(Math.random()*3)+1;
			let c=b+Math.floor(Math.random()*3)+1;
			mathExpression=`\\[ \\int_{${a}}^{${b}} f=${int1}, \\int_{${b}}^{${c}} f=${int2}, \\text{ find } \\int_{${a}}^{${c}} f. \\]`;
			plainCorrectAnswer=(int1+int2).toString();
			expectedFormat="Enter number";
			break;
		}
		case "longDivision":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int \\frac{x^3}{x^2+${a}} \\,dx \\]`;
			plainCorrectAnswer=`(1/2)x^2 - ${a}ln|x^2+${a}| + C`;
			expectedFormat="Enter expression";
			break;
		}
		case "flowAccum":{
			let rate=Math.floor(Math.random()*5)+5;
			let tMax=Math.floor(Math.random()*3)+3;
			mathExpression=`\\[ r(t)=${rate}-t \\text{ gal/min. Water from } t=0 \\text{ to } t=${tMax}. \\]`;
			let accum=rate*tMax - tMax*tMax/2;
			plainCorrectAnswer=accum.toFixed(2);
			expectedFormat="Enter number";
			break;
		}
		case "instantChange":{
			mathExpression=`\\[ \\text{Explain how limits give instantaneous velocity.} \\]`;
			plainCorrectAnswer="average velocity approaches instantaneous as interval shrinks";
			expectedFormat="Enter explanation";
			break;
		}
		case "derivativeLimit":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ f(x)=${a}x+${b}, \\text{ use limit definition to find } f'(x). \\]`;
			plainCorrectAnswer=a.toString();
			expectedFormat="Enter expression";
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
	window.correctAnswer={
		correct: plainCorrectAnswer.replace(/\s+/g, "").toLowerCase(),
		alternate: plainCorrectAnswer
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
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	ctx.moveTo(150,50);
	ctx.lineTo(150,150);
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	for (let x=-2; x<=2; x+=0.1){
		let screenX=150+50*x;
		let y=coeff*x*x;
		let screenY=150-30*y;
		if (x===-2) ctx.moveTo(screenX, screenY);
		else ctx.lineTo(screenX, screenY);
	}
	ctx.stroke();
	ctx.beginPath();
	ctx.fillStyle="red";
	let holeScreenX=150+50*holeX;
	let holeScreenY=150-30*coeff*holeY*holeY;
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
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,100);
	ctx.lineTo(250,100);
	ctx.moveTo(150,50);
	ctx.lineTo(150,150);
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	for (let x=-2; x<=2; x+=0.1){
		let screenX=150+50*x;
		let y=Math.abs(x-cornerX);
		let screenY=100-30*y;
		if (x===-2) ctx.moveTo(screenX, screenY);
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
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	ctx.moveTo(150,50);
	ctx.lineTo(150,150);
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	let scaleX=200/(xMax-xMin);
	for (let x=xMin; x<=xMax; x+=0.05){
		let screenX=50+(x-xMin)*scaleX;
		let y=a*x*x+b;
		let screenY=150-30*y;
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
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	ctx.moveTo(150,50);
	ctx.lineTo(150,150);
	ctx.stroke();
	let delta=(b-a)/n;
	let scaleX=200/(b-a);
	let scaleY=30;
	for (let i=0; i<n; i++){
		let xLeft=a+i*delta;
		let xRight=xLeft+delta;
		let y=xLeft*xLeft;
		let screenX1=50+(xLeft-a)*scaleX;
		let screenX2=50+(xRight-a)*scaleX;
		let screenY=150-scaleY*y;
		ctx.fillStyle="rgba(0,0,255,0.2)";
		ctx.fillRect(screenX1, screenY, screenX2-screenX1, 150-screenY);
	}
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	for (let x=a; x<=b; x+=0.05){
		let screenX=50+(x-a)*scaleX;
		let y=x*x;
		let screenY=150-scaleY*y;
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
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	ctx.moveTo(150,50);
	ctx.lineTo(150,150);
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	for (let x=-1; x<=4; x+=0.05){
		let screenX=50+50*(x+1);
		let y=x;
		let screenY=150-30*y;
		if (x===-1) ctx.moveTo(screenX, screenY);
		else ctx.lineTo(screenX, screenY);
	}
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle="green";
	ctx.setLineDash([5,3]);
	ctx.moveTo(50+50*(a+1), 50);
	ctx.lineTo(50+50*(a+1), 150);
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.fillStyle="red";
	ctx.beginPath();
	let pointX=50+50*(x0+1);
	let pointY=150-30*x0;
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
	ctx.beginPath();
	ctx.strokeStyle="#000";
	ctx.lineWidth=1;
	ctx.moveTo(50,150);
	ctx.lineTo(250,150);
	ctx.moveTo(150,50);
	ctx.lineTo(150,150);
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle="blue";
	ctx.lineWidth=2;
	for (let x=-2; x<=4; x+=0.05){
		let screenX=150+40*x;
		let y=(x>a && x<a+2)?1:-1;
		let screenY=100-30*y;
		if (x===-2) ctx.moveTo(screenX, screenY);
		else ctx.lineTo(screenX, screenY);
	}
	return canvas;
}