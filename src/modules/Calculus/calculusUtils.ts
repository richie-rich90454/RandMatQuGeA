interface TrigFunction{
    func: string;
    deriv: string;
    plainDeriv: string;
}
interface ExpFunction{
    func: string;
    deriv: string;
    plainDeriv: string;
}
interface LogFunction{
    func: string;
    deriv: string;
    plainDeriv: string;
}
interface TrigIntegral{
    func: string;
    integral: string;
    plain: string;
}
export function getMaxCoeff(difficulty?: string): number{
    if (difficulty==="easy") return 3;
    if (difficulty==="hard") return 10;
    return 5;
}
export function latexToPlain(str: string): string{
    return str.replace(/\\/g, "").replace(/{/g, "").replace(/}/g, "").replace(/cdot/g, "*").replace(/frac\(([^)]+)\)\(([^)]+)\)/g, "($1)/($2)").replace(/frac{([^}]+)}{([^}]+)}/g, "($1)/($2)");
}
export const trigFunctions: TrigFunction[]=[
    {func: "\\sin(x)", deriv: "\\cos(x)", plainDeriv: "cos(x)"},
    {func: "\\cos(x)", deriv: "-\\sin(x)", plainDeriv: "-sin(x)"},
    {func: "\\tan(x)", deriv: "\\sec^{2}(x)", plainDeriv: "sec^2(x)"},
    {func: "\\csc(x)", deriv: "-\\csc(x)\\cot(x)", plainDeriv: "-csc(x)cot(x)"},
    {func: "\\sec(x)", deriv: "\\sec(x)\\tan(x)", plainDeriv: "sec(x)tan(x)"},
    {func: "\\cot(x)", deriv: "-\\csc^{2}(x)", plainDeriv: "-csc^2(x)"}
];
export const expFunctions: ExpFunction[]=[
    {func: "e^{x}", deriv: "e^{x}", plainDeriv: "e^x"},
    {func: "2^{x}", deriv: "2^{x}\\ln(2)", plainDeriv: "2^x*ln(2)"}
];
export const logFunctions: LogFunction[]=[
    {func: "\\ln(x)", deriv: "\\frac{1}{x}", plainDeriv: "1/x"},
    {func: "\\log_{2}(x)", deriv: "\\frac{1}{x\\ln(2)}", plainDeriv: "1/(x*ln(2))"}
];
export const trigIntegrals: TrigIntegral[]=[
    {func: "\\sin(ax)", integral: "-\\frac{1}{a}\\cos(ax)", plain: "-1/a cos(ax)"},
    {func: "\\cos(ax)", integral: "\\frac{1}{a}\\sin(ax)", plain: "1/a sin(ax)"},
    {func: "\\sec^{2}(ax)", integral: "\\frac{1}{a}\\tan(ax)", plain: "1/a tan(ax)"}
];