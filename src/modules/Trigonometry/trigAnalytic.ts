/**
 * Analytic trigonometry: degrees/radians conversion, arc length, angular/linear speed, right triangle definitions, special triangles, elevation/depression, reference angles, ASTC signs, sum/difference, double/half-angle, polar coordinates, parametric equations, complex numbers.
 * @fileoverview Generates a variety of analytic trigonometry questions with MCQ distractors. Sets window.correctAnswer with LaTeX display and plain text alternate.
 * @date 2026-04-18
 */
import {questionArea} from "../../script.js";
import {getMaxForDifficulty} from "../Algebra/algebraUtils.js";
import {formatPiFraction} from "./trigUtils.js";
export function generateDegreesToRadians(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let angleDeg: number;
	if(difficulty==="easy"){
		const easyAngles=[30,45,60,90,120,180,270,360];
		angleDeg=easyAngles[Math.floor(Math.random()*easyAngles.length)];
	}
	else if(difficulty==="hard"){
		angleDeg=Math.floor(Math.random()*360)+1;
	}
	else{
		angleDeg=Math.floor(Math.random()*180)+1;
	}
	const angleRad=angleDeg*Math.PI/180;
	const exact=formatPiFraction(angleRad);
	questionArea.innerHTML=`Convert ${angleDeg}° to radians.`;
	let correct=exact;
	let choices=[correct];
	if(exact.includes("π")){
		choices.push(exact.replace("π","2π"));
		choices.push(exact.replace("π","π/2"));
		choices.push(angleRad.toFixed(4)+" rad");
	}
	else{
		choices.push((angleRad+0.5).toFixed(4)+" rad");
		choices.push((angleRad-0.5).toFixed(4)+" rad");
		choices.push((angleRad*2).toFixed(4)+" rad");
	}
	choices.push(angleDeg+" rad");
	choices.push((angleDeg*Math.PI/180).toFixed(2)+" rad");
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: angleRad.toFixed(4)+" rad",
		display: exact,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as a decimal (e.g., 0.7854 rad) or exact expression (e.g., π/4 rad)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateRadiansToDegrees(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let angleRad: number;
	let displayRad: string;
	if(difficulty==="easy"){
		const easyRad=[Math.PI/6,Math.PI/4,Math.PI/3,Math.PI/2,2*Math.PI/3,Math.PI,3*Math.PI/2,2*Math.PI];
		const idx=Math.floor(Math.random()*easyRad.length);
		angleRad=easyRad[idx];
		displayRad=formatPiFraction(angleRad);
	}
	else if(difficulty==="hard"){
		angleRad=Math.random()*2*Math.PI;
		displayRad=angleRad.toFixed(2)+" rad";
	}
	else{
		angleRad=parseFloat((Math.random()*Math.PI).toFixed(2));
		displayRad=angleRad.toFixed(2)+" rad";
	}
	const angleDeg=(angleRad*180/Math.PI).toFixed(2);
	questionArea.innerHTML=`Convert ${displayRad} to degrees.`;
	let correct=`${angleDeg}°`;
	let choices=[correct];
	choices.push(`${(parseFloat(angleDeg)+1).toFixed(2)}°`);
	choices.push(`${(parseFloat(angleDeg)-1).toFixed(2)}°`);
	choices.push(`${(parseFloat(angleDeg)*180/Math.PI).toFixed(2)}°`);
	choices.push(`${(parseFloat(angleDeg)*Math.PI/180).toFixed(2)}°`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: angleDeg,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as a number with ° (e.g., 45°)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateArcLength(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const maxR=getMaxForDifficulty(difficulty,10);
	const r=Math.floor(Math.random()*maxR)+1;
	let angle: number;
	let angleType: string;
	let angleRad: number;
	if(Math.random()<0.5){
		angle=Math.floor(Math.random()*180)+1;
		angleType="°";
		angleRad=angle*Math.PI/180;
	}
	else{
		angle=parseFloat((Math.random()*2*Math.PI).toFixed(2));
		angleType=" rad";
		angleRad=angle;
	}
	const arc=(r*angleRad).toFixed(2);
	const angleDisplay=angle.toFixed(2)+(angleType==="°"?"°":" rad");
	questionArea.innerHTML=`Find the arc length of a circle with radius ${r} and central angle ${angleDisplay}.`;
	let correct=arc;
	let choices=[correct];
	let wrongArc1=(r*(angleRad+0.1)).toFixed(2);
	let wrongArc2=(r*(angleRad-0.1)).toFixed(2);
	let wrongArc3=(r*angleRad*2).toFixed(2);
	let wrongArc4=(r*angleRad/2).toFixed(2);
	choices.push(wrongArc1,wrongArc2,wrongArc3,wrongArc4);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a number (e.g., 15.71)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateAngularLinearSpeed(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const maxR=getMaxForDifficulty(difficulty,5);
	const r=Math.floor(Math.random()*maxR)+1;
	const rpm=Math.floor(Math.random()*100)+20;
	const omega=(rpm*2*Math.PI/60);
	const v=r*omega;
	const type=Math.random()<0.5?"angular":"linear";
	let correct:string;
	let choices:string[]=[];
	if(type==="angular"){
		questionArea.innerHTML=`A wheel of radius ${r} m rotates at ${rpm} rpm. Find its angular speed in rad/s.`;
		correct=omega.toFixed(2);
		choices=[correct];
		choices.push((omega+0.5).toFixed(2));
		choices.push((omega-0.5).toFixed(2));
		choices.push((omega*2).toFixed(2));
		choices.push((omega/2).toFixed(2));
	}
	else{
		questionArea.innerHTML=`A wheel of radius ${r} m rotates at ${rpm} rpm. Find the linear speed of a point on its rim in m/s.`;
		correct=v.toFixed(2);
		choices=[correct];
		choices.push((v+0.5).toFixed(2));
		choices.push((v-0.5).toFixed(2));
		choices.push((v*2).toFixed(2));
		choices.push((v/2).toFixed(2));
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a number (e.g., 6.28)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateRightTriangleDefs(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const sides=["opposite","adjacent","hypotenuse"];
	let funcs: string[];
	if(difficulty==="hard"){
		funcs=["sin","cos","tan","csc","sec","cot"];
	}
	else{
		funcs=["sin","cos","tan"];
	}
	const side=sides[Math.floor(Math.random()*sides.length)];
	const func=funcs[Math.floor(Math.random()*funcs.length)];
	let answer="";
	if(func==="sin") answer=(side==="opposite")?"opposite/hypotenuse":"adjacent/hypotenuse";
	else if(func==="cos") answer=(side==="adjacent")?"adjacent/hypotenuse":"opposite/hypotenuse";
	else if(func==="tan") answer=(side==="opposite")?"opposite/adjacent":"adjacent/opposite";
	else if(func==="csc") answer=(side==="hypotenuse")?"hypotenuse/opposite":"hypotenuse/adjacent";
	else if(func==="sec") answer=(side==="hypotenuse")?"hypotenuse/adjacent":"hypotenuse/opposite";
	else if(func==="cot") answer=(side==="adjacent")?"adjacent/opposite":"opposite/adjacent";
	questionArea.innerHTML=`In a right triangle, what is the definition of ${func} of an angle in terms of ${side} and the hypotenuse?`;
	let correct=answer;
	let choices=[correct];
	if(func==="sin"){
		choices.push("opposite/adjacent");
		choices.push("adjacent/hypotenuse");
		choices.push("hypotenuse/opposite");
	}
	else if(func==="cos"){
		choices.push("opposite/hypotenuse");
		choices.push("opposite/adjacent");
		choices.push("hypotenuse/adjacent");
	}
	else if(func==="tan"){
		choices.push("opposite/hypotenuse");
		choices.push("adjacent/hypotenuse");
		choices.push("hypotenuse/opposite");
	}
	else{
		choices.push("opposite/hypotenuse");
		choices.push("adjacent/hypotenuse");
		choices.push("hypotenuse/adjacent");
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as a fraction (e.g., opposite/hypotenuse)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateSpecialTriangle(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["30-60-90","45-45-90"];
	const type=types[Math.floor(Math.random()*types.length)];
	const maxSide=getMaxForDifficulty(difficulty,5);
	if(type==="30-60-90"){
		const side=Math.random()<0.5?"short":"long";
		if(side==="short"){
			const short=Math.floor(Math.random()*maxSide)+1;
			const long=short*Math.sqrt(3);
			const hyp=2*short;
			questionArea.innerHTML=`In a 30-60-90 triangle, the shortest leg is ${short}. Find the other leg and the hypotenuse.`;
			const correct=`long leg = ${long.toFixed(2)}, hypotenuse = ${hyp}`;
			let choices=[correct];
			choices.push(`long leg = ${(long+1).toFixed(2)}, hypotenuse = ${hyp}`);
			choices.push(`long leg = ${(long-1).toFixed(2)}, hypotenuse = ${hyp}`);
			choices.push(`long leg = ${long.toFixed(2)}, hypotenuse = ${hyp+1}`);
			choices.push(`long leg = ${long.toFixed(2)}, hypotenuse = ${hyp-1}`);
			let uniqueChoices=[...new Set(choices)];
			if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
			if(!uniqueChoices.includes(correct)){
				if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
				else uniqueChoices=[correct];
			}
			window.correctAnswer={
				correct: correct,
				alternate: `${long.toFixed(2)}, ${hyp}`,
				display: correct,
				choices: uniqueChoices
			};
		}
		else{
			const long=Math.floor(Math.random()*maxSide)+1;
			const short=long/Math.sqrt(3);
			const hyp=2*short;
			questionArea.innerHTML=`In a 30-60-90 triangle, the longer leg is ${long}. Find the short leg and the hypotenuse.`;
			const correct=`short leg = ${short.toFixed(2)}, hypotenuse = ${hyp.toFixed(2)}`;
			let choices=[correct];
			choices.push(`short leg = ${(short+1).toFixed(2)}, hypotenuse = ${hyp.toFixed(2)}`);
			choices.push(`short leg = ${(short-1).toFixed(2)}, hypotenuse = ${hyp.toFixed(2)}`);
			choices.push(`short leg = ${short.toFixed(2)}, hypotenuse = ${(hyp+1).toFixed(2)}`);
			choices.push(`short leg = ${short.toFixed(2)}, hypotenuse = ${(hyp-1).toFixed(2)}`);
			let uniqueChoices=[...new Set(choices)];
			if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
			if(!uniqueChoices.includes(correct)){
				if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
				else uniqueChoices=[correct];
			}
			window.correctAnswer={
				correct: correct,
				alternate: `${short.toFixed(2)}, ${hyp.toFixed(2)}`,
				display: correct,
				choices: uniqueChoices
			};
		}
	}
	else{
		const leg=Math.floor(Math.random()*maxSide)+1;
		const hyp=leg*Math.sqrt(2);
		questionArea.innerHTML=`In a 45-45-90 triangle, each leg is ${leg}. Find the hypotenuse.`;
		const correct=hyp.toFixed(2);
		let choices=[correct];
		choices.push((hyp+1).toFixed(2));
		choices.push((hyp-1).toFixed(2));
		choices.push((hyp*2).toFixed(2));
		choices.push((hyp/2).toFixed(2));
		let uniqueChoices=[...new Set(choices)];
		if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
		if(!uniqueChoices.includes(correct)){
			if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
			else uniqueChoices=[correct];
		}
		window.correctAnswer={
			correct: correct,
			alternate: correct,
			display: correct,
			choices: uniqueChoices
		};
	}
	window.expectedFormat="Enter numbers separated by commas or phrases";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateElevationDepression(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const type=Math.random()<0.5?"elevation":"depression";
	let angleMin=10, angleMax=30;
	let distMin=20, distMax=50;
	if(difficulty==="easy"){
		angleMin=15; angleMax=25;
		distMin=30; distMax=40;
	}
	else if(difficulty==="hard"){
		angleMin=5; angleMax=45;
		distMin=10; distMax=100;
	}
	const angle=Math.floor(Math.random()*(angleMax-angleMin+1))+angleMin;
	const dist=Math.floor(Math.random()*(distMax-distMin+1))+distMin;
	if(type==="elevation"){
		const height=dist*Math.tan(angle*Math.PI/180);
		const correct=height.toFixed(2);
		let choices=[correct];
		choices.push((height+1).toFixed(2));
		choices.push((height-1).toFixed(2));
		choices.push((height*0.5).toFixed(2));
		choices.push((height*1.5).toFixed(2));
		let uniqueChoices=[...new Set(choices)];
		if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
		if(!uniqueChoices.includes(correct)){
			if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
			else uniqueChoices=[correct];
		}
		window.correctAnswer={
			correct: correct,
			alternate: correct,
			display: correct,
			choices: uniqueChoices
		};
	}
	else{
		const heightKnown=Math.floor(Math.random()*(distMax-distMin+1))+distMin;
		const distance=heightKnown/Math.tan(angle*Math.PI/180);
		const correct=distance.toFixed(2);
		let choices=[correct];
		choices.push((distance+1).toFixed(2));
		choices.push((distance-1).toFixed(2));
		choices.push((distance*0.5).toFixed(2));
		choices.push((distance*1.5).toFixed(2));
		let uniqueChoices=[...new Set(choices)];
		if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
		if(!uniqueChoices.includes(correct)){
			if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
			else uniqueChoices=[correct];
		}
		window.correctAnswer={
			correct: correct,
			alternate: correct,
			display: correct,
			choices: uniqueChoices
		};
	}
	window.expectedFormat="Enter a number (e.g., 15.2)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateReferenceAngle(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let angle: number;
	if(difficulty==="easy"){
		const easyAngles=[30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360];
		angle=easyAngles[Math.floor(Math.random()*easyAngles.length)];
	}
	else if(difficulty==="hard"){
		angle=Math.floor(Math.random()*360)+1;
	}
	else{
		angle=Math.floor(Math.random()*180)+1;
	}
	let ref=angle%180;
	if(ref>90) ref=180-ref;
	if(ref===0) ref=0;
	questionArea.innerHTML=`Find the reference angle for ${angle}°.`;
	const correct=ref.toString();
	let choices=[correct];
	choices.push((ref+5).toString());
	choices.push((ref-5).toString());
	choices.push((180-ref).toString());
	choices.push((90-ref).toString());
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: ref+"°",
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a number (e.g., 30)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateASTCSign(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const funcs=["sin","cos","tan"];
	let availableQuads: string[];
	if(difficulty==="easy"){
		availableQuads=["I","II","III","IV"];
	}
	else{
		availableQuads=["I","II","III","IV"];
	}
	const func=funcs[Math.floor(Math.random()*funcs.length)];
	const quad=availableQuads[Math.floor(Math.random()*availableQuads.length)];
	let sign="";
	if(func==="sin") sign=(quad==="I"||quad==="II")?"positive":"negative";
	else if(func==="cos") sign=(quad==="I"||quad==="IV")?"positive":"negative";
	else sign=(quad==="I"||quad==="III")?"positive":"negative";
	questionArea.innerHTML=`In quadrant ${quad}, is ${func} positive or negative?`;
	let correct=sign;
	let choices=[correct];
	choices.push(sign==="positive"?"negative":"positive");
	choices.push("zero");
	choices.push("undefined");
	choices.push("both");
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter 'positive' or 'negative'";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateSumDifference(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const funcs=["sin","cos","tan"];
	const func=funcs[Math.floor(Math.random()*funcs.length)];
	const op=Math.random()<0.5?"sum":"difference";
	let a: number, b: number;
	if(difficulty==="easy"){
		a=[30,45,60][Math.floor(Math.random()*3)];
		b=[30,45,60][Math.floor(Math.random()*3)];
	}
	else{
		a=Math.floor(Math.random()*45)+1;
		b=Math.floor(Math.random()*45)+1;
	}
	let expr="";
	if(op==="sum"){
		expr=`${func}(${a}° + ${b}°)`;
	}
	else{
		expr=`${func}(${a}° - ${b}°)`;
	}
	questionArea.innerHTML=`Use the sum/difference formula to find the exact value of \\( ${expr} \\).`;
	const radA=a*Math.PI/180;
	const radB=b*Math.PI/180;
	let value: number;
	if(func==="sin") value=Math.sin(radA+(op==="sum"?radB:-radB));
	else if(func==="cos") value=Math.cos(radA+(op==="sum"?radB:-radB));
	else value=Math.tan(radA+(op==="sum"?radB:-radB));
	const displayValue=value.toFixed(4);
	let correct=displayValue;
	let choices=[correct];
	choices.push((value+0.1).toFixed(4));
	choices.push((value-0.1).toFixed(4));
	choices.push((value*2).toFixed(4));
	choices.push((value/2).toFixed(4));
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal (e.g., 0.7071) or exact expression (e.g., √2/2)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateDoubleAngle(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const funcs=["sin","cos","tan"];
	const func=funcs[Math.floor(Math.random()*funcs.length)];
	let angle: number;
	if(difficulty==="easy"){
		angle=[30,45,60][Math.floor(Math.random()*3)];
	}
	else{
		angle=Math.floor(Math.random()*45)+1;
	}
	questionArea.innerHTML=`Use the double-angle formula to find \\( ${func}(2 \\cdot ${angle}°) \\).`;
	const rad=angle*Math.PI/180;
	let value: number;
	if(func==="sin") value=Math.sin(2*rad);
	else if(func==="cos") value=Math.cos(2*rad);
	else value=Math.tan(2*rad);
	const displayValue=value.toFixed(4);
	let correct=displayValue;
	let choices=[correct];
	choices.push((value+0.1).toFixed(4));
	choices.push((value-0.1).toFixed(4));
	choices.push((value*2).toFixed(4));
	choices.push((value/2).toFixed(4));
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal (e.g., 0.8660) or exact expression";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateHalfAngle(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const funcs=["sin","cos","tan"];
	const func=funcs[Math.floor(Math.random()*funcs.length)];
	let angle: number;
	if(difficulty==="easy"){
		angle=[30,45,60][Math.floor(Math.random()*3)];
	}
	else{
		angle=Math.floor(Math.random()*90)+1;
	}
	questionArea.innerHTML=`Use the half-angle formula to find \\( ${func}(${angle}°/2) \\).`;
	const rad=angle*Math.PI/180/2;
	let value: number;
	if(func==="sin") value=Math.sin(rad);
	else if(func==="cos") value=Math.cos(rad);
	else value=Math.tan(rad);
	const displayValue=value.toFixed(4);
	let correct=displayValue;
	let choices=[correct];
	choices.push((value+0.1).toFixed(4));
	choices.push((value-0.1).toFixed(4));
	choices.push((value*2).toFixed(4));
	choices.push((value/2).toFixed(4));
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal (e.g., 0.2588) or exact expression";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generatePolarToRectangular(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let r: number, thetaDeg: number;
	if(difficulty==="easy"){
		r=Math.floor(Math.random()*5)+1;
		thetaDeg=[0,90,180,270][Math.floor(Math.random()*4)];
	}
	else if(difficulty==="hard"){
		r=Math.floor(Math.random()*10)+1;
		thetaDeg=Math.floor(Math.random()*360);
	}
	else{
		r=Math.floor(Math.random()*8)+1;
		thetaDeg=Math.floor(Math.random()*180)+1;
	}
	const thetaRad=thetaDeg*Math.PI/180;
	const x=(r*Math.cos(thetaRad)).toFixed(2);
	const y=(r*Math.sin(thetaRad)).toFixed(2);
	const displayAnswer=`(${x}, ${y})`;
	questionArea.innerHTML=`Convert the polar coordinate \\( (${r}, ${thetaDeg}°) \\) to rectangular coordinates.`;
	let correct=displayAnswer;
	let choices=[correct];
	choices.push(`(${(parseFloat(x)+1).toFixed(2)}, ${y})`);
	choices.push(`(${x}, ${(parseFloat(y)+1).toFixed(2)})`);
	choices.push(`(${(parseFloat(x)-1).toFixed(2)}, ${y})`);
	choices.push(`(${x}, ${(parseFloat(y)-1).toFixed(2)})`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: `(${x}, ${y})`,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as (x, y)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateRectangularToPolar(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let x: number, y: number;
	if(difficulty==="easy"){
		x=Math.floor(Math.random()*5)+1;
		y=Math.floor(Math.random()*5)+1;
	}
	else if(difficulty==="hard"){
		x=Math.floor(Math.random()*20)-10;
		y=Math.floor(Math.random()*20)-10;
		if(x===0&&y===0){ x=1; y=1; }
	}
	else{
		x=Math.floor(Math.random()*10)-5;
		y=Math.floor(Math.random()*10)-5;
		if(x===0&&y===0){ x=1; y=1; }
	}
	const r=Math.sqrt(x*x+y*y).toFixed(2);
	const thetaRad=Math.atan2(y,x);
	const thetaDeg=(thetaRad*180/Math.PI).toFixed(2);
	const displayAnswer=`(${r}, ${thetaDeg}°)`;
	questionArea.innerHTML=`Convert the rectangular coordinate \\( (${x}, ${y}) \\) to polar coordinates (give angle in degrees).`;
	let correct=displayAnswer;
	let choices=[correct];
	choices.push(`(${r}, ${(parseFloat(thetaDeg)+10).toFixed(2)}°)`);
	choices.push(`(${r}, ${(parseFloat(thetaDeg)-10).toFixed(2)}°)`);
	choices.push(`(${(parseFloat(r)+1).toFixed(2)}, ${thetaDeg}°)`);
	choices.push(`(${(parseFloat(r)-1).toFixed(2)}, ${thetaDeg}°)`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: `(${r}, ${thetaDeg})`,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as (r, θ°)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generatePolarDistance(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const maxR=getMaxForDifficulty(difficulty,10);
	let r1=Math.floor(Math.random()*maxR)+1;
	let theta1Deg=Math.floor(Math.random()*360);
	let r2=Math.floor(Math.random()*maxR)+1;
	let theta2Deg=Math.floor(Math.random()*360);
	const theta1=theta1Deg*Math.PI/180;
	const theta2=theta2Deg*Math.PI/180;
	const dist=Math.sqrt(r1*r1+r2*r2-2*r1*r2*Math.cos(theta1-theta2)).toFixed(2);
	questionArea.innerHTML=`Find the distance between the polar points \\( (${r1}, ${theta1Deg}°) \\) and \\( (${r2}, ${theta2Deg}°) \\).`;
	let correct=dist;
	let choices=[correct];
	choices.push((parseFloat(dist)+0.5).toFixed(2));
	choices.push((parseFloat(dist)-0.5).toFixed(2));
	choices.push((Math.abs(r1-r2)).toFixed(2));
	choices.push((r1+r2).toFixed(2));
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a number";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generatePolarGraphEquation(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["rose","limaçon","cardioid","lemniscate","spiral"];
	const type=types[Math.floor(Math.random()*types.length)];
	let a, b, n;
	let equation="";
	let description="";
	const max=getMaxForDifficulty(difficulty,3);
	switch(type){
		case "rose":
			n=Math.floor(Math.random()*max)+2;
			a=Math.floor(Math.random()*max)+1;
			equation=`r = ${a} \\cos(${n}\\theta)`;
			description=`A rose curve with ${n%2===0?2*n:n} petals`;
			break;
		case "limaçon":
			a=Math.floor(Math.random()*max)+2;
			b=Math.floor(Math.random()*max)+1;
			equation=`r = ${a} + ${b} \\cos\\theta`;
			if(a>b) description="A limaçon with a dimple";
			else if(a===b) description="A cardioid (heart-shaped)";
			else description="A limaçon with an inner loop";
			break;
		case "cardioid":
			a=Math.floor(Math.random()*max)+1;
			equation=`r = ${a} (1 + \\cos\\theta)`;
			description="A cardioid";
			break;
		case "lemniscate":
			a=Math.floor(Math.random()*max)+1;
			equation=`r^2 = ${a} \\cos(2\\theta)`;
			description="A lemniscate (figure-eight)";
			break;
		case "spiral":
			a=Math.floor(Math.random()*max)+1;
			equation=`r = ${a}\\theta`;
			description="An Archimedean spiral";
			break;
	}
	questionArea.innerHTML=`Identify the type of polar graph: \\( ${equation} \\).`;
	let correct=description;
	let choices=[correct];
	if(type==="rose"){
		choices.push("A circle", "A cardioid", "A lemniscate", "A limaçon");
	}
	else if(type==="limaçon"){
		choices.push("A rose", "A cardioid", "A lemniscate", "A spiral");
	}
	else if(type==="cardioid"){
		choices.push("A rose", "A limaçon", "A lemniscate", "A spiral");
	}
	else if(type==="lemniscate"){
		choices.push("A rose", "A cardioid", "A limaçon", "A spiral");
	}
	else{
		choices.push("A rose", "A cardioid", "A lemniscate", "A limaçon");
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a short description (e.g., 'rose with 4 petals')";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateParametricToCartesian(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["line","circle","ellipse","parabola"];
	const type=types[Math.floor(Math.random()*types.length)];
	let xEq, yEq, cartesian;
	const max=getMaxForDifficulty(difficulty,3);
	if(type==="line"){
		let m=Math.floor(Math.random()*max)+1;
		let b=Math.floor(Math.random()*max);
		xEq="t";
		yEq=`${m}t + ${b}`;
		cartesian=`y = ${m}x + ${b}`;
	}
	else if(type==="circle"){
		let r=Math.floor(Math.random()*max)+1;
		xEq=`${r} \\cos t`;
		yEq=`${r} \\sin t`;
		cartesian=`x^2 + y^2 = ${r*r}`;
	}
	else if(type==="ellipse"){
		let a=Math.floor(Math.random()*max)+2;
		let b=Math.floor(Math.random()*(max-1))+1;
		xEq=`${a} \\cos t`;
		yEq=`${b} \\sin t`;
		cartesian=`\\frac{x^2}{${a*a}} + \\frac{y^2}{${b*b}} = 1`;
	}
	else{
		let a=Math.floor(Math.random()*max)+1;
		xEq="t";
		yEq=`${a} t^2`;
		cartesian=`y = ${a} x^2`;
	}
	questionArea.innerHTML=`Eliminate the parameter to find the Cartesian equation: \\( x = ${xEq}, y = ${yEq} \\).`;
	let correct=cartesian;
	let choices=[correct];
	if(type==="line"){
		choices.push(`y = ${parseInt(cartesian.split("=")[1].split("x")[0])+1}x + ${cartesian.split("+")[1]}`);
		choices.push(`y = ${parseInt(cartesian.split("=")[1].split("x")[0])-1}x + ${cartesian.split("+")[1]}`);
		choices.push(`y = ${parseInt(cartesian.split("=")[1].split("x")[0])}x + ${parseInt(cartesian.split("+")[1])+1}`);
		choices.push(`y = ${parseInt(cartesian.split("=")[1].split("x")[0])}x + ${parseInt(cartesian.split("+")[1])-1}`);
	}
	else if(type==="circle"){
		choices.push(`x^2 + y^2 = ${(parseInt(cartesian.split("=")[1])+1).toFixed(2)}`);
		choices.push(`x^2 + y^2 = ${(parseInt(cartesian.split("=")[1])-1).toFixed(2)}`);
		choices.push(`x^2 + y^2 = ${(parseInt(cartesian.split("=")[1])*2).toFixed(2)}`);
		choices.push(`x^2 + y^2 = ${(parseInt(cartesian.split("=")[1])/2).toFixed(2)}`);
	}
	else if(type==="ellipse"){
		choices.push(`\\frac{x^2}{${(parseInt(cartesian.split("x^2/")[1].split("+")[0])+1).toFixed(2)}} + \\frac{y^2}{${parseInt(cartesian.split("y^2/")[1].split("=")[0])}} = 1`);
		choices.push(`\\frac{x^2}{${(parseInt(cartesian.split("x^2/")[1].split("+")[0])-1).toFixed(2)}} + \\frac{y^2}{${parseInt(cartesian.split("y^2/")[1].split("=")[0])}} = 1`);
		choices.push(`\\frac{x^2}{${parseInt(cartesian.split("x^2/")[1].split("+")[0])}} + \\frac{y^2}{${(parseInt(cartesian.split("y^2/")[1].split("=")[0])+1).toFixed(2)}} = 1`);
		choices.push(`\\frac{x^2}{${parseInt(cartesian.split("x^2/")[1].split("+")[0])}} + \\frac{y^2}{${(parseInt(cartesian.split("y^2/")[1].split("=")[0])-1).toFixed(2)}} = 1`);
	}
	else{
		choices.push(`y = ${parseFloat(cartesian.split("=")[1].split("x")[0])+1}x^2`);
		choices.push(`y = ${parseFloat(cartesian.split("=")[1].split("x")[0])-1}x^2`);
		choices.push(`y = ${parseFloat(cartesian.split("=")[1].split("x")[0])}x^3`);
		choices.push(`y = ${parseFloat(cartesian.split("=")[1].split("x")[0])}x`);
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter the Cartesian equation (e.g., y = 2x + 3)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateParametricMotion(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const maxV=getMaxForDifficulty(difficulty,20);
	const v0=Math.floor(Math.random()*maxV)+10;
	const theta=Math.floor(Math.random()*60)+15;
	const t=parseFloat((Math.random()*2).toFixed(2));
	const g=9.8;
	const x=v0*Math.cos(theta*Math.PI/180)*t;
	const y=v0*Math.sin(theta*Math.PI/180)*t-0.5*g*t*t;
	const displayAnswer=`(${x.toFixed(2)}, ${y.toFixed(2)})`;
	questionArea.innerHTML=`A projectile is launched with initial velocity ${v0} m/s at angle ${theta}°. Find its coordinates after ${t} seconds (use g = 9.8 m/s²).`;
	let correct=displayAnswer;
	let choices=[correct];
	choices.push(`(${(x+1).toFixed(2)}, ${y.toFixed(2)})`);
	choices.push(`(${x.toFixed(2)}, ${(y+1).toFixed(2)})`);
	choices.push(`(${(x-1).toFixed(2)}, ${y.toFixed(2)})`);
	choices.push(`(${x.toFixed(2)}, ${(y-1).toFixed(2)})`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: `(${x.toFixed(2)}, ${y.toFixed(2)})`,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as (x, y)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateComplexPolarForm(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const max=getMaxForDifficulty(difficulty,5);
	let a=Math.floor(Math.random()*max*2)-max;
	let b=Math.floor(Math.random()*max*2)-max;
	if(a===0&&b===0){ a=1; b=1; }
	const r=Math.sqrt(a*a+b*b).toFixed(2);
	const thetaRad=Math.atan2(b,a);
	const thetaDeg=(thetaRad*180/Math.PI).toFixed(2);
	const displayAnswer=`${r} \\operatorname{cis} ${thetaDeg}°`;
	questionArea.innerHTML=`Write the complex number \\( ${a} + ${b}i \\) in polar form (angle in degrees).`;
	let correct=displayAnswer;
	let choices=[correct];
	choices.push(`${(parseFloat(r)+1).toFixed(2)} \\operatorname{cis} ${thetaDeg}°`);
	choices.push(`${(parseFloat(r)-1).toFixed(2)} \\operatorname{cis} ${thetaDeg}°`);
	choices.push(`${r} \\operatorname{cis} ${(parseFloat(thetaDeg)+10).toFixed(2)}°`);
	choices.push(`${r} \\operatorname{cis} ${(parseFloat(thetaDeg)-10).toFixed(2)}°`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: `${r} cis ${thetaDeg}°`,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as 'r cis θ°' or r(cos θ + i sin θ)";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateComplexMultiplyDivide(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const max=getMaxForDifficulty(difficulty,5);
	const r1=Math.floor(Math.random()*max)+1;
	const theta1Deg=Math.floor(Math.random()*360);
	const r2=Math.floor(Math.random()*max)+1;
	const theta2Deg=Math.floor(Math.random()*360);
	const op=Math.random()<0.5?"multiply":"divide";
	let resultR, resultThetaDeg;
	if(op==="multiply"){
		resultR=(r1*r2).toFixed(2);
		resultThetaDeg=(theta1Deg+theta2Deg)%360;
	}
	else{
		resultR=(r1/r2).toFixed(2);
		resultThetaDeg=(theta1Deg-theta2Deg+360)%360;
	}
	const displayAnswer=`${resultR} \\operatorname{cis} ${resultThetaDeg}°`;
	questionArea.innerHTML=`Given \\( z_1 = ${r1} \\text{ cis } ${theta1Deg}° \\) and \\( z_2 = ${r2} \\text{ cis } ${theta2Deg}° \\), find \\( z_1 ${op==='multiply'?'\\cdot':'/'} z_2 \\) in polar form.`;
	let correct=displayAnswer;
	let choices=[correct];
	choices.push(`${(parseFloat(resultR)+1).toFixed(2)} \\operatorname{cis} ${resultThetaDeg}°`);
	choices.push(`${(parseFloat(resultR)-1).toFixed(2)} \\operatorname{cis} ${resultThetaDeg}°`);
	choices.push(`${resultR} \\operatorname{cis} ${(resultThetaDeg+10).toFixed(2)}°`);
	choices.push(`${resultR} \\operatorname{cis} ${(resultThetaDeg-10).toFixed(2)}°`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: `${resultR} cis ${resultThetaDeg}°`,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as 'r cis θ°' or expanded form";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateDeMoivre(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const max=getMaxForDifficulty(difficulty,3);
	const r=Math.floor(Math.random()*max)+1;
	const thetaDeg=Math.floor(Math.random()*90)+1;
	const n=Math.floor(Math.random()*4)+2;
	const newR=Math.pow(r,n).toFixed(2);
	const newThetaDeg=(thetaDeg*n)%360;
	const displayAnswer=`${newR} \\operatorname{cis} ${newThetaDeg}°`;
	questionArea.innerHTML=`Use De Moivre's theorem to compute \\( (${r} \\text{ cis } ${thetaDeg}°)^{${n}} \\).`;
	let correct=displayAnswer;
	let choices=[correct];
	choices.push(`${(parseFloat(newR)+1).toFixed(2)} \\operatorname{cis} ${newThetaDeg}°`);
	choices.push(`${(parseFloat(newR)-1).toFixed(2)} \\operatorname{cis} ${newThetaDeg}°`);
	choices.push(`${newR} \\operatorname{cis} ${(newThetaDeg+10).toFixed(2)}°`);
	choices.push(`${newR} \\operatorname{cis} ${(newThetaDeg-10).toFixed(2)}°`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: `${newR} cis ${newThetaDeg}°`,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as 'r cis θ°' or expanded form";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateComplexRoots(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const max=getMaxForDifficulty(difficulty,3);
	const r=Math.floor(Math.random()*max)+1;
	const thetaDeg=Math.floor(Math.random()*360);
	const n=Math.floor(Math.random()*3)+2;
	const rootR=Math.pow(r,1/n).toFixed(2);
	const angles: string[]=[];
	const displayAngles: string[]=[];
	for(let k=0;k<n;k++){
		let angle=(thetaDeg+360*k)/n;
		angles.push(`${rootR} cis ${angle.toFixed(2)}°`);
		displayAngles.push(`${rootR} \\operatorname{cis} ${angle.toFixed(2)}°`);
	}
	questionArea.innerHTML=`Find all ${n}th roots of \\( ${r} \\text{ cis } ${thetaDeg}° \\).`;
	let correct=displayAngles.join("; ");
	let choices=[correct];
	let wrongRoots:string[]=[];
	for(let k=0;k<n;k++){
		let wrongAngle=(thetaDeg+360*k+10)/n;
		wrongRoots.push(`${rootR} \\operatorname{cis} ${wrongAngle.toFixed(2)}°`);
	}
	choices.push(wrongRoots.join("; "));
	wrongRoots=[];
	for(let k=0;k<n;k++){
		let wrongAngle=(thetaDeg+360*k-10)/n;
		wrongRoots.push(`${rootR} \\operatorname{cis} ${wrongAngle.toFixed(2)}°`);
	}
	choices.push(wrongRoots.join("; "));
	choices.push(`${rootR} \\operatorname{cis} ${(thetaDeg/n).toFixed(2)}° only`);
	choices.push("No real roots");
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: angles.join("; "),
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as 'r1 cis θ1°; r2 cis θ2°; ...'";
	if(window.MathJax?.typeset) window.MathJax.typeset();
}