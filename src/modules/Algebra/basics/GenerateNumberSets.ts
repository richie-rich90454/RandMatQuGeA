import type{RngFn, QuestionDto}from"../../../types/global";
import{roundTo}from"../../shared/Numeric";
import{fourOptions}from"../../shared/Options.js";

/**
 * Generates a question about number sets (identify, classify, or compare numbers) with MCQ distractors.
 * @fileoverview Number sets identification. The comparison branch is a selection
 * question rather than a three-symbol one: `<`, `>` and `=` are the whole answer
 * domain for a comparison of two real numbers, so there is no fourth symbol that
 * is wrong, and inventing one would teach a learner to look for the option that
 * is not a symbol. `none of these` is offered instead, which is always wrong for
 * a comparison of two real numbers because exactly one of the three symbols is
 * always right, and which is the answer a learner who mis-parses the prompt
 * genuinely gives.
 * @date 2026-04-18
 * @param _difficulty - Unused; the branch decides the range, not the difficulty.
 * @param rng - The injected random source.
 * @returns QuestionDto
 */
export function generateNumberSets(_difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["identify","classify","compare"];
    let type=types[Math.floor(rng()*types.length)];
    let expectedFormat="Enter the set names separated by commas";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices:string[]=[];
    switch(type){
        case "identify":{
            // The value is rounded first and the rounded value is both printed
            // and classified. Classifying the unrounded value labelled 3.001 as
            // irrational while printing 3.00, which the same question defines as
            // a natural number.
            let num=roundTo(rng()*10, 2);
            let shown=num.toFixed(2);
            let desc;
            if(Number.isInteger(num)&&num>0) desc="natural, whole, integer, rational, real";
            else if(Number.isInteger(num)&&num<0) desc="integer, rational, real";
            // Zero is a whole number and a rational number, but whether it is a
            // natural number is a convention, so it is left out of the answer
            // rather than guessed at. The option that claims it is a natural
            // number is left out with it, because on the 0-in-naturals
            // convention that option would also be right.
            else if(num===0) desc="whole, integer, rational, real";
            else desc="rational, real";
            correct=desc;
            alternate=desc;
            display=desc;
            mathExpression=`Identify all number sets for \\( ${shown} \\) (natural, whole, integer, rational, irrational, real).`;
            if(desc.includes("natural")){
                choices=[desc,"natural, whole, integer, real","integer, rational, real","rational, real","irrational, real"];
            }
            else if(num===0){
                choices=[desc,"integer, rational, real","irrational, real","natural, integer, rational, real","real"];
            }
            else if(desc.includes("integer")){
                choices=[desc,"natural, whole, integer, rational, real","rational, real","irrational, real","real"];
            }
            else{
                choices=[desc,"natural, whole, integer, rational, real","integer, rational, real","irrational, real","real"];
            }
            break;
        }
        case "classify":{
            let num=Math.floor(rng()*10)-5;
            // Zero is a whole number and a rational number but is not a negative
            // integer, so it gets its own description rather than the negative
            // integer's. Without this the option "whole, integer, rational,
            // real" was offered against the key for zero, which made it a second
            // correct answer that the option validator cannot see because the
            // options are prose. No option other than the key claims zero is a
            // whole number, because on the 0-in-naturals convention the longer
            // list would be a second correct answer too.
            let desc;
            if(num>0) desc="natural, whole, integer, rational, real";
            else if(num===0) desc="whole, integer, rational, real";
            else desc="integer, rational, real";
            correct=desc;
            alternate=desc;
            display=desc;
            mathExpression=`Classify \\( ${num} \\) as natural, whole, integer, rational, irrational, or real.`;
            if(num>0){
                choices=[desc,"whole, integer, rational, real","integer, rational, real","rational, real","irrational, real"];
            }
            else if(num===0){
                choices=[desc,"integer, rational, real","irrational, real","natural, integer, rational, real","real"];
            }
            else{
                choices=[desc,"natural, whole, integer, rational, real","whole, integer, rational, real","irrational, real","real"];
            }
            break;
        }
        case "compare":{
            // Rounded before comparing for the same reason as the identify
            // branch: 3.001 and 3.002 print as 3.00 and 3.00, so a question built
            // on the unrounded values asked the learner to grade 3.00 < 3.00.
            let a=roundTo(rng()*10, 2);
            let b=roundTo(rng()*10, 2);
            let comp=a<b?"<":a>b?">":"=";
            correct=comp;
            alternate=comp;
            display=comp;
            mathExpression=`Compare: \\( ${a.toFixed(2)} \\) ___ \\( ${b.toFixed(2)} \\) (enter <, >, or =)`;
            choices=["<",">","=","none of these"];
            break;
        }
    }
    return {
        latex: mathExpression,
        correct,
        alternate,
        display,
        choices: fourOptions(correct, choices),
        expectedFormat
    };
}
