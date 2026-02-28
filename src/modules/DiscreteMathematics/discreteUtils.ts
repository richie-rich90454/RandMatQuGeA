export function factorial(n: number): number{
    if (n<0) return NaN;
    let res=1;
    for (let i=2; i<=n; i++) res *= i;
    return res;
}
export function nPr(n: number, r: number): number{
    return r>n?0:factorial(n)/factorial(n-r);
}
export function nCr(n: number, r: number): number{
    return r>n?0:factorial(n)/(factorial(r)*factorial(n-r));
}
export function getMaxN(difficulty?: string): number{
    if (difficulty==="easy") return 6;
    if (difficulty==="hard") return 12;
    return 8;
}
export function getDataRange(difficulty?: string): {min: number, max: number, count: number}{
    if (difficulty==="easy") return {min: 1, max: 20, count: 5};
    if (difficulty==="hard") return {min: -50, max: 100, count: 15};
    return {min: 0, max: 50, count: 10};
}
export function mean(arr: number[]): number{
    return arr.reduce((a,b)=>a+b,0)/arr.length;
}
export function median(arr: number[]): number{
    let sorted=[...arr].sort((a,b)=>a-b);
    let mid=Math.floor(sorted.length/2);
    if (sorted.length%2===0) return (sorted[mid-1]+sorted[mid])/2;
    return sorted[mid];
}
export function mode(arr: number[]): number[]{
    let freq: Record<number,number>={};
    arr.forEach(v=>freq[v]=(freq[v]||0)+1);
    let maxFreq=Math.max(...Object.values(freq));
    return Object.keys(freq).filter(k=>freq[parseInt(k)]===maxFreq).map(Number);
}
export function range(arr: number[]): number{
    return Math.max(...arr)-Math.min(...arr);
}
export function stdDev(arr: number[]): number{
    let m=mean(arr);
    let sqDiff=arr.map(v=>Math.pow(v-m,2));
    return Math.sqrt(mean(sqDiff));
}
export function getOrdinal(n: number): string{
    let s=["th", "st", "nd", "rd"];
    let v=n%100;
    return s[(v-20)%10]||s[v]||s[0];
}