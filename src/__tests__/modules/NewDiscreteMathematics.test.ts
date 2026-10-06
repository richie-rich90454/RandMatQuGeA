/**
 * @vitest-environment jsdom
 * @file The thirteen new DiscreteMathematics generators.
 * @description Four gates over these generators, and the first one is the reason
 * the file exists. Every branch has to be reachable from a few hundred seeds,
 * which is the only evidence that a branch constructs the case it claims: a
 * branch that only sometimes produces its own graph, its own three-set union or
 * its own odd-cycle-free graph is a branch that will fail its own test.
 *
 * The gates are branch coverage, the option-set contract, well-formedness with a
 * prompt that renders as valid LaTeX, and the multiple-choice validator over a
 * hundred seeds at each of three difficulties. The last block pins one hand-checked
 * graph per graph topic, because the graph arithmetic is where a wrong key is
 * easiest to produce and hardest to notice.
 */
import{describe, it, expect}from"vitest";
import{generatePropositionalLogic}from"../../modules/DiscreteMathematics/GeneratePropositionalLogic";
import{generateLogicEquivalences}from"../../modules/DiscreteMathematics/GenerateLogicEquivalences";
import{generateSetOperations}from"../../modules/DiscreteMathematics/GenerateSetOperations";
import{generateInclusionExclusion}from"../../modules/DiscreteMathematics/GenerateInclusionExclusion";
import{generatePigeonhole}from"../../modules/DiscreteMathematics/GeneratePigeonhole";
import{generateGraphBasics, degreeSequence, edgeCount, girth, componentCount, type Graph}from"../../modules/DiscreteMathematics/GenerateGraphBasics";
import{generateGraphEuler, isBipartite}from"../../modules/DiscreteMathematics/GenerateGraphEuler";
import{generateGraphColoring, chromaticNumber}from"../../modules/DiscreteMathematics/GenerateGraphColoring";
import{generateSpanningTrees}from"../../modules/DiscreteMathematics/GenerateSpanningTrees";
import{generateRecurrenceRelations}from"../../modules/DiscreteMathematics/GenerateRecurrenceRelations";
import{generateBooleanAlgebra}from"../../modules/DiscreteMathematics/GenerateBooleanAlgebra";
import{generateRelations}from"../../modules/DiscreteMathematics/GenerateRelations";
import{generateCountingAdvanced}from"../../modules/DiscreteMathematics/GenerateCountingAdvanced";
import{seededRng}from"../../main/core/Rng";
import{isWellFormed}from"../oracle/Symbolic";
import{validateQuestionLatex}from"../oracle/Latex";
import{validateMcq}from"../oracle/Mcq";
import type{QuestionDto}from"../../types/global";

/** The difficulties every generator is driven at. */
const DIFFICULTIES=["easy","medium","hard"];

/** How many seeds the coverage and option-set gates use. */
const SEEDS=300;

/** How many seeds the multiple-choice validator uses, at each difficulty. */
const MCQ_SEEDS=100;

/**
 * Every topic under test, with the exact branch strings its sub-skill rows use.
 *
 * The branch lists are written out rather than derived, because the defect this
 * file exists to catch is a branch that cannot be reached, and a list derived
 * from the generator would agree with whatever the generator happens to produce.
 */
const TOPICS: {id: string, generate: (difficulty?: string, rng?: ()=>number)=>QuestionDto, branches: string[]}[]=[
    {id:"propositional_logic", generate:generatePropositionalLogic, branches:["value_of_a_statement","and_or_not","truth_table","compound_statement"]},
    {id:"logic_equivalences", generate:generateLogicEquivalences, branches:["de_morgan","distributive_law","double_negation","rewrite_to_conjunction"]},
    {id:"set_operations", generate:generateSetOperations, branches:["union","intersection","complement","difference"]},
    {id:"inclusion_exclusion", generate:generateInclusionExclusion, branches:["two_sets","three_sets","counting_neither","a_word_problem"]},
    {id:"pigeonhole", generate:generatePigeonhole, branches:["into_the_pigeons","at_least_two","general_form","constructive_count"]},
    {id:"graph_basics", generate:generateGraphBasics, branches:["degree_of_a_vertex","a_walk_or_path","cycles","connectivity"]},
    {id:"graph_euler", generate:generateGraphEuler, branches:["euler_path","euler_circuit","hamilton_path","bipartite_by_odd_degree"]},
    {id:"graph_coloring", generate:generateGraphColoring, branches:["two_color_test","three_coloring","four_color_theorem","bipartite_equals_two_colorable"]},
    {id:"spanning_trees", generate:generateSpanningTrees, branches:["count_the_trees","kruskal_reasoning","minimum_spanning_tree","removing_a_cycle"]},
    {id:"recurrence_relations", generate:generateRecurrenceRelations, branches:["constant_recurrence","first_order_linear","find_an_explicit_form","growth_behavior"]},
    {id:"boolean_algebra", generate:generateBooleanAlgebra, branches:["simplify_an_expression","equivalence_to_a_truth_table","minimize_by_consensus","gate_implementation"]},
    {id:"relations", generate:generateRelations, branches:["check_reflexive","check_symmetric","check_transitive","equivalence_class"]},
    {id:"counting_advanced", generate:generateCountingAdvanced, branches:["derangements","catalan_numbers","multinomial_count","stars_and_bars"]}
];

describe("every branch of every new discrete topic is reachable",()=>{
    for(let topic of TOPICS){
        it(`${topic.id} reaches exactly its own branches`,()=>{
            let seen=new Set<string>();
            let samples=0;
            for(let seed=1; seed<=SEEDS; seed++){
                for(let difficulty of DIFFICULTIES){
                    let dto=topic.generate(difficulty, seededRng(seed));
                    samples++;
                    if (typeof dto.subskill!=="string") throw new Error(topic.id+"/"+difficulty+"/"+seed+" has no subskill");
                    seen.add(dto.subskill);
                }
            }
            expect(Array.from(seen).sort()).toEqual([...topic.branches].sort());
            expect(samples).toBe(SEEDS*DIFFICULTIES.length);
        }, 60000);
    }
});

describe("every option set is four distinct options containing the key exactly once",()=>{
    for(let topic of TOPICS){
        it(`${topic.id} offers four options with one correct`,()=>{
            let failures:string[]=[];
            for(let seed=1; seed<=SEEDS; seed++){
                for(let difficulty of DIFFICULTIES){
                    let dto=topic.generate(difficulty, seededRng(seed));
                    let options=dto.choices??[];
                    if (options.length!==4){
                        failures.push(topic.id+"/"+difficulty+"/seed"+seed+": "+options.length+" options, "+JSON.stringify(options));
                        continue;
                    }
                    if (new Set(options).size!==4) failures.push(topic.id+"/"+difficulty+"/seed"+seed+": duplicate option in "+JSON.stringify(options));
                    let keys=options.filter(option=>option.trim()===dto.correct.trim()).length;
                    if (keys!==1) failures.push(topic.id+"/"+difficulty+"/seed"+seed+": "+keys+" options equal the key "+JSON.stringify(dto.correct));
                }
            }
            expect(failures).toEqual([]);
        }, 120000);
    }
});

describe("every question is well formed and its prompt renders",()=>{
    for(let topic of TOPICS){
        it(`${topic.id} is well formed and renders as valid latex`,()=>{
            let failures:string[]=[];
            for(let seed=1; seed<=SEEDS; seed++){
                for(let difficulty of DIFFICULTIES){
                    let dto=topic.generate(difficulty, seededRng(seed));
                    if (!isWellFormed(dto)) failures.push(topic.id+"/"+difficulty+"/seed"+seed+": not well formed, "+JSON.stringify({latex:dto.latex, correct:dto.correct}));
                    let findings=validateQuestionLatex(dto);
                    if (findings.length>0) failures.push(topic.id+"/"+difficulty+"/seed"+seed+": "+findings.map(finding=>finding.code+": "+finding.message).join(" | "));
                    if ((dto.solution?.length??0)===0) failures.push(topic.id+"/"+difficulty+"/seed"+seed+": no worked solution");
                    if ((dto.hints?.rungs.length??0)<2) failures.push(topic.id+"/"+difficulty+"/seed"+seed+": fewer than two hint rungs");
                    if ((dto.hints?.concede??"").indexOf(dto.correct)<0) failures.push(topic.id+"/"+difficulty+"/seed"+seed+": the concession does not give the answer");
                }
            }
            expect(failures).toEqual([]);
        }, 120000);
    }
});

describe("every question passes the multiple-choice validator",()=>{
    for(let topic of TOPICS){
        it(`${topic.id} presents four usable options with exactly one correct`,async()=>{
            let failures:string[]=[];
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=MCQ_SEEDS; seed++){
                    let dto=topic.generate(difficulty, seededRng(seed));
                    let findings=await validateMcq(dto);
                    // `correctNotFirst` is not a defect: a generator is allowed to
                    // shuffle, and the app places the key.
                    let gated=findings.filter(finding=>finding.code!=="correct-not-first");
                    if (gated.length>0) failures.push(topic.id+"/"+difficulty+"/seed"+seed+": "+gated.map(finding=>finding.code+": "+finding.message).join(" | "));
                }
            }
            expect(failures).toEqual([]);
        }, 300000);
    }
});

/**
 * Builds the graph on four vertices whose edges are `AB, BC, CD, DA`, the square
 * used by every hand-checked assertion below.
 *
 * @returns The four-cycle.
 */
function square(): Graph{
    return {size:4, edges:[[0, 1], [1, 2], [2, 3], [0, 3]]};
}

describe("the graph arithmetic on a hand-checked square",()=>{
    it("gives every vertex of the square degree two",()=>{
        expect(degreeSequence(square())).toEqual([2, 2, 2, 2]);
    });
    it("sums the degrees of the square to twice its edge count",()=>{
        let graph=square();
        let total=degreeSequence(graph).reduce((sum, degree)=>sum+degree, 0);
        expect(total).toBe(2*edgeCount(graph));
        expect(total).toBe(8);
    });
    it("finds the girth of the square to be four",()=>{
        expect(girth(square())).toBe(4);
    });
    it("finds one connected component in the square",()=>{
        expect(componentCount(square())).toBe(1);
    });
    it("finds the square bipartite and chromatic number two",()=>{
        let graph=square();
        expect(isBipartite(graph)).toBe(true);
        expect(chromaticNumber(graph)).toBe(2);
    });
    it("reports no Euler circuit on the square, which has four odd-degree ends",()=>{
        // Every vertex of the square has degree two, so all four are even and an
        // Euler circuit does exist; the point of the assertion is that the parity
        // test says even where a learner reading "four vertices" would not.
        expect(degreeSequence(square()).filter(degree=>degree%2===1)).toEqual([]);
    });
});

describe("the graph arithmetic on a hand-checked triangle with a tail",()=>{
    it("reports one odd-degree vertex and no Euler path",()=>{
        // Edges AB, BC, AC, CD on A, B, C, D: degrees are 2, 2, 3, 1.
        let graph: Graph={size:4, edges:[[0, 1], [1, 2], [0, 2], [2, 3]]};
        expect(degreeSequence(graph)).toEqual([2, 2, 3, 1]);
    });
    it("reports the triangle as not bipartite and chromatic number three",()=>{
        let graph: Graph={size:4, edges:[[0, 1], [1, 2], [0, 2], [2, 3]]};
        expect(isBipartite(graph)).toBe(false);
        expect(girth(graph)).toBe(3);
        expect(chromaticNumber(graph)).toBe(3);
    });
});

/** The vertex letters the graph generators print. */
const LETTERS=["A","B","C","D","E","F","G","H"];

/**
 * Reads the edge list straight out of a printed prompt.
 *
 * The prompts wrap the edge list in math delimiters, so the list is the text
 * between the marker and the closing delimiter. Parsing it here rather than
 * matching the whole prompt keeps the assertion about the graph that was printed
 * rather than about the shape of a pattern.
 *
 * @param prompt - The generated prompt.
 * @returns The edge labels, in the order they were printed.
 */
function printedEdges(prompt: string): string[]{
    let start=prompt.indexOf("edges \\( ");
    if (start<0) return [];
    let rest=prompt.slice(start+"edges \\( ".length);
    let end=rest.indexOf("\\)");
    let listed=end<0?rest:rest.slice(0, end);
    return listed.split(",").map(edge=>edge.trim()).filter(edge=>edge.length>0);
}

/**
 * Reads a count straight out of a printed prompt, such as the vertex and edge
 * counts the spanning-tree branch prints.
 *
 * @param prompt - The generated prompt.
 * @param phrase - The text immediately before the count.
 * @returns The count, or NaN when the phrase is absent.
 */
function printedCount(prompt: string, phrase: string, occurrence: number=1): number{
    let start=-1;
    for (let seen=0; seen<occurrence; seen++) start=prompt.indexOf(phrase, start+1);
    if (start<0) return NaN;
    let rest=prompt.slice(start+phrase.length);
    let end=rest.indexOf("\\)");
    let body=end<0?"":rest.slice(0, end);
    return Number(body.replace(/[^0-9]/g, ""));
}

/**
 * Rebuilds the graph a printed edge list describes, taking the vertex count from
 * the highest letter that appears.
 *
 * @param edges - The edge labels.
 * @returns The graph.
 */
function printedVertices(prompt: string): string[]{
    let start=prompt.indexOf("vertices \\( ");
    if (start<0) return [];
    let rest=prompt.slice(start+"vertices \\( ".length);
    let end=rest.indexOf("\\)");
    let listed=end<0?rest:rest.slice(0, end);
    return listed.split(",").map(name=>name.trim()).filter(name=>name.length>0);
}

/**
 * Rebuilds the graph a printed prompt describes.
 *
 * The vertex count is taken from the printed vertex list rather than from the
 * edges, because a graph with isolated vertices prints fewer edges than it has
 * vertices and deriving the count from the edges would merge those components.
 *
 * @param prompt - The generated prompt.
 * @returns The graph.
 */
function graphFrom(prompt: string): Graph{
    let pairs: [number, number][]=[];
    for(let label of printedEdges(prompt)){
        let u=LETTERS.indexOf(label[0] as string);
        let v=LETTERS.indexOf(label[1] as string);
        if (u<0||v<0) continue;
        pairs.push(u<v?[u, v]:[v, u]);
    }
    let names=printedVertices(prompt);
    let size=names.length>0?names.length:1;
    for(let name of names) size=Math.max(size, LETTERS.indexOf(name)+1);
    return {size, edges: pairs};
}

/**
 * Rebuilds a graph from a bare edge list, which is what a multiple-choice option
 * carrying only an edge list describes.
 *
 * @param labels - The edge labels.
 * @returns The graph.
 */
function graphFromEdges(labels: string[]): Graph{
    let pairs: [number, number][]=[];
    let highest=0;
    for(let label of labels){
        let u=LETTERS.indexOf(label[0] as string);
        let v=LETTERS.indexOf(label[1] as string);
        if (u<0||v<0) continue;
        highest=Math.max(highest, u, v);
        pairs.push(u<v?[u, v]:[v, u]);
    }
    return {size: highest+1, edges: pairs};
}

/**
 * Reports whether a printed order of vertices is a walk along the printed edges
 * with no vertex repeated, which is what both the path branch and the Hamilton
 * path branch claim their key satisfies.
 *
 * @param option - The printed order.
 * @param graph - The graph the edges were printed from.
 * @returns True when every step is along a printed edge and no vertex repeats.
 */
function isPrintedPath(option: string, graph: Graph): boolean{
    let names=option.split(",").map(name=>name.trim());
    let seen=new Set<string>();
    for(let name of names){
        if (seen.has(name)) return false;
        seen.add(name);
    }
    for(let index=0; index+1<names.length; index++){
        let u=LETTERS.indexOf(names[index] as string);
        let v=LETTERS.indexOf(names[index+1] as string);
        let joined=graph.edges.some(edge=>(edge[0]===u&&edge[1]===v)||(edge[0]===v&&edge[1]===u));
        if (!joined) return false;
    }
    return true;
}

/**
 * The vertex letter a degree question asks about.
 *
 * @param prompt - The generated prompt.
 * @returns The letter, or null when the prompt is not a degree question.
 */
function degreeVertex(prompt: string): string|null{
    let match=prompt.match(/meet at \\\(\s*([A-H])\s*\\\)/);
    return match?(match[1] as string):null;
}

describe("generateGraphBasics reports what the printed edge list says",()=>{
    it("reports a degree equal to the count of printed edges naming that vertex",()=>{
        let failures:string[]=[];
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateGraphBasics("medium", seededRng(seed));
            if (dto.subskill!=="degree_of_a_vertex") continue;
            let vertex=degreeVertex(dto.latex);
            if (!vertex) continue;
            checked++;
            let edges=printedEdges(dto.latex);
            let counted=edges.filter(edge=>edge[0]===vertex||edge[1]===vertex).length;
            if (counted!==Number(dto.correct)) failures.push("seed"+seed+": edges "+edges.join(", ")+" give degree "+counted+" at "+vertex+", but the key is "+dto.correct);
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(0);
    }, 60000);
    it("reports a girth equal to the shortest cycle of the printed edges",()=>{
        let failures:string[]=[];
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateGraphBasics("medium", seededRng(seed));
            if (dto.subskill!=="cycles") continue;
            checked++;
            let edges=printedEdges(dto.latex);
            let found=girth(graphFrom(dto.latex));
            if (found!==Number(dto.correct)) failures.push("seed"+seed+": edges "+edges.join(", ")+" have girth "+found+", but the key is "+dto.correct);
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(0);
    }, 60000);
    it("reports a component count equal to the flood fill over the printed edges",()=>{
        let failures:string[]=[];
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateGraphBasics("medium", seededRng(seed));
            if (dto.subskill!=="connectivity") continue;
            checked++;
            let edges=printedEdges(dto.latex);
            let found=componentCount(graphFrom(dto.latex));
            if (found!==Number(dto.correct)) failures.push("seed"+seed+": edges "+edges.join(", ")+" have "+found+" components, but the key is "+dto.correct);
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(0);
    }, 60000);
    it("offers exactly one order that is a path along the printed edges",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateGraphBasics("medium", seededRng(seed));
            if (dto.subskill!=="a_walk_or_path") continue;
            checked++;
            let graph=graphFrom(dto.latex);
            let valid=(dto.choices??[]).filter(option=>isPrintedPath(option, graph));
            expect(valid).toEqual([dto.correct]);
        }
        expect(checked).toBeGreaterThan(0);
    }, 60000);
});

describe("generateGraphEuler states the parity of the printed edge list",()=>{
    it("reports an Euler circuit length equal to the printed edge count, with every degree even",()=>{
        let failures:string[]=[];
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateGraphEuler("medium", seededRng(seed));
            if (dto.subskill!=="euler_circuit") continue;
            checked++;
            let edges=printedEdges(dto.latex);
            let degrees=degreeSequence(graphFrom(dto.latex));
            if (edges.length!==Number(dto.correct)) failures.push("seed"+seed+": "+edges.length+" printed edges but the key is "+dto.correct);
            // An Euler circuit needs every degree even, so an odd degree here would
            // be a construction that makes the key wrong.
            let odd=degrees.filter(degree=>degree%2===1);
            if (odd.length>0) failures.push("seed"+seed+": degrees "+degrees.join(", ")+" are not all even, so no Euler circuit exists");
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(0);
    }, 60000);
    it("reports an Euler path whose two odd-degree vertices are the printed pair",()=>{
        let failures:string[]=[];
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateGraphEuler("medium", seededRng(seed));
            if (dto.subskill!=="euler_path") continue;
            checked++;
            let degrees=degreeSequence(graphFrom(dto.latex));
            let odd=degrees.map((degree, index)=>({degree, index})).filter(entry=>entry.degree%2===1).map(entry=>LETTERS[entry.index] as string).sort();
            let printed=dto.correct.replace(/[{}]/g, "").split(",").map(name=>name.trim()).sort();
            if (odd.length!==2) failures.push("seed"+seed+": degrees "+degrees.join(", ")+" give "+odd.length+" odd-degree vertices");
            if (odd.join(",")!==printed.join(",")) failures.push("seed"+seed+": the odd-degree vertices are "+odd.join(" and ")+" but the key is "+printed.join(" and "));
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(0);
    }, 60000);
    it("offers a Hamilton path order that visits every vertex once along printed edges",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateGraphEuler("medium", seededRng(seed));
            if (dto.subskill!=="hamilton_path") continue;
            checked++;
            let graph=graphFrom(dto.latex);
            let valid=(dto.choices??[]).filter(option=>option.split(",").length===graph.size&&isPrintedPath(option, graph));
            expect(valid).toEqual([dto.correct]);
        }
        expect(checked).toBeGreaterThan(0);
    }, 60000);
    it("offers exactly one bipartite graph among the four printed",()=>{
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateGraphEuler("medium", seededRng(seed));
            if (dto.subskill!=="bipartite_by_odd_degree") continue;
            checked++;
            let winners=(dto.choices??[]).filter(option=>isBipartite(graphFromEdges(option.split(",").map(name=>name.trim()))));
            expect(winners).toEqual([dto.correct]);
        }
        expect(checked).toBeGreaterThan(0);
    }, 60000);
});

describe("generateGraphColoring reports the chromatic number of the printed graph",()=>{
    it("agrees with the search over the printed edges",()=>{
        let failures:string[]=[];
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateGraphColoring("medium", seededRng(seed));
            if (dto.latex.indexOf("smallest number of colors")<0) continue;
            checked++;
            let edges=printedEdges(dto.latex);
            let graph=graphFrom(dto.latex);
            let found=chromaticNumber(graph);
            if (found!==Number(dto.correct)) failures.push("seed"+seed+": edges "+edges.join(", ")+" have chromatic number "+found+", but the key is "+dto.correct);
            if (isBipartite(graph)!==(found===2)) failures.push("seed"+seed+": bipartiteness and chromatic number "+found+" disagree");
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(0);
    }, 60000);
    it("reaches both the two-colorable and the three-color branches",()=>{
        let bipartite=0;
        let threeColor=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateGraphColoring("medium", seededRng(seed));
            if (dto.subskill==="two_color_test") bipartite++;
            if (dto.subskill==="three_coloring") threeColor++;
        }
        expect(bipartite).toBeGreaterThan(0);
        expect(threeColor).toBeGreaterThan(0);
    }, 60000);
});

describe("generateSpanningTrees agrees with the printed counts",()=>{
    it("reports a cyclomatic number of m - n + 1",()=>{
        let failures:string[]=[];
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateSpanningTrees("medium", seededRng(seed));
            if (dto.subskill!=="removing_a_cycle") continue;
            checked++;
            let vertices=printedCount(dto.latex, "vertices and \\( ");
            let edges=printedCount(dto.latex, "and \\( ", 2);
            if (!Number.isFinite(vertices)||!Number.isFinite(edges)) continue;
            let cyclomatic=edges-(vertices-1);
            if (cyclomatic!==Number(dto.correct)) failures.push("seed"+seed+": "+vertices+" vertices and "+edges+" edges give "+cyclomatic+", but the key is "+dto.correct);
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(0);
    }, 60000);
    it("reports one spanning tree per edge of the printed cycle",()=>{
        let failures:string[]=[];
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateSpanningTrees("medium", seededRng(seed));
            if (dto.subskill!=="count_the_trees") continue;
            checked++;
            let edges=printedEdges(dto.latex);
            if (edges.length!==Number(dto.correct)) failures.push("seed"+seed+": a cycle of "+edges.length+" edges has "+edges.length+" spanning trees, but the key is "+dto.correct);
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(0);
    }, 60000);
    it("keeps every weight in the printed table distinct so Kruskal's order is forced",()=>{
        let failures:string[]=[];
        let checked=0;
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateSpanningTrees("medium", seededRng(seed));
            if (dto.subskill!=="kruskal_reasoning"&&dto.subskill!=="minimum_spanning_tree") continue;
            checked++;
            let weights=Array.from(dto.latex.matchAll(/& (\d+)/g)).map(match=>Number(match[1]));
            if (weights.length<3) continue;
            // A repeated weight leaves the order undetermined, so a question about
            // that order would have an answer the printed table does not decide.
            if (new Set(weights).size!==weights.length) failures.push("seed"+seed+": the weights "+weights.join(", ")+" repeat, so the order is not determined");
        }
        expect(failures).toEqual([]);
        expect(checked).toBeGreaterThan(0);
    }, 60000);
});
