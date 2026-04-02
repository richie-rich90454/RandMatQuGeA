/**
 * Generates a random differentiation question and displays it in the global question area.
 *
 * The function randomly selects a question type (polynomial, trigonometric, exponential,
 * logarithmic, product, quotient, chain, implicit, higher‑order, motion, logarithmic differentiation,
 * inverse trigonometric derivatives, advanced implicit differentiation), constructs
 * a LaTeX expression for the function, computes its derivative (both in LaTeX and plain
 * text), and appends the formatted question to the DOM. It also triggers MathJax
 * rendering and sets global variables for answer validation, including plausible
 * multiple‑choice distractors.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, `"hard"`) that
 *                     influences the maximum coefficient value used in generated
 *                     expressions. If omitted, a default moderate value is used
 *                     (via `getMaxCoeff`).
 * @returns void
 * @date 2026-04-02
 *
 * @remarks
 * The function relies on several imported utilities:
 * - `questionArea` (DOM element) from `../../script.js`
 * - `getMaxCoeff`, `trigFunctions`, `expFunctions`, `logFunctions`, `latexToPlain`
 *   from `./calculusUtils.js`
 * - `window.MathJax` (optional) for LaTeX rendering.
 *
 * **Side effects**:
 * - Clears `questionArea.innerHTML`.
 * - Appends a new `<div>` containing the LaTeX question.
 * - Sets `window.correctAnswer` to an object with `correct`, `alternate`, `display`, and `choices` properties.
 *   `correct` and `alternate` hold the plain‑text derivative; `display` holds a LaTeX version for rendering.
 * - Sets `window.expectedFormat` to a string describing the expected answer format
 *   (e.g., `"Enter the derivative as an expression, e.g., 2x+3, cos(x), etc."`).
 * - If MathJax is available, calls `MathJax.typesetPromise` on the new element.
 *
 * @example
 * generateDerivative();
 * generateDerivative("hard");
 */
import {questionArea} from "../../script.js";
import {getMaxCoeff, trigFunctions, expFunctions, logFunctions, latexToPlain} from "./calculusUtils.js";

export function generateDerivative(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let questionTypes=["polynomial", "trigonometric", "exponential", "logarithmic", "product", "quotient", "chain", "implicit", "higherOrder", "motion", "logDiff", "inverseTrig", "implicitAdvanced"];
	let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
	let polynomial="";
	let correctDerivative="";
	let plainCorrectDerivative="";
	let mathExpression="";
	let maxCoeff=getMaxCoeff(difficulty);
	let choices: string[]=[];
	switch (questionType){
		case "polynomial":{
			let numTerms=Math.floor(Math.random()*4)+2;
			let exponents=new Set<number>();
			while (exponents.size<numTerms){
				exponents.add(Math.floor(Math.random()*11));
			}
			let exponentsArray=Array.from(exponents).sort((a, b)=>b-a);
			let coefficients: number[]=[];
			for (let exponent of exponentsArray){
				let coeff;
				if (exponent===0){
					coeff=Math.floor(Math.random()*100)+1;
				}
				else if (exponent===1){
					coeff=Math.floor(Math.random()*maxCoeff)+1;
				}
				else{
					coeff=Math.floor(Math.random()*maxCoeff*2)+1;
				}
				coefficients.push(coeff);
			}
			let terms: string[]=[];
			let plainTerms: string[]=[];
			for (let i=0; i<exponentsArray.length; i++){
				let term;
				let plainTerm;
				if (exponentsArray[i]===0){
					term=`${coefficients[i]}`;
					plainTerm=`${coefficients[i]}`;
				}
				else if (exponentsArray[i]===1){
					term=`${coefficients[i]}x`;
					plainTerm=`${coefficients[i]}x`;
				}
				else{
					term=`${coefficients[i]}x^{${exponentsArray[i]}}`;
					plainTerm=`${coefficients[i]}x^${exponentsArray[i]}`;
				}
				terms.push(term);
				plainTerms.push(plainTerm);
			}
			polynomial=`(${terms.join("+")})`;
			let derivativeTerms: string[]=[];
			let plainDerivativeTerms: string[]=[];
			for (let i=0; i<exponentsArray.length; i++){
				if (exponentsArray[i]===0) continue;
				let newCoeff=coefficients[i]*exponentsArray[i];
				let newExponent=exponentsArray[i]-1;
				let term;
				let plainTerm;
				if (newExponent===0){
					term=`${newCoeff}`;
					plainTerm=`${newCoeff}`;
				}
				else if (newExponent===1){
					term=`${newCoeff}x`;
					plainTerm=`${newCoeff}x`;
				}
				else{
					term=`${newCoeff}x^{${newExponent}}`;
					plainTerm=`${newCoeff}x^${newExponent}`;
				}
				derivativeTerms.push(term);
				plainDerivativeTerms.push(plainTerm);
			}
			if (derivativeTerms.length===0){
				correctDerivative="0";
				plainCorrectDerivative="0";
			}
			else{
				correctDerivative=derivativeTerms.join("+");
				plainCorrectDerivative=plainDerivativeTerms.join("+");
			}
			mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
			choices=[plainCorrectDerivative];
			let correctNumTerms=plainDerivativeTerms.length;
			if (correctNumTerms>0){
				let altTerms=[...plainDerivativeTerms];
				if (altTerms.length>0){
					altTerms[0]=`${parseInt(altTerms[0])+1}`;
					choices.push(altTerms.join("+"));
				}
				altTerms=[...plainDerivativeTerms];
				if (altTerms.length>0){
					altTerms[0]=`${parseInt(altTerms[0])-1}`;
					choices.push(altTerms.join("+"));
				}
				choices.push(plainDerivativeTerms.map(t=>t.replace(/x\^\d+/, "x")).join("+"));
				choices.push(plainDerivativeTerms.map(t=>t.replace(/x\^\d+/, "x^"+(parseInt(t.match(/\d+$/)?.[0]||"1")+1))).join("+"));
			}
			break;
		}
		case "trigonometric":{
			let trig=trigFunctions[Math.floor(Math.random()*trigFunctions.length)];
			let coeff=Math.floor(Math.random()*maxCoeff)+1;
			polynomial=`${coeff} ${trig.func}`;
			correctDerivative=`${coeff} \\cdot ${trig.deriv}`;
			plainCorrectDerivative=`${coeff}*${trig.plainDeriv}`;
			mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
			choices=[plainCorrectDerivative];
			choices.push(`${coeff}*${trig.func}`);
			let wrongSign;
			if (trig.plainDeriv.startsWith("-")){
				wrongSign=trig.plainDeriv.substring(1);
			}
			else{
				wrongSign="-"+trig.plainDeriv;
			}
			choices.push(`${coeff}*${wrongSign}`);
			if (trig.func.includes("sin")) choices.push(`${coeff}*cos(x)`);
			if (trig.func.includes("cos")) choices.push(`${coeff}*-sin(x)`);
			break;
		}
		case "exponential":{
			let exp=expFunctions[Math.floor(Math.random()*expFunctions.length)];
			let coeff=Math.floor(Math.random()*maxCoeff)+1;
			polynomial=`${coeff} ${exp.func}`;
			correctDerivative=`${coeff} \\cdot ${exp.deriv}`;
			plainCorrectDerivative=`${coeff}*${exp.plainDeriv}`;
			mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
			choices=[plainCorrectDerivative];
			choices.push(`${coeff}*${exp.func}`);
			choices.push(`${coeff}*${exp.plainDeriv.replace(/e\^/,"")}`);
			choices.push(`${coeff}*${exp.plainDeriv.replace(/e\^x/,"x*e^{x}")}`);
			break;
		}
		case "logarithmic":{
			let log=logFunctions[Math.floor(Math.random()*logFunctions.length)];
			polynomial=log.func;
			correctDerivative=log.deriv;
			plainCorrectDerivative=log.plainDeriv;
			mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
			choices=[plainCorrectDerivative];
			choices.push(`1/${polynomial.replace(/ln/,"x")}`);
			choices.push(`1/x`);
			choices.push(`1/(${polynomial.replace(/ln/,"")})`);
			break;
		}
		case "product":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let linear=`${a}x`;
			let trigProd=trigFunctions[Math.floor(Math.random()*trigFunctions.length)];
			polynomial=`(${linear}) \\cdot (${trigProd.func})`;
			correctDerivative=`${a} \\cdot ${trigProd.func}+(${linear}) \\cdot (${trigProd.deriv})`;
			plainCorrectDerivative=`${a}*${latexToPlain(trigProd.func)}+(${linear})*${trigProd.plainDeriv}`;
			mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
			choices=[plainCorrectDerivative];
			choices.push(`${a}*${latexToPlain(trigProd.func)}+(${linear})*${trigProd.plainDeriv}`.replace(/\+/,"-"));
			choices.push(`${a}*${latexToPlain(trigProd.deriv)}+(${linear})*${latexToPlain(trigProd.func)}`);
			choices.push(`${a}*${latexToPlain(trigProd.func)}*${latexToPlain(trigProd.deriv)}`);
			break;
		}
		case "quotient":{
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*6);
			let trigQuot=trigFunctions[Math.floor(Math.random()*trigFunctions.length)];
			let num=`${b}x+${c}`;
			polynomial=`\\frac{${num}}{${trigQuot.func}}`;
			correctDerivative=`\\frac{${b} \\cdot ${trigQuot.func}-(${num}) \\cdot ${trigQuot.deriv}}{(${trigQuot.func})^{2}}`;
			plainCorrectDerivative=`(${b}*${latexToPlain(trigQuot.func)}-(${num})*${trigQuot.plainDeriv})/(${latexToPlain(trigQuot.func)})^2`;
			mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
			choices=[plainCorrectDerivative];
			choices.push(`(${b}*${latexToPlain(trigQuot.func)}+(${num})*${trigQuot.plainDeriv})/(${latexToPlain(trigQuot.func)})^2`);
			choices.push(`(${b}*${latexToPlain(trigQuot.deriv)}-(${num})*${latexToPlain(trigQuot.func)})/(${latexToPlain(trigQuot.func)})^2`);
			choices.push(`${b}*${latexToPlain(trigQuot.deriv)}/(${latexToPlain(trigQuot.func)})`);
			break;
		}
		case "chain":{
			let chainType=Math.floor(Math.random()*3);
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*3);
			let inner=`${a}x+${b}`;
			let plainInner=`${a}x+${b}`;
			if (chainType===0){
				let trigFunc=trigFunctions[Math.floor(Math.random()*2)];
				polynomial=`${trigFunc.func.replace("x", inner)}`;
				correctDerivative=`${trigFunc.deriv.replace("x", inner)} \\cdot ${a}`;
				plainCorrectDerivative=`${trigFunc.plainDeriv.replace("x", plainInner)}*${a}`;
				choices=[plainCorrectDerivative];
				choices.push(`${trigFunc.plainDeriv.replace("x", plainInner)}`);
				choices.push(`${trigFunc.plainDeriv.replace("x", plainInner)}*${a+1}`);
				choices.push(`${trigFunc.plainDeriv.replace("x", plainInner)}/${a}`);
			}
			else if (chainType===1){
				polynomial=`e^{${inner}}`;
				correctDerivative=`e^{${inner}} \\cdot ${a}`;
				plainCorrectDerivative=`e^(${plainInner})*${a}`;
				choices=[plainCorrectDerivative];
				choices.push(`e^(${plainInner})`);
				choices.push(`${a}*e^(${plainInner})*${plainInner}`);
				choices.push(`e^(${plainInner})*${a+1}`);
			}
			else{
				let k=Math.floor(Math.random()*3)+2;
				polynomial=`(${inner})^{${k}}`;
				correctDerivative=`${k} (${inner})^{${k-1}} \\cdot ${a}`;
				plainCorrectDerivative=`${k}*(${plainInner})^${k-1}*${a}`;
				choices=[plainCorrectDerivative];
				choices.push(`${k}*(${plainInner})^${k-1}`);
				choices.push(`${k}*(${plainInner})^${k}*${a}`);
				choices.push(`${k-1}*(${plainInner})^${k-2}*${a}`);
			}
			break;
		}
		case "implicit":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			polynomial=`${a}x^{2}+${b}y^{2}=1`;
			correctDerivative=`-\\frac{${a}x}{${b}y}`;
			plainCorrectDerivative=`-(${a}x)/(${b}y)`;
			mathExpression=`\\[ \\text{Find } \\frac{dy}{dx} \\text{ given } ${polynomial} \\]`;
			choices=[plainCorrectDerivative];
			choices.push(`(${a}x)/(${b}y)`);
			choices.push(`-(${b}x)/(${a}y)`);
			choices.push(`-(${a}y)/(${b}x)`);
			break;
		}
		case "higherOrder":{
			let coeff=Math.floor(Math.random()*maxCoeff*2)+1;
			let exp=Math.floor(Math.random()*4)+2;
			polynomial=`${coeff}x^{${exp}}`;
			let order=Math.floor(Math.random()*2)+2;
			let deriv=coeff;
			let currExp=exp;
			for (let i=0; i<order; i++){
				deriv *= currExp;
				currExp--;
			}
			if (currExp<0){
				correctDerivative="0";
				plainCorrectDerivative="0";
			}
			else if (currExp===0){
				correctDerivative=`${deriv}`;
				plainCorrectDerivative=`${deriv}`;
			}
			else if (currExp===1){
				correctDerivative=`${deriv}x`;
				plainCorrectDerivative=`${deriv}x`;
			}
			else{
				correctDerivative=`${deriv}x^{${currExp}}`;
				plainCorrectDerivative=`${deriv}x^${currExp}`;
			}
			mathExpression=`\\[ \\frac{d^{${order}}}{dx^{${order}}} ${polynomial}=? \\]`;
			choices=[plainCorrectDerivative];
			choices.push(`${coeff*exp}x^{${exp}}`);
			choices.push(`${coeff*exp}x^{${exp-1}}`);
			if (order>1) choices.push(`${coeff*exp*(exp-1)}x^{${exp-2}}`);
			break;
		}
		case "motion":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			polynomial=`${a}t^{2}+${b}t`;
			correctDerivative=`${2*a}t+${b}`;
			plainCorrectDerivative=`${2*a}t+${b}`;
			mathExpression=`\\[ \\text{If position } s(t)=${polynomial}, \\text{ find velocity } v(t)=? \\]`;
			choices=[plainCorrectDerivative];
			choices.push(`${a}t+${b}`);
			choices.push(`${2*a}t`);
			choices.push(`${2*a}t+${b-1}`);
			break;
		}
		case "logDiff":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\text{Use logarithmic differentiation to find } \\frac{dy}{dx} \\text{ for } y=(${b}x+${c})^{${a}\\sin x} \\]`;
			plainCorrectDerivative=`(${b}x+${c})^(${a}*sin(x))*(${a}*cos(x)*ln(${b}x+${c})+(${a}*${b}*sin(x))/(${b}x+${c}))`;
			correctDerivative=`(${b}x+${c})^{${a}\\sin x}\\left(${a}\\cos x\\ln(${b}x+${c})+\\frac{${a}${b}\\sin x}{${b}x+${c}}\\right)`;
			choices=[plainCorrectDerivative];
			choices.push(`(${b}x+${c})^(${a}*sin(x))*(${a}*cos(x)*ln(${b}x+${c}))`);
			choices.push(`(${b}x+${c})^(${a}*sin(x))*(${a}*${b}*sin(x))/(${b}x+${c})`);
			choices.push(`${a}*(${b}x+${c})^(${a}*sin(x)-1)*${b}*cos(x)`);
			break;
		}
		case "inverseTrig":{
			let subType=Math.floor(Math.random()*3);
			let a=Math.floor(Math.random()*maxCoeff)+1;
			if (subType===0){
				polynomial=`\\arcsin(${a}x)`;
				correctDerivative=`\\frac{${a}}{\\sqrt{1-${a*a}x^{2}}}`;
				plainCorrectDerivative=`${a}/sqrt(1-${a*a}x^2)`;
			}
			else if (subType===1){
				polynomial=`\\arccos(${a}x)`;
				correctDerivative=`-\\frac{${a}}{\\sqrt{1-${a*a}x^{2}}}`;
				plainCorrectDerivative=`-${a}/sqrt(1-${a*a}x^2)`;
			}
			else{
				polynomial=`\\arctan(${a}x)`;
				correctDerivative=`\\frac{${a}}{1+${a*a}x^{2}}`;
				plainCorrectDerivative=`${a}/(1+${a*a}x^2)`;
			}
			mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
			choices=[plainCorrectDerivative];
			choices.push(`${a}/(1+${a*a}x^2)`);
			choices.push(`${a}/sqrt(1-${a*a}x^2)`);
			choices.push(`-${a}/sqrt(1-${a*a}x^2)`);
			break;
		}
		case "implicitAdvanced":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*maxCoeff)+1;
			polynomial=`${a}x^{2}+${b}xy+${c}y^{2}=7`;
			let x0=1;
			let y0=Math.floor(Math.random()*3)+1;
			while (a*x0*x0+b*x0*y0+c*y0*y0!==7){
				y0=Math.floor(Math.random()*3)+1;
			}
			correctDerivative=`\\frac{dy}{dx}=-\\frac{${2*a}x+${b}y}{${b}x+${2*c}y}`;
			plainCorrectDerivative=`-(${2*a}x+${b}y)/(${b}x+${2*c}y)`;
			let slope=-((2*a*x0+b*y0)/(b*x0+2*c*y0));
			let tangent=`y-${y0}=${slope.toFixed(2)}(x-${x0})`;
			mathExpression=`\\[ \\text{Find } \\frac{dy}{dx} \\text{ for } ${polynomial} \\text{ and the tangent line at } (${x0},${y0}). \\]`;
			plainCorrectDerivative=`dy/dx=${plainCorrectDerivative}, tangent: ${tangent}`;
			correctDerivative=`\\frac{dy}{dx}=${correctDerivative},\\ \\text{tangent: } ${tangent}`;
			choices=[plainCorrectDerivative];
			choices.push(`dy/dx=-(${2*a}x+${b}y)/(${b}x+${2*c}y), tangent: y-${y0}=${(slope+0.5).toFixed(2)}(x-${x0})`);
			choices.push(`dy/dx=(${2*a}x+${b}y)/(${b}x+${2*c}y), tangent: y-${y0}=${(-slope).toFixed(2)}(x-${x0})`);
			choices.push(`dy/dx=-(${b}x+${2*c}y)/(${2*a}x+${b}y), tangent: y-${y0}=${(1/slope).toFixed(2)}(x-${x0})`);
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(plainCorrectDerivative)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=plainCorrectDerivative;
		else uniqueChoices=[plainCorrectDerivative];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	window.correctAnswer={
		correct: plainCorrectDerivative,
		alternate: plainCorrectDerivative,
		display: correctDerivative,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter the derivative as an expression, e.g., 2x+3, cos(x), etc.";
}