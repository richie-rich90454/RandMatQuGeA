/**
 * Basic trigonometry: sine, cosine, tangent functions (evaluate, solve, amplitude, period, phase shift, law of sines/cosines, unit circle, identities).
 * @fileoverview Generates basic trig questions with MCQ distractors. Returns a QuestionDto with LaTeX display, plain text alternate, and plausible wrong answers.
 * @date 2026-04-18
 */
import type{RngFn, QuestionDto}from "../../types/global";
import{roundTo}from"../shared/Numeric";
import{randInt}from"../shared/Random";
import{angleValuePool, periodPool, PHASE_SHIFTS, SPECIAL_ANGLES}from"./TrigUtils.js";
import{fourOptions}from"../shared/Options.js";

export function generateSin(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["evaluate","solve","amplitude","period","phase_shift","law_sines","unit_circle","identity"];
    let type=types[Math.floor(rng()*types.length)];
    let correct="";
    let alternate="";
    let display="";
    let choices:string[]=[];
    let latex="";
    switch(type){
        case "evaluate":{
            let radianAngles=[
                {value:0,label:"0"},
                {value:Math.PI/6,label:"\\frac{\\pi}{6}"},
                {value:Math.PI/4,label:"\\frac{\\pi}{4}"},
                {value:Math.PI/3,label:"\\frac{\\pi}{3}"},
                {value:Math.PI/2,label:"\\frac{\\pi}{2}"},
                {value:2*Math.PI/3,label:"\\frac{2\\pi}{3}"},
                {value:3*Math.PI/4,label:"\\frac{3\\pi}{4}"},
                {value:5*Math.PI/6,label:"\\frac{5\\pi}{6}"},
                {value:Math.PI,label:"\\pi"},
                {value:7*Math.PI/6,label:"\\frac{7\\pi}{6}"},
                {value:5*Math.PI/4,label:"\\frac{5\\pi}{4}"},
                {value:4*Math.PI/3,label:"\\frac{4\\pi}{3}"},
                {value:3*Math.PI/2,label:"\\frac{3\\pi}{2}"},
                {value:5*Math.PI/3,label:"\\frac{5\\pi}{3}"},
                {value:7*Math.PI/4,label:"\\frac{7\\pi}{4}"},
                {value:11*Math.PI/6,label:"\\frac{11\\pi}{6}"}
            ];
            let obj=radianAngles[Math.floor(rng()*radianAngles.length)];
            correct=roundTo(Math.sin(obj.value), 2).toFixed(2);
            alternate=correct;
            display=correct;
            latex=`Evaluate \\( \\sin(${obj.label}) \\)`;
            choices=fourOptions(correct, angleValuePool([Math.sin, Math.cos, Math.tan], obj.value*180/Math.PI, 2));
            break;
        }
        case "solve":{
            // The right-hand side is drawn from a grid strictly inside (-1, 1), because at an
            // endpoint the two solutions in [0, 2pi) coincide and the key becomes one solution
            // listed twice.
            let steps=randInt(rng, -95, 95);
            if(steps===0) steps=50;
            let k=(steps/100).toFixed(2);
            let principal=Math.asin(steps/100);
            let pair=[principal<0?principal+2*Math.PI:principal, Math.PI-principal].sort((a, b) => a-b);
            correct=pair.map(sol=>roundTo(sol, 2).toFixed(2)).join(", ");
            alternate=correct;
            display=correct;
            latex=`Solve \\( \\sin\\theta=${k} \\) for \\( 0\\le\\theta<2\\pi \\) (in radians)`;
            // The three ways a learner answers this wrong are to give only the principal
            // value, to give the two solutions reflected the wrong way round, and to solve
            // the cosine equation instead. Each is an angle a learner writes after real work.
            let reference=Math.abs(principal);
            let pool:string[]=[
                roundTo(reference, 2).toFixed(2),
                `${roundTo(reference, 2).toFixed(2)}, ${roundTo(2*Math.PI-reference, 2).toFixed(2)}`,
                `${roundTo(Math.acos(steps/100), 2).toFixed(2)}, ${roundTo(2*Math.PI-Math.acos(steps/100), 2).toFixed(2)}`,
                `${roundTo(Math.PI-reference, 2).toFixed(2)}, ${roundTo(Math.PI+reference, 2).toFixed(2)}`
            ];
            choices=fourOptions(correct, pool);
            break;
        }
        case "amplitude":{
            let A=roundTo(rng()*(difficulty==="hard"?6:difficulty==="easy"?2:4)+1, 1);
            correct=A.toFixed(1);
            alternate=correct;
            display=correct;
            latex=`Find the amplitude of \\( y=${correct}\\sin(3x+\\pi/4) \\)`;
            // The three ways a learner misreads an amplitude are to report the frequency as
            // the amplitude, to report twice the frequency, and to report the vertical
            // offset the constant gives. Each is a number that can be read off the graph.
            choices=fourOptions(correct, ["3.0", "6.0", "1.0", "0.0"]);
            break;
        }
        case "period":{
            let B=randInt(rng, 1, 4);
            let period=2*Math.PI/B;
            correct=roundTo(period, 2).toFixed(2)+" rad";
            alternate=`2π/${B} rad`;
            display=correct;
            latex=`What is the period of \\( y=\\sin(${B}x) \\)? (in radians)`;
            choices=fourOptions(correct, periodPool(2*Math.PI, B, 2).map(value=>value+" rad"));
            break;
        }
        case "phase_shift":{
            // The shift is drawn from a table of non-zero values, because a question whose
            // answer is "no shift" has no honest distractors: every option a learner could
            // write for it is also no shift.
            let magnitude=PHASE_SHIFTS[Math.floor(rng()*PHASE_SHIFTS.length)];
            let toLeft=rng()<0.5;
            let C=toLeft?magnitude:-magnitude;
            let shiftMag=magnitude.toFixed(2);
            let shiftDirection=toLeft?"left":"right";
            correct=`${shiftMag} rad ${shiftDirection}`;
            alternate=(-magnitude).toFixed(2);
            display=correct;
            latex=`Identify the phase shift of \\( y=\\sin(x${C>=0?"+":"-"}${magnitude.toFixed(2)}) \\) (in radians)`;
            // A phase shift is a signed distance, so the three honest ways to be wrong are
            // to drop the sign, to halve it, and to double it.
            let opposite=toLeft?"right":"left";
            choices=fourOptions(correct, [
                `${shiftMag} rad ${opposite}`,
                `${(magnitude/2).toFixed(2)} rad ${shiftDirection}`,
                `${(magnitude*2).toFixed(2)} rad ${shiftDirection}`,
                `${shiftMag} rad`
            ]);
            break;
        }
        case "law_sines":{
            let angleA=randInt(rng, 30, 79);
            let angleB=randInt(rng, 30, 79);
            let sideA=randInt(rng, 5, difficulty==="easy"?9:14);
            let angleC=180-angleA-angleB;
            let sideB=sideA*Math.sin(angleB*Math.PI/180)/Math.sin(angleA*Math.PI/180);
            correct=roundTo(sideB, 1).toFixed(1);
            alternate=correct;
            display=correct;
            latex=`Using the Law of Sines:<br>
				In triangle ABC, ∠A=${angleA}°, ∠B=${angleB}°, and side a=${sideA}.<br>
				Find side b.`;
            // The three ways a learner applies the sine law wrongly are to divide by the sine
            // of the third angle, to invert the ratio, and to omit the division entirely.
            // Each is the side b of a triangle that exists.
            let pool:string[]=[
                roundTo(sideA*Math.sin(angleB*Math.PI/180)/Math.sin(angleC*Math.PI/180), 1).toFixed(1),
                roundTo(sideA*Math.sin(angleA*Math.PI/180)/Math.sin(angleB*Math.PI/180), 1).toFixed(1),
                roundTo(sideA*Math.sin(angleB*Math.PI/180), 1).toFixed(1),
                sideA.toFixed(1)
            ];
            choices=fourOptions(correct, pool);
            break;
        }
        case "unit_circle":{
            let angle=SPECIAL_ANGLES[Math.floor(rng()*SPECIAL_ANGLES.length)];
            let point=(x: number, y: number): string=>`(${roundTo(x, 2).toFixed(2)}, ${roundTo(y, 2).toFixed(2)})`;
            correct=point(Math.cos(angle*Math.PI/180), Math.sin(angle*Math.PI/180));
            alternate=correct;
            display=correct;
            latex=`Find the coordinates on the unit circle for an angle of ${angle}° (format: (cos, sin))`;
            // The three ways a learner gets a unit-circle point wrong are to read the point at
            // the reference angle, to read the point in the adjacent quadrant, and to swap
            // the two coordinates. Every candidate is the genuine point on the circle at
            // another angle, so each is a value a learner can defend as having computed.
            let pool:string[]=[];
            // A whole turn of candidates rather than three or four, because at a diagonal
            // angle the reflection and the swap land on the same point, and a short list
            // would leave the question with two options instead of four.
            for(let other of [angle+15, angle+30, angle+45, angle-15, angle-30, angle-45, 180-angle, 90-angle, 180-(90-angle), angle+90, angle-90]){
                let radians=other*Math.PI/180;
                pool.push(point(Math.cos(radians), Math.sin(radians)));
                pool.push(point(Math.sin(radians), Math.cos(radians)));
            }
            choices=fourOptions(correct, pool);
            break;
        }
        case "identity":{
            correct="1";
            alternate="one";
            display="1";
            latex=`Complete the identity: \\( \\sin^2\\theta+\\cos^2\\theta=\; ? \\)`;
            // Every option is a number the learner could write. The fourth is the two squared
            // terms added rather than identified, which is the mistake this branch is about.
            choices=["1","0","-1","2"];
            break;
        }
        default:
            return {latex: "Unknown sine question type", correct: ""};
    }
    return {
        latex,
        correct,
        alternate,
        display,
        choices,
        expectedFormat: ""
    };
}
export function generateCosine(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["evaluate","solve","amplitude","period","phase_shift","law_cosines","identity"];
    let type=types[Math.floor(rng()*types.length)];
    let correct="";
    let alternate="";
    let display="";
    let choices:string[]=[];
    let latex="";
    switch(type){
        case "evaluate":{
            let radianAngles=[
                {value:0,label:"0"},
                {value:Math.PI/6,label:"\\frac{\\pi}{6}"},
                {value:Math.PI/3,label:"\\frac{\\pi}{3}"},
                {value:Math.PI/2,label:"\\frac{\\pi}{2}"},
                {value:2*Math.PI/3,label:"\\frac{2\\pi}{3}"},
                {value:Math.PI,label:"\\pi"},
                {value:4*Math.PI/3,label:"\\frac{4\\pi}{3}"},
                {value:3*Math.PI/2,label:"\\frac{3\\pi}{2}"},
                {value:5*Math.PI/3,label:"\\frac{5\\pi}{3}"},
                {value:5*Math.PI/6,label:"\\frac{5\\pi}{6}"}
            ];
            let obj=radianAngles[Math.floor(rng()*radianAngles.length)];
            correct=roundTo(Math.cos(obj.value), 2).toFixed(2);
            alternate=correct;
            display=correct;
            latex=`Evaluate \\( \\cos(${obj.label}) \\)`;
            choices=fourOptions(correct, angleValuePool([Math.cos, Math.sin, Math.tan], obj.value*180/Math.PI, 2));
            break;
        }
        case "solve":{
            // The right-hand side is drawn from a grid strictly inside (-1, 1), because at an
            // endpoint the two solutions in [0, 2pi) coincide and the key becomes one solution
            // listed twice.
            let steps=randInt(rng, -95, 95);
            if(steps===0) steps=50;
            let k=(steps/100).toFixed(2);
            let principal=Math.acos(steps/100);
            let pair=[principal, 2*Math.PI-principal].sort((a, b) => a-b);
            correct=pair.map(sol=>roundTo(sol, 2).toFixed(2)).join(", ");
            alternate=correct;
            display=correct;
            latex=`Solve \\( \\cos\\theta=${k} \\) for \\( 0\\le\\theta<2\\pi \\) (in radians)`;
            // The three ways a learner answers this wrong are to give only the principal
            // value, to list the pair the other way round, and to solve the sine equation
            // instead. Each is an angle a learner writes after real work.
            let pool:string[]=[
                roundTo(principal, 2).toFixed(2),
                `${roundTo(2*Math.PI-principal, 2).toFixed(2)}, ${roundTo(principal, 2).toFixed(2)}`,
                `${roundTo(Math.asin(steps/100), 2).toFixed(2)}, ${roundTo(Math.PI-Math.asin(steps/100), 2).toFixed(2)}`,
                `${roundTo(2*Math.PI-principal, 2).toFixed(2)}`
            ];
            choices=fourOptions(correct, pool);
            break;
        }
        case "amplitude":{
            let A=roundTo(rng()*(difficulty==="hard"?6:difficulty==="easy"?2:4)+1, 1);
            correct=A.toFixed(1);
            alternate=correct;
            display=correct;
            latex=`Find the amplitude of \\( y=${correct}\\cos(2x-\\pi/3) \\)`;
            // The three ways a learner misreads an amplitude are to report the frequency as
            // the amplitude, to report twice the frequency, and to report the vertical
            // offset the constant gives. Each is a number that can be read off the graph.
            choices=fourOptions(correct, ["2.0", "4.0", "1.0", "0.0"]);
            break;
        }
        case "period":{
            let B=randInt(rng, 1, 4);
            let period=2*Math.PI/B;
            correct=roundTo(period, 2).toFixed(2)+" rad";
            alternate=`2π/${B} rad`;
            display=correct;
            latex=`What is the period of \\( y=\\cos(${B}x) \\)? (in radians)`;
            choices=fourOptions(correct, periodPool(2*Math.PI, B, 2).map(value=>value+" rad"));
            break;
        }
        case "phase_shift":{
            // The shift is drawn from a table of non-zero values, because a question whose
            // answer is "no shift" has no honest distractors: every option a learner could
            // write for it is also no shift.
            let magnitude=PHASE_SHIFTS[Math.floor(rng()*PHASE_SHIFTS.length)];
            let toLeft=rng()<0.5;
            let C=toLeft?magnitude:-magnitude;
            let shiftMag=magnitude.toFixed(2);
            let shiftDirection=toLeft?"left":"right";
            correct=`${shiftMag} rad ${shiftDirection}`;
            alternate=(-magnitude).toFixed(2);
            display=correct;
            latex=`Identify the phase shift of \\( y=\\cos(x${C>=0?"+":"-"}${magnitude.toFixed(2)}) \\) (in radians)`;
            // A phase shift is a signed distance, so the three honest ways to be wrong are
            // to drop the sign, to halve it, and to double it.
            let opposite=toLeft?"right":"left";
            choices=fourOptions(correct, [
                `${shiftMag} rad ${opposite}`,
                `${(magnitude/2).toFixed(2)} rad ${shiftDirection}`,
                `${(magnitude*2).toFixed(2)} rad ${shiftDirection}`,
                `${shiftMag} rad`
            ]);
            break;
        }
        case "law_cosines":{
            let a=randInt(rng, 5, difficulty==="easy"?9:14);
            let b=randInt(rng, 5, difficulty==="easy"?9:14);
            let angleC=randInt(rng, 30, difficulty==="easy"?59:79);
            let c=Math.sqrt(a*a+b*b-2*a*b*Math.cos(angleC*Math.PI/180));
            correct=roundTo(c, 1).toFixed(1);
            alternate=correct;
            display=correct;
            latex=`Using the Law of Cosines:<br>
				In triangle ABC, sides a=${a}, b=${b}, and ∠C=${angleC}°.<br>
				Find side c.`;
            // The three ways a learner applies the cosine law wrongly are to treat the
            // included angle as a right angle, to omit it from the sum, and to add where the
            // law subtracts. Each is the third side of a triangle that exists.
            let pool:string[]=[
                roundTo(Math.sqrt(a*a+b*b), 1).toFixed(1),
                roundTo(Math.sqrt(a*a+b*b-2*a*b), 1).toFixed(1),
                roundTo(Math.sqrt(a*a+b*b+2*a*b), 1).toFixed(1),
                roundTo(Math.sqrt(a*a+b*b-2*a*b*Math.cos(2*angleC*Math.PI/180)), 1).toFixed(1)
            ];
            choices=fourOptions(correct, pool);
            break;
        }
        case "identity":{
            correct="1";
            alternate="one";
            display="1";
            latex=`Complete the identity: \\( \\cos^2\\theta+\\sin^2\\theta=\; ? \\)`;
            // Every option is a number the learner could write. The fourth is the two squared
            // terms added rather than identified, which is the mistake this branch is about.
            choices=["1","0","-1","2"];
            break;
        }
        default:
            return {latex: "Unknown cosine question type", correct: ""};
    }
    return {
        latex,
        correct,
        alternate,
        display,
        choices,
        expectedFormat: ""
    };
}
export function generateTangent(_difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["evaluate","solve","period","asymptote","identity"];
    let type=types[Math.floor(rng()*types.length)];
    let correct="";
    let alternate="";
    let display="";
    let choices:string[]=[];
    let latex="";
    switch(type){
        case "evaluate":{
            let angles=[0,Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4];
            let labels=["0","\\frac{\\pi}{4}","\\frac{3\\pi}{4}","\\frac{5\\pi}{4}","\\frac{7\\pi}{4}"];
            let idx=Math.floor(rng()*angles.length);
            correct=roundTo(Math.tan(angles[idx]), 2).toFixed(2);
            alternate=correct;
            display=correct;
            latex=`Evaluate \\( \\tan(${labels[idx]}) \\)`;
            choices=fourOptions(correct, angleValuePool([Math.tan, Math.sin, Math.cos], angles[idx]*180/Math.PI, 2));
            break;
        }
        case "solve":{
            let steps=randInt(rng, -500, 500);
            if(steps===0) steps=250;
            let k=(steps/100).toFixed(2);
            let principal=Math.atan(steps/100);
            correct=`${roundTo(principal, 2).toFixed(2)}+\\pi n`;
            alternate=`${roundTo(principal, 2).toFixed(2)}+πn`;
            display=correct;
            latex=`Solve \\( \\tan\\theta=${k} \\) (in radians, give the principal solution)`;
            // The three ways a learner answers this wrong are to give one angle rather than
            // the family, to work in degrees, and to add pi once instead of k times. Each is
            // an expression a learner would write down.
            let pool:string[]=[
                `${roundTo(principal, 2).toFixed(2)}`,
                `${roundTo(principal*180/Math.PI, 2).toFixed(2)}+\\pi n`,
                `${roundTo(principal, 2).toFixed(2)}+\\pi`,
                `${roundTo(principal+Math.PI, 2).toFixed(2)}+\\pi n`
            ];
            choices=fourOptions(correct, pool);
            break;
        }
        case "period":{
            let B=randInt(rng, 1, 3);
            let period=Math.PI/B;
            correct=roundTo(period, 2).toFixed(2)+" rad";
            alternate=`π/${B} rad`;
            display=correct;
            latex=`What is the period of \\( y=\\tan(${B}x) \\) (in radians)`;
            choices=fourOptions(correct, periodPool(Math.PI, B, 2).map(value=>value+" rad"));
            break;
        }
        case "asymptote":{
            let B=randInt(rng, 1, 3);
            correct=`x = \\frac{\\pi}{2\\cdot${B}} + \\frac{\\pi k}{${B}}`;
            alternate=`x=π/(2*${B}) + πk/${B}`;
            display=correct;
            latex=`Find the vertical asymptotes of \\( y=\\tan(${B}x) \\) (in radians).`;
            // The three ways a learner misreads the asymptote spacing are to halve it, to
            // double it, and to drop the frequency from the first term. Each is a family of
            // lines a learner would write down.
            let pool:string[]=[
                `x = \\frac{\\pi}{4\\cdot${B}} + \\frac{\\pi k}{${B}}`,
                `x = \\frac{\\pi}{2\\cdot${B}} + \\frac{\\pi k}{${B}\\cdot2}`,
                `x = \\frac{\\pi}{${B}} + \\frac{\\pi k}{${B}}`,
                `x = \\frac{\\pi}{2\\cdot${B}} + \\frac{\\pi k}{${B+1}}`
            ];
            choices=fourOptions(correct, pool);
            break;
        }
        case "identity":{
            correct="\\sec^2\\theta";
            alternate="sec^2θ";
            display="\\sec^2\\theta";
            latex=`Complete the identity: \\( 1+\\tan^2\\theta=\; ? \\)`;
            // The three honest wrong answers are the ratio for the complement, the ratio
            // for the reciprocal of this one, and the left-hand side read back unchanged.
            choices=fourOptions(correct, ["\\csc^2\\theta", "\\cot^2\\theta", "1", "\\tan^2\\theta"]);
            break;
        }
        default:
            return {latex: "Unknown tangent question type", correct: ""};
    }
    return {
        latex,
        correct,
        alternate,
        display,
        choices,
        expectedFormat: ""
    };
}
