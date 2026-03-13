/**
 * Represents a trigonometric function and its derivative for question generation.
 */
interface TrigFunction{
    func: string;
    deriv: string;
    plainDeriv: string;
}

/**
 * Represents an exponential function and its derivative.
 */
interface ExpFunction{
    func: string;
    deriv: string;
    plainDeriv: string;
}

/**
 * Represents a logarithmic function and its derivative.
 */
interface LogFunction{
    func: string;
    deriv: string;
    plainDeriv: string;
}

/**
 * Represents a trigonometric function and its integral for question generation.
 */
interface TrigIntegral{
    func: string;
    integral: string;
    plain: string;
}

/**
 * Determines the maximum coefficient value to use based on the requested difficulty level.
 *
 * @param difficulty - Optional difficulty level: `"easy"`, `"medium"` (default), or `"hard"`.
 * @returns The maximum coefficient value: 3 for easy, 10 for hard, otherwise 5.
 */
export function getMaxCoeff(difficulty?: string): number{
    if (difficulty==="easy") return 3;
    if (difficulty==="hard") return 10;
    return 5;
}

/**
 * Converts a LaTeX string to a plain-text representation by stripping LaTeX commands and braces.
 *
 * The conversion handles:
 * - Removing backslashes.
 * - Removing curly braces.
 * - Replacing `\cdot` with `*`.
 * - Converting `\frac{...}{...}` to `(...)/(...)`.
 *
 * @param str - The LaTeX string to convert.
 * @returns A plain-text string suitable for display or comparison.
 */
export function latexToPlain(str: string): string{
    return str.replace(/\\/g, "").replace(/{/g, "").replace(/}/g, "").replace(/cdot/g, "*").replace(/frac\(([^)]+)\)\(([^)]+)\)/g, "($1)/($2)").replace(/frac{([^}]+)}{([^}]+)}/g, "($1)/($2)");
}

/**
 * A collection of trigonometric functions with their LaTeX and plain‑text derivatives,
 * used for generating derivative questions.
 */
export const trigFunctions: TrigFunction[]=[
    {func: "\\sin(x)", deriv: "\\cos(x)", plainDeriv: "cos(x)"},
    {func: "\\cos(x)", deriv: "-\\sin(x)", plainDeriv: "-sin(x)"},
    {func: "\\tan(x)", deriv: "\\sec^{2}(x)", plainDeriv: "sec^2(x)"},
    {func: "\\csc(x)", deriv: "-\\csc(x)\\cot(x)", plainDeriv: "-csc(x)cot(x)"},
    {func: "\\sec(x)", deriv: "\\sec(x)\\tan(x)", plainDeriv: "sec(x)tan(x)"},
    {func: "\\cot(x)", deriv: "-\\csc^{2}(x)", plainDeriv: "-csc^2(x)"}
];

/**
 * A collection of exponential functions with their LaTeX and plain‑text derivatives,
 * used for generating derivative questions.
 */
export const expFunctions: ExpFunction[]=[
    {func: "e^{x}", deriv: "e^{x}", plainDeriv: "e^x"},
    {func: "2^{x}", deriv: "2^{x}\\ln(2)", plainDeriv: "2^x*ln(2)"}
];

/**
 * A collection of logarithmic functions with their LaTeX and plain‑text derivatives,
 * used for generating derivative questions.
 */
export const logFunctions: LogFunction[]=[
    {func: "\\ln(x)", deriv: "\\frac{1}{x}", plainDeriv: "1/x"},
    {func: "\\log_{2}(x)", deriv: "\\frac{1}{x\\ln(2)}", plainDeriv: "1/(x*ln(2))"}
];

/**
 * A collection of trigonometric functions with their LaTeX and plain‑text integrals,
 * used for generating integral questions. The placeholder `a` is meant to be replaced
 * with a coefficient at generation time.
 */
export const trigIntegrals: TrigIntegral[]=[
    {func: "\\sin(ax)", integral: "-\\frac{1}{a}\\cos(ax)", plain: "-1/a cos(ax)"},
    {func: "\\cos(ax)", integral: "\\frac{1}{a}\\sin(ax)", plain: "1/a sin(ax)"},
    {func: "\\sec^{2}(ax)", integral: "\\frac{1}{a}\\tan(ax)", plain: "1/a tan(ax)"}
];