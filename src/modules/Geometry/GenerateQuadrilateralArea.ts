/**
 * @file The area of the four quadrilaterals whose area has its own formula.
 * @description Each of these four shapes has one base and one perpendicular height,
 * and three of the four are distinguished from each other only by what the prompt
 * is willing to call a side. That is where the option sets are aimed: a rhombus
 * whose side is `s` and whose height is `h` has area `s h`, not `s s`, and a
 * trapezoid's two parallel sides both go into the formula, not one of them twice.
 *
 * The heights are drawn smaller than the slanted sides, because a perpendicular
 * height can never be longer than the side it is drawn from, and every product is
 * arranged to divide exactly.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

export function generateQuadrilateralArea(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["rectangle", "parallelogram", "rhombus", "trapezoid"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?12:difficulty==="hard"?40:24;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number of square units";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "rectangle":{
            let length=randInt(rng, 2, spread);
            let width=randInt(rng, 2, spread);
            let key=length*width;
            correct=String(key);
            latex=`A rectangle has length \\( ${length} \\) and width \\( ${width} \\). What is its area?`;
            choices=numberOptions(key, [2*(length+width), length+width, 2*key, key+length]);
            rungs=[
                "The area of a rectangle is its length times its width, which is base times height with the height being the width itself.",
                `Multiply the two printed dimensions, ${length} and ${width}.`
            ];
            steps=[
                `The rectangle has length ${length} and width ${width}.`,
                `Area = length x width = ${length} x ${width}.`,
                `${length} x ${width} = ${key}, so the area is ${correct} square units.`
            ];
            break;
        }
        case "parallelogram":{
            // The slanted side is drawn strictly longer than the height, which is what
            // a parallelogram actually requires and what makes base times side the
            // classic wrong answer rather than a second reading of the data.
            let base=randInt(rng, 3, spread);
            let slant=randInt(rng, 3, spread);
            let height=randInt(rng, 2, Math.max(3, slant-1));
            let key=base*height;
            correct=String(key);
            latex=`A parallelogram has base \\( ${base} \\), a slanted side of length \\( ${slant} \\) and a perpendicular height of \\( ${height} \\). What is its area?`;
            choices=numberOptions(key, [base*slant, 2*key, base+height, key+base]);
            rungs=[
                "A parallelogram's area is base times perpendicular height. The slanted side is not the height, and multiplying the base by it gives the area of a triangle twice over.",
                `Multiply the base ${base} by the perpendicular height ${height}, and leave the slanted side ${slant} out of it.`
            ];
            steps=[
                `The base is ${base} and the perpendicular height is ${height}.`,
                `Area = base x height = ${base} x ${height}.`,
                `${base} x ${height} = ${key}, so the area is ${correct} square units.`
            ];
            break;
        }
        case "rhombus":{
            // A rhombus with side s admits any height strictly below s, so the height
            // is drawn from that range and the area stays exact.
            let side=randInt(rng, 4, spread);
            let height=randInt(rng, 2, Math.max(3, side-1));
            let key=side*height;
            correct=String(key);
            latex=`A rhombus has side \\( ${side} \\) and a perpendicular height of \\( ${height} \\). What is its area?`;
            choices=numberOptions(key, [side*side, side*side-height, 2*key, side+height]);
            rungs=[
                "A rhombus is a parallelogram, so its area is base times perpendicular height. All four sides being equal does not make the height equal to the side.",
                `Multiply the side ${side} by the perpendicular height ${height}, not the side by itself.`
            ];
            steps=[
                `The side is ${side} and the perpendicular height is ${height}, which is shorter than the side as it must be.`,
                `Area = side x height = ${side} x ${height}.`,
                `${side} x ${height} = ${key}, so the area is ${correct} square units.`
            ];
            break;
        }
        case "trapezoid":{
            // The height is drawn even so that halving (a + b) h divides exactly.
            let height=2*randInt(rng, 2, Math.floor(spread/2));
            let longBase=randInt(rng, 4, spread);
            let shortBase=randInt(rng, 2, longBase-1);
            let key=(longBase+shortBase)*height/2;
            correct=String(key);
            latex=`A trapezoid has parallel sides of length \\( ${longBase} \\) and \\( ${shortBase} \\) and a perpendicular height of \\( ${height} \\). What is its area?`;
            choices=numberOptions(key, [(longBase+shortBase)*height, longBase*shortBase, (longBase-shortBase)*height, longBase+shortBase+height]);
            rungs=[
                "A trapezoid's area is the average of the two parallel sides times the height, which is half their sum times the height. Using one of the parallel sides twice gives a wrong answer unless the trapezoid is a rectangle.",
                `Add the two parallel sides, ${longBase} and ${shortBase}, halve the sum, then multiply by the height ${height}.`
            ];
            steps=[
                `The parallel sides are ${longBase} and ${shortBase}, and the height is ${height}.`,
                `Area = (${longBase} + ${shortBase}) / 2 x ${height} = ${(longBase+shortBase)/2} x ${height}.`,
                `${(longBase+shortBase)/2} x ${height} = ${key}, so the area is ${correct} square units.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}