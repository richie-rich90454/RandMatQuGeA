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
        let turn:(x: number, y: number)=>[number, number];
        let quarter=((v.degrees/90)%4+4)%4;
        if (quarter===1) turn=(x, y)=>[-y, x];
        else if (quarter===2) turn=(x, y)=>[-x, -y];
        else turn=(x, y)=>[y, -x];
        return {
            text:`rotated \\( ${v.degrees}^{\\circ} \\) counterclockwise about the point \\( \\left( ${v.cx}, ${v.cy} \\right) \\)`,
            map:(x, y)=>{
                let turned=turn(x-v.cx, y-v.cy);
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
    if (type==="compose_transformations"){
        let kinds=["translate","rotate","reflect","dilate"];
        let first=kinds[Math.floor(rng()*kinds.length)];
        let rest=kinds.filter(kind=>kind!==first);
        let second=rest[Math.floor(rng()*rest.length)];
        let one=buildStep(first, values);
        let two=buildStep(second, values);
        run=(px, py)=>{
            let middle=one.map(px, py);
            return two.map(middle[0], middle[1]);
        };
        stem=`First \\( P \\) is ${one.text}, then the result is ${two.text}.`;
    }
    else{
        let kind=type==="translate_point"?"translate":type==="rotate_point"?"rotate":type==="reflect_point"?"reflect":"dilate";
        let step=buildStep(kind, values);
        run=step.map;
        stem=`Then \\( P \\) is ${step.text}.`;
    }
    let [x, y]=drawPoint(rng, limit, run, [[values.dx, values.dy], [values.cx, values.cy]]);
    let image=run(x, y);
    let keyText=`(${image[0]}, ${image[1]})`;
    let latex=`Point \\( P \\) is at \\( \\left( ${x}, ${y} \\right) \\). ${stem} What are the coordinates of the${type==="compose_transformations"?" final":""} image of \\( P \\)?`;
    return {latex, correct:keyText, alternate:keyText, display:keyText, choices:imageOptions(rng, image), expectedFormat:"Enter as (x, y)", subskill:type};
}