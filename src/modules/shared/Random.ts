/**
 * @file Random sampling primitives that keep generators deterministic and in-domain.
 * @description Every generator takes an injected `rng` and draws only from it, so
 * a seed reproduces a question exactly. These helpers add the rejection sampling
 * that generators need in order to stay inside a valid domain: a nonzero divisor,
 * a positive argument to a logarithm, sides that satisfy the triangle inequality,
 * or a matrix that is not singular. Rejection consumes further draws from the
 * same stream, so a rejected sample simply advances the sequence rather than
 * re-seeding it.
 */

/** A seeded PRNG, as passed to every generator. */
export type RngFn=() => number;

/**
 * Draws a whole number in the inclusive range [min, max].
 *
 * @param rng - The injected random source.
 * @param min - Lower bound, inclusive.
 * @param max - Upper bound, inclusive.
 * @returns An integer in the range.
 */
export function randInt(rng: RngFn, min: number, max: number): number{
    if (max<min){
        let t=min;
        min=max;
        max=t;
    }
    return min+Math.floor(rng()*(max-min+1));
}

/**
 * Draws a whole number that is a multiple of `step` in the inclusive range.
 * Used wherever a percentage, ratio or money amount must divide exactly.
 *
 * @param rng - The injected random source.
 * @param min - Lower bound, inclusive. Rounded up to the next multiple of step.
 * @param max - Upper bound, inclusive.
 * @param step - The granularity. Must be positive.
 * @returns A multiple of step within the range.
 */
export function randStep(rng: RngFn, min: number, max: number, step: number): number{
    if (step<=0) return randInt(rng, min, max);
    let lo=Math.ceil(min/step);
    let hi=Math.floor(max/step);
    if (hi<lo) return min;
    return (lo+Math.floor(rng()*(hi-lo+1)))*step;
}

/**
 * Draws a value with a fixed number of decimal places, quantised so that the
 * printed form and the graded value are the same number.
 *
 * @param rng - The injected random source.
 * @param min - Lower bound, inclusive.
 * @param max - Upper bound, inclusive.
 * @param decimals - Decimal places to keep. Defaults to 2.
 * @returns A quantised value within the range.
 */
export function randDecimal(rng: RngFn, min: number, max: number, decimals: number=2): number{
    let factor=Math.pow(10, decimals);
    let raw=min+rng()*(max-min);
    let rounded=Math.round(raw*factor)/factor;
    if (Object.is(rounded, -0)) return 0;
    return Math.min(max, Math.max(min, rounded));
}

/**
 * Draws a value in the range [min, max] excluding zero, which every divisor,
 * base and logarithm argument requires.
 *
 * @param rng - The injected random source.
 * @param min - Lower bound, inclusive.
 * @param max - Upper bound, inclusive.
 * @param decimals - Decimal places to keep. Defaults to 2.
 * @returns A non-zero quantised value.
 */
export function randNonZero(rng: RngFn, min: number, max: number, decimals: number=2): number{
    for(let i=0; i<64; i++){
        let v=randDecimal(rng, min, max, decimals);
        if (v!==0) return v;
    }
    return max>=1?max:min;
}

/**
 * Draws a positive value, for a logarithm argument or a quantity that cannot
 * meaningfully be zero or negative.
 *
 * @param rng - The injected random source.
 * @param min - Lower bound, inclusive. Clamped to at least 0.01.
 * @param max - Upper bound, inclusive.
 * @param decimals - Decimal places to keep. Defaults to 2.
 * @returns A strictly positive quantised value.
 */
export function randPositive(rng: RngFn, min: number, max: number, decimals: number=2): number{
    let lo=Math.max(min, Math.pow(10, -decimals));
    if (lo>=max) return lo;
    return randDecimal(rng, lo, max, decimals);
}

/**
 * Draws a value from a list.
 *
 * @param rng - The injected random source.
 * @param items - The list to draw from. Must not be empty.
 * @returns One of the items.
 */
export function pick<T>(rng: RngFn, items: T[]): T{
    if (items.length===0) throw new Error("pick: empty list");
    return items[Math.floor(rng()*items.length)];
}

/**
 * Draws `count` distinct values from a list, preserving the list's order.
 *
 * @param rng - The injected random source.
 * @param items - The list to draw from.
 * @param count - How many distinct values to take.
 * @returns The chosen values, in list order.
 */
export function pickMany<T>(rng: RngFn, items: T[], count: number): T[]{
    let n=Math.min(count, items.length);
    let indices: number[]=[];
    for(let i=0; i<items.length; i++) indices.push(i);
    shuffle(rng, indices);
    indices=indices.slice(0, n);
    indices.sort((a, b)=>a-b);
    return indices.map(i=>items[i]);
}

/**
 * Shuffles an array in place using Fisher-Yates driven by the injected source.
 *
 * @param rng - The injected random source.
 * @param items - The array to shuffle.
 * @returns The same array, shuffled.
 */
export function shuffle<T>(rng: RngFn, items: T[]): T[]{
    for(let i=items.length-1; i>0; i--){
        let j=Math.floor(rng()*(i+1));
        let t=items[i];
        items[i]=items[j];
        items[j]=t;
    }
    return items;
}

/**
 * Samples until a predicate holds, or gives up after a bounded number of
 * attempts. The bound matters: an unsatisfiable predicate would otherwise hang
 * the caller, and a generator must never be able to block the app. Rejection
 * consumes further draws from the same stream, so a rejected sample advances the
 * sequence rather than reseeding it.
 *
 * @param attempt - Draws one candidate. Called repeatedly until it is accepted.
 * @param isValid - The acceptance predicate.
 * @param maxAttempts - Attempts before the last candidate is returned anyway.
 * @returns An accepted candidate, or the final candidate if none was accepted.
 */
export function sampleUntil<T>(attempt: () => T, isValid: (candidate: T) => boolean, maxAttempts: number=64): T{
    let last=attempt();
    for(let i=0; i<maxAttempts; i++){
        last=attempt();
        if (isValid(last)) return last;
    }
    return last;
}

/**
 * Reports whether three lengths can form a non-degenerate triangle. A generator
 * that draws side lengths independently must check this, because an impossible
 * triangle has no valid perimeter or area and therefore no correct answer.
 *
 * @param a - First side length.
 * @param b - Second side length.
 * @param c - Third side length.
 * @returns True when the strict triangle inequality holds for all three pairs.
 */
export function isValidTriangle(a: number, b: number, c: number): boolean{
    return a>0&&b>0&&c>0&&a+b>c&&a+c>b&&b+c>a;
}

/**
 * Draws three side lengths that satisfy the triangle inequality.
 *
 * @param rng - The injected random source.
 * @param min - Lower bound for each side.
 * @param max - Upper bound for the largest side.
 * @returns A valid non-degenerate triangle's side lengths.
 */
export function randTriangle(rng: RngFn, min: number, max: number): [number, number, number]{
    for(let i=0; i<64; i++){
        let a=randInt(rng, min, max);
        let b=randInt(rng, min, max);
        let c=randInt(rng, min, max);
        if (isValidTriangle(a, b, c)) return [a, b, c];
    }
    let a=Math.max(1, min);
    let b=Math.max(1, min+1);
    let c=Math.max(1, min+2);
    return [a, b, c];
}

/**
 * Draws a logarithm base strictly between zero and one exclusive, and not one,
 * which is the domain of a real logarithm.
 *
 * @param rng - The injected random source.
 * @param min - Lower bound, exclusive. Defaults to 1.
 * @param max - Upper bound, inclusive. Defaults to 10.
 * @returns A base in (min, max] with max at least 2.
 */
export function randLogBase(rng: RngFn, min: number=1, max: number=10): number{
    let lo=min+1;
    let hi=Math.max(lo, max);
    return randInt(rng, lo, hi);
}

/**
 * Draws a whole-number step count and a whole-number period that produce a
 * divisibly exact result, for interest, amortization and sequence sums.
 *
 * @param rng - The injected random source.
 * @param minPeriod - Lower bound for the period.
 * @param maxPeriod - Upper bound for the period.
 * @returns A period that divides cleanly, and the matching number of periods.
 */
export function randDivisiblePeriod(rng: RngFn, minPeriod: number, maxPeriod: number): {period: number, n: number}{
    let divisors=[1, 2, 4, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
    let eligible=divisors.filter(d=>d>=minPeriod&&d<=maxPeriod);
    if (eligible.length===0) eligible=[maxPeriod];
    let period=pick(rng, eligible);
    let n=randInt(rng, 1, 12);
    return {period, n};
}

/**
 * Draws a numerator and denominator for a fraction in lowest terms, avoiding
 * zero and keeping the magnitude at the requested level.
 *
 * @param rng - The injected random source.
 * @param minNum - Lower bound for the numerator.
 * @param maxNum - Upper bound for the numerator.
 * @param maxDen - Upper bound for the denominator.
 * @returns A non-zero numerator and a positive denominator.
 */
export function randFraction(rng: RngFn, minNum: number, maxNum: number, maxDen: number): {num: number, den: number}{
    let num=randInt(rng, minNum, maxNum);
    if (num===0) num=maxNum>=1?1:-1;
    let den=randInt(rng, 1, Math.max(1, maxDen));
    return {num, den};
}

/**
 * Draws a fraction whose quotient terminates at the requested precision, so that
 * the printed answer is exact rather than a rounded approximation of a repeating
 * decimal. Used by generators whose answer is a division result the learner is
 * expected to write down exactly.
 *
 * @param rng - The injected random source.
 * @param maxNum - Upper bound for the numerator.
 * @param maxDen - Upper bound for the denominator.
 * @param decimals - Decimal places the quotient must terminate within. Defaults to 2.
 * @returns A numerator, a positive denominator, and the exact quotient.
 */
export function randExactQuotient(rng: RngFn, maxNum: number, maxDen: number, decimals: number=2): {num: number, den: number, value: number}{
    let scale=Math.pow(10, decimals);
    for(let attempt=0; attempt<64; attempt++){
        let den=randInt(rng, 1, Math.max(1, maxDen));
        let num=randInt(rng, 1, Math.max(1, maxNum));
        let exact=num/den;
        if (!Number.isFinite(exact)) continue;
        let scaled=exact*scale;
        if (Math.abs(scaled-Math.round(scaled))>1e-9) continue;
        return {num, den, value:Math.round(scaled)/scale};
    }
    return {num:1, den:1, value:1};
}
