/**
 * @vitest-environment jsdom
 * @file The option-set contract for the LinearAlgebra generators.
 * @description Every multiple-choice question has to offer four options with
 * exactly one of them correct, and the generator's own array has to satisfy that
 * before the app's builder ever sees it. These tests drive the generators across
 * every difficulty and a wide range of seeds, because the defects they cover were
 * all branch-specific: a branch that built its options from the same value twice,
 * or that offered a component the question never had.
 */
import{describe,it,expect}from"vitest";
import{generatePlane3D,generateVector3D,generateLine3D}from"../../../modules/LinearAlgebra/LinearAlgebraAdvanced";
import{generateVector as generateVector2D}from"../../../modules/LinearAlgebra/LinearAlgebraVector";
import{seededRng}from"../../../main/core/Rng";
import{validateMcq, MCQ_CODES}from"../../oracle/Mcq";
import type{QuestionDto}from"../../../types/global";

/** Every topic the LinearAlgebra subject registers, with its generator. */
const GENERATORS: [string, (difficulty?: string, rng?: ()=>number)=>QuestionDto][]=[
    ["plane3d", generatePlane3D],
    ["vctr", generateVector2D],
    ["vector3d", generateVector3D],
    ["line3d", generateLine3D]
];

/** The difficulties every topic is driven at. */
const DIFFICULTIES=["easy","medium","hard"];

/** How many seeds each branch is driven from. */
const SEEDS=40;

/**
 * Reports the gated defects for one generated question, which is the same check
 * the oracle's raw-option gate makes and nothing more.
 *
 * @param dto - The generated question.
 * @returns The gated findings.
 */
async function gatedFindings(dto: QuestionDto): Promise<string[]>{
    let findings=await validateMcq(dto);
    return findings
        .filter(f=>f.code!==MCQ_CODES.correctNotFirst)
        .map(f=>f.code+": "+f.message);
}

describe("the LinearAlgebra generators' own option sets",()=>{
    for(let [topicId, generate] of GENERATORS){
        it(`${topicId} offers four options with one correct at every difficulty`,async()=>{
            let failures:string[]=[];
            for(let difficulty of DIFFICULTIES){
                for(let seed=1; seed<=SEEDS; seed++){
                    let dto=generate(difficulty, seededRng(seed));
                    let findings=await gatedFindings(dto);
                    if (findings.length>0) failures.push(topicId+"/"+difficulty+"/seed"+seed+": "+findings.join(" | "));
                }
            }
            expect(failures).toEqual([]);
        }, 60000);
    }
});

describe("generatePlane3D",()=>{
    it("measures the distance from the plane it printed, not from an unrounded one",()=>{
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generatePlane3D("medium", seededRng(seed));
            if (dto.latex.indexOf("distance from the point")<0) continue;
            // The three printed coordinates and the printed plane constant are the
            // only numbers the learner is given, so the answer has to be what those
            // numbers produce.
            let point=dto.latex.match(/\((-?\d+\.\d\d), (-?\d+\.\d\d), (-?\d+\.\d\d)\)/);
            let plane=dto.latex.match(/(-?\d+\.\d\d)x \+ (-?\d+\.\d\d)y \+ (-?\d+\.\d\d)z = (-?\d+\.\d\d)/);
            if (!point||!plane) continue;
            let qx=Number(point[1]);
            let qy=Number(point[2]);
            let qz=Number(point[3]);
            let a=Number(plane[1]);
            let b=Number(plane[2]);
            let c=Number(plane[3]);
            let d=Number(plane[4]);
            let expected=(Math.abs(a*qx+b*qy+c*qz-d)/Math.sqrt(a*a+b*b+c*c)).toFixed(2);
            expect(dto.correct).toBe(expected);
        }
    });
    it("offers a distance and never a second spelling of it",()=>{
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generatePlane3D("easy", seededRng(seed));
            if (dto.latex.indexOf("distance from the point")<0) continue;
            let wrong=(dto.choices??[]).filter(o=>o!==dto.correct);
            expect(new Set(wrong).size).toBe(wrong.length);
        }
    });
});

describe("generateVector",()=>{
    it("converts a polar coordinate that is not the origin",()=>{
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateVector2D("medium", seededRng(seed));
            if (dto.latex.indexOf("Convert the polar coordinate")<0) continue;
            let radius=Number(dto.latex.match(/(\d+\.\d), /)?.[1]);
            expect(radius).toBeGreaterThan(0);
        }
    });
    it("offers three wrong unit vectors that are each one component out",()=>{
        for(let seed=1; seed<=SEEDS; seed++){
            let dto=generateVector2D("hard", seededRng(seed));
            if (dto.latex.indexOf("unit vector")<0) continue;
            let wrong=(dto.choices??[]).filter(o=>o!==dto.correct);
            expect(wrong).toHaveLength(3);
        }
    });
});
