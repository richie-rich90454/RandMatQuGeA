import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../algebraUtils.js";
/**
 * Polynomial inequality: solve >0 with factoring.
 * @fileoverview Generates polynomial inequality questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generatePolynomialInequality(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	let mathExpression="";
	let expectedFormat="Enter intervals like (-∞,1) ∪ (3,∞)";
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	const max=getMaxForDifficulty(difficulty,3);
	let roots: number[]=[];
	for(let i=0;i<3;i++){
		roots.push(Math.floor(rng()*max*2)-max);
	}
	roots.sort((a,b)=>a-b);
	const factors=roots.map(r=>`(x ${r>=0?'-':'+'} ${Math.abs(r)})`).join('');
	const inequality=factors+">0";
	mathExpression=`Solve the inequality: \\( ${inequality} \\). (Enter intervals)`;
	const intervals: string[]=[];
	if(roots.length%2===0){
		intervals.push(`(-∞, ${roots[0]})`);
		for(let i=1;i<roots.length;i+=2){
			if(i+1<roots.length){
				intervals.push(`(${roots[i]}, ${roots[i+1]})`);
			}
		}
		if(roots.length%2===0) intervals.push(`(${roots[roots.length-1]}, ∞)`);
	}else{
		intervals.push(`(${roots[0]}, ${roots[1]})`);
		for(let i=2;i<roots.length;i+=2){
			intervals.push(`(${roots[i]}, ∞)`);
		}
	}
	const answer=intervals.join(' ∪ ');
	correct=answer;
	alternate=answer.replace(/∞/g,'infinity');
	display=answer;
	choices=[correct];
	if(intervals.length>1){
		let wrong1=intervals.slice(0,1).join(' ∪ ');
		let wrong2=intervals.slice(1).join(' ∪ ');
		choices.push(wrong1);
		choices.push(wrong2);
	}
	else{
		choices.push(`(-∞, ${roots[0]})`);
		choices.push(`(${roots[0]}, ∞)`);
	}
	choices.push(`(-∞, ∞)`);
	choices.push(`∅`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex: mathExpression,
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices,
		expectedFormat: expectedFormat
	};
}
