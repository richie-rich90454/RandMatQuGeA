/**
 * @file Three-dimensional vectors: cross and triple products, angles, and distances.
 * @description These are the quantities a three-dimensional vector is actually useful
 * for. A cross product is only fixed once the order of its two factors is fixed, so
 * its options may include the negation and the componentwise product a learner reaches
 * for by mistake. A distance is built by placing the point a known distance from the
 * line or the plane rather than by solving for it, so the printed geometry and the
 * graded distance are the same numbers with no rounding in between.
 *
 * The angle branch draws from a fixed set of directions whose pairwise angles are all
 * whole numbers of degrees, which is what lets an angle question have an exact answer
 * instead of one that has to be rounded to one decimal place.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, randNonZero, pick}from"../shared/Random";
import{roundTo, fmt}from"../shared/Numeric";
import{trimNum}from"../shared/Latex";

/** Three-dimensional vectors whose length is a whole number. */
let WHOLE_3D: number[][]=[[1, 2, 2], [2, 3, 6], [1, 4, 8], [2, 6, 9], [3, 4, 12], [6, 3, 2]];
/**
 * Directions whose pairwise angles are 45, 60, 90, 120 or 135 degrees exactly. Two
 * directions sharing no nonzero coordinate are perpendicular, two sharing exactly one
 * meet at 60 or 120 degrees, and two sharing two meet at 45 or 135.
 */
let DIRECTIONS: number[][]=[[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]];
/** The whole-number angles those directions can produce. */
let ANGLES=[45, 60, 90, 120, 135];

/**
 * The dot product of two vectors.
 *
 * @param u - The first vector.
 * @param w - The second vector.
 * @returns The dot product.
 */
function dot(u: number[], w: number[]): number{
    let total=0;
    for(let i=0; i<u.length; i++) total+=u[i]*w[i];
    return total;
}

/**
 * The cross product of two three-dimensional vectors, which is perpendicular to both.
 *
 * @param u - The first vector.
 * @param w - The second vector.
 * @returns The cross product.
 */
function cross3(u: number[], w: number[]): number[]{
    return [u[1]*w[2]-u[2]*w[1], u[2]*w[0]-u[0]*w[2], u[0]*w[1]-u[1]*w[0]];
}

/**
 * The length of a vector.
 *
 * @param v - The vector.
 * @returns The length.
 */
function lengthOf(v: number[]): number{
    let total=0;
    for(let i=0; i<v.length; i++) total+=v[i]*v[i];
    return Math.sqrt(total);
}

/**
 * Reports whether a vector is the zero vector, which no direction and no distance may
 * collapse to.
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
 * Reports whether two vectors point the same way, which is the condition under which
 * their cross product is the zero vector and a question about it has no answer.
 *
 * @param u - The first vector, which must not be zero.
 * @param w - The second vector, which must not be zero.
 * @returns True when the two are proportional.
 */
function isParallel(u: number[], w: number[]): boolean{
    if (isZeroVector(u)||isZeroVector(w)) return false;
    let base=0;
    while (u[base]===0) base++;
    for(let i=0; i<u.length; i++){
        if (u[base]*w[i]!==w[base]*u[i]) return false;
    }
    return true;
}

/**
 * Reports whether a length is a whole number, to the tolerance the square root of a
 * sum of whole-number squares needs.
 *
 * @param value - The length.
 * @returns True when the length is integral.
 */
function isWholeLength(value: number): boolean{
    return Number.isFinite(value)&&Math.abs(value-Math.round(value))<1e-9;
}

/**
 * Draws a vector with whole-number entries that is not the zero vector and, when a
 * second vector is given, not parallel to it. The retry is bounded and the fallback
 * negates one entry, which can never leave a vector proportional to itself, so a
 * stream that keeps drawing the same value cannot produce a zero cross product.
 *
 * @param rng - The injected random source.
 * @param spread - The largest magnitude allowed for an entry.
 * @param against - A vector the draw must not be parallel to.
 * @returns The vector.
 */
function drawVector(rng: RngFn, spread: number, against?: number[]): number[]{
    for(let attempt=0; attempt<64; attempt++){
        let v: number[]=[];
        for(let i=0; i<3; i++) v.push(randInt(rng, -spread, spread));
        if (isZeroVector(v)) continue;
        if (against&&isParallel(v, against)) continue;
        return v;
    }
    if (!against) return [1, 0, 0];
    let turned=against.slice();
    turned[0]=against[1];
    turned[1]=-against[0];
    return turned;
}

/**
 * Draws a vector off the plane two others span, which is what keeps a scalar triple
 * product from being the uninformative answer zero.
 *
 * @param rng - The injected random source.
 * @param normal - The normal to the plane, which must not be the zero vector.
 * @param spread - The largest magnitude allowed for an entry.
 * @returns The vector.
 */
function drawOffPlane(rng: RngFn, normal: number[], spread: number): number[]{
    for(let attempt=0; attempt<64; attempt++){
        let v=drawVector(rng, spread);
        if (dot(v, normal)!==0) return v;
    }
    return normal.slice();
}

/**
 * Draws a vector whose length is a whole number, by scaling one whose length already
 * is, which keeps both the entries and the length integral.
 *
 * @param rng - The injected random source.
 * @param scale - The largest scale factor allowed.
 * @returns The vector.
 */
function wholeVector(rng: RngFn, scale: number): number[]{
    let base=pick(rng, WHOLE_3D);
    let factor=randInt(rng, 1, Math.max(1, scale));
    return base.map(v=>v*factor);
}

/**
 * A direction perpendicular to the given vector, in whole numbers and guaranteed
 * nonzero, so a distance built from it does not depend on a search succeeding.
 *
 * @param rng - The injected random source.
 * @param v - The vector to be perpendicular to, which must not be zero.
 * @returns A nonzero vector perpendicular to it.
 */
function perpendicular(rng: RngFn, v: number[]): number[]{
    for(let attempt=0; attempt<64; attempt++){
        let q=cross3(v, drawVector(rng, 3));
        if (!isZeroVector(q)) return q;
    }
    let axes=[[0, v[2], -v[1]], [-v[2], 0, v[0]], [v[1], -v[0], 0]];
    for(let q of axes){
        if (!isZeroVector(q)) return q;
    }
    return [0, 0, 1];
}

/**
 * Two perpendicular vectors whose lengths are both whole numbers, which is what lets a
 * distance to a line be exact: the learner divides one whole number by another rather
 * than cancelling two irrationals.
 *
 * @param rng - The injected random source.
 * @param scale - The largest scale factor allowed for the displacement.
 * @returns The line direction and the perpendicular displacement.
 */
function integerPerpendicularPair(rng: RngFn, scale: number): {along: number[], away: number[]}{
    for(let attempt=0; attempt<64; attempt++){
        let away=wholeVector(rng, scale);
        let along=cross3(away, drawVector(rng, 3));
        if (!isZeroVector(along)&&isWholeLength(lengthOf(along))) return {along, away};
    }
    return {along:[3, 4, 0], away:[-4, 3, 0]};
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
 * Renders a point for a prompt, in parentheses rather than angle brackets, so a
 * point and a direction are never printed the same way.
 *
 * @param v - The point.
 * @returns The LaTeX body, without math delimiters.
 */
function pointLatex(v: number[]): string{
    return `(${v.map(x=>trimNum(x)).join(", ")})`;
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
 * Assembles the option set: the answer, then three distractors, dropping anything
 * that repeats an option already offered. The answer stays first, and the distractors
 * keep the order they were built in, because the app chooses where the answer is
 * displayed.
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
 * The wrong options for a whole-number answer. The trailing offsets are always
 * distinct from the answer and from each other, so the pool cannot run dry even when
 * every meaningful candidate collides with one of them.
 *
 * @param answer - The correct value.
 * @param meaningful - Up to four candidates coming from the named mistakes.
 * @returns Candidate option texts.
 */
function integerDistractors(answer: number, meaningful: number[]): string[]{
    let pool=meaningful.concat([answer+1, answer-1, answer+2, answer-2, answer+3, answer-3, answer+4, answer-4]);
    return pool.map(v=>String(v));
}

export function generateVectors3D(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=difficulty==="easy"?["cross_product", "triple_product", "angle_3d"]
        :["cross_product", "triple_product", "angle_3d", "point_line_distance", "point_plane_distance"];
    let type=pick(rng, types);
    let spread=difficulty==="easy"?4:difficulty==="hard"?8:6;
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "cross_product":{
            let u=drawVector(rng, spread);
            let w=drawVector(rng, spread, u);
            let answer=cross3(u, w);
            correct=vectorText(answer);
            alternate=correct;
            display=vectorLatex(answer);
            latex=`Find \\( ${vectorLatex(u)} \\times ${vectorLatex(w)} \\).`;
            expectedFormat="Enter as (a, b, c)";
            // The order of the factors fixes the sign, so the reversed product is wrong
            // rather than another way of writing the right one. The componentwise
            // product and the pairwise sums are what a learner writes when the
            // cross product is mistaken for a product, and displacing each entry of the
            // answer keeps the pool from ever running short.
            let componentwise=[u[0]*w[0], u[1]*w[1], u[2]*w[2]];
            let pairwise=[u[0]*w[1]+u[1]*w[0], u[0]*w[2]+u[2]*w[0], u[1]*w[2]+u[2]*w[1]];
            let nudged: string[]=[];
            for(let i=0; i<3; i++){
                let copy=answer.slice();
                copy[i]=copy[i]+1;
                nudged.push(vectorText(copy));
            }
            choices=fourOptions(correct, [vectorText(cross3(w, u)), vectorText(componentwise), vectorText(pairwise), ...nudged]);
            rungs=[
                "The cross product's three components are differences of products taken in a fixed order, and the order of the two factors decides the sign, so swapping them negates the answer rather than rewriting it.",
                "Form each component as one product minus another, moving down the components of the first factor while moving across the second."
            ];
            steps=[
                `The vectors are ${vectorLatex(u)} and ${vectorLatex(w)}.`,
                `First component: ${u[1]} x ${w[2]} - ${u[2]} x ${w[1]} = ${answer[0]}; second: ${u[2]} x ${w[0]} - ${u[0]} x ${w[2]} = ${answer[1]}; third: ${u[0]} x ${w[1]} - ${u[1]} x ${w[0]} = ${answer[2]}.`,
                `So the cross product is ${correct}.`
            ];
            break;
        }
        case "triple_product":{
            let u=drawVector(rng, spread);
            let w=drawVector(rng, spread, u);
            let across=cross3(u, w);
            let t=drawOffPlane(rng, across, spread);
            let side=cross3(w, t);
            let answer=dot(u, cross3(w, t));
            correct=String(answer);
            alternate=correct;
            display=correct;
            latex=`Find the scalar triple product \\( ${vectorLatex(u)} \\cdot (${vectorLatex(w)} \\times ${vectorLatex(t)}) \\).`;
            choices=fourOptions(correct, integerDistractors(answer, [dot(u, w), dot(u, t), -answer]));
            rungs=[
                "The scalar triple product is a dot product of one vector with the cross product of the other two, and it is zero exactly when the three lie in a plane, which is why the sign and the order both matter.",
                "Form the cross product of the two vectors written inside the brackets, then take its dot product with the vector outside them."
            ];
            steps=[
                `The outer vector is ${vectorLatex(u)}; the inner cross product is ${vectorLatex(w)} x ${vectorLatex(t)}.`,
                `That cross product is ${vectorLatex(side)}.`,
                `Its dot product with ${vectorLatex(u)} is ${u[0]} x ${side[0]} + ${u[1]} x ${side[1]} + ${u[2]} x ${side[2]} = ${answer}, so the scalar triple product is ${correct}.`
            ];
            break;
        }
        case "angle_3d":{
            let first=randInt(rng, 0, DIRECTIONS.length-1);
            let second=randInt(rng, 0, DIRECTIONS.length-2);
            if (second>=first) second++;
            let u=DIRECTIONS[first].map(v=>v*randInt(rng, 1, spread));
            let w=DIRECTIONS[second].map(v=>v*randInt(rng, 1, spread));
            // The rounding removes the representation error of evaluating a cosine
            // root, not a real value: every reachable angle is already a whole number of
            // degrees, and the option set is exactly those five angles.
            let degrees=roundTo(Math.acos(dot(u, w)/(lengthOf(u)*lengthOf(w)))*180/Math.PI, 4);
            let answer=String(Math.round(degrees));
            correct=answer;
            alternate=correct;
            display=`\\( ${answer}^{\\circ} \\)`;
            latex=`Find the angle in degrees between \\( ${vectorLatex(u)} \\) and \\( ${vectorLatex(w)} \\).`;
            expectedFormat="Enter a whole number of degrees";
            choices=fourOptions(correct, ANGLES.map(String).filter(v=>v!==answer));
            rungs=[
                "The angle between two vectors comes from their dot product divided by the product of their lengths, which gives the cosine of the angle, and the answer is in degrees rather than radians.",
                "Compute the dot product and the two lengths, form the cosine, and read the angle off it in degrees."
            ];
            steps=[
                `The vectors are ${vectorLatex(u)} and ${vectorLatex(w)}.`,
                `Their dot product is ${dot(u, w)} and their lengths are ${fmt(lengthOf(u), 4)} and ${fmt(lengthOf(w), 4)}.`,
                `Their ratio is the cosine of ${degrees} degrees, so the angle in whole degrees is ${correct}`
            ];
            break;
        }
        case "point_line_distance":{
            let pair=integerPerpendicularPair(rng, Math.floor(spread/3));
            // Each scale is drawn once and applied to the whole vector. Drawing one per
            // entry would scale the components unequally, which destroys both the whole
            // length and the perpendicularity the pair was built to have.
            let alongScale=randInt(rng, 1, 3);
            let awayScale=randInt(rng, 1, 3);
            let along=pair.along.map(v=>v*alongScale);
            let away=pair.away.map(v=>v*awayScale);
            let anchor=drawVector(rng, spread);
            let shift=randInt(rng, -3, 3);
            let point=anchor.map((x, i)=>x+along[i]*shift+away[i]);
            let answer=lengthOf(away);
            correct=String(answer);
            alternate=correct;
            display=correct;
            latex=`Find the distance from the point \\( ${pointLatex(point)} \\) to the line \\( ${pointLatex(anchor)} + t ${
                vectorLatex(along)} \\), where \\( t \\) runs over the real numbers.`;
            choices=fourOptions(correct, integerDistractors(answer, [0, answer*2, -answer]));
            rungs=[
                "The distance from a point to a line is the length of the part of the point-to-anchor vector that is perpendicular to the line, so the component along the line's direction contributes nothing.",
                "Take the vector from the anchor to the point, split it into a part along the line's direction and a part across it, and keep the across part."
            ];
            steps=[
                `The line runs through ${pointLatex(anchor)} with direction ${vectorLatex(along)}, and the point is ${pointLatex(point)}.`,
                `The vector from the anchor to the point is ${shift} times the direction vector plus ${vectorLatex(away)}, and ${vectorLatex(away)} is perpendicular to it.`,
                `The length of the perpendicular part is ${answer}, so the distance is ${correct}.`
            ];
            break;
        }
        case "point_plane_distance":{
            let normal=wholeVector(rng, Math.floor(spread/2));
            let anchor=drawVector(rng, spread);
            let slides=perpendicular(rng, normal);
            let shift=randNonZero(rng, -3, 3, 0);
            let point=anchor.map((x, i)=>x+normal[i]*shift+slides[i]);
            let answer=Math.abs(shift)*lengthOf(normal);
            correct=String(answer);
            alternate=correct;
            display=correct;
            latex=`Find the distance from the point \\( ${pointLatex(point)} \\) to the plane through \\( ${
                pointLatex(anchor)} \\) with normal vector \\( ${vectorLatex(normal)} \\).`;
            choices=fourOptions(correct, integerDistractors(answer, [0, answer*2, -answer]));
            rungs=[
                "The distance from a point to a plane is the length of the part of the point-to-anchor vector that runs along the plane's normal, since the part lying in the plane contributes nothing.",
                "Split the vector from the anchor to the point into a part along the normal and a part inside the plane, and keep the part along the normal."
            ];
            steps=[
                `The plane passes through ${pointLatex(anchor)} with normal ${vectorLatex(normal)}, and the point is ${pointLatex(point)}.`,
                `The vector from the anchor to the point is ${shift} times the normal, ${vectorLatex(normal.map(v=>v*shift))}, plus a part inside the plane.`,
                `The length of the normal part is ${answer}, so the distance is ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices, expectedFormat, subskill: type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}
