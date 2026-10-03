/**
 * @file Reading a graph off an edge list.
 * @description Every graph here is printed as an explicit edge list, because a
 * graph a learner cannot see is a graph they can do nothing with: the degree of
 * a vertex is the number of printed edges that name it, and both the Euler and
 * the colouring questions are decided by counting those names.
 *
 * This file also owns the graph arithmetic the other graph generators need:
 * degrees, adjacency, girth and component count. Those are exported rather than
 * copied, because a girth computed by one file and an Euler verdict asserted by
 * another would be two answers to one question.
 *
 * The graphs are built to have the property the branch claims. A cycle branch
 * hangs pendant edges off its cycle, so the shortest cycle is the one that was
 * drawn; a connectivity branch draws its components with no edge between them;
 * and the girth is then computed from the printed edge list rather than assumed,
 * so a construction mistake would show up as a failing sweep rather than as a
 * wrong key.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, shuffle}from"../shared/Random";
import{numberOptions}from"../shared/Options.js";

/** An undirected edge, as the two vertex indices it joins, smaller first. */
export type Edge=[number, number];

/** An undirected simple graph: a vertex count and the edges between them. */
export interface Graph{
    /** The number of vertices, which are numbered from zero. */
    size: number;
    /** The edges, each with its smaller endpoint first. */
    edges: Edge[];
}

/**
 * The letters the vertices are named with in a printed edge list. The eighth
 * entry is not decoration: every branch caps its vertex count at eight, because a
 * graph with a ninth vertex would print an edge label ending in `undefined`
 * rather than a letter, which is a wrong question rather than an ugly one.
 */
export const VERTEX_LETTERS=["A","B","C","D","E","F","G","H"];

/**
 * Names a vertex the way the prompt names it.
 *
 * @param index - The vertex index.
 * @returns Its letter.
 */
export function vertexLabel(index: number): string{
    return VERTEX_LETTERS[index] as string;
}

/**
 * Names an edge the way the prompt names it, always with the smaller endpoint
 * first so that `AB` and `BA` cannot both appear in one edge list.
 *
 * @param edge - The edge.
 * @returns The two letters run together.
 */
export function edgeLabel(edge: Edge): string{
    return vertexLabel(edge[0])+vertexLabel(edge[1]);
}

/**
 * Prints an edge list for the prompt, where it is typeset as one group.
 *
 * @param edges - The edges.
 * @returns The comma-separated list.
 */
export function edgeList(edges: Edge[]): string{
    return edges.map(edgeLabel).join(", ");
}

/**
 * The adjacency matrix of a graph, as a lookup in constant time rather than a
 * scan over the edge list for every question about a pair of vertices.
 *
 * @param graph - The graph.
 * @returns One row per vertex, one column per vertex.
 */
export function adjacency(graph: Graph): boolean[][]{
    let table: boolean[][]=[];
    for (let index=0; index<graph.size; index++) table.push(new Array<boolean>(graph.size).fill(false));
    for (let edge of graph.edges){
        let [u, v]=edge;
        (table[u] as boolean[])[v]=true;
        (table[v] as boolean[])[u]=true;
    }
    return table;
}

/**
 * The degree of every vertex, as the number of edges naming it. In a simple
 * undirected graph that is exactly the incident-edge count, so it can be read
 * straight off the printed edge list.
 *
 * @param graph - The graph.
 * @returns One degree per vertex, in vertex order.
 */
export function degreeSequence(graph: Graph): number[]{
    let degrees=new Array<number>(graph.size).fill(0);
    for (let edge of graph.edges){
        let [u, v]=edge;
        degrees[u]=(degrees[u] as number)+1;
        degrees[v]=(degrees[v] as number)+1;
    }
    return degrees;
}

/**
 * The number of edges in a graph.
 *
 * @param graph - The graph.
 * @returns The edge count.
 */
export function edgeCount(graph: Graph): number{
    return graph.edges.length;
}

/**
 * How many vertices are of odd degree, which is what decides both the Euler path
 * and the Euler circuit.
 *
 * @param graph - The graph.
 * @returns The number of odd-degree vertices.
 */
export function oddDegreeCount(graph: Graph): number{
    return degreeSequence(graph).filter(degree=>degree%2===1).length;
}

/**
 * The length of the shortest cycle, or zero when the graph has none.
 *
 * Every subset of the vertices is tested: a subset is a cycle when it induces a
 * connected graph in which every vertex has degree exactly two. Enumerating
 * subsets is not the clever way to find a girth, but it is the way that cannot
 * be wrong about an odd cycle, and these graphs have at most seven vertices.
 *
 * @param graph - The graph.
 * @returns The girth, or zero for an acyclic graph.
 */
export function girth(graph: Graph): number{
    let table=adjacency(graph);
    let best=graph.size+1;
    for (let mask=3; mask<Math.pow(2, graph.size); mask++){
        let members:number[]=[];
        for (let index=0; index<graph.size; index++) if (((mask>>index)&1)===1) members.push(index);
        if (members.length<3||members.length>=best) continue;
        let inside=new Set<number>(members);
        let allDegreesTwo=true;
        for (let member of members){
            let degree=0;
            let row=table[member] as boolean[];
            for (let other of members) if (row[other]) degree++;
            if (degree!==2){
                allDegreesTwo=false;
                break;
            }
        }
        if (!allDegreesTwo) continue;
        let reachable=new Set<number>([members[0] as number]);
        let queue:number[]=[members[0] as number];
        while (queue.length>0){
            let vertex=queue.shift() as number;
            let row=table[vertex] as boolean[];
            for (let other of members){
                if (!row[other]||!inside.has(other)||reachable.has(other)) continue;
                reachable.add(other);
                queue.push(other);
            }
        }
        if (reachable.size!==members.length) continue;
        best=members.length;
    }
    return best>graph.size?0:best;
}

/**
 * The number of connected components, found by flood fill from each unvisited
 * vertex rather than by testing pairs of vertices for a path between them.
 *
 * @param graph - The graph.
 * @returns The component count.
 */
export function componentCount(graph: Graph): number{
    let table=adjacency(graph);
    let seen=new Set<number>();
    let components=0;
    for (let start=0; start<graph.size; start++){
        if (seen.has(start)) continue;
        components++;
        let queue:number[]=[start];
        seen.add(start);
        while (queue.length>0){
            let vertex=queue.shift() as number;
            let row=table[vertex] as boolean[];
            for (let other=0; other<graph.size; other++){
                if (!row[other]||seen.has(other)) continue;
                seen.add(other);
                queue.push(other);
            }
        }
    }
    return components;
}

/**
 * A connected simple graph on `size` vertices: a random spanning tree, so
 * connectivity is true by construction, plus `extra` further edges drawn with a
 * bounded retry so that no edge is repeated.
 *
 * @param size - The vertex count.
 * @param rng - The injected random source.
 * @param extra - How many edges beyond the spanning tree.
 * @returns The graph.
 */
export function connectedGraph(size: number, rng: RngFn, extra: number): Graph{
    let edges: Edge[]=[];
    for (let index=1; index<size; index++){
        let joined=randInt(rng, 0, index-1);
        edges.push(joined>index?[index, joined]:[joined, index]);
    }
    let seen=new Set<string>(edges.map(edgeLabel));
    for (let attempt=0; attempt<64&&edges.length<size-1+extra; attempt++){
        let u=randInt(rng, 0, size-1);
        let v=randInt(rng, 0, size-1);
        if (u===v) continue;
        let edge: Edge=u>v?[v, u]:[u, v];
        if (seen.has(edgeLabel(edge))) continue;
        seen.add(edgeLabel(edge));
        edges.push(edge);
    }
    return {size, edges};
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
export function cycleGraph(size: number): Graph{
    let edges: Edge[]=[];
    for (let index=1; index<size; index++) edges.push([index-1, index]);
    edges.push([0, size-1]);
    return {size, edges};
}

/**
 * Prints the vertex set of a graph for the prompt.
 *
 * @param graph - The graph.
 * @returns The comma-separated vertex names.
 */
export function vertexList(graph: Graph): string{
    let names:string[]=[];
    for (let index=0; index<graph.size; index++) names.push(vertexLabel(index));
    return names.join(", ");
}

/**
 * The letters of a run of vertices, written in the order the run visits them.
 *
 * @param from - The first vertex index.
 * @param count - How many vertices the run covers.
 * @returns The letters, comma separated.
 */
export function letterRun(from: number, count: number): string{
    let names:string[]=[];
    for (let index=0; index<count; index++) names.push(vertexLabel(from+index));
    return names.join(", ");
}

/**
 * Splits the vertices into the given number of non-empty consecutive groups, so
 * that drawing a path inside each group and no edge between groups produces
 * exactly that many connected components.
 *
 * @param size - The vertex count.
 * @param parts - The group count, at most the vertex count.
 * @param rng - The injected random source.
 * @returns The groups, in vertex order.
 */
function splitIntoGroups(size: number, parts: number, rng: RngFn): number[][]{
    // At least one group is given two vertices, so the printed edge list is never
    // empty. A graph with no edges has a component count a learner can only get
    // right by counting isolated vertices, and an empty edge list leaves the
    // prompt with an empty math group.
    let firstSize=randInt(rng, 2, Math.max(2, size-parts+1));
    let groups: number[][]=[];
    let cursor=0;
    let group: number[]=[];
    for (let step=0; step<firstSize; step++) group.push(cursor++);
    groups.push(group);
    for (let index=1; index<parts-1; index++){
        let remaining=size-cursor-(parts-1-index);
        let take=randInt(rng, 1, Math.max(1, remaining));
        let next: number[]=[];
        for (let step=0; step<take; step++) next.push(cursor++);
        groups.push(next);
    }
    let last: number[]=[];
    for (let step=0; step<size-cursor; step++) last.push(cursor++);
    groups.push(last);
    return groups.filter(entry=>entry.length>0);
}

export function generateGraphBasics(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["degree_of_a_vertex","a_walk_or_path","cycles","connectivity"];
    let type=types[Math.floor(rng()*types.length)];
    let cap=Math.min(VERTEX_LETTERS.length, difficulty==="easy"?5:difficulty==="hard"?7:6);
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "degree_of_a_vertex":{
            let size=randInt(rng, 4, cap);
            let graph=connectedGraph(size, rng, randInt(rng, 0, difficulty==="easy"?1:3));
            let vertex=randInt(rng, 0, size-1);
            let degree=degreeSequence(graph)[vertex] as number;
            let incident=graph.edges.filter(edge=>edge[0]===vertex||edge[1]===vertex);
            correct=String(degree);
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\). How many edges meet at \\( ${vertexLabel(vertex)} \\)?`;
            expectedFormat="Enter a whole number";
            choices=numberOptions(degree, [degree+1, degree-1, degree+2, size-1, 2, 0]);
            steps=[
                `The degree of a vertex is the number of printed edges that name it, so read the edge list and count the occurrences of \\( ${vertexLabel(vertex)} \\).`,
                `The edges meeting at \\( ${vertexLabel(vertex)} \\) are ${edgeList(incident)}.`,
                `There are ${incident.length} of them, so the degree is ${degree}.`
            ];
            rungs=[
                "The degree of a vertex in a simple undirected graph is the number of edges in the printed list that name it, so read the list and count.",
                `Look only at the edges naming \\( ${vertexLabel(vertex)} \\) in the printed list.`
            ];
            break;
        }
        case "a_walk_or_path":{
            // A path graph closed into a cycle by one extra edge. The closing
            // edge lets one wrong answer step from the last vertex back to the
            // first, and the fact that the rest is a bare path guarantees that
            // no two vertices more than one apart are joined, which is what makes
            // the jumping answer wrong.
            let size=randInt(rng, 5, cap);
            let edges: Edge[]=[];
            for (let index=1; index<size; index++) edges.push([index-1, index]);
            edges.push([0, size-1]);
            let graph: Graph={size, edges};
            let run=letterRun(0, size);
            let names=run.split(", ");
            let options=[
                run,
                [names[0] as string, names[size-1] as string, ...names].join(", "),
                [names[0] as string, names[1] as string, names[2] as string, names[4] as string].join(", "),
                [names[0] as string, names[1] as string, names[0] as string, names[1] as string, ...names.slice(2)].join(", ")
            ];
            correct=run;
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\). A path is a sequence of vertices in which every two consecutive vertices are joined by an edge and no vertex is repeated. Which of these four sequences is a path?`;
            expectedFormat="Choose the sequence that is a path";
            choices=[correct, ...shuffle(rng, options.slice(1))];
            steps=[
                `The edges are ${edgeList(graph.edges)}, so consecutive vertices are joined only along the list, with one extra edge joining \\( ${vertexLabel(0)} \\) to \\( ${vertexLabel(size-1)} \\).`,
                `The sequence ${run} uses only printed edges and visits each of the ${size} vertices exactly once, so it is a path.`,
                `The second sequence revisits a vertex, the third jumps from \\( ${vertexLabel(2)} \\) to \\( ${vertexLabel(4)} \\) across an edge that is not printed, and the fourth revisits a vertex as well.`
            ];
            rungs=[
                "Two things have to hold: every two consecutive vertices must be joined by a printed edge, and no vertex may appear twice.",
                `Check the consecutive pairs of each sequence against the printed edges \\( ${edgeList(graph.edges)} \\), then check for a repeated letter.`
            ];
            break;
        }
        case "cycles":{
            // A cycle with a chain of pendant edges hung off its last vertex. A
            // pendant edge cannot lie on any cycle, so the shortest cycle is
            // exactly the cycle that was drawn.
            let cycleLength=randInt(rng, 3, difficulty==="easy"?4:6);
            let size=Math.min(VERTEX_LETTERS.length, cycleLength+randInt(rng, 1, difficulty==="easy"?1:3));
            let edges: Edge[]=[];
            for (let index=1; index<cycleLength; index++) edges.push([index-1, index]);
            edges.push([0, cycleLength-1]);
            for (let index=cycleLength; index<size; index++) edges.push([index-1, index]);
            let graph: Graph={size, edges};
            let value=girth(graph);
            let circle=letterRun(0, cycleLength);
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\). What is the length of the shortest cycle in this graph?`;
            expectedFormat="Enter a whole number";
            choices=numberOptions(value, [value+1, value-1, value+2, size, size-1]);
            steps=[
                "A cycle is a closed route that visits no vertex twice, so look for the smallest group of vertices that can be walked round and closed using only printed edges.",
                `Going round \\( ${circle} \\) uses ${cycleLength} printed edges and closes on itself, so there is a cycle of length ${cycleLength}.`,
                `Every other edge hangs off that circle and cannot be closed into a cycle, so the shortest cycle has length ${value}.`
            ];
            rungs=[
                "A cycle is a closed route with no repeated vertex, so look for the smallest group of vertices that can be walked round and closed using printed edges.",
                `The closed loop runs through \\( ${circle} \\); the edges hanging off it cannot close into a cycle.`
            ];
            break;
        }
        case "connectivity":{
            let parts=difficulty==="easy"?2:randInt(rng, 2, difficulty==="hard"?4:3);
            let size=parts+randInt(rng, 1, difficulty==="hard"?3:2);
            let groups=splitIntoGroups(size, parts, rng);
            let edges: Edge[]=[];
            for (let group of groups) for (let step=0; step+1<group.length; step++) edges.push([group[step] as number, group[step+1] as number]);
            let graph: Graph={size, edges};
            let value=componentCount(graph);
            let described=groups.map(group=>letterRun(group[0] as number, group.length)).join("; ");
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\). How many connected components does this graph have?`;
            expectedFormat="Enter a whole number";
            choices=numberOptions(value, [value+1, value-1, value+2, 1, size]);
            steps=[
                "Start at a vertex, follow printed edges, mark every vertex reached, then start again from the first unmarked vertex; each fresh start is one more component.",
                `The printed edges reach \\( ${described} \\) and no vertex outside its own group.`,
                `That is ${parts} separate groups, so the graph has ${value} connected components.`
            ];
            rungs=[
                "A connected component is a group of vertices joined to each other and to nothing outside, so flood-fill from one vertex and start again from the first vertex not reached.",
                `Follow the printed edges \\( ${edgeList(graph.edges)} \\) from each unmarked vertex in turn and count the fresh starts.`
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices, expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
