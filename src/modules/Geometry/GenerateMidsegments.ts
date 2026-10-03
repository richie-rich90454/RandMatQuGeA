/**
 * @file Midsegments: the segment joining two midpoints of a triangle, and the
 * medial triangle the three such segments enclose.
 * @description One fact carries the whole topic: the segment joining the midpoints
 * of two sides of a triangle is parallel to the third side and half as long as it.
 * Everything else here follows from it, including the two ratios a learner is most
 * often asked for, that the medial triangle has half the perimeter of the original
 * and a quarter of its area.
 *
 * The side lengths are drawn on a grid of four so that the half-perimeter and the
 * quarter-area branches divide exactly and the keys stay whole numbers.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

/**
 * Draws a triangle whose sides are all multiples of four and which satisfies the
 * strict inequality, so that halving, quartering and summing all divide exactly.
 *
 * @param rng - The injected random source.
 * @param spread - The largest multiple of four allowed for a side.
 * @returns Three side lengths forming a triangle.
 */
function triple(rng: RngFn, spread: number): [number, number, number]{
    for(let attempt=0; attempt<64; attempt++){
        let a=4*randInt(rng, 1, Math.max(1, Math.floor(spread/4)));
        let b=4*randInt(rng, 1, Math.max(1, Math.floor(spread/4)));
        let c=4*randInt(rng, 1, Math.max(1, Math.floor(spread/4)));
        if (a+b>c&&a+c>b&&b+c>a) return [a, b, c];
    }
    return [8, 12, 12];
}

export function generateMidsegments(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["midsegment_length", "the_parallel_line", "perimeter_ratio", "the_medial_triangle"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?20:difficulty==="hard"?72:40;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "midsegment_length":{
            let sides=triple(rng, spread);
            let key=sides[0]/2;
            correct=String(key);
            latex=`In triangle \\( ABC \\), \\( AB = ${sides[0]} \\), \\( BC = ${sides[1]} \\) and \\( CA = ${sides[2]} \\). The points \\( D \\) and \\( E \\) are the midpoints of \\( AB \\) and \\( AC \\). How long is the midsegment \\( DE \\)?`;
            choices=numberOptions(key, [sides[0], sides[1]/2, sides[2]/2, key+1, (sides[0]+sides[1])/2]);
            rungs=[
                "The segment joining the midpoints of two sides of a triangle is parallel to the third side and half as long as it, so the third side is the one to halve.",
                `The two midpoints are on AB and AC, so the midsegment DE is parallel to BC, the side of length ${sides[1]}.`
            ];
            steps=[
                `The midsegment joins the midpoints of AB and AC, so it is parallel to and half the length of BC.`,
                `BC = ${sides[1]}, so the midsegment is ${sides[1]} / 2.`,
                `${sides[1]} / 2 = ${key}, so the midsegment is ${correct}.`
            ];
            break;
        }
        case "the_parallel_line":{
            correct="It is parallel to the third side and half as long as that side";
            latex=`In triangle \\( ABC \\), the points \\( D \\) and \\( E \\) are the midpoints of \\( AB \\) and \\( AC \\). Which statement about the segment \\( DE \\) is true?`;
            choices=fourOptions(correct, [
                "It is parallel to the third side and the same length as that side",
                "It is perpendicular to the third side and half as long as that side",
                "It is parallel to the median from A and the same length as the third side"
            ]);
            expectedFormat="Choose the statement that is true";
            rungs=[
                "A midsegment is both parallel to one side and half as long as it, and the side in question is the one that does not have an endpoint on the midsegment.",
                "The midpoints are on AB and AC, so the side to compare with is BC."
            ];
            steps=[
                `The midpoints lie on AB and AC, so the remaining side is BC.`,
                `The segment DE is parallel to BC and DE = BC / 2.`,
                `So DE is parallel to the third side and half as long as that side, which is the statement ${correct}.`
            ];
            break;
        }
        case "perimeter_ratio":{
            let sides=triple(rng, spread);
            let perimeter=sides[0]+sides[1]+sides[2];
            let key=perimeter/2;
            correct=String(key);
            latex=`Triangle \\( ABC \\) has \\( AB = ${sides[0]} \\), \\( BC = ${sides[1]} \\) and \\( CA = ${sides[2]} \\). The midpoints of its three sides are joined to form the medial triangle. What is the perimeter of the medial triangle?`;
            choices=numberOptions(key, [perimeter, perimeter/4, 3*perimeter/4, key+1, key-1]);
            rungs=[
                "Each side of the medial triangle is half of one side of the original, so the three of them add up to half the original perimeter.",
                `The original perimeter is ${sides[0]} + ${sides[1]} + ${sides[2]}, and the medial triangle's three sides are halves of those three numbers.`
            ];
            steps=[
                `The perimeter of ABC is ${sides[0]} + ${sides[1]} + ${sides[2]} = ${perimeter}.`,
                `The medial triangle's sides are ${sides[0]/2}, ${sides[1]/2} and ${sides[2]/2}, each half of one side of ABC.`,
                `${sides[0]/2} + ${sides[1]/2} + ${sides[2]/2} = ${key}, so the perimeter of the medial triangle is ${correct}.`
            ];
            break;
        }
        case "the_medial_triangle":{
            // Base and height are multiples of four, so the area is a multiple of
            // eight and a quarter of it is still a whole number.
            let base=4*randInt(rng, 2, Math.max(2, Math.floor(spread/4)));
            let height=4*randInt(rng, 1, Math.max(2, Math.floor(spread/8)));
            let area=base*height/2;
            let key=area/4;
            correct=String(key);
            latex=`Triangle \\( ABC \\) has a base of length \\( ${base} \\) and a perpendicular height of \\( ${height} \\), so its area is \\( ${area} \\) square units. The three midpoints of its sides are joined to form the medial triangle. What is the area of the medial triangle?`;
            choices=numberOptions(key, [area, area/2, 2*area, 3*area/4, area/8]);
            rungs=[
                "The medial triangle's sides are each half of a side of the original and its angles are the original's, so it is similar with scale factor one half, and area scales with the square of the scale factor.",
                `Each side of the medial triangle is half a side of the original, so the scale factor is 1/2 and the area factor is (1/2)^2 = 1/4 of ${area}.`
            ];
            steps=[
                `Triangle ABC has area ${base} x ${height} / 2 = ${area}.`,
                `The medial triangle is similar to ABC with every side halved, so its area is scaled by 1/2 squared.`,
                `${area} / 4 = ${key}, so the area of the medial triangle is ${correct} square units.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}