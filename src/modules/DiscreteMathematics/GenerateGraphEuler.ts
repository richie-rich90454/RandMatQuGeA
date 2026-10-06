/**
 * @file Euler paths, Euler circuits, Hamilton paths and bipartiteness.
 * @description The Euler verdicts are settled by degrees: a connected graph has
 * an Euler path exactly when two of its vertices have odd degree, and an Euler
 * circuit exactly when none do. Both graphs here are built so that the parity
 * they claim is the parity they have — a cycle with a pendant chain for the
 * path, two cycles sharing a vertex for the circuit — and the parity is then
 * read back off the printed edge list rather than assumed.
 *
 * A Hamilton path is not decided by the degrees, so that branch does not use
 * them. Its graphs are cycles of four to six vertices, small enough that each of
 * the three wrong orders is checked against the edge list by the generator
 * itself, and each is wrong for a different reason: a step across an edge that
 * is not printed, a repeated vertex, and a vertex left out.
 *
 * The bipartiteness branch asks which of four printed graphs is bipartite rather
 * than asking whether one graph is, because a yes or no answer would leave the
 * option set with two honest options instead of four. Each graph is decided by a
 * two-coloring attempt, so the correct one is correct because it was checked.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, shuffle}from"../shared/Random";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{type Edge, type Graph, VERTEX_LETTERS, vertexLabel, edgeList, vertexList, degreeSequence, adjacency, letterRun}from"./GenerateGraphBasics";

/**
 * Reports whether an order is a Hamilton path: every consecutive pair is joined
 * by an edge and every vertex of the graph is visited exactly once.
 *
 * @param order - The vertex indices, in the order printed.
 * @param graph - The graph.
 * @returns True when the order is a Hamilton path.
 */
function isHamiltonPath(order: number[], graph: Graph): boolean{
    if (order.length!==graph.size) return false;
    let seen=new Set<number>();
    for (let vertex of order){
        if (seen.has(vertex)) return false;
        seen.add(vertex);
    }
    let table=adjacency(graph);
    for (let index=0; index+1<order.length; index++){
        let row=table[order[index] as number] as boolean[];
        if (!row[order[index+1] as number]) return false;
    }
    return true;
}

/**
 * Reports whether a graph can be two-colored, which is the same as saying it
 * has no odd cycle.
 *
 * @param graph - The graph.
 * @returns True when the graph is bipartite.
 */
export function isBipartite(graph: Graph): boolean{
    let table=adjacency(graph);
    let color=new Array<number>(graph.size).fill(-1);
    for (let start=0; start<graph.size; start++){
        if (color[start]!==-1) continue;
        color[start]=0;
        let queue:number[]=[start];
        while (queue.length>0){
            let vertex=queue.shift() as number;
            let row=table[vertex] as boolean[];
            let wanted=(color[vertex] as number)===0?1:0;
            for (let other=0; other<graph.size; other++){
                if (!row[other]) continue;
                if (color[other]===-1){
                    color[other]=wanted;
                    queue.push(other);
                    continue;
                }
                if (color[other]===(color[vertex] as number)) return false;
            }
        }
    }
    return true;
}

/**
 * A cycle on `size` vertices, whose edges are `0-1, 1-2, ..., size-2 - size-1`
 * and `size-1 - 0`. A cycle is the smallest graph in which the difference
 * between a Hamilton path and an Euler path is visible, because a path may stop
 * short of closing and a circuit may not.
 *
 * @param size - The vertex count.
 * @returns The graph.
 */
function cycleGraph(size: number): Graph{
    let edges: Edge[]=[];
    for (let index=1; index<size; index++) edges.push([index-1, index]);
    edges.push([0, size-1]);
    return {size, edges};
}

/**
 * Names a pair of vertices the way an option carries it.
 *
 * @param first - The first vertex index.
 * @param second - The second vertex index.
 * @returns The pair in braces, in alphabetical order.
 */
function pairText(first: number, second: number): string{
    let names=[vertexLabel(first), vertexLabel(second)].sort();
    return `{${names.join(", ")}}`;
}

export function generateGraphEuler(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["euler_path","euler_circuit","hamilton_path","bipartite_by_odd_degree"];
    let type=types[Math.floor(rng()*types.length)];
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "euler_path":{
            // A cycle with a chain of pendant edges hung off its last vertex:
            // that vertex goes to degree three and the free end of the chain has
            // degree one, and every other vertex stays even, so exactly two
            // vertices have odd degree. At least five vertices are used so that
            // three pairs of even-degree vertices exist to offer as wrong answers.
            let cycleLength=randInt(rng, 3, difficulty==="easy"?4:6);
            let tail=randInt(rng, 1, difficulty==="easy"?2:3);
            if (cycleLength+tail<5) tail=5-cycleLength;
            if (cycleLength+tail>VERTEX_LETTERS.length) tail=VERTEX_LETTERS.length-cycleLength;
            let graph=cycleGraph(cycleLength);
            for (let step=0; step<tail; step++) graph.edges.push([cycleLength+step-1, cycleLength+step]);
            graph.size=cycleLength+tail;
            let degrees=degreeSequence(graph);
            let odd: number[]=[];
            let even: number[]=[];
            for (let index=0; index<graph.size; index++){
                if ((degrees[index] as number)%2===1) odd.push(index);
                else even.push(index);
            }
            let pair=pairText(odd[0] as number, odd[1] as number);
            let wrong: string[]=[];
            for (let u=0; u<even.length&&wrong.length<3; u++){
                for (let v=u+1; v<even.length&&wrong.length<3; v++) wrong.push(pairText(even[u] as number, even[v] as number));
            }
            correct=pair;
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\). A route that uses every edge exactly once is an Euler path, and such a route has to begin and end at two vertices of odd degree. Which pair of vertices must they be?`;
            expectedFormat="Choose the pair of vertices, in braces";
            choices=[correct, ...shuffle(rng, wrong)];
            steps=[
                `Count the printed edges meeting at each vertex: ${edgeList(graph.edges)}.`,
                `The degrees of \\( ${vertexList(graph)} \\) are ${degrees.join(", ")}, and the only odd ones are at ${pairText(odd[0] as number, odd[1] as number).replace(/[{}]/g, "")}.`,
                `An Euler path starts and finishes at odd-degree vertices, so the pair is ${pair}.`
            ];
            rungs=[
                "An Euler path has exactly two ends and a vertex can be an end only when an odd number of edges meet there, so find the two odd-degree vertices.",
                `Count the printed edges meeting at each vertex; exactly two vertices have an odd count, and those are the ends.`
            ];
            break;
        }
        case "euler_circuit":{
            // Two cycles sharing exactly one vertex: every vertex then has degree
            // two or four, so all of them are even and an Euler circuit exists.
            // The two cycles share one vertex, so the graph has first + second - 1
            // vertices. Both bounds are set so that total stays at eight or fewer,
            // which is what keeps every printed edge label a pair of letters.
            let first=randInt(rng, 3, difficulty==="easy"?4:5);
            let second=randInt(rng, 3, difficulty==="easy"?4:4);
            let graph=cycleGraph(first);
            // The second cycle is 0, first, first+1, ..., first+second-2, back to
            // 0: it shares vertex 0 with the first cycle and nothing else, so every
            // vertex ends up with degree two or four and all of them are even.
            graph.edges.push([0, first]);
            for (let index=0; index<second-1; index++){
                let from=first+index;
                let to=index+1===second-1?0:first+index+1;
                graph.edges.push(from<to?[from, to]:[to, from]);
            }
            graph.size=first+second-1;
            let value=graph.edges.length;
            let optionSet=numberOptions(value, [value-1, value+1, value-2, value+2, first, second]);
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\). How many edges does an Euler circuit of this graph traverse?`;
            expectedFormat="Enter a whole number";
            choices=[correct, ...shuffle(rng, optionSet.slice(1))];
            steps=[
                "An Euler circuit uses every edge of the graph exactly once and then returns to where it started, so its length is the number of edges.",
                `The printed list has ${value} edges, and the degrees are ${degreeSequence(graph).join(", ")}, all of them even, so such a circuit does exist.`,
                `It traverses all ${value} edges, so the answer is ${value}.`
            ];
            rungs=[
                "An Euler circuit uses every edge of the graph exactly once, so its length is the number of edges in the printed list rather than the number of vertices.",
                `Count the printed edges \\( ${edgeList(graph.edges)} \\); that is the length of the circuit.`
            ];
            break;
        }
        case "hamilton_path":{
            // A cycle of four to six vertices. The three wrong orders are checked
            // against the edge list rather than trusted, and the bounded repair
            // keeps the set at four if a change ever breaks that.
            let size=randInt(rng, 4, difficulty==="easy"?4:6);
            let graph=cycleGraph(size);
            let all: number[]=[];
            for (let index=0; index<size; index++) all.push(index);
            let backwards: number[]=[0, 1, size-1];
            for (let index=size-2; index>=2; index--) backwards.push(index);
            let repeat: number[]=[0, 1, 0, 1];
            for (let index=2; index<size; index++) repeat.push(index);
            let wrong: number[][]=[];
            for (let candidate of [backwards, repeat, all.slice(0, size-1)]){
                if (!isHamiltonPath(candidate, graph)) wrong.push(candidate);
            }
            for (let attempt=1; wrong.length<3&&attempt<8; attempt++) wrong.push(all.slice(0, attempt));
            let names=(order: number[]): string=>order.map(vertexLabel).join(", ");
            correct=names(all);
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\). A Hamilton path visits every vertex of the graph exactly once, using only edges of the graph. Which of these four orders is a Hamilton path?`;
            expectedFormat="Choose the order that is a Hamilton path";
            choices=[correct, ...shuffle(rng, wrong.map(names))];
            steps=[
                `A Hamilton path has to do two things at once: every two consecutive vertices must be joined by a printed edge, and every one of the ${size} vertices must appear exactly once.`,
                `Going round the cycle in order visits each vertex once along printed edges, so \\( ${letterRun(0, size)} \\) is a Hamilton path.`,
                `One of the other orders steps from \\( ${vertexLabel(1)} \\) to \\( ${vertexLabel(size-1)} \\), which no printed edge joins; one repeats a vertex; and one leaves \\( ${vertexLabel(size-1)} \\) out altogether.`
            ];
            rungs=[
                "A Hamilton path must visit every vertex exactly once and every step must be along a printed edge, so count the vertices named first and then check the steps.",
                `There are ${size} vertices, so the order has to name all ${size} of them and stop.`
            ];
            break;
        }
        case "bipartite_by_odd_degree":{
            // Four printed graphs on the same five vertices: one built with no odd
            // cycle and three built around an odd cycle, then all four tested by
            // a two-coloring attempt. The relabeling keeps the questions from
            // repeating without changing which of the four is bipartite.
            let size=5;
            let offset=randInt(rng, 0, size-1);
            let patterns: number[][][]=[
                [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4]],
                [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4]],
                [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
                [[1, 2], [2, 3], [3, 4], [4, 0], [0, 1], [1, 4]]
            ];
            let candidates: Edge[][]=patterns.map(pattern=>pattern.map(pair=>{
                let u=(pair[0]+offset)%size;
                let v=(pair[1]+offset)%size;
                return u<v?[u, v]:[v, u];
            }));
            let graphs=candidates.map(edges=>({size, edges}));
            let bipartite: number[]=[];
            for (let index=0; index<graphs.length; index++) if (isBipartite(graphs[index] as Graph)) bipartite.push(index);
            // Exactly one of the four is bipartite by construction; the fallback
            // keeps a change to the candidate list from shipping an invalid set.
            let winner=bipartite.length===1?bipartite[0] as number:0;
            let graph=graphs[winner] as Graph;
            let options=candidates.map(edges=>edgeList(edges));
            correct=options[winner] as string;
            alternate=correct;
            display=correct;
            latex=`Four graphs are given, each on the vertices \\( ${vertexList(graph)} \\). A graph is bipartite when its vertices can be split into two groups with no edge inside either group, which is the same as having no odd cycle. Which of the four printed graphs is bipartite?`;
            expectedFormat="Choose the edge list of the bipartite graph";
            choices=[correct, ...shuffle(rng, options.filter((_, index)=>index!==winner))];
            steps=[
                "Two-color each graph in turn: give one vertex color 1, force every neighbor to color 2, and keep going. A graph is bipartite exactly when no vertex is ever forced to the same color as a neighbor.",
                `The graph with edges ${correct} colors cleanly around its four-cycle, while each of the other three contains an odd cycle, which cannot be split into two groups.`,
                `So the bipartite graph is the one with edges ${correct}.`
            ];
            rungs=[
                "A graph is bipartite exactly when it has no odd cycle, so look for an odd cycle in each printed graph before coloring anything.",
                "Two-color each graph from one vertex outwards; a conflict means an odd cycle, and an odd cycle means the graph is not bipartite."
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices: fourOptions(correct, choices), expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
