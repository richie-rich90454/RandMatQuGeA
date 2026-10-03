/**
 * @file Piecewise functions: evaluating at a point inside one piece, finding where
 * two formulas agree, reading a V-shaped function off a vertex and a point, and
 * reading a graph described in words.
 * @description Every branch here reduces a function to a single number a learner
 * can be graded on. The point evaluated is drawn strictly inside one piece rather
 * than on a boundary, because a point on a boundary is a question about the
 * convention at the join rather than about the formula. The boundary branch is the
 * same fact read the other way round: two formulas that agree at exactly one value
 * of x, and the question asks for that value.
 *
 * The V-shaped branch builds its own function from a vertex, a positive slope and
 * one point on its rising arm, so the equation it prints really does pass through
 * both features the prompt names, and each of the three distractors breaks exactly
 * one of them.
 */
import type{RngFn, QuestionDto}from"../../../types/global";
import{fourOptions}from"../../shared/Options.js";
import{randInt, shuffle}from"../../shared/Random";

/**
 * Renders a linear formula with its sign spelled out, so no formula ever prints a
 * plus sign followed by a minus sign.
 *
 * @param slope - The coefficient of x.
 * @param constant - The constant term.
 * @returns The formula, for example "3x - 1".
 */
function linear(slope: number, constant: number): string{
    if (slope===0) return String(constant);
    let head=Math.abs(slope)===1?"x":Math.abs(slope)+"x";
    if (constant===0) return head;
    if (constant>0) return head+" + "+constant;
    return head+" - "+Math.abs(constant);
}

/**
 * Renders a linear formula with a value of x already substituted in, which is the
 * last line of an evaluation the learner has to be able to follow.
 *
 * @param slope - The coefficient of x.
 * @param constant - The constant term.
 * @param at - The value substituted for x.
 * @returns The arithmetic, for example "3 x 4 + 2".
 */
function plugged(slope: number, constant: number, at: number): string{
    if (slope===0) return String(constant);
    let head=`${slope} x ${at}`;
    if (constant===0) return head;
    return constant>0?head+" + "+constant:head+" - "+Math.abs(constant);
}

/**
 * Renders the equation of an absolute value function with its vertex as the center.
 *
 * @param slope - The size of the arms.
 * @param center - The x-coordinate of the vertex.
 * @param height - The y-coordinate of the vertex.
 * @returns The equation, for example "f(x) = 2|x - 3| + 1".
 */
function vEquation(slope: number, center: number, height: number): string{
    let bars=center===0?"|x|":`|x ${center>0?"- "+center:"+ "+Math.abs(center)}|`;
    let body=`${slope===1?"":slope}${bars}`;
    if (height===0) return `f(x) = ${body}`;
    return `f(x) = ${body} ${height>0?"+ "+height:"- "+Math.abs(height)}`;
}

/**
 * Renders an ordered pair as it is written in the prompt.
 *
 * @param x - The first coordinate.
 * @param y - The second coordinate.
 * @returns The point, with round brackets.
 */
function point(x: number, y: number): string{
    return `(${x}, ${y})`;
}

export function generatePiecewiseFunctions(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["evaluate_a_branch","find_the_boundary","absolute_value_form","match_the_graph"];
    let type=types[Math.floor(rng()*types.length)];
    let slopeMax=difficulty==="hard"?4:3;
    let key="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "evaluate_a_branch":{
            // Three pieces partition the number line, and the point is drawn strictly
            // inside one of them, so the answer depends on reading which piece the point
            // falls in rather than on a convention at a join.
            let first=randInt(rng, -2, 1);
            let second=first+randInt(rng, 3, difficulty==="hard"?10:7);
            let slopes=[randInt(rng, -3, 3), randInt(rng, -3, 3), randInt(rng, -3, 3)];
            let offsets=[randInt(rng, -6, 6), randInt(rng, -6, 6), randInt(rng, -6, 6)];
            let which=Math.floor(rng()*3);
            let probe=which===0?first-randInt(rng, 1, 4):which===1?randInt(rng, first+1, second-1):second+randInt(rng, 1, 4);
            let slope=slopes[which] as number;
            let offset=offsets[which] as number;
            let value=slope*probe+offset;
            let others=slopes.map((each, index)=>(each as number)*probe+(offsets[index] as number));
            let definition=`f(x)=\\begin{cases} ${linear(slopes[0] as number, offsets[0] as number)} & x < ${first} \\\\ ${linear(slopes[1] as number, offsets[1] as number)} & ${first} \\le x \\le ${second} \\\\ ${linear(slopes[2] as number, offsets[2] as number)} & x > ${second} \\end{cases}`;
            key=String(value);
            latex=`A function is defined in pieces by \\[ ${definition} \\] What is the value of \\( f(${probe}) \\)?`;
            choices=fourOptions(key, [String(others[0]), String(others[1]), String(others[2]), String(value+1), String(value-1)]);
            rungs=[
                "Find which piece the given value of x falls in by testing it against the conditions, and then use only that piece's formula.",
                `The value ${probe} falls in ${which===0?`the first piece, which applies when x < ${first}`:which===1?`the middle piece, which applies when ${first} <= x <= ${second}`:`the last piece, which applies when x > ${second}`}.`
            ];
            steps=[
                `${probe} belongs to the ${which===0?"first":which===1?"middle":"last"} piece.`,
                `That piece is ${linear(slope, offset)}, so substitute ${probe} for x in it.`,
                `${plugged(slope, offset, probe)} = ${key}`
            ];
            break;
        }
        case "find_the_boundary":{
            // The join is chosen first and the second constant is derived from it, so the
            // two lines provably agree at exactly one point and the question cannot have
            // a second answer.
            let join=randInt(rng, -3, 6);
            let leftSlope=randInt(rng, 1, slopeMax);
            let rightSlope=randInt(rng, 1, slopeMax);
            if (rightSlope===leftSlope) rightSlope=leftSlope===1?2:1;
            let leftOffset=randInt(rng, -6, 6);
            let rightOffset=leftSlope*join+leftOffset-rightSlope*join;
            key=String(join);
            latex=`One piece of a graph is the straight line \\( y = ${linear(leftSlope, leftOffset)} \\) and the next piece is the straight line \\( y = ${linear(rightSlope, rightOffset)} \\). The two pieces meet at a single point. At what value of \\( x \\) do the two lines give the same \\( y \\)?`;
            choices=fourOptions(key, [String(join+1), String(join-1), String(join+2), String(leftOffset)]);
            rungs=[
                "Where two straight lines meet is the value of x that makes their formulas equal, so set the expressions equal and solve one linear equation.",
                `Equate ${linear(leftSlope, leftOffset)} with ${linear(rightSlope, rightOffset)} and solve for x.`
            ];
            steps=[
                `Set the two expressions equal: ${linear(leftSlope, leftOffset)} = ${linear(rightSlope, rightOffset)}.`,
                `Collecting the terms in x on the left and the constants on the right gives ${leftSlope-rightSlope}x = ${rightOffset-leftOffset}.`,
                `x = ${rightOffset-leftOffset} / ${leftSlope-rightSlope} = ${key}`
            ];
            break;
        }
        case "absolute_value_form":{
            let vertexX=randInt(rng, -4, 6);
            let vertexY=randInt(rng, -5, 6);
            let slope=[1, 2, 3][Math.floor(rng()*3)] as number;
            let arm=randInt(rng, 1, difficulty==="hard"?9:6);
            let throughX=vertexX+arm;
            let throughY=slope*arm+vertexY;
            key=vEquation(slope, vertexX, vertexY);
            // Six variants, three of which are kept. The pool is longer than three
            // because a vertex on one of the axes makes two of the first three collapse
            // onto the answer, and a shorter pool would then ship a three-option
            // question. Every variant keeps one feature of the answer and breaks
            // another, so each of them is wrong for a reason a learner can name.
            let pool=[
                vEquation(slope, -vertexX, vertexY),
                vEquation(slope, vertexX, -vertexY),
                vEquation(slope+1, vertexX, vertexY),
                vEquation(slope, vertexX+1, vertexY),
                vEquation(slope, vertexX-1, vertexY),
                vEquation(slope+2, vertexX, vertexY)
            ];
            let seen=new Set<string>([key]);
            let others:string[]=[];
            for(let option of pool){
                if (others.length>=3) break;
                if (seen.has(option)) continue;
                seen.add(option);
                others.push(option);
            }
            let printed=shuffle(rng, [key, ...others]);
            latex=`The graph of \\( f \\) is a V with its turning point at \\( ${point(vertexX, vertexY)} \\), and it passes through \\( ${point(throughX, throughY)} \\). Which of these four is an equation for \\( f \\)? ${printed.map(option=>`\\( ${option} \\)`).join(", ")}.`;
            expectedFormat="Enter the equation for f, written the way it is written here";
            choices=fourOptions(key, others);
            rungs=[
                "An absolute value function has the form a times the distance from the vertex, plus the height of the vertex, so read the vertex off first and then use the extra point to fix the size of the arms.",
                `The vertex gives the height ${vertexY} and the horizontal shift ${vertexX}, and ${point(throughX, throughY)} sits ${arm} units from ${vertexX}.`
            ];
            steps=[
                `The vertex ${point(vertexX, vertexY)} fixes the vertical shift as ${vertexY} and the horizontal shift as ${vertexX}.`,
                `From ${point(throughX, throughY)}, which is ${arm} from ${vertexX} along x and ${slope*arm} above ${vertexY} along y, the arms have size ${slope}.`,
                `So the equation is ${key}`
            ];
            break;
        }
        case "match_the_graph":{
            // The graph is described in words: it starts at the y-axis, rises to a
            // corner, and then falls. The number of steps taken after the corner is
            // drawn inside the range that keeps the answer a whole number above zero.
            let start=randInt(rng, 2, 12);
            let rise=randInt(rng, 1, slopeMax);
            let corner=randInt(rng, 1, 6);
            let fall=randInt(rng, 1, slopeMax);
            let cornerValue=start+rise*corner;
            let maxSteps=Math.max(1, Math.floor((cornerValue-1)/fall));
            let afterCorner=randInt(rng, 1, Math.min(maxSteps, difficulty==="hard"?10:6));
            let probe=corner+afterCorner;
            let value=cornerValue-fall*afterCorner;
            key=String(value);
            latex=`The graph of \\( f \\) passes through \\( ${point(0, start)} \\) and rises with slope \\( ${rise} \\) as \\( x \\) increases, until it reaches a corner at \\( x = ${corner} \\). After the corner it falls with slope \\( ${fall} \\). What is \\( f(${probe}) \\)?`;
            choices=fourOptions(key, [String(cornerValue+fall*afterCorner), String(cornerValue), String(value+fall), String(start-fall*afterCorner)]);
            rungs=[
                "Work along the graph in two stages: from the y-axis up to the corner, and from the corner onwards along the falling part.",
                `At the corner the height is ${start} + ${rise} x ${corner}, and from there the graph falls by ${fall} for each step in x.`
            ];
            steps=[
                `At the corner, where x = ${corner}, the height is ${start} + ${rise} x ${corner} = ${cornerValue}.`,
                `The point asked about is ${afterCorner} beyond the corner, so it lies ${fall} x ${afterCorner} below it.`,
                `${cornerValue} - ${fall*afterCorner} = ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:key, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
