import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
/**
 * Polynomial end behavior: end behavior, multiplicity, IVT.
 * @fileoverview Generates polynomial property questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generatePolynomialEndBehavior(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
	const types=["endbehavior","multiplicity","ivt"];
	const type=types[Math.floor(rng()*types.length)];
	const max=getMaxForDifficulty(difficulty,3);
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	const a=Math.floor(rng()*max)+1;
	const b=Math.floor(rng()*max)+1;
	switch(type){
		case "endbehavior":{
			const deg=Math.floor(rng()*2)+3;
			const lc=rng()<0.5?1:-1;
			const poly=lc===1?`x^${deg} + ...`:`-x^${deg} + ...`;
			mathExpression=`Describe the end behavior of \\( ${poly} \\).`;
			let desc="";
			if(deg%2===0){
				desc=lc===1?"both ends up":"both ends down";
			}else{
				desc=lc===1?"left down, right up":"left up, right down";
			}
			correct=desc;
			alternate=desc;
			display=desc;
			let wrong1="both ends up";
			let wrong2="both ends down";
			let wrong3="left down, right up";
			let wrong4="left up, right down";
			choices=[desc];
			for(let w of [wrong1,wrong2,wrong3,wrong4]){
				if(w!==desc) choices.push(w);
				if(choices.length>=4) break;
			}
			expectedFormat="Enter description like 'both ends up'";
			break;
		}
		case "multiplicity":{
			const root=a;
			const mult=Math.floor(rng()*2)+1;
			const poly=`(x - ${root})^${mult}`;
			mathExpression=`For the polynomial \\( ${poly} \\), what is the multiplicity of the root at x=${root}?`;
			const ans=mult.toString();
			correct=ans;
			alternate=ans;
			display=ans;
			choices=[ans];
			choices.push((mult+1).toString());
			choices.push((mult-1).toString());
			choices.push("1");
			choices.push("0");
			expectedFormat="Enter a number";
			break;
		}
		case "ivt":{
			const val1=Math.floor(rng()*10)-5;
			const val2=val1+Math.floor(rng()*5)+2;
			const poly=`x^3 - ${a}x + ${b}`;
			const f=(x:number):number=>x*x*x-a*x+b;
			const hasRoot=f(val1)*f(val2)<=0;
			mathExpression=`Use the Intermediate Value Theorem to show that \\( ${poly} \\) has a root between ${val1} and ${val2}. (Enter yes/no if it applies)`;
			correct=hasRoot?"yes":"no";
			alternate=correct;
			display=correct;
			choices=["yes","no","maybe","cannot determine"];
			expectedFormat="Enter 'yes' or 'no'";
			break;
		}
	}
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
