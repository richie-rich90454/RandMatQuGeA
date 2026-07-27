﻿import type {RngFn, QuestionDto} from "../../types/global";
import {getMaxForDifficulty} from "./GeometryUtils.js";
/**
 * Miscellaneous geometry: perimeter, arc length, distance formula, angle relations.
 * @fileoverview Generates questions about perimeter (rectangle/triangle), arc length, distance between points, and complementary/supplementary angles. Builds a QuestionDto with plausible wrong answers for MCQ mode.
 * @date 2026-04-18
 */
export function generatePerimeter(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const shape=rng()>0.5?"rectangle":"triangle";
	let mathExpression="";
	let correct="";
	let choices:string[]=[];
	if(shape==="rectangle"){
		const maxDim=getMaxForDifficulty(difficulty,10);
		const l=Math.floor(rng()*maxDim)+3;
		const w=Math.floor(rng()*maxDim)+2;
		const perimeter=2*(l+w);
		correct=perimeter.toString();
		mathExpression=`Find the perimeter of a rectangle with length \\( ${l} \\) and width \\( ${w} \\).`;
		choices=[correct];
		choices.push((2*(l+1+w)).toString());
		choices.push((2*(l+w+1)).toString());
		choices.push((l*w).toString());
		choices.push((2*l+2*w+1).toString());
	}
	else{
		const maxSide=getMaxForDifficulty(difficulty,8);
		const a=Math.floor(rng()*maxSide)+3;
		const b=Math.floor(rng()*maxSide)+3;
		const c=Math.floor(rng()*maxSide)+3;
		const perimeter=a+b+c;
		correct=perimeter.toString();
		mathExpression=`Find the perimeter of a triangle with sides \\( ${a}, ${b}, ${c} \\).`;
		choices=[correct];
		choices.push((a+b+c+1).toString());
		choices.push((a+b+c-1).toString());
		choices.push((2*(a+b)).toString());
		choices.push((a*b*c).toString());
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
		expectedFormat: "Enter a whole number"
	};
}
export function generateArcLength(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const maxRadius=getMaxForDifficulty(difficulty,8);
	const r=Math.floor(rng()*maxRadius)+3;
	const angle=Math.floor(rng()*90)+30;
	const arc=(angle/360)*2*Math.PI*r;
	const rounded=Math.round(arc*100)/100;
	const correct=rounded.toFixed(2);
	const mathExpression=`Find the length of an arc with central angle \\( ${angle}^\\circ \\) in a circle of radius \\( ${r} \\).`;
	const choices=[correct];
	choices.push(((angle/360)*2*Math.PI*(r+1)).toFixed(2));
	choices.push(((angle/360)*2*Math.PI*(r-1)).toFixed(2));
	choices.push(((angle/180)*Math.PI*r).toFixed(2));
	choices.push((Math.PI*r*r).toFixed(2));
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex: mathExpression,
		correct: correct,
		alternate: ((angle/360)*2*Math.PI*r).toFixed(2),
		display: correct,
		choices: uniqueChoices,
		expectedFormat: "Enter a decimal"
	};
}
export function generateDistanceFormula(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const maxCoord=getMaxForDifficulty(difficulty,8);
	const x1=Math.floor(rng()*maxCoord)-4;
	const y1=Math.floor(rng()*maxCoord)-4;
	const x2=Math.floor(rng()*maxCoord)-4;
	const y2=Math.floor(rng()*maxCoord)-4;
	const dist=Math.sqrt((x2-x1)**2+(y2-y1)**2);
	const rounded=Math.round(dist*100)/100;
	const correct=rounded.toFixed(2);
	const mathExpression=`Find the distance between points \\( (${x1},${y1}) \\) and \\( (${x2},${y2}) \\).`;
	const choices=[correct];
	choices.push((Math.abs(x2-x1)+Math.abs(y2-y1)).toFixed(2));
	choices.push(Math.sqrt((x2-x1)**2+(y2-y1)**2+1).toFixed(2));
	choices.push(Math.sqrt(Math.max(0, (x2-x1)**2+(y2-y1)**2-1)).toFixed(2));
	choices.push((Math.abs(x2-x1)).toFixed(2));
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex: mathExpression,
		correct: correct,
		alternate: Math.sqrt((x2-x1)**2+(y2-y1)**2).toFixed(2),
		display: correct,
		choices: uniqueChoices,
		expectedFormat: "Enter a decimal"
	};
}
export function generateAngleRelations(_difficulty?: string, rng: RngFn=Math.random): QuestionDto{
	const angle=Math.floor(rng()*60)+20;
	const comp=90-angle;
	const supp=180-angle;
	const correct=`complement: ${comp}, supplement: ${supp}`;
	const mathExpression=`An angle measures \\( ${angle}^\\circ \\). Find its complementary and supplementary angles.`;
	const choices=[correct];
	choices.push(`complement: ${supp}, supplement: ${comp}`);
	choices.push(`complement: ${90-angle}, supplement: ${180-angle+1}`);
	choices.push(`complement: ${90-angle-1}, supplement: ${180-angle}`);
	choices.push(`complement: ${180-angle}, supplement: ${90-angle}`);
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	return {
		latex: mathExpression,
		correct: correct,
		alternate: `${comp}, ${supp}`,
		display: correct,
		choices: uniqueChoices,
		expectedFormat: "Enter as \"complement: X, supplement: Y\""
	};
}