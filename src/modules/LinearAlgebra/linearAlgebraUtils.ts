export interface Matrix2x2{
    a: number;
    b: number;
    c: number;
    d: number;
}
export interface Vector2D{
    x: number;
    y: number;
}
export function getRange(difficulty?: string): number{
    if (difficulty==="easy") return 3;
    if (difficulty==="hard") return 10;
    return 5;
}
export function matrixToString(m: Matrix2x2, style="bmatrix"): string{
    return `\\begin{${style}} ${m.a} & ${m.b} \\\\ ${m.c} & ${m.d} \\end{${style}}`;
}