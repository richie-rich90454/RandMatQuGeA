/**
 * @file Symmetric matrices: recognizing symmetry, repeated eigenvalues, orthogonal
 * diagonalisation, and the quadratic form.
 * @description The eigenvalue branches are built rather than sampled, because a
 * symmetric matrix drawn at random has irrational eigenvalues often enough that
 * grading on a rounded root would ask for something the printed matrix does not
 * determine. Here the repeated-eigenvalue branch adds a rank-one symmetric piece to
 * a multiple of the identity: a rank-one piece of the form t v v transpose has one
 * eigenvalue of 9t along v and zero on the two directions perpendicular to it, so the
 * whole matrix has one eigenvalue of k + 9t and a repeated eigenvalue of k, all
 * integers.
 *
 * The orthogonal-diagonalisation branch uses a two-by-two matrix with equal diagonal
 * entries, whose eigenvectors are the diagonal directions and whose eigenvalues are
 * the sum and the difference of its entries. The order of the diagonal is fixed in
 * the prompt, because swapping the columns of Q legitimately swaps the diagonal and
 * would otherwise make two options correct.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";
import{trimNum}from"../shared/Latex";

/**
 * The rank-one symmetric piece whose nonzero eigenvalue is 9. It is the outer product
 * of (2, 2, 1) with itself, whose length is 3, so the eigenvalue along that direction
 * is 3 x 3 = 9.
 */
let RANK_ONE=[[4, 4, 2], [4, 4, 2], [2, 2, 1]];

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
 * The determinant of a small square matrix, by Laplace expansion on the first row.
 *
 * @param m - The matrix.
 * @returns The determinant.
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
 * Reports whether a matrix equals its own transpose.
 *
 * @param m - The matrix.
 * @returns True when every off-diagonal pair matches.
 */
function isSymmetric(m: number[][]): boolean{
    for(let i=0; i<m.length; i++){
        for(let j=0; j<m.length; j++){
            if (m[i][j]!==m[j][i]) return false;
        }
    }
    return true;
}

/**
 * Reports whether every diagonal entry of a matrix is the same number.
 *
 * @param m - The matrix.
 * @returns True when the diagonal is constant.
 */
function constantDiagonal(m: number[][]): boolean{
    for(let i=1; i<m.length; i++){
        if (m[i][i]!==m[0][0]) return false;
    }
    return true;
}

export function generateSymmetricMatrices(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["check_symmetry", "repeated_eigenvalues", "orthogonal_diagonalisation", "quadratic_form"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?3:difficulty==="hard"?5:4;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "check_symmetry":{
            let symmetric=rng()<0.5;
            let matrix: number[][]=[];
            for(let attempt=0; attempt<64; attempt++){
                let candidate: number[][]=[];
                for(let i=0; i<3; i++){
                    let row: number[]=[];
                    for(let j=0; j<3; j++) row.push(randInt(rng, -spread, spread));
                    candidate.push(row);
                }
                // A zero determinant would make the third option true as well, and a
                // constant diagonal would make the fourth one true on a symmetric
                // matrix, so neither is allowed.
                if (determinant(candidate)===0) continue;
                if (constantDiagonal(candidate)) continue;
                if (isSymmetric(candidate)!==symmetric) continue;
                matrix=candidate;
                break;
            }
            if (matrix.length===0) matrix=symmetric?[[2, 1, 0], [1, 3, 4], [0, 4, 5]]:[[2, 1, 5], [7, 3, 4], [5, 4, 6]];
            correct=symmetric?
                "Yes, because every entry above the diagonal equals the entry below it in the same position":
                "No, because at least one pair of off-diagonal entries is unequal";
            latex=`Is the matrix \\( A = ${matrixLatex(matrix)} \\) symmetric?`;
            expectedFormat="Choose the statement that is true";
            choices=fourOptions(correct, symmetric?[
                "No, because at least one pair of off-diagonal entries is unequal",
                "Yes, because every diagonal entry is the same number",
                "No, because its determinant is zero"
            ]:[
                "Yes, because every entry above the diagonal equals the entry below it in the same position",
                "Yes, because every diagonal entry is the same number",
                "No, because its determinant is zero"
            ]);
            rungs=[
                "A matrix is symmetric when it is unchanged by transposing it, which is the same as every entry above the main diagonal having an equal partner below it.",
                "Compare entry (i, j) with entry (j, i) for each of the three pairs off the diagonal."
            ];
            let pair=(matrix[0] as number[])[1]!==(matrix[1] as number[])[0]?[0, 1]:(matrix[0] as number[])[2]!==(matrix[2] as number[])[0]?[0, 2]:[1, 2];
            let row=pair[0] as number;
            let col=pair[1] as number;
            steps=[
                `The off-diagonal entries to compare are ${(matrix[row] as number[])[col]} at position (${row+1}, ${col+1}) and ${(matrix[col] as number[])[row]} at position (${col+1}, ${row+1}).`,
                symmetric?
                    `Every such pair matches, so transposing A leaves it unchanged, and the statement that is true is ${correct}.`
                    :`That pair does not match, so transposing A changes it, and the statement that is true is ${correct}.`
            ];
            break;
        }
        case "repeated_eigenvalues":{
            let repeated=randInt(rng, -4, 5);
            let weight=randInt(rng, 1, 3);
            let matrix: number[][]=[];
            for(let i=0; i<3; i++){
                let row: number[]=[];
                for(let j=0; j<3; j++) row.push((i===j?repeated:0)+weight*((RANK_ONE[i] as number[])[j] as number));
                matrix.push(row);
            }
            let single=repeated+9*weight;
            let key=repeated;
            correct=String(key);
            latex=`The symmetric matrix \\( A = ${matrixLatex(matrix)} \\) has one eigenvalue that is repeated and one that is not. What is the value of the repeated eigenvalue?`;
            choices=numberOptions(key, [single, single+1, 3*repeated+9*weight, key+1, key-1]);
            rungs=[
                "Subtracting a multiple of the identity from a matrix shifts every eigenvalue by that multiple and changes nothing else, so the repeated eigenvalue is the one the shift leaves behind.",
                `The matrix here is ${repeated} times the identity plus a rank-one piece, so subtract ${repeated} from the diagonal and read off what remains.`
            ];
            steps=[
                `Subtracting ${repeated} times the identity from A leaves \\( ${matrixLatex(matrix.map((row, i)=>row.map((v, j)=>v-(i===j?repeated:0))))} \\).`,
                `That remainder is ${weight} times the outer product of (2, 2, 1) with itself, which is ${weight} x 9 = ${9*weight} along the direction (2, 2, 1) and zero in the two directions perpendicular to it.`,
                `So the eigenvalues of A are ${single} once and ${repeated} twice, and the repeated eigenvalue is ${correct}.`
            ];
            break;
        }
        case "orthogonal_diagonalisation":{
            let diagonal=randInt(rng, 6, difficulty==="easy"?9:14);
            let off=randInt(rng, 1, diagonal-1);
            let matrix=[[diagonal, off], [off, diagonal]];
            let key=`diag(${diagonal+off}, ${diagonal-off})`;
            correct=key;
            latex=`The symmetric matrix \\( A = ${matrixLatex(matrix)} \\) has the orthogonal diagonalisation \\( A = Q D Q^{T} \\), where the first column of \\( Q \\) is the eigenvector for the larger eigenvalue. What is the diagonal matrix \\( D \\)?`;
            expectedFormat="Enter the diagonal matrix, for example diag(5, 3)";
            choices=fourOptions(correct, [
                `diag(${diagonal-off}, ${diagonal+off})`,
                `diag(${diagonal+off}, ${diagonal+off})`,
                `diag(${diagonal}, ${off})`
            ]);
            rungs=[
                "When the two diagonal entries are equal, the eigenvectors are the two diagonal directions, and the eigenvalues are the common diagonal entry plus the off-diagonal entry and the common diagonal entry minus it.",
                `Here the diagonal entries are both ${diagonal} and the off-diagonal entries are both ${off}, so the eigenvalues are ${diagonal} + ${off} and ${diagonal} - ${off}.`
            ];
            steps=[
                `The eigenvectors of A are (1, 1) and (1, -1), and these are perpendicular to each other, so Q is orthogonal.`,
                `Along (1, 1) the matrix acts by ${diagonal} + ${off} = ${diagonal+off}, and along (1, -1) it acts by ${diagonal} - ${off} = ${diagonal-off}.`,
                `The first column of Q is the eigenvector for the larger eigenvalue, so the diagonal of D runs from the larger to the smaller, which is ${correct}.`
            ];
            break;
        }
        case "quadratic_form":{
            let matrix: number[][]=[];
            for(let i=0; i<3; i++){
                let row: number[]=[];
                for(let j=0; j<3; j++) row.push(i<=j?randInt(rng, -spread, spread):(matrix[j] as number[])[i] as number);
                matrix.push(row);
            }
            let vector=[randInt(rng, -spread, spread), randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
            let key=quadratic(matrix, vector);
            correct=String(key);
            latex=`Evaluate the quadratic form \\( v^{T} A v \\), where \\( A = ${matrixLatex(matrix)} \\) and \\( v = ${vectorLatex(vector)} \\).`;
            choices=numberOptions(key, [-key, key+1, key-1, diagonalOnly(matrix, vector)]);
            rungs=[
                "Expanding v transposed A v gives the sum of a diagonal term for each coordinate plus twice each off-diagonal term, because each pair (i, j) and (j, i) contributes once and the two are equal in a symmetric matrix.",
                `Multiply A by v first, then dot the result with v.`
            ];
            steps=[
                `Multiplying gives \\( Av = ${vectorLatex(applyMatrix(matrix, vector))} \\).`,
                `Taking the dot product with v gives ${vector.join(" and ")} dotted with that vector.`,
                `${vector[0]*((applyMatrix(matrix, vector))[0] as number)} + ${vector[1]*((applyMatrix(matrix, vector))[1] as number)} + ${vector[2]*((applyMatrix(matrix, vector))[2] as number)} = ${key}, so the quadratic form is ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}

/**
 * The value of the quadratic form v transposed A v.
 *
 * @param m - The symmetric matrix.
 * @param v - The vector.
 * @returns The value.
 */
function quadratic(m: number[][], v: number[]): number{
    let total=0;
    for(let i=0; i<m.length; i++){
        for(let j=0; j<m.length; j++) total+=v[i]*(m[i] as number[])[j]*(v[j] as number);
    }
    return total;
}

/**
 * The part of the quadratic form that comes from the diagonal alone, which is the
 * answer a learner gives after forgetting that each off-diagonal pair counts twice.
 *
 * @param m - The symmetric matrix.
 * @param v - The vector.
 * @returns The diagonal-only value.
 */
function diagonalOnly(m: number[][], v: number[]): number{
    let total=0;
    for(let i=0; i<m.length; i++) total+=v[i]*(m[i] as number[])[i]*(v[i] as number);
    return total;
}

/**
 * The product of a matrix and a column vector.
 *
 * @param a - The matrix.
 * @param v - The column vector.
 * @returns The product.
 */
function applyMatrix(a: number[][], v: number[]): number[]{
    let out: number[]=[];
    for(let i=0; i<a.length; i++){
        let sum=0;
        for(let j=0; j<v.length; j++) sum+=a[i][j]*v[j];
        out.push(sum);
    }
    return out;
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