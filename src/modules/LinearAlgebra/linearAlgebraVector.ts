/**
 * Vector operations in 2D: magnitude, direction, unit, dot, angle, projection, parametric, polar conversion, polar graph, motion, De Moivre, addition, subtraction, parametric to Cartesian.
 * @fileoverview Generates 2D vector and polar coordinate questions. Sets window.correctAnswer with LaTeX display (pure LaTeX) and plain text alternate.
 * @date 2026-03-15
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
	switch (type){
		case "magnitude":{
			const{ x, y }=generateNonZeroVector();
			let mag=Math.sqrt(x**2+y**2).toFixed(2);
			questionArea.innerHTML=`Find the magnitude of \\(\\langle ${x.toFixed(1)}, ${y.toFixed(1)} \\rangle\\).`;
			window.correctAnswer={
				correct: mag,
				alternate: mag,
				display: mag
			};
			window.expectedFormat="Enter a number (e.g., 5.83)";
			break;
		}
		case "direction":{
			const{ x, y }=generateNonZeroVector();
			let angle=(Math.atan2(y, x)*180/Math.PI).toFixed(1);
			questionArea.innerHTML=`Find the direction angle (in degrees) of \\(\\langle ${x.toFixed(1)}, ${y.toFixed(1)} \\rangle\\).`;
			let correctLaTeX=`${angle}^{\\circ}`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: angle,
				display: correctLaTeX
			};
			window.expectedFormat="Enter a number (degrees, e.g., 53.1)";
			break;
		}
		case "unit":{
			const{ x, y }=generateNonZeroVector();
			let mag=Math.sqrt(x**2+y**2);
			let ux=(x/mag).toFixed(2);
			let uy=(y/mag).toFixed(2);
			questionArea.innerHTML=`Find the unit vector in the direction of \\(\\langle ${x.toFixed(1)}, ${y.toFixed(1)} \\rangle\\).`;
			let correctLaTeX=`\\langle ${ux}, ${uy} \\rangle`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `<${ux}, ${uy}>`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as <x, y> or (x, y)";
			break;
		}
		case "dot":{
			let v1=generateNonZeroVector();
			let v2=generateNonZeroVector();
			let product=(v1.x*v2.x+v1.y*v2.y).toFixed(2);
			questionArea.innerHTML=`Calculate \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle \\cdot \\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
			window.correctAnswer={
				correct: product,
				alternate: product,
				display: product
			};
			window.expectedFormat="Enter a number (e.g., 12.5)";
			break;
		}
		case "angle":{
			let v1=generateNonZeroVector();
			let v2=generateNonZeroVector();
			let dot=v1.x*v2.x+v1.y*v2.y;
			let mag1=Math.sqrt(v1.x**2+v1.y**2);
			let mag2=Math.sqrt(v2.x**2+v2.y**2);
			let angle=(Math.acos(dot/(mag1*mag2))*180/Math.PI).toFixed(1);
			questionArea.innerHTML=`Find the angle (in degrees) between \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\) and \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
			let correctLaTeX=`${angle}^{\\circ}`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: angle,
				display: correctLaTeX
			};
			window.expectedFormat="Enter a number (degrees, e.g., 45.0)";
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
			let correctLaTeX=`\\langle ${projX}, ${projY} \\rangle`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `<${projX}, ${projY}>`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as <x, y> or (x, y)";
			break;
		}
		case "parametric":{
			let pointX=(Math.random()*range*2-range).toFixed(1);
			let pointY=(Math.random()*range*2-range).toFixed(1);
			let dir=generateNonZeroVector();
			questionArea.innerHTML=`Write the parametric equations for the line that passes through \\((${pointX}, ${pointY})\\) and has direction vector \\(\\langle ${dir.x.toFixed(1)}, ${dir.y.toFixed(1)} \\rangle\\).`;
			let correctLaTeX=`x=${pointX}+${dir.x.toFixed(1)}t, y=${pointY}+${dir.y.toFixed(1)}t`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `<${pointX}+${dir.x.toFixed(1)}t, ${pointY}+${dir.y.toFixed(1)}t>`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as \"x=...t, y=...t\" or <..., ...>";
			break;
		}
		case "polar_convert":{
			let r=(Math.random()*range).toFixed(1);
			let theta=(Math.random()*360-180).toFixed(0);
			let x=(parseFloat(r)*Math.cos(parseFloat(theta)*Math.PI/180)).toFixed(2);
			let y=(parseFloat(r)*Math.sin(parseFloat(theta)*Math.PI/180)).toFixed(2);
			questionArea.innerHTML=`Convert the polar coordinate \\((${r}, ${theta}^{\\circ})\\) to Cartesian coordinates.`;
			let correctLaTeX=`(${x}, ${y})`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `(${x}, ${y})`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as (x, y)";
			break;
		}
		case "cartesian_convert":{
			const{ x, y }=generateNonZeroVector();
			let r=Math.sqrt(x**2+y**2).toFixed(2);
			let theta=(Math.atan2(y, x)*180/Math.PI).toFixed(1);
			questionArea.innerHTML=`Convert the Cartesian coordinate \\((${x.toFixed(1)}, ${y.toFixed(1)})\\) to polar coordinates. Answer with (r, degrees), no need to add deg.`;
			let correctLaTeX=`(${r}, ${theta}^{\\circ})`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `(${r}, ${theta})`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as (r, θ) e.g., (5.0, 53.1)";
			break;
		}
		case "polar_graph":{
			let a=(Math.random()*range+1).toFixed(1);
			let useSin=Math.random()<0.5;
			if (useSin){
				questionArea.innerHTML=`Describe the graph of the polar equation \\(r=${a}\\sin\\theta\\). Use the format "A circle with center at (x, y) and radius (radius)" Use two decimal places.`;
				let center=(parseFloat(a)/2).toFixed(2);
				let correctLaTeX=`A circle with center at (0, ${center}) and radius ${center}`;
				window.correctAnswer={
					correct: correctLaTeX,
					alternate: `A circle with center at (0, ${center}) and radius ${center}`,
					display: correctLaTeX
				};
				window.expectedFormat="Enter as \"A circle with center at (x, y) and radius r\"";
			}
			else{
				questionArea.innerHTML=`Describe the graph of the polar equation \\(r=${a}\\cos\\theta\\). Use the format "A circle with center at (x, y) and radius (radius)" Use two decimal places.`;
				let center=(parseFloat(a)/2).toFixed(2);
				let correctLaTeX=`A circle with center at (${center}, 0) and radius ${center}`;
				window.correctAnswer={
					correct: correctLaTeX,
					alternate: `A circle with center at (${center}, 0) and radius ${center}`,
					display: correctLaTeX
				};
				window.expectedFormat="Enter as \"A circle with center at (x, y) and radius r\"";
			}
			break;
		}
		case "motion":{
			let posX=(Math.random()*range*2-range).toFixed(1);
			let posY=(Math.random()*range*2-range).toFixed(1);
			let v=generateNonZeroVector();
			questionArea.innerHTML=`A particle starts at \\((${posX}, ${posY})\\) and moves with constant velocity \\(\\langle ${v.x.toFixed(1)}, ${v.y.toFixed(1)} \\rangle\\). Write the position vector as a function of time \\(t\\).`;
			let correctLaTeX=`\\langle ${posX}+${v.x.toFixed(1)}t, ${posY}+${v.y.toFixed(1)}t \\rangle`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `<${posX}+${v.x.toFixed(1)}t, ${posY}+${v.y.toFixed(1)}t>`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as <x0+vx*t, y0+vy*t> or parametric form";
			break;
		}
		case "de_moivre":{
			let r=(Math.random()*range+1).toFixed(1);
			let theta=Math.floor(Math.random()*360);
			let n=Math.floor(Math.random()*3+2);
			let newR=(Math.pow(parseFloat(r), n)).toFixed(2);
			let newTheta=(theta*n) % 360;
			questionArea.innerHTML=`Compute \\((${r}(\\cos ${theta}^{\\circ}+i\\sin ${theta}^{\\circ}))^{${n}}\\) using De Moivre"s Theorem. Answer with degrees (no need to add deg).`;
			let correctLaTeX=`${newR} \\operatorname{cis} ${newTheta}^{\\circ}`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `${newR} cis ${newTheta}`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as \"r cis θ\" e.g., \"8 cis 120\" or expanded form";
			break;
		}
		case "add":{
			let v1=generateNonZeroVector();
			let v2=generateNonZeroVector();
			let sumX=(v1.x+v2.x).toFixed(2);
			let sumY=(v1.y+v2.y).toFixed(2);
			questionArea.innerHTML=`Find the sum of the vectors \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\) and \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
			let correctLaTeX=`\\langle ${sumX}, ${sumY} \\rangle`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `<${sumX}, ${sumY}>`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as <x, y> or (x, y)";
			break;
		}
		case "subtract":{
			let v1=generateNonZeroVector();
			let v2=generateNonZeroVector();
			let diffX=(v1.x-v2.x).toFixed(2);
			let diffY=(v1.y-v2.y).toFixed(2);
			questionArea.innerHTML=`Subtract \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\) from \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\).`;
			let correctLaTeX=`\\langle ${diffX}, ${diffY} \\rangle`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `<${diffX}, ${diffY}>`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as <x, y> or (x, y)";
			break;
		}
		case "parametric_to_cartesian":{
			let x0=(Math.random()*range*2-range).toFixed(1);
			let y0=(Math.random()*range*2-range).toFixed(1);
			let dir=generateNonZeroXVector();
			let slope=(dir.y/dir.x).toFixed(2);
			questionArea.innerHTML=`The line is given by the parametric equations \\(x=${x0}+${dir.x.toFixed(1)}t\\) and \\(y=${y0}+${dir.y.toFixed(1)}t\\). Convert these into a single Cartesian equation.`;
			let yIntercept=(parseFloat(y0)-parseFloat(slope)*parseFloat(x0)).toFixed(2);
			let correctLaTeX=`y=${slope}x+${yIntercept}`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `y=${slope}x+${yIntercept}`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as \"y=mx+b\"";
			break;
		}
		default:
			questionArea.innerHTML="Unknown question type.";
	}
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}