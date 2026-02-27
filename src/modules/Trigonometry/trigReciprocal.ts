import {questionArea} from "../../script.js";

export function generateCosecant(_difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["evaluate", "relationship", "asymptote"];
    let type=types[Math.floor(Math.random()*types.length)];
    switch (type){
        case "evaluate":{
            let angles=[Math.PI/6, 5*Math.PI/6, 7*Math.PI/6, 11*Math.PI/6];
            let labels=["\\frac{\\pi}{6}", "\\frac{5\\pi}{6}", "\\frac{7\\pi}{6}", "\\frac{11\\pi}{6}"];
            let idx=Math.floor(Math.random()*angles.length);
            let angle=angles[idx];
            let value=(1/Math.sin(angle)).toFixed(2);
            questionArea.innerHTML=`Evaluate \$\\csc(${labels[idx]})\$`;
            window.correctAnswer={ correct: value, alternate: value };
            window.expectedFormat="Enter a decimal number (e.g., 2.0)";
            break;
        }
        case "relationship":{
            let angleNum=Math.floor(Math.random()*360);
            questionArea.innerHTML=`Express \$\\csc(${angleNum}°)\$ in terms of sine.`;
            window.correctAnswer={
                correct: `1/sin(${angleNum}°)`,
                alternate: `1/sin(${angleNum}°)`
            };
            window.expectedFormat="Enter as '1/sin(θ)'";
            break;
        }
        case "asymptote":{
            questionArea.innerHTML=`Find the vertical asymptotes of \$y=\\csc(x)\$ (in radians).`;
            window.correctAnswer={ correct: "x=nπ", alternate: "x=nπ"};
            window.expectedFormat="Enter as 'x=nπ'";
            break;
        }
        default:
            questionArea.innerHTML="Unknown cosecant question type";
    }
    window.MathJax?.typeset();
}

export function generateSecant(_difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let type=Math.random()<0.5?"evaluate":"identity";
    switch (type){
        case "evaluate":{
            let angles=[0, Math.PI/3, Math.PI, 5*Math.PI/3];
            let labels=["0", "\\frac{\\pi}{3}", "\\pi", "\\frac{5\\pi}{3}"];
            let idx=Math.floor(Math.random()*angles.length);
            let angle=angles[idx];
            let value=(1/Math.cos(angle)).toFixed(2);
            questionArea.innerHTML=`Evaluate \$\\sec(${labels[idx]})\$`;
            window.correctAnswer={ correct: value, alternate: value };
            window.expectedFormat="Enter a decimal number (e.g., 2.0)";
            break;
        }
        case "identity":{
            questionArea.innerHTML=`Complete the identity: \$\\sec^2\\theta-\\tan^2\\theta=?\$`;
            window.correctAnswer={ correct: "1", alternate: "1"};
            window.expectedFormat="Enter '1'";
            break;
        }
        default:
            questionArea.innerHTML="Unknown secant question type";
    }
    window.MathJax?.typeset();
}

export function generateCotangent(_difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let type=Math.random()<0.5?"evaluate":"relationship";
    switch (type){
        case "evaluate":{
            let angles=[Math.PI/4, 3*Math.PI/4, 5*Math.PI/4, 7*Math.PI/4];
            let labels=["\\frac{\\pi}{4}", "\\frac{3\\pi}{4}", "\\frac{5\\pi}{4}", "\\frac{7\\pi}{4}"];
            let idx=Math.floor(Math.random()*angles.length);
            let angle=angles[idx];
            let value=(1/Math.tan(angle)).toFixed(2);
            questionArea.innerHTML=`Evaluate \$\\cot(${labels[idx]})\$`;
            window.correctAnswer={ correct: value, alternate: value };
            window.expectedFormat="Enter a decimal number (e.g., 1.0)";
            break;
        }
        case "relationship":{
            questionArea.innerHTML=`Express \$\\cot\\theta\$ in terms of tangent.`;
            window.correctAnswer={
                correct: `1/tanθ`,
                alternate: `1/tanθ`
            };
            window.expectedFormat="Enter '1/tanθ'";
            break;
        }
        default:
            questionArea.innerHTML="Unknown cotangent question type";
    }
    window.MathJax?.typeset();
}