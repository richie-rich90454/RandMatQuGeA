/**
 * Discrete mathematics: permutations and combinations generator
 * @fileoverview Provides functions to generate permutation and combination questions. Each question displays LaTeX in questionArea and sets window.correctAnswer with:
 * - correct: LaTeX string for display (pure LaTeX, no outer delimiters)
 * - alternate: plain text representation for tolerant checking
 * - display: same as correct
 * @date 2026-03-15
 */
import {questionArea} from "../../script.js";
import {factorial, nPr, nCr, getMaxN} from "./discreteUtils.js";
/**
 * Generates a random permutation question.
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
	switch (type){
		case "basic":
			questionArea.innerHTML=`\\( P(${n}, ${r}) \\)`;
			let basicAns=nPr(n, r).toString();
			window.correctAnswer={
				correct: basicAns,
				alternate: basicAns,
				display: basicAns
			};
			break;
		case "equation":{
			let val=nPr(n, r);
			questionArea.innerHTML=`Find \\( n \\) if \\( P(n, ${r})=${val} \\)`;
			let eqAns=n.toString();
			window.correctAnswer={
				correct: eqAns,
				alternate: eqAns,
				display: eqAns
			};
			break;
		}
		case "word":{
			let objs=["books","cars","students","colors"];
			let obj=objs[Math.floor(Math.random()*objs.length)];
			questionArea.innerHTML=`In how many ways can you arrange \\( ${r} \\) ${obj} chosen from \\( ${n} \\)?`;
			let wordAns=nPr(n, r).toString();
			window.correctAnswer={
				correct: wordAns,
				alternate: wordAns,
				display: wordAns
			};
			break;
		}
		case "circular":
			questionArea.innerHTML=`How many circular arrangements of \\( ${n} \\) distinct objects?`;
			let circAns=factorial(n-1).toString();
			window.correctAnswer={
				correct: circAns,
				alternate: circAns,
				display: circAns
			};
			break;
		case "identical":{
			let k=Math.floor(Math.random()*(n-1))+1;
			questionArea.innerHTML=`Permutations of \\( ${n} \\) items when \\( ${k} \\) are identical`;
			let identAns=(factorial(n)/factorial(k)).toString();
			let displayLaTeX=`\\frac{${n}!}{${k}!}`;
			window.correctAnswer={
				correct: identAns,
				alternate: identAns,
				display: displayLaTeX
			};
			break;
		}
		case "withReplacement":
			questionArea.innerHTML=`How many ordered selections of \\( ${r} \\) items from \\( ${n} \\) types if repetition is allowed?`;
			let replAns=Math.pow(n, r).toString();
			window.correctAnswer={
				correct: replAns,
				alternate: replAns,
				display: replAns
			};
			break;
	}
	window.MathJax?.typeset();
}
/**
 * Generates a random combination question.
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
	switch (type){
		case "basic":
			questionArea.innerHTML=`\\( C(${n}, ${r}) \\)`;
			let basicAns=nCr(n, r).toString();
			window.correctAnswer={
				correct: basicAns,
				alternate: basicAns,
				display: basicAns
			};
			break;
		case "equation":{
			let val=nCr(n, r);
			questionArea.innerHTML=`Find \\( n \\) if \\( C(n, ${r})=${val} \\)`;
			let eqAns=n.toString();
			window.correctAnswer={
				correct: eqAns,
				alternate: eqAns,
				display: eqAns
			};
			break;
		}
		case "word":{
			let items=["fruits","committee members","pizzas"];
			let item=items[Math.floor(Math.random()*items.length)];
			questionArea.innerHTML=`How many ways to choose \\( ${r} \\) ${item} from \\( ${n} \\)?`;
			let wordAns=nCr(n, r).toString();
			window.correctAnswer={
				correct: wordAns,
				alternate: wordAns,
				display: wordAns
			};
			break;
		}
		case "complement":
			questionArea.innerHTML=`Show that \\( C(${n}, ${n-r})=C(${n}, ${r}) \\). What is its value?`;
			let compAns=nCr(n, r).toString();
			window.correctAnswer={
				correct: compAns,
				alternate: compAns,
				display: compAns
			};
			break;
		case "paths":{
			let g=Math.floor(Math.random()*4)+3;
			questionArea.innerHTML=`Number of shortest paths in a \\( ${g} \\times ${g} \\) grid (right & up moves)?`;
			let pathAns=nCr(2*g, g).toString();
			let displayLaTeX=`\\binom{${2*g}}{${g}}`;
			window.correctAnswer={
				correct: pathAns,
				alternate: pathAns,
				display: displayLaTeX
			};
			break;
		}
		case "multiset":
			questionArea.innerHTML=`Ways to choose \\( ${r} \\) items from \\( ${n} \\) types if repeats allowed?`;
			let multiAns=nCr(n+r-1, r).toString();
			let displayLaTeX=`\\binom{${n+r-1}}{${r}}`;
			window.correctAnswer={
				correct: multiAns,
				alternate: multiAns,
				display: displayLaTeX
			};
			break;
	}
	window.MathJax?.typeset();
}