import { DomRegistry } from "./domRegistry";
export class ErrorHandler{
    wrap<T>(fn: ()=>T): T|undefined{
        try{
            return fn();
        }
        catch(e){
            this.showError(e instanceof Error?e.message:String(e));
            return undefined;
        }
    }
    async wrapAsync<T>(fn: ()=>Promise<T>): Promise<T|undefined>{
        try{
            return await fn();
        }
        catch(e){
            this.showError(e instanceof Error?e.message:String(e));
            return undefined;
        }
    }
    showError(message: string, retryFn?: ()=>void): void{
        let questionArea=DomRegistry.getQuestionArea();
        if(!questionArea)return;
        let errorCard=document.createElement("div");
        errorCard.className="error-card";
        errorCard.innerHTML=`<p>${message}</p><button class="retry-btn">Try Again</button>`;
        let retryBtn=errorCard.querySelector(".retry-btn") as HTMLButtonElement;
        if(retryBtn&&retryFn){
            retryBtn.addEventListener("click",()=>{
                errorCard.remove();
                retryFn();
            });
        }
        questionArea.appendChild(errorCard);
    }
}
export let errorHandler=new ErrorHandler();