/**
 * @file The one assembly rule for the option set a multiple-choice generator returns.
 * @description A generator's `choices` array is a claim: these are the four
 * options the learner is offered, and exactly one of them is right. Every subject
 * that had a question ship three options, a repeated option, or a distractor that
 * was the answer under another spelling built its own assembler for that claim, and
 * six of them existed before this module did. They agreed on the shape and not on
 * the details, which is why the same defect was fixed six times in six conventions.
 * This module states the claim once: a generator supplies the answer and the wrong
 * answers its branch can honestly name, and this decides which of them are real,
 * distinct options.
 *
 * Options are compared by value, because "the same number written two ways" is one
 * option to a learner and two to a string comparison. A plain number, a decimal and a
 * fraction of one quantity collapse to a single identity, so `0.5`, `0.50` and `1/2`
 * are one option and a fraction is never offered beside its own equivalent. A unit, a
 * leading `x =` and a factor of pi are stripped, so the options one question produces
 * all compare on the number they denote. Anything else is compared as lower-cased
 * trimmed text, so a matrix, an inequality and a sentence keep the spelling the
 * question gave them while two spellings of the same words are recognized as the one
 * option they are.
 *
 * A set still short of four is topped up deterministically by walking whole steps away
 * from a numeric answer, which is an arithmetic slip rather than a filler option, and
 * the walk is bounded because an unbounded loop hangs the oracle suite instead of
 * failing it. An answer that is not a number is never topped up, because there is no
 * honest way to invent an alternative to a sentence. That is deliberate: a set short of
 * four is a branch that named too few honest alternatives, and returning short is what
 * lets the gate fail it.
 */
import{fmt, roundTo}from"./Numeric";

/** The number of options a multiple-choice question offers. */
const OPTION_COUNT=4;

/** How many whole steps the deterministic top-up may walk away from an answer. */
const FALLBACK_STEPS=40;

/**
 * Reports whether an option is a value no learner could be shown: a non-finite
 * number, a placeholder, or an exponential spelling that contradicts the format
 * the question declared.
 *
 * "undefined" is deliberately not on this list. It is the correct answer wherever a
 * trigonometric ratio is undefined, and it is a distractor `src/main/Mcq.ts` builds
 * for a sign question, so rejecting it here would contradict the builder. "Infinity"
 * is a different thing: it is not a value a learner can write, and it is exactly what
 * a period branch produces by dividing by a frequency of zero.
 *
 * @param option - The candidate option.
 * @returns True when the option is unusable.
 */
function isUnusable(option: string): boolean{
    if (typeof option!=="string"||option.trim()==="") return true;
    if (option==="NaN"||option==="Infinity"||option==="-Infinity"||option==="null") return true;
    if (option==="-0.00"||option==="NaN rad"||option==="Infinity rad") return true;
    if (option.indexOf("NaN")>=0||option.indexOf("Infinity")>=0) return true;
    // toExponential writes "1.0e+2", which contradicts a declared format of
    // "like 1.2e3" and is not a spelling a learner would write. Only a leading
    // sign is rejected, so the same value written "2e5" stays usable.
    return /^-?\d*\.?\d+[eE]\+\d+$/.test(option.trim());
}

/**
 * Builds the identity a numeric option is compared by. The value is rounded to six
 * decimal places because that is the finest precision any option is printed at, so
 * two values that would render identically are one option rather than a question with
 * a distractor that is the answer again.
 *
 * @param value - The numeric value.
 * @returns The value key.
 */
function numericKey(value: number): string{
    if (!Number.isFinite(value)) return "t:"+String(value);
    return "n:"+String(roundTo(value, 6));
}

/**
 * Reduces an option to the one thing that decides whether two options are the same:
 * its value. A unit, a leading `x =` and a factor of pi are stripped, and a plain
 * number, a decimal, a fraction and a multiple of pi all become their numeric value,
 * so the spellings one question produces for one quantity collapse. Everything else
 * becomes its lower-cased trimmed text, which keeps an interval, an inequality, a
 * matrix and a sentence in the spelling the question gave it. The prefix keeps a
 * numeric key from colliding with a textual one.
 *
 * @param option - The option to reduce.
 * @returns A value key.
 */
function valueKey(option: string): string{
    let text=option.trim().replace(/^x\s*=\s*/,"").replace(/\s*rad$/,"").trim();
    let multipleOfPi=text.match(/^(-?)(\d*)\s*π(?:\s*\/\s*(\d+))?$/);
    if (multipleOfPi){
        let sign=multipleOfPi[1]==="-"?-1:1;
        let coefficient=multipleOfPi[2]===""?1:Number(multipleOfPi[2]);
        let denominator=multipleOfPi[3]?Number(multipleOfPi[3]):1;
        return numericKey(sign*coefficient*Math.PI/denominator);
    }
    let fraction=text.match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
    if (fraction){
        let denominator=Number(fraction[2]);
        if (denominator!==0) return numericKey(Number(fraction[1])/denominator);
    }
    if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(text)) return "t:"+text.toLowerCase();
    return numericKey(Number(text));
}

/**
 * Builds a generator's own option set: the correct answer exactly as the DTO prints
 * it, followed by up to three wrong options, all distinct from the key and from one
 * another by value.
 *
 * A candidate is dropped when it is unusable, when it denotes the same value as the
 * key, or when an option already accepted denotes that value. The key is always the
 * first option, so a set that survives this filter is a question with exactly one
 * answer, which is the invariant the oracle checks.
 *
 * A set still short of four is topped up by walking a whole step away from a numeric
 * answer, which is deterministic and bounded, so a draw whose candidate mistakes all
 * collide can neither produce a three-option question nor spin here. Callers therefore
 * pass every plausible wrong answer they can name and let the mistakes they did not
 * think of fall away. An answer that is not a number is returned short, because a
 * filler option teaches a learner to pick the one option that looks like an answer
 * instead of reading the question.
 *
 * @param correct - The correct answer, exactly as it is printed in the DTO.
 * @param candidates - Candidate wrong options, most plausible first.
 * @returns Exactly four options with the key first, or fewer only when the answer
 *          admits no distinct alternative at all.
 */
export function fourOptions(correct: string, candidates: string[]): string[]{
    let options: string[]=[correct];
    let seen=new Set<string>([valueKey(correct)]);
    for(let candidate of candidates){
        if (options.length>=OPTION_COUNT) break;
        if (isUnusable(candidate)) continue;
        let key=valueKey(candidate);
        if (seen.has(key)) continue;
        seen.add(key);
        options.push(candidate);
    }
    if (options.length>=OPTION_COUNT) return options;
    let text=correct.trim();
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(text)) return options;
    let value=Number(text);
    if (!Number.isFinite(value)) return options;
    let decimals=(text.match(/\.(\d+)$/)||[,""])[1].length;
    for(let step=1; options.length<OPTION_COUNT&&step<=FALLBACK_STEPS; step++){
        for(let sign of [1, -1]){
            if (options.length>=OPTION_COUNT) break;
            let option=Number((value+sign*step).toFixed(decimals)).toFixed(decimals);
            let key=valueKey(option);
            if (seen.has(key)) continue;
            seen.add(key);
            options.push(option);
        }
    }
    return options;
}

/**
 * Builds a generator's option set for a numeric answer. The answer and every
 * candidate are rendered through the one rounding decision, so no option can be a
 * second spelling of another and a value that rounds onto the answer cannot be offered
 * as though it were wrong. The set is then assembled by the one rule, which means a
 * numeric branch gets the same unusable filter, the same value comparison and the
 * same bounded top-up as every other branch.
 *
 * @param correct - The correct answer.
 * @param candidates - Wrong values, most plausible first.
 * @param decimals - Decimal places the answer and its options are rendered at. Defaults to 0.
 * @returns The answer followed by up to three wrong options.
 */
export function numberOptions(correct: number, candidates: number[], decimals: number=0): string[]{
    return fourOptions(fmt(correct, decimals), candidates.map(value=>fmt(value, decimals)));
}