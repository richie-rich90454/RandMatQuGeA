/**
 * Polynomial inequality: solve >0 with factoring.
 * @fileoverview Generates polynomial inequality questions.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generatePolynomialInequality(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const max=getMaxForDifficulty(difficulty,3);
	const roots: number[]=[];
	for (let i=0; i<3; i++){
		roots.push(Math.floor(Math.random()*max*2)-max);
	}
	roots.sort((a,b)=>a-b);
	const factors=roots.map(r=>`(x ${r>=0?'-':'+'} ${Math.abs(r)})`).join('');
	const inequality=factors+">0";
	questionArea.innerHTML=`Solve the inequality: \\( ${inequality} \\). (Enter intervals)`;
	const intervals: string[]=[];
	if (roots.length%2===0){
		intervals.push(`(-∞, ${roots[0]})`);
		for (let i=1; i<roots.length; i+=2){
			if (i+1<roots.length){
				intervals.push(`(${roots[i]}, ${roots[i+1]})`);
			}
		}
		if (roots.length%2===0) intervals.push(`(${roots[roots.length-1]}, ∞)`);
	}else{
		intervals.push(`(${roots[0]}, ${roots[1]})`);
		for (let i=2; i<roots.length; i+=2){
			intervals.push(`(${roots[i]}, ∞)`);
		}
	}
	const answer=intervals.join(' ∪ ');
	window.correctAnswer={
		correct:answer,
		alternate:answer.replace(/∞/g,'infinity'),
		display:answer
	};
	window.expectedFormat="Enter intervals like (-∞,1) ∪ (3,∞)";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}