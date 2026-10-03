/**
 * @file Surface areas: prisms, cylinders, cones, spheres and pyramids.
 * @description The three branches that use pi state in the prompt that pi is 3.14 and
 * that the answer is to the nearest hundredth, and are then computed from exactly
 * those printed whole numbers with exactly that approximation before a single
 * rounding. The two branches that need no pi produce whole numbers, so nothing
 * there is rounded at all and the key is the integer a learner would write.
 *
 * The cone's slant height is never drawn freely: it comes from a Pythagorean triple
 * with the radius, so the height printed is a real height and the surface area has
 * no second rounding hiding inside it.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fmt}from"../shared/Numeric";
import{numberOptions}from"../shared/Options.js";
import{randInt, pick}from"../shared/Random";

/** Pythagorean triples with the radius first, then the vertical height, then the slant height. */
let CONE: number[][]=[
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13],
    [8, 15, 17],
    [9, 12, 15],
    [7, 24, 25],
    [12, 16, 20],
    [10, 24, 26],
    [20, 21, 29],
    [15, 20, 25],
    [16, 30, 34],
    [9, 40, 41]
];

/** The value of pi every prompt in this file commits to, so the key is reproducible. */
let PI=3.14;

export function generateSurfaceArea(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["right_prism", "cylinder", "cone", "sphere_and_hemisphere", "pyramid"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?6:difficulty==="hard"?18:10;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number of square units";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "right_prism":{
            let length=randInt(rng, 2, spread);
            let width=randInt(rng, 2, spread);
            let height=randInt(rng, 2, spread);
            let key=2*(length*width+length*height+width*height);
            correct=String(key);
            latex=`A right rectangular prism has length \\( ${length} \\), width \\( ${width} \\) and height \\( ${height} \\). What is its total surface area?`;
            choices=numberOptions(key, [2*(length*width), 2*(length+width+height), 4*length*width, key-length*width]);
            rungs=[
                "A prism has two congruent ends and a lateral face for each pair of opposite sides, so its surface area is twice the end plus base times height plus width times height.",
                `Add the three distinct rectangles ${length} x ${width}, ${length} x ${height} and ${width} x ${height}, then double the total.`
            ];
            steps=[
                `The three different face areas are ${length} x ${width} = ${length*width}, ${length} x ${height} = ${length*height} and ${width} x ${height} = ${width*height}.`,
                `Each of them occurs twice on the surface, so the total is 2 x (${length*width} + ${length*height} + ${width*height}).`,
                `2 x (${length*width} + ${length*height} + ${width*height}) = 2 x ${length*width+length*height+width*height} = ${key}, so the surface area is ${correct} square units.`
            ];
            break;
        }
        case "cylinder":{
            let radius=randInt(rng, 2, spread);
            let height=randInt(rng, 2, spread);
            let key=2*PI*radius*(radius+height);
            correct=fmt(key, 2);
            expectedFormat="Enter a decimal rounded to the nearest hundredth";
            latex=`A cylinder has radius \\( ${radius} \\) and height \\( ${height} \\). Use \\( \\pi \\approx 3.14 \\) and round your answer to the nearest hundredth. What is its total surface area?`;
            choices=numberOptions(key, [2*PI*radius*radius, PI*radius*radius, 2*PI*height, 2*PI*radius*height], 2);
            rungs=[
                "A closed cylinder has two circular ends as well as its curved side, so the surface area is twice pi r squared plus two pi r h.",
                `The ends contribute 2 x 3.14 x ${radius} x ${radius} and the curved side contributes 2 x 3.14 x ${radius} x ${height}.`
            ];
            steps=[
                `The two circular ends together give 2 x 3.14 x ${radius} x ${radius} = ${fmt(2*PI*radius*radius, 4)}.`,
                `The curved side gives 2 x 3.14 x ${radius} x ${height} = ${fmt(2*PI*radius*height, 4)}.`,
                `${fmt(2*PI*radius*radius, 4)} + ${fmt(2*PI*radius*height, 4)} = ${fmt(key, 4)}, which rounds to ${correct} square units.`
            ];
            break;
        }
        case "cone":{
            let row=pick(rng, CONE);
            let scale=difficulty==="easy"?1:randInt(rng, 1, 2);
            let radius=row[0]*scale;
            let slant=row[2]*scale;
            let key=PI*radius*radius+PI*radius*slant;
            correct=fmt(key, 2);
            expectedFormat="Enter a decimal rounded to the nearest hundredth";
            latex=`A cone has radius \\( ${radius} \\) and slant height \\( ${slant} \\), where the slant height is the distance from the apex to any point on the rim of the base. Use \\( \\pi \\approx 3.14 \\) and round your answer to the nearest hundredth. What is its total surface area?`;
            choices=numberOptions(key, [PI*radius*radius, PI*radius*slant, 2*PI*radius*radius, PI*radius*(slant+radius)/2], 2);
            rungs=[
                "A cone has one circular base and one curved face, and the curved face uses the slant height rather than the vertical height.",
                `The base is 3.14 x ${radius} x ${radius} and the curved face is 3.14 x ${radius} x ${slant}.`
            ];
            steps=[
                `The base contributes 3.14 x ${radius} x ${radius} = ${fmt(PI*radius*radius, 4)}.`,
                `The curved face contributes 3.14 x ${radius} x ${slant} = ${fmt(PI*radius*slant, 4)}.`,
                `${fmt(PI*radius*radius, 4)} + ${fmt(PI*radius*slant, 4)} = ${fmt(key, 4)}, which rounds to ${correct} square units.`
            ];
            break;
        }
        case "sphere_and_hemisphere":{
            let radius=randInt(rng, 2, spread);
            let half=rng()<0.5;
            let key=half?3*PI*radius*radius:4*PI*radius*radius;
            correct=fmt(key, 2);
            expectedFormat="Enter a decimal rounded to the nearest hundredth";
            latex=half?
                `A hemisphere has radius \\( ${radius} \\). Use \\( \\pi \\approx 3.14 \\) and round your answer to the nearest hundredth. What is the total surface area of the hemisphere, counting the flat circular face?`:
                `A sphere has radius \\( ${radius} \\). Use \\( \\pi \\approx 3.14 \\) and round your answer to the nearest hundredth. What is the surface area of the sphere?`;
            if (half){
                choices=numberOptions(key, [4*PI*radius*radius, 2*PI*radius*radius, PI*radius*radius, 3*PI*radius], 2);
                rungs=[
                    "The surface of a hemisphere is the curved half of a sphere's surface plus a flat circular face, so it is half of four pi r squared plus pi r squared.",
                    `The curved half is 3.14 x ${radius} x ${radius} and the flat face is another 3.14 x ${radius} x ${radius}.`
                ];
                steps=[
                    `The curved half of the sphere's surface is 2 x 3.14 x ${radius} x ${radius} = ${fmt(2*PI*radius*radius, 4)}.`,
                    `The flat circular face adds 3.14 x ${radius} x ${radius} = ${fmt(PI*radius*radius, 4)}.`,
                    `${fmt(2*PI*radius*radius, 4)} + ${fmt(PI*radius*radius, 4)} = ${fmt(key, 4)}, which rounds to ${correct} square units.`
                ];
            }
            else{
                choices=numberOptions(key, [3*PI*radius*radius, 2*PI*radius*radius, PI*radius*radius, 4*PI*radius], 2);
                rungs=[
                    "The surface area of a sphere is four pi r squared, which is four times the area of its great circle.",
                    `Multiply 3.14 by four and by ${radius} x ${radius}.`
                ];
                steps=[
                    `The area of a great circle is 3.14 x ${radius} x ${radius} = ${fmt(PI*radius*radius, 4)}.`,
                    `The sphere's surface is four such circles.`,
                    `4 x ${fmt(PI*radius*radius, 4)} = ${fmt(key, 4)}, which rounds to ${correct} square units.`
                ];
            }
            break;
        }
        case "pyramid":{
            let side=randInt(rng, 2, spread);
            let slant=randInt(rng, 3, spread);
            let key=side*side+2*side*slant;
            correct=String(key);
            latex=`A square pyramid has a base of side \\( ${side} \\) and a slant height, measured from the midpoint of a base edge to the apex, of \\( ${slant} \\). What is its total surface area?`;
            choices=numberOptions(key, [side*side, 2*side*slant, 4*side*slant, side*side+4*side*slant]);
            rungs=[
                "A pyramid's lateral surface is made of four triangles, and each triangle has base equal to a side of the square and height equal to the slant height.",
                `The base is ${side} x ${side} and each of the four triangular faces is half of ${side} x ${slant}.`
            ];
            steps=[
                `The square base has area ${side} x ${side} = ${side*side}.`,
                `Each triangular face has area ${side} x ${slant} / 2 = ${side*slant/2}, so the four of them give ${2*side*slant}.`,
                `${side*side} + ${2*side*slant} = ${key}, so the surface area is ${correct} square units.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}