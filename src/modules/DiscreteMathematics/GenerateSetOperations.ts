/**
 * @file Union, intersection, complement and difference of explicit sets.
 * @description Every question here prints the universe and the sets as rosters,
 * so the answer is a roster the learner can check by hand against the numbers on
 * screen. A count alone would lose the operation being tested: "5" says nothing
 * about whether it came from a union or an intersection, and telling those two
 * operations apart is the whole point of the topic.
 *
 * The sets are built from their regions rather than drawn and hoped over. Every
 * region a question needs is forced to be non-empty, which is what guarantees
 * that the four rosters offered as options are four different rosters and that
 * none of them is the empty set, where no further roster could be invented.
 *
 * Each branch's four options are the four rosters a learner can actually produce
 * from the printed data: for a union the intersection and the two one-sided
 * differences, for an intersection the union and the two differences, for a
 * complement the set itself, the outside of both sets and the other complement,
 * and for a difference the reverse difference, the union and the intersection.
 * None of them is a filler option.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, shuffle}from"../shared/Random";
import{fourOptions}from"../shared/Options.js";

/**
 * Writes a set as the roster a learner would write, with the elements in the
 * ascending order they were drawn in.
 *
 * @param elements - The members, ascending.
 * @returns The roster in braces.
 */
function roster(elements: number[]): string{
    return "{"+elements.join(", ")+"}";
}

/**
 * Writes a set for the prompt, where it is typeset, so the braces have to be
 * escaped rather than being read as a group.
 *
 * @param elements - The members, ascending.
 * @returns The roster in displayable LaTeX.
 */
function latexRoster(elements: number[]): string{
    return "\\{"+elements.join(", ")+"\\}";
}

/**
 * The largest a single region may hold in a universe of `size` elements, chosen
 * so that three non-empty regions and two elements outside both always fit. The
 * cap makes the drawing in-domain without a redraw loop, and the fallback is
 * never reached: the cap already guarantees the three regions fit.
 *
 * @param size - The size of the universe.
 * @returns The cap.
 */
function regionCap(size: number): number{
    return Math.max(1, Math.min(3, Math.floor((size-2)/3)));
}

/**
 * Two sets whose three regions are all non-empty, drawn from a universe of `size`
 * elements while leaving at least two elements outside both.
 *
 * Forcing the regions is what makes this branch answerable by hand: a learner who
 * has to find an empty region has nothing to write, and an option set built on an
 * empty region cannot offer four different rosters.
 *
 * @param size - The size of the universe.
 * @param rng - The injected random source.
 * @returns The universe and the two sets.
 */
function twoSets(size: number, rng: RngFn): {universe: number[], a: number[], b: number[]}{
    let cap=regionCap(size);
    let aOnly=randInt(rng, 1, cap);
    let both=randInt(rng, 1, cap);
    let bOnly=randInt(rng, 1, cap);
    if (aOnly+both+bOnly>size-2){
        aOnly=1;
        both=1;
        bOnly=1;
    }
    let universe: number[]=[];
    for (let value=1; value<=size; value++) universe.push(value);
    let a=universe.slice(0, aOnly+both);
    let b=universe.slice(aOnly, aOnly+both+bOnly);
    return {universe, a, b};
}

/**
 * Three sets with all seven regions non-empty, used by the three-set union at
 * the hardest level. Every pairwise union is then a different set from the
 * triple union, which is what gives that question four honest options.
 *
 * @param size - The size of the universe, which must be at least nine.
 * @returns The universe and the three sets.
 */
function threeSets(size: number): {universe: number[], a: number[], b: number[], c: number[]}{
    let universe: number[]=[];
    for (let value=1; value<=size; value++) universe.push(value);
    let a=[1, 4, 5, 7];
    let b=[2, 4, 6, 7];
    let c=[3, 5, 6, 7];
    return {universe, a, b, c};
}

/**
 * The union of two or three rosters, in ascending order and without repeats.
 *
 * @param sets - The rosters.
 * @returns Their union.
 */
function unionOf(sets: number[][]): number[]{
    let all=new Set<number>();
    for (let members of sets) for (let value of members) all.add(value);
    return Array.from(all).sort((x, y)=>x-y);
}

export function generateSetOperations(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["union","intersection","complement","difference"];
    let type=types[Math.floor(rng()*types.length)];
    let size=difficulty==="hard"?randInt(rng, 11, 13):difficulty==="easy"?randInt(rng, 6, 7):randInt(rng, 8, 10);
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="Enter the elements in braces, for example {1, 3, 5}";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    if (difficulty==="hard"&&type==="union"){
        let sets=threeSets(size);
        let union=unionOf([sets.a, sets.b, sets.c]);
        let ab=unionOf([sets.a, sets.b]);
        let ac=unionOf([sets.a, sets.c]);
        let bc=unionOf([sets.b, sets.c]);
        correct=roster(union);
        alternate=correct;
        display=correct;
        latex=`Let \\( U = ${latexRoster(sets.universe)} \\), \\( A = ${latexRoster(sets.a)} \\), \\( B = ${latexRoster(sets.b)} \\) and \\( C = ${latexRoster(sets.c)} \\). Write out \\( A \\cup B \\cup C \\).`;
        choices=[correct, ...shuffle(rng, [roster(ab), roster(ac), roster(bc)])];
        steps=[
            "A union holds every element that is in at least one of the sets, so write down all three rosters and cross each element off the second time it appears.",
            `A and B together give ${roster(ab)}, A and C give ${roster(ac)}, and B and C give ${roster(bc)}.`,
            `Taking all three together gives \\( A \\cup B \\cup C = ${correct} \\).`
        ];
        rungs=[
            "A union collects every element that appears in any of the sets, so read the three rosters and cross off each element the second time it appears.",
            `The elements of A, B and C together are ${roster(union)}.`
        ];
    }
    else{
        let sets=twoSets(size, rng);
        let inter=sets.a.filter(value=>sets.b.indexOf(value)>=0);
        let union=unionOf([sets.a, sets.b]);
        let aOnly=sets.a.filter(value=>sets.b.indexOf(value)<0);
        let bOnly=sets.b.filter(value=>sets.a.indexOf(value)<0);
        let outsideA=sets.universe.filter(value=>sets.a.indexOf(value)<0);
        let outsideB=sets.universe.filter(value=>sets.b.indexOf(value)<0);
        let outsideBoth=sets.universe.filter(value=>sets.a.indexOf(value)<0&&sets.b.indexOf(value)<0);
        if (type==="union"){
            correct=roster(union);
            alternate=correct;
            display=correct;
            latex=`Let \\( U = ${latexRoster(sets.universe)} \\), \\( A = ${latexRoster(sets.a)} \\) and \\( B = ${latexRoster(sets.b)} \\). Write out \\( A \\cup B \\).`;
            choices=[correct, ...shuffle(rng, [roster(inter), roster(aOnly), roster(bOnly)])];
            steps=[
                "A union holds every element that is in at least one of the two sets, so start with both rosters and cross off the elements that appear twice.",
                `A alone contributes ${roster(aOnly)}, B alone contributes ${roster(bOnly)}, and they share ${roster(inter)}.`,
                `Putting the three regions together gives \\( A \\cup B = ${correct} \\).`
            ];
            rungs=[
                "A union is every element in either set, so it is the two rosters written out with the shared elements listed once rather than twice.",
                `Split the printed rosters into ${roster(aOnly)}, ${roster(bOnly)} and the shared part ${roster(inter)}, and take all three.`
            ];
        }
        else if (type==="intersection"){
            correct=roster(inter);
            alternate=correct;
            display=correct;
            latex=`Let \\( U = ${latexRoster(sets.universe)} \\), \\( A = ${latexRoster(sets.a)} \\) and \\( B = ${latexRoster(sets.b)} \\). Write out \\( A \\cap B \\).`;
            choices=[correct, ...shuffle(rng, [roster(union), roster(aOnly), roster(bOnly)])];
            steps=[
                "An intersection holds only the elements that are in both rosters, so cross off every element that appears in just one of them.",
                `The elements of A that B does not have are ${roster(aOnly)}, and the elements of B that A does not have are ${roster(bOnly)}.`,
                `What is in both is \\( A \\cap B = ${correct} \\).`
            ];
            rungs=[
                "An intersection is the overlap and nothing else, so an element has to appear in both printed rosters to be in the answer.",
                `Read across the two printed rosters and keep only the elements that appear in both; they are ${roster(inter)}.`
            ];
        }
        else if (type==="complement"){
            correct=roster(outsideA);
            alternate=correct;
            display=correct;
            latex=`Let \\( U = ${latexRoster(sets.universe)} \\), \\( A = ${latexRoster(sets.a)} \\) and \\( B = ${latexRoster(sets.b)} \\). Write out the complement of \\( A \\) in \\( U \\).`;
            choices=[correct, ...shuffle(rng, [roster(sets.a), roster(outsideBoth), roster(outsideB)])];
            steps=[
                "The complement of a set is what is left of the universe once that set has been taken away, so start from the whole universe rather than from the set.",
                `A holds ${roster(sets.a)}, so the universe minus A is every element of U that A does not list.`,
                `That is \\( U \\setminus A = ${correct} \\).`
            ];
            rungs=[
                "The complement in U is the universe minus the set, so take the whole printed universe and cross off every element the set holds.",
                `Cross off ${roster(sets.a)} from ${roster(sets.universe)}; everything left is the answer.`
            ];
        }
        else{
            correct=roster(aOnly);
            alternate=correct;
            display=correct;
            latex=`Let \\( U = ${latexRoster(sets.universe)} \\), \\( A = ${latexRoster(sets.a)} \\) and \\( B = ${latexRoster(sets.b)} \\). Write out \\( A \\setminus B \\).`;
            choices=[correct, ...shuffle(rng, [roster(bOnly), roster(inter), roster(union)])];
            steps=[
                "A difference keeps what is in the first set and not in the second, so an element has to be in A and must be absent from B.",
                `The elements of A that B also has are ${roster(inter)}, and those are exactly the ones to remove.`,
                `Removing them leaves \\( A \\setminus B = ${correct} \\).`
            ];
            rungs=[
                "A difference is not commutative: it keeps the elements of the first set that the second set does not have, and drops everything else.",
                `Cross the elements of B off A; what survives is ${roster(aOnly)}.`
            ];
        }
    }
    let optionSet=fourOptions(correct, choices);
    return {latex, correct, alternate, display, choices: optionSet, expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
