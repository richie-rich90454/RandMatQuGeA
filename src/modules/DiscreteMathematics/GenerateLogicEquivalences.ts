/**
 * @file Rewriting a statement into an equivalent one.
 * @description Equivalence is a different skill from evaluation. Here nothing is
 * evaluated: the printed statement and the printed answer agree on every one of
 * their rows, and the question is which rewrite achieves that. Each branch is
 * one named law, and the four options are the rewritings a learner reaches for,
 * so the option set is a mistake list rather than a filler.
 *
 * The de Morgan branch asks for the negation of the whole printed expression,
 * because a negation applied to part of an expression is the single most common
 * wrong answer here. Its four options are four candidate rewritings of that
 * negation, and each is compared with the answer's truth column before it is
 * offered, so exactly one of them can be right. The same column test keeps a
 * distractor that is a second correct answer out of every branch.
 *
 * The formula model is imported rather than copied: two copies of an evaluator
 * that decide equivalence would drift, and a rewrite question graded by the
 * wrong copy is a question with two answers.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{shuffle}from"../shared/Random";
import{fourOptions}from"../shared/Options.js";
import{type Formula, atom, neg, conj, disj, renderFormula, formulaColumn, formulaArgs}from"./GeneratePropositionalLogic";

/**
 * Joins a list of formulas into a disjunction, folding two at a time so the
 * result is a binary tree, which is what `renderFormula` expects when it
 * brackets a child of an AND.
 *
 * @param parts - The formulas.
 * @returns Their disjunction.
 */
function orAll(parts: Formula[]): Formula{
    let acc=parts[0] as Formula;
    for (let i=1; i<parts.length; i++) acc=disj([acc, parts[i] as Formula]);
    return acc;
}

/**
 * Keeps the candidates that are provably not the same function as the answer.
 *
 * Two rewritings of one statement that happen to agree are two correct answers,
 * and a learner cannot tell them apart, so a candidate is dropped on its truth
 * column rather than on its spelling.
 *
 * @param answer - The correct rewrite.
 * @param candidates - The rewritings that were thought of.
 * @param vars - The letters the columns are taken over.
 * @returns The candidates that are provably different functions.
 */
function distinctFrom(answer: Formula, candidates: Formula[], vars: string[]): Formula[]{
    let target=formulaColumn(answer, vars);
    let kept: Formula[]=[];
    let seen=new Set<string>();
    for (let f of candidates){
        let column=formulaColumn(f, vars);
        if (column===target||seen.has(column)) continue;
        seen.add(column);
        kept.push(f);
    }
    return kept;
}

/**
 * Rewrites a formula so that it uses only AND and NOT, which every Boolean
 * function admits because a disjunction is a negated conjunction of negations.
 *
 * @param f - The formula.
 * @returns An equivalent formula with no OR anywhere.
 */
function conjunctionOnly(f: Formula): Formula{
    if (f.kind==="var") return f;
    if (f.kind==="not") return neg(conjunctionOnly(f.arg));
    let parts=f.args.map(conjunctionOnly);
    let acc=parts[0] as Formula;
    for (let i=1; i<parts.length; i++) acc=neg(conj([neg(acc), neg(parts[i] as Formula)]));
    return acc;
}

/**
 * Wraps every letter of a negation-free formula in a pair of negations, which
 * changes no truth value at all and is what the double negation branch prints.
 *
 * @param f - The formula.
 * @returns The same function with two NOTs in front of each letter.
 */
function doubleNegated(f: Formula): Formula{
    if (f.kind==="var") return neg(neg(f));
    if (f.kind==="not") return neg(f);
    let args=f.args.map(doubleNegated);
    return f.kind==="and"?conj(args):disj(args);
}

/**
 * A wide pool of small formulas used as the wrong answers of every branch. It is
 * deliberately broader than any one branch needs: a candidate that turns out to
 * agree with the answer is dropped, and a pool too narrow for a particular
 * statement would leave the question with fewer than four honest options.
 *
 * @param a - The first letter.
 * @param b - The second letter.
 * @param c - The third letter, or null when the question has only two.
 * @returns The pool.
 */
function rewritePool(a: Formula, b: Formula, c: Formula|null): Formula[]{
    let pool: Formula[]=[a, b, neg(a), neg(b), conj([a, b]), disj([a, b]), conj([neg(a), b]), disj([a, neg(b)]), conj([a, neg(b)]), neg(conj([a, b])), neg(disj([a, b])), disj([conj([a, neg(b)]), conj([neg(a), b])])];
    if (c!==null){
        pool=pool.concat([c, neg(c), conj([a, c]), disj([a, c]), conj([b, c]), disj([b, c]), conj([a, b, c]), disj([a, b, c]), conj([a, disj([b, c])]), disj([a, conj([b, c])]), conj([a, disj([b, neg(c)])]), neg(conj([a, disj([b, c])])), neg(disj([a, conj([b, c])]))]);
    }
    return pool;
}

export function generateLogicEquivalences(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["de_morgan","distributive_law","double_negation","rewrite_to_conjunction"];
    let type=types[Math.floor(rng()*types.length)];
    // De Morgan and distributivity are asked over three letters because a
    // two-letter example collapses to a shape whose wrong answers coincide with
    // the right one; double negation and the AND/NOT rewrite stay short.
    let twoLetters=(type==="rewrite_to_conjunction"||type==="double_negation")&&difficulty!=="hard";
    let names=twoLetters?["p","q"]:["p","q","r"];
    let a=atom(names[0] as string);
    let b=atom(names[1] as string);
    let c=twoLetters?null:atom(names[2] as string);
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "de_morgan":{
            // Every printed statement is free of NOT, so one De Morgan pass turns
            // its negation into an expression whose NOTs all sit on single
            // letters, which is what the question asks for.
            let printed: Formula[]=[conj([a, disj([b, c as Formula])]), disj([a, conj([b, c as Formula])]), conj([a, b]), disj([a, b]), conj([a, b, c as Formula])];
            let target=printed[Math.floor(rng()*printed.length)] as Formula;
            let answer=target.kind==="and"?orAll(formulaArgs(target).map(neg)):conj(formulaArgs(target).map(neg));
            let wrong=distinctFrom(answer, rewritePool(a, b, c).concat([target, neg(target)]), names);
            correct=renderFormula(answer);
            alternate=correct;
            display=correct;
            latex=`Write the negation of \\( ${renderFormula(target)} \\) in a form in which the NOT applies only to single letters.`;
            expectedFormat="Choose the negation that has no NOT over a bracket";
            choices=[correct, ...shuffle(rng, wrong).slice(0, 3).map(renderFormula)];
            steps=[
                `The NOT applies to the whole of \\( ${renderFormula(target)} \\), not to one letter inside it.`,
                `De Morgan's laws turn a negated AND into an OR of the negations and a negated OR into an AND of the negations, pushing each NOT down onto a single letter.`,
                `The negation is \\( ${correct} \\), which is true on exactly the rows where \\( ${renderFormula(target)} \\) is false.`
            ];
            rungs=[
                "De Morgan's laws: the negation of an AND is an OR of the negations, and the negation of an OR is an AND of the negations. Push the NOT down to the letters rather than dropping it.",
                `Apply one of the two laws to \\( ${renderFormula(target)} \\) as a whole, so that every NOT ends up on a single letter.`
            ];
            break;
        }
        case "distributive_law":{
            let inner=difficulty==="hard"?disj([b, neg(c as Formula)]):disj([b, c as Formula]);
            let inner2=difficulty==="hard"?neg(conj([a, c as Formula])):disj([a, c as Formula]);
            let sources: Formula[]=[conj([a, inner]), conj([b, inner2])];
            let source=sources[Math.floor(rng()*sources.length)] as Formula;
            let operands=formulaArgs(source);
            let outside=operands[0] as Formula;
            let terms=formulaArgs(operands[1] as Formula);
            let answer=orAll(terms.map(t=>conj([outside, t])));
            let distractorPool: Formula[]=rewritePool(a, b, c).concat([
                orAll(terms.map(t=>conj([b, t]))),
                conj([a, b, c as Formula]),
                conj([disj([a, b]), neg(c as Formula)]),
                conj(operands)
            ]);
            let wrong=distinctFrom(answer, distractorPool, names);
            correct=renderFormula(answer);
            alternate=correct;
            display=correct;
            latex=`Expand \\( ${renderFormula(source)} \\) by the distributive law so that no brackets remain.`;
            expectedFormat="Choose the expanded form with no brackets";
            choices=[correct, ...shuffle(rng, wrong).slice(0, 3).map(renderFormula)];
            steps=[
                `Distribute the single letter \\( ${renderFormula(outside)} \\) over the ${terms.length} terms inside the bracket.`,
                `Each term inside produces one product with \\( ${renderFormula(outside)} \\), and the products are joined by OR, so the bracket is gone.`,
                `The expanded form is \\( ${correct} \\), which takes the value True on exactly the rows the original does.`
            ];
            rungs=[
                "The distributive law multiplies a single factor outside a bracket into every term inside it, so the bracket disappears and the number of terms goes up.",
                `Distribute \\( ${renderFormula(outside)} \\) over the ${terms.length} terms inside the bracket of \\( ${renderFormula(source)} \\).`
            ];
            break;
        }
        case "double_negation":{
            let shapes: Formula[]=c===null?[conj([a, b]), disj([a, b]), conj([a, neg(b)])]:[conj([b, c]), disj([b, c]), conj([a, disj([b, c])]), disj([a, conj([b, c])])];
            let answer=shapes[Math.floor(rng()*shapes.length)] as Formula;
            let target=doubleNegated(answer);
            let distractorPool: Formula[]=rewritePool(a, b, c).concat([doubleNegated(neg(answer)), doubleNegated(answer)]);
            let wrong=distinctFrom(answer, distractorPool, names);
            correct=renderFormula(answer);
            alternate=correct;
            display=correct;
            latex=`Remove every pair of double negations from \\( ${renderFormula(target)} \\), leaving every bracket and connective exactly where it is.`;
            expectedFormat="Choose the expression with the double negations removed";
            choices=[correct, ...shuffle(rng, wrong).slice(0, 3).map(renderFormula)];
            steps=[
                `Two NOTs in a row cancel, so each pair in \\( ${renderFormula(target)} \\) disappears and leaves the letter it was standing in front of.`,
                "Nothing else moves: every bracket and every connective stays exactly where it was written.",
                `The expression becomes \\( ${correct} \\), which is true on the same rows as the original.`
            ];
            rungs=[
                "Double negation removes a pair of NOTs and changes nothing else, so delete the pairs and leave every bracket and connective where it was.",
                `The pairs sit in front of the letters; nothing inside a bracket moves when they are removed.`
            ];
            break;
        }
        case "rewrite_to_conjunction":{
            // Only expressions that still contain an OR are asked, because an
            // expression already written with AND and NOT has nothing to rewrite.
            let printed: Formula[]=[disj([a, b]), disj([a, neg(b)]), disj([neg(a), b]), disj([neg(a), neg(b)]), conj([a, disj([b, a])])];
            if (c!==null) printed=printed.concat([disj([a, conj([b, c])]), conj([b, disj([a, c])])]);
            let usable=printed.filter(f=>renderFormula(conjunctionOnly(f))!==renderFormula(f));
            let source=usable[Math.floor(rng()*usable.length)] as Formula;
            let answer=conjunctionOnly(source);
            let distractorPool: Formula[]=rewritePool(a, b, c).concat([source, neg(source), conj([source, neg(source)])]);
            let wrong=distinctFrom(answer, distractorPool, names);
            correct=renderFormula(answer);
            alternate=correct;
            display=correct;
            latex=`Rewrite \\( ${renderFormula(source)} \\) using only AND and NOT.`;
            expectedFormat="Choose the rewrite that uses only AND and NOT";
            choices=[correct, ...shuffle(rng, wrong).slice(0, 3).map(renderFormula)];
            steps=[
                `Start from \\( ${renderFormula(source)} \\), which contains an OR that has to go.`,
                `Replace every OR by a negated conjunction of the two negated parts, because \\( X \\lor Y \\) is \\( \\neg(\\neg X \\land \\neg Y) \\).`,
                `The rewrite is \\( ${correct} \\), which is true on exactly the rows the original is.`
            ];
            rungs=[
                "An OR is a negated AND of negations, so `X or Y` can always be replaced by `not ((not X) and (not Y))`; repeat that until no OR is left.",
                `Apply that replacement throughout \\( ${renderFormula(source)} \\) until the expression contains nothing but AND and NOT.`
            ];
            break;
        }
    }
    let optionSet=fourOptions(correct, choices);
    return {latex, correct, alternate, display, choices: optionSet, expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
