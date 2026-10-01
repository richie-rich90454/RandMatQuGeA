/**
 * @file Similar triangles: proportional sides, scale factor, area and perimeter
 * ratios, and the converse of the triangle proportionality theorem.
 * @description Similarity is one fact stated three ways. A scale factor takes a
 * length to k times itself, a perimeter to k times itself, and an area to k
 * squared times itself. Every answer here is therefore built in whole numbers:
 * the scale factor is a whole number, the base and height behind an area are
 * drawn so that half their product is whole, and the halves in the converse
 * branch come from a triangle whose sides were drawn before they were doubled.
 * Nothing is rounded, so the numbers printed in a prompt are the numbers graded.
 *
 * The distractors are the answers to the two mistakes that actually happen:
 * applying the linear factor to an area, and taking a ratio of corresponding
 * sides in the wrong direction.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{shuffle}from"../shared/Random";

/**
 * Draws three side lengths that satisfy the triangle inequality.
 *
 * @param rng - The injected random source.
 * @param min - The smallest side to draw.
 * @param max - The largest side to draw.
 * @returns Side lengths forming a non-degenerate triangle, or the three smallest
 *          legal lengths when the bounded search finds none.
 */
function drawTriangle(rng: RngFn, min: number, max: number): [number, number, number]{
    for(let attempt=0; attempt<64; attempt++){
        let a=Math.floor(rng()*(max-min+1))+min;
        let b=Math.floor(rng()*(max-min+1))+min;
        let c=Math.floor(rng()*(max-min+1))+min;
        if (a+b>c&&a+c>b&&b+c>a) return [a, b, c];
    }
    return [min, min+1, min+2];
}

/**
 * Builds exactly four options around a whole-number answer.
 *
 * @param rng - The injected random source.
 * @param key - The correct answer.
 * @param wrong - Candidate wrong answers, each already a whole number.
 * @returns The key and three distinct wrong options, shuffled.
 */
function fourOptions(rng: RngFn, key: number, wrong: number[]): string[]{
    let keyText=String(key);
    let picked:string[]=[];
    for(let candidate of wrong){
        let text=String(candidate);
        if (text===keyText||picked.indexOf(text)>=0) continue;
        picked.push(text);
        if (picked.length===3) break;
    }
    // A draw whose candidate mistakes all collide leaves the set short of four
    // options, so the ladder walks away from the key instead. The bound is
    // forty because an unbounded loop would hang the oracle suite.
    for(let step=1; picked.length<3&&step<=40; step++){
        let text=String(key+step);
        if (text===keyText||picked.indexOf(text)>=0) continue;
        picked.push(text);
    }
    return shuffle(rng, [keyText, ...picked]);
}

export function generateSimilarSimilarity(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["proportional_sides","scale_factor","area_ratio","perimeter_ratio","scale_from_area","converse_proportionality"];
    let type=types[Math.floor(rng()*types.length)];
    let sideMax=difficulty==="hard"?40:difficulty==="easy"?14:24;
    let sideMin=difficulty==="easy"?3:difficulty==="hard"?6:4;
    let scaleMax=difficulty==="hard"?6:difficulty==="easy"?3:4;
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let expectedFormat="Enter a whole number";
    switch(type){
        case "proportional_sides":{
            // DE is stated to correspond to AB, so the answer scales AB and not
            // the side that happens to sit second in the destructured triple.
            let [a, b, c]=drawTriangle(rng, sideMin, sideMax);
            let k=Math.floor(rng()*scaleMax)+2;
            key=k*a;
            latex=`Triangle \\( ABC \\) has sides \\( AB = ${a} \\), \\( AC = ${b} \\) and \\( BC = ${c} \\). Triangle \\( DEF \\) is similar to \\( ABC \\) with scale factor \\( ${k} \\), where \\( D \\) corresponds to \\( A \\) and \\( E \\) to \\( B \\). Find \\( DE \\).`;
            wrong=[k*b, k*c, key+1, key-1];
            break;
        }
        case "scale_factor":{
            let [a, b]=drawTriangle(rng, sideMin, sideMax);
            let k=Math.floor(rng()*scaleMax)+2;
            let image=k*a;
            key=image/a;
            latex=`Triangle \\( ABC \\) has sides \\( AB = ${a} \\) and \\( AC = ${b} \\). Triangle \\( DEF \\) is similar to \\( ABC \\), side \\( DE \\) corresponds to side \\( AB \\), and \\( DE = ${image} \\). What is the scale factor that takes \\( ABC \\) to \\( DEF \\)?`;
            wrong=[image-a, image+a, a*b, k+1];
            break;
        }
        case "area_ratio":{
            // The height is drawn even so that half the base times the height is a
            // whole number, which is what lets the area and the squared factor
            // both stay whole and nothing be rounded.
            let base=Math.floor(rng()*sideMax)+2;
            let height=(Math.floor(rng()*sideMax)+1)*2;
            let k=Math.floor(rng()*scaleMax)+2;
            let area=base*height/2;
            key=area*k*k;
            latex=`Triangle \\( ABC \\) has base \\( ${base} \\) and height \\( ${height} \\). Triangle \\( DEF \\) is similar to \\( ABC \\) with scale factor \\( ${k} \\). Find the area of triangle \\( DEF \\).`;
            wrong=[area, area*k, key*2, key+1];
            break;
        }
        case "perimeter_ratio":{
            let [a, b, c]=drawTriangle(rng, sideMin, sideMax);
            let k=Math.floor(rng()*scaleMax)+2;
            let first=a+b+c;
            key=first*k;
            latex=`Triangle \\( ABC \\) has sides \\( ${a} \\), \\( ${b} \\) and \\( ${c} \\). Triangle \\( DEF \\) is similar to \\( ABC \\) with scale factor \\( ${k} \\). Find the perimeter of triangle \\( DEF \\).`;
            wrong=[first, key+k, key-1, first*k*k];
            break;
        }
        case "scale_from_area":{
            let a=Math.floor(rng()*sideMax)+2;
            let k=Math.floor(rng()*scaleMax)+2;
            let areaOne=Math.floor(rng()*40)+6;
            let areaTwo=areaOne*k*k;
            key=a*k;
            latex=`Triangles \\( ABC \\) and \\( DEF \\) are similar. Triangle \\( ABC \\) has area \\( ${areaOne} \\) and side \\( AB = ${a} \\). Triangle \\( DEF \\) has area \\( ${areaTwo} \\), and its side \\( DE \\) corresponds to side \\( AB \\). Find \\( DE \\).`;
            wrong=[a*k*k, a+k, key-1, a+k*k];
            break;
        }
        case "converse_proportionality":{
            // Halving every side of a drawn triangle keeps the triangle valid and
            // puts the two division points on whole numbers, so the segment the
            // converse makes parallel to the third side has a whole length.
            let [x, y, z]=drawTriangle(rng, sideMin, sideMax);
            let ab=2*x;
            let ac=2*y;
            let bc=2*z;
            key=z;
            latex=`Triangle \\( ABC \\) has \\( AB = ${ab} \\), \\( AC = ${ac} \\) and \\( BC = ${bc} \\). Point \\( D \\) lies on \\( AB \\) with \\( AD = ${x} \\), and point \\( E \\) lies on \\( AC \\) with \\( AE = ${y} \\). Both sides are divided in the same proportion, so by the converse of the triangle proportionality theorem \\( DE \\) is parallel to \\( BC \\). Find the length of \\( DE \\).`;
            wrong=[bc, x, y, x+y];
            break;
        }
    }
    let keyText=String(key);
    return {latex, correct:keyText, alternate:keyText, display:keyText, choices:fourOptions(rng, key, wrong), expectedFormat, subskill:type};
}