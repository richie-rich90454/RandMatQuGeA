/**
 * @file Builds the four options shown in multiple-choice mode.
 * @description Every option set this produces satisfies one invariant: exactly
 * four options, exactly one of which is correct. That is enforced here rather
 * than trusted, because the alternative is a question with two or three options,
 * or with a distractor that happens to be right, and a learner who is trained on
 * such questions learns to look for the only option that looks like an answer
 * rather than to read the question.
 *
 * A generator may supply its own options, because a curated set is pedagogically
 * better than a mechanical one: "converges" and "diverges" are meaningful
 * alternatives for a series, where a digit perturbation is not. But the set is
 * always validated and repaired here, so a generator that supplies three options
 * or a duplicate still yields a usable question.
 */
import{appState}from"./core/StateStore";
import{questionState}from"./core/QuestionState";
import{dom}from"./core/DomRegistry";
import * as settings from"./Settings";
import * as ui from"./Ui";
import type{RngFn}from"../types/global";
import{canonicalNumeric, isFiniteNumberText, sameNumericValue}from"./AnswerFormat";

/** The number of options a multiple-choice question always offers. */
const OPTION_COUNT=4;

/**
 * Reports whether an option is one a learner could never be expected to accept,
 * which includes a non-finite number and the string forms of a missing value.
 *
 * @param option - The candidate option.
 * @returns True when the option is unusable.
 */
function isUnusable(option: string): boolean{
    if (typeof option!=="string"||option.trim()==="") return true;
    if (option==="NaN"||option==="Infinity"||option==="-Infinity") return true;
    if (option==="undefined"||option==="null") return true;
    if (option==="-0.00") return true;
    if (option.indexOf("NaN")>=0||option.indexOf("Infinity")>=0) return true;
    return false;
}

/**
 * Reports whether two options are the same value, so that "0.50" and "0.5" are
 * recognised as one option rather than two.
 *
 * @param a - The first option.
 * @param b - The second option.
 * @returns True when the two denote the same value.
 */
function sameOption(a: string, b: string): boolean{
    if (a.trim()===b.trim()) return true;
    if (canonicalNumeric(a)===canonicalNumeric(b)) return true;
    if (isFiniteNumberText(a)&&isFiniteNumberText(b)&&sameNumericValue(a, b)) return true;
    return false;
}

/**
 * Removes options that are unusable, duplicated, or equal to the correct answer.
 *
 * @param options - The candidate options.
 * @param correct - The correct answer, which is preserved wherever it appears.
 * @returns The surviving options, with duplicates dropped and the first occurrence
 *          of the correct answer kept.
 */
function dedupe(options: string[], correct: string): string[]{
    let kept:string[]=[];
    let seen=new Set<string>();
    for(let option of options){
        if (isUnusable(option)) continue;
        if (sameOption(option, correct)) continue;
        let canonical=option.trim();
        if (seen.has(canonical)) continue;
        seen.add(canonical);
        kept.push(option);
    }
    return kept;
}

/**
 * Builds numeric distractors by perturbing the answer in ways that are always a
 * different number: a relative offset, a sign flip, a doubling, a halving and a
 * digit change. Each candidate is checked against the answer and against the
 * already-accepted set before being kept.
 *
 * @param answer - The correct numeric answer.
 * @param count - How many distractors to build.
 * @param decimals - Decimal places to render, taken from the answer's own precision.
 * @returns Up to `count` distinct wrong options.
 */
function numericDistractors(answer: number, count: number, decimals: number): string[]{
    let unit=Math.max(Math.pow(10, -decimals), Math.abs(answer)*0.1);
    let candidates=[
        answer+unit,
        answer-unit,
        answer*2,
        answer/2,
        -answer,
        answer+unit*2,
        answer-unit*2,
        answer*1.5,
        answer*3,
        Math.abs(answer)+unit*3
    ];
    let accepted:string[]=[];
    let seen=new Set<string>([canonicalNumeric(String(answer))]);
    for(let raw of candidates){
        if (accepted.length>=count) break;
        if (!Number.isFinite(raw)) continue;
        if (sameNumericValue(String(raw), String(answer))) continue;
        let text=Number(raw.toFixed(decimals)).toFixed(decimals);
        if (isUnusable(text)) continue;
        let canonical=canonicalNumeric(text);
        if (seen.has(canonical)) continue;
        seen.add(canonical);
        accepted.push(text);
    }
    return accepted;
}

/**
 * Builds distractors for an answer that is not a plain number, by looking for
 * structure in it: a coordinate pair, a centre-and-radius description, a
 * quadrant, or an interval. Perturbing the components of a structured answer is
 * always wrong in a way a learner can reason about, whereas appending a
 * character to it is not an answer at all.
 *
 * @param answer - The correct answer.
 * @param count - How many distractors to build.
 * @returns Up to `count` wrong options.
 */
function structuredDistractors(answer: string, count: number): string[]{
    let centre=answer.match(/center\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*,\s*radius\s*(-?\d+(?:\.\d+)?)/i);
    if (centre){
        let h=Number(centre[1]);
        let k=Number(centre[2]);
        let r=Number(centre[3]);
        return [
            `center (${h+1}, ${k}), radius ${r}`,
            `center (${h-1}, ${k}), radius ${r}`,
            `center (${h}, ${k+1}), radius ${r}`,
            `center (${h}, ${k-1}), radius ${r}`,
            `center (${h}, ${k}), radius ${r+1}`,
            `center (${h}, ${k}), radius ${r-1}`,
            `center (${h+1}, ${k+1}), radius ${r}`,
            `center (${h-1}, ${k-1}), radius ${r}`
        ].slice(0, count);
    }
    let pair=answer.match(/^\(?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)?$/);
    if (pair){
        let x=Number(pair[1]);
        let y=Number(pair[2]);
        let wrap=answer.trim().startsWith("(");
        let fmt=(a: number, b: number)=>wrap?`(${a}, ${b})`:`${a}, ${b}`;
        return [
            fmt(x+1, y),
            fmt(x-1, y),
            fmt(x, y+1),
            fmt(x, y-1),
            fmt(x+1, y+1),
            fmt(x-1, y-1),
            fmt(x+0.5, y),
            fmt(x, y+0.5)
        ].slice(0, count);
    }
    if (/^(I|II|III|IV)$/i.test(answer.trim())){
        return ["I", "II", "III", "IV"].filter(q=>q.toLowerCase()!==answer.trim().toLowerCase()).slice(0, count);
    }
    if (/^(positive|negative)$/i.test(answer.trim())){
        return answer.trim().toLowerCase()==="positive"?["negative", "zero", "undefined", "not defined"]:["positive", "zero", "undefined", "not defined"];
    }
    if (/^(converges|diverges|convergent|divergent)$/i.test(answer.trim())){
        let word=/^diverg/i.test(answer.trim());
        return word?["converges", "converges absolutely", "converges conditionally", "converges by the root test"]:["diverges", "converges absolutely", "converges conditionally", "diverges to -infinity"];
    }
    if (/^(even|odd|neither)$/i.test(answer.trim())){
        let word=answer.trim().toLowerCase();
        return word==="even"?["odd", "neither", "even and odd", "undefined"]:word==="odd"?["even", "neither", "even and odd", "undefined"]:["even", "odd", "even and odd", "undefined"];
    }
    if (/^(increasing|decreasing)$/i.test(answer.trim())){
        let word=answer.trim().toLowerCase();
        return word==="increasing"?["decreasing", "constant", "not defined", "discontinuous"]:["increasing", "constant", "not defined", "discontinuous"];
    }
    return [];
}

/**
 * Builds distractors for a word or symbol answer that has no recognisable
 * structure, by perturbing the tokens of the answer itself. A token swap changes
 * the meaning while staying in the answer's own vocabulary, which is a far more
 * useful distractor than appending punctuation.
 *
 * @param answer - The correct answer.
 * @param count - How many distractors to build.
 * @returns Up to `count` wrong options, which may be fewer than requested.
 */
function tokenDistractors(answer: string, count: number): string[]{
    let out:string[]=[];
    let seen=new Set<string>([answer.trim()]);
    let tokens=answer.trim().split(/\s+/);
    for(let i=0; i<tokens.length&&out.length<count; i++){
        for(let j=0; j<tokens.length&&out.length<count; j++){
            if (i===j) continue;
            let swapped=tokens.slice();
            let held=swapped[i];
            swapped[i]=swapped[j];
            swapped[j]=held;
            let candidate=swapped.join(" ");
            if (candidate.trim()===""||seen.has(candidate)) continue;
            seen.add(candidate);
            out.push(candidate);
        }
    }
    if (out.length<count){
        let prefix=["not ","non-","anti-"];
        for(let p of prefix){
            if (out.length>=count) break;
            let candidate=p+answer.trim();
            if (seen.has(candidate)) continue;
            seen.add(candidate);
            out.push(candidate);
        }
    }
    return out.slice(0, count);
}

/**
 * Builds a validated option set for a correct answer.
 *
 * @param correct - The correct answer.
 * @param supplied - Options the generator offered, if any. They are preferred
 *                   where they are valid, and repaired where they are not.
 * @param rng - The injected random source, used only to place the correct answer.
 * @returns Exactly four options with exactly one correct, or the fewest that can
 *          be built when the answer admits no distinct alternatives.
 */
/**
 * Builds a validated option set for a correct answer, which is what
 * `generateChoicesForCurrentQuestion` uses and what a test can exercise directly.
 *
 * @param correct - The correct answer.
 * @param supplied - Options the generator offered, if any. They are preferred
 *                   where they are valid, and repaired where they are not.
 * @param count - How many options to produce. Defaults to 4.
 * @param rng - The injected random source, used only to place the correct answer.
 * @returns Exactly `count` options with exactly one correct, or the fewest that
 *          can be built when the answer admits no distinct alternatives.
 */
export function buildChoiceSet(correct: string, supplied: string[]|undefined, rng: RngFn, count: number=OPTION_COUNT): string[]{
    let fromGenerator=dedupe(supplied??[], correct);
    let numericValue=Number(correct);
    let decimals=2;
    let decimalMatch=correct.match(/\.(\d+)$/);
    if (decimalMatch) decimals=Math.min(6, decimalMatch[1].length);
    let distractors:string[]=[];
    if (Number.isFinite(numericValue)&&isFiniteNumberText(correct)){
        distractors=numericDistractors(numericValue, count-1, decimals);
    }
    if (distractors.length<count-1){
        for(let candidate of structuredDistractors(correct, count*2)){
            if (distractors.length>=count-1) break;
            if (isUnusable(candidate)) continue;
            if (sameOption(candidate, correct)) continue;
            if (distractors.some(d=>sameOption(d, candidate))) continue;
            distractors.push(candidate);
        }
    }
    if (distractors.length<count-1){
        for(let candidate of tokenDistractors(correct, count*2)){
            if (distractors.length>=count-1) break;
            if (isUnusable(candidate)) continue;
            if (sameOption(candidate, correct)) continue;
            if (distractors.some(d=>sameOption(d, candidate))) continue;
            distractors.push(candidate);
        }
    }
    // Generator options that survived validation are better alternatives than a
    // mechanical perturbation, so prefer them once the answer is present.
    for(let candidate of fromGenerator){
        if (distractors.length>=count-1) break;
        if (isUnusable(candidate)) continue;
        if (sameOption(candidate, correct)) continue;
        if (distractors.some(d=>sameOption(d, candidate))) continue;
        distractors.unshift(candidate);
    }
    let options=distractors.slice(0, count-1);
    let position=Math.floor(rng()*(options.length+1));
    options.splice(position, 0, correct);
    return options;
}
/**
 * Builds distractor options for a correct answer without the correct answer among
 * them, for callers that supply the answer separately.
 *
 * @param correctAnswer - The correct answer.
 * @param count - How many options in total, including the correct one.
 * @param rng - The injected random source.
 * @returns A validated option set including the correct answer.
 */
export function generateDistractors(correctAnswer: string, count: number, rng?: RngFn): string[]{
    return buildChoiceSet(correctAnswer, undefined, rng??Math.random, count);
}
export async function generateChoicesForCurrentQuestion(rng?: RngFn): Promise<void>{
    if (!appState.mcqMode) return;
    let r: RngFn = rng ?? Math.random;
    let correctObj=questionState.correctAnswer;
    if (!correctObj || !correctObj.correct){
        if (dom.displays.mcqChoicesContainer){
            dom.displays.mcqChoicesContainer.innerHTML='<div class="empty-state"><p>No correct answer available — try another topic.</p></div>';
        }
        return;
    }
    let count=settings.settings.mcqChoicesCount;
    let choices=buildChoiceSet(correctObj.correct, correctObj.choices, r);
    if (choices.length>count){
        let withoutCorrect=choices.filter(c=>!sameOption(c, correctObj.correct));
        let kept=withoutCorrect.slice(0, count-1);
        kept.push(correctObj.correct);
        choices=kept;
    }
    appState.mcqChoices=choices;
    ui.renderMcqChoices(choices);
}
