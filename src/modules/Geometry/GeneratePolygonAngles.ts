/**
 * @file Interior and exterior angles of polygons, regular and not.
 * @description The two facts this topic rests on are that the interior angles of an
 * n-gon sum to (n-2) x 180 degrees and that the exterior turns of any convex
 * polygon sum to 360 degrees, one turn of 360/n at each vertex of a regular one.
 * Both are printed in whole numbers of degrees wherever they can be, and the one
 * branch whose answer is not a whole number says so in the prompt and is then
 * rounded exactly as it says.
 *
 * The branch that recovers the number of sides from two angles and the sum is the
 * one worth the construction effort: the two angles and the side count are built
 * from each other rather than the other way round, so the printed numbers are
 * consistent with a real convex polygon by construction.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fmt, roundTo}from"../shared/Numeric";
import{numberOptions}from"../shared/Options.js";
import{randInt, pick}from"../shared/Random";

/** Divisors of 360 from which a regular-polygon interior angle can be built. */
let EXTERIOR_STEPS=[24, 30, 36, 40, 45, 60, 72, 90];

export function generatePolygonAngles(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["sum_of_interior_angles", "one_interior_angle", "exterior_turn_angle", "a_regular_polygon"];
    let type=types[Math.floor(rng()*types.length)];
    let small=difficulty==="easy"?6:difficulty==="hard"?20:12;
    let large=difficulty==="easy"?10:difficulty==="hard"?40:24;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "sum_of_interior_angles":{
            let n=randInt(rng, 3, large);
            let key=(n-2)*180;
            correct=String(key);
            latex=`What is the sum, in degrees, of the interior angles of a convex polygon with \\( ${n} \\) sides?`;
            choices=numberOptions(key, [n*180, (n-2)*360, (n-3)*180, (n-1)*180]);
            rungs=[
                "The interior angles of an n-gon sum to (n - 2) x 180 degrees, which comes from cutting the polygon into n - 2 triangles from one vertex.",
                `Substitute ${n} for n: the sum is (${n} - 2) x 180 degrees.`
            ];
            steps=[
                `Cutting a convex polygon with ${n} sides into triangles from one vertex gives ${n} - 2 = ${n-2} triangles.`,
                `Each triangle contributes 180 degrees, so the sum is ${n-2} x 180.`,
                `${n-2} x 180 = ${key}, so the sum is ${correct} degrees.`
            ];
            break;
        }
        case "one_interior_angle":{
            // The polygon is built from the angle data rather than checked against it:
            // choose the side count and the repeated angle, then read the leftover
            // angle off the sum, and keep the draw only when that leftover is itself
            // a possible interior angle.
            let n=0;
            let repeated=0;
            let leftover=0;
            for(let attempt=0; attempt<64; attempt++){
                let candidate=randInt(rng, 4, large);
                let angle=randInt(rng, 30, 170);
                let rest=(candidate-2)*180-(candidate-1)*angle;
                if (rest>0&&rest<180){
                    n=candidate;
                    repeated=angle;
                    leftover=rest;
                    break;
                }
            }
            if (n===0){
                n=5;
                repeated=110;
                leftover=(n-2)*180-(n-1)*repeated;
            }
            correct=String(n);
            latex=`In a convex polygon, all but one of the interior angles measure \\( ${repeated}^{\\circ} \\), and the one remaining angle measures \\( ${leftover}^{\\circ} \\). How many sides does the polygon have?`;
            choices=numberOptions(n, [n+1, n-1, n+2, n-2]);
            rungs=[
                "Add up the angles you are given, set the total equal to (n - 2) x 180, and solve for the side count n. There are n - 1 repeated angles here, because all but one of them are equal.",
                `The total is (${n} - 1) x ${repeated} + ${leftover}, and it has to equal (n - 2) x 180.`
            ];
            steps=[
                `The sum of the angles is ${n-1} x ${repeated} + ${leftover} = ${(n-1)*repeated + leftover}.`,
                `That has to equal (n - 2) x 180, so adding 360 to both sides and collecting the terms in n gives n x (180 - ${repeated}) = 360 - ${repeated} + ${leftover}.`,
                `n = (360 - ${repeated} + ${leftover}) / (180 - ${repeated}) = ${360 - repeated + leftover} / ${180 - repeated} = ${n}, so the polygon has ${correct} sides.`
            ];
            break;
        }
        case "exterior_turn_angle":{
            let n=randInt(rng, 3, small*2);
            let key=roundTo(360/n, 2);
            correct=fmt(key, 2);
            latex=`The exterior angles of a convex polygon come to \\( 360^{\\circ} \\) in all. If the polygon is regular, what is the measure of each exterior angle, in degrees? The polygon has \\( ${n} \\) sides, and round your answer to the nearest hundredth.`;
            expectedFormat="Enter a decimal rounded to the nearest hundredth";
            choices=numberOptions(key, [roundTo(360/(n-2), 2), roundTo(360/(n+2), 2), roundTo(180/n, 2), roundTo(720/n, 2)], 2);
            rungs=[
                "In a regular polygon every exterior angle is the same, so dividing the total turn of 360 degrees by the number of sides gives one of them.",
                `The exterior angles add to 360 degrees and there are ${n} of them, so each is 360 / ${n}.`
            ];
            steps=[
                `The exterior angles of any convex polygon sum to 360 degrees, and a regular polygon has ${n} equal ones.`,
                `Each exterior angle is 360 / ${n} degrees.`,
                `360 / ${n} = ${fmt(360/n, 4)}, which rounds to ${correct} degrees.`
            ];
            break;
        }
        case "a_regular_polygon":{
            // The step is drawn as a divisor of 360 so that the side count is a whole
            // number rather than a rounded one.
            let step=pick(rng, EXTERIOR_STEPS);
            let interior=180-step;
            let key=360/step;
            correct=String(key);
            latex=`The interior angle of a regular polygon measures \\( ${interior}^{\\circ} \\). How many sides does the polygon have?`;
            choices=numberOptions(key, [interior, 360/interior, 180/interior, 2*key]);
            rungs=[
                "The exterior angle of a regular polygon is 180 degrees minus the interior angle, and the exterior angles share 360 degrees between them.",
                `The exterior angle is 180 - ${interior} = ${step} degrees, and 360 divided by that step is the number of sides.`
            ];
            steps=[
                `The exterior angle is 180 - ${interior} = ${step} degrees.`,
                `The exterior angles come to 360 degrees in all, so the number of sides is 360 / ${step}.`,
                `360 / ${step} = ${key}, so the polygon has ${correct} sides.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}