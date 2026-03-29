import * as dom from "./dom";
import * as state from "./state";
import * as settings from "./settings";
import * as ui from "./ui";
import * as topics from "./topics";
import * as generation from "./generation";
import * as answer from "./answer";
import * as session from "./session";
import {check} from "@tauri-apps/plugin-updater";
import {relaunch} from "@tauri-apps/plugin-process";
import packageJson from "../../package.json";
import semver from "semver";
function isVersionGreater(v1: string, v2: string): boolean{
    const cleanV1=v1.replace(/^v/, "");
    const cleanV2=v2.replace(/^v/, "");
    return semver.gt(cleanV1, cleanV2);
}
export function switchToSingle(): void{
	if (dom.modeSingleBtn?.classList.contains("disabled")) return;
	ui.clearAllTimeouts();
	dom.modeSingleBtn?.classList.add("active");
	dom.modeMentalBtn?.classList.remove("active");
	state.setCurrentMode("single");
	if (dom.mentalControls) dom.mentalControls.style.display="none";
	if (dom.singleControls) dom.singleControls.style.display="flex";
	if (state.sessionActive) session.endMentalSession();
	if (state.autoTimeout){
		clearTimeout(state.autoTimeout);
		state.setAutoTimeout(null);
	}
	if (dom.mentalScopeSelect) state.setScope(dom.mentalScopeSelect.value);
	if (dom.scopeSelect) dom.scopeSelect.value=state.scope;
	if (dom.mentalShuffleToggle) state.setShuffle(dom.mentalShuffleToggle.checked);
	if (dom.shuffleToggle) dom.shuffleToggle.checked=state.shuffle;
	ui.updateAriaPressed();
	topics.renderTopicGrid();
	ui.updateUIState();
}
export function switchToMental(): void{
	if (dom.modeMentalBtn?.classList.contains("disabled")) return;
	ui.clearAllTimeouts();
	dom.modeMentalBtn?.classList.add("active");
	dom.modeSingleBtn?.classList.remove("active");
	state.setCurrentMode("mental");
	if (dom.mentalControls) dom.mentalControls.style.display="flex";
	if (dom.singleControls) dom.singleControls.style.display="none";
	if (state.sessionActive) session.endMentalSession();
	if (state.autoTimeout){
		clearTimeout(state.autoTimeout);
		state.setAutoTimeout(null);
	}
	if (dom.scopeSelect) state.setMentalScope(dom.scopeSelect.value);
	if (dom.mentalScopeSelect) dom.mentalScopeSelect.value=state.mentalScope;
	if (dom.shuffleToggle) state.setMentalShuffle(dom.shuffleToggle.checked);
	if (dom.mentalShuffleToggle) dom.mentalShuffleToggle.checked=state.mentalShuffle;
	ui.updateAriaPressed();
	topics.renderTopicGrid();
	ui.updateUIState();
}
function handleMathShortcuts(e: KeyboardEvent): void{
	if (!dom.userAnswer) return;
	if (document.activeElement !== dom.userAnswer) return;
	if (e.ctrlKey || e.metaKey) return;
	switch (e.key){
		case "/":
			e.preventDefault();
			ui.insertSymbol("\\frac{}{}");
			break;
		case "^":
			e.preventDefault();
			ui.insertSymbol("^{}");
			break;
		case "_":
			e.preventDefault();
			ui.insertSymbol("_{}");
			break;
	}
}
export function setupEventListeners(): void{
	if (!dom.generateQuestionButton||!dom.checkAnswerButton||!dom.userAnswer||!dom.themeToggle||!dom.helpButton||!dom.settingsButton||!dom.modeSingleBtn||!dom.modeMentalBtn||!dom.mentalControls||!dom.singleControls||!dom.difficultySelect||!dom.timerDisplay||!dom.scoreDisplay||!dom.startSessionBtn) return;
	dom.generateQuestionButton.addEventListener("click",generation.debounceGenerate);
	dom.checkAnswerButton.addEventListener("click",()=>answer.checkAnswer());
	dom.userAnswer.addEventListener("keyup",function (e: KeyboardEvent){
		if (e.shiftKey&&e.key==="Enter"){
			if (state.currentMode==="single") answer.checkAnswer();
			else if (state.sessionActive) session.handleMentalAnswer();
		}
	});
	dom.userAnswer.addEventListener("input",()=>{
		ui.updatePreviewDebounced();
	});
	dom.userAnswer.addEventListener("keydown",handleMathShortcuts);
	document.addEventListener("keydown",(e: KeyboardEvent)=>{
		if (e.ctrlKey||e.metaKey){
			switch (e.key){
				case "g": case "G":
					e.preventDefault();
					if (state.currentMode==="single") generation.debounceGenerate();
					break;
				case "Enter":
					if (e.shiftKey) break;
					e.preventDefault();
					if (state.currentMode==="single") answer.checkAnswer();
					else if (state.sessionActive) session.handleMentalAnswer();
					break;
				case "1":
					e.preventDefault();
					if (!dom.modeSingleBtn?.classList.contains("disabled")) dom.modeSingleBtn?.click();
					break;
				case "2":
					e.preventDefault();
					if (!dom.modeMentalBtn?.classList.contains("disabled")) dom.modeMentalBtn?.click();
					break;
				case ",":
					e.preventDefault();
					settings.openSettings();
					break;
				case "t": case "T":
					if (e.shiftKey){
						e.preventDefault();
						dom.themeToggle?.click();
					}
					break;
			}
		}
	});
	document.addEventListener("keydown", (e: KeyboardEvent)=>{
		if (e.key==="Escape") {
			const openModals=[dom.settingsModal, dom.shortcutsModal, dom.onboardingOverlay];
			openModals.forEach(modal=>{
				if (modal && modal.classList.contains("show")) {
					modal.classList.remove("show");
					if (modal===dom.settingsModal) settings.closeSettings();
					else if (modal===dom.shortcutsModal) ui.hideShortcutsModal();
					else if (modal===dom.onboardingOverlay) ui.hideOnboarding();
				}
			});
		}
	});
	dom.themeToggle.addEventListener("click",function (){
		let isDark=document.documentElement.classList.contains("dark");
		settings.applyTheme(isDark?"light":"dark");
		if (dom.settingsTheme){
			dom.settingsTheme.value=isDark?"light":"dark";
			settings.settings.theme=dom.settingsTheme.value as "light"|"dark";
			settings.saveSettings();
		}
	});
	dom.helpButton.addEventListener("click",function (){
		ui.showNotification("Select a topic, generate a question, enter your answer, and check it!","info");
	});
	dom.settingsButton.addEventListener("click",settings.openSettings);
	if (dom.settingsClose) dom.settingsClose.addEventListener("click",settings.closeSettings);
	if (dom.settingsSave) dom.settingsSave.addEventListener("click",()=>{
		settings.saveSettings();
		ui.syncSettingsToState();
		settings.closeSettings();
	});
	if (dom.settingsReset) dom.settingsReset.addEventListener("click",settings.resetSettings);
	if (dom.settingsModal) dom.settingsModal.addEventListener("click",(e)=>{
		if (e.target===dom.settingsModal) settings.closeSettings();
	});
	if (dom.settingsTabBasic && dom.settingsTabAdvanced && dom.settingsBasicPanel && dom.settingsAdvancedPanel){
		dom.settingsTabBasic.addEventListener("click",()=>{
			dom.settingsTabBasic?.classList.add("active");
			dom.settingsTabAdvanced?.classList.remove("active");
			if (dom.settingsBasicPanel) dom.settingsBasicPanel.style.display="block";
			if (dom.settingsAdvancedPanel) dom.settingsAdvancedPanel.style.display="none";
		});
		dom.settingsTabAdvanced.addEventListener("click",()=>{
			dom.settingsTabAdvanced?.classList.add("active");
			dom.settingsTabBasic?.classList.remove("active");
			if (dom.settingsAdvancedPanel) dom.settingsAdvancedPanel.style.display="block";
			if (dom.settingsBasicPanel) dom.settingsBasicPanel.style.display="none";
		});
	}
	if (dom.settingsTheme){
		dom.settingsTheme.addEventListener("change",(e)=>settings.previewSetting("theme",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsDefaultMode){
		dom.settingsDefaultMode.addEventListener("change",(e)=>settings.previewSetting("defaultMode",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsAutoContinue){
		dom.settingsAutoContinue.addEventListener("change",(e)=>settings.previewSetting("autoContinue",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsShuffle){
		dom.settingsShuffle.addEventListener("change",(e)=>settings.previewSetting("shuffle",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsScope){
		dom.settingsScope.addEventListener("change",(e)=>settings.previewSetting("scope",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsDifficulty){
		dom.settingsDifficulty.addEventListener("change",(e)=>settings.previewSetting("difficulty",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsTimer){
		dom.settingsTimer.addEventListener("input",(e)=>settings.previewSetting("timer",(e.target as HTMLInputElement).value));
	}
	if (dom.settingsMaxQuestions){
		dom.settingsMaxQuestions.addEventListener("input",(e)=>settings.previewSetting("maxQuestions",(e.target as HTMLInputElement).value));
	}
	if (dom.settingsFont){
		dom.settingsFont.addEventListener("change",(e)=>settings.previewSetting("font",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsPerfMaster){
		dom.settingsPerfMaster.addEventListener("change",(e)=>settings.previewSetting("perfMaster",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsPerfWave){
		dom.settingsPerfWave.addEventListener("change",(e)=>settings.previewSetting("perfWave",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsPerfBlur){
		dom.settingsPerfBlur.addEventListener("change",(e)=>settings.previewSetting("perfBlur",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsPerfPreview){
		dom.settingsPerfPreview.addEventListener("change",(e)=>settings.previewSetting("perfPreview",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsPerfAnimations){
		dom.settingsPerfAnimations.addEventListener("change",(e)=>settings.previewSetting("perfAnimations",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsFpsCap){
		dom.settingsFpsCap.addEventListener("change",(e)=>settings.previewSetting("fpsCap",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsNotifications){
		dom.settingsNotifications.addEventListener("change",(e)=>settings.previewSetting("notifications",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsAutoCheckDelay){
		dom.settingsAutoCheckDelay.addEventListener("input",(e)=>settings.previewSetting("autoCheckDelay",(e.target as HTMLInputElement).value));
	}
	if (dom.settingsDecimalPlaces){
		dom.settingsDecimalPlaces.addEventListener("input",(e)=>settings.previewSetting("decimalPlaces",(e.target as HTMLInputElement).value));
	}
	if (dom.settingsSound){
		dom.settingsSound.addEventListener("change",(e)=>settings.previewSetting("sound",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsVibration){
		dom.settingsVibration.addEventListener("change",(e)=>settings.previewSetting("vibration",(e.target as HTMLInputElement).checked));
	}
	if (dom.checkUpdatesBtn){
		dom.checkUpdatesBtn.addEventListener("click", async ()=>{
			dom.checkUpdatesBtn!.disabled=true;
			const originalText=dom.checkUpdatesBtn!.textContent;
			dom.checkUpdatesBtn!.textContent="Checking...";
			try{
				const update=await check();
				if (update){
					const currentVer=packageJson.version;
					const updateVer=update.version.replace(/^v/, "");
					if (!isVersionGreater(updateVer, currentVer)) {
						alert("You are already using the latest version.");
						return;
					}
					if (confirm(`Version ${update.version} is available!\n\nRelease notes:\n${update.body || "No release notes available"}\n\nDownload and install now?`)) {
						dom.checkUpdatesBtn!.textContent="Downloading...";
						await update.downloadAndInstall((progress)=>{
							if (progress.event==="Progress") {
								const data=progress.data as { chunkLength: number; contentLength: number };
								const percent=Math.round((data.chunkLength / data.contentLength) * 100);
								console.log(`Download progress: ${percent}%`);
							}
						});
						alert("Update installed. The app will now restart.");
						await relaunch();
					}
				} else {
					alert("You are already using the latest version.");
				}
			} catch (err) {
				console.error("Update check failed:", err);
				alert("Failed to check for updates. Please ensure you are connected to the internet and try again.");
			} finally {
				dom.checkUpdatesBtn!.disabled=false;
				dom.checkUpdatesBtn!.textContent=originalText;
			}
		});
	}
	dom.modeSingleBtn.addEventListener("click",switchToSingle);
	dom.modeMentalBtn.addEventListener("click",switchToMental);
	dom.difficultySelect.addEventListener("change",function (e: Event){
		state.setCurrentDifficulty((e.target as HTMLSelectElement).value);
	});
	dom.startSessionBtn.addEventListener("click",()=>{
		if (state.sessionActive){
			session.stopMentalSession();
		}
		else{
			session.startMentalSession();
		}
	});
	if (dom.pauseSessionBtn){
		dom.pauseSessionBtn.addEventListener("click",session.pauseMentalSession);
	}
	if (dom.skipQuestionBtn){
		dom.skipQuestionBtn.addEventListener("click",session.skipMentalQuestion);
	}
	if (dom.autocontinueToggle){
		dom.autocontinueToggle.addEventListener("change",(e)=>{
			state.setAutocontinue((e.target as HTMLInputElement).checked);
			ui.updateCheckboxAria(dom.autocontinueToggle);
			if (!state.autocontinue&&state.autoTimeout){
				clearTimeout(state.autoTimeout);
				state.setAutoTimeout(null);
			}
		});
	}
	if (dom.scopeSelect){
		dom.scopeSelect.addEventListener("change",(e)=>{
			state.setScope((e.target as HTMLSelectElement).value);
			topics.renderTopicGrid();
			if (state.autoTimeout){
				clearTimeout(state.autoTimeout);
				state.setAutoTimeout(null);
			}
		});
	}
	if (dom.shuffleToggle){
		dom.shuffleToggle.addEventListener("change",(e)=>{
			state.setShuffle((e.target as HTMLInputElement).checked);
			ui.updateCheckboxAria(dom.shuffleToggle);
		});
	}
	if (dom.mentalScopeSelect){
		dom.mentalScopeSelect.addEventListener("change",(e)=>{
			state.setMentalScope((e.target as HTMLSelectElement).value);
			topics.renderTopicGrid();
		});
	}
	if (dom.mentalShuffleToggle){
		dom.mentalShuffleToggle.addEventListener("change",(e)=>{
			state.setMentalShuffle((e.target as HTMLInputElement).checked);
			ui.updateCheckboxAria(dom.mentalShuffleToggle);
		});
	}
	if (dom.mcqToggle){
		dom.mcqToggle.addEventListener("change",()=>{
			ui.toggleMcqMode();
			settings.settings.mcqMode=dom.mcqToggle!.checked;
			settings.saveSettings();
		});
	}
	if (dom.topicSearch){
		dom.topicSearch.addEventListener("input",()=>{
			topics.renderTopicGrid();
		});
	}
	if (dom.clearAnswerBtn){
		dom.clearAnswerBtn.addEventListener("click",ui.clearAnswer);
	}
	if (dom.mathToolbar){
		dom.mathToolbar.querySelectorAll(".math-toolbar-btn").forEach(btn=>{
			btn.addEventListener("click",(e)=>{
				const target=e.target as HTMLElement;
				const symbol=target.dataset.symbol||target.dataset.template||"";
				ui.insertSymbol(symbol);
			});
		});
		dom.userAnswer?.addEventListener("focus",()=>{
			if (dom.answerCard) dom.answerCard.classList.add("focused");
		});
		dom.userAnswer?.addEventListener("blur", (e)=>{
			if (dom.mathToolbar&&e.relatedTarget instanceof Node&&dom.mathToolbar.contains(e.relatedTarget)){
				return;
			}
			if (dom.answerCard) dom.answerCard.classList.remove("focused");
		});
	}
	if (dom.copyAnswerBtn){
		dom.copyAnswerBtn.addEventListener("click",ui.copyCorrectAnswer);
	}
	if (dom.shortcutsButton){
		dom.shortcutsButton.addEventListener("click",ui.showShortcutsModal);
	}
	if (dom.shortcutsClose){
		dom.shortcutsClose.addEventListener("click",ui.hideShortcutsModal);
	}
	if (dom.shortcutsGotit){
		dom.shortcutsGotit.addEventListener("click",ui.hideShortcutsModal);
	}
	if (dom.shortcutsModal){
		dom.shortcutsModal.addEventListener("click",(e)=>{
			if (e.target===dom.shortcutsModal) ui.hideShortcutsModal();
		});
	}
	if (dom.leaderboardClose){
		dom.leaderboardClose.addEventListener("click",()=>{
			if (dom.leaderboardCard) dom.leaderboardCard.style.display="none";
		});
	}
	if (dom.onboardingClose){
		dom.onboardingClose.addEventListener("click",ui.hideOnboarding);
	}
	if (dom.onboardingGotit){
		dom.onboardingGotit.addEventListener("click",ui.hideOnboarding);
	}
	if (dom.onboardingOverlay){
		dom.onboardingOverlay.addEventListener("click",(e)=>{
			if (e.target===dom.onboardingOverlay) ui.hideOnboarding();
		});
	}
	const dropdownBtn=document.getElementById("math-dropdown-btn");
	const dropdown=document.getElementById("math-dropdown");
	if (dropdownBtn&&dropdown) {
		dropdownBtn.addEventListener("click", (e)=>{
			e.stopPropagation();
			dropdown.classList.toggle("show");
		});
		document.addEventListener("click", (e)=>{
			if (!dropdown.contains(e.target as Node)&&!dropdownBtn.contains(e.target as Node)) {
				dropdown.classList.remove("show");
			}
		});
	}
}