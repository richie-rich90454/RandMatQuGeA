/**
 * @file Answer normalisation shared by the checker, the option builder and the
 * difficulty gate.
 * @description The app has to decide whether two answer strings mean the same
 * thing, and it has to do so in three places: when grading a typed answer, when
 * deciding whether two multiple-choice options are duplicates, and when deciding
 * whether a topic's difficulty parameter actually changed anything. Putting that
 * decision in one module is what stops the three from disagreeing, which is how
 * "0.50" and "0.5" came to be treated as two different options in one place and
 * as the same answer in another.
 */

import Fraction from "fraction.js";

/**
 * Reads the braced group that opens at `open`, balancing nested braces, so
 * that `\frac{1}{\sin(30^{\circ})}` yields its full denominator rather than
 * stopping at the first inner brace. The scan is bounded by the string length,
 * so a malformed group costs one pass rather than the test run.
 *
 * @param text - The text being rewritten.
 * @param open - The index of the opening brace.
 * @returns The group content and the index of its closing brace, or null when
 *          no balanced close exists.
 */
function readBraced(text: string, open: number): {content: string, close: number}|null{
    if(open<0||open>=text.length||text[open]!=="{") return null;
    let depth=0;
    for(let i=open;i<text.length;i++){
        if(text[i]==="{") depth++;
        else if(text[i]==="}"){
            depth--;
            if(depth===0) return {content:text.slice(open+1, i), close:i};
        }
    }
    return null;
}

/**
 * Reads the bracketed root index that opens at `open`, for `\sqrt[3]{x}`.
 *
 * @param text - The text being rewritten.
 * @param open - The index of the opening bracket.
 * @returns The bracket content and the index of its closing bracket, or null
 *          when no close exists.
 */
function readBracketed(text: string, open: number): {content: string, close: number}|null{
    if(open<0||open>=text.length||text[open]!=="[") return null;
    let end=text.indexOf("]", open+1);
    if(end<0) return null;
    return {content:text.slice(open+1, end), close:end};
}

/**
 * Rewrites `\frac{a}{b}` as `(a)/(b)`, parsing both groups with balanced
 * braces so that plainly nested forms convert: the half-angle surd
 * `\frac{\sqrt{6}-\sqrt{2}}{4}`, a reciprocal of a ratio such as
 * `\frac{1}{\sin(30^{\circ})}`, and a fraction nested inside a fraction.
 * A brace-free pattern survives all three untouched and hands the checker a
 * `\frac` command it cannot parse, so a key that prints perfectly well cannot
 * be graded.
 *
 * The rewrite repeats until the string stops changing, bounded by a pass
 * count. Each pass strictly removes one `\frac` and introduces none, so the
 * loop terminates; the bound is there so that a string which somehow never
 * settles costs eight passes rather than the test run.
 *
 * @param value - The text to rewrite.
 * @returns The text with every `\frac` flattened.
 */
function flattenFractions(value: string): string{
    let out=value;
    for(let pass=0;pass<8;pass++){
        if(out.indexOf("\\frac")<0) return out;
        let next="";
        let cursor=0;
        let changed=false;
        while(cursor<out.length){
            let found=out.indexOf("\\frac", cursor);
            if(found<0){
                next+=out.slice(cursor);
                break;
            }
            let argOpen=found+5;
            if(out[argOpen]!=="{"){
                next+=out.slice(cursor, argOpen);
                cursor=argOpen;
                continue;
            }
            let first=readBraced(out, argOpen);
            if(!first){
                next+=out.slice(cursor);
                break;
            }
            let secondOpen=first.close+1;
            if(out[secondOpen]!=="{"){
                next+=out.slice(cursor, secondOpen);
                cursor=secondOpen;
                continue;
            }
            let second=readBraced(out, secondOpen);
            if(!second){
                next+=out.slice(cursor);
                break;
            }
            next+=out.slice(cursor, found)+"("+first.content+")/("+second.content+")";
            cursor=second.close+1;
            changed=true;
        }
        if(!changed) return out;
        if(next===out) return out;
        out=next;
    }
    return out;
}

/**
 * Rewrites `\sqrt{...}` as `sqrt(...)` and `\sqrt[n]{...}` as
 * `(..)^(1/(n))`, parsing the braced group with balanced braces so that a
 * radicand holding a fraction or a nested root converts. Repeats until the
 * string stops changing, bounded by a pass count; each pass strictly removes
 * one `\sqrt` and introduces none.
 *
 * @param value - The text to rewrite.
 * @returns The text with every `\sqrt` flattened.
 */
function flattenRoots(value: string): string{
    let out=value;
    for(let pass=0;pass<8;pass++){
        if(out.indexOf("\\sqrt")<0) return out;
        let next="";
        let cursor=0;
        let changed=false;
        while(cursor<out.length){
            let found=out.indexOf("\\sqrt", cursor);
            if(found<0){
                next+=out.slice(cursor);
                break;
            }
            let argOpen=found+5;
            let root="";
            if(out[argOpen]==="["){
                let bracket=readBracketed(out, argOpen);
                if(!bracket){
                    next+=out.slice(cursor);
                    break;
                }
                root=bracket.content;
                argOpen=bracket.close+1;
            }
            if(out[argOpen]!=="{"){
                next+=out.slice(cursor, argOpen);
                cursor=argOpen;
                continue;
            }
            let body=readBraced(out, argOpen);
            if(!body){
                next+=out.slice(cursor);
                break;
            }
            if(root==="") next+=out.slice(cursor, found)+"sqrt("+body.content+")";
            else next+=out.slice(cursor, found)+"("+body.content+")^(1/("+root+"))";
            cursor=body.close+1;
            changed=true;
        }
        if(!changed) return out;
        if(next===out) return out;
        out=next;
    }
    return out;
}

/**
 * Rewrites LaTeX into the plain expression a checker can evaluate, so that a key
 * written as a fraction is comparable with the decimal a learner typed. Only the
 * constructs the app actually prints as an answer are handled; anything else
 * keeps its backslash stripped and is left to the caller's comparison.
 *
 * An angle the curriculum prints as `45^{\circ}` is the number 45, so the degree
 * mark goes rather than becoming a symbol the checker has to know about, and a
 * `\cdot` becomes the `*` a learner would have typed. A radical printed as the
 * single Unicode character `√` becomes `sqrt(...)` for the same reason: the
 * checker reads `sqrt(x)` and has never read `√x`.
 *
 * @param value - The LaTeX or plain text.
 * @returns The plain equivalent.
 */
export function latexToPlain(value: string): string{
    if (typeof value!=="string") return "";
    return flattenRoots(flattenFractions(value))
        .replace(/\\(?:left|right|displaystyle|,|;|!)/g,"")
        // The degree mark and the multiplication dot have to be rewritten before
        // the generic rule below, which would leave "45^(circ)" and "2cdot3" for
        // the checker to read as two symbols multiplied together.
        .replace(/\^\{?\\circ\}?/g,"")
        .replace(/\\(?:cdot|times)/g,"*")
        // The Unicode radical is a single character in a way a function call is
        // not, so "√x + 2" has to become "sqrt(x) + 2" or the checker reads the
        // root sign as a symbol multiplied by x. A bar over the radicand is
        // ordinary LaTeX and is already handled above.
        .replace(/√\s*([0-9]+(?:\.[0-9]+)?)/g,"sqrt($1)")
        .replace(/√\s*([A-Za-z][A-Za-z0-9]*)/g,"sqrt($1)")
        .replace(/\\([a-zA-Z]+)/g,"$1")
        .replace(/[{}]/g,"");
}

/**
 * The plural spellings of the closed vocabulary this curriculum grades as
 * words, mapped to their singular stems. The map is explicit rather than a
 * rule that strips every trailing "s", because that rule would turn "class"
 * into "clas" on the first prose answer that is not about number sets.
 */
let wordSingulars=new Map<string,string>([
    ["naturals", "natural"],
    ["wholes", "whole"],
    ["integers", "integer"],
    ["rationals", "rational"],
    ["irrationals", "irrational"],
    ["reals", "real"],
    ["primes", "prime"],
    ["composites", "composite"],
    ["evens", "even"],
    ["odds", "odd"]
]);

/**
 * The singular stems a trailing "s" may be stripped to reach. A word outside
 * this set keeps its spelling, so "class" never becomes a stem the curriculum
 * does not grade.
 */
let wordBases=new Set<string>(["natural", "whole", "integer", "rational", "irrational", "real", "prime", "composite", "even", "odd", "positive", "negative", "converges", "diverges", "convergent", "divergent", "increasing", "decreasing"]);

/**
 * Reduces one word answer to one spelling, so that "Whole Numbers",
 * "whole-number" and "whole" compare equal. Case, hyphen/underscore/space
 * differences and the plural forms of the closed vocabulary above are all
 * removed; anything outside that vocabulary is only lowercased and spaced
 * normally, never stemmed.
 *
 * @param token - One answer or one comma-separated element of an answer.
 * @returns The canonical spelling.
 */
export function canonicalWordToken(token: string): string{
    if(typeof token!=="string") return "";
    let t=token.trim().toLowerCase();
    t=t.replace(/([A-Za-z])[-_]+([A-Za-z])/g, "$1 $2");
    t=t.replace(/\s+/g, " ").trim();
    let m=t.match(/^(whole|natural|integer|rational|irrational|real|prime|composite|even|odd)\s+numbers?$/);
    if(m) t=m[1];
    let mapped=wordSingulars.get(t);
    if(mapped) return mapped;
    if(t.length>1&&t[t.length-1]==="s"){
        let singular=t.slice(0, -1);
        if(wordBases.has(singular)) return singular;
    }
    return t;
}

/**
 * Splits a possibly multi-part word answer into canonical tokens, keeping
 * their order. The answer is split on commas, semicolons and the word "and",
 * and each element is canonicalised, because "Whole Numbers, integers" and
 * "whole-number, integer" are the same two names.
 *
 * @param value - The word answer, single or comma-separated.
 * @returns The canonical tokens in prompt order.
 */
function wordTokens(value: string): string[]{
    let chunks=value.split(/[,;]/);
    let tokens:string[]=[];
    for(let chunk of chunks){
        let parts=chunk.split(/\s+and\s+/i);
        for(let piece of parts){
            let t=canonicalWordToken(piece);
            if(t!=="") tokens.push(t);
        }
    }
    return tokens;
}

/**
 * Reduces a possibly multi-part word answer to one spelling, so that
 * "whole, integer, rational, real" and "Whole Numbers, Integers, Rational,
 * Real" compare equal. The elements are sorted, because a set of names in a
 * different order is the same answer; answers whose elements are not all in
 * the closed vocabulary above are compared in prompt order by
 * `equivalentWordAnswers` instead, because a Hamilton-path order is not a set.
 *
 * @param value - The word answer, single or comma-separated.
 * @returns The canonical spelling, or "" when it holds no word.
 */
export function canonicalWordSet(value: string): string{
    if(typeof value!=="string") return "";
    let tokens=wordTokens(value);
    tokens.sort();
    return tokens.join(",");
}

/**
 * Reports whether two answers are the same words after canonicalisation, so
 * that a case or plural variant of the key is recognised as a second correct
 * option rather than a wrong one. Numbers are never words: a digit string and
 * a word are different answers, and two digit strings are compared numerically
 * elsewhere. Mathematical notation is never words either: anything carrying a
 * digit, a backslash or a symbol outside prose punctuation takes the trimmed,
 * numeric and symbolic comparisons instead, because treating "-" as a word
 * separator turns "-4.10" into "4.10".
 *
 * @param a - The first answer.
 * @param b - The second answer.
 * @returns True when the two are the same words.
 */
export function equivalentWordAnswers(a: string, b: string): boolean{
    if(typeof a!=="string"||typeof b!=="string") return false;
    if(a.trim()===""||b.trim()==="") return false;
    if(a.trim()===b.trim()) return true;
    if(isNumericText(a)||isNumericText(b)) return false;
    if(isFiniteNumberText(a)||isFiniteNumberText(b)) return false;
    if(/[0-9\\]/.test(a)||/[0-9\\]/.test(b)) return false;
    if(/[^A-Za-z\s,;\-']/.test(a)||/[^A-Za-z\s,;\-']/.test(b)) return false;
    let at=wordTokens(a);
    let bt=wordTokens(b);
    if(at.length===0||bt.length===0) return false;
    if(at.length!==bt.length) return false;
    // Only a list drawn entirely from the graded vocabulary is a set, where
    // order carries no meaning. A vertex order such as "A, B, D, C" is a
    // route, and sorting it into "A, B, C, D" manufactures a duplicate out of
    // a genuine alternative, so anything else compares in prompt order.
    let closedA=true;
    for(let t of at){
        if(!wordBases.has(t)){
            closedA=false;
            break;
        }
    }
    let closedB=true;
    for(let t of bt){
        if(!wordBases.has(t)){
            closedB=false;
            break;
        }
    }
    if(closedA&&closedB){
        at.sort();
        bt.sort();
    }
    return at.join(",")===bt.join(",");
}

/**
 * Reports whether a string is a plain finite number.
 *
 * @param value - The string to test.
 * @returns True when the string parses to a finite number.
 */
export function isFiniteNumberText(value: string): boolean{
    if (typeof value!=="string") return false;
    let trimmed=value.trim();
    if (trimmed==="") return false;
    let parsed=Number(trimmed);
    return Number.isFinite(parsed);
}

/**
 * Reports whether two numbers are equal to within the precision a learner can
 * actually see. A question displayed to two decimal places cannot distinguish
 * 2.30 from 2.304, so accepting both is correct, while 2.30 and 2.31 are
 * different answers and must not be accepted.
 *
 * @param a - The first value, as text.
 * @param b - The second value, as text.
 * @param displayedDecimals - Decimal places the question displays. Defaults to 2.
 * @returns True when the two are the same value at the displayed precision.
 */
export function sameNumericValue(a: string, b: string, displayedDecimals: number=2): boolean{
    if (canonicalNumeric(a)===canonicalNumeric(b)) return true;
    let left=Number(a);
    let right=Number(b);
    if (!Number.isFinite(left)||!Number.isFinite(right)) return false;
    if (left===right) return true;
    let band=Math.pow(10, -displayedDecimals)/2;
    return Math.abs(left-right)<=band;
}

/**
 * Reduces a numeric string to one spelling, so that two spellings of the same
 * value compare equal. Uses exact rational arithmetic, so "14/3" and "28/6"
 * canonicalise to the same thing rather than merely comparing close.
 *
 * @param value - The numeric string.
 * @returns The canonical spelling, or the trimmed input when it is not numeric.
 */
export function canonicalNumeric(value: string): string{
    if (typeof value!=="string") return "";
    let trimmed=value.trim();
    if (!isNumericText(trimmed)) return trimmed;
    let exact=toFraction(trimmed);
    if (!exact) return trimmed;
    return exact;
}

/**
 * Reports whether a string is a finite number, written either as a plain number
 * or as an exact fraction. Number() alone answers false for "3/4", which is a
 * correct answer shape for several topics, so the fraction form is accepted too.
 *
 * @param value - The string to test.
 * @returns True when the string is numeric.
 */
export function isNumericText(value: string): boolean{
    if (typeof value!=="string") return false;
    let trimmed=value.trim();
    if (trimmed==="") return false;
    if (Number.isFinite(Number(trimmed))) return true;
    if (!/^-?\d+\s*\/\s*\d+$/.test(trimmed)) return false;
    let [n, d]=trimmed.split("/").map(part=>Number(part.trim()));
    return Number.isFinite(n)&&Number.isFinite(d)&&d!==0;
}

/**
 * Converts a numeric string to an exact reduced fraction string, or returns null
 * when the string is not a plain rational. The arithmetic is exact, so 14/3 and
 * 28/6 canonicalise alike and no binary representation error survives.
 *
 * @param value - The numeric string.
 * @returns A reduced "n" or "n/d" string, or null.
 */
function toFraction(value: string): string|null{
    let trimmed=value.trim();
    try{
        // fraction.js parses "3/4" and "0.5" exactly, but rejects exponent
        // notation, so that form is handed over as the number it denotes.
        let exact=/[eE]/.test(trimmed)?new Fraction(Number(trimmed)):new Fraction(trimmed);
        if (!exact.s||!exact.n) return null;
        return exact.s<0?"-"+exact.n+"/"+exact.d:exact.n+"/"+exact.d;
    }
    catch{
        return null;
    }
}
