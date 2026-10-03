/**
 * @file Areas of shapes built out of two pieces.
 * @description Every one of these figures is a rectangle plus one more piece, so
 * every one of them is an addition or a subtraction of two areas that the learner
 * can read off the prompt separately. The four branches differ in which operation
 * that is: add two rectangles, add a triangle to a rectangle, remove a rectangular
 * hole, or remove the unshaded centre from an outer rectangle to leave a border.
 *
 * The distractor in every branch is the shape that the learner would have if they
 * forgot the join: adding the widths as well as the areas, halving twice, or
 * subtracting the hole's outer rectangle instead of the hole.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

export function generateCompositeFigures(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["rectangle_plus_rectangle", "rectangle_plus_triangle", "rectangle_minus_a_hole", "a_shaded_border"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?10:difficulty==="hard"?26:16;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number of square units";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "rectangle_plus_rectangle":{
            // An L shape rather than three rectangles in a row, because three
            // rectangles in a row collapse into one and the question would have no
            // work in it.
            let baseWidth=randInt(rng, 4, spread);
            let baseHeight=randInt(rng, 2, spread);
            let topWidth=randInt(rng, 2, baseWidth);
            let topHeight=randInt(rng, 2, spread);
            let key=baseWidth*baseHeight+topWidth*topHeight;
            correct=String(key);
            latex=`An L-shaped figure is made from two rectangles. The lower rectangle is \\( ${baseWidth} \\) wide and \\( ${baseHeight} \\) tall. The upper rectangle sits on top of it, is \\( ${topWidth} \\) wide and \\( ${topHeight} \\) tall, and its left edge lines up with the left edge of the lower rectangle. What is the total area of the figure?`;
            choices=numberOptions(key, [(baseWidth+topWidth)*(baseHeight+topHeight), baseWidth*baseHeight, baseWidth*(baseHeight+topHeight), (baseWidth-topWidth)*baseHeight+topWidth*topHeight]);
            rungs=[
                "Work out each rectangle on its own and then add, rather than trying to read a single width and a single height off the L shape.",
                `The lower rectangle is ${baseWidth} x ${baseHeight} and the upper rectangle is ${topWidth} x ${topHeight}.`
            ];
            steps=[
                `The lower rectangle has area ${baseWidth} x ${baseHeight} = ${baseWidth*baseHeight}.`,
                `The upper rectangle has area ${topWidth} x ${topHeight} = ${topWidth*topHeight}.`,
                `${baseWidth*baseHeight} + ${topWidth*topHeight} = ${key}, so the total area is ${correct} square units.`
            ];
            break;
        }
        case "rectangle_plus_triangle":{
            let length=randInt(rng, 4, spread);
            let wallHeight=randInt(rng, 2, spread);
            let roofBase=2*randInt(rng, 2, Math.floor(spread/2));
            let roofHeight=randInt(rng, 2, spread);
            let key=length*wallHeight+roofBase*roofHeight/2;
            correct=String(key);
            latex=`A house-shaped figure consists of a rectangle \\( ${length} \\) wide and \\( ${wallHeight} \\) tall with a triangular roof on top. The roof has base \\( ${roofBase} \\), the same as the width of the rectangle, and perpendicular height \\( ${roofHeight} \\). What is the total area of the figure?`;
            choices=numberOptions(key, [length*wallHeight+roofBase*roofHeight, length*(wallHeight+roofHeight), roofBase*roofHeight, length*wallHeight+length*roofHeight]);
            rungs=[
                "Split the figure where the rectangle ends and the roof begins: the rectangle contributes its length times its height and the triangle contributes half its base times its height.",
                `The rectangle is ${length} x ${wallHeight} and the triangle is ${roofBase} x ${roofHeight} halved.`
            ];
            steps=[
                `The rectangle is ${length} x ${wallHeight} = ${length*wallHeight}.`,
                `The roof is a triangle with base ${roofBase} and height ${roofHeight}, so its area is ${roofBase*roofHeight} / 2 = ${roofBase*roofHeight/2}.`,
                `${length*wallHeight} + ${roofBase*roofHeight/2} = ${key}, so the total area is ${correct} square units.`
            ];
            break;
        }
        case "rectangle_minus_a_hole":{
            let outerLength=randInt(rng, 8, spread*2);
            let outerWidth=randInt(rng, 6, spread*2);
            let holeLength=randInt(rng, 1, outerLength-3);
            let holeWidth=randInt(rng, 1, outerWidth-3);
            let key=outerLength*outerWidth-holeLength*holeWidth;
            correct=String(key);
            latex=`A rectangular sheet is \\( ${outerLength} \\) by \\( ${outerWidth} \\). A rectangular hole \\( ${holeLength} \\) by \\( ${holeWidth} \\) is cut from the middle of it, entirely inside the sheet. What is the area of the remaining sheet?`;
            choices=numberOptions(key, [outerLength*outerWidth, (outerLength-holeLength)*(outerWidth-holeWidth), outerLength*outerWidth+holeLength*holeWidth, key-holeLength*holeWidth]);
            rungs=[
                "A hole removes area, so the answer is the area of the whole sheet minus the area of the hole, and the hole's dimensions are the ones printed for the hole rather than for the sheet.",
                `The sheet is ${outerLength} x ${outerWidth} and the hole is ${holeLength} x ${holeWidth}, so subtract ${holeLength*holeWidth} from ${outerLength*outerWidth}.`
            ];
            steps=[
                `The whole sheet has area ${outerLength} x ${outerWidth} = ${outerLength*outerWidth}.`,
                `The hole has area ${holeLength} x ${holeWidth} = ${holeLength*holeWidth}.`,
                `${outerLength*outerWidth} - ${holeLength*holeWidth} = ${key}, so the remaining area is ${correct} square units.`
            ];
            break;
        }
        case "a_shaded_border":{
            let innerLength=randInt(rng, 3, spread);
            let innerWidth=randInt(rng, 3, spread);
            let border=randInt(rng, 1, Math.max(2, Math.floor(spread/3)));
            let outerLength=innerLength+2*border;
            let outerWidth=innerWidth+2*border;
            let area=outerLength*outerWidth-innerLength*innerWidth;
            correct=String(area);
            latex=`A picture frame has a uniform border \\( ${border} \\) wide around a rectangular opening \\( ${innerLength} \\) by \\( ${innerWidth} \\). What is the area of the frame itself, not counting the opening?`;
            choices=numberOptions(area, [outerLength*outerWidth, innerLength*innerWidth, (innerLength+border)*(innerWidth+border)-innerLength*innerWidth, outerLength*outerWidth+innerLength*innerWidth]);
            rungs=[
                "A uniform border makes the outer rectangle larger by twice the border width on each dimension, because the border is added on both sides of each measurement.",
                `The outer rectangle is ${innerLength} + 2 x ${border} = ${outerLength} by ${innerWidth} + 2 x ${border} = ${outerWidth}, and the frame is that outer area less the opening.`
            ];
            steps=[
                `The outer rectangle is ${outerLength} x ${outerWidth}, so it has area ${outerLength*outerWidth}.`,
                `The opening has area ${innerLength} x ${innerWidth} = ${innerLength*innerWidth}.`,
                `${outerLength*outerWidth} - ${innerLength*innerWidth} = ${area}, so the frame has area ${correct} square units.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}