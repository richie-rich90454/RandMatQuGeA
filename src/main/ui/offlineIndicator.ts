export class OfflineIndicator{
	private badge: HTMLElement|null=null;
	private isOffline: boolean=!navigator.onLine;
	constructor(){
		this.handleOnline=this.handleOnline.bind(this);
		this.handleOffline=this.handleOffline.bind(this);
	}
	init(): void{
		window.addEventListener("online",this.handleOnline);
		window.addEventListener("offline",this.handleOffline);
		this.updateBadge();
	}
    destroy(): void{
        window.removeEventListener("online",this.handleOnline);
        window.removeEventListener("offline",this.handleOffline);
        if(this.badge&&this.badge.parentNode){
            this.badge.parentNode.removeChild(this.badge);
        }
        this.badge=null;
    }
	private handleOnline(): void{
		this.isOffline=false;
		this.updateBadge();
	}
	private handleOffline(): void{
		this.isOffline=true;
		this.updateBadge();
	}
	private updateBadge(): void{
		if(!this.badge){
			this.badge=document.createElement("div");
			this.badge.className="offline-badge hidden";
			this.badge.textContent="Offline";
			this.badge.setAttribute("role","status");
			this.badge.setAttribute("aria-live","polite");
			let header=document.querySelector("header")||document.querySelector(".app-header");
			if(header){
				header.appendChild(this.badge);
			}
		}
		if(this.isOffline){
			this.badge.classList.remove("hidden");
			this.badge.setAttribute("aria-hidden","false");
		}
		else{
			this.badge.classList.add("hidden");
			this.badge.setAttribute("aria-hidden","true");
		}
	}
	getStatus(): boolean{
		return this.isOffline;
	}
	getBadgeElement(): HTMLElement|null{
		return this.badge;
	}
}
export let offlineIndicator: OfflineIndicator=new OfflineIndicator();