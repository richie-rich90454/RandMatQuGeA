import * as dom from "./dom";
import * as settings from "./settings";

export async function initializeTheme(): Promise<void>{
    let savedTheme=localStorage.getItem("theme");
    if (savedTheme==="light"||savedTheme==="dark"){
        settings.settings.theme=savedTheme;
    }
    else if (savedTheme){
        settings.settings.theme="light";
    }
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
    if (dom.themeToggle){
        dom.themeToggle.addEventListener("click",()=>{
            let next=settings.settings.theme==="system"?"dark":settings.settings.theme==="dark"?"light":"system";
            settings.settings.theme=next;
            localStorage.setItem("theme",next);
            if (next==="system"){
                let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
                settings.applyTheme(prefersDark?"dark":"light");
            }
            else{
                settings.applyTheme(next);
            }
        });
    }
}