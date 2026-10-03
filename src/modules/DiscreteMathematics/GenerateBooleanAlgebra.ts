/**
 * @file Boolean algebra: simplification, truth tables, consensus and gates.
 * @description Boolean algebra writes AND as adjacency and OR as a plus, and its
 * branches test the three reductions that shrink an expression, the truth table
 * that proves two of them equal, and the gate an expression becomes in hardware.
 *
 * Every printed expression is built from a named law and its answer is what that
 * law reduces it to, so the reductions are constructed rather than searched for:
 * absorption gives `A + AB = A`, its dual gives `A(A + B) = A`, and the consensus
 * theorem gives `AB + A'C + BC = AB + A'C`. That is why the answers are reliable
 * without a minimiser over the truth table.
 *
 * Every candidate wrong answer is checked to be a different function before it is
 * offered, because a distractor that is a second correct answer is a build
 * failure and a learner cannot tell the two apart.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{atom, neg, conj, disj, formulaColumn, formulaVariables, type Formula}from"./GeneratePropositionalLogic";
import{shuffle}from"../shared/Random";
import{fourOptions}from"../shared/Options.js";

/**
 * Renders a formula in the notation of Boolean algebra: adjacency for AND, a
 * plus for OR, and a trailing apostrophe for NOT.
 *
 * A sum that is a factor of a product is bracketed, because in this notation
 * adjacency binds tighter than the plus and a bracketed sum is what keeps the
 * printed expression the same function as the one being graded.
 *
 * @param f - The formula.
 * @returns Its Boolean-algebra form.
 */
export function booleanText(f: Formula): string{
    if (f.kind==="var") return f.name;
    if (f.kind==="not"){
        let inner=f.arg;
        if (inner.kind==="and"||inner.kind==="or") return "("+booleanText(inner)+")'";
        return booleanText(inner)+"'";
    }
    if (f.kind==="and") return f.args.map(booleanFactor).join("");
    return f.args.map(booleanOperand).join(" + ");
}

/**
 * Renders one summand. A product needs no brackets inside a sum, because
 * adjacency already binds tighter than the plus, and bracketing it would print
 * `(AB) + (A'C)` for what is conventionally written `AB + A'C`.
 *
 * @param f - The summand.
 * @returns Its Boolean-algebra form.
 */
function booleanOperand(f: Formula): string{
    return booleanText(f);
}

/**
 * Renders one factor of a product, bracketing a sum.
 *
 * @param f - The factor.
 * @returns Its Boolean-algebra form.
 */
function booleanFactor(f: Formula): string{
    if (f.kind==="or") return "("+booleanText(f)+")";
    return booleanText(f);
}

/**
 * Reports whether two formulas are the same function, which is the test every
 * candidate answer has to pass before it can be offered as a wrong option.
 *
 * @param left - The first formula.
 * @param right - The second formula.
 * @returns True when they agree on every assignment of the letters they share.
 */
function equivalent(left: Formula, right: Formula): boolean{
    let vars=formulaVariables(left);
    for (let name of formulaVariables(right)) if (vars.indexOf(name)<0) vars.push(name);
    return formulaColumn(left, vars)===formulaColumn(right, vars);
}

/**
 * Keeps the candidates that are a different function from the answer, with the
 * first three, which are the reductions closest to the answer.
 *
 * @param answer - The correct expression.
 * @param candidates - The wrong expressions, most plausible first.
 * @returns Up to three that are provably different functions.
 */
function distinctFrom(answer: Formula, candidates: Formula[]): Formula[]{
    // Every column has to be taken over the same letters. A column taken over the
    // answer's letters alone collapses `AB` and `AC` onto each other when the
    // answer mentions only `A`, because both then read the same single column, and
    // the pool loses two honest distractors to a comparison that was never about
    // the candidates at all.
    let vars=formulaVariables(answer);
    for (let candidate of candidates) for (let name of formulaVariables(candidate)) if (vars.indexOf(name)<0) vars.push(name);
    let target=formulaColumn(answer, vars);
    let kept: Formula[]=[];
    let seen=new Set<string>([target]);
    for (let candidate of candidates){
        let column=formulaColumn(candidate, vars);
        if (column===target||seen.has(column)) continue;
        seen.add(column);
        kept.push(candidate);
    }
    return kept.slice(0, 3);
}

export function generateBooleanAlgebra(_difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["simplify_an_expression","equivalence_to_a_truth_table","minimise_by_consensus","gate_implementation"];
    let type=types[Math.floor(rng()*types.length)];
    let a=atom("A");
    let b=atom("B");
    let c=atom("C");
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "simplify_an_expression":{
            // Each printed expression is built by applying one of the reductions
            // backwards, and the answer is the short form it came from. Building
            // them this way is what makes the key provably equal to the question.
            let forms: {printed:Formula, answer:Formula, law:string}[]=[
                {printed:disj([a, conj([a, b])]), answer:a, law:"absorption, \\( A + AB = A \\)"},
                {printed:conj([a, disj([a, b])]), answer:a, law:"the dual of absorption, \\( A(A + B) = A \\)"},
                {printed:disj([a, b, conj([a, b])]), answer:disj([a, b]), law:"absorption, \\( A + B + AB = A + B \\)"},
                {printed:conj([a, conj([b, c])]), answer:conj([a, b]), law:"idempotence, \\( BB = B \\)"},
                {printed:conj([a, disj([a, disj([b, c])])]), answer:conj([a, disj([b, c])]), law:"the dual of absorption, applied twice"}
            ];
            let chosen=forms[Math.floor(rng()*forms.length)] as {printed:Formula, answer:Formula, law:string};
            let printed=chosen.printed;
            let answer=chosen.answer;
            let candidates: Formula[]=[
                printed,
                conj([a, b]),
                disj([a, b]),
                conj([a, c]),
                disj([a, c]),
                conj([b, c]),
                disj([b, c]),
                conj([a, b, c])
            ];
            correct=booleanText(answer);
            alternate=correct;
            display=correct;
            latex=`Simplify the Boolean expression \\( ${booleanText(printed)} \\), where juxtaposition means AND and \\( + \\) means OR.`;
            expectedFormat="Choose the simplest equivalent expression";
            choices=[correct, ...shuffle(rng, distinctFrom(answer, candidates).map(booleanText))];
            steps=[
                "Look for the three shapes that reduce: `A + AB = A`, `A(A + B) = A`, and `BB = B`.",
                `In \\( ${booleanText(printed)} \\) the pattern is ${chosen.law}, so the reduction gives \\( ${booleanText(answer)} \\).`,
                `The reduced form is true on exactly the same assignments as the original, so the answer is ${correct}.`
            ];
            rungs=[
                "Look for one of the three reductions: absorption `A + AB = A`, its dual `A(A + B) = A`, or idempotence `BB = B`.",
                `Find the repeated letter in \\( ${booleanText(printed)} \\) and apply the matching law to the smallest part that contains it.`
            ];
            break;
        }
        case "equivalence_to_a_truth_table":{
            // The answer is the truth column of the printed expression, and the
            // three other columns are the columns of three other expressions, so
            // four columns are offered and only one of them belongs to this one.
            let expressions: Formula[]=[
                disj([a, conj([b, c])]),
                conj([a, disj([b, c])]),
                conj([a, b]),
                disj([a, b]),
                neg(conj([a, b])),
                neg(disj([a, b]))
            ];
            let target=expressions[Math.floor(rng()*expressions.length)] as Formula;
            let others=shuffle(rng, expressions.filter(f=>formulaColumn(f, ["A","B","C"])!==formulaColumn(target, ["A","B","C"])));
            let shown=[target, ...others.slice(0, 3)];
            let order=shuffle(rng, shown);
            let columnOf=(f: Formula): string=>formulaColumn(f, ["A","B","C"]).split("").map(bit=>bit==="1"?"1":"0").join(" ");
            let rows=Math.pow(2, 3);
            let rowOrder: string[]=[];
            for (let mask=0; mask<rows; mask++){
                let row="";
                for (let index=0; index<3; index++) row+=((mask>>index)&1)===1?"1":"0";
                rowOrder.push(row);
            }
            correct=columnOf(target);
            alternate=correct;
            display=correct;
            latex=`Let \\( A, B, C \\) take all \\( ${rows} \\) values in the order ${rowOrder.join(", ")}. Which of these four columns is the truth column of \\( F = ${booleanText(target)} \\), where juxtaposition means AND and \\( + \\) means OR?`;
            expectedFormat="Choose the column of 1 and 0 values";
            choices=order.map(columnOf);
            steps=[
                "Fill the table row by row: evaluate the NOTs first, then the products, then the sum.",
                `Taking \\( A, B, C \\) in the order ${rowOrder.join(", ")}, the values of \\( ${booleanText(target)} \\) are ${correct.split(" ").join(", ")}.`,
                `That column is the one asked for, so the answer is ${correct}.`
            ];
            rungs=[
                "A truth column is one entry per row, so the table has to be filled row by row before any column can be read off.",
                `There are ${rows} rows in the order ${rowOrder.join(", ")}, and the same row order applies to all four columns offered.`
            ];
            break;
        }
        case "minimise_by_consensus":{
            // `AB + A'C + BC` is the consensus form: the third term is implied by
            // the first two, so the minimal expression drops it. Each printed
            // expression is built that way and the answer is the two-term form.
            let forms: {printed:Formula, answer:Formula, drop:string}[]=[
                {printed:disj([conj([a, b]), conj([neg(a), c]), conj([b, c])]), answer:disj([conj([a, b]), conj([neg(a), c])]), drop:"BC"},
                {printed:disj([conj([a, c]), conj([neg(a), b]), conj([b, c])]), answer:disj([conj([a, c]), conj([neg(a), b])]), drop:"BC"},
                {printed:disj([conj([a, b]), conj([neg(a), c]), conj([neg(b), c])]), answer:disj([conj([a, b]), conj([neg(a), c])]), drop:"B'C"}
            ];
            let chosen=forms[Math.floor(rng()*forms.length)] as {printed:Formula, answer:Formula, drop:string};
            let printed=chosen.printed;
            let answer=chosen.answer;
            // The three wrong answers are the readings a learner produces from the printed
            // form: a sum with a different extra term, a product of the two
            // surviving terms, and the two surviving terms joined wrongly.
            let candidates: Formula[]=[
                disj([conj([a, b]), conj([neg(a), c]), conj([a, c])]),
                conj([conj([a, b]), conj([neg(a), c])]),
                conj([a, b]),
                disj([a, b]),
                disj([conj([a, b]), c]),
                disj([conj([a, b]), conj([neg(a), c]), conj([b, c])])
            ];
            correct=booleanText(answer);
            alternate=correct;
            display=correct;
            latex=`Minimise the Boolean expression \\( ${booleanText(printed)} \\), where juxtaposition means AND and \\( + \\) means OR, by using the consensus theorem and then absorption.`;
            expectedFormat="Choose the minimal equivalent expression";
            choices=[correct, ...shuffle(rng, distinctFrom(answer, candidates).map(booleanText))];
            steps=[
                "The consensus theorem says that `AB + A'C + BC` reduces to `AB + A'C`: the third term is true only where one of the first two already is.",
                `In \\( ${booleanText(printed)} \\) the term ${chosen.drop} is that consensus term, and it is true on no assignment where both remaining terms are false.`,
                `Deleting it leaves \\( ${booleanText(answer)} \\), which is the minimal form, so the answer is ${correct}.`
            ];
            rungs=[
                "The consensus theorem removes the one term that is implied by the other two: in `AB + A'C + BC` the term `BC` is redundant, and then absorption trims whatever is left.",
                `Find the term of \\( ${booleanText(printed)} \\) that is true only where another term already is, and delete it.`
            ];
            break;
        }
        case "gate_implementation":{
            // A gate is an expression with a name, so the question gives an
            // expression and asks which gate implements it. The distractors are
            // the gates with a different truth column, which is checked rather
            // than assumed.
            let gates: {name:string, formula:Formula}[]=[
                {name:"AND", formula:conj([a, b])},
                {name:"OR", formula:disj([a, b])},
                {name:"NAND", formula:neg(conj([a, b]))},
                {name:"NOR", formula:neg(disj([a, b]))},
                {name:"XOR", formula:disj([conj([a, neg(b)]), conj([neg(a), b])])},
                {name:"XNOR", formula:disj([conj([a, b]), conj([neg(a), neg(b)])])}
            ];
            let target=gates[Math.floor(rng()*gates.length)] as {name:string, formula:Formula};
            let answer=target.name;
            let wrong=gates.filter(gate=>gate.name!==answer&&!equivalent(gate.formula, target.formula));
            let ones=onSetCount(target.formula, ["A","B"]);
            correct=answer;
            alternate=correct;
            display=correct;
            latex=`A combinational circuit takes the inputs \\( A \\) and \\( B \\) and produces the output \\( F = ${booleanText(target.formula)} \\), where juxtaposition means AND and \\( + \\) means OR. Which single standard gate has exactly this behaviour?`;
            expectedFormat="Choose the name of the gate";
            choices=[correct, ...shuffle(rng, distinctFrom(target.formula, wrong.map(gate=>gate.formula)).map(formula=>wrong.find(gate=>formulaColumn(gate.formula, ["A","B"])===formulaColumn(formula, ["A","B"]))?.name as string))];
            steps=[
                "Write the truth table of the expression over its two inputs and compare it with the standard gates.",
                `Taking \\( A, B = 0, 0;\\; 0, 1;\\; 1, 0;\\; 1, 1 \\), \\( F = ${booleanText(target.formula)} \\) is 1 on ${ones} of the four rows, and its output is 1 exactly when that gate's is.`,
                `So the circuit is a ${answer} gate, and the answer is ${correct}.`
            ];
            rungs=[
                "A gate is named for its truth table, so evaluate the expression on all four assignments of its two inputs and match the resulting column against the standard gates.",
                `Take \\( A, B \\) in turn through \\( 0, 0 \\), \\( 0, 1 \\), \\( 1, 0 \\), \\( 1, 1 \\) and write down the four values of \\( F \\).`
            ];
            break;
        }
    }
    void c;
    return {latex, correct, alternate, display, choices: fourOptions(correct, choices), expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}

/**
 * How many assignments make a formula true, which is the number of rows a gate's
 * output is 1 on.
 *
 * @param f - The formula.
 * @param vars - The letters.
 * @returns The count of true assignments.
 */
function onSetCount(f: Formula, vars: string[]): number{
    return formulaColumn(f, vars).split("").filter(bit=>bit==="1").length;
}
