import {questionArea} from "../../script.js";
import {getMaxForDifficulty, cleanupVisualization} from "./geometryUtils.js";
import {createVisualization} from "./geometryVisualization.js";
/**
 * Area and surface area: circle, rectangle, triangle, sector, cube.
 * @fileoverview Generates questions about area and surface area for common 2D and 3D shapes. Displays in questionArea and sets window.correctAnswer with answer and display, plus plausible wrong answers for MCQ mode.
 * @date 2026-04-18
 */
export function generateAreaCircle(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxRadius=getMaxForDifficulty(difficulty,10);
	const radius=Math.floor(Math.random()*maxRadius)+2;
	const area=Math.PI*radius*radius;
	const rounded=Math.round(area*100)/100;
	const correctStr=rounded.toFixed(2);
	let mathExpression=`Find the area of a circle with radius \\( ${radius} \\). (Use \\( \\pi \\approx 3.14 \\))`;
	const choices=[correctStr];
	choices.push((Math.PI*(radius+1)*(radius+1)).toFixed(2));
	choices.push((Math.PI*(radius-1)*(radius-1)).toFixed(2));
	choices.push((2*Math.PI*radius).toFixed(2));
	choices.push((radius*radius).toFixed(2));
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctStr)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctStr;
		else uniqueChoices=[correctStr];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctStr,
		alternate: (Math.PI*radius*radius).toFixed(2),
		display: correctStr,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal (e.g., 78.54)";
	createVisualization("circle",{radius});
}
export function generateAreaRectangle(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxDim=getMaxForDifficulty(difficulty,12);
	const length=Math.floor(Math.random()*maxDim)+3;
	const width=Math.floor(Math.random()*maxDim)+2;
	const area=length*width;
	const correctStr=area.toString();
	let mathExpression=`Find the area of a rectangle with length \\( ${length} \\) and width \\( ${width} \\).`;
	const choices=[correctStr];
	choices.push(((length+1)*width).toString());
	choices.push((length*(width+1)).toString());
	choices.push((2*(length+width)).toString());
	choices.push(((length-1)*(width-1)).toString());
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctStr)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctStr;
		else uniqueChoices=[correctStr];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctStr,
		alternate: correctStr,
		display: correctStr,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a whole number";
	createVisualization("cube",{size:Math.min(length,width,5)});
}
export function generateAreaTriangle(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxBase=getMaxForDifficulty(difficulty,10);
	const maxHeight=getMaxForDifficulty(difficulty,10);
	const base=Math.floor(Math.random()*maxBase)+3;
	const height=Math.floor(Math.random()*maxHeight)+3;
	const area=0.5*base*height;
	const rounded=Math.round(area*100)/100;
	const correctStr=rounded.toFixed(2);
	let mathExpression=`Find the area of a triangle with base \\( ${base} \\) and height \\( ${height} \\).`;
	const choices=[correctStr];
	choices.push((base*height).toFixed(2));
	choices.push((0.5*(base+1)*height).toFixed(2));
	choices.push((0.5*base*(height+1)).toFixed(2));
	choices.push((0.5*(base-1)*(height-1)).toFixed(2));
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctStr)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctStr;
		else uniqueChoices=[correctStr];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctStr,
		alternate: (0.5*base*height).toFixed(2),
		display: correctStr,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal (e.g., 12.5)";
	createVisualization("triangle",{base,height});
}
export function generateSectorArea(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxRadius=getMaxForDifficulty(difficulty,8);
	const r=Math.floor(Math.random()*maxRadius)+3;
	const angle=Math.floor(Math.random()*90)+30;
	const area=(angle/360)*Math.PI*r*r;
	const rounded=Math.round(area*100)/100;
	const correctStr=rounded.toFixed(2);
	let mathExpression=`Find the area of a sector with central angle \\( ${angle}^\\circ \\) in a circle of radius \\( ${r} \\).`;
	const choices=[correctStr];
	choices.push(((angle/360)*Math.PI*(r+1)*(r+1)).toFixed(2));
	choices.push(((angle/360)*Math.PI*(r-1)*(r-1)).toFixed(2));
	choices.push(((angle/180)*Math.PI*r*r).toFixed(2));
	choices.push((Math.PI*r*r).toFixed(2));
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctStr)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctStr;
		else uniqueChoices=[correctStr];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctStr,
		alternate: ((angle/360)*Math.PI*r*r).toFixed(2),
		display: correctStr,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal";
	createVisualization("circle",{radius:r});
}
export function generateSurfaceAreaCube(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxSide=getMaxForDifficulty(difficulty,6);
	const s=Math.floor(Math.random()*maxSide)+2;
	const area=6*s*s;
	const correctStr=area.toString();
	let mathExpression=`Find the surface area of a cube with side \\( ${s} \\).`;
	const choices=[correctStr];
	choices.push((6*(s+1)*(s+1)).toString());
	choices.push((6*(s-1)*(s-1)).toString());
	choices.push((s*s*s).toString());
	choices.push((6*s).toString());
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctStr)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctStr;
		else uniqueChoices=[correctStr];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctStr,
		alternate: correctStr,
		display: correctStr,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a whole number";
	createVisualization("cube",{size:s});
}