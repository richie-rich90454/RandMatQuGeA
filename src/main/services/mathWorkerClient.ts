import type{MathWorkerRequest,MathWorkerResponse}from"./mathWorker";
let worker: Worker|null=null;
let requestId: number=0;
let pending: Map<number,{resolve: (v: any)=>void;reject: (e: Error)=>void;timeout: ReturnType<typeof setTimeout>}>|null=null;
let useWorker: boolean=true;
function getWorker(): Worker|null{
    if(worker)return worker;
    try{
        worker=new Worker(new URL("./mathWorker.ts",import.meta.url),{type:"module"});
        pending=new Map();
        worker.onmessage=function(e: MessageEvent<MathWorkerResponse>){
            let{type,result,error,id}=e.data;
            let entry=pending?.get(id);
            if(entry){
                clearTimeout(entry.timeout);
                pending?.delete(id);
                if(type==="result"){
                    entry.resolve(result);
                }
                else{
                    entry.reject(new Error(error||"Math worker error"));
                }
            }
        };
        worker.onerror=function(e){
            console.error("Math worker error:",e);
            useWorker=false;
        };
        return worker;
    }
    catch(e){
        console.warn("Failed to create math worker, falling back to main thread:",e);
        useWorker=false;
        return null;
    }
}
export async function evaluateInWorker(expression: string): Promise<any>{
    if(!useWorker){
        return evaluateOnMainThread(expression,"evaluate");
    }
    let w=getWorker();
    if(!w){
        return evaluateOnMainThread(expression,"evaluate");
    }
    return new Promise((resolve,reject)=>{
        let id=requestId++;
        let timeout=setTimeout(()=>{
            pending?.delete(id);
            resolve(evaluateOnMainThread(expression,"evaluate"));
        },2000);
        pending?.set(id,{resolve,reject,timeout});
        let request: MathWorkerRequest={type:"evaluate",expression,id};
        w.postMessage(request);
    });
}
export async function simplifyInWorker(expression: string): Promise<any>{
    if(!useWorker){
        return evaluateOnMainThread(expression,"simplify");
    }
    let w=getWorker();
    if(!w){
        return evaluateOnMainThread(expression,"simplify");
    }
    return new Promise((resolve,reject)=>{
        let id=requestId++;
        let timeout=setTimeout(()=>{
            pending?.delete(id);
            resolve(evaluateOnMainThread(expression,"simplify"));
        },2000);
        pending?.set(id,{resolve,reject,timeout});
        let request: MathWorkerRequest={type:"simplify",expression,id};
        w.postMessage(request);
    });
}
async function evaluateOnMainThread(expression: string,type: string): Promise<any>{
    let math=await import("mathjs");
    switch(type){
        case"evaluate":
            return math.evaluate(expression);
        case"simplify":
            return math.simplify(expression);
        case"parse":
            return math.parse(expression);
        default:
            return math.evaluate(expression);
    }
}
export function terminateWorker(): void{
    if(worker){
        worker.terminate();
        worker=null;
        pending=null;
        useWorker=true;
    }
}
export async function parseInWorker(expression: string): Promise<any>{
    if(!useWorker){
        return evaluateOnMainThread(expression,"parse");
    }
    let w=getWorker();
    if(!w){
        return evaluateOnMainThread(expression,"parse");
    }
    return new Promise((resolve,reject)=>{
        let id=requestId++;
        let timeout=setTimeout(()=>{
            pending?.delete(id);
            resolve(evaluateOnMainThread(expression,"parse"));
        },2000);
        pending?.set(id,{resolve,reject,timeout});
        let request: MathWorkerRequest={type:"parse",expression,id};
        w.postMessage(request);
    });
}