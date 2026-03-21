import {questionArea} from "../../script.js";
import {getMaxForDifficulty} from "./algebraUtils.js";

export function generateLinearEquation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["one_step","two_step","both_sides","parentheses","literal"];
	let type=types[Math.floor(Math.random()*types.length)];
	let range=getMaxForDifficulty(difficulty,10);
	let hint="";
	let a=Math.floor(Math.random()*range)+1;
	let b=Math.floor(Math.random()*range)+1;
	let c=Math.floor(Math.random()*range)+1;
	let x=Math.floor(Math.random()*range)+1;
	switch (type){
		case "one_step":{
			let op=Math.random()<0.5?"+":"-";
			if (op==="+"){
				let rhs=a+x;
				questionArea.innerHTML=`Solve: \\( x + ${a}=${rhs} \\)`;
				window.correctAnswer={
					correct:x.toString(),
					alternate:x.toString(),
					display:x.toString()
				};
			}else{
				let rhs=a-x;
				questionArea.innerHTML=`Solve: \\( ${a} - x = ${rhs} \\)`;
				window.correctAnswer={
					correct:x.toString(),
					alternate:x.toString(),
					display:x.toString()
				};
			}
			hint="Enter a number";
			break;
		}
		case "two_step":{
			let coeff=Math.max(1,a);
			let constant=b;
			let rhs=coeff*x+constant;
			questionArea.innerHTML=`Solve: \\( ${coeff}x + ${constant}=${rhs} \\)`;
			window.correctAnswer={
				correct:x.toString(),
				alternate:x.toString(),
				display:x.toString()
			};
			hint="Enter a number";
			break;
		}
		case "both_sides":{
			let coeff1=Math.max(1,a);
			let coeff2=Math.max(1,b);
			let constant=c;
			let rhsConst=coeff1*x+constant-coeff2*x;
			questionArea.innerHTML=`Solve: \\( ${coeff1}x + ${constant}=${coeff2}x + ${rhsConst} \\)`;
			window.correctAnswer={
				correct:x.toString(),
				alternate:x.toString(),
				display:x.toString()
			};
			hint="Enter a number";
			break;
		}
		case "parentheses":{
			let coeff=Math.max(1,a);
			let inner=Math.max(1,b);
			let rhs=coeff*(x+inner);
			questionArea.innerHTML=`Solve: \\( ${coeff}(x + ${inner})=${rhs} \\)`;
			window.correctAnswer={
				correct:x.toString(),
				alternate:x.toString(),
				display:x.toString()
			};
			hint="Enter a number";
			break;
		}
		case "literal":{
			let eq=`${a}x + ${b}y = ${c}`;
			questionArea.innerHTML=`Solve for x: \\( ${eq} \\)`;
			let ans=`\\frac{${c} - ${b}y}{${a}}`;
			window.correctAnswer={
				correct:ans,
				alternate:`(${c} - ${b}y)/${a}`,
				display:ans
			};
			hint="Enter as an expression in y";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

export function generateQuadraticEquation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["factor","complete_square","quadratic_formula","discriminant"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let hint="";
	switch (type){
		case "factor":{
			let p=Math.floor(Math.random()*maxVal)+1;
			let q=Math.floor(Math.random()*maxVal)+1;
			let b=-(p+q);
			let c=p*q;
			questionArea.innerHTML=`Solve by factoring: \\( x^2 ${b>=0?'+':'-'} ${Math.abs(b)}x + ${c}=0 \\)`;
			let ans=`-${p}, -${q}`;
			window.correctAnswer={
				correct:ans,
				alternate:`x=-${p}, x=-${q}`,
				display:ans
			};
			hint="Enter roots separated by commas (e.g., -2, -3)";
			break;
		}
		case "complete_square":{
			let d=Math.floor(Math.random()*3)+1;
			let e=Math.floor(Math.random()*5)+1;
			let rhs=e*e;
			questionArea.innerHTML=`Solve by completing the square: \\( (x + ${d})^2 = ${rhs} \\)`;
			let sol1=-d+e;
			let sol2=-d-e;
			let ans=`${sol1}, ${sol2}`;
			window.correctAnswer={
				correct:ans,
				alternate:`x=${sol1}, x=${sol2}`,
				display:ans
			};
			hint="Enter roots as decimals";
			break;
		}
		case "quadratic_formula":{
			let a=1;
			let b=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let c=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let disc=b*b-4*a*c;
			while (disc<0){
				b=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
				c=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
				disc=b*b-4*a*c;
			}
			let sol1=(-b+Math.sqrt(disc))/(2*a);
			let sol2=(-b-Math.sqrt(disc))/(2*a);
			questionArea.innerHTML=`Solve using the quadratic formula: \\( ${a}x^2 + ${b}x + ${c}=0 \\)`;
			let ans=`${sol1.toFixed(2)}, ${sol2.toFixed(2)}`;
			window.correctAnswer={
				correct:ans,
				alternate:`x=${sol1.toFixed(2)}, x=${sol2.toFixed(2)}`,
				display:ans
			};
			hint="Enter roots as decimals (e.g., 0.38, -2.62)";
			break;
		}
		case "discriminant":{
			let a=1;
			let b=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let c=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let disc=b*b-4*a*c;
			let nature=disc>0?"two real":disc===0?"one real":"two complex";
			questionArea.innerHTML=`Find the discriminant of \\( x^2 + ${b}x + ${c}=0 \\) and state the nature.`;
			let ans=`${disc}, ${nature}`;
			window.correctAnswer={
				correct:ans,
				alternate:`${disc}`,
				display:ans
			};
			hint="Enter discriminant and nature (e.g., '9, two real')";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

export function generateLinearInequality(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["solve","graph","compound","absolute"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let x=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "solve":{
			let rhs=a*x+b;
			questionArea.innerHTML=`Solve: \\( ${a}x + ${b} > ${rhs} \\)`;
			let ans=`x > ${x}`;
			window.correctAnswer={
				correct:ans,
				alternate:`x>${x}`,
				display:ans
			};
			hint="Enter as x > number";
			break;
		}
		case "graph":{
			questionArea.innerHTML=`Graph the inequality \\( x < ${x} \\) on a number line. (Enter the solution set)`;
			let ans=`(-∞, ${x})`;
			window.correctAnswer={
				correct:ans,
				alternate:`(-∞,${x})`,
				display:ans
			};
			hint="Enter as interval, e.g., (-∞,3)";
			break;
		}
		case "compound":{
			let lower=Math.floor(Math.random()*3)+1;
			let upper=lower+Math.floor(Math.random()*5)+2;
			questionArea.innerHTML=`Solve: \\( ${lower} < x < ${upper} \\) (Enter the interval)`;
			let ans=`(${lower}, ${upper})`;
			window.correctAnswer={
				correct:ans,
				alternate:`(${lower},${upper})`,
				display:ans
			};
			hint="Enter as (a,b)";
			break;
		}
		case "absolute":{
			let k=Math.floor(Math.random()*5)+2;
			questionArea.innerHTML=`Solve: \\( |x| < ${k} \\) (Enter interval)`;
			let ans=`(-${k}, ${k})`;
			window.correctAnswer={
				correct:ans,
				alternate:`(-${k},${k})`,
				display:ans
			};
			hint="Enter as (-a,a)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

export function generateQuadraticInequality(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["solve","graph"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,5);
	let hint="";
	switch (type){
		case "solve":{
			let a=1;
			let b=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let c=Math.floor(Math.random()*(maxVal*2+1))-maxVal;
			let disc=b*b-4*a*c;
			if (disc<0){
				questionArea.innerHTML=`Solve: \\( x^2 + ${b}x + ${c} < 0 \\) (Enter interval)`;
				window.correctAnswer={
					correct:"no solution",
					alternate:"no solution",
					display:"no solution"
				};
				hint="Enter 'no solution' or an interval";
				break;
			}
			let root1=(-b-Math.sqrt(disc))/(2*a);
			let root2=(-b+Math.sqrt(disc))/(2*a);
			if (root1>root2) [root1,root2]=[root2,root1];
			let ans=`(${root1.toFixed(2)}, ${root2.toFixed(2)})`;
			questionArea.innerHTML=`Solve: \\( x^2 + ${b}x + ${c} < 0 \\) (Enter interval)`;
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter interval (a,b)";
			break;
		}
		case "graph":{
			questionArea.innerHTML=`Graph the inequality \\( y > x^2 - 4 \\). (Enter the solution description)`;
			window.correctAnswer={
				correct:"above the parabola",
				alternate:"above",
				display:"above the parabola"
			};
			hint="Enter 'above' or 'below'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

export function generateRationalInequality(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let maxVal=getMaxForDifficulty(difficulty,5);
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	questionArea.innerHTML=`Solve: \\( \\frac{x-${a}}{x-${b}} > 0 \\) (Enter intervals)`;
	let intervals:string;
	if (a<b){
		intervals=`(-∞,${a}) ∪ (${b},∞)`;
	}else{
		intervals=`(-∞,${b}) ∪ (${a},∞)`;
	}
	window.correctAnswer={
		correct:intervals,
		alternate:intervals.replace(/∞/g,"infinity"),
		display:intervals
	};
	window.expectedFormat="Enter intervals e.g., (-∞,2) ∪ (5,∞)";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

export function generateSystem2x2(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["graphing","substitution","elimination","word"];
	let type=types[Math.floor(Math.random()*types.length)];
	let maxVal=getMaxForDifficulty(difficulty,10);
	let hint="";
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	let d=Math.floor(Math.random()*maxVal)+1;
	let e=Math.floor(Math.random()*maxVal)+1;
	let x=Math.floor(Math.random()*maxVal)+1;
	let y=Math.floor(Math.random()*maxVal)+1;
	switch (type){
		case "graphing":{
			let eq1=`${a}x + ${b}y = ${a*x+b*y}`;
			let eq2=`${c}x + ${d}y = ${c*x+d*y}`;
			questionArea.innerHTML=`Solve by graphing:<br> \\( ${eq1} \\)<br> \\( ${eq2} \\)`;
			let ans=`(${x}, ${y})`;
			window.correctAnswer={
				correct:ans,
				alternate:`(${x},${y})`,
				display:ans
			};
			hint="Enter as (x,y)";
			break;
		}
		case "substitution":{
			let eq1=`y=${a}x + ${b}`;
			let eq2=`${c}x + ${d}y = ${e}`;
			questionArea.innerHTML=`Solve by substitution:<br> \\( ${eq1} \\)<br> \\( ${eq2} \\)`;
			let denominator=c+d*a;
			if (denominator===0) denominator=1;
			let xSol=(e-d*b)/denominator;
			let ySol=a*xSol+b;
			let ans=`(${xSol.toFixed(2)}, ${ySol.toFixed(2)})`;
			window.correctAnswer={
				correct:ans,
				alternate:ans,
				display:ans
			};
			hint="Enter as (x,y) decimals";
			break;
		}
		case "elimination":{
			let eq1=`${a}x + ${b}y = ${a*x+b*y}`;
			let eq2=`${c}x + ${d}y = ${c*x+d*y}`;
			questionArea.innerHTML=`Solve by elimination:<br> \\( ${eq1} \\)<br> \\( ${eq2} \\)`;
			let ans=`(${x}, ${y})`;
			window.correctAnswer={
				correct:ans,
				alternate:`(${x},${y})`,
				display:ans
			};
			hint="Enter as (x,y)";
			break;
		}
		case "word":{
			let sum=x+y;
			let diff=Math.abs(x-y);
			questionArea.innerHTML=`The sum of two numbers is ${sum} and their difference is ${diff}. Find the numbers.`;
			let larger=(sum+diff)/2;
			let smaller=(sum-diff)/2;
			let ans=`${larger}, ${smaller}`;
			window.correctAnswer={
				correct:ans,
				alternate:`${larger},${smaller}`,
				display:ans
			};
			hint="Enter as larger,smaller";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}

export function generateSystem3x3(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let maxVal=getMaxForDifficulty(difficulty,5);
	let x=Math.floor(Math.random()*maxVal)+1;
	let y=Math.floor(Math.random()*maxVal)+1;
	let z=Math.floor(Math.random()*maxVal)+1;
	let a=Math.floor(Math.random()*maxVal)+1;
	let b=Math.floor(Math.random()*maxVal)+1;
	let c=Math.floor(Math.random()*maxVal)+1;
	let d=Math.floor(Math.random()*maxVal)+1;
	let e=Math.floor(Math.random()*maxVal)+1;
	let f=Math.floor(Math.random()*maxVal)+1;
	let g=Math.floor(Math.random()*maxVal)+1;
	let h=Math.floor(Math.random()*maxVal)+1;
	let i=Math.floor(Math.random()*maxVal)+1;
	questionArea.innerHTML=`Solve the system:<br>
		\\( ${a}x + ${b}y + ${c}z = ${a*x+b*y+c*z} \\)<br>
		\\( ${d}x + ${e}y + ${f}z = ${d*x+e*y+f*z} \\)<br>
		\\( ${g}x + ${h}y + ${i}z = ${g*x+h*y+i*z} \\)`;
	let ans=`(${x}, ${y}, ${z})`;
	window.correctAnswer={
		correct:ans,
		alternate:`(${x},${y},${z})`,
		display:ans
	};
	window.expectedFormat="Enter as (x, y, z)";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}