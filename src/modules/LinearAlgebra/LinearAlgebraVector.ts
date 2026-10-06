/**
 * Vector operations in 2D: magnitude, direction, unit, dot, angle, projection, parametric, polar conversion, polar graph, motion, De Moivre, addition, subtraction, parametric to Cartesian.
 * @fileoverview Generates 2D vector and polar coordinate questions with MCQ distractors. Returns a QuestionDto with LaTeX display, plain text alternate, and plausible wrong answers.
 * @date 2026-03-29
 */
import type {RngFn, QuestionDto} from "../../types/global";
import {Vector2D, getRange} from "./LinearAlgebraUtils.js";
import {fourOptions} from "../shared/Options.js";
import {roundTo} from "../shared/Numeric";
export function generateVector(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["magnitude","direction","unit","dot","angle","projection","parametric","polar_convert","cartesian_convert","polar_graph","motion","de_moivre","add","subtract","parametric_to_cartesian"];
    let type=types[Math.floor(rng()*types.length)];
    let range=getRange(difficulty);
    // Every component is rounded to one decimal place at the moment it is drawn,
    // so the number printed in the prompt is the number every later step is
    // computed from. Rounding only the print left the key derived from a value
    // the learner was never shown, so a prompt reading (2.5, 1.7) was graded
    // against the magnitude of the unrounded pair.
    let comp=(): number=>roundTo(rng()*range*2-range, 1);
    let compFrom=(min: number, max: number, decimals: number=1): number=>roundTo(rng()*(max-min)+min, decimals);
    let generateNonZeroVector=(): Vector2D=>{
        let x: number, y: number;
        let attempts=0;
        do{
            x=comp();
            y=comp();
            attempts++;
        } while(Math.abs(x)<0.1&&Math.abs(y)<0.1&&attempts<100);
        if(Math.abs(x)<0.1&&Math.abs(y)<0.1){ x=1; y=0; }
        return{ x, y };
    };
    let generateNonZeroXVector=(): Vector2D=>{
        let vec: Vector2D;
        let attempts=0;
        do{
            vec=generateNonZeroVector();
            attempts++;
        } while(Math.abs(vec.x)<0.1&&attempts<100);
        if(Math.abs(vec.x)<0.1) vec={ x: 1, y: vec.y };
        return vec;
    };
    let mathExpression="";
    let correct="";
    let alternate="";
    let choices: string[]=[];
    switch(type){
        case "magnitude":{
            const{ x, y }=generateNonZeroVector();
            let mag=Math.sqrt(x**2+y**2).toFixed(2);
            mathExpression=`Find the magnitude of \\(\\langle ${x.toFixed(1)}, ${y.toFixed(1)} \\rangle\\).`;
            correct=mag;
            alternate=mag;
            choices=[correct];
            let magNum=parseFloat(mag);
            choices.push((magNum+0.5).toFixed(2));
            choices.push((magNum-0.5).toFixed(2));
            choices.push((Math.abs(x)+Math.abs(y)).toFixed(2));
            choices.push((Math.abs(x)).toFixed(2));
            break;
        }
        case "direction":{
            const{ x, y }=generateNonZeroVector();
            let angle=(Math.atan2(y, x)*180/Math.PI).toFixed(1);
            correct=`${angle}^{\\circ}`;
            alternate=angle;
            mathExpression=`Find the direction angle (in degrees) of \\(\\langle ${x.toFixed(1)}, ${y.toFixed(1)} \\rangle\\).`;
            let angleNum=parseFloat(angle);
            choices=[correct];
            choices.push(`${(angleNum+10).toFixed(1)}^{\\circ}`);
            choices.push(`${(angleNum-10).toFixed(1)}^{\\circ}`);
            choices.push(`${(Math.atan2(y, x)*180/Math.PI+180).toFixed(1)}^{\\circ}`);
            choices.push(`${(Math.atan2(x, y)*180/Math.PI).toFixed(1)}^{\\circ}`);
            break;
        }
        case "unit":{
            const{ x, y }=generateNonZeroVector();
            let mag=Math.sqrt(x**2+y**2);
            let ux=roundTo(x/mag, 2);
            let uy=roundTo(y/mag, 2);
            mathExpression=`Find the unit vector in the direction of \\(\\langle ${x.toFixed(1)}, ${y.toFixed(1)} \\rangle\\).`;
            correct=`\\langle ${ux.toFixed(2)}, ${uy.toFixed(2)} \\rangle`;
            alternate=`<${ux.toFixed(2)}, ${uy.toFixed(2)}>`;
            // Dividing by the length plus a half is the mistake this question
            // invites. The other three displace one component, which keeps three
            // provably distinct options even when that first one rounds onto the
            // answer, which is what used to leave this branch with three options.
            choices=fourOptions(correct, [
                `\\langle ${roundTo(x/(mag+0.5), 2).toFixed(2)}, ${roundTo(y/(mag+0.5), 2).toFixed(2)} \\rangle`,
                `\\langle ${(ux+0.1).toFixed(2)}, ${uy.toFixed(2)} \\rangle`,
                `\\langle ${(ux-0.1).toFixed(2)}, ${uy.toFixed(2)} \\rangle`,
                `\\langle ${ux.toFixed(2)}, ${(uy+0.1).toFixed(2)} \\rangle`
            ]);
            break;
        }
        case "dot":{
            let v1=generateNonZeroVector();
            let v2=generateNonZeroVector();
            let product=(v1.x*v2.x+v1.y*v2.y).toFixed(2);
            mathExpression=`Calculate \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle \\cdot \\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
            correct=product;
            alternate=product;
            let prodNum=parseFloat(product);
            choices=[correct];
            choices.push((prodNum+1).toFixed(2));
            choices.push((prodNum-1).toFixed(2));
            choices.push((v1.x*v2.x).toFixed(2));
            choices.push((v1.y*v2.y).toFixed(2));
            break;
        }
        case "angle":{
            let v1=generateNonZeroVector();
            let v2=generateNonZeroVector();
            let dot=v1.x*v2.x+v1.y*v2.y;
            let mag1=Math.sqrt(v1.x**2+v1.y**2);
            let mag2=Math.sqrt(v2.x**2+v2.y**2);
            let cosTheta=dot/(mag1*mag2);
            if(cosTheta>1) cosTheta=1;
            if(cosTheta<-1) cosTheta=-1;
            let angle=(Math.acos(cosTheta)*180/Math.PI).toFixed(1);
            correct=`${angle}^{\\circ}`;
            alternate=angle;
            mathExpression=`Find the angle (in degrees) between \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\) and \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
            let angleNum=parseFloat(angle);
            choices=[correct];
            choices.push(`${(angleNum+10).toFixed(1)}^{\\circ}`);
            choices.push(`${(angleNum-10).toFixed(1)}^{\\circ}`);
            choices.push(`${(180-angleNum).toFixed(1)}^{\\circ}`);
            choices.push(`${(Math.asin(cosTheta)*180/Math.PI).toFixed(1)}^{\\circ}`);
            break;
        }
        case "projection":{
            let v1=generateNonZeroVector();
            let v2=generateNonZeroVector();
            let dot=v1.x*v2.x+v1.y*v2.y;
            let magV2Sq=v2.x**2+v2.y**2;
            let projX=(dot/magV2Sq*v2.x).toFixed(2);
            let projY=(dot/magV2Sq*v2.y).toFixed(2);
            mathExpression=`Find the projection of \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\) onto \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
            correct=`\\langle ${projX}, ${projY} \\rangle`;
            alternate=`<${projX}, ${projY}>`;
            choices=[correct];
            choices.push(`\\langle ${(dot/(magV2Sq+0.5)*v2.x).toFixed(2)}, ${(dot/(magV2Sq+0.5)*v2.y).toFixed(2)} \\rangle`);
            choices.push(`\\langle ${(parseFloat(projX)+0.1).toFixed(2)}, ${projY} \\rangle`);
            choices.push(`\\langle ${projX}, ${(parseFloat(projY)+0.1).toFixed(2)} \\rangle`);
            choices.push(`\\langle ${(v1.x).toFixed(2)}, ${(v1.y).toFixed(2)} \\rangle`);
            break;
        }
        case "parametric":{
            let pointX=comp();
            let pointY=comp();
            let dir=generateNonZeroVector();
            mathExpression=`Write the parametric equations for the line that passes through \\((${pointX}, ${pointY})\\) and has direction vector \\(\\langle ${dir.x.toFixed(1)}, ${dir.y.toFixed(1)} \\rangle\\).`;
            correct=`x=${pointX}+${dir.x.toFixed(1)}t, y=${pointY}+${dir.y.toFixed(1)}t`;
            alternate=correct;
            choices=[correct];
            choices.push(`x=${pointX}+${(dir.x+1).toFixed(1)}t, y=${pointY}+${dir.y.toFixed(1)}t`);
            choices.push(`x=${pointX}+${dir.x.toFixed(1)}t, y=${pointY}+${(dir.y+1).toFixed(1)}t`);
            choices.push(`x=${pointX}+${(-dir.x).toFixed(1)}t, y=${pointY}+${dir.y.toFixed(1)}t`);
            choices.push(`x=${pointX}+${dir.x.toFixed(1)}t, y=${pointY}+${(-dir.y).toFixed(1)}t`);
            break;
        }
        case "polar_convert":{
            // A radius of zero is the origin, and converting the origin asks the
            // learner nothing: every angle gives the same point, so the whole
            // branch collapses onto one answer and the option set with it.
            let r=compFrom(0.5, range);
            let theta=compFrom(-180, 180, 0);
            let x=roundTo(r*Math.cos(theta*Math.PI/180), 2);
            let y=roundTo(r*Math.sin(theta*Math.PI/180), 2);
            mathExpression=`Convert the polar coordinate \\((${r.toFixed(1)}, ${theta.toFixed(0)}^{\\circ})\\) to Cartesian coordinates.`;
            correct=`(${x.toFixed(2)}, ${y.toFixed(2)})`;
            alternate=correct;
            // The candidates are the two coordinate slips a learner makes here:
            // displacing one component, and reading the angle as a radian value
            // offset. The unrounded pair is not offered, because it is the answer.
            choices=fourOptions(correct, [
                `(${(x+0.5).toFixed(2)}, ${y.toFixed(2)})`,
                `(${x.toFixed(2)}, ${(y+0.5).toFixed(2)})`,
                `(${(x-0.5).toFixed(2)}, ${y.toFixed(2)})`,
                `(${(r*Math.cos(theta*Math.PI/180+0.1)).toFixed(2)}, ${y.toFixed(2)})`
            ]);
            break;
        }
        case "cartesian_convert":{
            const{ x, y }=generateNonZeroVector();
            let r=Math.sqrt(x**2+y**2).toFixed(2);
            let theta=(Math.atan2(y, x)*180/Math.PI).toFixed(1);
            mathExpression=`Convert the Cartesian coordinate \\((${x.toFixed(1)}, ${y.toFixed(1)})\\) to polar coordinates. Answer with (r, degrees), no need to add deg.`;
            correct=`(${r}, ${theta}^{\\circ})`;
            alternate=`(${r}, ${theta})`;
            let rNum=parseFloat(r), thetaNum=parseFloat(theta);
            choices=[correct];
            choices.push(`(${(rNum+1).toFixed(2)}, ${thetaNum}^{\\circ})`);
            choices.push(`(${(rNum-1).toFixed(2)}, ${thetaNum}^{\\circ})`);
            choices.push(`(${rNum}, ${(thetaNum+10).toFixed(1)}^{\\circ})`);
            choices.push(`(${rNum}, ${(thetaNum-10).toFixed(1)}^{\\circ})`);
            break;
        }
        case "polar_graph":{
            let a=compFrom(1, range+1);
            let useSin=rng()<0.5;
            if(useSin){
                mathExpression=`Describe the graph of the polar equation \\(r=${a}\\sin\\theta\\). Use the format "A circle with center at (x, y) and radius (radius)" Use two decimal places.`;
                let center=(a/2).toFixed(2);
                correct=`A circle with center at (0, ${center}) and radius ${center}`;
                alternate=correct;
                choices=[correct];
                choices.push(`A circle with center at (${center}, 0) and radius ${center}`);
                choices.push(`A circle with center at (0, ${a.toFixed(2)}) and radius ${a.toFixed(2)}`);
                choices.push(`A circle with center at (0, 0) and radius ${center}`);
                choices.push(`A cardioid`);
            }
            else{
                mathExpression=`Describe the graph of the polar equation \\(r=${a}\\cos\\theta\\). Use the format "A circle with center at (x, y) and radius (radius)" Use two decimal places.`;
                let center=(a/2).toFixed(2);
                correct=`A circle with center at (${center}, 0) and radius ${center}`;
                alternate=correct;
                choices=[correct];
                choices.push(`A circle with center at (0, ${center}) and radius ${center}`);
                choices.push(`A circle with center at (${a.toFixed(2)}, 0) and radius ${a.toFixed(2)}`);
                choices.push(`A circle with center at (0, 0) and radius ${center}`);
                choices.push(`A cardioid`);
            }
            break;
        }
        case "motion":{
            let posX=comp();
            let posY=comp();
            let v=generateNonZeroVector();
            mathExpression=`A particle starts at \\((${posX}, ${posY})\\) and moves with constant velocity \\(\\langle ${v.x.toFixed(1)}, ${v.y.toFixed(1)} \\rangle\\). Write the position vector as a function of time \\(t\\).`;
            correct=`\\langle ${posX}+${v.x.toFixed(1)}t, ${posY}+${v.y.toFixed(1)}t \\rangle`;
            alternate=`<${posX}+${v.x.toFixed(1)}t, ${posY}+${v.y.toFixed(1)}t>`;
            choices=[correct];
            choices.push(`\\langle ${posX}+${(v.x+1).toFixed(1)}t, ${posY}+${v.y.toFixed(1)}t \\rangle`);
            choices.push(`\\langle ${posX}+${v.x.toFixed(1)}t, ${posY}+${(v.y+1).toFixed(1)}t \\rangle`);
            choices.push(`\\langle ${posX}+${(-v.x).toFixed(1)}t, ${posY}+${v.y.toFixed(1)}t \\rangle`);
            choices.push(`\\langle ${posX}+${v.x.toFixed(1)}t, ${posY}+${(-v.y).toFixed(1)}t \\rangle`);
            break;
        }
        case "de_moivre":{
            let r=compFrom(1, range+1);
            let theta=Math.floor(rng()*360);
            let n=Math.floor(rng()*3+2);
            let newR=Math.pow(r, n).toFixed(2);
            let newTheta=(theta*n) % 360;
            mathExpression=`Compute \\((${r}(\\cos ${theta}^{\\circ}+i\\sin ${theta}^{\\circ}))^{${n}}\\) using De Moivre's Theorem. Answer with degrees (no need to add deg).`;
            correct=`${newR} \\operatorname{cis} ${newTheta}^{\\circ}`;
            alternate=`${newR} cis ${newTheta}`;
            choices=[correct];
            choices.push(`${newR} \\operatorname{cis} ${(newTheta+360).toFixed(0)}^{\\circ}`);
            choices.push(`${(Number(newR)+1).toFixed(2)} \\operatorname{cis} ${newTheta}^{\\circ}`);
            choices.push(`${(Number(newR)-1).toFixed(2)} \\operatorname{cis} ${newTheta}^{\\circ}`);
            choices.push(`${newR} \\operatorname{cis} ${(theta*n+1).toFixed(0)}^{\\circ}`);
            break;
        }
        case "add":{
            let v1=generateNonZeroVector();
            let v2=generateNonZeroVector();
            let sumX=(v1.x+v2.x).toFixed(2);
            let sumY=(v1.y+v2.y).toFixed(2);
            mathExpression=`Find the sum of the vectors \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\) and \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\).`;
            correct=`\\langle ${sumX}, ${sumY} \\rangle`;
            alternate=`<${sumX}, ${sumY}>`;
            choices=[correct];
            choices.push(`\\langle ${(parseFloat(sumX)+1).toFixed(2)}, ${sumY} \\rangle`);
            choices.push(`\\langle ${sumX}, ${(parseFloat(sumY)+1).toFixed(2)} \\rangle`);
            choices.push(`\\langle ${(parseFloat(sumX)-1).toFixed(2)}, ${sumY} \\rangle`);
            choices.push(`\\langle ${sumX}, ${(parseFloat(sumY)-1).toFixed(2)} \\rangle`);
            break;
        }
        case "subtract":{
            let v1=generateNonZeroVector();
            let v2=generateNonZeroVector();
            let diffX=(v1.x-v2.x).toFixed(2);
            let diffY=(v1.y-v2.y).toFixed(2);
            mathExpression=`Subtract \\(\\langle ${v2.x.toFixed(1)}, ${v2.y.toFixed(1)} \\rangle\\) from \\(\\langle ${v1.x.toFixed(1)}, ${v1.y.toFixed(1)} \\rangle\\).`;
            correct=`\\langle ${diffX}, ${diffY} \\rangle`;
            alternate=`<${diffX}, ${diffY}>`;
            choices=[correct];
            choices.push(`\\langle ${(parseFloat(diffX)+1).toFixed(2)}, ${diffY} \\rangle`);
            choices.push(`\\langle ${diffX}, ${(parseFloat(diffY)+1).toFixed(2)} \\rangle`);
            choices.push(`\\langle ${(parseFloat(diffX)-1).toFixed(2)}, ${diffY} \\rangle`);
            choices.push(`\\langle ${diffX}, ${(parseFloat(diffY)-1).toFixed(2)} \\rangle`);
            break;
        }
        case "parametric_to_cartesian":{
            let x0=comp();
            let y0=comp();
            let dir=generateNonZeroXVector();
            let slopeNum=dir.y;
            let slopeDen=dir.x;
            let slope=slopeNum/slopeDen;
            let slopeStr=slope.toFixed(2);
            let intercept=y0-slope*x0;
            let interceptStr=intercept.toFixed(2);
            let interceptDisplay=intercept>=0?`+ ${interceptStr}`:`- ${Math.abs(intercept).toFixed(2)}`;
            mathExpression=`The line is given by the parametric equations \\(x=${x0}+${dir.x.toFixed(1)}t\\) and \\(y=${y0}+${dir.y.toFixed(1)}t\\). Convert these into a single Cartesian equation.`;
            correct=`y = ${slopeStr}x ${interceptDisplay}`;
            alternate=correct;
            choices=[correct];
            choices.push(`y = ${(slope+0.1).toFixed(2)}x ${interceptDisplay}`);
            choices.push(`y = ${slopeStr}x ${(intercept+0.5).toFixed(2)}`);
            choices.push(`y = ${(slope-0.1).toFixed(2)}x ${interceptDisplay}`);
            choices.push(`y = ${slopeStr}x ${(intercept-0.5).toFixed(2)}`);
            break;
        }
        default:
            mathExpression="Unknown question type.";
            correct="";
            alternate="";
    }
    let uniqueChoices=fourOptions(correct, choices);
    return {
        latex: mathExpression,
        correct,
        alternate,
        display: correct,
        choices: uniqueChoices,
        expectedFormat: "Enter the answer as appropriate"
    };
}
