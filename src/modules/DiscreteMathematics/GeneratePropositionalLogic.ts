/**
 * @file Truth values, precedence and truth tables.
 * @description Propositional logic has three hard parts and this file keeps them
 * apart. The first is evaluating a statement under stated truth values. The
 * second is precedence: NOT binds tightest, then AND, then OR, and a learner who
 * reads left to right gets a different function every time. The third is the
 * truth table, where the answer is a column of T and F rather than a number.
 *
 * A propositional domain has only two truth values, so a branch that asked "is it
 * true" would have two honest answers and would have to invent two more. Every
 * branch here is therefore built so that four honest answers exist: three of
 * them are statements whose truth value the printed assignment settles, and
 * `compound_statement` asks for a count of assignments rather than a verdict.
 * The option set is always the answer plus three statements that the same
 * printed values prove false, so no option is a filler.
 *
 * The `Formula` model and its evaluator are exported because
 * `GenerateLogicEquivalences` and `GenerateBooleanAlgebra` decide their own
 * answers by testing candidate rewritings for equality of truth value, and a
 * second copy of that machinery is the defect this file exists to prevent.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{shuffle}from"../shared/Random";
import{fourOptions, numberOptions}from"../shared/Options.js";

/**
 * A propositional formula, as the tree every evaluation, rendering and signature
 * walks. `and` and `or` hold their operands in the order written, because the
 * order is what the rendered text says and a sort here would print a different
 * statement from the one that was evaluated.
 */
export type Formula =
    |{kind:"var"; name:string}
    |{kind:"not"; arg:Formula}
    |{kind:"and"; args:Formula[]}
    |{kind:"or"; args:Formula[]};

/** A propositional letter. */
export function atom(name: string): Formula{
    return {kind:"var", name};
}
/** The negation of a formula. */
export function neg(arg: Formula): Formula{
    return {kind:"not", arg};
}
/** A conjunction. */
export function conj(args: Formula[]): Formula{
    return {kind:"and", args};
}
/** A disjunction. */
export function disj(args: Formula[]): Formula{
    return {kind:"or", args};
}

/**
 * The operands of a formula. A letter or a negation is its own single operand,
 * which is what lets a rewrite distribute over a bracket of any shape without
 * the caller having to know whether the bracket holds a connective.
 *
 * @param f - The formula.
 * @returns Its operands.
 */
export function formulaArgs(f: Formula): Formula[]{
    if (f.kind==="and"||f.kind==="or") return f.args;
    return [f];
}

/**
 * Renders the operand of a NOT, which is the one place a compound formula has to
 * be parenthesised: `¬p ∧ q` would otherwise read as `(¬p) ∧ q` and change the
 * function being described.
 *
 * @param f - The operand.
 * @returns Its plain-text form.
 */
function renderOperand(f: Formula): string{
    if (f.kind==="var") return f.name;
    if (f.kind==="not") return "¬"+renderOperand(f.arg);
    return "("+renderFormula(f)+")";
}

/**
 * Renders a formula as the plain text an option may carry.
 *
 * A conjunct that is really a disjunction is parenthesised and nothing else is,
 * because `p ∨ q ∧ r` already reads as `p ∨ (q ∧ r)` under the standard
 * precedence. Printing redundant brackets would hide the very precedence the
 * `and_or_not` branch asks about.
 *
 * @param f - The formula.
 * @returns The plain-text form, using `¬`, `∧` and `∨`.
 */
export function renderFormula(f: Formula): string{
    if (f.kind==="var") return f.name;
    if (f.kind==="not") return "¬"+renderOperand(f.arg);
    let join=f.kind==="and"?" ∧ ":" ∨ ";
    return f.args.map(arg=>arg.kind==="or"&&f.kind==="and"?"("+renderFormula(arg)+")":renderFormula(arg)).join(join);
}

/**
 * Evaluates a formula under one assignment of truth values.
 *
 * @param f - The formula.
 * @param values - The truth value of each letter that appears.
 * @returns The value of the formula.
 */
export function evaluateFormula(f: Formula, values: Map<string, boolean>): boolean{
    if (f.kind==="var") return values.get(f.name)===true;
    if (f.kind==="not") return !evaluateFormula(f.arg, values);
    for (let arg of f.args){
        if (f.kind==="and"&&!evaluateFormula(arg, values)) return false;
        if (f.kind==="or"&&evaluateFormula(arg, values)) return true;
    }
    return f.kind==="and";
}

/**
 * Collects the letters a formula uses, so two formulas are compared over one
 * declared variable set rather than over whatever each happens to mention.
 *
 * @param f - The formula.
 * @returns The distinct letter names, in alphabetical order.
 */
export function formulaVariables(f: Formula): string[]{
    let names=new Set<string>();
    let walk=(node: Formula): void=>{
        if (node.kind==="var") names.add(node.name);
        else if (node.kind==="not") walk(node.arg);
        else for (let arg of node.args) walk(arg);
    };
    walk(f);
    return Array.from(names).sort();
}

/**
 * The truth column of a formula over a declared variable order, as one character
 * per assignment.
 *
 * Two formulas with the same column are the same function, which is what makes
 * this the identity the option pools are filtered by: an option that agreed with
 * the answer column would be a second correct answer to a two-valued question.
 *
 * @param f - The formula.
 * @param vars - The letters, in the order the rows run.
 * @returns The column, `1` for true and `0` for false.
 */
export function formulaColumn(f: Formula, vars: string[]): string{
    let column="";
    for (let mask=0; mask<Math.pow(2, vars.length); mask++){
        let values=new Map<string, boolean>();
        for (let i=0; i<vars.length; i++) values.set(vars[i] as string, ((mask>>i)&1)===1);
        column+=evaluateFormula(f, values)?"1":"0";
    }
    return column;
}

/**
 * Keeps the first formula of each distinct truth column, so a pool cannot offer
 * two spellings of the same function.
 *
 * @param pool - The candidate formulas.
 * @param vars - The letters the columns are taken over.
 * @returns One representative per distinct function.
 */
function distinctFunctions(pool: Formula[], vars: string[]): Formula[]{
    let kept: Formula[]=[];
    let seen=new Set<string>();
    for (let f of pool){
        let column=formulaColumn(f, vars);
        if (seen.has(column)) continue;
        seen.add(column);
        kept.push(f);
    }
    return kept;
}

/**
 * Prints a truth assignment the way the learner reads it.
 *
 * @param vars - The letters.
 * @param values - The truth value of each letter.
 * @returns A comma-separated list of `x is True` clauses.
 */
function assignmentText(vars: string[], values: Map<string, boolean>): string{
    return vars.map(v=>`\\( ${v} \\) is ${values.get(v)===true?"True":"False"}`).join(", ");
}

/**
 * Prints the rows of a truth table in the order the columns are indexed by, so a
 * column offered as an option can be read against the rows it belongs to.
 *
 * @param vars - The letters, in the order the rows run.
 * @returns The row labels.
 */
function rowLabels(vars: string[]): string{
    let labels:string[]=[];
    for (let mask=0; mask<Math.pow(2, vars.length); mask++){
        let row="";
        for (let i=0; i<vars.length; i++) row+=((mask>>i)&1)===1?"T":"F";
        labels.push(row);
    }
    return labels.join(", ");
}

/** The letters a question uses, so the same question is not printed twice. */
const LETTER_SETS=[["p","q","r"],["P","Q","R"],["a","b","c"],["x","y","z"],["u","v","w"]];

/**
 * The candidate statements a single-assignment question offers. The pool always
 * contains `x` and `¬x`, and `y` and `¬y`, so at least two of its members are
 * true under any assignment; and it contains at least three members that are
 * false under any assignment, which is why this branch needs no redraw loop.
 *
 * @param letters - The letters in play.
 * @returns The pool, as distinct functions.
 */
function statementPool(letters: string[]): Formula[]{
    let a=atom(letters[0] as string);
    let b=atom(letters[1] as string);
    let pool: Formula[]=[a, b, neg(a), neg(b), conj([a, b]), disj([a, b]), conj([neg(a), b]), disj([a, neg(b)]), conj([a, neg(b)])];
    let c=letters.length>2?atom(letters[2] as string):null;
    if (c!==null){
        pool=pool.concat([c, neg(c), conj([a, c]), disj([a, c]), conj([b, c]), disj([b, c]), conj([a, b, c]), disj([a, b, c]), conj([a, disj([b, c])]), disj([a, conj([b, c])]), neg(conj([a, b])), neg(disj([a, b])), conj([neg(a), conj([b, neg(c)])]), disj([neg(a), conj([b, c])])]);
    }
    return distinctFunctions(pool, letters);
}

/**
 * The precedence-reading pool. Each base formula is offered together with its
 * negation, which is what makes the selection unconditional: under any
 * assignment exactly one of the two is true, so five are true and five are
 * false, and the branch can never be short of an option.
 *
 * @param letters - The letters in play.
 * @returns The pool, as distinct functions.
 */
function precedencePool(letters: string[]): Formula[]{
    let a=atom(letters[0] as string);
    let b=atom(letters[1] as string);
    let c=atom(letters[2] as string);
    let bases: Formula[]=[
        disj([neg(a), conj([b, c])]),
        conj([a, disj([b, c])]),
        conj([a, disj([b, neg(c)])]),
        disj([a, conj([neg(b), c])]),
        disj([conj([a, neg(b)]), c])
    ];
    let pool: Formula[]=[];
    for (let base of bases) pool=pool.concat([base, neg(base)]);
    return distinctFunctions(pool, letters);
}

/**
 * The statements a truth-table column is drawn from. At two letters the ten
 * functions below are all the functions of two letters, so their columns are
 * pairwise distinct; at three letters the precedence pool already supplies ten.
 *
 * @param letters - The letters in play.
 * @returns The pool, as distinct functions.
 */
function columnPool(letters: string[]): Formula[]{
    if (letters.length>2) return precedencePool(letters);
    let a=atom(letters[0] as string);
    let b=atom(letters[1] as string);
    return distinctFunctions([
        a,
        b,
        neg(a),
        neg(b),
        conj([a, b]),
        disj([a, b]),
        disj([conj([a, neg(b)]), conj([neg(a), b])]),
        disj([conj([a, b]), conj([neg(a), neg(b)])]),
        neg(conj([a, b])),
        neg(disj([a, b]))
    ], letters);
}

/**
 * The statements a "how many rows make it true" question is drawn from. None of
 * them is a tautology or a contradiction, so every count offered is a count the
 * learner can actually be wrong by.
 *
 * @param letters - The letters in play.
 * @returns The pool, as distinct functions.
 */
function compoundPool(letters: string[]): Formula[]{
    let a=atom(letters[0] as string);
    let b=atom(letters[1] as string);
    let c=atom(letters[2] as string);
    return distinctFunctions([
        disj([neg(a), conj([b, c])]),
        conj([a, disj([b, c])]),
        conj([a, disj([b, neg(c)])]),
        disj([a, conj([neg(b), c])]),
        disj([conj([a, neg(b)]), c]),
        disj([neg(a), conj([neg(b), neg(c)])]),
        conj([disj([a, b]), neg(c)]),
        conj([neg(a), disj([b, c])]),
        disj([conj([a, b]), neg(c)])
    ], letters);
}

/**
 * Builds the four options for a question whose answer is one statement out of
 * four, so exactly one is true and the other three are proved false by the same
 * printed truth values.
 *
 * @param pool - The candidate statements, already reduced to distinct functions.
 * @param values - The truth value of each letter.
 * @param rng - The injected random source.
 * @returns Four options with the true statement first.
 */
function statementOptions(pool: Formula[], values: Map<string, boolean>, rng: RngFn): string[]{
    let trues:string[]=[];
    let falses:string[]=[];
    for (let f of pool){
        let text=renderFormula(f);
        if (evaluateFormula(f, values)) trues.push(text);
        else falses.push(text);
    }
    let trueText=trues[Math.floor(rng()*trues.length)] as string;
    let wrong=shuffle(rng, falses).slice(0, 3);
    return [trueText, ...wrong];
}

/**
 * Reports whether a set of four statements contains exactly one true statement,
 * which is the claim a single-assignment question makes. It is a separate
 * function so that the test can check the claim against the printed values
 * rather than against the generator's own selection.
 *
 * @param options - The four statements.
 * @param pool - The statements they were drawn from.
 * @param values - The truth value of each letter.
 * @returns The number of options that are true.
 */
export function countTrueStatements(options: string[], pool: Formula[], values: Map<string, boolean>): number{
    let byText=new Map<string, Formula>();
    for (let f of pool) byText.set(renderFormula(f), f);
    let count=0;
    for (let option of options){
        let f=byText.get(option);
        if (f&&evaluateFormula(f, values)) count++;
    }
    return count;
}

export function generatePropositionalLogic(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["value_of_a_statement","and_or_not","truth_table","compound_statement"];
    let type=types[Math.floor(rng()*types.length)];
    let letters=difficulty==="easy"?["p","q"]:LETTER_SETS[Math.floor(rng()*LETTER_SETS.length)] as string[];
    if (type==="truth_table"||type==="and_or_not"||type==="compound_statement"){
        if (letters.length<3) letters=["p","q","r"];
    }
    if (type==="compound_statement"&&difficulty==="easy") letters=["p","q","r"];
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "value_of_a_statement":{
            // The assignment is printed, so every option's truth value is settled
            // by numbers the learner can see. That is what makes four honest
            // options possible in a domain with only two truth values.
            let values=new Map<string, boolean>();
            for (let letter of letters) values.set(letter, rng()<0.5);
            let pool=statementPool(letters);
            let options=statementOptions(pool, values, rng);
            correct=options[0] as string;
            alternate=correct;
            display=correct;
            latex=`The statements ${assignmentText(letters, values)}. Exactly one of the following four expressions is true. Which one?`;
            expectedFormat="Choose the expression that is true";
            choices=options;
            let chosen=pool.find(f=>renderFormula(f)===correct) as Formula;
            steps=[
                `Read the truth values off the question: ${letters.map(l=>`${l} is ${values.get(l)===true?"True":"False"}`).join(", ")}.`,
                `The left-hand option is \\( ${renderFormula(chosen)} \\), which evaluates to True, while each of the other three evaluates to False under the same values.`,
                `Exactly one expression is true, and it is \\( ${correct} \\).`
            ];
            rungs=[
                "Work outwards: evaluate the NOT first, then the ANDs, then the ORs, and only then read the answer off the printed truth values.",
                `Use the values ${letters.map(l=>`${l}=${values.get(l)===true?"T":"F"}`).join(", ")} for every one of the four options, evaluating NOT before AND and AND before OR.`
            ];
            break;
        }
        case "and_or_not":{
            let values=new Map<string, boolean>();
            for (let letter of letters) values.set(letter, rng()<0.5);
            let pool=precedencePool(letters);
            let options=statementOptions(pool, values, rng);
            correct=options[0] as string;
            alternate=correct;
            display=correct;
            latex=`Read NOT as binding tighter than AND, and AND tighter than OR. The statements ${assignmentText(letters, values)}. Exactly one of the following four expressions is true. Which one?`;
            expectedFormat="Choose the expression that is true";
            choices=options;
            let chosen=pool.find(f=>renderFormula(f)===correct) as Formula;
            steps=[
                `The precedence order is NOT, then AND, then OR, so \\( ${renderFormula(chosen)} \\) is not read left to right.`,
                `Take the values ${letters.map(l=>`${l}=${values.get(l)===true?"T":"F"}`).join(", ")}: the innermost NOT and the ANDs are evaluated first, and the OR last.`,
                `That expression is True and the other three are False, so the true one is \\( ${correct} \\).`
            ];
            rungs=[
                "Precedence settles the grouping before any truth value does: NOT binds tightest, then AND, and OR binds loosest, so an expression with no brackets is not read left to right.",
                `Take the values ${letters.map(l=>`${l}=${values.get(l)===true?"T":"F"}`).join(", ")} and evaluate each of the four options innermost part first.`
            ];
            break;
        }
        case "truth_table":{
            // The answer is a column, so the four options are four columns of the
            // same width. The pool has pairwise distinct columns, which is what
            // stops two options from being the same column written twice.
            let pool=columnPool(letters);
            let target=pool[Math.floor(rng()*pool.length)] as Formula;
            let others=shuffle(rng, pool.filter(f=>formulaColumn(f, letters)!==formulaColumn(target, letters))).slice(0, 3);
            let columns=shuffle(rng, [target, ...others]);
            let text=(f: Formula): string=>formulaColumn(f, letters).split("").map(bit=>bit==="1"?"T":"F").join(" ");
            correct=text(target);
            alternate=correct;
            display=correct;
            latex=`Let \\( ${letters.join(", ")} \\) range over all ${Math.pow(2, letters.length)} assignments in the order ${rowLabels(letters)}. Which of the four columns below is the truth column of \\( ${renderFormula(target)} \\)?`;
            expectedFormat="Choose the column of T and F values";
            choices=columns.map(text);
            steps=[
                `Fill one row per assignment: the rows run ${rowLabels(letters)}.`,
                `Evaluate \\( ${renderFormula(target)} \\) on each row, evaluating NOT before AND and AND before OR.`,
                `The column that comes out is ${correct}, so the answer is ${correct}.`
            ];
            rungs=[
                "A truth column is one entry per row, so the table has to be filled row by row before any column can be read off.",
                `There are ${Math.pow(2, letters.length)} rows in the order ${rowLabels(letters)}, and the same rows are used for all four columns offered.`
            ];
            break;
        }
        case "compound_statement":{
            // A model count rather than a verdict, because a truth value has only
            // two settings and this branch needs four honest options.
            let pool=compoundPool(letters).filter(f=>{
                let count=formulaColumn(f, letters).split("1").length-1;
                return count>0&&count<Math.pow(2, letters.length);
            });
            let target=pool[Math.floor(rng()*pool.length)] as Formula;
            let column=formulaColumn(target, letters);
            let count=column.split("1").length-1;
            correct=String(count);
            alternate=correct;
            display=`${column.split("1").length-1} of ${column.length} rows`;
            latex=`Let \\( ${letters.join(", ")} \\) range over all ${Math.pow(2, letters.length)} assignments. For how many of them is the statement \\( ${renderFormula(target)} \\) true?`;
            expectedFormat="Enter a whole number";
            choices=[correct, ...shuffle(rng, numberOptions(count, [count-1, count+1, count-2, count+2, count+3]).slice(1))];
            steps=[
                `The statement is \\( ${renderFormula(target)} \\), over ${Math.pow(2, letters.length)} assignments of ${letters.join(", ")}.`,
                `Its truth column, in the row order ${rowLabels(letters)}, is ${column.split("").map(bit=>bit==="1"?"T":"F").join(" ")}.`,
                `That column has ${count} true entries, so the answer is ${count}.`
            ];
            rungs=[
                "\"How many assignments make it true\" is a count over the whole truth table, so fill the table in and then count the true rows rather than deciding the statement once.",
                `There are ${Math.pow(2, letters.length)} rows in the order ${rowLabels(letters)}, and \\( ${renderFormula(target)} \\) has to be evaluated on every one of them.`
            ];
            break;
        }
    }
    let optionSet=fourOptions(correct, choices);
    return {latex, correct, alternate, display, choices: optionSet, expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
