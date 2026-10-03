/**
 * @file Partial derivatives, the gradient and the tangent plane.
 * @description The surface is always `f(x, y) = ax^2 + bxy + cy^2`, with `b` drawn
 * odd and `a` and `c` small, so that the coefficient of the mixed term can never
 * equal twice either square coefficient and the two partial derivatives can never
 * coincide with one another. Every answer is then exact: the partial derivatives
 * are linear in `x` and `y`, and the tangent plane is evaluated at a small
 * integer point, so the height and both slopes are whole numbers.
 *
 * The other partial derivative is offered as a wrong option only in the branch
 * whose prompt names the derivative it wants. A question that does not say which
 * derivative it means has two correct answers.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";

/**
 * Appends a signed term to a LaTeX expression, choosing `+` or `-` and putting
 * the sign in the operator rather than inside the number.
 *
 * @param out - The expression built so far.
 * @param magnitude - The signed coefficient. A coefficient of zero is skipped.
 * @param body - What the coefficient multiplies, for example `x`.
 * @returns The expression with the term appended.
 */
function pushTerm(out: string, magnitude: number, body: string): string{
    if (magnitude===0) return out;
    let value=Math.abs(magnitude);
    if (out==="") return magnitude<0||value!==1?"-"+value+body:value===1?body:String(value)+body;
    return out+" "+(magnitude<0?"- ":"+ ")+value+body;
}

/**
 * Writes a linear expression in two variables with an optional constant, with the
 * sign of each coefficient carried by its operator.
 *
 * @param ax - The coefficient of x.
 * @param ay - The coefficient of y.
 * @param constant - The constant term. Zero leaves it out.
 * @returns The expression as LaTeX.
 */
function linear(ax: number, ay: number, constant: number): string{
    let out=pushTerm("", ax, "x");
    out=pushTerm(out, ay, "y");
    return pushTerm(out, constant, "");
}

/**
 * Writes `x - px` or `x + |px|`, so that a point with a negative coordinate does
 * not print a double minus.
 *
 * @param letter - The variable name.
 * @param offset - The coordinate of the point.
 * @returns The displacement as LaTeX.
 */
function displacement(letter: string, offset: number): string{
    if (offset===0) return letter;
    return offset<0?`(${letter} + ${Math.abs(offset)})`:`(${letter} - ${offset})`;
}

/**
 * Writes the tangent plane `z = height + slopeX(x - px) + slopeY(y - py)` with
 * every sign in its operator and every zero slope omitted.
 *
 * @param height - The height of the plane at the point.
 * @param slopeX - The partial derivative in x at the point.
 * @param slopeY - The partial derivative in y at the point.
 * @param px - The x of the point.
 * @param py - The y of the point.
 * @returns The plane equation.
 */
function plane(height: number, slopeX: number, slopeY: number, px: number, py: number): string{
    let out=`z = ${height<0?"-"+Math.abs(height):String(height)}`;
    if (slopeX!==0) out=out+" "+(slopeX<0?"- ":"+ ")+Math.abs(slopeX)+displacement("x", px);
    if (slopeY!==0) out=out+" "+(slopeY<0?"- ":"+ ")+Math.abs(slopeY)+displacement("y", py);
    return out;
}

/**
 * Picks a point at which the surface gives a non-zero height and two non-zero
 * slopes, so that the four plane options differ from the key and from each other
 * in exactly the way they are meant to. The search is bounded and falls back to
 * the first corner, where all three are non-zero for every coefficient table.
 *
 * @param a - The coefficient of x squared.
 * @param b - The coefficient of xy.
 * @param c - The coefficient of y squared.
 * @param rng - The injected random source.
 * @returns The point.
 */
function safePoint(a: number, b: number, c: number, rng: () => number): [number, number]{
    for(let attempt=0; attempt<64; attempt++){
        let px=randInt(rng, -3, 3);
        let py=randInt(rng, -3, 3);
        if (2*a*px+b*py===0||b*px+2*c*py===0) continue;
        if (a*px*px+b*px*py+c*py*py===0) continue;
        return [px, py];
    }
    return [1, 1];
}

export function generatePartialDerivatives(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["partial_wrt_x","partial_wrt_y","the_gradient","tangent_plane"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    let a=randInt(rng, 1, wide?4:2);
    let b=randInt(rng, 1, 5);
    if (b%2===0) b+=1;
    let c=randInt(rng, 1, wide?4:2);
    let dx=linear(2*a, b, 0);
    let dy=linear(b, 2*c, 0);
    let surface=`f(x, y) = ${a}x^{2} + ${b}xy + ${c}y^{2}`;
    let key="";
    let latex="";
    let wrong:string[]=[];
    let expectedFormat="Enter the expression in x and y";
    let display="";
    let rungs:string[]=[];
    let steps:string[]=[];
    if (type==="partial_wrt_x"){
        key=dx;
        latex=`Let \\( ${surface} \\). Compute the partial derivative \\( \\frac{\\partial f}{\\partial x} \\), holding \\( y \\) constant.`;
        wrong=[dy, linear(a, b, 0), linear(-2*a, b, 0), linear(2*a, b, b)];
        display=`\\frac{\\partial f}{\\partial x} = ${dx}`;
        rungs=[
            "Differentiate with respect to one letter while treating the other as a constant: a term with no such letter contributes nothing, and a mixed term like xy differentiates to the other letter.",
            `Only \\( ${a}x^{2} \\) and \\( ${b}xy \\) contain an \\( x \\), so they give \\( ${2*a}x \\) and \\( ${b}y \\), and \\( ${c}y^{2} \\) contributes nothing.`
        ];
        steps=[
            `Hold $ y $ constant. The term $ ${a}x^{2} $ differentiates to $ ${2*a}x $, the term $ ${b}xy $ differentiates to $ ${b}y $, and $ ${c}y^{2} $ has no $ x $ in it at all.`,
            `Adding the two contributions gives $ ${dx} $.`,
            `So $ \\frac{\\partial f}{\\partial x} = ${dx} $, and that is the answer.`
        ];
    }
    else if (type==="partial_wrt_y"){
        key=dy;
        latex=`Let \\( ${surface} \\). Compute the partial derivative \\( \\frac{\\partial f}{\\partial y} \\), holding \\( x \\) constant.`;
        wrong=[dx, linear(b, c, 0), linear(b, -2*c, 0), linear(b+1, 2*c, 0)];
        display=`\\frac{\\partial f}{\\partial y} = ${dy}`;
        rungs=[
            "Differentiate with respect to one letter while treating the other as a constant: the term with no such letter drops out entirely and the mixed term gives the other letter.",
            `Only \\( ${b}xy \\) and \\( ${c}y^{2} \\) contain a \\( y \\), so they give \\( ${b}x \\) and \\( ${2*c}y \\), and \\( ${a}x^{2} \\) contributes nothing.`
        ];
        steps=[
            `Hold $ x $ constant. The term $ ${b}xy $ differentiates to $ ${b}x $, the term $ ${c}y^{2} $ differentiates to $ ${2*c}y $, and $ ${a}x^{2} $ has no $ y $ in it at all.`,
            `Adding the two contributions gives $ ${dy} $.`,
            `So $ \\frac{\\partial f}{\\partial y} = ${dy} $, and that is the answer.`
        ];
    }
    else if (type==="the_gradient"){
        key=`\\left\\langle ${dx},\\; ${dy} \\right\\rangle`;
        latex=`Let \\( ${surface} \\). Write the gradient \\( \\nabla f \\).`;
        wrong=[
            `\\left\\langle ${dy},\\; ${dx} \\right\\rangle`,
            `\\left\\langle ${dx},\\; ${linear(b, -2*c, 0)} \\right\\rangle`,
            `\\left\\langle ${linear(-2*a, b, 0)},\\; ${dy} \\right\\rangle`,
            `\\left\\langle ${linear(2*a+1, b, 0)},\\; ${dy} \\right\\rangle`,
            `\\left\\langle ${dx},\\; ${linear(b+1, 2*c, 0)} \\right\\rangle`
        ];
        display=`\\nabla f = ${key}`;
        rungs=[
            "The gradient is the pair of partial derivatives in the order the letters appear, x first and y second, so compute both and keep them in that order.",
            `$ \\frac{\\partial f}{\\partial x} = ${dx} $ and $ \\frac{\\partial f}{\\partial y} = ${dy} $, and the gradient is the two of them in that order.`
        ];
        steps=[
            `Differentiating with respect to $ x $ gives $ ${dx} $.`,
            `Differentiating with respect to $ y $ gives $ ${dy} $.`,
            `The gradient is the pair in the order x then y, so $ \\nabla f = ${key} $, and that is the answer.`
        ];
    }
    else{
        let [px, py]=safePoint(a, b, c, rng);
        let value=a*px*px+b*px*py+c*py*py;
        let slopeX=2*a*px+b*py;
        let slopeY=b*px+2*c*py;
        key=plane(value, slopeX, slopeY, px, py);
        latex=`The surface is the graph of \\( ${surface} \\). Find the equation of the tangent plane at the point where \\( x = ${px} \\) and \\( y = ${py} \\).`;
        wrong=[
            plane(value, -slopeX, slopeY, px, py),
            plane(value, slopeX, -slopeY, px, py),
            plane(-value, slopeX, slopeY, px, py),
            plane(value, slopeY, slopeX, px, py),
            plane(value, 2*slopeX, slopeY, px, py)
        ];
        display=key;
        expectedFormat="Enter the equation of the plane, for example z = 2 + 3(x - 1) - 4(y - 2)";
        rungs=[
            "The tangent plane to the graph of f at a point is its first-order expansion: the height at the point, plus each partial derivative multiplying the displacement from the point.",
            `Find \\( f(${px}, ${py}) \\), \\( f_x(${px}, ${py}) \\) and \\( f_y(${px}, ${py}) \\) from the surface, then write $ z = f + f_x(x - ${px}) + f_y(y - ${py}) $.`
        ];
        steps=[
            `$ f(${px}, ${py}) = ${a}(${px})^{2} + ${b}(${px})(${py}) + ${c}(${py})^{2} = ${value} $, which is the height of the plane.`,
            `$ f_x = ${dx} $ so $ f_x(${px}, ${py}) = ${slopeX} $, and $ f_y = ${dy} $ so $ f_y(${px}, ${py}) = ${slopeY} $.`,
            `So the plane is $ ${key} $, and that is the answer.`
        ];
    }
    let alternate=key
        .replace(/\\left/g, "")
        .replace(/\\right/g, "")
        .replace(/\\langle/g, "<")
        .replace(/\\rangle/g, ">")
        .replace(/\^\{([^{}]*)\}/g, "^$1")
        .replace(/\\/g, "");
    return {
        latex,
        correct: key,
        alternate,
        display,
        choices: fourOptions(key, wrong),
        expectedFormat,
        subskill: type,
        hints: {rungs, concede: "The answer is "+key+"."},
        solution: steps
    };
}