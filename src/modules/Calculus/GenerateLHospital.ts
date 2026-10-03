/**
 * @file Limits that only L'Hôpital's rule opens, and the limits where it may not
 * be used at all.
 * @description The rule applies to exactly two indeterminate forms, `0/0` and
 * `infinity/infinity`, and every branch here either stays inside those two or
 * deliberately steps outside them. The branch that shows where the rule fails is
 * the reason the file exists: the printed limit is in the form `infinity minus
 * infinity` or `zero times infinity`, so the rule cannot be applied to it, and the
 * answer has to come from rationalising or from rewriting the product as a
 * quotient.
 *
 * Every answer is exact. A rational function of polynomials is handled by its
 * coefficients, so the key is a whole number or a terminating decimal and no
 * value is rounded on the way to a printed answer.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions}from"../shared/Options.js";
import{randInt, pick}from"../shared/Random.js";

export function generateLHospital(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["zero_over_zero","infinity_over_infinity","apply_the_rule_twice","when_the_rule_fails"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    let key=0;
    let latex="";
    let wrong:number[]=[];
    let decimals=2;
    let rungs:string[]=[];
    let steps:string[]=[];
    let display="";
    switch(type){
        case "zero_over_zero":{
            // The difference of powers factors, so the quotient reduces to a
            // polynomial whose value at the point of approach is the derivative of
            // that power. The square root flavour is only reachable at a perfect
            // square, which is why the radicand is drawn from squares rather than
            // from an arbitrary integer.
            let flavour=Math.floor(rng()*3);
            if (flavour===0){
                let a=randInt(rng, 2, wide?11:6);
                key=2*a;
                latex=`Evaluate \\( \\lim_{x \\to ${a}} \\frac{x^{2} - ${a*a}}{x - ${a}} \\).`;
                wrong=[-2*a, a*a, 2*a+2, 2*a-2, 2];
                display=`\\lim_{x \\to ${a}} 2x = ${key}`;
                rungs=[
                    "L'Hôpital's rule turns the limit of a quotient of two functions both tending to zero into the limit of the ratio of their derivatives.",
                    `Both $ x^{2} - ${a*a} $ and $ x - ${a} $ go to zero at $ x = ${a} $, which is the $ 0/0 $ form the rule is for.`
                ];
                steps=[
                    `At $ x = ${a} $ the numerator is $ ${a*a} - ${a*a} = 0 $ and the denominator is $ 0 $, so the form is $ 0/0 $.`,
                    `$ \\dfrac{d}{dx}\\left(x^{2} - ${a*a}\\right) = 2x $ and $ \\dfrac{d}{dx}(x - ${a}) = 1 $.`,
                    `So the limit is $ 2(${a}) = ${key} $, and the answer is ${key}.`
                ];
            }
            else if (flavour===1){
                let a=randInt(rng, 1, wide?5:3);
                key=3*a*a*a;
                latex=`Evaluate \\( \\lim_{x \\to ${a}} \\frac{x^{3} - ${a*a*a}}{x - ${a}} \\).`;
                wrong=[-3*a*a, a*a*a, 3*a*a*a+1, 3*a*a*a-1, a];
                display=`\\lim_{x \\to ${a}} 3x^{2} = ${key}`;
                rungs=[
                    "L'Hôpital's rule replaces a `0/0` quotient by the quotient of the derivatives, so differentiate both pieces and take the limit of what is left.",
                    `The numerator and the denominator both vanish at $ x = ${a} $, which is the $ 0/0 $ form, so the rule applies.`
                ];
                steps=[
                    `At $ x = ${a} $ the numerator is $ 0 $ and the denominator is $ 0 $, so the form is $ 0/0 $.`,
                    `$ \\dfrac{d}{dx}\\left(x^{3} - ${a*a*a}\\right) = 3x^{2} $ and $ \\dfrac{d}{dx}(x - ${a}) = 1 $.`,
                    `So the limit is $ 3 \\cdot ${a}^{2} = ${key} $, and the answer is ${key}.`
                ];
            }
            else{
                let root=randInt(rng, 1, wide?3:2);
                let a=root*root;
                key=0.5/root;
                decimals=2;
                latex=`Evaluate \\( \\lim_{x \\to ${a}} \\frac{\\sqrt{x} - ${root}}{x - ${a}} \\).`;
                wrong=[root, 2*root, 1/a, 0.25/root, a];
                display=`\\lim_{x \\to ${a}} \\frac{1}{2\\sqrt{x}} = ${key}`;
                rungs=[
                    "L'Hôpital's rule turns the `0/0` limit into the limit of the ratio of the derivatives, and the derivative of a square root is the reciprocal of twice the square root.",
                    `Both pieces vanish at $ x = ${a} $, so the rule applies and only the derivatives are left to evaluate.`
                ];
                steps=[
                    `At $ x = ${a} $ the numerator is $ ${root} - ${root} = 0 $ and the denominator is $ 0 $, so the form is $ 0/0 $.`,
                    `$ \\dfrac{d}{dx}\\sqrt{x} = \\dfrac{1}{2\\sqrt{x}} $ and $ \\dfrac{d}{dx}(x - ${a}) = 1 $.`,
                    `So the limit is $ \\dfrac{1}{2\\sqrt{${a}}} = \\dfrac{1}{2 \\times ${root}} = ${key} $, and the answer is ${key}.`
                ];
            }
            break;
        }
        case "infinity_over_infinity":{
            // Two shapes: matching degrees, where the limit is the ratio of the
            // leading coefficients, and a numerator of lower degree, where the
            // quotient collapses to zero.
            let flavour=Math.floor(rng()*2);
            if (flavour===0){
                // The leading coefficients are drawn as a pair whose quotient is
                // exactly representable at two decimal places, so the key is never a
                // rounded value. The linear coefficients are adjusted when they would
                // make the quotient constant, because a constant ratio is not the
                // indeterminate form the branch is about.
                let pairs=[[1,1],[2,1],[3,1],[4,1],[3,2],[4,2],[6,2],[5,2],[5,4],[7,4],[9,4],[6,4],[8,4],[11,4]];
                let pair=pick(rng, pairs);
                let num=pair[0];
                let den=pair[1];
                let b=randInt(rng, 1, wide?9:5);
                let e=randInt(rng, 1, wide?9:5);
                if (num*e===den*b) e=e+1;
                let c=randInt(rng, 1, wide?9:5);
                let f=randInt(rng, 1, wide?9:5);
                key=num/den;
                latex=`Evaluate \\( \\lim_{x \\to \\infty} \\frac{${num}x^{2} + ${b}x + ${c}}{${den}x^{2} + ${e}x + ${f}} \\).`;
                wrong=[num, den, key+1, key-1, num*den, den/num];
                display=`\\frac{${num}}{${den}} = ${key}`;
                rungs=[
                    "For two polynomials of the same degree the limit is the ratio of the leading coefficients, which L'Hôpital's rule reaches by differentiating once.",
                    `Both pieces are quadratic, so the limit is $ ${num} / ${den} $, whatever the lower terms are.`
                ];
                steps=[
                    `The numerator and the denominator both grow like $ x^{2} $, so the form is $ \\infty/\\infty $ and the rule applies.`,
                    `$ \\dfrac{d}{dx}(${num}x^{2} + ${b}x + ${c}) = ${2*num}x + ${b} $ and $ \\dfrac{d}{dx}(${den}x^{2} + ${e}x + ${f}) = ${2*den}x + ${e} $, and the ratio of those still grows like a quotient of first powers.`,
                    `Applying the rule a second time gives $ ${2*num} / ${2*den} = ${num} / ${den} = ${key} $, and the answer is ${key}.`
                ];
            }
            else{
                let num=randInt(rng, 1, wide?9:5);
                let den=randInt(rng, 2, wide?9:5);
                let b=randInt(rng, 1, wide?9:4);
                let e=randInt(rng, 1, wide?9:4);
                let f=randInt(rng, 1, wide?9:4);
                key=0;
                latex=`Evaluate \\( \\lim_{x \\to \\infty} \\frac{${num}x + ${b}}{${den}x^{2} + ${e}x + ${f}} \\).`;
                wrong=[num/den, 1, -1, num, b];
                display=`0`;
                rungs=[
                    "Compare the powers of the leading terms before differentiating: a quotient whose numerator grows more slowly than its denominator tends to zero.",
                    `The denominator is quadratic and the numerator is linear, so $ (${num}x) / (${den}x^{2}) \\to 0 $, and L'Hôpital's rule confirms it.`
                ];
                steps=[
                    `The numerator grows like $ x $ and the denominator like $ x^{2} $, so the form is $ \\infty/\\infty $ and the rule applies.`,
                    `$ \\dfrac{d}{dx}(${num}x + ${b}) = ${num} $ and $ \\dfrac{d}{dx}(${den}x^{2} + ${e}x + ${f}) = ${2*den}x + ${e} $, and the denominator still grows without bound.`,
                    `So the limit is $ ${num} / (${2*den}x + ${e}) \\to 0 $, and the answer is ${key}.`
                ];
            }
            break;
        }
        case "apply_the_rule_twice":{
            // Each of these leaves a `0/0` or `infinity/infinity` form after the first
            // differentiation, so the rule has to be applied a second time. That is
            // the whole content of the branch: a learner who stops after one
            // differentiation has not evaluated anything.
            let flavour=Math.floor(rng()*4);
            if (flavour===0){
                key=0.5;
                latex=`Evaluate \\( \\lim_{x \\to 0} \\frac{e^{x} - 1 - x}{x^{2}} \\).`;
                wrong=[1, -0.5, 2, 0, -1];
                display=`\\lim_{x \\to 0} \\frac{e^{x}}{2} = ${key}`;
                rungs=[
                    "Apply L'Hôpital's rule, then check the new form: if it is still `0/0` or `infinity/infinity` the rule has to be applied again before you simplify.",
                    "The numerator and the denominator both vanish at zero, so the rule applies once; look at what the first round leaves before stopping."
                ];
                steps=[
                    `At $ x = 0 $ the numerator is $ 1 - 1 - 0 = 0 $ and the denominator is $ 0 $, so the form is $ 0/0 $.`,
                    `One round gives $ \\dfrac{e^{x} - 1}{2x} $, which is again $ 0/0 $ at $ x = 0 $, so the rule is applied a second time.`,
                    `The second round gives $ \\dfrac{e^{x}}{2} $, and its limit as $ x \\to 0 $ is $ 1/2 = ${key} $, so the answer is ${key}.`
                ];
            }
            else if (flavour===1){
                key=2;
                latex=`Evaluate \\( \\lim_{x \\to 0} \\frac{1 - \\cos(2x)}{x^{2}} \\).`;
                wrong=[1, -2, 4, 0.5, 0];
                display=`\\lim_{x \\to 0} 2\\cos(2x) = ${key}`;
                rungs=[
                    "Apply L'Hôpital's rule and then look at the form you have been left with: a second `0/0` means the rule must be applied again, not that the limit is zero.",
                    "Both pieces vanish at zero, so the first round is legitimate; the first round leaves another `0/0`.",
                ];
                steps=[
                    `At $ x = 0 $ the numerator is $ 1 - 1 = 0 $ and the denominator is $ 0 $, so the form is $ 0/0 $.`,
                    `One round gives $ \\dfrac{2\\sin(2x)}{2x} = \\dfrac{\\sin(2x)}{x} $, which is again $ 0/0 $ at $ x = 0 $.`,
                    `The second round gives $ \\dfrac{2\\cos(2x)}{1} $, whose limit is $ 2 = ${key} $, so the answer is ${key}.`
                ];
            }
            else if (flavour===2){
                let b=randInt(rng, 2, wide?11:6);
                let e=randInt(rng, 1, wide?6:4);
                key=1;
                latex=`Evaluate \\( \\lim_{x \\to \\infty} \\frac{x^{2} + ${b}x}{x^{2} + ${e}x} \\).`;
                wrong=[b/e, 2, 0, b, e];
                display=`\\lim_{x \\to \\infty} 2 = ${key}`;
                rungs=[
                    "A quotient of two polynomials of equal degree is evaluated by applying L'Hôpital's rule until the leading terms cancel, which here takes two rounds.",
                    "Both pieces are quadratic, so the first round leaves a quotient of first powers, which is still `infinity/infinity`.",
                ];
                steps=[
                    `Both pieces grow like $ x^{2} $, so the form is $ \\infty/\\infty $ and the rule applies.`,
                    `One round gives $ \\dfrac{2x + ${b}}{2x + ${e}} $, which is still $ \\infty/\\infty $ as $ x \\to \\infty $.`,
                    `The second round gives $ \\dfrac{2}{2} = ${key} $, so the answer is ${key}.`
                ];
            }
            else{
                key=-0.5;
                latex=`Evaluate \\( \\lim_{x \\to 0} \\frac{\\ln(1 + x) - x}{x^{2}} \\).`;
                wrong=[0.5, -1, 1, 0, -2];
                display=`\\lim_{x \\to 0} -\\frac{1}{2(1 + x)} = ${key}`;
                rungs=[
                    "Apply L'Hôpital's rule and then check the form again; a leftover `0/0` means the rule has to be applied a second time.",
                    "The numerator and the denominator both vanish at zero, and the first round leaves another `0/0`.",
                ];
                steps=[
                    `At $ x = 0 $ the numerator is $ \\ln 1 - 0 = 0 $ and the denominator is $ 0 $, so the form is $ 0/0 $.`,
                    `One round gives $ \\dfrac{\\dfrac{1}{1 + x} - 1}{2x} $, which is again $ 0/0 $ at $ x = 0 $.`,
                    `The second round gives $ \\dfrac{-1}{(1 + x) \\cdot 2} $ and its limit is $ -1/2 = ${key} $, so the answer is ${key}.`
                ];
            }
            break;
        }
        default:{
            // Both forms here are indeterminate forms the rule does not cover. The
            // answer still exists, and it comes from rewriting: an `infinity minus
            // infinity` becomes a quotient by the conjugate, and a `zero times
            // infinity` becomes a quotient by dividing through.
            let flavour=Math.floor(rng()*3);
            if (flavour===0){
                let c=randInt(rng, 1, wide?4:3)*2;
                key=c/2;
                latex=`Evaluate \\( \\lim_{x \\to \\infty} \\left( \\sqrt{x^{2} + ${c}x} - x \\right) \\).`;
                wrong=[c, -c, key/2, key+1, 1];
                display=`\\lim_{x \\to \\infty} \\frac{${c}x}{\\sqrt{x^{2} + ${c}x} + x} = ${key}`;
                rungs=[
                    "This is an `infinity minus infinity` form, and L'Hôpital's rule does not apply to it. Multiply by the conjugate to turn the difference into a quotient, and then the rule is available if you still need it.",
                    `Both terms grow without bound, so subtracting them directly is the indeterminate form. The conjugate of $ \\sqrt{x^{2} + ${c}x} - x $ gives $ \\frac{${c}x}{\\sqrt{x^{2} + ${c}x} + x} $.`
                ];
                steps=[
                    `Each of $ \\sqrt{x^{2} + ${c}x} $ and $ x $ grows without bound, so the form is $ \\infty - \\infty $ and L'Hôpital's rule cannot be used on it.`,
                    `Multiply by the conjugate: $ \\dfrac{\\left(x^{2} + ${c}x\\right) - x^{2}}{\\sqrt{x^{2} + ${c}x} + x} = \\dfrac{${c}x}{\\sqrt{x^{2} + ${c}x} + x} $.`,
                    `Dividing top and bottom by $ x $ gives $ \\dfrac{${c}}{\\sqrt{1 + ${c}/x} + 1} \\to ${key} $, so the answer is ${key}.`
                ];
            }
            else if (flavour===1){
                let c=randInt(rng, 1, wide?7:4);
                key=-c;
                latex=`Evaluate \\( \\lim_{x \\to \\infty} x\\left(e^{-${c}/x} - 1\\right) \\).`;
                wrong=[c, -2*c, 2*c, 0, -c/2];
                display=`\\lim_{x \\to \\infty} -c e^{-${c}/x} = ${key}`;
                rungs=[
                    "This is a `zero times infinity` form, so the rule does not apply to the product as written. Divide the limit by `one over infinity` to rewrite it as a quotient that is `0/0`.",
                    `Writing $ x = 1 / (1/x) $ turns $ x\\left(e^{-${c}/x} - 1\\right) $ into $ \\dfrac{e^{-${c}/x} - 1}{1/x} $, which is $ 0/0 $.`
                ];
                steps=[
                    `As $ x \\to \\infty $, $ e^{-${c}/x} \\to 1 $, so the bracket tends to zero while $ x $ grows without bound: the form is $ 0 \\cdot \\infty $, which L'Hôpital's rule does not cover.`,
                    `Rewrite it as $ \\dfrac{e^{-${c}/x} - 1}{1/x} $, a $ 0/0 $ form, and apply the rule once.`,
                    `The derivative ratio is $ \\dfrac{e^{-${c}/x} \\cdot \\dfrac{${c}}{x^{2}}}{-\\dfrac{1}{x^{2}}} = -${c}e^{-${c}/x} \\to -${c} $, so the answer is ${key}.`
                ];
            }
            else{
                key=0;
                latex=`Evaluate \\( \\lim_{x \\to 0} x\\sin\\left(\\frac{1}{x}\\right) \\).`;
                wrong=[1, -1, 2, -2, 3];
                display=`\\lim_{x \\to 0} x\\sin\\left(\\frac{1}{x}\\right) = ${key}`;
                rungs=[
                    "This is a product, not a quotient, so L'Hôpital's rule has nothing to differentiate. Reach for the squeeze theorem instead: bound the sine by its magnitude and see what happens to the product.",
                    `Since $ \\left|\\sin\\left(\\dfrac{1}{x}\\right)\\right| \\le 1 $, the product is squeezed between $ -|x| $ and $ |x| $, and both bounds go to zero.`
                ];
                steps=[
                    `The form is a product of a quantity tending to zero with a quantity that oscillates without settling, so L'Hôpital's rule does not apply.`,
                    `$ \\left|x\\sin\\left(\\dfrac{1}{x}\\right)\\right| \\le |x| \\cdot 1 = |x| $.`,
                    `Both bounds tend to zero, so the squeeze theorem gives a limit of ${key}, and the answer is ${key}.`
                ];
            }
            break;
        }
    }
    let text=key.toFixed(decimals);
    return {
        latex,
        correct: text,
        alternate: text,
        display,
        choices: numberOptions(key, wrong, decimals),
        expectedFormat: decimals===0?"Enter a whole number":"Enter a number, rounded to two decimal places",
        subskill: type,
        hints: {rungs, concede: "The answer is "+text+"."},
        solution: steps
    };
}