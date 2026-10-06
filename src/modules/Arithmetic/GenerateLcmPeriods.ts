/**
 * @file Least common multiples read as periods: two cycles, three cycles, and a
 * schedule that comes round again.
 * @description A repeated event comes round again at the least common multiple of
 * its periods, so the topic is really about reading an lcm out of a story. Every
 * value here is an exact integer: the least common multiple is accumulated as
 * (a / gcd) * b rather than as the product divided by the gcd, because the division
 * is the only step in the whole calculation that can introduce a fraction, and the
 * product first makes it an exact integer every time.
 *
 * The word branch is the only one here whose answer could be either of two
 * quantities, so its prompt names which one is wanted. A ribbon question that does
 * not say whether it wants the common divisor or the common multiple has two
 * answers under one sentence.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

/**
 * The greatest common divisor of two whole numbers, by repeated remainders. The
 * loop is bounded because a zero divisor would otherwise never terminate, and a
 * divisor drawn in this file is never zero.
 *
 * @param a - The first value.
 * @param b - The second value.
 * @returns The greatest common divisor.
 */
function gcdOf(a: number, b: number): number{
    let x=Math.abs(a);
    let y=Math.abs(b);
    let guard=0;
    while (y!==0&&guard<64){
        let t=x%y;
        x=y;
        y=t;
        guard++;
    }
    return x;
}

/**
 * The least common multiple of two whole numbers, accumulated as a multiple of one
 * of them so that the division by the common divisor leaves a whole number.
 *
 * @param a - The first value.
 * @param b - The second value.
 * @returns The least common multiple.
 */
function lcmOf(a: number, b: number): number{
    let common=gcdOf(a, b);
    if (common===0) return 0;
    return (Math.abs(a)/common)*Math.abs(b);
}

/**
 * The greatest common divisor of a list of whole numbers.
 *
 * @param values - The values.
 * @returns The greatest common divisor of all of them.
 */
function gcdOfAll(values: number[]): number{
    let running=0;
    for(let value of values) running=gcdOf(running, value);
    return running;
}

/**
 * Draws two whole numbers that share a factor of more than one, differ by at least
 * two multiples of it, and are large enough that the product, the sum and the
 * difference are all different values from the common divisor and from each other.
 * Without those three conditions the word branch can offer a distractor that is
 * another name for the answer.
 *
 * @param rng - The injected random source.
 * @param commonMax - The largest common factor to use.
 * @returns The common factor and the two multipliers.
 */
function drawWordPair(rng: RngFn, commonMax: number): {common: number, first: number, second: number}{
    for(let attempt=0; attempt<128; attempt++){
        let common=randInt(rng, 2, commonMax);
        let first=randInt(rng, 2, 9);
        let second=randInt(rng, 2, 9);
        if (Math.abs(first-second)<2) continue;
        if (gcdOf(first, second)!==1) continue;
        return {common, first: common*first, second: common*second};
    }
    return {common:2, first:8, second:14};
}

export function generateLcmPeriods(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["lcm_of_two","lcm_of_three","common_schedule","lcm_and_gcd_word"];
    let type=types[Math.floor(rng()*types.length)];
    let valueMax=difficulty==="hard"?120:difficulty==="easy"?24:60;
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "lcm_of_two":{
            let first=randInt(rng, 4, valueMax);
            let second=randInt(rng, 4, valueMax);
            if (first===second) second=first+1;
            let common=gcdOf(first, second);
            let value=lcmOf(first, second);
            key=value;
            latex=`Find the least common multiple of \\( ${first} \\) and \\( ${second} \\).`;
            wrong=[first*second, common, first+second, value+1];
            rungs=[
                "The least common multiple is the smallest whole number that is a multiple of both, and multiplying straight through gives a common multiple that is usually far too big.",
                `Reduce the ratio ${first} : ${second} to lowest terms, then multiply back up.`
            ];
            steps=[
                `The greatest common divisor of ${first} and ${second} is ${common}, and ${common} x ${value} = ${first*second}, which confirms it.`,
                `${first} / ${common} = ${first/common} and ${second} / ${common} = ${second/common}.`,
                `${first/common} x ${second} = ${value}`
            ];
            break;
        }
        case "lcm_of_three":{
            // Three numbers are handled by taking the least common multiple of the
            // first two and then of that with the third, which is the same answer
            // and a shorter chain of work than prime factorising all three.
            let values=[randInt(rng, 3, Math.floor(valueMax*0.7)), randInt(rng, 3, Math.floor(valueMax*0.7)), randInt(rng, 3, Math.floor(valueMax*0.7))];
            let stageOne=lcmOf(values[0] as number, values[1] as number);
            let value=lcmOf(stageOne, values[2] as number);
            key=value;
            latex=`Find the least common multiple of \\( ${values[0]} \\), \\( ${values[1]} \\) and \\( ${values[2]} \\).`;
            let product=values[0]*values[1]*(values[2] as number);
            wrong=[product, gcdOfAll(values), value+1, stageOne];
            rungs=[
                "With three numbers, take the least common multiple of the first two and then of that with the third, rather than multiplying all three together.",
                `Start with ${values[0]} and ${values[1]}, and carry the result into ${values[2]}.`
            ];
            steps=[
                `The least common multiple of ${values[0]} and ${values[1]} is ${stageOne}.`,
                `The least common multiple of ${stageOne} and ${values[2]} is ${value}.`,
                `So the least common multiple of all three is ${key}`
            ];
            break;
        }
        case "common_schedule":{
            let first=randInt(rng, 3, difficulty==="hard"?45:20);
            let second=randInt(rng, 3, difficulty==="hard"?45:20);
            if (first===second) second=first+1;
            let common=gcdOf(first, second);
            let value=lcmOf(first, second);
            key=value;
            latex=`One siren sounds every \\( ${first} \\) minutes and another every \\( ${second} \\) minutes. They sound together now. After how many minutes will they next sound together?`;
            wrong=[first*second, common, first+second, value+1];
            rungs=[
                "Two cycles that both start together come back together at the first time that is a whole number of both periods, which is the least common multiple of the two.",
                `Look for the smallest number of minutes that is a multiple of ${first} and also of ${second}.`
            ];
            steps=[
                `${value} / ${first} = ${value/first} whole periods of ${first} minutes, and ${value} / ${second} = ${value/second} whole periods of ${second} minutes.`,
                `No smaller number of minutes is a whole number of both, so the two do not meet earlier.`,
                `They next sound together after ${key}`
            ];
            break;
        }
        case "lcm_and_gcd_word":{
            let wantMultiple=randInt(rng, 0, 1)===0;
            let pair=drawWordPair(rng, difficulty==="easy"?6:difficulty==="hard"?14:9);
            let first=pair.first;
            let second=pair.second;
            let common=gcdOf(first, second);
            let value=wantMultiple?lcmOf(first, second):common;
            key=value;
            latex=wantMultiple?
                `A ribbon of \\( ${first} \\) cm and a ribbon of \\( ${second} \\) cm are cut into pieces of equal length, with nothing left over from either ribbon. What is the shortest length that every piece can have?`:
                `A ribbon of \\( ${first} \\) cm and a ribbon of \\( ${second} \\) cm are both cut into squares of one side length, with nothing left over. What is the largest side length that works for both?`;
            wrong=[wantMultiple?common:lcmOf(first, second), first*second, first+second, Math.abs(first-second)];
            rungs=[
                wantMultiple?
                    "The shortest piece length that leaves nothing over from both ribbons is the smallest number that is a multiple of both lengths, which is the least common multiple.":
                    "The largest square that cuts both ribbons exactly is the biggest number that divides both lengths, which is the greatest common divisor.",
                `Compare ${first} and ${second} by finding what divides both of them exactly.`
            ];
            steps=[
                `The greatest common divisor of ${first} and ${second} is ${common}.`,
                `${first} / ${common} = ${first/common} and ${second} / ${common} = ${second/common}.`,
                wantMultiple?
                    `The least common multiple is ${first/common} x ${second} = ${value}, and that is the length both ribbons can be cut to.`:
                    `A side length that cuts both ribbons exactly is the common factor of the two lengths.`,
                wantMultiple?`The shortest piece length in centimeters is ${key}`:`The largest side length in centimeters is ${key}`
            ];
            break;
        }
    }
    let keyText=String(key);
    return {latex, correct:keyText, alternate:keyText, display:keyText, choices:numberOptions(key, wrong, 0), expectedFormat:"Enter a whole number", subskill:type, hints:{rungs, concede:"The answer is "+keyText+"."}, solution: steps};
}
