/**
 * @file events.ts - Sets up all event listeners for UI components.
 * @date 2026-04-12
 * @description Handles mode switching, keyboard shortcuts, settings, and button actions.
 * Added event listeners for "Recommend Topics" and "Manage Data" buttons.
 */
import {dom} from "./core/domRegistry";
import {appState} from "./core/stateStore";
import {questionState} from "./core/questionState";
import * as settings from "./settings";
import * as ui from "./ui";
import * as topics from "./topics";
import * as generation from "./generation";
import * as answer from "./answer";
import * as session from "./session";
import {check} from "@tauri-apps/plugin-updater";
import {relaunch} from "@tauri-apps/plugin-process";
import packageJson from "../../package.json";
export async function isVersionGreater(v1: string, v2: string): Promise<boolean>{
    const semver=(await import("semver")).default;
    const cleanV1=v1.replace(/^v/, "");
    const cleanV2=v2.replace(/^v/, "");
    return semver.gt(cleanV1, cleanV2);
}
export function switchToSingle(): void{
    if (dom.buttons.modeSingleBtn?.classList.contains("disabled")) return;
    ui.clearAllTimeouts();
    dom.buttons.modeSingleBtn?.classList.add("active");
    dom.buttons.modeMentalBtn?.classList.remove("active");
    appState.currentMode="single";
    if (dom.session.mentalControls) dom.session.mentalControls.style.display="none";
    if (dom.session.singleControls) dom.session.singleControls.style.display="flex";
    if (appState.sessionActive) session.endMentalSession();
    if (appState.autoTimeout){
        clearTimeout(appState.autoTimeout);
        appState.autoTimeout=null;
    }
    if (dom.inputs.mentalScopeSelect) appState.scope=dom.inputs.mentalScopeSelect.value;
    if (dom.inputs.scopeSelect) dom.inputs.scopeSelect.value=appState.scope;
    if (dom.inputs.mentalShuffleToggle) appState.shuffle=dom.inputs.mentalShuffleToggle.checked;
    if (dom.inputs.shuffleToggle) dom.inputs.shuffleToggle.checked=appState.shuffle;
    ui.updateAriaPressed();
    topics.renderTopicGrid();
    ui.updateUIState();
}
export function switchToMental(): void{
    if (dom.buttons.modeMentalBtn?.classList.contains("disabled")) return;
    ui.clearAllTimeouts();
    dom.buttons.modeMentalBtn?.classList.add("active");
    dom.buttons.modeSingleBtn?.classList.remove("active");
    appState.currentMode="mental";
    if (dom.session.mentalControls) dom.session.mentalControls.style.display="flex";
    if (dom.session.singleControls) dom.session.singleControls.style.display="none";
    if (appState.sessionActive) session.endMentalSession();
    if (appState.autoTimeout){
        clearTimeout(appState.autoTimeout);
        appState.autoTimeout=null;
    }
    if (dom.inputs.scopeSelect) appState.mentalScope=dom.inputs.scopeSelect.value;
    if (dom.inputs.mentalScopeSelect) dom.inputs.mentalScopeSelect.value=appState.mentalScope;
    if (dom.inputs.shuffleToggle) appState.mentalShuffle=dom.inputs.shuffleToggle.checked;
    if (dom.inputs.mentalShuffleToggle) dom.inputs.mentalShuffleToggle.checked=appState.mentalShuffle;
    ui.updateAriaPressed();
    topics.renderTopicGrid();
    ui.updateUIState();
}
function handleMathShortcuts(e: KeyboardEvent): void{
    if (!dom.inputs.userAnswer) return;
    if (document.activeElement !== dom.inputs.userAnswer) return;
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
export async function setupEventListeners(): Promise<void>{
    if (dom.buttons.generateQuestionButton){
        dom.buttons.generateQuestionButton.addEventListener("click",generation.debounceGenerate);
    }
    else{
        console.warn("Missing element for listener: generateQuestionButton");
    }
    if (dom.buttons.checkAnswerButton){
        dom.buttons.checkAnswerButton.addEventListener("click",()=>{
            if (appState.currentMode==="single") answer.checkAnswer();
            else if (appState.sessionActive) session.handleMentalAnswer();
        });
    }
    else{
        console.warn("Missing element for listener: checkAnswerButton");
    }
    if (dom.inputs.userAnswer){
        dom.inputs.userAnswer.addEventListener("keyup",function (e: KeyboardEvent){
            if (e.shiftKey&&e.key==="Enter"){
                if (!questionState.hasQuestion) return;
                if (dom.buttons.checkAnswerButton?.disabled) return;
                if (appState.currentMode==="single") answer.checkAnswer();
                else if (appState.sessionActive) session.handleMentalAnswer();
            }
        });
        dom.inputs.userAnswer.addEventListener("input",()=>{
            ui.updatePreviewDebounced();
        });
        dom.inputs.userAnswer.addEventListener("keydown",handleMathShortcuts);
    }
    else{
        console.warn("Missing element for listener: userAnswer");
    }
    document.addEventListener("keydown",(e: KeyboardEvent)=>{
        if (e.ctrlKey||e.metaKey){
            switch (e.key){
                case "g": case "G":
                    e.preventDefault();
                    if (appState.currentMode==="single") generation.debounceGenerate();
                    break;
                case "Enter":
                    if (e.shiftKey) break;
                    if (!questionState.hasQuestion) break;
                    if (dom.buttons.checkAnswerButton?.disabled) break;
                    e.preventDefault();
                    if (appState.currentMode==="single") answer.checkAnswer();
                    else if (appState.sessionActive) session.handleMentalAnswer();
                    break;
                case "1":
                    e.preventDefault();
                    if (!dom.buttons.modeSingleBtn?.classList.contains("disabled")) dom.buttons.modeSingleBtn?.click();
                    break;
                case "2":
                    e.preventDefault();
                    if (!dom.buttons.modeMentalBtn?.classList.contains("disabled")) dom.buttons.modeMentalBtn?.click();
                    break;
                case ",":
                    e.preventDefault();
                    settings.openSettings();
                    break;
                case "t": case "T":
                    if (e.shiftKey){
                        e.preventDefault();
                        dom.buttons.themeToggle?.click();
                    }
                    break;
            }
        }
    });
    document.addEventListener("keydown", (e: KeyboardEvent)=>{
        if (e.key==="Escape") {
            const openModals=[dom.modals.settingsModal, dom.modals.shortcutsModal, dom.modals.onboardingOverlay];
            openModals.forEach(modal=>{
                if (modal && modal.classList.contains("show")) {
                    modal.classList.remove("show");
                    if (modal===dom.modals.settingsModal) settings.closeSettings();
                    else if (modal===dom.modals.shortcutsModal) ui.hideShortcutsModal();
                    else if (modal===dom.modals.onboardingOverlay) ui.hideOnboarding();
                }
            });
        }
    });
    if (dom.buttons.helpButton){
        dom.buttons.helpButton.addEventListener("click",function (){
            ui.showNotification("Select a topic, generate a question, enter your answer, and check it!","info");
        });
    }
    else{
        console.warn("Missing element for listener: helpButton");
    }
    if (dom.buttons.settingsButton){
        dom.buttons.settingsButton.addEventListener("click",settings.openSettings);
    }
    else{
        console.warn("Missing element for listener: settingsButton");
    }
    if (dom.buttons.settingsClose) dom.buttons.settingsClose.addEventListener("click",settings.closeSettings);
    if (dom.buttons.settingsSave) dom.buttons.settingsSave.addEventListener("click",()=>{
        settings.saveSettings();
        ui.syncSettingsToState();
        settings.closeSettings();
    });
    if (dom.buttons.settingsReset) dom.buttons.settingsReset.addEventListener("click",settings.resetSettings);
    if (dom.modals.settingsModal) dom.modals.settingsModal.addEventListener("click",(e)=>{
        if (e.target===dom.modals.settingsModal) settings.closeSettings();
    });
    if (dom.buttons.settingsTabBasic && dom.buttons.settingsTabAdvanced && dom.session.settingsBasicPanel && dom.session.settingsAdvancedPanel){
        dom.buttons.settingsTabBasic.addEventListener("click",()=>{
            dom.buttons.settingsTabBasic?.classList.add("active");
            dom.buttons.settingsTabAdvanced?.classList.remove("active");
            if (dom.session.settingsBasicPanel) dom.session.settingsBasicPanel.style.display="block";
            if (dom.session.settingsAdvancedPanel) dom.session.settingsAdvancedPanel.style.display="none";
        });
        dom.buttons.settingsTabAdvanced.addEventListener("click",()=>{
            dom.buttons.settingsTabAdvanced?.classList.add("active");
            dom.buttons.settingsTabBasic?.classList.remove("active");
            if (dom.session.settingsAdvancedPanel) dom.session.settingsAdvancedPanel.style.display="block";
            if (dom.session.settingsBasicPanel) dom.session.settingsBasicPanel.style.display="none";
        });
    }
    if (dom.settings.settingsTheme){
        dom.settings.settingsTheme.addEventListener("change",(e)=>settings.previewSetting("theme",(e.target as HTMLSelectElement).value));
    }
    if (dom.settings.settingsDefaultMode){
        dom.settings.settingsDefaultMode.addEventListener("change",(e)=>settings.previewSetting("defaultMode",(e.target as HTMLSelectElement).value));
    }
    if (dom.settings.settingsAutoContinue){
        dom.settings.settingsAutoContinue.addEventListener("change",(e)=>settings.previewSetting("autoContinue",(e.target as HTMLInputElement).checked));
    }
    if (dom.settings.settingsShuffle){
        dom.settings.settingsShuffle.addEventListener("change",(e)=>settings.previewSetting("shuffle",(e.target as HTMLInputElement).checked));
    }
    if (dom.settings.settingsScope){
        dom.settings.settingsScope.addEventListener("change",(e)=>settings.previewSetting("scope",(e.target as HTMLSelectElement).value));
    }
    if (dom.settings.settingsDifficulty){
        dom.settings.settingsDifficulty.addEventListener("change",(e)=>settings.previewSetting("difficulty",(e.target as HTMLSelectElement).value));
    }
    if (dom.settings.settingsTimer){
        dom.settings.settingsTimer.addEventListener("input",(e)=>settings.previewSetting("timer",(e.target as HTMLInputElement).value));
    }
    if (dom.settings.settingsMaxQuestions){
        dom.settings.settingsMaxQuestions.addEventListener("input",(e)=>settings.previewSetting("maxQuestions",(e.target as HTMLInputElement).value));
    }
    if (dom.settings.settingsFont){
        dom.settings.settingsFont.addEventListener("change",(e)=>settings.previewSetting("font",(e.target as HTMLSelectElement).value));
    }
    if (dom.settings.settingsPerfMaster){
        dom.settings.settingsPerfMaster.addEventListener("change",(e)=>settings.previewSetting("perfMaster",(e.target as HTMLInputElement).checked));
    }
    if (dom.settings.settingsPerfWave){
        dom.settings.settingsPerfWave.addEventListener("change",(e)=>settings.previewSetting("perfWave",(e.target as HTMLInputElement).checked));
    }
    if (dom.settings.settingsPerfBlur){
        dom.settings.settingsPerfBlur.addEventListener("change",(e)=>settings.previewSetting("perfBlur",(e.target as HTMLInputElement).checked));
    }
    if (dom.settings.settingsPerfPreview){
        dom.settings.settingsPerfPreview.addEventListener("change",(e)=>settings.previewSetting("perfPreview",(e.target as HTMLInputElement).checked));
    }
    if (dom.settings.settingsPerfAnimations){
        dom.settings.settingsPerfAnimations.addEventListener("change",(e)=>settings.previewSetting("perfAnimations",(e.target as HTMLInputElement).checked));
    }
    if (dom.settings.settingsFpsCap){
        dom.settings.settingsFpsCap.addEventListener("change",(e)=>settings.previewSetting("fpsCap",(e.target as HTMLSelectElement).value));
    }
    if (dom.settings.settingsNotifications){
        dom.settings.settingsNotifications.addEventListener("change",(e)=>settings.previewSetting("notifications",(e.target as HTMLInputElement).checked));
    }
    if (dom.settings.settingsAutoCheckDelay){
        dom.settings.settingsAutoCheckDelay.addEventListener("input",(e)=>settings.previewSetting("autoCheckDelay",(e.target as HTMLInputElement).value));
    }
    if (dom.settings.settingsDecimalPlaces){
        dom.settings.settingsDecimalPlaces.addEventListener("input",(e)=>settings.previewSetting("decimalPlaces",(e.target as HTMLInputElement).value));
    }
    if (dom.settings.settingsSound){
        dom.settings.settingsSound.addEventListener("change",(e)=>settings.previewSetting("sound",(e.target as HTMLInputElement).checked));
    }
    if (dom.settings.settingsVibration){
        dom.settings.settingsVibration.addEventListener("change",(e)=>settings.previewSetting("vibration",(e.target as HTMLInputElement).checked));
    }
    if (dom.buttons.checkUpdatesBtn){
        dom.buttons.checkUpdatesBtn.addEventListener("click", async ()=>{
            dom.buttons.checkUpdatesBtn!.disabled=true;
            const originalText=dom.buttons.checkUpdatesBtn!.textContent;
            dom.buttons.checkUpdatesBtn!.textContent="Checking...";
            try{
                const update=await check();
                if (update){
                    const currentVer=packageJson.version;
                    const updateVer=update.version.replace(/^v/, "");
                    if (!(await isVersionGreater(updateVer, currentVer))) {
                        alert("You are already using the latest version.");
                        return;
                    }
                    if (confirm(`Version ${update.version} is available!\n\nRelease notes:\n${update.body || "No release notes available"}\n\nDownload and install now?`)) {
                        dom.buttons.checkUpdatesBtn!.textContent="Downloading...";
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
                // Silently ignore network errors - app works fully offline
                return;
            } finally {
                dom.buttons.checkUpdatesBtn!.disabled=false;
                dom.buttons.checkUpdatesBtn!.textContent=originalText;
            }
        });
    }
    if (dom.buttons.modeSingleBtn){
        dom.buttons.modeSingleBtn.addEventListener("click",switchToSingle);
    }
    else{
        console.warn("Missing element for listener: modeSingleBtn");
    }
    if (dom.buttons.modeMentalBtn){
        dom.buttons.modeMentalBtn.addEventListener("click",switchToMental);
    }
    else{
        console.warn("Missing element for listener: modeMentalBtn");
    }
    if (dom.inputs.difficultySelect){
        dom.inputs.difficultySelect.addEventListener("change",function (e: Event){
            appState.currentDifficulty=(e.target as HTMLSelectElement).value;
        });
    }
    else{
        console.warn("Missing element for listener: difficultySelect");
    }
    if (dom.buttons.startSessionBtn){
        dom.buttons.startSessionBtn.addEventListener("click",()=>{
            if (appState.sessionActive){
                session.stopMentalSession();
            }
            else{
                session.startMentalSession();
            }
        });
    }
    else{
        console.warn("Missing element for listener: startSessionBtn");
    }
    if (dom.buttons.pauseSessionBtn){
        dom.buttons.pauseSessionBtn.addEventListener("click",session.pauseMentalSession);
    }
    if (dom.buttons.skipQuestionBtn){
        dom.buttons.skipQuestionBtn.addEventListener("click",session.skipMentalQuestion);
    }
    if (dom.inputs.autocontinueToggle){
        dom.inputs.autocontinueToggle.addEventListener("change",(e)=>{
            appState.autocontinue=(e.target as HTMLInputElement).checked;
            ui.updateCheckboxAria(dom.inputs.autocontinueToggle);
            if (!appState.autocontinue&&appState.autoTimeout){
                clearTimeout(appState.autoTimeout);
                appState.autoTimeout=null;
            }
        });
    }
    if (dom.inputs.scopeSelect){
        dom.inputs.scopeSelect.addEventListener("change",(e)=>{
            appState.scope=(e.target as HTMLSelectElement).value;
            topics.renderTopicGrid();
            if (appState.autoTimeout){
                clearTimeout(appState.autoTimeout);
                appState.autoTimeout=null;
            }
        });
    }
    if (dom.inputs.shuffleToggle){
        dom.inputs.shuffleToggle.addEventListener("change",(e)=>{
            appState.shuffle=(e.target as HTMLInputElement).checked;
            ui.updateCheckboxAria(dom.inputs.shuffleToggle);
        });
    }
    if (dom.inputs.mentalScopeSelect){
        dom.inputs.mentalScopeSelect.addEventListener("change",(e)=>{
            appState.mentalScope=(e.target as HTMLSelectElement).value;
            topics.renderTopicGrid();
        });
    }
    if (dom.inputs.mentalShuffleToggle){
        dom.inputs.mentalShuffleToggle.addEventListener("change",(e)=>{
            appState.mentalShuffle=(e.target as HTMLInputElement).checked;
            ui.updateCheckboxAria(dom.inputs.mentalShuffleToggle);
        });
    }
    if (dom.inputs.mcqToggle){
        dom.inputs.mcqToggle.addEventListener("change",()=>{
            ui.toggleMcqMode();
            settings.settings.mcqMode=dom.inputs.mcqToggle!.checked;
            settings.saveSettings();
        });
    }
    if (dom.inputs.topicSearch){
        dom.inputs.topicSearch.addEventListener("input",()=>{
            topics.renderTopicGrid();
        });
    }
    if (dom.buttons.clearAnswerBtn){
        dom.buttons.clearAnswerBtn.addEventListener("click",ui.clearAnswer);
    }
    if (dom.displays.mathToolbar){
        dom.displays.mathToolbar.querySelectorAll(".math-toolbar-btn").forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                const target=e.target as HTMLElement;
                const symbol=target.dataset.symbol||target.dataset.template||"";
                ui.insertSymbol(symbol);
            });
        });
        dom.inputs.userAnswer?.addEventListener("focus",()=>{
            if (dom.modals.answerCard) dom.modals.answerCard.classList.add("focused");
        });
        dom.inputs.userAnswer?.addEventListener("blur", (e)=>{
            if (dom.displays.mathToolbar&&e.relatedTarget instanceof Node&&dom.displays.mathToolbar.contains(e.relatedTarget)){
                return;
            }
            if (dom.modals.answerCard) dom.modals.answerCard.classList.remove("focused");
        });
    }
    if (dom.buttons.copyAnswerBtn){
        dom.buttons.copyAnswerBtn.addEventListener("click",ui.copyCorrectAnswer);
    }
    if (dom.buttons.shortcutsButton){
        dom.buttons.shortcutsButton.addEventListener("click",ui.showShortcutsModal);
    }
    if (dom.buttons.shortcutsClose){
        dom.buttons.shortcutsClose.addEventListener("click",ui.hideShortcutsModal);
    }
    if (dom.buttons.shortcutsGotit){
        dom.buttons.shortcutsGotit.addEventListener("click",ui.hideShortcutsModal);
    }
    if (dom.modals.shortcutsModal){
        dom.modals.shortcutsModal.addEventListener("click",(e)=>{
            if (e.target===dom.modals.shortcutsModal) ui.hideShortcutsModal();
        });
    }
    if (dom.buttons.leaderboardClose){
        dom.buttons.leaderboardClose.addEventListener("click",()=>{
            if (dom.session.leaderboardCard) dom.session.leaderboardCard.style.display="none";
        });
    }
    if (dom.buttons.onboardingClose){
        dom.buttons.onboardingClose.addEventListener("click",ui.hideOnboarding);
    }
    if (dom.buttons.onboardingGotit){
        dom.buttons.onboardingGotit.addEventListener("click",ui.hideOnboarding);
    }
    if (dom.modals.onboardingOverlay){
        dom.modals.onboardingOverlay.addEventListener("click",(e)=>{
            if (e.target===dom.modals.onboardingOverlay) ui.hideOnboarding();
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
    try{
        const printWorksheet=await import("./printWorksheet");
        printWorksheet.initPrintModal();
        const printWorksheetBtn=document.getElementById("print-worksheet-btn");
        if (printWorksheetBtn) printWorksheetBtn.addEventListener("click", printWorksheet.openPrintModal);
    }
    catch(err){
        console.error("Failed to load printWorksheet module:",err);
    }
    try{
        const dataManagement=await import("./dataManagement");
        dataManagement.initDataModal();
        const manageDataBtn=document.getElementById("manage-data-btn");
        if (manageDataBtn) manageDataBtn.addEventListener("click", dataManagement.openDataModal);
    }
    catch(err){
        console.error("Failed to load dataManagement module:",err);
    }
    try{
        const weakTopics=await import("./weakTopics");
        const recommendBtn=document.getElementById("recommend-btn");
        if (recommendBtn) recommendBtn.addEventListener("click", ()=>{
            weakTopics.checkAndShowWeakTopicsPopup().catch(console.warn);
        });
    }
    catch(err){
        console.error("Failed to load weakTopics module:",err);
    }
}