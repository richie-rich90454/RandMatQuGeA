import{topicRegistry}from"./services/topicRegistry";
import{renderer}from"./core/questionRenderer";
import{errorHandler}from"./core/errorHandler";
import type{RngFn,QuestionDto}from"../types/global";
import"../modules/Algebra/registerTopics";
import"../modules/Arithmetic/registerTopics";
import"../modules/Calculus/registerTopics";
import"../modules/DiscreteMathematics/registerTopics";
import"../modules/Geometry/registerTopics";
import"../modules/LinearAlgebra/registerTopics";
import"../modules/Trigonometry/registerTopics";
let moduleCache: Map<string, any>=new Map();
async function loadModule(scope: string): Promise<any>{
    if(moduleCache.has(scope)){
        return moduleCache.get(scope);
    }
    let mod: any=null;
    switch(scope){
        case"algebra":
            mod=await import("../modules/Algebra/index");
            break;
        case"arithmetic":
            mod=await import("../modules/Arithmetic/index");
            break;
        case"calculus":
            mod=await import("../modules/Calculus/index");
            break;
        case"discrete":
            mod=await import("../modules/DiscreteMathematics/index");
            break;
        case"geometry":
            mod=await import("../modules/Geometry/index");
            break;
        case"linearAlgebra":
            mod=await import("../modules/LinearAlgebra/index");
            break;
        case"trigonometry":
            mod=await import("../modules/Trigonometry/index");
            break;
        default:
            mod=await import("../modules/Algebra/index");
    }
    moduleCache.set(scope,mod);
    return mod;
}
function isQuestionDto(value: unknown): value is QuestionDto{
    return value!==null&&typeof value==="object"&&typeof(value as QuestionDto).latex==="string";
}
export async function generateQuestion(topicId: string,difficulty: string,rng?: RngFn): Promise<QuestionDto|void>{
    return errorHandler.wrapAsync(async()=>{
        const entry=topicRegistry.getTopic(topicId);
        if(!entry){
            throw new Error("Unknown topic: "+topicId);
        }
        const mod=await loadModule(entry.scope);
        const generator=mod[entry.fn];
        if(!generator){
            throw new Error("Generator function not found: "+entry.fn);
        }
        const result=await generator(difficulty,rng);
        if(isQuestionDto(result)){
            renderer.applyQuestionDto(result);
        }
        return result;
    });
}
export async function generateQuestionDto(topicId: string,difficulty: string,rng?: RngFn): Promise<QuestionDto>{
    return errorHandler.wrapAsync(async()=>{
        const entry=topicRegistry.getTopic(topicId);
        if(!entry){
            throw new Error("Unknown topic: "+topicId);
        }
        const mod=await loadModule(entry.scope);
        const generator=mod[entry.fn];
        if(!generator){
            throw new Error("Generator function not found: "+entry.fn);
        }
        const result=await generator(difficulty,rng);
        if(!isQuestionDto(result)){
            throw new Error("Generator did not return a QuestionDto: "+topicId);
        }
        return result;
    })as Promise<QuestionDto>;
}