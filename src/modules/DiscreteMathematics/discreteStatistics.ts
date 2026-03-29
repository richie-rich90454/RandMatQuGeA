/**
 * Statistics questions generator with MCQ distractors
 * @fileoverview Generates statistical questions (mean, median, mode, range, stem-and-leaf, box plot, standard deviation). Displays question in questionArea and sets window.correctAnswer with correct value, alternate representation, display format, and plausible wrong answers for MCQ mode.
 * @date 2026-03-29
 */
import {questionArea} from "../../script.js";
import {getDataRange, mean, median, mode, range, stdDev} from "./discreteUtils.js";
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
	let hint="", questionText="", answer="", choices: string[]=[];
	switch (type){
		case "mean":{
			let m=mean(data).toFixed(2);
			questionText=`Find the mean of the data set: ${data.join(", ")}.`;
			answer=m;
			hint="Enter a decimal number";
			let correctNum=parseFloat(m);
			choices=[m];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			let sum=data.reduce((a,b)=>a+b,0);
			let wrongMean=(sum/(data.length+1)).toFixed(2);
			choices.push(wrongMean);
			choices.push((correctNum*0.5).toFixed(2));
			break;
		}
		case "median":{
			let med=median(data).toFixed(2);
			questionText=`Find the median of the data set: ${data.join(", ")}.`;
			answer=med;
			hint="Enter a decimal number";
			let correctNum=parseFloat(med);
			choices=[med];
			choices.push((correctNum+1).toFixed(2));
			choices.push((correctNum-1).toFixed(2));
			let sorted=[...data].sort((a,b)=>a-b);
			let wrongMedian=sorted[Math.floor(sorted.length/2)-1];
			choices.push(wrongMedian.toFixed(2));
			choices.push(mean(data).toFixed(2));
			break;
		}
		case "mode":{
			let modes=mode(data);
			if (modes.length===data.length){
				answer="no mode";
				choices=["no mode","none","0","all"];
			}
			else{
				answer=modes.join(", ");
				choices=[answer];
				let wrongModes=[];
				if (modes.length===1){
					wrongModes.push((modes[0]+1).toString());
					wrongModes.push((modes[0]-1).toString());
					wrongModes.push(median(data).toFixed(2));
				}
				else{
					wrongModes.push(modes[0].toString());
					wrongModes.push(mean(data).toFixed(2));
				}
				choices.push(...wrongModes);
			}
			questionText=`Find the mode(s) of the data set: ${data.join(", ")}.`;
			hint="Enter numbers separated by commas, or 'no mode'";
			break;
		}
		case "range":{
			let r=range(data).toString();
			questionText=`Find the range of the data set: ${data.join(", ")}.`;
			answer=r;
			hint="Enter a number";
			let correctNum=parseInt(r);
			choices=[r];
			choices.push((correctNum+1).toString());
			choices.push((correctNum-1).toString());
			let wrongRange=(Math.max(...data)-Math.min(...data)+1).toString();
			choices.push(wrongRange);
			choices.push((correctNum*2).toString());
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
			let wrongPlot="";
			let wrongStems={...stems};
			let stemsList=Object.keys(wrongStems).sort((a,b)=>parseInt(a)-parseInt(b));
			if (stemsList.length>0){
				let firstStem=parseInt(stemsList[0]);
				wrongStems[firstStem]=[...stems[firstStem], stems[firstStem][0]];
				wrongPlot="Stem | Leaf\n";
				Object.keys(wrongStems).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(stem=>{
					wrongPlot+=`${stem} | ${wrongStems[parseInt(stem)].join(" ")}\n`;
				});
			}
			choices=[stemLeafStr, wrongPlot];
			choices.push("Incorrect plot");
			choices.push("No plot");
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
			choices=[answer];
			let wrongMin=min+1;
			let wrongQ1=q1+1;
			let wrongQ2=q2+1;
			let wrongQ3=q3+1;
			let wrongMax=max-1;
			choices.push(`min=${wrongMin}, Q1=${wrongQ1}, median=${wrongQ2}, Q3=${wrongQ3}, max=${wrongMax}`);
			choices.push(`min=${min}, Q1=${q1-1}, median=${q2-1}, Q3=${q3-1}, max=${max-1}`);
			choices.push(`min=${min}, Q1=${q1}, median=${q2}, Q3=${q3}, max=${max+1}`);
			break;
		}
		case "standard_deviation":{
			let sd=stdDev(data).toFixed(2);
			questionText=`Find the population standard deviation of the data set: ${data.join(", ")}.`;
			answer=sd;
			hint="Enter a decimal number";
			let correctNum=parseFloat(sd);
			choices=[sd];
			choices.push((correctNum+0.5).toFixed(2));
			choices.push((correctNum-0.5).toFixed(2));
			let wrongVar=Math.sqrt(data.reduce((a,b)=>a+Math.pow(b-mean(data),2),0)/(data.length-1));
			choices.push(wrongVar.toFixed(2));
			choices.push(mean(data).toFixed(2));
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(answer)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=answer;
		else uniqueChoices=[answer];
	}
	window.correctAnswer={
		correct: answer,
		alternate: answer,
		display: answer,
		choices: uniqueChoices
	};
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