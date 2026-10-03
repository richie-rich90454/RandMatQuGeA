/**
 * @file Exponential equations and models: matching exponents of one base,
 * rewriting two bases as powers of one, doubling growth, and repeated halving.
 * @description An equation of this shape is solved by making both sides powers of a
 * single base and then matching the exponents, which is only possible once the
 * bases have been rewritten. The exponents here are drawn so that the match gives a
 * whole number or a whole number and a half, so no answer is a logarithm the prompt
 * never rounded.
 *
 * The two model branches divide an integer by an exact power of two or four rather
 * than multiplying by a fraction, because a mass or a count that does not halve a
 * whole number of times is a real situation and not a question with a typed answer.
 */
import type{RngFn, QuestionDto}from"../../../types/global";
import{fmtTrim}from"../../shared/Numeric";
import{fourOptions, numberOptions}from"../../shared/Options.js";
import{randInt}from"../../shared/Random";

/**
 * Renders a linear exponent such as x + 3 or x - 2, without a sign that has nothing
 * in front of it.
 *
 * @param shift - The number added to x.
 * @returns The exponent as it is printed.
 */
function exponentOf(shift: number): string{
    if (shift===0) return "x";
    if (shift>0) return `x+${shift}`;
    return `x-${Math.abs(shift)}`;
}

export function generateExponentialEquations(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["same_base","different_base","growth_model","decay_model"];
    let type=types[Math.floor(rng()*types.length)];
    let key="";
    let alternate="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "same_base":{
            // Both sides are written as powers of one base, so the only step left is
            // matching the exponents and undoing the shift on the exponent.
            let base=[2, 3, 5, 10][Math.floor(rng()*4)] as number;
            let shift=randInt(rng, -4, difficulty==="hard"?8:5);
            let exponent=randInt(rng, 0, 6);
            let solution=exponent-shift;
            key=String(solution);
            latex=`Solve \\( ${base}^{${exponentOf(shift)}} = ${base}^{${exponent}} \\). What is \\( x \\)?`;
            choices=numberOptions(solution, [solution+1, solution-1, exponent, shift], 0);
            rungs=[
                "Powers of one base are equal exactly when their exponents are equal, so the equation is finished the moment both sides are written with the same base.",
                `Match the exponents of ${base}, then undo the ${shift>=0?"addition":"subtraction"} on the exponent.`
            ];
            steps=[
                `Both sides are powers of ${base}, so the exponents are equal.`,
                `${exponentOf(shift)} = ${exponent}.`,
                `x = ${exponent} - (${shift}) = ${key}`
            ];
            break;
        }
        case "different_base":{
            // The two bases are powers of one hidden base, so both sides can be written
            // with it and the exponents matched. The pairs are chosen so that the
            // matched exponents differ by a whole number or a half, which keeps the
            // answer exact without rounding anything.
            let p=[2, 3][Math.floor(rng()*2)] as number;
            let shape: [number, number][]=[[2, 1], [2, 3], [1, 2], [1, 3]];
            let pair=shape[Math.floor(rng()*shape.length)] as [number, number];
            let leftPower=pair[0];
            let rightPower=pair[1];
            let leftBase=Math.pow(p, leftPower);
            let rightBase=Math.pow(p, rightPower);
            let shift=randInt(rng, -2, 3);
            let solution=rightPower/leftPower-shift;
            key=fmtTrim(solution, 2);
            alternate=solution===0.5?"1/2":solution===-0.5?"-1/2":solution===1.5?"3/2":solution===-1.5?"-3/2":key;
            latex=`Solve \\( ${leftBase}^{${exponentOf(shift)}} = ${rightBase} \\). What is \\( x \\)?`;
            expectedFormat="Enter a decimal or a fraction, for example 0.5";
            choices=fourOptions(key, [fmtTrim(solution+1, 2), fmtTrim(solution-1, 2), fmtTrim(solution+0.5, 2), String(shift), String(leftPower)]);
            rungs=[
                "Two different bases cannot be matched directly, so rewrite each of them as a power of one base that both are powers of, and then match the exponents.",
                `${leftBase} is ${p} to the power ${leftPower}, and ${rightBase} is ${p} to the power ${rightPower}, so match ${leftPower} times the exponent against ${rightPower}.`
            ];
            steps=[
                `Rewrite both sides with base ${p}: ${p} to the power ${leftPower} times (${exponentOf(shift)}) equals ${p} to the power ${rightPower}.`,
                `${leftPower} x ${exponentOf(shift)} = ${rightPower}, so x = ${rightPower} / ${leftPower} - (${shift}).`,
                `x = ${fmtTrim(rightPower/leftPower, 2)} - (${shift}) = ${key}`
            ];
            break;
        }
        case "growth_model":{
            // The starting count is a whole number and the number of periods is small,
            // so doubling the right number of times gives a whole count.
            let start=randInt(rng, 2, difficulty==="hard"?60:25)*5;
            let hoursPerPeriod=randInt(rng, 1, 5);
            let periods=randInt(rng, 2, difficulty==="hard"?5:4);
            let total=hoursPerPeriod*periods;
            let grown=start*Math.pow(2, periods);
            key=String(grown);
            latex=`A culture starts with \\( ${start} \\) bacteria and doubles every \\( ${hoursPerPeriod} \\) hours. How many bacteria are there after \\( ${total} \\) hours?`;
            choices=numberOptions(grown, [grown+start, grown-start, start*Math.pow(2, periods-1), start*periods], 0);
            rungs=[
                "Repeated doubling is a power of two, so the first step is to work out how many whole doubling periods have passed.",
                `${total} hours is ${periods} periods of ${hoursPerPeriod} hours.`
            ];
            steps=[
                `${total} / ${hoursPerPeriod} = ${periods} whole doubling periods have passed.`,
                `Each period multiplies the count by 2, so the count is multiplied by 2 to the power ${periods}.`,
                `${start} x 2 to the power ${periods} is the count, which is ${key}`
            ];
            break;
        }
        case "decay_model":{
            // The starting amount is drawn as a multiple of the exact power the model
            // divides by, so every step of the decay is a whole amount.
            let shrink=[2, 4][Math.floor(rng()*2)] as number;
            let hoursPerPeriod=randInt(rng, 1, 5);
            let periods=randInt(rng, 2, difficulty==="hard"?4:3);
            let total=hoursPerPeriod*periods;
            let divisor=Math.pow(shrink, periods);
            let start=randInt(rng, 2, difficulty==="hard"?40:15)*divisor;
            let left=start/divisor;
            key=String(left);
            let share=shrink===2?"half of it":"a quarter of it";
            latex=`A sample of \\( ${start} \\) grams loses ${share} every \\( ${hoursPerPeriod} \\) hours. How many grams are left after \\( ${total} \\) hours?`;
            choices=numberOptions(left, [start/Math.pow(shrink, periods-1), start, left*2, left+1], 0);
            rungs=[
                "Repeated halving divides rather than multiplies, so the number of whole periods has to come first and then the amount is divided by that power.",
                `${total} hours is ${periods} periods of ${hoursPerPeriod} hours, and each period keeps a ${shrink===2?"half":"quarter"}.`
            ];
            steps=[
                `${total} / ${hoursPerPeriod} = ${periods} whole periods have passed.`,
                `Each period divides the amount by ${shrink}, so ${periods} periods divide it by ${divisor}.`,
                `${start} / ${divisor} is the amount left in grams, which is ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:alternate===""?key:alternate, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
