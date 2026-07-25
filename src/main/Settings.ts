import{dom}from"./core/DomRegistry";
import{appState}from"./core/StateStore";
import{questionState}from"./core/QuestionState";
import{invoke}from"@tauri-apps/api/core";
import{generateChoicesForCurrentQuestion}from"./Mcq";
let THEME_ICON_SYSTEM=`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/></svg>`;
let THEME_ICON_DARK=`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z"/></svg>`;
let THEME_ICON_LIGHT=`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`;
function updateThemeIcon(theme:"system"|"dark"|"light"):void{
    let btn=dom.buttons.themeToggle;
    if (!btn) return;
    if (theme==="system") btn.innerHTML=THEME_ICON_SYSTEM;
    else if (theme==="dark") btn.innerHTML=THEME_ICON_DARK;
    else btn.innerHTML=THEME_ICON_LIGHT;
}
let mathjsModule: any=null;
async function ensureMathjs(): Promise<any>{
    if(mathjsModule) return mathjsModule;
    mathjsModule=await import("mathjs");
    return mathjsModule;
}
export let settings={
    theme:"system",
    defaultMode:"single",
    autoContinue:false,
    shuffle:false,
    mentalShuffle:false,
    scope:"simple",
    mentalScope:"simple",
    difficulty:"medium",
    timer:30,
    maxQuestions:5,
    font:"default",
    perfMaster:false,
    perfWave:true,
    perfBlur:true,
    perfPreview:true,
    perfAnimations:true,
    fpsCap:0,
    notifications:true,
    autoCheckDelay:800,
    decimalPlaces:2,
    sound:false,
    vibration:false,
    unlimitedMode:false,
    mcqMode:false,
    mcqChoicesCount:4,
    adaptive:true,
    showWeakTopicsPopup:true
};
export function loadSettings():void{
    let saved:string|null=null;
    try{
        saved=localStorage.getItem("appSettings");
    }
    catch(e){
        console.warn("Failed to read settings from localStorage", e);
    }
    if (saved){
        try{
            let parsed=JSON.parse(saved);
            settings={...settings, ...parsed};
            if (parsed.adaptive === undefined) settings.adaptive = true;
            if (parsed.showWeakTopicsPopup === undefined) settings.showWeakTopicsPopup = true;
        }
        catch(e){
            console.warn("Failed to parse settings", e);
        }
    }
    if (dom.settings.settingsTheme) dom.settings.settingsTheme.value=settings.theme;
    if (dom.settings.settingsDefaultMode) dom.settings.settingsDefaultMode.value=settings.defaultMode;
    if (dom.settings.settingsAutoContinue) dom.settings.settingsAutoContinue.checked=settings.autoContinue;
    if (dom.settings.settingsShuffle) dom.settings.settingsShuffle.checked=settings.shuffle;
    if (dom.settings.settingsScope) dom.settings.settingsScope.value=settings.scope;
    if (dom.settings.settingsDifficulty) dom.settings.settingsDifficulty.value=settings.difficulty;
    if (dom.settings.settingsTimer) dom.settings.settingsTimer.value=settings.timer.toString();
    if (dom.settings.settingsMaxQuestions) dom.settings.settingsMaxQuestions.value=settings.maxQuestions.toString();
    if (dom.settings.settingsFont) dom.settings.settingsFont.value=settings.font;
    if (dom.settings.settingsPerfMaster) dom.settings.settingsPerfMaster.checked=settings.perfMaster;
    if (dom.settings.settingsPerfWave) dom.settings.settingsPerfWave.checked=settings.perfWave;
    if (dom.settings.settingsPerfBlur) dom.settings.settingsPerfBlur.checked=settings.perfBlur;
    if (dom.settings.settingsPerfPreview) dom.settings.settingsPerfPreview.checked=settings.perfPreview;
    if (dom.settings.settingsPerfAnimations) dom.settings.settingsPerfAnimations.checked=settings.perfAnimations;
    if (dom.settings.settingsFpsCap) dom.settings.settingsFpsCap.value=settings.fpsCap.toString();
    if (dom.settings.settingsNotifications) dom.settings.settingsNotifications.checked=settings.notifications;
    if (dom.settings.settingsAutoCheckDelay) dom.settings.settingsAutoCheckDelay.value=settings.autoCheckDelay.toString();
    if (dom.settings.settingsDecimalPlaces) dom.settings.settingsDecimalPlaces.value=settings.decimalPlaces.toString();
    if (dom.settings.settingsSound) dom.settings.settingsSound.checked=settings.sound;
    if (dom.settings.settingsVibration) dom.settings.settingsVibration.checked=settings.vibration;
    if (dom.inputs.unlimitedToggle) dom.inputs.unlimitedToggle.checked=settings.unlimitedMode;
    if (dom.inputs.mcqToggle) dom.inputs.mcqToggle.checked=settings.mcqMode;
    if (dom.inputs.mentalScopeSelect) dom.inputs.mentalScopeSelect.value=settings.mentalScope;
    if (dom.inputs.mentalShuffleToggle) dom.inputs.mentalShuffleToggle.checked=settings.mentalShuffle;
    if (dom.settings.settingsMcqChoices) dom.settings.settingsMcqChoices.value=settings.mcqChoicesCount.toString();
    if (dom.settings.settingsAdaptive) dom.settings.settingsAdaptive.checked=settings.adaptive;
    applySettingsToApp().catch((err:unknown)=>console.error("applySettingsToApp failed:",err));
}
export function saveSettings():void{
    if (dom.settings.settingsTheme) settings.theme=dom.settings.settingsTheme.value as "system"|"light"|"dark";
    if (dom.settings.settingsDefaultMode) settings.defaultMode=dom.settings.settingsDefaultMode.value as "single"|"mental";
    if (dom.settings.settingsAutoContinue) settings.autoContinue=dom.settings.settingsAutoContinue.checked;
    if (dom.settings.settingsShuffle) settings.shuffle=dom.settings.settingsShuffle.checked;
    if (dom.settings.settingsScope) settings.scope=dom.settings.settingsScope.value;
    if (dom.settings.settingsDifficulty) settings.difficulty=dom.settings.settingsDifficulty.value;
    if (dom.settings.settingsTimer) settings.timer=parseInt(dom.settings.settingsTimer.value)||30;
    if (dom.settings.settingsMaxQuestions) settings.maxQuestions=parseInt(dom.settings.settingsMaxQuestions.value)||5;
    if (dom.settings.settingsFont) settings.font=dom.settings.settingsFont.value;
    if (dom.settings.settingsPerfMaster) settings.perfMaster=dom.settings.settingsPerfMaster.checked;
    if (dom.settings.settingsPerfWave) settings.perfWave=dom.settings.settingsPerfWave.checked;
    if (dom.settings.settingsPerfBlur) settings.perfBlur=dom.settings.settingsPerfBlur.checked;
    if (dom.settings.settingsPerfPreview) settings.perfPreview=dom.settings.settingsPerfPreview.checked;
    if (dom.settings.settingsPerfAnimations) settings.perfAnimations=dom.settings.settingsPerfAnimations.checked;
    if (dom.settings.settingsFpsCap) settings.fpsCap=parseInt(dom.settings.settingsFpsCap.value)||0;
    if (dom.settings.settingsNotifications) settings.notifications=dom.settings.settingsNotifications.checked;
    if (dom.settings.settingsAutoCheckDelay) settings.autoCheckDelay=parseInt(dom.settings.settingsAutoCheckDelay.value)||800;
    if (dom.settings.settingsDecimalPlaces) settings.decimalPlaces=parseInt(dom.settings.settingsDecimalPlaces.value)||2;
    if (dom.settings.settingsSound) settings.sound=dom.settings.settingsSound.checked;
    if (dom.settings.settingsVibration) settings.vibration=dom.settings.settingsVibration.checked;
    if (dom.inputs.unlimitedToggle) settings.unlimitedMode=dom.inputs.unlimitedToggle.checked;
    if (dom.inputs.mcqToggle) settings.mcqMode=dom.inputs.mcqToggle.checked;
    if (dom.inputs.mentalScopeSelect) settings.mentalScope=dom.inputs.mentalScopeSelect.value;
    if (dom.inputs.mentalShuffleToggle) settings.mentalShuffle=dom.inputs.mentalShuffleToggle.checked;
    if (dom.settings.settingsMcqChoices){
        let newCount=parseInt(dom.settings.settingsMcqChoices.value)||4;
        if (settings.mcqChoicesCount!==newCount){
            settings.mcqChoicesCount=newCount;
            if (appState.mcqMode&&questionState.hasQuestion&&questionState.correctAnswer.correct){
                generateChoicesForCurrentQuestion().catch((e: unknown)=>console.error("generateChoicesForCurrentQuestion failed:",e));
            }
        }
    }
    if (dom.settings.settingsAdaptive) settings.adaptive=dom.settings.settingsAdaptive.checked;
    try{
        localStorage.setItem("appSettings",JSON.stringify(settings));
    }
    catch(e){
        console.warn("Failed to persist settings to localStorage", e);
    }
    applySettingsToApp().catch((err: unknown)=>console.error("applySettingsToApp failed:",err));
}
export async function previewSetting(field:string,value:any):Promise<void>{
    switch (field){
        case "theme":
            if (value==="system"){
                if (dom.appWindow){
                    try{
                        let tauriTheme=await dom.appWindow.theme();
                        applyTheme(tauriTheme??"light");
                    }
                    catch(e){
                        let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
                        applyTheme(prefersDark?"dark":"light");
                    }
                }
                else{
                    let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
                    applyTheme(prefersDark?"dark":"light");
                }
            }
            else{
                applyTheme(value);
            }
            break;
        case "defaultMode":
            break;
        case "autoContinue":
            if (dom.inputs.autocontinueToggle) dom.inputs.autocontinueToggle.checked=value;
            break;
        case "shuffle":
            if (dom.inputs.shuffleToggle) dom.inputs.shuffleToggle.checked=value;
            if (dom.inputs.mentalShuffleToggle) dom.inputs.mentalShuffleToggle.checked=value;
            break;
        case "scope":
            if (dom.inputs.scopeSelect) dom.inputs.scopeSelect.value=value;
            if (dom.inputs.mentalScopeSelect) dom.inputs.mentalScopeSelect.value=value;
            break;
        case "difficulty":
            if (dom.inputs.difficultySelect) dom.inputs.difficultySelect.value=value;
            break;
        case "timer":
            break;
        case "maxQuestions":
            break;
        case "font":
            applyFont(value);
            break;
        case "perfMaster":
            settings.perfMaster=value;
            applyPerformanceMaster(value);
            break;
        case "perfWave":
            settings.perfWave=value;
            if (!settings.perfMaster) applyWaveBackground(value);
            break;
        case "perfBlur":
            settings.perfBlur=value;
            if (!settings.perfMaster) applyBlurEffects(value);
            break;
        case "perfPreview":
            settings.perfPreview=value;
            if (!settings.perfMaster) applyLivePreview(value);
            break;
        case "perfAnimations":
            settings.perfAnimations=value;
            if (!settings.perfMaster) applyAnimations(value);
            break;
        case "fpsCap":
            settings.fpsCap=parseInt(value)||0;
            applyFPSCap(settings.fpsCap);
            break;
        case "notifications":
            settings.notifications=value;
            break;
        case "autoCheckDelay":
            settings.autoCheckDelay=parseInt(value)||800;
            break;
        case "decimalPlaces":
            settings.decimalPlaces=parseInt(value)||2;
            break;
        case "sound":
            settings.sound=value;
            break;
        case "vibration":
            settings.vibration=value;
            break;
        case "unlimitedMode":
            if (dom.inputs.unlimitedToggle) dom.inputs.unlimitedToggle.checked=value;
            break;
        case "mcqMode":
            if (dom.inputs.mcqToggle) dom.inputs.mcqToggle.checked=value;
            break;
        case "mcqChoicesCount":
            if (dom.settings.settingsMcqChoices) dom.settings.settingsMcqChoices.value=value;
            break;
        case "adaptive":
            settings.adaptive=value;
            break;
    }
}
export async function applySettingsToApp():Promise<void>{
    if (settings.theme==="system"){
        if (dom.appWindow){
            try{
                let tauriTheme=await dom.appWindow.theme();
                applyTheme(tauriTheme??"light");
            }
            catch(e){
                let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
                applyTheme(prefersDark?"dark":"light");
            }
        }
        else{
            let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
            applyTheme(prefersDark?"dark":"light");
        }
    }
    else{
        applyTheme(settings.theme as "light"|"dark");
    }
    applyFont(settings.font);
    if (dom.inputs.autocontinueToggle) dom.inputs.autocontinueToggle.checked=settings.autoContinue;
    if (dom.inputs.shuffleToggle) dom.inputs.shuffleToggle.checked=settings.shuffle;
    if (dom.inputs.mentalShuffleToggle) dom.inputs.mentalShuffleToggle.checked=settings.mentalShuffle;
    if (dom.inputs.scopeSelect) dom.inputs.scopeSelect.value=settings.scope;
    if (dom.inputs.mentalScopeSelect) dom.inputs.mentalScopeSelect.value=settings.mentalScope;
    if (dom.inputs.difficultySelect) dom.inputs.difficultySelect.value=settings.difficulty;
    if (dom.inputs.unlimitedToggle) dom.inputs.unlimitedToggle.checked=settings.unlimitedMode;
    if (dom.inputs.mcqToggle) dom.inputs.mcqToggle.checked=settings.mcqMode;
    if (dom.settings.settingsMcqChoices) dom.settings.settingsMcqChoices.value=settings.mcqChoicesCount.toString();
    if (dom.settings.settingsAdaptive) dom.settings.settingsAdaptive.checked=settings.adaptive;
    if (settings.perfMaster){
        applyPerformanceMaster(true);
    }
    else{
        applyWaveBackground(settings.perfWave);
        applyBlurEffects(settings.perfBlur);
        applyLivePreview(settings.perfPreview);
        applyAnimations(settings.perfAnimations);
    }
    applyFPSCap(settings.fpsCap);
}
export function resetSettings():void{
    if (dom.settings.settingsTheme) dom.settings.settingsTheme.value="system";
    if (dom.settings.settingsDefaultMode) dom.settings.settingsDefaultMode.value="single";
    if (dom.settings.settingsAutoContinue) dom.settings.settingsAutoContinue.checked=false;
    if (dom.settings.settingsShuffle) dom.settings.settingsShuffle.checked=false;
    if (dom.settings.settingsScope) dom.settings.settingsScope.value="simple";
    if (dom.settings.settingsDifficulty) dom.settings.settingsDifficulty.value="medium";
    if (dom.settings.settingsTimer) dom.settings.settingsTimer.value="30";
    if (dom.settings.settingsMaxQuestions) dom.settings.settingsMaxQuestions.value="5";
    if (dom.settings.settingsFont) dom.settings.settingsFont.value="default";
    if (dom.settings.settingsPerfMaster) dom.settings.settingsPerfMaster.checked=false;
    if (dom.settings.settingsPerfWave) dom.settings.settingsPerfWave.checked=true;
    if (dom.settings.settingsPerfBlur) dom.settings.settingsPerfBlur.checked=true;
    if (dom.settings.settingsPerfPreview) dom.settings.settingsPerfPreview.checked=true;
    if (dom.settings.settingsPerfAnimations) dom.settings.settingsPerfAnimations.checked=true;
    if (dom.settings.settingsFpsCap) dom.settings.settingsFpsCap.value="0";
    if (dom.settings.settingsNotifications) dom.settings.settingsNotifications.checked=true;
    if (dom.settings.settingsAutoCheckDelay) dom.settings.settingsAutoCheckDelay.value="800";
    if (dom.settings.settingsDecimalPlaces) dom.settings.settingsDecimalPlaces.value="2";
    if (dom.settings.settingsSound) dom.settings.settingsSound.checked=false;
    if (dom.settings.settingsVibration) dom.settings.settingsVibration.checked=false;
    if (dom.inputs.unlimitedToggle) dom.inputs.unlimitedToggle.checked=false;
    if (dom.inputs.mcqToggle) dom.inputs.mcqToggle.checked=false;
    if (dom.inputs.mentalScopeSelect) dom.inputs.mentalScopeSelect.value="simple";
    if (dom.inputs.mentalShuffleToggle) dom.inputs.mentalShuffleToggle.checked=false;
    if (dom.settings.settingsMcqChoices) dom.settings.settingsMcqChoices.value="4";
    if (dom.settings.settingsAdaptive) dom.settings.settingsAdaptive.checked=true;
    saveSettings();
}
export function openSettings():void{
    loadSettings();
    if (dom.modals.settingsModal){ dom.modals.settingsModal.classList.remove("hidden"); dom.modals.settingsModal.classList.add("show"); }
}
export function closeSettings():void{
    if (dom.modals.settingsModal){ dom.modals.settingsModal.classList.remove("show"); dom.modals.settingsModal.classList.add("hidden"); }
}
export function applyTheme(theme:"light"|"dark"):void{
    let root=document.documentElement;
    if (theme==="dark"){
        root.classList.add("dark");
        root.classList.remove("light");
    }
    else{
        root.classList.add("light");
        root.classList.remove("dark");
    }
    updateThemeIcon(settings.theme as "system"|"dark"|"light");
    try{
        localStorage.setItem("theme",theme);
    }
    catch(e){
        console.warn("Failed to persist theme to localStorage",e);
    }
    updateMathJaxColors();
    if (dom.appWindow){
        dom.appWindow.setTheme(theme).catch(err=>console.log("Failed to set window theme:",err));
    }
}
export function applyFont(font:string):void{
    document.body.classList.remove("font-opendyslexic");
    if (font==="opendyslexic"){
        document.body.classList.add("font-opendyslexic");
    }
}
export function applyWaveBackground(enabled:boolean):void{
    let wave=document.getElementById("wave-container");
    if (wave) wave.classList.toggle("hidden", !enabled);
}
export function applyBlurEffects(enabled:boolean):void{
    let root=document.documentElement;
    if (enabled) root.classList.remove("no-blur");
    else root.classList.add("no-blur");
}
export function applyLivePreview(enabled:boolean):void{
    if (dom.displays.previewDiv) dom.displays.previewDiv.classList.toggle("hidden", !enabled);
}
export function applyAnimations(enabled:boolean):void{
    let root=document.documentElement;
    if (enabled) root.classList.remove("reduce-motion");
    else root.classList.add("reduce-motion");
}
export function applyFPSCap(value:number):void{
    let wave=document.querySelector(".liquid-bg") as HTMLElement;
    if (wave){
        if (value>0){
            let baseFlow=18;
            let baseDrift=[22,19,26];
            let scale=60/value;
            wave.style.animationDuration=
                (baseFlow*scale)+"s, "+
                (baseDrift[0]*scale)+"s, "+
                (baseDrift[1]*scale)+"s";
        }
        else{
            wave.style.animationDuration="";
        }
    }
}
export function applyPerformanceMaster(enabled:boolean):void{
    if (enabled){
        applyWaveBackground(false);
        applyBlurEffects(false);
        applyLivePreview(false);
        applyAnimations(false);
    }
    else{
        applyWaveBackground(settings.perfWave);
        applyBlurEffects(settings.perfBlur);
        applyLivePreview(settings.perfPreview);
        applyAnimations(settings.perfAnimations);
    }
}
async function updateMathJaxColors():Promise<void>{
    if(!window.MathJax||!window.MathJax.typesetPromise)return;
    try{
        if(window.MathJax.startup&&window.MathJax.startup.promise){
            await window.MathJax.startup.promise;
        }
        await window.MathJax.typesetPromise();
    }
    catch(err){
        console.log("MathJax re-render error:",err);
    }
}
export async function isAnswerCorrect(userInput:string,correct:string,alternate?:string):Promise<boolean>{
    function prepareForEval(expr:string):string{
        return expr.replace(/\\?π/g,"pi").replace(/[°˚]|deg(rees?)?/g,"").replace(/rad(ians?)?/g,"").replace(/\s+/g,"");
    }
    async function evaluateExpression(expr:string):Promise<number|null>{
        try{
            let cleaned=prepareForEval(expr);
            let result=(await ensureMathjs()).evaluate(cleaned);
            if (typeof result==="number"&&!isNaN(result)){
                return result;
            }
            return null;
        }
        catch{
            return null;
        }
    }
    function getTolerance():number{
        return 0.5*Math.pow(10,-settings.decimalPlaces);
    }
    let trimmedInput=userInput.trim();
    if (!trimmedInput) return false;
    let userNum=await evaluateExpression(trimmedInput);
    if (userNum!==null){
        let correctNum=await evaluateExpression(correct);
        if (correctNum!==null){
                let tol=getTolerance();
            if (Math.abs(userNum-correctNum)<tol) return true;
        }
        if (alternate){
            let altNum=await evaluateExpression(alternate);
            if (altNum!==null){
            let tol=getTolerance();
                if (Math.abs(userNum-altNum)<tol) return true;
            }
        }
    }
    function normalizeSymbolic(input:string):string{
        return input.replace(/\s+/g,"").toLowerCase()
            .replace(/\\?π/g,"pi")
            .replace(/[°˚]|deg(rees?)?/g,"")
            .replace(/rad(ians?)?/g,"");
    }
    let userSym=normalizeSymbolic(trimmedInput);
    let correctSym=normalizeSymbolic(correct);
    if (userSym===correctSym) return true;
    if (alternate){
        let altSym=normalizeSymbolic(alternate);
        if (userSym===altSym) return true;
    }
    let userSimple=trimmedInput.replace(/\s+/g,"").toLowerCase();
    let correctSimple=correct.replace(/\s+/g,"").toLowerCase();
    if (userSimple===correctSimple) return true;
    if (alternate){
        let altSimple=alternate.replace(/\s+/g,"").toLowerCase();
        if (userSimple===altSimple) return true;
    }
    return false;
}
export async function checkAnswerFast(userInput:string,correct:string,alternate?:string):Promise<boolean>{
    if (window.__TAURI__){
        try{
            return await invoke("check_math",{userExpr:userInput,correctExpr:correct,alternate:alternate??null});
        }
        catch(e){
            console.warn("Rust check failed, falling back to JS",e);
        }
    }
    return await isAnswerCorrect(userInput,correct,alternate);
}