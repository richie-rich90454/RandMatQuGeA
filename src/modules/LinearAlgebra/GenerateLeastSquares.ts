/**
 * @file Least squares: the projection of a point onto a line, the normal equations,
 * the best-fit line through given data, and a residual.
 * @description Least squares only has an exact answer when the data are chosen for it,
 * and that is what happens here. The normal-equations branch needs an overdetermined
 * system for a least-squares question to mean anything, so A has three rows and two
 * columns: the residual is drawn first and the two columns are then built
 * perpendicular to it, which makes the least-squares solution exactly the
 * coefficients the generator started from, in whole numbers.
 *
 * The best-fit line uses four points at abscissas 1, 2, 3 and 4 with residuals k,
 * -k, -k and k. Those residuals sum to zero and their first moment is zero, which is
 * exactly the pair of normal equations for a straight line, so the least-squares
 * slope and intercept are whole numbers and no rounding enters anywhere.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";
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
 * The transpose of a matrix.
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
 * Two independent three-dimensional vectors both perpendicular to the given vector,
 * in whole numbers. Every three-dimensional vector has a whole-number perpendicular,
 * and two of them are independent as long as the target has no zero entry.
 *
 * @param target - The vector the columns must be perpendicular to, with no zero entry.
 * @param spread - The factor the perpendiculars are scaled by.
 * @returns Two independent vectors orthogonal to `target`.
 */
function perpendicularPair(target: number[], spread: number): [number[], number[]]{
    return [
        [spread*-(target[1] as number), spread*(target[0] as number), 0],
        [spread*-(target[2] as number), 0, spread*(target[0] as number)]
    ];
}

/**
 * A direction and a displacement perpendicular to it, both in whole numbers, so the
 * projection onto the line is exact.
 *
 * @param rng - The injected random source.
 * @param spread - The largest magnitude allowed for an entry.
 * @returns The line's direction and a vector perpendicular to it.
 */
function frame(rng: RngFn, spread: number): [number[], number[]]{
    let along=[randInt(rng, 1, spread), randInt(rng, 1, spread)];
    return [along, [-(along[1] as number), along[0] as number]];
}

/**
 * Four points whose least-squares line has whole-number coefficients: the residuals
 * k, -k, -k, k at abscissas 1, 2, 3 and 4 sum to zero and balance about the mean
 * abscissa, which is precisely the pair of normal equations for a straight line.
 *
 * @param rng - The injected random source.
 * @param spread - The bound on the intercept and slope.
 * @param maxGap - The largest residual magnitude allowed.
 * @returns The intercept, the slope and the four points.
 */
function fittedLine(rng: RngFn, spread: number, maxGap: number): {intercept: number, slope: number, xs: number[], ys: number[]}{
    let intercept=randInt(rng, -spread, spread);
    let slope=randInt(rng, -spread, spread);
    let gap=randInt(rng, 1, maxGap);
    let xs=[1, 2, 3, 4];
    let residuals=[gap, -gap, -gap, gap];
    let ys: number[]=[];
    for(let i=0; i<4; i++) ys.push(intercept+slope*(xs[i] as number)+(residuals[i] as number));
    return {intercept, slope, xs, ys};
}

/**
 * The residual belonging to a different point of the same data set, which is a wrong
 * answer to a question about one point unless the two coincide.
 *
 * @param residuals - The residuals of the four points.
 * @param index - The point the question asks about.
 * @param used - The residual of that point.
 * @returns A residual from one of the other points.
 */
function otherResidual(residuals: number[], index: number, used: number): number{
    for(let i=0; i<residuals.length; i++){
        if (i!==index&&(residuals[i] as number)!==used) return residuals[i] as number;
    }
    return used+1;
}

export function generateLeastSquares(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["projection_of_a_point", "the_normal_equations", "best_fit_line", "the_residual"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?4:difficulty==="hard"?7:5;
    let maxGap=difficulty==="easy"?2:4;
    let correct="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "projection_of_a_point":{
            let parts=frame(rng, spread);
            let along=parts[0];
            let away=parts[1];
            let alongSteps=randInt(rng, 1, 3);
            let offset=randInt(rng, 1, 3);
            let anchor=[randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
            let foot=[anchor[0]+alongSteps*along[0], anchor[1]+alongSteps*along[1]];
            let point=[foot[0]+offset*away[0], foot[1]+offset*away[1]];
            correct=vectorText(foot);
            latex=`Let \\( L \\) be the line through \\( ${vectorLatex(anchor)} \\) with direction \\( ${vectorLatex(along)} \\). What is the closest point on \\( L \\) to \\( P = ${vectorLatex(point)} \\)?`;
            expectedFormat="Enter as (a, b)";
            choices=fourOptions(correct, [vectorText(point), vectorText(anchor), vectorText([foot[0]+along[0], foot[1]+along[1]]), vectorText([anchor[0]+offset*away[0], anchor[1]+offset*away[1]])]);
            rungs=[
                "The closest point on a line is the foot of the perpendicular from the point to the line, so the offset from the point to that foot has to be perpendicular to the line's direction.",
                `The line's direction is ${along.join(", ")}, so a perpendicular offset is a multiple of ${away.join(", ")}.`
            ];
            steps=[
                `The line has direction ${along.join(", ")}, and ${away.join(", ")} is perpendicular to it because ${along[0]} x ${away[0]} + ${along[1]} x ${away[1]} = ${along[0]*away[0]+along[1]*away[1]}.`,
                `Moving from P = ${point.join(", ")} by ${offset} times that perpendicular vector lands on ${foot.join(", ")}, and from there the rest of the way to P is along the line itself.`,
                `So the closest point on L is ${correct}.`
            ];
            break;
        }
        case "the_normal_equations":{
            // The residual comes first and the two columns are built perpendicular to
            // it, so the least-squares solution is exactly the pair of coefficients
            // this branch starts from and every printed number is a whole number.
            let residual=[randInt(rng, -spread, spread), randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
            for(let entry=0; entry<3; entry++){
                if (residual[entry]===0) residual[entry]=1;
            }
            let columns=perpendicularPair(residual, 1);
            let matrix=[
                [columns[0][0] as number, columns[1][0] as number],
                [columns[0][1] as number, columns[1][1] as number],
                [columns[0][2] as number, columns[1][2] as number]
            ];
            let solution=[randInt(rng, -3, 3), randInt(rng, -3, 3)];
            let fitted=applyMatrix(matrix, solution);
            let right=[fitted[0]+residual[0], fitted[1]+residual[1], fitted[2]+residual[2]];
            let normal=multiply(transpose(matrix), matrix);
            let key=solution[0] as number;
            correct=String(key);
            latex=`Find the least-squares solution of \\( Ax \\approx b \\) with \\( A = ${matrixLatex(matrix)} \\) and \\( b = ${vectorLatex(right)} \\), by solving the normal equations \\( A^{T}A x = A^{T} b \\). What is the value of \\( x_1 \\)?`;
            choices=numberOptions(key, [solution[1], -key, key+1, key-1, normal[0]?.[0] as number]);
            rungs=[
                "The least-squares coefficients solve A transposed A c = A transposed b, and that system has a unique answer because A transposed A is nonsingular exactly when the columns of A are independent.",
                `Work out A transposed A, which is ${matrixLatex(normal)}, and A transposed b, which is ${vectorLatex([dot(matrix[0] as number[], right), dot(matrix[1] as number[], right)])}.`
            ];
            steps=[
                `A transposed A is ${matrixLatex(normal)} and A transposed b is ${vectorLatex([dot(matrix[0] as number[], right), dot(matrix[1] as number[], right)])}.`,
                `Solving those two equations gives c = ${vectorLatex(solution)}, and the residual ${vectorLatex(residual)} has dot product zero with each column of A, as the least-squares condition requires.`,
                `The first coefficient is ${key}, so the value of x1 is ${correct}.`
            ];
            break;
        }
        case "best_fit_line":{
            let line=fittedLine(rng, difficulty==="easy"?6:10, maxGap);
            let askSlope=rng()<0.5;
            let key=askSlope?line.slope:line.intercept;
            correct=String(key);
            latex=`The points \\( (${line.xs.join("), (")}, ${line.ys.join("), (")} \\) are given. Find the least-squares straight line through them and report ${askSlope?"its slope":"its y-intercept"}.`;
            let spreadY=(line.ys[3] as number)-(line.ys[0] as number);
            choices=numberOptions(key, [askSlope?line.intercept:line.slope, spreadY, key+1, key-1, spreadY/2]);
            rungs=[
                "The least-squares line makes the residuals sum to zero and makes their first moment zero, which is the pair of normal equations for a straight line.",
                "The abscissae here are 1, 2, 3 and 4, so their mean is 2.5 and the residuals have to balance about it."
            ];
            steps=[
                `Fit y = c_1 + c_2 x to the points ${line.ys.map((y, i)=>`(${line.xs[i]}, ${y})`).join(", ")}.`,
                `The two normal equations require the residuals to sum to zero and to balance about the mean abscissa 2.5, and the data satisfy that exactly for c_1 = ${line.intercept} and c_2 = ${line.slope}.`,
                `${askSlope?`So the slope is ${line.slope}`:`So the y-intercept is ${line.intercept}`}, so the answer is ${correct}.`
            ];
            break;
        }
        case "the_residual":{
            let line=fittedLine(rng, difficulty==="easy"?6:10, maxGap);
            let residuals: number[]=[];
            for(let i=0; i<4; i++) residuals.push((line.ys[i] as number)-(line.intercept+line.slope*(line.xs[i] as number)));
            let index=randInt(rng, 0, 3);
            let residual=residuals[index] as number;
            correct=String(residual);
            latex=`The least-squares straight line through the points \\( (${line.xs.join("), (")}, ${line.ys.join("), (")} \\) is \\( y = ${line.intercept} + ${line.slope} x \\). What is the residual of the point \\( (${line.xs[index]}, ${line.ys[index]}) \\), that is the observed value of \\( y \\) minus the value the line predicts there?`;
            choices=numberOptions(residual, [line.ys[index] as number, line.intercept+line.slope*(line.xs[index] as number), -residual, otherResidual(residuals, index, residual), line.intercept]);
            rungs=[
                "The residual of a point is the observed y minus the y the line predicts, and it is negative when the point sits below the line.",
                `Predict the y at abscissa ${line.xs[index]} from the line and subtract it from the observed y of ${line.ys[index]}.`
            ];
            steps=[
                `The observed y at \\( x = ${line.xs[index]} \\) is ${line.ys[index]}.`,
                `The line predicts \\( ${line.intercept} + ${line.slope} \\) x ${line.xs[index]} = ${line.intercept+line.slope*(line.xs[index] as number)} at that abscissa.`,
                `The residual is ${line.ys[index]} - ${line.intercept+line.slope*(line.xs[index] as number)} = ${residual}, so the answer is ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}