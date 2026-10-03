/**
 * @file Volumes: prisms, cylinders, cones, pyramids, and a solid built from two
 * boxes.
 * @description A solid's volume is the area of its base times its height, and every
 * branch here is that one formula with a different base. The branches that divide
 * by three are the ones a learner most often gets wrong by forgetting the third, so
 * the pyramid branch forces the product to divide exactly and the cone branch states
 * its value of pi.
 *
 * The two branches that use pi say in the prompt that pi is 3.14 and that the answer
 * is to the nearest hundredth, and are then computed from those printed integers
 * with that approximation before a single rounding.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fmt}from"../shared/Numeric";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

/** The value of pi every prompt in this file commits to, so the key is reproducible. */
let PI=3.14;

export function generateVolumeSolids(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["rectangular_prism", "triangular_prism", "cylinder", "cone_and_pyramid", "composite_solid"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?8:difficulty==="hard"?20:12;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number of cubic units";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "rectangular_prism":{
            let length=randInt(rng, 2, spread);
            let width=randInt(rng, 2, spread);
            let height=randInt(rng, 2, spread);
            let key=length*width*height;
            correct=String(key);
            latex=`A rectangular box is \\( ${length} \\) long, \\( ${width} \\) wide and \\( ${height} \\) tall. What is its volume?`;
            choices=numberOptions(key, [2*(length*width+length*height+width*height), length*width, key+length*width, 3*key]);
            rungs=[
                "The volume of a box is the area of its base times its height, so multiply all three dimensions once each.",
                `Multiply ${length} by ${width} by ${height}.`
            ];
            steps=[
                `The volume is length x width x height = ${length} x ${width} x ${height}.`,
                `First ${length} x ${width} = ${length*width}, then ${length*width} x ${height}.`,
                `${length*width} x ${height} = ${key}, so the volume is ${correct} cubic units.`
            ];
            break;
        }
        case "triangular_prism":{
            let length=randInt(rng, 2, spread);
            let height=randInt(rng, 2, spread);
            let base=2*randInt(rng, 2, spread);
            let triangle=base*height/2;
            let key=triangle*length;
            correct=String(key);
            latex=`A triangular prism has a length of \\( ${length} \\). Its cross section is a triangle with base \\( ${base} \\) and perpendicular height \\( ${height} \\). What is the volume of the prism?`;
            choices=numberOptions(key, [triangle, base*height*length, key+triangle, 3*key]);
            rungs=[
                "The volume of a prism is the area of its cross section times its length, and the cross section here is a triangle, so halve the base times the height before multiplying by the length.",
                `The triangular cross section is ${base} x ${height} halved, and the prism is ${length} long.`
            ];
            steps=[
                `The cross-sectional area is ${base} x ${height} / 2 = ${triangle}.`,
                `The volume is that area times the length, ${triangle} x ${length}.`,
                `${triangle} x ${length} = ${key}, so the volume is ${correct} cubic units.`
            ];
            break;
        }
        case "cylinder":{
            let radius=randInt(rng, 2, spread);
            let height=randInt(rng, 2, spread);
            let key=PI*radius*radius*height;
            correct=fmt(key, 2);
            expectedFormat="Enter a decimal rounded to the nearest hundredth";
            latex=`A cylinder has radius \\( ${radius} \\) and height \\( ${height} \\). Use \\( \\pi \\approx 3.14 \\) and round your answer to the nearest hundredth. What is its volume?`;
            choices=numberOptions(key, [PI*radius*radius, PI*radius*height, 3.14*radius*height, key*3], 2);
            rungs=[
                "The volume of a cylinder is pi times the radius squared times the height, and the radius is squared rather than doubled.",
                `Multiply 3.14 by ${radius} x ${radius} and then by the height ${height}.`
            ];
            steps=[
                `The base is a circle of area 3.14 x ${radius} x ${radius} = ${fmt(PI*radius*radius, 4)}.`,
                `The volume is that area times the height ${height}.`,
                `${fmt(PI*radius*radius, 4)} x ${height} = ${fmt(key, 4)}, which rounds to ${correct} cubic units.`
            ];
            break;
        }
        case "cone_and_pyramid":{
            let rounded=rng()<0.5;
            if (rounded){
                let radius=randInt(rng, 2, spread);
                let height=randInt(rng, 2, spread);
                let key=PI*radius*radius*height/3;
                correct=fmt(key, 2);
                expectedFormat="Enter a decimal rounded to the nearest hundredth";
                latex=`A cone has radius \\( ${radius} \\) and height \\( ${height} \\). Use \\( \\pi \\approx 3.14 \\), divide by three, and round your answer to the nearest hundredth. What is its volume?`;
                choices=numberOptions(key, [PI*radius*radius*height, key*3, PI*radius*height/3, key*2], 2);
                rungs=[
                    "A cone has one third of the volume of the cylinder or prism with the same base and height, so the base area times the height is divided by three.",
                    `The base area is 3.14 x ${radius} x ${radius} and the height is ${height}, and the whole product is then divided by three.`
                ];
                steps=[
                    `The base area is 3.14 x ${radius} x ${radius} = ${fmt(PI*radius*radius, 4)}.`,
                    `Multiplying by the height gives ${fmt(PI*radius*radius*height, 4)}, and a cone is one third of that.`,
                    `${fmt(PI*radius*radius*height, 4)} / 3 = ${fmt(key, 4)}, which rounds to ${correct} cubic units.`
                ];
            }
            else{
                // The height is drawn as a multiple of three, so dividing the product
                // of the base area and the height by three is exact.
                let baseLength=randInt(rng, 2, spread);
                let baseWidth=randInt(rng, 2, spread);
                let height=3*randInt(rng, 1, Math.max(1, Math.floor(spread/3)));
                let base=baseLength*baseWidth;
                let key=base*height/3;
                correct=String(key);
                latex=`A pyramid has a rectangular base \\( ${baseLength} \\) by \\( ${baseWidth} \\) and height \\( ${height} \\). What is its volume?`;
                choices=numberOptions(key, [base*height, base*height*3, base, key*2]);
                rungs=[
                    "A pyramid has one third of the volume of the prism with the same base and height, so the base area times the height is divided by three.",
                    `The base area is ${baseLength} x ${baseWidth} = ${base} and the height is ${height}, and the product is then divided by three.`
                ];
                steps=[
                    `The base area is ${baseLength} x ${baseWidth} = ${base}.`,
                    `A pyramid is one third of the prism above that base, so the volume is ${base} x ${height} / 3.`,
                    `${base} x ${height} / 3 = ${key}, so the volume is ${correct} cubic units.`
                ];
            }
            break;
        }
        case "composite_solid":{
            let lowerLength=randInt(rng, 3, spread);
            let lowerWidth=randInt(rng, 2, spread);
            let lowerHeight=randInt(rng, 2, spread);
            let upperLength=randInt(rng, 2, lowerLength);
            let upperWidth=randInt(rng, 1, lowerWidth);
            let upperHeight=randInt(rng, 1, spread);
            let lower=lowerLength*lowerWidth*lowerHeight;
            let upper=upperLength*upperWidth*upperHeight;
            let key=lower+upper;
            correct=String(key);
            latex=`A solid is made of two boxes stacked one on top of the other. The lower box is \\( ${lowerLength} \\) by \\( ${lowerWidth} \\) by \\( ${lowerHeight} \\), and the upper box, which sits centerd on it, is \\( ${upperLength} \\) by \\( ${upperWidth} \\) by \\( ${upperHeight} \\). What is the total volume of the solid?`;
            choices=numberOptions(key, [lower, upper, key+lower, lower*upper]);
            rungs=[
                "Split the solid where the two boxes meet and add the two volumes, rather than trying to read one set of dimensions off a shape that has two.",
                `The lower box is ${lowerLength} x ${lowerWidth} x ${lowerHeight} and the upper box is ${upperLength} x ${upperWidth} x ${upperHeight}.`
            ];
            steps=[
                `The lower box has volume ${lowerLength} x ${lowerWidth} x ${lowerHeight} = ${lower}.`,
                `The upper box has volume ${upperLength} x ${upperWidth} x ${upperHeight} = ${upper}.`,
                `${lower} + ${upper} = ${key}, so the total volume is ${correct} cubic units.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}