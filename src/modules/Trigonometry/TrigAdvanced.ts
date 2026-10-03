/**
 * Advanced trigonometry: inverse trig functions, equations, graphs.
 * @fileoverview Generates questions on inverse trigonometric functions, solving trigonometric equations, and interpreting trig graphs. Returns a QuestionDto with LaTeX display, plain text alternate, and plausible wrong answers for MCQ mode.
 * @date 2026-04-18
 */
import type{RngFn, QuestionDto}from "../../types/global";
import{randInt}from"../shared/Random";
import{fourOptions}from"../shared/Options.js";
import{formatPiFraction}from"./TrigUtils.js";
export function generateInverseTrig(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    let types=["arcsin","arccos","arctan"];
    let type=types[Math.floor(rng()*types.length)];
    let hint="", questionText="", correctAnswerStr="", alternateAnswerStr="", displayAnswerStr="";
    let valRange: number;
    if(difficulty==="easy") valRange=2;
    else if(difficulty==="hard") valRange=20;
    else valRange=10;
    let val: number;
    if(type==="arctan"){
        val=Math.floor(rng()*valRange*2)-valRange;
    }
    else{
        if(difficulty==="easy"){
            let simple=[0,0.5,0.707,1];
            val=simple[Math.floor(rng()*simple.length)]*(rng()<0.5?1:-1);
        }
        else{
            val=(Math.floor(rng()*20)/10)-1;
        }
    }
    let principal: number;
    if(type==="arcsin") principal=Math.asin(val);
    else if(type==="arccos") principal=Math.acos(val);
    else principal=Math.atan(val);
    let deg=(principal*180/Math.PI).toFixed(1);
    questionText=`Evaluate \\( ${type}(${val.toFixed(2)}) \\) in radians and degrees. (Principal value)`;
    let exact: string|null=null;
    const exactRadians: Record<string, number>={
        "0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
        "\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
        "\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
        "\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
    };
    for(let [exactStr, rad] of Object.entries(exactRadians)){
        if(Math.abs(principal-rad)<1e-8){
            exact=exactStr;
            break;
        }
    }
    if(exact){
        correctAnswerStr=`${exact} rad, ${deg}°`;
        alternateAnswerStr=`${principal.toFixed(2)} rad, ${deg}°`;
        displayAnswerStr=`\\${exact}\\ \\text{rad},\\ ${deg}^\\circ`;
        hint=`Enter as "x rad, y°" (e.g., "π/6 rad, 30°" or "0.52 rad, 30.0°")`;
    }
    else{
        correctAnswerStr=`${principal.toFixed(2)} rad, ${deg}°`;
        alternateAnswerStr=`${principal.toFixed(2)} rad, ${deg}°`;
        displayAnswerStr=`${principal.toFixed(2)}\\ \\text{rad},\\ ${deg}^\\circ`;
        hint=`Enter as "x rad, y°" (e.g., "0.52 rad, 30.0°")`;
    }
    let choices=[correctAnswerStr];
    let wrongPrincipal=type==="arcsin"?Math.asin(-val):(type==="arccos"?Math.acos(-val):Math.atan(-val));
    let wrongDeg=(wrongPrincipal*180/Math.PI).toFixed(1);
    let wrongExact=null;
    for(let [exactStr, rad] of Object.entries(exactRadians)){
        if(Math.abs(wrongPrincipal-rad)<1e-8){
            wrongExact=exactStr;
            break;
        }
    }
    if(wrongExact){
        choices.push(`${wrongExact} rad, ${wrongDeg}°`);
    }
    else{
        choices.push(`${wrongPrincipal.toFixed(2)} rad, ${wrongDeg}°`);
    }
    choices.push(`${principal.toFixed(2)} rad`);
    choices.push(`${deg}°`);
    choices.push(`undefined`);
    let uniqueChoices=fourOptions(correctAnswerStr, choices);
    return {
        latex: questionText,
        correct: correctAnswerStr,
        alternate: alternateAnswerStr,
        display: displayAnswerStr,
        choices: uniqueChoices,
        expectedFormat: hint
    };
}
export function generateTrigEquations(difficulty?: string, rng: RngFn = Math.random): QuestionDto{
    let types=["basic","multiple_angle","using_identity"];
    let type=types[Math.floor(rng()*types.length)];
    let hint="", questionText="", correctAnswerStr="", alternateAnswerStr="", displayAnswerStr="";
    let choices:string[]=[];
    let maxCoeff=(difficulty==="easy")?2:(difficulty==="hard"?4:3);
    let simpleValues=[0,0.5,Math.sqrt(2)/2,Math.sqrt(3)/2,1];
    let useSimpleValues=(difficulty==="easy");
    switch(type){
        case "basic":{
            let func=rng()<0.5?"sin":"cos";
            let val: number;
            if(useSimpleValues){
                val=simpleValues[Math.floor(rng()*simpleValues.length)];
            }
            else{
                val=(Math.floor(rng()*10)/10);
            }
            val=Math.min(0.99,Math.max(-0.99,val));
            let angle=func==="sin"?Math.asin(val):Math.acos(val);
            let sol=angle;
            if(sol<0) sol+=2*Math.PI;
            questionText=`Solve \\( ${func}\\theta=${val.toFixed(2)} \\) for \\( \\theta \\) in \\( [0, 2\\pi) \\). Give the smallest positive solution.`;
            let exact=null;
            const exactRadians: Record<string, number>={
                "0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
                "\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
                "\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
                "\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
            };
            for(let [exactStr, rad] of Object.entries(exactRadians)){
                if(Math.abs(sol-rad)<1e-8){
                    exact=exactStr;
                    break;
                }
            }
            if(exact){
                correctAnswerStr=exact;
                alternateAnswerStr=sol.toFixed(2);
                displayAnswerStr=`\\${exact}`;
                hint=`Enter exact value like \\frac{\\pi}{6} or decimal (e.g., 0.52)`;
            }
            else{
                correctAnswerStr=sol.toFixed(2);
                alternateAnswerStr=sol.toFixed(2);
                displayAnswerStr=sol.toFixed(2);
                hint=`Enter a decimal (e.g., 0.52)`;
            }
            choices=[correctAnswerStr];
            let wrongAngle=func==="sin"?Math.asin(-val):Math.acos(-val);
            let wrongSol=wrongAngle;
            if(wrongSol<0) wrongSol+=2*Math.PI;
            let wrongExact=null;
            for(let [exactStr, rad] of Object.entries(exactRadians)){
                if(Math.abs(wrongSol-rad)<1e-8){
                    wrongExact=exactStr;
                    break;
                }
            }
            if(wrongExact){
                choices.push(wrongExact);
            }
            else{
                choices.push(wrongSol.toFixed(2));
            }
            let otherSol=2*Math.PI-sol;
            let otherExact=null;
            for(let [exactStr, rad] of Object.entries(exactRadians)){
                if(Math.abs(otherSol-rad)<1e-8){
                    otherExact=exactStr;
                    break;
                }
            }
            if(otherExact){
                choices.push(otherExact);
            }
            else{
                choices.push(otherSol.toFixed(2));
            }
            choices.push(sol.toFixed(2));
            choices.push(sol.toFixed(2)+"π");
            break;
        }
        case "multiple_angle":{
            let func=rng()<0.5?"sin":"cos";
            let coeff=Math.floor(rng()*maxCoeff)+2;
            let val: number;
            if(useSimpleValues){
                val=simpleValues[Math.floor(rng()*simpleValues.length)];
            }
            else{
                val=(Math.floor(rng()*10)/10);
            }
            val=Math.min(0.99,Math.max(-0.99,val));
            let angle=func==="sin"?Math.asin(val):Math.acos(val);
            let base=angle/coeff;
            let sol=base;
            if(sol<0) sol+=2*Math.PI;
            questionText=`Solve \\( ${func}(${coeff}\\theta)=${val.toFixed(2)} \\) for \\( 0 \\le \\theta < 2\\pi \\). Give the smallest positive solution.`;
            let exact=null;
            const exactRadians: Record<string, number>={
                "0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
                "\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
                "\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
                "\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
            };
            for(let [exactStr, rad] of Object.entries(exactRadians)){
                if(Math.abs(sol-rad)<1e-8){
                    exact=exactStr;
                    break;
                }
            }
            if(exact){
                correctAnswerStr=exact;
                alternateAnswerStr=sol.toFixed(2);
                displayAnswerStr=`\\${exact}`;
                hint=`Enter exact value like \\frac{\\pi}{6} or decimal (e.g., 0.52)`;
            }
            else{
                correctAnswerStr=sol.toFixed(2);
                alternateAnswerStr=sol.toFixed(2);
                displayAnswerStr=sol.toFixed(2);
                hint=`Enter a decimal (e.g., 0.52)`;
            }
            choices=[correctAnswerStr];
            let wrongBase=(Math.PI-angle)/coeff;
            let wrongSol=wrongBase;
            if(wrongSol<0) wrongSol+=2*Math.PI;
            let wrongExact=null;
            for(let [exactStr, rad] of Object.entries(exactRadians)){
                if(Math.abs(wrongSol-rad)<1e-8){
                    wrongExact=exactStr;
                    break;
                }
            }
            if(wrongExact){
                choices.push(wrongExact);
            }
            else{
                choices.push(wrongSol.toFixed(2));
            }
            let otherSol=sol+2*Math.PI/coeff;
            if(otherSol<2*Math.PI){
                let otherExact=null;
                for(let [exactStr, rad] of Object.entries(exactRadians)){
                    if(Math.abs(otherSol-rad)<1e-8){
                        otherExact=exactStr;
                        break;
                    }
                }
                if(otherExact){
                    choices.push(otherExact);
                }
                else{
                    choices.push(otherSol.toFixed(2));
                }
            }
            choices.push(sol.toFixed(2));
            choices.push(sol.toFixed(2)+"π");
            break;
        }
        case "using_identity":{
            let c: number;
            if(useSimpleValues){
                c=0.25;
            }
            else{
                c=(Math.floor(rng()*8)+1)/16;
            }
            questionText=`Solve \\( \\sin^2\\theta=${c.toFixed(2)} \\) for \\( 0 \\le \\theta < 2\\pi \\). Give the smallest positive solution.`;
            let baseAngle=Math.asin(Math.sqrt(c));
            let sol=baseAngle;
            if(sol<0) sol+=2*Math.PI;
            let exact=null;
            const exactRadians: Record<string, number>={
                "0":0, "\\frac{\\pi}{6}":Math.PI/6, "\\frac{\\pi}{4}":Math.PI/4, "\\frac{\\pi}{3}":Math.PI/3,
                "\\frac{\\pi}{2}":Math.PI/2, "\\frac{2\\pi}{3}":2*Math.PI/3, "\\frac{3\\pi}{4}":3*Math.PI/4, "\\frac{5\\pi}{6}":5*Math.PI/6,
                "\\pi":Math.PI, "\\frac{7\\pi}{6}":7*Math.PI/6, "\\frac{5\\pi}{4}":5*Math.PI/4, "\\frac{4\\pi}{3}":4*Math.PI/3,
                "\\frac{3\\pi}{2}":3*Math.PI/2, "\\frac{5\\pi}{3}":5*Math.PI/3, "\\frac{7\\pi}{4}":7*Math.PI/4, "\\frac{11\\pi}{6}":11*Math.PI/6
            };
            for(let [exactStr, rad] of Object.entries(exactRadians)){
                if(Math.abs(sol-rad)<1e-8){
                    exact=exactStr;
                    break;
                }
            }
            if(exact){
                correctAnswerStr=exact;
                alternateAnswerStr=sol.toFixed(2);
                displayAnswerStr=`\\${exact}`;
                hint=`Enter exact value like \\frac{\\pi}{6} or decimal (e.g., 0.52)`;
            }
            else{
                correctAnswerStr=sol.toFixed(2);
                alternateAnswerStr=sol.toFixed(2);
                displayAnswerStr=sol.toFixed(2);
                hint=`Enter a decimal (e.g., 0.52)`;
            }
            choices=[correctAnswerStr];
            let wrongBase=Math.asin(-Math.sqrt(c));
            let wrongSol=wrongBase;
            if(wrongSol<0) wrongSol+=2*Math.PI;
            let wrongExact=null;
            for(let [exactStr, rad] of Object.entries(exactRadians)){
                if(Math.abs(wrongSol-rad)<1e-8){
                    wrongExact=exactStr;
                    break;
                }
            }
            if(wrongExact){
                choices.push(wrongExact);
            }
            else{
                choices.push(wrongSol.toFixed(2));
            }
            let otherSol=Math.PI-sol;
            let otherExact=null;
            for(let [exactStr, rad] of Object.entries(exactRadians)){
                if(Math.abs(otherSol-rad)<1e-8){
                    otherExact=exactStr;
                    break;
                }
            }
            if(otherExact){
                choices.push(otherExact);
            }
            else{
                choices.push(otherSol.toFixed(2));
            }
            choices.push(sol.toFixed(2));
            choices.push(sol.toFixed(2)+"π");
            break;
        }
    }
    let uniqueChoices=fourOptions(correctAnswerStr, choices);
    return {
        latex: questionText,
        correct: correctAnswerStr,
        alternate: alternateAnswerStr,
        display: displayAnswerStr,
        choices: uniqueChoices,
        expectedFormat: hint
    };
}
export function generateTrigGraphs(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["sine","cosine","tangent"];
    let type=types[Math.floor(rng()*types.length)];
    let maxA=difficulty==="easy"?2:(difficulty==="hard"?5:3);
    let maxB=difficulty==="easy"?2:(difficulty==="hard"?4:3);
    let A=0;
    let B=0;
    // The four numbers a learner can read off a y = a·sin(bx + c) graph are the amplitude
    // a, the frequency b, the peak-to-peak distance 2a and the half-amplitude a/2, and an
    // amplitude question draws its three wrong options from the last three. Those four
    // numbers are only distinct when none of them equals another, which small integers
    // frequently violate, so the pair is redrawn until the four readings are distinct.
    // The loop is bounded and its last pair is used regardless, because a graph with a
    // colliding reading is still a graph, and a bounded fallback is required rather than
    // a spin.
    for(let attempt=0; attempt<20; attempt++){
        A=randInt(rng, 2, maxA+3);
        B=randInt(rng, 1, maxB);
        let readings=[A, 2*A, A/2, B];
        if (new Set(readings).size===readings.length) break;
    }
    // The vertical shift is a quarter or a half turn, so the phase shift it produces is
    // itself a fraction of pi and the exact value the graph shows is exact.
    let quarterTurns=randInt(rng, 0, 2);
    let C=quarterTurns*Math.PI/4;
    let questionText="", correctAnswerStr="", alternateAnswerStr="", displayAnswerStr="", hint="";
    let choices:string[]=[];
    // A period and a phase shift are both angles, so both are printed and offered as exact
    // fractions of pi. A branch that offered the same period as a fraction in one option and
    // as a rounded decimal in the next put two spellings of one value in a single set.
    let angleText=(radians: number): string=>formatPiFraction(radians);
    switch(type){
        case "sine":
        case "cosine":{
            let askType=Math.floor(rng()*3);
            if(askType===0){
                questionText=`What is the amplitude of the graphed ${type} function?`;
                correctAnswerStr=A.toString();
                alternateAnswerStr=correctAnswerStr;
                displayAnswerStr=correctAnswerStr;
                hint="Enter a number";
                // The three ways a learner misreads an amplitude are to report the frequency,
                // to report the peak-to-peak distance, and to report half the amplitude. Each
                // is a number that can be measured off the graph they are looking at, and the
                // draw above guarantees all four are distinct.
                choices=fourOptions(correctAnswerStr, [(2*A).toString(), (A/2).toString(), B.toString()]);
            }
            else if(askType===1){
                let period=2*Math.PI/B;
                questionText=`What is the period of the graphed ${type} function? (in radians)`;
                correctAnswerStr=angleText(period);
                alternateAnswerStr=period.toFixed(2);
                displayAnswerStr=`\\${correctAnswerStr}`;
                hint="Enter an exact value like 2π/3";
                // A period question goes wrong by reading a different frequency off the graph,
                // by halving the period, or by using the tangent period. Each is the period of
                // a real graph, so each is a value a learner writes after real work. The
                // frequency table never contains zero, which is what stops a frequency of one
                // from producing a period of 2π/0.
                let wrongPeriods: number[]=[];
                for(let other=1; other<=6; other++){
                    if(other===B) continue;
                    wrongPeriods.push(2*Math.PI/other);
                }
                wrongPeriods.push(period/2);
                wrongPeriods.push(Math.PI/B);
                wrongPeriods.push(2*Math.PI);
                choices=fourOptions(correctAnswerStr, wrongPeriods.map(value=>angleText(value)));
            }
            else{
                let phaseShift=-C/B;
                questionText=`What is the phase shift of the graphed ${type} function? (in radians)`;
                correctAnswerStr=angleText(phaseShift);
                alternateAnswerStr=phaseShift.toFixed(2);
                displayAnswerStr=`\\${correctAnswerStr}`;
                hint="Enter an exact value like π/6";
                // A phase shift goes wrong by dropping the vertical shift, by forgetting to
                // divide by the frequency, by reading the shift in the other direction, and
                // by reading the shift of a graph with no frequency at all. Each is a phase
                // shift a real graph has. The pool spans a whole turn and a half in each
                // direction because a graph whose shift is a whole quarter turn has only
                // three distinct relatives inside one turn, and a four-option question
                // needs a fourth.
                let wrongShifts: number[]=[];
                for(let turn=-6; turn<=6; turn++){
                    wrongShifts.push(phaseShift+turn*Math.PI/2);
                }
                wrongShifts.push(-C, C/B, -C/B, phaseShift*2, phaseShift/2, phaseShift*3, -phaseShift);
                choices=fourOptions(correctAnswerStr, wrongShifts.map(value=>angleText(value)));
            }
            break;
        }
        case "tangent":{
            let askType=Math.floor(rng()*2);
            if(askType===0){
                let period=Math.PI/B;
                questionText=`What is the period of the graphed tangent function? (in radians)`;
                correctAnswerStr=angleText(period);
                alternateAnswerStr=period.toFixed(2);
                displayAnswerStr=`\\${correctAnswerStr}`;
                hint="Enter an exact value like π/2";
                // As above: a neighboring frequency, the halved period, and the sine period the
                // learner reaches for when they forget that tangent repeats twice as fast.
                let wrongPeriods: number[]=[];
                for(let other=1; other<=6; other++){
                    if(other===B) continue;
                    wrongPeriods.push(Math.PI/other);
                }
                wrongPeriods.push(period/2);
                wrongPeriods.push(2*Math.PI/B);
                wrongPeriods.push(2*Math.PI);
                choices=fourOptions(correctAnswerStr, wrongPeriods.map(value=>angleText(value)));
            }
            else{
                let period=Math.PI/B;
                // The vertical asymptotes of y = A·tan(Bx + C) are a quarter turn apart, so
                // the first one to the right of the origin sits at (π/2 - C)/B. The pool is
                // the rest of that family, plus the two asymptotes a learner reaches for by
                // dropping the vertical shift and by dropping the frequency. Building it
                // from the family rather than from two or three hand-named candidates is
                // what keeps the question at four options: with a small frequency the
                // hand-named list is almost entirely the key repeated.
                let firstAsymptote=(Math.PI/2-C)/B;
                while(firstAsymptote<=0) firstAsymptote+=period;
                questionText=`Give the equation of the first vertical asymptote of the graphed tangent function to the right of the origin (in radians).`;
                correctAnswerStr=`x=${angleText(firstAsymptote)}`;
                alternateAnswerStr=`x=${firstAsymptote.toFixed(2)}`;
                displayAnswerStr=`x=\\${angleText(firstAsymptote)}`;
                let candidates: number[]=[Math.PI/2, Math.PI/(2*B), -firstAsymptote];
                for(let k=-3; k<=6; k++){
                    candidates.push((Math.PI/2+k*Math.PI-C)/B);
                    candidates.push((Math.PI/2+k*Math.PI)/B);
                }
                let kept: string[]=[];
                for(let candidate of candidates){
                    if(candidate<=0) continue;
                    kept.push(`x=${angleText(candidate)}`);
                }
                choices=fourOptions(correctAnswerStr, kept);
                hint="Enter as 'x = ...'";
            }
            break;
        }
    }
    return {
        latex: questionText,
        correct: correctAnswerStr,
        alternate: alternateAnswerStr,
        display: displayAnswerStr,
        choices: choices,
        expectedFormat: hint,
        visualization: {shape:"graph", params:{fn: type, a: A, b: B, c: C}}
    };
}