/**
 * Discrete mathematics: permutations and combinations generator
 * @fileoverview Provides functions to generate permutation and combination questions with MCQ distractors.
 * Each question displays LaTeX in questionArea and sets window.correctAnswer with:
 * - correct: plain text answer
 * - alternate: plain text answer for tolerant checking
 * - display: LaTeX string for display (pure LaTeX, no outer delimiters)
 * - choices: array of plausible wrong answers for MCQ mode
 * @date 2026-03-29
 */
import {questionArea} from "../../script.js";
import {factorial, nPr, nCr, getMaxN} from "./discreteUtils.js";

/**
 * Generates a random permutation question with MCQ distractors.
 * @param difficulty - optional difficulty level
 */
export function generatePermutation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic","equation","word","circular","identical","withReplacement"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxN=getMaxN(difficulty);
	let n=Math.floor(Math.random()*maxN)+5;
	let r=Math.floor(Math.random()*(n-1))+1;
	let correctAns: string;
	let choices: string[] = [];
	switch (type){
		case "basic":
			correctAns = nPr(n, r).toString();
			questionArea.innerHTML=`\\( P(${n}, ${r}) \\)`;
			choices = [
				correctAns,
				nCr(n, r).toString(),
				Math.pow(n, r).toString(),
				factorial(n).toString(),
				(n * r).toString()
			];
			break;
		case "equation":{
			let val = nPr(n, r);
			correctAns = n.toString();
			questionArea.innerHTML=`Find \\( n \\) if \\( P(n, ${r})=${val} \\)`;
			choices = [
				correctAns,
				(r + 1).toString(),
				Math.floor(Math.pow(val, 1/r)).toString(),
				Math.floor(Math.sqrt(val)).toString(),
				(r).toString()
			];
			break;
		}
		case "word":{
			let objs=["books","cars","students","colors"];
			let obj=objs[Math.floor(Math.random()*objs.length)];
			correctAns = nPr(n, r).toString();
			questionArea.innerHTML=`In how many ways can you arrange \\( ${r} \\) ${obj} chosen from \\( ${n} \\)?`;
			choices = [
				correctAns,
				nCr(n, r).toString(),
				factorial(n).toString(),
				Math.pow(n, r).toString(),
				(n * r).toString()
			];
			break;
		}
		case "circular":
			correctAns = factorial(n-1).toString();
			questionArea.innerHTML=`How many circular arrangements of \\( ${n} \\) distinct objects?`;
			choices = [
				correctAns,
				factorial(n).toString(),
				(factorial(n-1)/2).toString(),
				(n-1).toString(),
				n.toString()
			];
			break;
		case "identical":{
			let k=Math.floor(Math.random()*(n-1))+1;
			correctAns = (factorial(n)/factorial(k)).toString();
			questionArea.innerHTML=`Permutations of \\( ${n} \\) items when \\( ${k} \\) are identical`;
			choices = [
				correctAns,
				factorial(n).toString(),
				(factorial(n)/factorial(n-k)).toString(),
				(factorial(n)/factorial(k)/factorial(n-k)).toString(),
				n.toString()
			];
			break;
		}
		case "withReplacement":
			correctAns = Math.pow(n, r).toString();
			questionArea.innerHTML=`How many ordered selections of \\( ${r} \\) items from \\( ${n} \\) types if repetition is allowed?`;
			choices = [
				correctAns,
				nPr(n, r).toString(),
				nCr(n, r).toString(),
				factorial(n).toString(),
				(n * r).toString()
			];
			break;
		default:
			return;
	}
	let uniqueChoices = [...new Set(choices)];
	if (uniqueChoices.length > 4) uniqueChoices = uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correctAns)){
		if (uniqueChoices.length > 0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)] = correctAns;
		else uniqueChoices = [correctAns];
	}
	window.correctAnswer = {
		correct: correctAns,
		alternate: correctAns,
		display: correctAns,
		choices: uniqueChoices
	};
	window.expectedFormat = "Enter a number";
	window.MathJax?.typeset();
}

/**
 * Generates a random combination question with MCQ distractors.
 * @param difficulty - optional difficulty level
 */
export function generateCombination(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic","equation","word","complement","paths","multiset"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxN=getMaxN(difficulty);
	let n=Math.floor(Math.random()*maxN)+5;
	let r=Math.floor(Math.random()*(n-1))+1;
	let correctAns: string;
	let choices: string[] = [];
	switch (type){
		case "basic":
			correctAns = nCr(n, r).toString();
			questionArea.innerHTML=`\\( C(${n}, ${r}) \\)`;
			choices = [
				correctAns,
				nPr(n, r).toString(),
				Math.pow(n, r).toString(),
				factorial(n).toString(),
				(n * r).toString()
			];
			break;
		case "equation":{
			let val = nCr(n, r);
			correctAns = n.toString();
			questionArea.innerHTML=`Find \\( n \\) if \\( C(n, ${r})=${val} \\)`;
			choices = [
				correctAns,
				(r + 1).toString(),
				Math.floor(Math.pow(val, 1/r)).toString(),
				Math.floor(Math.sqrt(val)).toString(),
				(r).toString()
			];
			break;
		}
		case "word":{
			let items=["fruits","committee members","pizzas"];
			let item=items[Math.floor(Math.random()*items.length)];
			correctAns = nCr(n, r).toString();
			questionArea.innerHTML=`How many ways to choose \\( ${r} \\) ${item} from \\( ${n} \\)?`;
			choices = [
				correctAns,
				nPr(n, r).toString(),
				Math.pow(n, r).toString(),
				factorial(n).toString(),
				(n * r).toString()
			];
			break;
		}
		case "complement":
			correctAns = nCr(n, r).toString();
			questionArea.innerHTML=`Show that \\( C(${n}, ${n-r})=C(${n}, ${r}) \\). What is its value?`;
			choices = [
				correctAns,
				nCr(n, n-r+1).toString(),
				(nCr(n, r)+1).toString(),
				(nCr(n, r)-1).toString(),
				factorial(n).toString()
			];
			break;
		case "paths":{
			let g=Math.floor(Math.random()*4)+3;
			correctAns = nCr(2*g, g).toString();
			questionArea.innerHTML=`Number of shortest paths in a \\( ${g} \\times ${g} \\) grid (right & up moves)?`;
			choices = [
				correctAns,
				Math.pow(2, g).toString(),
				Math.pow(g, 2).toString(),
				nCr(2*g, g-1).toString(),
				factorial(2*g).toString()
			];
			break;
		}
		case "multiset":
			correctAns = nCr(n+r-1, r).toString();
			questionArea.innerHTML=`Ways to choose \\( ${r} \\) items from \\( ${n} \\) types if repeats allowed?`;
			choices = [
				correctAns,
				nCr(n+r-1, n-1).toString(), // same value, included as alternative
				nCr(n+r, r).toString(),
				Math.pow(n, r).toString(),
				factorial(n+r-1).toString()
			];
			break;
		default:
			return;
	}
	let uniqueChoices = [...new Set(choices)];
	if (uniqueChoices.length > 4) uniqueChoices = uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(correctAns)){
		if (uniqueChoices.length > 0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)] = correctAns;
		else uniqueChoices = [correctAns];
	}
	window.correctAnswer = {
		correct: correctAns,
		alternate: correctAns,
		display: correctAns,
		choices: uniqueChoices
	};
	window.expectedFormat = "Enter a number";
	window.MathJax?.typeset();
}