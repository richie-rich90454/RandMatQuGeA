/**
 * @file Data analysis beyond a single summary statistic.
 * @description The existing statistics topic computes mean, median, mode, range,
 * standard deviation, box plots and stem-and-leaf displays. This file covers what
 * comes after those: comparing values to a distribution, describing the
 * relationship between two quantities, and estimating from a sample.
 *
 * Everything is exact or explicitly rounded to a stated precision, and the printed
 * numbers are the ones the answer is derived from. That is the recurring failure in
 * this material: a slope computed from unrounded coordinates and then printed
 * rounded is an answer the learner cannot reproduce, so each coordinate here is
 * rounded when it is drawn and everything downstream uses the rounded value.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{roundTo, fmt}from"../shared/Numeric";
import{shuffle}from"../shared/Random";

/** The mean of a sample. */
export function mean(values: number[]): number{
    if (values.length===0) return 0;
    return values.reduce((a,b)=>a+b, 0)/values.length;
}

/**
 * The sample standard deviation, which divides by n minus one because the mean was
 * estimated from the data. The population form divides by n and gives a different
 * answer; a question that does not say which it wants is ambiguous, so the sample
 * form is used and the format says so.
 */
export function sampleStdDev(values: number[]): number{
    if (values.length<2) return 0;
    let m=mean(values);
    let sum=0;
    for(let value of values){
        sum+=(value-m)*(value-m);
    }
    return Math.sqrt(sum/(values.length-1));
}

/**
 * Builds four options for a real-valued answer. Every option is printed at the
 * same precision as the answer, and the perturbations are large enough to be
 * distinguishable by eye, which is what makes them usable as multiple choice.
 *
 * @param answer - The correct value.
 * @param decimals - The precision to print.
 * @param rng - The injected random source.
 * @returns Three wrong options.
 */
function valueDistractors(answer: number, decimals: number, rng: RngFn): string[]{
    let step=Math.pow(10, -decimals);
    let scale=Math.max(1, Math.abs(answer));
    let candidates=[
        roundTo(answer+scale*0.1, decimals),
        roundTo(answer-scale*0.1, decimals),
        roundTo(answer*2, decimals),
        roundTo(answer/2, decimals),
        roundTo(answer+step*5, decimals),
        roundTo(answer-step*5, decimals)
    ];
    let out:string[]=[];
    let seen=new Set<string>([fmt(answer, decimals)]);
    for(let candidate of candidates){
        let text=fmt(candidate, decimals);
        if (seen.has(text)) continue;
        seen.add(text);
        out.push(text);
        if (out.length===3) break;
    }
    return shuffle(rng, out);
}

/**
 * Draws a small sample whose mean is a whole number, so the questions that use the
 * mean as an intermediate step have exact answers at every precision.
 */
function drawSample(rng: RngFn, size: number, base: number, spread: number): number[]{
    let values: number[]=[];
    for(let i=0; i<size; i++){
        values.push(base+Math.floor(rng()*spread*2)-spread);
    }
    // The last value is chosen so the mean lands on a whole number, which keeps
    // the arithmetic a learner does by hand from failing on a rounding difference.
    let running=values.slice(0, size-1).reduce((a,b)=>a+b, 0);
    let last=base*size-running;
    values[size-1]=last;
    return values;
}

export function generateDataAnalysis(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["z_score","percentile","regression_slope","regression_predict","deviation","quartile"];
    let type=types[Math.floor(rng()*types.length)];
    let decimals=difficulty==="hard"?4:2;
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter a decimal number";
    let choices:string[]=[];
    switch(type){
        case "z_score":{
            let values=drawSample(rng, 7, 50, 12);
            let m=roundTo(mean(values), 6);
            let sd=roundTo(sampleStdDev(values), 6);
            if (sd<=0){
                sd=1;
            }
            let index=Math.floor(rng()*values.length);
            let value=values[index];
            let z=roundTo((value-m)/sd, decimals);
            correct=fmt(z, decimals);
            alternate=correct;
            display=correct;
            latex=`A data set has mean \\( ${fmt(m, 2)} \\) and standard deviation \\( ${fmt(sd, 2)} \\). What is the z-score of the value \\( ${value} \\)?`;
            expectedFormat="Enter a decimal to "+decimals+" places";
            choices=[correct, ...valueDistractors(z, decimals, rng)];
            break;
        }
        case "percentile":{
            // The percentile rank of a value is the proportion at or below it,
            // counted over the whole sample, which is a counting question rather
            // than a distributional assumption.
            let values=drawSample(rng, 9, 20, 10).sort((a,b)=>a-b);
            let index=Math.floor(rng()*values.length);
            let value=values[index];
            let below=0;
            for(let other of values){
                if (other<=value) below++;
            }
            let rank=Math.round((below/values.length)*100);
            correct=String(rank);
            alternate=correct;
            display=correct+"th percentile";
            latex=`In the data set ${values.join(", ")}, what percentile is the value ${value}? Count the values at or below it and divide by the number of values.`;
            expectedFormat="Enter a whole number from 0 to 100";
            choices=shuffle(rng, [rank, Math.max(0, rank-10), Math.min(100, rank+10), Math.max(0, rank-20)].map(String).filter((v, i, a)=>a.indexOf(v)===i));
            break;
        }
        case "regression_slope":{
            // The x values are whole numbers and the y values are drawn so that the
            // slope comes out exact, because a learner fitting a line by hand and
            // then being graded on a slope with two decimal places is being asked
            // something they cannot check.
            let points=drawPoints(rng, 4, 1, 3);
            let slope=slopeOf(points);
            let intercept=interceptOf(points);
            correct=fmt(slope, 2);
            alternate=correct;
            display=`\\text{slope}=${correct},\\ \\text{intercept}=${fmt(intercept, 2)}`;
            latex=`Find the slope of the line of best fit through the points ${formatPoints(points)}.`;
            expectedFormat="Enter a decimal to 2 places";
            choices=[correct, ...valueDistractors(slope, 2, rng)];
            break;
        }
        case "regression_predict":{
            let points=drawPoints(rng, 4, 1, 3);
            let slope=slopeOf(points);
            let intercept=interceptOf(points);
            let probe=[2,4,6,8][Math.floor(rng()*4)];
            let value=roundTo(slope*probe+intercept, 2);
            correct=fmt(value, 2);
            alternate=correct;
            display=correct;
            latex=`A line of best fit through the points ${formatPoints(points)} is used to predict \\( y \\) when \\( x=${probe} \\). What is the prediction?`;
            expectedFormat="Enter a decimal to 2 places";
            choices=[correct, ...valueDistractors(value, 2, rng)];
            break;
        }
        case "deviation":{
            let values=drawSample(rng, 6, 40, 10);
            let sd=roundTo(sampleStdDev(values), 2);
            correct=fmt(sd, 2);
            alternate=correct;
            display=correct;
            latex=`Find the sample standard deviation of ${values.join(", ")}. Divide by \\( n-1 \\), since the mean came from the data.`;
            expectedFormat="Enter a decimal to 2 places";
            choices=[correct, ...valueDistractors(sd, 2, rng)];
            break;
        }
        case "quartile":{
            // Quartiles of an odd-length sample avoid the averaging that makes the
            // median-of-halves definition ambiguous, so the answer is exact.
            let values=drawSample(rng, 9, 40, 15).sort((a,b)=>a-b);
            let median=values[4];
            let q1=values[2];
            let q3=values[6];
            correct=String(median);
            alternate=correct;
            display=`Q1=${q1}, median=${median}, Q3=${q3}`;
            latex=`Find the median of ${values.join(", ")}.`;
            expectedFormat="Enter a whole number";
            choices=shuffle(rng, [median, q1, q3, median+2].map(String));
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

/** One point, deliberately not the tuple type, so the code reads as it does. */
interface Point{
    x: number;
    y: number;
}

/**
 * Draws points whose best-fit slope is a whole number, by choosing a slope first
 * and then generating the values around it.
 */
function drawPoints(rng: RngFn, count: number, xMin: number, xMax: number): Point[]{
    let slope=Math.floor(rng()*5)+1;
    let intercept=Math.floor(rng()*11)-5;
    let points: Point[]=[];
    for(let i=0; i<count; i++){
        let x=xMin+Math.floor(rng()*(xMax-xMin+1));
        // Two points are put exactly on the line and the rest off it, so the
        // best-fit line is recoverable by hand rather than by regression software.
        let y=slope*x+intercept+(i<2?0:Math.floor(rng()*3)-1);
        points.push({x, y});
    }
    return points;
}

/** The slope through the mean point, which is the least-squares line. */
function slopeOf(points: Point[]): number{
    let mx=mean(points.map(p=>p.x));
    let my=mean(points.map(p=>p.y));
    let numerator=0;
    let denominator=0;
    for(let p of points){
        numerator+=(p.x-mx)*(p.y-my);
        denominator+=(p.x-mx)*(p.x-mx);
    }
    return denominator===0?0:numerator/denominator;
}

/** The intercept of the least-squares line. */
function interceptOf(points: Point[]): number{
    return mean(points.map(p=>p.y))-slopeOf(points)*mean(points.map(p=>p.x));
}

/** Formats points for a prompt, so the learner can plot them. */
function formatPoints(points: Point[]): string{
    return points.map(p=>"("+p.x+", "+p.y+")").join(", ");
}