/**
 * Reciprocal trigonometric functions: cosecant, secant, cotangent.
 * @fileoverview Generates questions on reciprocal trig functions with MCQ distractors. Returns a QuestionDto with LaTeX display, plain text alternate, and plausible wrong answers.
 * @date 2026-04-18
 */
import type{RngFn, QuestionDto}from "../../types/global";
import{roundTo}from"../shared/Numeric";
import{angleValuePool, definedDegrees, piLabel}from"./TrigUtils.js";
import{fourOptions}from"../shared/Options.js";

export function generateCosecant(_difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["evaluate","relationship","asymptote"];
    let type=types[Math.floor(rng()*types.length)];
    let correct="";
    let alternate="";
    let display="";
    let choices:string[]=[];
    let latex="";
    let ratio=(radians: number) => 1/Math.sin(radians);
    switch(type){
        case "evaluate":{
            // The angle is drawn from the special angles at which cosecant is defined. At
            // the others it has no value at all, and a question asking for it would have
            // no answer, while offering one as a distractor for another ratio produced the
            // literal text "Infinity" in an option list.
            let defined=definedDegrees(ratio);
            let angle=defined[Math.floor(rng()*defined.length)];
            let radians=angle*Math.PI/180;
            correct=roundTo(ratio(radians), 2).toFixed(2);
            alternate=correct;
            display=correct;
            latex=`Evaluate \\( \\csc(${piLabel(angle)}) \\)`;
            choices=fourOptions(correct, angleValuePool([ratio, Math.sin, Math.cos], angle, 2));
            break;
        }
        case "relationship":{
            let angleNum=Math.floor(rng()*360);
            correct=`\\frac{1}{\\sin(${angleNum}^{\\circ})}`;
            alternate=`1/sin(${angleNum}°)`;
            display=correct;
            latex=`Express \\( \\csc(${angleNum}^{\\circ}) \\) in terms of sine.`;
            // The three ways a learner rewrites this wrongly are to invert cosine, to
            // invert tangent, and to drop the reciprocal altogether. Each is a
            // reciprocal relation a learner would write down.
            choices=fourOptions(correct, [
                `\\frac{1}{\\cos(${angleNum}^{\\circ})}`,
                `\\frac{1}{\\tan(${angleNum}^{\\circ})}`,
                `\\sin(${angleNum}^{\\circ})`,
                `\\frac{\\cos\\theta}{\\sin\\theta}`
            ]);
            break;
        }
        case "asymptote":{
            correct="x = n\\pi";
            alternate="x=nπ";
            display=correct;
            latex=`Find the vertical asymptotes of \\( y=\\csc(x) \\) (in radians).`;
            // The three ways a learner misreads the asymptote spacing are to double it, to
            // halve it, and to place it a quarter turn away. Each is a family of lines a
            // learner would write down.
            choices=fourOptions(correct, [
                "x = 2n\\pi",
                "x = n\\pi + \\frac{\\pi}{2}",
                "x = \\frac{\\pi}{2} + n\\pi",
                "x = n\\pi + \\frac{\\pi}{4}"
            ]);
            break;
        }
        default:
            return {latex: "Unknown cosecant question type", correct: ""};
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
export function generateSecant(_difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let type=rng()<0.5?"evaluate":"identity";
    let correct="";
    let alternate="";
    let display="";
    let choices:string[]=[];
    let latex="";
    let ratio=(radians: number) => 1/Math.cos(radians);
    switch(type){
        case "evaluate":{
            // The angle is drawn from the special angles at which secant is defined. At
            // a right angle the cosine is zero, so the secant is not a value a learner
            // can write down, and dividing by it was what put "Infinity" in an option.
            let defined=definedDegrees(ratio);
            let angle=defined[Math.floor(rng()*defined.length)];
            let radians=angle*Math.PI/180;
            correct=roundTo(ratio(radians), 2).toFixed(2);
            alternate=correct;
            display=correct;
            latex=`Evaluate \\( \\sec(${piLabel(angle)}) \\)`;
            choices=fourOptions(correct, angleValuePool([ratio, Math.cos, Math.tan], angle, 2));
            break;
        }
        case "identity":{
            correct="1";
            alternate="1";
            display="1";
            latex=`Complete the identity: \\( \\sec^2\\theta-\\tan^2\\theta=? \\)`;
            // Every option is a number the learner could write. The fourth is the two
            // terms added rather than subtracted, which is the mistake this branch is
            // about.
            choices=["1","0","-1","2"];
            break;
        }
        default:
            return {latex: "Unknown secant question type", correct: ""};
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
export function generateCotangent(_difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let type=rng()<0.5?"evaluate":"relationship";
    let correct="";
    let alternate="";
    let display="";
    let choices:string[]=[];
    let latex="";
    let ratio=(radians: number) => Math.cos(radians)/Math.sin(radians);
    switch(type){
        case "evaluate":{
            // The angle is drawn from the special angles at which cotangent is defined. At
            // a multiple of a turn the sine is zero, so the cotangent has no value there.
            let defined=definedDegrees(ratio);
            let angle=defined[Math.floor(rng()*defined.length)];
            let radians=angle*Math.PI/180;
            correct=roundTo(ratio(radians), 2).toFixed(2);
            alternate=correct;
            display=correct;
            latex=`Evaluate \\( \\cot(${piLabel(angle)}) \\)`;
            choices=fourOptions(correct, angleValuePool([ratio, Math.cos, Math.tan], angle, 2));
            break;
        }
        case "relationship":{
            correct="\\frac{1}{\\tan\\theta}";
            alternate="1/tanθ";
            display="\\frac{1}{\\tan\\theta}";
            latex=`Express \\( \\cot\\theta \\) in terms of tangent.`;
            // The three ways a learner rewrites this wrongly are to invert sine, to invert
            // cosine, and to read it as tangent itself. Each is a reciprocal relation a
            // learner would write down.
            choices=fourOptions(correct, [
                "\\frac{1}{\\sin\\theta}",
                "\\frac{1}{\\cos\\theta}",
                "\\tan\\theta",
                "\\cos^2\\theta"
            ]);
            break;
        }
        default:
            return {latex: "Unknown cotangent question type", correct: ""};
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
