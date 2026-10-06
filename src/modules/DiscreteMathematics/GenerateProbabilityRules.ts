/**
 * @file The rules that turn a count into a probability.
 * @description The probability topic draws two probabilities and multiplies or
 * adds them. This file is about the rules that need a structure underneath: a
 * two-way table, a partition that has to be weighted rather than averaged, a
 * diagnosis behind a test result, the difference between independence and
 * mutual exclusivity, and an expected value that is not the most likely outcome.
 *
 * Every probability here is an exact rational. Whole-number percentages and
 * populations that are multiples of one hundred keep each count an integer, so
 * the graded answer is a fraction the learner can verify by hand instead of a
 * decimal they cannot reproduce. Each option is reduced before it is offered,
 * because "6/8" and "3/4" in one question is a four-option question that is
 * really a three-option question.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, shuffle}from"../shared/Random";
import{gcd}from"./DiscreteUtils.js";

/** An exact rational, kept unreduced until it is written out. */
interface Fraction{
    /** The numerator, which may be negative. */
    n: number;
    /** The denominator, which is positive. */
    d: number;
}

/**
 * Writes a rational in lowest terms.
 *
 * Options are compared as values, not as spellings, so every option is reduced
 * before it is offered. A whole number is written without its denominator so
 * that "3" and "3/1" cannot both reach a learner.
 *
 * @param value - The rational to write.
 * @returns The reduced form, as "n/d" or as a whole number.
 */
function fractionText(value: Fraction): string{
    let n=value.n;
    let d=value.d===0?1:value.d;
    if (d<0){
        n=-n;
        d=-d;
    }
    let factor=gcd(Math.abs(n), d);
    if (factor>1){
        n=n/factor;
        d=d/factor;
    }
    return d===1?String(n):`${n}/${d}`;
}

/**
 * Builds three wrong fractions around an answer.
 *
 * The candidates are the answers the named mistakes produce, and any that reduce
 * to the answer or to each other are dropped. The fallback holds the denominator
 * and shifts the numerator downward first, so every fallback option is a
 * different rational, none of them is the answer, and all of them are still
 * probabilities; the counter bounds it rather than trusting the candidate pool to
 * be rich enough.
 *
 * @param answer - The correct probability.
 * @param candidates - The probabilities the named mistakes produce.
 * @param rng - The injected random source.
 * @returns Three distinct wrong options.
 */
function fractionChoices(answer: Fraction, candidates: Fraction[], rng: RngFn): string[]{
    let out:string[]=[];
    let seen=new Set<string>([fractionText(answer)]);
    for(let candidate of candidates){
        if (out.length===3) break;
        let text=fractionText(candidate);
        if (seen.has(text)) continue;
        seen.add(text);
        out.push(text);
    }
    for(let shift=1; out.length<3&&shift<=12; shift++){
        for(let numerator of [answer.n-shift, answer.n+shift]){
            if (out.length===3) break;
            let text=fractionText({n:numerator, d:answer.d});
            if (seen.has(text)) continue;
            seen.add(text);
            out.push(text);
        }
    }
    return shuffle(rng, out);
}

export function generateProbabilityRules(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["conditional_table","total_probability","bayes","independence_statement","expected_value"];
    let type=types[Math.floor(rng()*types.length)];
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a fraction in lowest terms, for example 3/8";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "conditional_table":{
            // The four cells are drawn first and every total is derived from them,
            // so the printed table and the graded fraction are the same numbers.
            // The column total is left out of the table on purpose: a learner who
            // never has to add it up has not been asked to condition.
            let both=randInt(rng, 4, 14);
            let cardOnly=randInt(rng, 6, 28);
            let busOnly=randInt(rng, 6, 28);
            let neither=randInt(rng, 8, 40);
            let total=both+cardOnly+busOnly+neither;
            let busTotal=both+busOnly;
            let answer:Fraction={n:both, d:busTotal};
            correct=fractionText(answer);
            alternate=`${both}/${busTotal}`;
            display=`\\frac{${both}}{${both}+${busOnly}} = ${correct}`;
            latex=`A survey of ${total} people recorded whether each one holds a membership card and whether each one travels by bus. The two-way table is \\[ \\begin{array}{c|cc} & \\text{travels by bus} & \\text{does not} \\\\ \\hline \\text{holds a card} & ${both} & ${cardOnly} \\\\ \\text{no card} & ${busOnly} & ${neither} \\end{array} \\] What is the probability that a person holds a card, given that they travel by bus?`;
            choices=[correct, ...fractionChoices(answer, [
                {n:both+cardOnly, d:total},
                {n:both, d:total},
                {n:busTotal, d:total},
                {n:total-busTotal, d:busTotal}
            ], rng)];
            rungs=[
                "\"Given that\" replaces the whole survey with the group you are told about, so the denominator is that group's total and not the grand total.",
                "The group you are told about is the one that travels by bus, and the table leaves its column total out, so add the two cells of that column first."
            ];
            steps=[
                `People who travel by bus: ${both} hold a card and ${busOnly} do not, so the column total is ${both} + ${busOnly} = ${busTotal}.`,
                `Of those, the ones holding a card are the ${both} in the top cell.`,
                `P(card given bus) = ${both}/${busTotal} = ${correct}.`
            ];
            break;
        }
        case "total_probability":{
            // Whole-number percentages make the weighted sum an exact rational.
            // The averaging mistake is offered as a distractor because the
            // unweighted mean is the answer a learner writes when the two groups
            // are not the same size.
            let firstShare=randInt(rng, 30, 70);
            let firstRate=randInt(rng, 2, 12);
            let secondRate=randInt(rng, 1, 20);
            let secondShare=100-firstShare;
            let numerator=firstShare*firstRate+secondShare*secondRate;
            let answer:Fraction={n:numerator, d:10000};
            correct=fractionText(answer);
            alternate=`${numerator}/10000`;
            display=`\\frac{${firstShare}}{100}\\times\\frac{${firstRate}}{100}+\\frac{${secondShare}}{100}\\times\\frac{${secondRate}}{100}`;
            latex=`A plant makes ${firstShare} percent of its output on line A, where ${firstRate} percent of the items are faulty. The remaining output comes from line B, where ${secondRate} percent of the items are faulty. What fraction of all the items are faulty?`;
            choices=[correct, ...fractionChoices(answer, [
                {n:firstShare*firstRate, d:10000},
                {n:firstShare*secondRate+secondShare*firstRate, d:10000},
                {n:firstRate+secondRate, d:200},
                {n:numerator, d:100}
            ], rng)];
            rungs=[
                "The overall rate is a weighted average, not an average: each line's own rate is weighted by the share of output that line makes, and the two lines do not make the same share.",
                `Line A makes ${firstShare} percent of the output at ${firstRate} percent faulty, and line B makes ${secondShare} percent at ${secondRate} percent, so weight each rate by its own share.`
            ];
            steps=[
                `Line A contributes ${firstShare}/100 of the output, of which ${firstRate}/100 is faulty.`,
                `Line B contributes ${secondShare}/100 of the output, of which ${secondRate}/100 is faulty.`,
                `Adding the contributions: ${firstShare} x ${firstRate} + ${secondShare} x ${secondRate} = ${numerator} faulty per 10000, so the fraction is ${numerator}/10000 = ${correct}.`
            ];
            break;
        }
        case "bayes":{
            // The population is a multiple of one hundred and both rates are whole
            // percentages, so the true positives and the false positives are whole
            // people and the posterior is exact. The offered distractor is the
            // sensitivity, which is the answer a learner gives without inverting.
            let healthy=randInt(rng, 3, difficulty==="hard"?9:7)*100;
            let sick=randInt(rng, 1, difficulty==="hard"?4:2)*100;
            let sensitivity=randInt(rng, 88, 99);
            let falseRate=randInt(rng, 1, difficulty==="easy"?4:8);
            let truePositive=(sick/100)*sensitivity;
            let falsePositive=(healthy/100)*falseRate;
            let flagged=truePositive+falsePositive;
            let answer:Fraction={n:truePositive, d:flagged};
            correct=fractionText(answer);
            alternate=`${truePositive}/${flagged}`;
            display=`\\frac{${sensitivity}/100 \\times ${sick}}{${flagged}} = ${correct}`;
            latex=`In a town of ${healthy+sick} people, ${sick} have a condition. A screening test flags ${sensitivity} percent of the people who have it, and it also flags ${falseRate} percent of the people who do not. A person is flagged positive. What is the probability that this person really has the condition?`;
            choices=[correct, ...fractionChoices(answer, [
                {n:sensitivity, d:100},
                {n:truePositive, d:healthy+sick},
                {n:flagged, d:healthy+sick},
                {n:falsePositive, d:flagged},
                {n:flagged-truePositive, d:flagged}
            ], rng)];
            rungs=[
                "You are told the test was positive, so the people you are choosing from are the positive ones, not the sick ones. The answer inverts the test's own rates.",
                "Count whole people rather than percentages: how many of the sick were flagged, against how many people were flagged altogether."
            ];
            steps=[
                `Of the ${sick} people who have the condition, ${sensitivity} percent are flagged: ${sick} x ${sensitivity}/100 = ${truePositive} people.`,
                `Of the ${healthy} who do not, ${falseRate} percent are flagged: ${healthy} x ${falseRate}/100 = ${falsePositive} people.`,
                `Flagged in total: ${truePositive} + ${falsePositive} = ${flagged}, so the probability is ${truePositive}/${flagged} = ${correct}.`
            ];
            break;
        }
        case "independence_statement":{
            // Asked as a statement rather than as a value, because "are these
            // independent" and "what is the joint probability" are different
            // questions and only one of them is being tested here. The four
            // statements are arranged so exactly one holds in each case.
            let firstFactor=randInt(rng, 2, 7);
            let secondFactor=randInt(rng, 2, 9-firstFactor);
            let first=firstFactor*10;
            let second=secondFactor*10;
            let independent=rng()<0.5;
            // The joint probability is capped below min(P(A), P(B)) so the events
            // cannot be mutually exclusive, and both marginals are multiples of
            // ten so the independent value is a whole percentage.
            let joint=independent?first*second/100:randInt(rng, 1, Math.min(first, second)/10-1);
            let statements=[
                "A and B are independent.",
                "A and B are mutually exclusive.",
                "A and B are neither independent nor mutually exclusive.",
                "P(A or B) is P(A) + P(B)."
            ];
            let answer=independent?statements[0]:statements[2];
            correct=answer;
            alternate=independent?"independent":"dependent";
            display=independent?"independent":`${joint} \\neq ${first*second/100}`;
            latex=`For two events \\( A \\) and \\( B \\) in the same experiment, \\( P(A)=${first}\\% \\), \\( P(B)=${second}\\% \\) and \\( P(A \\cap B)=${joint}\\% \\). Which of these statements about the two events is true?`;
            choices=[answer, ...shuffle(rng, statements.filter(s=>s!==answer))];
            rungs=[
                "Independence is a claim about the joint probability: A and B are independent exactly when P(A and B) is P(A) x P(B), and mutually exclusive exactly when that joint probability is zero.",
                `Multiply the two given percentages to get the joint probability independence would predict, and compare it with the joint probability the question states.`
            ];
            steps=[
                `P(A) x P(B) = ${first} x ${second} percent = ${first*second/100} percent, which is what independence would require.`,
                `The stated joint probability is ${joint} percent, so the events are ${independent?"independent":"not independent"}.`,
                `Mutual exclusivity would need a joint probability of zero, and ${joint} is not zero, so the true statement is: ${correct}`
            ];
            break;
        }
        case "expected_value":{
            // Whole-chip prizes and whole-number probabilities make the net gain an
            // exact rational, and the third outcome is a real loss of the stake
            // rather than nothing at all, which is what makes the expected value
            // differ from the average of the prizes.
            let cost=randInt(rng, 2, difficulty==="hard"?9:6);
            let topPrize=randInt(rng, 4, difficulty==="hard"?40:16)*2;
            let midPrize=randInt(rng, 2, topPrize/2-1)*2;
            let topChance=randInt(rng, 20, 45);
            let midChance=randInt(rng, 20, 60-topChance);
            let nothingChance=100-topChance-midChance;
            let numerator=topChance*(topPrize-cost)+midChance*(midPrize-cost)-nothingChance*cost;
            let answer:Fraction={n:numerator, d:100};
            correct=fractionText(answer);
            alternate=`${numerator}/100`;
            display=`\\frac{${topChance}(${topPrize}-${cost})+${midChance}(${midPrize}-${cost})-${nothingChance}\\times${cost}}{100}`;
            latex=`A game costs ${cost} chips to play. It pays ${topPrize} chips with probability ${topChance} percent, ${midPrize} chips with probability ${midChance} percent, and nothing at all with probability ${nothingChance} percent. What is the expected net gain, in chips, from playing the game once?`;
            choices=[correct, ...fractionChoices(answer, [
                {n:topChance*topPrize+midChance*midPrize, d:100},
                {n:topPrize+midPrize, d:2},
                {n:cost, d:1},
                {n:topPrize, d:1},
                {n:numerator, d:1000}
            ], rng)];
            rungs=[
                "An expected value is the probability-weighted average of every outcome, not the most likely one and not the average of the prizes. Paying nothing is an outcome too, and it loses the stake.",
                `Weight each net gain by its own probability, and remember that the ${nothingChance} percent of plays that pay nothing lose the ${cost} chip stake.`
            ];
            steps=[
                `Net gains: ${topChance} percent of ${topPrize-cost} chips, ${midChance} percent of ${midPrize-cost} chips, and ${nothingChance} percent of ${-cost} chips.`,
                `Weighted sum: ${topChance} x (${topPrize} - ${cost}) + ${midChance} x (${midPrize} - ${cost}) - ${nothingChance} x ${cost} = ${numerator} hundredths of a chip.`,
                `Dividing by 100, the expected net gain is ${numerator}/100, which in lowest terms is ${correct}.`
            ];
            break;
        }
    }
    let unique=[...new Set(choices)];
    if (unique.length>4) unique=unique.slice(0, 4);
    if (!unique.includes(correct)){
        if (unique.length>0) unique[Math.floor(rng()*unique.length)]=correct;
        else unique=[correct];
    }
    return {latex, correct, alternate, display, choices: unique, expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
