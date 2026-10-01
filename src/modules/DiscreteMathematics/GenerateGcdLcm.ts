/**
 * @file Greatest common divisors and least common multiples.
 * @description The two are taught together because the method for one is the
 * method for the other read backwards, and because the identity
 * gcd(a, b) * lcm(a, b) = a * b makes the second derivable from the first.
 *
 * Everything here is exact integer work, so there is nothing to round and no
 * approximation can creep in. The Euclidean algorithm is the method, not a
 * shortcut: the questions are built so that the chain of remainders is short
 * enough to follow by hand at easy and medium, and long enough at hard that the
 * answer cannot be guessed from the operands.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{shuffle}from"../shared/Random";
import{gcd, lcm}from"./DiscreteUtils.js";

/**
 * The Euclidean chain for a pair, as the steps a learner would write.
 *
 * @param a - The first value.
 * @param b - The second value.
 * @returns The chain of remainders, starting with the first division.
 */
export function euclidChain(a: number, b: number): number[]{
    let chain: number[]=[];
    let x=Math.abs(a);
    let y=Math.abs(b);
    let guard=0;
    while (y!==0&&guard<64){
        chain.push(x%y);
        let t=x%y;
        x=y;
        y=t;
        guard++;
    }
    return chain;
}

/** A pair of values with a greatest common divisor that is not one of the operands. */
function drawPair(rng: RngFn, limit: number): { a: number; b: number }{
    for(let attempt=0; attempt<300; attempt++){
        let a=Math.floor(rng()*limit)+limit;
        let b=Math.floor(rng()*limit)+limit;
        // A common factor of one makes the question trivial and a pair of equal
        // values makes the least common multiple the same as either operand.
        let g=gcd(a, b);
        if (g>1&&a!==b) return {a, b};
    }
    return {a: limit*2, b: limit*3};
}

/**
 * Builds a set of four wrong numbers around an answer. A wrong multiple is as
 * useful as a wrong offset, because the most common error is to compute the
 * product rather than the least common multiple.
 */
function wrongAround(answer: number, rng: RngFn): string[]{
    let candidates=[answer+1, answer-1, answer*2, answer/2, answer+answer];
    let out:string[]=[];
    for(let value of candidates){
        let text=String(value);
        if (text===String(answer)||out.indexOf(text)>=0) continue;
        out.push(text);
        if (out.length===3) break;
    }
    return shuffle(rng, out);
}

export function generateGcdLcm(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["gcd","lcm","find_other","euclid_step","gcd_lcm_identity"];
    let type=types[Math.floor(rng()*types.length)];
    let limit=difficulty==="hard"?900:difficulty==="easy"?60:300;
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    switch(type){
        case "gcd":{
            let {a, b}=drawPair(rng, limit);
            let value=gcd(a, b);
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`Find the greatest common divisor of ${a} and ${b}.`;
            choices=[correct, ...wrongAround(value, rng)];
            break;
        }
        case "lcm":{
            let {a, b}=drawPair(rng, limit);
            let value=lcm(a, b);
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`Find the least common multiple of ${a} and ${b}.`;
            choices=[correct, ...wrongAround(value, rng)];
            break;
        }
        case "find_other":{
            // Given the greatest common divisor of a pair and one member of it,
            // find the other. The answer is recoverable only because the common
            // factor is stated, so the question is answerable rather than a guess.
            let common=Math.floor(rng()*(difficulty==="easy"?6:12))+2;
            let a=common*(Math.floor(rng()*9)+2);
            let b=common*(Math.floor(rng()*9)+2);
            if (gcd(a, b)!==common||a===b){
                b=a*2;
            }
            correct=String(b);
            alternate=correct;
            display=correct;
            latex=`The greatest common divisor of \\( ${a} \\) and \\( x \\) is \\( ${gcd(a, b)} \\), and \\( ${a} \\) is a multiple of \\( ${common} \\). What is \\( x \\)?`;
            expectedFormat="Enter a whole number";
            choices=[correct, ...wrongAround(b, rng)];
            break;
        }
        case "euclid_step":{
            // The first step of the algorithm, asked honestly: divide the larger
            // by the smaller and name the remainder. Guessing the chain here is
            // exactly what the method trains against, so the pair is drawn with a
            // common factor and the two values are printed in the order the
            // algorithm takes them.
            let a=Math.floor(rng()*limit)+limit;
            let b=Math.floor(rng()*limit)+2;
            let [larger, smaller]=a>b?[a, b]:[b, a];
            if (smaller===larger) smaller=2;
            let value=larger%smaller;
            if (value===0){
                smaller=3;
                value=larger%smaller;
            }
            correct=String(value);
            alternate=correct;
            display=`${larger} = ${Math.floor(larger/smaller)} \\times ${smaller} + ${value}`;
            latex=`The Euclidean algorithm starts by dividing the larger number by the smaller. What is the remainder when ${larger} is divided by ${smaller}?`;
            choices=[correct, ...wrongAround(value, rng)];
            break;
        }
        case "gcd_lcm_identity":{
            let {a, b}=drawPair(rng, limit);
            let value=lcm(a, b);
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`The greatest common divisor of \\( ${a} \\) and \\( ${b} \\) is \\( ${gcd(a, b)} \\). What is their least common multiple?`;
            choices=[correct, ...wrongAround(value, rng)];
            break;
        }
    }
    let unique=[...new Set(choices)];
    if (unique.length>4) unique=unique.slice(0, 4);
    if (!unique.includes(correct)){
        if (unique.length>0) unique[Math.floor(rng()*unique.length)]=correct;
        else unique=[correct];
    }
    return {latex, correct, alternate, display, choices: unique, expectedFormat};
}