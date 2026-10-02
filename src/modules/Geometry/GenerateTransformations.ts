/**
 * @file Rigid transformations, dilations, and compositions of two transformations
 * applied to integer coordinates.
 * @description A transformation is a map, and the failure mode of a question about
 * one is stating a map in words and performing a different one. So every step here
 * is built once as a single object holding both the sentence that states it and
 * the map it applies, and the composition branch composes those objects rather
 * than restating them. A step therefore cannot print one transformation and grade
 * another, which is the same rule the prompt-versus-answer agreement rests on.
 *
 * Coordinates stay whole numbers because the centres, vectors and quarter turns
 * are whole numbers: a quarter turn and a reflection are integer maps, and a
 * dilation about a whole-number centre by a whole-number factor is one too. No
 * answer is ever rounded.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, shuffle}from"../shared/Random";

/** One transformation step: the sentence that states it and the map it applies. */
interface Step{
    text: string;
    map: (x: number, y: number)=>[number, number];
}

/** The drawn values a step needs, so one builder can state and map all four kinds. */
interface StepValues{
    dx: number;
    dy: number;
    cx: number;
    cy: number;
    degrees: number;
    scale: number;
    axis: string;
}

/**
 * Draws the values every step may use, scaled by difficulty. The centre of a
 * rotation and of a dilation is the origin at easy and a drawn point above it,
 * and the scale factor never reaches one because a factor of one moves nothing.
 *
 * @param rng - The injected random source.
 * @param difficulty - The requested difficulty.
 * @param limit - The magnitude bound for the translation vector.
 * @returns The drawn step values.
 */
function drawValues(rng: RngFn, difficulty: string|undefined, limit: number): StepValues{
    let axes=["x-axis","y-axis","y=x","y=-x"];
    let centerMax=difficulty==="hard"?4:difficulty==="easy"?0:2;
    let scaleMax=difficulty==="hard"?4:difficulty==="easy"?2:3;
    let angles=difficulty==="easy"?[90, 180]:[90, 180, 270];
    let dx=randInt(rng, -limit, limit);
    let dy=randInt(rng, -limit, limit);
    // The zero vector is a legal translation but asks nothing, so it is replaced
    // with a shift of the drawn magnitude.
    if (dx===0&&dy===0) dy=limit;
    return {
        dx:dx,
        dy:dy,
        cx:randInt(rng, -centerMax, centerMax),
        cy:randInt(rng, -centerMax, centerMax),
        degrees:angles[Math.floor(rng()*angles.length)],
        scale:Math.floor(rng()*scaleMax)+2,
        axis:axes[Math.floor(rng()*axes.length)]
    };
}

/**
 * Draws a point that is neither the origin nor its own image. Nothing moves the
 * origin, and a point that maps to itself would print the answer in the prompt.
 * The drawn vector and centre are printed in the same parenthesised form as an
 * answer, so an image that coincides with either of them is rejected too.
 *
 * @param rng - The injected random source.
 * @param limit - The magnitude bound for each coordinate.
 * @param run - The transformation the question asks about.
 * @param printed - Points the prompt will print alongside the given point.
 * @returns A point the transformation moves to somewhere not already on the page.
 */
function drawPoint(rng: RngFn, limit: number, run: (x: number, y: number)=>[number, number], printed: [number, number][]): [number, number]{
    let last:[number, number]=[1, limit];
    for(let attempt=0; attempt<64; attempt++){
        let x=randInt(rng, -limit, limit);
        let y=randInt(rng, -limit, limit);
        if (x===0&&y===0) continue;
        last=[x, y];
        let image=run(x, y);
        if (image[0]===x&&image[1]===y) continue;
        if (printed.some(point=>point[0]===image[0]&&point[1]===image[1])) continue;
        return [x, y];
    }
    return last;
}

/**
 * Turns a point a whole number of quarter turns counterclockwise about the origin.
 * The centre of rotation is moved to the origin, turned, and moved back, which is
 * what keeps every coordinate a whole number, and the same turn is used by the
 * question and by its worked solution.
 *
 * @param degrees - The turn, a multiple of ninety degrees.
 * @param a - The first coordinate.
 * @param b - The second coordinate.
 * @returns The turned point.
 */
function quarterTurn(degrees: number, a: number, b: number): [number, number]{
    let quarter=((degrees/90)%4+4)%4;
    if (quarter===1) return [-b, a];
    if (quarter===2) return [-a, -b];
    return [b, -a];
}

/**
 * Builds a step from the drawn values. The rotation is a quarter turn about the
 * drawn centre: the point is moved into a frame centred on that point, turned,
 * and moved back, which keeps every coordinate whole.
 *
 * @param kind - Which transformation to build.
 * @param v - The drawn values.
 * @returns The step, stating and performing the same transformation.
 */
function buildStep(kind: string, v: StepValues): Step{
    if (kind==="translate"){
        return {text:`translated by the vector \\( \\left( ${v.dx}, ${v.dy} \\right) \\)`, map:(x, y)=>[x+v.dx, y+v.dy]};
    }
    if (kind==="rotate"){
        return {
            text:`rotated \\( ${v.degrees}^{\\circ} \\) counterclockwise about the point \\( \\left( ${v.cx}, ${v.cy} \\right) \\)`,
            map:(x, y)=>{
                let turned=quarterTurn(v.degrees, x-v.cx, y-v.cy);
                return [turned[0]+v.cx, turned[1]+v.cy];
            }
        };
    }
    if (kind==="reflect"){
        if (v.axis==="x-axis") return {text:`reflected in the \\( x \\)-axis`, map:(x, y)=>[x, -y]};
        if (v.axis==="y-axis") return {text:`reflected in the \\( y \\)-axis`, map:(x, y)=>[-x, y]};
        if (v.axis==="y=x") return {text:`reflected in the line \\( y = x \\)`, map:(x, y)=>[y, x]};
        return {text:`reflected in the line \\( y = -x \\)`, map:(x, y)=>[-y, -x]};
    }
    return {
        text:`dilated about the point \\( \\left( ${v.cx}, ${v.cy} \\right) \\) by a scale factor of \\( ${v.scale} \\)`,
        map:(x, y)=>[v.cx+v.scale*(x-v.cx), v.cy+v.scale*(y-v.cy)]
    };
}

/**
 * Builds four options around an image point. A transform can land a point on the
 * origin, and there all four sign flips collapse onto the key, so the pool also
 * carries the four single-coordinate offsets. Those four differ from the key and
 * from each other whatever the point is, which is what guarantees three wrong
 * options without any filler.
 *
 * @param rng - The injected random source.
 * @param key - The correct image.
 * @returns The key and three distinct wrong images, shuffled.
 */
function imageOptions(rng: RngFn, key: [number, number]): string[]{
    let [x, y]=key;
    let keyText=`(${x}, ${y})`;
    let wrong=[[x, -y], [-x, y], [y, x], [-y, -x], [x+1, y], [x-1, y], [x, y+1], [x, y-1]];
    let picked:string[]=[];
    for(let candidate of wrong){
        let text=`(${candidate[0]}, ${candidate[1]})`;
        if (text===keyText||picked.indexOf(text)>=0) continue;
        picked.push(text);
        if (picked.length===3) break;
    }
    return shuffle(rng, [keyText, ...picked]);
}

export function generateGeometricTransformations(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["translate_point","rotate_point","reflect_point","dilate_point","compose_transformations"];
    let type=types[Math.floor(rng()*types.length)];
    let limit=difficulty==="hard"?9:difficulty==="easy"?3:6;
    let values=drawValues(rng, difficulty, limit);
    let run:(x: number, y: number)=>[number, number];
    let stem="";
    let rungs:string[]=[];
    let steps:string[]=[];
    let firstStep: Step|null=null;
    if (type==="compose_transformations"){
        let kinds=["translate","rotate","reflect","dilate"];
        let first=kinds[Math.floor(rng()*kinds.length)];
        let rest=kinds.filter(kind=>kind!==first);
        let second=rest[Math.floor(rng()*rest.length)];
        let one=buildStep(first, values);
        let two=buildStep(second, values);
        firstStep=one;
        run=(px, py)=>{
            let middle=one.map(px, py);
            return two.map(middle[0], middle[1]);
        };
        stem=`First \\( P \\) is ${one.text}, then the result is ${two.text}.`;
        rungs=[
            "A composition is not simultaneous: the two transformations are applied one after the other, and the order the prompt gives is the order they are applied in.",
            "Do the first step on P, then feed whatever that gives into the second step. Doing both at once is what turns a composition into a mistake."
        ];
    }
    else{
        let kind=type==="translate_point"?"translate":type==="rotate_point"?"rotate":type==="reflect_point"?"reflect":"dilate";
        let step=buildStep(kind, values);
        run=step.map;
        stem=`Then \\( P \\) is ${step.text}.`;
        if (kind==="translate"){
            rungs=[
                "A translation slides every point by the same vector, so it adds that vector's two components to the two coordinates and changes no length.",
                "Add the translation vector to P, component by component."
            ];
        }
        else if (kind==="rotate"){
            rungs=[
                "To turn a point about a centre that is not the origin, move the centre of rotation to the origin, turn the point there, and move the centre back.",
                "A quarter turn swaps the two coordinates and negates one of them; the third and fourth quarter turns repeat the swap with the other sign."
            ];
        }
        else if (kind==="reflect"){
            rungs=[
                "A reflection flips a coordinate rather than adding to it, and which coordinate flips depends on the line: the x-axis changes the sign of y, the y-axis the sign of x, the line y = x swaps the two, and the line y = -x swaps them and negates both.",
                "Work out the rule for the line the prompt names before touching the numbers, then apply it to the coordinates of P."
            ];
        }
        else{
            rungs=[
                "A dilation about a point leaves that point fixed and multiplies every distance from it by the scale factor, so the centre has to be taken out of the picture first.",
                "Subtract the centre of dilation from P, multiply what is left by the scale factor, then add the centre back."
            ];
        }
    }
    let [x, y]=drawPoint(rng, limit, run, [[values.dx, values.dy], [values.cx, values.cy]]);
    let image=run(x, y);
    let keyText=`(${image[0]}, ${image[1]})`;
    let latex=`Point \\( P \\) is at \\( \\left( ${x}, ${y} \\right) \\). ${stem} What are the coordinates of the${type==="compose_transformations"?" final":""} image of \\( P \\)?`;
    if (type==="translate_point"){
        steps=[
            `The translation vector is (${values.dx}, ${values.dy}) and P is (${x}, ${y}).`,
            `Add component by component: ${x} + ${values.dx} = ${image[0]} and ${y} + ${values.dy} = ${image[1]}.`,
            `The image of P is ${keyText}.`
        ];
    }
    else if (type==="rotate_point"){
        steps=[
            `P is (${x}, ${y}) and the centre of rotation is (${values.cx}, ${values.cy}).`,
            `Move the centre to the origin: (${x} - ${values.cx}, ${y} - ${values.cy}) = (${x-values.cx}, ${y-values.cy}).`,
            `Turn that by ${values.degrees} degrees to get (${quarterTurn(values.degrees, x-values.cx, y-values.cy)[0]}, ${quarterTurn(values.degrees, x-values.cx, y-values.cy)[1]}), then add the centre back: ${keyText}.`
        ];
    }
    else if (type==="reflect_point"){
        steps=[
            `P is (${x}, ${y}) and the line of reflection is the ${values.axis}.`,
            `The ${values.axis} sends (${x}, ${y}) to (${image[0]}, ${image[1]}).`,
            `The image of P is ${keyText}.`
        ];
    }
    else if (type==="dilate_point"){
        steps=[
            `P is (${x}, ${y}) and the centre of dilation is (${values.cx}, ${values.cy}).`,
            `Take the centre out: (${x} - ${values.cx}, ${y} - ${values.cy}) = (${x-values.cx}, ${y-values.cy}).`,
            `Multiply by the scale factor ${values.scale} to get (${(x-values.cx)*values.scale}, ${(y-values.cy)*values.scale}), then add the centre back: ${keyText}.`
        ];
    }
    else{
        let middle=(firstStep as Step).map(x, y);
        steps=[
            `P is (${x}, ${y}), and the two steps are applied in turn.`,
            `The first step gives (${middle[0]}, ${middle[1]}), and the second step turns that into (${image[0]}, ${image[1]}).`,
            `The final image of P is ${keyText}.`
        ];
    }
    return {latex, correct:keyText, alternate:keyText, display:keyText, choices:imageOptions(rng, image), expectedFormat:"Enter as (x, y)", subskill:type, hints:{rungs, concede:"The answer is "+keyText+"."}, solution: steps};
}