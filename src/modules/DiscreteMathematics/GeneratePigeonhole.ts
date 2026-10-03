/**
 * @file The pigeonhole principle and the counts that go with it.
 * @description The principle is one sentence and has two very different uses, so
 * this file splits them. Three branches ask for a threshold: the smallest number
 * of pigeons that forces an occupancy, the smallest number of socks that forces
 * a matching pair, and the ceiling of the average. One branch asks for a count,
 * because "how many ways force a collision" is an exact integer and not a
 * ceiling at all.
 *
 * Every threshold here is built so the case it claims exists actually holds: the
 * number of boxes is at least the occupancy being forced, and the number of
 * items is at least the number of boxes plus one, so the ceiling is never the
 * trivial answer one and the construction is not vacuous.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt}from"../shared/Random";
import{numberOptions}from"../shared/Options.js";
import{nPr}from"./DiscreteUtils.js";

export function generatePigeonhole(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["into_the_pigeons","at_least_two","general_form","constructive_count"];
    let type=types[Math.floor(rng()*types.length)];
    let cap=difficulty==="easy"?3:difficulty==="hard"?5:4;
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "into_the_pigeons":{
            // At most t-1 pigeons in every hole gives m(t-1) pigeons with no hole
            // holding t, so one more than t(m-1) forces it. The occupancy t is
            // capped at the number of holes, because t greater than the number of
            // holes can never be reached and the question would have no answer.
            let holes=randInt(rng, 3, cap+2);
            let perHole=randInt(rng, 2, holes);
            let value=perHole*(holes-1)+1;
            correct=String(value);
            alternate=correct;
            display=`${perHole} \\times (${holes} - 1) + 1 = ${value}`;
            latex=`Pigeons are placed one at a time into \\( ${holes} \\) pigeonholes. What is the smallest number of pigeons that must be placed before some pigeonhole is certain to hold at least \\( ${perHole} \\) of them?`;
            choices=numberOptions(value, [perHole*holes, perHole*(holes-1), value+1, value-1, holes*(perHole-1)+1, holes+perHole]);
            steps=[
                `To avoid any hole holding ${perHole} pigeons, every one of the ${holes} holes may hold at most ${perHole-1}.`,
                `That allows ${holes} \\times ${perHole-1} = ${holes*(perHole-1)} pigeons with nothing forced, so one more than that is the threshold: ${holes*(perHole-1)} + 1 = ${value}.`,
                `The answer is ${value}, which is \\( ${perHole}(${holes}-1)+1 \\).`
            ];
            rungs=[
                "Work out how many pigeons can be placed with nothing forced: every hole may hold one fewer than the occupancy you want, and then one more pigeon forces it.",
                `There are ${holes} holes, so ${holes} \\times ${perHole-1} = ${holes*(perHole-1)} pigeons can be placed without any hole holding ${perHole}; add one.`
            ];
            break;
        }
        case "at_least_two":{
            // One sock of each color can always be drawn without a pair, so the
            // next sock forces one. The number of socks of each color is stated
            // because a color with one sock would make the pair impossible.
            let colors=randInt(rng, 3, cap+2);
            let socks=randInt(rng, colors*2+2, colors*2+6);
            let value=colors+1;
            correct=String(value);
            alternate=correct;
            display=`${colors} + 1 = ${value}`;
            latex=`A drawer holds \\( ${socks} \\) socks in \\( ${colors} \\) distinct colors, with at least two socks of every color. How many socks must be taken out, without looking, to be certain of a matching pair?`;
            choices=numberOptions(value, [colors, value+1, 2, socks, colors*2]);
            steps=[
                `It is possible to draw one sock of each of the ${colors} colors and still have no pair, which is ${colors} socks.`,
                `The next sock has to repeat one of those colors, so the ${colors} + 1 = ${value}-th sock forces a pair.`,
                `The answer is ${value}.`
            ];
            rungs=[
                "Ask what is the most you can draw and still have no match: that is one of each color, and the sock after that forces a pair.",
                `There are ${colors} colors, so ${colors} socks can all be different and ${colors} + 1 forces a repeat.`
            ];
            break;
        }
        case "general_form":{
            // The ceiling of the average. At least one box holds at least the
            // average rounded up, and one fewer than the ceiling can still be
            // spread out, so the ceiling is the sharp answer.
            let boxes=randInt(rng, 2, cap);
            let items=randInt(rng, boxes+1, boxes*3);
            let value=Math.ceil(items/boxes);
            let below=Math.floor(items/boxes);
            let leftover=items-boxes*below;
            correct=String(value);
            alternate=correct;
            display=`\\left\\lceil ${items} / ${boxes} \\right\\rceil = ${value}`;
            latex=`\\( ${items} \\) items are placed into \\( ${boxes} \\) boxes. What is the smallest whole number \\( L \\) such that some box is certain to hold at least \\( L \\) items?`;
            choices=numberOptions(value, [below, below+1, items-boxes, boxes, items]);
            steps=[
                `Spreading the ${items} items over the ${boxes} boxes as evenly as possible leaves every box holding ${below} items and puts ${leftover} item${leftover===1?"":"s"} left over.`,
                leftover===0?
                    `Because the items divide exactly, the boxes can be filled evenly and no box has to hold more, so the guaranteed occupancy is exactly ${below}.`
                    : `Those ${leftover} leftover item${leftover===1?" has":"s have"} to go somewhere, so one box must hold an extra one and the guaranteed occupancy is ${below} + 1 = ${value}.`,
                `That is \\( \\lceil ${items}/${boxes} \\rceil = ${value} \\), so the answer is ${value}.`
            ];
            rungs=[
                "The guaranteed occupancy is the average occupancy rounded up, because the items cannot always be spread perfectly evenly.",
                `The average is ${items}/${boxes}, and a box holding one more than the rounded-down average is forced by the leftovers.`
            ];
            break;
        }
        case "constructive_count":{
            // A count, not a ceiling: every placement is one of k^n, and the
            // placements with no collision at all are the ones that put the n
            // items on n different shelves, which is P(k, n).
            let shelves=randInt(rng, 3, cap+2);
            let books=randInt(rng, 2, Math.min(4, shelves));
            let total=Math.pow(shelves, books);
            let collisionFree=nPr(shelves, books);
            let value=total-collisionFree;
            correct=String(value);
            alternate=correct;
            display=`${shelves}^{${books}} - ${shelves}\\times${shelves-1}\\times\\cdots = ${value}`;
            latex=`In how many ways can \\( ${books} \\) distinct books be placed on \\( ${shelves} \\) distinct shelves if at least one shelf holds two or more of them?`;
            choices=numberOptions(value, [total, collisionFree, total-Math.pow(shelves, books-1), Math.pow(shelves, books-1), total-books]);
            steps=[
                `Unrestricted, each of the ${books} books has ${shelves} shelves to go on, so there are ${shelves}^{${books}} = ${total} placements.`,
                `The placements with no shelf holding two books are the ones that use ${books} different shelves, which is ${shelves}\\times${shelves-1}\\times\\cdots = ${collisionFree}.`,
                `Subtracting: ${total} - ${collisionFree} = ${value} placements have at least one shelf holding two or more books, so the answer is ${value}.`
            ];
            rungs=[
                "Count every placement first and then remove the ones that do not have the property you were asked for, which here means removing the placements with no collision at all.",
                `There are ${shelves}^{${books}} = ${total} unrestricted placements, and the collision-free ones number ${collisionFree}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices, expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
