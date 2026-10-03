/**
 * @file Rounding and estimating: rounding half up, rounding half to even,
 * counting significant figures, and rounding each term of a sum before adding.
 * @description Rounding half up and rounding half to even are different questions
 * with different keys, and the number they disagree on is exactly the case where
 * the dropped digit is a five. Every question in the first two branches is built
 * so that the dropped digit is a five, and the prompt names the rule, because a
 * question that does not say which rule it wants has no single answer.
 *
 * Significant figures are counted from the first nonzero digit and never from the
 * decimal point. The numbers are held as digit strings with a separate decimal
 * point position, so the digits after the one that is kept are read off rather than
 * reconstructed, and a trailing zero in the last place a learner wrote is a digit
 * the prompt actually printed.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fmt}from"../shared/Numeric";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random";

/**
 * Inserts a thousands separator into a whole number, so that the grouping does not
 * depend on the host's locale data.
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
 * Renders a digit string as a decimal, given where the point falls.
 *
 * @param digits - The digits, most significant first.
 * @param pointPos - How many digits sit before the decimal point.
 * @returns The decimal those digits spell.
 */
function decimalFromDigits(digits: number[], pointPos: number): string{
    let text=digits.join("");
    if (pointPos<=0) return "0."+"0".repeat(-pointPos)+text;
    if (pointPos>=text.length) return text+"0".repeat(pointPos-text.length);
    return text.slice(0, pointPos)+"."+text.slice(pointPos);
}

/**
 * Drops the zeros a number does not need after its decimal point, which is what
 * distinguishes "2.5" from the "2.500" three significant figures would spell.
 *
 * @param text - The decimal.
 * @returns The same value with its trailing fractional zeros removed.
 */
function trimZeros(text: string): string{
    if (text.indexOf(".")<0) return text;
    return text.replace(/0+$/,"").replace(/\.$/,"");
}

/**
 * The index of the first digit that is not zero, which is where a count of
 * significant figures starts.
 *
 * @param digits - The digits, most significant first.
 * @returns The index, or -1 when every digit is zero.
 */
function firstNonZero(digits: number[]): number{
    for(let i=0; i<digits.length; i++){
        if ((digits[i] as number)!==0) return i;
    }
    return -1;
}

/**
 * Rounds a digit string to a number of significant figures.
 *
 * The decision is made on the digits themselves, so nothing passes through a
 * binary float and a value such as 2.45 rounded to one significant figure is 2
 * rather than 2.0000000000000004. A five followed by any nonzero digit rounds up,
 * and a five followed by nothing rounds up as well, which is the rule every school
 * text states for significant figures.
 *
 * @param digits - The digits, most significant first.
 * @param pointPos - How many digits sit before the decimal point.
 * @param keep - How many significant figures to keep.
 * @returns The kept digits and the new decimal-point position.
 */
function roundSignificant(digits: number[], pointPos: number, keep: number): {digits: number[], pointPos: number}{
    let start=firstNonZero(digits);
    if (start<0) return {digits, pointPos};
    let end=Math.min(digits.length, start+keep);
    let out=digits.slice(0, end);
    let dropped=digits.slice(end);
    let next=dropped.length>0?dropped[0] as number:0;
    let rest=0;
    for(let i=1; i<dropped.length; i++) rest+=dropped[i] as number;
    if (next>5||(next===5&&(rest>0||dropped.length===1))){
        let carry=true;
        for(let i=out.length-1; i>=0&&carry; i--){
            let value=(out[i] as number)+1;
            out[i]=value%10;
            carry=value>=10;
        }
        if (carry){
            out.unshift(1);
            pointPos+=1;
        }
    }
    return {digits: out, pointPos};
}

/**
 * Shifts the last digit of a digit string by a whole number of places, when the
 * result is still a digit.
 *
 * @param digits - The digits, most significant first.
 * @param pointPos - How many digits sit before the decimal point.
 * @param delta - How far to move the last digit.
 * @returns The shifted decimal, or null when the last digit cannot absorb it.
 */
function nudgeLastDigit(digits: number[], pointPos: number, delta: number): string|null{
    if (digits.length===0) return null;
    let last=(digits[digits.length-1] as number)+delta;
    if (last<0||last>9) return null;
    let shifted=digits.slice();
    shifted[shifted.length-1]=last;
    return decimalFromDigits(shifted, pointPos);
}

export function generateRoundingEstimate(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["round_half_up","round_half_even","significant_figures","estimate_a_range"];
    let type=types[Math.floor(rng()*types.length)];
    let key="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "round_half_up":{
            // The printed value always ends in a five at the place that is dropped,
            // so the case where the two rules disagree is the case being asked.
            let decimals=randInt(rng, 0, 1);
            let units=randInt(rng, 3, difficulty==="hard"?999:99);
            let scaled=units*10+5;
            let divisor=Math.pow(10, decimals+1);
            let value=scaled/divisor;
            let kept=decimals===0?"whole number":"tenth";
            let truncating=Math.floor(scaled/10)/Math.pow(10, decimals);
            key=fmt(truncating+Math.pow(10, -decimals), decimals);
            latex=`Round \\( ${fmt(value, decimals+1)} \\) to the nearest \\( ${kept} \\). When the digit dropped is exactly a five, round the number up.`;
            let halfEven=Math.floor(scaled/10)%2===0?truncating:truncating+Math.pow(10, -decimals);
            let keyValue=Number(key);
            choices=numberOptions(keyValue, [halfEven, truncating, keyValue+1, keyValue-1], decimals);
            rungs=[
                "Rounding to a named place keeps the digits to the left of it and looks only at the digit immediately to the right of it. When that digit is exactly a five, the half-up rule rounds up.",
                `The digit dropped from ${fmt(value, decimals+1)} is a five, so this is the case where the two rounding rules would disagree.`
            ];
            steps=[
                `${fmt(value, decimals+1)} rounded to the nearest ${kept} keeps ${fmt(truncating, decimals)} and looks at the ${5}.`,
                "A five followed by nothing is exactly half, and the half-up rule rounds a half away from zero.",
                `So the rounded value is ${key}`
            ];
            break;
        }
        case "round_half_even":{
            let decimals=randInt(rng, 0, 1);
            let units=randInt(rng, 3, difficulty==="hard"?999:99);
            let scaled=units*10+5;
            let divisor=Math.pow(10, decimals+1);
            let value=scaled/divisor;
            let kept=decimals===0?"whole number":"tenth";
            let truncating=Math.floor(scaled/10)/Math.pow(10, decimals);
            let step=Math.pow(10, -decimals);
            let lowerEven=Math.floor(scaled/10)%2===0;
            key=fmt(truncating+(lowerEven?0:step), decimals);
            latex=`Round \\( ${fmt(value, decimals+1)} \\) to the nearest \\( ${kept} \\). When the digit dropped is exactly a five, round to the even neighbour, which is the rule known as half-to-even.`;
            let keyValue=Number(key);
            choices=numberOptions(keyValue, [truncating+step, truncating, keyValue+1, keyValue-1], decimals);
            rungs=[
                "Rounding half to even keeps the neighbour that is even: when the digit dropped is exactly a five, the answer is whichever of the two neighbours is an even number.",
                `The digit dropped from ${fmt(value, decimals+1)} is a five, so compare ${fmt(truncating, decimals)} and ${fmt(truncating+step, decimals)} and keep the even one.`
            ];
            steps=[
                `${fmt(value, decimals+1)} rounded to the nearest ${kept} sits between ${fmt(truncating, decimals)} and ${fmt(truncating+step, decimals)}.`,
                `${fmt(truncating, decimals)} ends in ${String(Math.floor(scaled/10)%10)} and ${fmt(truncating+step, decimals)} ends in ${String((Math.floor(scaled/10)+1)%10)}, so the even one is ${key}.`,
                `So the rounded value is ${key}`
            ];
            break;
        }
        case "significant_figures":{
            let keep=difficulty==="easy"?2:difficulty==="hard"?4:3;
            let length=keep+2;
            let digits:number[]=[randInt(rng, 1, 9)];
            for(let i=1; i<length-1; i++) digits.push(randInt(rng, 0, 9));
            // The first digit that is dropped is never zero, so the rounding always
            // changes the value and the answer is never the number as printed.
            digits.push(randInt(rng, 1, 9));
            let pointPos=difficulty==="easy"?1:randInt(rng, -1, 2);
            let printed=decimalFromDigits(digits, pointPos);
            let rounded=roundSignificant(digits, pointPos, keep);
            let keptDigits=firstNonZero(digits)+keep;
            key=trimZeros(decimalFromDigits(rounded.digits, rounded.pointPos));
            latex=`Round \\( ${printed} \\) to \\( ${keep} \\) significant figures.`;
            expectedFormat="Enter the value you rounded to, for example 2.45";
            let candidates=[
                // Truncating rather than rounding, one whole step either side of the
                // answer, and rounding one figure short. The figure one place too many
                // is deliberately not offered: it differs from the answer by a single
                // unit in the last decimal place, which is the same number to a
                // tolerance and therefore a duplicate rather than a distractor.
                decimalFromDigits(digits.slice(0, keptDigits), pointPos),
                nudgeLastDigit(rounded.digits, rounded.pointPos, 1),
                nudgeLastDigit(rounded.digits, rounded.pointPos, -1),
                decimalFromDigits(digits.slice(0, Math.max(firstNonZero(digits)+1, keptDigits-1)), pointPos)
            ].filter(text=>text!==null) as string[];
            choices=fourOptions(key, candidates);
            rungs=[
                "Significant figures are counted from the first nonzero digit, not from the decimal point, so the zeros between or after the nonzero digits are counted and a leading zero is not.",
                `${printed} begins with the nonzero digit ${digits[0]}, so the count starts at the very first digit and every digit after it counts.`
            ];
            steps=[
                `The digits of ${printed} that count are ${digits.slice(firstNonZero(digits), firstNonZero(digits)+keep).join("")}, so ${keep} significant figures are kept.`,
                `The next digit along is ${digits[keptDigits]}, which decides the rounding.`,
                `Keeping ${keep} significant figures gives ${key}`
            ];
            break;
        }
        case "estimate_a_range":{
            // Each term has a nonzero remainder at the hundreds place, so every one
            // of them actually moves when it is rounded and the estimate cannot
            // coincide with the exact total.
            let parts:number[]=[];
            for(let i=0; i<3; i++) parts.push(randInt(rng, 4, difficulty==="hard"?950:90)*100+randInt(rng, 1, 99));
            let rounded:number[]=[];
            for(let part of parts) rounded.push(Math.round(part/100)*100);
            let estimate=rounded[0]+rounded[1]+rounded[2];
            let exact=parts[0]+parts[1]+parts[2];
            key=String(estimate);
            latex=`Estimate the total of \\( ${grouped(parts[0] as number)} \\), \\( ${grouped(parts[1] as number)} \\) and \\( ${grouped(parts[2] as number)} \\). Round each of the three numbers to the nearest hundred first, and then add the three rounded numbers.`;
            choices=numberOptions(estimate, [exact, (rounded[0] as number)+(rounded[1] as number)+(parts[2] as number), Math.round(exact/100)*100, estimate+100], 0);
            rungs=[
                "An estimate is only reproducible if every rounding it uses is written down, so round each term separately and add the rounded terms rather than rounding the total.",
                `Round each of the three numbers to the nearest hundred before you add anything.`
            ];
            steps=[
                `The three numbers round to ${grouped(rounded[0] as number)}, ${grouped(rounded[1] as number)} and ${grouped(rounded[2] as number)}.`,
                `Add the rounded numbers: ${rounded[0]} + ${rounded[1]} + ${rounded[2]}.`,
                `The estimate is ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:key, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
