/**
 * @file The fundamental counting principles.
 * @description The permutations and combinations topic evaluates P(n, r) and
 * C(n, r) once the numbers have been handed over. This file is about the
 * decisions that come first: how many independent choices a problem actually
 * has (multiply), whether two cases can overlap (add), and what a restriction
 * does to a count that would otherwise be unrestricted.
 *
 * Every answer here is an exact integer. The counting rules are exact, so a
 * rounded count is not a count at all and nothing in this file introduces a
 * float on the way to a printed value. Each restriction is stated in the prompt
 * rather than assumed, because "in how many ways" with an unstated restriction
 * is two different questions with one answer printed under them.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{shuffle, randInt}from"../shared/Random";
import{factorial, nCr}from"./DiscreteUtils.js";

/**
 * Builds three wrong whole numbers around an answer.
 *
 * The candidates are the answers the named mistakes produce, and any that
 * coincide with the answer or with each other are dropped. The offset fallback
 * is what guarantees three: the candidate pool collapses at small values, where
 * two different mistakes produce the same wrong number, and a question offering
 * fewer than three real alternatives is not a usable multiple-choice question.
 * The loop is bounded, so an exhausted pool cannot spin.
 *
 * @param answer - The correct count.
 * @param candidates - The counts the named mistakes produce.
 * @returns Three distinct wrong options.
 */
function wrongIntegers(answer: number, candidates: number[]): string[]{
    let out:string[]=[];
    let seen=new Set<number>([answer]);
    for(let value of candidates){
        if (out.length===3) break;
        if (!Number.isInteger(value)||seen.has(value)) continue;
        seen.add(value);
        out.push(String(value));
    }
    for(let offset=1; out.length<3&&offset<=8; offset++){
        for(let value of [answer+offset, answer-offset]){
            if (out.length===3) break;
            if (!Number.isInteger(value)||seen.has(value)) continue;
            seen.add(value);
            out.push(String(value));
        }
    }
    return out;
}

/**
 * The multiplicities of the repeated letters in a word, ascending. The answer to
 * an arrangement-with-repeats question divides by exactly these factorials, so
 * they are read off the word rather than tracked separately, where the two can
 * drift apart.
 *
 * @param word - The word, uppercase.
 * @returns One entry per letter that appears more than once.
 */
function repeatCounts(word: string): number[]{
    let counts=new Map<string, number>();
    for(let letter of word){
        counts.set(letter, (counts.get(letter)??0)+1);
    }
    let values:number[]=[];
    for(let count of counts.values()){
        if (count>1) values.push(count);
    }
    values.sort((a, b)=>a-b);
    return values;
}

export function generateCountingPrinciples(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["multiplication_rule","addition_rule","permutation_restriction","combination_restriction","arrangement_repeats","shared_property"];
    let type=types[Math.floor(rng()*types.length)];
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    switch(type){
        case "multiplication_rule":{
            // A choice made independently at each of several stages multiplies,
            // which is the rule that is most often asserted and least often
            // shown to hold. The distractor is the addition rule, because that is
            // the rule a learner reaches for first.
            let questions=randInt(rng, 2, difficulty==="easy"?3:difficulty==="hard"?6:4);
            let options=randInt(rng, difficulty==="easy"?3:4, difficulty==="hard"?8:6);
            let trueFalse=randInt(rng, 1, difficulty==="hard"?4:3);
            let multipleChoiceWays=Math.pow(options, questions);
            let trueFalseWays=Math.pow(2, trueFalse);
            let value=multipleChoiceWays*trueFalseWays;
            correct=String(value);
            alternate=correct;
            display=`${multipleChoiceWays} \\times ${trueFalseWays}`;
            latex=`A test has \\( ${questions} \\) multiple-choice questions, each with \\( ${options} \\) possible answers, and \\( ${trueFalse} \\) true-or-false questions. How many different answer sheets can be produced?`;
            choices=[correct, ...shuffle(rng, wrongIntegers(value, [
                multipleChoiceWays+trueFalseWays,
                Math.pow(options, questions-1)*trueFalseWays,
                Math.pow(options, questions+1)*trueFalseWays,
                multipleChoiceWays
            ]))];
            break;
        }
        case "addition_rule":{
            // Two different code lengths make the two families disjoint by
            // construction, which is what licenses adding them: no code can belong
            // to both, so there is nothing to subtract back out.
            let firstBase=difficulty==="easy"?2:difficulty==="hard"?4:3;
            let secondBase=difficulty==="hard"?3:2;
            let firstLength=difficulty==="hard"?4:3;
            let secondLength=firstLength+1;
            let first=Math.pow(firstBase, firstLength);
            let second=Math.pow(secondBase, secondLength);
            let value=first+second;
            correct=String(value);
            alternate=correct;
            display=`${first} + ${second}`;
            latex=`A lock accepts either a \\( ${firstLength} \\)-digit code whose digits are each drawn from 1 to \\( ${firstBase} \\), or a \\( ${secondLength} \\)-digit code whose digits are each drawn from 1 to \\( ${secondBase} \\). How many codes does it accept?`;
            choices=[correct, ...shuffle(rng, wrongIntegers(value, [
                first*second,
                Math.abs(first-second),
                Math.max(first, second),
                first*second*2
            ]))];
            break;
        }
        case "permutation_restriction":{
            // The three restrictions are the ones a permutation question is
            // actually about. "Next to each other" becomes one block, "not next
            // to each other" is its complement, and a stated order between two
            // of them halves the total.
            let n=randInt(rng, 5, difficulty==="easy"?6:difficulty==="hard"?10:8);
            let flavour=Math.floor(rng()*3);
            let value=0;
            let candidates:number[]=[];
            if (flavour===0){
                value=factorial(n-1);
                display=`${n-1}! = ${value}`;
                latex=`In how many ways can ${n} distinct books stand on a shelf if two particular books must stand next to each other?`;
                candidates=[factorial(n), 2*factorial(n-1), factorial(n-2), factorial(n)/2];
            }
            else if (flavour===1){
                value=factorial(n)-2*factorial(n-1);
                display=`${n}! - 2 \\times ${n-1}! = ${value}`;
                latex=`In how many ways can ${n} distinct books stand on a shelf if two particular books must not stand next to each other?`;
                candidates=[factorial(n), factorial(n-1), 2*factorial(n-1), factorial(n-2), (n-2)*factorial(n-1)];
            }
            else{
                value=factorial(n)/2;
                display=`\\frac{${n}!}{2} = ${value}`;
                latex=`In how many ways can ${n} distinct runners be ranked from first place to last, given that Alice finished ahead of Ben?`;
                candidates=[factorial(n), factorial(n-1), 2*factorial(n-1), factorial(n-2), (n-2)*factorial(n-1)];
            }
            correct=String(value);
            alternate=correct;
            choices=[correct, ...shuffle(rng, wrongIntegers(value, candidates))];
            break;
        }
        case "combination_restriction":{
            // "Must include" and "must exclude" are the same counting problem
            // read from either side of the named person, and each one's classic
            // mistake is the other's answer.
            let n=randInt(rng, 6, difficulty==="easy"?8:difficulty==="hard"?10:9);
            let r=randInt(rng, 2, n-3);
            let included=rng()<0.5;
            let value=included?nCr(n-1, r-1):nCr(n-1, r);
            correct=String(value);
            alternate=correct;
            display=included?`\\binom{${n-1}}{${r-1}} = ${value}`:`\\binom{${n-1}}{${r}} = ${value}`;
            latex=`From a group of ${n} people, in how many ways can a committee of ${r} be chosen ${included?"that includes Alice":"that excludes Alice"}?`;
            let candidates=included?
                [nCr(n, r), nCr(n-1, r), nCr(n-2, r-1), nCr(n, r-1), nCr(n-2, r-2)]:
                [nCr(n, r), nCr(n-1, r-1), nCr(n-2, r), nCr(n, r-1), nCr(n-2, r+1)];
            choices=[correct, ...shuffle(rng, wrongIntegers(value, candidates))];
            break;
        }
        case "arrangement_repeats":{
            // The multinomial coefficient, divided by the factorial of each
            // repeated letter. The words are grouped by length so that difficulty
            // changes the size of the factorial and not only which word is used.
            let words=difficulty==="easy"?["BANANA","TOMATO"]:difficulty==="hard"?["MISSISSIPPI","PARALLEL","ASSESSMENT","PROCEDURES"]:["BALLOON","SUCCESS","COFFEE","TENNIS"];
            let word=words[Math.floor(rng()*words.length)];
            let counts=repeatCounts(word);
            let denominator=1;
            for(let count of counts){
                denominator*=factorial(count);
            }
            let value=factorial(word.length)/denominator;
            correct=String(value);
            alternate=correct;
            display=`\\frac{${word.length}!}{${counts.map(c=>c+"!").join("\\times")}} = ${value}`;
            latex=`How many distinct arrangements are there of the ${word.length} letters of the word ${word}?`;
            let firstShare=factorial(counts[0]);
            let secondShare=counts.length>1?factorial(counts[1]):1;
            choices=[correct, ...shuffle(rng, wrongIntegers(value, [
                factorial(word.length),
                factorial(word.length)/firstShare,
                factorial(word.length)/(firstShare*secondShare),
                factorial(word.length-1)
            ]))];
            break;
        }
        case "shared_property":{
            // The birthday count. "At least two share" is the complement of
            // "all distinct", and the all-distinct count is a falling product
            // rather than a power, which is the whole difficulty of the question.
            let n=randInt(rng, 3, difficulty==="easy"?5:difficulty==="hard"?8:7);
            let k=randInt(rng, 5, difficulty==="easy"?9:difficulty==="hard"?16:12);
            let all=Math.pow(k, n);
            let distinct=1;
            for(let i=0; i<n; i++) distinct*=(k-i);
            let value=all-distinct;
            correct=String(value);
            alternate=correct;
            display=`${k}^{${n}} - ${k}\\times${k-1}\\times\\cdots\\times${k-n+1} = ${value}`;
            latex=rng()<0.5?
                `In how many ways can ${n} birthdays fall on ${k} distinct dates in a year, if at least two of the people share a date?`:
                `In how many ways can ${n} people be assigned to ${k} distinct days, so that at least two of them are assigned to the same day?`;
            choices=[correct, ...shuffle(rng, wrongIntegers(value, [
                all,
                distinct,
                nCr(k, 2)*Math.pow(2, n-2),
                nCr(n, 2)*Math.pow(k, n-2)
            ]))];
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
