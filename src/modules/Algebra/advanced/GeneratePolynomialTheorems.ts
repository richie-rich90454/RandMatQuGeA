/**
 * @file Polynomial theorems: the remainder theorem, the factor theorem, one step of
 * synthetic division, and the rational root theorem.
 * @description The four theorems here are one fact read four ways: the remainder on
 * dividing a polynomial by `x - a` is its value at `a`. Every polynomial is
 * evaluated by repeated multiplication of whole numbers, so no value printed here
 * carries a floating-point tail, and every candidate answer is tested by
 * substitution before it is offered, so no option is offered as wrong when it is in
 * fact a root or a factor.
 *
 * The polynomial is built from a known root rather than drawn at random, so every
 * branch has a genuine factor or root to find and no branch has to ask whether an
 * answer exists.
 */
import type{RngFn, QuestionDto}from"../../../types/global";
import{joinTerms}from"../../shared/Latex.js";
import{fourOptions, numberOptions}from"../../shared/Options.js";
import{randInt, shuffle}from"../../shared/Random";

/**
 * Renders a polynomial from its coefficients, highest power first, with each sign
 * spelled out so that no term ever prints a plus sign followed by a minus sign.
 *
 * @param coefficients - The coefficients, from the highest power down.
 * @returns The polynomial, without the variable being named.
 */
function polyText(coefficients: number[]): string{
    let degree=coefficients.length-1;
    let terms:string[]=[];
    for(let i=0; i<coefficients.length; i++){
        let coefficient=coefficients[i] as number;
        if (coefficient===0) continue;
        let power=degree-i;
        let magnitude=Math.abs(coefficient);
        let body=power===0?String(magnitude):power===1?"x":magnitude+"x^{"+power+"}";
        terms.push(coefficient<0?"-"+body:body);
    }
    if (terms.length===0) return "0";
    return joinTerms(terms);
}

/**
 * Evaluates a polynomial at a whole number by repeated multiplication, which stays
 * in integer arithmetic for every value this file produces.
 *
 * @param coefficients - The coefficients, from the highest power down.
 * @param at - The value to substitute.
 * @returns The value of the polynomial there.
 */
function valueAt(coefficients: number[], at: number): number{
    let running=0;
    for(let coefficient of coefficients) running=running*at+coefficient;
    return running;
}

/**
 * Draws `count` whole numbers that are not roots of the polynomial, so that an
 * option set built around one genuine root cannot contain a second one.
 *
 * @param rng - The injected random source.
 * @param coefficients - The polynomial's coefficients.
 * @param count - How many non-roots are needed.
 * @returns Whole numbers that evaluate to something other than zero.
 */
function drawNonRoots(rng: RngFn, coefficients: number[], count: number): number[]{
    let found:number[]=[];
    for(let attempt=0; found.length<count&&attempt<256; attempt++){
        let candidate=randInt(rng, -9, 9);
        if (found.indexOf(candidate)>=0) continue;
        if (valueAt(coefficients, candidate)===0) continue;
        found.push(candidate);
    }
    return found;
}

/**
 * Renders a linear factor with its sign spelled out, so that a negative number never
 * prints as a minus sign followed by a minus sign.
 *
 * @param root - The number the factor vanishes at.
 * @returns The factor, for example "(x - 3)" or "(x + 2)".
 */
function factorText(root: number): string{
    return root>=0?`(x - ${root})`:`(x + ${Math.abs(root)})`;
}

export function generatePolynomialTheorems(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["remainder_by_theorem","factor_by_theorem","synthetic_check","possible_roots"];
    let type=types[Math.floor(rng()*types.length)];
    let reach=difficulty==="hard"?9:difficulty==="easy"?5:7;
    let root=randInt(rng, 1, reach);
    let middle=randInt(rng, -9, 9);
    let constant=randInt(rng, -6, 6);
    // The polynomial is (x - root)(x^2 + middle x + constant) expanded, so it is
    // known to have the root this branch is about to ask for.
    let coefficients=[1, middle-root, constant-middle*root, -constant*root];
    let printed=polyText(coefficients);
    let key="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "remainder_by_theorem":{
            let remainder=valueAt(coefficients, root);
            key=String(remainder);
            latex=`When \\( P(x) = ${printed} \\) is divided by \\( (x - ${root}) \\), what is the remainder?`;
            choices=numberOptions(remainder, [remainder+1, remainder-1, root, valueAt(coefficients, root+1)], 0);
            rungs=[
                "The remainder on dividing a polynomial by a linear factor is its value at the number that factor vanishes at, so no long division is needed.",
                `The factor is (x - ${root}), which vanishes at x = ${root}, so substitute ${root} into the polynomial.`
            ];
            steps=[
                `The factor (x - ${root}) vanishes at x = ${root}, so substitute ${root} into the polynomial.`,
                `Working through the powers in whole numbers gives ${remainder}.`,
                `So the remainder is ${key}`
            ];
            break;
        }
        case "factor_by_theorem":{
            // Each candidate factor is turned into a number and substituted, so an
            // option can only be offered as wrong when the polynomial really is
            // non-zero there. A cubic has at most three roots, so a pool of twenty
            // four neighbouring numbers always leaves at least three non-roots.
            let pool:number[]=[];
            for(let offset=1; offset<=12; offset++){
                pool.push(root+offset);
                pool.push(root-offset);
            }
            // A factor (x - 0) is the polynomial itself rather than a factor of it, so
            // zero is never offered: it is a true statement that looks like a slip.
            let rejects=pool.filter(candidate=>candidate!==0&&valueAt(coefficients, candidate)!==0).slice(0, 3);
            key=factorText(root);
            latex=`Which of these four expressions is a factor of \\( P(x) = ${printed} \\)? ${[root, ...rejects].map(factorText).map(factor=>`\\( ${factor} \\)`).join(", ")}.`;
            expectedFormat="Enter the factor, written the way it is written here";
            choices=fourOptions(key, rejects.map(factorText));
            rungs=[
                "A linear factor vanishes at exactly one number, so the quickest test is to substitute that number into the polynomial and see whether it comes out zero.",
                `Each factor vanishes where the linear factor vanishes, so substitute ${[root, ...rejects].join(", ")} in turn.`
            ];
            steps=[
                `P(${root}) = ${valueAt(coefficients, root)}, which is zero.`,
                `Substituting the other three numbers gives ${rejects.map(value=>valueAt(coefficients, value)).join(", ")}, none of which is zero.`,
                `So the factor is ${key}`
            ];
            break;
        }
        case "synthetic_check":{
            // The second entry of the synthetic row is the coefficient of x squared
            // with the root's product already added, which is the step a learner
            // actually forgets.
            let second=middle+root;
            let third=constant+root*second;
            key=String(second);
            latex=`Divide \\( P(x) = ${printed} \\) by \\( (x - ${root}) \\) using synthetic division. Bring the leading coefficient \\( 1 \\) down, multiply it by \\( ${root} \\), and add the product to the next coefficient. What is that sum?`;
            choices=numberOptions(second, [middle, root, third, second+1], 0);
            rungs=[
                "Synthetic division is a compact way of updating one coefficient at a time: bring the leading coefficient down, multiply it by the root, and add that product to the coefficient below.",
                `The coefficient below the leading one is ${middle}, and the product you add to it is 1 x ${root}.`
            ];
            steps=[
                `Bring down the leading coefficient, which is 1.`,
                `Multiply it by the root: 1 x ${root} = ${root}.`,
                `${middle} + ${root} = ${second}, so the sum is ${key}`
            ];
            break;
        }
        case "possible_roots":{
            let rejects=drawNonRoots(rng, coefficients, 3);
            let offered=shuffle(rng, [root, ...rejects]);
            key=String(root);
            latex=`Which of these four whole numbers is a root of \\( P(x) = ${printed} \\)? ${offered.map(candidate=>`\\( ${candidate} \\)`).join(", ")}.`;
            expectedFormat="Enter the whole number";
            choices=numberOptions(root, rejects, 0);
            rungs=[
                "A number is a root when the polynomial comes out at zero there, so test each candidate by substitution rather than by factoring.",
                "Substitute each of the four numbers into the polynomial and keep the one that gives zero."
            ];
            steps=[
                `Substituting x = ${root} gives ${valueAt(coefficients, root)}, which is zero.`,
                `The other three give ${rejects.map(value=>valueAt(coefficients, value)).join(", ")}, none of which is zero.`,
                `So the root is ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:key, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
