import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";

export function generateLimit(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["polynomial", "rational", "infinity", "trig"];
    let type=types[Math.floor(Math.random()*types.length)];
    let mathExpression="";
    let plainCorrectAnswer="";
    let maxCoeff=getMaxCoeff(difficulty);
    switch (type){
        case "polynomial":{
            let a=Math.floor(Math.random()*maxCoeff)+1;
            let c=Math.floor(Math.random()*10)-5;
            let x0=Math.floor(Math.random()*5);
            let limit=a*x0*x0+c;
            mathExpression=`\\[ \\lim_{x \\to ${x0}} (${a}x^2+${c}) \\]`;
            plainCorrectAnswer=limit.toString();
            window.correctAnswer={ correct: plainCorrectAnswer, alternate: plainCorrectAnswer };
            window.expectedFormat="Enter a number";
            break;
        }
        case "rational":{
            let a=Math.floor(Math.random()*maxCoeff)+1;
            let b=Math.floor(Math.random()*maxCoeff)+1;
            let x0=Math.floor(Math.random()*5)+1;
            let limit=(a*x0+1)/(b*x0-1);
            mathExpression=`\\[ \\lim_{x \\to ${x0}} \\frac{${a}x+1}{${b}x-1} \\]`;
            plainCorrectAnswer=limit.toFixed(2);
            window.correctAnswer={
                correct: plainCorrectAnswer,
                alternate: `${a*x0+1}/${b*x0-1}`
            };
            window.expectedFormat="Enter a decimal number (e.g., 2.5) or a fraction (e.g., 7/3)";
            break;
        }
        case "infinity":{
            let a=Math.floor(Math.random()*maxCoeff)+1;
            mathExpression=`\\[ \\lim_{x \\to \\infty} \\frac{${a}x^2+x}{x^2-1} \\]`;
            plainCorrectAnswer=a.toString();
            window.correctAnswer={ correct: plainCorrectAnswer, alternate: plainCorrectAnswer };
            window.expectedFormat="Enter a number";
            break;
        }
        case "trig":{
            mathExpression=`\\[ \\lim_{x \\to 0} \\frac{\\sin(x)}{x} \\]`;
            plainCorrectAnswer="1";
            window.correctAnswer={ correct: plainCorrectAnswer, alternate: plainCorrectAnswer };
            window.expectedFormat="Enter 1";
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
}

export function generateRelatedRates(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["ladder", "cone"];
    let type=types[Math.floor(Math.random()*types.length)];
    let mathExpression="";
    let plainCorrectAnswer="";
    let problemText="";
    let scale=getMaxCoeff(difficulty);
    switch (type){
        case "ladder":{
            let ladder=10*scale/5;
            let x=6*scale/5;
            let dx_dt=2*scale/5;
            let y=Math.sqrt(ladder*ladder-x*x);
            let dy_dt=-(x/y)*dx_dt;
            problemText=`A ${ladder.toFixed(1)}-ft ladder leans against a wall. The bottom is ${x.toFixed(1)} ft from the wall, moving away at ${dx_dt.toFixed(1)} ft/s. Find the rate at which the top is sliding down.`;
            mathExpression=`\\[ \\frac{dy}{dt}=? \\]`;
            plainCorrectAnswer=dy_dt.toFixed(2);
            window.correctAnswer={ correct: plainCorrectAnswer, alternate: plainCorrectAnswer };
            window.expectedFormat="Enter a number (ft/s, e.g., -1.5)";
            break;
        }
        case "cone":{
            let r=3*scale/5;
            let h=9*scale/5;
            let dr_dt=0.5*scale/5;
            let dV_dt=Math.PI*r*h*dr_dt;
            problemText=`A conical tank has radius ${r.toFixed(1)} ft and height ${h.toFixed(1)} ft. The radius increases at ${dr_dt.toFixed(2)} ft/s. Find the rate of change of volume.`;
            mathExpression=`\\[ \\frac{dV}{dt}=? \\]`;
            plainCorrectAnswer=dV_dt.toFixed(2);
            window.correctAnswer={ correct: plainCorrectAnswer, alternate: plainCorrectAnswer };
            window.expectedFormat="Enter a number (ft³/s, e.g., 42.41)";
            break;
        }
    }
    let textContainer=document.createElement("div");
    textContainer.textContent=problemText;
    textContainer.classList.add("problem-text");
    questionArea.appendChild(textContainer);
    let mathContainer=document.createElement("div");
    mathContainer.innerHTML=mathExpression;
    questionArea.appendChild(mathContainer);
    if (window.MathJax&&window.MathJax.typesetPromise){
        window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
            console.log("MathJax typeset error:", err)
        );
    }
}