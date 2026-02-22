import{questionArea} from "../script.js";

function getAngleRange(difficulty?: string): number[]{
    if (difficulty==="easy") return [0, 90];
    if (difficulty==="hard") return [0, 360];
    return [0, 180];
}
export function generateSin(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["evaluate", "solve", "amplitude", "period", "phase_shift", "law_sines", "unit_circle", "identity"];
    let type=types[Math.floor(Math.random()*types.length)];
    let angleRange=getAngleRange(difficulty);
    switch (type){
        case "evaluate":{
            let isDegree=Math.random()<0.5;
            if (isDegree){
                let commonAngles=[0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
                let angle=commonAngles[Math.floor(Math.random()*commonAngles.length)];
                let value=Math.sin(angle*Math.PI/180).toFixed(2);
                questionArea.innerHTML=`Evaluate \$\\sin(${angle}^\\circ)\$`;
                window.correctAnswer={ correct: value, alternate: value };
                window.expectedFormat="Enter a decimal number (e.g., 0.5)";
            }
            else{
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
                window.expectedFormat="Enter a decimal number (e.g., 0.5)";
            }
            break;
        }
        case "solve":{
            let k=(Math.random()*2-1).toFixed(2);
            let isDegree=Math.random()<0.5;
            let solutions: string[]=[];
            let plainNumbers: string[]=[];
            let principal=Math.asin(parseFloat(k));
            if (isDegree){
                let principalDeg=principal*180/Math.PI;
                let sol1=principalDeg;
                let sol2=180-principalDeg;
                [sol1, sol2].forEach(sol =>{
                    if (sol>=angleRange[0]&&sol<angleRange[1]){
                        solutions.push(`${sol.toFixed(0)}°`);
                        plainNumbers.push(sol.toFixed(0));
                    }
                });
                questionArea.innerHTML=`Solve \$\\sin\\theta=${k}\$ (in degrees)`;
                window.correctAnswer={
                    correct: solutions.join(", "),
                    alternate: plainNumbers.join(", ")
                };
                window.expectedFormat="Enter angles in degrees, e.g., 30°, 150° or just 30, 150";
            }
            else{
                let sol1=principal;
                let sol2=Math.PI-principal;
                [sol1, sol2].forEach(sol =>{
                    if (sol>=0&&sol<2*Math.PI) solutions.push(sol.toFixed(2));
                });
                questionArea.innerHTML=`Solve \$\\sin\\theta=${k}\$ (in radians)`;
                window.correctAnswer={
                    correct: solutions.join(", "),
                    alternate: solutions.join(", ")
                };
                window.expectedFormat="Enter angles in radians, e.g., 0.52, 2.62";
            }
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
            questionArea.innerHTML=`What is the period of \$y=\\sin(${B}x)\$?`;
            window.correctAnswer={
                correct: (2*Math.PI/B).toFixed(2)+" radians",
                alternate: `(2π)/${B} radians`
            };
            window.expectedFormat="Enter as 'x radians' or '2π/B radians'";
            break;
        }
        case "phase_shift":{
            let C=(Math.random()*Math.PI).toFixed(2);
            let shiftDirection=(parseFloat(C) > 0)?"left":"right";
            let shiftText=(parseFloat(C)==0)?"0":`${C} units ${shiftDirection}`;
            questionArea.innerHTML=`Identify the phase shift of \$y=\\sin(x+${C})\$`;
            window.correctAnswer={
                correct: shiftText,
                alternate: (parseFloat(C)==0)?"0":`-${C}`
            };
            window.expectedFormat="Enter as 'x units left/right' or '-x'";
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
                In triangle ABC, ∠A=${angleA}deg, ∠B=${angleB}deg, and side a=${sideA}.<br>
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
            questionArea.innerHTML=`Find the coordinates on the unit circle for an angle of ${angle}deg (format: (cos, sin))`;
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
    let angleRange=getAngleRange(difficulty);
    switch (type){
        case "evaluate":{
            let isDegree=Math.random()<0.5;
            if (isDegree){
                let angles=[0, 60, 90, 120, 180, 240, 270, 300];
                let angle=angles[Math.floor(Math.random()*angles.length)];
                let value=Math.cos(angle*Math.PI/180).toFixed(2);
                questionArea.innerHTML=`Evaluate \$\\cos(${angle}^\\circ)\$`;
                window.correctAnswer={ correct: value, alternate: value };
                window.expectedFormat="Enter a decimal number (e.g., 0.5)";
            }
            else{
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
                window.expectedFormat="Enter a decimal number (e.g., -0.5)";
            }
            break;
        }
        case "solve":{
            let k=(Math.random()*2-1).toFixed(2);
            let isDegree=Math.random()<0.5;
            let solutions: string[]=[];
            let plainNumbers: string[]=[];
            let principal=Math.acos(parseFloat(k));
            if (isDegree){
                let principalDeg=principal*180/Math.PI;
                let sol1=principalDeg;
                let sol2=360-principalDeg;
                [sol1, sol2].forEach(sol =>{
                    if (sol>=angleRange[0]&&sol<angleRange[1]){
                        solutions.push(`${sol.toFixed(0)}°`);
                        plainNumbers.push(sol.toFixed(0));
                    }
                });
                questionArea.innerHTML=`Solve \$\\cos\\theta=${k}\$ (in degrees)`;
                window.correctAnswer={
                    correct: solutions.join(", "),
                    alternate: plainNumbers.join(", ")
                };
                window.expectedFormat="Enter angles in degrees, e.g., 60°, 300° or just 60, 300";
            }
            else{
                let sol1=principal;
                let sol2=2*Math.PI-principal;
                [sol1, sol2].forEach(sol =>{
                    if (sol>=0&&sol<2*Math.PI) solutions.push(sol.toFixed(2));
                });
                questionArea.innerHTML=`Solve \$\\cos\\theta=${k}\$ (in radians)`;
                window.correctAnswer={
                    correct: solutions.join(", "),
                    alternate: solutions.join(", ")
                };
                window.expectedFormat="Enter angles in radians, e.g., 1.05, 5.24";
            }
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
            questionArea.innerHTML=`What is the period of \$y=\\cos(${B}x)\$?`;
            window.correctAnswer={
                correct: (2*Math.PI/B).toFixed(2)+" radians",
                alternate: `(2π)/${B} radians`
            };
            window.expectedFormat="Enter as 'x radians' or '2π/B radians'";
            break;
        }
        case "phase_shift":{
            let C=(Math.random()*Math.PI).toFixed(2);
            let shiftDirection=(parseFloat(C) > 0)?"left":"right";
            let shiftText=(parseFloat(C)==0)?"0":`${C} units ${shiftDirection}`;
            questionArea.innerHTML=`Identify the phase shift of \$y=\\cos(x+${C})\$`;
            window.correctAnswer={
                correct: shiftText,
                alternate: (parseFloat(C)==0)?"0":`-${C}`
            };
            window.expectedFormat="Enter as 'x units left/right' or '-x'";
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
                In triangle ABC, sides a=${a}, b=${b}, and ∠C=${angleC}deg.<br>
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
            let angles=[0, 45, 135, 225, 315];
            let angle=angles[Math.floor(Math.random()*angles.length)];
            let value=Math.tan(angle*Math.PI/180).toFixed(2);
            questionArea.innerHTML=`Evaluate \$\\tan(${angle}^\\circ)\$`;
            window.correctAnswer={ correct: value, alternate: value };
            window.expectedFormat="Enter a decimal number (e.g., 1.0)";
            break;
        }
        case "solve":{
            let k=(Math.random()*10-5).toFixed(2);
            let isDegree=Math.random()<0.5;
            let principal=Math.atan(parseFloat(k));
            if (isDegree){
                let principalDeg=principal*180/Math.PI;
                questionArea.innerHTML=`Solve \$\\tan\\theta=${k}\$ (in degrees, give the principal solution)`;
                window.correctAnswer={
                    correct: `${principalDeg.toFixed(0)}°+180°n`,
                    alternate: `${principalDeg.toFixed(0)}+180n`
                };
                window.expectedFormat="Enter as 'θ°+180°n' e.g., '45°+180°n' or '45+180n'";
            }
            else{
                questionArea.innerHTML=`Solve \$\\tan\\theta=${k}\$ (in radians, give the principal solution)`;
                window.correctAnswer={
                    correct: `${principal.toFixed(2)}+πn`,
                    alternate: `${principal.toFixed(2)}+πn`
                };
                window.expectedFormat="Enter as 'θ+πn' e.g., '0.79+πn'";
            }
            break;
        }
        case "period":{
            let B=Math.floor(Math.random()*3+1);
            questionArea.innerHTML=`What is the period of \$y=\\tan(${B}x)\$?`;
            window.correctAnswer={
                correct: (Math.PI/B).toFixed(2)+" radians",
                alternate: `π/${B} radians`
            };
            window.expectedFormat="Enter as 'x radians' or 'π/B radians'";
            break;
        }
        case "asymptote":{
            let B=Math.floor(Math.random()*2+1);
            let asymptotes: string[]=[];
            for (let k=-1; k <= 0; k++){
                asymptotes.push(`x=\\frac{(2*${k}+1)\\pi}{2\\cdot${B}}`);
            }
            questionArea.innerHTML=`Find the vertical asymptotes of \$y=\\tan(${B}x)\$`;
            window.correctAnswer={
                correct: `x=π/(2*${B}) + πk/${B}`,
                alternate: `x=π/(2*${B}) + πk/${B}`
            };
            window.expectedFormat="Enter as 'x=π/(2B) + πk/B'";
            break;
        }
        case "identity":{
            questionArea.innerHTML=`Complete the identity: \$1+\\tan^2\\theta=\\; ?\$`;
            window.correctAnswer={ correct: "sec^2theta", alternate: "sec^2θ"};
            window.expectedFormat="Enter 'sec^2θ'";
            break;
        }
        default:
            questionArea.innerHTML="Unknown tangent question type";
    }
    window.MathJax?.typeset();
}
export function generateCosecant(_difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["evaluate", "relationship", "asymptote"];
    let type=types[Math.floor(Math.random()*types.length)];
    switch (type){
        case "evaluate":{
            let angles=[30, 150, 210, 330];
            let angle=angles[Math.floor(Math.random()*angles.length)];
            let value=(1/Math.sin(angle*Math.PI/180)).toFixed(2);
            questionArea.innerHTML=`Evaluate \$\\csc(${angle}^\\circ)\$`;
            window.correctAnswer={ correct: value, alternate: value };
            window.expectedFormat="Enter a decimal number (e.g., 2.0)";
            break;
        }
        case "relationship":{
            let angle=Math.floor(Math.random()*360);
            questionArea.innerHTML=`Express \$\\csc(${angle}^\\circ)\$ in terms of sine.`;
            window.correctAnswer={
                correct: `1/sin(${angle}°)`,
                alternate: `1/sin(${angle}°)`
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
            let angles=[0, 60, 180, 300];
            let angle=angles[Math.floor(Math.random()*angles.length)];
            let value=(1/Math.cos(angle*Math.PI/180)).toFixed(2);
            questionArea.innerHTML=`Evaluate \$\\sec(${angle}^\\circ)\$`;
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
            let angles=[45, 135, 225, 315];
            let angle=angles[Math.floor(Math.random()*angles.length)];
            let value=(1/Math.tan(angle*Math.PI/180)).toFixed(2);
            questionArea.innerHTML=`Evaluate \$\\cot(${angle}^\\circ)\$`;
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
export function generateInverseTrig(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["arcsin", "arccos", "arctan"];
    let type=types[Math.floor(Math.random()*types.length)];
    let hint="", questionText="", answer="";
    let valRange: number;
    if (difficulty==="easy") valRange=2;
    else if (difficulty==="hard") valRange=20;
    else valRange=10;
    let val: number;
    if (type==="arctan"){
        val=Math.floor(Math.random()*valRange*2) - valRange;
    }
    else{
        if (difficulty==="easy"){
            let simple=[0, 0.5, 0.707, 1];
            val=simple[Math.floor(Math.random()*simple.length)] * (Math.random()<0.5?1:-1);
        }
        else{
            val=(Math.floor(Math.random()*20)/10) -1;
        }
    }
    let isDegree=Math.random()<0.5;
    let principal: number;
    if (type==="arcsin") principal=Math.asin(val);
    else if (type==="arccos") principal=Math.acos(val);
    else principal=Math.atan(val);
    if (isDegree){
        let deg=(principal*180/Math.PI).toFixed(1);
        questionText=`Evaluate \\( ${type}(${val.toFixed(2)}) \\) in degrees.`;
        answer=`${deg}°`;
        hint="Enter an angle in degrees (e.g., 30.0°)";
    }
    else{
        questionText=`Evaluate \\( ${type}(${val.toFixed(2)}) \\) in radians.`;
        answer=principal.toFixed(2)+" rad";
        hint="Enter an angle in radians (e.g., 0.52)";
    }
    const container=document.createElement("div");
    container.style.display="flex";
    container.style.flexDirection="column";
    container.style.alignItems="center";
    questionArea.appendChild(container);
    const textDiv=document.createElement("div");
    textDiv.innerHTML=questionText;
    textDiv.style.marginBottom="10px";
    container.appendChild(textDiv);
    window.correctAnswer={
        correct: answer,
        alternate: answer
    };
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateTrigEquations(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    let types=["basic", "multiple_angle", "using_identity"];
    let type=types[Math.floor(Math.random()*types.length)];
    let hint="", questionText="", answer="";
    let isDegree=Math.random()<0.5;
    let unit=isDegree?"°":"";
    let maxCoeff=(difficulty==="easy")?2:(difficulty==="hard"?4:3);
    let simpleValues=[0, 0.5, Math.sqrt(2)/2, Math.sqrt(3)/2, 1];
    let useSimpleValues=(difficulty==="easy");
    switch (type){
        case "basic":{
            let func=Math.random()<0.5?"sin":"cos";
            let val: number;
            if (useSimpleValues){
                val=simpleValues[Math.floor(Math.random()*simpleValues.length)];
            }
            else{
                val=(Math.floor(Math.random()*10)/10);
            }
            val=Math.min(0.99, Math.max(-0.99, val));
            let angle=Math.asin(val)*(isDegree?180/Math.PI:1);
            let sol1=angle;
            let sol2=func==="sin"? 180-angle:360-angle;
            if (!isDegree){
                sol1=angle;
                sol2=func==="sin"? Math.PI-angle:2*Math.PI-angle;
            }
            questionText=`Solve \\( ${func}\\theta=${val.toFixed(2)} \\) for \\( 0 \\le \\theta < ${isDegree?360:"2\\pi"} \\) (in ${isDegree?"degrees":"radians"}).`;
            answer=`${sol1.toFixed(2)}${unit}, ${sol2.toFixed(2)}${unit}`;
            hint="Enter angles separated by commas";
            break;
        }
        case "multiple_angle":{
            let func=Math.random()<0.5?"sin":"cos";
            let coeff=Math.floor(Math.random()*maxCoeff)+2;
            let val: number;
            if (useSimpleValues){
                val=simpleValues[Math.floor(Math.random()*simpleValues.length)];
            }
            else{
                val=(Math.floor(Math.random()*10)/10);
            }
            val=Math.min(0.99, Math.max(-0.99, val));
            let angle=Math.acos(val)*(isDegree?180/Math.PI:1);
            let sols: number[]=[];
            for (let n=0; n<coeff; n++){
                let base=(angle + 360*n)/coeff;
                sols.push(base);
                if (func==="cos"){
                    sols.push((360-angle + 360*n)/coeff);
                }
                else{
                    sols.push((180-angle + 360*n)/coeff);
                }
            }
            sols=sols.filter(a => a>=0 && a<(isDegree?360:2*Math.PI)).map(a=>a);
            questionText=`Solve \\( ${func}(${coeff}\\theta)=${val.toFixed(2)} \\) for \\( 0 \\le \\theta < ${isDegree?360:"2\\pi"} \\) (in ${isDegree?"degrees":"radians"}).`;
            answer=sols.map(a=>a.toFixed(2)).join(", ")+unit;
            hint="Enter angles separated by commas";
            break;
        }
        case "using_identity":{
            let c: number;
            if (useSimpleValues){
                c=0.25;
            }
            else{
                c=(Math.floor(Math.random()*8)+1)/16;
            }
            questionText=`Solve \\( \\sin^2\\theta=${c.toFixed(2)} \\) for \\( 0 \\le \\theta < ${isDegree?360:"2\\pi"} \\) (in ${isDegree?"degrees":"radians"}).`;
            let baseAngle=Math.asin(Math.sqrt(c))*(isDegree?180/Math.PI:1);
            let sols=[baseAngle, 180-baseAngle, 180+baseAngle, 360-baseAngle];
            if (!isDegree){
                sols=[baseAngle, Math.PI-baseAngle, Math.PI+baseAngle, 2*Math.PI-baseAngle];
            }
            answer=sols.map(a=>a.toFixed(2)).join(", ")+unit;
            hint="Enter angles separated by commas";
            break;
        }
    }
    const container=document.createElement("div");
    container.style.display="flex";
    container.style.flexDirection="column";
    container.style.alignItems="center";
    questionArea.appendChild(container);
    const textDiv=document.createElement("div");
    textDiv.innerHTML=questionText;
    textDiv.style.marginBottom="10px";
    container.appendChild(textDiv);
    window.correctAnswer={
        correct: answer,
        alternate: answer
    };
    window.expectedFormat=hint;
    if (window.MathJax&&window.MathJax.typeset){
        window.MathJax.typeset();
    }
}
export function generateTrigGraphs(difficulty?: string): void{
    if (!questionArea) return;
    questionArea.innerHTML="";
    const types=["sine", "cosine", "tangent"];
    const type=types[Math.floor(Math.random() * types.length)];
    let maxA=(difficulty==="easy")?2:(difficulty==="hard"?5:3);
    let maxB=(difficulty==="easy")?2:(difficulty==="hard"?4:3);
    const A=Math.floor(Math.random() * maxA) + 1;
    const B=Math.floor(Math.random() * maxB) + 1;
    const C=Math.floor(Math.random() * 2);
    const container=document.createElement("div");
    container.style.display="flex";
    container.style.flexDirection="column";
    container.style.alignItems="center";
    container.style.width="100%";
    questionArea.appendChild(container);
    const canvas=document.createElement("canvas");
    canvas.width=400;
    canvas.height=300;
    canvas.style.width="100%";
    canvas.style.height="auto";
    canvas.style.maxWidth="400px";
    canvas.style.border="1px solid var(--border)";
    canvas.style.borderRadius="8px";
    canvas.style.backgroundColor="#111122";
    container.appendChild(canvas);
    const ctx=canvas.getContext("2d")!;
    const w=canvas.width;
    const h=canvas.height;
    const padding=40;
    const xMin=-2 * Math.PI / B;
    const xMax=2 * Math.PI / B;
    const yLimit=5;
    const yMin=type==="tangent"?-yLimit:-A - 0.5;
    const yMax=type==="tangent"?yLimit:A + 0.5;
    function mapX(x: number): number{
        return padding + ((x - xMin) / (xMax - xMin)) * (w - 2 * padding);
    }
    function mapY(y: number): number{
        return h - padding - ((y - yMin) / (yMax - yMin)) * (h - 2 * padding);
    }
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle="#111122";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle="#335588";
    ctx.lineWidth=0.5;
    ctx.beginPath();
    for (let i=-3; i <= 3; i++){
        const xVal=i * Math.PI / B;
        if (xVal < xMin || xVal > xMax) continue;
        const x=mapX(xVal);
        ctx.moveTo(x, padding);
        ctx.lineTo(x, h - padding);
    }
    for (let i=Math.floor(yMin); i <= Math.ceil(yMax); i++){
        const y=mapY(i);
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding, y);
    }
    ctx.strokeStyle="#335588";
    ctx.stroke();
    ctx.strokeStyle="#ffffff";
    ctx.lineWidth=2;
    ctx.beginPath();
    const x0=mapX(0);
    const y0=mapY(0);
    ctx.moveTo(x0, padding);
    ctx.lineTo(x0, h - padding);
    ctx.moveTo(padding, y0);
    ctx.lineTo(w - padding, y0);
    ctx.stroke();
    ctx.fillStyle="#ffffff";
    ctx.font="12px monospace";
    ctx.fillText("0", x0 + 5, y0 - 5);
    const piOverB=Math.PI / B;
    ctx.fillText(piOverB.toFixed(2), mapX(piOverB) - 20, y0 - 10);
    ctx.fillText((-piOverB).toFixed(2), mapX(-piOverB) - 25, y0 - 10);
    ctx.fillText(A.toString(), x0 + 10, mapY(A) - 5);
    ctx.fillText((-A).toString(), x0 + 10, mapY(-A) + 15);
    let asymptotes: number[]=[];
    if (type==="tangent"){
        const kStart=Math.ceil((xMin * B - (Math.PI/2 - C)) / Math.PI);
        const kEnd=Math.floor((xMax * B - (Math.PI/2 - C)) / Math.PI);
        for (let k=kStart; k <= kEnd; k++){
            const xAsymp=(Math.PI/2 - C + k * Math.PI) / B;
            if (xAsymp >= xMin && xAsymp <= xMax){
                asymptotes.push(xAsymp);
            }
        }
        ctx.strokeStyle="#ff6666";
        ctx.lineWidth=2;
        ctx.setLineDash([5, 5]);
        asymptotes.forEach(x =>{
            const xCanvas=mapX(x);
            ctx.beginPath();
            ctx.moveTo(xCanvas, padding);
            ctx.lineTo(xCanvas, h - padding);
            ctx.stroke();
        });
        ctx.setLineDash([]);
    }
    ctx.strokeStyle="#FFAA00";
    ctx.lineWidth=2.5;
    ctx.beginPath();
    const steps=400;
    let pathStarted=false;
    for (let i=0; i <= steps; i++){
        const t=i / steps;
        const x=xMin + t * (xMax - xMin);
        if (type==="tangent"){
            let tooClose=false;
            for (let a of asymptotes){
                if (Math.abs(x - a) < 0.01){
                    tooClose=true;
                    break;
                }
            }
            if (tooClose){
                if (pathStarted){
                    ctx.stroke();
                    ctx.beginPath();
                    pathStarted=false;
                }
                continue;
            }
        }
        let rawY: number;
        switch (type){
            case "sine":
                rawY=A * Math.sin(B * x + C);
                break;
            case "cosine":
                rawY=A * Math.cos(B * x + C);
                break;
            case "tangent":
                rawY=A * Math.tan(B * x + C);
                break;
            default:
                rawY=0;
        }
        if (type==="tangent" && (rawY < yMin || rawY > yMax)){
            if (pathStarted){
                ctx.stroke();
                ctx.beginPath();
                pathStarted=false;
            }
            continue;
        }
        const canvasX=mapX(x);
        const canvasY=mapY(rawY);
        if (!pathStarted){
            ctx.moveTo(canvasX, canvasY);
            pathStarted=true;
        }
        else{
            ctx.lineTo(canvasX, canvasY);
        }
    }
    if (pathStarted){
        ctx.stroke();
    }
    let questionText="", answer="", hint="";
    switch (type){
        case "sine":
        case "cosine":{
            const askType=Math.floor(Math.random() * 3);
            if (askType===0){
                questionText=`What is the amplitude of the graphed ${type} function?`;
                answer=A.toString();
                hint="Enter a number";
            }
            else if (askType===1){
                const period=2 * Math.PI / B;
                questionText=`What is the period of the graphed ${type} function?`;
                answer=period.toFixed(2) + " rad";
                hint="Enter a number with units (e.g., 3.14 rad)";
            }
            else{
                const phaseShift=-C / B;
                questionText=`What is the phase shift of the graphed ${type} function?`;
                answer=phaseShift.toFixed(2) + " rad";
                hint="Enter a number with units (e.g., 0.5 rad)";
            }
            break;
        }
        case "tangent":{
            const askType=Math.floor(Math.random() * 2);
            if (askType===0){
                const period=Math.PI / B;
                questionText=`What is the period of the graphed tangent function?`;
                answer=period.toFixed(2) + " rad";
                hint="Enter a number with units";
            }
            else{
                questionText=`Give the equation of the vertical asymptotes for the graphed tangent function.`;
                answer=`x=π/(2*${B}) + πk/${B}`;
                hint="Enter as 'x=π/(2B) + πk/B'";
            }
            break;
        }
    }
    const textDiv=document.createElement("div");
    textDiv.innerHTML=questionText;
    textDiv.style.marginTop="10px";
    container.appendChild(textDiv);
    window.correctAnswer={ correct: answer, alternate: answer };
    window.expectedFormat=hint;
    if (window.MathJax?.typeset) window.MathJax.typeset();
}