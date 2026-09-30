/**
 * @file Answer normalisation shared by the checker, the option builder and the
 * difficulty gate.
 * @description The app has to decide whether two answer strings mean the same
 * thing, and it has to do so in three places: when grading a typed answer, when
 * deciding whether two multiple-choice options are duplicates, and when deciding
 * whether a topic's difficulty parameter actually changed anything. Putting that
 * decision in one module is what stops the three from disagreeing, which is how
 * "0.50" and "0.5" came to be treated as two different options in one place and
 * as the same answer in another.
 */

/**
 * Reports whether a string is a plain finite number.
 *
 * @param value - The string to test.
 * @returns True when the string parses to a finite number.
 */
export function isFiniteNumberText(value: string): boolean{
    if (typeof value!=="string") return false;
    let trimmed=value.trim();
    if (trimmed==="") return false;
    let parsed=Number(trimmed);
    return Number.isFinite(parsed);
}

/**
 * Reports whether two numbers are equal to within the precision a learner can
 * actually see. A question displayed to two decimal places cannot distinguish
 * 2.30 from 2.304, so accepting both is correct, while 2.30 and 2.31 are
 * different answers and must not be accepted.
 *
 * @param a - The first value, as text.
 * @param b - The second value, as text.
 * @param displayedDecimals - Decimal places the question displays. Defaults to 2.
 * @returns True when the two are the same value at the displayed precision.
 */
export function sameNumericValue(a: string, b: string, displayedDecimals: number=2): boolean{
    let left=Number(a);
    let right=Number(b);
    if (!Number.isFinite(left)||!Number.isFinite(right)) return false;
    if (left===right) return true;
    let band=Math.pow(10, -displayedDecimals)/2;
    return Math.abs(left-right)<=band;
}

/**
 * Reduces a numeric string to one spelling, so that two spellings of the same
 * value compare equal. Uses exact rational arithmetic, so "14/3" and "28/6"
 * canonicalise to the same thing rather than merely comparing close.
 *
 * @param value - The numeric string.
 * @returns The canonical spelling, or the trimmed input when it is not numeric.
 */
export function canonicalNumeric(value: string): string{
    if (typeof value!=="string") return "";
    let trimmed=value.trim();
    if (!isFiniteNumberText(trimmed)) return trimmed;
    let exact=toFraction(trimmed);
    if (!exact) return trimmed;
    return exact;
}

/**
 * Converts a numeric string to an exact reduced fraction string, or returns null
 * when the string is not a plain rational. Arithmetic is done in scaled integer
 * space so that no binary representation error can survive, and the result is
 * reduced by the Euclidean algorithm, so 14/3 and 28/6 canonicalise alike.
 *
 * @param value - The numeric string.
 * @returns A reduced "n" or "n/d" string, or null.
 */
function toFraction(value: string): string|null{
    let trimmed=value.trim();
    let scaled=Number(trimmed);
    if (!Number.isFinite(scaled)) return null;
    let working=trimmed.includes("e")||trimmed.includes("E")?scaled.toFixed(12):trimmed;
    let negative=working.startsWith("-");
    if (negative) working=working.slice(1);
    let num: number;
    let den=1;
    if (working.includes("/")){
        let parts=working.split("/");
        let n=Number(parts[0].trim());
        let d=Number(parts[1].trim());
        if (!Number.isFinite(n)||!Number.isFinite(d)||d===0) return null;
        num=n;
        den=d;
    }
    else if (working.includes(".")){
        let [intPart, fracPart]=working.split(".");
        num=Number((intPart===""?"0":intPart)+fracPart);
        den=Math.pow(10, fracPart.length);
    }
    else{
        num=Number(working);
    }
    if (!Number.isFinite(num)||!Number.isInteger(num)) return null;
    if (!Number.isInteger(den)||den===0) return null;
    if (num===0) return "0";
    let divisor=gcdInt(Math.abs(num), Math.abs(den));
    let reducedNum=num/divisor;
    let reducedDen=den/divisor;
    let sign=(reducedNum<0||den<0)?"-":"";
    let absNum=Math.abs(reducedNum);
    if (reducedDen<0){
        reducedDen=-reducedDen;
    }
    if (reducedDen===1) return sign+absNum;
    return sign+absNum+"/"+reducedDen;
}

/**
 * Greatest common divisor of two integers, by the Euclidean algorithm.
 *
 * @param a - The first value.
 * @param b - The second value.
 * @returns The greatest common divisor.
 */
function gcdInt(a: number, b: number): number{
    let x=Math.abs(a);
    let y=Math.abs(b);
    while(y!==0){
        let t=x%y;
        x=y;
        y=t;
    }
    return x===0?1:x;
}
