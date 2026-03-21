/**
 * Advanced trigonometry: inverse trig functions, equations, graphs.
 * @fileoverview Generates questions on inverse trigonometric functions, solving trigonometric equations, and interpreting trig graphs. Sets window.correctAnswer with LaTeX display and plain text alternate.
 * @date 2026-03-15
 */
import {questionArea} from "../../script.js";
import {formatPiFraction} from "./trigUtils.js";

/**
 * Generates an inverse trigonometric function question (arcsin, arccos, arctan).
 * Asks for the principal value in radians and degrees.
 * @param difficulty - optional difficulty level.
 */
export function generateInverseTrig(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["arcsin","arccos","arctan"];
	let type=types[Math.floor(Math.random()*types.length)];
	let hint="", questionText="", correctAnswerStr="", alternateAnswerStr="", displayAnswerStr="";
	let valRange: number;
	if (difficulty==="easy") valRange=2;
	else if (difficulty==="hard") valRange=20;
	else valRange=10;
	let val: number;
	if (type==="arctan"){
		val=Math.floor(Math.random()*valRange*2) - valRange;
	}
	else{
		if (difficulty==="easy"){
			let simple=[0,0.5,0.707,1];
			val=simple[Math.floor(Math.random()*simple.length)] * (Math.random()<0.5?1:-1);
		}
		else{
			val=(Math.floor(Math.random()*20)/10) -1;
		}
	}
	let principal: number;
	if (type==="arcsin") principal=Math.asin(val);
	else if (type==="arccos") principal=Math.acos(val);
	else principal=Math.atan(val);
	let deg=(principal*180/Math.PI).toFixed(1);
	questionText=`Evaluate \\( ${type}(${val.toFixed(2)}) \\) in radians and degrees. (Principal value)`;
	// Try to get exact representation
	let exact: string|null=null;
	const exactRadians: Record<string, number> = {
		"0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
		"\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
		"\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
		"\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
	};
	for (let [exactStr, rad] of Object.entries(exactRadians)){
		if (Math.abs(principal-rad)<1e-8){
			exact=exactStr;
			break;
		}
	}
	if (exact){
		correctAnswerStr=`${exact} rad, ${deg}°`;
		alternateAnswerStr=`${principal.toFixed(2)} rad, ${deg}°`;
		displayAnswerStr=`\\${exact}\\ \\text{rad},\\ ${deg}^\\circ`;
		hint=`Enter as "x rad, y°" (e.g., "π/6 rad, 30°" or "0.52 rad, 30.0°")`;
	}
	else{
		correctAnswerStr=`${principal.toFixed(2)} rad, ${deg}°`;
		alternateAnswerStr=`${principal.toFixed(2)} rad, ${deg}°`;
		displayAnswerStr=`${principal.toFixed(2)}\\ \\text{rad},\\ ${deg}^\\circ`;
		hint=`Enter as "x rad, y°" (e.g., "0.52 rad, 30.0°")`;
	}
	const container=document.createElement("div");
	container.style.display="flex";
	container.style.flexDirection="column";
	container.style.alignItems="center";
	questionArea.appendChild(container);
	const textDiv=document.createElement("div");
	textDiv.innerHTML=questionText;
	textDiv.style.marginBottom="10px";
	container.appendChild(textDiv);
	window.correctAnswer={
		correct: correctAnswerStr,
		alternate: alternateAnswerStr,
		display: displayAnswerStr
	};
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

/**
 * Generates a trigonometric equation question (basic, multiple-angle, or using identity).
 * Asks for the smallest positive solution in radians.
 * @param difficulty - optional difficulty level.
 */
export function generateTrigEquations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic","multiple_angle","using_identity"];
	let type=types[Math.floor(Math.random()*types.length)];
	let hint="", questionText="", correctAnswerStr="", alternateAnswerStr="", displayAnswerStr="";
	let maxCoeff=(difficulty==="easy")?2:(difficulty==="hard"?4:3);
	let simpleValues=[0,0.5,Math.sqrt(2)/2,Math.sqrt(3)/2,1];
	let useSimpleValues=(difficulty==="easy");
	switch (type){
		case "basic":{
			let func=Math.random()<0.5?"sin":"cos";
			let val: number;
			if (useSimpleValues){
				val=simpleValues[Math.floor(Math.random()*simpleValues.length)];
			}
			else{
				val=(Math.floor(Math.random()*10)/10);
			}
			val=Math.min(0.99,Math.max(-0.99,val));
			let angle=func==="sin"?Math.asin(val):Math.acos(val);
			// smallest positive solution
			let sol=angle;
			if (sol<0) sol+=2*Math.PI;
			questionText=`Solve \\( ${func}\\theta=${val.toFixed(2)} \\) for \\( \\theta \\) in \\( [0, 2\\pi) \\). Give the smallest positive solution.`;
			// Try exact
			let exact=null;
			const exactRadians: Record<string, number> = {
				"0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
				"\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
				"\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
				"\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
			};
			for (let [exactStr, rad] of Object.entries(exactRadians)){
				if (Math.abs(sol-rad)<1e-8){
					exact=exactStr;
					break;
				}
			}
			if (exact){
				correctAnswerStr=exact;
				alternateAnswerStr=sol.toFixed(2);
				displayAnswerStr=`\\${exact}`;
				hint=`Enter exact value like \\frac{\\pi}{6} or decimal (e.g., 0.52)`;
			}
			else{
				correctAnswerStr=sol.toFixed(2);
				alternateAnswerStr=sol.toFixed(2);
				displayAnswerStr=sol.toFixed(2);
				hint=`Enter a decimal (e.g., 0.52)`;
			}
			break;
		}
		case "multiple_angle":{
			let func=Math.random()<0.5?"sin":"cos";
			let coeff=Math.floor(Math.random()*maxCoeff)+2;
			let val: number;
			if (useSimpleValues){
				val=simpleValues[Math.floor(Math.random()*simpleValues.length)];
			}
			else{
				val=(Math.floor(Math.random()*10)/10);
			}
			val=Math.min(0.99,Math.max(-0.99,val));
			let angle=func==="sin"?Math.asin(val):Math.acos(val);
			let base=angle/coeff;
			// smallest positive solution
			let sol=base;
			if (sol<0) sol+=2*Math.PI;
			questionText=`Solve \\( ${func}(${coeff}\\theta)=${val.toFixed(2)} \\) for \\( 0 \\le \\theta < 2\\pi \\). Give the smallest positive solution.`;
			// Try exact
			let exact=null;
			const exactRadians: Record<string, number> = {
				"0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
				"\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
				"\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
				"\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
			};
			for (let [exactStr, rad] of Object.entries(exactRadians)){
				if (Math.abs(sol-rad)<1e-8){
					exact=exactStr;
					break;
				}
			}
			if (exact){
				correctAnswerStr=exact;
				alternateAnswerStr=sol.toFixed(2);
				displayAnswerStr=`\\${exact}`;
				hint=`Enter exact value like \\frac{\\pi}{6} or decimal (e.g., 0.52)`;
			}
			else{
				correctAnswerStr=sol.toFixed(2);
				alternateAnswerStr=sol.toFixed(2);
				displayAnswerStr=sol.toFixed(2);
				hint=`Enter a decimal (e.g., 0.52)`;
			}
			break;
		}
		case "using_identity":{
			let c: number;
			if (useSimpleValues){
				c=0.25;
			}
			else{
				c=(Math.floor(Math.random()*8)+1)/16;
			}
			questionText=`Solve \\( \\sin^2\\theta=${c.toFixed(2)} \\) for \\( 0 \\le \\theta < 2\\pi \\). Give the smallest positive solution.`;
			let baseAngle=Math.asin(Math.sqrt(c));
			let sol=baseAngle;
			if (sol<0) sol+=2*Math.PI;
			// Try exact
			let exact=null;
			const exactRadians: Record<string, number> = {
				"0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
				"\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
				"\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
				"\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
			};
			for (let [exactStr, rad] of Object.entries(exactRadians)){
				if (Math.abs(sol-rad)<1e-8){
					exact=exactStr;
					break;
				}
			}
			if (exact){
				correctAnswerStr=exact;
				alternateAnswerStr=sol.toFixed(2);
				displayAnswerStr=`\\${exact}`;
				hint=`Enter exact value like \\frac{\\pi}{6} or decimal (e.g., 0.52)`;
			}
			else{
				correctAnswerStr=sol.toFixed(2);
				alternateAnswerStr=sol.toFixed(2);
				displayAnswerStr=sol.toFixed(2);
				hint=`Enter a decimal (e.g., 0.52)`;
			}
			break;
		}
	}
	const container=document.createElement("div");
	container.style.display="flex";
	container.style.flexDirection="column";
	container.style.alignItems="center";
	questionArea.appendChild(container);
	const textDiv=document.createElement("div");
	textDiv.innerHTML=questionText;
	textDiv.style.marginBottom="10px";
	container.appendChild(textDiv);
	window.correctAnswer={
		correct: correctAnswerStr,
		alternate: alternateAnswerStr,
		display: displayAnswerStr
	};
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

/**
 * Generates a trigonometric graph interpretation question (sine, cosine, tangent).
 * Asks for amplitude, period, phase shift, or asymptotes.
 * @param difficulty - optional difficulty level.
 */
export function generateTrigGraphs(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["sine","cosine","tangent"];
	const type=types[Math.floor(Math.random()*types.length)];
	let maxA=(difficulty==="easy")?2:(difficulty==="hard"?5:3);
	let maxB=(difficulty==="easy")?2:(difficulty==="hard"?4:3);
	const A=Math.floor(Math.random()*maxA)+1;
	const B=Math.floor(Math.random()*maxB)+1;
	const C=Math.floor(Math.random()*2);
	const container=document.createElement("div");
	container.style.display="flex";
	container.style.flexDirection="column";
	container.style.alignItems="center";
	container.style.width="100%";
	questionArea.appendChild(container);
	const canvas=document.createElement("canvas");
	canvas.width=400;
	canvas.height=300;
	canvas.style.width="100%";
	canvas.style.height="auto";
	canvas.style.maxWidth="400px";
	canvas.style.border="1px solid var(--border)";
	canvas.style.borderRadius="8px";
	canvas.style.backgroundColor="#111122";
	container.appendChild(canvas);
	const ctx=canvas.getContext("2d")!;
	const w=canvas.width;
	const h=canvas.height;
	const padding=40;
	const xMin=-2*Math.PI/B;
	const xMax=2*Math.PI/B;
	const yLimit=5;
	const yMin=type==="tangent"?-yLimit:-A-0.5;
	const yMax=type==="tangent"?yLimit:A+0.5;
	function mapX(x: number): number{
		return padding + ((x-xMin)/(xMax-xMin))*(w-2*padding);
	}
	function mapY(y: number): number{
		return h-padding - ((y-yMin)/(yMax-yMin))*(h-2*padding);
	}
	ctx.clearRect(0,0,w,h);
	ctx.fillStyle="#111122";
	ctx.fillRect(0,0,w,h);
	ctx.strokeStyle="#335588";
	ctx.lineWidth=0.5;
	ctx.beginPath();
	for (let i=-3; i<=3; i++){
		const xVal=i*Math.PI/B;
		if (xVal<xMin||xVal>xMax) continue;
		const x=mapX(xVal);
		ctx.moveTo(x,padding);
		ctx.lineTo(x,h-padding);
	}
	for (let i=Math.floor(yMin); i<=Math.ceil(yMax); i++){
		const y=mapY(i);
		ctx.moveTo(padding,y);
		ctx.lineTo(w-padding,y);
	}
	ctx.strokeStyle="#335588";
	ctx.stroke();
	ctx.strokeStyle="#ffffff";
	ctx.lineWidth=2;
	ctx.beginPath();
	const x0=mapX(0);
	const y0=mapY(0);
	ctx.moveTo(x0,padding);
	ctx.lineTo(x0,h-padding);
	ctx.moveTo(padding,y0);
	ctx.lineTo(w-padding,y0);
	ctx.stroke();
	ctx.fillStyle="#FFF";
	ctx.font="12px sans-serif";
	const xTickValues=[-Math.PI/B,Math.PI/B,-2*Math.PI/B,2*Math.PI/B,-Math.PI/(2*B),Math.PI/(2*B)];
	xTickValues.forEach(xVal=>{
		if (xVal>=xMin&&xVal<=xMax){
			const xCanvas=mapX(xVal);
			const label=formatPiFraction(xVal);
			ctx.fillText(label,xCanvas-15,y0-10);
		}
	});
	ctx.fillText("0",x0+5,y0-5);
	for (let i=Math.ceil(yMin); i<=Math.floor(yMax); i++){
		if (i===0) continue;
		const yCanvas=mapY(i);
		ctx.fillText(i.toString(),x0+10,yCanvas+5);
	}
	let asymptotes: number[]=[];
	if (type==="tangent"){
		const kStart=Math.ceil((xMin*B-(Math.PI/2-C))/Math.PI);
		const kEnd=Math.floor((xMax*B-(Math.PI/2-C))/Math.PI);
		for (let k=kStart; k<=kEnd; k++){
			const xAsymp=(Math.PI/2-C+k*Math.PI)/B;
			if (xAsymp>=xMin&&xAsymp<=xMax){
				asymptotes.push(xAsymp);
			}
		}
		ctx.strokeStyle="#FF6666";
		ctx.lineWidth=2;
		ctx.setLineDash([5,5]);
		asymptotes.forEach(x=>{
			const xCanvas=mapX(x);
			ctx.beginPath();
			ctx.moveTo(xCanvas,padding);
			ctx.lineTo(xCanvas,h-padding);
			ctx.stroke();
		});
		ctx.setLineDash([]);
	}
	ctx.strokeStyle="#FFAA00";
	ctx.lineWidth=2.5;
	ctx.beginPath();
	const steps=400;
	let pathStarted=false;
	for (let i=0; i<=steps; i++){
		const t=i/steps;
		const x=xMin+t*(xMax-xMin);
		if (type==="tangent"){
			let tooClose=false;
			for (let a of asymptotes){
				if (Math.abs(x-a)<0.01){
					tooClose=true;
					break;
				}
			}
			if (tooClose){
				if (pathStarted){
					ctx.stroke();
					ctx.beginPath();
					pathStarted=false;
				}
				continue;
			}
		}
		let rawY: number;
		switch (type){
			case "sine":
				rawY=A*Math.sin(B*x+C);
				break;
			case "cosine":
				rawY=A*Math.cos(B*x+C);
				break;
			case "tangent":
				rawY=A*Math.tan(B*x+C);
				break;
			default:
				rawY=0;
		}
		if (type==="tangent"&&(rawY<yMin||rawY>yMax)){
			if (pathStarted){
				ctx.stroke();
				ctx.beginPath();
				pathStarted=false;
			}
			continue;
		}
		const canvasX=mapX(x);
		const canvasY=mapY(rawY);
		if (!pathStarted){
			ctx.moveTo(canvasX,canvasY);
			pathStarted=true;
		}
		else{
			ctx.lineTo(canvasX,canvasY);
		}
	}
	if (pathStarted){
		ctx.stroke();
	}
	let questionText="", correctAnswerStr="", alternateAnswerStr="", displayAnswerStr="", hint="";
	switch (type){
		case "sine":
		case "cosine":{
			const askType=Math.floor(Math.random()*3);
			if (askType===0){
				questionText=`What is the amplitude of the graphed ${type} function?`;
				correctAnswerStr=A.toString();
				alternateAnswerStr=A.toString();
				displayAnswerStr=A.toString();
				hint="Enter a number";
			}
			else if (askType===1){
				const period=2*Math.PI/B;
				const exactPeriod=formatPiFraction(period);
				questionText=`What is the period of the graphed ${type} function? (in radians)`;
				// Use exact if possible
				if (exactPeriod.includes("π")){
					correctAnswerStr=exactPeriod;
					alternateAnswerStr=period.toFixed(2);
					displayAnswerStr=`\\${exactPeriod}`;
				}
				else{
					correctAnswerStr=period.toFixed(2);
					alternateAnswerStr=period.toFixed(2);
					displayAnswerStr=period.toFixed(2);
				}
				hint="Enter a number or expression like 2π/3";
			}
			else{
				const phaseShift=-C/B;
				const exactPhase=formatPiFraction(phaseShift);
				questionText=`What is the phase shift of the graphed ${type} function? (in radians)`;
				if (phaseShift===0){
					correctAnswerStr="0";
					alternateAnswerStr="0";
					displayAnswerStr="0";
				}
				else{
					if (exactPhase.includes("π")){
						correctAnswerStr=exactPhase;
						alternateAnswerStr=phaseShift.toFixed(2);
						displayAnswerStr=`\\${exactPhase}`;
					}
					else{
						correctAnswerStr=phaseShift.toFixed(2);
						alternateAnswerStr=phaseShift.toFixed(2);
						displayAnswerStr=phaseShift.toFixed(2);
					}
				}
				hint="Enter a number or expression like π/6";
			}
			break;
		}
		case "tangent":{
			const askType=Math.floor(Math.random()*2);
			if (askType===0){
				const period=Math.PI/B;
				const exactPeriod=formatPiFraction(period);
				questionText=`What is the period of the graphed tangent function? (in radians)`;
				if (exactPeriod.includes("π")){
					correctAnswerStr=exactPeriod;
					alternateAnswerStr=period.toFixed(2);
					displayAnswerStr=`\\${exactPeriod}`;
				}
				else{
					correctAnswerStr=period.toFixed(2);
					alternateAnswerStr=period.toFixed(2);
					displayAnswerStr=period.toFixed(2);
				}
				hint="Enter a number or expression like π/2";
			}
			else{
				const period=Math.PI/B;
				// Ask for the equation of the first positive vertical asymptote.
				// x = π/(2B) - C/B  (with k=0)
				let firstAsymp=(Math.PI/2 - C)/B;
				if (firstAsymp<0) firstAsymp+=period; // adjust to smallest positive
				const exactAsymp=formatPiFraction(firstAsymp);
				questionText=`Give the equation of the vertical asymptote that lies between 0 and π/${B.toFixed(2)}.`;
				if (exactAsymp.includes("π")){
					correctAnswerStr=`x=${exactAsymp}`;
					alternateAnswerStr=`x=${firstAsymp.toFixed(2)}`;
					displayAnswerStr=`x=\\${exactAsymp}`;
				}
				else{
					correctAnswerStr=`x=${firstAsymp.toFixed(2)}`;
					alternateAnswerStr=`x=${firstAsymp.toFixed(2)}`;
					displayAnswerStr=`x=${firstAsymp.toFixed(2)}`;
				}
				hint="Enter as 'x = ...'";
			}
			break;
		}
	}
	const textDiv=document.createElement("div");
	textDiv.innerHTML=questionText;
	textDiv.style.marginTop="10px";
	container.appendChild(textDiv);
	window.correctAnswer={ correct: correctAnswerStr, alternate: alternateAnswerStr, display: displayAnswerStr };
	window.expectedFormat=hint;
	if (window.MathJax?.typeset) window.MathJax.typeset();
}