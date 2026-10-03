/**
 * @file Reflexivity, symmetry, transitivity and equivalence classes.
 * @description A relation on a small set is printed as a list of ordered pairs,
 * and each of the three properties is checked by counting what the printed list
 * contains. Reflexivity is the number of diagonal pairs missing, symmetry is the
 * number of pairs whose reverse is absent, and transitivity is the number of
 * pairs that a two-step route requires but the relation does not contain.
 *
 * Each branch is built so the property it examines actually fails, which is the
 * only interesting case. A relation that is reflexive, symmetric and transitive
 * at once is an equivalence relation, and its classes are a partition of the set,
 * so the class branch constructs one of those and asks which class a given
 * element belongs to.
 *
 * A relation is a two-valued object, so none of the three property branches asks
 * whether the property holds. They ask how many pairs are wrong, which is a
 * whole number the learner can count off the printed list and which has four
 * honest options.
 */
import type{RngFn, QuestionDto}from"../../types/global";
import{randInt, shuffle}from"../shared/Random";
import{fourOptions}from"../shared/Options.js";

/** An ordered pair of element indices. */
type Pair=[number, number];

/**
 * Writes a relation as the list of ordered pairs the learner is shown.
 *
 * @param names - The element names, in index order.
 * @param pairs - The pairs in the relation.
 * @returns The comma-separated list.
 */
function pairList(names: string[], pairs: Pair[]): string{
    return pairs.map(pair=>`(${names[pair[0]] as string}, ${names[pair[1]] as string})`).join(", ");
}

/**
 * Writes a set of element indices as the roster an option carries.
 *
 * @param names - The element names, in index order.
 * @param members - The member indices, ascending.
 * @returns The roster in braces.
 */
function roster(names: string[], members: number[]): string{
    return `{${members.map(index=>names[index] as string).join(", ")}}`;
}

/**
 * The number of diagonal pairs the relation is missing, which is zero exactly
 * when the relation is reflexive.
 *
 * @param pairs - The pairs in the relation.
 * @param size - The element count.
 * @returns The missing-diagonal count.
 */
function missingDiagonals(pairs: Pair[], size: number): number{
    let present=new Set<string>(pairs.map(pair=>pair.join(",")));
    let missing=0;
    for (let index=0; index<size; index++) if (!present.has(index+","+index)) missing++;
    return missing;
}

/**
 * The number of pairs in the relation whose reverse is absent, which is zero
 * exactly when the relation is symmetric.
 *
 * @param pairs - The pairs in the relation.
 * @returns The asymmetric count.
 */
function asymmetricPairs(pairs: Pair[]): number{
    let present=new Set<string>(pairs.map(pair=>pair.join(",")));
    let count=0;
    for (let pair of pairs) if (!present.has(pair[1]+","+pair[0])) count++;
    return count;
}

/**
 * The number of pairs that some two-step route requires but the relation does not
 * contain, which is zero exactly when the relation is transitive.
 *
 * The pairs counted are the ones that are missing, not the routes: a relation can
 * need the same missing pair from several routes, and counting it twice would make
 * the answer depend on the order the routes were checked in.
 *
 * @param pairs - The pairs in the relation.
 * @returns The number of missing required pairs.
 */
function missingRequiredPairs(pairs: Pair[]): number{
    let present=new Set<string>(pairs.map(pair=>pair.join(",")));
    let reachable=new Set<string>();
    for (let first of pairs){
        for (let second of pairs){
            if (first[1]!==second[0]) continue;
            reachable.add(first[0]+","+second[1]);
        }
    }
    let missing=0;
    for (let required of reachable) if (!present.has(required)) missing++;
    return missing;
}

/**
 * Draws a relation that fails the property its branch asks about.
 *
 * The relation starts as the pairs of a random tree on the elements, which is
 * connected and therefore has at least one pair that a two-step route implies and
 * the relation does not contain. Adding further pairs then leaves the property
 * still failing, because the added pairs cannot supply the one that is missing.
 *
 * @param size - The element count.
 * @param rng - The injected random source.
 * @returns The pairs of the relation, in the order they were drawn.
 */
function nonTransitiveRelation(size: number, rng: RngFn): Pair[]{
    let pairs: Pair[]=[];
    let present=new Set<string>();
    for (let index=1; index<size; index++){
        let joined=randInt(rng, 0, index-1);
        pairs.push([joined, index]);
        present.add(joined+","+index);
    }
    for (let attempt=0; attempt<48&&pairs.length<size+randInt(rng, 0, 2); attempt++){
        let u=randInt(rng, 0, size-1);
        let v=randInt(rng, 0, size-1);
        if (present.has(u+","+v)) continue;
        present.add(u+","+v);
        pairs.push([u, v]);
    }
    return pairs;
}

export function generateRelations(difficulty?: string, rng: RngFn=Math.random): QuestionDto{
    let types=["check_reflexive","check_symmetric","check_transitive","equivalence_class"];
    let type=types[Math.floor(rng()*types.length)];
    let size=difficulty==="easy"?4:difficulty==="hard"?5:4;
    let names=["a","b","c","d","e"];
    let correct="";
    let alternate="";
    let display="";
    let latex="";
    let expectedFormat="";
    let choices:string[]=[];
    let rungs:string[]=[];
    let steps:string[]=[];
    switch(type){
        case "check_reflexive":{
            // The diagonal is the only part of the list that decides reflexivity,
            // so the relation is drawn with a stated number of diagonals missing
            // and the answer is that number.
            let pairs: Pair[]=[];
            let present=new Set<string>();
            for (let index=1; index<size; index++){
                let joined=randInt(rng, 0, index-1);
                pairs.push([joined, index]);
                present.add(joined+","+index);
            }
            for (let attempt=0; attempt<48&&pairs.length<size+1; attempt++){
                let u=randInt(rng, 0, size-1);
                let v=randInt(rng, 0, size-1);
                if (u===v||present.has(u+","+v)) continue;
                present.add(u+","+v);
                pairs.push([u, v]);
            }
            let missing=missingDiagonals(pairs, size);
            correct=String(missing);
            alternate=correct;
            display=correct;
            latex=`On \\( S = \\{ ${names.slice(0, size).join(", ")} \\} \\) the relation \\( R \\) consists of the ordered pairs \\( ${pairList(names, pairs)} \\). How many of the diagonal pairs \\( (x, x) \\) are missing from \\( R \\)?`;
            expectedFormat="Enter a whole number";
            choices=fourOptions(correct, [String(missing+1), String(Math.max(0, missing-1)), "0", String(size), String(size-1)]);
            steps=[
                "A relation is reflexive when every diagonal pair `(x, x)` is in it, so the number of missing diagonal pairs decides the question.",
                `The relation has ${pairs.length} pairs, and the diagonals among them are ${pairs.filter(pair=>pair[0]===pair[1]).map(pair=>`(${names[pair[0]] as string}, ${names[pair[0]] as string})`).join(", ")||"none"}.`,
                `There are ${size} diagonal pairs in total and ${missing} of them are missing, so the answer is ${missing}.`
            ];
            rungs=[
                "Reflexivity is decided entirely by the diagonal: check whether `(x, x)` is in the list for every element `x` of the set.",
                `There are ${size} elements, so there are ${size} diagonal pairs to check against the printed list.`
            ];
            break;
        }
        case "check_symmetric":{
            // The relation is drawn with a stated number of pairs whose reverse
            // is absent, and every diagonal pair is included so the count is not
            // confused with the reflexivity check.
            let pairs: Pair[]=[];
            let present=new Set<string>();
            for (let index=0; index<size; index++){
                pairs.push([index, index]);
                present.add(index+","+index);
            }
            let asymmetric=randInt(rng, 1, difficulty==="easy"?2:size);
            for (let attempt=0; attempt<48&&asymmetric>0; attempt++){
                let u=randInt(rng, 0, size-1);
                let v=randInt(rng, 0, size-1);
                if (u===v) continue;
                if (present.has(u+","+v)) continue;
                present.add(u+","+v);
                present.add(v+","+u);
                pairs.push([u, v]);
                asymmetric--;
            }
            let value=asymmetricPairs(pairs);
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`On \\( S = \\{ ${names.slice(0, size).join(", ")} \\} \\) the relation \\( R \\) consists of the ordered pairs \\( ${pairList(names, pairs)} \\). How many of the pairs in \\( R \\) have their reverse \\( (y, x) \\) missing from \\( R \\)?`;
            expectedFormat="Enter a whole number";
            choices=fourOptions(correct, [String(value+1), String(Math.max(0, value-1)), "0", String(pairs.length), String(size)]);
            steps=[
                "Symmetry is decided pair by pair: a pair `(x, y)` in the relation needs `(y, x)` in the relation as well, and a diagonal pair is its own reverse.",
                `Checking each of the ${pairs.length} pairs against the list, ${value} of them have no reverse.`,
                `So ${value} pairs break symmetry, and the answer is ${value}.`
            ];
            rungs=[
                "Symmetry is decided pair by pair: every `(x, y)` in the relation needs `(y, x)` in it too, and a diagonal pair is its own reverse so it never counts.",
                `Go through the printed pairs one at a time and check whether the swapped pair is also printed.`
            ];
            break;
        }
        case "check_transitive":{
            // A relation drawn from a spanning tree always fails transitivity,
            // because a two-step route along the tree requires a pair the tree
            // does not have. That missing pair is counted, and further pairs
            // added later cannot supply it.
            let pairs=nonTransitiveRelation(size, rng);
            let value=missingRequiredPairs(pairs);
            correct=String(value);
            alternate=correct;
            display=correct;
            latex=`On \\( S = \\{ ${names.slice(0, size).join(", ")} \\} \\) the relation \\( R \\) consists of the ordered pairs \\( ${pairList(names, pairs)} \\). The set \\( R \\circ R \\) holds every pair \\( (x, z) \\) for which some \\( (x, y) \\in R \\) and \\( (y, z) \\in R \\). How many pairs of \\( R \\circ R \\) are not in \\( R \\)?`;
            expectedFormat="Enter a whole number";
            choices=fourOptions(correct, [String(value+1), String(Math.max(0, value-1)), "0", String(pairs.length), String(size)]);
            let witnesses=pairs.filter(first=>pairs.some(second=>second[0]===first[1]&&!pairs.some(pair=>pair[0]===first[0]&&pair[1]===second[1])));
            steps=[
                "Transitivity fails when some pair `(x, z)` can be reached in two steps but is not in the relation, so the count is over the pairs that are reachable and absent.",
                `The pairs of \\( R \\circ R \\) are ${Array.from(new Set(pairs.flatMap(first=>pairs.filter(second=>second[0]===first[1]).map(second=>first[0]+","+second[1])))).map(pair=>`(${names[Number(pair.split(",")[0])] as string}, ${names[Number(pair.split(",")[1])] as string})`).join(", ")}, and ${value} of them are not in \\( R \\).`,
                `One of them is required by the route through ${witnesses.length>0?`(${names[(witnesses[0] as Pair)[0]] as string}, ${names[(witnesses[0] as Pair)[1]] as string})`:"a two-step route"}, so the relation is not transitive and the answer is ${value}.`
            ];
            rungs=[
                "Transitivity is about two-step routes: whenever `(x, y)` and `(y, z)` are both in the relation, `(x, z)` has to be in it too, and each missing `(x, z)` counts once.",
                "Chain the printed pairs together through a shared middle element and list the pairs each chain requires."
            ];
            break;
        }
        case "equivalence_class":{
            // An equivalence relation is the union of disjoint squares, which is
            // built by choosing a partition first. Its classes are that partition,
            // so the class a named element belongs to is decided by construction.
            let firstClass=[0];
            let secondClass: number[]=[];
            let thirdClass: number[]=[];
            let secondSize=randInt(rng, 1, 2);
            for (let index=1; index<Math.min(size, 1+secondSize); index++) secondClass.push(index);
            for (let index=secondClass.length+1; index<size; index++) thirdClass.push(index);
            let classes=[firstClass, secondClass, thirdClass].filter(group=>group.length>0);
            let pairs: Pair[]=[];
            for (let group of classes){
                for (let first of group) for (let second of group) pairs.push([first, second]);
            }
            let member=randInt(rng, 0, size-1);
            let owner=classes.findIndex(group=>group.indexOf(member)>=0);
            correct=roster(names, classes[owner] as number[]);
            alternate=correct;
            display=correct;
            // A subset of the true class, and a set joining it to another class,
            // are the two ways a reader of an equivalence class usually goes
            // wrong, and neither of them is a class.
            let distractors: string[]=[];
            for (let group of classes){
                if (group.indexOf(member)>=0&&group.length>1) distractors.push(roster(names, group.filter(index=>index!==member)));
                let other=classes.find(entry=>entry.indexOf(member)<0);
                if (other&&group.indexOf(member)>=0) distractors.push(roster(names, group.concat(other)));
            }
            // The other classes, a subset of the true one, and the true class
            // joined to another are what a reader of this list can produce, and
            // only one of them is a class.
            for (let group of classes){
                if (group.indexOf(member)<0) distractors.push(roster(names, group));
            }
            let distinct=distractors.filter((text, index)=>text!==correct&&distractors.indexOf(text)===index);
            latex=`On \\( S = \\{ ${names.slice(0, size).join(", ")} \\} \\) the relation \\( R \\) consists of the ordered pairs \\( ${pairList(names, pairs)} \\). This relation is an equivalence relation. Which equivalence class does \\( ${names[member] as string} \\) belong to?`;
            expectedFormat="Choose the class, in braces";
            choices=[correct, ...shuffle(rng, distinct.slice(0, 3))];
            steps=[
                "The equivalence class of an element is every element related to it, and a relation that is reflexive, symmetric and transitive partitions the set into those classes.",
                "Reading the list, the class of the named element is the set of every second entry that appears beside it.",
                `Reading the pairs, \\( ${names[member] as string} \\) is related to exactly ${(classes[owner] as number[]).map(index=>names[index] as string).join(", ")}.`,
                `So the class of \\( ${names[member] as string} \\) is ${correct}.`
            ];
            rungs=[
                "The equivalence class of an element is every element that appears alongside it in the relation, so read off the row of the list that starts with that element.",
                `Look at the pairs beginning with \\( ${names[member] as string} \\) and collect the second entries.`
            ];
            break;
        }
    }
    return {latex, correct, alternate, display, choices: fourOptions(correct, choices), expectedFormat, subskill: type, hints: {rungs, concede: "The answer is "+correct+"."}, solution: steps};
}
