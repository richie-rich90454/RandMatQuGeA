/**
 * @file Derangements, Catalan numbers, multinomials and stars and bars.
 * @description Four counting results that are each one argument long, and each
 * of which is asked about with a family of numbers large enough that the
 * formulas cannot be guessed from a small case.
 *
 * Every count here is exact. The derangements are built from the recurrence
 * `!n = (n-1)(!(n-1) + !(n-2))`, which stays in integer arithmetic, and the
 * Catalan numbers from `C(2n, n) / (n+1)`, which divides exactly at every n.
 * The largest factorial used is bounded so that nothing is ever printed in
 * exponential notation, which is the failure mode that makes a count unusable.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt}from"../shared/Random";
import{numberOptions}from"../shared/Options.js";
import{factorial, nCr}from"./DiscreteUtils.js";

/**
 * The derangement numbers, built from the recurrence `!n = (n-1)(!(n-1) + !(n-2))`
 * in exact integer arithmetic.
 *
 * The recurrence is used rather than the closed form `n! * sum((-1)^k / k!)`
 * because the closed form divides a large factorial by a small factorial and the
 * quotient is not always exactly representable, while the recurrence only ever
 * adds and multiplies whole numbers.
 *
 * @param upTo - The largest `n` to compute.
 * @returns The derangement counts from zero up to `n`.
 */
function derangements(upTo: number): number[]{
    let counts=[1, 0];
    for (let n=2; n<=upTo; n++) counts.push((n-1)*((counts[n-1] as number)+(counts[n-2] as number)));
    return counts;
}

/**
 * The Catalan numbers, built as `C(2n, n) / (n+1)`. The quotient is exact at
 * every `n` because the Catalan number is an integer by construction.
 *
 * @param upTo - The largest `n` to compute.
 * @returns The Catalan counts from zero up to `n`.
 */
function catalanNumbers(upTo: number): number[]{
    let counts: number[]=[];
    for (let n=0; n<=upTo; n++) counts.push(nCr(2*n, n)/(n+1));
    return counts;
}

export function generateCountingAdvanced(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["derangements","catalan_numbers","multinomial_count","stars_and_bars"];
    let type=types[Math.floor(rng()*types.length)];
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "derangements":{
            // The recurrence keeps the arithmetic whole, and n is capped at eight
            // so the count stays a plain integer rather than something a double
            // would print as 1.4e+15.
            let cap=difficulty==="easy"?5:difficulty==="hard"?8:6;
            let n=randInt(rng, 3, cap);
            let counts=derangements(n);
            let value=counts[n] as number;
            correct=String(value);
            alternate=correct;
            display=`!${n} = ${n-1} \\times (!${n-1} + !${n-2}) = ${value}`;
            latex=`In how many ways can \\( ${n} \\) distinct books be placed on a shelf so that no book is in its original position?`;
            let partial=0;
            for (let index=0; index<n; index++) partial+=counts[index] as number;
            choices=numberOptions(value, [factorial(n), partial, value+1, value-1, nCr(n, 2), factorial(n)-value]);
            steps=[
                "A derangement is a permutation with no fixed point, and the counts satisfy `!n = (n-1)(!(n-1) + !(n-2))`.",
                `The values up to \\( n = ${n} \\) are ${counts.map((_, index)=>`!${index} = ${counts[index] as number}`).join(", ")}.`,
                `So \\( !${n} = ${value} \\), and the answer is ${value}.`
            ];
            rungs=[
                "The derangement numbers come from the recurrence `!n = (n-1)(!(n-1) + !(n-2))`, starting from `!0 = 1` and `!1 = 0`.",
                `Build the counts up to \\( n = ${n} \\) with that recurrence, and use \\( n = ${n} \\) at the last step.`
            ];
            break;
        }
        case "catalan_numbers":{
            // `C_n = C(2n, n) / (n+1)`, and n is capped at nine so the binomial
            // coefficient stays exactly representable.
            let cap=difficulty==="easy"?4:difficulty==="hard"?9:6;
            let n=randInt(rng, 2, cap);
            let counts=catalanNumbers(n);
            let value=counts[n] as number;
            let middle=nCr(2*n, n);
            correct=String(value);
            alternate=correct;
            display=`\\frac{\\binom{${2*n}}{${n}}}{${n+1}} = ${middle} / ${n+1} = ${value}`;
            latex=`A row of \\( n \\) left brackets and \\( n \\) right brackets is matched so that each bracket is closed in the right order. For \\( n = ${n} \\), how many such matchings are there?`;
            choices=numberOptions(value, [middle, middle*2, value+1, value-1, nCr(n+1, n), factorial(n+1)/(factorial(n)*factorial(n+1))]);
            steps=[
                "The number of correct bracket matchings on `n` pairs is the `n`th Catalan number, `C_n = C(2n, n) / (n+1)`.",
                `\\(\\binom{${2*n}}{${n}} = ${middle} \\) and \\( ${n}+1 = ${n+1} \\), so \\( C_{${n}} = ${middle} / ${n+1} = ${value} \\).`,
                `The answer is ${value}.`
            ];
            rungs=[
                "The Catalan numbers count correct bracket matchings: `C_n = C(2n, n) / (n+1)`.",
                `Use \\( n = ${n} \\): take \\(\\binom{${2*n}}{${n}}\\) from the printed number of pairs and divide by \\( ${n+1} \\).`
            ];
            break;
        }
        case "multinomial_count":{
            // `n! / (a! b! c!)`, accumulated as a product of exact binomial
            // coefficients rather than one quotient of two large factorials,
            // because that quotient is not always exactly representable.
            let cap=difficulty==="easy"?5:difficulty==="hard"?9:7;
            let n=randInt(rng, 5, cap);
            let first=randInt(rng, 1, n-2);
            let second=randInt(rng, 1, n-first-1);
            let third=n-first-second;
            let value=nCr(n, first)*nCr(n-first, second);
            correct=String(value);
            alternate=correct;
            display=`\\binom{${n}}{${first}} \\times \\binom{${n-first}}{${second}} = ${value}`;
            latex=`A bag holds ${first} red balls, ${second} blue balls and ${third} green balls. In how many ways can the ${n} balls be drawn in order?`;
            choices=numberOptions(value, [nCr(n, first), nCr(n, second), nCr(n, first)*nCr(n, third), factorial(n), value/first]);
            steps=[
                "Drawing the balls in order is arranging `n` objects in which the copies of each colour are interchangeable, so the count is the multinomial coefficient `n! / (a! b! c!)`.",
                `Choose the positions of the ${first} red balls in \\(\\binom{${n}}{${first}} = ${nCr(n, first)}\\) ways, then the ${second} blue balls in \\(\\binom{${n-first}}{${second}} = ${nCr(n-first, second)}\\) of what is left.`,
                `${nCr(n, first)} \\times ${nCr(n-first, second)} = ${value}, so the answer is ${value}.`
            ];
            rungs=[
                "Identical objects of the same kind are not told apart, so the count is a multinomial coefficient, which you can build from two binomial coefficients.",
                `Choose the positions of the ${first} red balls and then the ${second} blue balls from what is left: \\(\\binom{${n}}{${first}}\\) and \\(\\binom{${n-first}}{${second}}\\).`
            ];
            break;
        }
        case "stars_and_bars":{
            // `C(n+k-1, k-1)` for n identical objects in k distinct boxes, and
            // the cap keeps the binomial coefficient small enough to print whole.
            let cap=difficulty==="easy"?4:difficulty==="hard"?8:6;
            let boxes=randInt(rng, 2, cap);
            let items=randInt(rng, 2, difficulty==="easy"?5:difficulty==="hard"?12:8);
            let value=nCr(items+boxes-1, boxes-1);
            correct=String(value);
            alternate=correct;
            display=`\\binom{${items}+${boxes}-1}{${boxes}-1} = ${value}`;
            latex=`In how many ways can \\( ${items} \\) identical sweets be shared among \\( ${boxes} \\) children so that every child receives at least one sweet? The children are distinct.`;
            let withEmpty=items+boxes;
            choices=numberOptions(value, [nCr(items+boxes-1, items), nCr(withEmpty, boxes), nCr(items+boxes, items), nCr(items-1, boxes-1), value+1]);
            steps=[
                "Sharing `n` identical sweets among `k` distinct children with at least one each is stars and bars after giving one sweet to each child: it leaves `n - k` sweets to distribute freely.",
                `That is \\(\\binom{${items}-${boxes}+${boxes}-1}{${boxes}-1} = \\binom{${withEmpty}-1}{${boxes}-1} = \\binom{${withEmpty-1}}{${boxes-1}} = ${value}\\).`,
                `The answer is ${value}.`
            ];
            rungs=[
                "\"At least one each\" is handled by handing one sweet to every child first, which leaves `n - k` sweets to place into `k` boxes with no restriction: that is stars and bars.",
                `Use \\( n = ${items} \\) and \\( k = ${boxes} \\): the count is \\(\\binom{${items}+${boxes}-1}{${boxes}-1}\\) once every child has been given one.`
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices, expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
