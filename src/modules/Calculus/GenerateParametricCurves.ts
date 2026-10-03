/**
 * @file Curves given as a pair of parametric equations: the slope, the arc length,
 * the curvature and the point of a horizontal tangent.
 * @description Every answer here is a whole number, and that constrains the draws
 * rather than the output. The slope is asked at a chosen parameter value and the
 * linear coefficient is then set so that the quotient divides exactly. The arc
 * length uses a Pythagorean pair, so the speed is a whole number and the length
 * over an integer interval is too. The curvature uses a circle, whose curvature
 * is exactly the reciprocal of its radius, or a straight line, whose curvature is
 * exactly zero.
 *
 * `x = at + b` and `y = ct^2 + dt + e` is the family the slope and the
 * horizontal-tangent branches use: both are polynomials in one parameter, so the
 * derivative is a polynomial and solving it is arithmetic rather than a guess.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";
import{fmt}from"../shared/Numeric.js";

/**
 * Writes a polynomial as LaTeX, putting each sign in its operator, dropping a
 * zero coefficient, and writing a coefficient of one as nothing so that `2t - 1`
 * never prints as `2t + -1` or `2t - 1 + 0`.
 *
 * @param terms - The coefficients with the body each one multiplies.
 * @returns The polynomial as LaTeX.
 */
function polynomial(terms:{value: number, body: string}[]): string{
    let out="";
    for(let term of terms){
        if (term.value===0) continue;
        let body=Math.abs(term.value)===1&&term.body!==""?term.body:Math.abs(term.value)+term.body;
        if (out==="") out=(term.value<0?"-":"")+body;
        else out=out+(term.value<0?" - ":" + ")+body;
    }
    return out;
}

export function generateParametricCurves(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["dy_dx","arc_length_of_a_curve","curvature","horizontal_tangent"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let decimals=0;
    let expectedFormat="Enter a whole number";
    let display="";
    let rungs:string[]=[];
    let steps:string[]=[];
    if (type==="dy_dx"){
        // `x' = a` and `y' = 2ct + d`. The linear coefficient `d` is chosen so that
        // `2ct + d` is an exact multiple of `a` at the requested parameter, which is
        // what keeps the printed quotient a whole number.
        let speed=randInt(rng, 1, wide?3:1)*2;
        let at=randInt(rng, 1, wide?3:2);
        let c=randInt(rng, 1, wide?4:2);
        // The slope is nudged off the handful of values that would make one of the
        // five wrong options collapse onto the key, so the option set names four
        // distinct mistakes rather than three plus a filler. The nudge is bounded.
        let slope=randInt(rng, -3, 5);
        for(let attempt=0; attempt<12; attempt++){
            if (slope!==2*c*at&&slope!==2*c&&slope!==speed&&slope*(speed-1)!==2*c*at) break;
            slope+=1;
        }
        let d=speed*slope-2*c*at;
        let shift=randInt(rng, -3, 3);
        let constant=randInt(rng, -4, 4);
        key=slope;
        latex=`A curve is given by \\( x = ${polynomial([{value: speed, body: "t"}, {value: shift, body: ""}])} \\) and \\( y = ${polynomial([{value: c, body: "t^{2}"}, {value: d, body: "t"}, {value: constant, body: ""}])} \\). Find \\( \\frac{dy}{dx} \\) at \\( t = ${at} \\).`;
        wrong=[2*c*at, 2*c, d, speed, 2*c*at+d, speed*at];
        display=`\\frac{dy}{dx} = \\frac{${2*c}t ${d<0?"- ":"+ "}${Math.abs(d)}}{${speed}}`;
        rungs=[
            "For a parametric curve the slope is the ratio of the two rates: differentiate each coordinate with respect to the parameter and divide the y rate by the x rate.",
            `The x rate is \\( ${speed} \\) and the y rate is \\( ${2*c}t ${d<0?"- ":"+ "}${Math.abs(d)} \\), so divide those at \\( t = ${at} \\).`
        ];
        steps=[
            `$ \\dfrac{dx}{dt} = ${speed} $ and $ \\dfrac{dy}{dt} = ${2*c}t ${d<0?"- ":"+ "}${Math.abs(d)} $.`,
            `At $ t = ${at} $ the y rate is $ ${2*c}(${at}) ${d<0?"- ":"+ "}${Math.abs(d)} = ${2*c*at+d} $ and the x rate is $ ${speed} $.`,
            `So $ \\frac{dy}{dx} = ${2*c*at+d} / ${speed} = ${key} $, and the answer is ${key}.`
        ];
    }
    else if (type==="arc_length_of_a_curve"){
        // A Pythagorean pair makes the speed a whole number, so the arc length over
        // an integer interval is a whole number and nothing is rounded.
        let triples=[[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
        let triple=triples[Math.floor(rng()*triples.length)];
        let lo=randInt(rng, -3, 2);
        let hi=lo+randInt(rng, 2, wide?8:5);
        let span=hi-lo;
        key=triple[2]*span;
        latex=`A curve is given by \\( x = ${triple[0]}t + 1 \\) and \\( y = ${triple[1]}t - 2 \\) for \\( ${lo} \\le t \\le ${hi} \\). Find the arc length of the curve over that interval.`;
        wrong=[span, triple[0]*span, triple[1]*span, (triple[0]+triple[1])*span, triple[2]*span*2];
        display=`\\sqrt{${triple[0]}^{2} + ${triple[1]}^{2}} = ${triple[2]}`;
        rungs=[
            "The arc length of a parametric curve is the integral of the speed, and the speed is the square root of the sum of the squares of the two coordinate rates.",
            `Both coordinate rates are constant here, so the speed is \\( \\sqrt{${triple[0]}^{2} + ${triple[1]}^{2}} = ${triple[2]} \\) and the length is that speed times the width of the parameter interval.`
        ];
        steps=[
            `$ \\dfrac{dx}{dt} = ${triple[0]} $ and $ \\dfrac{dy}{dt} = ${triple[1]} $, so the speed is $ \\sqrt{${triple[0]}^{2} + ${triple[1]}^{2}} = \\sqrt{${triple[0]*triple[0]+triple[1]*triple[1]}} = ${triple[2]} $.`,
            `$ L = \\int_{${lo}}^{${hi}} ${triple[2]} \\, dt = ${triple[2]} \\times (${hi} - ${lo}) = ${triple[2]} \\times ${span} $.`,
            `So $ L = ${key} $, and the answer is ${key}.`
        ];
    }
    else if (type==="curvature"){
        if (rng()<0.5){
            // A circle travelled at unit speed has curvature exactly its reciprocal
            // radius, and a straight line has curvature exactly zero. Both are exact
            // without a rounding decision.
            let radii=[2, 4, 5, 8];
            let radius=radii[Math.floor(rng()*radii.length)];
            key=1/radius;
            latex=`The curve \\( x = ${radius}\\cos(t) \\), \\( y = ${radius}\\sin(t) \\) is a circle of radius ${radius} traversed once. What is its curvature?`;
            wrong=[radius, 2/radius, radius/2, 1/(radius*radius), radius*2];
            decimals=3;
            display=`\\kappa = \\frac{1}{${radius}}`;
            rungs=[
                "The curvature of a circle is the reciprocal of its radius, and the formula built from the rates reproduces that exactly.",
                `The curve is a circle of radius ${radius}, and its speed is ${radius} with a centripetal rate of ${radius}, so \\( \\kappa = ${radius} / ${radius}^{2} = 1 / ${radius} \\).`
            ];
            steps=[
                `$ \\dfrac{dx}{dt} = -${radius}\\sin(t) $, $ \\dfrac{dy}{dt} = ${radius}\\cos(t) $, $ \\dfrac{d^{2}x}{dt^{2}} = -${radius}\\cos(t) $ and $ \\dfrac{d^{2}y}{dt^{2}} = -${radius}\\sin(t) $.`,
                `The numerator is $ x'y'' - y'x'' = ${radius*radius} $ and the denominator is $ (x'^{2} + y'^{2})^{3/2} = (${radius*radius})^{3/2} = ${radius*radius*radius} $.`,
                `So $ \\kappa = ${radius*radius} / ${radius*radius*radius} = ${fmt(key, 3)} $, and the answer is ${fmt(key, 3)}.`
            ];
            expectedFormat="Enter a decimal rounded to three decimal places";
        }
        else{
            let a=randInt(rng, 2, wide?9:4);
            let b=randInt(rng, 1, wide?9:4);
            if (a===b) b=b+1;
            key=0;
            latex=`The curve \\( x = ${a}t + 1 \\), \\( y = ${b}t - 2 \\) is a straight line. What is its curvature?`;
            wrong=[1, -1, a, b, 2];
            display="\\kappa = 0";
            rungs=[
                "Curvature measures how fast the direction of the curve turns, so a straight line turns not at all and its curvature is zero.",
                `Both coordinate rates are constant, so both second derivatives are zero and the curvature formula has a zero numerator.`
            ];
            steps=[
                `$ \\dfrac{dx}{dt} = ${a} $, $ \\dfrac{dy}{dt} = ${b} $, and both second derivatives are $ 0 $.`,
                `The curvature is $ \\dfrac{x'y'' - y'x''}{(x'^{2} + y'^{2})^{3/2}} = \\dfrac{${a} \\cdot 0 - ${b} \\cdot 0}{(${a* a} + ${b*b})^{3/2}} $.`,
                `The numerator is zero, so $ \\kappa = ${key} $, and the answer is ${key}.`
            ];
        }
    }
    else{
        // A horizontal tangent needs `y'` to vanish while `x'` does not. With
        // `y = ct^2 + dt + e` that means `2ct + d = 0`, so `d` is set to `-2cT` for a
        // chosen whole number `T`.
        let c=randInt(rng, 1, wide?4:2);
        let at=randInt(rng, -3, wide?4:2);
        if (at===0) at=1;
        let a=randInt(rng, 1, wide?5:3);
        let shift=randInt(rng, -3, 3);
        let d=-2*c*at;
        let constant=randInt(rng, -4, 4);
        key=at;
        latex=`A curve is given by \\( x = ${polynomial([{value: a, body: "t"}, {value: shift, body: ""}])} \\) and \\( y = ${polynomial([{value: c, body: "t^{2}"}, {value: d, body: "t"}, {value: constant, body: ""}])} \\). Find every value of \\( t \\) at which the curve has a horizontal tangent.`;
        wrong=[-at, -d, 2*c, -d/c, at+1];
        display=`y' = ${2*c}t ${d<0?"- ":"+ "}${Math.abs(d)} = 0`;
        rungs=[
            "A horizontal tangent means the slope is zero, which for a parametric curve means the y rate is zero while the x rate is not. Solve the y rate for the parameter and check the x rate there.",
            `The slope is \\( y' / x' \\), so set \\( ${2*c}t ${d<0?"- ":"+ "}${Math.abs(d)} \\) to zero and confirm that \\( x' = ${a} \\) is not zero at that parameter.`
        ];
        steps=[
            `$ \\dfrac{dx}{dt} = ${a} \\ne 0 $ and $ \\dfrac{dy}{dt} = ${2*c}t ${d<0?"- ":"+ "}${Math.abs(d)} $, so $ \\dfrac{dy}{dx} = 0 $ exactly when $ ${2*c}t ${d<0?"- ":"+ "}${Math.abs(d)} = 0 $.`,
            `Solving gives $ t = ${-d}/(${2*c}) = ${at} $, and at that parameter the x rate is still $ ${a} \\ne 0 $, so the tangent really is horizontal.`,
            `The only such value is $ t = ${key} $, and the answer is ${key}.`
        ];
    }
    let text=fmt(key, decimals);
    return {
        latex,
        correct: text,
        alternate: text,
        display,
        choices: numberOptions(key, wrong, decimals),
        expectedFormat,
        subskill: type,
        hints: {rungs, concede: "The answer is "+text+"."},
        solution: steps
    };
}