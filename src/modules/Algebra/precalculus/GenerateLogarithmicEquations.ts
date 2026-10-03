/**
 * @file Logarithmic equations: equating logarithms of one base, rejecting the root
 * a real logarithm does not allow, combining logarithms, and change of base.
 * @description The domain of a real logarithm is the whole difficulty of this topic,
 * and the branch that has no solution at all is not a rare accident: squaring or
 * combining an equation of this shape almost always produces a second root that is
 * negative, and a negative number has no real logarithm. Every table entry here has
 * been checked so that the quadratic produced by combining the logarithms has two
 * whole roots, one positive and one negative, which is what makes the rejection
 * visible rather than hypothetical.
 *
 * The only branch with an irrational answer says so in the prompt and rounds once,
 * and the key is that same rounding rather than a longer decimal the prompt never
 * promised.
 */
import type{RngFn, QuestionDto}from"../../../types/global";
import{fmt}from"../../shared/Numeric";
import{numberOptions}from"../../shared/Options.js";
import{randInt}from"../../shared/Random";

/**
 * Equations of the form log_b(x) + log_b(x - k) = n whose quadratic x^2 - kx - b^n
 * has two whole roots. Each entry has been checked to give one positive root above
 * k, which is inside the domain, and one negative root, which is not.
 */
const EXTRANEOUS: [number, number, number][]=[
    [2, 1, 1],
    [2, 2, 3],
    [2, 3, 2],
    [2, 3, 7],
    [2, 4, 6],
    [3, 1, 2],
    [3, 2, 8],
    [3, 3, 6],
    [5, 1, 4],
    [5, 2, 24]
];

export function generateLogarithmicEquations(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["one_to_one_property","extraneous_root","combine_logarithms","change_of_base"];
    let type=types[Math.floor(rng()*types.length)];
    let key="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "one_to_one_property":{
            // The right-hand side is drawn as a multiple of the number inside the
            // logarithm, so the solution is a whole number and is also positive, which
            // is what keeps it inside the domain.
            let base=randInt(rng, 2, 9);
            let inside=randInt(rng, 2, 9);
            let solution=randInt(rng, 2, difficulty==="hard"?24:14);
            let argument=inside*solution;
            key=String(solution);
            latex=`Solve \\( \\log_{${base}} (${inside}x) = \\log_{${base}} (${argument}) \\). What is \\( x \\)?`;
            choices=numberOptions(solution, [solution+1, solution-1, argument, inside], 0);
            rungs=[
                "The one-to-one property says that logarithms of one base are equal exactly when their arguments are equal, so the equation becomes two arguments being equal.",
                `The arguments are ${inside}x and ${argument}, and ${inside} times x has to equal ${argument}.`
            ];
            steps=[
                `Both logarithms have base ${base}, so equate their arguments.`,
                `${inside}x = ${argument}, and the answer has to be positive because ${inside}x is the argument of a logarithm.`,
                `${argument} / ${inside} = ${key}`
            ];
            break;
        }
        case "extraneous_root":{
            // The rejected candidate is printed in the prompt, so the learner sees the
            // root that has to be discarded rather than being told afterwards that one
            // of them was wrong. The key is the root that survives.
            let entry=EXTRANEOUS[Math.floor(rng()*EXTRANEOUS.length)] as [number, number, number];
            let base=entry[0];
            let power=entry[1];
            let shift=entry[2];
            let powerValue=Math.pow(base, power);
            let good=(shift+Math.round(Math.sqrt(shift*shift+4*powerValue)))/2;
            let rejected=-powerValue/good;
            key=String(good);
            latex=`Solving \\( \\log_{${base}} (x) + \\log_{${base}} (x - ${shift}) = ${power} \\) by combining the two logarithms gives two candidates, \\( x = ${good} \\) and \\( x = ${rejected} \\). A real logarithm needs a positive argument, so one of them must be discarded. What is the solution?`;
            choices=numberOptions(good, [rejected, good+1, good-1, powerValue, shift], 0);
            rungs=[
                "A real logarithm is only defined for a positive argument, so every candidate has to be checked against the domain before it is accepted.",
                `The arguments here are x and x - ${shift}, so both must be positive.`
            ];
            steps=[
                `Combining the logarithms gives log_{${base}} (x(x - ${shift})) = ${power}, so x(x - ${shift}) = ${powerValue}.`,
                `That quadratic gives x = ${good} or x = ${rejected}.`,
                `x = ${rejected} is negative, so x - ${shift} is negative too and its logarithm is not defined, which leaves ${key}`
            ];
            break;
        }
        case "combine_logarithms":{
            // The two arguments are the same multiple of a power of the base, so the
            // difference of the logarithms is that power and the answer is a whole
            // number rather than a decimal to be rounded.
            let base=randInt(rng, 2, 9);
            let power=randInt(rng, 1, difficulty==="hard"?6:4);
            let shared=randInt(rng, 2, difficulty==="hard"?40:15);
            let bigger=Math.pow(base, power)*shared;
            key=String(power);
            latex=`What is \\( \\log_{${base}} (${bigger}) - \\log_{${base}} (${shared}) \\)?`;
            choices=numberOptions(power, [power+1, power-1, shared, bigger], 0);
            rungs=[
                "Subtracting logarithms of one base means dividing the arguments, so the answer is the logarithm of the quotient rather than of the difference.",
                `Divide the two arguments first: ${bigger} divided by ${shared}.`
            ];
            steps=[
                `${bigger} / ${shared} = ${Math.pow(base, power)}.`,
                `log_{${base}} (${bigger}) - log_{${base}} (${shared}) = log_{${base}} (${Math.pow(base, power)}).`,
                `${base} to the power ${power} is ${Math.pow(base, power)}, so the answer is ${key}`
            ];
            break;
        }
        case "change_of_base":{
            // Neither argument is a power of the base, so the value is genuinely
            // irrational and the prompt says how far to round it. The key is rounded
            // once, with the same rule the prompt names.
            let base=[3, 5, 7][Math.floor(rng()*3)] as number;
            let argument=[2, 11, 13][Math.floor(rng()*3)] as number;
            let value=Math.log(argument)/Math.log(base);
            key=fmt(value, 2);
            latex=`Evaluate \\( \\log_{${base}} (${argument}) \\) using the change-of-base formula \\( \\frac{\\ln ${argument} }{\\ln ${base} } \\). Round your answer to the nearest hundredth.`;
            expectedFormat="Enter a decimal rounded to the nearest hundredth";
            choices=numberOptions(Number(key), [Math.log(base)/Math.log(argument), Math.log(argument)/Math.log(2), argument/base, value+1], 2);
            rungs=[
                "Change of base rewrites a logarithm as the ratio of two logarithms of the same argument, and the base has to be the same one underneath both.",
                `Use the natural logarithm of ${argument} over the natural logarithm of ${base}, and round to the nearest hundredth.`
            ];
            steps=[
                `ln ${argument} is about ${fmt(Math.log(argument), 4)} and ln ${base} is about ${fmt(Math.log(base), 4)}.`,
                `Their ratio is ${fmt(value, 4)}.`,
                `Rounded to the nearest hundredth that is ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:key, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
