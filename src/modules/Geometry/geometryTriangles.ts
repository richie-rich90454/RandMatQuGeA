/**
 * Triangle geometry: Pythagorean theorem, similar triangles, triangle classification.
 * @fileoverview Generates questions about right triangles (hypotenuse), similar triangles (scale factor), and triangle classification (equilateral/isosceles/scalene). Displays in questionArea and sets window.correctAnswer with answer and display.
 * @date 2026-03-15
 */
import {questionArea} from "../../script.js";
import {getMaxForDifficulty, cleanupVisualization} from "./geometryUtils.js";
import {createVisualization} from "./geometryVisualization.js";
/**
 * Generates a Pythagorean theorem question (find hypotenuse).
 * @param difficulty - optional difficulty level.
 */
export function generatePythagorean(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxLeg=getMaxForDifficulty(difficulty,8);
	let a=Math.floor(Math.random()*maxLeg)+3;
	let b=Math.floor(Math.random()*maxLeg)+3;
	const c=Math.sqrt(a*a+b*b);
	const roundedC=Math.round(c*100)/100;
	questionArea.innerHTML=`In a right triangle, the legs are \\( ${a} \\) and \\( ${b} \\). Find the hypotenuse.`;
	window.correctAnswer={
		correct: roundedC.toFixed(2),
		alternate: Math.sqrt(a*a+b*b).toFixed(2),
		display: roundedC.toFixed(2)
	};
	window.expectedFormat="Enter a decimal (e.g., 5.83)";
	createVisualization("triangle",{base:a,height:b});
	if (window.MathJax?.typeset) window.MathJax.typeset();
}
/**
 * Generates a similar triangles question (scale factor).
 * @param difficulty - optional difficulty level.
 */
export function generateSimilarTriangles(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxScale=getMaxForDifficulty(difficulty,4);
	const scale=Math.floor(Math.random()*maxScale)+2;
	const side1=Math.floor(Math.random()*5)+3;
	const side2=side1*scale;
	questionArea.innerHTML=`Triangle A has a side of length \\( ${side1} \\). Triangle B is similar with scale factor \\( ${scale} \\). Find the corresponding side in triangle B.`;
	window.correctAnswer={correct:side2.toString(),alternate:side2.toString(),display:side2.toString()};
	window.expectedFormat="Enter a whole number";
	createVisualization("triangle",{base:side1,height:side1});
	if (window.MathJax?.typeset) window.MathJax.typeset();
}
/**
 * Generates a triangle classification question (equilateral/isosceles/scalene).
 * @param _difficulty - unused, kept for consistency.
 */
export function generateTriangleClassification(_difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const sides=[
		[3,4,5],
		[5,5,5],
		[5,5,8],
		[7,8,9]
	];
	const pick=sides[Math.floor(Math.random()*sides.length)];
	const [a,b,c]=pick;
	let type="";
	if (a===b&&b===c) type="equilateral";
	else if (a===b||b===c||a===c) type="isosceles";
	else type="scalene";
	questionArea.innerHTML=`Classify the triangle with sides \\( ${a}, ${b}, ${c} \\).`;
	window.correctAnswer={correct:type,alternate:type,display:type};
	window.expectedFormat="Enter \"equilateral\", \"isosceles\", or \"scalene\"";
	createVisualization("triangle",{base:a,height:b});
	if (window.MathJax?.typeset) window.MathJax.typeset();
}