import {questionArea} from "../../script.js";

export function generateSin(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["evaluate", "solve", "amplitude", "period", "phase_shift", "law_sines", "unit_circle", "identity"];
    let type=types[Math.floor(Math.random()*types.length)];
    switch (type){
        case "evaluate":{
            let radianAngles=[
                {value: 0, label: "0"},
                {value: Math.PI/6, label: "\\frac{\\pi}{6}"},
                {value: Math.PI/4, label: "\\frac{\\pi}{4}"},
                {value: Math.PI/3, label: "\\frac{\\pi}{3}"},
                {value: Math.PI/2, label: "\\frac{\\pi}{2}"},
                {value: 2*Math.PI/3, label: "\\frac{2\\pi}{3}"},
                {value: 3*Math.PI/4, label: "\\frac{3\\pi}{4}"},
                {value: 5*Math.PI/6, label: "\\frac{5\\pi}{6}"},
                {value: Math.PI, label: "\\pi"},
                {value: 7*Math.PI/6, label: "\\frac{7\\pi}{6}"},
                {value: 5*Math.PI/4, label: "\\frac{5\\pi}{4}"},
                {value: 4*Math.PI/3, label: "\\frac{4\\pi}{3}"},
                {value: 3*Math.PI/2, label: "\\frac{3\\pi}{2}"},
                {value: 5*Math.PI/3, label: "\\frac{5\\pi}{3}"},
                {value: 7*Math.PI/4, label: "\\frac{7\\pi}{4}"},
                {value: 11*Math.PI/6, label: "\\frac{11\\pi}{6}"}
            ];
            let obj=radianAngles[Math.floor(Math.random()*radianAngles.length)];
            let value=Math.sin(obj.value).toFixed(2);
            questionArea.innerHTML=`Evaluate \$\\sin(${obj.label})\$`;
            window.correctAnswer={ correct: value, alternate: value };
            window.expectedFormat="Enter a decimal (e.g., 0.50) or exact expression (e.g., 1/2)";
            break;
        }
        case "solve":{
            let k=(Math.random()*2-1).toFixed(2);
            let solutions: string[]=[];
            let plainNumbers: string[]=[];
            let principal=Math.asin(parseFloat(k));
            let sol1=principal;
            let sol2=Math.PI-principal;
            [sol1, sol2].forEach(sol=>{
                if (sol>=0&&sol<2*Math.PI) {
                    solutions.push(sol.toFixed(2));
                    plainNumbers.push(sol.toFixed(2));
                }
            });
            questionArea.innerHTML=`Solve \$\\sin\\theta=${k}\$ for \$0\\le\\theta<2\\pi\$ (in radians)`;
            window.correctAnswer={
                correct: solutions.join(", "),
                alternate: plainNumbers.join(", ")
            };
            window.expectedFormat="Enter angles in radians, e.g., 0.52, 2.62 or exact expressions like π/6, 5π/6";
            break;
        }
        case "amplitude":{
            let A=(Math.random()*4+1).toFixed(1);
            if (difficulty==="easy") A=(Math.random()*2+1).toFixed(1);
            if (difficulty==="hard") A=(Math.random()*6+1).toFixed(1);
            questionArea.innerHTML=`Find the amplitude of \$y=${A}\\sin(3x+\\pi/4)\$`;
            window.correctAnswer={ correct: A, alternate: A };
            window.expectedFormat="Enter a number (e.g., 2.5)";
            break;
        }
        case "period":{
            let B=Math.floor(Math.random()*4+1);
            questionArea.innerHTML=`What is the period of \$y=\\sin(${B}x)\$? (in radians)`;
            window.correctAnswer={
                correct: (2*Math.PI/B).toFixed(2)+" rad",
                alternate: `2π/${B} rad`
            };
            window.expectedFormat="Enter as a number with units (e.g., 3.14 rad) or exact expression (e.g., 2π/3 rad)";
            break;
        }
        case "phase_shift":{
            let C=(Math.random()*Math.PI).toFixed(2);
            let shiftDirection=(parseFloat(C) > 0)?"left":"right";
            let shiftText=(parseFloat(C)==0)?"0":`${C} rad ${shiftDirection}`;
            questionArea.innerHTML=`Identify the phase shift of \$y=\\sin(x+${C})\$ (in radians)`;
            window.correctAnswer={
                correct: shiftText,
                alternate: (parseFloat(C)==0)?"0":`-${C}`
            };
            window.expectedFormat="Enter as 'x rad left/right' or '-x' (e.g., 0.5 rad left)";
            break;
        }
        case "law_sines":{
            let angleA=Math.floor(Math.random()*50+30);
            let angleB=Math.floor(Math.random()*50+30);
            let sideA=Math.floor(Math.random()*10+5);
            if (difficulty==="easy"){
                angleA=Math.floor(Math.random()*30+30);
                angleB=Math.floor(Math.random()*30+30);
                sideA=Math.floor(Math.random()*5+5);
            }
            let sideB=(sideA*Math.sin(angleB*Math.PI/180)/Math.sin(angleA*Math.PI/180)).toFixed(1);
            questionArea.innerHTML=`Using the Law of Sines:<br>
                In triangle ABC, ∠A=${angleA}°, ∠B=${angleB}°, and side a=${sideA}.<br>
                Find side b.`;
            window.correctAnswer={ correct: sideB, alternate: sideB };
            window.expectedFormat="Enter a number (e.g., 7.2)";
            break;
        }
        case "unit_circle":{
            let angles=[0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
            let angle=angles[Math.floor(Math.random()*angles.length)];
            let cosVal=Math.cos(angle*Math.PI/180).toFixed(2);
            let sinVal=Math.sin(angle*Math.PI/180).toFixed(2);
            questionArea.innerHTML=`Find the coordinates on the unit circle for an angle of ${angle}° (format: (cos, sin))`;
            window.correctAnswer={ correct: `(${cosVal}, ${sinVal})`, alternate: `(${cosVal}, ${sinVal})` };
            window.expectedFormat="Enter as (cos, sin) e.g., (0.71, 0.71)";
            break;
        }
        case "identity":{
            questionArea.innerHTML=`Complete the identity: \$\\sin^2\\theta+\\cos^2\\theta=\\; ?\$`;
            window.correctAnswer={ correct: "1", alternate: "one"};
            window.expectedFormat="Enter '1'";
            break;
        }
        default:
            questionArea.innerHTML="Unknown sine question type";
    }
    window.MathJax?.typeset();
}

export function generateCosine(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["evaluate", "solve", "amplitude", "period", "phase_shift", "law_cosines", "identity"];
    let type=types[Math.floor(Math.random()*types.length)];
    switch (type){
        case "evaluate":{
            let radianAngles=[
                {value: 0, label: "0"},
                {value: Math.PI/3, label: "\\frac{\\pi}{3}"},
                {value: Math.PI/2, label: "\\frac{\\pi}{2}"},
                {value: 2*Math.PI/3, label: "\\frac{2\\pi}{3}"},
                {value: Math.PI, label: "\\pi"},
                {value: 4*Math.PI/3, label: "\\frac{4\\pi}{3}"},
                {value: 3*Math.PI/2, label: "\\frac{3\\pi}{2}"},
                {value: 5*Math.PI/3, label: "\\frac{5\\pi}{3}"}
            ];
            let obj=radianAngles[Math.floor(Math.random()*radianAngles.length)];
            let value=Math.cos(obj.value).toFixed(2);
            questionArea.innerHTML=`Evaluate \$\\cos(${obj.label})\$`;
            window.correctAnswer={ correct: value, alternate: value };
            window.expectedFormat="Enter a decimal (e.g., 0.50) or exact expression (e.g., 1/2)";
            break;
        }
        case "solve":{
            let k=(Math.random()*2-1).toFixed(2);
            let solutions: string[]=[];
            let plainNumbers: string[]=[];
            let principal=Math.acos(parseFloat(k));
            let sol1=principal;
            let sol2=2*Math.PI-principal;
            [sol1, sol2].forEach(sol=>{
                if (sol>=0&&sol<2*Math.PI) {
                    solutions.push(sol.toFixed(2));
                    plainNumbers.push(sol.toFixed(2));
                }
            });
            questionArea.innerHTML=`Solve \$\\cos\\theta=${k}\$ for \$0\\le\\theta<2\\pi\$ (in radians)`;
            window.correctAnswer={
                correct: solutions.join(", "),
                alternate: plainNumbers.join(", ")
            };
            window.expectedFormat="Enter angles in radians, e.g., 1.05, 5.24 or exact expressions like π/3, 5π/3";
            break;
        }
        case "amplitude":{
            let A=(Math.random()*4+1).toFixed(1);
            if (difficulty==="easy") A=(Math.random()*2+1).toFixed(1);
            if (difficulty==="hard") A=(Math.random()*6+1).toFixed(1);
            questionArea.innerHTML=`Find the amplitude of \$y=${A}\\cos(2x-\\pi/3)\$`;
            window.correctAnswer={ correct: A, alternate: A };
            window.expectedFormat="Enter a number (e.g., 2.5)";
            break;
        }
        case "period":{
            let B=Math.floor(Math.random()*4+1);
            questionArea.innerHTML=`What is the period of \$y=\\cos(${B}x)\$? (in radians)`;
            window.correctAnswer={
                correct: (2*Math.PI/B).toFixed(2)+" rad",
                alternate: `2π/${B} rad`
            };
            window.expectedFormat="Enter as a number with units (e.g., 3.14 rad) or exact expression (e.g., 2π/3 rad)";
            break;
        }
        case "phase_shift":{
            let C=(Math.random()*Math.PI).toFixed(2);
            let shiftDirection=(parseFloat(C) > 0)?"left":"right";
            let shiftText=(parseFloat(C)==0)?"0":`${C} rad ${shiftDirection}`;
            questionArea.innerHTML=`Identify the phase shift of \$y=\\cos(x+${C})\$ (in radians)`;
            window.correctAnswer={
                correct: shiftText,
                alternate: (parseFloat(C)==0)?"0":`-${C}`
            };
            window.expectedFormat="Enter as 'x rad left/right' or '-x' (e.g., 0.5 rad left)";
            break;
        }
        case "law_cosines":{
            let a=Math.floor(Math.random()*10+5);
            let b=Math.floor(Math.random()*10+5);
            let angleC=Math.floor(Math.random()*50+30);
            if (difficulty==="easy"){
                a=Math.floor(Math.random()*5+5);
                b=Math.floor(Math.random()*5+5);
                angleC=Math.floor(Math.random()*30+30);
            }
            let c=Math.sqrt(a*a+b*b-2*a*b*Math.cos(angleC*Math.PI/180)).toFixed(1);
            questionArea.innerHTML=`Using the Law of Cosines:<br>
                In triangle ABC, sides a=${a}, b=${b}, and ∠C=${angleC}°.<br>
                Find side c.`;
            window.correctAnswer={ correct: c, alternate: c };
            window.expectedFormat="Enter a number (e.g., 7.2)";
            break;
        }
        case "identity":{
            questionArea.innerHTML=`Complete the identity: \$\\cos^2\\theta+\\sin^2\\theta=\\; ?\$`;
            window.correctAnswer={ correct: "1", alternate: "one"};
            window.expectedFormat="Enter '1'";
            break;
        }
        default:
            questionArea.innerHTML="Unknown cosine question type";
    }
    window.MathJax?.typeset();
}

export function generateTangent(_difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["evaluate", "solve", "period", "asymptote", "identity"];
    let type=types[Math.floor(Math.random()*types.length)];
    switch (type){
        case "evaluate":{
            let angles=[0, Math.PI/4, 3*Math.PI/4, 5*Math.PI/4, 7*Math.PI/4];
            let labels=["0", "\\frac{\\pi}{4}", "\\frac{3\\pi}{4}", "\\frac{5\\pi}{4}", "\\frac{7\\pi}{4}"];
            let idx=Math.floor(Math.random()*angles.length);
            let angle=angles[idx];
            let value=Math.tan(angle).toFixed(2);
            questionArea.innerHTML=`Evaluate \$\\tan(${labels[idx]})\$`;
            window.correctAnswer={ correct: value, alternate: value };
            window.expectedFormat="Enter a decimal number (e.g., 1.0)";
            break;
        }
        case "solve":{
            let k=(Math.random()*10-5).toFixed(2);
            let principal=Math.atan(parseFloat(k));
            questionArea.innerHTML=`Solve \$\\tan\\theta=${k}\$ (in radians, give the principal solution)`;
            window.correctAnswer={
                correct: `${principal.toFixed(2)}+πn`,
                alternate: `${principal.toFixed(2)}+πn`
            };
            window.expectedFormat="Enter as 'θ+πn' e.g., '0.79+πn'";
            break;
        }
        case "period":{
            let B=Math.floor(Math.random()*3+1);
            questionArea.innerHTML=`What is the period of \$y=\\tan(${B}x)\$? (in radians)`;
            window.correctAnswer={
                correct: (Math.PI/B).toFixed(2)+" rad",
                alternate: `π/${B} rad`
            };
            window.expectedFormat="Enter as a number with units (e.g., 1.57 rad) or exact expression (e.g., π/2 rad)";
            break;
        }
        case "asymptote":{
            let B=Math.floor(Math.random()*2+1);
            questionArea.innerHTML=`Find the vertical asymptotes of \$y=\\tan(${B}x)\$ (in radians).`;
            window.correctAnswer={
                correct: `x=π/(2*${B}) + πk/${B}`,
                alternate: `x=π/(2*${B}) + πk/${B}`
            };
            window.expectedFormat="Enter as 'x=π/(2B) + πk/B'";
            break;
        }
        case "identity":{
            questionArea.innerHTML=`Complete the identity: \$1+\\tan^2\\theta=\\; ?\$`;
            window.correctAnswer={ correct: "sec^2θ", alternate: "sec^2θ"};
            window.expectedFormat="Enter 'sec^2θ'";
            break;
        }
        default:
            questionArea.innerHTML="Unknown tangent question type";
    }
    window.MathJax?.typeset();
}