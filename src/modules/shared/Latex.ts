/**
 * @file LaTeX construction helpers shared by every generator.
 * @description Guarantees that generated prompts are renderable LaTeX and that
 * a value is never printed in a form that disagrees with the value being
 * graded. Two rules are enforced here: a negative sign is never rendered as
 * ambiguous juxtaposition such as "x+-1" or "3x + -2", and a LaTeX dollar sign
 * is never embedded inside a math-mode delimiter.
 */

import{roundTo}from"./Numeric";

let USAGE_MARKERS=new Set<string>(["x","y","z","w","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","X","Y","Z"]);

/**
 * Joins a term list with the correct sign, rendering subtraction properly.
 * A leading negative becomes an explicit minus and a plus sign is never
 * followed by another sign.
 *
 * @param terms - Signed term strings, in display order.
 * @param variable - An optional trailing variable term to place last.
 * @returns A correctly signed LaTeX expression.
 */
export function joinTerms(terms: string[], variable?: string): string{
    let out="";
    for(let i=0; i<terms.length; i++){
        let t=terms[i];
        if (i===0){
            out=t.startsWith("-")?"-"+t.slice(1):t;
        }
        else{
            out+=t.startsWith("-")?" - "+t.slice(1):" + "+t;
        }
    }
    if (variable!==undefined) out+=variable;
    return out;
}

/**
 * Renders a linear expression such as "3x + 2" from a coefficient and a constant,
 * using unambiguous signs.
 *
 * @param coeff - Coefficient of the variable.
 * @param constant - Constant term.
 * @param variable - The variable name. Defaults to "x".
 * @param decimals - Decimal places to render. Defaults to 2.
 * @returns A correctly signed expression, or just the constant when coeff is 0.
 */
export function linearExpr(coeff: number, constant: number, variable: string="x", decimals: number=2): string{
    let c=trimNum(coeff, decimals);
    let k=trimNum(constant, decimals);
    if (c==="0") return k;
    let varPart=Math.abs(coeff)===1?variable:Math.abs(coeff)+variable;
    if (k==="0") return varPart;
    if (k.startsWith("-")) return varPart+" - "+k.slice(1);
    return varPart+" + "+k;
}

/**
 * Formats a number for prompt display, dropping a redundant leading zero in the
 * fractional part and normalizing negative zero.
 *
 * @param value - The value to render.
 * @param decimals - Decimal places to keep. Defaults to 2.
 * @returns A compact numeric string.
 */
export function trimNum(value: number, decimals: number=2): string{
    if (!Number.isFinite(value)) return "0";
    // Rounding is delegated so that a printed coefficient and the value graded
    // can never disagree, which is the whole point of the shared module.
    let rounded=roundTo(value, decimals);
    if (Object.is(rounded, -0)) rounded=0;
    let s=rounded.toFixed(decimals);
    if (s.includes(".")){
        s=s.replace(/0+$/,"").replace(/\.$/,"");
    }
    return s===""||s==="-"?"0":s;
}

/**
 * Renders a signed integer as an array of LaTeX rows, for a system of equations.
 *
 * @param coefficients - Coefficients in row-major order.
 * @param variables - Variable names in column order.
 * @param constant - The right-hand side.
 * @param decimals - Decimal places to render. Defaults to 2.
 * @returns A LaTeX equation body without delimiters.
 */
export function systemExpr(coefficients: number[], variables: string[], constant: number, decimals: number=2): string{
    let terms: string[]=[];
    for(let i=0; i<coefficients.length; i++){
        let c=coefficients[i];
        if (c===0) continue;
        let name=variables[i]||"x";
        let mag=Math.abs(c);
        let piece=mag===1?name:trimNum(mag, decimals)+name;
        terms.push(c<0?"-"+piece:piece);
    }
    if (terms.length===0) terms.push("0");
    return joinTerms(terms)+" = "+trimNum(constant, decimals);
}

/**
 * Wraps a body in inline math delimiters, first stripping any dollar sign the
 * body already contains. A dollar inside math mode is a hard parse error in
 * both KaTeX and MathJax, and generators that interpolate a currency amount
 * into a prompt produce exactly that.
 *
 * @param body - The LaTeX body.
 * @returns The body wrapped in inline math delimiters.
 */
export function inlineMath(body: string): string{
    return "\\( "+body.replace(/\$/g,"")+" \\)";
}

/**
 * Wraps a body in display math delimiters, stripping any interior dollar sign.
 *
 * @param body - The LaTeX body.
 * @returns The body wrapped in display math delimiters.
 */
export function displayMath(body: string): string{
    return "\\[ "+body.replace(/\$/g,"")+" \\]";
}

/**
 * Renders a factorised product such as "(x - 3)(x + 2)" with correct signs, given
 * the roots of a polynomial.
 *
 * @param roots - The roots of the polynomial.
 * @param variable - The variable name. Defaults to "x".
 * @param decimals - Decimal places to render. Defaults to 2.
 * @returns The factorised form.
 */
export function factorise(roots: number[], variable: string="x", decimals: number=2): string{
    return roots.map(r=>{
        let t=trimNum(r, decimals);
        if (t.startsWith("-")) return "("+variable+" + "+t.slice(1)+")";
        return "("+variable+" - "+t+")";
    }).join("");
}

/**
 * Renders a vertical-bar absolute value with a signed inner term.
 *
 * @param coeff - Coefficient of the variable.
 * @param constant - Constant term.
 * @param variable - The variable name. Defaults to "x".
 * @param decimals - Decimal places to render. Defaults to 2.
 * @returns An absolute value expression.
 */
export function absExpr(coeff: number, constant: number, variable: string="x", decimals: number=2): string{
    return "| "+linearExpr(coeff, constant, variable, decimals)+" |";
}

/**
 * Renders a number as a power with a signed exponent, avoiding "2^+3".
 *
 * @param base - The base.
 * @param exponent - The exponent.
 * @param decimals - Decimal places for the base. Defaults to 2.
 * @returns A power expression.
 */
export function powerExpr(base: number, exponent: number, decimals: number=2): string{
    let b=trimNum(base, decimals);
    if (exponent<0) return "1 / "+b+"^{"+trimNum(Math.abs(exponent), 0)+"}";
    return b+"^{"+trimNum(exponent, 0)+"}";
}

/**
 * Renders a fraction with a signed denominator, avoiding "1/(-3)".
 *
 * @param numerator - The numerator.
 * @param denominator - The denominator, which must not be zero.
 * @param decimals - Decimal places to render. Defaults to 2.
 * @returns A LaTeX fraction.
 */
export function fracExpr(numerator: number, denominator: number, decimals: number=2): string{
    let n=trimNum(numerator, decimals);
    let d=trimNum(denominator, decimals);
    if (d.startsWith("-")) return "-\\frac{"+n+"}{"+d.slice(1)+"}";
    return "\\frac{"+n+"}{"+d+"}";
}

/**
 * Reports whether a rendered prompt contains a dollar sign inside a math
 * delimiter, which is a parse error in both supported renderers.
 *
 * @param latex - The rendered prompt.
 * @returns True when a dollar sign appears inside a math-mode region.
 */
export function hasDollarInMathMode(latex: string): boolean{
    let inInline=false;
    let inDisplay=false;
    for(let i=0; i<latex.length; i++){
        if (latex[i]=="\\"&&latex[i+1]=="("){ inInline=true; i++; continue; }
        if (latex[i]=="\\"&&latex[i+1]===")"){ inInline=false; continue; }
        if (latex[i]=="\\"&&latex[i+1]==="["){ inDisplay=true; i++; continue; }
        if (latex[i]=="\\"&&latex[i+1]==="]"){ inDisplay=false; continue; }
        if (latex[i]==="$"&&(inInline||inDisplay)) return true;
    }
    return false;
}

/**
 * Reports whether a single-letter token is a variable rather than a unit or a
 * digit, used when deciding whether a coefficient of one should be omitted.
 *
 * @param token - The token to test.
 * @returns True when the token is a known single-letter variable.
 */
export function isVariableToken(token: string): boolean{
    return USAGE_MARKERS.has(token);
}
