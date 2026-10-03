/**
 * @file The Fundamental Theorem of Calculus in its two halves: the definite
 * integral is the net change of an antiderivative, and the average value of a
 * function is that net change divided by the length of the interval.
 * @description The antiderivatives here are chosen so that every endpoint value
 * is a whole number. `F(x) = kx^2 + px` has `F(t) = kt^3/3 + pt^2/2`, which is an
 * integer at an integer point exactly when `k` is a multiple of three and `p` is
 * even, and those are the only values drawn. Nothing is rounded, so the numbers a
 * learner is asked to add are the numbers that were printed.
 *
 * The branch that separates the integral from the average value keeps `b - a` at
 * two or more, because at a unit interval the average value and the definite
 * integral are the same number and a question about the average would have two
 * spellings of one answer.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";
import{fmtTrim}from"../shared/Numeric.js";

/**
 * Evaluates `F(x) = kx^2 + px` at an integer point, in integer arithmetic.
 *
 * @param k - The coefficient of x squared.
 * @param p - The coefficient of x.
 * @param x - Where to evaluate.
 * @returns `kx^2 + px`.
 */
function antiderivative(k: number, p: number, x: number): number{
    return k*x*x+p*x;
}

/**
 * Evaluates `G(x) = (k/3)x^3 + (p/2)x^2`, the antiderivative of
 * `F(x) = kx^2 + px`, at an integer point. The coefficient of `x^2` here is `1`,
 * so this is the same routine with `p = 1`, and the caller keeps `k` a multiple of
 * three so the result is an integer.
 *
 * @param k - The coefficient of x squared in F.
 * @param p - The coefficient of x in F.
 * @param x - Where to evaluate.
 * @returns `(k/3)x^3 + (p/2)x^2`.
 */
function primitive(k: number, p: number, x: number): number{
    return Math.round(k*x*x*x/3+p*x*x/2);
}

export function generateFundamentalTheorem(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["accumulation_function","average_value","evaluate_by_antiderivative","net_change"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let expectedFormat="Enter a whole number";
    let display="";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "accumulation_function":{
            // `F` is named in the prompt so the learner reads the antiderivative off
            // it rather than being asked to find one, and the integral of F is still
            // a net change of a further antiderivative. The lower limit is kept away
            // from zero so that `G(lo)` is never itself a plausible answer.
            let k=randInt(rng, 1, wide?4:2)*3;
            let p=randInt(rng, 1, wide?4:2)*2;
            let lo=randInt(rng, -5, 3);
            if (lo===0) lo=-1;
            let hi=lo+randInt(rng, 2, wide?7:4);
            key=primitive(k, p, hi)-primitive(k, p, lo);
            latex=`Let \\( F(x) = ${k}x^{2} ${p<0?"- ":"+ "}${Math.abs(p)}x \\). Evaluate the definite integral \\( \\int_{${lo}}^{${hi}} F(x)\\,dx \\).`;
            wrong=[
                primitive(k, p, hi)+primitive(k, p, lo),
                Math.round(k*(hi*hi*hi+lo*lo*lo)/3-p*(hi*hi-lo*lo)/2),
                primitive(k, p, hi),
                primitive(k, p, lo),
                key+1
            ];
            display=`G(${hi}) - G(${lo}) = ${key}`;
            rungs=[
                "The Fundamental Theorem turns a definite integral into the change of an antiderivative over the interval, so find an antiderivative of F, evaluate it at both limits, and subtract in that order.",
                `An antiderivative of \\( ${k}x^{2} ${p<0?"- ":"+ "}${Math.abs(p)}x \\) is \\( \\frac{${k}}{3}x^{3} ${p<0?"- ":"+ "}${Math.abs(p)/2}x^{2} \\), and the integral is its value at ${hi} minus its value at ${lo}.`
            ];
            steps=[
                `An antiderivative of $ F $ is $ G(x) = ${k/3}x^{3} ${p<0?"- ":"+ "}${Math.abs(p)/2}x^{2} $, so $ G' = F $.`,
                `$ G(${hi}) = ${primitive(k, p, hi)} $ and $ G(${lo}) = ${primitive(k, p, lo)} $.`,
                `$ \\int_{${lo}}^{${hi}} F(x)\\,dx = G(${hi}) - G(${lo}) = ${primitive(k, p, hi)} - ${primitive(k, p, lo)} = ${key} $, and the answer is ${key}.`
            ];
            break;
        }
        case "average_value":{
            // The average value is the definite integral over the length of the
            // interval, so the printed length is what the learner divides by. The
            // length is at least two, or the average and the integral would agree.
            let c=randInt(rng, 1, wide?4:2);
            let lo=randInt(rng, -4, 4);
            let hi=lo+randInt(rng, 2, wide?6:3);
            key=c*(hi+lo)+1;
            latex=`Let \\( F(x) = ${c}x^{2} + x \\) be an antiderivative of \\( f \\) on \\( [${lo}, ${hi}] \\). What is the average value of \\( f \\) on that interval?`;
            wrong=[
                c*(hi*hi-lo*lo)+(hi-lo),
                c*(hi+lo),
                c*(hi+lo)+2,
                c*(hi+lo)-1,
                2*c*(hi+lo)+1
            ];
            display=`\\frac{${antiderivative(c, 1, hi)} - ${antiderivative(c, 1, lo)}}{${hi} - ${lo}} = ${key}`;
            rungs=[
                "The average value of a function over an interval is its definite integral divided by the length of the interval, so use the Fundamental Theorem for the integral and then divide by b minus a.",
                `With $ F(x) = ${c}x^{2} + x $, the integral from ${lo} to ${hi} is $ F(${hi}) - F(${lo}) = ${c}(${hi} - ${lo})(${hi} + ${lo}) + (${hi} - ${lo}) $, and the interval length is ${hi} - ${lo}.`
            ];
            steps=[
                `$ F(${hi}) = ${c}(${hi})^{2} + ${hi} = ${antiderivative(c, 1, hi)} $ and $ F(${lo}) = ${c}(${lo})^{2} + ${lo} = ${antiderivative(c, 1, lo)} $.`,
                `The integral is $ F(${hi}) - F(${lo}) = ${antiderivative(c, 1, hi)} - ${antiderivative(c, 1, lo)} = ${antiderivative(c, 1, hi)-antiderivative(c, 1, lo)} $.`,
                `The interval has length $ ${hi} - ${lo} = ${hi-lo} $, so the average value is $ ${antiderivative(c, 1, hi)-antiderivative(c, 1, lo)} / ${hi-lo} = ${key} $, and the answer is ${key}.`
            ];
            break;
        }
        case "evaluate_by_antiderivative":{
            // `n x^(n-1)` is the derivative of `x^n` exactly, so the definite integral
            // is a difference of nth powers and the arithmetic stays in integers.
            let n=randInt(rng, 2, wide?4:3);
            let lo=randInt(rng, 1, 3);
            let hi=lo+randInt(rng, 2, wide?5:3);
            key=Math.pow(hi, n)-Math.pow(lo, n);
            latex=`Evaluate \\( \\int_{${lo}}^{${hi}} ${n}x^{${n-1}}\\,dx \\) using an antiderivative.`;
            wrong=[
                Math.pow(hi, n)+Math.pow(lo, n),
                Math.pow(lo, n)-Math.pow(hi, n),
                Math.pow(hi, n),
                Math.pow(lo, n),
                key*n
            ];
            display=`${hi}^{${n}} - ${lo}^{${n}} = ${key}`;
            rungs=[
                "Spot the power rule in reverse, build an antiderivative, and then subtract its value at the lower limit from its value at the upper limit.",
                `The derivative of \\( x^{${n}} \\) is exactly the integrand \\( ${n}x^{${n-1}} \\), so use \\( F(x) = x^{${n}} \\).`
            ];
            steps=[
                `$ \\dfrac{d}{dx}\\left(x^{${n}}\\right) = ${n}x^{${n-1}} $, so an antiderivative is $ F(x) = x^{${n}} $.`,
                `$ F(${hi}) = ${Math.pow(hi, n)} $ and $ F(${lo}) = ${Math.pow(lo, n)} $.`,
                `$ \\int_{${lo}}^{${hi}} ${n}x^{${n-1}}\\,dx = ${Math.pow(hi, n)} - ${Math.pow(lo, n)} = ${key} $, and the answer is ${key}.`
            ];
            break;
        }
        default:{
            let k=randInt(rng, 1, wide?4:2)*3;
            let p=randInt(rng, 1, wide?4:2)*2;
            let lo=randInt(rng, 1, 3);
            let hi=lo+randInt(rng, 2, wide?6:3);
            key=antiderivative(k, p, hi)-antiderivative(k, p, lo);
            latex=`If \\( F'(x) = ${k}x^{2} ${p<0?"- ":"+ "}${Math.abs(p)}x \\), how much does \\( F \\) change as \\( x \\) goes from ${lo} to ${hi}? (Take the change to be \\( F(${hi}) - F(${lo}) \\).)`;
            wrong=[
                antiderivative(k, p, lo)-antiderivative(k, p, hi),
                antiderivative(k, p, hi)+antiderivative(k, p, lo),
                antiderivative(k, p, hi),
                antiderivative(k, p, lo),
                key+1
            ];
            display=`F(${hi}) - F(${lo}) = ${key}`;
            rungs=[
                "The net change of a function over an interval is its value at the far endpoint minus its value at the near endpoint, and the value is recovered by integrating the derivative that the prompt gives you.",
                `An antiderivative of \\( F' \\) is \\( \\frac{${k}}{3}x^{3} ${p<0?"- ":"+ "}${Math.abs(p)/2}x^{2} \\), and the change is that expression at ${hi} minus that expression at ${lo}.`
            ];
            steps=[
                `$ F(x) = ${k/3}x^{3} ${p<0?"- ":"+ "}${Math.abs(p)/2}x^{2} + C $, and the constant cancels in the difference.`,
                `$ F(${hi}) = ${antiderivative(k, p, hi)} $ and $ F(${lo}) = ${antiderivative(k, p, lo)} $.`,
                `The net change is $ ${antiderivative(k, p, hi)} - ${antiderivative(k, p, lo)} = ${key} $, and the answer is ${key}.`
            ];
            break;
        }
    }
    let text=fmtTrim(key, 2);
    return {
        latex,
        correct: text,
        alternate: text,
        display,
        choices: numberOptions(key, wrong, 0),
        expectedFormat,
        subskill: type,
        hints: {rungs, concede: "The answer is "+text+"."},
        solution: steps
    };
}