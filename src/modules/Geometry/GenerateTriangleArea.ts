/**
 * @file The area of a triangle: base and height, Heron's formula, a missing leg of
 * a right triangle, and a triangle split into two.
 * @description Every answer here is a whole number of square units, and that is a
 * design decision rather than an accident. The Heron triples come from a table
 * whose semi-perimeter makes the radicand a perfect square, the right triangles
 * come from Pythagorean triples, and the base-and-height branch draws an even base
 * so that halving it divides exactly. An irrational area would have to be declared
 * to two decimal places and then graded to two decimal places, which is one more
 * rounding decision than this topic needs.
 *
 * The two mistakes the option sets are built around are treating a rhombus as base
 * times side and halving twice.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt, pick}from"../shared/Random";

/**
 * Triples whose Heron radicand is a perfect square, with the area each one gives.
 * The area column is what the answer is, so the table is the single source of truth
 * for the branch rather than a table of sides the generator then has to trust.
 */
let HERON: number[][]=[
    [3, 4, 5, 6],
    [5, 5, 6, 12],
    [5, 5, 8, 12],
    [4, 13, 15, 24],
    [6, 8, 10, 24],
    [5, 12, 13, 30],
    [9, 10, 17, 36],
    [7, 15, 20, 42],
    [10, 13, 13, 60],
    [8, 15, 17, 60],
    [9, 12, 15, 54],
    [13, 14, 15, 84]
];

/**
 * Pythagorean triples with the even leg first, so that halving a product with the
 * hypotenuse still divides exactly. Columns are even leg, odd leg, hypotenuse.
 */
let RIGHT: number[][]=[
    [4, 3, 5],
    [8, 6, 10],
    [12, 5, 13],
    [16, 15, 17],
    [12, 9, 15],
    [24, 7, 25],
    [16, 12, 20],
    [20, 21, 29],
    [24, 10, 26],
    [20, 15, 25],
    [30, 16, 34],
    [40, 9, 41]
];

export function generateTriangleArea(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["base_and_height", "herons_formula", "missing_side", "a_composite_triangle"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?10:difficulty==="hard"?28:18;
    let scaleMax=difficulty==="easy"?1:difficulty==="hard"?2:1;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number of square units";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "base_and_height":{
            // The base is drawn even so that half of it is a whole number and the
            // area is one rather than a half.
            let height=randInt(rng, 2, spread);
            let base=2*randInt(rng, 2, spread);
            let key=base*height/2;
            correct=String(key);
            latex=`A triangle has a base of length \\( ${base} \\) and a perpendicular height of \\( ${height} \\). What is its area?`;
            choices=numberOptions(key, [base*height, base+height, 2*base*height, base*height-height]);
            rungs=[
                "The area of a triangle is one half of the base times the perpendicular height, and the height is the perpendicular distance to the line the base lies on rather than a slanted side.",
                `Multiply the base ${base} by the height ${height}, then halve the product.`
            ];
            steps=[
                `The base is ${base} and the height is ${height}.`,
                `Half of the product is ${base} x ${height} / 2 = ${base*height} / 2.`,
                `${base*height} / 2 = ${key}, so the area is ${correct} square units.`
            ];
            break;
        }
        case "herons_formula":{
            let row=pick(rng, HERON);
            let factor=randInt(rng, 1, scaleMax);
            let a=row[0]*factor;
            let b=row[1]*factor;
            let c=row[2]*factor;
            let key=(row[3] as number)*factor*factor;
            let semi=(a+b+c)/2;
            let radicand=semi*(semi-a)*(semi-b)*(semi-c);
            correct=String(key);
            latex=`A triangle has sides of length \\( ${a} \\), \\( ${b} \\) and \\( ${c} \\). Use Heron's formula, \\( A = \\sqrt{s(s-a)(s-b)(s-c)} \\) where \\( s \\) is the semi-perimeter. What is its area?`;
            choices=numberOptions(key, [semi, a+b+c, radicand, radicand/2, key*2]);
            rungs=[
                "Heron's formula needs the semi-perimeter first, not the perimeter, and the semi-perimeter is the perimeter halved.",
                `The perimeter is ${a} + ${b} + ${c} = ${a+b+c}, so the semi-perimeter is s = ${semi}, and the four factors are ${semi}, ${semi-a}, ${semi-b} and ${semi-c}.`
            ];
            steps=[
                `The perimeter is ${a+b+c}, so the semi-perimeter is s = ${a+b+c} / 2 = ${semi}.`,
                `The four factors are s = ${semi}, s - a = ${semi-a}, s - b = ${semi-b} and s - c = ${semi-c}.`,
                `Their product is ${radicand} and its square root is ${correct}, so the area is ${key} square units.`
            ];
            break;
        }
        case "missing_side":{
            let row=pick(rng, RIGHT);
            let factor=randInt(rng, 1, scaleMax);
            let even=row[0]*factor;
            let odd=row[1]*factor;
            let hyp=row[2]*factor;
            let key=even*odd/2;
            correct=String(key);
            latex=`Triangle \\( ABC \\) is right-angled at \\( C \\). Its hypotenuse is \\( AB = ${hyp} \\) and one leg is \\( AC = ${even} \\). What is the area of the triangle?`;
            choices=numberOptions(key, [even*odd, hyp*even/2, even+odd, hyp*odd, hyp*even]);
            rungs=[
                "The legs of a right triangle are the two sides that meet at the right angle, and the area is half of their product. The hypotenuse is the side opposite the right angle and is not a leg, so you need the other leg before you can multiply.",
                `The hypotenuse ${hyp} and the leg ${even} leave a second leg of ${odd}, and the area is half of ${even} times that.`
            ];
            steps=[
                `The right angle is at C, so the two legs are AC = ${even} and BC, and AB = ${hyp} is the hypotenuse.`,
                `By the Pythagorean theorem the other leg is ${odd}, and half of ${even} x ${odd} is ${even*odd} / 2.`,
                `${even*odd} / 2 = ${key}, so the area is ${correct} square units.`
            ];
            break;
        }
        case "a_composite_triangle":{
            // The two pieces share one apex and one height, so their areas add. The
            // height is drawn even so the total is a whole number.
            let height=2*randInt(rng, 2, Math.floor(spread/2));
            let first=randInt(rng, 2, spread);
            let second=randInt(rng, 2, spread);
            let key=height*(first+second)/2;
            correct=String(key);
            latex=`A triangular plot is divided by a straight fence into two triangular fields that share the same apex. The two bases along the straight side are \\( ${first} \\) and \\( ${second} \\), and the perpendicular height from the apex to that side is \\( ${height} \\). What is the total area of the two fields?`;
            choices=numberOptions(key, [height*(first+second), first*second/2, height*Math.max(first, second), first+second+height]);
            rungs=[
                "Each piece is a triangle with the same height, so each has half its base times that height and the two areas add to half the total base times the height.",
                `The bases are ${first} and ${second}, so the total base along the straight side is ${first+second}, and the height is ${height}.`
            ];
            steps=[
                `The two bases are ${first} and ${second}, so together they measure ${first+second} along the straight side.`,
                `Both pieces have the height ${height}, so the total area is ${first+second} x ${height} / 2.`,
                `${first+second} x ${height} / 2 = ${key}, so the total area is ${correct} square units.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}