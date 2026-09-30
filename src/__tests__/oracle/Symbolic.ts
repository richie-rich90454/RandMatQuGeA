/**
 * @file Tier-two answer equivalence: symbolic comparison under a real context.
 * @description This module answers "are these two expressions the same function",
 * which exact arithmetic cannot, because `(x+1)^2` and `x^2+2x+1` have no
 * single numeric value to compare.
 *
 * The single most important detail is the context. mathjs's default algebra
 * context is permissive enough to cancel `(x-1)` out of `(x-1)*x/(x-1)`, which is
 * wrong at x=1, and to treat `abs(x)` as equal to `x`. `simplify.realContext`
 * only permits rewrites that are valid over all reals, so it is the only context
 * correct for grading.
 *
 * A `simplify` failure is inconclusive, never a verdict. Deciding that two
 * arbitrary expressions are equal is undecidable in general, so treating a
 * failure as inequality would mark correct answers wrong.
 */
import type{QuestionDto}from"../../types/global";
import{equalExact, equalNumeric, isPlainNumber}from"./Exact";

type MathJs=any;
let mathjsPromise: Promise<MathJs>|null=null;

/**
 * Loads mathjs once and memoises the handle. Loading the library costs hundreds
 * of milliseconds, so the oracle must not pay it per comparison.
 *
 * @returns The mathjs module namespace.
 */
export async function loadMathjs(): Promise<MathJs>{
    if (!mathjsPromise){
        mathjsPromise=import("mathjs").then((m: any)=>m.default??m);
    }
    return mathjsPromise;
}

/** The outcome of comparing two answers. */
export type EquivalenceVerdict="equal"|"different"|"inconclusive";

/**
 * Converts the LaTeX subset the generators emit into mathjs syntax. Deliberately
 * narrow: an unrecognised construct is left alone so that parsing fails loudly
 * rather than silently mis-evaluating.
 *
 * @param latex - The LaTeX body.
 * @returns A mathjs-parseable expression string.
 */
export function latexToMathJs(latex: string): string{
    let s=latex.replace(/\\left|\\right/g,"");
    s=s.replace(/\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,"(($1)/($2))");
    s=s.replace(/\\d?frac\s*(\d)\s*(\d)/g,"($1/$2)");
    s=s.replace(/\\sqrt\[(\d+)\]\s*\{([^{}]*)\}/g,"(($2)^(1/($1)))");
    s=s.replace(/\\sqrt\s*\{([^{}]*)\}/g,"sqrt($1)");
    s=s.replace(/\\cdot|\\times/g,"*");
    s=s.replace(/\\pi/g,"pi");
    s=s.replace(/\\theta|\\phi/g,"theta");
    s=s.replace(/\\infty/g,"Infinity");
    s=s.replace(/\\ln/g,"ln");
    s=s.replace(/\\log_\{?(\d+)\}?/g,"log($1, _)");
    s=s.replace(/\\log/g,"log");
    s=s.replace(/\\circ/g,"");
    s=s.replace(/\\operatorname\{[a-z]+\}/g,"");
    s=s.replace(/\^\{\\circ\}/g,"");
    s=s.replace(/\^\circ/g,"");
    s=s.replace(/\\begin\{[a-z]+\}|\\end\{[a-z]+\}/g,"");
    s=s.replace(/\\\\/g,";");
    s=s.replace(/[{}]/g,"");
    s=s.replace(/\\/g,"");
    s=s.replace(/\s+/g," ");
    return s.trim();
}

/**
 * Extracts the single free variable of an expression, deduplicating by name and
 * excluding function symbols. A function node in mathjs is itself a symbol node,
 * so a naive collection counts "sin" as a variable and then mistakes `sin(x)` for
 * a two-variable expression, which silently disables sampling.
 *
 * @param expr - A mathjs node.
 * @returns The distinct free variable names.
 */
function freeVariables(expr: any): string[]{
    const found=new Set<string>();
    expr.forEach(function walk(node: any){
        if (!node||typeof node.isSymbolNode!=="boolean"||!node.isSymbolNode) return;
        if (node.fn&&typeof node.fn==="object"&&node.fn.className) return;
        found.add(node.name);
    });
    return Array.from(found);
}

/**
 * Reports whether two expressions are the same function. Exact rational
 * comparison runs first, then numeric evaluation, then symbolic simplification
 * under the real context, then numeric sampling at several points.
 *
 * @param a - The first expression.
 * @param b - The second expression.
 * @param samples - Points at which to sample when the symbolic step is inconclusive.
 * @returns A verdict; `inconclusive` means the comparison proved nothing either way.
 */
export async function equivalentExpressions(a: string, b: string, samples: number[]=[0.5, 1, 2, 3, Math.PI/4, Math.E]): Promise<EquivalenceVerdict>{
    if (a.trim()===b.trim()) return "equal";
    if (equalExact(a, b)) return "equal";
    const math=await loadMathjs();
    let left;
    let right;
    try{
        left=math.parse(latexToMathJs(a));
        right=math.parse(latexToMathJs(b));
    }
    catch{
        return "inconclusive";
    }
    // Numeric evaluation covers the common case without any symbolic work.
    let leftFree=freeVariables(left);
    let rightFree=freeVariables(right);
    let sameVariables=leftFree.length===rightFree.length&&leftFree.every(v=>rightFree.indexOf(v)>=0);
    if (sameVariables&&leftFree.length===0){
        try{
            let lv=left.evaluate();
            let rv=right.evaluate();
            if (Number.isFinite(lv)&&Number.isFinite(rv)){
                return equalNumeric(String(lv), String(rv))?"equal":"different";
            }
        }
        catch{
            // fall through to symbolic
        }
    }
    if (sameVariables){
        try{
            let d=math.simplify(math.parse("("+latexToMathJs(a)+")-("+latexToMathJs(b)+")"), {}, math.simplify.realContext);
            let rendered=d.toString();
            if (rendered==="0") return "equal";
            let dv=d.evaluate();
            if (Number.isFinite(dv)&&Math.abs(dv)<1e-12) return "equal";
        }
        catch{
            // fall through to sampling
        }
        for(let point of samples){
            let scope: { [key: string]: number }={};
            let usable=true;
            for(let v of leftFree){
                scope[v]=point;
            }
            try{
                let lv=left.evaluate(scope);
                let rv=right.evaluate(scope);
                if (!Number.isFinite(lv)||!Number.isFinite(rv)) continue;
                if (!equalNumeric(String(lv), String(rv), 1e-8)) return "different";
            }
            catch{
                usable=false;
                break;
            }
            if (!usable) break;
        }
    }
    return "inconclusive";
}

/**
 * Reports whether substituting a claimed answer back into a generated equation
 * satisfies it. This is the check that needs no oracle at all, and it is what
 * catches a wrong branch selection, a domain error, a bad root ordering, and
 * every instance of the printed-rounding defect.
 *
 * @param equation - The equation as printed in the prompt, for example "2x + 1 = 7".
 * @param answer - The claimed value of the solved variable.
 * @param variable - The variable being solved for. Defaults to "x".
 * @returns True when substitution makes both sides equal, or when the comparison
 *          was inconclusive.
 */
export async function satisfiesEquation(equation: string, answer: string, variable: string="x"): Promise<boolean>{
    let eq=equation.indexOf("=");
    if (eq<0) return true;
    let lhs=equation.slice(0, eq);
    let rhs=equation.slice(eq+1);
    if (lhs.includes(variable)&&!rhs.includes(variable)){
        let scope: { [key: string]: string }={};
        scope[variable]=answer;
        try{
            const math=await loadMathjs();
            let l=Number(math.evaluate(latexToMathJs(lhs), scope));
            let r=Number(math.evaluate(latexToMathJs(rhs)));
            if (!Number.isFinite(l)||!Number.isFinite(r)) return true;
            return equalNumeric(String(l), String(r), 1e-8);
        }
        catch{
            return true;
        }
    }
    return true;
}

/**
 * Reports whether a generated question is self-consistent: the prompt is not
 * empty, the answer is not an empty or non-finite placeholder, and the expected
 * format is present so the learner knows what to type.
 *
 * @param dto - The generated question.
 * @returns True when the question is minimally well-formed.
 */
export function isWellFormed(dto: QuestionDto): boolean{
    if (!dto||typeof dto.latex!=="string"||dto.latex.trim()==="") return false;
    if (typeof dto.correct!=="string"||dto.correct.trim()==="") return false;
    if (dto.correct==="NaN"||dto.correct==="Infinity"||dto.correct==="-Infinity") return false;
    if (dto.correct==="undefined"||dto.correct==="null") return false;
    return true;
}

/**
 * Reports whether a claimed answer is a plain number, which is the form the
 * correctness suite requires whenever the generator's answer shape is numeric.
 *
 * @param value - The answer string.
 * @returns True when the string is a plain finite number.
 */
export function isFiniteNumericAnswer(value: string): boolean{
    return isPlainNumber(value);
}
