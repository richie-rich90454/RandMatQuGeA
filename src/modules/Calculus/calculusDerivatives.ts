import {questionArea} from "../../script.js";
import {getMaxCoeff, trigFunctions, expFunctions, logFunctions, latexToPlain} from "./calculusUtils.js";

export function generateDerivative(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let questionTypes=["polynomial", "trigonometric", "exponential", "logarithmic", "product", "quotient", "chain", "implicit", "higherOrder", "motion"];
    let questionType=questionTypes[Math.floor(Math.random()*questionTypes.length)];
    let polynomial="";
    // @ts-ignore-variable is used in complex logic
    let correctDerivative="";
    let plainCorrectDerivative="";
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
            let plainTerms: string[]=[];
            for (let i=0; i<exponentsArray.length; i++){
                let term=exponentsArray[i]===0?`${coefficients[i]}` :
                    exponentsArray[i]===1?`${coefficients[i]}x` :
                        `${coefficients[i]}x^{${exponentsArray[i]}}`;
                let plainTerm=exponentsArray[i]===0?`${coefficients[i]}` :
                    exponentsArray[i]===1?`${coefficients[i]}x` :
                        `${coefficients[i]}x^${exponentsArray[i]}`;
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
                let term=newExponent===0?`${newCoeff}` :
                    newExponent===1?`${newCoeff}x` :
                        `${newCoeff}x^{${newExponent}}`;
                let plainTerm=newExponent===0?`${newCoeff}` :
                    newExponent===1?`${newCoeff}x` :
                        `${newCoeff}x^${newExponent}`;
                derivativeTerms.push(term);
                plainDerivativeTerms.push(plainTerm);
            }
            correctDerivative=derivativeTerms.join("+")||"0";
            plainCorrectDerivative=plainDerivativeTerms.join("+")||"0";
            mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
            break;
        }
        case "trigonometric":{
            let trig=trigFunctions[Math.floor(Math.random()*trigFunctions.length)];
            let coeff=Math.floor(Math.random()*maxCoeff)+1;
            polynomial=`${coeff} ${trig.func}`;
            correctDerivative=`${coeff} \\cdot ${trig.deriv}`;
            plainCorrectDerivative=`${coeff}*${trig.plainDeriv}`;
            mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
            break;
        }
        case "exponential":{
            let exp=expFunctions[Math.floor(Math.random()*expFunctions.length)];
            let coeff=Math.floor(Math.random()*maxCoeff)+1;
            polynomial=`${coeff} ${exp.func}`;
            correctDerivative=`${coeff} \\cdot ${exp.deriv}`;
            plainCorrectDerivative=`${coeff}*${exp.plainDeriv}`;
            mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
            break;
        }
        case "logarithmic":{
            let log=logFunctions[Math.floor(Math.random()*logFunctions.length)];
            polynomial=log.func;
            correctDerivative=log.deriv;
            plainCorrectDerivative=log.plainDeriv;
            mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
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
            }
            else if (chainType===1){
                polynomial=`e^{${inner}}`;
                correctDerivative=`e^{${inner}} \\cdot ${a}`;
                plainCorrectDerivative=`e^(${plainInner})*${a}`;
            }
            else{
                let k=Math.floor(Math.random()*3)+2;
                polynomial=`(${inner})^{${k}}`;
                correctDerivative=`${k} (${inner})^{${k-1}} \\cdot ${a}`;
                plainCorrectDerivative=`${k}*(${plainInner})^${k-1}*${a}`;
            }
            mathExpression=`\\[ \\frac{d}{dx} ${polynomial}=? \\]`;
            break;
        }
        case "implicit":{
            let a=Math.floor(Math.random()*maxCoeff)+1;
            let b=Math.floor(Math.random()*maxCoeff)+1;
            polynomial=`${a}x^{2}+${b}y^{2}=1`;
            correctDerivative=`-\\frac{${a}x}{${b}y}`;
            plainCorrectDerivative=`-(${a}x)/(${b}y)`;
            mathExpression=`\\[ \\text{Find } \\frac{dy}{dx} \\text{ given } ${polynomial} \\]`;
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
            correctDerivative=currExp<0?"0" :
                currExp===0?`${deriv}` :
                    currExp===1?`${deriv}x` :
                        `${deriv}x^{${currExp}}`;
            plainCorrectDerivative=currExp<0?"0" :
                currExp===0?`${deriv}` :
                    currExp===1?`${deriv}x` :
                        `${deriv}x^${currExp}`;
            mathExpression=`\\[ \\frac{d^{${order}}}{dx^{${order}}} ${polynomial}=? \\]`;
            break;
        }
        case "motion":{
            let a=Math.floor(Math.random()*maxCoeff)+1;
            let b=Math.floor(Math.random()*maxCoeff)+1;
            polynomial=`${a}t^{2}+${b}t`;
            correctDerivative=`${2*a}t+${b}`;
            plainCorrectDerivative=`${2*a}t+${b}`;
            mathExpression=`\\[ \\text{If position } s(t)=${polynomial}, \\text{ find velocity } v(t)=? \\]`;
            break;
        }
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
        correct: plainCorrectDerivative.replace(/\s+/g, "").toLowerCase(),
        alternate: plainCorrectDerivative
    };
    window.expectedFormat="Enter the derivative as an expression, e.g., 2x+3, cos(x), etc.";
}