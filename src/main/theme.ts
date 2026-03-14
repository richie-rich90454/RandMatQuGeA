import * as dom from "./dom";
import * as settings from "./settings";

export async function initializeTheme(): Promise<void>{
	if (dom.appWindow){
		try{
			let tauriTheme=await dom.appWindow.theme();
			if (settings.settings.theme==="system"){
				settings.applyTheme(tauriTheme??"light");
			}
			return;
		} catch (e){
			console.log("Failed to get Tauri theme, falling back.");
		}
	}
	if (settings.settings.theme==="system"){
		let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
		settings.applyTheme(prefersDark?"dark":"light");
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",(e)=>{
			if (settings.settings.theme==="system"){
				settings.applyTheme(e.matches?"dark":"light");
			}
		});
	}
	else{
		settings.applyTheme(settings.settings.theme as "light"|"dark");
	}
}