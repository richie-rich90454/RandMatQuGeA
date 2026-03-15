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