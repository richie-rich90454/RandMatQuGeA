/**
 * @file Eigenvalues, eigenvectors, characteristic polynomials and diagonalisation.
 * @description The eigenvalues are chosen first and the matrix is then built from
 * them by a change of basis whose basis matrix has determinant one, so every
 * eigenvalue, every eigenvector and every coefficient of the characteristic
 * polynomial is an exact integer. Nothing in this file is rounded, which is the
 * point: a matrix drawn at random has irrational eigenvalues often enough that
 * grading a characteristic-polynomial question on a rounded root asks the learner
 * to reproduce an answer that does not follow from the printed matrix.
 *
 * Defective matrices appear only in the branch that asks the learner to recognise
 * one, because everywhere else "find an eigenvector" would have no answer.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, randNonZero, pick}from"../shared/Random";
import{trimNum}from"../shared/Latex";

/**
 * The determinant of a small square matrix, by Laplace expansion.
 *
 * @param m - The matrix.
 * @returns The determinant.
 */
function determinant(m: number[][]): number{
    let n=m.length;
    if (n===1) return m[0][0];
    let total=0;
    for(let j=0; j<n; j++){
        total+=(j%2===0?1:-1)*m[0][j]*determinant(minorOf(m, 0, j));
    }
    return total;
}

/**
 * The matrix with one row and one column removed.
 *
 * @param m - The matrix.
 * @param row - The row index to drop.
 * @param col - The column index to drop.
 * @returns The remaining matrix.
 */
function minorOf(m: number[][], row: number, col: number): number[][]{
    let out: number[][]=[];
    for(let i=0; i<m.length; i++){
        if (i===row) continue;
        let kept: number[]=[];
        for(let j=0; j<m[i].length; j++){
            if (j!==col) kept.push(m[i][j]);
        }
        out.push(kept);
    }
    return out;
}

/**
 * The inverse of a small square matrix, from the adjugate. Every matrix inverted
 * here comes from one of the two unimodular constructors below, so its determinant
 * is exactly one and the division is exact rather than an approximation.
 *
 * @param m - The matrix to invert.
 * @returns The inverse.
 */
function invert(m: number[][]): number[][]{
    let d=determinant(m);
    let n=m.length;
    let out: number[][]=[];
    for(let i=0; i<n; i++){
        let row: number[]=[];
        for(let j=0; j<n; j++){
            let minor=determinant(minorOf(m, j, i));
            row.push(((i+j)%2===0?minor:-minor)/d);
        }
        out.push(row);
    }
    return out;
}

/**
 * The product of two matrices of compatible shape.
 *
 * @param a - The left factor.
 * @param b - The right factor.
 * @returns The product.
 */
function multiply(a: number[][], b: number[][]): number[][]{
    let out: number[][]=[];
    for(let i=0; i<a.length; i++){
        let row: number[]=[];
        for(let j=0; j<b[0].length; j++){
            let sum=0;
            for(let t=0; t<b.length; t++) sum+=a[i][t]*b[t][j];
            row.push(sum);
        }
        out.push(row);
    }
    return out;
}

/**
 * The matrix whose eigenvalues in the given basis are the given values, that is the
 * change of basis, the diagonal form, and the change back. Because the basis is
 * unimodular the result has whole-number entries, and the columns of the basis are
 * its eigenvectors, which is the single source of truth every branch below reads
 * its eigenvectors from.
 *
 * @param basis - The change-of-basis matrix, with determinant one.
 * @param values - The eigenvalues, column by column through the basis.
 * @returns The matrix.
 */
function withEigenvalues(basis: number[][], values: number[]): number[][]{
    let n=values.length;
    let diagonal: number[][]=[];
    for(let i=0; i<n; i++){
        let row: number[]=[];
        for(let j=0; j<n; j++) row.push(i===j?values[i]:0);
        diagonal.push(row);
    }
    return multiply(multiply(basis, diagonal), invert(basis));
}

/**
 * A two-by-two matrix of determinant one, built as a product of two shears so that
 * its inverse is integral. With one shear set to zero the matrix it produces is
 * triangular, which is the easy form: its eigenvalues can be read off the diagonal.
 *
 * @param k - The first shear.
 * @param m - The second shear.
 * @returns The basis matrix.
 */
function unimodular2(k: number, m: number): number[][]{
    return [[1+k*m, k],[m, 1]];
}

/**
 * A three-by-three matrix of determinant one, from three shears followed by an even
 * row permutation, which leaves the determinant at one. The permutation is what
 * stops the matrix collapsing to triangular form every time.
 *
 * @param a - The first shear.
 * @param b - The second shear.
 * @param c - The third shear.
 * @param rotation - Which even permutation of the rows to apply.
 * @returns The basis matrix.
 */
function unimodular3(a: number, b: number, c: number, rotation: number): number[][]{
    let shears=[[1+a*b, a, 0],[b, 1, 0],[0, c, 1]];
    let orders=[[0, 1, 2],[1, 2, 0], [2, 0, 1]];
    let order=orders[rotation];
    let out: number[][]=[];
    for(let i=0; i<3; i++) out.push(shears[order[i]].slice());
    return out;
}

/**
 * Draws distinct whole-number eigenvalues from the given spread. The search is
 * bounded and falls back to a fixed ladder of distinct values, because a spread
 * narrower than the number of eigenvalues asked for would otherwise spin forever.
 *
 * @param rng - The injected random source.
 * @param count - How many eigenvalues are needed.
 * @param spread - The largest magnitude allowed.
 * @returns Distinct whole numbers, in increasing order.
 */
function drawEigenvalues(rng: RngFn, count: number, spread: number): number[]{
    let chosen: number[]=[];
    for(let attempt=0; attempt<64&&chosen.length<count; attempt++){
        let value=randInt(rng, -spread, spread);
        if (chosen.indexOf(value)<0) chosen.push(value);
    }
    let ladder=[1, 2, 3, 4, -1, -2, -3, 5, -4];
    for(let i=0; i<ladder.length&&chosen.length<count; i++){
        if (chosen.indexOf(ladder[i])<0) chosen.push(ladder[i]);
    }
    chosen.sort((a, b)=>a-b);
    return chosen;
}

/**
 * The change-of-basis matrix for a question of the given size and difficulty.
 *
 * @param rng - The injected random source.
 * @param size - Two or three.
 * @param difficulty - The level, which decides whether the matrix is triangular.
 * @returns A basis matrix of determinant one.
 */
function buildBasis(rng: RngFn, size: number, difficulty?: string): number[][]{
    if (size===2){
        if (difficulty==="easy") return unimodular2(pick(rng, [-1, 1]), 0);
        return unimodular2(randNonZero(rng, -2, 2, 0), randNonZero(rng, -2, 2, 0));
    }
    return unimodular3(randInt(rng, 1, 2), randInt(rng, 1, 2), randNonZero(rng, -3, 3, 0), randInt(rng, 0, 2));
}

/**
 * One column of a matrix, as a vector.
 *
 * @param m - The matrix.
 * @param index - The column index.
 * @returns The column.
 */
function column(m: number[][], index: number): number[]{
    let out: number[]=[];
    for(let i=0; i<m.length; i++) out.push(m[i][index]);
    return out;
}

/**
 * A copy of a matrix, so a distractor can be perturbed without touching the answer.
 *
 * @param m - The matrix.
 * @returns The copy.
 */
function matrixCopy(m: number[][]): number[][]{
    return m.map(row=>row.slice());
}

/**
 * The transpose of a square matrix.
 *
 * @param m - The matrix.
 * @returns The transpose.
 */
function transpose(m: number[][]): number[][]{
    let out: number[][]=[];
    for(let j=0; j<m[0].length; j++){
        let row: number[]=[];
        for(let i=0; i<m.length; i++) row.push(m[i][j]);
        out.push(row);
    }
    return out;
}

/**
 * Reports whether a vector is the zero vector, which no eigenvector may be.
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
 * Reports whether two vectors point the same way. Every nonzero multiple of an
 * eigenvector is that same eigenvector, so this decides whether an offered option
 * is a second correct answer rather than a wrong one.
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
 * Reports whether two matrices carry the same eigenvectors up to scaling of their
 * columns, which is the relation that makes a second matrix just as correct an
 * answer to a diagonalisation question as the first.
 *
 * @param key - The correct basis matrix.
 * @param candidate - The offered matrix.
 * @returns True when the two diagonalise the same matrix.
 */
function isColumnEquivalent(key: number[][], candidate: number[][]): boolean{
    if (isParallel(column(key, 0), column(candidate, 0))&&isParallel(column(key, 1), column(candidate, 1))) return true;
    return isParallel(column(key, 0), column(candidate, 1))&&isParallel(column(key, 1), column(candidate, 0));
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
    return `\\langle ${v.map(x=>trimNum(x)).join(", ")} \\rangle`;
}

/**
 * Renders a vector as a plain option, because options are text rather than typeset
 * mathematics.
 *
 * @param v - The vector.
 * @returns The option text.
 */
function vectorText(v: number[]): string{
    return `(${v.map(x=>String(x)).join(", ")})`;
}

/**
 * Renders a matrix as a plain option, because options are text rather than typeset
 * mathematics.
 *
 * @param m - The matrix.
 * @returns The option text.
 */
function matrixText(m: number[][]): string{
    return `[${m.map(row=>`[${row.map(x=>String(x)).join(", ")}]`).join(", ")}]`;
}

/**
 * The trace of a square matrix, the sum of the two-by-two principal minors, and its
 * determinant, which are the three coefficients below the leading term of the
 * characteristic polynomial. Reading them off the matrix is the whole of the work in
 * the branches that ask for the polynomial, so they are computed once here rather
 * than three times in the generator.
 *
 * @param m - The matrix.
 * @returns The trace, the sum of the principal minors, and the determinant.
 */
function invariants(m: number[][]): {trace: number, minors: number[], minorSum: number, determinant: number}{
    let n=m.length;
    let trace=0;
    for(let i=0; i<n; i++) trace+=m[i][i];
    let minors: number[]=[];
    for(let i=0; i<n; i++) minors.push(determinant(minorOf(m, i, i)));
    let minorSum=0;
    for(let value of minors) minorSum+=value;
    return {trace, minors, minorSum, determinant: determinant(m)};
}

/**
 * Assembles the option set: the answer, then three distractors, dropping anything
 * that repeats an option already offered. The answer stays first, and the
 * distractors keep the order they were built in, because the app chooses where the
 * answer is displayed and reordering here would only cost draws.
 *
 * @param correct - The answer.
 * @param candidates - The wrong options, best first.
 * @returns The answer followed by up to three wrong options.
 */
function fourOptions(correct: string, candidates: string[]): string[]{
    let seen=new Set<string>([correct.trim()]);
    let out=[correct];
    for(let text of candidates){
        let key=text.trim();
        if (key===""||seen.has(key)) continue;
        seen.add(key);
        out.push(text);
        if (out.length===4) break;
    }
    return out;
}

/**
 * The wrong eigenvalue sets, built as the answers to the mistakes this topic
 * trains against: negating every root, and displacing one root. The answer is
 * always printed in increasing order, so two options can never be the same set
 * written in a different order.
 *
 * @param values - The correct eigenvalues, in increasing order.
 * @returns Candidate option texts.
 */
function eigenvalueDistractors(values: number[]): string[]{
    let negated=values.map(v=>-v);
    let raised=values.slice();
    raised[0]=values[0]+1;
    let last=values.length-1;
    let lowered=values.slice();
    lowered[last]=values[last]-1;
    let shifted=values.slice();
    shifted[1]=values[1]+1;
    let rotated=values.slice();
    rotated[last]=values[0]+values[last];
    return [negated, raised, lowered, shifted, rotated].map(v=>v.join(", "));
}

/**
 * The wrong options for an eigenvector, all of them either the eigenvector of the
 * other eigenvalue or the correct vector with one entry displaced. Displacing
 * coordinate `i` of a vector that is not already along that axis can never leave it
 * proportional, so this pool is provably wrong rather than merely different.
 *
 * @param basis - The change-of-basis matrix.
 * @param index - The column holding the wanted eigenvector.
 * @returns Candidate option texts.
 */
function eigenvectorDistractors(basis: number[][], index: number): string[]{
    let n=basis.length;
    let wanted=column(basis, index);
    let pool: number[][]=[];
    for(let i=0; i<n; i++){
        if (i!==index) pool.push(column(basis, i));
    }
    for(let i=0; i<n; i++){
        let spansAxis=true;
        for(let j=0; j<n; j++){
            if (j!==i&&wanted[j]!==0) spansAxis=false;
        }
        if (spansAxis) continue;
        for(let delta of [1, -1, 2, -2, 3]){
            let copy=wanted.slice();
            copy[i]=copy[i]+delta;
            pool.push(copy);
        }
    }
    return pool.filter(v=>!isParallel(wanted, v)).map(v=>vectorText(v));
}

/**
 * The coefficients of the characteristic polynomial, from the monic factorisation
 * over the eigenvalues. The multiplication stays in whole-number arithmetic, so no
 * root is ever approximated on the way to a printed coefficient.
 *
 * @param values - The eigenvalues.
 * @returns Coefficients from the leading term down to the constant.
 */
function characteristic(values: number[]): number[]{
    let out=[1];
    for(let value of values){
        let next=out.concat([0]);
        for(let i=next.length-1; i>0; i--) next[i]=next[i]-next[i-1]*value;
        out=next;
    }
    return out;
}

/**
 * Renders a polynomial as plain text. The same form is used for the answer, the
 * options and the displayed answer: it reads correctly as text and renders
 * correctly when it is typeset, so there is no second spelling to keep in step.
 *
 * @param coeffs - Coefficients from the leading term down to the constant.
 * @returns The polynomial.
 */
function polynomialText(coeffs: number[]): string{
    let degree=coeffs.length-1;
    let parts: string[]=[];
    for(let i=0; i<coeffs.length; i++){
        let value=coeffs[i];
        if (value===0) continue;
        let power=degree-i;
        let magnitude=Math.abs(value);
        let piece=power===0?String(magnitude):(magnitude===1?(power===1?"x":`x^${power}`):`${magnitude}x${power===1?"":`^${power}`}`);
        parts.push(parts.length===0?(value<0?"-":"")+piece:(value<0?" - ":" + ")+piece);
    }
    return parts.length===0?"0":parts.join("");
}

/**
 * The wrong polynomials, built as the characteristic polynomials a learner writes
 * when the trace or the determinant carries the wrong sign, or when the two leading
 * coefficients are swapped.
 *
 * @param coeffs - The correct coefficients.
 * @returns Candidate option texts.
 */
function polynomialDistractors(coeffs: number[]): string[]{
    let lead=coeffs.slice();
    lead[1]=lead[1]*-1;
    let tail=coeffs.slice();
    tail[tail.length-1]=tail[tail.length-1]*-1;
    let bumped=coeffs.slice();
    bumped[bumped.length-1]=bumped[bumped.length-1]+1;
    let partner=coeffs.length-2;
    let swapped=coeffs.slice();
    swapped[1]=coeffs[partner];
    swapped[partner]=coeffs[1];
    let inverted=coeffs.map(c=>-c);
    return [polynomialText(lead), polynomialText(tail), polynomialText(bumped), polynomialText(swapped), polynomialText(inverted)];
}

/**
 * The wrong change-of-basis matrices: the eigenvectors laid out as rows, the columns
 * in the wrong order, and single entries displaced. Anything a column rescaling
 * could still make correct is filtered out.
 *
 * @param basis - The correct basis matrix.
 * @returns Candidate option texts.
 */
function basisDistractors(basis: number[][]): string[]{
    let n=basis.length;
    let pool: number[][][]=[];
    pool.push(transpose(basis));
    pool.push(matrixCopy(basis).map(row=>row.reverse()));
    for(let i=0; i<n; i++){
        for(let j=0; j<n; j++){
            for(let delta of [1, -1, 2, 3]){
                let copy=matrixCopy(basis);
                copy[i][j]=copy[i][j]+delta;
                pool.push(copy);
            }
        }
    }
    return pool.filter(m=>!isColumnEquivalent(basis, m)).map(m=>matrixText(m));
}

/**
 * A matrix whose eigenvalues repeat, in one of the three shapes a repeated
 * eigenvalue can take: a Jordan block with one eigenvector, a two-block plus a
 * distinct eigenvalue with two, or a scalar matrix with three. Between them they
 * cover defective and not defective, which is what the branch is for.
 *
 * @param rng - The injected random source.
 * @returns The matrix and how many linearly independent eigenvectors it has.
 */
function repeatedCase(rng: RngFn): {matrix: number[][], independent: number, eigenvalues: number[]}{
    let shape=randInt(rng, 0, 2);
    let value=randInt(rng, -4, 5);
    let other=randInt(rng, -5, 6);
    if (other===value) other=value+1;
    if (shape===0) return {matrix:[[value, 1, 0], [0, value, 1], [0, 0, value]], independent:1, eigenvalues:[value, value, value]};
    if (shape===1) return {matrix:[[value, 1, 0], [0, value, 0], [0, 0, other]], independent:2, eigenvalues:[value, value, other]};
    return {matrix:[[value, 0, 0], [0, value, 0], [0, 0, value]], independent:3, eigenvalues:[value, value, value]};
}

export function generateEigenvalues(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=difficulty==="easy"?["eigenvalues_2x2", "eigenvector"]
        :difficulty==="hard"?["eigenvalues_3x3", "eigenvector", "characteristic_polynomial", "diagonalise", "defective"]
        :["eigenvalues_2x2", "eigenvector", "characteristic_polynomial", "diagonalise"];
    let type=pick(rng, types);
    let spread=difficulty==="easy"?4:difficulty==="hard"?6:5;
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "eigenvalues_2x2":
        case "eigenvalues_3x3":{
            let size=type==="eigenvalues_3x3"?3:2;
            let basis=buildBasis(rng, size, difficulty);
            let values=drawEigenvalues(rng, size, spread);
            let matrix=withEigenvalues(basis, values);
            correct=values.join(", ");
            alternate=correct;
            display=`\\( ${matrixLatex(matrix)} \\text{ has eigenvalues } ${values.join(", ")} \\)`;
            latex=`Find the eigenvalues of \\( A = ${matrixLatex(matrix)} \\), in increasing order.`;
            expectedFormat="Enter the eigenvalues in increasing order, separated by commas";
            choices=fourOptions(correct, eigenvalueDistractors(values));
            let summary=invariants(matrix);
            if (size===2){
                rungs=[
                    "The trace of a two-by-two matrix is the sum of its eigenvalues and its determinant is their product, so the two eigenvalues are the roots of x squared minus the trace times x plus the determinant.",
                    `Read the trace and the determinant off the matrix and find the two whole numbers with that sum and that product.`
                ];
                steps=[
                    `The trace is ${summary.trace} and the determinant is ${summary.determinant}.`,
                    `A two-by-two characteristic polynomial is x^2 - (${summary.trace})x + (${summary.determinant}), whose roots are the two eigenvalues.`,
                    `Its roots are ${values[0]} and ${values[1]}, so in increasing order the eigenvalues are ${correct}.`
                ];
            }
            else{
                rungs=[
                    "A three-by-three characteristic polynomial is x cubed, then minus the trace times x squared, plus the sum of the two-by-two principal minors times x, then minus the determinant.",
                    `Compute the trace, the three principal minors and the determinant of the matrix, then factor the polynomial that comes out.`
                ];
                steps=[
                    `The trace is ${summary.trace}, the principal minors are ${summary.minors.join(", ")} and so sum to ${summary.minorSum}, and the determinant is ${summary.determinant}.`,
                    `p(x) = x^3 - (${summary.trace})x^2 + (${summary.minorSum})x - (${summary.determinant}), whose roots are the eigenvalues.`,
                    `Factoring gives the roots ${values[0]}, ${values[1]} and ${values[2]}, so in increasing order the eigenvalues are ${correct}.`
                ];
            }
            break;
        }
        case "eigenvector":{
            let size=difficulty==="hard"?3:2;
            let basis=buildBasis(rng, size, difficulty);
            let values=drawEigenvalues(rng, size, spread);
            let matrix=withEigenvalues(basis, values);
            let index=randInt(rng, 0, size-1);
            let wanted=column(basis, index);
            correct=vectorText(wanted);
            alternate=correct;
            display=vectorLatex(wanted);
            latex=`Give an eigenvector of \\( A = ${matrixLatex(matrix)} \\) corresponding to \\( \\lambda = ${values[index]} \\).`;
            expectedFormat=size===2?"Enter as (a, b)":"Enter as (a, b, c)";
            choices=fourOptions(correct, eigenvectorDistractors(basis, index));
            let lambda=values[index] as number;
            let image=multiply(matrix, [wanted])[0] as number[];
            let scaled=wanted.map(x=>lambda*x);
            rungs=[
                "An eigenvector for lambda is a nonzero vector v with A v equal to lambda v, so the rows of A minus lambda times the identity give a homogeneous system whose null space is the answer.",
                "Set up (A - lambda I)v = 0 for the lambda the prompt names, then read a free variable off the resulting system."
            ];
            steps=[
                `With lambda = ${lambda}, the system (A - ${lambda}I)v = 0 has the solution ${vectorLatex(wanted)} up to a nonzero multiple.`,
                `Checking it: A times ${vectorLatex(wanted)} is ${vectorLatex(image)}, and ${lambda} times that vector is ${vectorLatex(scaled)}.`,
                `So an eigenvector for lambda = ${lambda} is ${correct}.`
            ];
            break;
        }
        case "characteristic_polynomial":{
            let size=difficulty==="hard"?3:2;
            let basis=buildBasis(rng, size, difficulty);
            let values=drawEigenvalues(rng, size, spread);
            let matrix=withEigenvalues(basis, values);
            let coeffs=characteristic(values);
            correct=polynomialText(coeffs);
            alternate=correct;
            display=`\\( p(x) = ${correct} \\)`;
            latex=`Find the characteristic polynomial \\( p(x) = \\det(xI - A) \\) of \\( A = ${matrixLatex(matrix)} \\).`;
            expectedFormat="Enter the polynomial in descending powers of x";
            choices=fourOptions(correct, polynomialDistractors(coeffs));
            let summary=invariants(matrix);
            if (size===2){
                rungs=[
                    "For a two-by-two matrix, det(xI - A) is x squared minus the trace times x plus the determinant, so the whole polynomial comes from two numbers on the matrix.",
                    "Add the diagonal entries for the trace and work out the determinant, then substitute both."
                ];
                steps=[
                    `The trace is ${summary.trace} and the determinant is ${summary.determinant}.`,
                    `p(x) = x^2 - (${summary.trace})x + (${summary.determinant}).`,
                    `Written out in descending powers of x that is ${correct}.`
                ];
            }
            else{
                rungs=[
                    "For a three-by-three matrix, det(xI - A) is x cubed, then minus the trace times x squared, plus the sum of the three two-by-two principal minors times x, then minus the determinant.",
                    "Compute the trace, each of the three principal minors formed by deleting a row and its matching column, and the determinant, then substitute all of them."
                ];
                steps=[
                    `The trace is ${summary.trace}, the principal minors are ${summary.minors.join(", ")} and sum to ${summary.minorSum}, and the determinant is ${summary.determinant}.`,
                    `p(x) = x^3 - (${summary.trace})x^2 + (${summary.minorSum})x - (${summary.determinant}).`,
                    `Written out in descending powers of x that is ${correct}.`
                ];
            }
            break;
        }
        case "diagonalise":{
            let basis=buildBasis(rng, 2, difficulty);
            let values=drawEigenvalues(rng, 2, spread);
            let matrix=withEigenvalues(basis, values);
            correct=matrixText(basis);
            alternate=correct;
            display=`\\( ${matrixLatex(matrix)} = P \\begin{bmatrix} ${values[0]} & 0 \\\\ 0 & ${values[1]} \\end{bmatrix} P^{-1} \\)`;
            latex=`The matrix \\( A = ${matrixLatex(matrix)} \\) is diagonalisable. Find \\( P \\) whose first column is an eigenvector for \\( \\lambda = ${values[0]} \\) and whose second column is an eigenvector for \\( \\lambda = ${values[1]} \\).`;
            expectedFormat="Enter as [[a, b], [c, d]]";
            choices=fourOptions(correct, basisDistractors(basis));
            let first=column(basis, 0);
            let second=column(basis, 1);
            rungs=[
                "In a diagonalisation A = P D P inverse, the columns of P are the eigenvectors of A in the order the eigenvalues appear on the diagonal of D.",
                "The first column has to be an eigenvector for the first lambda the prompt names and the second column an eigenvector for the second, and any nonzero multiple in a column is equally correct."
            ];
            steps=[
                `Solve (A - ${values[0]}I)v = 0 for the first column, giving ${vectorLatex(first)} up to a nonzero multiple.`,
                `Solve (A - ${values[1]}I)v = 0 for the second column, giving ${vectorLatex(second)} up to a nonzero multiple.`,
                `With D = diag(${values[0]}, ${values[1]}) the columns in that order give A = P D P inverse, so P = ${correct}.`
            ];
            break;
        }
        case "defective":{
            let repeat=repeatedCase(rng);
            correct=String(repeat.independent);
            alternate=correct;
            display=`${repeat.independent} linearly independent eigenvector${repeat.independent===1?"":"s"}`;
            latex=`How many linearly independent eigenvectors does \\( A = ${matrixLatex(repeat.matrix)} \\) have?`;
            expectedFormat="Enter a whole number from 0 to 3";
            choices=fourOptions(correct, ["0", "1", "2", "3"].filter(v=>v!==correct));
            rungs=[
                "Count the independent eigenvectors by counting dimensions: for each eigenvalue, the number of independent eigenvectors is the nullity of A minus that eigenvalue times the identity.",
                "Find the eigenvalues first, then work out the nullity of A - lambda I for each of them and add those numbers."
            ];
            steps=[
                `The matrix is ${matrixLatex(repeat.matrix)}, whose only eigenvalue is ${repeat.eigenvalues[0]} with algebraic multiplicity ${repeat.eigenvalues.length}.`,
                `A - ${repeat.eigenvalues[0]}I has a null space of dimension ${repeat.independent}, and ${repeat.eigenvalues.length>1&&repeat.eigenvalues[0]!==repeat.eigenvalues[2]?`the second eigenvalue contributes one more, giving ${repeat.independent}`:`so the total over the eigenvalues is ${repeat.independent}`}.`,
                `The number of linearly independent eigenvectors is ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices, expectedFormat, subskill: type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}
