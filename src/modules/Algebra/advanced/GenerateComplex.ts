import type {RngFn, QuestionDto} from "../../../types/global";
import {getMaxForDifficulty} from "../AlgebraUtils.js";
import {fourOptions} from "../../shared/Options.js";
import {fmt} from "../../shared/Numeric";
/**
 * Renders a complex number the way this generator prints it, so a key and a
 * distractor built from the same mistake are spelled the same way and cannot
 * collide as text while differing in value.
 *
 * @param real - The real part.
 * @param imag - The imaginary part, sign included.
 * @param decimals - Decimal places to render each part at.
 * @returns The option text.
 */
function complexText(real: number, imag: number, decimals: number): string{
    let magnitude=imag<0?-imag:imag;
    let sign=imag<0?" - ":" + ";
    return fmt(real,decimals)+sign+fmt(magnitude,decimals)+"i";
}
/**
 * Complex number operations: addition, subtraction, multiplication, division, powers of i.
 * @fileoverview Generates complex number arithmetic questions with MCQ distractors. Sets window.correctAnswer with correct result and display.
 * @date 2026-04-18
 * @returns QuestionDto
 */
export function generateComplex(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["add","subtract","multiply","divide","powers_i"];
    let type=types[Math.floor(rng()*types.length)];
    let maxVal=getMaxForDifficulty(difficulty,5);
    let a=Math.floor(rng()*maxVal)+1;
    let b=Math.floor(rng()*maxVal)+1;
    let c=Math.floor(rng()*maxVal)+1;
    let d=Math.floor(rng()*maxVal)+1;
    let expectedFormat="Enter as a+bi (e.g., 3+2i)";
    let correct="";
    let alternate="";
    let display="";
    let mathExpression="";
    let choices: string[]=[];
    switch(type){
        case "add":{
            let real=a+c;
            let imag=b+d;
            correct=imag>=0?`${real} + ${imag}i`:`${real} - ${-imag}i`;
            alternate=imag>=0?`${real}+${imag}i`:`${real}-${-imag}i`;
            display=correct;
            mathExpression=`Add: \\( (${a} + ${b}i) + (${c} + ${d}i) \\)`;
            // Dropping a carry in one part only is the mistake, so the two
            // single-part errors lead and the two-part error backs them up.
            // Both single-part errors are distinct from the key because imag
            // is the sum of two positive draws.
            choices=fourOptions(correct, [
                complexText(real,imag+1,0),
                complexText(real+1,imag,0),
                complexText(real-1,imag-1,0),
                complexText(real+2,imag,0),
                complexText(real,imag+2,0)
            ]);
            break;
        }
        case "subtract":{
            let real=a-c;
            let imag=b-d;
            correct=imag>=0?`${real} + ${imag}i`:`${real} - ${-imag}i`;
            alternate=imag>=0?`${real}+${imag}i`:`${real}-${-imag}i`;
            display=correct;
            mathExpression=`Subtract: \\( (${a} + ${b}i) - (${c} + ${d}i) \\)`;
            // A carry dropped in either part, or the subtraction not carried
            // into both at once. Every candidate differs from the key in the
            // real part or by more than the rounding, so the value filter
            // cannot keep one by accident.
            choices=fourOptions(correct, [
                complexText(real,imag+1,0),
                complexText(real+1,imag,0),
                complexText(real-1,imag-1,0),
                complexText(real+2,imag,0),
                complexText(real,imag+2,0)
            ]);
            break;
        }
        case "multiply":{
            let real=a*c-b*d;
            let imag=a*d+b*c;
            correct=imag>=0?`${real} + ${imag}i`:`${real} - ${-imag}i`;
            alternate=imag>=0?`${real}+${imag}i`:`${real}-${-imag}i`;
            display=correct;
            mathExpression=`Multiply: \\( (${a} + ${b}i)(${c} + ${d}i) \\)`;
            // The two expansions that get the signs wrong: keeping only the
            // ac and bd products, and keeping only the ad and bc cross
            // terms. Those are the mistakes this branch exists to catch, so
            // they lead.
            choices=fourOptions(correct, [
                complexText(a*c,b*d,0),
                complexText(a*d,b*c,0),
                complexText(real,imag+1,0),
                complexText(real+1,imag,0),
                complexText(real-1,imag-1,0),
                complexText(a*c+b*d,b*d-a*c,0)
            ]);
            break;
        }
        case "divide":{
            let denom=c*c+d*d;
            let real=(a*c+b*d)/denom;
            let imag=(b*c-a*d)/denom;
            correct=complexText(real,imag,2);
            // The same number without the spaces, which is what a learner
            // types, so it is offered as the alternate spelling.
            alternate=`${fmt(real,2)}${imag<0?"-":"+"}${fmt(imag<0?-imag:imag,2)}i`;
            display=correct;
            expectedFormat="Enter as a+bi decimals (e.g., 0.33+0.25i)";
            mathExpression=`Divide: \\( \\frac{${a} + ${b}i}{${c} + ${d}i} \\)`;
            // Forgetting to divide by c^2+d^2, and multiplying by the
            // conjugate without dividing at all, are the two mistakes. The
            // +/-1 on the denominator is arithmetic noise rather than a
            // misconception, and it is what used to leave three options when
            // the two expansions rounded to the same two decimals.
            choices=fourOptions(correct, [
                complexText(a*c+b*d,b*c-a*d,2),
                complexText(a*c,b*d,2),
                complexText((a*c+b*d)/denom,a*d-b*c,2),
                complexText((b*c-a*d)/denom,(a*c+b*d)/denom,2),
                complexText((a*c+b*d)/(denom+1),(b*c-a*d)/(denom+1),2)
            ]);
            break;
        }
        case "powers_i":{
            let n=Math.floor(rng()*4)+1;
            let ans=["i","-1","-i","1"][(n-1)%4];
            correct=ans;
            alternate=ans;
            display=ans;
            expectedFormat="Enter i, -1, -i, or 1";
            mathExpression=`Simplify: \\( i^{${n}} \\)`;
            // The four powers of i are the whole answer domain, so all four
            // are offered and the one the prompt names leads.
            choices=fourOptions(correct, ["i","-1","-i","1"]);
            break;
        }
    }
    let latex=mathExpression;
    return {
        latex,
        correct,
        alternate,
        display,
        choices,
        expectedFormat
    };
}
