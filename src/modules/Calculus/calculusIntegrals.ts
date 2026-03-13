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
import {questionArea} from "../../script.js";
import {getMaxCoeff, trigIntegrals} from "./calculusUtils.js";

export function generateIntegral(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let questionTypes=["polynomial", "trigonometric", "exponential", "logarithmic", "substitution", "definite", "initialValue", "area", "motion"];
    let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
    let polynomial="";
    let plainCorrectIntegral="";
    let mathExpression="";
    let maxCoeff=getMaxCoeff(difficulty);
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
                let coeff=exponent===0?Math.floor(Math.random()*100)+1 :
                    exponent===1?Math.floor(Math.random()*maxCoeff)+1 :
                        Math.floor(Math.random()*maxCoeff*2)+1;
                coefficients.push(coeff);
            }
            let terms: string[]=[];
            for (let i=0; i<exponentsArray.length; i++){
                let term=exponentsArray[i]===0?`${coefficients[i]}` :
                    exponentsArray[i]===1?`${coefficients[i]}x` :
                        `${coefficients[i]}x^{${exponentsArray[i]}}`;
                terms.push(term);
            }
            polynomial=`(${terms.join("+")})`;
            let plainIntegralTerms: string[]=[];
            for (let i=0; i<exponentsArray.length; i++){
                let newExponent=exponentsArray[i]+1;
                let newCoeff=coefficients[i]/newExponent;
                let plainTerm=`${newCoeff.toFixed(2)}x^${newExponent}`;
                plainIntegralTerms.push(plainTerm);
            }
            plainIntegralTerms.push("C");
            plainCorrectIntegral=plainIntegralTerms.join("+");
            mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
            break;
        }
        case "trigonometric":{
            let chosen=trigIntegrals[Math.floor(Math.random()*trigIntegrals.length)];
            let a=Math.floor(Math.random()*maxCoeff)+1;
            let coeff=Math.floor(Math.random()*maxCoeff)+1;
            polynomial=`${coeff}${chosen.func.replace("a", a.toString())}`;
            plainCorrectIntegral=`${(coeff/a).toFixed(2)}${chosen.plain.replace("a", a.toString()).replace("1/a", "1/"+a)}+C`.replace(/(\.00|0+)$/, "");
            mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
            break;
        }
        case "exponential":{
            let base=Math.random()<0.5?"e" : Math.floor(Math.random()*3)+2;
            let a=Math.floor(Math.random()*maxCoeff)+1;
            let coeff=Math.floor(Math.random()*maxCoeff)+1;
            if (base==="e"){
                polynomial=`${coeff}e^{${a}x}`;
                plainCorrectIntegral=`${(coeff/a).toFixed(2)}e^(${a}x)+C`;
            }
            else{
                polynomial=`${coeff}${base}^{x}`;
                plainCorrectIntegral=`${(coeff/Math.log(base as number)).toFixed(2)}${base}^x+C`;
            }
            mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
            break;
        }
        case "logarithmic":{
            let coeff=Math.floor(Math.random()*maxCoeff)+1;
            polynomial=`${coeff}/x`;
            plainCorrectIntegral=`${coeff}ln|x|+C`;
            mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
            break;
        }
        case "substitution":{
            let a=Math.floor(Math.random()*maxCoeff)+1;
            let b=Math.floor(Math.random()*5);
            let power=Math.floor(Math.random()*3)+2;
            let coeff=Math.floor(Math.random()*maxCoeff)+1;
            polynomial=`${coeff}(${a}x+${b})^{${power}}`;
            let newPower=power+1;
            plainCorrectIntegral=`${(coeff/(a*newPower)).toFixed(2)}(${a}x+${b})^${newPower}+C`.replace(/\.00/g, "");
            mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
            break;
        }
        case "definite":{
            let exponents=Array.from({ length: 3 }, ()=>Math.floor(Math.random()*4));
            let coefficients=exponents.map(()=>Math.floor(Math.random()*maxCoeff)+1);
            let [lower, upper]=[1, Math.floor(Math.random()*5)+2];
            polynomial=coefficients.map((c, i)=>`${c}x^${exponents[i]}`).join("+");
            let integral=coefficients.map((c, i)=>c/(exponents[i]+1)).reduce((a, b)=>a+b, 0);
            let result=(Math.pow(upper, exponents[0]+1)-Math.pow(lower, exponents[0]+1))*integral;
            plainCorrectIntegral=result.toFixed(2);
            mathExpression=`\\[ \\int_{${lower}}^{${upper}} ${polynomial} \\,dx=? \\]`;
            break;
        }
        case "initialValue":{
            let coeff=Math.floor(Math.random()*maxCoeff)+1;
            let exponent=Math.floor(Math.random()*3)+1;
            let xVal=Math.floor(Math.random()*3)+1;
            let yVal=Math.floor(Math.random()*20)+5;
            polynomial=`${coeff}x^${exponent}`;
            let c=yVal-(coeff/(exponent+1))*Math.pow(xVal, exponent+1);
            plainCorrectIntegral=`${(coeff/(exponent+1)).toFixed(2)}x^${exponent+1}+${c.toFixed(2)}`;
            mathExpression=`\\[ \\text{Find } f(x) \\text{ where } f'(${xVal})=${yVal} \\text{ and } f'(x)=${polynomial} \\]`;
            break;
        }
        case "area":{
            let funcs=["x^2", "sin(x)", "sqrt(x)", "2^x"];
            let func=funcs[Math.floor(Math.random()*funcs.length)];
            let [a, b]=[0, Math.floor(Math.random()*4)+1];
            plainCorrectIntegral=`∫${a}^${b} ${func} dx`;
            mathExpression=`\\[ \\text{Set up the integral for the area under } ${func} \\text{ from } ${a} \\text{ to } ${b} \\]`;
            break;
        }
        case "motion":{
            let coeff=Math.floor(Math.random()*maxCoeff)+1;
            let type=Math.random()<0.5?"velocity" : "acceleration";
            if (type==="velocity"){
                polynomial=`${coeff}t^2`;
                plainCorrectIntegral=`${(coeff/3).toFixed(2)}t^3+C`;
            }
            else{
                polynomial=`${coeff}t`;
                plainCorrectIntegral=`${(coeff/2).toFixed(2)}t^2+C`;
            }
            mathExpression=`\\[ \\text{Find position from } ${type} \\ a(t)=${polynomial} \\]`;
            break;
        }
    }
    let mathContainer=document.createElement("div");
    mathContainer.innerHTML=mathExpression||`\\[ \\int ${polynomial} \\,dx=? \\]`;
    questionArea.appendChild(mathContainer);
    if (window.MathJax&&window.MathJax.typesetPromise){
        window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
            console.log("MathJax typeset error:", err)
        );
    }
    window.correctAnswer={
        correct: plainCorrectIntegral.replace(/\s+/g, "").replace(/\^{/g, "^").replace(/}/g, "").replace(/{/g, "").toLowerCase(),
        alternate: plainCorrectIntegral
    };
    window.expectedFormat="Enter the integral as an expression, e.g., 2x^3/3+5x^2/2+C, 1/3 sin(3x)+C, etc.";
}