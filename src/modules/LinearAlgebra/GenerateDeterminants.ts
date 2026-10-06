/**
 * @file Determinants of two-by-two and three-by-three matrices, cofactor expansion,
 * and the structural reasons a determinant vanishes.
 * @description Every entry is an integer and every determinant here is computed by
 * Laplace expansion on integers, so nothing drifts and no key needs a rounding
 * decision. A determinant drawn at random from floating-point products is exactly
 * the kind of answer that disagrees with the printed matrix by one in the last
 * place, which is why this file never multiplies floats to get one.
 *
 * The last branch is different in kind: its key is a property rather than a number,
 * and the three wrong options are properties the printed matrix demonstrably does
 * not have. It is built from a matrix with two identical rows, and the draw is
 * rejected unless the matrix is not symmetric, has no zero row and has no two
 * proportional columns, so exactly one of the four statements is true.
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
 * Reports whether any row of a matrix is entirely zero.
 *
 * @param m - The matrix.
 * @returns True when a zero row exists.
 */
function hasZeroRow(m: number[][]): boolean{
    for(let row of m){
        if (row.every(v=>v===0)) return true;
    }
    return false;
}

/**
 * Reports whether two columns of a three-row matrix point the same way, by the
 * cross products of their entries. The test is exact on integers and treats the
 * zero column as proportional to everything, which is the safe direction here.
 *
 * @param m - The matrix.
 * @returns True when some pair of columns is proportional.
 */
function hasProportionalColumns(m: number[][]): boolean{
    let columns: number[][]=[];
    for(let j=0; j<m[0].length; j++){
        let column=[];
        for(let i=0; i<m.length; i++) column.push(m[i][j]);
        columns.push(column);
    }
    for(let i=0; i<columns.length; i++){
        for(let j=i+1; j<columns.length; j++){
            let a=columns[i];
            let b=columns[j];
            if (a[0]*b[1]===b[0]*a[1]&&a[0]*b[2]===b[0]*a[2]&&a[1]*b[2]===b[1]*a[2]) return true;
        }
    }
    return false;
}

export function generateDeterminants(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["two_by_two", "three_by_three", "cofactor_expansion", "properties_that_give_zero"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?4:difficulty==="hard"?9:6;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "two_by_two":{
            let a=randInt(rng, -spread, spread);
            let b=randInt(rng, -spread, spread);
            let c=randInt(rng, -spread, spread);
            let d=randInt(rng, -spread, spread);
            let matrix=[[a, b], [c, d]];
            let key=a*d-b*c;
            correct=String(key);
            latex=`Find the determinant of \\( A = ${matrixLatex(matrix)} \\).`;
            choices=numberOptions(key, [a*d+b*c, a*c-b*d, a*b-c*d, -key, key+1]);
            rungs=[
                "The determinant of a two-by-two matrix is the product of the top-left and bottom-right entries minus the product of the two off-diagonal ones.",
                `The products are ${a} x ${d} = ${a*d} and ${b} x ${c} = ${b*c}, and the first is taken from the second.`
            ];
            steps=[
                `The entries on the main diagonal are ${a} and ${d}; the entries off it are ${b} and ${c}.`,
                `det(A) = (${a})(${d}) - (${b})(${c}) = ${a*d} - ${b*c}.`,
                `${a*d} - ${b*c} = ${key}, so the determinant is ${correct}.`
            ];
            break;
        }
        case "three_by_three":{
            let matrix: number[][]=[];
            for(let i=0; i<3; i++){
                let row=[];
                for(let j=0; j<3; j++) row.push(randInt(rng, -spread, spread));
                matrix.push(row);
            }
            let key=determinant(matrix);
            let m1=determinant([[matrix[1][1], matrix[1][2]], [matrix[2][1], matrix[2][2]]]);
            let m2=determinant([[matrix[1][0], matrix[1][2]], [matrix[2][0], matrix[2][2]]]);
            let m3=determinant([[matrix[1][0], matrix[1][1]], [matrix[2][0], matrix[2][1]]]);
            correct=String(key);
            latex=`Find the determinant of \\( A = ${matrixLatex(matrix)} \\).`;
            choices=numberOptions(key, [-key, key+1, key-1, key+2, matrix[0][0]*matrix[1][1]*matrix[2][2]]);
            rungs=[
                "Expand along the first row: each entry is multiplied by its two-by-two minor, with a plus, a minus and then a plus down that row.",
                `The first-row minors come from ${matrix[0][0]}, ${matrix[0][1]} and ${matrix[0][2]}, and the cofactor signs in the first row are +, -, +.`
            ];
            steps=[
                `Row one of A is ${matrix[0].join(", ")}, and the cofactor signs there are +, -, +.`,
                `The three minors are ${m1}, ${m2} and ${m3}.`,
                `det(A) = ${matrix[0][0]} x ${m1} - ${matrix[0][1]} x ${m2} + ${matrix[0][2]} x ${m3} = ${matrix[0][0]*m1} - ${matrix[0][1]*m2} + ${matrix[0][2]*m3} = ${key}, so the determinant is ${correct}.`
            ];
            break;
        }
        case "cofactor_expansion":{
            // The first entry is set to zero so the expansion down the first row has
            // two terms rather than three, which is the point of the branch.
            let matrix: number[][]=[];
            for(let i=0; i<3; i++){
                let row=[];
                for(let j=0; j<3; j++) row.push(randInt(rng, -spread, spread));
                matrix.push(row);
            }
            matrix[0][0]=0;
            let first=determinant([[matrix[1][0], matrix[1][2]], [matrix[2][0], matrix[2][2]]]);
            let second=determinant([[matrix[1][0], matrix[1][1]], [matrix[2][0], matrix[2][1]]]);
            let key=matrix[0][2]*second-matrix[0][1]*first;
            correct=String(key);
            latex=`Find the determinant of \\( A = ${matrixLatex(matrix)} \\). Expand along the row that makes the work shortest.`;
            choices=numberOptions(key, [matrix[0][2]*second+matrix[0][1]*first, matrix[0][2]*second, -matrix[0][1]*first, -key, key+1]);
            rungs=[
                "Expanding along a row with a zero entry shortens the sum without changing it: the cofactor signs alternate down the row, and the term for a zero entry contributes nothing.",
                `The first row of A begins with 0, so only the entries ${matrix[0][1]} and ${matrix[0][2]} contribute, with signs - and +.`
            ];
            steps=[
                `The first entry of the first row is 0, so expand along that row: det(A) = - ${matrix[0][1]} M12 + ${matrix[0][2]} M13.`,
                `M12 = ${matrix[1][0]} x ${matrix[2][2]} - ${matrix[1][2]} x ${matrix[2][0]} = ${first} and M13 = ${matrix[1][0]} x ${matrix[2][1]} - ${matrix[1][1]} x ${matrix[2][0]} = ${second}.`,
                `- ${matrix[0][1]} x ${first} + ${matrix[0][2]} x ${second} = ${key}, so the determinant is ${correct}.`
            ];
            break;
        }
        case "properties_that_give_zero":{
            // Two identical rows make the determinant zero. The other three properties
            // are ruled out by the draw, so the key is the only true statement offered.
            let matrix=[[1, 2, 3], [1, 2, 3], [4, 5, 7]];
            for(let attempt=0; attempt<64; attempt++){
                let first=randInt(rng, 1, spread);
                let second=randInt(rng, 1, spread);
                let third=randInt(rng, 1, spread);
                let fourth=randInt(rng, -spread, spread);
                let fifth=randInt(rng, 1, spread);
                let sixth=randInt(rng, -spread, spread);
                let candidate=[[first, second, third], [first, second, third], [fourth, fifth, sixth]];
                if (isSymmetric(candidate)) continue;
                if (hasZeroRow(candidate)) continue;
                if (hasProportionalColumns(candidate)) continue;
                matrix=candidate;
                break;
            }
            correct="Two of its rows are identical";
            latex=`The matrix \\( A = ${matrixLatex(matrix)} \\) has determinant zero. Which statement explains why?`;
            choices=fourOptions(correct, [
                "It is symmetric about its main diagonal",
                "One of its rows is entirely zero",
                "Two of its columns are proportional"
            ]);
            expectedFormat="Choose the statement that explains it";
            rungs=[
                "Two identical rows make a matrix singular, because swapping those rows would change the sign of the determinant while leaving the matrix unchanged, which forces the determinant to be its own negative and therefore zero.",
                `Read the rows of \\( A = ${matrixLatex(matrix)} \\) off one at a time and compare them.`
            ];
            steps=[
                `The first row of A is ${matrix[0].join(", ")} and the second row is ${matrix[1].join(", ")}.`,
                `Those two rows are identical, so swapping them would leave A unchanged while changing the sign of its determinant.`,
                `Two identical rows therefore force det(A) to be zero, so the explanation is that ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}