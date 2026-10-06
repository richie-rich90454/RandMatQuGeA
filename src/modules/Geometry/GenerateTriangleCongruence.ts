/**
 * @file Triangle congruence: the five criteria that force two triangles to be
 * congruent, and the one condition that only forces similarity.
 * @description A congruence question is a question about which facts are on the
 * page, not about which facts happen to be true of the shapes. The five criteria
 * are printed as the option set and exactly one of them is supported by the data,
 * because each branch prints the data for one criterion and nothing else: three
 * pairs of sides for SSS, two sides and their included angle for SAS, two angles
 * and their included side for ASA, two angles and a side that is not between them
 * for AAS, and a hypotenuse with a leg in two right triangles for HL.
 *
 * The lengths and angles are drawn from data that is realizable rather than solved
 * for. Nothing here needs a side length from the law of sines: a triangle with two
 * given angles and any positive third quantity exists at exactly one scale, so the
 * printed side is free and the answer is the criterion rather than a trigonometry
 * result. That keeps every answer exact.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions}from"../shared/Options.js";
import{pickMany, randInt}from"../shared/Random";

/** The five conditions that guarantee two triangles are congruent. */
let CRITERIA=["SSS", "SAS", "ASA", "AAS", "HL"];

/**
 * The five criteria written out as standalone statements, which is the form the
 * failing condition has to be offered in: naming only "AAA" would leave the other
 * four options as bare letters with nothing to misread.
 */
let STATEMENTS: string[]=[
    "SSS: three pairs of equal sides",
    "SAS: two pairs of equal sides with the included angles equal",
    "ASA: two pairs of equal angles with the included side equal",
    "AAS: two pairs of equal angles with one pair of equal sides that is not the included one",
    "HL: equal hypotenuses and one pair of equal legs, in two right triangles"
];

/**
 * The condition that guarantees similarity and not congruence, which is the key of
 * the one branch whose answer is a failure.
 */
let SIMILARITY_ONLY="AAA: three pairs of equal angles, so the triangles are similar but need not be congruent";

/**
 * Draws three lengths that satisfy the strict triangle inequality, so that the
 * triangle the prompt describes exists. The retry is bounded and the fallback is a
 * known triangle, so a stream that keeps drawing the same triple cannot spin.
 *
 * @param rng - The injected random source.
 * @param spread - The largest side length allowed.
 * @returns The three sides, which do form a triangle.
 */
function triangleSides(rng: RngFn, spread: number): [number, number, number]{
    for(let attempt=0; attempt<64; attempt++){
        let a=randInt(rng, 2, spread);
        let b=randInt(rng, 2, spread);
        let c=randInt(rng, 2, spread);
        if (a+b>c&&a+c>b&&b+c>a) return [a, b, c];
    }
    return [3, 4, 5];
}

/**
 * Draws two interior angles in whole degrees whose sum leaves a positive third
 * angle, which is the only realizability condition the angle branches have.
 *
 * @param rng - The injected random source.
 * @param spread - The largest angle allowed.
 * @returns Two angles in degrees.
 */
function twoAngles(rng: RngFn, spread: number): [number, number]{
    for(let attempt=0; attempt<64; attempt++){
        let a=randInt(rng, 20, spread);
        let b=randInt(rng, 20, spread);
        if (a+b<175) return [a, b];
    }
    return [60, 70];
}

export function generateTriangleCongruence(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["sss", "sas", "asa", "aas", "hypotenuse_leg", "not_congruent"];
    let type=types[Math.floor(rng()*types.length)];
    let spread=difficulty==="easy"?9:difficulty==="hard"?20:14;
    let correct="";
    let latex="";
    let candidates:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "sss":{
            let first=triangleSides(rng, spread);
            let second=triangleSides(rng, spread);
            correct="SSS";
            candidates=CRITERIA.filter(c=>c!=="SSS");
            latex=`In \\( \\triangle ABC \\) the sides measure \\( AB = ${first[0]} \\), \\( BC = ${first[1]} \\) and \\( CA = ${first[2]} \\). In \\( \\triangle DEF \\) the sides measure \\( DE = ${second[0]} \\), \\( EF = ${second[1]} \\) and \\( FD = ${second[2]} \\). Which condition guarantees \\( \\triangle ABC \\cong \\triangle DEF \\)?`;
            rungs=[
                "Congruence has five criteria and each one names what has to match. Count what the prompt actually hands you: side lengths only, three pairs of them, and no angle anywhere.",
                `The prompt gives three pairs of equal sides: ${first[0]} against ${second[0]}, ${first[1]} against ${second[1]} and ${first[2]} against ${second[2]}, and no angle at all.`
            ];
            steps=[
                `Triangle ABC has sides ${first[0]}, ${first[1]} and ${first[2]}; triangle DEF has sides ${second[0]}, ${second[1]} and ${second[2]}.`,
                `Every pair of corresponding sides is equal, and the prompt states no angle, so no criterion that needs an angle can be checked.`,
                `Three pairs of equal sides is the condition SSS.`
            ];
            break;
        }
        case "sas":{
            let first=randInt(rng, 2, spread);
            let second=randInt(rng, 2, spread);
            let included=randInt(rng, 25, 150);
            correct="SAS";
            candidates=CRITERIA.filter(c=>c!=="SAS");
            latex=`In \\( \\triangle ABC \\), \\( AB = ${first} \\), \\( AC = ${second} \\) and the included angle \\( \\angle BAC \\) measures \\( ${included}^{\\circ} \\). In \\( \\triangle DEF \\), \\( DE = ${first} \\), \\( DF = ${second} \\) and the included angle \\( \\angle EDF \\) measures \\( ${included}^{\\circ} \\). Which condition guarantees \\( \\triangle ABC \\cong \\triangle DEF \\)?`;
            rungs=[
                "Two sides and one angle is enough, and only when the angle is the one between those two sides. Every other criterion here needs either three sides or two angles, and the prompt gives neither.",
                `The prompt gives two equal side pairs, ${first} against ${first} and ${second} against ${second}, and the angle between them, ${included} degrees against ${included} degrees.`
            ];
            steps=[
                `Triangle ABC has AB = ${first}, AC = ${second} and angle BAC = ${included} degrees; triangle DEF has DE = ${first}, DF = ${second} and angle EDF = ${included} degrees.`,
                `The angle is between the two sides that are given, which is what makes the criterion SAS rather than a two-sided angle that sits somewhere else.`,
                `Two pairs of equal sides with the included angles equal is the condition SAS.`
            ];
            break;
        }
        case "asa":{
            let angles=twoAngles(rng, difficulty==="easy"?100:140);
            let third=180-angles[0]-angles[1];
            let side=randInt(rng, 2, spread);
            correct="ASA";
            candidates=CRITERIA.filter(c=>c!=="ASA");
            latex=`In \\( \\triangle ABC \\), \\( \\angle A \\) measures \\( ${angles[0]}^{\\circ} \\), \\( \\angle B \\) measures \\( ${angles[1]}^{\\circ} \\) and the side between them is \\( AB = ${side} \\). In \\( \\triangle DEF \\), \\( \\angle D \\) measures \\( ${angles[0]}^{\\circ} \\), \\( \\angle E \\) measures \\( ${angles[1]}^{\\circ} \\) and the side between them is \\( DE = ${side} \\). Which condition guarantees \\( \\triangle ABC \\cong \\triangle DEF \\)?`;
            rungs=[
                "Two angles and one pair of equal sides is enough, and the two angle-based criteria are told apart by where that side sits. Here the side joins the two given angles, which settles which of them applies.",
                `The prompt gives two equal angle pairs, ${angles[0]} degrees against ${angles[0]} degrees and ${angles[1]} degrees against ${angles[1]} degrees, and the side that joins those two angles, ${side} against ${side}.`
            ];
            steps=[
                `Triangle ABC has angles ${angles[0]} degrees and ${angles[1]} degrees with AB = ${side} between them, so the third angle is ${third} degrees.`,
                `The side that joins the two given angles is the included side, which is what separates ASA from AAS.`,
                `Two pairs of equal angles with the included side equal is the condition ASA.`
            ];
            break;
        }
        case "aas":{
            let angles=twoAngles(rng, difficulty==="easy"?100:140);
            let third=180-angles[0]-angles[1];
            // BC sits opposite angle A, so it is not the side between the two given
            // angles. That is the whole difference between this branch and ASA.
            let opposite=randInt(rng, 2, spread);
            correct="AAS";
            candidates=CRITERIA.filter(c=>c!=="AAS");
            latex=`In \\( \\triangle ABC \\), \\( \\angle A \\) measures \\( ${angles[0]}^{\\circ} \\), \\( \\angle B \\) measures \\( ${angles[1]}^{\\circ} \\) and \\( BC = ${opposite} \\). In \\( \\triangle DEF \\), \\( \\angle D \\) measures \\( ${angles[0]}^{\\circ} \\), \\( \\angle E \\) measures \\( ${angles[1]}^{\\circ} \\) and \\( EF = ${opposite} \\). Which condition guarantees \\( \\triangle ABC \\cong \\triangle DEF \\)?`;
            rungs=[
                "Two angles and one pair of equal sides is enough, and the two angle-based criteria are told apart by where that side sits. Here the named side sits opposite one of the given angles, not between them.",
                `The prompt gives angles ${angles[0]} and ${angles[1]} degrees in both triangles and the side ${opposite}, which is opposite angle A in one and opposite angle D in the other rather than between the two given angles.`
            ];
            steps=[
                `Triangle ABC has angles ${angles[0]} degrees and ${angles[1]} degrees, so the third is ${third} degrees, and BC = ${opposite}.`,
                `BC is opposite angle A, so it is not the side included between the two stated angles; the same holds for EF opposite angle D.`,
                `Two pairs of equal angles with one non-included side equal is the condition AAS.`
            ];
            break;
        }
        case "hypotenuse_leg":{
            let hypotenuse=randInt(rng, spread, spread+8);
            let leg=randInt(rng, 3, Math.max(4, hypotenuse-2));
            correct="HL";
            candidates=CRITERIA.filter(c=>c!=="HL");
            latex=`\\( \\triangle ABC \\) and \\( \\triangle DEF \\) are both right triangles, with right angles at \\( C \\) and \\( F \\). Their hypotenuses are \\( AB = ${hypotenuse} \\) and \\( DE = ${hypotenuse} \\), and one pair of legs is equal: \\( AC = ${leg} \\) and \\( DF = ${leg} \\). Which condition guarantees \\( \\triangle ABC \\cong \\triangle DEF \\)?`;
            rungs=[
                "A right triangle is pinned down by its longest side together with one of the two sides that meet at the right angle, and that pair has a criterion of its own because no other criterion can be checked from two sides and no stated angle.",
                `The prompt gives the hypotenuses, ${hypotenuse} against ${hypotenuse}, and one pair of legs, ${leg} against ${leg}, in two right triangles.`
            ];
            steps=[
                `Both triangles are right-angled, at C and at F respectively, so AB and DE are their hypotenuses.`,
                `The hypotenuses are equal at ${hypotenuse} and one pair of legs is equal at ${leg}, with no second side and no angle stated.`,
                `Equal hypotenuses with one pair of equal legs in right triangles is the condition HL.`
            ];
            break;
        }
        case "not_congruent":{
            // Similar but not congruent: equal angles with sides in a ratio other
            // than one. Every valid criterion below is false of that data, which is
            // what leaves exactly one honest answer.
            let whole=randInt(rng, 1, difficulty==="easy"?2:4);
            let scale=whole+1;
            correct=SIMILARITY_ONLY;
            candidates=pickMany(rng, STATEMENTS, 3);
            latex=`Two triangles have three pairs of equal angles. The sides of the first are in the fixed ratio \\( ${whole} \\) to \\( ${scale} \\) with the sides of the second, so every side of the first is longer than the matching side of the second. Which statement about the two triangles is true?`;
            rungs=[
                "Congruence needs matching sizes as well as matching shapes. Three pairs of equal angles fixes the shape but leaves the scale free, so any criterion that needs a pair of equal sides fails.",
                "Every side of the first triangle is a fixed multiple of the matching side of the second, so no two corresponding sides are equal at all."
            ];
            steps=[
                `The angles match one for one, so the two triangles are similar.`,
                `The sides are in the ratio ${whole} to ${scale}, so no corresponding pair of sides is equal, which rules out every criterion that requires one.`,
                `Three pairs of equal angles alone is AAA, so the statement that is true is ${correct}.`
            ];
            break;
        }
    }
    let expectedFormat="Enter the criterion, for example SSS";
    return {latex, correct, alternate:correct, display:correct, choices:fourOptions(correct, candidates), expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+correct+"."}, solution: steps};
}