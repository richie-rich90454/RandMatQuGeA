import type {RngFn, QuestionDto} from "../../types/global";
import {getMaxCoeff} from "./CalculusUtils.js";
import {fourOptions} from "../shared/Options.js";
function gcd(a: number, b: number): number{
    while(b){
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
    if(den===1){
        return `${num}`;
    }
    else{
        return `${num}/${den}`;
    }
}
/**
 * Normalises an antiderivative to the single spelling this generator grades and
 * offers: no spaces, no braces, lower case. The answer and every option go through
 * it, so an option can never be the answer in a different spelling.
 */
function normalize(s: string): string{
    return s.replace(/\s+/g,"")
        .replace(/\^{/g,"^")
        .replace(/[{}]/g,"")
        .toLowerCase();
}
/** The sign that goes in front of a term whose sign has been flipped. */
function wrongSign(sign: number): string{
    return sign===1?"-":"";
}
/**
 * @fileoverview Generates random integral calculus questions for AP Calculus practice.
 * Provides a wide variety of integration problems including polynomial, trigonometric,
 * exponential, logarithmic, substitution, definite integrals, initial value problems,
 * area under curves, motion, inverse trigonometric integrals, completing the square,
 * logistic models, improper integrals with vertical asymptotes, polar arc length,
 * and parametric arc length. Each question is presented with LaTeX formatting and
 * includes multiple‑choice distractors for MCQ mode.
 *
 * @module calculusIntegral
 * @date 2026-04-18
 */
export function generateIntegral(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    const questionTypes=[
        "polynomial","trigonometric","exponential","logarithmic",
        "substitution","definite","initialValue","area","motion",
        "inverseTrig","completingSquare","logisticModel","improperVertical",
        "polarArcLength","parametricArcLength"
    ];
    const questionType=questionTypes[Math.floor(rng()*questionTypes.length)];
    const maxCoeff=getMaxCoeff(difficulty);
    let mathExpression="";
    let plainCorrectIntegral="";
    let latexAnswer="";
    let alternateAnswer:string|undefined=undefined;
    let choices: string[]=[];
    switch(questionType){
        case "polynomial":{
            const numTerms=Math.floor(rng()*4)+2;
            const exponents=new Set<number>();
            let expAttempts=0;
            while(exponents.size<numTerms&&expAttempts<100){
                exponents.add(Math.floor(rng()*11));
                expAttempts++;
            }
            let fillExp=0;
            while(exponents.size<numTerms){
                exponents.add(fillExp++);
            }
            const exponentsArray=Array.from(exponents).sort((a,b)=>b-a);
            const coefficients: number[]=[];
            for(const exp of exponentsArray){
                let coeff;
                if(exp===0){
                    coeff=Math.floor(rng()*100)+1;
                }
                else if(exp===1){
                    coeff=Math.floor(rng()*maxCoeff)+1;
                }
                else{
                    coeff=Math.floor(rng()*maxCoeff*2)+1;
                }
                coefficients.push(coeff);
            }
            const terms: string[]=[];
            for(let i=0;i<exponentsArray.length;i++){
                const exp=exponentsArray[i];
                const coeff=coefficients[i];
                if(exp===0){
                    terms.push(`${coeff}`);
                }
                else if(exp===1){
                    terms.push(`${coeff}x`);
                }
                else{
                    terms.push(`${coeff}x^{${exp}}`);
                }
            }
            const polynomial=`(${terms.join("+")})`;
            mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
            const integralTerms: string[]=[];
            for(let i=0;i<exponentsArray.length;i++){
                const exp=exponentsArray[i];
                const coeff=coefficients[i];
                const newExp=exp+1;
                const newCoeff=coeff/newExp;
                let xPart;
                if(newExp===1){
                    xPart="x";
                }
                else{
                    xPart=`x^${newExp}`;
                }
                integralTerms.push(`${formatNumber(newCoeff)}${xPart}`);
            }
            integralTerms.push("C");
            plainCorrectIntegral=integralTerms.join("+");
            latexAnswer=plainCorrectIntegral;
            const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
            choices=[normalizedCorrect];
            const wrongTerms=[...integralTerms];
            if(wrongTerms.length>1){
                let firstNum=parseFloat(wrongTerms[0]);
                wrongTerms[0]=`${(firstNum+1).toFixed(2)}${wrongTerms[0].match(/[a-z]/)?.[0]||""}`;
                choices.push(wrongTerms.join("+").replace(/\s/g,"").toLowerCase());
                wrongTerms[0]=`${(firstNum-1).toFixed(2)}${wrongTerms[0].match(/[a-z]/)?.[0]||""}`;
                choices.push(wrongTerms.join("+").replace(/\s/g,"").toLowerCase());
            }
            choices.push(integralTerms.map(t=>t.replace(/\^(\d+)/,"^$1")).join("+").replace(/\s/g,"").toLowerCase());
            choices.push(integralTerms.map(t=>t.replace(/\^(\d+)/,"^"+ (parseInt(t.match(/\d+$/)?.[0]||"1")+1))).join("+").replace(/\s/g,"").toLowerCase());
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
            const chosen=trigOptions[Math.floor(rng()*trigOptions.length)];
            const a=Math.floor(rng()*maxCoeff)+1;
            const coeff=Math.floor(rng()*maxCoeff)+1;
            const funcStr=`${coeff} ${chosen.func}(${a}x)`;
            mathExpression=`\\[ \\int ${funcStr} \\,dx=? \\]`;
            const decimalCoeff=coeff/a;
            plainCorrectIntegral=`${formatNumber(chosen.sign*decimalCoeff)} ${chosen.target}(${a}x)+C`;
            const fractionStr=formatFraction(coeff,a);
            let signStr;
            if(chosen.sign===1){
                signStr='';
            }
            else{
                signStr='-';
            }
            alternateAnswer=`${signStr}${fractionStr} ${chosen.target}(${a}x)+C`;
            latexAnswer=`${signStr}\\frac{${coeff}}{${a}} ${chosen.target}(${a}x)+C`;
            // Dropping the argument multiplier was one of the candidates, and at a
            // multiplier of one it is the answer itself, so the branch offered a
            // second correct option. The argument is displaced instead, which is
            // wrong for every multiplier.
            choices=fourOptions(normalize(plainCorrectIntegral), [
                normalize(`${wrongSign(chosen.sign)}${fractionStr} ${chosen.target}(${a}x)+C`),
                normalize(`${signStr}${fractionStr} ${chosen.func}(${a}x)+C`),
                normalize(`${signStr}${fractionStr} ${chosen.target}(${a+1}x)+C`),
                normalize(`${signStr}${coeff} ${chosen.target}(${a}x)+C`)
            ]);
            break;
        }
        case "exponential":{
            const base=rng()<0.5?"e":Math.floor(rng()*3)+2;
            const a=Math.floor(rng()*maxCoeff)+1;
            const coeff=Math.floor(rng()*maxCoeff)+1;
            if(base==="e"){
                mathExpression=`\\[ \\int ${coeff}e^{${a}x} \\,dx=? \\]`;
                plainCorrectIntegral=`${formatNumber(coeff/a)}e^(${a}x)+C`;
                latexAnswer=`\\frac{${coeff}}{${a}}e^{${a}x}+C`;
                // Multiplying by the exponent of the argument is the mistake this
                // question invites, and at an exponent of one it is the answer, which
                // is why the branch used to offer two options. A fifth candidate
                // covers that case: the antiderivative with the wrong constant.
                choices=fourOptions(normalize(plainCorrectIntegral), [
                    normalize(`${formatNumber(coeff*a)}e^(${a}x)+C`),
                    normalize(`${formatNumber(coeff/(a+1))}e^(${a}x)+C`),
                    normalize(`${formatNumber(coeff/a)}e^(${a}x)`),
                    normalize(`${formatNumber(coeff/(a+2))}e^(${a}x)+C`),
                    normalize(`${formatNumber(coeff)}e^(${a}x)+C`)
                ]);
            }
            else{
                mathExpression=`\\[ \\int ${coeff}${base}^{x} \\,dx=? \\]`;
                const lnBase=Math.log(base as number);
                plainCorrectIntegral=`${formatNumber(coeff/lnBase)}${base}^x+C`;
                latexAnswer=`\\frac{${coeff}}{\\ln(${base})}${base}^{x}+C`;
                choices=fourOptions(normalize(plainCorrectIntegral), [
                    normalize(`${coeff}${base}^x+C`),
                    normalize(`${formatNumber(coeff)}${base}^x+C`),
                    normalize(`${formatNumber(coeff/lnBase)}${base}^x`),
                    normalize(`${formatNumber(coeff/(lnBase+1))}${base}^x+C`),
                    normalize(`${formatNumber(coeff/lnBase)}${base}^x*x+C`)
                ]);
            }
            break;
        }
        case "logarithmic":{
            const coeff=Math.floor(rng()*maxCoeff)+1;
            mathExpression=`\\[ \\int \\frac{${coeff}}{x} \\,dx=? \\]`;
            plainCorrectIntegral=`${coeff}ln|x|+C`;
            latexAnswer=`${coeff}\\ln|x|+C`;
            // The same answer written without the absolute value bars, and written
            // with the coefficient inside them, were both offered. Both denote the
            // antiderivative this question asks for, so the question had three
            // correct options. The candidates below are the four slips that are not
            // the answer in another spelling.
            choices=fourOptions(normalize(plainCorrectIntegral), [
                normalize(`${coeff}x+C`),
                normalize(`${coeff}/x+C`),
                normalize(`${coeff}ln|x^2|+C`),
                normalize(`${coeff}x*ln|x|+C`)
            ]);
            break;
        }
        case "substitution":{
            const a=Math.floor(rng()*maxCoeff)+1;
            const b=Math.floor(rng()*5);
            const power=Math.floor(rng()*3)+2;
            const coeff=Math.floor(rng()*maxCoeff)+1;
            mathExpression=`\\[ \\int ${coeff}(${a}x+${b})^{${power}} \\,dx=? \\]`;
            const newPower=power+1;
            const factor=coeff/(a*newPower);
            plainCorrectIntegral=`${formatNumber(factor)}(${a}x+${b})^${newPower}+C`;
            latexAnswer=`\\frac{${coeff}}{${a}${newPower}}(${a}x+${b})^{${newPower}}+C`;
            const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
            choices=[normalizedCorrect];
            const wrongFactor=coeff/(a*(newPower-1));
            choices.push(`${formatNumber(wrongFactor)}(${a}x+${b})^${newPower-1}+C`.replace(/\s/g,"").toLowerCase());
            choices.push(`${formatNumber(coeff)}(${a}x+${b})^${newPower}+C`.replace(/\s/g,"").toLowerCase());
            choices.push(`${formatNumber(factor)}(${a}x+${b})^${power}+C`.replace(/\s/g,"").toLowerCase());
            choices.push(`${formatNumber(coeff/(newPower))}(${a}x+${b})^${newPower}+C`.replace(/\s/g,"").toLowerCase());
            break;
        }
        case "definite":{
            const numTerms=3;
            const exponents=Array.from({ length: numTerms },()=>Math.floor(rng()*4));
            const coefficients=exponents.map(()=>Math.floor(rng()*maxCoeff)+1);
            const lower=1;
            const upper=Math.floor(rng()*5)+2;
            const polyTerms=coefficients.map((c,i)=>`${c}x^{${exponents[i]}}`);
            const polynomial=polyTerms.join("+");
            mathExpression=`\\[ \\int_{${lower}}^{${upper}} (${polynomial}) \\,dx=? \\]`;
            let result=0;
            for(let i=0;i<numTerms;i++){
                const exp=exponents[i];
                const coeff=coefficients[i];
                const antideriv=coeff/(exp+1);
                result+=antideriv*(Math.pow(upper,exp+1)-Math.pow(lower,exp+1));
            }
            plainCorrectIntegral=formatNumber(result);
            latexAnswer=plainCorrectIntegral;
            const correctNum=parseFloat(plainCorrectIntegral);
            choices=[plainCorrectIntegral];
            choices.push((correctNum+1).toFixed(2));
            choices.push((correctNum-1).toFixed(2));
            let wrongResult=0;
            for(let i=0;i<numTerms;i++){
                const exp=exponents[i];
                const coeff=coefficients[i];
                const antideriv=coeff/(exp+1);
                wrongResult+=antideriv*(Math.pow(upper,exp)-Math.pow(lower,exp));
            }
            choices.push(formatNumber(wrongResult));
            choices.push((correctNum*0.9).toFixed(2));
            break;
        }
        case "initialValue":{
            const coeff=Math.floor(rng()*maxCoeff)+1;
            const exponent=Math.floor(rng()*3)+1;
            const xVal=Math.floor(rng()*3)+1;
            const yVal=Math.floor(rng()*20)+5;
            const polynomial=`${coeff}x^${exponent}`;
            const antiderivCoeff=coeff/(exponent+1);
            const c=yVal-antiderivCoeff*Math.pow(xVal,exponent+1);
            mathExpression=`\\[ \\text{Find } f(x) \\text{ where } f(${xVal}) = ${yVal} \\text{ and } f'(x) = ${polynomial} \\]`;
            plainCorrectIntegral=`${formatNumber(antiderivCoeff)}x^${exponent+1} + ${formatNumber(c)}`;
            latexAnswer=`\\frac{${coeff}}{${exponent+1}}x^{${exponent+1}} + ${formatNumber(c)}`;
            const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
            choices=[normalizedCorrect];
            choices.push(`${formatNumber(antiderivCoeff)}x^${exponent+1} + ${formatNumber(c+1)}`.replace(/\s/g,"").toLowerCase());
            choices.push(`${formatNumber(antiderivCoeff)}x^${exponent+1} + ${formatNumber(c-1)}`.replace(/\s/g,"").toLowerCase());
            choices.push(`${formatNumber(antiderivCoeff+1)}x^${exponent+1} + ${formatNumber(c)}`.replace(/\s/g,"").toLowerCase());
            choices.push(`${formatNumber(coeff)}x^${exponent+1} + ${formatNumber(c)}`.replace(/\s/g,"").toLowerCase());
            break;
        }
        case "area":{
            const funcs=[
                { expr: "x^2", antideriv: (x: number) => Math.pow(x,3)/3 },
                { expr: "sin(x)", antideriv: (x: number) => -Math.cos(x) },
                { expr: "sqrt(x)", antideriv: (x: number) => (2/3)*Math.pow(x,1.5) },
                { expr: "2^x", antideriv: (x: number) => Math.pow(2,x)/Math.log(2) }
            ];
            const chosen=funcs[Math.floor(rng()*funcs.length)];
            const a=0;
            const b=Math.floor(rng()*4)+1;
            const area=chosen.antideriv(b)-chosen.antideriv(a);
            // The prompt was never assigned in this branch, so the question
            // rendered blank next to a graded number.
            mathExpression=`\\[ \\text{Find the area under } y=${chosen.expr} \\text{ from } ${a} \\text{ to } ${b} \\]`;
            plainCorrectIntegral=formatNumber(area);
            latexAnswer=plainCorrectIntegral;
            // The area is a number, not an expression, so the returned format
            // hint has to say so rather than asking for an antiderivative.
            const correctNum=parseFloat(plainCorrectIntegral);
            choices=[plainCorrectIntegral];
            choices.push((correctNum+1).toFixed(2));
            choices.push((correctNum-1).toFixed(2));
            choices.push((correctNum*1.1).toFixed(2));
            choices.push((correctNum*0.9).toFixed(2));
            break;
        }
        case "motion":{
            const coeff=Math.floor(rng()*maxCoeff)+1;
            mathExpression=`\\[ \\text{Find position from velocity } v(t) = ${coeff}t^2 \\]`;
            plainCorrectIntegral=`${formatNumber(coeff/3)}t^3 + C`;
            alternateAnswer=`${coeff}t^3/3 + C`;
            latexAnswer=`\\frac{${coeff}}{3}t^{3} + C`;
            const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
            choices=[normalizedCorrect];
            choices.push(`${formatNumber(coeff)}t^3 + C`.replace(/\s/g,"").toLowerCase());
            choices.push(`${formatNumber(coeff/2)}t^3 + C`.replace(/\s/g,"").toLowerCase());
            choices.push(`${formatNumber(coeff/3)}t^2 + C`.replace(/\s/g,"").toLowerCase());
            choices.push(`${formatNumber(coeff/3)}t^3`.replace(/\s/g,"").toLowerCase());
            break;
        }
        case "inverseTrig":{
            const subtypes=["arcsin","arctan","arcsec"];
            const sub=subtypes[Math.floor(rng()*subtypes.length)];
            const a=Math.floor(rng()*maxCoeff)+1;
            if(sub==="arcsin"){
                mathExpression=`\\[ \\int \\frac{dx}{\\sqrt{${a*a}-x^2}} \\]`;
                plainCorrectIntegral=`arcsin(x/${a})+C`;
                latexAnswer=`\\arcsin\\left(\\frac{x}{${a}}\\right)+C`;
                // The radius of the arcsine was squared in one candidate and the
                // argument dropped in another, and at a radius of one dropping the
                // argument is the answer, so the branch shipped three options of
                // which one was a second correct answer. Displacing the argument is
                // wrong for every radius.
                choices=fourOptions(normalize(plainCorrectIntegral), [
                    normalize(`arctan(x/${a})+C`),
                    normalize(`arcsin(x/${a+1})+C`),
                    normalize(`-arcsin(x/${a})+C`),
                    normalize(`arcsin(${(a+1)}*x)+C`)
                ]);
            }
            else if(sub==="arctan"){
                mathExpression=`\\[ \\int \\frac{dx}{${a*a}+x^2} \\]`;
                plainCorrectIntegral=`(1/${a})arctan(x/${a})+C`;
                latexAnswer=`\\frac{1}{${a}}\\arctan\\left(\\frac{x}{${a}}\\right)+C`;
                choices=fourOptions(normalize(plainCorrectIntegral), [
                    normalize(`-arctan(x/${a})+C`),
                    normalize(`(1/${a+1})arctan(x/${a})+C`),
                    normalize(`arctan(x/${a+1})+C`),
                    normalize(`arctan(${(a+1)}*x)+C`)
                ]);
            }
            else{
                mathExpression=`\\[ \\int \\frac{dx}{x\\sqrt{x^2-1}} \\]`;
                plainCorrectIntegral=`arcsec|x|+C`;
                latexAnswer=`\\operatorname{arcsec}|x|+C`;
                const normalizedCorrect=normalize(plainCorrectIntegral);
                choices=[normalizedCorrect];
                choices.push(normalize(`arcsin(x)+C`));
                choices.push(normalize(`arctan(x)+C`));
                choices.push(normalize(`ln|x+sqrt(x^2-1)|+C`));
            }
            break;
        }
        case "completingSquare":{
            const a=Math.floor(rng()*maxCoeff)+2;
            mathExpression=`\\[ \\int \\frac{dx}{\\sqrt{${2*a}x - x^2}} \\]`;
            plainCorrectIntegral=`arcsin((x-${a})/${a})+C`;
            latexAnswer=`\\arcsin\\left(\\frac{x-${a}}{${a}}\\right)+C`;
            const normalizedCorrect=plainCorrectIntegral.replace(/\s/g,"").toLowerCase();
            choices=[normalizedCorrect];
            choices.push(`arcsin(x/${a})+C`.replace(/\s/g,"").toLowerCase());
            choices.push(`arcsin((x-${a})/${2*a})+C`.replace(/\s/g,"").toLowerCase());
            choices.push(`arctan((x-${a})/${a})+C`.replace(/\s/g,"").toLowerCase());
            break;
        }
        case "logisticModel":{
            const K=Math.floor(rng()*maxCoeff*2)+20;
            const r=0.05;
            const P0=Math.floor(K/10)+5;
            mathExpression=`\\[ \\text{Solve } \\frac{dP}{dt}=${r}P\\left(1-\\frac{P}{${K}}\\right),\\ P(0)=${P0}. \\] \\[ \\text{Find } \\lim_{t\\to\\infty}P(t). \\]`;
            plainCorrectIntegral=K.toString();
            latexAnswer=K.toString();
            choices=[plainCorrectIntegral];
            choices.push((K+10).toString());
            choices.push((K-10).toString());
            choices.push(P0.toString());
            break;
        }
        case "improperVertical":{
            mathExpression=`\\[ \\int_0^1 \\frac{1}{\\sqrt{1-x^2}} \\,dx \\]`;
            const val=Math.PI/2;
            plainCorrectIntegral=val.toFixed(4);
            latexAnswer=`\\frac{\\pi}{2}`;
            choices=[plainCorrectIntegral, (val+0.5).toFixed(4), (val-0.5).toFixed(4), "diverges"];
            break;
        }
        case "polarArcLength":{
            const a=Math.floor(rng()*maxCoeff)+1;
            mathExpression=`\\[ \\text{Length of } r=${a}(1+\\cos\\theta),\\ 0\\le\\theta\\le\\pi. \\]`;
            const len=4*a;
            plainCorrectIntegral=len.toFixed(2);
            latexAnswer=plainCorrectIntegral;
            choices=[plainCorrectIntegral, (len+1).toFixed(2), (len-1).toFixed(2), (len*1.5).toFixed(2)];
            break;
        }
        case "parametricArcLength":{
            const a=Math.floor(rng()*maxCoeff)+1;
            mathExpression=`\\[ \\text{Arc length of } x=${a}t^3,\\ y=${a}t^2,\\ 0\\le t\\le 1. \\]`;
            const len=a*(13*Math.sqrt(13)-8)/27;
            plainCorrectIntegral=len.toFixed(4);
            latexAnswer=plainCorrectIntegral;
            const correctNum=parseFloat(plainCorrectIntegral);
            choices=[plainCorrectIntegral];
            choices.push((correctNum+0.5).toFixed(4));
            choices.push((correctNum-0.5).toFixed(4));
            choices.push((correctNum*1.2).toFixed(4));
            break;
        }
        default:{
            const polynomial="x^2";
            mathExpression=`\\[ \\int ${polynomial} \\,dx=? \\]`;
            plainCorrectIntegral="x^3/3 + C";
            latexAnswer="\\frac{x^{3}}{3} + C";
            choices=["x^3/3+C", "x^3/3", "x^2+C", "x^3/2+C"];
            break;
        }
    }
    let correctNorm=normalize(plainCorrectIntegral);
    let altNorm=alternateAnswer ? normalize(alternateAnswer) : correctNorm;
    let uniqueChoices=fourOptions(correctNorm, choices);
    return {
        latex: mathExpression,
        correct: correctNorm,
        alternate: altNorm,
        display: latexAnswer,
        choices: uniqueChoices,
        expectedFormat: "Enter the integral as an expression, e.g., 2x^3/3+5x^2/2+C, 1/3 sin(3x)+C, etc."
    };
}