import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";
function gcd(a: number, b: number): number{
	while(b){
		let t=b;
		b=a%b;
		a=t;
	}
	return a;
}
function formatNumber(n: number): string{
	return parseFloat(n.toFixed(2)).toString();
}
function formatFraction(num: number, den: number): string{
	let g=gcd(num,den);
	num/=g;
	den/=g;
	if(den===1){
		return `${num}`;
	}
	else{
		return `${num}/${den}`;
	}
}
/**
 * @fileoverview Generates random integral calculus questions for AP Calculus practice.
 * Provides a wide variety of integration problems including polynomial, trigonometric,
 * exponential, logarithmic, substitution, definite integrals, initial value problems,
 * area under curves, motion, inverse trigonometric integrals, completing the square,
 * logistic models, improper integrals with vertical asymptotes, polar arc length,
 * and parametric arc length. Each question is presented with LaTeX formatting and
 * includes multiple‑choice distractors for MCQ mode.
 *
 * @module calculusIntegral
 * @date 2026-04-18
 */
export function generateIntegral(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const questionTypes=[
		"polynomial","trigonometric","exponential","logarithmic",
		"substitution","definite","initialValue","area","motion",
		"inverseTrig","completingSquare","logisticModel","improperVertical",
		"polarArcLength","parametricArcLength"
	];
	const questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	const maxCoeff=getMaxCoeff(difficulty);
	let mathExpression="";
	let plainCorrectIntegral="";
	let latexAnswer="";
	let alternateAnswer:string|undefined=undefined;
	let choices: string[]=[];
	switch(questionType){
		case "polynomial":{
			const numTerms=Math.floor(Math.random()*4)+2;
			const exponents=new Set<number>();
			while(exponents.size<numTerms){
				exponents.add(Math.floor(Math.random()*11));
			}
			const exponentsArray=Array.from(exponents).sort((a,b)=>b-a);
			const coefficients: number[]=[];
			for(const exp of exponentsArray){
				let coeff;
				if(exp===0){
					coeff=Math.floor(Math.random()*100)+1;
				}
				else if(exp===1){
					coeff=Math.floor(Math.random()*maxCoeff)+1;
				}
				else{
					coeff=Math.floor(Math.random()*maxCoeff*2)+1;
				}
				coefficients.push(coeff);
			}
			const terms: string[]=[];
			for(let i=0;i<exponentsArray.length;i++){
				const exp=exponentsArray[i];
				const coeff=coefficients[i];
				if(exp===0){
					terms.push(`${coeff}`);
				}
				else if(exp===1){
					terms.push(`${coeff}x`);
				}
				else{
					terms.push(`${coeff}x^{${exp}}`);
				}
			}
			const polynomial=`(${terms.join("+")})`;
			mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
			const integralTerms: string[]=[];
			for(let i=0;i<exponentsArray.length;i++){
				const exp=exponentsArray[i];
				const coeff=coefficients[i];
				const newExp=exp+1;
				const newCoeff=coeff/newExp;
				let xPart;
				if(newExp===1){
					xPart="x";
				}
				else{
					xPart=`x^${newExp}`;
				}
				integralTerms.push(`${formatNumber(newCoeff)}${xPart}`);
			}
			integralTerms.push("C");
			plainCorrectIntegral=integralTerms.join("+");
			latexAnswer=plainCorrectIntegral;
			const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			const wrongTerms=[...integralTerms];
			if(wrongTerms.length>1){
				let firstNum=parseFloat(wrongTerms[0]);
				wrongTerms[0]=`${(firstNum+1).toFixed(2)}${wrongTerms[0].match(/[a-z]/)?.[0]||""}`;
				choices.push(wrongTerms.join("+").replace(/\s/g,"").toLowerCase());
				wrongTerms[0]=`${(firstNum-1).toFixed(2)}${wrongTerms[0].match(/[a-z]/)?.[0]||""}`;
				choices.push(wrongTerms.join("+").replace(/\s/g,"").toLowerCase());
			}
			choices.push(integralTerms.map(t=>t.replace(/\^(\d+)/,"^$1")).join("+").replace(/\s/g,"").toLowerCase());
			choices.push(integralTerms.map(t=>t.replace(/\^(\d+)/,"^"+ (parseInt(t.match(/\d+$/)?.[0]||"1")+1))).join("+").replace(/\s/g,"").toLowerCase());
			break;
		}
		case "trigonometric":{
			const trigOptions=[
				{ func: "sin", target: "cos", sign: -1 },
				{ func: "cos", target: "sin", sign: 1 },
				{ func: "sec^2", target: "tan", sign: 1 },
				{ func: "csc^2", target: "cot", sign: -1 },
				{ func: "sec tan", target: "sec", sign: 1 },
				{ func: "csc cot", target: "csc", sign: -1 }
			];
			const chosen=trigOptions[Math.floor(Math.random()*trigOptions.length)];
			const a=Math.floor(Math.random()*maxCoeff)+1;
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			const funcStr=`${coeff} ${chosen.func}(${a}x)`;
			mathExpression=`\\[ \\int ${funcStr} \\,dx=? \\]`;
			const decimalCoeff=coeff/a;
			plainCorrectIntegral=`${formatNumber(chosen.sign*decimalCoeff)} ${chosen.target}(${a}x)+C`;
			const fractionStr=formatFraction(coeff,a);
			let signStr;
			if(chosen.sign===1){
				signStr='';
			}
			else{
				signStr='-';
			}
			alternateAnswer=`${signStr}${fractionStr} ${chosen.target}(${a}x)+C`;
			latexAnswer=`${signStr}\\frac{${coeff}}{${a}} ${chosen.target}(${a}x)+C`;
			const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			let wrongSign;
			if(chosen.sign===1){
				wrongSign=-1;
			}
			else{
				wrongSign=1;
			}
			let wrongSignStr;
			if(wrongSign===1){
				wrongSignStr='';
			}
			else{
				wrongSignStr='-';
			}
			choices.push(`${wrongSignStr}${fractionStr} ${chosen.target}(${a}x)+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${signStr}${fractionStr} ${chosen.func}(${a}x)+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${signStr}${fractionStr} ${chosen.target}(x)+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${signStr}${coeff} ${chosen.target}(${a}x)+C`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "exponential":{
			const base=Math.random()<0.5?"e":Math.floor(Math.random()*3)+2;
			const a=Math.floor(Math.random()*maxCoeff)+1;
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			if(base==="e"){
				mathExpression=`\\[ \\int ${coeff}e^{${a}x} \\,dx=? \\]`;
				plainCorrectIntegral=`${formatNumber(coeff/a)}e^(${a}x)+C`;
				latexAnswer=`\\frac{${coeff}}{${a}}e^{${a}x}+C`;
				const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
				choices=[normalizedCorrect];
				choices.push(`${formatNumber(coeff)}e^(${a}x)+C`.replace(/\s/g,"").toLowerCase());
				choices.push(`${formatNumber(coeff/a)}e^(${a}x)`.replace(/\s/g,"").toLowerCase());
				choices.push(`${formatNumber(coeff*a)}e^(${a}x)+C`.replace(/\s/g,"").toLowerCase());
				choices.push(`${formatNumber(coeff/(a+1))}e^(${a}x)+C`.replace(/\s/g,"").toLowerCase());
			}
			else{
				mathExpression=`\\[ \\int ${coeff}${base}^{x} \\,dx=? \\]`;
				const lnBase=Math.log(base as number);
				plainCorrectIntegral=`${formatNumber(coeff/lnBase)}${base}^x+C`;
				latexAnswer=`\\frac{${coeff}}{\\ln(${base})}${base}^{x}+C`;
				const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
				choices=[normalizedCorrect];
				choices.push(`${coeff}${base}^x+C`.replace(/\s/g,"").toLowerCase());
				choices.push(`${formatNumber(coeff)}${base}^x+C`.replace(/\s/g,"").toLowerCase());
				choices.push(`${formatNumber(coeff/lnBase)}${base}^x`.replace(/\s/g,"").toLowerCase());
				choices.push(`${formatNumber(coeff/(lnBase+1))}${base}^x+C`.replace(/\s/g,"").toLowerCase());
			}
			break;
		}
		case "logarithmic":{
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int \\frac{${coeff}}{x} \\,dx=? \\]`;
			plainCorrectIntegral=`${coeff}ln|x|+C`;
			latexAnswer=`${coeff}\\ln|x|+C`;
			const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`${coeff}ln(x)+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${coeff}ln|${coeff}x|+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${coeff}x+ C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${coeff}/x + C`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "substitution":{
			const a=Math.floor(Math.random()*maxCoeff)+1;
			const b=Math.floor(Math.random()*5);
			const power=Math.floor(Math.random()*3)+2;
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int ${coeff}(${a}x+${b})^{${power}} \\,dx=? \\]`;
			const newPower=power+1;
			const factor=coeff/(a*newPower);
			plainCorrectIntegral=`${formatNumber(factor)}(${a}x+${b})^${newPower}+C`;
			latexAnswer=`\\frac{${coeff}}{${a}${newPower}}(${a}x+${b})^{${newPower}}+C`;
			const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			const wrongFactor=coeff/(a*(newPower-1));
			choices.push(`${formatNumber(wrongFactor)}(${a}x+${b})^${newPower-1}+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${formatNumber(coeff)}(${a}x+${b})^${newPower}+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${formatNumber(factor)}(${a}x+${b})^${power}+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${formatNumber(coeff/(newPower))}(${a}x+${b})^${newPower}+C`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "definite":{
			const numTerms=3;
			const exponents=Array.from({ length: numTerms },()=>Math.floor(Math.random()*4));
			const coefficients=exponents.map(()=>Math.floor(Math.random()*maxCoeff)+1);
			const lower=1;
			const upper=Math.floor(Math.random()*5)+2;
			const polyTerms=coefficients.map((c,i)=>`${c}x^{${exponents[i]}}`);
			const polynomial=polyTerms.join("+");
			mathExpression=`\\[ \\int_{${lower}}^{${upper}} (${polynomial}) \\,dx=? \\]`;
			let result=0;
			for(let i=0;i<numTerms;i++){
				const exp=exponents[i];
				const coeff=coefficients[i];
				const antideriv=coeff/(exp+1);
				result+=antideriv*(Math.pow(upper,exp+1)-Math.pow(lower,exp+1));
			}
			plainCorrectIntegral=formatNumber(result);
			latexAnswer=plainCorrectIntegral;
			const correctNum=parseFloat(plainCorrectIntegral);
			choices=[plainCorrectIntegral];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			let wrongResult=0;
			for(let i=0;i<numTerms;i++){
				const exp=exponents[i];
				const coeff=coefficients[i];
				const antideriv=coeff/(exp+1);
				wrongResult+=antideriv*(Math.pow(upper,exp)-Math.pow(lower,exp));
			}
			choices.push(formatNumber(wrongResult));
			choices.push((correctNum*0.9).toFixed(2));
			break;
		}
		case "initialValue":{
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			const exponent=Math.floor(Math.random()*3)+1;
			const xVal=Math.floor(Math.random()*3)+1;
			const yVal=Math.floor(Math.random()*20)+5;
			const polynomial=`${coeff}x^${exponent}`;
			const antiderivCoeff=coeff/(exponent+1);
			const c=yVal-antiderivCoeff*Math.pow(xVal,exponent+1);
			mathExpression=`\\[ \\text{Find } f(x) \\text{ where } f(${xVal}) = ${yVal} \\text{ and } f'(x) = ${polynomial} \\]`;
			plainCorrectIntegral=`${formatNumber(antiderivCoeff)}x^${exponent+1} + ${formatNumber(c)}`;
			latexAnswer=`\\frac{${coeff}}{${exponent+1}}x^{${exponent+1}} + ${formatNumber(c)}`;
			const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`${formatNumber(antiderivCoeff)}x^${exponent+1} + ${formatNumber(c+1)}`.replace(/\s/g,"").toLowerCase());
			choices.push(`${formatNumber(antiderivCoeff)}x^${exponent+1} + ${formatNumber(c-1)}`.replace(/\s/g,"").toLowerCase());
			choices.push(`${formatNumber(antiderivCoeff+1)}x^${exponent+1} + ${formatNumber(c)}`.replace(/\s/g,"").toLowerCase());
			choices.push(`${formatNumber(coeff)}x^${exponent+1} + ${formatNumber(c)}`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "area":{
			const funcs=[
				{ expr: "x^2", antideriv: (x: number) => Math.pow(x,3)/3 },
				{ expr: "sin(x)", antideriv: (x: number) => -Math.cos(x) },
				{ expr: "sqrt(x)", antideriv: (x: number) => (2/3)*Math.pow(x,1.5) },
				{ expr: "2^x", antideriv: (x: number) => Math.pow(2,x)/Math.log(2) }
			];
			const chosen=funcs[Math.floor(Math.random()*funcs.length)];
			const a=0;
			const b=Math.floor(Math.random()*4)+1;
			const area=chosen.antideriv(b)-chosen.antideriv(a);
			plainCorrectIntegral=formatNumber(area);
			latexAnswer=plainCorrectIntegral;
			const correctNum=parseFloat(plainCorrectIntegral);
			choices=[plainCorrectIntegral];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			choices.push((correctNum*1.1).toFixed(2));
			choices.push((correctNum*0.9).toFixed(2));
			break;
		}
		case "motion":{
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Find position from velocity } v(t) = ${coeff}t^2 \\]`;
			plainCorrectIntegral=`${formatNumber(coeff/3)}t^3 + C`;
			alternateAnswer=`${coeff}t^3/3 + C`;
			latexAnswer=`\\frac{${coeff}}{3}t^{3} + C`;
			const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`${formatNumber(coeff)}t^3 + C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${formatNumber(coeff/2)}t^3 + C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${formatNumber(coeff/3)}t^2 + C`.replace(/\s/g,"").toLowerCase());
			choices.push(`${formatNumber(coeff/3)}t^3`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "inverseTrig":{
			const subtypes=["arcsin","arctan","arcsec"];
			const sub=subtypes[Math.floor(Math.random()*subtypes.length)];
			const a=Math.floor(Math.random()*maxCoeff)+1;
			if(sub==="arcsin"){
				mathExpression=`\\[ \\int \\frac{dx}{\\sqrt{${a*a}-x^2}} \\]`;
				plainCorrectIntegral=`arcsin(x/${a})+C`;
				latexAnswer=`\\arcsin\\left(\\frac{x}{${a}}\\right)+C`;
				const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
				choices=[normalizedCorrect];
				choices.push(`arcsin(x/${a*a})+C`.replace(/\s/g,"").toLowerCase());
				choices.push(`arctan(x/${a})+C`.replace(/\s/g,"").toLowerCase());
				choices.push(`(1/${a})arcsin(x/${a})+C`.replace(/\s/g,"").toLowerCase());
			}
			else if(sub==="arctan"){
				mathExpression=`\\[ \\int \\frac{dx}{${a*a}+x^2} \\]`;
				plainCorrectIntegral=`(1/${a})arctan(x/${a})+C`;
				latexAnswer=`\\frac{1}{${a}}\\arctan\\left(\\frac{x}{${a}}\\right)+C`;
				const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
				choices=[normalizedCorrect];
				choices.push(`arctan(x/${a})+C`.replace(/\s/g,"").toLowerCase());
				choices.push(`(1/${a})arctan(${a}x)+C`.replace(/\s/g,"").toLowerCase());
				choices.push(`(1/${a*a})arctan(x/${a})+C`.replace(/\s/g,"").toLowerCase());
			}
			else{
				mathExpression=`\\[ \\int \\frac{dx}{x\\sqrt{x^2-1}} \\]`;
				plainCorrectIntegral=`arcsec|x|+C`;
				latexAnswer=`\\operatorname{arcsec}|x|+C`;
				const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
				choices=[normalizedCorrect];
				choices.push(`arcsin(x)+C`.replace(/\s/g,"").toLowerCase());
				choices.push(`arctan(x)+C`.replace(/\s/g,"").toLowerCase());
				choices.push(`ln|x+sqrt(x^2-1)|+C`.replace(/\s/g,"").toLowerCase());
			}
			break;
		}
		case "completingSquare":{
			const a=Math.floor(Math.random()*maxCoeff)+2;
			mathExpression=`\\[ \\int \\frac{dx}{\\sqrt{${2*a}x - x^2}} \\]`;
			plainCorrectIntegral=`arcsin((x-${a})/${a})+C`;
			latexAnswer=`\\arcsin\\left(\\frac{x-${a}}{${a}}\\right)+C`;
			const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
			choices=[normalizedCorrect];
			choices.push(`arcsin(x/${a})+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`arcsin((x-${a})/${2*a})+C`.replace(/\s/g,"").toLowerCase());
			choices.push(`arctan((x-${a})/${a})+C`.replace(/\s/g,"").toLowerCase());
			break;
		}
		case "logisticModel":{
			const K=Math.floor(Math.random()*maxCoeff*2)+20;
			const r=0.05;
			const P0=Math.floor(K/10)+5;
			mathExpression=`\\[ \\text{Solve } \\frac{dP}{dt}=${r}P\\left(1-\\frac{P}{${K}}\\right),\\ P(0)=${P0}. \\] \\[ \\text{Find } \\lim_{t\\to\\infty}P(t). \\]`;
			plainCorrectIntegral=K.toString();
			latexAnswer=K.toString();
			choices=[plainCorrectIntegral];
			choices.push((K+10).toString());
			choices.push((K-10).toString());
			choices.push(P0.toString());
			break;
		}
		case "improperVertical":{
			mathExpression=`\\[ \\int_0^1 \\frac{1}{\\sqrt{1-x^2}} \\,dx \\]`;
			const val=Math.PI/2;
			plainCorrectIntegral=val.toFixed(4);
			latexAnswer=`\\frac{\\pi}{2}`;
			choices=[plainCorrectIntegral, (val+0.5).toFixed(4), (val-0.5).toFixed(4), "diverges"];
			break;
		}
		case "polarArcLength":{
			const a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Length of } r=${a}(1+\\cos\\theta),\\ 0\\le\\theta\\le\\pi. \\]`;
			const len=4*a;
			plainCorrectIntegral=len.toFixed(2);
			latexAnswer=plainCorrectIntegral;
			choices=[plainCorrectIntegral, (len+1).toFixed(2), (len-1).toFixed(2), (len*1.5).toFixed(2)];
			break;
		}
		case "parametricArcLength":{
			const a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Arc length of } x=${a}t^3,\\ y=${a}t^2,\\ 0\\le t\\le 1. \\]`;
			const len=a*(13*Math.sqrt(13)-8)/27;
			plainCorrectIntegral=len.toFixed(4);
			latexAnswer=plainCorrectIntegral;
			const correctNum=parseFloat(plainCorrectIntegral);
			choices=[plainCorrectIntegral];
			choices.push((correctNum+0.5).toFixed(4));
			choices.push((correctNum-0.5).toFixed(4));
			choices.push((correctNum*1.2).toFixed(4));
			break;
		}
		default:{
			const polynomial="x^2";
			mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
			plainCorrectIntegral="x^3/3 + C";
			latexAnswer="\\frac{x^{3}}{3} + C";
			choices=["x^3/3+C", "x^3/3", "x^2+C", "x^3/2+C"];
			break;
		}
	}
	const mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	const normalize=(s: string)=>
		s.replace(/\s+/g,"")
		 .replace(/\^{/g,"^")
		 .replace(/[{}]/g,"")
		 .toLowerCase();
	let correctNorm=normalize(plainCorrectIntegral);
	let altNorm=alternateAnswer ? normalize(alternateAnswer) : correctNorm;
	let uniqueChoices=[...new Set(choices.map(normalize))];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correctNorm)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctNorm;
		else uniqueChoices=[correctNorm];
	}
	window.correctAnswer={
		correct: correctNorm,
		alternate: altNorm,
		display: latexAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter the integral as an expression, e.g., 2x^3/3+5x^2/2+C, 1/3 sin(3x)+C, etc.";
}