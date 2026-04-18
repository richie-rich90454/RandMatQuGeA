import {questionArea} from "../../script.js";
import {getMaxForDifficulty, cleanupVisualization} from "./geometryUtils.js";
import {createVisualization} from "./geometryVisualization.js";
/**
 * Analytic geometry: conic sections (parabola, ellipse, hyperbola), polar conics, 3D geometry (distance/midpoint, sphere equations, line/plane).
 * @fileoverview Generates questions about analytic geometry concepts, displays them in questionArea, and sets window.correctAnswer with answer and alternate representations, plus plausible wrong answers for MCQ mode. Includes 3D visualizations.
 * @date 2026-04-18
 */
export function generateParabola(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxA=getMaxForDifficulty(difficulty,5);
	const a=Math.floor(Math.random()*maxA)+1;
	const type=Math.random()<0.5?"upward":"rightward";
	let equation="";
	let focus="";
	let directrix="";
	let p: number;
	if(type==="upward"){
		equation=`y = ${a}x^2`;
		p=1/(4*a);
		focus=`(0, ${p.toFixed(2)})`;
		directrix=`y = -${p.toFixed(2)}`;
	}
	else{
		equation=`x = ${a}y^2`;
		p=1/(4*a);
		focus=`(${p.toFixed(2)}, 0)`;
		directrix=`x = -${p.toFixed(2)}`;
	}
	let mathExpression=`For the parabola \\( ${equation} \\), find its focus and directrix.`;
	const correctAnswer=`focus: ${focus}, directrix: ${directrix}`;
	const choices=[
		correctAnswer,
		`focus: (0, ${(1/(4*a)+1).toFixed(2)}), directrix: y = -${(1/(4*a)+1).toFixed(2)}`,
		`focus: (0, ${(1/(4*a)-1).toFixed(2)}), directrix: y = -${(1/(4*a)-1).toFixed(2)}`,
		`focus: (0, ${(1/(2*a)).toFixed(2)}), directrix: y = -${(1/(2*a)).toFixed(2)}`,
		`focus: (0, ${p.toFixed(2)}), directrix: y = ${p.toFixed(2)}`
	];
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctAnswer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswer;
		else uniqueChoices=[correctAnswer];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctAnswer,
		alternate: `${focus}, ${directrix}`,
		display: correctAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as 'focus: (x,y), directrix: line'";
	createVisualization("parabola",{ a, type });
}
export function generateEllipse(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxAxis=getMaxForDifficulty(difficulty,8);
	const a=Math.floor(Math.random()*maxAxis)+3;
	const b=Math.floor(Math.random()*(a-1))+2;
	const center=Math.random()<0.5?"origin":"translated";
	let h=0;
	let k=0;
	if(center==="translated"){
		h=Math.floor(Math.random()*5)-2;
		k=Math.floor(Math.random()*5)-2;
	}
	let equation="";
	let foci="";
	let eccentricity=0;
	if(center==="origin"){
		if(Math.random()<0.5){
			equation=`\\frac{x^2}{${a}^2} + \\frac{y^2}{${b}^2} = 1`;
			const c=Math.sqrt(a*a-b*b);
			foci=`(±${c.toFixed(2)}, 0)`;
			eccentricity=c/a;
		}
		else{
			equation=`\\frac{y^2}{${a}^2} + \\frac{x^2}{${b}^2} = 1`;
			const c=Math.sqrt(a*a-b*b);
			foci=`(0, ±${c.toFixed(2)})`;
			eccentricity=c/a;
		}
	}
	else{
		if(Math.random()<0.5){
			equation=`\\frac{(x ${h>=0?'-':'+'} ${Math.abs(h)})^2}{${a}^2} + \\frac{(y ${k>=0?'-':'+'} ${Math.abs(k)})^2}{${b}^2} = 1`;
			const c=Math.sqrt(a*a-b*b);
			foci=`(${h} ± ${c.toFixed(2)}, ${k})`;
			eccentricity=c/a;
		}
		else{
			equation=`\\frac{(y ${k>=0?'-':'+'} ${Math.abs(k)})^2}{${a}^2} + \\frac{(x ${h>=0?'-':'+'} ${Math.abs(h)})^2}{${b}^2} = 1`;
			const c=Math.sqrt(a*a-b*b);
			foci=`(${h}, ${k} ± ${c.toFixed(2)})`;
			eccentricity=c/a;
		}
	}
	let mathExpression=`For the ellipse \\( ${equation} \\), find its foci and eccentricity.`;
	const correctAnswer=`foci: ${foci}, e = ${eccentricity.toFixed(2)}`;
	const wrongC=Math.sqrt(Math.abs(b*b-a*a));
	const wrongCValid=!isNaN(wrongC);
	const wrongFoci1=center==="origin"?`(±${wrongCValid?wrongC.toFixed(2):"N/A"}, 0)`:`(${h} ± ${wrongCValid?wrongC.toFixed(2):"N/A"}, ${k})`;
	const wrongFoci2=center==="origin"?`(0, ±${wrongCValid?wrongC.toFixed(2):"N/A"})`:`(${h}, ${k} ± ${wrongCValid?wrongC.toFixed(2):"N/A"})`;
	const choices=[
		correctAnswer,
		`foci: ${wrongFoci1}, e = ${wrongCValid?(wrongC/a).toFixed(2):"0.00"}`,
		`foci: ${wrongFoci2}, e = ${wrongCValid?(wrongC/a).toFixed(2):"0.00"}`,
		`foci: ${foci}, e = ${(Math.sqrt(a*a+b*b)/a).toFixed(2)}`,
		`foci: ${foci.replace(/±/g,"+")}, e = ${eccentricity.toFixed(2)}`
	];
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctAnswer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswer;
		else uniqueChoices=[correctAnswer];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctAnswer,
		alternate: `${foci}, ${eccentricity.toFixed(2)}`,
		display: correctAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as 'foci: (x,y) (±), e = number'";
	createVisualization("ellipse",{ a, b, center, h, k });
}
export function generateHyperbola(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxAxis=getMaxForDifficulty(difficulty,8);
	const a=Math.floor(Math.random()*maxAxis)+3;
	const b=Math.floor(Math.random()*maxAxis)+2;
	const center=Math.random()<0.5?"origin":"translated";
	let h=0;
	let k=0;
	if(center==="translated"){
		h=Math.floor(Math.random()*5)-2;
		k=Math.floor(Math.random()*5)-2;
	}
	let equation="";
	let foci="";
	let asymptotes="";
	let eccentricity=0;
	if(center==="origin"){
		if(Math.random()<0.5){
			equation=`\\frac{x^2}{${a}^2} - \\frac{y^2}{${b}^2} = 1`;
			const c=Math.sqrt(a*a+b*b);
			foci=`(±${c.toFixed(2)}, 0)`;
			asymptotes=`y = ±${(b/a).toFixed(2)}x`;
			eccentricity=c/a;
		}
		else{
			equation=`\\frac{y^2}{${a}^2} - \\frac{x^2}{${b}^2} = 1`;
			const c=Math.sqrt(a*a+b*b);
			foci=`(0, ±${c.toFixed(2)})`;
			asymptotes=`x = ±${(a/b).toFixed(2)}y`;
			eccentricity=c/a;
		}
	}
	else{
		if(Math.random()<0.5){
			equation=`\\frac{(x ${h>=0?'-':'+'} ${Math.abs(h)})^2}{${a}^2} - \\frac{(y ${k>=0?'-':'+'} ${Math.abs(k)})^2}{${b}^2} = 1`;
			const c=Math.sqrt(a*a+b*b);
			foci=`(${h} ± ${c.toFixed(2)}, ${k})`;
			asymptotes=`y = ${k} ± ${(b/a).toFixed(2)}(x ${h>=0?'-':'+'} ${Math.abs(h)})`;
			eccentricity=c/a;
		}
		else{
			equation=`\\frac{(y ${k>=0?'-':'+'} ${Math.abs(k)})^2}{${a}^2} - \\frac{(x ${h>=0?'-':'+'} ${Math.abs(h)})^2}{${b}^2} = 1`;
			const c=Math.sqrt(a*a+b*b);
			foci=`(${h}, ${k} ± ${c.toFixed(2)})`;
			asymptotes=`y = ${k} ± ${(a/b).toFixed(2)}(x ${h>=0?'-':'+'} ${Math.abs(h)})`;
			eccentricity=c/a;
		}
	}
	let mathExpression=`For the hyperbola \\( ${equation} \\), find its foci, asymptotes, and eccentricity.`;
	const correctAnswer=`foci: ${foci}, asymptotes: ${asymptotes}, e = ${eccentricity.toFixed(2)}`;
	const wrongC=Math.sqrt(a*a+b*b)+1;
	const wrongFoci1=center==="origin"?`(±${wrongC.toFixed(2)}, 0)`:`(${h} ± ${wrongC.toFixed(2)}, ${k})`;
	const wrongFoci2=center==="origin"?`(0, ±${wrongC.toFixed(2)})`:`(${h}, ${k} ± ${wrongC.toFixed(2)})`;
	const wrongAsymp=asymptotes.includes("y =")?`y = ±${(a/b).toFixed(2)}x`:`x = ±${(b/a).toFixed(2)}y`;
	const choices=[
		correctAnswer,
		`foci: ${wrongFoci1}, asymptotes: ${asymptotes}, e = ${(wrongC/a).toFixed(2)}`,
		`foci: ${wrongFoci2}, asymptotes: ${asymptotes}, e = ${(wrongC/a).toFixed(2)}`,
		`foci: ${foci}, asymptotes: ${wrongAsymp}, e = ${eccentricity.toFixed(2)}`,
		`foci: ${foci}, asymptotes: ${asymptotes}, e = ${(Math.sqrt(Math.abs(a*a-b*b))/a).toFixed(2)}`
	];
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctAnswer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswer;
		else uniqueChoices=[correctAnswer];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctAnswer,
		alternate: `${foci}, ${asymptotes}, ${eccentricity.toFixed(2)}`,
		display: correctAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as 'foci: ..., asymptotes: ..., e = ...'";
	createVisualization("hyperbola",{ a, b, center, h, k });
}
export function generatePolarConic(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	let eMin=0.2;
	let eMax=2.2;
	let kMin=2;
	let kMax=6;
	switch(difficulty){
		case "easy":
			eMax=1.8;
			kMax=4;
			break;
		case "hard":
			eMax=2.5;
			kMax=8;
			break;
	}
	const eRaw=eMin+Math.random()*(eMax-eMin);
	const e=eRaw.toFixed(2);
	const eNum=parseFloat(e);
	let conicType="";
	if(eNum<0.99) conicType="ellipse";
	else if(eNum>1.01) conicType="hyperbola";
	else conicType="parabola";
	const k=(Math.floor(Math.random()*(kMax-kMin+1))+kMin).toFixed(2);
	const sinOrCos=Math.random()<0.5?"cos":"sin";
	const sign=Math.random()<0.5?"+":"-";
	const equation=`r = \\frac{${k} \\cdot ${e}}{1 ${sign} ${e} ${sinOrCos}\\theta}`;
	let mathExpression=`Identify the conic and find its eccentricity from the polar equation: \\( ${equation} \\).`;
	const correctAnswer=`${conicType}, e = ${e}`;
	const wrongType=eNum<0.99?"hyperbola":eNum>1.01?"ellipse":"parabola";
	const wrongE=(eNum+0.2).toFixed(2);
	const choices=[
		correctAnswer,
		`${wrongType}, e = ${e}`,
		`${conicType}, e = ${wrongE}`,
		`${conicType}, e = ${(eNum-0.2).toFixed(2)}`,
		`${conicType}, e = 1`
	];
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctAnswer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswer;
		else uniqueChoices=[correctAnswer];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctAnswer,
		alternate: `${conicType}, ${e}`,
		display: correctAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as 'type, e = number'";
	createVisualization("polarConic",{ e: eNum, k, sinOrCos, sign });
}
export function generate3DDistanceMidpoint(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxCoord=getMaxForDifficulty(difficulty,6);
	const x1=Math.floor(Math.random()*maxCoord*2)-maxCoord;
	const y1=Math.floor(Math.random()*maxCoord*2)-maxCoord;
	const z1=Math.floor(Math.random()*maxCoord*2)-maxCoord;
	const x2=Math.floor(Math.random()*maxCoord*2)-maxCoord;
	const y2=Math.floor(Math.random()*maxCoord*2)-maxCoord;
	const z2=Math.floor(Math.random()*maxCoord*2)-maxCoord;
	const dist=Math.sqrt((x2-x1)**2+(y2-y1)**2+(z2-z1)**2);
	const mx=(x1+x2)/2;
	const my=(y1+y2)/2;
	const mz=(z1+z2)/2;
	let mathExpression=`Find the distance and midpoint between \\( (${x1}, ${y1}, ${z1}) \\) and \\( (${x2}, ${y2}, ${z2}) \\).`;
	const correctAnswer=`distance: ${dist.toFixed(2)}, midpoint: (${mx.toFixed(2)}, ${my.toFixed(2)}, ${mz.toFixed(2)})`;
	const wrongDist1=Math.sqrt((x2-x1)**2+(y2-y1)**2).toFixed(2);
	const wrongDist2=Math.sqrt((x2-x1)**2+(y2-y1)**2+(z2-z1)**2+1).toFixed(2);
	const wrongMx=(x1+x2)/2+1;
	const wrongMy=(y1+y2)/2+1;
	const wrongMz=(z1+z2)/2+1;
	const choices=[
		correctAnswer,
		`distance: ${wrongDist1}, midpoint: (${mx.toFixed(2)}, ${my.toFixed(2)}, ${mz.toFixed(2)})`,
		`distance: ${wrongDist2}, midpoint: (${mx.toFixed(2)}, ${my.toFixed(2)}, ${mz.toFixed(2)})`,
		`distance: ${dist.toFixed(2)}, midpoint: (${wrongMx.toFixed(2)}, ${wrongMy.toFixed(2)}, ${wrongMz.toFixed(2)})`,
		`distance: ${dist.toFixed(2)}, midpoint: (${(x1+x2)/2}, ${(y1+y2)/2}, ${(z1+z2)/2})`
	];
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctAnswer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswer;
		else uniqueChoices=[correctAnswer];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctAnswer,
		alternate: `${dist.toFixed(2)}, (${mx.toFixed(2)},${my.toFixed(2)},${mz.toFixed(2)})`,
		display: correctAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as 'distance: ..., midpoint: (x,y,z)'";
	createVisualization("points3D",{ points: [{ x: x1, y: y1, z: z1 },{ x: x2, y: y2, z: z2 }] });
}
export function generateSphereEquation(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const maxCoord=getMaxForDifficulty(difficulty,5);
	const h=Math.floor(Math.random()*maxCoord*2)-maxCoord;
	const k=Math.floor(Math.random()*maxCoord*2)-maxCoord;
	const l=Math.floor(Math.random()*maxCoord*2)-maxCoord;
	const r=Math.floor(Math.random()*maxCoord)+2;
	const type=Math.random()<0.5?"center-radius":"general";
	let question="";
	let answer="";
	if(type==="center-radius"){
		question=`Write the equation of a sphere with center \\( (${h}, ${k}, ${l}) \\) and radius \\( ${r} \\).`;
		answer=`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 + (z ${l>=0?'-':'+'} ${Math.abs(l)})^2 = ${r}^2`;
	}
	else{
		const constTerm=h*h+k*k+l*l-r*r;
		const signX=-2*h;
		const signY=-2*k;
		const signZ=-2*l;
		question=`Find the center and radius of the sphere: \\( x^2 + y^2 + z^2 ${signX>=0?'+':'-'} ${Math.abs(signX)}x ${signY>=0?'+':'-'} ${Math.abs(signY)}y ${signZ>=0?'+':'-'} ${Math.abs(signZ)}z ${constTerm>=0?'+':'-'} ${Math.abs(constTerm)} = 0 \\).`;
		answer=`center (${h}, ${k}, ${l}), radius ${r}`;
	}
	let mathExpression=question;
	const correctAnswer=answer;
	let wrongAnswer="";
	if(type==="center-radius"){
		wrongAnswer=`(x ${h>=0?'-':'+'} ${Math.abs(h)+1})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)+1})^2 + (z ${l>=0?'-':'+'} ${Math.abs(l)+1})^2 = ${r}^2`;
	}
	else{
		wrongAnswer=`center (${h+1}, ${k}, ${l}), radius ${r}`;
	}
	const choices=[
		correctAnswer,
		wrongAnswer,
		`center (${h}, ${k}, ${l}), radius ${r+1}`,
		`center (${h}, ${k}, ${l}), radius ${r-1}`,
		`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 + (z ${l>=0?'-':'+'} ${Math.abs(l)})^2 = ${(r+1)}^2`
	];
	let uniqueChoices=[...new Set(choices)].slice(0,4);
	if(!uniqueChoices.includes(correctAnswer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswer;
		else uniqueChoices=[correctAnswer];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctAnswer,
		alternate: correctAnswer,
		display: correctAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter the equation or center/radius as appropriate";
	createVisualization("sphere",{ radius: r, center: [h,k,l] });
}
export function generateLinePlane3D(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	cleanupVisualization();
	const type=Math.random()<0.5?"line":"plane";
	const maxCoord=getMaxForDifficulty(difficulty,5);
	if(type==="line"){
		const x0=Math.floor(Math.random()*maxCoord*2)-maxCoord;
		const y0=Math.floor(Math.random()*maxCoord*2)-maxCoord;
		const z0=Math.floor(Math.random()*maxCoord*2)-maxCoord;
		const a=Math.floor(Math.random()*maxCoord)+1;
		const b=Math.floor(Math.random()*maxCoord)+1;
		const c=Math.floor(Math.random()*maxCoord)+1;
		const tVal=Math.floor(Math.random()*3)+1;
		const x=x0+a*tVal;
		const y=y0+b*tVal;
		const z=z0+c*tVal;
		let mathExpression=`A line has parametric equations \\( x = ${x0} + ${a}t, y = ${y0} + ${b}t, z = ${z0} + ${c}t \\). Find the point on the line when \\( t = ${tVal} \\).`;
		const correctAnswer=`(${x}, ${y}, ${z})`;
		const wrongPoint1=`(${x+1}, ${y}, ${z})`;
		const wrongPoint2=`(${x}, ${y+1}, ${z})`;
		const wrongPoint3=`(${x}, ${y}, ${z+1})`;
		const wrongPoint4=`(${x0}, ${y0}, ${z0})`;
		const choices=[correctAnswer,wrongPoint1,wrongPoint2,wrongPoint3,wrongPoint4];
		let uniqueChoices=[...new Set(choices)].slice(0,4);
		if(!uniqueChoices.includes(correctAnswer)){
			if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswer;
			else uniqueChoices=[correctAnswer];
		}
		let mathContainer=document.createElement("div");
		mathContainer.innerHTML=mathExpression;
		questionArea.appendChild(mathContainer);
		if(window.MathJax?.typesetPromise){
			window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
		}
		window.correctAnswer={
			correct: correctAnswer,
			alternate: `(${x},${y},${z})`,
			display: correctAnswer,
			choices: uniqueChoices
		};
		window.expectedFormat="Enter as (x, y, z)";
		createVisualization("line3D",{ point: [x0,y0,z0], direction: [a,b,c], t: tVal });
	}
	else{
		const a=Math.floor(Math.random()*maxCoord)+1;
		const b=Math.floor(Math.random()*maxCoord)+1;
		const c=Math.floor(Math.random()*maxCoord)+1;
		const d=Math.floor(Math.random()*maxCoord*2)-maxCoord;
		const x=Math.floor(Math.random()*5)-2;
		const y=Math.floor(Math.random()*5)-2;
		const z=-(a*x+b*y+d)/c;
		let mathExpression=`Does the point \\( (${x}, ${y}, ${z.toFixed(2)}) \\) lie on the plane \\( ${a}x + ${b}y + ${c}z ${d>=0?'+':'-'} ${Math.abs(d)} = 0 \\)? (yes/no)`;
		const correctAnswer="yes";
		const choices=["yes","no","maybe","only if x=0"];
		let uniqueChoices=[...new Set(choices)].slice(0,4);
		if(!uniqueChoices.includes(correctAnswer)){
			if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctAnswer;
			else uniqueChoices=[correctAnswer];
		}
		let mathContainer=document.createElement("div");
		mathContainer.innerHTML=mathExpression;
		questionArea.appendChild(mathContainer);
		if(window.MathJax?.typesetPromise){
			window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
		}
		window.correctAnswer={
			correct: correctAnswer,
			alternate: "yes",
			display: "yes",
			choices: uniqueChoices
		};
		window.expectedFormat="Enter 'yes' or 'no'";
		createVisualization("plane3D",{ normal: [a,b,c], d, point: [x,y,z] });
	}
}