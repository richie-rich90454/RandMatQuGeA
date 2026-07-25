/**
 * Linear algebra utilities: types, range, matrix to LaTeX.
 * @fileoverview Provides interfaces and helper functions for linear algebra generators.
 * @date 2026-03-15
 */
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
export function getMatrixSize(difficulty?: string): {rows: number; cols: number}{
	if (difficulty==="easy") return {rows:2,cols:2};
	if (difficulty==="hard") return {rows:4,cols:4};
	return {rows:3,cols:3};
}
export function getVectorDimension(difficulty?: string): number{
	if (difficulty==="easy") return 2;
	if (difficulty==="hard") return 4;
	return 3;
}
export function formatMatrix(matrix: number[][]): string{
	return matrix.map(row=>row.join(" ")).join("\n");
}
export function formatVector(vector: number[]): string{
	return "("+vector.join(", ")+")";
}
export function getDeterminant(matrix: number[][]): number{
	const n=matrix.length;
	if (n===0) return 0;
	if (n===1) return matrix[0][0];
	if (n===2) return matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0];
	let det=0;
	for (let col=0;col<n;col++){
		const minor=matrix.slice(1).map(row=>row.filter((_,c)=>c!==col));
		det+=(col%2===0?1:-1)*matrix[0][col]*getDeterminant(minor);
	}
	return det;
}