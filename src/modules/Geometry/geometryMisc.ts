import {questionArea} from "../../script.js";
import {getMaxForDifficulty, cleanupVisualization} from "./geometryUtils.js";
import {createVisualization} from "./geometryVisualization.js";

export function generatePerimeter(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const shape=Math.random()>0.5?"rectangle":"triangle";
    if(shape==="rectangle"){
        const maxDim=getMaxForDifficulty(difficulty,10);
        const l=Math.floor(Math.random()*maxDim)+3;
        const w=Math.floor(Math.random()*maxDim)+2;
        const perimeter=2*(l+w);
        questionArea.innerHTML=`Find the perimeter of a rectangle with length \\( ${l} \\) and width \\( ${w} \\).`;
        window.correctAnswer={correct:perimeter.toString(),alternate:perimeter.toString()};
        createVisualization("cube",{size:Math.min(l,w,4)});
    }
    else{
        const maxSide=getMaxForDifficulty(difficulty,8);
        const a=Math.floor(Math.random()*maxSide)+3;
        const b=Math.floor(Math.random()*maxSide)+3;
        const c=Math.floor(Math.random()*maxSide)+3;
        const perimeter=a+b+c;
        questionArea.innerHTML=`Find the perimeter of a triangle with sides \\( ${a}, ${b}, ${c} \\).`;
        window.correctAnswer={correct:perimeter.toString(),alternate:perimeter.toString()};
        createVisualization("triangle",{base:a,height:b});
    }
    window.expectedFormat="Enter a whole number";
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateArcLength(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxRadius=getMaxForDifficulty(difficulty,8);
    const r=Math.floor(Math.random()*maxRadius)+3;
    const angle=Math.floor(Math.random()*90)+30;
    const arc=(angle/360)*2*Math.PI*r;
    const rounded=Math.round(arc*100)/100;
    questionArea.innerHTML=`Find the length of an arc with central angle \\( ${angle}^\\circ \\) in a circle of radius \\( ${r} \\).`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: ((angle/360)*2*Math.PI*r).toFixed(2)
    };
    window.expectedFormat="Enter a decimal";
    createVisualization("torus",{radius:r,tube:0.2});
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateDistanceFormula(difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const maxCoord=getMaxForDifficulty(difficulty,8);
    const x1=Math.floor(Math.random()*maxCoord)-4;
    const y1=Math.floor(Math.random()*maxCoord)-4;
    const x2=Math.floor(Math.random()*maxCoord)-4;
    const y2=Math.floor(Math.random()*maxCoord)-4;
    const dist=Math.sqrt((x2-x1)**2+(y2-y1)**2);
    const rounded=Math.round(dist*100)/100;
    questionArea.innerHTML=`Find the distance between points \\( (${x1},${y1}) \\) and \\( (${x2},${y2}) \\).`;
    window.correctAnswer={
        correct: rounded.toFixed(2),
        alternate: Math.sqrt((x2-x1)**2+(y2-y1)**2).toFixed(2)
    };
    window.expectedFormat="Enter a decimal";
    if(window.MathJax?.typeset) window.MathJax.typeset();
}
export function generateAngleRelations(_difficulty?: string): void{
    if(!questionArea) return;
    questionArea.innerHTML="";
    cleanupVisualization();
    const angle=Math.floor(Math.random()*60)+20;
    const comp=90-angle;
    const supp=180-angle;
    questionArea.innerHTML=`An angle measures \\( ${angle}^\\circ \\). Find its complementary and supplementary angles.`;
    window.correctAnswer={
        correct: `complement: ${comp}, supplement: ${supp}`,
        alternate: `${comp}, ${supp}`
    };
    window.expectedFormat="Enter as \"complement: X, supplement: Y\"";
    if(window.MathJax?.typeset) window.MathJax.typeset();
}