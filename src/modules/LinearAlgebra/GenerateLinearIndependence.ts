/**
 * @file Linear independence: recognizing a linear combination, spotting the dependent
 * set, the test for being a basis, and the dimension of a span.
 * @description A pair of planar vectors is linearly dependent exactly when its
 * determinant is zero, so every "is this one in the span of that" question in this
 * file is answered by an integer determinant rather than by solving. That is what
 * makes the option sets provable: a vector offered as a distractor is kept only when
 * the determinant rules it out of the span, so no option is the right answer written
 * again.
 *
 * The dependent-set branch builds its three independent sets and its one dependent
 * set the same way and then checks the determinants, so the single dependent set is
 * a property of the printed options rather than an assumption about them.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from "../shared/Random";
import{trimNum}from"../shared/Latex";

/**
 * The determinant of a two-by-two matrix, which is nonzero exactly when the two
 * columns are linearly independent.
 *
 * @param a - The first vector.
 * @param b - The second vector.
 * @returns The determinant.
 */
function determinant2(a: number[], b: number[]): number{
    return a[0]*b[1]-a[1]*b[0];
}

/**
 * Draws a planar vector that is not the zero vector. The retry is bounded and the
 * fallback is a unit vector.
 *
 * @param rng - The injected random source.
 * @param spread - The largest magnitude allowed for an entry.
 * @returns A nonzero vector.
 */
function drawVector(rng: RngFn, spread: number): number[]{
    for(let attempt=0; attempt<64; attempt++){
        let v=[randInt(rng, -spread, spread), randInt(rng, -spread, spread)];
        if (v[0]!==0||v[1]!==0) return v;
    }
    return [1, 0];
}

/**
 * Draws two independent planar vectors, whose determinant is nonzero by
 * construction. The retry is bounded and the fallback is a known independent pair.
 *
 * @param rng - The injected random source.
 * @param spread - The largest magnitude allowed for an entry.
 * @returns Two independent vectors.
 */
function drawIndependentPair(rng: RngFn, spread: number): [number[], number[]]{
    for(let attempt=0; attempt<64; attempt++){
        let first=drawVector(rng, spread);
        let second=drawVector(rng, spread);
        if (determinant2(first, second)!==0) return [first, second];
    }
    return [[1, 0], [0, 1]];
}

/**
 * Draws a nonzero integer, so a built vector is a genuine combination of two basis
 * vectors rather than one of them. The retry is bounded and the fallback is 1.
 *
 * @param rng - The injected random source.
 * @param spread - The largest magnitude allowed.
 * @returns A nonzero integer.
 */
function randNonZero(rng: RngFn, spread: number): number{
    for(let attempt=0; attempt<64; attempt++){
        let value=randInt(rng, -spread, spread);
        if (value!==0) return value;
    }
    return 1;
}

/**
 * Reports whether a vector lies in the span of two independent planar vectors, which
 * is the same question as whether it is a linear combination of them.
 *
 * @param a - The first spanning vector.
 * @param b - The second spanning vector.
 * @param v - The candidate.
 * @returns True when `v` is in the span of `a` and `b`.
 */
function inSpan(a: number[], b: number[], v: number[]): boolean{
    return determinant2(a, v)===0&&determinant2(b, v)===0;
}

/**
 * Three vectors outside the span of two given vectors, for a "which vector is a
 * linear combination" question. Each is kept only when the determinant rules it out,
 * so none of them is the answer written again.
 *
 * @param first - The first spanning vector.
 * @param second - The second spanning vector.
 * @param spread - The largest magnitude allowed for an entry.
 * @param rng - The injected random source.
 * @returns Candidate option texts.
 */
function outsideSpan(first: number[], second: number[], spread: number, rng: RngFn): string[]{
    let pool: string[]=[];
    let seen=new Set<string>();
    for(let attempt=0; attempt<64&&pool.length<4; attempt++){
        let candidate=drawVector(rng, spread);
        if (inSpan(first, second, candidate)) continue;
        let text=vectorText(candidate);
        if (seen.has(text)) continue;
        seen.add(text);
        pool.push(text);
    }
    return pool;
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
 * Renders a set of two vectors as a plain option.
 *
 * @param a - The first vector.
 * @param b - The second vector.
 * @returns The option text.
 */
function setText(a: number[], b: number[]): string{
    return `{${vectorText(a)}, ${vectorText(b)}}`;
}

export function generateLinearIndependence(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["linear_combination", "dependent_set", "the_basis_test", "dimension"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?4:difficulty==="hard"?8:6;
    let correct="";
    let latex="";
    let expectedFormat="Enter as (a, b)";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "linear_combination":{
            let pair=drawIndependentPair(rng, spread);
            let first=pair[0];
            let second=pair[1];
            let weightA=randNonZero(rng, spread);
            let weightB=randNonZero(rng, spread);
            let wanted=[weightA*first[0]+weightB*second[0], weightA*first[1]+weightB*second[1]];
            correct=vectorText(wanted);
            latex=`Let \\( u = ${vectorLatex(first)} \\) and \\( w = ${vectorLatex(second)} \\). Exactly one of the four vectors below is a linear combination of \\( u \\) and \\( w \\). Which one?`;
            choices=fourOptions(correct, outsideSpan(first, second, spread, rng));
            rungs=[
                "A vector is a linear combination of two independent vectors exactly when it is parallel to each of them, and the test for parallel is a zero determinant.",
                `For each candidate v, compute det(u, v) = ${first[0]} v_2 - ${first[1]} v_1 and det(w, v) = ${second[0]} v_2 - ${second[1]} v_1; both have to come out zero.`
            ];
            steps=[
                `Any combination c u + d w is parallel to both u and w, so it satisfies ${first[0]} v_2 - ${first[1]} v_1 = 0 and ${second[0]} v_2 - ${second[1]} v_1 = 0.`,
                `For ${vectorText(wanted)} those two expressions are ${first[0]*wanted[1]-first[1]*wanted[0]} and ${second[0]*wanted[1]-second[1]*wanted[0]}, so both vanish.`,
                `It is in fact ${weightA} u + ${weightB} w, so the vector in the span is ${correct}.`
            ];
            break;
        }
        case "dependent_set":{
            // The dependent set is a vector together with a nonzero multiple of it; the
            // other three are drawn and then checked to be independent of each other.
            let pair=drawIndependentPair(rng, spread);
            let weakBase=pair[0];
            let multiple=randNonZero(rng, 3);
            let weak=[multiple*weakBase[0], multiple*weakBase[1]];
            correct=setText(weakBase, weak);
            let others: string[]=[];
            let seen=new Set<string>([correct]);
            for(let attempt=0; attempt<64&&others.length<3; attempt++){
                let candidate=drawIndependentPair(rng, spread);
                if (determinant2(candidate[0], candidate[1])===0) continue;
                if (candidate[0][0]===weakBase[0]&&candidate[0][1]===weakBase[1]) continue;
                let text=setText(candidate[0], candidate[1]);
                if (seen.has(text)) continue;
                seen.add(text);
                others.push(text);
            }
            latex="Exactly one of the four sets below is linearly dependent. Which one?";
            choices=fourOptions(correct, others);
            expectedFormat="Enter the set, for example {(1, 2), (2, 4)}";
            rungs=[
                "Two vectors are linearly dependent exactly when one is a nonzero multiple of the other, which is the same as their determinant being zero.",
                "For each set compute the determinant of the matrix whose columns are the two vectors and look for the set whose determinant comes out zero."
            ];
            steps=[
                `In ${correct} the second vector is ${multiple} times the first, so their determinant is ${weakBase[0]*weak[1]-weakBase[1]*weak[0]}, which is zero.`,
                `Every other offered set has a nonzero determinant between its two vectors, so its two vectors are independent of each other.`,
                `The linearly dependent set is ${correct}.`
            ];
            break;
        }
        case "the_basis_test":{
            let dimension=difficulty==="easy"?3:randInt(rng, 2, 4);
            let key=dimension;
            correct=String(key);
            latex=`A set \\( S \\) of vectors spans \\( \\mathbb{R}^{${dimension}} \\), and its vectors are linearly independent. How many vectors does \\( S \\) contain?`;
            choices=numberOptions(key, [key-1, key+1, 2*key, key-2]);
            rungs=[
                "A set that both spans an n-dimensional space and is linearly independent is a basis, and a basis of an n-dimensional space has exactly n vectors in it.",
                `The space here is \\( \\mathbb{R}^{${dimension}} \\), so the count is the dimension itself.`
            ];
            steps=[
                `A basis of \\( \\mathbb{R}^{${dimension}} \\) has exactly ${dimension} vectors, whatever the vectors themselves are.`,
                `S spans the space and its vectors are independent, so S is a basis.`,
                `S therefore contains ${dimension} vectors, so the answer is ${correct}.`
            ];
            break;
        }
        case "dimension":{
            let pair=drawIndependentPair(rng, spread);
            let first=pair[0];
            let second=pair[1];
            let third=[2*first[0]+second[0], 2*first[1]+second[1]];
            if (rng()<0.5){
                let alternative=drawVector(rng, spread);
                if (determinant2(first, alternative)!==0&&determinant2(second, alternative)!==0) third=alternative;
            }
            let inside=determinant2(first, third)===0&&determinant2(second, third)===0;
            let key=inside?2:3;
            correct=String(key);
            latex=`Let \\( v_1 = ${vectorLatex(first)} \\), \\( v_2 = ${vectorLatex(second)} \\) and \\( v_3 = ${vectorLatex(third)} \\). What is the dimension of the span of \\( \\{v_1, v_2, v_3\\} \\)?`;
            choices=fourOptions(correct, ["1", "2", "3", "4"].filter(v=>v!==correct));
            rungs=[
                "The dimension of a span is the number of linearly independent vectors in it, so a third vector that is already a combination of the first two adds nothing to the dimension.",
                `Compare v_3 = ${third.join(", ")} against the pair v1 and v2 by computing det(v1, v3) and det(v2, v3).`
            ];
            steps=[
                `v1 = ${first.join(", ")} and v2 = ${second.join(", ")} have determinant ${determinant2(first, second)}, so they are independent and the span is at least two dimensional.`,
                `For v3 = ${third.join(", ")}, det(v1, v3) = ${determinant2(first, third)} and det(v2, v3) = ${determinant2(second, third)}, so v3 ${inside?"is a combination of v1 and v2 and adds nothing":"is independent of them"}.`,
                `The span therefore has dimension ${key}, so the answer is ${correct}.`
            ];
            break;
        }
    }
    return {latex, correct, alternate:correct, display:correct, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}