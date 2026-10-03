/**
 * @file The Mean Value Theorem for derivatives, Rolle's Theorem, the Mean Value
 * Theorem for integrals, and finding the point the theorem names.
 * @description Every answer is an exact integer. The slope of a quadratic over an
 * interval is `m(a + b) + q`, the average value of `3x^2` over `[a, b]` is
 * `a^2 + ab + b^2`, and the point the theorem names for `x^3` is
 * `sqrt((a^2 + ab + b^2)/3)`, which is a whole number only for a few intervals.
 * That last one searches a bounded range for an interval whose radicand is a
 * perfect square, which is what keeps the answer exact rather than rounded.
 *
 * The search is bounded and carries a deterministic fallback, because a generator
 * that redraws until a condition holds must never be able to block the app.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";
import{fmt, fmtTrim}from"../shared/Numeric.js";

/** An interval and the interior point the Mean Value Theorem names for `x^3`. */
type CubicCase=[number, number, number];

/**
 * The one interval the search falls back to when it is exhausted. It is verified
 * by hand: `2^2 + 2 \cdot 11 + 11^2 = 147 = 3 \cdot 49`, so the mean-value point
 * is `sqrt(49) = 7`, which lies strictly between 2 and 11.
 */
const CUBIC_FALLBACK:CubicCase=[2, 11, 7];

/**
 * Finds the point the Mean Value Theorem names for `f(x) = x^3` on `[a, b]`.
 *
 * The mean slope is `a^2 + ab + b^2` and `f'(c) = 3c^2`, so `c` is the square root
 * of one third of that sum. Only some intervals give a whole number, so the left
 * endpoint is searched rather than drawn and the search is bounded.
 *
 * @param lo - The smallest left endpoint to try.
 * @param hi - The largest left endpoint to try.
 * @param span - The width of the interval.
 * @param rng - The injected random source.
 * @returns An interval whose mean-value point is a whole number.
 */
function cubicInterval(lo: number, hi: number, span: number, rng: () => number): CubicCase{
    for(let attempt=0; attempt<64; attempt++){
        let a=lo+Math.floor(rng()*(hi-lo+1));
        let b=a+span;
        let radicand=(a*a+a*b+b*b)/3;
        if (!Number.isInteger(radicand)) continue;
        let c=Math.round(Math.sqrt(radicand));
        if (c*c!==radicand||c<=a||c>=b) continue;
        return [a, b, c];
    }
    for(let a=lo; a<=hi; a++){
        let b=a+span;
        let radicand=(a*a+a*b+b*b)/3;
        if (!Number.isInteger(radicand)) continue;
        let c=Math.round(Math.sqrt(radicand));
        if (c*c===radicand&&c>a&&c<b) return [a, b, c];
    }
    return CUBIC_FALLBACK;
}

export function generateMeanValueTheorem(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["mean_value_for_derivatives","rolle_theorem","mean_value_for_integrals","find_the_point_c"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    if (type==="rolle_theorem") return rolleQuestion(rng, wide);
    if (type==="mean_value_for_derivatives") return slopeQuestion(rng, wide);
    if (type==="mean_value_for_integrals") return averageQuestion(rng, wide);
    return pointQuestion(rng, wide);
}

/**
 * The Rolle's Theorem branch, in its two honest shapes: what the theorem forces
 * on the derivative, and whether its hypotheses are met at all.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function rolleQuestion(rng: () => number, wide: boolean): QuestionDto{
    if (Math.floor(rng()*2)===0){
        let rungs=[
            "Rolle's theorem's conclusion is that the derivative vanishes somewhere strictly inside the interval, so the value it forces is zero whatever the function is.",
            "The hypothesis that matters here is that the two endpoint values are equal, and the conclusion is about the derivative at an interior point rather than about the function."
        ];
        let steps=[
            `The hypotheses hold: \\( f \\) is continuous on \\( [1, 5] \\), differentiable on \\( (1, 5) \\), and \\( f(1) = f(5) \\).`,
            `Rolle's theorem then gives a \\( c \\in (1, 5) \\) with \\( f'(c) = 0 \\).`,
            `The value the theorem forces is 0, so the answer is 0.`
        ];
        return {
            latex:"Rolle's theorem applies to a function that is continuous on a closed interval, differentiable on the open interval, and equal at its two endpoints. If \\( f(1) = f(5) \\), what must \\( f'(c) \\) be for some \\( c \\) strictly between 1 and 5?",
            correct:"0",
            alternate:"0",
            display:"f'(c) = 0",
            choices: fourOptions("0", ["1", "-1", "2", "-2"]),
            expectedFormat:"Enter a whole number",
            subskill:"rolle_theorem",
            hints:{rungs, concede:"The answer is 0."},
            solution: steps
        };
    }
    let a=randInt(rng, 1, 4);
    let b=a+randInt(rng, 2, wide?6:4);
    let low=randInt(rng, 2, 9);
    let high=low+randInt(rng, 1, 4);
    let key="No: the two endpoint values are not equal.";
    let rungs=[
        "Check all three hypotheses before applying Rolle's theorem, and treat a failure of any one of them as decisive.",
        `The endpoint values are \\( ${low} \\) and \\( ${high} \\), and they are not equal, so the hypothesis about the endpoints fails whatever else is true.`
    ];
    let steps=[
        `Hypothesis one: \\( f \\) is continuous on \\( [${a}, ${b}] \\). That holds.`,
        `Hypothesis two: \\( f \\) is differentiable on \\( (${a}, ${b}) \\). That holds.`,
        `Hypothesis three: \\( f(${a}) = f(${b}) \\). Here \\( ${low} \\ne ${high} \\), so this one fails and the theorem cannot be applied. The answer is ${key}.`
    ];
    return {
        latex:`Rolle's theorem requires a function that is continuous on a closed interval, differentiable on the open interval, and equal at the two endpoints. Suppose \\( f \\) is continuous on \\( [${a}, ${b}] \\) and differentiable on \\( (${a}, ${b}) \\), with \\( f(${a}) = ${low} \\) and \\( f(${b}) = ${high} \\), where ${low} is not ${high}. Can Rolle's theorem be applied to guarantee a point \\( c \\)?`,
        correct: key,
        alternate:"No, the endpoint values are unequal.",
        display:"Rolle's theorem does not apply",
        choices: fourOptions(key, [
            "Yes, because continuity on the closed interval is enough.",
            "Yes, because differentiability on the open interval is enough.",
            "Yes, because $f$ takes a value at both endpoints.",
            "Yes, but only if $f$ is twice differentiable."
        ]),
        expectedFormat:"Choose the statement that is correct",
        subskill:"rolle_theorem",
        hints:{rungs, concede:"The answer is "+key+"."},
        solution: steps
    };
}

/**
 * The Mean Value Theorem for derivatives: the slope the theorem promises.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function slopeQuestion(rng: () => number, wide: boolean): QuestionDto{
    let m=randInt(rng, 1, wide?6:3);
    let q=randInt(rng, 1, wide?7:4);
    let a=randInt(rng, -5, 4);
    if (a%2!==0) a+=1;
    let b=a+randInt(rng, 2, wide?7:4);
    if (b%2!==0) b+=1;
    let fa=m*a*a+q*a;
    let fb=m*b*b+q*b;
    let key=m*(a+b)+q;
    let rungs=[
        "The Mean Value Theorem says the derivative at some interior point equals the average rate of change, which is the change in the function divided by the change in x.",
        `Read both endpoint values off the formula: \\( f(${a}) = ${fa} \\) and \\( f(${b}) = ${fb} \\), then divide their difference by \\( ${b} - ${a} = ${b-a} \\).`
    ];
    let steps=[
        `$ f(${a}) = ${m}(${a})^{2} + ${q}(${a}) = ${fa} $ and $ f(${b}) = ${m}(${b})^{2} + ${q}(${b}) = ${fb} $.`,
        `The average rate of change is $ \\dfrac{${fb} - ${fa}}{${b} - ${a}} = \\dfrac{${fb-fa}}{${b-a}} = ${key} $.`,
        `The theorem guarantees a \\( c \\in (${a}, ${b}) \\) with $ f'(c) = ${key} $, so the answer is ${key}.`
    ];
    return {
        latex:`The function \\( f(x) = ${m}x^{2} + ${q}x \\) is continuous on \\( [${a}, ${b}] \\) and differentiable between ${a} and ${b}. The Mean Value Theorem guarantees a point \\( c \\) in that open interval where \\( f'(c) \\) equals which value?`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2),
        display:`\\frac{${fb} - ${fa}}{${b} - ${a}} = ${key}`,
        choices: numberOptions(key, [(fa+fb)/2, fb-fa, key*(b-a), fb, fa], 0),
        expectedFormat:"Enter a whole number",
        subskill:"mean_value_for_derivatives",
        hints:{rungs, concede:"The answer is "+fmtTrim(key, 2)+"."},
        solution: steps
    };
}

/**
 * The Mean Value Theorem for integrals: the average value the theorem promises.
 *
 * `3x^2` and `6x^2` integrate to whole numbers over any integer interval, so the
 * average value is exact without a rounding decision.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function averageQuestion(rng: () => number, wide: boolean): QuestionDto{
    let m=randInt(rng, 1, 2)*3;
    let a=randInt(rng, -3, 3);
    let b=a+randInt(rng, 2, wide?6:4);
    let integral=Math.round(m*b*b*b/3-m*a*a*a/3);
    let key=m*(a*a+a*b+b*b)/3;
    let rungs=[
        "The Mean Value Theorem for integrals says the average value of a function over an interval is a value the function actually takes, so compute the average by dividing the definite integral by the length of the interval.",
        `The integral of \\( ${m}x^{2} \\) is \\( \\frac{${m}}{3}x^{3} \\), and the interval length is \\( ${b} - ${a} = ${b-a} \\).`
    ];
    let steps=[
        `$ \\int_{${a}}^{${b}} ${m}x^{2}\\,dx = \\left[${m/3}x^{3}\\right]_{${a}}^{${b}} = ${Math.round(m*b*b*b/3)} - ${Math.round(m*a*a*a/3)} = ${integral} $.`,
        `The interval has length $ ${b} - ${a} = ${b-a} $, so the average value is $ ${integral} / ${b-a} = ${key} $.`,
        `The theorem guarantees a \\( c \\in (${a}, ${b}) \\) with $ f(c) = ${key} $, so the answer is ${key}.`
    ];
    return {
        latex:`Let \\( f(x) = ${m}x^{2} \\) on \\( [${a}, ${b}] \\). The Mean Value Theorem for integrals guarantees a value \\( c \\) in that interval where \\( f(c) \\) equals the average value of \\( f \\). What is that average value?`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2),
        display:`\\frac{${integral}}{${b} - ${a}} = ${key}`,
        choices: numberOptions(key, [integral, key*3, m*(a+b), m*a*b], 0),
        expectedFormat:"Enter a whole number",
        subskill:"mean_value_for_integrals",
        hints:{rungs, concede:"The answer is "+fmtTrim(key, 2)+"."},
        solution: steps
    };
}

/**
 * The branch that asks for the point the Mean Value Theorem names.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function pointQuestion(rng: () => number, wide: boolean): QuestionDto{
    let spans=[9, 15, 18];
    let span=spans[Math.floor(rng()*spans.length)];
    let [a, b, c]=cubicInterval(1, wide?14:11, span, rng);
    let key=c;
    let mean=Math.pow(b, 3)-Math.pow(a, 3);
    let rungs=[
        "Set the derivative equal to the average rate of change and solve for the point, rather than reading the point off the interval.",
        `The average rate of change of \\( x^{3} \\) over the interval is \\( (${Math.pow(b, 3)} - ${Math.pow(a, 3)}) / ${b-a} = ${a*a+a*b+b*b} \\), and \\( f'(x) = 3x^{2} \\).`
    ];
    let steps=[
        `$ f(${b}) - f(${a}) = ${Math.pow(b, 3)} - ${Math.pow(a, 3)} = ${mean} $ and $ ${b} - ${a} = ${b-a} $, so the average rate of change is $ ${mean} / ${b-a} = ${a*a+a*b+b*b} $.`,
        `$ f'(c) = 3c^{2} $, so $ 3c^{2} = ${a*a+a*b+b*b} $ and $ c^{2} = ${(a*a+a*b+b*b)/3} $.`,
        `$ c = \\sqrt{${(a*a+a*b+b*b)/3}} = ${c} $, which lies in $ (${a}, ${b}) $, and the answer is ${key}.`
    ];
    return {
        latex:`Let \\( f(x) = x^{3} \\) on \\( [${a}, ${b}] \\). The Mean Value Theorem gives a point \\( c \\) in that interval where \\( f'(c) \\) equals the average rate of change of \\( f \\). Find \\( c \\).`,
        correct: fmt(key, 2),
        alternate: fmtTrim(key, 2),
        display:`3c^{2} = ${a*a+a*b+b*b}`,
        choices: numberOptions(key, [(a+b)/2, a, b, a+b, a+b-1], 2),
        expectedFormat:"Enter a number",
        subskill:"find_the_point_c",
        hints:{rungs, concede:"The answer is "+fmt(key, 2)+"."},
        solution: steps
    };
}