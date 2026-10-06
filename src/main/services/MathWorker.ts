export interface MathWorkerRequest{
    type: "evaluate"|"simplify"|"parse";
    expression: string;
    id: number;
}
export interface MathWorkerResponse{
    type: "result"|"error";
    result?: any;
    error?: string;
    id: number;
}
let mathjsModule: any=null;
async function ensureMathjs(): Promise<any>{
    if(mathjsModule)return mathjsModule;
    mathjsModule=await import("mathjs");
    return mathjsModule;
}
self.onmessage=async function(e: MessageEvent<MathWorkerRequest>){
    let{type,expression,id}=e.data;
    try{
        let math=await ensureMathjs();
        let result: any=null;
        switch(type){
            case"evaluate":
                result=math.evaluate(expression);
                break;
            case"simplify":
                result=math.simplify(expression);
                break;
            case"parse":
                result=math.parse(expression);
                break;
        }
        let response: MathWorkerResponse={type:"result",result,id};
        self.postMessage(response);
    }
    catch(err){
        let response: MathWorkerResponse={
            type:"error",
            error:err instanceof Error?err.message:String(err),
            id
        };
        self.postMessage(response);
    }
};