import {questionArea} from "../../script.js";
import {getMaxForDifficulty, cleanupVisualization} from "./geometryUtils.js";
import {createVisualization} from "./geometryVisualization.js";
/**
 * Miscellaneous geometry: perimeter, arc length, distance formula, angle relations.
 * @fileoverview Generates questions about perimeter (rectangle/triangle), arc length, distance between points, and complementary/supplementary angles. Displays in questionArea and sets window.correctAnswer with answer and display, plus plausible wrong answers for MCQ mode.
 * @date 2026-04-18
 */
export function generatePerimeter(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const shape=Math.random()>0.5?"rectangle":"triangle";
	let mathExpression="";
	let correct="";
	let choices:string[]=[];
	if(shape==="rectangle"){
		const maxDim=getMaxForDifficulty(difficulty,10);
		const l=Math.floor(Math.random()*maxDim)+3;
		const w=Math.floor(Math.random()*maxDim)+2;
		const perimeter=2*(l+w);
		correct=perimeter.toString();
		mathExpression=`Find the perimeter of a rectangle with length \\( ${l} \\) and width \\( ${w} \\).`;
		choices=[correct];
		choices.push((2*(l+1+w)).toString());
		choices.push((2*(l+w+1)).toString());
		choices.push((l*w).toString());
		choices.push((2*l+2*w+1).toString());
		createVisualization("cube",{size:Math.min(l,w,4)});
	}
	else{
		const maxSide=getMaxForDifficulty(difficulty,8);
		const a=Math.floor(Math.random()*maxSide)+3;
		const b=Math.floor(Math.random()*maxSide)+3;
		const c=Math.floor(Math.random()*maxSide)+3;
		const perimeter=a+b+c;
		correct=perimeter.toString();
		mathExpression=`Find the perimeter of a triangle with sides \\( ${a}, ${b}, ${c} \\).`;
		choices=[correct];
		choices.push((a+b+c+1).toString());
		choices.push((a+b+c-1).toString());
		choices.push((2*(a+b)).toString());
		choices.push((a*b*c).toString());
		createVisualization("triangle",{base:a,height:b});
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
	window.expectedFormat="Enter a whole number";
}
export function generateArcLength(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxRadius=getMaxForDifficulty(difficulty,8);
	const r=Math.floor(Math.random()*maxRadius)+3;
	const angle=Math.floor(Math.random()*90)+30;
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
		alternate: ((angle/360)*2*Math.PI*r).toFixed(2),
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal";
	createVisualization("torus",{radius:r,tube:0.2});
}
export function generateDistanceFormula(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxCoord=getMaxForDifficulty(difficulty,8);
	const x1=Math.floor(Math.random()*maxCoord)-4;
	const y1=Math.floor(Math.random()*maxCoord)-4;
	const x2=Math.floor(Math.random()*maxCoord)-4;
	const y2=Math.floor(Math.random()*maxCoord)-4;
	const dist=Math.sqrt((x2-x1)**2+(y2-y1)**2);
	const rounded=Math.round(dist*100)/100;
	const correct=rounded.toFixed(2);
	const mathExpression=`Find the distance between points \\( (${x1},${y1}) \\) and \\( (${x2},${y2}) \\).`;
	const choices=[correct];
	choices.push((Math.abs(x2-x1)+Math.abs(y2-y1)).toFixed(2));
	choices.push(Math.sqrt((x2-x1)**2+(y2-y1)**2+1).toFixed(2));
	choices.push(Math.sqrt((x2-x1)**2+(y2-y1)**2-1).toFixed(2));
	choices.push((Math.abs(x2-x1)).toFixed(2));
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
		alternate: Math.sqrt((x2-x1)**2+(y2-y1)**2).toFixed(2),
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a decimal";
}
export function generateAngleRelations(_difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const angle=Math.floor(Math.random()*60)+20;
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
		alternate: `${comp}, ${supp}`,
		display: correct,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as \"complement: X, supplement: Y\"";
}