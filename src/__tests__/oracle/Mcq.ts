/**
 * @file The multiple-choice validator.
 * @description A multiple-choice question is only useful if exactly one option is
 * correct. The defects this module exists to prevent are all cases where that is
 * not true: fewer than four options, two options that are the same number spelled
 * differently, a key that is not offered at all, a distractor that is also a correct
 * answer, and a distractor that is `NaN` or `Infinity`.
 *
 * A generator that cannot produce four provably-distinct, provably-wrong
 * alternatives is a build failure. There is no fallback filler, because filler
 * options teach the learner to look for the only option that looks like an answer
 * rather than to read the question.
 */
import type{QuestionDto} from"../../types/global";
import{canonicaliseNumeric, equalNumeric, isPlainNumber, parseExact} from"./Exact";
import{equivalentExpressions} from"./Symbolic";

/** One reason a multiple-choice question is invalid. */
export interface McqFinding{
    /** A stable code for the defect class. */
    code: string;
    /** A human-readable explanation naming the offending option. */
    message: string;
}

/** The codes this validator can report. */
export const MCQ_CODES={
    missing:"choices-absent",
    tooFew:"choices-fewer-than-four",
    correctNotFirst:"correct-not-first",
    correctAbsent:"correct-absent",
    duplicate:"choices-duplicate",
    nonFinite:"choices-not-finite",
    alsoCorrect:"distractor-also-correct"
} as const;

/**
 * Reports whether an option string is a value that must never be shown: a
 * non-finite number, a placeholder, or an exponential spelling that contradicts
 * the declared expected format.
 *
 * @param option - The option string.
 * @returns True when the option is unusable.
 */
function isUnusableOption(option: string): boolean{
    if (typeof option!=="string"||option.trim()==="") return true;
    if (option==="NaN"||option==="Infinity"||option==="-Infinity") return true;
    // "undefined" is deliberately not on this list. It is the correct answer
    // wherever a trigonometric ratio is undefined, and it is a distractor
    // `src/main/Mcq.ts` builds for a sign or parity question, so rejecting it
    // here contradicted the builder and failed a correct generator. "Infinity"
    // is a different thing: it is not a value a learner can write, and not an
    // answer to a question about numbers, so it stays rejected.
    if (option==="null") return true;
    if (option==="-0.00"||option==="NaN rad"||option==="Infinity rad") return true;
    // toExponential emits "1.0e+2", which contradicts a declared format of
    // "like 1.2e3" and is not a spelling any learner would write. A leading sign
    // is the only place it appears, so matching it does not reject "2e5".
    if (/^-?\d*\.?\d+[eE]\+\d+$/.test(option.trim())) return true;
    return false;
}

/**
 * Reports whether two options denote the same value, comparing plain numbers
 * exactly and everything else by trimmed text. `0.50` and `0.5` are the same
 * option, which is how a four-option question silently becomes a three-option
 * one.
 *
 * @param a - The first option.
 * @param b - The second option.
 * @returns True when the two options are the same value.
 */
function sameOption(a: string, b: string): boolean{
    if (a.trim()===b.trim()) return true;
    let ca=canonicaliseNumeric(a);
    let cb=canonicaliseNumeric(b);
    if (ca===cb) return true;
    if (isPlainNumber(a)&&isPlainNumber(b)&&equalNumeric(a, b, 0)) return true;
    return false;
}

/**
 * Shortens a value for a failure message, so a LaTeX option does not swamp the
 * report and hide the topic that produced it.
 *
 * @param value - The value to shorten.
 * @param limit - The longest representation to keep. Defaults to 48 characters.
 * @returns A quoted, possibly truncated string.
 */
function truncate(value: string, limit: number=48): string{
    let text=JSON.stringify(value);
    if (text.length<=limit+2) return text;
    return JSON.stringify(value.slice(0, limit))+"...";
}

/**
 * Reports whether an option is a mathematical expression rather than prose.
 * The symbolic tier compares expressions, so applying it to a written
 * description compares two sentences after the algebra has been stripped out of
 * them, which reports every pair of descriptions as equal.
 *
 * @param option - The option string.
 * @returns True when the option contains something algebraic to compare.
 */
function looksMathematical(option: string): boolean{
    return /[0-9]|[+\-*/^_=<>(){}]|\\frac|\\sqrt|\\pi/.test(option);
}

/**
 * Validates a multiple-choice question and returns every defect found.
 *
 * The check is intentionally conservative about declaring a distractor also
 * correct: a symbolic comparison that cannot decide is reported as
 * inconclusive and ignored, because a false accusation would force a correct
 * generator to be weakened.
 *
 * @param dto - The generated question.
 * @returns Every finding. An empty array means the question is valid.
 */
export async function validateMcq(dto: QuestionDto): Promise<McqFinding[]>{
    let findings: McqFinding[]=[];
    if (!dto||!Array.isArray(dto.choices)){
        return [{code:MCQ_CODES.missing, message:"The question offers no options."}];
    }
    let choices=dto.choices;
    if (choices.length<4){
        findings.push({
            code:MCQ_CODES.tooFew,
            message:"The question offers "+choices.length+" option(s); exactly four are required."
        });
    }
    for(let i=0; i<choices.length; i++){
        if (isUnusableOption(choices[i])){
            findings.push({
                code:MCQ_CODES.nonFinite,
                message:"Option "+i+" is not a usable value: "+truncate(choices[i])+"."
            });
        }
    }
    for(let i=0; i<choices.length; i++){
        for(let j=i+1; j<choices.length; j++){
            if (sameOption(choices[i], choices[j])){
                findings.push({
                    code:MCQ_CODES.duplicate,
                    message:"Options "+i+" and "+j+" are the same value: "+JSON.stringify(choices[i])+" and "+JSON.stringify(choices[j])+"."
                });
            }
        }
    }
    if (choices.length>0&&!sameOption(choices[0], dto.correct)){
        findings.push({
            code:MCQ_CODES.correctNotFirst,
            message:"Option 0 is "+JSON.stringify(choices[0])+" but the correct answer is "+JSON.stringify(dto.correct)+"."
        });
    }
    // Exactly one option has to be the key. Two of them is already reported as a
    // duplicate, because two options equal to the key are two options equal to each
    // other, so only the absent case is left to name here.
    let correctCount=0;
    for(let option of choices){
        if (sameOption(option, dto.correct)) correctCount++;
    }
    if (correctCount===0){
        findings.push({
            code:MCQ_CODES.correctAbsent,
            message:"None of the options is the correct answer "+JSON.stringify(dto.correct)+"."
        });
    }
    for(let i=1; i<choices.length; i++){
        if (sameOption(choices[i], dto.correct)) continue;
        if (!looksMathematical(choices[i])||!looksMathematical(dto.correct)) continue;
        let verdict=await equivalentExpressions(choices[i], dto.correct);
        if (verdict==="equal"){
            findings.push({
                code:MCQ_CODES.alsoCorrect,
                message:"Option "+i+" ("+JSON.stringify(choices[i])+") is also mathematically correct, so the question has more than one answer."
            });
        }
    }
    return findings;
}

/**
 * Reports whether a multiple-choice question is valid.
 *
 * @param dto - The generated question.
 * @returns True when the question offers exactly four options with one correct.
 */
export async function isValidMcq(dto: QuestionDto): Promise<boolean>{
    return (await validateMcq(dto)).length===0;
}

/**
 * Builds a set of provably-distinct distractors for a numeric answer, for
 * generators that do not hand-write their own. Each candidate is checked against
 * the answer and against the already-accepted set before being kept, so the
 * result is guaranteed to be the requested length whenever enough distinct values
 * exist near the answer.
 *
 * @param answer - The correct numeric answer.
 * @param count - How many distractors to build. Defaults to 3.
 * @param decimals - Decimal places to render. Defaults to 2.
 * @returns Exactly `count` distinct, wrong options, or fewer if the search space
 *          around the answer is exhausted.
 */
export function buildNumericDistractors(answer: number, count: number=3, decimals: number=2): string[]{
    if (!Number.isFinite(answer)) return [];
    let scale=Math.pow(10, decimals);
    let unit=Math.max(1/scale, Math.abs(answer)*0.1);
    let candidates=[
        answer+unit,
        answer-unit,
        answer*2,
        answer/2,
        -answer,
        answer+unit*2,
        answer-unit*2,
        answer*3,
        answer*1.5,
        Math.abs(answer)+unit*3
    ];
    let accepted:string[]=[];
    let seen=new Set<string>([canonicaliseNumeric(String(answer))]);
    for(let raw of candidates){
        if (accepted.length>=count) break;
        if (!Number.isFinite(raw)) continue;
        if (equalNumeric(String(raw), String(answer), 0)) continue;
        let text=raw.toFixed(decimals);
        if (isUnusableOption(text)) continue;
        let canonical=canonicaliseNumeric(text);
        if (seen.has(canonical)) continue;
        seen.add(canonical);
        accepted.push(text);
    }
    return accepted;
}

/**
 * Reports whether an exact rational can be formed from a numeric string, which
 * is a precondition for the exact tier to have anything to say.
 *
 * @param value - The numeric string.
 * @returns True when the string is a plain rational.
 */
export function isExactRational(value: string): boolean{
    return parseExact(value)!==null;
}
