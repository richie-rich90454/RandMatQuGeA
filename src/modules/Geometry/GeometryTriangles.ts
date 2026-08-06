import type {RngFn, QuestionDto} from "../../types/global";
import {getMaxForDifficulty} from "./GeometryUtils.js";
/**
 * Triangle geometry: Pythagorean theorem, similar triangles, triangle classification.
 * @fileoverview Generates questions about right triangles (hypotenuse), similar triangles (scale factor), and triangle classification (equilateral/isosceles/scalene). Builds a QuestionDto with plausible wrong answers for MCQ mode.
 * @date 2026-04-18
 */
export function generatePythagorean(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const maxLeg=getMaxForDifficulty(difficulty,8);
	let a=Math.floor(rng()*maxLeg)+3;
	let b=Math.floor(rng()*maxLeg)+3;
	const c=Math.sqrt(a*a+b*b);
	const roundedC=Math.round(c*100)/100;
	const correct=roundedC.toFixed(2);
	const mathExpression=`In a right triangle, the legs are \\( ${a} \\) and \\( ${b} \\). Find the hypotenuse.`;
	const choices=[correct];
	choices.push((Math.sqrt((a+1)*(a+1)+b*b)).toFixed(2));
	choices.push((Math.sqrt(a*a+(b+1)*(b+1))).toFixed(2));
	choices.push((a+b).toFixed(2));
	choices.push((Math.sqrt(a*a+b*b)+1).toFixed(2));
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex: mathExpression,
		correct: correct,
		alternate: Math.sqrt(a*a+b*b).toFixed(2),
		display: correct,
		choices: uniqueChoices,
		expectedFormat: "Enter a decimal (e.g., 5.83)",
		visualization: {shape:"triangle", params:{base:a, height:b}}
	};
}
export function generateSimilarTriangles(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const maxScale=getMaxForDifficulty(difficulty,4);
	const scale=Math.floor(rng()*maxScale)+2;
	const side1=Math.floor(rng()*5)+3;
	const side2=side1*scale;
	const correct=side2.toString();
	const mathExpression=`Triangle A has a side of length \\( ${side1} \\). Triangle B is similar with scale factor \\( ${scale} \\). Find the corresponding side in triangle B.`;
	const choices=[correct];
	choices.push((side1*(scale+1)).toString());
	choices.push((side1*(scale-1)).toString());
	choices.push((side1*scale+1).toString());
	choices.push((side1+scale).toString());
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex: mathExpression,
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices,
		expectedFormat: "Enter a whole number"
	};
}
export function generateTriangleClassification(_difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const sides=[
		[3,4,5],
		[5,5,5],
		[5,5,8],
		[7,8,9]
	];
	const pick=sides[Math.floor(rng()*sides.length)];
	const [a,b,c]=pick;
	let type="";
	if(a===b&&b===c) type="equilateral";
	else if(a===b||b===c||a===c) type="isosceles";
	else type="scalene";
	const correct=type;
	const mathExpression=`Classify the triangle with sides \\( ${a}, ${b}, ${c} \\).`;
	const choices=[correct];
	if(type==="equilateral"){
		choices.push("isosceles","scalene","right");
	}
	else if(type==="isosceles"){
		choices.push("equilateral","scalene","right");
	}
	else{
		choices.push("equilateral","isosceles","right");
	}
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex: mathExpression,
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices,
		expectedFormat: "Enter \"equilateral\", \"isosceles\", or \"scalene\""
	};
}
