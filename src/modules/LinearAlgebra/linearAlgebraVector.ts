/**
 * Vector operations in 2D: magnitude, direction, unit, dot, angle, projection, parametric, polar conversion, polar graph, motion, De Moivre, addition, subtraction, parametric to Cartesian.
 * @fileoverview Generates 2D vector and polar coordinate questions with MCQ distractors. Sets window.correctAnswer with LaTeX display (pure LaTeX) and plain text alternate.
 * @date 2026-03-29
 */
import {questionArea} from "../../script.js";
import {Vector2D, getRange} from "./linearAlgebraUtils.js";
export function generateVector(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["magnitude","direction","unit","dot","angle","projection","parametric","polar_convert","cartesian_convert","polar_graph","motion","de_moivre","add","subtract","parametric_to_cartesian"];
	let type=types[Math.floor(Math.random()*types.length)];
	let range=getRange(difficulty);
	let generateNonZeroVector=(): Vector2D=>{
		let x: number, y: number;
		do{
			x=Math.random()*range*2-range;
			y=Math.random()*range*2-range;
		} while (Math.abs(x)<0.1&&Math.abs(y)<0.1);
		return{ x, y };
	};
	let generateNonZeroXVector=(): Vector2D=>{
		let vec: Vector2D;
		do{
			vec=generateNonZeroVector();
		} while (Math.abs(vec.x)<0.1);
		return vec;
	};
	let choices: string[]=[];
	switch (type){
		case "magnitude":{
			const{ x, y }=generateNonZeroVector();
			let mag=Math.sqrt(x**2+y**2).toFixed(2);
			questionArea.innerHTML=`Find the magnitude of \\(\\langle ${x.toFixed(1)}, ${y.toFixed(1)} \\rangle\\).`;
			let correct=mag;
			choices=[correct];
			let magNum=parseFloat(mag);
			choices.push((magNum+0.5).toFixed(2));
			choices.push((magNum-0.5).toFixed(2));
			choices.push((Math.abs(x)+Math.abs(y)).toFixed(2));
			choices.push((Math.abs(x)).toFixed(2));
			break;
		}
		case "direction":{
			const{ x, y }=generateNonZeroVector();
			let angle=(Math.atan2(y, x)*180/Math.PI).toFixed(1);
			let correct=`${angle}^{\\circ}`;
			questionArea.innerHTML=`Find the direction angle (in degrees) of \\(\\langle ${x.toFixed(1)}, ${y.toFixed(1)} \\rangle\\).`;
			let angleNum=parseFloat(angle);
			choices=[correct];
			choices.push(`${(angleNum+10).toFixed(1)}^{\\circ}`);
			choices.push(`${(angleNum-10).toFixed(1)}^{\\circ}`);
			choices.push(`${(Math.atan2(y, x)*180/Math.PI+180).toFixed(1)}^{\\circ}`);
			choices.push(`${(Math.atan2(x, y)*180/Math.PI).toFixed(1)}^{\\circ}`);
			break;
		}
		case "unit":{
			const{ x, y }=generateNonZeroVector();
			let mag=Math.sqrt(x**2+y**2);
			let ux=(x/mag).toFixed(2);
			let uy=(y/mag).toFixed(2);
			questionArea.innerHTML=`Find the unit vector in the direction of \\(\\langle ${x.toFixed(1)}, ${y.toFixed(1)} \\rangle\\).`;
			let correct=`\\langle ${ux}, ${uy} \\rangle`;
			choices=[correct];
			choices.push(`\\langle ${(x/mag+0.1).toFixed(2)}, ${uy} \\rangle`);
			choices.push(`\\langle ${ux}, ${(y/mag+0.1).toFixed(2)} \\rangle`);
			choices.push(`\\langle ${(x/mag).toFixed(2)}, ${(y/mag).toFixed(2)} \\rangle`);
			choices.push(`\\langle ${(x/(mag+0.5)).toFixed(2)}, ${(y/(mag+0.5)).toFixed(2)} \\rangle`);
			break;
		}
		case "dot":{
			let v1=generateNonZeroVector();
			let v2=generateNonZeroVector();
			let product=(v1.x*v2.x+v1.y*v2.y).toFixed(2);
			questionArea.innerHTML=`Calculate \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle \\cdot \\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
			let correct=product;
			let prodNum=parseFloat(product);
			choices=[correct];
			choices.push((prodNum+1).toFixed(2));
			choices.push((prodNum-1).toFixed(2));
			choices.push((v1.x*v2.x).toFixed(2));
			choices.push((v1.y*v2.y).toFixed(2));
			break;
		}
		case "angle":{
			let v1=generateNonZeroVector();
			let v2=generateNonZeroVector();
			let dot=v1.x*v2.x+v1.y*v2.y;
			let mag1=Math.sqrt(v1.x**2+v1.y**2);
			let mag2=Math.sqrt(v2.x**2+v2.y**2);
			let cosTheta=dot/(mag1*mag2);
			if (cosTheta>1) cosTheta=1;
			if (cosTheta<-1) cosTheta=-1;
			let angle=(Math.acos(cosTheta)*180/Math.PI).toFixed(1);
			let correct=`${angle}^{\\circ}`;
			questionArea.innerHTML=`Find the angle (in degrees) between \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\) and \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
			let angleNum=parseFloat(angle);
			choices=[correct];
			choices.push(`${(angleNum+10).toFixed(1)}^{\\circ}`);
			choices.push(`${(angleNum-10).toFixed(1)}^{\\circ}`);
			choices.push(`${(180-angleNum).toFixed(1)}^{\\circ}`);
			choices.push(`${(Math.asin(cosTheta)*180/Math.PI).toFixed(1)}^{\\circ}`);
			break;
		}
		case "projection":{
			let v1=generateNonZeroVector();
			let v2=generateNonZeroVector();
			let dot=v1.x*v2.x+v1.y*v2.y;
			let magV2Sq=v2.x**2+v2.y**2;
			let projX=(dot/magV2Sq*v2.x).toFixed(2);
			let projY=(dot/magV2Sq*v2.y).toFixed(2);
			questionArea.innerHTML=`Find the projection of \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\) onto \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
			let correct=`\\langle ${projX}, ${projY} \\rangle`;
			choices=[correct];
			choices.push(`\\langle ${(dot/(magV2Sq+0.5)*v2.x).toFixed(2)}, ${(dot/(magV2Sq+0.5)*v2.y).toFixed(2)} \\rangle`);
			choices.push(`\\langle ${(parseFloat(projX)+0.1).toFixed(2)}, ${projY} \\rangle`);
			choices.push(`\\langle ${projX}, ${(parseFloat(projY)+0.1).toFixed(2)} \\rangle`);
			choices.push(`\\langle ${(v1.x).toFixed(2)}, ${(v1.y).toFixed(2)} \\rangle`);
			break;
		}
		case "parametric":{
			let pointX=(Math.random()*range*2-range).toFixed(1);
			let pointY=(Math.random()*range*2-range).toFixed(1);
			let dir=generateNonZeroVector();
			questionArea.innerHTML=`Write the parametric equations for the line that passes through \\((${pointX}, ${pointY})\\) and has direction vector \\(\\langle ${dir.x.toFixed(1)}, ${dir.y.toFixed(1)} \\rangle\\).`;
			let correct=`x=${pointX}+${dir.x.toFixed(1)}t, y=${pointY}+${dir.y.toFixed(1)}t`;
			choices=[correct];
			choices.push(`x=${pointX}+${(dir.x+1).toFixed(1)}t, y=${pointY}+${dir.y.toFixed(1)}t`);
			choices.push(`x=${pointX}+${dir.x.toFixed(1)}t, y=${pointY}+${(dir.y+1).toFixed(1)}t`);
			choices.push(`x=${pointX}+${(-dir.x).toFixed(1)}t, y=${pointY}+${dir.y.toFixed(1)}t`);
			choices.push(`x=${pointX}+${dir.x.toFixed(1)}t, y=${pointY}+${(-dir.y).toFixed(1)}t`);
			break;
		}
		case "polar_convert":{
			let r=(Math.random()*range).toFixed(1);
			let theta=(Math.random()*360-180).toFixed(0);
			let x=(parseFloat(r)*Math.cos(parseFloat(theta)*Math.PI/180)).toFixed(2);
			let y=(parseFloat(r)*Math.sin(parseFloat(theta)*Math.PI/180)).toFixed(2);
			questionArea.innerHTML=`Convert the polar coordinate \\((${r}, ${theta}^{\\circ})\\) to Cartesian coordinates.`;
			let correct=`(${x}, ${y})`;
			let xNum=parseFloat(x), yNum=parseFloat(y);
			choices=[correct];
			choices.push(`(${(xNum+0.5).toFixed(2)}, ${yNum})`);
			choices.push(`(${xNum}, ${(yNum+0.5).toFixed(2)})`);
			choices.push(`(${(xNum).toFixed(2)}, ${(yNum).toFixed(2)})`);
			choices.push(`(${(parseFloat(r)*Math.cos(parseFloat(theta)*Math.PI/180+0.1)).toFixed(2)}, ${y})`);
			break;
		}
		case "cartesian_convert":{
			const{ x, y }=generateNonZeroVector();
			let r=Math.sqrt(x**2+y**2).toFixed(2);
			let theta=(Math.atan2(y, x)*180/Math.PI).toFixed(1);
			questionArea.innerHTML=`Convert the Cartesian coordinate \\((${x.toFixed(1)}, ${y.toFixed(1)})\\) to polar coordinates. Answer with (r, degrees), no need to add deg.`;
			let correct=`(${r}, ${theta}^{\\circ})`;
			let rNum=parseFloat(r), thetaNum=parseFloat(theta);
			choices=[correct];
			choices.push(`(${(rNum+1).toFixed(2)}, ${thetaNum}^{\\circ})`);
			choices.push(`(${(rNum-1).toFixed(2)}, ${thetaNum}^{\\circ})`);
			choices.push(`(${rNum}, ${(thetaNum+10).toFixed(1)}^{\\circ})`);
			choices.push(`(${rNum}, ${(thetaNum-10).toFixed(1)}^{\\circ})`);
			break;
		}
		case "polar_graph":{
			let a=(Math.random()*range+1).toFixed(1);
			let useSin=Math.random()<0.5;
			if (useSin){
				questionArea.innerHTML=`Describe the graph of the polar equation \\(r=${a}\\sin\\theta\\). Use the format "A circle with center at (x, y) and radius (radius)" Use two decimal places.`;
				let center=(parseFloat(a)/2).toFixed(2);
				let correct=`A circle with center at (0, ${center}) and radius ${center}`;
				choices=[correct];
				choices.push(`A circle with center at (${center}, 0) and radius ${center}`);
				choices.push(`A circle with center at (0, ${(parseFloat(a)).toFixed(2)}) and radius ${(parseFloat(a)).toFixed(2)}`);
				choices.push(`A circle with center at (0, 0) and radius ${center}`);
				choices.push(`A cardioid`);
			}
			else{
				questionArea.innerHTML=`Describe the graph of the polar equation \\(r=${a}\\cos\\theta\\). Use the format "A circle with center at (x, y) and radius (radius)" Use two decimal places.`;
				let center=(parseFloat(a)/2).toFixed(2);
				let correct=`A circle with center at (${center}, 0) and radius ${center}`;
				choices=[correct];
				choices.push(`A circle with center at (0, ${center}) and radius ${center}`);
				choices.push(`A circle with center at (${(parseFloat(a)).toFixed(2)}, 0) and radius ${(parseFloat(a)).toFixed(2)}`);
				choices.push(`A circle with center at (0, 0) and radius ${center}`);
				choices.push(`A cardioid`);
			}
			break;
		}
		case "motion":{
			let posX=(Math.random()*range*2-range).toFixed(1);
			let posY=(Math.random()*range*2-range).toFixed(1);
			let v=generateNonZeroVector();
			questionArea.innerHTML=`A particle starts at \\((${posX}, ${posY})\\) and moves with constant velocity \\(\\langle ${v.x.toFixed(1)}, ${v.y.toFixed(1)} \\rangle\\). Write the position vector as a function of time \\(t\\).`;
			let correct=`\\langle ${posX}+${v.x.toFixed(1)}t, ${posY}+${v.y.toFixed(1)}t \\rangle`;
			choices=[correct];
			choices.push(`\\langle ${posX}+${(v.x+1).toFixed(1)}t, ${posY}+${v.y.toFixed(1)}t \\rangle`);
			choices.push(`\\langle ${posX}+${v.x.toFixed(1)}t, ${posY}+${(v.y+1).toFixed(1)}t \\rangle`);
			choices.push(`\\langle ${posX}+${(-v.x).toFixed(1)}t, ${posY}+${v.y.toFixed(1)}t \\rangle`);
			choices.push(`\\langle ${posX}+${v.x.toFixed(1)}t, ${posY}+${(-v.y).toFixed(1)}t \\rangle`);
			break;
		}
		case "de_moivre":{
			let r=(Math.random()*range+1).toFixed(1);
			let theta=Math.floor(Math.random()*360);
			let n=Math.floor(Math.random()*3+2);
			let newR=(Math.pow(parseFloat(r), n)).toFixed(2);
			let newTheta=(theta*n) % 360;
			questionArea.innerHTML=`Compute \\((${r}(\\cos ${theta}^{\\circ}+i\\sin ${theta}^{\\circ}))^{${n}}\\) using De Moivre's Theorem. Answer with degrees (no need to add deg).`;
			let correct=`${newR} \\operatorname{cis} ${newTheta}^{\\circ}`;
			choices=[correct];
			choices.push(`${newR} \\operatorname{cis} ${(newTheta+360).toFixed(0)}^{\\circ}`);
			choices.push(`${(parseFloat(newR)+1).toFixed(2)} \\operatorname{cis} ${newTheta}^{\\circ}`);
			choices.push(`${(parseFloat(newR)-1).toFixed(2)} \\operatorname{cis} ${newTheta}^{\\circ}`);
			choices.push(`${newR} \\operatorname{cis} ${(theta*n+1).toFixed(0)}^{\\circ}`);
			break;
		}
		case "add":{
			let v1=generateNonZeroVector();
			let v2=generateNonZeroVector();
			let sumX=(v1.x+v2.x).toFixed(2);
			let sumY=(v1.y+v2.y).toFixed(2);
			questionArea.innerHTML=`Find the sum of the vectors \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\) and \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
			let correct=`\\langle ${sumX}, ${sumY} \\rangle`;
			choices=[correct];
			choices.push(`\\langle ${(parseFloat(sumX)+1).toFixed(2)}, ${sumY} \\rangle`);
			choices.push(`\\langle ${sumX}, ${(parseFloat(sumY)+1).toFixed(2)} \\rangle`);
			choices.push(`\\langle ${(parseFloat(sumX)-1).toFixed(2)}, ${sumY} \\rangle`);
			choices.push(`\\langle ${sumX}, ${(parseFloat(sumY)-1).toFixed(2)} \\rangle`);
			break;
		}
		case "subtract":{
			let v1=generateNonZeroVector();
			let v2=generateNonZeroVector();
			let diffX=(v1.x-v2.x).toFixed(2);
			let diffY=(v1.y-v2.y).toFixed(2);
			questionArea.innerHTML=`Subtract \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\) from \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\).`;
			let correct=`\\langle ${diffX}, ${diffY} \\rangle`;
			choices=[correct];
			choices.push(`\\langle ${(parseFloat(diffX)+1).toFixed(2)}, ${diffY} \\rangle`);
			choices.push(`\\langle ${diffX}, ${(parseFloat(diffY)+1).toFixed(2)} \\rangle`);
			choices.push(`\\langle ${(parseFloat(diffX)-1).toFixed(2)}, ${diffY} \\rangle`);
			choices.push(`\\langle ${diffX}, ${(parseFloat(diffY)-1).toFixed(2)} \\rangle`);
			break;
		}
		case "parametric_to_cartesian":{
			let x0=(Math.random()*range*2-range).toFixed(1);
			let y0=(Math.random()*range*2-range).toFixed(1);
			let dir=generateNonZeroXVector();
			let slopeNum=dir.y;
			let slopeDen=dir.x;
			let slope=slopeNum/slopeDen;
			let slopeStr=slope.toFixed(2);
			let intercept=parseFloat(y0)-slope*parseFloat(x0);
			let interceptStr=intercept.toFixed(2);
			let interceptDisplay=intercept>=0?`+ ${interceptStr}`:`- ${Math.abs(intercept).toFixed(2)}`;
			questionArea.innerHTML=`The line is given by the parametric equations \\(x=${x0}+${dir.x.toFixed(1)}t\\) and \\(y=${y0}+${dir.y.toFixed(1)}t\\). Convert these into a single Cartesian equation.`;
			let correct=`y = ${slopeStr}x ${interceptDisplay}`;
			choices=[correct];
			choices.push(`y = ${(slope+0.1).toFixed(2)}x ${interceptDisplay}`);
			choices.push(`y = ${slopeStr}x ${(intercept+0.5).toFixed(2)}`);
			choices.push(`y = ${(slope-0.1).toFixed(2)}x ${interceptDisplay}`);
			choices.push(`y = ${slopeStr}x ${(intercept-0.5).toFixed(2)}`);
			break;
		}
		default:
			questionArea.innerHTML="Unknown question type.";
			window.correctAnswer={ correct: "", alternate: "", display: "", choices: [] };
			window.expectedFormat="";
			if (window.MathJax&&window.MathJax.typeset) window.MathJax.typeset();
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	let correctAnswerStr: string;
	if (window.correctAnswer?.correct){
		correctAnswerStr=window.correctAnswer.correct;
	}
	else{
		switch (type){
			case "magnitude":
			case "direction":
			case "unit":
			case "dot":
			case "angle":
			case "projection":
			case "parametric":
			case "polar_convert":
			case "cartesian_convert":
			case "polar_graph":
			case "motion":
			case "de_moivre":
			case "add":
			case "subtract":
			case "parametric_to_cartesian":
				correctAnswerStr=choices[0]||"";
				break;
			default:
				correctAnswerStr="";
		}
	}
	if (!uniqueChoices.includes(correctAnswerStr)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswerStr;
		else uniqueChoices=[correctAnswerStr];
	}
	window.correctAnswer={
		correct: correctAnswerStr,
		alternate: window.correctAnswer?.alternate || correctAnswerStr,
		display: window.correctAnswer?.display || correctAnswerStr,
		choices: uniqueChoices
	};
	window.expectedFormat=window.expectedFormat || "";
	if (window.MathJax&&window.MathJax.typeset) window.MathJax.typeset();
}