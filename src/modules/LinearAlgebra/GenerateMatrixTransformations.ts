/**
 * @file Matrices as linear transformations: the image of a vector, the image of the
 * standard basis, and recognising the rotations, scalings and reflections.
 * @description A matrix and a transformation are the same object, and this file asks
 * about it from both directions: given a matrix, what does it send things to, and
 * given a description of a transformation, which matrix is it. The rotations and
 * reflections offered are the signed permutation matrices of the plane, whose
 * entries are exact and whose descriptions are mutually exclusive, so a question of
 * this shape never has an answer that depends on a convention.
 *
 * The image of the basis branch is the one worth having: the columns of the matrix of
 * a transformation are the images of the standard basis vectors, so a matrix is fully
 * determined by where it sends them.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions}from"../shared/Options.js";
import{pickMany, randInt}from "../shared/Random";
import{trimNum}from"../shared/Latex";

/** The signed permutation matrices of the plane that are rotations or reflections. */
let ROTATIONS: number[][][]=[
    [[0, 1], [-1, 0]],
    [[0, -1], [1, 0]],
    [[-1, 0], [0, -1]],
    [[0, 1], [1, 0]],
    [[-1, 0], [0, 1]],
    [[1, 0], [0, -1]],
    [[1, 0], [0, 1]]
];

/** What each of those matrices does, in the same order. */
let ROTATION_WORDS: string[]=[
    "rotates the plane 90 degrees clockwise about the origin",
    "rotates the plane 90 degrees counterclockwise about the origin",
    "rotates the plane 180 degrees about the origin",
    "reflects in the line y = x",
    "reflects in the y-axis",
    "reflects in the x-axis",
    "leaves every point where it is"
];

/** Scalings, reflections and shears. */
let SCALINGS: number[][][]=[
    [[2, 0], [0, 1]],
    [[1, 0], [0, 2]],
    [[-1, 0], [0, 1]],
    [[1, 0], [0, -1]],
    [[-1, 0], [0, -1]],
    [[2, 0], [0, -1]],
    [[3, 0], [0, 1]],
    [[1, 2], [0, 1]]
];

/** The same transformations, described. */
let SCALING_WORDS: string[]=[
    "doubles the first coordinate and leaves the second alone",
    "doubles the second coordinate and leaves the first alone",
    "negates the first coordinate and leaves the second alone",
    "negates the second coordinate and leaves the first alone",
    "negates both coordinates",
    "doubles the first coordinate and negates the second",
    "triples the first coordinate and leaves the second alone",
    "adds twice the second coordinate to the first and leaves the second alone"
];

/**
 * The product of a matrix and a column vector.
 *
 * @param a - The matrix.
 * @param v - The column vector.
 * @returns The image of the vector.
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
 * Renders a column vector as a plain option, because options are text rather than
 * typeset mathematics.
 *
 * @param v - The vector.
 * @returns The option text.
 */
function vectorText(v: number[]): string{
    return `(${v.join(", ")})`;
}

/**
 * The wrong vectors for a question whose answer is uniquely the vector given: the
 * answer with one entry displaced. A vector that is not the answer cannot be the
 * answer, and these are the only options available when a matrix with equal rows
 * collapses every meaningful alternative onto the answer itself.
 *
 * @param key - The correct vector.
 * @returns Candidate option texts.
 */
function displaced(key: number[]): string[]{
    let out: string[]=[];
    for(let i=0; i<key.length; i++){
        for(let delta of [1, -1, 2, -2]){
            let copy=key.slice();
            copy[i]=(copy[i] as number)+delta;
            out.push(vectorText(copy));
        }
    }
    return out;
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
 * The wrong matrices for a question whose answer is uniquely the matrix given: the
 * answer with one entry displaced. A matrix that is not the answer cannot be the
 * answer, and these are the only options left when a matrix with equal rows collapses
 * the transpose and the row swap onto the answer itself.
 *
 * @param key - The correct matrix.
 * @returns Candidate option texts.
 */
function displacedMatrix(key: number[][]): string[]{
    let out: string[]=[];
    for(let i=0; i<key.length; i++){
        for(let j=0; j<(key[i] as number[]).length; j++){
            for(let delta of [1, -1]){
                let copy=key.map(row=>row.slice());
                (copy[i] as number[])[j]=(copy[i] as number[])[j]+delta;
                out.push(matrixText(copy));
            }
        }
    }
    return out;
}

export function generateMatrixTransformations(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["image_of_a_vector", "image_of_a_basis", "rotation_matrix", "scaling_and_reflection"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?4:difficulty==="hard"?7:5;
    let correct="";
    let latex="";
    let expectedFormat="Enter as (a, b)";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "image_of_a_vector":{
            let matrix=[
                [randInt(rng, -spread, spread), randInt(rng, -spread, spread)],
                [randInt(rng, -spread, spread), randInt(rng, -spread, spread)]
            ];
            let vector=[randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
            let first=(matrix[0] as number[])[0] as number;
            let second=(matrix[0] as number[])[1] as number;
            let third=(matrix[1] as number[])[0] as number;
            let fourth=(matrix[1] as number[])[1] as number;
            let answer=applyMatrix(matrix, vector);
            correct=vectorText(answer);
            latex=`Let \\( T(v) = Av \\) where \\( A = ${matrixLatex(matrix)} \\). Find \\( T \\) applied to \\( v = ${vectorLatex(vector)} \\).`;
            choices=fourOptions(correct, [
                vectorText(applyMatrix(transpose(matrix), vector)),
                vectorText(applyMatrix(matrix, [vector[1], vector[0]])),
                vectorText(applyMatrix(matrix, applyMatrix(matrix, vector))),
                vectorText(applyMatrix(transpose(matrix), [vector[1], vector[0]])),
                ...displaced(answer)
            ]);
            rungs=[
                "The image of a vector is the matrix times the vector, so each coordinate of the image is the dot product of a row of the matrix with the vector.",
                `The rows of A are ${first}, ${second} and ${third}, ${fourth}, and the vector is ${vector[0]}, ${vector[1]}.`
            ];
            steps=[
                `The first row dotted with the vector is ${first} x ${vector[0]} + ${second} x ${vector[1]} = ${first*vector[0]} + ${second*vector[1]} = ${answer[0]}.`,
                `The second row dotted with the vector is ${third} x ${vector[0]} + ${fourth} x ${vector[1]} = ${third*vector[0]} + ${fourth*vector[1]} = ${answer[1]}.`,
                `So the image of the vector is ${correct}.`
            ];
            break;
        }
        case "image_of_a_basis":{
            let matrix=[
                [randInt(rng, -spread, spread), randInt(rng, -spread, spread)],
                [randInt(rng, -spread, spread), randInt(rng, -spread, spread)]
            ];
            let first=(matrix[0] as number[])[0] as number;
            let second=(matrix[0] as number[])[1] as number;
            let third=(matrix[1] as number[])[0] as number;
            let fourth=(matrix[1] as number[])[1] as number;
            correct=matrixText(matrix);
            latex=`Let \\( T(v) = Av \\) where \\( A = ${matrixLatex(matrix)} \\). Write the matrix whose columns are \\( T(e_1) \\) and \\( T(e_2) \\), where \\( e_1 \\) and \\( e_2 \\) are the standard basis vectors.`;
            expectedFormat="Enter as [[a, b], [c, d]]";
            choices=fourOptions(correct, [
                matrixText(transpose(matrix)),
                matrixText([matrix[1] as number[], matrix[0] as number[]]),
                matrixText([[first, second], [first, second]]),
                matrixText([[1, 0], [0, 1]]),
                ...displacedMatrix(matrix)
            ]);
            rungs=[
                "Multiplying by e_1 picks out the first column and multiplying by e_2 picks out the second, so the images of the standard basis vectors are the columns of the matrix.",
                "The standard basis vectors are (1, 0) and (0, 1), so substitute each of them for the vector in the rule T(v) = Av."
            ];
            steps=[
                `The standard basis vectors are e1 = (1, 0) and e2 = (0, 1).`,
                `T(e1) = A e1 picks out column one, which is ${first}, ${third}, and T(e2) = A e2 picks out column two, which is ${second}, ${fourth}.`,
                `Putting those two images in as columns gives ${correct}.`
            ];
            break;
        }
        case "rotation_matrix":{
            let index=Math.floor(rng()*ROTATIONS.length);
            let matrix=ROTATIONS[index] as number[][];
            correct=ROTATION_WORDS[index] as string;
            latex=`Let \\( A = ${matrixLatex(matrix)} \\). What does the transformation \\( T(v) = Av \\) do to the plane?`;
            expectedFormat="Choose the description that is correct";
            choices=fourOptions(correct, pickMany(rng, ROTATION_WORDS.filter(w=>w!==correct), 3));
            rungs=[
                "Reading the columns of a signed permutation matrix tells you where the two coordinate axes go, and that identifies the transformation because every vector is a combination of the two.",
                `The first column of A is ${(matrix[0] as number[]).join(", ")}, which is the image of e1, and the second is ${(matrix[1] as number[]).join(", ")}, the image of e2.`
            ];
            steps=[
                `The columns of A are ${(matrix[0] as number[]).join(", ")} and ${(matrix[1] as number[]).join(", ")}, so those are the images of e1 and e2.`,
                `Every other vector is a combination of e1 and e2, so following those two axes round tells you what the transformation does to all of them.`,
                `Read that way, A ${correct}.`
            ];
            break;
        }
        case "scaling_and_reflection":{
            let index=Math.floor(rng()*SCALINGS.length);
            let matrix=SCALINGS[index] as number[][];
            correct=matrixText(matrix);
            latex=`Which matrix represents the transformation that ${SCALING_WORDS[index]}?`;
            expectedFormat="Enter as [[a, b], [c, d]]";
            choices=fourOptions(correct, pickMany(rng, SCALINGS.filter(m=>matrixText(m)!==correct).map(matrixText), 3));
            rungs=[
                "The columns of the matrix of a transformation are the images of the standard basis vectors, so a change to one coordinate shows up in the matching column and nowhere else.",
                "Find where (1, 0) and (0, 1) go under the transformation you are given, and put those two images in as the columns."
            ];
            steps=[
                `A transformation that ${SCALING_WORDS[index]} sends (1, 0) to ${(matrix[0] as number[]).join(", ")} and (0, 1) to ${(matrix[1] as number[]).join(", ")}.`,
                `Those two images are the first and second columns of its matrix, and nothing else goes in.`,
                `So the matrix is ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}