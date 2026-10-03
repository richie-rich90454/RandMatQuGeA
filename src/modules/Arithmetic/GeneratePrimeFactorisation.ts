/**
 * @file Prime factorisation: writing a number as a product of primes, evaluating
 * a product of prime powers, counting divisors, and totaling the exponents.
 * @description A prime factorisation is exact integer work, so nothing in this file
 * introduces a float on the way to a printed value. The exponents are read off the
 * factor list rather than tracked separately, because an exponent kept alongside
 * the factors is a second copy of the same fact and the two can drift apart.
 *
 * The factorisation branch lists its options as prime factors separated by commas
 * rather than as a product, because options are rendered as plain text: a learner
 * reading "2 x 2 x 3" has to decode a multiplication, while a learner reading
 * "2, 2, 3" can check it against the number in one pass.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{pick, randInt}from"../shared/Random";

/**
 * The prime factors of a whole number, smallest first, with each factor repeated
 * once per time it divides the number.
 *
 * @param value - A whole number greater than one.
 * @returns The prime factors, in order.
 */
function primeFactors(value: number): number[]{
    let factors:number[]=[];
    let remaining=Math.abs(value);
    for(let p=2; p*p<=remaining; p++){
        while (remaining%p===0){
            factors.push(p);
            remaining=Math.floor(remaining/p);
        }
    }
    if (remaining>1) factors.push(remaining);
    return factors;
}

/**
 * How many times each distinct prime divides a number, smallest prime first.
 *
 * @param factors - The prime factors, with repeats.
 * @returns Each distinct prime with its exponent.
 */
function exponentsOf(factors: number[]): [number, number][]{
    let counts=new Map<number, number>();
    for(let factor of factors) counts.set(factor, (counts.get(factor)??0)+1);
    let pairs:[number, number][]=[];
    for(let entry of counts) pairs.push([entry[0], entry[1]]);
    pairs.sort((a, b)=>(a[0] as number)-(b[0] as number));
    return pairs;
}

/**
 * Evaluates a product of small prime powers, which is exact for every value this
 * file produces.
 *
 * @param pairs - Each prime with its exponent.
 * @returns The value of the product.
 */
function productOf(pairs: [number, number][]): number{
    let value=1;
    for(let pair of pairs) value*=Math.pow(pair[0], pair[1]);
    return value;
}

/**
 * Moves every exponent by a whole number of places, so a distractor can be the
 * answer the same question gives when the exponents are doubled or nudged.
 *
 * @param pairs - Each prime with its exponent.
 * @param delta - How far to move each exponent. Zero leaves them alone.
 * @returns The product of the moved powers.
 */
function shiftedProduct(pairs: [number, number][], delta: number): number{
    let moved:[number, number][]=[];
    for(let pair of pairs) moved.push([pair[0], Math.max(1, pair[1]+delta)]);
    return productOf(moved);
}

export function generatePrimeFactorisation(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["factor_a_small_number","build_a_product","count_divisors","total_exponent"];
    let type=types[Math.floor(rng()*types.length)];
    let primes=difficulty==="hard"?[2, 3, 5, 7, 11]:difficulty==="easy"?[2, 3, 5]:[2, 3, 5, 7];
    let factorCount=difficulty==="hard"?randInt(rng, 4, 5):randInt(rng, 3, 4);
    // The number is built from its primes rather than drawn and then factored, so
    // the factorisation is known to hold several factors and the question never
    // collapses to a single prime with nothing to say about it.
    let chosen:number[]=[];
    for(let i=0; i<factorCount; i++) chosen.push(pick(rng, primes));
    let value=1;
    for(let prime of chosen) value*=prime;
    let factors=primeFactors(value);
    let pairs=exponentsOf(factors);
    let key="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "factor_a_small_number":{
            // Each wrong list is one real slip: a factor left out, a factor counted
            // twice, or a factor replaced by a different prime. Their products all
            // differ from the number, which is what keeps two of them from being the
            // same answer written a second way.
            key=factors.join(", ");
            latex=`Write \\( ${value} \\) as a product of primes, giving the prime factors in order.`;
            expectedFormat="Enter the prime factors separated by commas, for example 2, 2, 3";
            let dropped=factors.slice(0, factors.length-1);
            let doubled=factors.slice();
            doubled.unshift(factors[0] as number);
            let swapped=factors.slice();
            swapped[0]=(factors[0] as number)+1;
            let repeats=factors.filter(factor=>factor===factors[0]).length;
            choices=fourOptions(key, [dropped.join(", "), doubled.join(", "), swapped.join(", ")]);
            rungs=[
                "A prime factorisation lists every prime factor once per time it divides the number, so a prime that occurs three times in the number occurs three times in the answer.",
                `Divide ${value} by the smallest prime that divides it, then repeat on whatever is left.`
            ];
            steps=[
                `${value} divides by ${factors[0]} ${repeats} times before it no longer divides at all.`,
                `Carrying on with the next smallest prime leaves nothing over, which gives ${factors.join(", ")}.`,
                `So ${value} is the product of ${key}`
            ];
            break;
        }
        case "build_a_product":{
            let terms=pairs.map(pair=>Math.pow(pair[0], pair[1]));
            let sum=0;
            for(let term of terms) sum+=term;
            latex=`What is \\( ${pairs.map(pair=>`${pair[0]}^{${pair[1]}}`).join(" \\times ")} \\)?`;
            key=String(value);
            choices=numberOptions(value, [sum, shiftedProduct(pairs, 1), shiftedProduct(pairs, -1), shiftedProduct(pairs, 2)], 0);
            rungs=[
                "Each power is evaluated on its own first: adding exponents is the rule for powers of one base, not for a product of powers of different bases.",
                `Work out ${pairs.map(pair=>`${pair[0]}^{${pair[1]}}`).join(" and ")} on their own, then multiply those.`
            ];
            steps=[
                `${pairs.map(pair=>`${pair[0]}^{${pair[1]}}`).join(" = ")} gives ${terms.join(", ")}.`,
                `Multiplying them gives ${value}.`,
                `So the product is ${key}`
            ];
            break;
        }
        case "count_divisors":{
            // A divisor is chosen independently for every prime, so the count is the
            // product of one more than each exponent rather than their sum.
            let count=1;
            for(let pair of pairs) count*=pair[1]+1;
            key=String(count);
            let written=pairs.map(pair=>`${pair[0]} to the power ${pair[1]}`).join(" x ");
            latex=`How many positive divisors does \\( ${value} \\) have?`;
            let factorsAdded=factors.length+pairs.length;
            choices=numberOptions(count, [count+pairs.length, count-1, count+1, factorsAdded], 0);
            rungs=[
                "From a prime factorisation the number of positive divisors is the product of one more than each exponent, because a divisor is made by choosing an exponent for every prime independently.",
                `${value} = ${written}, so multiply one more than each of the exponents.`
            ];
            steps=[
                `${value} = ${written}.`,
                `The exponents are ${pairs.map(pair=>pair[1]).join(" and ")}, so the count is ${pairs.map(pair=>pair[1]+1).join(" x ")}.`,
                `The number of positive divisors is ${key}`
            ];
            break;
        }
        case "total_exponent":{
            let total=0;
            for(let pair of pairs) total+=pair[1];
            key=String(total);
            latex=`The prime factorisation of \\( ${value} \\) is written with exponents, in the form \\( p^{a} q^{b} \\). What is the sum of those exponents?`;
            choices=numberOptions(total, [factors.length+total, total-1, total+1, pairs.length], 0);
            rungs=[
                "The sum of the exponents is how many prime factors there are counted with repetition, which is the length of the factor list rather than the number of distinct primes.",
                `Write ${value} as a product of primes and count how many times each prime occurs.`
            ];
            steps=[
                `${value} = ${pairs.map(pair=>`${pair[0]} to the power ${pair[1]}`).join(" x ")}.`,
                `The exponents are ${pairs.map(pair=>pair[1]).join(" + ")}.`,
                `Their sum is ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:key, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
