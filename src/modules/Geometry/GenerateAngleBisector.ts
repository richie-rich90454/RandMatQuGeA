/**
 * @file Angle bisectors, the perpendicular bisector, and equidistant points.
 * @description The angle bisector of an angle divides the opposite side in the ratio
 * of the two sides that form the angle, which makes the split a two-term ratio
 * rather than a midpoint. The bisector's own length has a square root in it, so
 * that branch is built from a table of isosceles triangles whose bisector length is
 * a whole number: the bisector from the apex of an isosceles triangle is also its
 * altitude, so the length is the leg of a right triangle with half the base.
 *
 * The perpendicular bisector and the locus of equidistant points are the same fact
 * stated in two ways, so the two branches separate them: one asks what the line
 * itself is, the other asks for a length computed from it.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt, pick}from"../shared/Random";

/**
 * Isosceles triangles with the two equal legs first, the base second, and the length
 * of the bisector from the apex third. The third column is what makes the branch
 * exact rather than a square root a learner has to round.
 */
let ISOSCELES: number[][]=[
    [5, 6, 4],
    [5, 8, 3],
    [10, 12, 8],
    [10, 16, 6],
    [13, 10, 12],
    [13, 24, 5],
    [15, 18, 12],
    [17, 16, 15],
    [20, 24, 16],
    [25, 14, 24],
    [25, 48, 7],
    [29, 40, 21]
];

/**
 * Pythagorean triples with half a segment first, a perpendicular displacement
 * second and the distance from the segment's endpoint third. That third column is
 * the distance from a point on the perpendicular bisector to either endpoint.
 */
let OFFSET: number[][]=[
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
    [9, 40, 41],
    [24, 32, 40]
];

export function generateAngleBisector(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["bisector_length", "how_it_splits_the_opposite_side", "perpendicular_bisector", "equidistant_points"];
    let type=types[Math.floor(rng()*types.length)];
    let scaleMax=difficulty==="easy"?1:difficulty==="hard"?2:1;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "bisector_length":{
            let row=pick(rng, ISOSCELES);
            let scale=randInt(rng, 1, scaleMax);
            let leg=row[0]*scale;
            let base=row[1]*scale;
            let key=row[2]*scale;
            let half=base/2;
            let radicand=leg*leg-half*half;
            correct=String(key);
            latex=`Triangle \\( ABC \\) is isosceles with \\( AB = AC = ${leg} \\) and base \\( BC = ${base} \\). How long is the bisector of the angle \\( BAC \\)?`;
            choices=numberOptions(key, [leg, base, half, leg-1, leg+1]);
            rungs=[
                "In an isosceles triangle the bisector from the apex is also the altitude and the median, so it lands on the midpoint of the base and you have a right triangle to work in.",
                `The bisector splits the base of length ${base} into two halves, so the right triangle has legs ${half} and a hypotenuse of ${leg}.`
            ];
            steps=[
                `The bisector of the apex angle of an isosceles triangle bisects the base, so it reaches the midpoint of BC.`,
                `That gives a right triangle with hypotenuse ${leg} and one leg ${half}, and the bisector is its other leg.`,
                `It is the square root of ${leg} x ${leg} - ${half} x ${half} = ${radicand}, which is ${key}, so the bisector is ${correct}.`
            ];
            break;
        }
        case "how_it_splits_the_opposite_side":{
            let first=randInt(rng, 1, difficulty==="easy"?4:6);
            let second=randInt(rng, 1, difficulty==="easy"?4:6);
            if (second===first) second=first+1;
            let unit=randInt(rng, 2, difficulty==="easy"?5:9);
            let key=first*unit;
            let whole=(first+second)*unit;
            correct=String(key);
            latex=`In triangle \\( ABC \\) the bisector of the angle \\( A \\) meets \\( BC \\) at \\( D \\). The sides \\( AB \\) and \\( AC \\) are in the ratio \\( ${first} : ${second} \\), and \\( BC = ${whole} \\). What is the length of \\( BD \\)?`;
            choices=numberOptions(key, [second*unit, whole/2, whole-key, key+1, key-1]);
            rungs=[
                "The angle bisector theorem says the opposite side is split in the ratio of the two sides that form the angle, so BD and DC stand to each other as AB stands to AC.",
                `AB : AC = ${first} : ${second} and BC = ${whole}, so BC is made of ${first+second} parts of ${unit} each.`
            ];
            steps=[
                `The ratio BD : DC is the same as AB : AC, which is ${first} : ${second}.`,
                `So BC = ${whole} is divided into ${first+second} equal parts of ${whole}/${first+second} = ${unit} each.`,
                `BD takes ${first} of those parts, so BD = ${first} x ${unit} = ${key}.`
            ];
            break;
        }
        case "perpendicular_bisector":{
            correct="It passes through the midpoint of AB and is perpendicular to AB";
            latex=`Let \\( l \\) be the perpendicular bisector of the segment \\( AB \\). Which statement about \\( l \\) is true?`;
            choices=fourOptions(correct, [
                "It passes through both A and B and is perpendicular to AB",
                "It is the line through A perpendicular to AB",
                "It passes through the midpoint of AB and is parallel to AB"
            ]);
            expectedFormat="Choose the statement that is true";
            rungs=[
                "The name gives the definition: the bisector cuts the segment in half at its midpoint, and perpendicular means at a right angle to it.",
                "A segment has exactly one midpoint, and the line through it at a right angle to the segment is the perpendicular bisector."
            ];
            steps=[
                `A bisector of a segment passes through its midpoint, so l passes through the midpoint of AB.`,
                `A perpendicular bisector meets the segment at a right angle, so l is at 90 degrees to AB.`,
                `So the statement that is true is ${correct}.`
            ];
            break;
        }
        case "equidistant_points":{
            let row=pick(rng, OFFSET);
            let scale=randInt(rng, 1, scaleMax);
            let half=row[0]*scale;
            let offset=row[1]*scale;
            let key=row[2]*scale;
            let segment=2*half;
            correct=String(key);
            latex=`Segment \\( AB \\) has length \\( ${segment} \\), and \\( M \\) is its midpoint. A point \\( P \\) lies on the perpendicular bisector of \\( AB \\), so \\( PM \\) is perpendicular to \\( AB \\) and \\( PM = ${offset} \\). What is the length of \\( PA \\)?`;
            choices=numberOptions(key, [offset, half, half+offset, key+1, key-1]);
            rungs=[
                "A point on the perpendicular bisector is the apex of a right triangle whose base is half the segment and whose height is the perpendicular displacement, so the distance asked for is the hypotenuse.",
                `Half of AB is ${half} and the perpendicular distance is ${offset}, so the hypotenuse is the square root of ${half} x ${half} + ${offset} x ${offset}.`
            ];
            steps=[
                `The midpoint M splits AB, so AM = ${segment} / 2 = ${half}.`,
                `Triangle AMP is right-angled at M, with AM = ${half} and PM = ${offset}.`,
                `PA = the square root of ${half} x ${half} + ${offset} x ${offset} = ${half*half + offset*offset}, which is ${key}, so PA = ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}