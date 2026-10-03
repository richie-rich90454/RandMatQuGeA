/**
 * @file Spanning trees, minimum weight spanning trees and cycle removal.
 * @description A spanning tree of a connected graph keeps every vertex and drops
 * enough edges to leave no cycle, so it always has exactly one edge fewer than
 * the graph has vertices. Three of the four branches are decided by that one
 * fact; the fourth needs an algorithm, and Kruskal's algorithm is used to build
 * the weighted graphs whose answers are checked rather than asserted.
 *
 * The weighted graphs are built around a chosen spanning tree and then given
 * exactly one extra edge, which closes that tree into a single cycle. Kruskal's
 * algorithm on that graph rejects the same edge the construction put in, so the
 * reported weight is provably the minimum and not merely one spanning tree's
 * weight.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, shuffle}from"../shared/Random";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{type Edge, type Graph, VERTEX_LETTERS, vertexLabel, vertexList, edgeList}from"./GenerateGraphBasics";
import{nCr}from"./DiscreteUtils.js";

/** An edge with a weight, as the pair to print beside its letters. */
export interface WeightedEdge{
    /** The two vertices the edge joins, smaller first. */
    pair: Edge;
    /** The weight of the edge. */
    weight: number;
}

/**
 * A connected weighted graph: a spanning tree whose weights are drawn from a
 * narrow band and one extra edge whose weight sits strictly inside that band.
 * The extra edge is the one any spanning tree has to drop, because it closes the
 * only cycle.
 *
 * @param size - The vertex count.
 * @param rng - The injected random source.
 * @returns The weighted edges.
 */
function weightedGraphWithOneCycle(size: number, rng: RngFn): WeightedEdge[]{
    // Distinct weights are not decoration: with two edges of the same weight the
    // order Kruskal considers them in is not determined by the table, and a
    // question about that order would have an answer the printed data does not
    // decide. The weights are a shuffled run of 1 to size, so every weight is
    // distinct, and the extra edge is given the largest of them, which makes it
    // the one edge Kruskal is guaranteed to reject.
    let weights: number[]=[];
    for (let weight=1; weight<size; weight++) weights.push(weight);
    shuffle(rng, weights);
    let edges: WeightedEdge[]=[];
    let taken=new Set<string>();
    for (let index=1; index<size; index++){
        let joined=randInt(rng, 0, index-1);
        let pair: Edge=joined>index?[index, joined]:[joined, index];
        edges.push({pair, weight:weights[index-1] as number});
        taken.add(vertexLabel(pair[0])+vertexLabel(pair[1]));
    }
    for (let attempt=0; attempt<64; attempt++){
        let u=randInt(rng, 0, size-1);
        let v=randInt(rng, 0, size-1);
        if (u===v) continue;
        let pair: Edge=u>v?[v, u]:[u, v];
        if (taken.has(vertexLabel(pair[0])+vertexLabel(pair[1]))) continue;
        taken.add(vertexLabel(pair[0])+vertexLabel(pair[1]));
        edges.push({pair, weight:size});
        break;
    }
    return edges;
}

/**
 * Prints a weighted edge list for the prompt, as a table with one row per edge.
 *
 * @param edges - The weighted edges.
 * @returns The displayable table.
 */
function weightedTable(edges: WeightedEdge[]): string{
    let rows=edges.map(edge=>`${vertexLabel(edge.pair[0])}${vertexLabel(edge.pair[1])} & ${edge.weight}`).join(" \\\\ ");
    return `\\begin{array}{l|r} \\text{edge} & \\text{weight} \\\\ \\hline ${rows} \\end{array}`;
}

/**
 * Kruskal's algorithm: take the edges in order of increasing weight and keep an
 * edge only when it joins two components that are still apart.
 *
 * @param edges - The weighted edges.
 * @param size - The vertex count.
 * @returns The weight of the spanning tree it builds.
 */
function kruskalWeight(edges: WeightedEdge[], size: number): number{
    let ordered=[...edges].sort((left, right)=>left.weight-right.weight||left.pair[0]-right.pair[0]||left.pair[1]-right.pair[1]);
    let parent=new Array<number>(size);
    for (let index=0; index<size; index++) parent[index]=index;
    let find=(vertex: number): number=>{
        let root=vertex;
        while (parent[root]!==root) root=parent[root] as number;
        return root;
    };
    let total=0;
    for (let edge of ordered){
        let u=find(edge.pair[0]);
        let v=find(edge.pair[1]);
        if (u===v) continue;
        parent[u]=v;
        total+=edge.weight;
    }
    return total;
}

export function generateSpanningTrees(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["count_the_trees","kruskal_reasoning","minimum_spanning_tree","removing_a_cycle"];
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
        case "count_the_trees":{
            // The cycle on n vertices has exactly n spanning trees, because a
            // spanning tree is the cycle with one of its n edges removed and
            // every choice of the removed edge gives a different tree. The
            // number is built with the exact binomial machinery rather than
            // floating point, so it is never printed as n.000000000000004.
            let n=randInt(rng, 4, difficulty==="easy"?5:VERTEX_LETTERS.length);
            let edges: Edge[]=[];
            for (let index=1; index<n; index++) edges.push([index-1, index]);
            edges.push([0, n-1]);
            let graph: Graph={size: n, edges};
            let value=n;
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\), which form a single cycle. How many spanning trees does this graph have?`;
            expectedFormat="Enter a whole number";
            choices=numberOptions(value, [nCr(n, 2), value-1, value+1, n-2, 2*n]);
            steps=[
                `A spanning tree keeps all ${n} vertices and must have no cycle, so it is this cycle with exactly one edge deleted.`,
                `The cycle has ${n} edges, and deleting any one of them leaves a connected acyclic graph, while deleting none or two leaves a cycle.`,
                `So there are ${n} spanning trees, and the answer is ${value}.`
            ];
            rungs=[
                "A spanning tree is obtained by breaking the cycle, and the number of ways to break a cycle is the number of edges in it.",
                `The cycle has ${n} edges, and each one can be the edge that is removed.`
            ];
            break;
        }
        case "kruskal_reasoning":{
            // Distinct weights mean the order Kruskal considers the edges in is
            // forced by the weights alone, so the answer is one ordering out of
            // four and no tie-breaking rule is needed to decide it.
            let size=randInt(rng, 4, difficulty==="easy"?4:VERTEX_LETTERS.length);
            let edges=weightedGraphWithOneCycle(size, rng);
            let ordered=[...edges].sort((left, right)=>left.weight-right.weight);
            let kept: WeightedEdge[]=[];
            let parent=new Array<number>(size);
            for (let index=0; index<size; index++) parent[index]=index;
            let find=(vertex: number): number=>{
                let root=vertex;
                while (parent[root]!==root) root=parent[root] as number;
                return root;
            };
            for (let edge of ordered){
                if (kept.length===2) break;
                let u=find(edge.pair[0]);
                let v=find(edge.pair[1]);
                if (u===v) continue;
                parent[u]=v;
                kept.push(edge);
            }
            let label=(edge: WeightedEdge): string=>`${vertexLabel(edge.pair[0])}${vertexLabel(edge.pair[1])} (weight ${edge.weight})`;
            correct=kept.map(label).join(", then ");
            alternate=correct;
            display=correct;
            latex=`A connected graph has ${size} vertices and the weighted edges below. \\( ${weightedTable(edges)} \\) Kruskal's algorithm adds edges in order of increasing weight, skipping any edge that would close a cycle. Which two edges does it add first?`;
            expectedFormat="Choose the two edges Kruskal adds first";
            // The three wrong answers are the two orders Kruskal rejects: the two
            // heaviest edges first, the two lightest in reverse order, and the
            // lightest followed by the heaviest. Each is a real pair from the
            // table, so each is a reading a learner can produce from the numbers.
            let descending=[...ordered].reverse();
            let wrongPairs: WeightedEdge[][]=[
                [descending[0] as WeightedEdge, descending[1] as WeightedEdge],
                [kept[1] as WeightedEdge, kept[0] as WeightedEdge],
                [ordered[0] as WeightedEdge, descending[0] as WeightedEdge]
            ];
            let seen=new Set<string>([correct]);
            let texts: string[]=[];
            for (let pair of wrongPairs){
                let text=pair.map(label).join(", then ");
                if (seen.has(text)) continue;
                seen.add(text);
                texts.push(text);
            }
            choices=[correct, ...shuffle(rng, texts)];
            steps=[
                `The weights in the table are ${edges.map(edge=>edge.weight).join(", ")}, and the two smallest are ${ordered[0]?.weight} and ${ordered[1]?.weight}.`,
                `Taking those two edges joins four different vertices, so neither closes a cycle and both are accepted.`,
                `Kruskal's algorithm therefore adds ${correct}.`
            ];
            rungs=[
                "Kruskal's algorithm looks at the edges from smallest weight upwards and accepts one whenever it joins two components that are not yet joined.",
                `Sort the printed weights and take the two smallest; check that each one joins two components that are still apart.`
            ];
            break;
        }
        case "minimum_spanning_tree":{
            // The graph is a spanning tree plus one heavier edge, so the minimum
            // weight is the sum of the tree's weights and the extra edge is the
            // one the minimum spanning tree cannot use.
            let size=randInt(rng, 4, difficulty==="easy"?4:VERTEX_LETTERS.length);
            let edges=weightedGraphWithOneCycle(size, rng);
            let value=kruskalWeight(edges, size);
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`A connected graph has ${size} vertices and the weighted edges below. \\( ${weightedTable(edges)} \\) What is the total weight of a minimum spanning tree of this graph?`;
            expectedFormat="Enter a whole number";
            choices=numberOptions(value, [value+1, value-1, value+2, value-2, value*2]);
            steps=[
                "Kruskal's algorithm takes the edges in order of increasing weight and keeps one only when it joins two components that are still apart.",
                `Taking the edges in weight order and rejecting the one that would close the cycle gives a spanning tree whose weights sum to ${value}.`,
                `Every spanning tree has ${size-1} edges and this one is the lightest, so the total weight is ${value}.`
            ];
            rungs=[
                "Run Kruskal's algorithm: add edges from smallest weight upwards and reject any edge that would close a cycle, then add up the weights you kept.",
                `Add the ${size-1} smallest weights that do not close a cycle; the heaviest edge in the table is the one that gets rejected.`
            ];
            break;
        }
        case "removing_a_cycle":{
            // The cyclomatic number of a connected graph, m - n + 1, which is
            // exactly how many edges have to go before the graph is a tree.
            let size=randInt(rng, 5, difficulty==="easy"?6:VERTEX_LETTERS.length);
            let extra=randInt(rng, 1, difficulty==="easy"?2:difficulty==="hard"?3:2);
            let edges: Edge[]=[];
            let taken=new Set<string>();
            for (let index=1; index<size; index++){
                let joined=randInt(rng, 0, index-1);
                let pair: Edge=joined>index?[index, joined]:[joined, index];
                edges.push(pair);
                taken.add(vertexLabel(pair[0])+vertexLabel(pair[1]));
            }
            for (let attempt=0; attempt<64&&extra>0; attempt++){
                let u=randInt(rng, 0, size-1);
                let v=randInt(rng, 0, size-1);
                if (u===v) continue;
                let pair: Edge=u>v?[v, u]:[u, v];
                if (taken.has(vertexLabel(pair[0])+vertexLabel(pair[1]))) continue;
                taken.add(vertexLabel(pair[0])+vertexLabel(pair[1]));
                edges.push(pair);
                extra--;
            }
            let graph: Graph={size, edges};
            let value=edges.length-(size-1);
            correct=String(value);
            alternate=correct;
            display=`${edges.length} - ${size} + 1 = ${value}`;
            latex=`A connected graph has \\( ${size} \\) vertices and \\( ${edges.length} \\) edges: \\( ${edgeList(graph.edges)} \\). What is the smallest number of edges that must be deleted to leave a spanning tree?`;
            expectedFormat="Enter a whole number";
            choices=numberOptions(value, [value+1, value-1, value+2, 1, edges.length]);
            steps=[
                `A spanning tree of a graph with ${size} vertices has exactly ${size} - 1 = ${size-1} edges, because a tree on $n$ vertices has $n-1$ edges.`,
                `The graph has ${edges.length} edges, so the number that must go is ${edges.length} - ${size-1} = ${value}.`,
                `So ${value} edges must be deleted, and the answer is ${value}.`
            ];
            rungs=[
                "A tree on n vertices has exactly n - 1 edges, so the number of edges to delete is the edge count minus one less than the vertex count.",
                `Use the printed counts: ${edges.length} edges and ${size} vertices.`
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices: fourOptions(correct, choices), expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
