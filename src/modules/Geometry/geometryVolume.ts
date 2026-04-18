import {questionArea} from "../../script.js";
import {getMaxForDifficulty, cleanupVisualization} from "./geometryUtils.js";
import {createVisualization} from "./geometryVisualization.js";
/**
 * Volume calculations for 3D shapes: sphere, cylinder, cone, pyramid.
 * @fileoverview Generates volume questions for common 3D shapes, displays them in questionArea, and sets window.correctAnswer with correct, alternate, and display properties, plus plausible wrong answers for MCQ mode. Includes 3D visualizations.
 * @date 2026-04-18
 */
export function generateVolumeSphere(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxRadius=getMaxForDifficulty(difficulty,6);
	const radius=Math.floor(Math.random()*maxRadius)+2;
	const volume=(4/3)*Math.PI*Math.pow(radius,3);
	const rounded=Math.round(volume*100)/100;
	const correct=rounded.toFixed(2);
	const mathExpression=`Find the volume of a sphere with radius \\( ${radius} \\). (Use \\( \\pi \\approx 3.14 \\))`;
	const choices=[correct];
	choices.push((4*Math.PI*radius*radius).toFixed(2));
	choices.push(((4/3)*Math.PI*(radius+1)*(radius+1)*(radius+1)).toFixed(2));
	choices.push(((4/3)*Math.PI*(radius-1)*(radius-1)*(radius-1)).toFixed(2));
	choices.push((Math.PI*radius*radius*radius).toFixed(2));
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
		alternate: (4/3*Math.PI*radius**3).toFixed(2),
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal (e.g., 113.10)";
	createVisualization("sphere",{radius});
}
export function generateVolumeCylinder(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxRadius=getMaxForDifficulty(difficulty,5);
	const maxHeight=getMaxForDifficulty(difficulty,8);
	const r=Math.floor(Math.random()*maxRadius)+2;
	const h=Math.floor(Math.random()*maxHeight)+3;
	const volume=Math.PI*r*r*h;
	const rounded=Math.round(volume*100)/100;
	const correct=rounded.toFixed(2);
	const mathExpression=`Find the volume of a cylinder with radius \\( ${r} \\) and height \\( ${h} \\). (Use \\( \\pi \\approx 3.14 \\))`;
	const choices=[correct];
	choices.push((2*Math.PI*r*h).toFixed(2));
	choices.push((Math.PI*(r+1)*(r+1)*h).toFixed(2));
	choices.push((Math.PI*r*r*(h+1)).toFixed(2));
	choices.push((Math.PI*r*r).toFixed(2));
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
		alternate: (Math.PI*r*r*h).toFixed(2),
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal";
	createVisualization("cylinder",{radius:r,height:h});
}
export function generateVolumeCone(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxRadius=getMaxForDifficulty(difficulty,5);
	const maxHeight=getMaxForDifficulty(difficulty,8);
	const r=Math.floor(Math.random()*maxRadius)+2;
	const h=Math.floor(Math.random()*maxHeight)+3;
	const volume=(1/3)*Math.PI*r*r*h;
	const rounded=Math.round(volume*100)/100;
	const correct=rounded.toFixed(2);
	const mathExpression=`Find the volume of a cone with radius \\( ${r} \\) and height \\( ${h} \\).`;
	const choices=[correct];
	choices.push((Math.PI*r*r*h).toFixed(2));
	choices.push(((1/3)*Math.PI*(r+1)*(r+1)*h).toFixed(2));
	choices.push(((1/3)*Math.PI*r*r*(h+1)).toFixed(2));
	choices.push(((1/3)*Math.PI*r*r).toFixed(2));
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
		alternate: ((1/3)*Math.PI*r*r*h).toFixed(2),
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal";
	createVisualization("cone",{radius:r,height:h});
}
export function generateVolumePyramid(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxBase=getMaxForDifficulty(difficulty,6);
	const base=Math.floor(Math.random()*maxBase)+3;
	const height=Math.floor(Math.random()*maxBase)+4;
	const volume=(1/3)*base*base*height;
	const rounded=Math.round(volume*100)/100;
	const correct=rounded.toFixed(2);
	const mathExpression=`Find the volume of a square pyramid with base side \\( ${base} \\) and height \\( ${height} \\).`;
	const choices=[correct];
	choices.push((base*base*height).toFixed(2));
	choices.push(((1/3)*(base+1)*(base+1)*height).toFixed(2));
	choices.push(((1/3)*base*base*(height+1)).toFixed(2));
	choices.push(((1/3)*base*base).toFixed(2));
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
		alternate: ((1/3)*base*base*height).toFixed(2),
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal";
	createVisualization("pyramid",{radius:base/2,height});
}