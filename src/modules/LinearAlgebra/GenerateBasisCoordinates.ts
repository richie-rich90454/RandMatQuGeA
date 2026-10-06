/**
 * @file Bases and coordinates: deciding whether a set is a basis, reading
 * coordinates in a basis, the matrix that changes between bases, and the standard
 * basis.
 * @description The coordinates are built forwards, from a basis and a pair of whole
 * numbers, so the vector printed is the combination of the basis vectors the answer
 * says it is and no linear system has to be solved to produce a rounded answer. The
 * basis is required to be independent, because a dependent pair has no unique set of
 * coordinates and the question would have two answers.
 *
 * The change-of-basis branch is the one that is most often read backwards: the matrix
 * whose columns are the basis vectors converts B-coordinates into standard
 * coordinates, and its transpose is the matrix that goes the other way.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions}from"../shared/Options.js";
import{randInt}from "../shared/Random";
import{trimNum}from"../shared/Latex";

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
 * The determinant of a two-by-two matrix, which is nonzero exactly when the two
 * columns are independent.
 *
 * @param m - The matrix.
 * @returns The determinant.
 */
function determinant2(m: number[][]): number{
    return (m[0] as number[])[0]*(m[1] as number[])[1]-(m[0] as number[])[1]*(m[1] as number[])[0];
}

/**
 * Draws two independent planar vectors. The retry is bounded and the fallback is a
 * known independent pair, because coordinates in a dependent basis are not unique.
 *
 * @param rng - The injected random source.
 * @param spread - The largest magnitude allowed for an entry.
 * @returns Two independent vectors.
 */
function drawBasis(rng: RngFn, spread: number): [number[], number[]]{
    for(let attempt=0; attempt<64; attempt++){
        let first=[randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
        let second=[randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
        if (determinant2([first, second])!==0) return [first, second];
    }
    return [[1, 0], [0, 1]];
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
 * The wrong coordinate pairs for a question whose answer is uniquely the pair given:
 * the answer with one entry displaced. Those are the only options left when a
 * coordinate pair with a zero or a repeated entry collapses every meaningful
 * alternative onto the answer itself.
 *
 * @param first - The first coordinate.
 * @param second - The second coordinate.
 * @returns Candidate option texts.
 */
function displaced(first: number, second: number): string[]{
    let out: string[]=[];
    for(let delta of [1, -1, 2, -2]){
        out.push(`(${first+delta}, ${second})`);
        out.push(`(${first}, ${second+delta})`);
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

export function generateBasisCoordinates(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["is_it_a_basis", "coordinates_in_a_basis", "change_of_basis", "the_standard_basis"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?3:difficulty==="hard"?5:4;
    let correct="";
    let latex="";
    let expectedFormat="Enter as (a, b)";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "is_it_a_basis":{
            let basis=drawBasis(rng, spread);
            let dependent=rng()<0.5;
            let first=basis[0];
            let second=dependent?[3*(basis[0][0] as number), 3*(basis[0][1] as number)]:basis[1];
            correct=dependent?
                "No, because the two vectors are linearly dependent and so they span only a single line":
                "Yes, because the two vectors are linearly independent and there are two of them in the plane";
            latex=`Let \\( u = ${vectorLatex(first)} \\) and \\( v = ${vectorLatex(second)} \\). Is \\( \\{u, v\\} \\) a basis for \\( \\mathbb{R}^{2} \\)?`;
            expectedFormat="Choose the statement that is true";
            choices=fourOptions(correct, dependent?[
                "Yes, because the two vectors are linearly independent and there are two of them in the plane",
                "No, because both vectors are the zero vector",
                "Yes, but they span only a single line"
            ]:[
                "No, because the two vectors are linearly dependent and so they span only a single line",
                "No, because both vectors are the zero vector",
                "Yes, but they span only a single line"
            ]);
            rungs=[
                "A set of two vectors in the plane is a basis exactly when the two are linearly independent, and the quick test is whether one is a multiple of the other.",
                `Compute ${first[0]} x ${second[1]} - ${second[0]} x ${first[1]}; a nonzero result means the two are independent.`
            ];
            steps=[
                `The determinant of the matrix with columns u and v is ${first[0]} x ${second[1]} - ${second[0]} x ${first[1]} = ${first[0]*second[1]-second[0]*first[1]}.`,
                dependent?
                    `That determinant is zero, and indeed v = 3u exactly, so one vector is a multiple of the other.`
                    :"That determinant is nonzero, so no multiple of u is v and the two are linearly independent.",
                dependent?
                    `Two dependent vectors span a single line, not the plane, so ${correct}.`
                    :`Two independent vectors in the plane span the whole plane, so ${correct}.`
            ];
            break;
        }
        case "coordinates_in_a_basis":{
            let basis=drawBasis(rng, spread);
            let firstWeight=randInt(rng, -spread, spread);
            let secondWeight=randInt(rng, -spread, spread);
            if (firstWeight===0&&secondWeight===0) firstWeight=1;
            let combined=applyMatrix([basis[0], basis[1]], [firstWeight, secondWeight]);
            correct=`(${firstWeight}, ${secondWeight})`;
            latex=`Let \\( B = \\{ b_1, b_2 \\} \\) with \\( b_1 = ${vectorLatex(basis[0])} \\) and \\( b_2 = ${vectorLatex(basis[1])} \\). Write \\( v = ${vectorLatex(combined)} \\) as \\( c_1 b_1 + c_2 b_2 \\). What are \\( (c_1, c_2) \\)?`;
            choices=fourOptions(correct, [
                `(${secondWeight}, ${firstWeight})`,
                `(${-firstWeight}, ${-secondWeight})`,
                vectorText(combined),
                `(${firstWeight + secondWeight}, ${firstWeight * secondWeight})`,
                ...displaced(firstWeight, secondWeight)
            ]);
            rungs=[
                "Coordinates in a basis are the weights of the basis vectors in the combination that gives the vector, not the vector's own entries.",
                `Compare the two coordinates of v against the two basis vectors, or solve \\( c_1 b_1 + c_2 b_2 = v \\) for the two weights.`
            ];
            steps=[
                `The basis vectors are b1 = ${basis[0].join(", ")} and b2 = ${basis[1].join(", ")}, and v = ${combined.join(", ")}.`,
                `The combination ${firstWeight} b1 + ${secondWeight} b2 has first coordinate ${firstWeight*(basis[0][0] as number) + secondWeight*(basis[1][0] as number)} and second coordinate ${firstWeight*(basis[0][1] as number) + secondWeight*(basis[1][1] as number)}, which is v.`,
                `So the coordinates of v with respect to B are ${correct}.`
            ];
            break;
        }
        case "change_of_basis":{
            let basis=drawBasis(rng, spread);
            let change=[[basis[0][0] as number, basis[1][0] as number], [basis[0][1] as number, basis[1][1] as number]];
            correct=matrixText(change);
            latex=`Let \\( B = \\{ b_1, b_2 \\} \\) with \\( b_1 = ${vectorLatex(basis[0])} \\) and \\( b_2 = ${vectorLatex(basis[1])} \\). Find the matrix that takes the coordinate vector of a point relative to \\( B \\) and returns its standard coordinate vector.`;
            expectedFormat="Enter as [[a, b], [c, d]]";
            choices=fourOptions(correct, [
                matrixText(transpose(change)),
                matrixText([change[1] as number[], change[0] as number[]]),
                matrixText([[-(change[0] as number[])[0], (change[0] as number[])[1]], [-(change[1] as number[])[0], (change[1] as number[])[1]]]),
                matrixText([[1, 0], [0, 1]])
            ]);
            rungs=[
                "The matrix that turns B-coordinates into standard coordinates has the basis vectors as its columns, because the coordinate vector is the list of weights and each column contributes one weighted basis vector.",
                "Put b1 in the first column and b2 in the second."
            ];
            steps=[
                `The coordinate vector of a point relative to B is the list of weights on b1 and b2, so the first column must be b1 = ${basis[0].join(", ")} and the second b2 = ${basis[1].join(", ")}.`,
                `Weighting by the first coordinate therefore lands in the first column's direction, and by the second in the second's.`,
                `So the change-of-coordinates matrix is ${correct}.`
            ];
            break;
        }
        case "the_standard_basis":{
            let vector=[randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
            correct=vectorText(vector);
            latex=`The standard basis of \\( \\mathbb{R}^{2} \\) is \\( \\{ e_1, e_2 \\} \\), where \\( e_1 = (1, 0) \\) and \\( e_2 = (0, 1) \\). What is the coordinate vector of \\( v = ${vectorLatex(vector)} \\) with respect to the standard basis?`;
            choices=fourOptions(correct, [
                vectorText([vector[1], vector[0]]),
                vectorText([-(vector[0] as number), vector[1]]),
                vectorText([vector[0], -(vector[1] as number)]),
                vectorText([-(vector[0] as number), -(vector[1] as number)]),
                ...displaced(vector[0], vector[1])
            ]);
            rungs=[
                "The coordinates of a vector with respect to the standard basis are the vector's own entries, because the standard basis vectors are the coordinate axes themselves.",
                "Compare v with e1 = (1, 0) and e2 = (0, 1) and read off the weight on each."
            ];
            steps=[
                `With respect to the standard basis, v = c_1 e_1 + c_2 e_2 means v = (c_1, c_2).`,
                `The vector you are given is ${vector.join(", ")}, so c_1 = ${vector[0]} and c_2 = ${vector[1]}.`,
                `The coordinate vector of v with respect to the standard basis is ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}