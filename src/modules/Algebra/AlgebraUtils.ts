export function factorial(n: number): number{
    if (n<0) return NaN;
    let res=1;
    for (let i=2; i<=n; i++) res *= i;
    return res;
}
export function gcd(a: number, b: number): number{
    return b===0 ? Math.abs(a) : gcd(b, a % b);
}
export function getOrdinal(n: number): string{
    let s=["th", "st", "nd", "rd"];
    let v=n%100;
    return s[(v-20)%10]||s[v]||s[0];
}
export function getMaxForDifficulty(difficulty?: string, baseMax: number=10): number{
    if (difficulty==="easy") return Math.floor(baseMax*0.5);
    if (difficulty==="hard") return Math.floor(baseMax*2);
    return baseMax;
}