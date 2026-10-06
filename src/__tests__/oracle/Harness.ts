/**
 * @file The generator harness: one place that knows how to reach every generator.
 * @description The correctness suite needs to sample every registered topic at
 * every difficulty, from a fixed seed, and to reach each topic's sub-skills. The
 * registry resolves a topic id to a module and function name, and the module is
 * loaded lazily, so this module wraps that lookup in a single call and returns the
 * generated DTO together with the sub-skill that was actually selected.
 */
import type{QuestionDto, RngFn} from"../../types/global";
import{topicRegistry} from"../../main/services/TopicRegistry";
import{seededRng} from"../../main/core/Rng";
import "../../modules/Algebra/RegisterTopics";
import "../../modules/Arithmetic/RegisterTopics";
import "../../modules/Calculus/RegisterTopics";
import "../../modules/DiscreteMathematics/RegisterTopics";
import "../../modules/Geometry/RegisterTopics";
import "../../modules/LinearAlgebra/RegisterTopics";
import "../../modules/Trigonometry/RegisterTopics";

type GeneratorFn=(difficulty?: string, rng?: RngFn)=>QuestionDto;
type ModuleMap=Record<string, GeneratorFn>;

/**
 * A generated question paired with everything needed to attribute it.
 */
export interface SampledQuestion{
    /** The topic it came from. */
    topicId: string;
    /** The difficulty it was generated at. */
    difficulty: string;
    /** The seed that produced it. */
    seed: number;
    /** The generated question. */
    dto: QuestionDto;
    /** The sub-skill the generator reported, when it reports one. */
    subskill: string|null;
}

let moduleCache: Map<string, Promise<ModuleMap>>=new Map();

/**
 * Loads a subject module once and memoises it.
 *
 * @param scope - The registry scope, for example "algebra".
 * @returns The module's exported generators.
 */
async function loadModule(scope: string): Promise<ModuleMap>{
    let cached=moduleCache.get(scope);
    if (cached) return cached;
    let promise: Promise<ModuleMap>;
    switch(scope){
        case "algebra":
            promise=import("../../modules/Algebra/index") as unknown as Promise<ModuleMap>;
            break;
        case "arithmetic":
            promise=import("../../modules/Arithmetic/index") as unknown as Promise<ModuleMap>;
            break;
        case "calculus":
            promise=import("../../modules/Calculus/index") as unknown as Promise<ModuleMap>;
            break;
        case "discrete":
            promise=import("../../modules/DiscreteMathematics/index") as unknown as Promise<ModuleMap>;
            break;
        case "geometry":
            promise=import("../../modules/Geometry/index") as unknown as Promise<ModuleMap>;
            break;
        case "linearAlgebra":
            promise=import("../../modules/LinearAlgebra/index") as unknown as Promise<ModuleMap>;
            break;
        case "trigonometry":
            promise=import("../../modules/Trigonometry/index") as unknown as Promise<ModuleMap>;
            break;
        default:
            promise=import("../../modules/Algebra/index") as unknown as Promise<ModuleMap>;
    }
    moduleCache.set(scope, promise);
    return promise;
}

/**
 * Returns every registered topic id.
 *
 * @returns The registered topic ids, in registration order.
 */
export function registeredTopicIds(): string[]{
    return topicRegistry.getTopicIds();
}

/**
 * Generates one question for a topic from an explicit seed.
 *
 * @param topicId - The registered topic id.
 * @param difficulty - The difficulty to generate at.
 * @param seed - The seed, which fully determines the question.
 * @returns The generated question and its attribution.
 * @throws When the topic is not registered or its generator is missing.
 */
export async function sampleQuestion(topicId: string, difficulty: string, seed: number): Promise<SampledQuestion>{
    const entry=topicRegistry.getTopic(topicId);
    if (!entry){
        throw new Error("Unknown topic: "+topicId);
    }
    const mod=await loadModule(entry.scope);
    const generator=mod[entry.fn];
    if (typeof generator!=="function"){
        throw new Error("Generator function not found: "+entry.fn+" for topic "+topicId);
    }
    const rng=seededRng(seed);
    const dto=generator(difficulty, rng);
    if (!dto||typeof dto.latex!=="string"){
        throw new Error("Generator returned no question: "+topicId);
    }
    return {
        topicId,
        difficulty,
        seed,
        dto,
        subskill: typeof dto.subskill==="string"?dto.subskill:null
    };
}

/**
 * Generates several questions for a topic from consecutive seeds.
 *
 * @param topicId - The registered topic id.
 * @param difficulty - The difficulty to generate at.
 * @param count - How many questions to generate.
 * @param firstSeed - The first seed. Defaults to 1.
 * @returns The generated questions, in seed order.
 */
export async function sampleMany(topicId: string, difficulty: string, count: number, firstSeed: number=1): Promise<SampledQuestion[]>{
    let out: SampledQuestion[]=[];
    for(let i=0; i<count; i++){
        out.push(await sampleQuestion(topicId, difficulty, firstSeed+i));
    }
    return out;
}

/**
 * Collects the distinct sub-skills a topic actually produces across a range of
 * seeds, so a test can assert that every declared sub-skill is reachable and that
 * a topic declaring several is not silently producing only one of them.
 *
 * @param topicId - The registered topic id.
 * @param difficulty - The difficulty to generate at.
 * @param seeds - How many seeds to sample.
 * @returns The distinct sub-skill ids observed.
 */
export async function observedSubSkills(topicId: string, difficulty: string, seeds: number): Promise<string[]>{
    let seen=new Set<string>();
    for(let i=0; i<seeds; i++){
        let sample=await sampleQuestion(topicId, difficulty, i+1);
        if (sample.subskill) seen.add(sample.subskill);
    }
    return Array.from(seen);
}

/**
 * Collects the distinct prompts a topic produces, which is the raw material for
 * the difficulty gate. Two difficulties that yield the same set of prompts are
 * not actually different difficulties.
 *
 * @param topicId - The registered topic id.
 * @param difficulty - The difficulty to generate at.
 * @param seeds - How many seeds to sample.
 * @returns The distinct prompt strings.
 */
export async function observedPrompts(topicId: string, difficulty: string, seeds: number): Promise<string[]>{
    let seen=new Set<string>();
    for(let i=0; i<seeds; i++){
        let sample=await sampleQuestion(topicId, difficulty, i+1);
        seen.add(sample.dto.latex);
    }
    return Array.from(seen);
}

/**
 * Reports whether a topic honors its difficulty parameter, by comparing the
 * prompts it produces at easy and hard. A topic that ignores the parameter
 * produces an identical prompt set at both ends.
 *
 * @param topicId - The registered topic id.
 * @param seeds - How many seeds to sample per difficulty.
 * @returns True when the two difficulty levels produce different prompts.
 */
export async function difficultyHasEffect(topicId: string, seeds: number=40): Promise<boolean>{
    let easy=await observedPrompts(topicId, "easy", seeds);
    let hard=await observedPrompts(topicId, "hard", seeds);
    if (easy.length===0||hard.length===0) return false;
    for(let prompt of easy){
        if (hard.indexOf(prompt)<0) return true;
    }
    return false;
}
