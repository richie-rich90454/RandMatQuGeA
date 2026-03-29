/**
 * Advanced trigonometry: inverse trig functions, equations, graphs.
 * @fileoverview Generates questions on inverse trigonometric functions, solving trigonometric equations, and interpreting trig graphs. Sets window.correctAnswer with LaTeX display and plain text alternate, plus plausible wrong answers for MCQ mode.
 * @date 2026-03-29
 */
import {questionArea} from "../../script.js";
import {formatPiFraction} from "./trigUtils.js";
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
	let choices=[correctAnswerStr];
	let wrongPrincipal=type==="arcsin"?Math.asin(-val):(type==="arccos"?Math.acos(-val):Math.atan(-val));
	let wrongDeg=(wrongPrincipal*180/Math.PI).toFixed(1);
	let wrongExact=null;
	for (let [exactStr, rad] of Object.entries(exactRadians)){
		if (Math.abs(wrongPrincipal-rad)<1e-8){
			wrongExact=exactStr;
			break;
		}
	}
	if (wrongExact){
		choices.push(`${wrongExact} rad, ${wrongDeg}°`);
	}
	else{
		choices.push(`${wrongPrincipal.toFixed(2)} rad, ${wrongDeg}°`);
	}
	choices.push(`${principal.toFixed(2)} rad`);
	choices.push(`${deg}°`);
	choices.push(`undefined`);
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correctAnswerStr)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswerStr;
		else uniqueChoices=[correctAnswerStr];
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
		display: displayAnswerStr,
		choices: uniqueChoices
	};
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
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
			let sol=angle;
			if (sol<0) sol+=2*Math.PI;
			questionText=`Solve \\( ${func}\\theta=${val.toFixed(2)} \\) for \\( \\theta \\) in \\( [0, 2\\pi) \\). Give the smallest positive solution.`;
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
			let choices=[correctAnswerStr];
			let wrongAngle=func==="sin"?Math.asin(-val):Math.acos(-val);
			let wrongSol=wrongAngle;
			if (wrongSol<0) wrongSol+=2*Math.PI;
			let wrongExact=null;
			for (let [exactStr, rad] of Object.entries(exactRadians)){
				if (Math.abs(wrongSol-rad)<1e-8){
					wrongExact=exactStr;
					break;
				}
			}
			if (wrongExact){
				choices.push(wrongExact);
			}
			else{
				choices.push(wrongSol.toFixed(2));
			}
			let otherSol=2*Math.PI-sol;
			let otherExact=null;
			for (let [exactStr, rad] of Object.entries(exactRadians)){
				if (Math.abs(otherSol-rad)<1e-8){
					otherExact=exactStr;
					break;
				}
			}
			if (otherExact){
				choices.push(otherExact);
			}
			else{
				choices.push(otherSol.toFixed(2));
			}
			choices.push(sol.toFixed(2));
			choices.push(sol.toFixed(2)+"π");
			let uniqueChoices=[...new Set(choices)];
			if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
			if (!uniqueChoices.includes(correctAnswerStr)){
				if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswerStr;
				else uniqueChoices=[correctAnswerStr];
			}
			window.correctAnswer={
				correct: correctAnswerStr,
				alternate: alternateAnswerStr,
				display: displayAnswerStr,
				choices: uniqueChoices
			};
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
			let sol=base;
			if (sol<0) sol+=2*Math.PI;
			questionText=`Solve \\( ${func}(${coeff}\\theta)=${val.toFixed(2)} \\) for \\( 0 \\le \\theta < 2\\pi \\). Give the smallest positive solution.`;
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
			let choices=[correctAnswerStr];
			let wrongBase=(Math.PI-angle)/coeff;
			let wrongSol=wrongBase;
			if (wrongSol<0) wrongSol+=2*Math.PI;
			let wrongExact=null;
			for (let [exactStr, rad] of Object.entries(exactRadians)){
				if (Math.abs(wrongSol-rad)<1e-8){
					wrongExact=exactStr;
					break;
				}
			}
			if (wrongExact){
				choices.push(wrongExact);
			}
			else{
				choices.push(wrongSol.toFixed(2));
			}
			let otherSol=sol+2*Math.PI/coeff;
			if (otherSol<2*Math.PI){
				let otherExact=null;
				for (let [exactStr, rad] of Object.entries(exactRadians)){
					if (Math.abs(otherSol-rad)<1e-8){
						otherExact=exactStr;
						break;
					}
				}
				if (otherExact){
					choices.push(otherExact);
				}
				else{
					choices.push(otherSol.toFixed(2));
				}
			}
			choices.push(sol.toFixed(2));
			choices.push(sol.toFixed(2)+"π");
			let uniqueChoices=[...new Set(choices)];
			if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
			if (!uniqueChoices.includes(correctAnswerStr)){
				if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswerStr;
				else uniqueChoices=[correctAnswerStr];
			}
			window.correctAnswer={
				correct: correctAnswerStr,
				alternate: alternateAnswerStr,
				display: displayAnswerStr,
				choices: uniqueChoices
			};
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
			let choices=[correctAnswerStr];
			let wrongBase=Math.asin(-Math.sqrt(c));
			let wrongSol=wrongBase;
			if (wrongSol<0) wrongSol+=2*Math.PI;
			let wrongExact=null;
			for (let [exactStr, rad] of Object.entries(exactRadians)){
				if (Math.abs(wrongSol-rad)<1e-8){
					wrongExact=exactStr;
					break;
				}
			}
			if (wrongExact){
				choices.push(wrongExact);
			}
			else{
				choices.push(wrongSol.toFixed(2));
			}
			let otherSol=Math.PI-sol;
			let otherExact=null;
			for (let [exactStr, rad] of Object.entries(exactRadians)){
				if (Math.abs(otherSol-rad)<1e-8){
					otherExact=exactStr;
					break;
				}
			}
			if (otherExact){
				choices.push(otherExact);
			}
			else{
				choices.push(otherSol.toFixed(2));
			}
			choices.push(sol.toFixed(2));
			choices.push(sol.toFixed(2)+"π");
			let uniqueChoices=[...new Set(choices)];
			if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
			if (!uniqueChoices.includes(correctAnswerStr)){
				if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswerStr;
				else uniqueChoices=[correctAnswerStr];
			}
			window.correctAnswer={
				correct: correctAnswerStr,
				alternate: alternateAnswerStr,
				display: displayAnswerStr,
				choices: uniqueChoices
			};
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
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
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
	let choices: string[]=[];
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
				choices=[correctAnswerStr];
				choices.push((A+1).toString());
				choices.push((A-1).toString());
				choices.push((A*2).toString());
				choices.push((A/2).toFixed(2));
			}
			else if (askType===1){
				const period=2*Math.PI/B;
				const exactPeriod=formatPiFraction(period);
				questionText=`What is the period of the graphed ${type} function? (in radians)`;
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
				choices=[correctAnswerStr];
				let wrongPeriod1=2*Math.PI/(B+1);
				let wrongPeriod2=2*Math.PI/(B-1);
				if (exactPeriod.includes("π")){
					choices.push(formatPiFraction(wrongPeriod1));
					choices.push(formatPiFraction(wrongPeriod2));
				}
				else{
					choices.push(wrongPeriod1.toFixed(2));
					choices.push(wrongPeriod2.toFixed(2));
				}
				choices.push((period/2).toFixed(2));
				choices.push((period*2).toFixed(2));
			}
			else{
				const phaseShift=-C/B;
				const exactPhase=formatPiFraction(phaseShift);
				questionText=`What is the phase shift of the graphed ${type} function? (in radians)`;
				if (phaseShift===0){
					correctAnswerStr="0";
					alternateAnswerStr="0";
					displayAnswerStr="0";
					choices=["0","π/2","π","-π/2"];
				}
				else{
					if (exactPhase.includes("π")){
						correctAnswerStr=exactPhase;
						alternateAnswerStr=phaseShift.toFixed(2);
						displayAnswerStr=`\\${exactPhase}`;
						choices=[correctAnswerStr];
						let wrongPhase1=(-C+1)/B;
						let wrongPhase2=(-C-1)/B;
						choices.push(formatPiFraction(wrongPhase1));
						choices.push(formatPiFraction(wrongPhase2));
						choices.push(phaseShift.toFixed(2));
						choices.push((phaseShift+0.5).toFixed(2));
					}
					else{
						correctAnswerStr=phaseShift.toFixed(2);
						alternateAnswerStr=phaseShift.toFixed(2);
						displayAnswerStr=phaseShift.toFixed(2);
						choices=[correctAnswerStr];
						choices.push((phaseShift+0.5).toFixed(2));
						choices.push((phaseShift-0.5).toFixed(2));
						choices.push((phaseShift*2).toFixed(2));
						choices.push((phaseShift/2).toFixed(2));
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
				choices=[correctAnswerStr];
				let wrongPeriod1=Math.PI/(B+1);
				let wrongPeriod2=Math.PI/(B-1);
				if (exactPeriod.includes("π")){
					choices.push(formatPiFraction(wrongPeriod1));
					choices.push(formatPiFraction(wrongPeriod2));
				}
				else{
					choices.push(wrongPeriod1.toFixed(2));
					choices.push(wrongPeriod2.toFixed(2));
				}
				choices.push((period/2).toFixed(2));
				choices.push((period*2).toFixed(2));
			}
			else{
				const period=Math.PI/B;
				let firstAsymp=(Math.PI/2 - C)/B;
				if (firstAsymp<0) firstAsymp+=period;
				const exactAsymp=formatPiFraction(firstAsymp);
				questionText=`Give the equation of the vertical asymptote that lies between 0 and π/${B.toFixed(2)}.`;
				if (exactAsymp.includes("π")){
					correctAnswerStr=`x=${exactAsymp}`;
					alternateAnswerStr=`x=${firstAsymp.toFixed(2)}`;
					displayAnswerStr=`x=\\${exactAsymp}`;
					choices=[correctAnswerStr];
					let wrongAsymp1=(Math.PI/2 - C + Math.PI)/B;
					if (wrongAsymp1<0) wrongAsymp1+=period;
					choices.push(`x=${formatPiFraction(wrongAsymp1)}`);
					let wrongAsymp2=(Math.PI/2 - C - Math.PI)/B;
					if (wrongAsymp2<0) wrongAsymp2+=period;
					choices.push(`x=${formatPiFraction(wrongAsymp2)}`);
					choices.push(`x=${firstAsymp.toFixed(2)}`);
					choices.push(`x=${(firstAsymp+0.5).toFixed(2)}`);
				}
				else{
					correctAnswerStr=`x=${firstAsymp.toFixed(2)}`;
					alternateAnswerStr=`x=${firstAsymp.toFixed(2)}`;
					displayAnswerStr=`x=${firstAsymp.toFixed(2)}`;
					choices=[correctAnswerStr];
					choices.push(`x=${(firstAsymp+0.5).toFixed(2)}`);
					choices.push(`x=${(firstAsymp-0.5).toFixed(2)}`);
					choices.push(`x=${(firstAsymp+1).toFixed(2)}`);
					choices.push(`x=${(firstAsymp-1).toFixed(2)}`);
				}
				hint="Enter as 'x = ...'";
			}
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correctAnswerStr)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswerStr;
		else uniqueChoices=[correctAnswerStr];
	}
	const textDiv=document.createElement("div");
	textDiv.innerHTML=questionText;
	textDiv.style.marginTop="10px";
	container.appendChild(textDiv);
	window.correctAnswer={
		correct: correctAnswerStr,
		alternate: alternateAnswerStr,
		display: displayAnswerStr,
		choices: uniqueChoices
	};
	window.expectedFormat=hint;
	if (window.MathJax?.typeset) window.MathJax.typeset();
}