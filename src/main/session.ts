import * as dom from "./dom";
import * as state from "./state";
import * as settings from "./settings";
import * as ui from "./ui";
import * as topicsModule from "./topics";
import {topics as topicList, SESSION_STORAGE_KEY} from "./constants";
import {generateQuestion as callGenerator} from "./questionGenerator";
import {invoke} from "@tauri-apps/api/core";
import {generateChoicesForCurrentQuestion} from "./mcq";

export function saveSessionSnapshot(): void{
	if (!state.sessionActive) return;
	const snapshot={
		sessionScore:state.sessionScore,
		timeLeft:state.timeLeft,
		maxQuestions:state.maxQuestions,
		currentDifficulty:state.currentDifficulty,
		mentalShuffle:state.mentalShuffle,
		mentalScope:state.mentalScope,
		selectedTopic:state.selectedTopic,
		timestamp:Date.now()
	};
	localStorage.setItem(SESSION_STORAGE_KEY,JSON.stringify(snapshot));
}
export function restoreSessionSnapshot(): void{
	const saved=localStorage.getItem(SESSION_STORAGE_KEY);
	if (!saved) return;
	try{
		const snap=JSON.parse(saved);
		if (Date.now()-snap.timestamp>60*60*1000){
			localStorage.removeItem(SESSION_STORAGE_KEY);
			return;
		}
		state.setSessionActive(true);
		state.setSessionPaused(false);
		state.setSessionScore(snap.sessionScore);
		state.setTimeLeft(snap.timeLeft);
		state.setMaxQuestions(snap.maxQuestions);
		state.setCurrentDifficulty(snap.currentDifficulty);
		state.setMentalShuffle(snap.mentalShuffle);
		state.setMentalScope(snap.mentalScope);
		state.setSelectedTopic(snap.selectedTopic);
		if (dom.modeMentalBtn) dom.modeMentalBtn.click();
		if (state.selectedTopic) topicsModule.selectTopic(state.selectedTopic);
		ui.updateScoreDisplay();
		ui.updateTimerDisplay();
		ui.updateProgressBar();
		startTimer();
		ui.disableTopicSelection(true);
		ui.disableModeButtons(true);
		ui.disableDifficulty(true);
		ui.setSessionButton(true);
		generateNextMentalQuestion();
		localStorage.removeItem(SESSION_STORAGE_KEY);
	} catch (e){
		console.warn("Failed to restore session",e);
	}
}
export function startTimer(): void{
	if (state.unlimitedMode) return;
	if (state.sessionTimer) clearInterval(state.sessionTimer);
	state.setSessionTimer(setInterval(()=>{
		if (!state.sessionActive||state.sessionPaused) return;
		state.setTimeLeft(state.timeLeft-1);
		ui.updateTimerDisplay();
		saveSessionSnapshot();
		if (state.timeLeft<=0){
			state.setSessionScore({correct:state.sessionScore.correct,total:state.sessionScore.total+1});
			ui.updateScoreDisplay();
			ui.updateProgressBar();
			ui.showNotification("Time is up!","warning");
			if (dom.mentalProgressBar){
				let percent=(state.sessionScore.total/state.maxQuestions)*100;
				dom.mentalProgressBar.style.width=percent+"%";
			}
			if (state.sessionScore.total>=state.maxQuestions && !state.unlimitedMode){
				endMentalSession();
				return;
			}
			state.setTimeLeft(settings.settings.timer);
			ui.updateTimerDisplay();
			saveSessionSnapshot();
			if (state.mentalNextQuestionTimeout){
				clearTimeout(state.mentalNextQuestionTimeout);
				state.setMentalNextQuestionTimeout(null);
			}
			state.setMentalNextQuestionTimeout(setTimeout(()=>{
				if (state.sessionActive&&!state.sessionPaused){
					generateNextMentalQuestion();
				}
				state.setMentalNextQuestionTimeout(null);
			},settings.settings.autoCheckDelay));
		}
	},1000));
}
export function generateNextMentalQuestion(): void{
	if (!state.sessionActive||state.sessionPaused) return;
	if (state.mentalShuffle){
		const randomTopic=topicsModule.pickRandomTopic();
		if (randomTopic){
			state.setSelectedTopic(randomTopic);
			document.querySelectorAll(".topic-pill").forEach(item=>{
				item.classList.remove("active");
			});
			let selectedElement=document.querySelector(`[data-topic-id="${state.selectedTopic}"]`);
			if (selectedElement) selectedElement.classList.add("active");
			let topic=topicList.find(t=>t.id===state.selectedTopic);
			if (dom.currentTopicDisplay){
				dom.currentTopicDisplay.textContent=topic?topic.name:"Topic";
			}
		}
		else{
			endMentalSession();
			ui.showNotification("No topics available","warning");
			return;
		}
	}
	if (!state.selectedTopic){
		endMentalSession();
		return;
	}
	if (!dom.questionArea||!dom.userAnswer||!dom.checkAnswerButton) return;
	if (dom.answerResults){
		dom.answerResults.innerHTML=`<div class="empty-state">...</div>`;
	}
	if (dom.copyAnswerBtn) dom.copyAnswerBtn.style.display="none";
	dom.questionArea.innerHTML=`
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Generating...</p>
    </div>
  `;
	try {
		callGenerator(state.selectedTopic,state.currentDifficulty);
		window.hasQuestion=true;
		ui.updateUIState();
		state.setCurrentQuestionStartTime(Date.now());
		if (state.mcqMode){
			generateChoicesForCurrentQuestion();
			if (dom.userAnswer) dom.userAnswer.style.display="none";
			if (dom.mathToolbar) dom.mathToolbar.style.display="none";
			if (dom.mcqChoicesContainer) dom.mcqChoicesContainer.style.display="flex";
		}
		else{
			if (dom.userAnswer) dom.userAnswer.style.display="block";
			if (dom.mathToolbar) dom.mathToolbar.style.display="flex";
			if (dom.mcqChoicesContainer) dom.mcqChoicesContainer.style.display="none";
		}
	} catch (error) {
		console.error("Mental question generation failed:", error);
		dom.questionArea.innerHTML=`<div class="empty-state">Generation failed</div>`;
		window.hasQuestion=false;
		endMentalSession();
		return;
	}
	if (dom.expectedFormatDiv&&window.expectedFormat){
		dom.expectedFormatDiv.textContent="Expected format: "+window.expectedFormat;
	}
	dom.userAnswer.disabled=false;
	dom.userAnswer.removeAttribute("aria-disabled");
	dom.userAnswer.focus();
	ui.updatePreview();
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([dom.questionArea]).catch((err: any)=>console.log("MathJax typeset error:",err));
	}
}
export async function handleMentalAnswer(answer?: string): Promise<void>{
	if (!state.sessionActive||state.sessionPaused) return;
	if (!dom.userAnswer||!dom.answerResults) return;
	if (state.mentalNextQuestionTimeout){
		clearTimeout(state.mentalNextQuestionTimeout);
		state.setMentalNextQuestionTimeout(null);
	}
	let userInput=answer;
	if (userInput===undefined){
		userInput=dom.userAnswer.value.trim();
		if (!userInput){
			ui.showNotification("Please enter an answer","warning");
			return;
		}
	}
	let correct=window.correctAnswer.correct;
	let alternate=window.correctAnswer.alternate;
	let isCorrect=await settings.checkAnswerFast(userInput,correct,alternate);
	if (!state.sessionActive) return;
	if (settings.settings.sound){
		const audioCtx=new (window.AudioContext||(window as any).webkitAudioContext)();
		const oscillator=audioCtx.createOscillator();
		const gainNode=audioCtx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);
		oscillator.frequency.value=isCorrect?880:440;
		gainNode.gain.setValueAtTime(0.1,audioCtx.currentTime);
		oscillator.start();
		oscillator.stop(audioCtx.currentTime+0.1);
	}
	if (settings.settings.vibration&&navigator.vibrate){
		navigator.vibrate(isCorrect?50:100);
	}
	if (state.currentQuestionStartTime){
		const elapsed=Date.now()-state.currentQuestionStartTime;
		state.setTotalTimeSpent(state.totalTimeSpent+elapsed);
		state.setAnsweredQuestionsCount(state.answeredQuestionsCount+1);
		ui.updateStatistics();
		state.setCurrentQuestionStartTime(null);
	}
	let newCorrect=state.sessionScore.correct+(isCorrect?1:0);
	let newTotal=state.sessionScore.total+1;
	state.setSessionScore({correct:newCorrect,total:newTotal});
	ui.updateScoreDisplay();
	ui.updateProgressBar();
	if (dom.mentalProgressBar){
		let percent=(newTotal/state.maxQuestions)*100;
		dom.mentalProgressBar.style.width=percent+"%";
	}
	let answerHtml='';
	if (window.katex){
		try{
			answerHtml=window.katex.renderToString(window.correctAnswer.correct,{throwOnError:false,displayMode:false});
		}catch(e){
			console.warn('KaTeX rendering failed, falling back to plain text',e);
			answerHtml=window.correctAnswer.correct;
		}
	}else{
		answerHtml=window.correctAnswer.correct;
	}
	if (dom.answerResults){
		dom.answerResults.innerHTML=isCorrect
			?`<div class="result-success">Correct! <span class="katex-answer">${answerHtml}</span></div>`
			:`<div class="result-error">Incorrect. The answer was <span class="katex-answer">${answerHtml}</span></div>`;
		dom.answerResults.className=isCorrect?"results-display correct":"results-display incorrect";
		dom.answerResults.classList.add(isCorrect?"correct-flash":"incorrect-flash");
		setTimeout(()=>dom.answerResults?.classList.remove(isCorrect?"correct-flash":"incorrect-flash"),300);
	}
	if (dom.copyAnswerBtn) dom.copyAnswerBtn.style.display="inline-flex";
	if (dom.userAnswer) dom.userAnswer.value="";
	ui.updatePreview();
	saveSessionSnapshot();
	if (newTotal>=state.maxQuestions && !state.unlimitedMode){
		endMentalSession();
		return;
	}
	state.setMentalNextQuestionTimeout(setTimeout(()=>{
		if (state.sessionActive&&!state.sessionPaused){
			state.setTimeLeft(settings.settings.timer);
			ui.updateTimerDisplay();
			generateNextMentalQuestion();
		}
		state.setMentalNextQuestionTimeout(null);
	},settings.settings.autoCheckDelay));
}
export function handleMcqChoice(choice: string): void{
	handleMentalAnswer(choice);
}
export function startMentalSession(): void{
	if (!state.selectedTopic&&!state.mentalShuffle){
		ui.showNotification("Please select a topic or enable shuffle","warning");
		return;
	}
	if (state.mentalShuffle&&!topicsModule.pickRandomTopic()){
		ui.showNotification("No topics available in current scope","warning");
		return;
	}
	if (state.mentalNextQuestionTimeout){
		clearTimeout(state.mentalNextQuestionTimeout);
		state.setMentalNextQuestionTimeout(null);
	}
	state.setUnlimitedMode(dom.unlimitedToggle?.checked??false);
	if (dom.statisticsPanel) dom.statisticsPanel.style.display="flex";
	state.setTotalTimeSpent(0);
	state.setAnsweredQuestionsCount(0);
	state.setCurrentQuestionStartTime(null);
	ui.updateStatistics();
	state.setSessionActive(true);
	state.setSessionPaused(false);
	state.setSessionScore({correct:0,total:0});
	state.setTimeLeft(settings.settings.timer);
	state.setMaxQuestions(settings.settings.maxQuestions);
	ui.updateScoreDisplay();
	ui.updateTimerDisplay();
	if (dom.mentalProgressBar) dom.mentalProgressBar.style.width="0%";
	ui.updateProgressBar();
	if (state.unlimitedMode){
		if (dom.mentalProgressBar) dom.mentalProgressBar.style.display="none";
		if (dom.timerDisplay) dom.timerDisplay.style.display="none";
	}
	else{
		if (dom.mentalProgressBar) dom.mentalProgressBar.style.display="block";
		if (dom.timerDisplay) dom.timerDisplay.style.display="inline-flex";
	}
	startTimer();
	ui.disableTopicSelection(true);
	ui.disableModeButtons(true);
	ui.disableDifficulty(true);
	ui.setSessionButton(true);
	generateNextMentalQuestion();
}
export function pauseMentalSession(): void{
	if (!state.sessionActive) return;
	state.setSessionPaused(!state.sessionPaused);
	if (dom.pauseSessionBtn){
		dom.pauseSessionBtn.innerHTML=state.sessionPaused
			?'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
			:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
		dom.pauseSessionBtn.setAttribute("aria-label",state.sessionPaused?"Resume":"Pause");
	}
	if (dom.userAnswer) dom.userAnswer.disabled=state.sessionPaused;
}
export function skipMentalQuestion(): void{
	if (!state.sessionActive||state.sessionPaused) return;
	if (state.mentalNextQuestionTimeout){
		clearTimeout(state.mentalNextQuestionTimeout);
		state.setMentalNextQuestionTimeout(null);
	}
	if (dom.answerResults){
		dom.answerResults.innerHTML=`<div class="result-info">Skipped</div>`;
		dom.answerResults.className="results-display";
	}
	state.setCurrentQuestionStartTime(null);
	let newTotal=state.sessionScore.total+1;
	state.setSessionScore({correct:state.sessionScore.correct,total:newTotal});
	ui.updateScoreDisplay();
	ui.updateProgressBar();
	if (dom.mentalProgressBar){
		let percent=(newTotal/state.maxQuestions)*100;
		dom.mentalProgressBar.style.width=percent+"%";
	}
	if (newTotal>=state.maxQuestions && !state.unlimitedMode){
		endMentalSession();
		return;
	}
	state.setTimeLeft(settings.settings.timer);
	ui.updateTimerDisplay();
	saveSessionSnapshot();
	state.setMentalNextQuestionTimeout(setTimeout(()=>{
		if (state.sessionActive&&!state.sessionPaused){
			generateNextMentalQuestion();
		}
		state.setMentalNextQuestionTimeout(null);
	},settings.settings.autoCheckDelay));
}
export function stopMentalSession(): void{
	endMentalSession();
}
export async function endMentalSession(): Promise<void>{
	ui.clearAllTimeouts();
	state.setSessionActive(false);
	state.setSessionPaused(false);
	localStorage.removeItem(SESSION_STORAGE_KEY);
	if (dom.mentalProgressBar) dom.mentalProgressBar.style.width="0%";
	ui.updateProgressBar();
	if (dom.statisticsPanel) dom.statisticsPanel.style.display="none";
	ui.disableTopicSelection(false);
	ui.disableModeButtons(false);
	ui.disableDifficulty(false);
	ui.setSessionButton(false);
	if (dom.userAnswer){
		dom.userAnswer.disabled=true;
		dom.userAnswer.value="";
		dom.userAnswer.setAttribute("aria-disabled","true");
	}
	if (dom.checkAnswerButton){
		dom.checkAnswerButton.disabled=true;
		dom.checkAnswerButton.setAttribute("aria-disabled","true");
	}
	if (dom.answerResults){
		dom.answerResults.innerHTML=`<div class="empty-state">...</div>`;
		dom.answerResults.className="results-display";
	}
	if (dom.copyAnswerBtn) dom.copyAnswerBtn.style.display="none";
	if (dom.expectedFormatDiv) dom.expectedFormatDiv.textContent="";
	ui.showNotification(`Session finished! Score: ${state.sessionScore.correct}/${state.sessionScore.total}`,"info");
	await promptSaveScore();
	await updateLeaderboard();
}
export async function promptSaveScore(): Promise<void>{
	try{
		await invoke("save_score",{
			entry:{
				topic:state.selectedTopic,
				score:state.sessionScore.correct,
				total:state.sessionScore.total,
				difficulty:state.currentDifficulty,
				date:new Date().toISOString()
			}
		});
		await updateLeaderboard();
		ui.showNotification("Score saved!","info");
	} catch (err){
		console.error("Failed to save score:",err);
		ui.showNotification("Failed to save score","warning");
	}
}
export async function updateLeaderboard(): Promise<void>{
	if (!dom.leaderboardContent) return;
	try{
		const scores: any[] = await invoke("load_scores");
		if (!scores || scores.length===0){
			dom.leaderboardContent.innerHTML=`<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z"/></svg><p>No scores yet. Complete a mental session to see your results.</p></div>`;
			if (dom.leaderboardCard) dom.leaderboardCard.classList.add("hidden");
			return;
		}
		let recent=scores.slice(-10).reverse();
		let html='<div style="display:flex; flex-direction:column; gap:var(--spacing-xs);">';
		recent.forEach((s: any)=>{
			let topicName=topicList.find(t=>t.id===s.topic)?.name||s.topic;
			html+=`<div class="leaderboard-item"><span>${topicName} (${s.difficulty})</span><span class="leaderboard-score">${s.score}/${s.total}</span></div>`;
		});
		html+='</div>';
		dom.leaderboardContent.innerHTML=html;
		if (dom.leaderboardCard) {
			dom.leaderboardCard.classList.remove("hidden");
			dom.leaderboardCard.style.display="block";
		}
	} catch (err){
		console.error("Failed to load leaderboard:",err);
		dom.leaderboardContent.innerHTML=`<div class="empty-state"><p>Failed to load scores</p></div>`;
	}
}