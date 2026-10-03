/**
 * @file Regular polygons: perimeter, apothem, area, and recovering the side count
 * from an angle.
 * @description The apothem and the area both need the tangent of half a central
 * angle, which is not a whole number for any n but four, so those two branches say
 * in the prompt that the answer is to the nearest hundredth and are then rounded
 * exactly once, from exactly the whole numbers printed. The perimeter branch and
 * the side-count branch are exact: the side count is built from divisors of 360 so
 * that 360 divided by the angle is a whole number and nothing is rounded at all.
 *
 * The apothem is the inradius, the distance from the center to the midpoint of a
 * side, and half of it spans a right triangle against half a side. That triangle is
 * why the tangent appears rather than the sine.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fmt}from"../shared/Numeric";
import{numberOptions}from"../shared/Options.js";
import{randInt, pick}from"../shared/Random";

/** Divisors of 360, so a side count recovered from an angle is a whole number. */
let DIVISORS=[8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120];

/**
 * The apothem of a regular polygon with the given side length and side count: half
 * the side, divided by the tangent of half a central angle.
 *
 * @param side - The length of one side.
 * @param n - The number of sides.
 * @returns The apothem, before rounding.
 */
function apothemOf(side: number, n: number): number{
    return side/(2*Math.tan(Math.PI/n));
}

export function generateRegularPolygons(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["apothem", "perimeter", "area", "sides_from_an_angle"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?8:difficulty==="hard"?30:16;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "apothem":{
            let n=pick(rng, [3, 4, 5, 6, 8, 9, 10, 12]);
            let side=randInt(rng, 2, spread);
            let apothem=apothemOf(side, n);
            correct=fmt(apothem, 2);
            expectedFormat="Enter a decimal rounded to the nearest hundredth";
            latex=`A regular polygon has \\( ${n} \\) sides each of length \\( ${side} \\). What is its apothem, that is the perpendicular distance from the center to the midpoint of a side? Use \\( a = \\frac{s}{2\\tan(\\pi / n)} \\) and round your answer to the nearest hundredth.`;
            choices=numberOptions(apothem, [side/2, side/(2*Math.sin(Math.PI/n)), side*Math.tan(Math.PI/n)/2, side/(2*Math.tan(2*Math.PI/n)), side], 2);
            rungs=[
                "The apothem is a half side divided by the tangent of half a central angle, which comes from the right triangle a center, a vertex and a side midpoint form.",
                `Use n = ${n} and s = ${side}: the apothem is ${side} divided by 2 tan(180 / ${n} degrees).`
            ];
            steps=[
                `Half a central angle is 180 / ${n} = ${fmt(180/n, 2)} degrees, whose tangent is ${fmt(Math.tan(Math.PI/n), 4)}.`,
                `The apothem is ${side} / (2 x ${fmt(Math.tan(Math.PI/n), 4)}) = ${fmt(apothem, 4)}.`,
                `${fmt(apothem, 4)} rounds to ${correct}.`
            ];
            break;
        }
        case "perimeter":{
            let n=randInt(rng, 3, difficulty==="easy"?8:20);
            let side=randInt(rng, 2, spread);
            let key=n*side;
            correct=String(key);
            latex=`A regular polygon has \\( ${n} \\) sides each of length \\( ${side} \\). What is its perimeter?`;
            choices=numberOptions(key, [n*side+2, n*side-2, n+side, key+side]);
            rungs=[
                "A regular polygon has every side the same length, so the perimeter is the number of sides multiplied by one side.",
                `Multiply the side count ${n} by the side length ${side}.`
            ];
            steps=[
                `Every one of the ${n} sides has length ${side}.`,
                `Perimeter = ${n} x ${side}.`,
                `${n} x ${side} = ${key}, so the perimeter is ${correct}.`
            ];
            break;
        }
        case "area":{
            let n=pick(rng, [3, 4, 5, 6, 8, 9, 10, 12]);
            let side=randInt(rng, 2, spread);
            let apothem=apothemOf(side, n);
            let key=0.5*n*side*apothem;
            correct=fmt(key, 2);
            expectedFormat="Enter a decimal rounded to the nearest hundredth";
            latex=`A regular polygon has \\( ${n} \\) sides each of length \\( ${side} \\). Use \\( A = \\frac{1}{2} s \\times (\\text{perimeter}) \\times a \\) where \\( a \\) is the apothem, computed as \\( a = \\frac{s}{2\\tan(\\pi / n)} \\), and round your answer to the nearest hundredth. What is its area?`;
            choices=numberOptions(key, [n*side*side, 0.5*n*side*side, n*side*apothem, side*apothem, key*2], 2);
            rungs=[
                "The area of a regular polygon is half the perimeter times the apothem, and the apothem is the half side divided by the tangent of half a central angle.",
                `The perimeter is ${n} x ${side}, the apothem is ${side} / (2 tan(180 / ${n} degrees)), and the two of them are halved once between them.`
            ];
            steps=[
                `The perimeter is ${n} x ${side} = ${n*side}.`,
                `The apothem is ${side} / (2 x ${fmt(Math.tan(Math.PI/n), 4)}) = ${fmt(apothem, 4)}.`,
                `Half the perimeter times the apothem is ${n*side} / 2 x ${fmt(apothem, 4)} = ${fmt(key, 4)}, which rounds to ${correct} square units.`
            ];
            break;
        }
        case "sides_from_an_angle":{
            let step=pick(rng, DIVISORS);
            let key=360/step;
            let fromExterior=rng()<0.5;
            correct=String(key);
            if (fromExterior){
                latex=`The exterior angles of a convex polygon come to \\( 360^{\\circ} \\) in all. In a regular polygon each exterior angle measures \\( ${step}^{\\circ} \\). How many sides does the polygon have?`;
                choices=numberOptions(key, [180/step, step, 2*key, 360/step+2]);
                rungs=[
                    "The exterior angles of any convex polygon come to 360 degrees, so divide 360 by the size of one exterior angle of the regular polygon.",
                    `The exterior angle is ${step} degrees and there are 360 degrees of turning in total.`
                ];
                steps=[
                    `The exterior angles come to 360 degrees in all, and a regular polygon has ${key} of them.`,
                    `The side count is 360 / ${step}.`,
                    `360 / ${step} = ${key}, so the polygon has ${correct} sides.`
                ];
            }
            else{
                let interior=180-step;
                latex=`The interior angle of a regular polygon measures \\( ${interior}^{\\circ} \\). How many sides does the polygon have?`;
                choices=numberOptions(key, [interior, 360/interior, 180/interior, 2*key]);
                rungs=[
                    "The interior angle and the exterior angle of a convex polygon add to 180 degrees, and the exterior angles share 360 degrees between them.",
                    `The exterior angle is 180 - ${interior} = ${step} degrees, and 360 divided by that is the side count.`
                ];
                steps=[
                    `The exterior angle is 180 - ${interior} = ${step} degrees.`,
                    `The exterior angles come to 360 degrees in all, so the side count is 360 / ${step}.`,
                    `360 / ${step} = ${key}, so the polygon has ${correct} sides.`
                ];
            }
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}