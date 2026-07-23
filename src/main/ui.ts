import{dom}from"./core/domRegistry";
import{appState}from"./core/stateStore";
import{questionState}from"./core/questionState";
import*as settings from"./settings";
import{generateChoicesForCurrentQuestion}from"./mcq";
import*as session from"./session";
import*as answer from"./answer";
export function clearAllTimeouts(): void{
    if(appState.autoTimeout){clearTimeout(appState.autoTimeout);appState.autoTimeout=null;}
    if(appState.previewTimeout){clearTimeout(appState.previewTimeout);appState.previewTimeout=null;}
    if(appState.generateDebounceTimeout){clearTimeout(appState.generateDebounceTimeout);appState.generateDebounceTimeout=null;}
    if(appState.mentalNextQuestionTimeout){clearTimeout(appState.mentalNextQuestionTimeout);appState.mentalNextQuestionTimeout=null;}
    if(appState.sessionTimer){clearInterval(appState.sessionTimer);appState.sessionTimer=null;}
}
export function syncSettingsToState(): void{
    appState.scope=settings.settings.scope;
    appState.shuffle=settings.settings.shuffle;
    appState.autocontinue=settings.settings.autoContinue;
    appState.currentDifficulty=settings.settings.difficulty;
    appState.mentalScope=settings.settings.mentalScope;
    appState.mentalShuffle=settings.settings.mentalShuffle;
    appState.maxQuestions=settings.settings.maxQuestions;
    appState.timeLeft=settings.settings.timer;
    appState.mcqMode=settings.settings.mcqMode;
    if(dom.inputs.scopeSelect)dom.inputs.scopeSelect.value=appState.scope;
    if(dom.inputs.mentalScopeSelect)dom.inputs.mentalScopeSelect.value=appState.mentalScope;
    if(dom.inputs.shuffleToggle)dom.inputs.shuffleToggle.checked=appState.shuffle;
    if(dom.inputs.mentalShuffleToggle)dom.inputs.mentalShuffleToggle.checked=appState.mentalShuffle;
    if(dom.inputs.autocontinueToggle)dom.inputs.autocontinueToggle.checked=appState.autocontinue;
    if(dom.inputs.difficultySelect)dom.inputs.difficultySelect.value=appState.currentDifficulty;
    if(dom.inputs.mcqToggle)dom.inputs.mcqToggle.checked=appState.mcqMode;
}
export function updateAriaPressed(): void{
    if(dom.buttons.modeSingleBtn)dom.buttons.modeSingleBtn.setAttribute("aria-pressed",String(appState.currentMode==="single"));
    if(dom.buttons.modeMentalBtn)dom.buttons.modeMentalBtn.setAttribute("aria-pressed",String(appState.currentMode==="mental"));
}
export function updateCheckboxAria(checkbox: HTMLInputElement|null): void{
    if(checkbox)checkbox.setAttribute("aria-checked",String(checkbox.checked));
}
export function updateProgressBar(): void{
    if(dom.displays.mentalProgressBar){
        if(appState.maxQuestions<=0)return;
        let now=Math.min(100,(appState.sessionScore.total/appState.maxQuestions)*100);
        dom.displays.mentalProgressBar.setAttribute("aria-valuenow",String(now));
    }
}
export function updateTimerDisplay(): void{
    if(!dom.displays.timerDisplay)return;
    let mins=Math.floor(Math.max(0,appState.timeLeft)/60);
    let secs=Math.max(0,appState.timeLeft)%60;
    dom.displays.timerDisplay.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg> ${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
}
export function updateScoreDisplay(): void{
    if(!dom.displays.scoreDisplay)return;
    dom.displays.scoreDisplay.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${appState.sessionScore.correct} / ${appState.sessionScore.total}`;
}
export function disableTopicSelection(disabled: boolean): void{
    document.querySelectorAll(".topic-pill").forEach(el=>{
        (el as HTMLButtonElement).disabled=disabled;
        (el as HTMLButtonElement).setAttribute("aria-disabled",String(disabled));
    });
}
export function disableModeButtons(disabled: boolean): void{
    appState.modeButtons.forEach(btn=>{
        if(btn){
            btn.disabled=disabled;
            if(disabled)btn.classList.add("disabled");
            else btn.classList.remove("disabled");
            btn.setAttribute("aria-disabled",String(disabled));
        }
    });
}
export function disableDifficulty(disabled: boolean): void{
    if(dom.inputs.difficultySelect){
        dom.inputs.difficultySelect.disabled=disabled;
        dom.inputs.difficultySelect.setAttribute("aria-disabled",String(disabled));
    }
}
export function setSessionButton(isActive: boolean): void{
    if(!dom.buttons.startSessionBtn)return;
    if(isActive){
        dom.buttons.startSessionBtn.textContent="Stop Session";
        dom.buttons.startSessionBtn.classList.add("stop-session");
        if(dom.buttons.pauseSessionBtn)dom.buttons.pauseSessionBtn.classList.remove("hidden");
        if(dom.buttons.skipQuestionBtn)dom.buttons.skipQuestionBtn.classList.remove("hidden");
    }
    else{
        dom.buttons.startSessionBtn.textContent="Start Session";
        dom.buttons.startSessionBtn.classList.remove("stop-session");
        if(dom.buttons.pauseSessionBtn)dom.buttons.pauseSessionBtn.classList.add("hidden");
        if(dom.buttons.skipQuestionBtn)dom.buttons.skipQuestionBtn.classList.add("hidden");
    }
}
export function updateUIState(): void{
    if(!dom.buttons.generateQuestionButton||!dom.buttons.checkAnswerButton||!dom.displays.questionArea)return;
    let hasTopic=appState.selectedTopic!==null;
    let hasQuestion=questionState.hasQuestion||(questionState.correctAnswer&&!!questionState.correctAnswer.correct);
    dom.buttons.generateQuestionButton.disabled=!hasTopic;
    dom.buttons.generateQuestionButton.setAttribute("aria-disabled",String(!hasTopic));
    dom.buttons.checkAnswerButton.disabled=!hasTopic||!hasQuestion||appState.mcqMode;
    dom.buttons.checkAnswerButton.setAttribute("aria-disabled",String(!hasTopic||!hasQuestion||appState.mcqMode));
    if(hasTopic&&hasQuestion){
        dom.buttons.generateQuestionButton.innerHTML=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      New Question
      <kbd class="shortcut-hint">Ctrl+G</kbd>
    `;
    }
    else{
        dom.buttons.generateQuestionButton.innerHTML=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      Generate Question
      <kbd class="shortcut-hint">Ctrl+G</kbd>
    `;
    }
    if(appState.mcqMode){
        if(dom.inputs.userAnswer)dom.inputs.userAnswer.classList.add("hidden");
        if(dom.displays.mathToolbar)dom.displays.mathToolbar.classList.add("hidden");
        if(dom.displays.mcqChoicesContainer)dom.displays.mcqChoicesContainer.classList.remove("hidden");
        if(dom.displays.expectedFormatDiv)dom.displays.expectedFormatDiv.classList.add("hidden");
        if(dom.displays.previewDiv)dom.displays.previewDiv.classList.add("hidden");
    }
    else{
        if(dom.inputs.userAnswer)dom.inputs.userAnswer.classList.remove("hidden");
        if(dom.displays.mathToolbar)dom.displays.mathToolbar.classList.remove("hidden");
        if(dom.displays.mcqChoicesContainer)dom.displays.mcqChoicesContainer.classList.add("hidden");
        if(dom.displays.expectedFormatDiv)dom.displays.expectedFormatDiv.classList.remove("hidden");
        if(dom.displays.previewDiv){
            if(settings.settings.perfPreview)dom.displays.previewDiv.classList.remove("hidden");
            else dom.displays.previewDiv.classList.add("hidden");
        }
    }
}
export function showNotification(message: string,type: "info"|"warning"="info"): void{
    if(!settings.settings.notifications&&type==="info")return;
    let notification=document.createElement("div");
    notification.className=`notification notification-${type}`;
    notification.textContent=message;
    notification.setAttribute("role","alert");
    document.body.appendChild(notification);
    setTimeout(()=>{
        notification.classList.add("fade-out");
        setTimeout(()=>{
            if(notification.parentNode){
                notification.parentNode.removeChild(notification);
            }
        },300);
    },3000);
}
export function updatePreview(): void{
    if(!dom.displays.previewDiv||!dom.inputs.userAnswer)return;
    let input=dom.inputs.userAnswer.value.trim();
    if(!input){
        dom.displays.previewDiv.innerHTML="";
        dom.displays.previewDiv.classList.remove("has-content");
        return;
    }
    try{
        if(!(window as any).katex)return;
        window.katex.render(input,dom.displays.previewDiv,{
            throwOnError:false,
            displayMode:false
        });
        dom.displays.previewDiv.classList.add("has-content");
    }
    catch(e){
        let errorMessage=e instanceof Error?e.message:String(e);
        dom.displays.previewDiv.innerHTML="";
        let errorSpan=document.createElement("span");
        errorSpan.style.color="var(--error)";
        errorSpan.textContent=errorMessage;
        dom.displays.previewDiv.appendChild(errorSpan);
        dom.displays.previewDiv.classList.add("has-content");
    }
}
export function updatePreviewDebounced(): void{
    if(appState.previewTimeout)clearTimeout(appState.previewTimeout);
    appState.previewTimeout=setTimeout(()=>{
        updatePreview();
        appState.previewTimeout=null;
    },200);
}
export function insertSymbol(symbol: string): void{
    if(!dom.inputs.userAnswer)return;
    let start=dom.inputs.userAnswer.selectionStart;
    let end=dom.inputs.userAnswer.selectionEnd;
    let text=dom.inputs.userAnswer.value;
    if(symbol.includes('{}')||symbol.includes('&')){
        let newText=text.substring(0,start)+symbol+text.substring(end);
        dom.inputs.userAnswer.value=newText;
        let placeholderPos=symbol.indexOf('{}');
        if(placeholderPos===-1)placeholderPos=symbol.indexOf('&');
        if(placeholderPos!==-1){
            dom.inputs.userAnswer.selectionStart=dom.inputs.userAnswer.selectionEnd=start+placeholderPos+1;
        }
        else{
            dom.inputs.userAnswer.selectionStart=dom.inputs.userAnswer.selectionEnd=start+symbol.length;
        }
    }
    else{
        let newText=text.substring(0,start)+symbol+text.substring(end);
        dom.inputs.userAnswer.value=newText;
        dom.inputs.userAnswer.selectionStart=dom.inputs.userAnswer.selectionEnd=start+symbol.length;
    }
    dom.inputs.userAnswer.focus();
    updatePreviewDebounced();
}
export function copyCorrectAnswer(): void{
    if(!questionState.correctAnswer||!questionState.correctAnswer.correct)return;
    if(!navigator.clipboard){
        console.warn("Clipboard API unavailable");
        showNotification("Clipboard not available in this environment","warning");
        return;
    }
    navigator.clipboard.writeText(questionState.correctAnswer.correct).then(()=>{
        showNotification("Answer copied to clipboard","info");
    }).catch(()=>{
        showNotification("Failed to copy","warning");
    });
}
export function clearAnswer(): void{
    if(dom.inputs.userAnswer){
        dom.inputs.userAnswer.value="";
        updatePreview();
        dom.inputs.userAnswer.focus();
    }
}
export function showShortcutsModal(): void{
    if(dom.modals.shortcutsModal){dom.modals.shortcutsModal.classList.remove("hidden");dom.modals.shortcutsModal.classList.add("show");}
}
export function hideShortcutsModal(): void{
    if(dom.modals.shortcutsModal){dom.modals.shortcutsModal.classList.remove("show");dom.modals.shortcutsModal.classList.add("hidden");}
}
export function showOnboarding(): void{
    let alreadyShown=false;
    try{
        alreadyShown=!!localStorage.getItem("onboardingShown");
    }
    catch(e){
        console.log("Failed to read onboarding flag from localStorage:",e);
    }
    if(!alreadyShown){
        if(dom.modals.onboardingOverlay){dom.modals.onboardingOverlay.classList.remove("hidden");dom.modals.onboardingOverlay.classList.add("show");}
        try{
            localStorage.setItem("onboardingShown","true");
        }
        catch(e){
            console.log("Failed to persist onboarding flag to localStorage:",e);
        }
    }
}
export function hideOnboarding(): void{
    if(dom.modals.onboardingOverlay){dom.modals.onboardingOverlay.classList.remove("show");dom.modals.onboardingOverlay.classList.add("hidden");}
}
export function updateStatistics(): void{
    if(!dom.displays.accuracyStat||!dom.displays.avgTimeStat)return;
    let accuracy=appState.sessionScore.total>0?(appState.sessionScore.correct/appState.sessionScore.total)*100:0;
    dom.displays.accuracyStat.textContent=`Accuracy: ${accuracy.toFixed(1)}%`;
    if(appState.answeredQuestionsCount>0){
        let avg=appState.totalTimeSpent/appState.answeredQuestionsCount/1000;
        dom.displays.avgTimeStat.textContent=`Avg: ${avg.toFixed(1)}s`;
    }
    else{
        dom.displays.avgTimeStat.textContent=`Avg: 0.0s`;
    }
}
export function toggleMcqMode(): void{
    let isMcq=dom.inputs.mcqToggle?.checked??false;
    appState.mcqMode=isMcq;
    if(appState.currentMode!=="mental"&&appState.currentMode!=="single")return;
    if(isMcq){
        if(dom.inputs.userAnswer)dom.inputs.userAnswer.classList.add("hidden");
        if(dom.displays.mathToolbar)dom.displays.mathToolbar.classList.add("hidden");
        if(dom.displays.mcqChoicesContainer)dom.displays.mcqChoicesContainer.classList.remove("hidden");
        if(dom.displays.expectedFormatDiv)dom.displays.expectedFormatDiv.classList.add("hidden");
        if(dom.displays.previewDiv)dom.displays.previewDiv.classList.add("hidden");
        if(questionState.hasQuestion&&questionState.correctAnswer.correct){
            generateChoicesForCurrentQuestion().catch((err: unknown)=>console.error("generateChoicesForCurrentQuestion failed:",err));
        }
    }
    else{
        if(dom.inputs.userAnswer)dom.inputs.userAnswer.classList.remove("hidden");
        if(dom.displays.mathToolbar)dom.displays.mathToolbar.classList.remove("hidden");
        if(dom.displays.mcqChoicesContainer)dom.displays.mcqChoicesContainer.classList.add("hidden");
        if(dom.displays.expectedFormatDiv)dom.displays.expectedFormatDiv.classList.remove("hidden");
        if(dom.displays.previewDiv){
            if(settings.settings.perfPreview)dom.displays.previewDiv.classList.remove("hidden");
            else dom.displays.previewDiv.classList.add("hidden");
        }
    }
}
export function renderMcqChoices(choices: string[]): void{
    if(!dom.displays.mcqChoicesContainer)return;
    dom.displays.mcqChoicesContainer.innerHTML="";
    choices.forEach(choice=>{
        let btn=document.createElement("button");
        btn.className="choice-button secondary-button";
        if(isProbablyLaTeX(choice)&&window.katex){
            try{
                let renderedHtml=window.katex.renderToString(choice,{
                    throwOnError:false,
                    displayMode:false
                });
                btn.innerHTML=renderedHtml;
            }
            catch(e){
                console.warn("KaTeX rendering failed for choice:",choice,e);
                btn.textContent=choice;
            }
        }
        else{
            btn.textContent=choice;
        }
        btn.addEventListener("click",()=>{
            if(appState.currentMode==="mental"){
                if(appState.sessionActive&&!appState.sessionPaused){
                    session.handleMcqChoice(choice).catch((err: unknown)=>console.error("handleMcqChoice failed:",err));
                }
            }
            else{
                answer.checkAnswer(choice).catch((err: unknown)=>console.error("checkAnswer failed:",err));
            }
        });
        btn.addEventListener("keydown",(e: KeyboardEvent)=>{
            if(e.key==="Enter"||e.key===" "){
                e.preventDefault();
                btn.click();
            }
        });
        dom.displays.mcqChoicesContainer!.appendChild(btn);
    });
}
function isProbablyLaTeX(str: string): boolean{
    return/\\|{|}|^[^a-zA-Z0-9]/.test(str)||/[a-zA-Z]+\^/i.test(str);
}