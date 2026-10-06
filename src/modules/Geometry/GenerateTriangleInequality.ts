/**
 * @file The triangle inequality: which triples of lengths close into a triangle,
 * which side is longest, and what the third side of a partly specified triangle
 * may be.
 * @description The inequality is strict, and the difference between strict and
 * non-strict is the whole content of this topic: a degenerate triple whose two
 * shorter sides sum to exactly the longest has zero area and no interior angles,
 * so it is not a triangle. The failing triples here are therefore built on purpose
 * rather than hoped for, because a random draw produces a degenerate case far too
 * rarely to be worth trusting.
 *
 * Every answer is a whole number. A "greatest possible" side is the sum of the two
 * known sides minus one, not the sum, and the minus one is the strictness.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

/**
 * Draws two different positive lengths, so that "the shorter of the two" and "the
 * difference of the two" are both well defined for every question that uses them.
 *
 * @param rng - The injected random source.
 * @param spread - The largest length allowed.
 * @returns Two distinct positive lengths.
 */
function twoDistinct(rng: RngFn, spread: number): [number, number]{
    for(let attempt=0; attempt<64; attempt++){
        let a=randInt(rng, 2, spread);
        let b=randInt(rng, 2, spread);
        if (a!==b) return [a, b];
    }
    return [3, 5];
}

export function generateTriangleInequality(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["check_a_triple", "the_longest_side", "the_strict_inequality", "can_it_be_built"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?12:difficulty==="hard"?40:24;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "check_a_triple":{
            // The good triple is built first, from two lengths and a third strictly
            // between the longer one and their sum. The other three are then the two
            // ways a triple fails plus one with no length at all, so exactly one of
            // the four options closes.
            let first=randInt(rng, 3, spread);
            let second=randInt(rng, 3, spread);
            let longest=Math.max(first, second);
            let shortest=Math.min(first, second);
            let gap=longest-shortest;
            let good=gap+randInt(rng, 1, Math.max(1, shortest-1));
            if (good<=longest) good=longest+1;
            let degenerate=first+second;
            let impossible=degenerate+randInt(rng, 1, 5);
            let zero=randInt(rng, 3, spread);
            correct=`(${shortest}, ${longest}, ${good})`;
            latex=`Exactly one of these four triples can be the side lengths of a triangle. Which one?`;
            choices=fourOptions(correct, [
                `(${first}, ${second}, ${degenerate})`,
                `(${first}, ${second}, ${impossible})`,
                `(0, ${first}, ${zero})`
            ]);
            expectedFormat="Enter the triple, for example (3, 4, 5)";
            rungs=[
                "The triangle inequality is strict: the sum of the two shorter sides has to be greater than the longest side, and equal is not enough, because a degenerate triple has zero area.",
                `Sort each triple and compare the two shorter with the longest: ${shortest} + ${longest} against ${good}, ${first} + ${second} against ${degenerate}, and the same sum against ${impossible}.`
            ];
            steps=[
                `The candidate triples are (${shortest}, ${longest}, ${good}), (${first}, ${second}, ${degenerate}), (${first}, ${second}, ${impossible}) and (0, ${first}, ${zero}).`,
                `For (${first}, ${second}, ${degenerate}) the two shorter sides sum to exactly the longest, which is a straight line and not a triangle; for (${first}, ${second}, ${impossible}) they sum to less; and a side of length 0 cannot be drawn at all.`,
                `In (${shortest}, ${longest}, ${good}) the two shorter sides sum to ${shortest + longest}, which is greater than ${good}, so ${correct}.`
            ];
            break;
        }
        case "the_longest_side":{
            let pair=twoDistinct(rng, spread);
            let a=pair[0];
            let b=pair[1];
            // The third side is drawn strictly between the difference and the sum,
            // which is exactly the range the triangle inequality allows, so the three
            // lengths always close without a search.
            let gap=Math.abs(a-b);
            let room=2*Math.min(a, b)-1;
            let third=gap+randInt(rng, 1, Math.max(1, room));
            let c=third;
            let key=Math.max(a, Math.max(b, c));
            correct=String(key);
            latex=`A triangle has sides of length \\( ${a} \\), \\( ${b} \\) and \\( ${c} \\). What is the length of its longest side?`;
            choices=numberOptions(key, [a, b, c, a+b, key+1]);
            rungs=[
                "The longest side is simply the greatest of the three lengths, once the three have been shown to close into a triangle.",
                `Compare the three printed lengths, ${a}, ${b} and ${c}, and take the greatest of them.`
            ];
            steps=[
                `The three side lengths are ${a}, ${b} and ${c}.`,
                `They satisfy the strict inequality, because ${gap} is smaller than ${c} and ${c} is smaller than ${a+b}, so these three do close into a triangle.`,
                `The greatest of ${a}, ${b} and ${c} is ${key}, so the longest side is ${correct}.`
            ];
            break;
        }
        case "the_strict_inequality":{
            correct="It must be less than a + b";
            latex=`Two sides of a triangle have lengths \\( a \\) and \\( b \\). Which statement must be true about the length of the third side?`;
            choices=fourOptions(correct, [
                "It must be exactly a + b",
                "It must be greater than a + b",
                "It must be greater than the longer of a and b"
            ]);
            expectedFormat="Choose the statement that must be true";
            rungs=[
                "The triangle inequality is strict on purpose: the third side has to be shorter than the sum of the other two, because a third side exactly equal to that sum folds the triangle flat.",
                "Take two sides of lengths a and b and compare the third side with their sum, which is a + b here."
            ];
            steps=[
                `The two known sides have lengths a and b, so their sum is a + b.`,
                `A third side equal to a + b gives a degenerate triangle of zero area, and a third side longer than a + b cannot close at all.`,
                `So the third side must be less than a + b, which is the statement ${correct}.`
            ];
            break;
        }
        case "can_it_be_built":{
            let pair=twoDistinct(rng, spread);
            let a=pair[0];
            let b=pair[1];
            let gap=Math.abs(a-b);
            let largest=rng()<0.5;
            let key=largest?a+b-1:gap+1;
            correct=String(key);
            latex=largest?
                `Two sides of a triangle have lengths \\( ${a} \\) and \\( ${b} \\). The length of the third side is to be a whole number. What is the largest such length that still allows a triangle to be built?`:
                `Two sides of a triangle have lengths \\( ${a} \\) and \\( ${b} \\). The length of the third side is to be a whole number. What is the smallest such length that still allows a triangle to be built?`;
            if (largest){
                choices=numberOptions(key, [a+b, key-1, key+1, key-2, gap]);
                rungs=[
                    "The triangle inequality is strict, so the third side may be any length shorter than the sum of the other two. With a whole-number third side, the greatest one below that sum is the sum minus one.",
                    `The two known sides are ${a} and ${b}, so their sum is ${a+b}, and the whole numbers below it end at ${a+b-1}.`
                ];
                steps=[
                    `The third side must be shorter than ${a} + ${b} = ${a+b}, with equality excluded.`,
                    `The whole numbers shorter than ${a+b} are ${a+b-1}, ${a+b-2} and so on.`,
                    `${a+b} - 1 = ${key}, so the largest such length is ${correct}.`
                ];
            }
            else{
                choices=numberOptions(key, [gap, key+1, key+2, a+b, key-1]);
                rungs=[
                    "The other half of the triangle inequality is that the third side is longer than the difference of the two known sides, so with a whole-number third side the smallest one is that difference plus one.",
                    `The two known sides are ${a} and ${b}, whose difference is ${gap}, and the third side has to be longer than ${gap}.`
                ];
                steps=[
                    `The third side has to be longer than the difference of the two known sides, which is ${Math.max(a, b)} - ${Math.min(a, b)} = ${gap}.`,
                    `The whole numbers longer than ${gap} start at ${gap+1}.`,
                    `${gap} + 1 = ${key}, so the smallest such length is ${correct}.`
                ];
            }
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}