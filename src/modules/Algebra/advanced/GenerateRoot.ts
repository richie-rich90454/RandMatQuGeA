import type{RngFn, QuestionDto}from"../../../types/global";
import{getMaxForDifficulty}from"../AlgebraUtils.js";
import{fourOptions}from"../../shared/Options.js";
/**
 * Roots: simplify nth roots.
 * @fileoverview Generates root simplification questions with MCQ distractors. The
 * radicand is a perfect power of a whole base, so the key is exact and the prompt
 * needs no rounding instruction. The wrong answers are the mistakes this form
 * produces: a neighbouring whole number, the base doubled, the index instead of
 * the root, and the radicand left unextracted. The option filter drops whichever
 * of them coincides with the key, which is what a base of one used to do.
 * @date 2026-04-18
 * @param difficulty - Which difficulty to generate at.
 * @param rng - The injected random source.
 * @returns QuestionDto
 */
export function generateRoot(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let maxRoot=getMaxForDifficulty(difficulty,4);
    let maxBase=getMaxForDifficulty(difficulty,10);
    let root=Math.floor((rng()*maxRoot))+2;
    let base=Math.floor((rng()*maxBase))+1;
    let radicand=Math.pow(base,root);
    let rootExpression="";
    if(root===2){
        rootExpression=`\\[ \\sqrt{${radicand}}=? \\]`;
    }
    else{
        rootExpression=`\\[ \\sqrt[${root}]{${radicand}}=? \\]`;
    }
    let correctRoot=base.toString();
    let choices=[
        `${base+1}`,
        `${base-1}`,
        `${base*2}`,
        `${root}`,
        `${radicand}`
    ];
    return {
        latex: rootExpression,
        correct: correctRoot,
        alternate: correctRoot,
        display: correctRoot,
        choices: fourOptions(correctRoot, choices),
        expectedFormat: "Enter a whole number"
    };
}
