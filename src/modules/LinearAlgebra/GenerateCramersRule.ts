/**
 * @file Cramer's rule for two-by-two and three-by-three systems, the singular case,
 * and how row reduction relates to a determinant.
 * @description Every system here is built from its answer rather than solved
 * forwards: the solution vector is drawn as whole numbers, the right-hand side is
 * then formed as A times that vector, and the key is a coordinate of the vector the
 * generator started with. That makes each numerator a whole-number multiple of the
 * determinant, so det(A') over det(A) cancels to an integer and the printed system
 * has the printed answer.
 *
 * The singular branch is the one that most often ships a spurious solution, so it
 * is built from a matrix with two identical rows and a right-hand side that is
 * genuinely A times a vector, which makes the system consistent. The only correct
 * statement offered is that Cramer's rule cannot be used, and no option offers a
 * value for the unknowns.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";
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
 * The product of a matrix and a column vector.
 *
 * @param a - The matrix.
 * @param v - The column vector.
 * @returns The product.
 */
function multiply(a: number[][], v: number[]): number[]{
    let out: number[]=[];
    for(let i=0; i<a.length; i++){
        let sum=0;
        for(let j=0; j<v.length; j++) sum+=a[i][j]*v[j];
        out.push(sum);
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

export function generateCramersRule(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["two_by_two", "three_by_three", "when_the_determinant_is_zero", "compare_with_row_echelon"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?3:difficulty==="hard"?6:4;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "two_by_two":
        case "three_by_three":{
            let n=type==="two_by_two"?2:3;
            let matrix: number[][]=[];
            let solved: number[]=[];
            let right: number[]=[];
            let value=0;
            // The system is built from a solution rather than solved, so the key is a
            // whole number by construction. The retry only rules out a singular A,
            // where Cramer's rule would divide by zero.
            for(let attempt=0; attempt<64; attempt++){
                let candidate: number[][]=[];
                for(let i=0; i<n; i++){
                    let row=[];
                    for(let j=0; j<n; j++) row.push(randInt(rng, -spread, spread));
                    candidate.push(row);
                }
                if (determinant(candidate)===0) continue;
                let target=[];
                for(let i=0; i<n; i++) target.push(randInt(rng, -4, 4));
                matrix=candidate;
                solved=target;
                right=multiply(candidate, target);
                value=determinant(candidate);
                break;
            }
            let key=solved[0];
            correct=String(key);
            latex=`Consider the system \\( Ax = b \\) with \\( A = ${matrixLatex(matrix)} \\) and \\( b = ${vectorLatex(right)} \\). Use Cramer's rule. What is the value of \\( x_1 \\)?`;
            choices=numberOptions(key, [solved[1], -key, key+solved[1], value, key+1]);
            rungs=n===2?[
                "Cramer's rule for a two-by-two system replaces one column of A with the right-hand side and divides the determinant of that matrix by the determinant of A.",
                `Compute det(A) = ${value}, then replace the first column of A with ${right.join(", ")} and compute that determinant as well.`
            ]:[
                "Cramer's rule replaces one column of A with the right-hand side and divides by det(A), and in a three-by-three system that means evaluating two three-by-three determinants rather than two-by-two ones.",
                `Compute det(A) = ${value}, then replace the first column of A with ${right.join(", ")} and compute that determinant as well.`
            ];
            steps=[
                `A = ${matrixLatex(matrix)} has determinant det(A) = ${value}.`,
                `Replacing the first column with the right-hand side gives a matrix whose determinant is ${value} x ${key} = ${value*key}.`,
                `${value*key} / ${value} = ${key}, so the value of x1 is ${correct}.`
            ];
            break;
        }
        case "when_the_determinant_is_zero":{
            // Two identical rows make det(A) zero, and the right-hand side is formed
            // from a solution vector so the system is consistent rather than absurd.
            let first=[randInt(rng, 1, spread), randInt(rng, 1, spread), randInt(rng, -spread, spread)];
            let second=[randInt(rng, -spread, spread), randInt(rng, 1, spread), randInt(rng, 1, spread)];
            let matrix=[first.slice(), first.slice(), second.slice()];
            let solution=[randInt(rng, -4, 4), randInt(rng, -4, 4), randInt(rng, -4, 4)];
            let right=multiply(matrix, solution);
            correct="Cramer's rule cannot be used, because det(A) is zero, so the system has no unique solution";
            latex=`Consider the system \\( Ax = b \\) with \\( A = ${matrixLatex(matrix)} \\) and \\( b = ${vectorLatex(right)} \\). What does Cramer's rule tell you about this system?`;
            choices=fourOptions(correct, [
                "Cramer's rule gives x1 = 0, because det(A) is zero",
                "The system has a unique solution with x1 = 0",
                "The system has no solutions at all"
            ]);
            expectedFormat="Choose the statement that is true";
            rungs=[
                "Cramer's rule divides by det(A), and a zero determinant makes that division meaningless rather than giving an answer of zero.",
                `Compute det(A) for the matrix you are given; if it comes out zero, the rule has nothing to divide by.`
            ];
            steps=[
                `The first two rows of A are ${first.join(", ")} and ${first.join(", ")}, so det(A) = 0.`,
                `Replacing a column of A with b leaves two identical rows as well, so every determinant on both sides of the rule is zero and the ratio is undefined.`,
                `With det(A) = 0 the rule cannot be used and the system has no unique solution, so the statement that is true is ${correct}.`
            ];
            break;
        }
        case "compare_with_row_echelon":{
            let swapped=rng()<0.5;
            let value=randInt(rng, 3, difficulty==="easy"?9:16);
            let key=swapped?-value:value;
            correct=String(key);
            latex=swapped?
                `Reducing the matrix \\( A \\) to a row echelon form \\( E \\) used one row swap and no row scalings, so det(E) = ${value}. Given that det(A) is a whole number, what is it?`:
                `Reducing the matrix \\( A \\) to a row echelon form \\( E \\) used only row replacements, that is adding a multiple of one row to another, and det(E) = ${value}. What is det(A)?`;
            choices=numberOptions(key, [-key, 2*value, key+1, 0]);
            rungs=[
                "A row replacement leaves a determinant unchanged, while a row swap multiplies it by minus one and a row scaling multiplies it by the scaling factor.",
                `The reduction used ${swapped?"one row swap, which changes the sign":"only row replacements, which change nothing"}, so det(A) is ${swapped?"minus":""} det(E).`
            ];
            steps=[
                `Row operations of the type used here change the determinant in a known way: a row replacement leaves it alone and a row swap negates it.`,
                `Here the reduction used ${swapped?"exactly one row swap":"only row replacements"}.`,
                `det(A) = ${swapped?"-":"+"}${value} = ${key}, so det(A) is ${correct}.`
            ];
            expectedFormat="Enter a whole number";
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}