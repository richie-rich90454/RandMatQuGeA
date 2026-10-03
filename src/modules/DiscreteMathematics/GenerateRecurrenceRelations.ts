/**
 * @file First and second order linear recurrences.
 * @description A recurrence defines its sequence by an initial value and a rule,
 * and the branch asks either for a term of that sequence or for the growth of
 * the sequence as a whole. Every key here is an exact integer: the terms are
 * computed by repeated multiplication or repeated addition in integer
 * arithmetic, so nothing is ever rounded and no term is ever printed in
 * exponential notation.
 *
 * The constants are bounded by what is exactly representable, which is why the
 * branches state a maximum index rather than leaving it open. A closed form of
 * `a0 * c^n` is the claim these questions are about, and a claim a learner cannot
 * evaluate by hand on the printed numbers is not a claim worth printing.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt}from"../shared/Random";
import{fourOptions}from"../shared/Options.js";

/**
 * Builds the terms of a first-order linear recurrence `a_n = a_{n-1} + d`, in
 * exact integer arithmetic.
 *
 * @param start - The initial term.
 * @param step - The common difference.
 * @param index - The term to compute.
 * @returns The value of that term.
 */
function additiveTerm(start: number, step: number, index: number): number{
    return start+index*step;
}

/**
 * Builds the terms of a geometric recurrence `a_n = c * a_{n-1}`, in exact
 * integer arithmetic, so that no power of a non-integer is ever involved.
 *
 * @param start - The initial term.
 * @param ratio - The common ratio.
 * @param index - The term to compute.
 * @returns The value of that term.
 */
function multiplicativeTerm(start: number, ratio: number, index: number): number{
    let term=start;
    for (let step=0; step<index; step++) term*=ratio;
    return term;
}

/**
 * Builds the terms of a second-order recurrence `a_n = p*a_{n-1} + q*a_{n-2}`,
 * in exact integer arithmetic.
 *
 * @param first - The first term.
 * @param second - The second term.
 * @param firstCoefficient - The coefficient of the previous term.
 * @param secondCoefficient - The coefficient of the term before that.
 * @param index - The term to compute.
 * @returns The value of that term.
 */
function secondOrderTerm(first: number, second: number, firstCoefficient: number, secondCoefficient: number, index: number): number{
    if (index<=0) return first;
    let previous=first;
    let before=second;
    for (let step=2; step<index; step++){
        let next=firstCoefficient*before+secondCoefficient*previous;
        previous=before;
        before=next;
    }
    return before;
}

export function generateRecurrenceRelations(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["constant_recurrence","first_order_linear","find_an_explicit_form","growth_behavior"];
    let type=types[Math.floor(rng()*types.length)];
    let cap=difficulty==="easy"?3:difficulty==="hard"?6:4;
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "constant_recurrence":{
            // `a_n = c * a_{n-1}` has the closed form `a_0 * c^n`, so the term is
            // a product of integers and the answer is exact without rounding.
            // The index is capped so that the value stays a whole number.
            let start=randInt(rng, 1, 4);
            let ratio=randInt(rng, 2, difficulty==="easy"?3:4);
            let index=randInt(rng, 2, difficulty==="easy"?3:difficulty==="hard"?5:4);
            let value=multiplicativeTerm(start, ratio, index);
            let powered=multiplicativeTerm(1, ratio, index);
            correct=String(value);
            alternate=correct;
            display=`${start} \\times ${ratio}^{${index}} = ${value}`;
            latex=`A sequence is defined by \\( a_0 = ${start} \\) and \\( a_n = ${ratio} a_{n-1} \\). What is \\( a_{${index}} \\)?`;
            expectedFormat="Enter a whole number";
            let candidates=[multiplicativeTerm(start, ratio, index-1), start*powered+start, value+start, value-ratio, start+index*ratio, powered];
            choices=fourOptions(correct, candidates.map(String));
            steps=[
                `Each term is the term before it multiplied by ${ratio}, so the sequence runs ${Array.from({length: index+1}, (_, i)=>multiplicativeTerm(start, ratio, i)).join(", ")} up to \\( a_{${index}} \\).`,
                `The closed form is \\( a_n = a_0 ${ratio}^{n} = ${start} \\times ${ratio}^{n} \\), and ${ratio}^{${index}} = ${powered}.`,
                `${start} \\times ${powered} = ${value}, so \\( a_{${index}} = ${value} \\).`
            ];
            rungs=[
                "A geometric recurrence has the closed form `a_n = a_0 * c^n`, so the term is the initial term multiplied by the ratio raised to the index.",
                `Use \\( a_0 = ${start} \\), \\( c = ${ratio} \\) and \\( n = ${index} \\): the answer is ${start} times ${ratio} to the power ${index}.`
            ];
            break;
        }
        case "first_order_linear":{
            // `a_n = a_{n-1} + d` has the closed form `a_0 + n*d`, which is an
            // exact integer for every integer index.
            let start=randInt(rng, 1, 8);
            let step=randInt(rng, 2, cap+2);
            let index=randInt(rng, 3, difficulty==="easy"?5:difficulty==="hard"?9:7);
            let value=additiveTerm(start, step, index);
            correct=String(value);
            alternate=correct;
            display=`${start} + ${index} \\times ${step} = ${value}`;
            latex=`A sequence is defined by \\( a_0 = ${start} \\) and \\( a_n = a_{n-1} + ${step} \\). What is \\( a_{${index}} \\)?`;
            expectedFormat="Enter a whole number";
            choices=fourOptions(correct, [
                String(additiveTerm(start, step, index-1)),
                String(additiveTerm(start, step, index+1)),
                String(start+index*step+step),
                String(start*index+step),
                String(additiveTerm(start, step*index, 1))
            ]);
            steps=[
                `Each term adds ${step} to the term before it, so \\( a_{${index}} \\) is the initial term plus ${index} copies of ${step}.`,
                `The closed form is \\( a_n = a_0 + nd = ${start} + ${index} \\times ${step} \\).`,
                `${start} + ${index*step} = ${value}, so \\( a_{${index}} = ${value} \\).`
            ];
            rungs=[
                "A first-order linear recurrence has the closed form `a_n = a_0 + n*d`, so the term is the initial value plus the index times the common difference.",
                `Use \\( a_0 = ${start} \\), \\( d = ${step} \\) and \\( n = ${index} \\): the answer is ${start} plus ${index} times ${step}.`
            ];
            break;
        }
        case "find_an_explicit_form":{
            // A second-order recurrence, whose explicit form comes from the
            // characteristic roots. The terms are built by the recurrence in
            // integer arithmetic, so the answer a learner reaches by working the
            // recurrence out term by term is the same integer that is graded.
            let first=randInt(rng, 1, 3);
            let second=randInt(rng, 2, 5);
            let firstCoefficient=randInt(rng, 1, 3);
            let secondCoefficient=randInt(rng, 1, 3);
            let index=randInt(rng, 5, difficulty==="easy"?7:difficulty==="hard"?11:9);
            let value=secondOrderTerm(first, second, firstCoefficient, secondCoefficient, index);
            let sequence: number[]=[first, second];
            for (let step=2; step<=index; step++) sequence.push(firstCoefficient*(sequence[step-1] as number)+secondCoefficient*(sequence[step-2] as number));
            correct=String(value);
            alternate=correct;
            display=`a_{${index}} = ${value}`;
            latex=`A sequence is defined by \\( a_1 = ${first} \\), \\( a_2 = ${second} \\) and \\( a_n = ${firstCoefficient} a_{n-1} + ${secondCoefficient} a_{n-2} \\). What is \\( a_{${index}} \\)?`;
            expectedFormat="Enter a whole number";
            choices=fourOptions(correct, [
                String(secondOrderTerm(first, second, firstCoefficient, secondCoefficient, index-1)),
                String(secondOrderTerm(first, second, firstCoefficient, secondCoefficient, index+1)),
                String(value+secondCoefficient),
                String(value-firstCoefficient),
                String(first*Math.pow(2, index-1))
            ]);
            steps=[
                `Work the recurrence forward from \\( a_1 = ${first} \\) and \\( a_2 = ${second} \\), always using the two terms before, and write each term down as you go.`,
                `That gives ${sequence.map((_, position)=>`a_{${position+1}} = ${sequence[position] as number}`).join(", ")}.`,
                `The last of these is \\( a_{${index}} = ${value} \\), so the answer is ${value}.`
            ];
            rungs=[
                "A second-order recurrence needs the two terms before each one, so work forward from the two given terms, building the sequence one term at a time.",
                `Start from \\( a_1 = ${first} \\) and \\( a_2 = ${second} \\) and apply \\( a_n = ${firstCoefficient} a_{n-1} + ${secondCoefficient} a_{n-2} \\) until you reach term ${index}.`
            ];
            break;
        }
        case "growth_behavior":{
            // Growth is a yes or no question with three honest answers rather
            // than four, so it is asked as four statements about the sequence and
            // exactly one of them is a true statement about the printed numbers.
            let start=randInt(rng, 1, 5);
            let ratio=randInt(rng, 2, 4);
            let statements=[
                "the sequence increases without bound, because every term is a larger multiple of the one before",
                "the sequence approaches a finite limit, because the terms stop growing",
                "the sequence is periodic, because the terms repeat",
                "the sequence is eventually constant, because the increments stop changing"
            ];
            correct=statements[0] as string;
            alternate=correct;
            display=correct;
            latex=`A sequence is defined by \\( a_0 = ${start} \\) and \\( a_n = ${ratio} a_{n-1} \\). Which of these four statements about the sequence is true?`;
            expectedFormat="Choose the true statement";
            choices=[correct, ...statements.slice(1)];
            steps=[
                `Each term is ${ratio} times the term before it, and ${ratio} is greater than one, so the terms strictly increase: ${start}, ${multiplicativeTerm(start, ratio, 1)}, ${multiplicativeTerm(start, ratio, 2)}, ${multiplicativeTerm(start, ratio, 3)}, and so on.`,
                `Each term is at least ${ratio-1} times as large again, so the sequence grows faster and faster and never settles at a limit or a repeating pattern.`,
                `So the true statement is: ${correct}.`
            ];
            rungs=[
                "When every term is a fixed multiple of the term before and that multiple is greater than one, the terms strictly increase and the growth compounds.",
                `The multiplier here is ${ratio}, which is greater than one, so compare each term with the one before it.`
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices: fourOptions(correct, choices), expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
