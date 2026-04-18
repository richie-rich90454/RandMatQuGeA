/**
 * Linear algebra advanced topics: 3x3 systems, row echelon, partial fractions, linear programming, 3D vectors, lines, planes.
 * @fileoverview Generates advanced linear algebra questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../script.js";
import {getRange} from "./linearAlgebraUtils.js";

function generate3x3Matrix(range: number): number[][]{
	let mat: number[][]=[];
	for(let i=0;i<3;i++){
		let row: number[]=[];
		for(let j=0;j<3;j++){
			row.push(+(Math.random()*range*2-range).toFixed(2));
		}
		mat.push(row);
	}
	return mat;
}

function generateRandomVector3D(range: number): { x: number; y: number; z: number }{
	let x: number, y: number, z: number;
	do{
		x=Math.random()*range*2-range;
		y=Math.random()*range*2-range;
		z=Math.random()*range*2-range;
	}while(Math.abs(x)<0.01&&Math.abs(y)<0.01&&Math.abs(z)<0.01);
	return{ x, y, z };
}

export function generateSystem3x3(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const range=getRange(difficulty)*2;
	let x=Math.floor(Math.random()*range)+1;
	let y=Math.floor(Math.random()*range)+1;
	let z=Math.floor(Math.random()*range)+1;
	let A=generate3x3Matrix(range);
	let b: number[]=[];
	for(let i=0;i<3;i++){
		let sum=A[i][0]*x+A[i][1]*y+A[i][2]*z;
		b.push(+(sum).toFixed(2));
	}
	let mathExpression=`Solve the system using Gaussian elimination:<br>
        \\( \\begin{cases}
        ${A[0][0].toFixed(2)}x + ${A[0][1].toFixed(2)}y + ${A[0][2].toFixed(2)}z = ${b[0]} \\\\
        ${A[1][0].toFixed(2)}x + ${A[1][1].toFixed(2)}y + ${A[1][2].toFixed(2)}z = ${b[1]} \\\\
        ${A[2][0].toFixed(2)}x + ${A[2][1].toFixed(2)}y + ${A[2][2].toFixed(2)}z = ${b[2]}
        \\end{cases} \\)`;
	let correctLaTeX=`x=${x}, y=${y}, z=${z}`;
	let choices=[correctLaTeX];
	choices.push(`x=${x+1}, y=${y}, z=${z}`);
	choices.push(`x=${x}, y=${y+1}, z=${z}`);
	choices.push(`x=${x}, y=${y}, z=${z+1}`);
	choices.push(`x=${x-1}, y=${y}, z=${z}`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correctLaTeX)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctLaTeX;
		else uniqueChoices=[correctLaTeX];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctLaTeX,
		alternate: `x=${x}, y=${y}, z=${z}`,
		display: correctLaTeX,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as x=..., y=..., z=... or (x,y,z)";
}

export function generateRowEchelon3x3(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const range=getRange(difficulty);
	let A=generate3x3Matrix(range);
	if(Math.abs(A[0][0])<0.1) A[0][0]=1;
	let factor1=A[1][0]/A[0][0];
	let factor2=A[2][0]/A[0][0];
	let result=[
		[A[0][0],A[0][1],A[0][2]],
		[0,+(A[1][1]-factor1*A[0][1]).toFixed(2),+(A[1][2]-factor1*A[0][2]).toFixed(2)],
		[0,+(A[2][1]-factor2*A[0][1]).toFixed(2),+(A[2][2]-factor2*A[0][2]).toFixed(2)]
	];
	let mathExpression=`Find the row echelon form of the matrix:<br>
        \\( \\begin{bmatrix}
        ${A[0][0].toFixed(2)} & ${A[0][1].toFixed(2)} & ${A[0][2].toFixed(2)} \\\\
        ${A[1][0].toFixed(2)} & ${A[1][1].toFixed(2)} & ${A[1][2].toFixed(2)} \\\\
        ${A[2][0].toFixed(2)} & ${A[2][1].toFixed(2)} & ${A[2][2].toFixed(2)}
        \\end{bmatrix} \\)`;
	let correctLaTeX=`\\begin{bmatrix} ${result[0][0].toFixed(2)} & ${result[0][1].toFixed(2)} & ${result[0][2].toFixed(2)} \\\\ ${result[1][0].toFixed(2)} & ${result[1][1].toFixed(2)} & ${result[1][2].toFixed(2)} \\\\ ${result[2][0].toFixed(2)} & ${result[2][1].toFixed(2)} & ${result[2][2].toFixed(2)} \\end{bmatrix}`;
	let alternateStr=`[${result[0][0].toFixed(2)},${result[0][1].toFixed(2)},${result[0][2].toFixed(2)};${result[1][0].toFixed(2)},${result[1][1].toFixed(2)},${result[1][2].toFixed(2)};${result[2][0].toFixed(2)},${result[2][1].toFixed(2)},${result[2][2].toFixed(2)}]`;
	let choices=[correctLaTeX];
	let wrongRow1=result.map(r=>[r[0],r[1]+1,r[2]]);
	let wrongLaTeX1=`\\begin{bmatrix} ${wrongRow1[0][0].toFixed(2)} & ${wrongRow1[0][1].toFixed(2)} & ${wrongRow1[0][2].toFixed(2)} \\\\ ${wrongRow1[1][0].toFixed(2)} & ${wrongRow1[1][1].toFixed(2)} & ${wrongRow1[1][2].toFixed(2)} \\\\ ${wrongRow1[2][0].toFixed(2)} & ${wrongRow1[2][1].toFixed(2)} & ${wrongRow1[2][2].toFixed(2)} \\end{bmatrix}`;
	choices.push(wrongLaTeX1);
	let wrongRow2=result.map(r=>[r[0],r[1],r[2]+1]);
	let wrongLaTeX2=`\\begin{bmatrix} ${wrongRow2[0][0].toFixed(2)} & ${wrongRow2[0][1].toFixed(2)} & ${wrongRow2[0][2].toFixed(2)} \\\\ ${wrongRow2[1][0].toFixed(2)} & ${wrongRow2[1][1].toFixed(2)} & ${wrongRow2[1][2].toFixed(2)} \\\\ ${wrongRow2[2][0].toFixed(2)} & ${wrongRow2[2][1].toFixed(2)} & ${wrongRow2[2][2].toFixed(2)} \\end{bmatrix}`;
	choices.push(wrongLaTeX2);
	let wrongRow3=result.map(r=>[r[0],r[1],r[2]]);
	wrongRow3[1]=[0,0,0];
	let wrongLaTeX3=`\\begin{bmatrix} ${wrongRow3[0][0].toFixed(2)} & ${wrongRow3[0][1].toFixed(2)} & ${wrongRow3[0][2].toFixed(2)} \\\\ ${wrongRow3[1][0].toFixed(2)} & ${wrongRow3[1][1].toFixed(2)} & ${wrongRow3[1][2].toFixed(2)} \\\\ ${wrongRow3[2][0].toFixed(2)} & ${wrongRow3[2][1].toFixed(2)} & ${wrongRow3[2][2].toFixed(2)} \\end{bmatrix}`;
	choices.push(wrongLaTeX3);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correctLaTeX)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctLaTeX;
		else uniqueChoices=[correctLaTeX];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctLaTeX,
		alternate: alternateStr,
		display: correctLaTeX,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as [a,b,c;d,e,f;g,h,i]";
}

export function generatePartialFractions(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const types=["distinct","repeated","quadratic"];
	let type: string;
	if(difficulty==="easy") type="distinct";
	else if(difficulty==="hard") type=types[Math.floor(Math.random()*types.length)];
	else type=types[Math.floor(Math.random()*2)];
	let numerator=Math.floor(Math.random()*5)+1;
	let a=Math.floor(Math.random()*3)+1;
	let b=Math.floor(Math.random()*3)+1;
	if(type==="distinct"){
		while(b===a){
			b=Math.floor(Math.random()*3)+1;
		}
	}
	let c=Math.floor(Math.random()*3)+1;
	let question="";
	let answer="";
	let alternate="";
	let choices: string[]=[];
	if(type==="distinct"){
		question=`Decompose into partial fractions: \\( \\frac{${numerator}}{(x+${a})(x+${b})} \\)`;
		let A=numerator/(b-a);
		let B=-numerator/(b-a);
		answer=`\\frac{${A.toFixed(2)}}{x+${a}} + \\frac{${B.toFixed(2)}}{x+${b}}`;
		alternate=`${A.toFixed(2)}/(x+${a}) + ${B.toFixed(2)}/(x+${b})`;
		choices=[answer];
		choices.push(`\\frac{${(A+1).toFixed(2)}}{x+${a}} + \\frac{${(B-1).toFixed(2)}}{x+${b}}`);
		choices.push(`\\frac{${A.toFixed(2)}}{x+${a}} + \\frac{${(B+1).toFixed(2)}}{x+${b}}`);
		choices.push(`\\frac{${numerator}}{x+${a}} + \\frac{0}{x+${b}}`);
		choices.push(`\\frac{${A.toFixed(2)}}{x+${b}} + \\frac{${B.toFixed(2)}}{x+${a}}`);
	}
	else if(type==="repeated"){
		question=`Decompose into partial fractions: \\( \\frac{${numerator}}{(x+${a})^2} \\)`;
		answer=`\\frac{${numerator}}{(x+${a})^2}`;
		alternate=`${numerator}/(x+${a})^2`;
		choices=[answer];
		choices.push(`\\frac{${numerator}}{x+${a}} + \\frac{0}{(x+${a})^2}`);
		choices.push(`\\frac{${numerator+1}}{(x+${a})^2}`);
		choices.push(`\\frac{${numerator}}{(x+${a})} + \\frac{0}{(x+${a})^2}`);
		choices.push(`\\frac{${numerator}}{(x+${a})^2} + \\frac{1}{x+${a}}`);
	}
	else{
		question=`Decompose into partial fractions: \\( \\frac{${numerator}x + ${a}}{x^2 + ${b}x + ${c}} \\) (assume irreducible)`;
		answer=`\\frac{${numerator}x + ${a}}{x^2 + ${b}x + ${c}}`;
		alternate=`(${numerator}x+${a})/(x^2+${b}x+${c})`;
		choices=[answer];
		choices.push(`\\frac{${numerator}}{x+${b}} + \\frac{${a}}{x+${c}}`);
		choices.push(`\\frac{${numerator+1}x + ${a}}{x^2 + ${b}x + ${c}}`);
		choices.push(`\\frac{${numerator}x + ${a+1}}{x^2 + ${b}x + ${c}}`);
		choices.push(`\\frac{${numerator}}{x^2 + ${b}x + ${c}}`);
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(answer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=answer;
		else uniqueChoices=[answer];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=question;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={ correct: answer, alternate: alternate, display: answer, choices: uniqueChoices };
	window.expectedFormat="Enter the partial fractions expression";
}

export function generateLinearProgramming(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const range=getRange(difficulty);
	let a1=Math.floor(Math.random()*3)+1;
	let b1=Math.floor(Math.random()*3)+1;
	let c1=Math.floor(Math.random()*range*2)+range;
	let a2=Math.floor(Math.random()*3)+1;
	let b2=Math.floor(Math.random()*3)+1;
	let c2=Math.floor(Math.random()*range*2)+range;
	let p=Math.floor(Math.random()*3)+1;
	let q=Math.floor(Math.random()*3)+1;
	let opt=Math.random()<0.5?"maximize":"minimize";
	let corners: { x: number; y: number }[]=[];
	let det=a1*b2-a2*b1;
	if(Math.abs(det)>0.001){
		let x1=(c1*b2-c2*b1)/det;
		let y1=(a1*c2-a2*c1)/det;
		if(x1>=0&&y1>=0) corners.push({ x: x1, y: y1 });
	}
	if(a1!==0){
		let x=c1/a1;
		if(x>=0) corners.push({ x: x, y: 0 });
	}
	if(b1!==0){
		let y=c1/b1;
		if(y>=0) corners.push({ x: 0, y: y });
	}
	if(a2!==0){
		let x=c2/a2;
		if(x>=0) corners.push({ x: x, y: 0 });
	}
	if(b2!==0){
		let y=c2/b2;
		if(y>=0) corners.push({ x: 0, y: y });
	}
	corners.push({ x: 0, y: 0 });
	let uniqueCorners: { x: number; y: number }[]=[];
	for(let pt of corners){
		if(!uniqueCorners.some(p=>Math.abs(p.x-pt.x)<0.01&&Math.abs(p.y-pt.y)<0.01)){
			uniqueCorners.push(pt);
		}
	}
	let bestVal=opt==="maximize"?-Infinity:Infinity;
	let bestPoint: { x: number; y: number }|null=null;
	for(let pt of uniqueCorners){
		if(a1*pt.x+b1*pt.y<=c1+0.001&&a2*pt.x+b2*pt.y<=c2+0.001&&pt.x>=-0.001&&pt.y>=-0.001){
			let val=p*pt.x+q*pt.y;
			if(opt==="maximize"&&val>bestVal){
				bestVal=val;
				bestPoint=pt;
			}
			else if(opt==="minimize"&&val<bestVal){
				bestVal=val;
				bestPoint=pt;
			}
		}
	}
	let mathExpression=`Consider the linear programming problem:<br>
        ${opt} \\( z = ${p}x + ${q}y \\) subject to:<br>
        \\( ${a1}x + ${b1}y \\le ${c1} \\)<br>
        \\( ${a2}x + ${b2}y \\le ${c2} \\)<br>
        \\( x \\ge 0, y \\ge 0 \\)<br>
        Find the optimal value and the point where it occurs.`;
	let answer=bestPoint?`z = ${bestVal.toFixed(2)} at (${bestPoint.x.toFixed(2)}, ${bestPoint.y.toFixed(2)})`:"No feasible region";
	let choices=[answer];
	if(bestPoint){
		choices.push(`z = ${(bestVal+1).toFixed(2)} at (${bestPoint.x.toFixed(2)}, ${bestPoint.y.toFixed(2)})`);
		choices.push(`z = ${(bestVal-1).toFixed(2)} at (${bestPoint.x.toFixed(2)}, ${bestPoint.y.toFixed(2)})`);
		choices.push(`z = ${bestVal.toFixed(2)} at (${(bestPoint.x+1).toFixed(2)}, ${bestPoint.y.toFixed(2)})`);
		choices.push(`z = ${bestVal.toFixed(2)} at (${bestPoint.x.toFixed(2)}, ${(bestPoint.y+1).toFixed(2)})`);
	}
	else{
		choices.push("z = 0 at (0,0)");
		choices.push("No feasible region");
		choices.push("Unbounded");
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(answer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=answer;
		else uniqueChoices=[answer];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={ correct: answer, alternate: answer, display: answer, choices: uniqueChoices };
	window.expectedFormat="Enter as 'z = value at (x,y)'";
}

export function generateVector3D(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const range=getRange(difficulty)*2;
	const v=generateRandomVector3D(range);
	const types=["magnitude","unit","dot","angle","projection"];
	const type=types[Math.floor(Math.random()*types.length)];
	let question="";
	let answer="";
	let alternate="";
	let hint="";
	let choices: string[]=[];
	if(type==="magnitude"){
		let mag=Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z).toFixed(2);
		question=`Find the magnitude of \\( \\langle ${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)} \\rangle \\).`;
		answer=mag;
		alternate=mag;
		hint="Enter a number (e.g., 5.83)";
		let magNum=parseFloat(mag);
		choices=[mag];
		choices.push((magNum+0.5).toFixed(2));
		choices.push((magNum-0.5).toFixed(2));
		choices.push((Math.abs(v.x)+Math.abs(v.y)+Math.abs(v.z)).toFixed(2));
		choices.push((Math.sqrt(v.x*v.x+v.y*v.y)).toFixed(2));
	}
	else if(type==="unit"){
		let mag=Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
		let ux=(v.x/mag).toFixed(2);
		let uy=(v.y/mag).toFixed(2);
		let uz=(v.z/mag).toFixed(2);
		question=`Find the unit vector in the direction of \\( \\langle ${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)} \\rangle \\).`;
		answer=`\\langle ${ux}, ${uy}, ${uz} \\rangle`;
		alternate=`<${ux}, ${uy}, ${uz}>`;
		hint="Enter as <x, y, z>";
		choices=[answer];
		choices.push(`\\langle ${(v.x/(mag+0.5)).toFixed(2)}, ${(v.y/(mag+0.5)).toFixed(2)}, ${(v.z/(mag+0.5)).toFixed(2)} \\rangle`);
		choices.push(`\\langle ${(v.x/mag+0.1).toFixed(2)}, ${(v.y/mag).toFixed(2)}, ${(v.z/mag).toFixed(2)} \\rangle`);
		choices.push(`\\langle ${(v.x/mag).toFixed(2)}, ${(v.y/mag+0.1).toFixed(2)}, ${(v.z/mag).toFixed(2)} \\rangle`);
		choices.push(`\\langle ${(v.x/mag).toFixed(2)}, ${(v.y/mag).toFixed(2)}, ${(v.z/mag+0.1).toFixed(2)} \\rangle`);
	}
	else if(type==="dot"){
		const w=generateRandomVector3D(range);
		let dot=(v.x*w.x+v.y*w.y+v.z*w.z).toFixed(2);
		question=`Calculate the dot product of \\( \\langle ${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)} \\rangle \\) and \\( \\langle ${w.x.toFixed(2)}, ${w.y.toFixed(2)}, ${w.z.toFixed(2)} \\rangle \\).`;
		answer=dot;
		alternate=dot;
		hint="Enter a number";
		let dotNum=parseFloat(dot);
		choices=[dot];
		choices.push((dotNum+1).toFixed(2));
		choices.push((dotNum-1).toFixed(2));
		choices.push((v.x*w.x+v.y*w.y).toFixed(2));
		choices.push((v.x*w.x).toFixed(2));
	}
	else if(type==="angle"){
		const w=generateRandomVector3D(range);
		let dot=v.x*w.x+v.y*w.y+v.z*w.z;
		let magV=Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
		let magW=Math.sqrt(w.x*w.x+w.y*w.y+w.z*w.z);
		let cosTheta=dot/(magV*magW);
		if(cosTheta>1) cosTheta=1;
		if(cosTheta<-1) cosTheta=-1;
		let angle=(Math.acos(cosTheta)*180/Math.PI).toFixed(1);
		question=`Find the angle (in degrees) between \\( \\langle ${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)} \\rangle \\) and \\( \\langle ${w.x.toFixed(2)}, ${w.y.toFixed(2)}, ${w.z.toFixed(2)} \\rangle \\).`;
		answer=`${angle}^{\\circ}`;
		alternate=angle;
		hint="Enter a number (degrees)";
		let angleNum=parseFloat(angle);
		choices=[angle];
		choices.push((angleNum+10).toFixed(1));
		choices.push((angleNum-10).toFixed(1));
		choices.push((Math.acos(Math.abs(cosTheta))*180/Math.PI).toFixed(1));
		choices.push((Math.asin(cosTheta)*180/Math.PI).toFixed(1));
	}
	else{
		const w=generateRandomVector3D(range);
		let dot=v.x*w.x+v.y*w.y+v.z*w.z;
		let magWSq=w.x*w.x+w.y*w.y+w.z*w.z;
		let projx=(dot/magWSq*w.x).toFixed(2);
		let projy=(dot/magWSq*w.y).toFixed(2);
		let projz=(dot/magWSq*w.z).toFixed(2);
		question=`Find the projection of \\( \\langle ${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)} \\rangle \\) onto \\( \\langle ${w.x.toFixed(2)}, ${w.y.toFixed(2)}, ${w.z.toFixed(2)} \\rangle \\).`;
		answer=`\\langle ${projx}, ${projy}, ${projz} \\rangle`;
		alternate=`<${projx}, ${projy}, ${projz}>`;
		hint="Enter as <x, y, z>";
		choices=[answer];
		let wrongProjX=(dot/(magWSq+0.5)*w.x).toFixed(2);
		let wrongProjY=(dot/(magWSq+0.5)*w.y).toFixed(2);
		let wrongProjZ=(dot/(magWSq+0.5)*w.z).toFixed(2);
		choices.push(`\\langle ${wrongProjX}, ${wrongProjY}, ${wrongProjZ} \\rangle`);
		choices.push(`\\langle ${(parseFloat(projx)+0.1).toFixed(2)}, ${projy}, ${projz} \\rangle`);
		choices.push(`\\langle ${projx}, ${(parseFloat(projy)+0.1).toFixed(2)}, ${projz} \\rangle`);
		choices.push(`\\langle ${projx}, ${projy}, ${(parseFloat(projz)+0.1).toFixed(2)} \\rangle`);
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(answer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=answer;
		else uniqueChoices=[answer];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=question;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={ correct: answer, alternate: alternate, display: answer, choices: uniqueChoices };
	window.expectedFormat=hint;
}

export function generateLine3D(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const range=getRange(difficulty)*2;
	const point=generateRandomVector3D(range);
	const dir=generateRandomVector3D(range);
	const t=Math.floor(Math.random()*3)+1;
	let mathExpression=`A line is given by parametric equations:<br>
        \\( x = ${point.x.toFixed(2)} + ${dir.x.toFixed(2)}t, \\quad y = ${point.y.toFixed(2)} + ${dir.y.toFixed(2)}t, \\quad z = ${point.z.toFixed(2)} + ${dir.z.toFixed(2)}t \\)<br>
        Find the point on the line when \\( t = ${t} \\).`;
	let px=point.x+dir.x*t;
	let py=point.y+dir.y*t;
	let pz=point.z+dir.z*t;
	let answer=`(${px.toFixed(2)}, ${py.toFixed(2)}, ${pz.toFixed(2)})`;
	let choices=[answer];
	choices.push(`(${(px+1).toFixed(2)}, ${py.toFixed(2)}, ${pz.toFixed(2)})`);
	choices.push(`(${px.toFixed(2)}, ${(py+1).toFixed(2)}, ${pz.toFixed(2)})`);
	choices.push(`(${px.toFixed(2)}, ${py.toFixed(2)}, ${(pz+1).toFixed(2)})`);
	choices.push(`(${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`);
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(answer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=answer;
		else uniqueChoices=[answer];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={ correct: answer, alternate: answer, display: answer, choices: uniqueChoices };
	window.expectedFormat="Enter as (x, y, z)";
}
export function generatePlane3D(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	const range=getRange(difficulty)*2;
	const normal=generateRandomVector3D(range);
	const point=generateRandomVector3D(range);
	let d=normal.x*point.x+normal.y*point.y+normal.z*point.z;
	const type=Math.random()<0.5?"point-distance":"equation";
	let mathExpression="";
	let answer="";
	let alternate="";
	let choices: string[]=[];
	if(type==="point-distance"){
		const q=generateRandomVector3D(range);
		let numerator=Math.abs(normal.x*q.x+normal.y*q.y+normal.z*q.z-d);
		let denom=Math.sqrt(normal.x*normal.x+normal.y*normal.y+normal.z*normal.z);
		let dist=(numerator/denom).toFixed(2);
		mathExpression=`Find the distance from the point \\( (${q.x.toFixed(2)}, ${q.y.toFixed(2)}, ${q.z.toFixed(2)}) \\) to the plane \\( ${normal.x.toFixed(2)}x + ${normal.y.toFixed(2)}y + ${normal.z.toFixed(2)}z = ${d.toFixed(2)} \\).`;
		let correct=dist;
		answer=correct;
		alternate=correct;
		let choicesArr=[correct];
		let distNum=parseFloat(dist);
		choicesArr.push((distNum+0.5).toFixed(2));
		choicesArr.push((distNum-0.5).toFixed(2));
		choicesArr.push((numerator/denom).toFixed(2));
		choicesArr.push((Math.abs(normal.x*q.x+normal.y*q.y+normal.z*q.z-d)/denom).toFixed(2));
		let uniqueChoices=[...new Set(choicesArr)];
		if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
		if(!uniqueChoices.includes(correct)){
			if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
			else uniqueChoices=[correct];
		}
		choices=uniqueChoices;
		window.expectedFormat="Enter a number";
	}
	else{
		mathExpression=`Find the equation of the plane that passes through \\( (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}) \\) and has normal vector \\( \\langle ${normal.x.toFixed(2)}, ${normal.y.toFixed(2)}, ${normal.z.toFixed(2)} \\rangle \\).`;
		let eq=`${normal.x.toFixed(2)}x + ${normal.y.toFixed(2)}y + ${normal.z.toFixed(2)}z = ${d.toFixed(2)}`;
		let correct=eq;
		answer=correct;
		alternate=correct;
		let choicesArr=[correct];
		choicesArr.push(`${normal.x.toFixed(2)}x + ${normal.y.toFixed(2)}y + ${normal.z.toFixed(2)}z = ${(d+1).toFixed(2)}`);
		choicesArr.push(`${(normal.x+1).toFixed(2)}x + ${normal.y.toFixed(2)}y + ${normal.z.toFixed(2)}z = ${d.toFixed(2)}`);
		choicesArr.push(`${normal.x.toFixed(2)}x + ${(normal.y+1).toFixed(2)}y + ${normal.z.toFixed(2)}z = ${d.toFixed(2)}`);
		choicesArr.push(`${normal.x.toFixed(2)}x + ${normal.y.toFixed(2)}y + ${(normal.z+1).toFixed(2)}z = ${d.toFixed(2)}`);
		let uniqueChoices=[...new Set(choicesArr)];
		if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
		if(!uniqueChoices.includes(correct)){
			if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
			else uniqueChoices=[correct];
		}
		choices=uniqueChoices;
		window.expectedFormat="Enter as ax + by + cz = d";
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: answer,
		alternate: alternate,
		display: answer,
		choices: choices
	};
}