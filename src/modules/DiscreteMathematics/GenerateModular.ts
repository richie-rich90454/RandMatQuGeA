/**
 * @file Modular arithmetic and congruences.
 * @description Modular arithmetic is where divisibility becomes arithmetic you can
 * do, so the topic is built around the equivalence relation rather than around
 * tricks: two integers are congruent when their difference is a multiple of the
 * modulus, and everything else follows from that one definition.
 *
 * The questions are exact. A residue class is always reduced to the canonical
 * representative, so "the remainder" and "the residue" are the same number here,
 * and a question about a last digit is a congruence question with a modulus of
 * ten rather than a different kind of question.
 *
 * The errors this topic trains against are named rather than avoided: reducing
 * before multiplying, forgetting that the modulus must divide both, and treating a
 * residue class as if it had only one member. The distractors are built to be the
 * answers those mistakes produce.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{shuffle}from"../shared/Random";

/**
 * The least non-negative residue of a value.
 *
 * @param value - The value, possibly negative.
 * @param modulus - The modulus, which must be positive.
 * @returns The residue in zero to modulus minus one.
 */
export function residue(value: number, modulus: number): number{
    let r=value%modulus;
    return r<0?r+modulus:r;
}

/**
 * The multiplicative order of a value modulo a modulus, which is the smallest
 * positive k with a power congruent to one. Returns zero when there is none, which
 * is the case whenever the value and the modulus are not coprime.
 *
 * @param value - The base.
 * @param modulus - The modulus.
 * @returns The order, or zero when the value is not invertible.
 */
export function multiplicativeOrder(value: number, modulus: number): number{
    if (gcd(value, modulus)!==1) return 0;
    let current=1;
    for(let k=1; k<=modulus; k++){
        current=residue(current*value, modulus);
        if (current===1) return k;
    }
    return 0;
}

/** The greatest common divisor, by the Euclidean algorithm. */
function gcd(a: number, b: number): number{
    let x=Math.abs(a);
    let y=Math.abs(b);
    while (y!==0){
        let t=x%y;
        x=y;
        y=t;
    }
    return x;
}

/**
 * The last digit of a power, which is the congruence question a learner already
 * knows how to ask.
 *
 * @param base - The base.
 * @param exponent - The exponent.
 * @returns The last digit.
 */
export function lastDigitOfPower(base: number, exponent: number): number{
    return residue(base, 10)===0?0:residue(Math.pow(base, exponent), 10);
}

/**
 * Builds four options around a residue, including the answers that come from the
 * named mistakes: reducing after multiplying, and reducing only one term.
 *
 * @param answer - The correct residue.
 * @param modulus - The modulus in force.
 * @param rng - The injected random source.
 * @returns Three wrong options.
 */
function residueDistractors(answer: number, modulus: number, rng: RngFn): string[]{
    let candidates=[
        answer+modulus,
        answer-modulus,
        residue(answer*2, modulus),
        residue(answer+1, modulus),
        residue(answer-2, modulus),
        residue(Math.abs(answer-modulus), modulus)
    ];
    let out:string[]=[];
    for(let value of candidates){
        let text=String(value);
        if (text===String(answer)||value<0||out.indexOf(text)>=0) continue;
        out.push(text);
        if (out.length===3) break;
    }
    return shuffle(rng, out);
}

export function generateModular(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["remainder","solve_congruence","last_digit","congruence_class","divisible_by"];
    let type=types[Math.floor(rng()*types.length)];
    let moduli=difficulty==="easy"?[3,4,5,7,10]:difficulty==="hard"?[7,9,11,13,17,12]:[5,7,9,10,11,12];
    let modulus=moduli[Math.floor(rng()*moduli.length)];
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    switch(type){
        case "remainder":{
            let value=Math.floor(rng()*modulus*20)-modulus*5;
            let answer=residue(value, modulus);
            correct=String(answer);
            alternate=correct;
            display=`${value} = ${Math.floor((value-answer)/modulus)} \\times ${modulus} + ${answer}`;
            latex=`Find the least non-negative residue of $${value}$ modulo $${modulus}$.`;
            choices=[correct, ...residueDistractors(answer, modulus, rng)];
            break;
        }
        case "solve_congruence":{
            // The multiplier is coprime to the modulus by construction, so a
            // solution always exists and the answer is unique in the residue
            // class, which is what makes "find x" answerable rather than
            // underdetermined.
            let coefficient=1;
            for(let attempt=0; attempt<40; attempt++){
                let candidate=Math.floor(rng()*(modulus-1))+1;
                if (gcd(candidate, modulus)===1){
                    coefficient=candidate;
                    break;
                }
            }
            let target=Math.floor(rng()*modulus);
            let answer=residue(modularInverse(coefficient, modulus)*target, modulus);
            correct=String(answer);
            alternate=correct;
            display=correct;
            latex=`Solve for the least non-negative value of $x$: $${coefficient}x \\equiv ${target} \\pmod{${modulus}}$.`;
            choices=[correct, ...residueDistractors(answer, modulus, rng)];
            break;
        }
        case "last_digit":{
            let base=Math.floor(rng()*99)+2;
            let exponent=Math.floor(rng()*40)+2;
            let answer=lastDigitOfPower(base, exponent);
            correct=String(answer);
            alternate=correct;
            display=correct;
            latex=`What is the last digit of $${base}^{${exponent}}$?`;
            expectedFormat="Enter a digit from 0 to 9";
            choices=shuffle(rng, [answer, (answer+1)%10, (answer+5)%10, (answer+9)%10].map(String));
            break;
        }
        case "congruence_class":{
            // Which single value satisfies a stated congruence. Every option is a
            // different residue class, so exactly one can be right. The redraw is
            // bounded because a small modulus has fewer distinct residue classes
            // than the four options asked for, and a set that cannot grow must not
            // be asked to.
            let a=Math.floor(rng()*modulus*8);
            let answer=residue(a, modulus);
            correct=String(answer);
            alternate=correct;
            display=correct;
            latex=`Which of these is congruent to $${a}$ modulo $${modulus}$?`;
            let options=new Set<string>([correct]);
            options.add(String(residue(answer+modulus, modulus)));
            options.add(String(residue(answer-modulus, modulus)));
            let attempts=0;
            while (options.size<4&&attempts<40){
                options.add(String(Math.floor(rng()*modulus)));
                attempts++;
            }
            choices=shuffle(rng, [...options]);
            break;
        }
        case "divisible_by":{
            let divisor=[2,3,4,5,6,9,10,11][Math.floor(rng()*8)];
            let k=Math.floor(rng()*60)+2;
            let value=divisor*k;
            correct=String(k);
            alternate=correct;
            display=`${value} = ${k} \\times ${divisor}`;
            latex=`What is the largest whole number $k$ for which $${divisor}k = ${value}$?`;
            choices=shuffle(rng, [k, divisor*k, k+divisor, k-1].map(String).filter((v, i, a)=>v!==String(k)&&a.indexOf(v)===i));
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

/**
 * The multiplicative inverse of a value modulo a modulus, found by search. The
 * range is the modulus, so this is exact and does not depend on a floating-point
 * extended Euclidean algorithm being available.
 *
 * @param value - The value, which must be coprime to the modulus.
 * @param modulus - The modulus.
 * @returns The inverse, or zero when there is none.
 */
function modularInverse(value: number, modulus: number): number{
    for(let candidate=1; candidate<modulus; candidate++){
        if (residue(value*candidate, modulus)===1) return candidate;
    }
    return 0;
}