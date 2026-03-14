/**
 * Generates a random integration question and displays it in the global question area.
 *
 * The function randomly selects a question type (polynomial, trigonometric, exponential,
 * logarithmic, substitution, definite, initial value, area, or motion), constructs a
 * LaTeX expression for the integrand or problem statement, computes the correct
 * antiderivative or definite integral result (as a plain‑text string), and appends the
 * formatted question to the DOM. It triggers MathJax rendering and sets global variables
 * for answer validation.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that
 *                     influences the maximum coefficient value used in generated
 *                     expressions. If omitted, a default moderate value is used
 *                     (via `getMaxCoeff`).
 *
 * @remarks
 * The function relies on several imported utilities:
 * - `questionArea` (DOM element) from `../../script.js`
 * - `getMaxCoeff` and `trigIntegrals` from `./calculusUtils.js`
 * - `window.MathJax` (optional) for LaTeX rendering.
 *
 * **Question types** (each uses random coefficients scaled by `difficulty`):
 * - `polynomial`      – indefinite integral of a polynomial (answers include +C).
 * - `trigonometric`   – integral of a trigonometric function (sin(ax), cos(ax), etc.).
 * - `exponential`     – integral of e^(ax) or a^x.
 * - `logarithmic`     – integral of c/x (natural log).
 * - `substitution`    – integral of c(ax+b)^n (simple linear substitution).
 * - `definite`        – definite integral of a polynomial from lower to upper.
 * - `initialValue`    – find f(x) given f'(x) and an initial condition f(x₀)=y₀.
 * - `area`            – set up the integral for the area under a given function.
 * - `motion`          – find position from velocity or acceleration.
 *
 * **Answer formatting**:
 * - Indefinite integrals include an integration constant "+C".
 * - Coefficients are often simplified and shown with two decimal places, but
 *   trailing zeros may be removed (e.g., "2.00x^3" becomes "2x^3").
 * - The global `window.correctAnswer` stores both a normalized version (spaces
 *   removed, braces stripped) and the original plain‑text answer for flexible
 *   matching.
 *
 * **Side effects**:
 * - Clears `questionArea.innerHTML`.
 * - Appends a new `<div>` containing the LaTeX question.
 * - Calls `window.MathJax.typesetPromise` (if available) to render the math.
 * - Sets `window.correctAnswer` to an object with `correct` (normalized) and
 *   `alternate` (original) properties.
 * - Sets `window.expectedFormat` to a string describing the expected input format
 *   (e.g., "Enter the integral as an expression, e.g., 2x^3/3+5x^2/2+C, ...").
 *
 * @example
 * ```typescript
 * // Generate a default‑difficulty integral question
 * generateIntegral();
 *
 * // Generate a hard integral question
 * generateIntegral("hard");
 * ```
 */
import { questionArea } from "../../script.js";
import { getMaxCoeff } from "./calculusUtils.js";
function gcd(a: number, b: number): number{
	while (b){
		let t=b;
		b=a%b;
		a=t;
	}
	return a;
}
function formatNumber(n: number): string{
	return parseFloat(n.toFixed(2)).toString();
}
function formatFraction(num: number, den: number): string{
	let g=gcd(num,den);
	num/=g;
	den/=g;
	return den===1 ? `${num}` : `${num}/${den}`;
}
export function generateIntegral(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const questionTypes=[
		"polynomial","trigonometric","exponential","logarithmic",
		"substitution","definite","initialValue","area","motion"
	];
	const questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	const maxCoeff=getMaxCoeff(difficulty);
	let mathExpression="";
	let plainCorrectIntegral="";
	let alternateAnswer:string|undefined=undefined;
	switch (questionType){
		case "polynomial":{
			const numTerms=Math.floor(Math.random()*4)+2;
			const exponents=new Set<number>();
			while (exponents.size<numTerms){
				exponents.add(Math.floor(Math.random()*11));
			}
			const exponentsArray=Array.from(exponents).sort((a,b)=>b-a);
			const coefficients: number[]=[];
			for (const exp of exponentsArray){
				const coeff=exp===0
					?Math.floor(Math.random()*100)+1
					:exp===1
						?Math.floor(Math.random()*maxCoeff)+1
						:Math.floor(Math.random()*maxCoeff*2)+1;
				coefficients.push(coeff);
			}
			const terms: string[]=[];
			for (let i=0;i<exponentsArray.length;i++){
				const exp=exponentsArray[i];
				const coeff=coefficients[i];
				if (exp===0) terms.push(`${coeff}`);
				else if (exp===1) terms.push(`${coeff}x`);
				else terms.push(`${coeff}x^{${exp}}`);
			}
			const polynomial=`(${terms.join("+")})`;
			mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
			const integralTerms: string[]=[];
			for (let i=0;i<exponentsArray.length;i++){
				const exp=exponentsArray[i];
				const coeff=coefficients[i];
				const newExp=exp+1;
				const newCoeff=coeff/newExp;
				const xPart=newExp===1?"x":`x^${newExp}`;
				integralTerms.push(`${formatNumber(newCoeff)}${xPart}`);
			}
			integralTerms.push("C");
			plainCorrectIntegral=integralTerms.join("+");
			break;
		}
		case "trigonometric":{
			const trigOptions=[
				{ func: "sin", target: "cos", sign: -1 },
				{ func: "cos", target: "sin", sign: 1 },
				{ func: "sec^2", target: "tan", sign: 1 },
				{ func: "csc^2", target: "cot", sign: -1 },
				{ func: "sec tan", target: "sec", sign: 1 },
				{ func: "csc cot", target: "csc", sign: -1 }
			];
			const chosen=trigOptions[Math.floor(Math.random()*trigOptions.length)];
			const a=Math.floor(Math.random()*maxCoeff)+1;
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			const funcStr=`${coeff} ${chosen.func}(${a}x)`;
			mathExpression=`\\[ \\int ${funcStr} \\,dx=? \\]`;
			// Decimal answer
			const decimalCoeff=coeff/a;
			plainCorrectIntegral=`${formatNumber(chosen.sign*decimalCoeff)} ${chosen.target}(${a}x)+C`;
			// Fractional alternate
			const fractionStr=formatFraction(coeff,a);
			const signStr=chosen.sign===1 ? '' : '-';
			alternateAnswer=`${signStr}${fractionStr} ${chosen.target}(${a}x)+C`;
			break;
		}
		case "exponential":{
			const base=Math.random()<0.5?"e":Math.floor(Math.random()*3)+2;
			const a=Math.floor(Math.random()*maxCoeff)+1;
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			if (base==="e"){
				mathExpression=`\\[ \\int ${coeff}e^{${a}x} \\,dx=? \\]`;
				plainCorrectIntegral=`${formatNumber(coeff/a)}e^(${a}x)+C`;
			}
			else{
				mathExpression=`\\[ \\int ${coeff}${base}^{x} \\,dx=? \\]`;
				const lnBase=Math.log(base as number);
				plainCorrectIntegral=`${formatNumber(coeff/lnBase)}${base}^x+C`;
			}
			break;
		}
		case "logarithmic":{
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int \\frac{${coeff}}{x} \\,dx=? \\]`;
			plainCorrectIntegral=`${coeff}ln|x|+C`;
			break;
		}
		case "substitution":{
			const a=Math.floor(Math.random()*maxCoeff)+1;
			const b=Math.floor(Math.random()*5);
			const power=Math.floor(Math.random()*3)+2;
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\int ${coeff}(${a}x+${b})^{${power}} \\,dx=? \\]`;
			const newPower=power+1;
			const factor=coeff/(a*newPower);
			plainCorrectIntegral=`${formatNumber(factor)}(${a}x+${b})^${newPower}+C`;
			break;
		}
		case "definite":{
			const numTerms=3;
			const exponents=Array.from({ length: numTerms },()=>Math.floor(Math.random()*4));
			const coefficients=exponents.map(()=>Math.floor(Math.random()*maxCoeff)+1);
			const lower=1;
			const upper=Math.floor(Math.random()*5)+2;
			const polyTerms=coefficients.map((c,i)=>`${c}x^{${exponents[i]}}`);
			const polynomial=polyTerms.join("+");
			mathExpression=`\\[ \\int_{${lower}}^{${upper}} (${polynomial}) \\,dx=? \\]`;
			let result=0;
			for (let i=0;i<numTerms;i++){
				const exp=exponents[i];
				const coeff=coefficients[i];
				const antideriv=coeff/(exp+1);
				result+=antideriv*(Math.pow(upper,exp+1)-Math.pow(lower,exp+1));
			}
			plainCorrectIntegral=formatNumber(result);
			break;
		}
		case "initialValue":{
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			const exponent=Math.floor(Math.random()*3)+1;
			const xVal=Math.floor(Math.random()*3)+1;
			const yVal=Math.floor(Math.random()*20)+5;
			const polynomial=`${coeff}x^${exponent}`;
			const antiderivCoeff=coeff/(exponent+1);
			const c=yVal-antiderivCoeff*Math.pow(xVal,exponent+1);
			mathExpression=`\\[ \\text{Find } f(x) \\text{ where } f(${xVal}) = ${yVal} \\text{ and } f'(x) = ${polynomial} \\]`;
			plainCorrectIntegral=`${formatNumber(antiderivCoeff)}x^${exponent+1} + ${formatNumber(c)}`;
			break;
		}
		case "area":{
			const funcs=[
				{ expr: "x^2", antideriv: (x: number) => Math.pow(x,3)/3 },
				{ expr: "sin(x)", antideriv: (x: number) => -Math.cos(x) },
				{ expr: "sqrt(x)", antideriv: (x: number) => (2/3)*Math.pow(x,1.5) },
				{ expr: "2^x", antideriv: (x: number) => Math.pow(2,x)/Math.log(2) }
			];
			const chosen=funcs[Math.floor(Math.random()*funcs.length)];
			const a=0;
			const b=Math.floor(Math.random()*4)+1;
			const area=chosen.antideriv(b)-chosen.antideriv(a);
			mathExpression=`\\[ \\text{Area under } ${chosen.expr} \\text{ from } ${a} \\text{ to } ${b} = ? \\]`;
			plainCorrectIntegral=formatNumber(area);
			break;
		}
		case "motion":{
			const coeff=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Find position from velocity } v(t) = ${coeff}t^2 \\]`;
			plainCorrectIntegral=`${formatNumber(coeff/3)}t^3 + C`;
			alternateAnswer=`${coeff}t^3/3 + C`;
			break;
		}
		default:{
			const polynomial="x^2";
			mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
			plainCorrectIntegral="x^3/3 + C";
		}
	}
	const mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	const normalize=(s: string)=>
		s.replace(/\s+/g,"")
		 .replace(/\^{/g,"^")
		 .replace(/[{}]/g,"")
		 .toLowerCase();
	window.correctAnswer={
		correct: normalize(plainCorrectIntegral),
		alternate: alternateAnswer ? normalize(alternateAnswer) : plainCorrectIntegral
	};
	window.expectedFormat="Enter the integral as an expression, e.g., 2x^3/3+5x^2/2+C, 1/3 sin(3x)+C, etc.";
}