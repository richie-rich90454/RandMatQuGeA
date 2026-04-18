import {questionArea} from "../../script.js";
import {getMaxForDifficulty, cleanupVisualization} from "./geometryUtils.js";
import {createVisualization} from "./geometryVisualization.js";
/**
 * Triangle geometry: Pythagorean theorem, similar triangles, triangle classification.
 * @fileoverview Generates questions about right triangles (hypotenuse), similar triangles (scale factor), and triangle classification (equilateral/isosceles/scalene). Displays in questionArea and sets window.correctAnswer with answer and display, plus plausible wrong answers for MCQ mode.
 * @date 2026-04-18
 */
export function generatePythagorean(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxLeg=getMaxForDifficulty(difficulty,8);
	let a=Math.floor(Math.random()*maxLeg)+3;
	let b=Math.floor(Math.random()*maxLeg)+3;
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
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correct,
		alternate: Math.sqrt(a*a+b*b).toFixed(2),
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal (e.g., 5.83)";
	createVisualization("triangle",{base:a,height:b});
}
export function generateSimilarTriangles(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxScale=getMaxForDifficulty(difficulty,4);
	const scale=Math.floor(Math.random()*maxScale)+2;
	const side1=Math.floor(Math.random()*5)+3;
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
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a whole number";
	createVisualization("triangle",{base:side1,height:side1});
}
export function generateTriangleClassification(_difficulty?: string): void{
	if(!questionArea) return;
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
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correct,
		alternate: correct,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter \"equilateral\", \"isosceles\", or \"scalene\"";
	createVisualization("triangle",{base:a,height:b});
}