/**
 * @file Improper integrals and the integral test that leans on them.
 * @description The exponents here are exact integers and never decimals, because
 * `x^{-p}` converges on `[1, infinity)` exactly when `p > 1` and `x^{p}`
 * converges there exactly when `p < -1`, and a question whose answer turned on
 * the comparison between a decimal exponent and an integer would be answered by
 * rounding rather than by reasoning. The exponents that give an exactly
 * representable value are chosen from a small table, so no key in this file is a
 * rounded rational.
 *
 * The branch that decides convergence does not ask a learner to choose between
 * "converges" and "diverges", because that domain holds two honest values and a
 * multiple-choice question needs four. It asks for the threshold exponent
 * instead, whose domain holds four honest integers of which exactly one is the
 * answer, and the series branch offers four series of which exactly one has an
 * exponent above one.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{fmt, fmtTrim}from"../shared/Numeric.js";
import{randInt}from"../shared/Random.js";

/** How many decimal places the terminating rational answers are printed at. */
const PLACES=3;

export function generateImproperIntegrals(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["infinite_upper_bound","infinite_function","decide_convergence","compare_a_series"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    let easy=difficulty==="easy";
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let display="";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "infinite_upper_bound":{
            // `int_1^inf x^{-p} dx = 1/(p-1)`. The exponents come from a table whose
            // values are exactly representable, so the printed key is exact rather
            // than a rounded fraction.
            let exponents=easy?[2, 3]:[2, 3, 5, 9];
            let p=exponents[Math.floor(rng()*exponents.length)];
            key=1/(p-1);
            latex=`Evaluate the improper integral \\( \\int_{1}^{\\infty} \\dfrac{1}{x^{${p}}}\\,dx \\). Give your answer as an exact decimal.`;
            wrong=[1/p, 2/(p-1), 1/(p+1), p-1, 1/(p-1)+1];
            display=`\\lim_{b \\to \\infty} \\frac{b^{${1-p}}}{${1-p}} = ${fmtTrim(key, 6)}`;
            rungs=[
                "Write the integral as a limit of proper integrals, find an antiderivative, and then take the limit of the endpoint value: whether it converges is decided by that limit being finite.",
                `The antiderivative is \\( x^{1-${p}} / (1-${p}) \\), so the only term that can diverge is the one at the upper endpoint.`
            ];
            steps=[
                `$ \\int_{1}^{b} \\dfrac{1}{x^{${p}}}\\,dx = \\left[\\dfrac{x^{1-${p}}}{1-${p}}\\right]_{1}^{b} = \\dfrac{b^{${1-p}}}{${1-p}} - \\dfrac{1}{${1-p}} $, and the improper integral is the limit of this as $ b \\to \\infty $.`,
                `Because $ ${p} > 1 $, the power $ 1 - ${p} = ${1-p} $ is negative, so $ b^{${1-p}} \\to 0 $.`,
                `The limit is $ -\\dfrac{1}{${1-p}} = ${fmtTrim(key, 6)} $, so the answer is ${fmt(key, PLACES)}.`
            ];
            break;
        }
        case "infinite_function":{
            // `int_0^1 x^n dx = 1/(n+1)`, improper because the integrand is unbounded
            // at zero. The exponents keep `n + 1` a power of two, so the value
            // terminates rather than repeating.
            let exponents=easy?[0, 1]:[0, 1, 3, 7];
            let n=exponents[Math.floor(rng()*exponents.length)];
            key=1/(n+1);
            latex=`Evaluate the improper integral \\( \\int_{0}^{1} x^{${n}}\\,dx \\). Give your answer as an exact decimal.`;
            wrong=[n+1, 2/(n+1), 1/(n+2), 1/(n+1)+1, n+2, 1/(n+3), -1/(n+1)];
            display=`\\lim_{a \\to 0^{+}} \\frac{1 - a^{${n+1}}}{${n+1}} = ${fmtTrim(key, 6)}`;
            rungs=[
                "The integrand is unbounded at the lower limit, so write the integral as a limit of proper integrals and check what the antiderivative does as that limit is taken.",
                `The antiderivative is \\( x^{${n+1}} / ${n+1} \\), and the exponent ${n+1} is positive, so the lower endpoint contributes nothing as it approaches zero.`
            ];
            steps=[
                `$ \\int_{a}^{1} x^{${n}}\\,dx = \\left[\\dfrac{x^{${n+1}}}{${n+1}}\\right]_{a}^{1} = \\dfrac{1}{${n+1}} - \\dfrac{a^{${n+1}}}{${n+1}} $, and the improper integral is the limit as $ a \\to 0^{+} $.`,
                `Since $ ${n+1} > 0 $, the term $ a^{${n+1}} \\to 0 $.`,
                `The limit is $ \\dfrac{1}{${n+1}} = ${fmtTrim(key, 6)} $, so the answer is ${fmt(key, PLACES)}.`
            ];
            break;
        }
        case "decide_convergence":{
            let flavor=Math.floor(rng()*2);
            if (flavor===0||easy){
                key=2;
                latex=`The improper integral \\( \\int_{1}^{\\infty} \\dfrac{1}{x^{p}}\\,dx \\) converges exactly when \\( p > 1 \\). What is the smallest whole number \\( p \\) for which it converges?`;
                wrong=[1, 3, 0, 4];
                display="p > 1";
                rungs=[
                    "The convergence condition is the one the question states, so read off the boundary value and take the first whole number on the converging side of it.",
                    "The integral converges exactly when `p > 1`, so the smallest whole number strictly greater than 1 is the one to report."
                ];
                steps=[
                    `$ \\int_{1}^{\\infty} x^{-p}\\,dx $ converges exactly when $ p > 1 $, which the question states.`,
                    `The whole numbers on that side of the boundary start at $ 1 + 1 = 2 $.`,
                    `The smallest whole-number exponent that converges is ${key}, so the answer is ${key}.`
                ];
            }
            else{
                key=-2;
                latex=`The improper integral \\( \\int_{1}^{\\infty} x^{p}\\,dx \\) converges exactly when \\( p < -1 \\). What is the largest whole number \\( p \\), written as a negative integer, for which it converges?`;
                wrong=[-1, 0, 1, -3];
                display="p < -1";
                rungs=[
                    "Read the boundary off the condition and then take the whole number on the converging side of it; when the boundary is negative that means counting down, not up.",
                    "The integral converges exactly when `p < -1`, so the largest whole number on that side is the one immediately below -1."
                ];
                steps=[
                    `$ \\int_{1}^{\\infty} x^{p}\\,dx $ converges exactly when $ p < -1 $, which the question states.`,
                    `The whole numbers on that side of the boundary are $ \\dots, -4, -3, -2 $, and $ -1 $ is not among them.`,
                    `The largest whole-number exponent that converges is ${key}, so the answer is ${key}.`
                ];
            }
            break;
        }
        default:{
            // The integral test compares a series with an integral over the same
            // range. Four series are offered and exactly one of them has an exponent
            // strictly above one, so exactly one converges.
            let good=randInt(rng, 2, wide?3:2);
            let losers=easy?[0.5, 1, 1.5]:[1, 0.5, 1.5];
            key=good;
            let series=(exponent: number): string => `\\sum_{n=1}^{\\infty} \\frac{1}{n^{${fmtTrim(exponent, 2)}}}`;
            let fourth=easy?"\\sum_{n=1}^{\\infty} n":"\\sum_{n=1}^{\\infty} 2^{n}";
            latex=`By the integral test, a p-series \\( \\sum_{n=1}^{\\infty} \\dfrac{1}{n^{p}} \\) converges exactly when \\( p > 1 \\). Which of these four series converges?`;
            display=series(good);
            rungs=[
                "The integral test says a series and the integral over the same range converge or diverge together, so reduce each candidate to the exponent test `p > 1`.",
                "A p-series converges exactly when its exponent is greater than 1, so check the exponent of each candidate against 1."
            ];
            steps=[
                `$ \\int_{1}^{\\infty} \\dfrac{1}{x^{p}}\\,dx $ converges exactly when $ p > 1 $, so the test says a p-series does too.`,
                `The four candidates have exponents ${good}, ${losers[0]}, ${losers[1]} and ${losers[2]}.`,
                `Only ${good} is greater than 1, so the series that converges is $ ${series(good)} $, and that is the answer.`
            ];
            return {
                latex,
                correct: series(good),
                alternate: series(good).replace(/\\\\sum/g, "sum ").replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)").replace(/\^\{/g, "^").replace(/\}/g, ""),
                display,
                choices: fourOptions(series(good), [series(losers[0]), series(losers[1]), series(losers[2]), fourth]),
                expectedFormat:"Choose the series that converges",
                subskill: type,
                hints: {rungs, concede: "The answer is "+series(good)+"."},
                solution: steps
            };
        }
    }
    let decimals=type==="decide_convergence"?0:PLACES;
    let text=fmt(key, decimals);
    return {
        latex,
        correct: text,
        alternate: text,
        display,
        choices: numberOptions(key, wrong, decimals),
        expectedFormat: decimals===0?"Enter a whole number":"Enter a decimal rounded to three decimal places",
        subskill: type,
        hints: {rungs, concede: "The answer is "+text+"."},
        solution: steps
    };
}