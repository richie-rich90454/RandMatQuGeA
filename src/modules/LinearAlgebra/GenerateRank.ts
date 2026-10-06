/**
 * @file Rank: how many rows or columns are independent, and how to read both off a
 * row echelon form.
 * @description A matrix of a known rank is built from an upper-triangular block with
 * a nonzero diagonal plus zero rows, which has rank exactly that rank by inspection,
 * and is then shuffled by row and column permutations, which leave the rank alone.
 * The echelon forms are built the same way, with the leading entries in named pivot
 * columns. Nothing here is measured by a floating-point elimination, so nothing can
 * report rank two for a matrix of rank three because of a rounding error.
 *
 * The rank of a matrix, the number of its nonzero rows in echelon form, the number
 * of its pivot columns and the number of its linearly independent columns are four
 * names for the same number, and this topic asks for each of them.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions}from"../shared/Options.js";
import{pickMany, randInt, shuffle}from"../shared/Random";
import{trimNum}from"../shared/Latex";

/**
 * Renders a matrix for a prompt.
 *
 * @param m - The matrix.
 * @returns The LaTeX body, without math delimiters.
 */
function matrixLatex(m: number[][]): string{
    let rows=m.map(row=>row.map(v=>trimNum(v)).join(" & ")).join(" \\\\ ");
    return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}

/**
 * Renders a set of columns as a named list, which is the form an answer to a pivot
 * column question has to take.
 *
 * @param cols - The column numbers, in increasing order.
 * @returns The option text.
 */
function columnSetText(cols: number[]): string{
    if (cols.length===1) return `Column ${cols[0]}`;
    let names=cols.map(c=>String(c));
    if (names.length===2) return `Columns ${names[0]} and ${names[1]}`;
    let head=names.slice(0, names.length-1).join(", ");
    return `Columns ${head} and ${names[names.length-1]}`;
}

/**
 * Every set of columns of the given size, as option text. Used as the distractor pool
 * for a pivot column question, where a set of the wrong size is provably wrong too,
 * because a matrix in echelon form has one pivot per nonzero row.
 *
 * @param cols - How many columns the matrix has.
 * @param size - How many columns the set should have.
 * @returns The option texts.
 */
function columnSets(cols: number, size: number): string[]{
    let out:string[]=[];
    let current: number[]=[];
    let walk=(start: number): void=>{
        if (current.length===size){
            out.push(columnSetText(current.slice()));
            return;
        }
        for(let c=start; c<=cols; c++){
            current.push(c);
            walk(c+1);
            current.pop();
        }
    };
    walk(1);
    return out;
}

/**
 * A matrix of a known rank. The base is a staircase with `r` nonzero rows whose
 * leading entries are nonzero, followed by zero rows; row and column permutations
 * then hide the staircase without changing the rank.
 *
 * @param rng - The injected random source.
 * @param rows - How many rows the matrix has.
 * @param cols - How many columns the matrix has.
 * @param rank - The rank to build, at most min(rows, cols).
 * @param spread - The largest magnitude allowed for an entry.
 * @returns A matrix whose rank is exactly `rank`.
 */
function rankMatrix(rng: RngFn, rows: number, cols: number, rank: number, spread: number): number[][]{
    let matrix: number[][]=[];
    for(let i=0; i<rows; i++){
        let row: number[]=[];
        for(let j=0; j<cols; j++) row.push(0);
        if (i<rank){
            row[i]=randNonZeroEntry(rng, spread);
            for(let j=i+1; j<cols; j++) row[j]=randInt(rng, -spread, spread);
        }
        matrix.push(row);
    }
    let order: number[]=[];
    for(let i=0; i<rows; i++) order.push(i);
    shuffle(rng, order);
    matrix=order.map(i=>matrix[i] as number[]);
    let columns: number[]=[];
    for(let j=0; j<cols; j++) columns.push(j);
    shuffle(rng, columns);
    return matrix.map(row=>columns.map(j=>row[j] as number));
}

/**
 * A nonzero integer of magnitude at most the spread. The retry is bounded and the
 * fallback is 1, so a stream that keeps drawing zero cannot spin and cannot produce
 * a zero pivot.
 *
 * @param rng - The injected random source.
 * @param spread - The largest magnitude allowed.
 * @returns A nonzero integer.
 */
function randNonZeroEntry(rng: RngFn, spread: number): number{
    for(let attempt=0; attempt<64; attempt++){
        let value=randInt(rng, -spread, spread);
        if (value!==0) return value;
    }
    return 1;
}

/**
 * A matrix already in row echelon form, with its leading entries in the given pivot
 * columns. The leading entries are the pivot columns by definition, so the question
 * of which columns they are has an answer that can be read straight off the page.
 *
 * @param rng - The injected random source.
 * @param rows - How many rows the matrix has.
 * @param cols - How many columns the matrix has.
 * @param pivots - The pivot columns, in increasing order, each at least its own index.
 * @param spread - The largest magnitude allowed for an entry.
 * @returns The echelon form.
 */
function echelonForm(rng: RngFn, rows: number, cols: number, pivots: number[], spread: number): number[][]{
    let matrix: number[][]=[];
    for(let i=0; i<rows; i++){
        let row: number[]=[];
        for(let j=0; j<cols; j++) row.push(0);
        if (i<pivots.length){
            let lead=pivots[i] as number;
            row[lead-1]=randNonZeroEntry(rng, spread);
            for(let j=lead; j<cols; j++) row[j]=randInt(rng, -spread, spread);
        }
        matrix.push(row);
    }
    return matrix;
}

/**
 * Draws an increasing list of pivot columns whose entries leave room for the
 * staircase, that is where the i-th pivot is at least column i.
 *
 * @param rng - The injected random source.
 * @param cols - How many columns the matrix has.
 * @param count - How many pivots are needed.
 * @returns The pivot columns, in increasing order.
 */
function drawPivots(rng: RngFn, cols: number, count: number): number[]{
    let picks: number[]=[];
    for(let attempt=0; attempt<64; attempt++){
        let candidate: number[]=[];
        for(let i=0; i<count; i++) candidate.push(randInt(rng, i+1, cols));
        candidate.sort((a, b)=>a-b);
        let distinct=true;
        for(let i=1; i<candidate.length; i++){
            if (candidate[i]===candidate[i-1]) distinct=false;
        }
        if (distinct){
            picks=candidate;
            break;
        }
    }
    if (picks.length===0){
        picks=[];
        for(let i=0; i<count; i++) picks.push(i+1);
    }
    return picks;
}

export function generateRank(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["find_the_rank", "pivot_columns", "rank_from_row_echelon", "independent_columns"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?3:difficulty==="hard"?6:4;
    let rows=difficulty==="easy"?3:randInt(rng, 3, 4);
    let cols=difficulty==="easy"?3:randInt(rng, 3, 4);
    let maxRank=Math.min(rows, cols);
    let rank=randInt(rng, 1, Math.max(1, maxRank));
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "find_the_rank":{
            let matrix=rankMatrix(rng, rows, cols, rank, spread);
            correct=String(rank);
            latex=`What is the rank of \\( A = ${matrixLatex(matrix)} \\)?`;
            choices=fourOptions(correct, ["0", "1", "2", "3"].filter(v=>v!==correct));
            rungs=[
                "The rank is the number of pivots you get from row reducing to echelon form, which is also the largest number of linearly independent rows or columns.",
                `Reduce \\( A = ${matrixLatex(matrix)} \\) to echelon form and count the rows with a leading entry.`
            ];
            steps=[
                `Row reducing A to echelon form leaves ${rank} rows with a leading entry.`,
                `Zero rows are discarded, because they contribute no equations and no pivots.`,
                `The rank is the number of pivots, which is ${correct}.`
            ];
            break;
        }
        case "rank_from_row_echelon":{
            let pivots=drawPivots(rng, cols, rank);
            let matrix=echelonForm(rng, rows, cols, pivots, spread);
            correct=String(rank);
            latex=`The matrix \\( E = ${matrixLatex(matrix)} \\) is already in row echelon form. What is the rank of \\( E \\)?`;
            choices=fourOptions(correct, ["0", "1", "2", "3"].filter(v=>v!==correct));
            rungs=[
                "A matrix in echelon form is already row reduced, so the rank is the number of rows with a leading entry and nothing has to be computed.",
                `Read down the rows of \\( E = ${matrixLatex(matrix)} \\) and count the ones that are not all zero.`
            ];
            steps=[
                `The rows of E are already in echelon form, so each nonzero row contributes one pivot.`,
                `Counting the rows that are not entirely zero gives ${rank}.`,
                `The rank of E is therefore ${correct}.`
            ];
            break;
        }
        case "pivot_columns":{
            let pivots=drawPivots(rng, cols, rank);
            let matrix=echelonForm(rng, rows, cols, pivots, spread);
            correct=columnSetText(pivots);
            latex=`The matrix \\( E = ${matrixLatex(matrix)} \\) is in row echelon form. Which columns are the pivot columns?`;
            let pool: string[]=[];
            for(let size=1; size<=cols; size++){
                for(let set of columnSets(cols, size)){
                    if (set!==correct) pool.push(set);
                }
            }
            choices=fourOptions(correct, pickMany(rng, pool, 3));
            expectedFormat="Enter the column set, for example Columns 1 and 3";
            rungs=[
                "The pivot columns are the columns whose leading entries the row reduction produces, so in a matrix already in echelon form they are the columns that hold those leading entries.",
                `Scan each nonzero row of \\( E = ${matrixLatex(matrix)} \\} for its first nonzero entry and note the column it sits in.`
            ];
            steps=[
                `In echelon form the leading entries of E sit in columns ${pivots.join(", ")}.`,
                `A pivot column is exactly a column containing a leading entry, and a column with no leading entry contributes no pivot.`,
                `The pivot columns are therefore ${correct}.`
            ];
            break;
        }
        case "independent_columns":{
            let matrix=rankMatrix(rng, rows, cols, rank, spread);
            correct=String(rank);
            latex=`The matrix \\( A = ${matrixLatex(matrix)} \\) has ${cols} columns. How many of its columns are linearly independent, that is, how many can be chosen to form a basis of the column space?`;
            let pool=["0", "1", "2", "3", "4"].filter(v=>v!==correct);
            choices=fourOptions(correct, pickMany(rng, pool, 3));
            rungs=[
                "The pivot columns of the row echelon form of a matrix are exactly the columns of the original matrix that are linearly independent, so the number of pivot columns is the number asked for.",
                `Reduce \\( A = ${matrixLatex(matrix)} \\) to echelon form and count the columns that hold a leading entry.`
            ];
            steps=[
                `Row reducing A to echelon form produces ${rank} pivots.`,
                `The pivot columns of the echelon form are the same columns of A that are linearly independent.`,
                `So ${rank} of the ${cols} columns are linearly independent, and the answer is ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}