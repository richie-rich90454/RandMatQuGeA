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
    // Generators emit math-mode fragments and wrap them themselves, so each
    // delimiter group is validated on its own. Validating the whole string would
    // ask KaTeX to parse "\( ... \)" as if the delimiters were still active,
    // which it rejects as a function call in math mode.
    let bodies=mathModeBodies(latex);
    for(let body of bodies){
        findings=findings.concat(validateFragment(body));
    }
    if (bodies.length===0){
        // A prompt with no math group is prose. A bare percent sign there means
        // "per cent", not a LaTeX comment, so the comment-at-end check does not
        // apply to it.
        findings=findings.concat(validateFragment(latex, true));
    }
    return findings;
}

/**
 * Extracts the bodies of every inline and display math group, so each can be
 * validated independently of its delimiters.
 *
 * @param latex - The rendered prompt.
 * @returns The math-mode bodies, in order.
 */
function mathModeBodies(latex: string): string[]{
    let bodies:string[]=[];
    let re=/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;
    let match=re.exec(latex);
    while (match!==null){
        bodies.push(match[1]!==undefined?match[1]:match[2]);
        match=re.exec(latex);
    }
    return bodies;
}

/**
 * Validates a single LaTeX fragment in isolation.
 *
 * @param fragment - The fragment to validate.
 * @returns Every finding.
 */
function validateFragment(fragment: string, isProse: boolean=false): LatexFinding[]{
    let findings: LatexFinding[]=[];
    if (fragment.trim()===""){
        return [{code:"empty", message:"The prompt contains an empty math group."}];
    }
    try{
        katex.renderToString(fragment, {
            throwOnError:true,
            strict(code: string, message: string){
                if (isProse&&code==="commentAtEnd") return "ignore";
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
 * Reports whether a prompt places a Unicode character inside a math delimiter
 * that belongs in text mode. A degree sign in prose is correct and common, so
 * the check is scoped to math-mode regions only: a raw U+2212 minus, U+00D7
 * times or U+00B0 degree inside math mode renders as plausible but is not the
 * intended expression, and silently differs from the `-` and `^\circ` the rest
 * of the codebase uses.
 *
 * @param latex - The rendered prompt.
 * @returns The offending characters, or an empty array.
 */
export function findUnicodeInMathMode(latex: string): string[]{
    let offenders=new Set<string>();
    // U+2212 minus, U+00D7 times, U+00F7 divide, U+00B0 degree.
    let suspicious=["\u2212","\u00d7","\u00f7","\u00b0"];
    for(let body of mathModeBodies(latex)){
        for(let ch of suspicious){
            if (body.indexOf(ch)>=0) offenders.add(ch);
        }
    }
    return Array.from(offenders);
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
