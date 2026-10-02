/**
 * @file Hint ladders and worked-solution scaffolding.
 * @description A hint ladder is not a paragraph of encouragement. It is a sequence
 * of steps, each of which removes exactly one source of being stuck, and it stops
 * before it gives the answer: the last rung says what to do next, not what the
 * result is.
 *
 * The rungs are derived from what a question already knows about itself rather
 * than written per generator, because the two things a learner is stuck on are
 * always the same. The first is not knowing what shape of answer is wanted, which
 * the declared answer format already states. The second is not knowing which
 * quantity to compute first, which is answered by naming the shape of the key and
 * the kind of quantity it is. The third is a method that was applied wrongly, and
 * the question's own declared misconception says which.
 *
 * A generator that knows something better can still supply its own `hints` or
 * `solution` on the DTO, and those always win. This exists so that every one of
 * the 137 topics has a usable ladder rather than only the ones whose author had
 * time to write one.
 */
import type{HintLadder, QuestionDto}from"../../types/global";

/**
 * Reports whether a string is a plain number, including a fraction, so the shape
 * of a key can be described without parsing it twice.
 *
 * @param value - The string to test.
 * @returns True when the string is numeric.
 */
function isNumeric(value: string): boolean{
    let trimmed=value.trim();
    if (trimmed==="") return false;
    if (Number.isFinite(Number(trimmed))) return true;
    return /^-?\d+\s*\/\s*\d+$/.test(trimmed);
}

/**
 * Describes the shape of a key in one phrase, so a learner who has computed
 * something and is unsure whether it is the right kind of thing gets told.
 *
 * @param answer - The key.
 * @returns A short description.
 */
function describeShape(answer: string): string{
    let trimmed=answer.trim();
    if (trimmed==="") return "the expected answer";
    if (isNumeric(trimmed)){
        let value=Number(trimmed);
        if (Number.isFinite(value)){
            if (value===0) return "a number equal to zero";
            let magnitude=Math.abs(value);
            if (magnitude>=1000) return "a number with at least four digits before the point, so check for a decimal-place error";
            if (magnitude<0.01) return "a very small number, so check you have not dropped a factor of a hundred";
        }
        return "a single number, not a fraction, a decimal and a number mixed together";
    }
    if (/^\\frac|^\//.test(trimmed)) return "a single fraction in lowest terms if it can be";
    if (trimmed.includes("=")) return "an equation, in the form the question asked for";
    if (/^[a-z][a-z\s-]*$/i.test(trimmed)&&!/[+\-*/^]/.test(trimmed)) return "a word or short phrase rather than a number";
    return "an expression written the way the question wrote it";
}

/**
 * Builds the hint ladder for a question from what the question already declares.
 *
 * @param dto - The generated question.
 * @returns The ladder, or null when there is nothing to say.
 */
export function buildHintLadder(dto: QuestionDto): HintLadder|null{
    if (dto.hints) return dto.hints;
    let rungs:string[]=[];
    if (dto.expectedFormat){
        rungs.push("What the answer should look like: "+dto.expectedFormat.replace(/^Enter\s*/i,"").replace(/\.$/,"")+".");
    }
    rungs.push("The answer you want is "+describeShape(dto.correct)+".");
    if (dto.misconception){
        rungs.push("A common wrong turn here is "+dto.misconception.replace(/\.$/,"")+", so check that before you go further.");
    }
    rungs.push("Write down what the question gives you, then what it asks for, and find the one step between them.");
    if (rungs.length===0) return null;
    // The concession is separate from the rungs and always present, so a learner
    // who has taken every rung still has somewhere to go other than starting over.
    return {rungs, concede: "The answer is "+dto.correct+". Work backwards from it to see which step you missed."};
}

/**
 * Builds the worked solution for a question. A generator supplies the real steps;
 * where it has not, the scaffold is derived from the same facts as the hints so
 * the section is never empty and never invents a derivation it cannot justify.
 *
 * @param dto - The generated question.
 * @returns The steps, or null when there is nothing to show.
 */
export function buildSolution(dto: QuestionDto): string[]|null{
    if (dto.solution&&dto.solution.length>0) return dto.solution;
    if (isNumeric(dto.correct)) return null;
    let steps:string[]=[];
    steps.push("Question: "+stripMath(dto.latex));
    if (dto.expectedFormat) steps.push("Answer format: "+dto.expectedFormat.replace(/^Enter\s*/i,"").replace(/\.$/,"")+".");
    steps.push("Answer: "+dto.correct);
    return steps;
}

/**
 * Removes math delimiters so a question can be read in a sentence.
 *
 * @param value - The text to clean.
 * @returns The text without delimiters.
 */
function stripMath(value: string): string{
    return value
        .replace(/\\\[/g,"")
        .replace(/\\\]/g,"")
        .replace(/\\\(/g,"")
        .replace(/\\\)/g,"")
        .replace(/\$\$/g,"")
        .replace(/\$/g,"")
        .replace(/<br\s*\/?>/gi," ")
        .replace(/\\text\{([^}]*)\}/g,"$1")
        .replace(/\{|\}/g,"")
        .replace(/\s+/g," ")
        .trim();
}
