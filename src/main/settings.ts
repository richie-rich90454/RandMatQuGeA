import * as dom from "./dom";
import * as state from "./state";
import {invoke} from "@tauri-apps/api/core";
import {evaluate} from "mathjs";
import {generateChoicesForCurrentQuestion} from "./mcq";
export let settings={
	theme:"system",
	defaultMode:"single",
	autoContinue:false,
	shuffle:false,
	scope:"simple",
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
	mcqChoicesCount:4
};
export function loadSettings():void{
	const saved=localStorage.getItem("appSettings");
	if (saved){
		try{
			const parsed=JSON.parse(saved);
			settings={...settings, ...parsed};
		}
		catch(e){
			console.warn("Failed to parse settings", e);
		}
	}
	if (dom.settingsTheme) dom.settingsTheme.value=settings.theme;
	if (dom.settingsDefaultMode) dom.settingsDefaultMode.value=settings.defaultMode;
	if (dom.settingsAutoContinue) dom.settingsAutoContinue.checked=settings.autoContinue;
	if (dom.settingsShuffle) dom.settingsShuffle.checked=settings.shuffle;
	if (dom.settingsScope) dom.settingsScope.value=settings.scope;
	if (dom.settingsDifficulty) dom.settingsDifficulty.value=settings.difficulty;
	if (dom.settingsTimer) dom.settingsTimer.value=settings.timer.toString();
	if (dom.settingsMaxQuestions) dom.settingsMaxQuestions.value=settings.maxQuestions.toString();
	if (dom.settingsFont) dom.settingsFont.value=settings.font;
	if (dom.settingsPerfMaster) dom.settingsPerfMaster.checked=settings.perfMaster;
	if (dom.settingsPerfWave) dom.settingsPerfWave.checked=settings.perfWave;
	if (dom.settingsPerfBlur) dom.settingsPerfBlur.checked=settings.perfBlur;
	if (dom.settingsPerfPreview) dom.settingsPerfPreview.checked=settings.perfPreview;
	if (dom.settingsPerfAnimations) dom.settingsPerfAnimations.checked=settings.perfAnimations;
	if (dom.settingsFpsCap) dom.settingsFpsCap.value=settings.fpsCap.toString();
	if (dom.settingsNotifications) dom.settingsNotifications.checked=settings.notifications;
	if (dom.settingsAutoCheckDelay) dom.settingsAutoCheckDelay.value=settings.autoCheckDelay.toString();
	if (dom.settingsDecimalPlaces) dom.settingsDecimalPlaces.value=settings.decimalPlaces.toString();
	if (dom.settingsSound) dom.settingsSound.checked=settings.sound;
	if (dom.settingsVibration) dom.settingsVibration.checked=settings.vibration;
	if (dom.unlimitedToggle) dom.unlimitedToggle.checked=settings.unlimitedMode;
	if (dom.mcqToggle) dom.mcqToggle.checked=settings.mcqMode;
	if (dom.settingsMcqChoices) dom.settingsMcqChoices.value=settings.mcqChoicesCount.toString();
	applySettingsToApp();
}
export function saveSettings():void{
	if (dom.settingsTheme) settings.theme=dom.settingsTheme.value as "system"|"light"|"dark";
	if (dom.settingsDefaultMode) settings.defaultMode=dom.settingsDefaultMode.value as "single"|"mental";
	if (dom.settingsAutoContinue) settings.autoContinue=dom.settingsAutoContinue.checked;
	if (dom.settingsShuffle) settings.shuffle=dom.settingsShuffle.checked;
	if (dom.settingsScope) settings.scope=dom.settingsScope.value;
	if (dom.settingsDifficulty) settings.difficulty=dom.settingsDifficulty.value;
	if (dom.settingsTimer) settings.timer=parseInt(dom.settingsTimer.value)||30;
	if (dom.settingsMaxQuestions) settings.maxQuestions=parseInt(dom.settingsMaxQuestions.value)||5;
	if (dom.settingsFont) settings.font=dom.settingsFont.value;
	if (dom.settingsPerfMaster) settings.perfMaster=dom.settingsPerfMaster.checked;
	if (dom.settingsPerfWave) settings.perfWave=dom.settingsPerfWave.checked;
	if (dom.settingsPerfBlur) settings.perfBlur=dom.settingsPerfBlur.checked;
	if (dom.settingsPerfPreview) settings.perfPreview=dom.settingsPerfPreview.checked;
	if (dom.settingsPerfAnimations) settings.perfAnimations=dom.settingsPerfAnimations.checked;
	if (dom.settingsFpsCap) settings.fpsCap=parseInt(dom.settingsFpsCap.value)||0;
	if (dom.settingsNotifications) settings.notifications=dom.settingsNotifications.checked;
	if (dom.settingsAutoCheckDelay) settings.autoCheckDelay=parseInt(dom.settingsAutoCheckDelay.value)||800;
	if (dom.settingsDecimalPlaces) settings.decimalPlaces=parseInt(dom.settingsDecimalPlaces.value)||2;
	if (dom.settingsSound) settings.sound=dom.settingsSound.checked;
	if (dom.settingsVibration) settings.vibration=dom.settingsVibration.checked;
	if (dom.unlimitedToggle) settings.unlimitedMode=dom.unlimitedToggle.checked;
	if (dom.mcqToggle) settings.mcqMode=dom.mcqToggle.checked;
	if (dom.settingsMcqChoices){
		const newCount=parseInt(dom.settingsMcqChoices.value)||4;
		if (settings.mcqChoicesCount!==newCount){
			settings.mcqChoicesCount=newCount;
			if (state.mcqMode&&window.hasQuestion&&window.correctAnswer.correct){
				generateChoicesForCurrentQuestion();
			}
		}
	}
	localStorage.setItem("appSettings",JSON.stringify(settings));
	applySettingsToApp();
}
export function previewSetting(field:string,value:any):void{
	switch (field){
		case "theme":
			if (value==="system"){
				let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
				applyTheme(prefersDark?"dark":"light");
			}
			else{
				applyTheme(value);
			}
			break;
		case "defaultMode":
			break;
		case "autoContinue":
			if (dom.autocontinueToggle) dom.autocontinueToggle.checked=value;
			break;
		case "shuffle":
			if (dom.shuffleToggle) dom.shuffleToggle.checked=value;
			if (dom.mentalShuffleToggle) dom.mentalShuffleToggle.checked=value;
			break;
		case "scope":
			if (dom.scopeSelect) dom.scopeSelect.value=value;
			if (dom.mentalScopeSelect) dom.mentalScopeSelect.value=value;
			break;
		case "difficulty":
			if (dom.difficultySelect) dom.difficultySelect.value=value;
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
			if (dom.unlimitedToggle) dom.unlimitedToggle.checked=value;
			break;
		case "mcqMode":
			if (dom.mcqToggle) dom.mcqToggle.checked=value;
			break;
		case "mcqChoicesCount":
			if (dom.settingsMcqChoices) dom.settingsMcqChoices.value=value;
			break;
	}
}
export function applySettingsToApp():void{
	if (settings.theme==="system"){
		const prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
		applyTheme(prefersDark?"dark":"light");
	}
	else{
		applyTheme(settings.theme as "light"|"dark");
	}
	applyFont(settings.font);
	if (dom.autocontinueToggle) dom.autocontinueToggle.checked=settings.autoContinue;
	if (dom.shuffleToggle) dom.shuffleToggle.checked=settings.shuffle;
	if (dom.mentalShuffleToggle) dom.mentalShuffleToggle.checked=settings.shuffle;
	if (dom.scopeSelect) dom.scopeSelect.value=settings.scope;
	if (dom.mentalScopeSelect) dom.mentalScopeSelect.value=settings.scope;
	if (dom.difficultySelect) dom.difficultySelect.value=settings.difficulty;
	if (dom.unlimitedToggle) dom.unlimitedToggle.checked=settings.unlimitedMode;
	if (dom.mcqToggle) dom.mcqToggle.checked=settings.mcqMode;
	if (dom.settingsMcqChoices) dom.settingsMcqChoices.value=settings.mcqChoicesCount.toString();
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
	if (dom.settingsTheme) dom.settingsTheme.value="system";
	if (dom.settingsDefaultMode) dom.settingsDefaultMode.value="single";
	if (dom.settingsAutoContinue) dom.settingsAutoContinue.checked=false;
	if (dom.settingsShuffle) dom.settingsShuffle.checked=false;
	if (dom.settingsScope) dom.settingsScope.value="simple";
	if (dom.settingsDifficulty) dom.settingsDifficulty.value="medium";
	if (dom.settingsTimer) dom.settingsTimer.value="30";
	if (dom.settingsMaxQuestions) dom.settingsMaxQuestions.value="5";
	if (dom.settingsFont) dom.settingsFont.value="default";
	if (dom.settingsPerfMaster) dom.settingsPerfMaster.checked=false;
	if (dom.settingsPerfWave) dom.settingsPerfWave.checked=true;
	if (dom.settingsPerfBlur) dom.settingsPerfBlur.checked=true;
	if (dom.settingsPerfPreview) dom.settingsPerfPreview.checked=true;
	if (dom.settingsPerfAnimations) dom.settingsPerfAnimations.checked=true;
	if (dom.settingsFpsCap) dom.settingsFpsCap.value="0";
	if (dom.settingsNotifications) dom.settingsNotifications.checked=true;
	if (dom.settingsAutoCheckDelay) dom.settingsAutoCheckDelay.value="800";
	if (dom.settingsDecimalPlaces) dom.settingsDecimalPlaces.value="2";
	if (dom.settingsSound) dom.settingsSound.checked=false;
	if (dom.settingsVibration) dom.settingsVibration.checked=false;
	if (dom.unlimitedToggle) dom.unlimitedToggle.checked=false;
	if (dom.mcqToggle) dom.mcqToggle.checked=false;
	if (dom.settingsMcqChoices) dom.settingsMcqChoices.value="4";
	saveSettings();
}
export function openSettings():void{
	loadSettings();
	if (dom.settingsModal) dom.settingsModal.classList.add("show");
}
export function closeSettings():void{
	if (dom.settingsModal) dom.settingsModal.classList.remove("show");
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
	localStorage.setItem("theme",theme);
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
	const wave=document.getElementById("wave-container");
	if (wave) wave.style.display=enabled?"block":"none";
}
export function applyBlurEffects(enabled:boolean):void{
	const root=document.documentElement;
	if (enabled) root.classList.remove("no-blur");
	else root.classList.add("no-blur");
}
export function applyLivePreview(enabled:boolean):void{
	if (dom.previewDiv) dom.previewDiv.style.display=enabled?"block":"none";
}
export function applyAnimations(enabled:boolean):void{
	const root=document.documentElement;
	if (enabled) root.classList.remove("reduce-motion");
	else root.classList.add("reduce-motion");
}
export function applyFPSCap(value:number):void{
	const wave=document.querySelector(".liquid-bg") as HTMLElement;
	if (wave){
		if (value>0){
			const baseFlow=18;
			const baseDrift=[22,19,26];
			const scale=60/value;
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
function updateMathJaxColors():void{
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise().catch((_err:any)=>console.log("MathJax re-render error:",_err));
	}
}
export function isAnswerCorrect(userInput:string,correct:string,alternate?:string):boolean{
	function prepareForEval(expr:string):string{
		return expr.replace(/\\?π/g,"pi").replace(/[°˚]|deg(rees?)?/g,"").replace(/rad(ians?)?/g,"").replace(/\s+/g,"");
	}
	function evaluateExpression(expr:string):number|null{
		try{
			const cleaned=prepareForEval(expr);
			const result=evaluate(cleaned);
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
	const trimmedInput=userInput.trim();
	if (!trimmedInput) return false;
	const userNum=evaluateExpression(trimmedInput);
	if (userNum!==null){
		const correctNum=evaluateExpression(correct);
		if (correctNum!==null){
			const tol=getTolerance();
			if (Math.abs(userNum-correctNum)<tol) return true;
		}
		if (alternate){
			const altNum=evaluateExpression(alternate);
			if (altNum!==null){
				const tol=getTolerance();
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
	const userSym=normalizeSymbolic(trimmedInput);
	const correctSym=normalizeSymbolic(correct);
	if (userSym===correctSym) return true;
	if (alternate){
		const altSym=normalizeSymbolic(alternate);
		if (userSym===altSym) return true;
	}
	const userSimple=trimmedInput.replace(/\s+/g,"").toLowerCase();
	const correctSimple=correct.replace(/\s+/g,"").toLowerCase();
	if (userSimple===correctSimple) return true;
	if (alternate){
		const altSimple=alternate.replace(/\s+/g,"").toLowerCase();
		if (userSimple===altSimple) return true;
	}
	return false;
}
export async function checkAnswerFast(userInput:string,correct:string,alternate?:string):Promise<boolean>{
	if (window.__TAURI__){
		try{
			return await invoke("check_math",{userExpr:userInput,correctExpr:correct});
		}
		catch(e){
			console.warn("Rust check failed, falling back to JS",e);
		}
	}
	return isAnswerCorrect(userInput,correct,alternate);
}