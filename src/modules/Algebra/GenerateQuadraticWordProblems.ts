/**
 * @file Quadratic models in words: an area, a product of two numbers, a right
 * triangle, and a quantity that first grows and then falls.
 * @description Every model here is solved backwards from a model that is known to
 * work. The width and the height are drawn together and the area computed from them,
 * the two factors are drawn first and the product computed from them, the triangles
 * come from a table of genuine Pythagorean triples, and the parabola is built from
 * its vertex. That is what makes the answers exact: none of them is the root of an
 * equation whose solution is irrational, and none of them is a decimal the prompt
 * never printed.
 *
 * Each branch names the second root of its own equation as a distractor, because the
 * second root is always a real solution of the algebra and always a real answer to
 * the story: a negative length, or a negative count, is the mistake this topic
 * exists to catch.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

/** Right triangles with whole sides, shortest leg first. */
const TRIPLES: [number, number, number][]=[
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13],
    [9, 12, 15],
    [8, 15, 17],
    [12, 16, 20],
    [7, 24, 25],
    [20, 21, 29],
    [10, 24, 26],
    [15, 20, 25]
];

export function generateQuadraticWordProblems(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["area_model","product_model","pythagorean_model","growth_and_decay"];
    let type=types[Math.floor(rng()*types.length)];
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "area_model":{
            // The width is drawn first and the length built from it, so the product
            // the prompt prints is exactly the area of the rectangle it describes and
            // the quadratic factors over the whole numbers.
            let width=difficulty==="hard"?randInt(rng, 4, 16):randInt(rng, 3, 9);
            let extra=difficulty==="easy"?randInt(rng, 2, 4):randInt(rng, 2, 9);
            let length=width+extra;
            let area=width*length;
            key=width;
            latex=`A rectangular paddock has an area of \\( ${area} \\) square meters, and its length is \\( ${extra} \\) meters more than its width. What is its width, in meters?`;
            wrong=[length, -(width+length), width+1, extra, width+extra+1];
            rungs=[
                "Write the length in terms of the unknown before you do anything else, so the area becomes one expression to set equal to the number printed in the prompt.",
                `The length is the width plus ${extra}, so the area is the width times the width plus ${extra}.`
            ];
            steps=[
                `Let the width be x, so the length is x + ${extra}.`,
                `The area is x(x + ${extra}) = ${area}, so x squared plus ${extra}x minus ${area} = 0, which factors as (x - ${width})(x + ${width+length}).`,
                `Only x = ${width} is positive, so the width in meters is x = ${key}`
            ];
            break;
        }
        case "product_model":{
            // The two numbers are drawn first, so the difference and the product in the
            // prompt are consistent by construction and the quadratic has two whole
            // roots, one of which is negative.
            let smaller=difficulty==="hard"?randInt(rng, 4, 18):randInt(rng, 3, 11);
            let extra=difficulty==="easy"?randInt(rng, 3, 6):randInt(rng, 2, 11);
            let larger=smaller+extra;
            let product=smaller*larger;
            key=smaller;
            latex=`Two counting cards hold whole numbers of counters. The first card holds \\( ${extra} \\) more counters than the second, and together they hold \\( ${product} \\) counters. How many counters are on the smaller card?`;
            wrong=[larger, -(smaller+larger), smaller+1, extra, smaller-1];
            rungs=[
                "The larger number is the smaller one plus the stated difference, so the product is one expression to set equal to the total rather than two unknowns to guess at.",
                `Let the smaller count be x, so the larger is x + ${extra}.`
            ];
            steps=[
                `Let the smaller count be x, so the larger is x + ${extra}.`,
                `Their product is x(x + ${extra}) = ${product}, so x squared plus ${extra}x minus ${product} = 0, which factors as (x - ${smaller})(x + ${larger}).`,
                `The root that can be a count of counters is x = ${key}`
            ];
            break;
        }
        case "pythagorean_model":{
            // The triangles come from a table of genuine triples, so the hypotenuse is
            // a whole number and no answer is a rounded square root.
            let widest=difficulty==="easy"?3:difficulty==="hard"?9:6;
            let eligible=TRIPLES.filter(triple=>Math.abs((triple[1] as number)-(triple[0] as number))<=widest);
            let triple=eligible[Math.floor(rng()*eligible.length)] as [number, number, number];
            let shortLeg=triple[0];
            let longLeg=triple[1];
            let hypotenuse=triple[2];
            let extra=longLeg-shortLeg;
            key=shortLeg;
            latex=`A right-angled triangle has perpendicular legs. The longer leg is \\( ${extra} \\) centimeters longer than the shorter one, and the hypotenuse is \\( ${hypotenuse} \\) centimeters long. How long is the shorter leg, in centimeters?`;
            wrong=[longLeg, shortLeg+1, shortLeg-1, extra, hypotenuse-shortLeg];
            rungs=[
                "The two legs of a right-angled triangle satisfy the square of the hypotenuse equal to the sum of the squares of the legs, so write both legs in terms of the shorter one before squaring.",
                `The longer leg is the shorter leg plus ${extra}, and the hypotenuse is ${hypotenuse}.`
            ];
            steps=[
                `Let the shorter leg be x, so the longer leg is x + ${extra}.`,
                `Then x squared plus (x + ${extra}) squared = ${hypotenuse*hypotenuse}, which solves to a shorter leg of ${shortLeg} centimeters.`,
                `The shorter leg in centimeters is ${key}`
            ];
            break;
        }
        case "growth_and_decay":{
            // The parabola is built from its vertex, so the slope of the linear term
            // makes the vertex land on a whole number of hours and the height there is a
            // whole number of thousands.
            let shape=randInt(rng, 1, 3);
            let peak=randInt(rng, 2, difficulty==="hard"?9:6);
            let start=randInt(rng, 10, difficulty==="hard"?40:25);
            let reach=start+shape*peak*peak;
            key=reach;
            latex=`A culture of bacteria in a sealed jar first grows and then dies off. The population, in thousands, \\( t \\) hours after the jar is sealed is given by \\( P(t) = -${shape}t^{2} + ${2*shape*peak}t + ${start} \\). What is the greatest population, in thousands, the culture reaches?`;
            wrong=[start, reach-shape, reach-4*shape, reach+shape, shape*peak*peak];
            rungs=[
                "The greatest value of a downward parabola is at its turning point, and the turning point is halfway between the two roots, which is also where the graph changes direction.",
                `The turning point of P is at t = ${peak}, so work out P there rather than at either end.`
            ];
            steps=[
                `The turning point is at t = ${2*shape*peak} / (2 x ${shape}) = ${peak} hours.`,
                `P(${peak}) = -${shape} x ${peak*peak} + ${2*shape*peak} x ${peak} + ${start}.`,
                `The number of thousands of bacteria at the turning point is ${-shape*peak*peak} + ${2*shape*peak*peak} + ${start}, which is ${reach}.`,
                `The greatest population, in thousands, is ${key}`
            ];
            break;
        }
    }
    let keyText=String(key);
    return {latex, correct:keyText, alternate:keyText, display:keyText, choices:numberOptions(key, wrong, 0), expectedFormat:"Enter a whole number", subskill:type, hints:{rungs, concede:"The answer is "+keyText+"."}, solution: steps};
}
