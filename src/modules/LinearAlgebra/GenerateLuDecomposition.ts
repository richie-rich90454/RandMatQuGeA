/**
 * @file LU decomposition: the factors, the row swap elimination needs, the
 * determinant they carry, and solving a system with them.
 * @description A = L U is built forwards here, from a unit lower-triangular L and an
 * upper-triangular U with nonzero pivots, so the printed A is exactly the product of
 * the printed factors and Doolittle's algorithm recovers those same factors from it.
 * Because L is unit lower triangular its diagonal is all ones, which is what makes
 * the determinant of A the product of U's diagonal and nothing else.
 *
 * The swap branch is built with the second multiplier set to zero, which forces the
 * first entry of A to be zero and therefore forces one row swap before elimination
 * can start. A row swap negates a determinant, and the key is the value that already
 * includes that negation.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randNonZero, randInt}from "../shared/Random";
import{trimNum}from"../shared/Latex";

/**
 * The determinant of a small square matrix, by Laplace expansion on the first row.
 *
 * @param m - The matrix.
 * @returns The determinant, an exact integer.
 */
function determinant(m: number[][]): number{
    let n=m.length;
    if (n===1) return m[0][0];
    let total=0;
    for(let j=0; j<n; j++){
        let minor=[];
        for(let i=1; i<n; i++){
            let row=[];
            for(let k=0; k<n; k++){
                if (k!==j) row.push(m[i][k]);
            }
            minor.push(row);
        }
        total+=(j%2===0?1:-1)*m[0][j]*determinant(minor);
    }
    return total;
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
 * Renders a column vector for a prompt.
 *
 * @param v - The vector.
 * @returns The LaTeX body, without math delimiters.
 */
function vectorLatex(v: number[]): string{
    return `\\begin{bmatrix} ${v.map(x=>trimNum(x)).join(" \\\\ ")} \\end{bmatrix}`;
}

/**
 * Renders a matrix as a plain option, because options are text rather than typeset
 * mathematics.
 *
 * @param m - The matrix.
 * @returns The option text.
 */
function matrixText(m: number[][]): string{
    return `[${m.map(row=>`[${row.join(", ")}]`).join(", ")}]`;
}

/**
 * A unit lower-triangular L and an upper-triangular U with nonzero pivots. The
 * multipliers are whole numbers, so A = L U is a whole-number matrix and every entry
 * a learner has to compute is exact.
 *
 * @param rng - The injected random source.
 * @param spread - The largest magnitude allowed for a multiplier or an upper entry.
 * @param firstMultiplier - Set to zero to force a leading zero in A and so a row swap.
 * @returns The two factors.
 */
function factors(rng: RngFn, spread: number, firstMultiplier: boolean): {lower: number[][], upper: number[][]}{
    let second=firstMultiplier?0:randInt(rng, -spread, spread);
    let third=randInt(rng, -spread, spread);
    let fourth=randInt(rng, -spread, spread);
    let lower=[[1, 0, 0], [second, 1, 0], [third, fourth, 1]];
    let upper=[
        [randNonZero(rng, -spread, spread, 0), randInt(rng, -spread, spread), randInt(rng, -spread, spread)],
        [0, randNonZero(rng, -spread, spread, 0), randInt(rng, -spread, spread)],
        [0, 0, randNonZero(rng, -spread, spread, 0)]
    ];
    return {lower, upper};
}

export function generateLuDecomposition(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["without_pivoting", "with_row_swaps", "determinant_from_the_factors", "solve_using_the_factors"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?2:difficulty==="hard"?4:3;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "without_pivoting":{
            let parts=factors(rng, spread, false);
            let product=multiply(parts.lower, parts.upper);
            if (rng()<0.5){
                let row=2;
                let column=3;
                let key=(product[1] as number[])[2];
                correct=String(key);
                latex=`Let \\( A = LU \\), where \\( L = ${matrixLatex(parts.lower)} \\) and \\( U = ${matrixLatex(parts.upper)} \\). What is the entry in row ${row}, column ${column} of the product \\( A \\)?`;
                choices=numberOptions(key, [(parts.upper[1] as number[])[2], parts.lower[1][0], (parts.lower[1][0] as number)*((parts.upper[0] as number[])[2]), key+1, key-1]);
                rungs=[
                    "An entry of a matrix product is the dot product of a row of the left factor with a column of the right factor, not a single product.",
                    `Row ${row} of L is ${(parts.lower[1] as number[]).join(", ")} and column ${column} of U is ${[0, 1, 2].map(i=>(parts.upper[i] as number[])[2]).join(", ")}.`
                ];
                steps=[
                    `Row ${row} of L is ${(parts.lower[1] as number[]).join(", ")} and column ${column} of U is ${[0, 1, 2].map(i=>(parts.upper[i] as number[])[2]).join(", ")}.`,
                    `Their dot product is ${(parts.lower[1] as number[])[0]} x ${(parts.upper[0] as number[])[2]} + ${(parts.lower[1] as number[])[1]} x ${(parts.upper[1] as number[])[2]} = ${(parts.lower[1] as number[])[0]*((parts.upper[0] as number[])[2] as number)} + ${(parts.upper[1] as number[])[2]}.`,
                    `That sum is ${key}, so the entry in row ${row}, column ${column} of A is ${correct}.`
                ];
            }
            else{
                correct=matrixText(product);
                latex=`Let \\( A = LU \\), where \\( L = ${matrixLatex(parts.lower)} \\) and \\( U = ${matrixLatex(parts.upper)} \\). Find the product \\( LU \\).`;
                let reversedRows=product.slice().reverse();
                let reversedColumns=product.map(row=>row.slice().reverse());
                let bumped=product.map(row=>row.slice());
                (bumped[1] as number[])[2]=(bumped[1] as number[])[2]+1;
                expectedFormat="Enter as [[a, b, c], [d, e, f], [g, h, i]]";
                choices=fourOptions(correct, [matrixText(transpose(product)), matrixText(reversedRows), matrixText(reversedColumns), matrixText(bumped)]);
                rungs=[
                    "A = L U is an ordinary matrix product, so every entry is the dot product of a row of L with a column of U.",
                    `L is ${matrixLatex(parts.lower)} and U is ${matrixLatex(parts.upper)}, so form all nine dot products.`
                ];
                steps=[
                    `The rows of L are ${(parts.lower[0] as number[]).join(", ")}, ${(parts.lower[1] as number[]).join(", ")} and ${(parts.lower[2] as number[]).join(", ")}, and the columns of U are ${[0, 1, 2].map(i=>[0, 1, 2].map(j=>(parts.upper[j] as number[])[i]).join(", ")).join("; ")}.`,
                    `Each entry of A is the dot product of one row of L with one column of U, and all nine come out whole numbers.`,
                    `The product is ${correct}.`
                ];
            }
            break;
        }
        case "with_row_swaps":{
            // A zero second multiplier makes the leading entry of A zero, so one row
            // swap is unavoidable and the determinant picks up a single minus sign.
            let parts=factors(rng, spread, true);
            let product=multiply(parts.lower, parts.upper);
            let matrix: number[][]=[product[1] as number[], product[0] as number[], product[2] as number[]];
            let pivots=(parts.upper[0] as number[])[0]*((parts.upper[1] as number[])[1] as number)*((parts.upper[2] as number[])[2] as number);
            let key=determinant(matrix);
            correct=String(key);
            latex=`Eliminating \\( A = ${matrixLatex(matrix)} \\) by row operations to echelon form needs one row swap at the start, because the leading entry of the first row is zero, and no row scalings. Given that the pivots produced are \\( ${(parts.upper[0] as number[])[0]} \\), \\( ${(parts.upper[1] as number[])[1]} \\) and \\( ${(parts.upper[2] as number[])[2]} \\), what is \\( \\det(A) \\)?`;
            choices=numberOptions(key, [pivots, -pivots, pivots*2, key+1, 0]);
            rungs=[
                "A row swap multiplies a determinant by minus one while row replacement leaves it alone, so the product of the pivots is det(A) with one minus sign for the swap.",
                `The pivots are ${(parts.upper[0] as number[])[0]}, ${(parts.upper[1] as number[])[1]} and ${(parts.upper[2] as number[])[2]}, and exactly one row swap was used.`
            ];
            steps=[
                `Row reduction to echelon form gives an upper-triangular matrix whose determinant is the product of its pivots, ${(parts.upper[0] as number[])[0]} x ${(parts.upper[1] as number[])[1]} x ${(parts.upper[2] as number[])[2]} = ${pivots}.`,
                `Exactly one row swap was used, and a row swap negates the determinant; the row replacements leave it alone.`,
                `det(A) = -${pivots} = ${key}, so the determinant is ${correct}.`
            ];
            break;
        }
        case "determinant_from_the_factors":{
            let parts=factors(rng, spread, false);
            let pivots=(parts.upper[0] as number[])[0]*((parts.upper[1] as number[])[1] as number)*((parts.upper[2] as number[])[2] as number);
            let key=pivots;
            correct=String(key);
            latex=`Let \\( A = LU \\), where \\( L = ${matrixLatex(parts.lower)} \\) and \\( U = ${matrixLatex(parts.upper)} \\). What is \\( \\det(A) \\)?`;
            choices=numberOptions(key, [-key, key+1, key-1, 0]);
            rungs=[
                "The determinant of a product is the product of the determinants, and the diagonal of a unit lower-triangular L is all ones, so det(A) is the product of U's diagonal alone.",
                `Read the three diagonal entries of U, which are ${(parts.upper[0] as number[])[0]}, ${(parts.upper[1] as number[])[1]} and ${(parts.upper[2] as number[])[2]}, and multiply them.`
            ];
            steps=[
                `L is unit lower triangular, so det(L) = 1 x 1 x 1 = 1.`,
                `U is upper triangular, so det(U) = ${(parts.upper[0] as number[])[0]} x ${(parts.upper[1] as number[])[1]} x ${(parts.upper[2] as number[])[2]} = ${key}.`,
                `det(A) = det(L) x det(U) = 1 x ${key} = ${key}, so the determinant is ${correct}.`
            ];
            break;
        }
        case "solve_using_the_factors":{
            // The system is built from its solution: x is drawn, then y = U x, then
            // b = L y, so forward substitution and back substitution both land exactly
            // on whole numbers with no rounding anywhere.
            let parts=factors(rng, spread, false);
            let solved=[randInt(rng, -4, 4), randInt(rng, -4, 4), randInt(rng, -4, 4)];
            let middle=multiply(parts.upper, [solved])[0] as number[];
            let matrix=multiply(parts.lower, parts.upper);
            let right=multiply(parts.lower, [middle])[0] as number[];
            let key=solved[0];
            correct=String(key);
            latex=`Solve the system \\( Ax = b \\) for \\( x_1 \\), where \\( A = ${matrixLatex(matrix)} \\) and \\( b = ${vectorLatex(right)} \\). Use the factors \\( A = LU \\), with \\( L = ${matrixLatex(parts.lower)} \\) and \\( U = ${matrixLatex(parts.upper)} \\).`;
            choices=numberOptions(key, [solved[1], -key, middle[0], (parts.upper[0] as number[])[0], key+1]);
            rungs=[
                "Split the system into two: forward substitution solves L y = b for y, then back substitution solves U x = y for x.",
                `Solve \\( Ly = b \\) first with the multipliers of L, then solve \\( Ux = y \\) from the bottom row upwards.`
            ];
            steps=[
                `Forward substitution on Ly = b gives \\( y = ${vectorLatex(middle)} \\).`,
                `Back substitution on Ux = y then gives \\( x = ${vectorLatex(solved)} \\).`,
                `The first coordinate of that solution is ${key}, so the value of x1 is ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}