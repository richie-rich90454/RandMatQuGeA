export function getMaxForDifficulty(difficulty?: string, baseMax: number=10): number{
    if(difficulty==="easy") return Math.floor(baseMax*0.5);
    if(difficulty==="hard") return Math.floor(baseMax*2);
    return baseMax;
}
export function cleanupVisualization(): void{
    const existingCanvas=document.getElementById("geometry-canvas");
    if(existingCanvas) existingCanvas.remove();
    const existingInfo=document.getElementById("geometry-info");
    if(existingInfo) existingInfo.remove();
}