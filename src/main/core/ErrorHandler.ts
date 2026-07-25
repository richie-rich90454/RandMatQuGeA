import{dom}from"./DomRegistry";
export class ErrorHandler{
	private lastError: string|null=null;
	private retryFn: (()=>void)|null=null;
	private errorCount: number=0;
	wrap<T>(fn: ()=>T): T|undefined{
		try{
			return fn();
		}
		catch(err){
			this.handleError(err);
			return undefined;
		}
	}
	async wrapAsync<T>(fn: ()=>Promise<T>): Promise<T|undefined>{
		try{
			return await fn();
		}
		catch(err){
			this.handleError(err);
			return undefined;
		}
	}
	handleError(err: unknown): void{
		let message=err instanceof Error?err.message:String(err);
		this.lastError=message;
		this.errorCount++;
		console.error("ErrorHandler caught:",message,err);
		this.showError(message,null);
	}
	showError(message: string,retryFn: (()=>void)|null): void{
		this.retryFn=retryFn;
		let area=dom.displays.questionArea;
		if(!area)return;
		area.innerHTML="<div class=\"error-card\">" +
			"<p class=\"error-message\">"+message+"</p>" +
			"<button class=\"error-retry-btn\">Try Again</button>" +
			"</div>";
		let retryBtn=area.querySelector(".error-retry-btn");
		if(retryBtn){
			retryBtn.addEventListener("click",()=>{
				if(this.retryFn){
					this.retryFn();
				}
			});
		}
	}
    clearError(): void{
        this.lastError=null;
        this.retryFn=null;
    }
    resetCount(): void{
        this.errorCount=0;
    }
    getError(): string|null{
        return this.lastError;
    }
    hasError(): boolean{
        return this.lastError!==null;
    }
    getLastError(): string|null{
        return this.lastError;
    }
    getRetryFunction(): (()=>void)|null{
        return this.retryFn;
    }
    getErrorCount(): number{
        return this.errorCount;
    }
    retry(): void{
        if(this.retryFn){
            let fn=this.retryFn;
            this.clearError();
            fn();
        }
    }
    wrapSync<T>(fn: ()=>T): T|undefined{
        try{
            return fn();
        }
        catch(err){
            this.handleError(err);
            return undefined;
        }
    }
    wrapWithFallback<T>(fn: ()=>T,fallback: T): T{
        try{
            return fn();
        }
        catch(err){
            this.handleError(err);
            return fallback;
        }
    }
    wrapWithRetry<T>(fn: ()=>T,retries: number): T|undefined{
        for(let i=0;i<=retries;i++){
            try{
                return fn();
            }
            catch(err){
                if(i===retries){
                    this.handleError(err);
                    return undefined;
                }
            }
        }
        return undefined;
    }
    async wrapAsyncWithTimeout<T>(fn: ()=>Promise<T>,timeoutMs: number): Promise<T|undefined>{
        return new Promise((resolve)=>{
            let timer=setTimeout(()=>{
                resolve(undefined);
            },timeoutMs);
            fn().then((result)=>{
                clearTimeout(timer);
                resolve(result);
            }).catch((err)=>{
                clearTimeout(timer);
                this.handleError(err);
                resolve(undefined);
            });
        });
    }
    showErrorWithTitle(title: string,message: string,retryFn: (()=>void)|null): void{
        this.retryFn=retryFn;
        let area=dom.displays.questionArea;
        if(!area)return;
        area.innerHTML="<div class=\"error-card\">" +
            "<h3 class=\"error-title\">"+title+"</h3>" +
            "<p class=\"error-message\">"+message+"</p>" +
            "<button class=\"error-retry-btn\">Try Again</button>" +
            "</div>";
        let retryBtn=area.querySelector(".error-retry-btn");
        if(retryBtn){
            retryBtn.addEventListener("click",()=>{
                if(this.retryFn){
                    this.retryFn();
                }
            });
        }
    }
}
export let errorHandler: ErrorHandler=new ErrorHandler();
export function getErrorHandler(): ErrorHandler{
    return errorHandler;
}