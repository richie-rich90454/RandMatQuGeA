/**
 * Area and surface area: circle, rectangle, triangle, sector, cube.
 * @fileoverview Generates questions about area and surface area for common 2D and 3D shapes. Displays in questionArea and sets window.correctAnswer with answer and display.
 * @date 2026-03-15
 */
import {questionArea} from "../../script.js";
import {getMaxForDifficulty, cleanupVisualization} from "./geometryUtils.js";
import {createVisualization} from "./geometryVisualization.js";
/**
 * Generates a circle area question.
 * @param difficulty - optional difficulty level.
 */
export function generateAreaCircle(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxRadius=getMaxForDifficulty(difficulty,10);
	const radius=Math.floor(Math.random()*maxRadius)+2;
	const area=Math.PI*radius*radius;
	const rounded=Math.round(area*100)/100;
	questionArea.innerHTML=`Find the area of a circle with radius \\( ${radius} \\). (Use \\( \\pi \\approx 3.14 \\))`;
	window.correctAnswer={
		correct: rounded.toFixed(2),
		alternate: (Math.PI*radius*radius).toFixed(2),
		display: rounded.toFixed(2)
	};
	window.expectedFormat="Enter a decimal (e.g., 78.54)";
	createVisualization("circle",{radius});
	if (window.MathJax?.typeset) window.MathJax.typeset();
}
/**
 * Generates a rectangle area question.
 * @param difficulty - optional difficulty level.
 */
export function generateAreaRectangle(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxDim=getMaxForDifficulty(difficulty,12);
	const length=Math.floor(Math.random()*maxDim)+3;
	const width=Math.floor(Math.random()*maxDim)+2;
	const area=length*width;
	questionArea.innerHTML=`Find the area of a rectangle with length \\( ${length} \\) and width \\( ${width} \\).`;
	window.correctAnswer={ correct:area.toString(), alternate:area.toString(), display:area.toString() };
	window.expectedFormat="Enter a whole number";
	createVisualization("cube",{size:Math.min(length,width,5)});
	if (window.MathJax?.typeset) window.MathJax.typeset();
}
/**
 * Generates a triangle area question.
 * @param difficulty - optional difficulty level.
 */
export function generateAreaTriangle(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxBase=getMaxForDifficulty(difficulty,10);
	const maxHeight=getMaxForDifficulty(difficulty,10);
	const base=Math.floor(Math.random()*maxBase)+3;
	const height=Math.floor(Math.random()*maxHeight)+3;
	const area=0.5*base*height;
	const rounded=Math.round(area*100)/100;
	questionArea.innerHTML=`Find the area of a triangle with base \\( ${base} \\) and height \\( ${height} \\).`;
	window.correctAnswer={
		correct: rounded.toFixed(2),
		alternate: (0.5*base*height).toFixed(2),
		display: rounded.toFixed(2)
	};
	window.expectedFormat="Enter a decimal (e.g., 12.5)";
	createVisualization("triangle",{base,height});
	if (window.MathJax?.typeset) window.MathJax.typeset();
}
/**
 * Generates a sector area question.
 * @param difficulty - optional difficulty level.
 */
export function generateSectorArea(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxRadius=getMaxForDifficulty(difficulty,8);
	const r=Math.floor(Math.random()*maxRadius)+3;
	const angle=Math.floor(Math.random()*90)+30;
	const area=(angle/360)*Math.PI*r*r;
	const rounded=Math.round(area*100)/100;
	questionArea.innerHTML=`Find the area of a sector with central angle \\( ${angle}^\\circ \\) in a circle of radius \\( ${r} \\).`;
	window.correctAnswer={
		correct: rounded.toFixed(2),
		alternate: ((angle/360)*Math.PI*r*r).toFixed(2),
		display: rounded.toFixed(2)
	};
	window.expectedFormat="Enter a decimal";
	createVisualization("circle",{radius:r});
	if (window.MathJax?.typeset) window.MathJax.typeset();
}
/**
 * Generates a cube surface area question.
 * @param difficulty - optional difficulty level.
 */
export function generateSurfaceAreaCube(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxSide=getMaxForDifficulty(difficulty,6);
	const s=Math.floor(Math.random()*maxSide)+2;
	const area=6*s*s;
	questionArea.innerHTML=`Find the surface area of a cube with side \\( ${s} \\).`;
	window.correctAnswer={ correct:area.toString(), alternate:area.toString(), display:area.toString() };
	window.expectedFormat="Enter a whole number";
	createVisualization("cube",{size:s});
	if (window.MathJax?.typeset) window.MathJax.typeset();
}