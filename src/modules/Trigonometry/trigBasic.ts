/**
 * Basic trigonometry: sine, cosine, tangent functions (evaluate, solve, amplitude, period, phase shift, law of sines/cosines, unit circle, identities).
 * @fileoverview Generates basic trig questions with MCQ distractors. Sets window.correctAnswer with LaTeX display, plain text alternate, and plausible wrong answers.
 * @date 2026-04-18
 */
import {questionArea} from "../../script.js";
export function generateSin(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["evaluate","solve","amplitude","period","phase_shift","law_sines","unit_circle","identity"];
	let type=types[Math.floor(Math.random()*types.length)];
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch(type){
		case "evaluate":{
			let radianAngles=[
				{value:0,label:"0"},
				{value:Math.PI/6,label:"\\frac{\\pi}{6}"},
				{value:Math.PI/4,label:"\\frac{\\pi}{4}"},
				{value:Math.PI/3,label:"\\frac{\\pi}{3}"},
				{value:Math.PI/2,label:"\\frac{\\pi}{2}"},
				{value:2*Math.PI/3,label:"\\frac{2\\pi}{3}"},
				{value:3*Math.PI/4,label:"\\frac{3\\pi}{4}"},
				{value:5*Math.PI/6,label:"\\frac{5\\pi}{6}"},
				{value:Math.PI,label:"\\pi"},
				{value:7*Math.PI/6,label:"\\frac{7\\pi}{6}"},
				{value:5*Math.PI/4,label:"\\frac{5\\pi}{4}"},
				{value:4*Math.PI/3,label:"\\frac{4\\pi}{3}"},
				{value:3*Math.PI/2,label:"\\frac{3\\pi}{2}"},
				{value:5*Math.PI/3,label:"\\frac{5\\pi}{3}"},
				{value:7*Math.PI/4,label:"\\frac{7\\pi}{4}"},
				{value:11*Math.PI/6,label:"\\frac{11\\pi}{6}"}
			];
			let obj=radianAngles[Math.floor(Math.random()*radianAngles.length)];
			let angleVal=obj.value;
			let value=Math.sin(angleVal).toFixed(2);
			correct=value;
			alternate=value;
			display=value;
			questionArea.innerHTML=`Evaluate \\( \\sin(${obj.label}) \\)`;
			choices=[correct];
			let wrong1=Math.sin(angleVal+0.1).toFixed(2);
			let wrong2=Math.sin(angleVal-0.1).toFixed(2);
			let wrong3=Math.cos(angleVal).toFixed(2);
			let wrong4=(-Math.sin(angleVal)).toFixed(2);
			choices.push(wrong1,wrong2,wrong3,wrong4);
			break;
		}
		case "solve":{
			let k=(Math.random()*2-1).toFixed(2);
			let solutions: string[]=[];
			let plainNumbers: string[]=[];
			let principal=Math.asin(parseFloat(k));
			let sol1=principal;
			let sol2=Math.PI-principal;
			[sol1,sol2].forEach(sol=>{
				if(sol>=0&&sol<2*Math.PI){
					solutions.push(sol.toFixed(2));
					plainNumbers.push(sol.toFixed(2));
				}
			});
			correct=solutions.join(", ");
			alternate=plainNumbers.join(", ");
			display=solutions.join(", ");
			questionArea.innerHTML=`Solve \\( \\sin\\theta=${k} \\) for \\( 0\\le\\theta<2\\pi \\) (in radians)`;
			choices=[correct];
			let wrongSol1Num=Math.asin(parseFloat(k))+0.2;
			let wrongSol2Num=Math.PI-wrongSol1Num;
			let wrongSol1=wrongSol1Num.toFixed(2);
			let wrongSol2=wrongSol2Num.toFixed(2);
			choices.push(`${wrongSol1}, ${wrongSol2}`);
			let wrongSol3Num=Math.asin(parseFloat(k))-0.2;
			let wrongSol4Num=Math.PI-wrongSol3Num;
			let wrongSol3=wrongSol3Num.toFixed(2);
			let wrongSol4=wrongSol4Num.toFixed(2);
			choices.push(`${wrongSol3}, ${wrongSol4}`);
			choices.push(`${(Math.asin(parseFloat(k))).toFixed(2)}`);
			choices.push(`${(Math.PI-Math.asin(parseFloat(k))).toFixed(2)}`);
			break;
		}
		case "amplitude":{
			let A=(Math.random()*4+1).toFixed(1);
			if(difficulty==="easy") A=(Math.random()*2+1).toFixed(1);
			if(difficulty==="hard") A=(Math.random()*6+1).toFixed(1);
			correct=A;
			alternate=A;
			display=A;
			questionArea.innerHTML=`Find the amplitude of \\( y=${A}\\sin(3x+\\pi/4) \\)`;
			choices=[correct];
			let aNum=parseFloat(A);
			choices.push((aNum+1).toFixed(1));
			choices.push((aNum-1).toFixed(1));
			choices.push((aNum*2).toFixed(1));
			choices.push((aNum/2).toFixed(1));
			break;
		}
		case "period":{
			let B=Math.floor(Math.random()*4+1);
			let period=2*Math.PI/B;
			correct=period.toFixed(2)+" rad";
			alternate=`2π/${B} rad`;
			display=period.toFixed(2)+" rad";
			questionArea.innerHTML=`What is the period of \\( y=\\sin(${B}x) \\)? (in radians)`;
			choices=[correct];
			choices.push((2*Math.PI/(B+1)).toFixed(2)+" rad");
			choices.push((2*Math.PI/(B-1)).toFixed(2)+" rad");
			choices.push((Math.PI/B).toFixed(2)+" rad");
			choices.push((2*Math.PI*B).toFixed(2)+" rad");
			break;
		}
		case "phase_shift":{
			let C=(Math.random()*Math.PI*2-Math.PI).toFixed(2);
			let cNum=parseFloat(C);
			let shiftMag=Math.abs(cNum).toFixed(2);
			let shiftDirection=(cNum>0)?"left":"right";
			let shiftText=(cNum===0)?"0":`${shiftMag} rad ${shiftDirection}`;
			correct=shiftText;
			alternate=(cNum===0)?"0":`-${cNum}`;
			display=shiftText;
			questionArea.innerHTML=`Identify the phase shift of \\( y=\\sin(x+${C}) \\) (in radians)`;
			choices=[correct];
			let wrongMag1=(parseFloat(shiftMag)+0.2).toFixed(2);
			let wrongMag2=(parseFloat(shiftMag)-0.2).toFixed(2);
			choices.push((cNum===0)?"0":`${wrongMag1} rad ${shiftDirection}`);
			choices.push((cNum===0)?"0":`${wrongMag2} rad ${shiftDirection}`);
			choices.push((cNum===0)?"0":`${shiftMag} rad ${shiftDirection==="left"?"right":"left"}`);
			choices.push((cNum===0)?"0":`${C}`);
			break;
		}
		case "law_sines":{
			let angleA=Math.floor(Math.random()*50+30);
			let angleB=Math.floor(Math.random()*50+30);
			let sideA=Math.floor(Math.random()*10+5);
			if(difficulty==="easy"){
				angleA=Math.floor(Math.random()*30+30);
				angleB=Math.floor(Math.random()*30+30);
				sideA=Math.floor(Math.random()*5+5);
			}
			let sideB=(sideA*Math.sin(angleB*Math.PI/180)/Math.sin(angleA*Math.PI/180)).toFixed(1);
			correct=sideB;
			alternate=sideB;
			display=sideB;
			questionArea.innerHTML=`Using the Law of Sines:<br>
				In triangle ABC, ∠A=${angleA}°, ∠B=${angleB}°, and side a=${sideA}.<br>
				Find side b.`;
			let bNum=parseFloat(sideB);
			choices=[correct];
			choices.push((bNum+0.5).toFixed(1));
			choices.push((bNum-0.5).toFixed(1));
			choices.push((sideA).toFixed(1));
			choices.push((sideA*Math.sin(angleB*Math.PI/180)).toFixed(1));
			break;
		}
		case "unit_circle":{
			let angles=[0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330];
			let angle=angles[Math.floor(Math.random()*angles.length)];
			let cosVal=Math.cos(angle*Math.PI/180).toFixed(2);
			let sinVal=Math.sin(angle*Math.PI/180).toFixed(2);
			correct=`(${cosVal}, ${sinVal})`;
			alternate=`(${cosVal}, ${sinVal})`;
			display=`(${cosVal}, ${sinVal})`;
			questionArea.innerHTML=`Find the coordinates on the unit circle for an angle of ${angle}° (format: (cos, sin))`;
			let cosNum=parseFloat(cosVal);
			let sinNum=parseFloat(sinVal);
			choices=[correct];
			choices.push(`(${(cosNum+0.1).toFixed(2)}, ${sinNum})`);
			choices.push(`(${cosNum}, ${(sinNum+0.1).toFixed(2)})`);
			choices.push(`(${(cosNum-0.1).toFixed(2)}, ${sinNum})`);
			choices.push(`(${cosNum}, ${(sinNum-0.1).toFixed(2)})`);
			break;
		}
		case "identity":{
			correct="1";
			alternate="one";
			display="1";
			questionArea.innerHTML=`Complete the identity: \\( \\sin^2\\theta+\\cos^2\\theta=\\; ? \\)`;
			choices=["1","0","-1","sin^2θ+cos^2θ"];
			break;
		}
		default:
			questionArea.innerHTML="Unknown sine question type";
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=window.expectedFormat||"";
	window.MathJax?.typeset();
}
export function generateCosine(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["evaluate","solve","amplitude","period","phase_shift","law_cosines","identity"];
	let type=types[Math.floor(Math.random()*types.length)];
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch(type){
		case "evaluate":{
			let radianAngles=[
				{value:0,label:"0"},
				{value:Math.PI/3,label:"\\frac{\\pi}{3}"},
				{value:Math.PI/2,label:"\\frac{\\pi}{2}"},
				{value:2*Math.PI/3,label:"\\frac{2\\pi}{3}"},
				{value:Math.PI,label:"\\pi"},
				{value:4*Math.PI/3,label:"\\frac{4\\pi}{3}"},
				{value:3*Math.PI/2,label:"\\frac{3\\pi}{2}"},
				{value:5*Math.PI/3,label:"\\frac{5\\pi}{3}"}
			];
			let obj=radianAngles[Math.floor(Math.random()*radianAngles.length)];
			let angleVal=obj.value;
			let value=Math.cos(angleVal).toFixed(2);
			correct=value;
			alternate=value;
			display=value;
			questionArea.innerHTML=`Evaluate \\( \\cos(${obj.label}) \\)`;
			choices=[correct];
			let wrong1=Math.cos(angleVal+0.1).toFixed(2);
			let wrong2=Math.cos(angleVal-0.1).toFixed(2);
			let wrong3=Math.sin(angleVal).toFixed(2);
			let wrong4=(-Math.cos(angleVal)).toFixed(2);
			choices.push(wrong1,wrong2,wrong3,wrong4);
			break;
		}
		case "solve":{
			let k=(Math.random()*2-1).toFixed(2);
			let solutions: string[]=[];
			let plainNumbers: string[]=[];
			let principal=Math.acos(parseFloat(k));
			let sol1=principal;
			let sol2=2*Math.PI-principal;
			[sol1,sol2].forEach(sol=>{
				if(sol>=0&&sol<2*Math.PI){
					solutions.push(sol.toFixed(2));
					plainNumbers.push(sol.toFixed(2));
				}
			});
			correct=solutions.join(", ");
			alternate=plainNumbers.join(", ");
			display=solutions.join(", ");
			questionArea.innerHTML=`Solve \\( \\cos\\theta=${k} \\) for \\( 0\\le\\theta<2\\pi \\) (in radians)`;
			choices=[correct];
			let wrongSol1Num=Math.acos(parseFloat(k))+0.2;
			let wrongSol2Num=2*Math.PI-wrongSol1Num;
			let wrongSol1=wrongSol1Num.toFixed(2);
			let wrongSol2=wrongSol2Num.toFixed(2);
			choices.push(`${wrongSol1}, ${wrongSol2}`);
			let wrongSol3Num=Math.acos(parseFloat(k))-0.2;
			let wrongSol4Num=2*Math.PI-wrongSol3Num;
			let wrongSol3=wrongSol3Num.toFixed(2);
			let wrongSol4=wrongSol4Num.toFixed(2);
			choices.push(`${wrongSol3}, ${wrongSol4}`);
			choices.push(`${(Math.acos(parseFloat(k))).toFixed(2)}`);
			choices.push(`${(2*Math.PI-Math.acos(parseFloat(k))).toFixed(2)}`);
			break;
		}
		case "amplitude":{
			let A=(Math.random()*4+1).toFixed(1);
			if(difficulty==="easy") A=(Math.random()*2+1).toFixed(1);
			if(difficulty==="hard") A=(Math.random()*6+1).toFixed(1);
			correct=A;
			alternate=A;
			display=A;
			questionArea.innerHTML=`Find the amplitude of \\( y=${A}\\cos(2x-\\pi/3) \\)`;
			choices=[correct];
			let aNum=parseFloat(A);
			choices.push((aNum+1).toFixed(1));
			choices.push((aNum-1).toFixed(1));
			choices.push((aNum*2).toFixed(1));
			choices.push((aNum/2).toFixed(1));
			break;
		}
		case "period":{
			let B=Math.floor(Math.random()*4+1);
			let period=2*Math.PI/B;
			correct=period.toFixed(2)+" rad";
			alternate=`2π/${B} rad`;
			display=period.toFixed(2)+" rad";
			questionArea.innerHTML=`What is the period of \\( y=\\cos(${B}x) \\)? (in radians)`;
			choices=[correct];
			choices.push((2*Math.PI/(B+1)).toFixed(2)+" rad");
			choices.push((2*Math.PI/(B-1)).toFixed(2)+" rad");
			choices.push((Math.PI/B).toFixed(2)+" rad");
			choices.push((2*Math.PI*B).toFixed(2)+" rad");
			break;
		}
		case "phase_shift":{
			let C=(Math.random()*Math.PI*2-Math.PI).toFixed(2);
			let cNum=parseFloat(C);
			let shiftMag=Math.abs(cNum).toFixed(2);
			let shiftDirection=(cNum>0)?"left":"right";
			let shiftText=(cNum===0)?"0":`${shiftMag} rad ${shiftDirection}`;
			correct=shiftText;
			alternate=(cNum===0)?"0":`-${cNum}`;
			display=shiftText;
			questionArea.innerHTML=`Identify the phase shift of \\( y=\\cos(x+${C}) \\) (in radians)`;
			choices=[correct];
			let wrongMag1=(parseFloat(shiftMag)+0.2).toFixed(2);
			let wrongMag2=(parseFloat(shiftMag)-0.2).toFixed(2);
			choices.push((cNum===0)?"0":`${wrongMag1} rad ${shiftDirection}`);
			choices.push((cNum===0)?"0":`${wrongMag2} rad ${shiftDirection}`);
			choices.push((cNum===0)?"0":`${shiftMag} rad ${shiftDirection==="left"?"right":"left"}`);
			choices.push((cNum===0)?"0":`${C}`);
			break;
		}
		case "law_cosines":{
			let a=Math.floor(Math.random()*10+5);
			let b=Math.floor(Math.random()*10+5);
			let angleC=Math.floor(Math.random()*50+30);
			if(difficulty==="easy"){
				a=Math.floor(Math.random()*5+5);
				b=Math.floor(Math.random()*5+5);
				angleC=Math.floor(Math.random()*30+30);
			}
			let c=Math.sqrt(a*a+b*b-2*a*b*Math.cos(angleC*Math.PI/180)).toFixed(1);
			correct=c;
			alternate=c;
			display=c;
			questionArea.innerHTML=`Using the Law of Cosines:<br>
				In triangle ABC, sides a=${a}, b=${b}, and ∠C=${angleC}°.<br>
				Find side c.`;
			let cNum=parseFloat(c);
			choices=[correct];
			choices.push((cNum+0.5).toFixed(1));
			choices.push((cNum-0.5).toFixed(1));
			choices.push(Math.sqrt(a*a+b*b).toFixed(1));
			choices.push(Math.sqrt(a*a+b*b-2*a*b).toFixed(1));
			break;
		}
		case "identity":{
			correct="1";
			alternate="one";
			display="1";
			questionArea.innerHTML=`Complete the identity: \\( \\cos^2\\theta+\\sin^2\\theta=\\; ? \\)`;
			choices=["1","0","-1","cos^2θ+sin^2θ"];
			break;
		}
		default:
			questionArea.innerHTML="Unknown cosine question type";
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=window.expectedFormat||"";
	window.MathJax?.typeset();
}
export function generateTangent(_difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["evaluate","solve","period","asymptote","identity"];
	let type=types[Math.floor(Math.random()*types.length)];
	let correct="";
	let alternate="";
	let display="";
	let choices:string[]=[];
	switch(type){
		case "evaluate":{
			let angles=[0,Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4];
			let labels=["0","\\frac{\\pi}{4}","\\frac{3\\pi}{4}","\\frac{5\\pi}{4}","\\frac{7\\pi}{4}"];
			let idx=Math.floor(Math.random()*angles.length);
			let angle=angles[idx];
			let value=Math.tan(angle).toFixed(2);
			correct=value;
			alternate=value;
			display=value;
			questionArea.innerHTML=`Evaluate \\( \\tan(${labels[idx]}) \\)`;
			choices=[correct];
			let wrong1=Math.tan(angle+0.1).toFixed(2);
			let wrong2=Math.tan(angle-0.1).toFixed(2);
			let wrong3=Math.sin(angle).toFixed(2);
			let wrong4=Math.cos(angle).toFixed(2);
			choices.push(wrong1,wrong2,wrong3,wrong4);
			break;
		}
		case "solve":{
			let k=(Math.random()*10-5).toFixed(2);
			let principal=Math.atan(parseFloat(k));
			correct=`${principal.toFixed(2)}+\\pi n`;
			alternate=`${principal.toFixed(2)}+πn`;
			display=`${principal.toFixed(2)}+\\pi n`;
			questionArea.innerHTML=`Solve \\( \\tan\\theta=${k} \\) (in radians, give the principal solution)`;
			choices=[correct];
			let wrongPrincipal=Math.atan(parseFloat(k)+0.5);
			choices.push(`${wrongPrincipal.toFixed(2)}+πn`);
			wrongPrincipal=Math.atan(parseFloat(k)-0.5);
			choices.push(`${wrongPrincipal.toFixed(2)}+πn`);
			choices.push(`${(Math.atan(parseFloat(k))+0.2).toFixed(2)}+πn`);
			choices.push(`${(Math.atan(parseFloat(k))-0.2).toFixed(2)}+πn`);
			break;
		}
		case "period":{
			let B=Math.floor(Math.random()*3+1);
			let period=Math.PI/B;
			correct=period.toFixed(2)+" rad";
			alternate=`π/${B} rad`;
			display=period.toFixed(2)+" rad";
			questionArea.innerHTML=`What is the period of \\( y=\\tan(${B}x) \\)? (in radians)`;
			choices=[correct];
			choices.push((Math.PI/(B+1)).toFixed(2)+" rad");
			choices.push((Math.PI/(B-1)).toFixed(2)+" rad");
			choices.push((2*Math.PI/B).toFixed(2)+" rad");
			choices.push((Math.PI*B).toFixed(2)+" rad");
			break;
		}
		case "asymptote":{
			let B=Math.floor(Math.random()*2+1);
			correct=`x = \\frac{\\pi}{2\\cdot${B}} + \\frac{\\pi k}{${B}}`;
			alternate=`x=π/(2*${B}) + πk/${B}`;
			display=`x = \\frac{\\pi}{2\\cdot${B}} + \\frac{\\pi k}{${B}}`;
			questionArea.innerHTML=`Find the vertical asymptotes of \\( y=\\tan(${B}x) \\) (in radians).`;
			choices=[correct];
			choices.push(`x = \\frac{\\pi}{${B}} + \\frac{\\pi k}{${B}}`);
			choices.push(`x = \\frac{\\pi}{4\\cdot${B}} + \\frac{\\pi k}{${B}}`);
			choices.push(`x = \\frac{\\pi}{2\\cdot${B+1}} + \\frac{\\pi k}{${B}}`);
			choices.push(`x = \\frac{\\pi}{2\\cdot${B}} + \\frac{\\pi k}{${B+1}}`);
			break;
		}
		case "identity":{
			correct="\\sec^2\\theta";
			alternate="sec^2θ";
			display="\\sec^2\\theta";
			questionArea.innerHTML=`Complete the identity: \\( 1+\\tan^2\\theta=\\; ? \\)`;
			choices=["\\sec^2\\theta","\\csc^2\\theta","1","\\tan^2\\theta"];
			break;
		}
		default:
			questionArea.innerHTML="Unknown tangent question type";
			return;
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=window.expectedFormat||"";
	window.MathJax?.typeset();
}