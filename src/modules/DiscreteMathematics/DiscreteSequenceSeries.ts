﻿/**
 * Sequences, series, and induction generator
 * @fileoverview Provides functions to generate questions about arithmetic/geometric sequences, limits, infinite series, mathematical induction, and binomial theorem. Each function returns a QuestionDto with:
 * - latex: question text (may contain LaTeX delimiters \(...\))
 * - correct: normalized answer (string)
 * - alternate: alternative representation (e.g., fraction, expression)
 * - display: LaTeX representation suitable for showing the answer.
 * - expectedFormat: hint string for the user.
 * @date 2026-03-15
 */
import type {RngFn, QuestionDto} from "../../types/global";
import {getMaxN, nCr} from "./DiscreteUtils.js";
/**
 * Determines the maximum term value for sequence generation based on difficulty.
 * @param difficulty - 'easy', 'hard', or undefined (medium).
 * @returns maximum allowed value for terms.
 */
function getMaxTerm(difficulty?: string): number{
	if (difficulty==="easy") return 10;
	if (difficulty==="hard") return 30;
	return 20;
}
/**
 * Generates an arithmetic sequence question (nth term or sum of first n terms).
 * @param difficulty - optional difficulty level.
 * @param rng - optional random number generator (defaults to Math.random).
 * @returns QuestionDto
 */
export function generateArithmeticSequence(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const maxA1=getMaxN(difficulty);
	const maxD=getMaxTerm(difficulty);
	const a1=Math.floor(rng()*maxA1)+1;
	const d=Math.floor(rng()*maxD)+1;
	const n=Math.floor(rng()*10)+5;
	const type=rng()<0.5?"term":"sum";
	let question="";
	let answer="";
	let hint="";
	let displayVal="";
	if (type==="term"){
		const an=a1+(n-1)*d;
		question=`Find the ${n}th term of the arithmetic sequence: \\( a_1 = ${a1}, d = ${d} \\).`;
		answer=an.toString();
		hint="Enter a number";
		displayVal=an.toString();
	}
	else{
		const sum=(n/2)*(2*a1+(n-1)*d);
		question=`Find the sum of the first ${n} terms of the arithmetic sequence with \\( a_1 = ${a1} \\) and common difference \\( d = ${d} \\).`;
		answer=sum.toFixed(2);
		hint="Enter a decimal or integer";
		displayVal=sum.toFixed(2);
	}
	return {
		latex: question,
		correct: answer,
		alternate: answer,
		display: displayVal,
		choices: [],
		expectedFormat: hint
	};
}
/**
 * Generates a geometric sequence question (nth term or sum of first n terms).
 * @param difficulty - optional difficulty level.
 * @param rng - optional random number generator (defaults to Math.random).
 * @returns QuestionDto
 */
export function generateGeometricSequence(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const maxA1=getMaxN(difficulty);
	const a1=Math.floor(rng()*maxA1)+1;
	let r: number;
	if (difficulty==="easy"){
		r=Math.floor(rng()*2)+1;
	}
	else if (difficulty==="hard"){
		r=parseFloat((rng()*2+0.5).toFixed(2));
	}
	else{
		r=Math.floor(rng()*3)+1;
	}
	const n=Math.floor(rng()*6)+4;
	const type=rng()<0.5?"term":"sum";
	let question="";
	let answer="";
	let hint="";
	let displayVal="";
	if (type==="term"){
		const an=a1*Math.pow(r,n-1);
		question=`Find the ${n}th term of the geometric sequence: \\( a_1 = ${a1}, r = ${r} \\).`;
		answer=an.toFixed(2);
		hint="Enter a decimal";
		displayVal=an.toFixed(2);
	}
	else{
		if (r===1){
			const sum=a1*n;
			question=`Find the sum of the first ${n} terms of the geometric sequence with \\( a_1 = ${a1} \\) and common ratio \\( r = 1 \\).`;
			answer=sum.toString();
			hint="Enter a number";
			displayVal=sum.toString();
		}
		else{
			const sum=a1*(1-Math.pow(r,n))/(1-r);
			question=`Find the sum of the first ${n} terms of the geometric sequence: \\( a_1 = ${a1}, r = ${r} \\).`;
			answer=sum.toFixed(2);
			hint="Enter a decimal";
			displayVal=sum.toFixed(2);
		}
	}
	return {
		latex: question,
		correct: answer,
		alternate: answer,
		display: displayVal,
		choices: [],
		expectedFormat: hint
	};
}
/**
 * Generates a sequence limit question (rational or exponential type).
 * @param difficulty - optional difficulty level.
 * @param rng - optional random number generator (defaults to Math.random).
 * @returns QuestionDto
 */
export function generateSequenceLimit(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const types=["rational","exponential"];
	let type=types[Math.floor(rng()*types.length)];
	if (difficulty==="easy"){
		type="rational";
	}
	else if (difficulty==="hard"){
		type=types[Math.floor(rng()*types.length)];
	}
	let question="";
	let answer="";
	let hint="";
	let displayVal="";
	if (type==="rational"){
		let numCoeff: number, denCoeff: number, constNum: number, constDen: number;
		if (difficulty==="easy"){
			numCoeff=Math.floor(rng()*2)+1;
			denCoeff=numCoeff;
			constNum=Math.floor(rng()*3);
			constDen=Math.floor(rng()*3);
		}
		else if (difficulty==="hard"){
			numCoeff=Math.floor(rng()*4)+1;
			denCoeff=Math.floor(rng()*4)+1;
			constNum=Math.floor(rng()*6)-3;
			constDen=Math.floor(rng()*6)-3;
		}
		else{
			numCoeff=Math.floor(rng()*3)+1;
			denCoeff=Math.floor(rng()*3)+1;
			constNum=Math.floor(rng()*5);
			constDen=Math.floor(rng()*5);
		}
		const limit=numCoeff/denCoeff;
		const signNum=constNum>=0?'+':'-';
		const signDen=constDen>=0?'+':'-';
		question=`Determine the limit as \\( n \\to \\infty \\) of the sequence \\( a_n = \\frac{${numCoeff}n ${signNum} ${Math.abs(constNum)}}{${denCoeff}n ${signDen} ${Math.abs(constDen)}} \\).`;
		answer=limit.toFixed(2);
		hint="Enter a decimal (e.g., 0.5) or 'diverges'";
		displayVal=limit.toFixed(2);
	}
	else{
		let r: number;
		if (difficulty==="hard"){
			r=parseFloat((rng()*0.8+0.1).toFixed(2));
		}
		else{
			r=parseFloat((rng()*0.5+0.2).toFixed(2));
		}
		question=`Determine the limit as \\( n \\to \\infty \\) of the sequence \\( a_n = (${r})^n \\).`;
		answer="0";
		hint="Enter 0 or '0'";
		displayVal="0";
	}
	return {
		latex: question,
		correct: answer,
		alternate: answer,
		display: displayVal,
		choices: [],
		expectedFormat: hint
	};
}
/**
 * Generates an infinite geometric series sum question.
 * @param difficulty - optional difficulty level.
 * @param rng - optional random number generator (defaults to Math.random).
 * @returns QuestionDto
 */
export function generateInfiniteGeometricSeries(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const maxA1=getMaxN(difficulty);
	const a1=Math.floor(rng()*maxA1)+1;
	let r: number;
	if (difficulty==="easy"){
		r=parseFloat((rng()*0.3+0.2).toFixed(2));
	}
	else if (difficulty==="hard"){
		r=parseFloat((rng()*0.7+0.1).toFixed(2));
	}
	else{
		r=parseFloat((rng()*0.5+0.2).toFixed(2));
	}
	const sum=a1/(1-r);
	const mathExpression=`Find the sum of the infinite geometric series: \\( ${a1} + ${(a1*r).toFixed(2)} + ${(a1*r*r).toFixed(2)} + \\cdots \\).`;
	return {
		latex: mathExpression,
		correct: sum.toFixed(2),
		alternate: sum.toString(),
		display: sum.toFixed(2),
		choices: [],
		expectedFormat: "Enter a decimal"
	};
}
/**
 * Generates a mathematical induction question (base case or inductive hypothesis).
 * @param difficulty - optional difficulty level.
 * @param rng - optional random number generator (defaults to Math.random).
 * @returns QuestionDto
 */
export function generateMathematicalInduction(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	let formulaIndex: number;
	if (difficulty==="easy"){
		formulaIndex=0;
	}
	else if (difficulty==="hard"){
		formulaIndex=Math.floor(rng()*2)+1;
	}
	else{
		formulaIndex=Math.floor(rng()*3);
	}
	const formulas=[
		{ lhs: "1 + 2 + \\cdots + n", rhs: "\\frac{n(n+1)}{2}" },
		{ lhs: "1^2 + 2^2 + \\cdots + n^2", rhs: "\\frac{n(n+1)(2n+1)}{6}" },
		{ lhs: "1^3 + 2^3 + \\cdots + n^3", rhs: "\\frac{n^2(n+1)^2}{4}" }
	];
	const chosen=formulas[formulaIndex];
	let n: number;
	if (difficulty==="easy"){
		n=Math.floor(rng()*3)+1;
	}
	else if (difficulty==="hard"){
		n=Math.floor(rng()*5)+3;
	}
	else{
		n=Math.floor(rng()*4)+2;
	}
	const type=rng()<0.5?"base":"inductive";
	let question="";
	let answer="";
	let hint="";
	let displayVal="";
	if (type==="base"){
		question=`In a proof by induction that \\( ${chosen.lhs} = ${chosen.rhs} \\), verify the base case for \\( n = ${n} \\). What is the value of both sides?`;
		let leftSum=0;
		if (formulaIndex===0){
			leftSum=(n*(n+1))/2;
		}
		else if (formulaIndex===1){
			leftSum=(n*(n+1)*(2*n+1))/6;
		}
		else{
			leftSum=(n*n*(n+1)*(n+1))/4;
		}
		answer=leftSum.toString();
		hint="Enter a number";
		displayVal=leftSum.toString();
	}
	else{
		question=`In a proof by induction that \\( ${chosen.lhs} = ${chosen.rhs} \\), what is the inductive hypothesis? (Assume true for n = k)`;
		answer=`Assume true for n = k: ${chosen.lhs.replace(/n/g,"k")} = ${chosen.rhs.replace(/n/g,"k")}`;
		hint="Enter the statement for n = k";
		displayVal=answer;
	}
	return {
		latex: question,
		correct: answer,
		alternate: answer,
		display: displayVal,
		choices: [],
		expectedFormat: hint
	};
}
/**
 * Generates a binomial theorem question (expansion or coefficient).
 * @param difficulty - optional difficulty level.
 * @param rng - optional random number generator (defaults to Math.random).
 * @returns QuestionDto
 */
export function generateBinomialTheorem(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const maxN=getMaxN(difficulty);
	const n=Math.floor(rng()*maxN)+2;
	const type=rng()<0.5?"expand":"coefficient";
	let question="";
	let answer="";
	let hint="";
	let displayVal="";
	if (type==="expand"){
		const a="x";
		const b=Math.floor(rng()*3)+1;
		const sign=rng()<0.5?"+":"-";
		const expr=`(${a} ${sign} ${b})^${n}`;
		let signedTerms: string[]=[];
		for (let k=0; k<=n; k++){
			const coeff=nCr(n,k);
			let signMult=1;
			if (sign==="-"&&k%2===1) signMult=-1;
			const c=signMult*coeff*Math.pow(b,k);
			if (c===0) continue;
			const powX=n-k;
			let term="";
			if (powX===0){
				term=c.toString();
			}
			else if (powX===1){
				if (c===1) term="x";
				else if (c===-1) term="-x";
				else term=c+"x";
			}
			else{
				const powerPart=`x^{${powX}}`;
				if (c===1) term=powerPart;
				else if (c===-1) term=`-${powerPart}`;
				else term=c+powerPart;
			}
			signedTerms.push(term);
		}
		answer=signedTerms.join(" + ").replace(/\+ -/g,"- ");
		question=`Expand \\( ${expr} \\) using the binomial theorem.`;
		hint="Enter as a polynomial (e.g., x^2 + 2x + 1)";
		displayVal=answer;
	}
	else{
		const a=Math.floor(rng()*2)+1;
		const b=Math.floor(rng()*3)+1;
		const sign=rng()<0.5?"+":"-";
		const k=Math.floor(rng()*n)+1;
		const expr=`(${a}x ${sign} ${b})^${n}`;
		let coeff=nCr(n,k)*Math.pow(a,k)*Math.pow(b,n-k);
		if (sign==="-"&&k%2===1) coeff=-coeff;
		question=`Find the coefficient of \\( x^{${k}} \\) in the expansion of \\( ${expr} \\).`;
		answer=coeff.toString();
		hint="Enter an integer (may be negative)";
		displayVal=coeff.toString();
	}
	return {
		latex: question,
		correct: answer,
		alternate: answer,
		display: displayVal,
		choices: [],
		expectedFormat: hint
	};
}
