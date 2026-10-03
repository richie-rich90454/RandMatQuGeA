/**
 * @file Optimizing a function on an interval, and reading what the optimum means.
 * @description Every answer in this file is a whole number computed in integer
 * arithmetic. A parabola in vertex form, `f(x) = a(x - h)^2 - k`, has integer
 * values at every integer point, so the critical point, the value at an endpoint
 * and the extreme value on a closed interval are all integers and nothing is
 * rounded. The two applied branches are drawn so that the optimum is a whole
 * number for the same reason: the fence length is a multiple of four, and the
 * square sheet is a multiple of six.
 *
 * The branches are the four decisions an optimization question actually makes:
 * find the critical point, find the extreme value on a closed interval, discover
 * that the critical point is outside the interval so only the endpoints are
 * candidates, and translate the number into the physical quantity it measures.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";
import{fmtTrim}from"../shared/Numeric.js";

/**
 * Evaluates the vertex-form parabola `a(x - h)^2 - k` at an integer point, in
 * integer arithmetic, so that no value printed anywhere in this file is the
 * result of a rounding decision.
 *
 * @param a - The quadratic coefficient, already carrying its sign.
 * @param h - The vertex abscissa.
 * @param k - The vertical offset, subtracted.
 * @param x - Where to evaluate.
 * @returns The value of the parabola at `x`.
 */
function parabola(a: number, h: number, k: number, x: number): number{
    let offset=x-h;
    return a*offset*offset-k;
}

export function generateOptimization(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["critical_points","closed_interval","endpoint_comparison","interpret_the_maximum"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    let display="";
    switch(type){
        case "critical_points":{
            // A single critical point means the parabola is written in vertex form,
            // so the learner reads the shift off the bracket rather than solving a
            // quadratic. The sign of the quadratic coefficient is left to the draw
            // because it decides whether the point is a maximum or a minimum, and a
            // question about the abscissa must not depend on that.
            let a=randInt(rng, wide?3:1, wide?9:3);
            let h=randInt(rng, -6, wide?11:8);
            let k=randInt(rng, 2, wide?48:16);
            let negative=rng()<0.5;
            let coefficient=negative?-a:a;
            key=h;
            latex=`The function \\( f(x) = ${coefficient}(x - ${h})^{2} - ${k} \\) has exactly one critical point. What is its \\( x \\)-coordinate?`;
            // The three ways the abscissa is misread: the bracket is read with its
            // sign reversed, or the constant outside the bracket is taken for the
            // shift.
            wrong=[-h, k, h+coefficient, h-1, h+1];
            display=`f'(x) = ${2*coefficient}(x - ${h}) = 0`;
            rungs=[
                "Differentiate, solve for where the derivative vanishes, and read the abscissa from the linear equation you get. Do not read it straight off the bracket without checking the derivative.",
                `Differentiating gives \\( f'(x) = ${2*coefficient}(x - ${h}) \\), so the derivative is zero where \\( x - ${h} = 0 \\).`
            ];
            steps=[
                `Differentiate: $ f'(x) = ${2*coefficient}(x - ${h}) $.`,
                `$ f'(x) = 0 $ when $ x - ${h} = 0 $, so $ x = ${h} $.`,
                `The critical point has $ x $-coordinate ${h}, so the answer is ${key}.`
            ];
            break;
        }
        case "closed_interval":{
            // The vertex sits strictly inside the interval, so the extreme value on
            // the closed interval is the vertex value and the two endpoints are
            // honest but wrong candidates.
            let a=randInt(rng, 1, wide?7:3);
            let h=randInt(rng, -5, wide?9:5);
            let k=randInt(rng, 3, wide?60:20);
            let radius=randInt(rng, wide?3:2, wide?9:6);
            let lo=h-radius;
            let hi=h+radius;
            let left=parabola(a, h, k, lo);
            let right=parabola(a, h, k, hi);
            key=-k;
            latex=`For \\( f(x) = ${a}(x - ${h})^{2} - ${k} \\), find the minimum value of \\( f \\) on the closed interval \\( [${lo}, ${hi}] \\).`;
            wrong=[left, -k+a, -k-a, left-a, right+a];
            display=`f(${h}) = -${k}`;
            rungs=[
                "On a closed interval the extreme value is the smallest or largest of three numbers: the value at the critical point and the values at the two endpoints. Evaluate all three and compare.",
                `The only critical point is $ x = ${h} $, which lies between ${lo} and ${hi}, so evaluate $ f \\) at ${lo}, ${h} and ${hi}.`
            ];
            steps=[
                `$ f'(x) = ${2*a}(x - ${h}) $, so the only critical point is $ x = ${h} $, and ${lo} < ${h} < ${hi} $.`,
                `$ f(${lo}) = ${a}(${lo} - ${h})^{2} - ${k} = ${left} $ and $ f(${hi}) = ${a}(${hi} - ${h})^{2} - ${k} = ${right} $ and $ f(${h}) = -${k} $.`,
                `The smallest of ${left}, ${right} and ${key} is ${key}, so the minimum value on the interval is ${key}.`
            ];
            break;
        }
        case "endpoint_comparison":{
            // The vertex is off the interval entirely, so the only candidates are
            // the endpoints. Offering the vertex value is the honest distractor:
            // it is what a learner gets from solving f'(x) = 0 and forgetting to
            // check that the point is on the interval.
            let a=randInt(rng, 1, wide?6:4);
            let k=randInt(rng, 2, wide?40:15);
            let gap=randInt(rng, 1, 3);
            let width=randInt(rng, 2, wide?10:6)*2;
            let lo=gap;
            let hi=gap+width;
            let left=parabola(-a, 0, k, lo);
            let right=parabola(-a, 0, k, hi);
            let mid=parabola(-a, 0, k, (lo+hi)/2);
            key=left>right?left:right;
            latex=`For \\( f(x) = -${a}x^{2} - ${k} \\), find the maximum value of \\( f \\) on the closed interval \\( [${lo}, ${hi}] \\).`;
            wrong=[left>right?right:left, -k, mid, -k+1, -k-1];
            display=`f(${lo}) = ${left},\\ f(${hi}) = ${right}`;
            rungs=[
                "An absolute extreme value on a closed interval is only ever attained at a critical point or at an endpoint. Solve f'(x) = 0 first, then discard any solution that is not on the interval, and compare what is left.",
                `The critical point solves $ -${2*a}x = 0 $, so $ x = 0 $, and $ 0 $ is not in $ [${lo}, ${hi}] $. Only the two endpoints remain.`
            ];
            steps=[
                `$ f'(x) = -${2*a}x $, so the only critical point is $ x = 0 $, which is outside $ [${lo}, ${hi}] $.`,
                `$ f(${lo}) = -${a}\\cdot ${lo}^{2} - ${k} = ${left} $ and $ f(${hi}) = -${a}\\cdot ${hi}^{2} - ${k} = ${right} $.`,
                `The larger of ${left} and ${right} is ${key}, so the maximum value on the interval is ${key}.`
            ];
            break;
        }
        default:{
            let flavour=Math.floor(rng()*2);
            if (flavour===0){
                // Two quarters plus the width against a wall: the width that maximises
                // the area is a quarter of the fencing, and the area is then one
                // eighth of its square. Drawing the total as a multiple of four makes
                // both of those whole numbers.
                let quarters=randInt(rng, 2, wide?14:7);
                let total=quarters*4;
                key=2*quarters*quarters;
                latex=`A farmer has ${total} metres of fencing for a rectangular field that runs along a straight wall, so only the two ends and one long side need fencing. Let \\( x \\) be the side perpendicular to the wall. What is the largest possible area of the field, in square metres?`;
                wrong=[key*2, total*total/4, total*total/16, total*total/2, total];
                display=`A(x) = x(${total} - 2x),\\ A(${quarters}) = ${key}`;
                rungs=[
                    "Write the quantity to be maximized as a function of the single variable, using the constraint to eliminate the second dimension, then find the critical point and check it lies inside the feasible range.",
                    `The area is $ A(x) = x(${total} - 2x) $, and $ 0 < x < ${total}/2 $, so the critical point has to be tested inside that range.`
                ];
                steps=[
                    `The fenced sides use $ 2x + y = ${total} $, so $ y = ${total} - 2x $ and the area is $ A(x) = x(${total} - 2x) $.`,
                    `$ A'(x) = ${total} - 4x $, so $ A'(x) = 0 $ at $ x = ${quarters} $, which lies in $ 0 < x < ${total/2} $ and is where $ A $ is largest.`,
                    `$ A(${quarters}) = ${quarters} \\times ${total} - 2\\times ${quarters}^{2} = ${total*quarters} - ${2*quarters*quarters} = ${key} $, so the largest area is ${key} square metres.`
                ];
            }
            else{
                // A square sheet folded into an open box has two critical points, at a
                // sixth and at a half of the side, and only the first is a maximum
                // inside the feasible range. The side is a multiple of six so that the
                // volume is a whole number.
                let sixths=randInt(rng, 1, wide?6:3);
                let side=sixths*6;
                key=16*sixths*sixths*sixths;
                latex=`A ${side} cm by ${side} cm square of card is cut into an open box by cutting squares of side \\( x \\) from each corner and folding up the sides. What is the largest possible volume of the box, in cubic centimetres?`;
                wrong=[key*2, side*side*side/27, side*side*side/8, side*side*side/4, side*side*side];
                display=`V(x) = x(${side} - 2x)^{2},\\ V(${sixths}) = ${key}`;
                rungs=[
                    "Write the volume as a function of the cut size, then find every critical point and keep only the ones inside the feasible range before comparing.",
                    `The volume is $ V(x) = x(${side} - 2x)^{2} $ with $ 0 < x < ${side/2} $, so both critical points have to be tested.`
                ];
                steps=[
                    `Cutting squares of side $ x $ leaves a base of $ (${side} - 2x) $ by $ (${side} - 2x) $, so $ V(x) = x(${side} - 2x)^{2} $.`,
                    `$ V'(x) = (${side} - 2x)(${side} - 6x) $, so the critical points are $ x = ${side/2} $ and $ x = ${side/6} = ${sixths} $. The first gives a zero base, so the maximum is at $ x = ${sixths} $.`,
                    `$ V(${sixths}) = ${sixths} \\times (${side} - ${2*sixths})^{2} = ${sixths} \\times ${4*sixths}^{2} = ${key} $, so the largest volume is ${key} cubic centimetres.`
                ];
            }
            expectedFormat="Enter a whole number";
            break;
        }
    }
    return {
        latex,
        correct: fmtTrim(key, 2),
        alternate: fmtTrim(key, 2),
        display,
        choices: numberOptions(key, wrong, 0),
        expectedFormat,
        subskill: type,
        hints: {rungs, concede: "The answer is "+fmtTrim(key, 2)+"."},
        solution: steps
    };
}