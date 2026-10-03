/**
 * @file Divisibility, factors and divisors.
 * @description Everything here has an exact answer, which is the point of the
 * topic: the numbers are small, the reasoning is finite, and a learner can check
 * the result by counting. Nothing is rounded and nothing is approximated.
 *
 * The rules of divisibility are asked as recognition rather than as a list to
 * memorize, because "which of these is divisible by 9" is a question with a
 * defensible wrong answer and "state the rule" is not. The divisor-count and
 * sum-of-divisors work is done from the prime factorisation, which is the only way
 * it should be done at any level, and the digit questions are asked so that the
 * answer requires the property rather than a coin toss.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{shuffle}from"../shared/Random";
import{fourOptions}from"../shared/Options.js";

/** A divisibility rule, with the digit sum it depends on. */
interface DivisibilityRule{
    /** The divisor being tested. */
    divisor: number;
    /** The name of the test. */
    name: string;
    /** The rule in the learner's own terms. */
    rule: string;
    /** Whether a number passes this rule, which is what the question asks. */
    test: (n: number)=>boolean;
}

/**
 * The rules, in the order they are usually taught. Only the digit-sum rules are
 * here because the others (four and twenty-five, eleven, eight) are not simply
 * "add the digits", and a rule that does not generalise is better left to the
 * direct trial a learner can actually perform.
 */
const RULES: DivisibilityRule[]=[
    {divisor: 2, name:"two", rule:"the last digit is even", test:n=>n%2===0},
    {divisor: 3, name:"three", rule:"the digit sum is divisible by three", test:n=>digitSum(n)%3===0},
    {divisor: 4, name:"four", rule:"the last two digits are divisible by four", test:n=>n%4===0},
    {divisor: 5, name:"five", rule:"the last digit is zero or five", test:n=>n%5===0},
    {divisor: 6, name:"six", rule:"it is divisible by both two and three", test:n=>n%6===0},
    {divisor: 9, name:"nine", rule:"the digit sum is divisible by nine", test:n=>digitSum(n)%9===0},
    {divisor: 10, name:"ten", rule:"the last digit is zero", test:n=>n%10===0},
    {divisor: 11, name:"eleven", rule:"the alternating digit sum is a multiple of eleven", test:n=>alternatingSum(n)%11===0}
];

/** The sum of a number's digits. */
function digitSum(n: number): number{
    let total=0;
    let value=Math.abs(n);
    while (value>0){
        total+=value%10;
        value=Math.floor(value/10);
    }
    return total;
}

/** The alternating digit sum, which is the test for eleven. */
function alternatingSum(n: number): number{
    let total=0;
    let value=Math.abs(n);
    let place=0;
    while (value>0){
        total+=place%2===0?value%10:-(value%10);
        value=Math.floor(value/10);
        place++;
    }
    return total;
}

/** The prime factorisation of a positive integer, smallest factor first. */
export function factorize(n: number): number[]{
    let factors: number[]=[];
    let value=Math.abs(n);
    for(let p=2; p*p<=value; p++){
        while (value%p===0){
            factors.push(p);
            value/=p;
        }
    }
    if (value>1) factors.push(value);
    return factors;
}

/** The number of positive divisors of a positive integer. */
export function divisorCount(n: number): number{
    let factors=factorize(n);
    let counts=new Map<number, number>();
    for(let f of factors){
        counts.set(f, (counts.get(f)??0)+1);
    }
    let total=1;
    for(let exponent of counts.values()){
        total*=exponent+1;
    }
    return total;
}

/** The sum of the positive divisors of a positive integer. */
export function divisorSum(n: number): number{
    let factors=factorize(n);
    let counts=new Map<number, number>();
    for(let f of factors){
        counts.set(f, (counts.get(f)??0)+1);
    }
    let total=1;
    for(let [prime, exponent] of counts){
        // The geometric sum 1 + p + ... + p^n, accumulated by repeated addition
        // so it stays an exact integer. The closed form divides, and a power of
        // three divided by two is not an integer, which is how this goes wrong.
        let term=1;
        let sum=1;
        for(let i=0; i<exponent; i++){
            term*=prime;
            sum+=term;
        }
        total*=sum;
    }
    return total;
}

/** A positive integer with a handful of factors, drawn from a bounded range. */
function drawComposite(rng: RngFn, min: number, max: number): number{
    for(let attempt=0; attempt<200; attempt++){
        let n=Math.floor(rng()*(max-min+1))+min;
        if (divisorCount(n)>2) return n;
    }
    return min*min;
}

export function generateDivisibility(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["is_divisible","which_divisible","how_many_divisible","divisor_count","remainder"];
    let type=types[Math.floor(rng()*types.length)];
    let size=difficulty==="hard"?999999:difficulty==="easy"?999:99999;
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a whole number";
    let choices:string[]=[];
    switch(type){
        case "is_divisible":{
            // "Is this divisible by n?" is a yes/no question, and a yes/no question
            // has no honest third option: the only way to offer four is to pad with
            // "maybe" and "always", which teaches a learner to pick the option that
            // looks like an answer. The rule is therefore asked as a selection
            // instead: a multiple of the rule's divisor and the three numbers either
            // side of it. The three offsets are smaller than the divisor, so none of
            // them can be a multiple, which makes exactly one option correct by
            // construction rather than by luck. The numbers are printed, because in
            // free-response mode the learner has to see what they are choosing
            // between.
            let rule=RULES.filter(r=>r.divisor>=4)[Math.floor(rng()*6)];
            let multiple=rule.divisor*(Math.floor(rng()*Math.floor(size/rule.divisor))+1);
            let offered=[multiple-1, multiple, multiple+1, multiple+2];
            correct=String(multiple);
            alternate=correct;
            display=correct;
            latex=`Which of these is divisible by ${rule.divisor}? ${offered.join(", ")}.`;
            expectedFormat="Enter the number";
            choices=shuffle(rng, offered.map(String));
            break;
        }
        case "which_divisible":{
            let divisor=[2,3,4,5,6,9,11][Math.floor(rng()*7)];
            // The pool is built as one multiple and several guaranteed
            // non-multiples, so the question has exactly one answer rather than
            // being a hunt through numbers that might all work.
            let multiple=divisor*(Math.floor(rng()*9)+2);
            let options=[multiple];
            for(let attempt=0; options.length<4&&attempt<80; attempt++){
                let candidate=Math.floor(rng()*(divisor*40))+1;
                if (candidate%divisor===0) continue;
                if (options.indexOf(candidate)>=0) continue;
                options.push(candidate);
            }
            let shuffled=shuffle(rng, options);
            correct=String(multiple);
            alternate=correct;
            display=correct;
            // The four numbers are printed, because "which of these" is unanswerable
            // in free-response mode without them.
            latex=`Which of these is divisible by ${divisor}? ${shuffled.join(", ")}.`;
            expectedFormat="Enter the number";
            choices=shuffled.map(String);
            break;
        }
        case "how_many_divisible":{
            let lo=Math.floor(rng()*40)+10;
            let width=Math.floor(rng()*20)+5;
            let hi=lo+width;
            let divisor=[2,3,4,5,6,9][Math.floor(rng()*6)];
            let count=countDivisibleIn(lo, hi, divisor);
            correct=String(count);
            alternate=correct;
            display=`${count} of the ${width+1} integers from ${lo} to ${hi}`;
            latex=`How many integers from ${lo} to ${hi} inclusive are divisible by ${divisor}?`;
            choices=distinctAround(count, 1);
            break;
        }
        case "divisor_count":{
            let n=difficulty==="hard"?drawComposite(rng, 100, 2400):difficulty==="easy"?drawComposite(rng, 12, 120):drawComposite(rng, 24, 600);
            let count=divisorCount(n);
            correct=String(count);
            alternate=correct;
            display=correct;
            latex=`How many positive divisors does ${n} have?`;
            choices=distinctAround(count, 1);
            break;
        }
        case "remainder":{
            let divisor=[7, 9, 11, 12, 13][Math.floor(rng()*5)];
            let n=Math.floor(rng()*divisor*40)+divisor;
            let remainder=n%divisor;
            correct=String(remainder);
            alternate=correct;
            display=`${n} = ${Math.floor(n/divisor)} \\times ${divisor} + ${remainder}`;
            latex=`What is the remainder when ${n} is divided by ${divisor}?`;
            choices=distinctAround(remainder, 0);
            break;
        }
    }
    let unique=fourOptions(correct, choices);
    return {latex, correct, alternate, display, choices: unique, expectedFormat};
}

/** Counts the multiples of a divisor in an inclusive range. */
function countDivisibleIn(lo: number, hi: number, divisor: number): number{
    return Math.floor(hi/divisor)-Math.floor((lo-1)/divisor);
}

/**
 * Builds a set of distinct wrong options around a value. Every one of them is a
 * number a learner would plausibly write, and none of them equals the answer.
 */
function distinctAround(value: number, offset: number): string[]{
    let deltas=[offset+1, offset+2, offset-1, offset+3];
    return deltas.map(d=>String(value+d));
}