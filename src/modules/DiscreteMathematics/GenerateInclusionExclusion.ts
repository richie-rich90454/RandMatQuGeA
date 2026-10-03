/**
 * @file Counting a union with inclusion and exclusion.
 * @description The two-set form adds the sizes and subtracts the overlap once,
 * because the overlap was counted twice. The three-set form subtracts all three
 * pairwise overlaps, which has then subtracted the triple overlap three times
 * when it should have been subtracted twice, so it is added back. Every quantity
 * printed here is derived from the same seven disjoint regions, which is what
 * makes the printed figures and the graded count the same problem: a pair of
 * cardinalities that no set could realize would leave the learner with numbers
 * to work on and no question they could answer.
 *
 * `counting_neither` is the complement of a union and its most common wrong
 * answer is the union itself, so that number is offered as a distractor rather
 * than left out.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt}from"../shared/Random";
import{numberOptions}from"../shared/Options.js";

/**
 * The seven disjoint regions of three sets, drawn with every region non-empty.
 *
 * A region of zero is what makes a three-set inclusion-exclusion question
 * unanswerable in practice: one of the printed overlaps then equals another one,
 * the learner cannot tell which term is which, and two of the offered counts can
 * collide. Forcing every region non-empty removes all three at once.
 *
 * @param cap - The largest a region may be.
 * @param rng - The injected random source.
 * @returns The regions in the order only-A, only-B, only-C, AB, AC, BC, ABC.
 */
function sevenRegions(cap: number, rng: RngFn): number[]{
    let regions: number[]=[];
    for (let index=0; index<7; index++) regions.push(randInt(rng, 1, cap));
    return regions;
}

/**
 * Every cardinality three sets can be written from their regions.
 *
 * @param regions - The seven disjoint region sizes.
 * @returns The sizes of the three sets, the three pairwise overlaps, the triple
 *          overlap and the union.
 */
function threeCardinalities(regions: number[]): {a: number, b: number, c: number, ab: number, ac: number, bc: number, abc: number, union: number}{
    let [onlyA, onlyB, onlyC, ab, ac, bc, abc]=regions;
    return {
        a: onlyA+ab+ac+abc,
        b: onlyB+ab+bc+abc,
        c: onlyC+ac+bc+abc,
        ab: ab+abc,
        ac: ac+abc,
        bc: bc+abc,
        abc,
        union: onlyA+onlyB+onlyC+ab+ac+bc+abc
    };
}

export function generateInclusionExclusion(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["two_sets","three_sets","counting_neither","a_word_problem"];
    let type=types[Math.floor(rng()*types.length)];
    let cap=difficulty==="easy"?2:difficulty==="hard"?4:3;
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "two_sets":{
            let onlyA=randInt(rng, 1, cap);
            let both=randInt(rng, 1, cap);
            let onlyB=randInt(rng, 1, cap);
            let sizeA=onlyA+both;
            let sizeB=both+onlyB;
            let union=onlyA+both+onlyB;
            correct=String(union);
            alternate=correct;
            display=`${sizeA} + ${sizeB} - ${both} = ${union}`;
            latex=`A club has \\( ${sizeA} \\) members in its chess section and \\( ${sizeB} \\) members in its drama section, and \\( ${both} \\) members are in both sections. How many distinct members are in at least one of the two sections?`;
            choices=numberOptions(union, [sizeA+sizeB, sizeA, sizeB, union+both, union-both, sizeA*sizeB]);
            steps=[
                `Adding the two section sizes gives ${sizeA} + ${sizeB} = ${sizeA+sizeB}, which counts the ${both} members in both sections twice.`,
                `Inclusion and exclusion subtracts the overlap once: ${sizeA+sizeB} - ${both} = ${union}.`,
                `So ${union} distinct members are in at least one of the two sections, and the answer is ${union}.`
            ];
            rungs=[
                "Inclusion and exclusion for two sets: add the two sizes and subtract the overlap, because the overlap was counted once in each size.",
                `Use ${sizeA}, ${sizeB} and ${both}: the union is ${sizeA} + ${sizeB} - ${both}.`
            ];
            break;
        }
        case "three_sets":{
            let card=threeCardinalities(sevenRegions(cap, rng));
            let naive=card.a+card.b+card.c;
            let pairwiseOnly=naive-card.ab-card.ac-card.bc;
            correct=String(card.union);
            alternate=correct;
            display=`${card.a} + ${card.b} + ${card.c} - ${card.ab} - ${card.ac} - ${card.bc} + ${card.abc} = ${card.union}`;
            latex=`Three sets have sizes \\( |A| = ${card.a} \\), \\( |B| = ${card.b} \\), \\( |C| = ${card.c} \\), pairwise overlaps \\( |A \\cap B| = ${card.ab} \\), \\( |A \\cap C| = ${card.ac} \\), \\( |B \\cap C| = ${card.bc} \\), and a triple overlap of \\( |A \\cap B \\cap C| = ${card.abc} \\). How many elements are in \\( A \\cup B \\cup C \\)?`;
            choices=numberOptions(card.union, [naive, pairwiseOnly, card.union+card.abc, card.union-card.abc, naive-card.abc, card.a+card.b]);
            steps=[
                `Adding the three sizes gives ${card.a} + ${card.b} + ${card.c} = ${naive}.`,
                `Every element in exactly two sets was counted twice, so subtract the three pairwise overlaps: ${naive} - ${card.ab} - ${card.ac} - ${card.bc} = ${pairwiseOnly}. That has subtracted the triple overlap ${card.abc} three times when it should be subtracted twice, so add it back once.`,
                `${pairwiseOnly} + ${card.abc} = ${card.union}, so the union has ${card.union} elements.`
            ];
            rungs=[
                "For three sets, add the three sizes, subtract all three pairwise overlaps, then add the triple overlap back once: the triple overlap was subtracted three times and needs to be subtracted twice.",
                `Use ${card.a}, ${card.b}, ${card.c}, the overlaps ${card.ab}, ${card.ac}, ${card.bc} and the triple overlap ${card.abc}.`
            ];
            break;
        }
        case "counting_neither":{
            let onlyA=randInt(rng, 1, cap);
            let both=randInt(rng, 1, cap);
            let onlyB=randInt(rng, 1, cap);
            let neither=randInt(rng, 1, cap);
            let sizeA=onlyA+both;
            let sizeB=both+onlyB;
            let union=onlyA+both+onlyB;
            let universe=union+neither;
            correct=String(neither);
            alternate=correct;
            display=`${universe} - (${sizeA} + ${sizeB} - ${both}) = ${neither}`;
            latex=`A group of \\( ${universe} \\) people is surveyed. Of them, \\( ${sizeA} \\) take the bus to work, \\( ${sizeB} \\) cycle, and \\( ${both} \\) do both. How many neither take the bus nor cycle?`;
            choices=numberOptions(neither, [union, universe, sizeA+sizeB, universe-sizeA, universe-sizeB, union+both]);
            steps=[
                `The union is ${sizeA} + ${sizeB} - ${both} = ${union}, because the ${both} who do both were counted twice in the first two numbers.`,
                `"Neither" is the complement of that union inside the group of ${universe}: ${universe} - ${union} = ${neither}.`,
                `So ${neither} people neither take the bus nor cycle, and the answer is ${neither}.`
            ];
            rungs=[
                "\"Neither\" is the complement of the union, so find the union first and then subtract it from the size of the whole group.",
                `The union is ${sizeA} + ${sizeB} - ${both} = ${union}, and the group has ${universe} people in it.`
            ];
            break;
        }
        case "a_word_problem":{
            let card=threeCardinalities(sevenRegions(cap, rng));
            let naive=card.a+card.b+card.c;
            let pairwiseOnly=naive-card.ab-card.ac-card.bc;
            correct=String(card.union);
            alternate=correct;
            display=`${card.a} + ${card.b} + ${card.c} - ${card.ab} - ${card.ac} - ${card.bc} + ${card.abc} = ${card.union}`;
            latex=`A school runs three clubs. ${card.a} students play chess, ${card.b} play music and ${card.c} play drama; ${card.ab} play chess and music, ${card.ac} play chess and drama, ${card.bc} play music and drama, and ${card.abc} play all three. How many students are on at least one club?`;
            choices=numberOptions(card.union, [naive, pairwiseOnly, card.union+card.abc, card.union-card.abc, naive-card.abc, card.a+card.b]);
            steps=[
                `Adding the three club sizes gives ${card.a} + ${card.b} + ${card.c} = ${naive}.`,
                `A student on exactly two clubs was counted twice, so subtract the three pairwise counts: ${naive} - ${card.ab} - ${card.ac} - ${card.bc} = ${pairwiseOnly}. The ${card.abc} on all three have now been subtracted three times instead of twice, so add them back once.`,
                `${pairwiseOnly} + ${card.abc} = ${card.union}, so ${card.union} students are on at least one club.`
            ];
            rungs=[
                "Counting students on at least one of three clubs is the three-set union: add the three sizes, subtract the three pairwise overlaps, then add the triple overlap back once.",
                `Use the club sizes ${card.a}, ${card.b}, ${card.c}, the pairwise counts ${card.ab}, ${card.ac}, ${card.bc}, and the ${card.abc} on all three.`
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices, expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
