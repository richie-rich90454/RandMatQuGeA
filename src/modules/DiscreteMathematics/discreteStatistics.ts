/**
 * Statistics questions generator
 * @fileoverview Generates statistical questions (mean, median, mode, range, stem-and-leaf, box plot, standard deviation). Displays question in questionArea and sets window.correctAnswer with correct value, alternate representation, and display format. Also sets window.expectedFormat as a hint.
 * @date 2026-03-15
 */
import {questionArea} from "../../script.js";
import {getDataRange, mean, median, mode, range, stdDev} from "./discreteUtils.js";
/**
 * Generates a random statistics question of the specified type.
 * @param difficulty - optional difficulty level influencing data range and count.
 */
export function generateStatistics(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["mean","median","mode","range","stem_leaf","box_plot","standard_deviation"];
	let type=types[Math.floor(Math.random()*types.length)];
	let dataRange=getDataRange(difficulty);
	let data: number[]=[];
	for (let i=0; i<dataRange.count; i++){
		data.push(Math.floor(Math.random()*(dataRange.max-dataRange.min+1))+dataRange.min);
	}
	let hint="", questionText="", answer="";
	switch (type){
		case "mean":{
			let m=mean(data).toFixed(2);
			questionText=`Find the mean of the data set: ${data.join(", ")}.`;
			answer=m;
			hint="Enter a decimal number";
			window.correctAnswer={ correct: answer, alternate: answer, display: m };
			break;
		}
		case "median":{
			let med=median(data).toFixed(2);
			questionText=`Find the median of the data set: ${data.join(", ")}.`;
			answer=med;
			hint="Enter a decimal number";
			window.correctAnswer={ correct: answer, alternate: answer, display: med };
			break;
		}
		case "mode":{
			let modes=mode(data);
			if (modes.length===data.length){
				answer="no mode";
			} else {
				answer=modes.join(", ");
			}
			questionText=`Find the mode(s) of the data set: ${data.join(", ")}.`;
			hint="Enter numbers separated by commas, or 'no mode'";
			window.correctAnswer={ correct: answer, alternate: answer, display: answer };
			break;
		}
		case "range":{
			let r=range(data).toString();
			questionText=`Find the range of the data set: ${data.join(", ")}.`;
			answer=r;
			hint="Enter a number";
			window.correctAnswer={ correct: answer, alternate: answer, display: r };
			break;
		}
		case "stem_leaf":{
			let sorted=[...data].sort((a,b)=>a-b);
			let stems: Record<number, number[]>={};
			sorted.forEach(v=>{
				let stem=Math.floor(v/10);
				let leaf=v%10;
				if (!stems[stem]) stems[stem]=[];
				stems[stem].push(leaf);
			});
			let stemLeafStr="Stem | Leaf\n";
			Object.keys(stems).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(stem=>{
				stemLeafStr+=`${stem} | ${stems[parseInt(stem)].join(" ")}\n`;
			});
			questionText=`Construct a stem-and-leaf plot for the data: ${data.join(", ")}. (Enter your plot as "Stem | Leaf" lines)`;
			answer=stemLeafStr;
			hint="Enter stem-and-leaf plot in text form";
			window.correctAnswer={ correct: answer, alternate: answer, display: answer };
			break;
		}
		case "box_plot":{
			let sorted=[...data].sort((a,b)=>a-b);
			let q1Index=Math.floor(sorted.length*0.25);
			let q2Index=Math.floor(sorted.length*0.5);
			let q3Index=Math.floor(sorted.length*0.75);
			let min=sorted[0];
			let max=sorted[sorted.length-1];
			let q1=sorted[q1Index];
			let q2=sorted[q2Index];
			let q3=sorted[q3Index];
			questionText=`Given the data set: ${data.join(", ")}, find the five-number summary (min, Q1, median, Q3, max).`;
			answer=`min=${min}, Q1=${q1}, median=${q2}, Q3=${q3}, max=${max}`;
			hint="Enter as min, Q1, median, Q3, max";
			window.correctAnswer={ correct: answer, alternate: answer, display: answer };
			break;
		}
		case "standard_deviation":{
			let sd=stdDev(data).toFixed(2);
			questionText=`Find the population standard deviation of the data set: ${data.join(", ")}.`;
			answer=sd;
			hint="Enter a decimal number";
			window.correctAnswer={ correct: answer, alternate: answer, display: sd };
			break;
		}
	}
	const container=document.createElement("div");
	container.style.display="flex";
	container.style.flexDirection="column";
	container.style.alignItems="center";
	questionArea.appendChild(container);
	const textDiv=document.createElement("div");
	textDiv.innerHTML=questionText;
	textDiv.style.marginBottom="10px";
	container.appendChild(textDiv);
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}