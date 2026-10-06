/**
 * @file The ambiguous case of the sine rule, in which two sides and one angle are
 * given and there may be no triangle, one, or two.
 * @description The classification is not asserted, it is computed and then checked.
 * For each draw the generator forms `sin B = b sin A / a`, takes both candidate
 * angles, and counts the ones that leave a positive third angle; each candidate is
 * then put through the cosine rule as an independent check, so a draw that slips a
 * case is rejected rather than printed. The branch asks for that count, so the key
 * is what the printed data actually produces.
 *
 * The rule the arithmetic implements is this: with `A` acute and `h = b sin A`
 * there are two triangles when `h < a < b`, one when `a >= b` or `a = h`, and none
 * when `a < h`. With `A` obtuse there is one when `a > b` and none otherwise.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";
import{fmt, fmtTrim}from"../shared/Numeric.js";

/** How many decimal places an angle produced by the sine rule is reported at. */
const ANGLE_PLACES=1;

/** One SSA draw together with the triangles it actually produces. */
interface Ambiguous{
    /** The side opposite the given angle. */
    a: number;
    /** The other given side. */
    b: number;
    /** The given angle, in degrees. */
    A: number;
    /** The number of triangles the data produce. */
    count: number;
    /** The sine the rule produces. */
    sine: number;
    /** The acute candidate for the second angle, in degrees. */
    acute: number;
    /** The obtuse candidate for the second angle, in degrees. */
    obtuse: number;
}

/**
 * Counts the triangles a set of SSA data really produces, by forming both candidate
 * angles and keeping the ones that leave a positive third angle.
 *
 * @param a - The side opposite the given angle.
 * @param b - The other given side.
 * @param A - The given angle, in degrees.
 * @param sine - The value `b sin A / a`.
 * @returns How many triangles exist.
 */
function triangleCount(a: number, b: number, A: number, sine: number): number{
    if (sine>1||sine<=0) return 0;
    let acute=Math.asin(sine)*180/Math.PI;
    let count=0;
    for(let candidate of [acute, 180-acute]){
        let third=180-A-candidate;
        if (third>1e-9&&candidate>1e-9&&consistent(a, b, A, candidate, third)) count++;
    }
    return count;
}

/**
 * Checks one candidate triangle against the cosine rule, which is the only way to
 * be sure a candidate the sine rule produced is a real triangle rather than a
 * coincidence. The third side is taken from the sine rule and the cosine rule is
 * then applied to a different side, so the two rules are genuinely independent.
 *
 * @param a - The side opposite the given angle.
 * @param b - The other given side.
 * @param A - The given angle, in degrees.
 * @param B - The candidate angle, in degrees.
 * @param C - The third angle, in degrees.
 * @returns True when the candidate is self-consistent.
 */
function consistent(a: number, b: number, A: number, B: number, C: number): boolean{
    if (!(C>0)||!(B>0)) return false;
    let sinA=Math.sin(A*Math.PI/180);
    if (!(sinA>0)) return false;
    let c=a*Math.sin(C*Math.PI/180)/sinA;
    if (!Number.isFinite(c)||!(c>0)) return false;
    let residual=b*b-a*a-c*c+2*a*c*Math.cos(B*Math.PI/180);
    return Math.abs(residual)<1e-6;
}

/**
 * Builds one SSA draw of a requested class. The construction already targets the
 * class, and the count is then recomputed and compared, so a construction that does
 * not land where it meant to is rejected. The search is bounded and falls back to a
 * draw checked by hand, so a degenerate random source cannot spin here.
 *
 * @param wanted - The number of triangles the branch asks about.
 * @param rng - The injected random source.
 * @returns A draw whose count is exactly `wanted`.
 */
function drawAmbiguous(wanted: number, wide: boolean, rng: () => number): Ambiguous{
    for(let attempt=0; attempt<64; attempt++){
        let obtuseAngle=attempt%2===1;
        let A=obtuseAngle?randInt(rng, 100, 160):randInt(rng, 20, 80);
        let b=randInt(rng, 8, wide?40:26);
        let h=b*Math.sin(A*Math.PI/180);
        let a;
        if (wanted===2){
            let span=Math.floor(b-h)-2;
            if (span<1) continue;
            a=Math.round(h)+1+Math.floor(rng()*span);
        }
        else if (wanted===1){
            if (obtuseAngle) a=b+randInt(rng, 1, wide?20:10);
            else a=b+randInt(rng, 0, wide?16:8);
        }
        else{
            if (obtuseAngle) a=Math.max(1, b-randInt(rng, 0, wide?14:6));
            else a=Math.max(1, Math.round(h*(0.1+0.8*rng())));
        }
        if (a<=0) continue;
        let sine=b*Math.sin(A*Math.PI/180)/a;
        if (!(sine>0)) continue;
        if (triangleCount(a, b, A, sine)!==wanted) continue;
        let acute=Math.asin(Math.min(sine, 1))*180/Math.PI;
        return {a, b, A, count:wanted, sine, acute, obtuse:180-acute};
    }
    return fallback(wanted);
}

/**
 * The draw used when the bounded search is exhausted. Each entry is verified by
 * hand: `a = 11, b = 14, A = 30` gives `sin B = 0.636`, two candidates under 180
 * degrees with `A`; `a = 12, b = 10, A = 40` gives `a > b`, one candidate;
 * `a = 5, b = 10, A = 30` gives `sin B = 1` at `b = a`, which puts `B` at a right
 * angle already spoken for, so none.
 *
 * @param wanted - The number of triangles the branch asks about.
 * @returns A verified draw.
 */
function fallback(wanted: number): Ambiguous{
    let spec=wanted===2?{a:11, b:14, A:30}:wanted===1?{a:12, b:10, A:40}:{a:5, b:10, A:30};
    let sine=spec.b*Math.sin(spec.A*Math.PI/180)/spec.a;
    let acute=Math.asin(Math.min(sine, 1))*180/Math.PI;
    return {a:spec.a, b:spec.b, A:spec.A, count:wanted, sine, acute, obtuse:180-acute};
}

export function generateAmbiguousCase(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["two_possible_triangles","one_possible_triangle","no_possible_triangle","verify_a_solution"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    if (type==="verify_a_solution") return verifyQuestion(rng, wide);
    let wanted=type==="two_possible_triangles"?2:type==="one_possible_triangle"?1:0;
    let candidate=drawAmbiguous(wanted, wide, rng);
    let h=candidate.b*Math.sin(candidate.A*Math.PI/180);
    let key=candidate.count;
    let rungs=[
        "Draw the height from the given angle, which is `b sin A`, and see where the side `a` falls relative to that height and to `b`. Then form `sin B = b sin A / a` and count the candidate angles that leave a positive third angle.",
        `The height is \\( h = b \\sin A \\), and the candidate angles come from \\( \\sin B = b \\sin A / a \\); each candidate has to leave a positive third angle before it counts.`
    ];
    let comparison=wanted===2?
        `Here \\( h \\approx ${fmt(h, 3)} < a = ${candidate.a} < b = ${candidate.b} \\), which is the case that produces two triangles.`:
        wanted===1?
        `Here \\( a = ${candidate.a} \\ge b = ${candidate.b} \\), so at most one candidate survives the angle sum.`:
        `Here \\( a = ${candidate.a} < h \\approx ${fmt(h, 3)} \\), so the rule asks for a sine greater than one and no triangle exists.`;
    return {
        latex:`You are given \\( a = ${candidate.a} \\), \\( b = ${candidate.b} \\) and \\( A = ${candidate.A}^{\\circ} \\), which is the ambiguous case of the sine rule. How many triangles have these measurements?`,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2)+" triangles",
        display:`h = ${fmt(h, 3)},\\ a = ${candidate.a},\\ b = ${candidate.b}`,
        choices: numberOptions(key, [0, 1, 2, 3].filter(value => value!==key), 0),
        expectedFormat:"Enter a whole number of triangles",
        subskill: type,
        hints: {rungs, concede: "The answer is "+key+"."},
        solution: [
            `$ h = b \\sin A = ${candidate.b} \\sin(${candidate.A}°) = ${fmt(h, 4)} $, and the given side is \\( a = ${candidate.a} \\).`,
            comparison,
            `$ \\sin B = \\dfrac{b \\sin A}{a} = ${fmt(candidate.sine, 4)} $ gives the candidate angles, and ${candidate.count} of them leave a positive third angle, so the answer is ${key}.`
        ]
    };
}

/**
 * The verification branch. The candidate angle is printed to one decimal place and
 * the third angle is computed from that printed value, so the arithmetic a learner
 * can do is the arithmetic the key was made from.
 *
 * @param rng - The injected random source.
 * @param wide - Whether the difficulty is hard.
 * @returns The generated question.
 */
function verifyQuestion(rng: () => number, wide: boolean): QuestionDto{
    let candidate=drawAmbiguous(rng()<0.5?2:1, wide, rng);
    let acute=Number(fmt(candidate.acute, ANGLE_PLACES));
    let third=180-candidate.A-acute;
    for(let attempt=0; third<=1&&attempt<32; attempt++){
        candidate=drawAmbiguous(rng()<0.5?2:1, wide, rng);
        acute=Number(fmt(candidate.acute, ANGLE_PLACES));
        third=180-candidate.A-acute;
    }
    let printed=fmt(candidate.acute, ANGLE_PLACES);
    let key=fmt(third, ANGLE_PLACES);
    let other=Math.abs(180-candidate.A-Number(fmt(candidate.obtuse, ANGLE_PLACES)));
    let rungs=[
        "Take the candidate angle the sine rule produced, round it as the question says, and finish the triangle with the angle sum: what is left after the given angle and that candidate is the third angle.",
        "The angles of a triangle sum to 180 degrees, so subtract the given angle and the printed candidate from 180, using the printed value rather than an unrounded one."
    ];
    let steps=[
        `$ \\sin B = \\dfrac{b \\sin A}{a} = \\dfrac{${candidate.b} \\sin(${candidate.A}°)}{${candidate.a}} = ${fmt(candidate.sine, 4)} $, so $ B = \\arcsin(${fmt(candidate.sine, 4)}) \\approx ${fmt(candidate.acute, 4)}° $, which is ${printed}° to one decimal place.`,
        `$ C = 180 - ${candidate.A} - ${acute} = ${key} $ degrees.`,
        `The supplementary candidate would leave ${fmt(other, 1)} degrees for the third angle once the sign is dropped, which is what tells you it was the wrong branch, so the answer is ${key}.`
    ];
    return {
        latex:`In triangle \\( ABC \\), \\( a = ${candidate.a} \\), \\( b = ${candidate.b} \\) and \\( A = ${candidate.A}^{\\circ} \\). The sine rule gives the acute candidate \\( B \\approx ${printed}^{\\circ} \\), to one decimal place. Find the third angle \\( C \\), rounded to the nearest tenth of a degree.`,
        correct: key,
        alternate: key+" degrees",
        display:`C = 180 - ${candidate.A} - ${printed}`,
        choices: numberOptions(third, [180-acute, candidate.A+acute, 2*acute, other], ANGLE_PLACES),
        expectedFormat:"Round your answer to one decimal place",
        subskill:"verify_a_solution",
        hints: {rungs, concede: "The answer is "+key+" degrees."},
        solution: steps
    };
}