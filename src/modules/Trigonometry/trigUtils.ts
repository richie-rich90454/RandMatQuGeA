/**
 * Utility functions for trigonometry questions.
 * @fileoverview Provides helper functions for formatting fractions of π.
 * @date 2026-03-15
 */

/**
 * Converts a numeric angle in radians to a fraction of π if possible.
 * @param value - Angle in radians.
 * @returns A string representing the angle as a multiple of π (e.g., "π/2", "3π/4", or decimal if not exact).
 */
export function formatPiFraction(value: number): string {
	const pi=Math.PI;
	const tolerance=1e-6;
	if (Math.abs(value) < tolerance) return "0";
	let numerator=value / pi;
	for (let den=1; den<=8; den++) {
		let num=numerator * den;
		if (Math.abs(num - Math.round(num)) < tolerance) {
			let rounded=Math.round(num);
			if (den===1) {
				if (rounded===1) return "π";
				if (rounded===-1) return "-π";
				return rounded + "π";
			}
			if (rounded===1) return `π/${den}`;
			if (rounded===-1) return `-π/${den}`;
			return `${rounded}π/${den}`;
		}
	}
	return value.toFixed(2);
}
export function getTrigFunction(func: string): string {
	switch(func) {
		case "sin": return "sin";
		case "cos": return "cos";
		case "tan": return "tan";
		case "cot": return "cot";
		case "sec": return "sec";
		case "csc": return "csc";
		default: return "unknown";
	}
}
export function getAngle(difficulty: string): number {
	if (difficulty==="easy") {
		return Math.floor(Math.random()*360);
	} else if (difficulty==="hard") {
		return Math.random()*2*Math.PI;
	} else if (difficulty==="medium") {
		let specialAngles=[0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, 2*Math.PI/3, 3*Math.PI/4, 5*Math.PI/6, Math.PI, 7*Math.PI/6, 5*Math.PI/4, 4*Math.PI/3, 3*Math.PI/2, 5*Math.PI/3, 7*Math.PI/4, 11*Math.PI/6];
		return specialAngles[Math.floor(Math.random()*specialAngles.length)];
	} else {
		return -1;
	}
}
export function getPeriod(func: string): number {
	if (func==="sin" || func==="cos" || func==="sec" || func==="csc") {
		return 2*Math.PI;
	} else if (func==="tan" || func==="cot") {
		return Math.PI;
	} else {
		return -1;
	}
}
export function formatAngle(angle: number, isRadians: boolean): string {
	if (isRadians) {
		if (angle===0) return "0";
		let frac=formatPiFraction(angle);
		return frac;
	} else {
		return angle + "°";
	}
}
export function getReferenceAngle(angle: number): number {
	const twoPi=2*Math.PI;
	let normalized=angle % twoPi;
	if (normalized < 0) {
		normalized+=twoPi;
	}
	if (normalized===0) {
		return 0;
	}
	if (normalized > 0 && normalized <= Math.PI/2) {
		return normalized;
	} else if (normalized > Math.PI/2 && normalized <= Math.PI) {
		return Math.PI - normalized;
	} else if (normalized > Math.PI && normalized <= 3*Math.PI/2) {
		return normalized - Math.PI;
	} else {
		return twoPi - normalized;
	}
}