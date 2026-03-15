/**
 * Discrete mathematics: permutations and combinations generator
 * @fileoverview Provides functions to generate permutation and combination questions of various types (basic, equation, word, circular, identical, with replacement for permutations; basic, equation, word, complement, paths, multiset for combinations). Each question displays LaTeX in the questionArea and sets window.correctAnswer with three properties:
 * - `correct`: the primary correct answer (usually a numeric string) used for exact matching.
 * - `alternate`: an alternative representation (e.g., symbolic expression) for flexible checking.
 * - `display`: a LaTeX-formatted string representing the answer, shown to the user after submission.
 * @date 2026-03-15
 */
import {questionArea} from "../../script.js";
import {factorial, nPr, nCr, getMaxN} from "./discreteUtils";
/**
 * Generates a random permutation question of a specific type (basic, equation, word, circular, identical, or with replacement).
 * The question is displayed in the questionArea element using LaTeX. The correct answer is stored in window.correctAnswer
 * with three properties:
 * - `correct`: numeric answer (string).
 * - `alternate`: alternative representation (e.g., "P(5,2)") for tolerant checking.
 * - `display`: LaTeX representation of the answer (e.g., "5 \\cdot 4" for 20, or "(n-1)!" for circular).
 * @param difficulty - optional difficulty level ('easy', 'medium', 'hard') that influences the maximum values used.
 */
export function generatePermutation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic", "equation", "word", "circular", "identical", "withReplacement"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxN=getMaxN(difficulty);
	let n=Math.floor(Math.random()*maxN)+5;
	let r=Math.floor(Math.random()*(n-1))+1;
	switch (type){
		case "basic":
			questionArea.innerHTML=`\\( P(${n}, ${r}) \\)`;
			window.correctAnswer={
				correct: nPr(n, r).toString(),
				alternate: `nPr(${n},${r})`,
				display: nPr(n, r).toString()
			};
			break;
		case "equation":{
			let val=nPr(n, r);
			questionArea.innerHTML=`Find \\( n \\) if \\( P(n, ${r})=${val} \\)`;
			window.correctAnswer={
				correct: n.toString(),
				alternate: `${n}`,
				display: n.toString()
			};
			break;
		}
		case "word":{
			let objs=["books", "cars", "students", "colors"];
			let obj=objs[Math.floor(Math.random()*objs.length)];
			questionArea.innerHTML=`In how many ways can you arrange \\( ${r} \\) ${obj} chosen from \\( ${n} \\)?`;
			window.correctAnswer={
				correct: nPr(n, r).toString(),
				alternate: `P(${n},${r})`,
				display: nPr(n, r).toString()
			};
			break;
		}
		case "circular":
			questionArea.innerHTML=`How many circular arrangements of \\( ${n} \\) distinct objects?`;
			window.correctAnswer={
				correct: factorial(n-1).toString(),
				alternate: `(${n}-1)!`,
				display: `(${n}-1)!`
			};
			break;
		case "identical":{
			let k=Math.floor(Math.random()*(n-1))+1;
			questionArea.innerHTML=`Permutations of \\( ${n} \\) items when \\( ${k} \\) are identical`;
			window.correctAnswer={
				correct: (factorial(n)/factorial(k)).toString(),
				alternate: `${n}!/${k}!`,
				display: `\\frac{${n}!}{${k}!}`
			};
			break;
		}
		case "withReplacement":
			questionArea.innerHTML=`How many ordered selections of \\( ${r} \\) items from \\( ${n} \\) types if repetition is allowed?`;
			window.correctAnswer={
				correct: Math.pow(n, r).toString(),
				alternate: `${n}^${r}`,
				display: `${n}^{${r}}`
			};
			break;
	}
	window.MathJax?.typeset();
}
/**
 * Generates a random combination question of a specific type (basic, equation, word, complement, paths, or multiset).
 * The question is displayed in the questionArea element using LaTeX. The correct answer is stored in window.correctAnswer
 * with three properties:
 * - `correct`: numeric answer (string).
 * - `alternate`: alternative representation (e.g., "C(5,2)") for tolerant checking.
 * - `display`: LaTeX representation of the answer (e.g., "\\binom{5}{2}" for 10, or "\\binom{2g}{g}" for paths).
 * @param difficulty - optional difficulty level ('easy', 'medium', 'hard') that influences the maximum values used.
 */
export function generateCombination(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["basic", "equation", "word", "complement", "paths", "multiset"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxN=getMaxN(difficulty);
	let n=Math.floor(Math.random()*maxN)+5;
	let r=Math.floor(Math.random()*(n-1))+1;
	switch (type){
		case "basic":
			questionArea.innerHTML=`\\( C(${n}, ${r}) \\)`;
			window.correctAnswer={
				correct: nCr(n, r).toString(),
				alternate: `nCr(${n},${r})`,
				display: nCr(n, r).toString()
			};
			break;
		case "equation":{
			let val=nCr(n, r);
			questionArea.innerHTML=`Find \\( n \\) if \\( C(n, ${r})=${val} \\)`;
			window.correctAnswer={
				correct: n.toString(),
				alternate: `${n}`,
				display: n.toString()
			};
			break;
		}
		case "word":{
			let items=["fruits", "committee members", "pizzas"];
			let item=items[Math.floor(Math.random()*items.length)];
			questionArea.innerHTML=`How many ways to choose \\( ${r} \\) ${item} from \\( ${n} \\)?`;
			window.correctAnswer={
				correct: nCr(n, r).toString(),
				alternate: `C(${n},${r})`,
				display: nCr(n, r).toString()
			};
			break;
		}
		case "complement":
			questionArea.innerHTML=`Show that \\( C(${n}, ${n-r})=C(${n}, ${r}) \\). What is its value?`;
			window.correctAnswer={
				correct: nCr(n, r).toString(),
				alternate: `C(${n},${r})`,
				display: nCr(n, r).toString()
			};
			break;
		case "paths":{
			let g=Math.floor(Math.random()*4)+3;
			questionArea.innerHTML=`Number of shortest paths in a \\( ${g} \\times ${g} \\) grid (right & up moves)?`;
			window.correctAnswer={
				correct: nCr(2*g, g).toString(),
				alternate: `C(${2*g},${g})`,
				display: `\\binom{${2*g}}{${g}}`
			};
			break;
		}
		case "multiset":
			questionArea.innerHTML=`Ways to choose \\( ${r} \\) items from \\( ${n} \\) types if repeats allowed?`;
			window.correctAnswer={
				correct: nCr(n+r-1, r).toString(),
				alternate: `C(${n+r-1},${r})`,
				display: `\\binom{${n+r-1}}{${r}}`
			};
			break;
	}
	window.MathJax?.typeset();
}