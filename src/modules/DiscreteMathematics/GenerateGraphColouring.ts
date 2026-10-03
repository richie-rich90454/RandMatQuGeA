/**
 * @file Vertex colouring and the chromatic number.
 * @description A graph is 2-colourable exactly when it is bipartite, which for a
 * connected graph is exactly the absence of an odd cycle. Every graph here is
 * printed as an edge list and its chromatic number is computed by trying
 * colourings from one colour upwards, so the key is a property of the printed
 * edges rather than a label attached to the graph when it was drawn.
 *
 * The three "how many colours" branches ask for the chromatic number with the
 * higher numbers offered as the distractors, because the usual error is to
 * answer four for everything and two for everything. The fourth branch asks
 * which of four statements about a bipartite graph is true, because the
 * equivalence between bipartite and 2-colourable is a statement rather than a
 * count and needs four honest answers of a different shape.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, shuffle}from"../shared/Random";
import{fourOptions, numberOptions}from"../shared/Options.js";
import{type Edge, type Graph, VERTEX_LETTERS, vertexList, edgeList, adjacency, cycleGraph}from"./GenerateGraphBasics";
import{isBipartite}from"./GenerateGraphEuler";

/**
 * The smallest number of colours that colours a graph so that no edge has two
 * ends of the same colour, found by trying colourings with one colour, then two,
 * and so on. With at most six vertices a graph always colours with six colours,
 * so the search always terminates and never needs a bound of its own.
 *
 * @param graph - The graph.
 * @returns The chromatic number.
 */
export function chromaticNumber(graph: Graph): number{
    let table=adjacency(graph);
    for (let colours=1; colours<=graph.size; colours++){
        let assigned=new Array<number>(graph.size).fill(-1);
        let search=(): boolean=>{
            let vertex=-1;
            for (let index=0; index<graph.size; index++){
                if (assigned[index]===-1){
                    vertex=index;
                    break;
                }
            }
            if (vertex<0) return true;
            let row=table[vertex] as boolean[];
            for (let colour=0; colour<colours; colour++){
                let legal=true;
                for (let other=0; other<graph.size; other++){
                    if (row[other]&&assigned[other]===colour){
                        legal=false;
                        break;
                    }
                }
                if (!legal) continue;
                assigned[vertex]=colour;
                if (search()) return true;
                assigned[vertex]=-1;
            }
            return false;
        };
        if (search()) return colours;
    }
    return graph.size;
}

/**
 * An even cycle with a chain of pendant edges hung off one of its vertices,
 * which is 2-colourable because every vertex has even degree and no odd cycle.
 *
 * @param cycleLength - The even cycle length.
 * @param tail - How many pendant edges to hang off it.
 * @returns The graph.
 */
function evenCycleWithTail(cycleLength: number, tail: number): Graph{
    let graph=cycleGraph(cycleLength);
    for (let step=0; step<tail; step++) graph.edges.push([cycleLength+step-1, cycleLength+step]);
    graph.size=cycleLength+tail;
    return graph;
}

/**
 * A triangle with a chain of pendant edges hung off one of its vertices, which
 * needs three colours because the triangle forces a third and the chain needs no
 * more than the two it already has.
 *
 * @param tail - How many pendant edges to hang off the triangle.
 * @returns The graph.
 */
function triangleWithTail(tail: number): Graph{
    let edges: Edge[]=[[0, 1], [1, 2], [0, 2]];
    for (let step=0; step<tail; step++) edges.push([2+step, 3+step]);
    return {size: 3+tail, edges};
}

export function generateGraphColouring(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["two_colour_test","three_colouring","four_colour_theorem","bipartite_equals_two_colourable"];
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
        case "two_colour_test":{
            // An even cycle plus pendant edges, so the graph has an edge and no
            // odd cycle: exactly two colours are needed and one is impossible.
            let cycleLength=2*randInt(rng, 2, difficulty==="easy"?2:difficulty==="hard"?3:3);
            let tail=Math.min(randInt(rng, 0, difficulty==="easy"?1:2), VERTEX_LETTERS.length-cycleLength);
            let graph=evenCycleWithTail(cycleLength, tail);
            // A bipartite graph with at least one edge needs exactly two colours,
            // so the bipartiteness test settles the number without a search; the
            // search is the fallback for the case where it somehow does not hold.
            let value=isBipartite(graph)?2:chromaticNumber(graph);
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\). What is the smallest number of colours that colours its vertices so that two joined vertices never share a colour?`;
            expectedFormat="Enter a whole number";
            choices=numberOptions(value, [value+1, value+2, 1, 4, 5]);
            steps=[
                "One colour cannot do it, because the graph has an edge and the two ends of that edge would share the colour.",
                `Alternating two colours round the even cycle \\( ${edgeList(graph.edges.slice(0, cycleLength))} \\) works, and every vertex hanging off it has a neighbour already coloured, so two colours reach all of them.`,
                `So the smallest number is ${value}.`
            ];
            rungs=[
                "A graph is 2-colourable exactly when it has no odd cycle, so look round the printed graph for a cycle of odd length before counting colours.",
                `The cycle in this graph has ${cycleLength} edges, which is even, and the remaining edges hang off it.`
            ];
            break;
        }
        case "three_colouring":{
            let graph=triangleWithTail(randInt(rng, 0, difficulty==="easy"?1:difficulty==="hard"?3:2));
            let value=chromaticNumber(graph);
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\). What is the smallest number of colours that colours its vertices so that two joined vertices never share a colour?`;
            expectedFormat="Enter a whole number";
            choices=numberOptions(value, [value+1, value-1, 4, 5, 2]);
            steps=[
                `The edges ${edgeList(graph.edges.slice(0, 3))} form a triangle, so those three vertices must all take different colours and two colours cannot do it.`,
                "Three colours do it: colour the triangle with three colours and give every vertex on the chain hanging off it the colour of a neighbour that differs.",
                `So the smallest number is ${value}.`
            ];
            rungs=[
                "A triangle forces three colours on its own, and any vertex hanging off the triangle can be given the colour of one of its two differently coloured neighbours, so three is usually the answer when a triangle is present.",
                `Look for a triangle in the printed edge list \\( ${edgeList(graph.edges)} \\).`
            ];
            break;
        }
        case "four_colour_theorem":{
            correct="4";
            alternate=correct;
            display=correct;
            latex=`By the four colour theorem, every planar graph can have its vertices coloured so that two joined vertices never share a colour. At most how many colours are guaranteed to suffice?`;
            expectedFormat="Enter a whole number";
            choices=numberOptions(4, [3, 5, 6, 2, 7]);
            steps=[
                "The four colour theorem says that the vertices of any planar graph can be coloured with no more than four colours, so that joined vertices never share a colour.",
                "Four is known to be enough and also known to be necessary in the worst case, since there are planar graphs that need all four.",
                "So at most four colours are guaranteed, and the answer is 4."
            ];
            rungs=[
                "The four colour theorem is a statement about planar graphs and a bound of four, so read the number off the theorem rather than off the graph.",
                "Every planar graph has a colouring with at most four colours, and some need all four."
            ];
            break;
        }
        case "bipartite_equals_two_colourable":{
            // A connected graph with no edges at all would make two of the four
            // statements true, so at least one edge is always drawn.
            let size=randInt(rng, 4, difficulty==="easy"?4:VERTEX_LETTERS.length);
            let edges: Edge[]=[];
            for (let index=1; index<size; index++){
                let joined=randInt(rng, 0, index-1);
                edges.push(joined>index?[index, joined]:[joined, index]);
            }
            let graph: Graph={size, edges};
            let statements=[
                "it can be coloured with two colours, one for each of the two groups",
                "it needs three colours, because a bipartite graph contains a triangle",
                "it needs four colours",
                "it cannot be coloured at all, because it is disconnected"
            ];
            correct=statements[0] as string;
            alternate=correct;
            display=correct;
            latex=`A simple graph has vertices \\( ${vertexList(graph)} \\) and edges \\( ${edgeList(graph.edges)} \\), and it is bipartite. Which of these four statements about the graph is true?`;
            expectedFormat="Choose the true statement";
            choices=[correct, ...shuffle(rng, statements.slice(1))];
            steps=[
                "Bipartite means the vertices split into two groups with no edge inside either group, and that is exactly the same thing as being colourable with two colours.",
                `The printed graph has no cycle at all, so in particular it has no triangle and it is connected, which rules out the other three statements.`,
                `So the true statement is: ${correct}.`
            ];
            rungs=[
                "Bipartite and 2-colourable are two names for the same property: a split of the vertices into two groups with no edge inside either group is the same as a colouring with two colours.",
                `Check the graph against the other three statements: does it contain a triangle, does it need four colours, and is it disconnected?`
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices: fourOptions(correct, choices), expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
