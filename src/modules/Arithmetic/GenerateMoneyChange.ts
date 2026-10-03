/**
 * @file Money: totalling a cost, change from a note, unit price, and splitting a
 * bill.
 * @description Every amount is held as a whole number of cents and divided by one
 * hundred only when it is rendered, so a price is never stored as a decimal that
 * could print as 4.349999999999999. The splits and the unit prices are drawn so
 * that they come out in whole cents, because a bill that does not divide evenly is
 * a real situation and not a question that has an answer a learner can type.
 *
 * No currency symbol ever appears inside a math group: the amounts are printed in
 * prose with the unit spelled out, and the numbers alone are printed in math, which
 * is what keeps a prompt renderable in both KaTeX and MathJax.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fmt}from"../shared/Numeric";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

/**
 * Renders a whole number of cents as an amount in dollars.
 *
 * @param cents - The amount, in cents.
 * @returns The amount to the nearest cent, for example "4.35".
 */
function dollars(cents: number): string{
    return fmt(cents/100, 2);
}

export function generateMoneyChange(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["total_a_cost","change_due","unit_price","split_a_bill"];
    let type=types[Math.floor(rng()*types.length)];
    let key="";
    let latex="";
    let expectedFormat="Enter an amount in dollars to the nearest cent, for example 4.35";
    let wrong:number[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "total_a_cost":{
            let pencils=randInt(rng, 12, difficulty==="hard"?450:180);
            let notebooks=randInt(rng, 60, difficulty==="hard"?2400:900);
            let tags=randInt(rng, 5, difficulty==="hard"?300:90);
            let pencilCount=randInt(rng, 2, 8);
            let notebookCount=randInt(rng, 1, 4);
            let tagCount=randInt(rng, 1, 6);
            let total=pencils*pencilCount+notebooks*notebookCount+tags*tagCount;
            key=dollars(total);
            latex=`A shop sells pencils at \\( ${dollars(pencils)} \\) dollars each, notebooks at \\( ${dollars(notebooks)} \\) dollars each and gift tags at \\( ${dollars(tags)} \\) dollars each. Ali buys \\( ${pencilCount} \\) pencils, \\( ${notebookCount} \\) notebooks and \\( ${tagCount} \\) gift tags. How much does Ali pay, in dollars?`;
            wrong=[total-pencils, total+notebooks, notebooks*notebookCount+tags*tagCount, total+pencils];
            rungs=[
                "Work out what each line of the shopping costs on its own, and then add the lines; multiplying a price by a quantity is done in cents so nothing is lost to rounding.",
                `There are three lines: ${pencilCount} pencils, ${notebookCount} notebooks and ${tagCount} tags.`
            ];
            steps=[
                `Pencils: ${pencilCount} x ${dollars(pencils)} dollars = ${dollars(pencils*pencilCount)} dollars.`,
                `Notebooks: ${notebookCount} x ${dollars(notebooks)} dollars = ${dollars(notebooks*notebookCount)} dollars, and tags: ${tagCount} x ${dollars(tags)} dollars = ${dollars(tags*tagCount)} dollars.`,
                `${dollars(pencils*pencilCount)} + ${dollars(notebooks*notebookCount)} + ${dollars(tags*tagCount)} in total`,
                `Altogether that is ${key}`
            ];
            break;
        }
        case "change_due":{
            // The change is kept at two dollars or more, so the "one dollar too
            // much" distractor is a positive amount rather than a negative one.
            let cost=randInt(rng, 55, difficulty==="hard"?2600:1200);
            let note=Math.ceil(cost/100)+randInt(rng, 2, difficulty==="hard"?40:15);
            let change=note*100-cost;
            key=dollars(change);
            latex=`A jacket costs \\( ${dollars(cost)} \\) dollars. Ben pays with a \\( ${note} \\)-dollar note. How much change should he be given, in dollars?`;
            wrong=[cost, change+100, change+10, change-100];
            rungs=[
                "Change is what the note is worth less what the item costs, and it is worked out in cents so that no fraction of a cent is ever created.",
                `The note is worth ${note} dollars, which is ${note*100} cents, and the jacket costs ${cost} cents.`
            ];
            steps=[
                `The note is worth ${note*100} cents.`,
                `The jacket costs ${cost} cents, so the change is ${note*100} - ${cost} = ${change} cents.`,
                `${change} cents in dollars is ${key}`
            ];
            break;
        }
        case "unit_price":{
            // The total is drawn as a multiple of the number of items, so the unit
            // price is a whole number of cents and there is nothing to round.
            let count=randInt(rng, 3, difficulty==="hard"?12:8);
            let unit=randInt(rng, 15, difficulty==="hard"?1800:600);
            let total=count*unit;
            key=dollars(unit);
            latex=`${count} identical jars of jam cost \\( ${dollars(total)} \\) dollars altogether. What is the price of one jar, in dollars?`;
            wrong=[total, unit+50, unit*2, unit+10];
            rungs=[
                "A unit price is the total divided by how many there are, so find how many you have and divide once.",
                `There are ${count} jars and they cost ${dollars(total)} dollars between them.`
            ];
            steps=[
                `The total is ${total*100} cents.`,
                `${total*100} cents divided by ${count} jars is ${unit} cents a jar.`,
                `${unit} cents in dollars is ${key}`
            ];
            break;
        }
        case "split_a_bill":{
            let people=randInt(rng, 3, difficulty==="hard"?8:5);
            let share=randInt(rng, 120, difficulty==="hard"?3500:1400);
            let bill=people*share;
            key=dollars(share);
            latex=`A bill of \\( ${dollars(bill)} \\) dollars is split equally between \\( ${people} \\) friends, with nothing left over. How much does each friend pay, in dollars?`;
            wrong=[bill, share+50, share*2, share-25];
            rungs=[
                "A bill split equally is divided by the number of people sharing it, and the share is what is left after the division rather than the whole.",
                `The bill is ${bill*100} cents and there are ${people} people.`
            ];
            steps=[
                `The bill comes to ${bill*100} cents.`,
                `${bill*100} cents divided by ${people} is ${share} cents each.`,
                `${share} cents in dollars is ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:key, display:key, choices:numberOptions(Number(key), wrong.map(cents=>cents/100), 2), expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
