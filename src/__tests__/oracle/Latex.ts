/**
 * @file Tier-zero validation: LaTeX must render.
 * @description A question whose prompt does not typeset is worse than a missing
 * question, because the learner sees raw markup and cannot tell whether the
 * problem is theirs or ours. KaTeX is the validator because it is synchronous,
 * has no DOM dependency for `renderToString`, and produces the same output
 * regardless of environment, so a validation in Node is a validation in the app.
 *
 * `strict` matters more than `throwOnError`. `throwOnError` already defaults to
 * true and only fires on a genuine parse error. `strict` defaults to "warn",
 * which logs and continues, and its `unknownSymbol` and `mathVsTextUnits` codes
 * catch exactly the defects that render as plausible but wrong output: a raw
 * U+2212 minus, a U+00D7 times, a degree sign where `^\circ` belongs.
 */
import katex from "katex";
import type{QuestionDto} from"../../types/global";

/** One reason a prompt failed validation. */
export interface LatexFinding{
    /** The failing code, from KaTeX's strict handler or its parser. */
    code: string;
    /** A human-readable explanation. */
    message: string;
}

/**
 * Validates a LaTeX fragment, returning every problem found rather than the
 * first, so a generator's author sees all of them at once.
 *
 * @param latex - The fragment to validate.
 * @returns Zero or more findings. An empty array means the fragment is clean.
 */
export function validateLatex(latex: string): LatexFinding[]{
    let findings: LatexFinding[]=[];
    if (typeof latex!=="string"||latex.trim()===""){
        return [{code:"empty", message:"The prompt is empty."}];
    }
    try{
        katex.renderToString(latex, {
            throwOnError:true,
            strict(code: string, message: string){
                findings.push({code, message});
                return "ignore";
            },
            displayMode:false,
            trust:false,
            maxExpand:1000
        });
    }
    catch(error){
        let message=error instanceof Error?error.message:String(error);
        findings.push({code:"parse", message});
    }
    return findings;
}

/**
 * Reports whether a LaTeX fragment renders without any strict-mode complaint.
 *
 * @param latex - The fragment to validate.
 * @returns True when the fragment is clean.
 */
export function isValidLatex(latex: string): boolean{
    return validateLatex(latex).length===0;
}

/**
 * Reports whether a string contains a Unicode character that belongs in text
 * mode rather than math mode. Generators that interpolate a raw degree sign, a
 * Unicode minus or a multiplication sign produce output that renders as
 * plausible but is not the intended expression.
 *
 * @param latex - The fragment to inspect.
 * @returns The offending characters, or an empty array.
 */
export function findUnicodeInMathMode(latex: string): string[]{
    let offenders:string[]=[];
    // U+2212 minus, U+00D7 times, U+00F7 divide, U+00B0 degree.
    let suspicious=["\u2212","\u00d7","\u00f7","\u00b0"];
    for(let ch of suspicious){
        if (latex.indexOf(ch)>=0) offenders.push(ch);
    }
    return offenders;
}

/**
 * Validates a full generated question's prompt and reports every problem.
 *
 * @param dto - The generated question.
 * @returns Every finding across the prompt.
 */
export function validateQuestionLatex(dto: QuestionDto): LatexFinding[]{
    if (!dto||typeof dto.latex!=="string"){
        return [{code:"missing", message:"The question has no prompt."}];
    }
    let findings=validateLatex(dto.latex);
    for(let ch of findUnicodeInMathMode(dto.latex)){
        findings.push({
            code:"unicode-in-math",
            message:"Character U+"+ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")+" belongs in text mode, not inside a math delimiter."
        });
    }
    return findings;
}
