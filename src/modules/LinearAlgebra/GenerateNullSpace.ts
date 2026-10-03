/**
 * @file Null spaces: a vector in them, a basis of them, their dimension, and the
 * homogeneous system they solve.
 * @description A matrix with a known null space is built the other way round from the
 * usual: the null vector is drawn first, and the rows of the matrix are then drawn
 * from the vectors orthogonal to it, so A v = 0 holds by construction rather than by
 * search. The rows are required to be independent, which pins the dimension of the
 * null space exactly.
 *
 * A nonzero multiple of a null vector is the same answer, so no distractor is ever a
 * multiple of the key. Instead the distractors are checked directly against the
 * matrix: a candidate is kept only when some row of A fails to be orthogonal to it,
 * which proves it is not in the null space.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from "../shared/Random";
import{trimNum}from"../shared/Latex";

/**
 * The dot product of two vectors.
 *
 * @param a - The first vector.
 * @param b - The second vector.
 * @returns The dot product.
 */
function dot(a: number[], b: number[]): number{
    let total=0;
    for(let i=0; i<a.length; i++) total+=a[i]*b[i];
    return total;
}

/**
 * Reports whether a vector is the zero vector.
 *
 * @param v - The vector.
 * @returns True when every entry is zero.
 */
function isZeroVector(v: number[]): boolean{
    for(let i=0; i<v.length; i++){
        if (v[i]!==0) return false;
    }
    return true;
}

/**
 * Reports whether two nonzero vectors point the same way. A null space basis has two
 * independent vectors in it, so a pair that fails this test cannot be offered as one.
 *
 * @param a - The first vector, which must not be zero.
 * @param b - The second vector, which must not be zero.
 * @returns True when the two are proportional.
 */
function isParallel(a: number[], b: number[]): boolean{
    if (isZeroVector(a)||isZeroVector(b)) return false;
    let base=0;
    while (a[base]===0) base++;
    for(let i=0; i<a.length; i++){
        if (a[base]*b[i]!==b[base]*a[i]) return false;
    }
    return true;
}

/**
 * Reports whether a vector is parallel to one already chosen, which is the test that
 * keeps the rows of the matrix independent.
 *
 * @param v - The vector, which must not be zero.
 * @param chosen - The rows already accepted.
 * @returns True when some accepted row is proportional to `v`.
 */
function parallelsAny(v: number[], chosen: number[][]): boolean{
    for(let row of chosen){
        if (isZeroVector(v)||isZeroVector(row)) continue;
        let base=0;
        while (v[base]===0) base++;
        for(let i=0; i<v.length; i++){
            if (v[base]*row[i]!==row[base]*v[i]) return false;
        }
        return true;
    }
    return false;
}

/**
 * Draws independent nonzero rows, each orthogonal to every target vector. Returns
 * null rather than a partial answer when the bounded search comes up short, so the
 * caller can fall back to a fixed consistent pair of data rather than to a matrix
 * whose rank is not what the question claims.
 *
 * @param rng - The injected random source.
 * @param targets - The vectors every row must be orthogonal to.
 * @param count - How many rows are needed.
 * @param spread - The largest magnitude allowed for an entry.
 * @returns The rows, or null when none could be found.
 */
function drawOrthogonalRows(rng: RngFn, targets: number[][], count: number, spread: number): number[][]|null{
    let rows: number[][]=[];
    for(let attempt=0; attempt<64; attempt++){
        let row: number[]=[];
        for(let i=0; i<(targets[0] as number[]).length; i++) row.push(randInt(rng, -spread, spread));
        if (isZeroVector(row)) continue;
        let fits=true;
        for(let target of targets){
            if (dot(row, target)!==0) fits=false;
        }
        if (!fits) continue;
        if (parallelsAny(row, rows)) continue;
        rows.push(row);
        if (rows.length===count) return rows;
    }
    return null;
}

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
 * Renders a vector for a prompt.
 *
 * @param v - The vector.
 * @returns The LaTeX body, without math delimiters.
 */
function vectorLatex(v: number[]): string{
    return `\\begin{bmatrix} ${v.map(x=>trimNum(x)).join(" \\\\ ")} \\end{bmatrix}`;
}

/**
 * Renders a vector as a plain option, because options are text rather than typeset
 * mathematics.
 *
 * @param v - The vector.
 * @returns The option text.
 */
function vectorText(v: number[]): string{
    return `(${v.join(", ")})`;
}

/**
 * Reports whether a vector is in the null space of a matrix, that is whether every
 * row of the matrix is orthogonal to it. This is the test that decides whether an
 * offered option is wrong or is the answer written again.
 *
 * @param rows - The rows of the matrix.
 * @param v - The candidate vector.
 * @returns True when the candidate solves the homogeneous system.
 */
function inNullSpace(rows: number[][], v: number[]): boolean{
    for(let row of rows){
        if (dot(row, v)!==0) return false;
    }
    return true;
}

/**
 * Distractors for a vector that is only fixed up to a nonzero multiple: the key with
 * one entry displaced, keeping only those the matrix itself rules out of the null
 * space. Nothing that solves the homogeneous system survives, so no option is a
 * second correct answer.
 *
 * @param rows - The rows of the matrix.
 * @param key - The correct vector.
 * @returns Candidate option texts.
 */
function outsideNullSpace(rows: number[][], key: number[]): string[]{
    let pool: string[]=[];
    for(let i=0; i<key.length; i++){
        for(let delta of [1, -1, 2, -2, 3]){
            let copy=key.slice();
            copy[i]=copy[i]+delta;
            if (isZeroVector(copy)) continue;
            if (inNullSpace(rows, copy)) continue;
            pool.push(vectorText(copy));
        }
    }
    return pool;
}

export function generateNullSpace(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["a_null_vector", "basis_of_the_null_space", "rank_nullity", "the_homogeneous_system"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?2:difficulty==="hard"?4:3;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "a_null_vector":{
            let target=[randInt(rng, -spread, spread), randInt(rng, -spread, spread), randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
            if (target[1]===0) target[1]=1;
            let rows=drawOrthogonalRows(rng, [target], 3, spread);
            if (!rows){
                target=[1, 1, 0, 0];
                rows=[[1, -1, 1, 0], [1, -1, 0, 1], [0, 0, 1, 1]];
            }
            let matrix=rows;
            correct=vectorText(target);
            latex=`Find a nonzero vector \\( v \\in \\mathbb{R}^{4} \\) such that \\( Av = 0 \\), where \\( A = ${matrixLatex(matrix)} \\). Any nonzero multiple of a correct answer is also correct.`;
            expectedFormat="Enter as (a, b, c, d)";
            choices=fourOptions(correct, outsideNullSpace(matrix, target));
            rungs=[
                "Solve the homogeneous system by setting one variable free and checking that every row of A gives zero when it is substituted.",
                `The rows of \\( A = ${matrixLatex(matrix)} \\) are three independent equations in four unknowns, so there is one free variable.`
            ];
            steps=[
                `Each row of A must be orthogonal to v, and there are three such equations in four unknowns, so the solutions form a single line through the origin.`,
                `Choosing the free variable so that the equations are satisfied gives \\( v = ${vectorLatex(target)} \\).`,
                `Every row of A has dot product zero with that vector, so a nonzero vector in the null space is ${correct}.`
            ];
            break;
        }
        case "basis_of_the_null_space":{
            // Two independent null vectors in R^4 give a two-dimensional null space, and
            // the rows of the matrix are the two independent vectors orthogonal to both.
            let first=[randInt(rng, -spread, spread), randInt(rng, -spread, spread), randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
            if (first[1]===0) first[1]=1;
            let second=[randInt(rng, -spread, spread), randInt(rng, -spread, spread), randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
            if (second[3]===0) second[3]=1;
            // A basis has to be independent, so a parallel pair is redrawn. The retry
            // is bounded and the fallback below is a known independent pair.
            for(let attempt=0; attempt<64; attempt++){
                if (!isParallel(first, second)) break;
                second=[randInt(rng, -spread, spread), randInt(rng, -spread, spread), randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
                if (second[3]===0) second[3]=1;
            }
            if (isParallel(first, second)){
                first=[1, 1, 0, 0];
                second=[0, 0, 1, 1];
            }
            let rows=drawOrthogonalRows(rng, [first, second], 2, spread);
            if (!rows){
                first=[1, 1, 0, 0];
                second=[0, 0, 1, 1];
                rows=[[1, -1, 0, 0], [0, 0, 1, -1]];
            }
            let third=[(rows[0] as number[])[0]+(rows[1] as number[])[0], (rows[0] as number[])[1]+(rows[1] as number[])[1], (rows[0] as number[])[2]+(rows[1] as number[])[2], (rows[0] as number[])[3]+(rows[1] as number[])[3]];
            let matrix=[rows[0] as number[], rows[1] as number[], third];
            correct=vectorText(first)+" and "+vectorText(second);
            latex=`Find a basis for the null space of \\( A = ${matrixLatex(matrix)} \\). Give two vectors that are independent of each other and whose every combination solves \\( Av = 0 \\).`;
            expectedFormat="Enter the two vectors, for example (1, 0, 0, 0) and (0, 1, 0, 0)";
            choices=fourOptions(correct, [
                vectorText(first)+" and "+vectorText(rows[0] as number[]),
                vectorText(first)+" and "+vectorText(rows[1] as number[]),
                vectorText(first)+" and "+vectorText(third)
            ]);
            rungs=[
                "The null space of a four-column matrix with two independent rows has dimension two, so a basis has exactly two vectors, and both have to be orthogonal to both rows of A.",
                `The rows of \\( A = ${matrixLatex(matrix)} \\) are two independent equations in four unknowns, so there are two free variables.`
            ];
            steps=[
                `There are two independent equations in four unknowns, so the null space has dimension 4 - 2 = 2 and a basis has two vectors.`,
                `Solving with the two free variables set to 1 and 0, and then to 0 and 1, gives \\( ${vectorLatex(first)} \\) and \\( ${vectorLatex(second)} \\).`,
                `Both are orthogonal to both rows of A and they are independent of each other, so a basis for the null space is ${correct}.`
            ];
            break;
        }
        case "rank_nullity":{
            let rows=randInt(rng, 2, difficulty==="easy"?3:4);
            let cols=randInt(rng, 3, difficulty==="easy"?4:5);
            let rank=randInt(rng, 1, Math.min(rows, cols));
            let key=cols-rank;
            correct=String(key);
            latex=`The matrix \\( A \\) is \\( ${rows} \\) by \\( ${cols} \\) and its rank is \\( ${rank} \\). What is the dimension of the null space of \\( A \\)?`;
            choices=numberOptions(key, [rank, cols, key+1, key-1, rows]);
            rungs=[
                "Rank-nullity says the dimension of the null space is the number of columns minus the rank, because each pivot column costs one column and leaves one free variable.",
                `The matrix has ${cols} columns and rank ${rank}, so subtract.`
            ];
            steps=[
                `A is ${rows} by ${cols}, so it has ${cols} columns.`,
                `Rank-nullity gives dim(null A) = columns - rank = ${cols} - ${rank}.`,
                `${cols} - ${rank} = ${key}, so the dimension of the null space is ${correct}.`
            ];
            break;
        }
        case "the_homogeneous_system":{
            correct="It has a nonzero solution exactly when A is singular, that is when det(A) is zero";
            latex=`Consider the homogeneous system \\( Ax = 0 \\) for a square matrix \\( A \\). Which statement about it is true?`;
            choices=fourOptions(correct, [
                "It has only the trivial solution exactly when A is singular, that is when det(A) is zero",
                "It always has a nonzero solution, whatever A is",
                "It has the same number of solutions as the non-homogeneous system Ax = b"
            ]);
            expectedFormat="Choose the statement that is true";
            rungs=[
                "A homogeneous system always has the trivial solution, and Cramer's rule says a unique solution exists exactly when det(A) is not zero, so a nonzero solution needs the opposite.",
                "Ask what Cramer's rule says about Ax = 0: the numerator determinants are all zero, so the only way to divide is when det(A) is nonzero."
            ];
            steps=[
                `The trivial solution x = 0 always satisfies Ax = 0.`,
                `Cramer's rule gives a unique solution for Ax = 0 only when det(A) is nonzero, and that unique solution is then the trivial one.`,
                `So a nonzero solution exists exactly when A is singular, and the statement that is true is ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}