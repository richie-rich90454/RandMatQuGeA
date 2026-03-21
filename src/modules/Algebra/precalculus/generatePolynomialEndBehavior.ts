/**
 * Polynomial end behavior: end behavior, multiplicity, IVT.
 * @fileoverview Generates polynomial property questions.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";
import {getMaxForDifficulty} from "../algebraUtils.js";

export function generatePolynomialEndBehavior(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["endbehavior","multiplicity","ivt"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,3);
	let hint="";
	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	switch (type){
		case "endbehavior":{
			const deg=Math.floor(Math.random()*2)+3;
			const lc=Math.random()<0.5?1:-1;
			const poly=lc===1?`x^${deg} + ...`:`-x^${deg} + ...`;
			questionArea.innerHTML=`Describe the end behavior of \\( ${poly} \\).`;
			let desc="";
			if (deg%2===0){
				desc=lc===1?"both ends up":"both ends down";
			}else{
				desc=lc===1?"left down, right up":"left up, right down";
			}
			window.correctAnswer={
				correct:desc,
				alternate:desc,
				display:desc
			};
			hint="Enter description like 'both ends up'";
			break;
		}
		case "multiplicity":{
			const root=a;
			const mult=Math.floor(Math.random()*2)+1;
			const poly=`(x - ${root})^${mult}`;
			questionArea.innerHTML=`For the polynomial \\( ${poly} \\), what is the multiplicity of the root at x=${root}?`;
			const ans=mult.toString();
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter a number";
			break;
		}
		case "ivt":{
			const val1=Math.floor(Math.random()*10)-5;
			const val2=val1+Math.floor(Math.random()*5)+2;
			const poly=`x^3 - ${a}x + ${b}`;
			questionArea.innerHTML=`Use the Intermediate Value Theorem to show that \\( ${poly} \\) has a root between ${val1} and ${val2}. (Enter yes/no if it applies)`;
			window.correctAnswer={
				correct:"yes",
				alternate:"yes",
				display:"yes"
			};
			hint="Enter 'yes' or 'no'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}