﻿/**
 * Advanced trigonometry: inverse trig functions, equations, graphs.
 * @fileoverview Generates questions on inverse trigonometric functions, solving trigonometric equations, and interpreting trig graphs. Returns a QuestionDto with LaTeX display, plain text alternate, and plausible wrong answers for MCQ mode.
 * @date 2026-04-18
 */
import type {RngFn, QuestionDto} from "../../types/global";
import {formatPiFraction} from "./TrigUtils.js";
export function generateInverseTrig(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	let types=["arcsin","arccos","arctan"];
	let type=types[Math.floor(rng()*types.length)];
	let hint="", questionText="", correctAnswerStr="", alternateAnswerStr="", displayAnswerStr="";
	let valRange: number;
	if(difficulty==="easy") valRange=2;
	else if(difficulty==="hard") valRange=20;
	else valRange=10;
	let val: number;
	if(type==="arctan"){
		val=Math.floor(rng()*valRange*2)-valRange;
	}
	else{
		if(difficulty==="easy"){
			let simple=[0,0.5,0.707,1];
			val=simple[Math.floor(rng()*simple.length)]*(rng()<0.5?1:-1);
		}
		else{
			val=(Math.floor(rng()*20)/10)-1;
		}
	}
	let principal: number;
	if(type==="arcsin") principal=Math.asin(val);
	else if(type==="arccos") principal=Math.acos(val);
	else principal=Math.atan(val);
	let deg=(principal*180/Math.PI).toFixed(1);
	questionText=`Evaluate \\( ${type}(${val.toFixed(2)}) \\) in radians and degrees. (Principal value)`;
	let exact: string|null=null;
	const exactRadians: Record<string, number>={
		"0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
		"\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
		"\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
		"\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
	};
	for(let [exactStr, rad] of Object.entries(exactRadians)){
		if(Math.abs(principal-rad)<1e-8){
			exact=exactStr;
			break;
		}
	}
	if(exact){
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
	for(let [exactStr, rad] of Object.entries(exactRadians)){
		if(Math.abs(wrongPrincipal-rad)<1e-8){
			wrongExact=exactStr;
			break;
		}
	}
	if(wrongExact){
		choices.push(`${wrongExact} rad, ${wrongDeg}°`);
	}
	else{
		choices.push(`${wrongPrincipal.toFixed(2)} rad, ${wrongDeg}°`);
	}
	choices.push(`${principal.toFixed(2)} rad`);
	choices.push(`${deg}°`);
	choices.push(`undefined`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correctAnswerStr)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correctAnswerStr;
		else uniqueChoices=[correctAnswerStr];
	}
	return {
		latex: questionText,
		correct: correctAnswerStr,
		alternate: alternateAnswerStr,
		display: displayAnswerStr,
		choices: uniqueChoices,
		expectedFormat: hint
	};
}
export function generateTrigEquations(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	let types=["basic","multiple_angle","using_identity"];
	let type=types[Math.floor(rng()*types.length)];
	let hint="", questionText="", correctAnswerStr="", alternateAnswerStr="", displayAnswerStr="";
	let choices:string[]=[];
	let maxCoeff=(difficulty==="easy")?2:(difficulty==="hard"?4:3);
	let simpleValues=[0,0.5,Math.sqrt(2)/2,Math.sqrt(3)/2,1];
	let useSimpleValues=(difficulty==="easy");
	switch(type){
		case "basic":{
			let func=rng()<0.5?"sin":"cos";
			let val: number;
			if(useSimpleValues){
				val=simpleValues[Math.floor(rng()*simpleValues.length)];
			}
			else{
				val=(Math.floor(rng()*10)/10);
			}
			val=Math.min(0.99,Math.max(-0.99,val));
			let angle=func==="sin"?Math.asin(val):Math.acos(val);
			let sol=angle;
			if(sol<0) sol+=2*Math.PI;
			questionText=`Solve \\( ${func}\\theta=${val.toFixed(2)} \\) for \\( \\theta \\) in \\( [0, 2\\pi) \\). Give the smallest positive solution.`;
			let exact=null;
			const exactRadians: Record<string, number>={
				"0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
				"\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
				"\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
				"\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
			};
			for(let [exactStr, rad] of Object.entries(exactRadians)){
				if(Math.abs(sol-rad)<1e-8){
					exact=exactStr;
					break;
				}
			}
			if(exact){
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
			choices=[correctAnswerStr];
			let wrongAngle=func==="sin"?Math.asin(-val):Math.acos(-val);
			let wrongSol=wrongAngle;
			if(wrongSol<0) wrongSol+=2*Math.PI;
			let wrongExact=null;
			for(let [exactStr, rad] of Object.entries(exactRadians)){
				if(Math.abs(wrongSol-rad)<1e-8){
					wrongExact=exactStr;
					break;
				}
			}
			if(wrongExact){
				choices.push(wrongExact);
			}
			else{
				choices.push(wrongSol.toFixed(2));
			}
			let otherSol=2*Math.PI-sol;
			let otherExact=null;
			for(let [exactStr, rad] of Object.entries(exactRadians)){
				if(Math.abs(otherSol-rad)<1e-8){
					otherExact=exactStr;
					break;
				}
			}
			if(otherExact){
				choices.push(otherExact);
			}
			else{
				choices.push(otherSol.toFixed(2));
			}
			choices.push(sol.toFixed(2));
			choices.push(sol.toFixed(2)+"π");
			break;
		}
		case "multiple_angle":{
			let func=rng()<0.5?"sin":"cos";
			let coeff=Math.floor(rng()*maxCoeff)+2;
			let val: number;
			if(useSimpleValues){
				val=simpleValues[Math.floor(rng()*simpleValues.length)];
			}
			else{
				val=(Math.floor(rng()*10)/10);
			}
			val=Math.min(0.99,Math.max(-0.99,val));
			let angle=func==="sin"?Math.asin(val):Math.acos(val);
			let base=angle/coeff;
			let sol=base;
			if(sol<0) sol+=2*Math.PI;
			questionText=`Solve \\( ${func}(${coeff}\\theta)=${val.toFixed(2)} \\) for \\( 0 \\le \\theta < 2\\pi \\). Give the smallest positive solution.`;
			let exact=null;
			const exactRadians: Record<string, number>={
				"0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
				"\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
				"\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
				"\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
			};
			for(let [exactStr, rad] of Object.entries(exactRadians)){
				if(Math.abs(sol-rad)<1e-8){
					exact=exactStr;
					break;
				}
			}
			if(exact){
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
			choices=[correctAnswerStr];
			let wrongBase=(Math.PI-angle)/coeff;
			let wrongSol=wrongBase;
			if(wrongSol<0) wrongSol+=2*Math.PI;
			let wrongExact=null;
			for(let [exactStr, rad] of Object.entries(exactRadians)){
				if(Math.abs(wrongSol-rad)<1e-8){
					wrongExact=exactStr;
					break;
				}
			}
			if(wrongExact){
				choices.push(wrongExact);
			}
			else{
				choices.push(wrongSol.toFixed(2));
			}
			let otherSol=sol+2*Math.PI/coeff;
			if(otherSol<2*Math.PI){
				let otherExact=null;
				for(let [exactStr, rad] of Object.entries(exactRadians)){
					if(Math.abs(otherSol-rad)<1e-8){
						otherExact=exactStr;
						break;
					}
				}
				if(otherExact){
					choices.push(otherExact);
				}
				else{
					choices.push(otherSol.toFixed(2));
				}
			}
			choices.push(sol.toFixed(2));
			choices.push(sol.toFixed(2)+"π");
			break;
		}
		case "using_identity":{
			let c: number;
			if(useSimpleValues){
				c=0.25;
			}
			else{
				c=(Math.floor(rng()*8)+1)/16;
			}
			questionText=`Solve \\( \\sin^2\\theta=${c.toFixed(2)} \\) for \\( 0 \\le \\theta < 2\\pi \\). Give the smallest positive solution.`;
			let baseAngle=Math.asin(Math.sqrt(c));
			let sol=baseAngle;
			if(sol<0) sol+=2*Math.PI;
			let exact=null;
			const exactRadians: Record<string, number>={
				"0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
				"\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
				"\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
				"\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
			};
			for(let [exactStr, rad] of Object.entries(exactRadians)){
				if(Math.abs(sol-rad)<1e-8){
					exact=exactStr;
					break;
				}
			}
			if(exact){
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
			choices=[correctAnswerStr];
			let wrongBase=Math.asin(-Math.sqrt(c));
			let wrongSol=wrongBase;
			if(wrongSol<0) wrongSol+=2*Math.PI;
			let wrongExact=null;
			for(let [exactStr, rad] of Object.entries(exactRadians)){
				if(Math.abs(wrongSol-rad)<1e-8){
					wrongExact=exactStr;
					break;
				}
			}
			if(wrongExact){
				choices.push(wrongExact);
			}
			else{
				choices.push(wrongSol.toFixed(2));
			}
			let otherSol=Math.PI-sol;
			let otherExact=null;
			for(let [exactStr, rad] of Object.entries(exactRadians)){
				if(Math.abs(otherSol-rad)<1e-8){
					otherExact=exactStr;
					break;
				}
			}
			if(otherExact){
				choices.push(otherExact);
			}
			else{
				choices.push(otherSol.toFixed(2));
			}
			choices.push(sol.toFixed(2));
			choices.push(sol.toFixed(2)+"π");
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correctAnswerStr)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correctAnswerStr;
		else uniqueChoices=[correctAnswerStr];
	}
	return {
		latex: questionText,
		correct: correctAnswerStr,
		alternate: alternateAnswerStr,
		display: displayAnswerStr,
		choices: uniqueChoices,
		expectedFormat: hint
	};
}
export function generateTrigGraphs(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	const types=["sine","cosine","tangent"];
	const type=types[Math.floor(rng()*types.length)];
	let maxA=(difficulty==="easy")?2:(difficulty==="hard"?5:3);
	let maxB=(difficulty==="easy")?2:(difficulty==="hard"?4:3);
	const A=Math.floor(rng()*maxA)+1;
	const B=Math.floor(rng()*maxB)+1;
	const C=Math.floor(rng()*2);
	let questionText="", correctAnswerStr="", alternateAnswerStr="", displayAnswerStr="", hint="";
	let choices: string[]=[];
	switch(type){
		case "sine":
		case "cosine":{
			const askType=Math.floor(rng()*3);
			if(askType===0){
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
			else if(askType===1){
				const period=2*Math.PI/B;
				const exactPeriod=formatPiFraction(period);
				questionText=`What is the period of the graphed ${type} function? (in radians)`;
				if(exactPeriod.includes("π")){
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
				if(exactPeriod.includes("π")){
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
				if(phaseShift===0){
					correctAnswerStr="0";
					alternateAnswerStr="0";
					displayAnswerStr="0";
					choices=["0","π/2","π","-π/2"];
				}
				else{
					if(exactPhase.includes("π")){
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
			const askType=Math.floor(rng()*2);
			if(askType===0){
				const period=Math.PI/B;
				const exactPeriod=formatPiFraction(period);
				questionText=`What is the period of the graphed tangent function? (in radians)`;
				if(exactPeriod.includes("π")){
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
				if(exactPeriod.includes("π")){
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
				if(firstAsymp<0) firstAsymp+=period;
				const exactAsymp=formatPiFraction(firstAsymp);
				questionText=`Give the equation of the vertical asymptote that lies between 0 and π/${B.toFixed(2)}.`;
				if(exactAsymp.includes("π")){
					correctAnswerStr=`x=${exactAsymp}`;
					alternateAnswerStr=`x=${firstAsymp.toFixed(2)}`;
					displayAnswerStr=`x=\\${exactAsymp}`;
					choices=[correctAnswerStr];
					let wrongAsymp1=(Math.PI/2 - C + Math.PI)/B;
					if(wrongAsymp1<0) wrongAsymp1+=period;
					choices.push(`x=${formatPiFraction(wrongAsymp1)}`);
					let wrongAsymp2=(Math.PI/2 - C - Math.PI)/B;
					if(wrongAsymp2<0) wrongAsymp2+=period;
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
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correctAnswerStr)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correctAnswerStr;
		else uniqueChoices=[correctAnswerStr];
	}
	return {
		latex: questionText,
		correct: correctAnswerStr,
		alternate: alternateAnswerStr,
		display: displayAnswerStr,
		choices: uniqueChoices,
		expectedFormat: hint
	};
}