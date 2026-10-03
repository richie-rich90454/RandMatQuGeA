/**
 * @file Absolute value equations: one positive solution, the sum of two
 * solutions, no solution at all, and checking a claimed answer by substitution.
 * @description The bars stand for a distance, so `| ax + b | = c` with a positive c
 * always has two solutions, `= 0` has exactly one, and a negative right-hand side
 * has none because a distance cannot be negative. Every branch here is one of those
 * three facts, and every offered value is tested against the equation it came from
 * before it is shown, so no option can fail the question it is an option for.
 *
 * The branch with no solution is asked as "which of these four equations has no
 * solution" rather than as a count of solutions. An equation of this shape has only
 * three possible counts, so a fourth option would be a filler that teaches a learner
 * to eliminate by shape rather than to read the equation. Four equations, one of
 * which is impossible, gives four answers a learner can reason about.
 */
import type{RngFn, QuestionDto}from"../../../types/global";
import{fourOptions, numberOptions}from"../../shared/Options.js";
import{randInt, shuffle}from"../../shared/Random";

/**
 * Renders the inside of the bars with its sign spelled out, so that no prompt ever
 * prints a plus sign followed by a minus sign.
 *
 * @param slope - The coefficient of x.
 * @param constant - The constant term.
 * @returns The linear expression inside the bars.
 */
function inside(slope: number, constant: number): string{
    let head=Math.abs(slope)===1?"x":Math.abs(slope)+"x";
    if (constant===0) return head;
    if (constant>0) return head+" - "+constant;
    return head+" + "+Math.abs(constant);
}

/**
 * Reports whether a candidate actually satisfies an absolute value equation, which
 * is what decides whether it may be offered as the answer.
 *
 * @param slope - The coefficient of x.
 * @param constant - The constant term inside the bars.
 * @param target - The right-hand side.
 * @param candidate - The claimed value of x.
 * @returns True when the bars come out at the target.
 */
function satisfies(slope: number, constant: number, target: number, candidate: number): boolean{
    return Math.abs(slope*candidate+constant)===target;
}

export function generateAbsoluteValueEquation(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["single_equation","two_solutions","no_solution","check_the_answer"];
    let type=types[Math.floor(rng()*types.length)];
    let slopeMax=difficulty==="hard"?6:difficulty==="easy"?3:4;
    let key="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "single_equation":{
            // The two solutions are chosen first, one on each side of zero, and the
            // equation is then built from them. That guarantees the printed equation
            // has exactly one positive solution, which is what the question asks for
            // and what stops the other root being an equally good answer. The slope is
            // even whenever the two solutions do not share a parity, so that the
            // constant term and the right-hand side are both whole numbers.
            let positive=randInt(rng, 2, difficulty==="hard"?18:12);
            let negative=-randInt(rng, 1, difficulty==="hard"?18:12);
            let slope=(positive+negative)%2===0?2:2*randInt(rng, 1, Math.floor(slopeMax/2));
            let constant=-slope*(positive+negative)/2;
            let target=slope*(positive-negative)/2;
            key=String(positive);
            latex=`Solve \\( | ${inside(slope, constant)} | = ${target} \\). What is the positive solution for \\( x \\)?`;
            choices=numberOptions(positive, [negative, -positive, constant, slope, target], 0);
            rungs=[
                "The bars stand for a distance, so the equation has two cases: the expression inside them is equal to the right-hand side, and equal to its negative. Solving only the first case throws half the answers away.",
                `Split the equation into ${inside(slope, constant)} = ${target} and ${inside(slope, constant)} = ${-target}, then keep the solution that is positive.`
            ];
            steps=[
                `Split into two cases: ${inside(slope, constant)} = ${target} or ${inside(slope, constant)} = ${-target}.`,
                `The two cases give x = ${positive} and x = ${negative}.`,
                `Only ${positive} of the two is positive, so the answer is ${key}`
            ];
            break;
        }
        case "two_solutions":{
            // The constant inside the bars is drawn as a multiple of the slope, so
            // the two solutions are whole numbers and their sum is a whole number too.
            let slope=randInt(rng, 1, slopeMax);
            let centre=randInt(rng, 1, 6);
            let constant=slope*centre;
            let whole=randInt(rng, 1, difficulty==="hard"?14:9);
            let target=whole*slope;
            let above=(constant+target)/slope;
            let below=(constant-target)/slope;
            key=String(above+below);
            latex=`Solve \\( | ${inside(slope, -constant)} | = ${target} \\). What is the sum of the two solutions for \\( x \\)?`;
            choices=numberOptions(above+below, [above, below, above+below+1, above+below-1, -(above+below)+1], 0);
            rungs=[
                "The two cases are symmetric about the point where the expression inside the bars is zero, so the two solutions add up to twice that point rather than being solved for one at a time.",
                `The inside of the bars is zero at x = ${centre}, so the two solutions add up to 2 x ${centre}.`
            ];
            steps=[
                `Split into two cases: ${inside(slope, -constant)} = ${target} or ${inside(slope, -constant)} = ${-target}.`,
                `Those give x = ${above} and x = ${below}.`,
                `${above} + ${below} = ${key}, so the sum of the two solutions is ${key}`
            ];
            break;
        }
        case "no_solution":{
            // Three of the four equations have solutions, so the learner has to
            // decide which one is impossible rather than pick the only option with no
            // answer to it.
            let centre=randInt(rng, 2, 12);
            let impossible=randInt(rng, 1, 9);
            let firstTarget=randInt(rng, 1, 9);
            let secondSlope=randInt(rng, 2, 4);
            let secondOffset=randInt(rng, 1, 9);
            let thirdSlope=randInt(rng, 2, 4);
            let thirdTarget=randInt(rng, 1, 9);
            key=`| ${inside(1, centre)} | = ${-impossible}`;
            let others=[
                `| ${inside(1, centre)} | = ${firstTarget}`,
                `| ${inside(secondSlope, secondOffset)} | = 0`,
                `| ${inside(thirdSlope, thirdTarget)} | = ${firstTarget+secondOffset}`
            ];
            // The prompt lists the four equations in a shuffled order, so the one with
            // no solution is not always the first thing a learner reads.
            let printed=shuffle(rng, [key, ...others]);
            latex=`Which of these four equations has no solution? ${printed.map(equation=>`\\( ${equation} \\)`).join(", ")}.`;
            expectedFormat="Enter the equation that has no solution, written the way it is written here";
            choices=fourOptions(key, others);
            rungs=[
                "An absolute value is a distance and can never be less than zero, so an equation that asks it to equal a negative number is impossible however carefully it is solved.",
                "Look for the equation whose right-hand side is smaller than zero."
            ];
            steps=[
                "An absolute value is a distance, so it is never less than zero.",
                `${key} asks for a distance to equal -${impossible}, which cannot happen.`,
                `Each of the other three has a right-hand side of zero or more, so each of them can be solved.`,
                `The equation with no solution is ${key}`
            ];
            break;
        }
        case "check_the_answer":{
            // The candidates are tested against the equation rather than assumed to be
            // wrong, so the option set can never contain a second solution or a value
            // that happens to satisfy the equation a second way.
            let above=randInt(rng, 1, difficulty==="hard"?18:12);
            let below=-randInt(rng, 1, difficulty==="hard"?18:12);
            let slope=(above+below)%2===0?2:2*randInt(rng, 1, Math.floor(slopeMax/2));
            let constant=-slope*(above+below)/2;
            let target=slope*(above-below)/2;
            let extras:number[]=[];
            for(let attempt=0; extras.length<2&&attempt<64; attempt++){
                let candidate=above+1+extras.length*4+(attempt%5);
                if (candidate===above||candidate===below||extras.indexOf(candidate)>=0) continue;
                if (satisfies(slope, constant, target, candidate)) continue;
                extras.push(candidate);
            }
            for(let attempt=0; extras.length<2&&attempt<64; attempt++){
                let candidate=below-1-extras.length*4-(attempt%5);
                if (candidate===above||candidate===below||extras.indexOf(candidate)>=0) continue;
                if (satisfies(slope, constant, target, candidate)) continue;
                extras.push(candidate);
            }
            let rejects=[extras[0] as number, extras[1] as number];
            let offered=shuffle(rng, [above, below, rejects[0], rejects[1]]);
            key=String(above);
            latex=`Which of these four values of \\( x \\) satisfies \\( | ${inside(slope, constant)} | = ${target} \\)? ${offered.map(candidate=>`\\( ${candidate} \\)`).join(", ")}.`;
            expectedFormat="Enter the value of x";
            choices=numberOptions(above, [below, rejects[0], rejects[1]], 0);
            rungs=[
                "The only way to know whether a value works is to put it into the equation and see whether the bars come out at the right-hand side.",
                `Substitute each candidate into | ${inside(slope, constant)} | and check whether the result is ${target}.`
            ];
            steps=[
                `Substituting x = ${above}: | ${slope*above+constant} | = ${target}, so it works.`,
                `The other three give ${rejects.map(value=>Math.abs(slope*value+constant)).join(", ")} inside the bars, and ${below} gives ${Math.abs(slope*below+constant)}, none of which is ${target}.`,
                `So the value that satisfies the equation is ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:key, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
