import * as dom from "./dom";
import * as state from "./state";
import * as settings from "./settings";
import {generateChoicesForCurrentQuestion} from "./mcq";
import * as session from "./session";
import * as answer from "./answer";
export function clearAllTimeouts(): void{
	if (state.autoTimeout) { clearTimeout(state.autoTimeout); state.setAutoTimeout(null); }
	if (state.previewTimeout) { clearTimeout(state.previewTimeout); state.setPreviewTimeout(null); }
	if (state.generateDebounceTimeout) { clearTimeout(state.generateDebounceTimeout); state.setGenerateDebounceTimeout(null); }
	if (state.mentalNextQuestionTimeout) { clearTimeout(state.mentalNextQuestionTimeout); state.setMentalNextQuestionTimeout(null); }
	if (state.sessionTimer) { clearInterval(state.sessionTimer); state.setSessionTimer(null); }
}
export function syncSettingsToState(): void{
	state.setScope(settings.settings.scope);
	state.setShuffle(settings.settings.shuffle);
	state.setAutocontinue(settings.settings.autoContinue);
	state.setCurrentDifficulty(settings.settings.difficulty);
	state.setMentalScope(settings.settings.scope);
	state.setMentalShuffle(settings.settings.shuffle);
	state.setMaxQuestions(settings.settings.maxQuestions);
	state.setTimeLeft(settings.settings.timer);
	state.setMcqMode(settings.settings.mcqMode);
	if (dom.scopeSelect) dom.scopeSelect.value=state.scope;
	if (dom.mentalScopeSelect) dom.mentalScopeSelect.value=state.mentalScope;
	if (dom.shuffleToggle) dom.shuffleToggle.checked=state.shuffle;
	if (dom.mentalShuffleToggle) dom.mentalShuffleToggle.checked=state.mentalShuffle;
	if (dom.autocontinueToggle) dom.autocontinueToggle.checked=state.autocontinue;
	if (dom.difficultySelect) dom.difficultySelect.value=state.currentDifficulty;
	if (dom.mcqToggle) dom.mcqToggle.checked=state.mcqMode;
}
export function updateAriaPressed(): void{
	if (dom.modeSingleBtn) dom.modeSingleBtn.setAttribute("aria-pressed",String(state.currentMode==="single"));
	if (dom.modeMentalBtn) dom.modeMentalBtn.setAttribute("aria-pressed",String(state.currentMode==="mental"));
}
export function updateCheckboxAria(checkbox: HTMLInputElement|null): void{
	if (checkbox) checkbox.setAttribute("aria-checked",String(checkbox.checked));
}
export function updateProgressBar(): void{
	if (dom.mentalProgressBar){
		const now=(state.sessionScore.total/state.maxQuestions)*100;
		dom.mentalProgressBar.setAttribute("aria-valuenow",String(now));
	}
}
export function updateTimerDisplay(): void{
	if (!dom.timerDisplay) return;
	let mins=Math.floor(Math.max(0,state.timeLeft)/60);
	let secs=Math.max(0,state.timeLeft)%60;
	dom.timerDisplay.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg> ${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
}
export function updateScoreDisplay(): void{
	if (!dom.scoreDisplay) return;
	dom.scoreDisplay.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${state.sessionScore.correct} / ${state.sessionScore.total}`;
}
export function disableTopicSelection(disabled: boolean): void{
	document.querySelectorAll(".topic-pill").forEach(el=>{
		(el as HTMLButtonElement).disabled=disabled;
		(el as HTMLButtonElement).setAttribute("aria-disabled",String(disabled));
	});
}
export function disableModeButtons(disabled: boolean): void{
	state.modeButtons.forEach(btn=>{
		if (btn){
			btn.disabled=disabled;
			if (disabled) btn.classList.add("disabled");
			else btn.classList.remove("disabled");
			btn.setAttribute("aria-disabled",String(disabled));
		}
	});
}
export function disableDifficulty(disabled: boolean): void{
	if (dom.difficultySelect){
		dom.difficultySelect.disabled=disabled;
		dom.difficultySelect.setAttribute("aria-disabled",String(disabled));
	}
}
export function setSessionButton(isActive: boolean): void{
	if (!dom.startSessionBtn) return;
	if (isActive){
		dom.startSessionBtn.textContent="Stop Session";
		dom.startSessionBtn.classList.add("stop-session");
		if (dom.pauseSessionBtn) dom.pauseSessionBtn.style.display="inline-flex";
		if (dom.skipQuestionBtn) dom.skipQuestionBtn.style.display="inline-flex";
	}
	else{
		dom.startSessionBtn.textContent="Start Session";
		dom.startSessionBtn.classList.remove("stop-session");
		if (dom.pauseSessionBtn) dom.pauseSessionBtn.style.display="none";
		if (dom.skipQuestionBtn) dom.skipQuestionBtn.style.display="none";
	}
}
export function updateUIState(): void{
	if (!dom.generateQuestionButton||!dom.checkAnswerButton||!dom.questionArea) return;
	let hasTopic=state.selectedTopic!==null;
	let hasQuestion=window.hasQuestion || !!window.correctAnswer.correct;
	dom.generateQuestionButton.disabled=!hasTopic;
	dom.generateQuestionButton.setAttribute("aria-disabled",String(!hasTopic));
	dom.checkAnswerButton.disabled=!hasTopic||!hasQuestion;
	dom.checkAnswerButton.setAttribute("aria-disabled",String(!hasTopic||!hasQuestion));
	if (hasTopic&&hasQuestion){
		dom.generateQuestionButton.innerHTML=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      New Question
      <kbd class="shortcut-hint">Ctrl+G</kbd>
    `;
	}
	else{
		dom.generateQuestionButton.innerHTML=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      Generate Question
      <kbd class="shortcut-hint">Ctrl+G</kbd>
    `;
	}
	if (state.mcqMode){
		if (dom.userAnswer) dom.userAnswer.style.display="none";
		if (dom.mathToolbar) dom.mathToolbar.style.display="none";
		if (dom.mcqChoicesContainer) dom.mcqChoicesContainer.style.display="flex";
		if (dom.expectedFormatDiv) dom.expectedFormatDiv.style.display="none";
		if (dom.previewDiv) dom.previewDiv.style.display="none";
	}
	else{
		if (dom.userAnswer) dom.userAnswer.style.display="block";
		if (dom.mathToolbar) dom.mathToolbar.style.display="flex";
		if (dom.mcqChoicesContainer) dom.mcqChoicesContainer.style.display="none";
		if (dom.expectedFormatDiv) dom.expectedFormatDiv.style.display="block";
		if (dom.previewDiv) dom.previewDiv.style.display="block";
	}
}
export function showNotification(message: string, type: "info"|"warning"="info"): void{
	if (!settings.settings.notifications) return;
	let notification=document.createElement("div");
	notification.className=`notification notification-${type}`;
	notification.textContent=message;
	notification.setAttribute("role","alert");
	document.body.appendChild(notification);
	setTimeout(()=>{
		notification.classList.add("fade-out");
		setTimeout(()=>{
			if (notification.parentNode){
				notification.parentNode.removeChild(notification);
			}
		},300);
	},3000);
}
export function updatePreview(): void{
	if (!dom.previewDiv||!dom.userAnswer) return;
	const input=dom.userAnswer.value.trim();
	if (!input){
		dom.previewDiv.innerHTML="";
		dom.previewDiv.classList.remove("has-content");
		return;
	}
	try{
		window.katex.render(input,dom.previewDiv,{
			throwOnError:false,
			displayMode:false
		});
		dom.previewDiv.classList.add("has-content");
	} catch (e){
		const errorMessage=e instanceof Error?e.message:String(e);
		dom.previewDiv.innerHTML="";
		const errorSpan=document.createElement("span");
		errorSpan.style.color="var(--error)";
		errorSpan.textContent=errorMessage;
		dom.previewDiv.appendChild(errorSpan);
		dom.previewDiv.classList.add("has-content");
	}
}
export function updatePreviewDebounced(): void{
	if (state.previewTimeout) clearTimeout(state.previewTimeout);
	state.setPreviewTimeout(setTimeout(()=>{
		updatePreview();
		state.setPreviewTimeout(null);
	},200));
}
export function insertSymbol(symbol: string): void{
	if (!dom.userAnswer) return;
	const start=dom.userAnswer.selectionStart;
	const end=dom.userAnswer.selectionEnd;
	const text=dom.userAnswer.value;
	if (symbol.includes('{}') || symbol.includes('&')){
		const newText=text.substring(0,start)+symbol+text.substring(end);
		dom.userAnswer.value=newText;
		let placeholderPos=symbol.indexOf('{}');
		if (placeholderPos===-1) placeholderPos=symbol.indexOf('&');
		if (placeholderPos!==-1){
			dom.userAnswer.selectionStart=dom.userAnswer.selectionEnd=start+placeholderPos+1;
		}
		else{
			dom.userAnswer.selectionStart=dom.userAnswer.selectionEnd=start+symbol.length;
		}
	}
	else{
		const newText=text.substring(0,start)+symbol+text.substring(end);
		dom.userAnswer.value=newText;
		dom.userAnswer.selectionStart=dom.userAnswer.selectionEnd=start+symbol.length;
	}
	dom.userAnswer.focus();
	updatePreviewDebounced();
}
export function copyCorrectAnswer(): void{
	if (!window.correctAnswer.correct) return;
	navigator.clipboard.writeText(window.correctAnswer.correct).then(()=>{
		showNotification("Answer copied to clipboard","info");
	}).catch(()=>{
		showNotification("Failed to copy","warning");
	});
}
export function clearAnswer(): void{
	if (dom.userAnswer){
		dom.userAnswer.value="";
		updatePreview();
		dom.userAnswer.focus();
	}
}
export function showShortcutsModal(): void{
	if (dom.shortcutsModal) dom.shortcutsModal.classList.add("show");
}
export function hideShortcutsModal(): void{
	if (dom.shortcutsModal) dom.shortcutsModal.classList.remove("show");
}
export function showOnboarding(): void{
	if (!localStorage.getItem("onboardingShown")){
		if (dom.onboardingOverlay) dom.onboardingOverlay.classList.add("show");
		localStorage.setItem("onboardingShown","true");
	}
}
export function hideOnboarding(): void{
	if (dom.onboardingOverlay) dom.onboardingOverlay.classList.remove("show");
}
export function updateStatistics(): void{
	if (!dom.accuracyStat || !dom.avgTimeStat) return;
	const accuracy=state.sessionScore.total > 0 ? (state.sessionScore.correct / state.sessionScore.total) * 100 : 0;
	dom.accuracyStat.textContent=`Accuracy: ${accuracy.toFixed(1)}%`;
	if (state.answeredQuestionsCount > 0){
		const avg=state.totalTimeSpent / state.answeredQuestionsCount / 1000;
		dom.avgTimeStat.textContent=`Avg: ${avg.toFixed(1)}s`;
	}
	else{
		dom.avgTimeStat.textContent=`Avg: 0.0s`;
	}
}
export function toggleMcqMode(): void{
	const isMcq=dom.mcqToggle?.checked ?? false;
	state.setMcqMode(isMcq);
	if (state.currentMode!=="mental"&&state.currentMode!=="single") return;
	if (isMcq){
		if (dom.userAnswer) dom.userAnswer.style.display="none";
		if (dom.mathToolbar) dom.mathToolbar.style.display="none";
		if (dom.mcqChoicesContainer) dom.mcqChoicesContainer.style.display="flex";
		if (dom.expectedFormatDiv) dom.expectedFormatDiv.style.display="none";
		if (dom.previewDiv) dom.previewDiv.style.display="none";
		if (window.hasQuestion&&window.correctAnswer.correct){
			generateChoicesForCurrentQuestion();
		}
	}
	else{
		if (dom.userAnswer) dom.userAnswer.style.display="block";
		if (dom.mathToolbar) dom.mathToolbar.style.display="flex";
		if (dom.mcqChoicesContainer) dom.mcqChoicesContainer.style.display="none";
		if (dom.expectedFormatDiv) dom.expectedFormatDiv.style.display="block";
		if (dom.previewDiv) dom.previewDiv.style.display="block";
	}
}
export function renderMcqChoices(choices: string[]): void{
	if (!dom.mcqChoicesContainer) return;
	dom.mcqChoicesContainer.innerHTML="";
	choices.forEach(choice=>{
		const btn=document.createElement("button");
		btn.className="choice-button secondary-button";
		if (isProbablyLaTeX(choice)&&window.katex){
			try{
				const renderedHtml=window.katex.renderToString(choice,{
					throwOnError:false,
					displayMode:false
				});
				btn.innerHTML=renderedHtml;
			}catch(e){
				console.warn("KaTeX rendering failed for choice:",choice,e);
				btn.textContent=choice;
			}
		}
		else{
			btn.textContent=choice;
		}
		btn.addEventListener("click",()=>{
			if (state.currentMode==="mental"){
				if (state.sessionActive&&!state.sessionPaused){
					session.handleMcqChoice(choice);
				}
			}
			else{
				answer.checkAnswer(choice);
			}
		});
		dom.mcqChoicesContainer!.appendChild(btn);
	});
}
function isProbablyLaTeX(str: string): boolean{
	return /\\|{|}|^[^a-zA-Z0-9]/.test(str) || /[a-zA-Z]+\^/i.test(str);
}