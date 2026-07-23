import{dom}from"./core/domRegistry";
import{appState}from"./core/stateStore";
import{questionState}from"./core/questionState";
import{renderer}from"./core/questionRenderer";
import{showQuestionSkeleton,hideQuestionSkeleton}from"./ui/skeleton";
import * as ui from "./ui";
import * as topics from "./topics";
import{generateQuestion as callGenerator}from"./questionGenerator";
import{generateChoicesForCurrentQuestion}from"./mcq";
import{invoke}from"@tauri-apps/api/core";
import * as settings from "./settings";
import{startQuestionTimer}from"./answer";
async function applyAdaptiveRecommendation(): Promise<boolean>{
    console.log("[Adaptive] Called, adaptive setting =", settings.settings.adaptive);
    if (!settings.settings.adaptive) return false;
    let adjusted:boolean=false;
    try{
        console.log("[Adaptive] Invoking get_next_question_recommendation with:", {
            currentTopic: appState.selectedTopic,
            currentDifficulty: appState.currentDifficulty
        });
        let rec=await invoke('get_next_question_recommendation', {
            currentTopic: appState.selectedTopic,
            currentDifficulty: appState.currentDifficulty
        }) as { difficulty: string; weak_topic: string | null };
        console.log("[Adaptive] Received recommendation:", rec);
        if (!appState.userPickedDifficulty){
            if (rec.difficulty&&rec.difficulty !== appState.currentDifficulty){
                console.log(`[Adaptive] Changing difficulty from ${appState.currentDifficulty} to ${rec.difficulty}`);
                appState.currentDifficulty=rec.difficulty;
                if (dom.inputs.difficultySelect) dom.inputs.difficultySelect.value=rec.difficulty;
                settings.settings.difficulty=rec.difficulty;
                settings.saveSettings();
                ui.showNotification(`Difficulty adjusted to ${rec.difficulty} based on your performance`, 'info');
                adjusted=true;
            }
        }
        appState.userPickedDifficulty=false;
    }catch(e){
        console.error("[Adaptive] Recommendation failed:", e);
    }
    return adjusted;
}
export function debounceGenerate(): void{
    if (appState.generateDebounceTimeout) clearTimeout(appState.generateDebounceTimeout);
    appState.generateDebounceTimeout=setTimeout(()=>{
        generateQuestion().catch((err: unknown)=>console.error("generateQuestion failed:",err));
        appState.generateDebounceTimeout=null;
    },150);
}
export async function generateQuestion(explicitTopicId?: string): Promise<void>{
    if (appState.isGenerating) return;
    appState.isGenerating=true;
    try{
    if(!explicitTopicId&&appState.weakTopicQueue.length>0){
        explicitTopicId=appState.weakTopicQueue.shift()||undefined;
    }
    let hasExplicitTopic=typeof explicitTopicId==="string"&&explicitTopicId.length>0;
    let adaptiveActive=false;
    if(hasExplicitTopic){
        appState.selectedTopic=explicitTopicId!;
        topics.selectTopic(explicitTopicId!);
    }
    else{
        adaptiveActive=await applyAdaptiveRecommendation();
    }
    if (!adaptiveActive&&!hasExplicitTopic&&appState.shuffle&&appState.currentMode==="single"){
        let randomTopic=topics.pickRandomTopic();
        if (randomTopic){
            topics.selectTopic(randomTopic);
        }
        else{
            ui.showNotification("No topics available in current scope","warning");
            return;
        }
    }
    if (!appState.selectedTopic){
        ui.showNotification("Please select a topic first","warning");
        return;
    }
    if (!dom.displays.answerResults||!dom.inputs.userAnswer||!dom.displays.questionArea||!dom.buttons.checkAnswerButton) return;
    if (appState.autoTimeout){
        clearTimeout(appState.autoTimeout);
        appState.autoTimeout=null;
    }
    dom.displays.answerResults.innerHTML=`
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
      </svg>
      <p>Your results will appear here after checking your answer</p>
    </div>
  `;
    dom.displays.answerResults.className="results-display";
    if (dom.buttons.copyAnswerBtn) dom.buttons.copyAnswerBtn.classList.add("hidden");
    dom.inputs.userAnswer.value="";
    if (dom.displays.expectedFormatDiv) dom.displays.expectedFormatDiv.textContent="";
    questionState.correctAnswer={correct:"",alternate:"",display:""};
    questionState.expectedFormat="";
    questionState.hasQuestion=false;
    dom.buttons.checkAnswerButton.disabled=true;
    dom.inputs.userAnswer.disabled=true;
    showQuestionSkeleton();
    try {
        await callGenerator(appState.selectedTopic,appState.currentDifficulty);
        hideQuestionSkeleton();
        if (!questionState.correctAnswer.correct){
            renderer.render(`<div class="empty-state"><p>Could not generate question. Please try another topic.</p></div>`);
            questionState.hasQuestion=false;
            dom.inputs.userAnswer.disabled=false;
            dom.buttons.checkAnswerButton.disabled=true;
            ui.updateUIState();
            return;
        }
        questionState.hasQuestion=true;
        if (appState.mcqMode){
            await generateChoicesForCurrentQuestion();
        }
        startQuestionTimer();
    } catch (error) {
        console.error("Question generation failed:", error);
        hideQuestionSkeleton();
        renderer.render(`
            <div class="empty-state" style="color: var(--error);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p>Failed to generate question. Please try again.</p>
            </div>
        `);
        questionState.hasQuestion=false;
        dom.inputs.userAnswer.disabled=false;
        dom.buttons.checkAnswerButton.disabled=true;
        ui.updateUIState();
        return;
    }
    if (dom.displays.expectedFormatDiv&&questionState.expectedFormat){
        dom.displays.expectedFormatDiv.textContent="Expected format: "+questionState.expectedFormat;
    }
    dom.inputs.userAnswer.disabled=false;
    dom.inputs.userAnswer.removeAttribute("aria-disabled");
    dom.buttons.checkAnswerButton.disabled=false;
    dom.buttons.checkAnswerButton.setAttribute("aria-disabled","false");
    dom.inputs.userAnswer.focus();
    ui.updatePreview();
    ui.updateUIState();
    renderer.typeset();
    }
    finally{
        appState.isGenerating=false;
    }
}