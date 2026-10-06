/**
 * @file The divergence and the curl of a vector field, and the classification
 * that tells the two apart.
 * @description The three-dimensional field is always bilinear, so that both
 * quantities have something in every component and neither collapses to a
 * constant: `F = (ax^2 + byz, cxy + dz^2, exz + fy^2)` has
 * `div F = (2a + c + e)x + 2dz` and `curl F = (2fy - 2dz, by - ez, cy)`. The
 * prompt always names which of the two is wanted, because the other one is an
 * honest and completely wrong answer otherwise.
 *
 * The classification branch offers the four honest combinations of "zero or
 * non-zero" for each of the two quantities. Two of its four fields are checked by
 * hand rather than trusted: `F = (2x, -2y)` has divergence zero and curl zero, and
 * `F = (x, x)` has divergence one and curl one.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{fourOptions}from"../shared/Options.js";
import{randInt}from"../shared/Random.js";

/**
 * The four combinations of zero and non-zero divergence and curl, which are the
 * four honest answers a classification question can have.
 */
const CLASSES=[
    "divergence is zero and curl is zero",
    "divergence is zero and curl is not zero",
    "divergence is not zero and curl is zero",
    "divergence is not zero and curl is not zero"
];

/**
 * A two-dimensional field together with the class it belongs to. Each entry has
 * been checked by hand: divergence is `P_x + Q_y` and curl is `Q_x - P_y`.
 */
const PLANAR_FIELDS:[string, number][]=[
    ["\\langle 2x,\\; -2y \\rangle", 0],
    ["\\langle 3x,\\; -3y \\rangle", 0],
    ["\\langle y,\\; 0 \\rangle", 1],
    ["\\langle 0,\\; x \\rangle", 1],
    ["\\langle 2y,\\; -2x \\rangle", 1],
    ["\\langle x,\\; 0 \\rangle", 2],
    ["\\langle 0,\\; y \\rangle", 2],
    ["\\langle x,\\; x + y \\rangle", 3],
    ["\\langle 2x,\\; x + y \\rangle", 3]
];

export function generateDivergenceCurl(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["divergence_in_2d","divergence_in_3d","curl_in_3d","vector_field_type"];
    let type=types[Math.floor(rng()*types.length)];
    let wide=difficulty==="hard";
    if (type==="vector_field_type") return classifyQuestion(rng);
    let a=randInt(rng, 1, wide?4:2);
    let b=randInt(rng, 1, wide?4:2);
    let c=randInt(rng, 1, wide?4:2);
    let d=randInt(rng, 1, wide?4:2);
    let e=randInt(rng, 1, wide?4:2);
    let f=randInt(rng, 1, wide?4:2);
    let field=`\\langle ${a}x^{2} + ${b}yz,\\; ${c}xy + ${d}z^{2},\\; ${e}xz + ${f}y^{2} \\rangle`;
    let divCoefficient=2*a+c+e;
    let divZ=2*d;
    let curlX=2*f;
    let curlZ=2*d;
    let curlY=b;
    let curlE=e;
    let curlC=c;
    let divSigned=divCoefficient+"x + "+divZ+"z";
    let divMissed=(2*a+c)+"x + "+divZ+"z";
    let divNoCurlZ=divCoefficient+"x";
    let curlText=`\\left\\langle ${curlX}y - ${curlZ}z,\\; ${curlY}y - ${curlE}z,\\; ${curlC}y \\right\\rangle`;
    let curlReversed=`\\left\\langle ${curlZ}z - ${curlX}y,\\; ${curlY}y - ${curlE}z,\\; ${curlC}y \\right\\rangle`;
    let curlSwapped=`\\left\\langle ${curlY}y - ${curlE}z,\\; ${curlX}y - ${curlZ}z,\\; ${curlC}y \\right\\rangle`;
    let curlPlus=`\\left\\langle ${curlX}y + ${curlZ}z,\\; ${curlY}y - ${curlE}z,\\; ${curlC}y \\right\\rangle`;
    let curlLastPlus=`\\left\\langle ${curlX}y - ${curlZ}z,\\; ${curlY}y - ${curlE}z,\\; ${curlC}y + ${e} \\right\\rangle`;
    let key="";
    let latex="";
    let wrong:string[]=[];
    let expectedFormat="Enter the expression";
    let display="";
    let rungs:string[]=[];
    let steps:string[]=[];
    if (type==="divergence_in_2d"){
        // The planar divergence is `P_x + Q_y`, which is two partial derivatives of
        // two different components. The three wrong options each come from pairing
        // the derivatives wrongly.
        let p=randInt(rng, 1, wide?4:2);
        let q=randInt(rng, 1, wide?4:2);
        let r=randInt(rng, 1, 4);
        let s=randInt(rng, 1, wide?4:2);
        if (r===2*s) r=3;
        key=(2*p+r)+"x + "+2*s+"y";
        latex=`Let \\( \\mathbf{F}(x,y) = \\langle ${p}x^{2} + ${q}y,\\; ${r}xy + ${s}y^{2} \\rangle \\). Compute the divergence \\( \\nabla \\cdot \\mathbf{F} \\) of this field.`;
        wrong=[
            2*p+"x + "+2*s+"y",
            (2*p+r)+"x + "+r+"y",
            (2*p+r)+"x - "+2*s+"y",
            2*p+"x + "+r+"y + "+q
        ];
        display=`\\nabla \\cdot \\mathbf{F} = ${key}`;
        rungs=[
            "The divergence of a planar field is the sum of the two mixed second derivatives: differentiate the first component with respect to x and the second with respect to y, and add.",
            `Only the first component contains an \\( x \\), giving \\( ${2*p}x \\), and only the second contains a \\( y \\), giving \\( ${r}x + ${2*s}y \\).`
        ];
        steps=[
            `$ P = ${p}x^{2} + ${q}y $ so $ P_x = ${2*p}x $, and $ Q = ${r}xy + ${s}y^{2} $ so $ Q_y = ${r}x + ${2*s}y $.`,
            `The divergence is $ P_x + Q_y = ${2*p}x + ${r}x + ${2*s}y $.`,
            `So $ \\nabla \\cdot \\mathbf{F} = ${key} $, and that is the answer.`
        ];
        expectedFormat="Enter the expression in x and y";
    }
    else if (type==="divergence_in_3d"){
        key=divSigned;
        latex=`Let \\( \\mathbf{F}(x,y,z) = ${field} \\). Compute the divergence \\( \\nabla \\cdot \\mathbf{F} \\) of this field.`;
        wrong=[divNoCurlZ, divSigned.replace("+","-"), curlText, divMissed, (divCoefficient)+"x + "+divZ+"z - "+b];
        display=`\\nabla \\cdot \\mathbf{F} = ${key}`;
        rungs=[
            "The divergence is the sum of the three diagonal partial derivatives: each component differentiated with respect to its own letter, then added. It is a scalar, not a vector.",
            `The three contributions are \\( ${2*a}x \\), \\( ${c}x \\) and \\( ${e}x + ${2*d}z \\), one from each component.`
        ];
        steps=[
            `$ P = ${a}x^{2} + ${b}yz $ gives $ P_x = ${2*a}x $, $ Q = ${c}xy + ${d}z^{2} $ gives $ Q_y = ${c}x $, and $ R = ${e}xz + ${f}y^{2} $ gives $ R_z = ${e}x + ${2*d}z $.`,
            `The divergence is $ P_x + Q_y + R_z = ${2*a}x + ${c}x + ${e}x + ${2*d}z $.`,
            `So $ \\nabla \\cdot \\mathbf{F} = ${key} $, and that is the answer.`
        ];
    }
    else{
        key=curlText;
        latex=`Let \\( \\mathbf{F}(x,y,z) = ${field} \\). Compute the curl \\( \\nabla \\times \\mathbf{F} \\) of this field.`;
        wrong=[divSigned, curlReversed, curlSwapped, curlPlus, curlLastPlus];
        display=`\\nabla \\times \\mathbf{F} = ${key}`;
        rungs=[
            "The curl collects the three crossed partial derivatives into a vector: the first component is R_y minus Q_z, the second is P_z minus R_x, and the third is Q_x minus P_y.",
            `Read the three components off the field: $ R_y - Q_z = ${2*f}y - ${2*d}z $, $ P_z - R_x = ${b}y - ${e}z $, and $ Q_x - P_y = ${c}y - 0 $.`
        ];
        steps=[
            `$ R = ${e}xz + ${f}y^{2} $ gives $ R_y = ${2*f}y $, $ Q = ${c}xy + ${d}z^{2} $ gives $ Q_z = ${2*d}z $, so the first component is $ ${2*f}y - ${2*d}z $.`,
            `$ P_z = ${b}y $ and $ R_x = ${e}z $, so the second component is $ ${b}y - ${e}z $; and $ Q_x = ${c}y $ while $ P_y = 0 $, so the third is $ ${c}y $.`,
            `So $ \\nabla \\times \\mathbf{F} = ${key} $, and that is the answer.`
        ];
        expectedFormat="Enter the vector, for example (2y - 3z, x - 2y, 4y)";
    }
    let alternate=key
        .replace(/\\left/g, "")
        .replace(/\\right/g, "")
        .replace(/\\langle/g, "<")
        .replace(/\\rangle/g, ">")
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

/**
 * The classification branch: which of the four combinations of a zero or non-zero
 * divergence and a zero or non-zero curl the field has.
 *
 * @param rng - The injected random source.
 * @returns The generated question.
 */
function classifyQuestion(rng: () => number): QuestionDto{
    let entry=PLANAR_FIELDS[Math.floor(rng()*PLANAR_FIELDS.length)];
    let field=entry[0];
    let which=entry[1];
    let key=CLASSES[which];
    let rungs=[
        "Compute the divergence and the curl of the field before classifying it, and read the answer off those two numbers rather than off the shape of the field.",
        "For a planar field the divergence is `P_x + Q_y` and the curl is `Q_x - P_y`; evaluate both and then say which of them is zero."
    ];
    let steps=[
        `Take the two partial derivatives that make up the divergence and the two that make up the curl from the printed field.`,
        `The divergence and the curl of \\( ${field} \\) come out as the combination recorded in the option below.`,
        `Exactly one of the two quantities vanishes and the other does not, or both vanish or neither does, and the statement that matches is: ${key}. That is the answer.`
    ];
    return {
        latex:`For a planar field \\( \\mathbf{F}(x,y) = \\langle P, Q \\rangle \\) the divergence is \\( \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} \\) and the curl is \\( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\). Let \\( \\mathbf{F}(x,y) = ${field} \\). Which statement describes it?`,
        correct: key,
        alternate: key,
        display: key,
        choices: fourOptions(key, CLASSES.filter((_, index) => index!==which)),
        expectedFormat:"Choose the statement that describes the field",
        subskill:"vector_field_type",
        hints: {rungs, concede: "The answer is: "+key+"."},
        solution: steps
    };
}