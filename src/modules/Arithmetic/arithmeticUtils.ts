function getRangeForDifficulty(difficulty?: string): {min: number, max: number}{
    if (difficulty==="easy") return {min: 1, max: 50};
    if (difficulty==="hard") return {min: -1000, max: 3000};
    return {min: -1000, max: 1500};
}
export function getMaxForDifficulty(difficulty?: string, baseMax: number=10): number{
    if (difficulty==="easy") return Math.floor(baseMax*0.5);
    if (difficulty==="hard") return Math.floor(baseMax*2);
    return baseMax;
}
export function gcd(a: number, b: number): number{
    return b===0 ? Math.abs(a) : gcd(b, a % b);
}
export function isPrime(n: number): boolean{
    if (n<2) return false;
    if (n===2) return true;
    if (n%2===0) return false;
    for (let i=3; i*i<=n; i+=2){
        if (n%i===0) return false;
    }
    return true;
}
export {getRangeForDifficulty};