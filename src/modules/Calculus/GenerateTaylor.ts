/**
 * @file The Maclaurin series for the exponential, sine and cosine, and what the
 * truncated series is worth at a point.
 * @description The coefficients of a Maclaurin series are exact rationals that
 * rarely terminate, so a key made of them has to carry one rounding decision and
 * state it. This file rounds every coefficient to three decimal places once, at
 * the point the series is written, and prints that instruction in the prompt, so
 * the coefficient the learner is shown and the coefficient that is graded are the
 * same number. `expectedFormat` repeats the instruction because the key is not a
 * value the learner would otherwise know how to type.
 *
 * The two ways a series goes wrong are both offered as options: the factorial in
 * each denominator is dropped, which is what a learner writes when the series is
 * remembered as a pattern rather than as the derivative values, and the signs are
 * made uniform, which is what a learner writes when the alternating series is
 * treated as all-positive.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";
import{fmt, roundTo}from"../shared/Numeric.js";

/** How many decimal places every printed coefficient is rounded to. */
const PLACES=3;

/**
 * Renders one coefficient without its trailing zeros, so the printed series reads
 * as `1 + 3x + 4.5x^2` rather than `1 + 3x + 4.500x^2`. The value itself is
 * unchanged, because the rounding decision was already taken in `roundTo`.
 *
 * @param value - The magnitude of the coefficient, never negative.
 * @returns The coefficient as text.
 */
function coefficientText(value: number): string{
    let text=fmt(value, PLACES);
    if (text.indexOf(".")>=0) text=text.replace(/0+$/, "").replace(/\.$/, "");
    return text;
}

/**
 * Renders one term of a power series, omitting a coefficient of one so that the
 * `x` is not written as `1x`, and writing the power as a superscript from the
 * second term on.
 *
 * @param value - The coefficient, already made positive by the caller.
 * @param power - The power of x.
 * @returns The term as LaTeX.
 */
function termText(value: number, power: number): string{
    let coefficient=coefficientText(value);
    if (power===0) return coefficient;
    let body=coefficient==="1"?"x":coefficient+"x";
    return power===1?body:body+"^{"+power+"}";
}

/**
 * Joins signed terms into a series, putting the sign of each term in front of it
 * rather than after the separator.
 *
 * @param values - The signed coefficients.
 * @param powers - The power of x each coefficient multiplies.
 * @returns The series as LaTeX.
 */
function seriesText(values: number[], powers: number[]): string{
    let out="";
    for(let i=0; i<values.length; i++){
        let body=termText(Math.abs(values[i]), powers[i]);
        if (i===0) out=(values[i]<0?"-":"")+body;
        else out=out+(values[i]<0?" - ":" + ")+body;
    }
    return out;
}

/**
 * Renders a series whose signs have all been made positive, which is the mistake
 * a learner makes when they cannot hold the alternating pattern in mind.
 *
 * @param values - The signed coefficients.
 * @param powers - The power of x each coefficient multiplies.
 * @returns The series as LaTeX.
 */
function positiveSeriesText(values: number[], powers: number[]): string{
    let magnitudes:number[]=[];
    for(let value of values) magnitudes.push(Math.abs(value));
    return seriesText(magnitudes, powers);
}

/**
 * The nonzero terms of a Maclaurin series, as the coefficient of each power and
 * the power itself. The exponential keeps every power from zero; the sine and
 * cosine series are zero on the wrong parity, so only the surviving powers are
 * produced.
 *
 * @param kind - Which function to expand.
 * @param scale - The multiplier inside the argument, or the point of evaluation.
 * @param terms - How many nonzero terms to keep.
 * @returns The signed coefficients and the powers they multiply.
 */
function maclaurin(kind: "exp"|"sin"|"cos", scale: number, terms: number): {values: number[], powers: number[]}{
    let values:number[]=[];
    let powers:number[]=[];
    if (kind==="exp"){
        let term=1;
        for(let k=0; k<terms; k++){
            values.push(term);
            powers.push(k);
            term=term*scale/(k+1);
        }
        return {values, powers};
    }
    let odd=kind==="sin";
    for(let k=0; k<terms; k++){
        let power=odd?2*k+1:2*k;
        let product=1;
        for(let i=1; i<=power; i++) product*=i;
        let value=Math.pow(scale, power)/product;
        values.push(k%2===0?value:-value);
        powers.push(power);
    }
    return {values, powers};
}

/**
 * Adds the terms of a series, which is the whole of the approximation branch.
 *
 * @param values - The signed coefficients.
 * @param powers - The power of x each coefficient multiplies.
 * @param at - Where the series is evaluated.
 * @returns The sum of the terms at that point.
 */
function sumAt(values: number[], powers: number[], at: number): number{
    let total=0;
    for(let i=0; i<values.length; i++) total=total+values[i]*Math.pow(at, powers[i]);
    return total;
}

export function generateTaylor(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["maclaurin_for_exponential","maclaurin_for_sine","maclaurin_for_cosine","approximate_a_value"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    let key="";
    let latex="";
    let wrong:string[]=[];
    let expectedFormat="";
    let display="";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "maclaurin_for_exponential":{
            let b=randInt(rng, wide?2:1, wide?4:3);
            let terms=difficulty==="easy"?3:wide?5:4;
            let series=maclaurin("exp", b, terms);
            let argument=b===1?"e^{x}":`e^{${b}x}`;
            key=seriesText(series.values, series.powers);
            let noFactorials:number[]=[];
            let doubled:number[]=[];
            let alternating:number[]=[];
            for(let i=0; i<series.values.length; i++){
                noFactorials.push(Math.pow(b, i));
                doubled.push(series.values[i]*2);
                alternating.push(i%2===0?Math.abs(series.values[i]):-Math.abs(series.values[i]));
            }
            wrong=[
                seriesText(noFactorials, series.powers),
                seriesText(alternating, series.powers),
                seriesText(series.values.slice(1), series.powers.slice(1)),
                seriesText(doubled, series.powers)
            ];
            latex=`Write the first ${terms} terms of the Maclaurin series for \\( ${argument} \\), giving every coefficient as a decimal rounded to three decimal places.`;
            expectedFormat=`Enter ${terms} terms in ascending powers of x, each coefficient rounded to three decimal places`;
            display=`\\sum_{n=0}^{\\infty} \\frac{(${b}x)^{n}}{n!}`;
            rungs=[
                "A Maclaurin series reads the derivatives at zero: the coefficient of x to the power n is the n-th derivative at zero divided by n factorial.",
                `The n-th derivative of \\( e^{${b}x} \\) at zero is \\( ${b}^{n} \\), so the coefficient of \\( x^{n} \\) is \\( ${b}^{n} \\) over \\( n! \\).`
            ];
            let derivatives:number[]=[];
            for(let i=0; i<series.powers.length; i++) derivatives.push(Math.pow(b, series.powers[i]));
            steps=[
                `The derivatives at zero are $ ${derivatives.join(", ")} $ in order, and each is divided by the matching factorial.`,
                `That gives the coefficients ${series.values.map(value => fmt(value, PLACES)).join(", ")}, each rounded once to three decimal places.`,
                `Writing them in ascending powers of x gives $ ${key} $, and that is the answer.`
            ];
            break;
        }
        case "maclaurin_for_sine":{
            let b=randInt(rng, wide?2:1, wide?4:2);
            let terms=difficulty==="easy"?3:wide?4:3;
            let series=maclaurin("sin", b, terms);
            let cosine=maclaurin("cos", b, terms);
            key=seriesText(series.values, series.powers);
            let noFactorials:number[]=[];
            let doubled:number[]=[];
            let halved:number[]=[];
            for(let i=0; i<series.values.length; i++){
                noFactorials.push(Math.pow(b, series.powers[i]));
                doubled.push(series.values[i]*2);
                halved.push(series.values[i]/2);
            }
            wrong=[
                positiveSeriesText(series.values, series.powers),
                seriesText(noFactorials, series.powers),
                seriesText(cosine.values, cosine.powers),
                seriesText(doubled, series.powers),
                seriesText(halved, series.powers)
            ];
            latex=`Write the first ${terms} terms of the Maclaurin series for \\( \\sin(${b===1?"":b}x) \\), giving every coefficient as a decimal rounded to three decimal places.`;
            expectedFormat=`Enter ${terms} terms in ascending powers of x, each coefficient rounded to three decimal places`;
            display=`\\sum_{n=0}^{\\infty} (-1)^{n} \\frac{${b}^{2n+1}x^{2n+1}}{(2n+1)!}`;
            rungs=[
                "The Maclaurin coefficient of a power is the matching derivative at zero over the matching factorial, and for sine every even derivative is zero, so only the odd powers appear.",
                `The odd derivatives of \\( \\sin(${b}x) \\) at zero are \\( ${b} \\), \\( -${b*b*b} \\) and \\( ${Math.pow(b, 5)} \\), which go over \\( 1! \\), \\( 3! \\) and \\( 5! \\).`
            ];
            steps=[
                `Only the odd powers of x appear, so the series is $ ${b}x - \\frac{${b*b*b}}{3!}x^{3} + \\frac{${Math.pow(b, 5)}}{5!}x^{5} - \\dots $.`,
                `The three coefficients are $ ${series.values.map(value => fmt(value, PLACES)).join(", ")} $, each rounded once to three decimal places.`,
                `Writing them in ascending powers of x gives $ ${key} $, and that is the answer.`
            ];
            break;
        }
        case "maclaurin_for_cosine":{
            let b=randInt(rng, wide?2:1, wide?4:2);
            let terms=difficulty==="easy"?3:wide?4:3;
            let series=maclaurin("cos", b, terms);
            let sine=maclaurin("sin", b, terms);
            key=seriesText(series.values, series.powers);
            let noFactorials:number[]=[];
            let doubled:number[]=[];
            let halved:number[]=[];
            for(let i=0; i<series.values.length; i++){
                noFactorials.push(Math.pow(b, series.powers[i]));
                doubled.push(series.values[i]*2);
                halved.push(series.values[i]/2);
            }
            wrong=[
                positiveSeriesText(series.values, series.powers),
                seriesText(noFactorials, series.powers),
                seriesText(sine.values, sine.powers),
                seriesText(doubled, series.powers),
                seriesText(halved, series.powers)
            ];
            latex=`Write the first ${terms} terms of the Maclaurin series for \\( \\cos(${b===1?"":b}x) \\), giving every coefficient as a decimal rounded to three decimal places.`;
            expectedFormat=`Enter ${terms} terms in ascending powers of x, each coefficient rounded to three decimal places`;
            display=`\\sum_{n=0}^{\\infty} (-1)^{n} \\frac{${b}^{2n}x^{2n}}{(2n)!}`;
            rungs=[
                "The Maclaurin coefficient of a power is the matching derivative at zero over the matching factorial, and for cosine every odd derivative is zero, so only the even powers appear.",
                `The even derivatives of \\( \\cos(${b}x) \\) at zero are \\( 1 \\), \\( -${b*b} \\) and \\( ${Math.pow(b, 4)} \\), which go over \\( 0! \\), \\( 2! \\) and \\( 4! \\).`
            ];
            steps=[
                `Only the even powers of x appear, so the series is $ 1 - \\frac{${b*b}}{2!}x^{2} + \\frac{${Math.pow(b, 4)}}{4!}x^{4} - \\dots $.`,
                `The three coefficients are $ ${series.values.map(value => fmt(value, PLACES)).join(", ")} $, each rounded once to three decimal places.`,
                `Writing them in ascending powers of x gives $ ${key} $, and that is the answer.`
            ];
            break;
        }
        default:{
            // The truncated series is only worth what its terms are worth, so the
            // distractors are the neighbouring truncations and the sign slip rather
            // than arbitrary numbers.
            let kinds=["exp","sin","cos"];
            let kind=kinds[Math.floor(rng()*kinds.length)] as "exp"|"sin"|"cos";
            let at=randInt(rng, 1, wide?3:2);
            let terms=kind==="exp"?randInt(rng, 3, wide?6:4):randInt(rng, 3, wide?5:3);
            let series=maclaurin(kind, at, terms);
            key=fmt(roundTo(sumAt(series.values, series.powers, at), PLACES), PLACES);
            let fewer=maclaurin(kind, at, terms-1);
            let more=maclaurin(kind, at, terms+1);
            let flipped=series.values.slice();
            flipped[flipped.length-1]=-flipped[flipped.length-1];
            let doubled=series.values.map(value => value*2);
            wrong=[
                fmt(roundTo(sumAt(fewer.values, fewer.powers, at), PLACES), PLACES),
                fmt(roundTo(sumAt(more.values, more.powers, at), PLACES), PLACES),
                fmt(roundTo(sumAt(flipped, series.powers, at), PLACES), PLACES),
                fmt(roundTo(sumAt(doubled, series.powers, at), PLACES), PLACES)
            ];
            let name=kind==="exp"?"e":kind==="sin"?"\\sin":"\\cos";
            let argument=kind==="exp"?`e^{${at}}`:`${name}\\left(${at}\\right)`;
            let unit=kind==="exp"?"":", with the angle measured in radians";
            latex=`Use the first ${terms} nonzero terms of the Maclaurin series for ${argument}${unit} to approximate its value, rounding your answer to three decimal places.`;
            expectedFormat="Round your answer to three decimal places";
            display=argument+" \\approx "+key;
            rungs=[
                "Substitute the point into the truncated series and add the terms: the answer is the sum of exactly the number of terms the question names, and the rounding happens once, at the end.",
                `Evaluate the first ${terms} nonzero terms of the series at the given argument, add them, then round the total to three decimal places.`
            ];
            steps=[
                `The first ${terms} nonzero terms of the series are $ ${seriesText(series.values, series.powers)} $.`,
                `At ${kind==="exp"?"x = "+at:"the given argument"} they become $ ${series.values.map((value, i) => fmt(value*Math.pow(at, series.powers[i]), PLACES)).join(", ")} $.`,
                `Adding and rounding once to three decimal places gives $ ${key} $, and that is the answer.`
            ];
            break;
        }
    }
    let alternate=key
        .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
        .replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)")
        .replace(/\^\{([^{}]*)\}/g, "^$1")
        .replace(/\\/g, "");
    return {
        latex,
        correct: key,
        alternate,
        display,
        choices: fourOptions(key, wrong),
        expectedFormat,
        subskill: type,
        hints: {rungs, concede: "The answer is "+key+"."},
        solution: steps
    };
}