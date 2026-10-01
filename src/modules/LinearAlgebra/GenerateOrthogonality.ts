/**
 * @file Orthogonality: dot products, projections, Gram-Schmidt, complements and lengths.
 * @description Orthogonality is worth its own topic because it is the one idea that
 * makes a vector question answerable exactly. A length built from an integer vector
 * whose length is already a whole number, or a projection built from a point placed a
 * known distance off the target direction, comes out as a whole number, so the
 * printed vector and the graded answer are the same object rather than two numbers
 * that happen to agree to two places.
 *
 * Every vector here is drawn first and every answer is then derived from the drawn
 * vector, which is the only order that keeps the two in step. Nothing is rounded.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, randNonZero, pick}from"../shared/Random";
import{trimNum}from"../shared/Latex";

/** Two-dimensional vectors whose length is a whole number. */
let WHOLE_2D: number[][]=[[3, 4], [5, 12], [8, 15], [7, 24]];
/** Three-dimensional vectors whose length is a whole number. */
let WHOLE_3D: number[][]=[[1, 2, 2], [2, 3, 6], [1, 4, 8], [2, 6, 9], [3, 4, 12], [6, 3, 2]];

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
 * Reports whether a vector is the zero vector, which no projection may collapse to
 * and no cross product may return.
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
 * Reports whether two vectors point the same way. A projection and an orthogonal
 * vector are each only fixed up to a nonzero factor, so a multiple of the answer is a
 * second correct option rather than a wrong one and has to be filtered out.
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
 * Draws a vector with whole-number entries that is not the zero vector. The retry is
 * bounded and the fallback is a unit vector, so a stream that keeps returning the
 * same value cannot spin.
 *
 * @param rng - The injected random source.
 * @param size - Two or three.
 * @param spread - The largest magnitude allowed for an entry.
 * @returns The vector.
 */
function drawVector(rng: RngFn, size: number, spread: number): number[]{
    for(let attempt=0; attempt<64; attempt++){
        let v: number[]=[];
        for(let i=0; i<size; i++) v.push(randInt(rng, -spread, spread));
        if (!isZeroVector(v)) return v;
    }
    let fallback: number[]=[];
    for(let i=0; i<size; i++) fallback.push(i===0?1:0);
    return fallback;
}

/**
 * Draws a vector whose length is a whole number, by scaling one whose length already
 * is. Scaling by a whole number keeps both the entries and the length integral.
 *
 * @param rng - The injected random source.
 * @param size - Two or three.
 * @param spread - The largest scale factor allowed.
 * @returns The vector.
 */
function wholeVector(rng: RngFn, size: number, spread: number): number[]{
    let base=pick(rng, size===2?WHOLE_2D:WHOLE_3D);
    let scale=randInt(rng, 1, Math.max(1, spread));
    return base.map(v=>v*scale);
}

/**
 * A nonzero vector perpendicular to the given one, in whole numbers. The cross
 * product gives one for free in three dimensions and a quarter turn gives one in two,
 * so the perpendicularity is exact by construction rather than found by search.
 *
 * @param rng - The injected random source.
 * @param v - The vector to be perpendicular to, which must not be zero.
 * @returns A nonzero vector perpendicular to it.
 */
function perpendicular(rng: RngFn, v: number[]): number[]{
    if (v.length===2){
        let scale=randNonZero(rng, 1, 2, 0);
        return [-v[1]*scale, v[0]*scale];
    }
    for(let attempt=0; attempt<64; attempt++){
        let q=cross3(v, drawVector(rng, 3, 3));
        if (!isZeroVector(q)) return q;
    }
    // Each of these is the cross product with a coordinate axis, so each is
    // perpendicular, and a nonzero vector makes at least one of them nonzero.
    let axes=[[0, v[2], -v[1]], [-v[2], 0, v[0]], [v[1], -v[0], 0]];
    for(let q of axes){
        if (!isZeroVector(q)) return q;
    }
    return [0, 0, 1];
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
 * Assembles the option set: the answer, then three distractors, dropping anything
 * that repeats an option already offered. The answer stays first, and the
 * distractors keep the order they were built in, because the app chooses where the
 * answer is displayed.
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

/**
 * The wrong options for a vector answer that is only fixed up to scale. Each is the
 * answer with one entry displaced, and displacing coordinate `i` of a vector that is
 * not already along that axis can never leave it proportional, so the options are
 * provably wrong rather than merely different.
 *
 * @param key - The correct vector.
 * @returns Candidate option texts.
 */
function vectorDistractors(key: number[]): string[]{
    let n=key.length;
    let pool: number[][]=[];
    for(let i=0; i<n; i++){
        let spansAxis=true;
        for(let j=0; j<n; j++){
            if (j!==i&&key[j]!==0) spansAxis=false;
        }
        if (spansAxis) continue;
        for(let delta of [1, -1, 2, -2, 3]){
            let copy=key.slice();
            copy[i]=copy[i]+delta;
            pool.push(copy);
        }
    }
    return pool.filter(v=>!isParallel(key, v)).map(vectorText);
}

/**
 * Two mutually perpendicular vectors in whole numbers, which is the frame the
 * Gram-Schmidt questions are built from. Taking the second as a quarter turn or a
 * cross product makes the perpendicularity exact rather than searched for.
 *
 * @param rng - The injected random source.
 * @param size - Two or three.
 * @returns The frame, with an empty third entry in two dimensions.
 */
function orthogonalFrame(rng: RngFn, size: number): {first: number[], second: number[], third: number[]}{
    if (size===2){
        let a=randNonZero(rng, -3, 3, 0);
        let b=randInt(rng, -3, 3);
        return {first:[a, b], second:[-b, a], third:[]};
    }
    let a=randNonZero(rng, -3, 3, 0);
    let b=randInt(rng, -3, 3);
    let c=randInt(rng, -3, 3);
    let first=[a, b, c];
    let second=[c, 0, -a];
    return {first, second, third:cross3(first, second)};
}

/**
 * A list of vectors that Gram-Schmidt turns into whole numbers. Each is built as a
 * whole-number combination of an orthogonal frame, so subtracting a projection from
 * it leaves an exact integer rather than the fraction the question would then have
 * to round.
 *
 * @param rng - The injected random source.
 * @param size - Two or three.
 * @param spread - The largest scale factor allowed.
 * @returns The input vectors and the orthogonalised vector the question asks for.
 */
function gramSchmidtCase(rng: RngFn, size: number, spread: number): {inputs: number[][], answer: number[]}{
    let frame=orthogonalFrame(rng, size);
    let scale=randNonZero(rng, 1, Math.max(1, spread), 0);
    let first=frame.first.map(x=>x*scale);
    let secondMix=randInt(rng, -2, 2);
    let secondWeight=randNonZero(rng, -3, 3, 0);
    let second=frame.first.map((x, i)=>x*secondMix+frame.second[i]*secondWeight);
    if (size===2) return {inputs:[first, second], answer:frame.second.map(x=>x*secondWeight)};
    let thirdMix=randInt(rng, -2, 2);
    let thirdSecondMix=randInt(rng, -2, 2);
    let thirdWeight=randNonZero(rng, -3, 3, 0);
    let third: number[]=[];
    for(let i=0; i<3; i++) third.push(first[i]*thirdMix+frame.second[i]*thirdSecondMix+frame.third[i]*thirdWeight);
    return {inputs:[first, second, third], answer:frame.third.map(x=>x*thirdWeight)};
}

export function generateOrthogonality(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=difficulty==="easy"?["dot_product", "norm"]
        :difficulty==="hard"?["dot_product", "projection", "gram_schmidt", "orthogonal_complement", "norm"]
        :["dot_product", "projection", "gram_schmidt", "orthogonal_complement", "norm"];
    let type=pick(rng, types);
    let size=difficulty==="easy"?2:3;
    let spread=difficulty==="easy"?6:difficulty==="hard"?9:7;
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    switch(type){
        case "dot_product":{
            let u=drawVector(rng, size, spread);
            let w=drawVector(rng, size, spread);
            let answer=dot(u, w);
            correct=String(answer);
            alternate=correct;
            display=correct;
            latex=`Find \\( ${vectorLatex(u)} \\cdot ${vectorLatex(w)} \\).`;
            let meaningful=[0];
            for(let i=0; i<size; i++) meaningful.push(answer+2*u[i]*w[i]);
            choices=fourOptions(correct, integerDistractors(answer, meaningful));
            break;
        }
        case "norm":{
            let v=wholeVector(rng, size, spread);
            let answer=lengthOf(v);
            correct=String(answer);
            alternate=correct;
            display=correct;
            latex=`Find \\( \\left\\| ${vectorLatex(v)} \\right\\| \\).`;
            let total=0;
            for(let i=0; i<size; i++) total+=Math.abs(v[i]);
            choices=fourOptions(correct, integerDistractors(answer, [total, answer*2, -answer]));
            break;
        }
        case "projection":{
            // The point is built as a whole multiple of the target direction plus a
            // displacement known to be perpendicular to it, so the projection is that
            // multiple exactly and the division a learner does cancels to a whole
            // number with no rounding anywhere.
            let v=drawVector(rng, size, spread);
            let away=perpendicular(rng, v);
            let multiple=randNonZero(rng, 1, Math.max(1, spread-2), 0);
            let along=v.map(x=>x*multiple);
            let point=along.map((x, i)=>x+away[i]);
            correct=vectorText(along);
            alternate=correct;
            display=vectorLatex(along);
            latex=`Find the projection of \\( ${vectorLatex(point)} \\) onto \\( ${vectorLatex(v)} \\).`;
            expectedFormat=size===2?"Enter as (a, b)":"Enter as (a, b, c)";
            choices=fourOptions(correct, [vectorText(away), vectorText(point), ...vectorDistractors(along)]);
            break;
        }
        case "gram_schmidt":{
            let count=difficulty==="hard"?3:2;
            let subject=gramSchmidtCase(rng, count, spread);
            let wanted=subject.answer;
            let position=count===2?"second":"third";
            correct=vectorText(wanted);
            alternate=correct;
            display=vectorLatex(wanted);
            latex=`Apply Gram-Schmidt to the ordered list ${subject.inputs.map(vectorLatex).join(", ")}. What is the ${position} vector the process produces?`;
            expectedFormat=count===2?"Enter as (a, b)":"Enter as (a, b, c)";
            choices=fourOptions(correct, vectorDistractors(wanted));
            break;
        }
        case "orthogonal_complement":{
            let v=drawVector(rng, size, spread);
            let answer: number[]=[];
            let offered: string[]=[];
            if (size===2){
                answer=[-v[1], v[0]];
                latex=`Give a vector perpendicular to \\( ${vectorLatex(v)} \\).`;
            }
            else{
                let w=drawVector(rng, size, spread);
                let attempt=0;
                while (isParallel(v, w)&&attempt<64){
                    w=drawVector(rng, size, spread);
                    attempt++;
                }
                // Negating one entry can never leave a vector proportional to itself,
                // so this is a safe last resort when the stream keeps drawing w
                // parallel to v and the cross product would come back zero.
                if (isParallel(v, w)) w=[v[1], -v[0], v[2]];
                answer=cross3(v, w);
                latex=`Give a vector perpendicular to both \\( ${vectorLatex(v)} \\) and \\( ${vectorLatex(w)} \\).`;
                offered.push(vectorText(w));
            }
            correct=vectorText(answer);
            alternate=correct;
            display=vectorLatex(answer);
            expectedFormat=size===2?"Enter as (a, b)":"Enter as (a, b, c)";
            choices=fourOptions(correct, [vectorText(v), ...offered, ...vectorDistractors(answer)]);
            break;
        }
    }
    return {latex, correct, alternate, display, choices, expectedFormat, subskill: type};
}
