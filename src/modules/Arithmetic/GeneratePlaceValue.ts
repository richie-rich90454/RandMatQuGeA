/**
 * @file Place value: what a single digit is worth, expanded form, rounding to a
 * named place, and comparing numbers that differ in one place.
 * @description Place value is the one topic where the answer is a property of the
 * printed digits rather than a computation on them, so every question here is
 * built from the number that is printed and read back out of it. Nothing is
 * approximated: an expanded form is a sum of whole place values, a rounded value
 * is a whole multiple of the named place, and a digit value is a whole number, so
 * no float ever reaches a printed value.
 *
 * The distractors are the mistakes that actually produce a wrong digit value or a
 * wrong rounding: reading the digit on its own, reading it one place too low or
 * one place too high, and truncating instead of rounding.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions, fourOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

/** The place names, from the units place upward. */
const PLACES=["ones","tens","hundreds","thousands","ten-thousands","hundred-thousands"];

/** The factors the places are worth, from the units place upward. */
const WEIGHTS=[1, 10, 100, 1000, 10000, 100000];

/**
 * Inserts a thousands separator into a whole number. `toLocaleString` is not used
 * because its output depends on the ICU data the host was built with, and a
 * worksheet has to print the same digits everywhere.
 *
 * @param value - The whole number.
 * @returns The number with commas every three digits from the right.
 */
function grouped(value: number): string{
    let digits=String(value);
    let out="";
    for(let i=0; i<digits.length; i++){
        if (i>0&&(digits.length-i)%3===0) out+=",";
        out+=digits[i];
    }
    return out;
}

/**
 * The digit sitting in a given place of a whole number.
 *
 * @param value - The whole number.
 * @param place - The place index, where zero is the units place.
 * @returns The digit, which is zero when the place holds no digit.
 */
function digitAt(value: number, place: number): number{
    return Math.floor(value/Math.pow(10, place))%10;
}

/**
 * Draws a whole number with the requested number of digits, guaranteeing that at
 * least one digit below the leading one is not zero so that expanded form always
 * has at least two terms to add.
 *
 * @param rng - The injected random source.
 * @param digits - How many digits the number should have.
 * @returns A whole number with that many digits.
 */
function drawNumber(rng: RngFn, digits: number): number{
    let leading=randInt(rng, 1, 9);
    let rest:string[]=[];
    for(let i=1; i<digits; i++) rest.push(String(randInt(rng, 0, 9)));
    for(let attempt=0; attempt<32&&rest.indexOf("0")>=0; attempt++){
        rest=[];
        for(let i=1; i<digits; i++) rest.push(String(randInt(rng, 0, 9)));
    }
    return Number(leading+rest.join(""));
}

/**
 * The total a list of place values adds up to. Two expanded forms that stand for
 * the same number are one option to a learner and two to a string comparison, so
 * every candidate is checked against its total. The terms are whole numbers, so
 * the sum is exact.
 *
 * @param terms - The values of the terms.
 * @returns The value the expansion stands for.
 */
function totalOf(terms: number[]): number{
    let total=0;
    for(let term of terms) total+=term;
    return total;
}

export function generatePlaceValue(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["digit_value","expanded_form","round_to_place","compare_by_place"];
    let type=types[Math.floor(rng()*types.length)];
    let digits=difficulty==="hard"?6:difficulty==="easy"?4:5;
    let key="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "digit_value":{
            let value=drawNumber(rng, digits);
            let place=randInt(rng, 0, digits-1);
            let digit=digitAt(value, place);
            if (digit===0){
                // A zero digit is worth zero in every place, which makes the question
                // unanswerable from the place alone, so the digit in that place is
                // replaced by one that is not zero. The leading digit is never zero,
                // so the highest place cannot be the one replaced and the number
                // keeps its length.
                let replacement=randInt(rng, 1, 9);
                let block=Math.pow(10, place);
                value=Math.floor(value/block)*block+replacement*block;
                digit=replacement;
            }
            let weight=WEIGHTS[place] as number;
            key=String(digit*weight);
            latex=`The number \\( ${grouped(value)} \\) is written in the decimal system. What is the value of the digit \\( ${digit} \\) in the \\( ${PLACES[place]} \\) place?`;
            let lower=place>0?digit*Math.pow(10, place-1):0;
            let upper=digit*Math.pow(10, place+1);
            let neighbour=digitAt(value, place+1)*weight;
            choices=numberOptions(digit*weight, [lower, upper, neighbour, digit], 0);
            rungs=[
                "The value of a digit is that digit times the factor its place is worth, so name the place first and then multiply.",
                `The place asked about is the ${PLACES[place]} place, which is worth ${weight}, and the digit sitting in it is ${digit}.`
            ];
            steps=[
                `The ${PLACES[place]} place in ${grouped(value)} holds the digit ${digit}.`,
                `The ${PLACES[place]} place is worth ${weight}.`,
                `${digit} x ${weight} = ${digit*weight}, so the digit is worth ${key}`
            ];
            break;
        }
        case "expanded_form":{
            let value=drawNumber(rng, digits);
            let terms:number[]=[];
            for(let place=digits-1; place>=0; place--){
                let digit=digitAt(value, place);
                if (digit===0) continue;
                terms.push(digit*(WEIGHTS[place] as number));
            }
            key=terms.join(" + ");
            latex=`Write \\( ${grouped(value)} \\) in expanded form.`;
            expectedFormat="Enter the expanded form, for example 2000 + 30 + 4";
            // Each candidate is one real slip rather than a scramble: a term one
            // place out of step, or a place unit added to a term. The total of each
            // candidate is checked, because two different texts can stand for the
            // same number, and that would give the question two answers.
            let trueTotal=totalOf(terms);
            let seenTotals=new Set<number>([trueTotal]);
            let pool:string[]=[];
            let first=terms[0] as number;
            let movable=terms.length>1?terms[terms.length-1] as number:first;
            let variants=[
                terms.map(term=>term===first?term*10:term),
                terms.map(term=>term===movable?term/10:term),
                terms.map(term=>term===movable?term+1:term),
                terms.map(term=>term===movable?term*10:term),
                terms.map(term=>term===first?term/10:term)
            ];
            for(let variant of variants){
                if (pool.length>=6) break;
                if (!variant.every(term=>Number.isInteger(term)&&term>0)) continue;
                let total=totalOf(variant);
                if (seenTotals.has(total)) continue;
                seenTotals.add(total);
                pool.push(variant.join(" + "));
            }
            choices=fourOptions(key, pool);
            rungs=[
                "Expanded form writes the number as a sum of the values of its nonzero digits, so each digit contributes what its place is worth rather than what it looks like.",
                `Read the digits of ${grouped(value)} from the left and write down what each one is worth: ${terms.join(" + ")}.`
            ];
            steps=[
                `The nonzero places of ${grouped(value)} are worth ${terms.join(" + ")}.`,
                `Adding them gives ${terms.join(" + ")} = ${trueTotal}.`,
                `So the expanded form is ${key}`
            ];
            break;
        }
        case "round_to_place":{
            let value=drawNumber(rng, digits);
            let place=randInt(rng, 1, Math.min(3, digits-1));
            let weight=WEIGHTS[place] as number;
            let dropped=value%weight;
            let rounded=Math.round(value/weight)*weight;
            key=String(rounded);
            latex=`Round \\( ${grouped(value)} \\) to the nearest \\( ${PLACES[place]} \\).`;
            let truncated=Math.floor(value/weight)*weight;
            choices=numberOptions(rounded, [truncated, rounded+weight, rounded-weight, rounded+weight/10], 0);
            rungs=[
                "Rounding to a named place keeps the digits to the left of it and then looks only at the digit immediately to the right of it: at or above a five rounds up, below a five rounds down.",
                `Look at the ${PLACES[place]} place, which is worth ${weight}, and compare the dropped part ${dropped} with half of ${weight}.`
            ];
            steps=[
                `${grouped(value)} to the nearest ${PLACES[place]} keeps the digits worth ${weight} and up, and looks only at the ${dropped} that is dropped.`,
                dropped*2>=weight?
                    `The part dropped is ${dropped}, which is at or above half of ${weight}, so the last kept digit rounds up.`:
                    `The part dropped is ${dropped}, which is below half of ${weight}, so the last kept digit stays as it is.`,
                `At the ${PLACES[place]} place, ${grouped(value)} rounds to ${key}`
            ];
            break;
        }
        case "compare_by_place":{
            // Four numbers that agree in their thousands and hundreds digits and differ
            // only in the last two, so the comparison is decided by reading from the
            // left within those two places. Every candidate is drawn below the answer,
            // which is what makes the answer the greatest by construction rather than
            // by luck: asking "which is larger, a or b" would be a yes/no question
            // with no honest third answer, and drawing candidates on either side would
            // make the key wrong whenever one of them came out above it.
            let lead=randInt(rng, 10, 99);
            let unit=randInt(rng, 4, difficulty==="hard"?89:59);
            let value=lead*100+unit;
            let offered=[value];
            for(let attempt=0; offered.length<4&&attempt<64; attempt++){
                let candidate=lead*100+randInt(rng, 1, unit-1);
                if (offered.indexOf(candidate)>=0) continue;
                offered.push(candidate);
            }
            offered.sort((a, b)=>a-b);
            key=String(value);
            latex=`Which of these four numbers is the greatest? ${offered.join(", ")}.`;
            expectedFormat="Enter the number";
            choices=fourOptions(key, offered.map(String));
            rungs=[
                "Comparing numbers by place value means reading from the left and stopping at the first place where the two differ, because one digit in a larger place beats any number of smaller digits.",
                `All four numbers agree in the thousands and hundreds places, so the comparison is decided in the tens and the ones.`
            ];
            steps=[
                `The four numbers are ${offered.join(", ")}.`,
                "Read each from the left and stop at the first place where they differ.",
                `The greatest of them is ${value}, so the answer is ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:key, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
