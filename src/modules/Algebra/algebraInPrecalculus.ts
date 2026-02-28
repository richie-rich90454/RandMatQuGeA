import {questionArea} from "../../script.js";
import {getMaxForDifficulty} from "./algebraUtils.js";

export function generateRealNumberOperations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["absolute","distance","order","interval"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";
	switch (type){
		case "absolute":{
			const a=Math.floor(Math.random()*max*2)-max;
			const expr=`|${a}|`;
			questionArea.innerHTML=`Evaluate: \\( ${expr} \\)`;
			window.correctAnswer={
				correct:Math.abs(a).toString(),
				alternate:Math.abs(a).toString()
			};
			hint="Enter a number";
			break;
		}
		case "distance":{
			const a=Math.floor(Math.random()*max);
			const b=Math.floor(Math.random()*max);
			questionArea.innerHTML=`Find the distance between \\( ${a} \\) and \\( ${b} \\) on the number line.`;
			const dist=Math.abs(a-b);
			window.correctAnswer={
				correct:dist.toString(),
				alternate:dist.toString()
			};
			hint="Enter a number";
			break;
		}
		case "order":{
			const a=Math.floor(Math.random()*max);
			const b=Math.floor(Math.random()*max);
			const ops=["<",">","≤","≥"];
			const op=ops[Math.floor(Math.random()*ops.length)];
			const trueForA=(op==="<"&&a<b)||(op===">"&&a>b)||(op==="≤"&&a<=b)||(op==="≥"&&a>=b);
			const correctBool=trueForA?"true":"false";
			questionArea.innerHTML=`Is the statement \\( ${a} ${op} ${b} \\) true or false?`;
			window.correctAnswer={
				correct:correctBool,
				alternate:correctBool
			};
			hint="Enter 'true' or 'false'";
			break;
		}
		case "interval":{
			const a=Math.floor(Math.random()*max)+1;
			const b=a+Math.floor(Math.random()*max)+2;
			const types=["open","closed","half-open","unbounded"];
			const intervalType=types[Math.floor(Math.random()*types.length)];
			let interval="";
			let desc="";
			switch (intervalType){
				case "open":
					interval=`(${a}, ${b})`;
					desc=`all x such that ${a} < x < ${b}`;
					break;
				case "closed":
					interval=`[${a}, ${b}]`;
					desc=`all x such that ${a} ≤ x ≤ ${b}`;
					break;
				case "half-open":
					if (Math.random()<0.5){
						interval=`[${a}, ${b})`;
						desc=`all x such that ${a} ≤ x < ${b}`;
					}else{
						interval=`(${a}, ${b}]`;
						desc=`all x such that ${a} < x ≤ ${b}`;
					}
					break;
				case "unbounded":
					if (Math.random()<0.5){
						interval=`(${a}, ∞)`;
						desc=`all x such that x > ${a}`;
					}else{
						interval=`(-∞, ${b})`;
						desc=`all x such that x < ${b}`;
					}
					break;
			}
			questionArea.innerHTML=`Write the interval \\( ${interval} \\) in set-builder notation.`;
			window.correctAnswer={
				correct:desc,
				alternate:desc
			};
			hint="Enter a description like 'x > 3' or interval";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateCartesianConcepts(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["quadrant","distance","midpoint","plot"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";
	switch (type){
		case "quadrant":{
			const x=Math.floor(Math.random()*max*2)-max;
			const y=Math.floor(Math.random()*max*2)-max;
			let quadrant="";
			if (x>0&&y>0) quadrant="I";
			else if (x<0&&y>0) quadrant="II";
			else if (x<0&&y<0) quadrant="III";
			else if (x>0&&y<0) quadrant="IV";
			else quadrant="on an axis";
			questionArea.innerHTML=`In which quadrant is the point \\( (${x}, ${y}) \\)?`;
			window.correctAnswer={
				correct:quadrant,
				alternate:quadrant
			};
			hint="Enter I, II, III, IV, or 'on an axis'";
			break;
		}
		case "distance":{
			const x1=Math.floor(Math.random()*max);
			const y1=Math.floor(Math.random()*max);
			const x2=Math.floor(Math.random()*max);
			const y2=Math.floor(Math.random()*max);
			const dist=Math.sqrt((x2-x1)**2+(y2-y1)**2).toFixed(2);
			questionArea.innerHTML=`Find the distance between \\( (${x1}, ${y1}) \\) and \\( (${x2}, ${y2}) \\).`;
			window.correctAnswer={
				correct:dist,
				alternate:dist
			};
			hint="Enter a decimal rounded to two places";
			break;
		}
		case "midpoint":{
			const x1=Math.floor(Math.random()*max);
			const y1=Math.floor(Math.random()*max);
			const x2=Math.floor(Math.random()*max);
			const y2=Math.floor(Math.random()*max);
			const mx=((x1+x2)/2).toFixed(2);
			const my=((y1+y2)/2).toFixed(2);
			questionArea.innerHTML=`Find the midpoint of \\( (${x1}, ${y1}) \\) and \\( (${x2}, ${y2}) \\).`;
			window.correctAnswer={
				correct:`(${mx}, ${my})`,
				alternate:`(${mx},${my})`
			};
			hint="Enter as (x, y)";
			break;
		}
		case "plot":{
			const x=Math.floor(Math.random()*max)+1;
			const y=Math.floor(Math.random()*max)+1;
			questionArea.innerHTML=`What are the coordinates of the point that is ${x} units right and ${y} units up from the origin?`;
			window.correctAnswer={
				correct:`(${x}, ${y})`,
				alternate:`(${x},${y})`
			};
			hint="Enter as (x, y)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateCircleEquations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["standard","center_radius","complete_square"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	switch (type){
		case "standard":{
			const h=Math.floor(Math.random()*max*2)-max;
			const k=Math.floor(Math.random()*max*2)-max;
			const r=Math.floor(Math.random()*max)+1;
			questionArea.innerHTML=`Write the equation of a circle with center \\( (${h}, ${k}) \\) and radius \\( ${r} \\).`;
			const eq=`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 = ${r}^2`;
			window.correctAnswer={
				correct:eq,
				alternate:eq
			};
			hint="Enter as (x-h)^2 + (y-k)^2 = r^2";
			break;
		}
		case "center_radius":{
			const h=Math.floor(Math.random()*max*2)-max;
			const k=Math.floor(Math.random()*max*2)-max;
			const r=Math.floor(Math.random()*max)+1;
			const eq=`(x ${h>=0?'-':'+'} ${Math.abs(h)})^2 + (y ${k>=0?'-':'+'} ${Math.abs(k)})^2 = ${r}^2`;
			questionArea.innerHTML=`Find the center and radius of the circle: \\( ${eq} \\).`;
			window.correctAnswer={
				correct:`center (${h}, ${k}), radius ${r}`,
				alternate:`(${h},${k}), ${r}`
			};
			hint="Enter as 'center (h,k), radius r'";
			break;
		}
		case "complete_square":{
			const h=Math.floor(Math.random()*max)+1;
			const k=Math.floor(Math.random()*max)+1;
			const r=Math.floor(Math.random()*max)+1;
			const xCoeff=-2*h;
			const yCoeff=-2*k;
			const constTerm=h*h+k*k-r*r;
			const eq=`x^2 + y^2 ${xCoeff>=0?'+':'-'} ${Math.abs(xCoeff)}x ${yCoeff>=0?'+':'-'} ${Math.abs(yCoeff)}y ${constTerm>=0?'+':'-'} ${Math.abs(constTerm)} = 0`;
			questionArea.innerHTML=`Complete the square to find the center and radius: \\( ${eq} \\).`;
			window.correctAnswer={
				correct:`center (${h}, ${k}), radius ${r}`,
				alternate:`(${h},${k}), ${r}`
			};
			hint="Enter as 'center (h,k), radius r'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateLinearEquationSpecial(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["identity","contradiction"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	if (type==="identity"){
		const a=Math.floor(Math.random()*max)+1;
		const b=Math.floor(Math.random()*max)+1;
		const c=a;
		const d=b;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		questionArea.innerHTML=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		window.correctAnswer={
			correct:"identity",
			alternate:"identity"
		};
		hint="Enter 'identity', 'contradiction', or the solution";
	}else{
		const a=Math.floor(Math.random()*max)+1;
		const b=Math.floor(Math.random()*max)+1;
		const c=a;
		const d=b+1;
		const eq=`${a}x + ${b} = ${c}x + ${d}`;
		questionArea.innerHTML=`Solve: \\( ${eq} \\) (state if identity, contradiction, or conditional)`;
		window.correctAnswer={
			correct:"contradiction",
			alternate:"contradiction"
		};
		hint="Enter 'identity', 'contradiction', or the solution";
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateRationalEquation(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const max=getMaxForDifficulty(difficulty,5);
	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;
	const type=Math.random()<0.5?"simple":"extraneous";
	let hint="";

	if (type==="simple"){
		const d=Math.floor(Math.random()*max)+1;
		const e=Math.floor(Math.random()*max)+1;
		const numA=Math.floor(Math.random()*max)+1;
		const numB=Math.floor(Math.random()*max)+1;
		const denC=Math.floor(Math.random()*max)+1;
		const denD=d;
		const x=(e*denD-numB)/(numA-e*denC);
		questionArea.innerHTML=`Solve: \\( \\frac{${numA}x + ${numB}}{${denC}x + ${denD}} = ${e} \\)`;
		window.correctAnswer={
			correct:x.toFixed(2),
			alternate:x.toString()
		};
		hint="Enter decimal answer";
	}else{
		const extraneousVal=a;
		const eq=`\\frac{1}{x - ${extraneousVal}} = \\frac{${b}}{x - ${extraneousVal}} + ${c}`;
		questionArea.innerHTML=`Solve and check for extraneous solutions: \\( ${eq} \\)`;
		window.correctAnswer={
			correct:"no solution",
			alternate:"no solution"
		};
		hint="Enter 'no solution' or the solution";
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generatePolynomialInequality(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const max=getMaxForDifficulty(difficulty,3);
	const roots: number[]=[];
	for (let i=0; i<3; i++){
		roots.push(Math.floor(Math.random()*max*2)-max);
	}
	roots.sort((a,b)=>a-b);
	const factors=roots.map(r=>`(x ${r>=0?'-':'+'} ${Math.abs(r)})`).join('');
	const inequality=factors+">0";
	questionArea.innerHTML=`Solve the inequality: \\( ${inequality} \\). (Enter intervals)`;
	const intervals: string[]=[];
	if (roots.length%2===0){
		intervals.push(`(-∞, ${roots[0]})`);
		for (let i=1; i<roots.length; i+=2){
			if (i+1<roots.length){
				intervals.push(`(${roots[i]}, ${roots[i+1]})`);
			}
		}
		if (roots.length%2===0) intervals.push(`(${roots[roots.length-1]}, ∞)`);
	}else{
		intervals.push(`(${roots[0]}, ${roots[1]})`);
		for (let i=2; i<roots.length; i+=2){
			intervals.push(`(${roots[i]}, ∞)`);
		}
	}
	const answer=intervals.join(' ∪ ');
	window.correctAnswer={
		correct:answer,
		alternate:answer.replace(/∞/g,'infinity')
	};
	window.expectedFormat="Enter intervals like (-∞,1) ∪ (3,∞)";
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateFunctionProperties(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["continuity","extrema","symmetry","asymptotes","endbehavior"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	switch (type){
		case "continuity":{
			const a=Math.floor(Math.random()*max)+1;
			const functions=[
				`f(x)=\\frac{1}{x-${a}}`,
				`f(x)=\\sqrt{x-${a}}`,
				`f(x)=x^2+${a}`
			];
			const chosen=functions[Math.floor(Math.random()*functions.length)];
			questionArea.innerHTML=`Where is \\( ${chosen} \\) discontinuous? (Enter x-value or 'none' or interval)`;
			let answer="";
			if (chosen.includes("frac")) answer=`x = ${a}`;
			else if (chosen.includes("sqrt")) answer=`x < ${a}`;
			else answer="none";
			window.correctAnswer={
				correct:answer,
				alternate:answer
			};
			hint="Enter x value, interval, or 'none'";
			break;
		}
		case "extrema":{
			const a=Math.floor(Math.random()*max)+1;
			const b=Math.floor(Math.random()*max)+1;
			questionArea.innerHTML=`Does \\( f(x)=x^2 - ${a}x + ${b} \\) have a local minimum or maximum? (Enter 'min' or 'max')`;
			window.correctAnswer={
				correct:"min",
				alternate:"minimum"
			};
			hint="Enter 'min' or 'max'";
			break;
		}
		case "symmetry":{
			const functions=[
				{expr:"f(x)=x^2",type:"even"},
				{expr:"f(x)=x^3",type:"odd"},
				{expr:"f(x)=x^2+x",type:"neither"}
			];
			const chosen=functions[Math.floor(Math.random()*functions.length)];
			questionArea.innerHTML=`Is \\( ${chosen.expr} \\) even, odd, or neither?`;
			window.correctAnswer={
				correct:chosen.type,
				alternate:chosen.type
			};
			hint="Enter 'even', 'odd', or 'neither'";
			break;
		}
		case "asymptotes":{
			const a=Math.floor(Math.random()*max)+1;
			const b=Math.floor(Math.random()*max)+1;
			const expr=`\\frac{${a}x+${b}}{x-${a}}`;
			questionArea.innerHTML=`Find the vertical asymptote of \\( ${expr} \\). (Enter x=value)`;
			window.correctAnswer={
				correct:`x=${a}`,
				alternate:`x=${a}`
			};
			hint="Enter x = number";
			break;
		}
		case "endbehavior":{
			const a=Math.floor(Math.random()*2)+1;
			const deg=Math.floor(Math.random()*2)+3;
			const sign=a===1?"positive":"negative";
			const evenOdd=deg%2===0?"even":"odd";
			let desc="";
			if (evenOdd==="even"){
				desc=sign==="positive"?"both ends up":"both ends down";
			}else{
				desc=sign==="positive"?"left down, right up":"left up, right down";
			}
			questionArea.innerHTML=`Describe the end behavior of a polynomial with leading coefficient ${sign} and degree ${deg}.`;
			window.correctAnswer={
				correct:desc,
				alternate:desc
			};
			hint="Enter description like 'both ends up'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateBasicFunctions(): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const functions=[
		{name:"identity",expr:"f(x)=x",props:"linear, odd, increasing"},
		{name:"squaring",expr:"f(x)=x^2",props:"even, decreasing then increasing, vertex at (0,0)"},
		{name:"cubing",expr:"f(x)=x^3",props:"odd, increasing, origin"},
		{name:"reciprocal",expr:"f(x)=1/x",props:"odd, two branches, asymptotes x=0, y=0"},
		{name:"square root",expr:"f(x)=√x",props:"increasing, domain [0,∞), range [0,∞)"},
		{name:"exponential",expr:"f(x)=e^x",props:"increasing, horizontal asymptote y=0, passes (0,1)"},
		{name:"logarithmic",expr:"f(x)=ln x",props:"increasing, vertical asymptote x=0, passes (1,0)"},
		{name:"logistic",expr:"f(x)=1/(1+e^{-x})",props:"increasing, horizontal asymptotes y=0 and y=1, sigmoid"},
		{name:"sine",expr:"f(x)=sin x",props:"odd, periodic, range [-1,1]"},
		{name:"cosine",expr:"f(x)=cos x",props:"even, periodic, range [-1,1]"},
		{name:"absolute value",expr:"f(x)=|x|",props:"even, V-shape, decreasing then increasing"},
		{name:"greatest integer",expr:"f(x)=⌊x⌋",props:"step function, constant on intervals [n,n+1)"}
	];
	const chosen=functions[Math.floor(Math.random()*functions.length)];
	const types=["identify","properties"];
	const type=types[Math.floor(Math.random()*types.length)];
	let hint="";

	if (type==="identify"){
		questionArea.innerHTML=`Identify the function: \\( ${chosen.expr} \\). (Enter name)`;
		window.correctAnswer={
			correct:chosen.name,
			alternate:chosen.name
		};
		hint="Enter the function name";
	}else{
		questionArea.innerHTML=`Give one key property of \\( ${chosen.expr} \\).`;
		window.correctAnswer={
			correct:chosen.props,
			alternate:chosen.props
		};
		hint="Enter a property (e.g., 'even', 'increasing')";
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateFunctionOperations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["composition","sum","product"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;

	switch (type){
		case "composition":{
			const f=`${a}x + ${b}`;
			const g=`x^2`;
			const xVal=Math.floor(Math.random()*max)+1;
			questionArea.innerHTML=`Given \\( f(x)=${f} \\) and \\( g(x)=${g} \\), find \\( (f \\circ g)(${xVal}) \\).`;
			const result=a*(xVal*xVal)+b;
			window.correctAnswer={
				correct:result.toString(),
				alternate:result.toString()
			};
			hint="Enter a number";
			break;
		}
		case "sum":{
			const f=`${a}x + ${b}`;
			const g=`${c}x^2`;
			questionArea.innerHTML=`Find \\( (f+g)(x) \\) for \\( f(x)=${f} \\) and \\( g(x)=${g} \\).`;
			const sum=`${c}x^2 + ${a}x + ${b}`;
			window.correctAnswer={
				correct:sum,
				alternate:sum.replace(/\s+/g,'')
			};
			hint="Enter as polynomial";
			break;
		}
		case "product":{
			const f=`${a}x + ${b}`;
			const g=`${c}x + 1`;
			questionArea.innerHTML=`Find \\( (f \\cdot g)(x) \\) for \\( f(x)=${f} \\) and \\( g(x)=${g} \\).`;
			const prod=`${a*c}x^2 + ${a*1+b*c}x + ${b*1}`;
			window.correctAnswer={
				correct:prod,
				alternate:prod.replace(/\s+/g,'')
			};
			hint="Enter as polynomial";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateInverseFunctions(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["find","verify","onetoone"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;

	switch (type){
		case "find":{
			const fExpr=`${a}x + ${b}`;
			questionArea.innerHTML=`Find the inverse of \\( f(x)=${fExpr} \\).`;
			const inv=`f^{-1}(x) = \\frac{x - ${b}}{${a}}`;
			window.correctAnswer={
				correct:inv,
				alternate:`(x-${b})/${a}`
			};
			hint="Enter as (x-b)/a";
			break;
		}
		case "verify":{
			const fExpr=`${a}x + ${b}`;
			const invExpr=`\\frac{x - ${b}}{${a}}`;
			questionArea.innerHTML=`Verify that \\( f(x)=${fExpr} \\) and \\( g(x)=${invExpr} \\) are inverses. (Enter true/false)`;
			window.correctAnswer={
				correct:"true",
				alternate:"true"
			};
			hint="Enter 'true' or 'false'";
			break;
		}
		case "onetoone":{
			questionArea.innerHTML=`Is \\( f(x)=x^2 \\) one-to-one on its natural domain? (yes/no)`;
			window.correctAnswer={
				correct:"no",
				alternate:"no"
			};
			hint="Enter 'yes' or 'no'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateTransformations(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["translation","reflection","stretch"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	const h=Math.floor(Math.random()*max)+1;
	const k=Math.floor(Math.random()*max)+1;
	const a=Math.floor(Math.random()*2)+1;

	switch (type){
		case "translation":{
			questionArea.innerHTML=`If the graph of \\( y=x^2 \\) is shifted right by ${h} and up by ${k}, what is the new equation?`;
			const eq=`y = (x - ${h})^2 + ${k}`;
			window.correctAnswer={
				correct:eq,
				alternate:eq
			};
			hint="Enter as y = (x-h)^2 + k";
			break;
		}
		case "reflection":{
			const axis=Math.random()<0.5?"x-axis":"y-axis";
			questionArea.innerHTML=`If the graph of \\( y=\\sqrt{x} \\) is reflected across the ${axis}, what is the new equation?`;
			let eq=axis==="x-axis"?"y = -√x":"y = √(-x)";
			window.correctAnswer={
				correct:eq,
				alternate:eq
			};
			hint="Enter equation";
			break;
		}
		case "stretch":{
			questionArea.innerHTML=`If the graph of \\( y=|x| \\) is stretched vertically by a factor of ${a}, what is the new equation?`;
			const eq=`y = ${a}|x|`;
			window.correctAnswer={
				correct:eq,
				alternate:eq
			};
			hint="Enter equation";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generatePowerFunctionModeling(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["direct","inverse","power"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";

	const k=Math.floor(Math.random()*max)+1;
	const x1=Math.floor(Math.random()*max)+1;
	const y1=k*x1;
	const x2=Math.floor(Math.random()*max)+1;

	switch (type){
		case "direct":{
			questionArea.innerHTML=`If y varies directly with x, and y=${y1} when x=${x1}, find y when x=${x2}.`;
			const y2=k*x2;
			window.correctAnswer={
				correct:y2.toString(),
				alternate:y2.toString()
			};
			hint="Enter a number";
			break;
		}
		case "inverse":{
			const kInv=x1*y1;
			questionArea.innerHTML=`If y varies inversely with x, and y=${y1} when x=${x1}, find y when x=${x2}.`;
			const y2=kInv/x2;
			window.correctAnswer={
				correct:y2.toFixed(2),
				alternate:y2.toString()
			};
			hint="Enter a number";
			break;
		}
		case "power":{
			const exp=Math.floor(Math.random()*2)+2;
			const y1pow=k*Math.pow(x1,exp);
			questionArea.innerHTML=`If y varies as the ${exp}rd power of x, and y=${y1pow} when x=${x1}, find y when x=${x2}.`;
			const y2=k*Math.pow(x2,exp);
			window.correctAnswer={
				correct:y2.toString(),
				alternate:y2.toString()
			};
			hint="Enter a number";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generatePolynomialEndBehavior(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["endbehavior","multiplicity","ivt"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,3);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;

	switch (type){
		case "endbehavior":{
			const deg=Math.floor(Math.random()*2)+3;
			const lc=Math.random()<0.5?1:-1;
			const poly=lc===1?`x^${deg} + ...`:`-x^${deg} + ...`;
			questionArea.innerHTML=`Describe the end behavior of \\( ${poly} \\).`;
			let desc="";
			if (deg%2===0){
				desc=lc===1?"both ends up":"both ends down";
			}else{
				desc=lc===1?"left down, right up":"left up, right down";
			}
			window.correctAnswer={
				correct:desc,
				alternate:desc
			};
			hint="Enter description like 'both ends up'";
			break;
		}
		case "multiplicity":{
			const root=a;
			const mult=Math.floor(Math.random()*2)+1;
			const poly=`(x - ${root})^${mult}`;
			questionArea.innerHTML=`For the polynomial \\( ${poly} \\), what is the multiplicity of the root at x=${root}?`;
			window.correctAnswer={
				correct:mult.toString(),
				alternate:mult.toString()
			};
			hint="Enter a number";
			break;
		}
		case "ivt":{
			const val1=Math.floor(Math.random()*10)-5;
			const val2=val1+Math.floor(Math.random()*5)+2;
			const poly=`x^3 - ${a}x + ${b}`;
			questionArea.innerHTML=`Use the Intermediate Value Theorem to show that \\( ${poly} \\) has a root between ${val1} and ${val2}. (Enter yes/no if it applies)`;
			window.correctAnswer={
				correct:"yes",
				alternate:"yes"
			};
			hint="Enter 'yes' or 'no'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateSyntheticDivision(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["divide","remainder","factor"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;
	const d=Math.floor(Math.random()*max)+1;

	switch (type){
		case "divide":{
			const dividend=`${a}x^3 + ${b}x^2 + ${c}x + ${d}`;
			const divisor=`x - ${a}`;
			questionArea.innerHTML=`Use synthetic division to divide \\( ${dividend} \\) by \\( ${divisor} \\). (Enter quotient)`;
			const coeffs=[a,b,c,d];
			const root=a;
			const result: number[]=[];
			let carry=0;
			for (let i=0; i<coeffs.length; i++){
				carry=coeffs[i]+carry*root;
				result.push(carry);
			}
			const quotient=`${result[0]}x^2 + ${result[1]}x + ${result[2]}`;
			window.correctAnswer={
				correct:quotient,
				alternate:quotient
			};
			hint="Enter polynomial";
			break;
		}
		case "remainder":{
			const dividend=`${a}x^2 + ${b}x + ${c}`;
			const divisor=`x - ${d}`;
			const remainder=a*d*d+b*d+c;
			questionArea.innerHTML=`Use the Remainder Theorem to find the remainder when \\( ${dividend} \\) is divided by \\( ${divisor} \\).`;
			window.correctAnswer={
				correct:remainder.toString(),
				alternate:remainder.toString()
			};
			hint="Enter a number";
			break;
		}
		case "factor":{
			const root=a;
			const poly=`x^3 - ${a}x^2 + ${b}x - ${a*b}`;
			questionArea.innerHTML=`Is \\( x - ${root} \\) a factor of \\( ${poly} \\)? (yes/no)`;
			window.correctAnswer={
				correct:"yes",
				alternate:"yes"
			};
			hint="Enter 'yes' or 'no'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateComplexZeros(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["fundamental","conjugate","factor"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,3);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;

	switch (type){
		case "fundamental":{
			const deg=Math.floor(Math.random()*2)+3;
			questionArea.innerHTML=`According to the Fundamental Theorem of Algebra, how many zeros does a polynomial of degree ${deg} have (counting multiplicity)?`;
			window.correctAnswer={
				correct:deg.toString(),
				alternate:deg.toString()
			};
			hint="Enter a number";
			break;
		}
		case "conjugate":{
			questionArea.innerHTML=`If a polynomial with real coefficients has a zero at \\( ${a} + ${b}i \\), what other zero must it have?`;
			const conj=`${a} - ${b}i`;
			window.correctAnswer={
				correct:conj,
				alternate:conj
			};
			hint="Enter as a+bi";
			break;
		}
		case "factor":{
			const root1=a;
			const root2=b;
			const poly=`x^2 - ${root1+root2}x + ${root1*root2}`;
			questionArea.innerHTML=`Factor \\( ${poly} \\) over the complex numbers.`;
			const factored=`(x - ${root1})(x - ${root2})`;
			window.correctAnswer={
				correct:factored,
				alternate:factored
			};
			hint="Enter as (x - a)(x - b)";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateRationalGraphAnalysis(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["domain","asymptotes","holes"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,5);
	let hint="";

	const a=Math.floor(Math.random()*max)+1;
	const b=Math.floor(Math.random()*max)+1;
	const c=Math.floor(Math.random()*max)+1;

	switch (type){
		case "domain":{
			const expr=`\\frac{x+${a}}{x-${b}}`;
			questionArea.innerHTML=`Find the domain of \\( ${expr} \\). (Enter interval)`;
			window.correctAnswer={
				correct:`(-∞, ${b}) ∪ (${b}, ∞)`,
				alternate:`(-infinity,${b}) U (${b},infinity)`
			};
			hint="Enter intervals";
			break;
		}
		case "asymptotes":{
			const expr=`\\frac{${a}x+${b}}{x-${c}}`;
			questionArea.innerHTML=`Find the vertical and horizontal asymptotes of \\( ${expr} \\).`;
			const va=`x=${c}`;
			const ha=`y=${a}`;
			window.correctAnswer={
				correct:`VA: ${va}, HA: ${ha}`,
				alternate:`VA: ${va}, HA: ${ha}`
			};
			hint="Enter as 'VA: x=..., HA: y=...'";
			break;
		}
		case "holes":{
			const holeX=a;
			const expr=`\\frac{(x-${holeX})(x+${b})}{x-${holeX}}`;
			questionArea.innerHTML=`Does the graph of \\( ${expr} \\) have a hole? If so, at what x-value?`;
			window.correctAnswer={
				correct:`x = ${holeX}`,
				alternate:`${holeX}`
			};
			hint="Enter x = value or 'none'";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateLogisticFunctions(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["identify","limit","value"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";

	const c=Math.floor(Math.random()*max)+5;
	const a=Math.floor(Math.random()*5)+1;
	const k=(Math.random()*0.5+0.2).toFixed(2);
	const x=Math.floor(Math.random()*5)+1;

	switch (type){
		case "identify":{
			const expr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			questionArea.innerHTML=`Identify the type of function: \\( ${expr} \\) (logistic, exponential, logarithmic, etc.)`;
			window.correctAnswer={
				correct:"logistic",
				alternate:"logistic"
			};
			hint="Enter function type";
			break;
		}
		case "limit":{
			const expr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			questionArea.innerHTML=`What is the carrying capacity (limit as x→∞) of \\( ${expr} \\)?`;
			window.correctAnswer={
				correct:c.toString(),
				alternate:c.toString()
			};
			hint="Enter a number";
			break;
		}
		case "value":{
			const expr=`f(x)=\\frac{${c}}{1+${a}e^{-${k}x}}`;
			const val=(c/(1+a*Math.exp(-k*x))).toFixed(2);
			questionArea.innerHTML=`Evaluate \\( ${expr} \\) at \\( x=${x} \\).`;
			window.correctAnswer={
				correct:val,
				alternate:val
			};
			hint="Enter decimal";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateExponentialModeling(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["growth","decay","half-life","cooling"];
	const type=types[Math.floor(Math.random()*types.length)];
	const max=getMaxForDifficulty(difficulty,10);
	let hint="";
	const initial=Math.floor(Math.random()*max*10)+50;
	const rate=(Math.random()*0.1+0.05).toFixed(3);
	const time=Math.floor(Math.random()*5)+1;

	switch (type){
		case "growth":{
			questionArea.innerHTML=`A population of ${initial} grows continuously at a rate of ${(parseFloat(rate)*100).toFixed(1)}% per year. Find the population after ${time} years. (Use continuous compounding formula)`;
			const result=initial*Math.exp(parseFloat(rate)*time);
			window.correctAnswer={
				correct:result.toFixed(0),
				alternate:result.toFixed(0)
			};
			hint="Enter whole number";
			break;
		}
		case "decay":{
			questionArea.innerHTML=`A radioactive substance decays at a rate of ${(parseFloat(rate)*100).toFixed(1)}% per year. If you start with ${initial} grams, how much remains after ${time} years?`;
			const result=initial*Math.exp(-parseFloat(rate)*time);
			window.correctAnswer={
				correct:result.toFixed(2),
				alternate:result.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
		case "half-life":{
			const halfLife=Math.floor(Math.random()*max)+5;
			questionArea.innerHTML=`The half-life of a substance is ${halfLife} years. If you start with ${initial} grams, how much remains after ${time} years?`;
			const k=Math.LN2/halfLife;
			const result=initial*Math.exp(-k*time);
			window.correctAnswer={
				correct:result.toFixed(2),
				alternate:result.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
		case "cooling":{
			const ambient=20;
			const initialTemp=100;
			const k=(Math.random()*0.1*(max/5)+0.05).toFixed(3);
			const t=Math.floor(Math.random()*10)+1;
			questionArea.innerHTML=`Newton's Law of Cooling: A body at ${initialTemp}°C is placed in room at ${ambient}°C. If k = ${k}, find temperature after ${t} minutes.`;
			const temp=ambient+(initialTemp-ambient)*Math.exp(-parseFloat(k)*t);
			window.correctAnswer={
				correct:temp.toFixed(1),
				alternate:temp.toFixed(1)
			};
			hint="Enter decimal";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateLogarithmicModeling(): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["richter","ph","decibel"];
	const type=types[Math.floor(Math.random()*types.length)];
	let hint="";

	const intensity=Math.floor(Math.random()*1000)+100;

	switch (type){
		case "richter":{
			questionArea.innerHTML=`An earthquake has intensity ${intensity} times the reference intensity. Find its magnitude on the Richter scale (M = log(I/I0)).`;
			const mag=Math.log10(intensity);
			window.correctAnswer={
				correct:mag.toFixed(2),
				alternate:mag.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
		case "ph":{
			const hConc=Math.pow(10,-Math.floor(Math.random()*7)-1).toExponential(1);
			questionArea.innerHTML=`A solution has [H+] = ${hConc} M. Find its pH (pH = -log[H+]).`;
			const ph=-Math.log10(parseFloat(hConc));
			window.correctAnswer={
				correct:ph.toFixed(2),
				alternate:ph.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
		case "decibel":{
			const power=Math.floor(Math.random()*1000)+10;
			questionArea.innerHTML=`A sound has intensity ${power} times the threshold. Find the sound level in decibels (dB = 10 log(I/I0)).`;
			const db=10*Math.log10(power);
			window.correctAnswer={
				correct:db.toFixed(2),
				alternate:db.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}
export function generateFinance(): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const types=["compound","continuous","apy","annuity"];
	const type=types[Math.floor(Math.random()*types.length)];
	let hint="";

	const principal=Math.floor(Math.random()*5000)+1000;
	const rate=(Math.random()*0.05+0.02).toFixed(3);
	const years=Math.floor(Math.random()*10)+1;
	const n=Math.floor(Math.random()*4)+1;

	switch (type){
		case "compound":{
			questionArea.innerHTML=`Find the amount after ${years} years if $${principal} is invested at ${(parseFloat(rate)*100).toFixed(1)}% compounded ${n} times per year.`;
			const amount=principal*Math.pow(1+parseFloat(rate)/n,n*years);
			window.correctAnswer={
				correct:amount.toFixed(2),
				alternate:amount.toFixed(2)
			};
			hint="Enter decimal (two decimals)";
			break;
		}
		case "continuous":{
			questionArea.innerHTML=`Find the amount after ${years} years if $${principal} is invested at ${(parseFloat(rate)*100).toFixed(1)}% compounded continuously.`;
			const amount=principal*Math.exp(parseFloat(rate)*years);
			window.correctAnswer={
				correct:amount.toFixed(2),
				alternate:amount.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
		case "apy":{
			questionArea.innerHTML=`Find the APY for a nominal rate of ${(parseFloat(rate)*100).toFixed(1)}% compounded ${n} times per year. (as a percentage)`;
			const apy=(Math.pow(1+parseFloat(rate)/n,n)-1)*100;
			window.correctAnswer={
				correct:apy.toFixed(2),
				alternate:apy.toFixed(2)
			};
			hint="Enter percentage (e.g., 5.25)";
			break;
		}
		case "annuity":{
			const payment=Math.floor(Math.random()*500)+100;
			questionArea.innerHTML=`You deposit $${payment} at the end of each year into an account earning ${(parseFloat(rate)*100).toFixed(1)}% compounded annually. Find the future value after ${years} years.`;
			const fv=payment*((Math.pow(1+parseFloat(rate),years)-1)/parseFloat(rate));
			window.correctAnswer={
				correct:fv.toFixed(2),
				alternate:fv.toFixed(2)
			};
			hint="Enter decimal";
			break;
		}
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}