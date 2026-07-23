import{dom}from"./core/domRegistry";
import * as settings from"./settings";
let themeChangedUnlisten:(()=>void)|null=null;
export async function initializeTheme():Promise<void>{
	let savedTheme:string|null=null;
	try{
		savedTheme=localStorage.getItem("theme");
	}
	catch(e){
		console.log("Failed to read theme from localStorage:",e);
	}
	if (savedTheme==="light"||savedTheme==="dark"||savedTheme==="system"){
		settings.settings.theme=savedTheme;
	}
	let applied:boolean=false;
	if (dom.appWindow){
		try{
			let tauriTheme=await dom.appWindow.theme();
			if (settings.settings.theme==="system"){
				settings.applyTheme(tauriTheme??"light");
			}
			else{
				settings.applyTheme(settings.settings.theme as "light"|"dark");
			}
			applied=true;
			if (themeChangedUnlisten){
				themeChangedUnlisten();
				themeChangedUnlisten=null;
			}
			themeChangedUnlisten=await dom.appWindow.onThemeChanged(({payload})=>{
				if (settings.settings.theme==="system"){
					settings.applyTheme(payload as "light"|"dark");
				}
			});
		}
		catch(e){
			console.log("Failed to get Tauri theme, falling back.",e);
		}
	}
	if (!applied){
		if (settings.settings.theme==="system"){
			if (typeof window.matchMedia==="function"){
				let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
				settings.applyTheme(prefersDark?"dark":"light");
				window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",(e)=>{
					if (settings.settings.theme==="system"){
						settings.applyTheme(e.matches?"dark":"light");
					}
				});
			}
			else{
				settings.applyTheme("light");
			}
		}
		else{
			settings.applyTheme(settings.settings.theme as "light"|"dark");
		}
	}
	if (dom.buttons.themeToggle){
		dom.buttons.themeToggle.addEventListener("click",async ()=>{
			let next=settings.settings.theme==="system"?"dark":settings.settings.theme==="dark"?"light":"system";
			settings.settings.theme=next;
			try{
				localStorage.setItem("theme",next);
			}
			catch(e){
				console.log("Failed to persist theme to localStorage:",e);
			}
			if(dom.settings&&dom.settings.settingsTheme){
				dom.settings.settingsTheme.value=next;
			}
			settings.saveSettings();
			if (next==="system"){
				if (dom.appWindow){
					try{
						let tauriTheme=await dom.appWindow.theme();
						settings.applyTheme(tauriTheme??"light");
					}
					catch(e){
						let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
						settings.applyTheme(prefersDark?"dark":"light");
					}
				}
				else{
					let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
					settings.applyTheme(prefersDark?"dark":"light");
				}
			}
			else{
				settings.applyTheme(next as "light"|"dark");
			}
		});
	}
}
