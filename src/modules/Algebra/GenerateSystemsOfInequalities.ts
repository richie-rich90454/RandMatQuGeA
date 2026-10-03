/**
 * @file Systems of inequalities: what one inequality's half-plane contains, how
 * many plotted points satisfy a pair, whether two inequalities can hold at once,
 * and how many corners a region has.
 * @description A system of inequalities draws a region rather than solving for a
 * number, so each question here is the one that reduces the region to a single
 * gradeable answer: which of four plotted points lies in it, how many of four points
 * satisfy it, which of four pairs is impossible, or how many corner points the
 * region has. Every region is one of four shapes whose corner count is known before
 * the question is asked, so the answer is never a guess about a picture.
 *
 * The candidate points are built one place inside the boundary and the other three
 * one place outside it, so exactly one of them is in the half-plane by construction
 * rather than three of them being wrong by luck.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{numberOptions, fourOptions}from"../shared/Options.js";
import{randInt, shuffle}from"../shared/Random";

/**
 * Renders an ordered pair the way it is written in the prompt and in the options.
 *
 * @param x - The first coordinate.
 * @param y - The second coordinate.
 * @returns The point, with round brackets.
 */
function point(x: number, y: number): string{
    return `(${x}, ${y})`;
}

/**
 * Prints a pair of inequalities as two math groups, so that the symbols a learner
 * reads in the prompt are the same symbols the option uses.
 *
 * @param pair - Two statements joined by the word "and".
 * @returns The pair, with each statement in its own math group.
 */
function printPair(pair: string): string{
    return pair.split(" and ").map(statement=>`\\( ${statement} \\)`).join(" and ");
}

/**
 * Rewrites a plain-text inequality as LaTeX, for the prompt only. The worked
 * solution quotes the same inequalities as plain text, because the help panel
 * writes them as text rather than typesetting them.
 *
 * @param line - The inequality, for example "x >= 3".
 * @returns The same inequality in LaTeX.
 */
function toMath(line: string): string{
    return line.replace(/<=/g,"\\le").replace(/>=/g,"\\ge");
}

/**
 * A region whose corner count is known before the question is asked. The count is a
 * property of the shape rather than something to be discovered, and the worked
 * solution names the corner points so the answer can be checked.
 */
interface RegionFamily{
    /** The inequalities, as they appear in the prompt. */
    lines: string[];
    /** The corner points of the region, for the worked solution. */
    vertices: string;
    /** How many corner points the region has. */
    corners: number;
}

export function generateSystemsOfInequalities(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["graph_a_half_plane","find_a_feasible_point","no_overlapping_region","corner_count"];
    let type=types[Math.floor(rng()*types.length)];
    let span=difficulty==="hard"?14:difficulty==="easy"?7:10;
    let key="";
    let latex="";
    let choices:string[]=[];
    let expectedFormat="Enter a whole number";
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "graph_a_half_plane":{
            // One point is placed inside the half-plane and the other three two units
            // outside it on the same line of slope minus one, so each of them fails the
            // printed inequality for a reason a learner can point at.
            let relation=rng()<0.5?"\\le":"\\ge";
            let boundary=randInt(rng, 2, span);
            let below=relation==="\\le";
            let first=randInt(rng, -3, 3);
            let second=randInt(rng, -3, 3);
            for(let attempt=0; attempt<32; attempt++){
                if (below?first+second<=boundary:first+second>=boundary) break;
                second=below?second-boundary-1:second+boundary+1;
            }
            let accepts=point(first, second);
            let rejects=below?
                [point(first+1, second+1), point(first+2, second), point(first, second+2)]:
                [point(first-1, second-1), point(first-2, second), point(first, second-2)];
            let printed=shuffle(rng, [accepts, ...rejects]);
            key=accepts;
            latex=`The inequality \\( x + y ${relation} ${boundary} \\) is drawn as a half-plane. Which of these four points lies in that half-plane? ${printed.map(candidate=>`\\( ${candidate} \\)`).join(", ")}.`;
            expectedFormat="Enter the point, written as (x, y)";
            choices=fourOptions(key, rejects);
            rungs=[
                "A half-plane is everything on one side of the boundary line, so add the coordinates of each point and compare the total with the number on the right-hand side.",
                `Add the two coordinates at each of the four points and compare the total with ${boundary}.`
            ];
            steps=[
                `${accepts} gives x + y = ${first+second}, which satisfies x + y ${relation} ${boundary}.`,
                `The other three points give ${rejects.map(candidate=>{let parts=candidate.slice(1, -1).split(", "); return Number(parts[0])+Number(parts[1]);}).join(", ")}, all on the other side of ${boundary}.`,
                `So the point inside the half-plane is ${key}`
            ];
            break;
        }
        case "find_a_feasible_point":{
            // Four distinct points are plotted and counted, so the answer is how many of
            // them satisfy both inequalities at once. Counting rather than selecting
            // gives five possible values, which is the key plus four honest options.
            let cutX=randInt(rng, -4, 4);
            let cutY=randInt(rng, -4, 4);
            let plotted:string[]=[];
            for(let attempt=0; plotted.length<4&&attempt<64; attempt++){
                let candidate=point(randInt(rng, -6, 6), randInt(rng, -6, 6));
                if (plotted.indexOf(candidate)>=0) continue;
                plotted.push(candidate);
            }
            let count=0;
            for(let candidate of plotted){
                let parts=candidate.slice(1, -1).split(", ");
                if (Number(parts[0])>=cutX&&Number(parts[1])<=cutY) count++;
            }
            key=String(count);
            latex=`A system is \\( x \\ge ${cutX} \\) and \\( y \\le ${cutY} \\). How many of these four points satisfy both inequalities at once? ${plotted.map(candidate=>`\\( ${candidate} \\)`).join(", ")}.`;
            choices=numberOptions(count, [0, 1, 2, 3, 4].filter(value=>value!==count), 0);
            rungs=[
                "A point has to satisfy every inequality in the system, so test it against both and count only the points that pass both.",
                `For each point, check whether its first coordinate is at least ${cutX} and its second coordinate is at most ${cutY}.`
            ];
            steps=[
                `A point is feasible only when its first coordinate is at least ${cutX} and its second is at most ${cutY}.`,
                `Testing ${plotted.join(", ")} against that rule, ${count} of the four pass both tests.`,
                `The number of points that satisfy the system is ${key}`
            ];
            break;
        }
        case "no_overlapping_region":{
            // Each pair is two strict statements about the same variable, so whether
            // they can both hold is decided by whether the two intervals meet. The
            // signs are written the same way in the prompt and in the option, so the
            // two spellings cannot be confused.
            let splitHigh=randInt(rng, 2, 9);
            let splitLow=splitHigh-randInt(rng, 2, 8);
            key=`x > ${splitHigh} and x < ${splitLow}`;
            // The three possible pairs are given different left-hand numbers, because
            // two pairs built from the same pair of numbers are one option twice and
            // leave the question with three.
            let lefts:number[]=[];
            for(let attempt=0; lefts.length<3&&attempt<64; attempt++){
                let candidate=randInt(rng, -8, 8);
                if (lefts.indexOf(candidate)>=0) continue;
                lefts.push(candidate);
            }
            for(let candidate=-8; lefts.length<3&&candidate<=8; candidate++){
                if (lefts.indexOf(candidate)<0) lefts.push(candidate);
            }
            let others=lefts.map((low, index)=>{
                let variable=index===1?"y":"x";
                return `${variable} > ${low} and ${variable} < ${low+randInt(rng, 3, 9)}`;
            });
            let printed=shuffle(rng, [key, ...others]);
            latex=`Which of these four pairs of inequalities can never be true at the same time? ${printed.map(printPair).join(", ")}.`;
            expectedFormat="Enter the pair that can never both be true, written the way it is written here";
            choices=fourOptions(key, others);
            rungs=[
                "Two statements about the same variable can both be true only when the intervals they describe overlap, so compare their endpoints rather than the number of statements in the pair.",
                "Check whether the two numbers in each pair point the same way or contradict each other."
            ];
            steps=[
                `${key} asks x to be greater than ${splitHigh} and less than ${splitLow} at the same time.`,
                `${splitHigh} is above ${splitLow}, so no single value of x is both, and each of the other three pairs asks for a value strictly inside an interval that is not empty.`,
                `The pair that can never both be true is ${key}`
            ];
            break;
        }
        case "corner_count":{
            // Four shapes, with the corner count known before the question is asked, so
            // the answer follows from reading the region rather than from a picture the
            // learner has to imagine.
            let band=randInt(rng, 3, difficulty==="hard"?12:8);
            let side=band+randInt(rng, 2, 8);
            let cut=randInt(rng, 1, band-1);
            let stripLeft=randInt(rng, 1, 8);
            let stripRight=stripLeft+randInt(rng, 2, 8);
            let families: RegionFamily[]=[
                {lines:[`x >= ${stripLeft}`, `x <= ${stripRight}`], vertices:"the two boundary lines are parallel, so they never meet", corners:0},
                {lines:["x >= 0", "y >= 0", `x <= ${side}`], vertices:`(0, 0) and (${side}, 0)`, corners:2},
                {lines:["x >= 0", "y >= 0", `x + y <= ${side}`], vertices:`(0, 0), (${side}, 0) and (0, ${side})`, corners:3},
                {lines:["x >= 0", "y >= 0", `x + y <= ${side}`, `x + y >= ${cut}`], vertices:`(0, ${cut}), (0, ${side}), (${side}, 0) and (${cut}, 0)`, corners:4}
            ];
            let family=families[Math.floor(rng()*families.length)] as RegionFamily;
            key=String(family.corners);
            latex=`The system \\( ${family.lines.map(toMath).join(", ")} \\) is drawn as a region. How many corner points does that region have?`;
            choices=numberOptions(family.corners, [0, 1, 2, 3, 4].filter(value=>value!==family.corners), 0);
            rungs=[
                "A corner point is where two boundary lines meet and the region turns, so count the points where the boundary changes direction rather than counting the lines.",
                "Draw each boundary in turn and mark where one of them ends against another."
            ];
            steps=[
                `The boundaries of this region are ${family.lines.join(", ")}.`,
                `The corner points of the region are ${family.vertices}.`,
                `Counting them gives ${key}`
            ];
            break;
        }
    }
    return {latex, correct:key, alternate:key, display:key, choices, expectedFormat, subskill:type, hints:{rungs, concede:"The answer is "+key+"."}, solution: steps};
}
