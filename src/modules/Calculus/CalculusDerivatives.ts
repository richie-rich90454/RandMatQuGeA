import type {RngFn, QuestionDto} from "../../types/global";
import {getMaxCoeff, trigFunctions, expFunctions, logFunctions, latexToPlain} from "./CalculusUtils.js";
import {fourOptions} from "../shared/Options.js";
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
 * @returns QuestionDto
 * @date 2026-04-18
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
export function generateDerivative(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let questionTypes=["polynomial","trigonometric","exponential","logarithmic","product","quotient","chain","implicit","higherOrder","motion","logDiff","inverseTrig","implicitAdvanced"];
    let questionType=questionTypes[Math.floor(rng()*questionTypes.length)];
    let polynomial="";
    let correctDerivative="";
    let plainCorrectDerivative="";
    let mathExpression="";
    let maxCoeff=getMaxCoeff(difficulty);
    let choices: string[]=[];
    switch(questionType){
        case "polynomial":{
            let numTerms=Math.floor(rng()*4)+2;
            let exponents=new Set<number>();
            let expAttempts=0;
            while(exponents.size<numTerms&&expAttempts<100){
                exponents.add(Math.floor(rng()*11));
                expAttempts++;
            }
            let fillExp=0;
            while(exponents.size<numTerms){
                exponents.add(fillExp++);
            }
            let exponentsArray=Array.from(exponents).sort((a,b)=>b-a);
            let coefficients: number[]=[];
            for(let exponent of exponentsArray){
                let coeff;
                if(exponent===0){
                    coeff=Math.floor(rng()*100)+1;
                }
                else if(exponent===1){
                    coeff=Math.floor(rng()*maxCoeff)+1;
                }
                else{
                    coeff=Math.floor(rng()*maxCoeff*2)+1;
                }
                coefficients.push(coeff);
            }
            let terms: string[]=[];
            let plainTerms: string[]=[];
            for(let i=0;i<exponentsArray.length;i++){
                let term;
                let plainTerm;
                if(exponentsArray[i]===0){
                    term=`${coefficients[i]}`;
                    plainTerm=`${coefficients[i]}`;
                }
                else if(exponentsArray[i]===1){
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
            for(let i=0;i<exponentsArray.length;i++){
                if(exponentsArray[i]===0) continue;
                let newCoeff=coefficients[i]*exponentsArray[i];
                let newExponent=exponentsArray[i]-1;
                let term;
                let plainTerm;
                if(newExponent===0){
                    term=`${newCoeff}`;
                    plainTerm=`${newCoeff}`;
                }
                else if(newExponent===1){
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
            if(derivativeTerms.length===0){
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
            if(correctNumTerms>0){
                let altTerms=[...plainDerivativeTerms];
                if(altTerms.length>0){
                    let firstTerm=altTerms[0];
                    let coeffMatch=firstTerm.match(/^(\d+)/);
                    if(coeffMatch){
                        let coeffNum=parseInt(coeffMatch[1]);
                        altTerms[0]=`${coeffNum+1}${firstTerm.slice(coeffMatch[1].length)}`;
                    }
                    else if(firstTerm==="x"){
                        altTerms[0]=`2x`;
                    }
                    else if(firstTerm==="-x"){
                        altTerms[0]=`-2x`;
                    }
                    else if(firstTerm.match(/^x\^/)){
                        altTerms[0]=`2${firstTerm}`;
                    }
                    choices.push(altTerms.join("+"));
                }
                altTerms=[...plainDerivativeTerms];
                if(altTerms.length>0){
                    let firstTerm=altTerms[0];
                    let coeffMatch=firstTerm.match(/^(\d+)/);
                    if(coeffMatch){
                        let coeffNum=parseInt(coeffMatch[1]);
                        let newCoeff=coeffNum-1;
                        if(newCoeff>0){
                            altTerms[0]=`${newCoeff}${firstTerm.slice(coeffMatch[1].length)}`;
                        }
                        else if(newCoeff===0){
                            altTerms.shift();
                        }
                    }
                    else if(firstTerm==="x"){
                        altTerms[0]=``;
                        altTerms.shift();
                    }
                    else if(firstTerm==="-x"){
                        altTerms[0]=``;
                        altTerms.shift();
                    }
                    if(altTerms.length>0) choices.push(altTerms.join("+"));
                }
                choices.push(plainDerivativeTerms.map(t=>t.replace(/x\^\d+/, "x")).join("+"));
                let lastTerm=plainDerivativeTerms[plainDerivativeTerms.length-1];
                let expMatch=lastTerm.match(/\^(\d+)/);
                if(expMatch){
                    let newExp=parseInt(expMatch[1])+1;
                    choices.push(plainDerivativeTerms.map(t=>t.replace(/\^(\d+)/, `^${newExp}`)).join("+"));
                }
            }
            break;
        }
        case "trigonometric":{
            let trig=trigFunctions[Math.floor(rng()*trigFunctions.length)];
            let coeff=Math.floor(rng()*maxCoeff)+1;
            polynomial=`${coeff} ${trig.func}`;
            correctDerivative=`${coeff} \\cdot ${trig.deriv}`;
            plainCorrectDerivative=`${coeff}*${trig.plainDeriv}`;
            mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
            // The three candidates are the function handed back undifferentiated,
            // the derivative with its sign dropped, and the derivative of the
            // function this one is confused with. Each was previously picked by
            // testing whether the name contained "sin" or "cos", so a tangent,
            // secant, cosecant or cotangent question got two options: the pair the
            // name test matched was the key itself and got dropped as a duplicate.
            choices=fourOptions(plainCorrectDerivative, [
                `${coeff}*${trig.plainFunc}`,
                `${coeff}*${trig.plainDeriv.startsWith("-")?trig.plainDeriv.substring(1):"-"+trig.plainDeriv}`,
                `${coeff}*${trig.plainSwap}`
            ]);
            break;
        }
        case "exponential":{
            let exp=expFunctions[Math.floor(rng()*expFunctions.length)];
            let coeff=Math.floor(rng()*maxCoeff)+1;
            polynomial=`${coeff} ${exp.func}`;
            correctDerivative=`${coeff} \\cdot ${exp.deriv}`;
            plainCorrectDerivative=`${coeff}*${exp.plainDeriv}`;
            mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
            // Handing the function back is a mistake for a base of two and the
            // answer for a base of e, so it is only offered where it is wrong. The
            // previous candidates were made by rewriting the text "e^" inside the
            // derivative, so for a base of two nothing was rewritten and one option
            // was offered three times.
            let isEuler=exp.plainFunc==="e^x";
            choices=fourOptions(plainCorrectDerivative, isEuler?[
                `${coeff}*x*e^x`,
                `${coeff}`,
                "e^x",
                `${coeff}*e^x*ln(x)`
            ]:[
                `${coeff}*${exp.plainFunc}`,
                `${coeff}*x*${exp.plainDeriv}`,
                `${coeff}*x*${exp.plainFunc}`,
                `${coeff+1}*${exp.plainDeriv}`
            ]);
            break;
        }
        case "logarithmic":{
            let log=logFunctions[Math.floor(rng()*logFunctions.length)];
            polynomial=log.func;
            correctDerivative=log.deriv;
            plainCorrectDerivative=log.plainDeriv;
            mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
            // The candidates are the power rule, the quotient rule, a doubled
            // denominator and the missing base factor. The previous candidates were
            // built by replacing the letters "ln" inside the LaTeX of the function,
            // which turned "\ln(x)" into "\x(x)": two unreadable options and a third
            // that was the answer.
            let isNatural=log.deriv.indexOf("\\frac{1}{x}")===0;
            choices=fourOptions(plainCorrectDerivative, isNatural?[
                "1/(x*x)",
                "ln(x)/x",
                "1/(2*x)",
                "x*x"
            ]:[
                "1/x",
                "ln(x)/x",
                "1/(2*x)",
                "1/(x*x)"
            ]);
            break;
        }
        case "product":{
            let a=Math.floor(rng()*maxCoeff)+1;
            let linear=`${a}x`;
            let trigProd=trigFunctions[Math.floor(rng()*trigFunctions.length)];
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
            let b=Math.floor(rng()*maxCoeff)+1;
            let c=Math.floor(rng()*6);
            let trigQuot=trigFunctions[Math.floor(rng()*trigFunctions.length)];
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
            let chainType=Math.floor(rng()*3);
            let a=Math.floor(rng()*maxCoeff)+1;
            let b=Math.floor(rng()*3);
            let inner=`${a}x+${b}`;
            let plainInner=`${a}x+${b}`;
            if(chainType===0){
                let trigFunc=trigFunctions[Math.floor(rng()*2)];
                polynomial=`${trigFunc.func.replace("x", inner)}`;
                correctDerivative=`${trigFunc.deriv.replace("x", inner)} \\cdot ${a}`;
                plainCorrectDerivative=`${trigFunc.plainDeriv.replace("x", plainInner)}*${a}`;
                // The three candidates are the derivative with the chain-rule factor
                // dropped, the factor applied twice, and the factor divided in. One
                // of them used to be the derivative with the argument dropped, which
                // is the answer itself at a chain factor of one.
                choices=fourOptions(plainCorrectDerivative, [
                    `${trigFunc.plainDeriv.replace("x", plainInner)}`,
                    `${trigFunc.plainDeriv.replace("x", plainInner)}*${a+1}`,
                    `${trigFunc.plainDeriv.replace("x", plainInner)}/${a}`,
                    `${trigFunc.plainDeriv.replace("x", plainInner)}*${a*2}`
                ]);
            }
            else if(chainType===1){
                polynomial=`e^{${inner}}`;
                correctDerivative=`e^{${inner}} \\cdot ${a}`;
                plainCorrectDerivative=`e^(${plainInner})*${a}`;
                choices=fourOptions(plainCorrectDerivative, [
                    `e^(${plainInner})`,
                    `${a}*e^(${plainInner})*${plainInner}`,
                    `e^(${plainInner})*${a+1}`,
                    `e^(${plainInner})*${a*2}`
                ]);
            }
            else{
                let k=Math.floor(rng()*3)+2;
                polynomial=`(${inner})^{${k}}`;
                correctDerivative=`${k} (${inner})^{${k-1}} \\cdot ${a}`;
                plainCorrectDerivative=`${k}*(${plainInner})^${k-1}*${a}`;
                // The chain factor is never dropped, because a chain factor of one
                // makes the dropped form the same function as the answer. The
                // candidates displace the factor or the power instead, which is
                // wrong for every inner function.
                choices=fourOptions(plainCorrectDerivative, [
                    `${k}*(${plainInner})^${k-1}*${a+1}`,
                    `${k}*(${plainInner})^${k}*${a}`,
                    `${k+1}*(${plainInner})^${k-1}*${a}`,
                    `${k}*(${plainInner})^${k-1}*${a*2}`
                ]);
            }
            break;
        }
        case "implicit":{
            let a=Math.floor(rng()*maxCoeff)+1;
            let b=Math.floor(rng()*maxCoeff)+1;
            polynomial=`${a}x^{2}+${b}y^{2}=1`;
            correctDerivative=`-\\frac{${a}x}{${b}y}`;
            plainCorrectDerivative=`-(${a}x)/(${b}y)`;
            mathExpression=`\\[ \\text{Find } \\frac{dy}{dx} \\text{ given } ${polynomial} \\]`;
            // The chain rule on both sides gives 2a x and 2b y. The fourth candidate
            // is the same quotient with the factor of two dropped from the
            // numerator, which is what the question produces when the derivative of
            // x squared is read as x.
            choices=fourOptions(plainCorrectDerivative, [
                `(${a}x)/(${b}y)`,
                `-(${b}x)/(${a}y)`,
                `-(${a}y)/(${b}x)`,
                `-(${a}x)/(${b}x)`
            ]);
            break;
        }
        case "higherOrder":{
            let coeff=Math.floor(rng()*maxCoeff*2)+1;
            let exp=Math.floor(rng()*4)+2;
            polynomial=`${coeff}x^{${exp}}`;
            let order=Math.floor(rng()*2)+2;
            let deriv=coeff;
            let currExp=exp;
            for(let i=0;i<order;i++){
                deriv*=currExp;
                currExp--;
            }
            if(currExp<0){
                correctDerivative="0";
                plainCorrectDerivative="0";
            }
            else if(currExp===0){
                correctDerivative=`${deriv}`;
                plainCorrectDerivative=`${deriv}`;
            }
            else if(currExp===1){
                correctDerivative=`${deriv}x`;
                plainCorrectDerivative=`${deriv}x`;
            }
            else{
                correctDerivative=`${deriv}x^{${currExp}}`;
                plainCorrectDerivative=`${deriv}x^${currExp}`;
            }
            mathExpression=`\\[ \\frac{d^{${order}}}{dx^{${order}}} ${polynomial}=? \\]`;
            // The candidates are the first, second and third derivatives and the
            // function itself. One of the three derivatives is the answer at each
            // order asked for, so the function is what guarantees a fourth option:
            // the old third-derivative candidate was printed with braces around the
            // exponent, so at an exponent of zero it read as the answer in a
            // different spelling and the question had two correct options.
            choices=fourOptions(plainCorrectDerivative, [
                `${coeff*exp}x^${exp}`,
                `${coeff*exp*(exp-1)}x^${exp-1}`,
                exp-2<0?`${coeff*exp*(exp-1)*(exp-2)}`:`${coeff*exp*(exp-1)*(exp-2)}x^${exp-2}`,
                `${coeff}x^${exp}`
            ]);
            break;
        }
        case "motion":{
            let a=Math.floor(rng()*maxCoeff)+1;
            let b=Math.floor(rng()*maxCoeff)+1;
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
            let a=Math.floor(rng()*maxCoeff)+1;
            let b=Math.floor(rng()*maxCoeff)+1;
            let c=Math.floor(rng()*maxCoeff)+1;
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
            let subType=Math.floor(rng()*3);
            let a=Math.floor(rng()*maxCoeff)+1;
            // The three inverse trigonometric derivatives are offered against each
            // other, with the sign of the one asked for. The old candidates were the
            // arcsine and arctangent forms only, so the branch always offered the
            // answer plus two of its own family and shipped three options; and the
            // arctangent form was the answer for every arctangent question.
            if(subType===0){
                polynomial=`\\arcsin(${a}x)`;
                correctDerivative=`\\frac{${a}}{\\sqrt{1-${a*a}x^{2}}}`;
                plainCorrectDerivative=`${a}/sqrt(1-${a*a}x^2)`;
                choices=fourOptions(plainCorrectDerivative, [
                    `-${a}/sqrt(1-${a*a}x^2)`,
                    `${a}/(1+${a*a}x^2)`,
                    `-${a}/(1+${a*a}x^2)`,
                    `${a}/sqrt(1-${a*a}x)`
                ]);
            }
            else if(subType===1){
                polynomial=`\\arccos(${a}x)`;
                correctDerivative=`-\\frac{${a}}{\\sqrt{1-${a*a}x^{2}}}`;
                plainCorrectDerivative=`-${a}/sqrt(1-${a*a}x^2)`;
                choices=fourOptions(plainCorrectDerivative, [
                    `${a}/sqrt(1-${a*a}x^2)`,
                    `${a}/(1+${a*a}x^2)`,
                    `-${a}/(1+${a*a}x^2)`,
                    `${a}/sqrt(1-${a*a}x)`
                ]);
            }
            else{
                polynomial=`\\arctan(${a}x)`;
                correctDerivative=`\\frac{${a}}{1+${a*a}x^{2}}`;
                plainCorrectDerivative=`${a}/(1+${a*a}x^2)`;
                choices=fourOptions(plainCorrectDerivative, [
                    `${a}/sqrt(1-${a*a}x^2)`,
                    `-${a}/sqrt(1-${a*a}x^2)`,
                    `-${a}/(1+${a*a}x^2)`,
                    `${a}/sqrt(1-${a*a}x)`
                ]);
            }
            mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
            break;
        }
        case "implicitAdvanced":{
            let a=Math.floor(rng()*maxCoeff)+1;
            let b=Math.floor(rng()*maxCoeff)+1;
            let c=Math.floor(rng()*maxCoeff)+1;
            let x0=1;
            let y0=Math.floor(rng()*3)+1;
            let constant=a*x0*x0+b*x0*y0+c*y0*y0;
            let denominator=b*x0+2*c*y0;
            let attempts=0;
            while(denominator===0&&attempts<10){
                y0=Math.floor(rng()*3)+1;
                constant=a*x0*x0+b*x0*y0+c*y0*y0;
                denominator=b*x0+2*c*y0;
                attempts++;
            }
            if(denominator===0){
                y0=1;
                constant=a*x0*x0+b*x0*y0+c*y0*y0;
                denominator=b*x0+2*c*y0;
            }
            polynomial=`${a}x^{2}+${b}xy+${c}y^{2}=${constant}`;
            correctDerivative=`\\frac{dy}{dx}=-\\frac{${2*a}x+${b}y}{${b}x+${2*c}y}`;
            plainCorrectDerivative=`-(${2*a}x+${b}y)/(${b}x+${2*c}y)`;
            let slope=-((2*a*x0+b*y0)/(b*x0+2*c*y0));
            let tangent=`y-${y0}=${slope.toFixed(2)}(x-${x0})`;
            mathExpression=`\\[ \\text{Find } \\frac{dy}{dx} \\text{ for } ${polynomial} \\text{ and the tangent line at } (${x0},${y0}). \\]`;
            plainCorrectDerivative=`dy/dx=${plainCorrectDerivative}, tangent: ${tangent}`;
            correctDerivative=`\\frac{dy}{dx}=${correctDerivative},\\ \\text{tangent: } ${tangent}`;
            // Each candidate displaces the tangent slope, and the last two also
            // invert the quotient. The third candidate used to swap numerator for
            // denominator, which is the answer itself whenever the curve is a circle
            // and the branch shipped three options.
            let line=(value: number): string=>`dy/dx=-(${2*a}x+${b}y)/(${b}x+${2*c}y), tangent: y-${y0}=${value.toFixed(2)}(x-${x0})`;
            choices=fourOptions(plainCorrectDerivative, [
                line(slope+0.5),
                `dy/dx=(${2*a}x+${b}y)/(${b}x+${2*c}y), tangent: y-${y0}=${(-slope).toFixed(2)}(x-${x0})`,
                `dy/dx=-(${b}x+${2*c}y)/(${2*a}x+${b}y), tangent: y-${y0}=${(1/slope).toFixed(2)}(x-${x0})`,
                line(slope-0.5),
                line(slope*2)
            ]);
            break;
        }
    }
    // A branch that falls through without setting the prompt would render an
    // empty question next to a graded answer, so the type is recorded and the
    // caller is guaranteed a prompt.
    if (mathExpression.trim()===""){
        mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
        if (polynomial.trim()===""){
            polynomial="x";
            mathExpression=`\\[ \\frac{d}{dx} x=? \\]`;
            plainCorrectDerivative="1";
        }
    }
    let uniqueChoices=fourOptions(plainCorrectDerivative, choices);
    return {
        latex: mathExpression,
        correct: plainCorrectDerivative,
        alternate: plainCorrectDerivative,
        display: correctDerivative,
        choices: uniqueChoices,
        expectedFormat: "Enter the derivative as an expression, e.g., 2x+3, cos(x), etc."
    };
}