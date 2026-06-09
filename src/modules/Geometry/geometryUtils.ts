/**
 * Geometry utilities for difficulty scaling and visualization cleanup.
 * @fileoverview Provides helper functions to get maximum values based on difficulty and to clean up visualization elements.
 * @date 2026-03-15
 */
/**
 * Returns the maximum value for a parameter scaled by difficulty.
 * @param difficulty - optional difficulty level ('easy', 'hard', or undefined for medium)
 * @param baseMax - base maximum value to scale
 * @returns scaled maximum integer
 */
export function getMaxForDifficulty(difficulty?: string, baseMax: number=10): number{
	if (difficulty==="easy") return Math.floor(baseMax*0.5);
	if (difficulty==="hard") return Math.floor(baseMax*2);
	return baseMax;
}
/**
 * Removes existing visualization canvas and info elements from the DOM.
 */
export function cleanupVisualization(): void{
	const existingCanvas=document.getElementById("geometry-canvas");
	if (existingCanvas) existingCanvas.remove();
	const existingInfo=document.getElementById("geometry-info");
	if (existingInfo) existingInfo.remove();
}
/**
 * Returns the display name for a given shape key.
 * @param shape - the shape key
 * @returns the human-readable shape name
 */
export function getShapeName(shape: string): string{
	const names: Record<string, string>={
		circle: "circle",
		square: "square",
		rectangle: "rectangle",
		triangle: "triangle",
		trapezoid: "trapezoid",
		parallelogram: "parallelogram",
		rhombus: "rhombus",
		ellipse: "ellipse",
		polygon: "polygon"
	};
	return names[shape]||"unknown";
}
/**
 * Returns the unit abbreviation for a measurement system.
 * @param system - the measurement system
 * @returns the unit abbreviation
 */
export function getUnit(system: string|null): string{
	if (system===null||system===undefined) return "";
	if (system==="metric") return "cm";
	if (system==="imperial") return "in";
	if (system==="meters") return "m";
	if (system==="feet") return "ft";
	return "";
}
/**
 * Rounds a number to a given number of decimal places.
 * @param value - the number to round
 * @param decimals - number of decimal places
 * @returns rounded number
 */
export function round(value: number, decimals: number): number{
	const factor=Math.pow(10, decimals);
	return Math.round(value*factor)/factor;
}
/**
 * Formats a number for display, optionally replacing pi and sqrt symbols.
 * @param value - the number or string to format
 * @returns formatted string
 */
export function formatNumber(value: number|string): string{
	if (typeof value==="string"){
		let formatted=value.replace(/pi/g, "π").replace(/sqrt/g, "√");
		return formatted;
	}
	if (Number.isInteger(value)) return value.toString();
	return value.toFixed(2).replace(/\.00$/, "");
}