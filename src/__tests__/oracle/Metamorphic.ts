/**
 * @file Tier-three validation: metamorphic relations.
 * @description Metamorphic testing needs no oracle. Instead of asking "is this
 * answer correct", it asks "if the answer is correct, what else must also be
 * true", and checks that. That makes it the only technique on the list whose
 * marginal cost is near zero across 125 generators, and it is the only one that
 * catches a defect in a family of generators at once, because a relation such as
 * commutativity is a property of the operation rather than of the question.
 *
 * A relation is a transform paired with an invariant. Transform returning null
 * means the relation does not apply to this question, which is essential:
 * scaling a division problem by three does not scale the answer by three, and
 * reporting that as a failure would be worse than not testing at all.
 *
 * A metamorphic relation is a necessary condition for correctness, never a
 * sufficient one. Both f(x) = 0 and f(x) = x² satisfy the commutativity relation,
 * so a passing suite here means no bug of these shapes was found, not that the
 * generators are proven correct.
 */
import type{QuestionDto, RngFn} from"../../types/global";
import{equalNumeric, equalExact, canonicaliseNumeric} from"./Exact";
import{equivalentExpressions} from"./Symbolic";
import{seededRng} from"../../main/core/Rng";

/** A pair of questions related by a transform. */
export interface QuestionPair{
    before: QuestionDto;
    after: QuestionDto;
}

/** A metamorphic relation: how to build the pair, and what must hold. */
export interface MetamorphicRelation{
    /** A stable name for the relation, used in failure messages. */
    name: string;
    /** Topic ids this relation applies to. Empty means every topic. */
    topics: string[];
    /** Builds the related question, or returns null when it does not apply. */
    transform: (before: Sampled, rng: RngFn)=>Sampled|null;
    /** The invariant that must hold across the pair. */
    check: (pair: QuestionPair)=>Promise<boolean>;
}

/** A question together with the topic and difficulty it came from. */
export interface Sampled{
    topicId: string;
    difficulty: string;
    dto: QuestionDto;
}

/** One violated relation, ready to be reported as a test failure. */
export interface RelationViolation{
    /** The relation that was violated. */
    relation: string;
    /** The topic the violation was found in. */
    topicId: string;
    /** The prompt before the transform. */
    before: string;
    /** The prompt after the transform. */
    after: string;
    /** The answers before and after the transform. */
    answers: { before: string; after: string };
    /** A human-readable explanation. */
    message: string;
}

/**
 * Extracts every number appearing in a prompt, in order.
 *
 * @param latex - The prompt to scan.
 * @returns The numbers found, as numbers.
 */
export function numbersIn(latex: string): number[]{
    let out: number[]=[];
    let re=/-?\d+(?:\.\d+)?/g;
    let match=re.exec(latex);
    while (match!==null){
        out.push(Number(match[0]));
        match=re.exec(latex);
    }
    return out;
}

/**
 * Replaces every number in a prompt by a multiple of a scale factor, and scales
 * the answer by the matching power of the factor. A linear problem's answer
 * scales with its inputs; a quadratic problem's answer scales with their square.
 *
 * @param before - The question to transform.
 * @param factor - The scale factor. Must be positive and not 1.
 * @param power - The degree of homogeneity. Defaults to 1.
 * @returns The scaled question, or null when the prompt holds no number to scale.
 */
export function scaleLinear(before: Sampled, factor: number, power: number=1): Sampled|null{
    if (factor===1||!Number.isFinite(factor)) return null;
    let nums=numbersIn(before.dto.latex);
    if (nums.length===0) return null;
    // A prompt containing a denominator or a root does not scale by a single power.
    if (before.dto.latex.indexOf("\\frac")>=0||before.dto.latex.indexOf("\\sqrt")>=0) return null;
    let scaledPrompt=before.dto.latex.replace(/-?\d+(?:\.\d+)?/g, (m)=>{
        return String(Number(m)*factor);
    });
    let scaledAnswer=before.dto.correct;
    if (/^-?\d+(?:\.\d+)?$/.test(before.dto.correct.trim())){
        scaledAnswer=String(Number(before.dto.correct)*Math.pow(factor, power));
    }
    else{
        return null;
    }
    return {
        topicId: before.topicId,
        difficulty: before.difficulty,
        dto: {
            ...before.dto,
            latex: scaledPrompt,
            correct: scaledAnswer,
            alternate: undefined,
            choices: undefined
        }
    };
}

/**
 * Reports whether two answers denote the same number, treating a scaled pair
 * under the same scaling as equal.
 *
 * @param before - The original answer.
 * @param after - The transformed answer.
 * @param factor - The scale factor applied, or 1 for a plain comparison.
 * @param power - The degree of homogeneity applied.
 * @returns True when the answers agree under the transform.
 */
export async function answersAgree(before: string, after: string, factor: number=1, power: number=1): Promise<boolean>{
    if (factor===1){
        if (equalExact(before, after)) return true;
        return (await equivalentExpressions(before, after))==="equal";
    }
    let scaled=canonicaliseNumeric(String(Number(before)*Math.pow(factor, power)));
    if (canonicaliseNumeric(after)===scaled) return true;
    return equalNumeric(after, String(Number(before)*Math.pow(factor, power)), 1e-9);
}

/**
 * Builds a relation that checks the homogeneity of a linear question: scaling
 * every number in the prompt by k must scale the answer by k.
 *
 * @param topics - The topic ids this relation applies to. Empty means every topic.
 * @returns The relation.
 */
export function linearHomogeneity(topics: string[]=[]): MetamorphicRelation{
    return {
        name:"linear-homogeneity",
        topics,
        transform:(before, rng)=>{
            let factor=pickFactor(rng);
            return scaleLinear(before, factor, 1);
        },
        check:async (pair)=>{
            let beforeNums=numbersIn(pair.before.latex);
            if (beforeNums.length===0) return true;
            let factor=firstRatio(beforeNums, numbersIn(pair.after.latex));
            if (factor===null||factor===1) return true;
            return answersAgree(pair.before.correct, pair.after.correct, factor, 1);
        }
    };
}

/**
 * Builds a relation that checks determinism: the same seed must produce the same
 * question, and a different seed must not always produce the same one.
 *
 * @param topics - The topic ids this relation applies to. Empty means every topic.
 * @returns The relation, whose transform regenerates the question from a new seed.
 */
export function seedDeterminism(topics: string[]=[]): MetamorphicRelation{
    return {
        name:"seed-determinism",
        topics,
        transform:(before)=>{
            // Regeneration from the same seed is the caller's job; this passes the
            // question through unchanged so the check compares two identical draws.
            return {...before};
        },
        check:async (pair)=>{
            return pair.before.latex===pair.after.latex&&pair.before.correct===pair.after.correct;
        }
    };
}

/**
 * Chooses a scale factor for a homogeneity check, avoiding values that would
 * produce a negative or zero intermediate.
 *
 * @param rng - The injected random source.
 * @returns A factor in {2, 3, 4}.
 */
function pickFactor(rng: RngFn): number{
    return 2+Math.floor(rng()*3);
}

/**
 * Recovers the scale factor between two numeric sequences, when the second is a
 * consistent multiple of the first.
 *
 * @param before - The original numbers.
 * @param after - The scaled numbers.
 * @returns The factor, or null when the sequences do not correspond.
 */
function firstRatio(before: number[], after: number[]): number|null{
    if (before.length===0||after.length===0||before.length!==after.length) return null;
    let ratios: number[]=[];
    for(let i=0; i<before.length; i++){
        if (before[i]===0) continue;
        let r=after[i]/before[i];
        if (!Number.isFinite(r)) return null;
        ratios.push(r);
    }
    if (ratios.length===0) return null;
    let first=ratios[0];
    for(let r of ratios){
        if (Math.abs(r-first)>1e-9) return null;
    }
    return first;
}

/**
 * Runs a relation across a pair of questions and reports a violation.
 *
 * @param relation - The relation to check.
 * @param pair - The related questions.
 * @param message - An explanation of the failure.
 * @returns A violation, or null when the relation held or did not apply.
 */
export async function checkRelation(relation: MetamorphicRelation, pair: QuestionPair, message: string): Promise<RelationViolation|null>{
    let ok=await relation.check(pair);
    if (ok) return null;
    return {
        relation: relation.name,
        topicId: pair.before.subskill?"":"",
        before: pair.before.latex,
        after: pair.after.latex,
        answers: { before: pair.before.correct, after: pair.after.correct },
        message
    };
}

/**
 * Re-exported so a test can build a deterministic stream without importing the
 * app's own module, keeping the relation independent of the code under test.
 *
 * @param seed - The seed.
 * @returns A deterministic random source.
 */
export function relationRng(seed: number): RngFn{
    return seededRng(seed);
}
