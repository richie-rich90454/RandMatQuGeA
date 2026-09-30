import type {RngFn, QuestionDto} from "../../../types/global";
import{roundTo}from"../../shared/Numeric";
/**
 * Generates a question about number sets (identify, classify, or compare numbers) with MCQ distractors.
 * @fileoverview Number sets identification. Sets window.correctAnswer with plain text description and plausible wrong answers.
 * @date 2026-04-18
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
            // rather than guessed at.
            else if(num===0) desc="whole, integer, rational, real";
            else desc="rational, real";
            correct=desc;
            alternate=desc;
            display=desc;
            mathExpression=`Identify all number sets for \\( ${shown} \\) (natural, whole, integer, rational, irrational, real).`;
            if(desc.includes("natural")){
                choices=[desc,"natural, whole, integer, real","integer, rational, real","rational, real","irrational, real"];
            }
            else if(desc.includes("whole")){
                choices=[desc,"natural, whole, integer, rational, real","integer, rational, real","irrational, real","real"];
            }
            else if(desc.includes("integer")){
                choices=[desc,"natural, whole, integer, rational, real","rational, real","irrational, real","whole, integer, rational, real"];
            }
            else{
                choices=[desc,"natural, whole, integer, rational, real","integer, rational, real","irrational, real","real"];
            }
            break;
        }
        case "classify":{
            let num=Math.floor(rng()*10)-5;
            let desc= num>0?"natural, whole, integer, rational, real" : "integer, rational, real";
            correct=desc;
            alternate=desc;
            display=desc;
            mathExpression=`Classify \\( ${num} \\) as natural, whole, integer, rational, irrational, or real.`;
            if(num>0){
                choices=[desc,"natural, whole, integer, real","integer, rational, real","whole, integer, rational, real","natural, integer, rational, real"];
            }
            else{
                choices=[desc,"integer, rational, real","natural, whole, integer, rational, real","whole, integer, rational, real","real"];
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
            choices=["<",">","="];
            break;
        }
    }
    let uniqueChoices=[...new Set(choices)];
    if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
    if(!uniqueChoices.includes(correct)){
        if(uniqueChoices.length>0) uniqueChoices[Math.floor(rng()*uniqueChoices.length)]=correct;
        else uniqueChoices=[correct];
    }
    let latex=mathExpression;
    return {
        latex,
        correct,
        alternate,
        display,
        choices: uniqueChoices,
        expectedFormat
    };
}
