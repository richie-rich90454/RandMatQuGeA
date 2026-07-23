import{dom}from"./domRegistry";
export class ErrorHandler{
	private lastError: string|null=null;
	private retryFn: (()=>void)|null=null;
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
	getError(): string|null{
		return this.lastError;
	}
}
export let errorHandler: ErrorHandler=new ErrorHandler();
export function getErrorHandler(): ErrorHandler{
    return errorHandler;
}