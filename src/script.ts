import * as dom from "./main/dom";
import * as settings from "./main/settings";
import {topics,scopeTopics,SESSION_STORAGE_KEY} from "./main/constants";
import {generateSingleQuestion} from "./main/singleQuestionGenerator";
import {generateMentalQuestion} from "./main/mentalQuestionGenerator";
import {invoke} from "@tauri-apps/api/core";
export * from "./main/dom";
window.correctAnswer={correct:""};
window.expectedFormat="";
export let selectedTopic: string|null=null;
export let currentMode: "single"|"mental"="single";
export let sessionActive: boolean=false;
export let sessionPaused: boolean=false;
export let sessionScore={correct:0,total:0};
export let sessionTimer: ReturnType<typeof setInterval>|null=null;
export let timeLeft: number=30;
export let maxQuestions: number=5;
export let currentDifficulty: string="medium";
export let mentalNextQuestionTimeout: ReturnType<typeof setTimeout>|null=null;
export let autocontinue: boolean=false;
export let scope: string="simple";
export let shuffle: boolean=false;
export let mentalScope: string="simple";
export let mentalShuffle: boolean=false;
export let autoTimeout: ReturnType<typeof setTimeout>|null=null;
export let generateDebounceTimeout: ReturnType<typeof setTimeout>|null=null;
export let previewTimeout: ReturnType<typeof setTimeout>|null=null;
export let modeButtons=[dom.modeSingleBtn,dom.modeMentalBtn];
function updateAriaPressed(): void{
	if (dom.modeSingleBtn) dom.modeSingleBtn.setAttribute("aria-pressed",String(currentMode==="single"));
	if (dom.modeMentalBtn) dom.modeMentalBtn.setAttribute("aria-pressed",String(currentMode==="mental"));
}
function updateCheckboxAria(checkbox: HTMLInputElement|null): void{
	if (checkbox) checkbox.setAttribute("aria-checked",String(checkbox.checked));
}
function updateProgressBar(): void{
	if (dom.mentalProgressBar){
		const now=(sessionScore.total/maxQuestions)*100;
		dom.mentalProgressBar.setAttribute("aria-valuenow",String(now));
	}
}
function updateTimerDisplay(): void{
	if (!dom.timerDisplay) return;
	let mins=Math.floor(Math.max(0,timeLeft)/60);
	let secs=Math.max(0,timeLeft)%60;
	dom.timerDisplay.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg> ${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
}
function updateScoreDisplay(): void{
	if (!dom.scoreDisplay) return;
	dom.scoreDisplay.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${sessionScore.correct} / ${sessionScore.total}`;
}
function disableTopicSelection(disabled: boolean): void{
	document.querySelectorAll(".topic-pill").forEach(el=>{
		(el as HTMLButtonElement).disabled=disabled;
		(el as HTMLButtonElement).setAttribute("aria-disabled",String(disabled));
	});
}
function disableModeButtons(disabled: boolean): void{
	modeButtons.forEach(btn=>{
		if (btn){
			btn.disabled=disabled;
			if (disabled) btn.classList.add("disabled");
			else btn.classList.remove("disabled");
			btn.setAttribute("aria-disabled",String(disabled));
		}
	});
}
function disableDifficulty(disabled: boolean): void{
	if (dom.difficultySelect){
		dom.difficultySelect.disabled=disabled;
		dom.difficultySelect.setAttribute("aria-disabled",String(disabled));
	}
}
function setSessionButton(isActive: boolean): void{
	if (!dom.startSessionBtn) return;
	if (isActive){
		dom.startSessionBtn.textContent="Stop Session";
		dom.startSessionBtn.classList.add("stop-session");
		dom.startSessionBtn.removeEventListener("click",startMentalSession);
		dom.startSessionBtn.addEventListener("click",stopMentalSession);
		if (dom.pauseSessionBtn) dom.pauseSessionBtn.style.display="inline-flex";
		if (dom.skipQuestionBtn) dom.skipQuestionBtn.style.display="inline-flex";
	}
    else{
		dom.startSessionBtn.textContent="Start Session";
		dom.startSessionBtn.classList.remove("stop-session");
		dom.startSessionBtn.removeEventListener("click",stopMentalSession);
		dom.startSessionBtn.addEventListener("click",startMentalSession);
		if (dom.pauseSessionBtn) dom.pauseSessionBtn.style.display="none";
		if (dom.skipQuestionBtn) dom.skipQuestionBtn.style.display="none";
	}
}
function updateUIState(): void{
	if (!dom.generateQuestionButton||!dom.checkAnswerButton||!dom.questionArea) return;
	let hasTopic=selectedTopic!==null;
	let hasQuestion=dom.questionArea.innerHTML.includes("mjx-container")||!dom.questionArea.innerHTML.includes("empty-state");
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
}
function showNotification(message: string, type: "info"|"warning" = "info"): void{
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
function renderTopicGrid(): void{
	if (!dom.topicGrid) return;
	const currentScope=currentMode==="single"?scope:mentalScope;
	const allowedIds=scopeTopics[currentScope as keyof typeof scopeTopics]||scopeTopics.simple;
	const filteredTopics=topics.filter(t=>allowedIds.includes(t.id));
	dom.topicGrid.innerHTML="";
	filteredTopics.forEach(topic=>{
		let topicElement=document.createElement("button");
		topicElement.className="topic-pill";
		topicElement.dataset.topicId=topic.id;
		topicElement.innerHTML=`
      <span class="topic-pill-icon">${topic.icon}</span>
      <span class="topic-pill-name">${topic.name}</span>
    `;
		topicElement.addEventListener("click",()=>selectTopic(topic.id));
		dom.topicGrid!.appendChild(topicElement);
	});
	if (selectedTopic&&!allowedIds.includes(selectedTopic)){
		if (filteredTopics.length>0){
			selectTopic(filteredTopics[0].id);
		}
        else{
			selectedTopic=null;
			if (dom.currentTopicDisplay) dom.currentTopicDisplay.textContent="Select a topic";
		}
	}
    else if (!selectedTopic&&filteredTopics.length>0){
		selectTopic(filteredTopics[0].id);
	}
    else if (selectedTopic){
		document.querySelectorAll(".topic-pill").forEach(item=>{
			item.classList.remove("active");
		});
		let selectedElement=document.querySelector(`[data-topic-id="${selectedTopic}"]`);
		if (selectedElement) selectedElement.classList.add("active");
	}
}
function selectTopic(topicId: string): void{
	document.querySelectorAll(".topic-pill").forEach(item=>{
		item.classList.remove("active");
	});
	let selectedElement=document.querySelector(`[data-topic-id="${topicId}"]`);
	if (selectedElement){
		selectedElement.classList.add("active");
	}
	selectedTopic=topicId;
	let topic=topics.find(t=>t.id===topicId);
	if (dom.currentTopicDisplay){
		dom.currentTopicDisplay.textContent=topic?topic.name:"Select a topic to begin";
	}
	if (dom.generateQuestionButton){
		dom.generateQuestionButton.disabled=false;
		dom.generateQuestionButton.setAttribute("aria-disabled","false");
	}
	updateUIState();
}
function pickRandomTopic(): string|null{
	const currentScope=currentMode==="single"?scope:mentalScope;
	const allowedIds=scopeTopics[currentScope as keyof typeof scopeTopics]||scopeTopics.simple;
	if (allowedIds.length===0) return null;
	return allowedIds[Math.floor(Math.random()*allowedIds.length)];
}
function debounceGenerate(): void{
	if (generateDebounceTimeout) clearTimeout(generateDebounceTimeout);
	generateDebounceTimeout=setTimeout(()=>{
		generateQuestion();
		generateDebounceTimeout=null;
	},150);
}
function generateQuestion(): void{
	if (shuffle&&currentMode==="single"){
		const randomTopic=pickRandomTopic();
		if (randomTopic){
			selectTopic(randomTopic);
		}
        else{
			showNotification("No topics available in current scope","warning");
			return;
		}
	}
	if (!selectedTopic){
		showNotification("Please select a topic first","warning");
		return;
	}
	if (!dom.answerResults||!dom.userAnswer||!dom.questionArea||!dom.checkAnswerButton) return;
	if (autoTimeout){
		clearTimeout(autoTimeout);
		autoTimeout=null;
	}
	dom.answerResults.innerHTML=`
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
      </svg>
      <p>Your results will appear here after checking your answer</p>
    </div>
  `;
	dom.answerResults.className="results-display";
	dom.userAnswer.value="";
	if (dom.expectedFormatDiv) dom.expectedFormatDiv.textContent="";
	dom.questionArea.innerHTML=`
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Generating question...</p>
    </div>
  `;
	generateSingleQuestion(selectedTopic,currentDifficulty);
	if (dom.expectedFormatDiv&&window.expectedFormat){
		dom.expectedFormatDiv.textContent="Expected format: "+window.expectedFormat;
	}
	dom.userAnswer.disabled=false;
	dom.userAnswer.removeAttribute("aria-disabled");
	dom.checkAnswerButton.disabled=false;
	dom.checkAnswerButton.setAttribute("aria-disabled","false");
	dom.userAnswer.focus();
	updatePreview();
	updateUIState();
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([dom.questionArea]).catch((err: any)=>console.log("MathJax typeset error:",err));
	}
}
function checkAnswer(): void{
	if (!selectedTopic){
		showNotification("Please select a topic and generate a question first","warning");
		return;
	}
	if (!dom.userAnswer||!dom.answerResults) return;
	let userInput=dom.userAnswer.value.trim();
	if (!userInput){
		showNotification("Please enter an answer before checking","warning");
		return;
	}
	let correct=window.correctAnswer.correct;
	let alternate=window.correctAnswer.alternate;
	let isCorrect=settings.isAnswerCorrect(userInput,correct,alternate);
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
	if (isCorrect){
		dom.answerResults.innerHTML=`
      <div class="result-success">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <div>
          <h3>Correct!</h3>
          <p>The answer is <strong>${window.correctAnswer.correct}</strong></p>
        </div>
      </div>
    `;
		dom.answerResults.className="results-display correct";
		if (dom.copyAnswerBtn) dom.copyAnswerBtn.style.display="inline-flex";
	}
    else{
		dom.answerResults.innerHTML=`
      <div class="result-error">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <div>
          <h3>Incorrect</h3>
          <p>The correct answer is <strong>${window.correctAnswer.correct}</strong></p>
        </div>
      </div>
    `;
		dom.answerResults.className="results-display incorrect";
		if (dom.copyAnswerBtn) dom.copyAnswerBtn.style.display="inline-flex";
	}
	dom.userAnswer.value="";
	updatePreview();
	dom.userAnswer.focus();
	if (currentMode==="single"&&autocontinue){
		if (autoTimeout) clearTimeout(autoTimeout);
		autoTimeout=setTimeout(()=>{
			generateQuestion();
			autoTimeout=null;
		},3000);
	}
}
function saveSessionSnapshot(): void{
	if (!sessionActive) return;
	const snapshot={
		sessionScore,
		timeLeft,
		maxQuestions,
		currentDifficulty,
		mentalShuffle,
		mentalScope,
		selectedTopic,
		timestamp:Date.now()
	};
	localStorage.setItem(SESSION_STORAGE_KEY,JSON.stringify(snapshot));
}
function restoreSessionSnapshot(): void{
	const saved=localStorage.getItem(SESSION_STORAGE_KEY);
	if (!saved) return;
	try{
		const snap=JSON.parse(saved);
		if (Date.now()-snap.timestamp>60*60*1000){
			localStorage.removeItem(SESSION_STORAGE_KEY);
			return;
		}
		sessionActive=true;
		sessionPaused=false;
		sessionScore=snap.sessionScore;
		timeLeft=snap.timeLeft;
		maxQuestions=snap.maxQuestions;
		currentDifficulty=snap.currentDifficulty;
		mentalShuffle=snap.mentalShuffle;
		mentalScope=snap.mentalScope;
		selectedTopic=snap.selectedTopic;
		if (dom.modeMentalBtn) dom.modeMentalBtn.click();
		if (selectedTopic) selectTopic(selectedTopic);
		updateScoreDisplay();
		updateTimerDisplay();
		updateProgressBar();
		startTimer();
		disableTopicSelection(true);
		disableModeButtons(true);
		disableDifficulty(true);
		setSessionButton(true);
		generateNextMentalQuestion();
		localStorage.removeItem(SESSION_STORAGE_KEY);
	} catch (e){
		console.warn("Failed to restore session", e);
	}
}
function startTimer(): void{
	if (sessionTimer) clearInterval(sessionTimer);
	sessionTimer=setInterval(()=>{
		if (!sessionActive||sessionPaused) return;
		timeLeft--;
		updateTimerDisplay();
		saveSessionSnapshot();
		if (timeLeft<=0){
			sessionScore.total++;
			updateScoreDisplay();
			updateProgressBar();
			showNotification("Time is up!","warning");
			if (dom.mentalProgressBar){
				let percent=(sessionScore.total/maxQuestions)*100;
				dom.mentalProgressBar.style.width=percent+"%";
			}
			if (sessionScore.total>=maxQuestions){
				endMentalSession();
				return;
			}
			timeLeft=settings.settings.timer;
			updateTimerDisplay();
			saveSessionSnapshot();
			if (mentalNextQuestionTimeout){
				clearTimeout(mentalNextQuestionTimeout);
				mentalNextQuestionTimeout=null;
			}
			mentalNextQuestionTimeout=setTimeout(()=>{
				if (sessionActive&&!sessionPaused){
					generateNextMentalQuestion();
				}
				mentalNextQuestionTimeout=null;
			},settings.settings.autoCheckDelay);
		}
	},1000);
}
function generateNextMentalQuestion(): void{
	if (!sessionActive||sessionPaused) return;
	if (mentalShuffle){
		const randomTopic=pickRandomTopic();
		if (randomTopic){
			selectedTopic=randomTopic;
			document.querySelectorAll(".topic-pill").forEach(item=>{
				item.classList.remove("active");
			});
			let selectedElement=document.querySelector(`[data-topic-id="${selectedTopic}"]`);
			if (selectedElement) selectedElement.classList.add("active");
			let topic=topics.find(t=>t.id===selectedTopic);
			if (dom.currentTopicDisplay){
				dom.currentTopicDisplay.textContent=topic?topic.name:"Topic";
			}
		}
        else{
			endMentalSession();
			showNotification("No topics available","warning");
			return;
		}
	}
	if (!selectedTopic){
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
	generateMentalQuestion(selectedTopic,currentDifficulty);
	if (dom.expectedFormatDiv&&window.expectedFormat){
		dom.expectedFormatDiv.textContent="Expected format: "+window.expectedFormat;
	}
	dom.userAnswer.disabled=false;
	dom.userAnswer.removeAttribute("aria-disabled");
	dom.userAnswer.focus();
	updatePreview();
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([dom.questionArea]).catch((err: any)=>console.log("MathJax typeset error:",err));
	}
}
async function handleMentalAnswer(): Promise<void>{
	if (!sessionActive||sessionPaused) return;
	if (!dom.userAnswer||!dom.answerResults) return;
	if (mentalNextQuestionTimeout){
		clearTimeout(mentalNextQuestionTimeout);
		mentalNextQuestionTimeout=null;
	}
	let userInput=dom.userAnswer.value.trim();
	if (!userInput){
		showNotification("Please enter an answer","warning");
		return;
	}
	let correct=window.correctAnswer.correct;
	let alternate=window.correctAnswer.alternate;
	let isCorrect=await settings.checkAnswerFast(userInput,correct,alternate);
	if (!sessionActive) return;
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
	if (isCorrect) sessionScore.correct++;
	sessionScore.total++;
	updateScoreDisplay();
	updateProgressBar();
	if (dom.mentalProgressBar){
		let percent=(sessionScore.total/maxQuestions)*100;
		dom.mentalProgressBar.style.width=percent+"%";
	}
	if (dom.answerResults){
		dom.answerResults.innerHTML=isCorrect
			?`<div class="result-success">✅ Correct!</div>`
			:`<div class="result-error">❌ Incorrect. The answer was ${correct}</div>`;
		dom.answerResults.className=isCorrect?"results-display correct":"results-display incorrect";
	}
	if (dom.copyAnswerBtn) dom.copyAnswerBtn.style.display="inline-flex";
	if (dom.userAnswer) dom.userAnswer.value="";
	updatePreview();
	saveSessionSnapshot();
	if (sessionScore.total>=maxQuestions){
		endMentalSession();
		return;
	}
	mentalNextQuestionTimeout=setTimeout(()=>{
		if (sessionActive&&!sessionPaused){
			timeLeft=settings.settings.timer;
			updateTimerDisplay();
			generateNextMentalQuestion();
		}
		mentalNextQuestionTimeout=null;
	},settings.settings.autoCheckDelay);
}
function startMentalSession(): void{
	if (!selectedTopic&&!mentalShuffle){
		showNotification("Please select a topic or enable shuffle","warning");
		return;
	}
	if (mentalShuffle&&!pickRandomTopic()){
		showNotification("No topics available in current scope","warning");
		return;
	}
	if (mentalNextQuestionTimeout){
		clearTimeout(mentalNextQuestionTimeout);
		mentalNextQuestionTimeout=null;
	}
	sessionActive=true;
	sessionPaused=false;
	sessionScore={correct:0,total:0};
	timeLeft=settings.settings.timer;
	maxQuestions=settings.settings.maxQuestions;
	updateScoreDisplay();
	updateTimerDisplay();
	if (dom.mentalProgressBar) dom.mentalProgressBar.style.width="0%";
	updateProgressBar();
	startTimer();
	disableTopicSelection(true);
	disableModeButtons(true);
	disableDifficulty(true);
	setSessionButton(true);
	generateNextMentalQuestion();
}
function pauseMentalSession(): void{
	if (!sessionActive) return;
	sessionPaused=!sessionPaused;
	if (dom.pauseSessionBtn){
		dom.pauseSessionBtn.innerHTML=sessionPaused
			?'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
			:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
		dom.pauseSessionBtn.setAttribute("aria-label",sessionPaused?"Resume":"Pause");
	}
	if (dom.userAnswer) dom.userAnswer.disabled=sessionPaused;
}
function skipMentalQuestion(): void{
	if (!sessionActive||sessionPaused) return;
	if (mentalNextQuestionTimeout){
		clearTimeout(mentalNextQuestionTimeout);
		mentalNextQuestionTimeout=null;
	}
	if (dom.answerResults){
		dom.answerResults.innerHTML=`<div class="result-info">⏩ Skipped</div>`;
		dom.answerResults.className="results-display";
	}
	sessionScore.total++;
	updateScoreDisplay();
	updateProgressBar();
	if (dom.mentalProgressBar){
		let percent=(sessionScore.total/maxQuestions)*100;
		dom.mentalProgressBar.style.width=percent+"%";
	}
	if (sessionScore.total>=maxQuestions){
		endMentalSession();
		return;
	}
	timeLeft=settings.settings.timer;
	updateTimerDisplay();
	saveSessionSnapshot();
	mentalNextQuestionTimeout=setTimeout(()=>{
		if (sessionActive&&!sessionPaused){
			generateNextMentalQuestion();
		}
		mentalNextQuestionTimeout=null;
	},settings.settings.autoCheckDelay);
}
function stopMentalSession(): void{
	endMentalSession();
}
function endMentalSession(): void{
	sessionActive=false;
	sessionPaused=false;
	localStorage.removeItem(SESSION_STORAGE_KEY);
	if (sessionTimer){
		clearInterval(sessionTimer);
		sessionTimer=null;
	}
	if (mentalNextQuestionTimeout){
		clearTimeout(mentalNextQuestionTimeout);
		mentalNextQuestionTimeout=null;
	}
	if (dom.mentalProgressBar) dom.mentalProgressBar.style.width="0%";
	updateProgressBar();
	disableTopicSelection(false);
	disableModeButtons(false);
	disableDifficulty(false);
	setSessionButton(false);
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
	showNotification(`Session finished! Score: ${sessionScore.correct}/${sessionScore.total}`,"info");
	promptSaveScore();
}
function promptSaveScore(): void{
	if (!window.__TAURI__){
		let scores=JSON.parse(localStorage.getItem("leaderboard")||"[]");
		scores.push({
			topic:selectedTopic,
			score:sessionScore.correct,
			total:sessionScore.total,
			difficulty:currentDifficulty,
			date:new Date().toISOString()
		});
		localStorage.setItem("leaderboard",JSON.stringify(scores));
		showNotification("Score saved locally!","info");
	}
    else{
		invoke("save_score",{
			entry:{
				topic:selectedTopic,
				score:sessionScore.correct,
				total:sessionScore.total,
				difficulty:currentDifficulty,
				date:new Date().toISOString()
			}
		}).then(()=>showNotification("Score saved!","info"))
			.catch(_err=>showNotification("Failed to save score","warning"));
	}
}
function updatePreview(): void{
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
		dom.previewDiv.innerHTML=`<span style="color: var(--error);">${errorMessage}</span>`;
		dom.previewDiv.classList.add("has-content");
	}
}
function updatePreviewDebounced(): void{
	if (previewTimeout) clearTimeout(previewTimeout);
	previewTimeout=setTimeout(()=>{
		updatePreview();
		previewTimeout=null;
	},200);
}
function insertSymbol(symbol: string): void{
	if (!dom.userAnswer) return;
	const start=dom.userAnswer.selectionStart;
	const end=dom.userAnswer.selectionEnd;
	const text=dom.userAnswer.value;
	const newText=text.substring(0,start)+symbol+text.substring(end);
	dom.userAnswer.value=newText;
	dom.userAnswer.selectionStart=dom.userAnswer.selectionEnd=start+symbol.length;
	dom.userAnswer.focus();
	updatePreviewDebounced();
}
function copyCorrectAnswer(): void{
	if (!window.correctAnswer.correct) return;
	navigator.clipboard.writeText(window.correctAnswer.correct).then(()=>{
		showNotification("Answer copied to clipboard","info");
	}).catch(()=>{
		showNotification("Failed to copy","warning");
	});
}
function setupEventListeners(): void{
	if (!dom.generateQuestionButton||!dom.checkAnswerButton||!dom.userAnswer||!dom.themeToggle||!dom.helpButton||!dom.settingsButton||!dom.modeSingleBtn||!dom.modeMentalBtn||!dom.mentalControls||!dom.singleControls||!dom.difficultySelect||!dom.timerDisplay||!dom.scoreDisplay||!dom.startSessionBtn) return;
	dom.generateQuestionButton.addEventListener("click",debounceGenerate);
	dom.checkAnswerButton.addEventListener("click",checkAnswer);
	dom.userAnswer.addEventListener("keyup",function (e: KeyboardEvent){
		if (e.shiftKey&&e.key==="Enter"){
			if (currentMode==="single") checkAnswer();
			else if (sessionActive) handleMentalAnswer();
		}
	});
	document.addEventListener("keydown",(e: KeyboardEvent) =>{
		if (e.ctrlKey||e.metaKey){
			switch (e.key){
				case "g": case "G":
					e.preventDefault();
					if (currentMode==="single") debounceGenerate();
					break;
				case "Enter":
					if (e.shiftKey) break;
					e.preventDefault();
					if (currentMode==="single") checkAnswer();
					else if (sessionActive) handleMentalAnswer();
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
		showNotification("Select a topic, generate a question, enter your answer, and check it!","info");
	});
	dom.settingsButton.addEventListener("click",settings.openSettings);
	if (dom.settingsClose) dom.settingsClose.addEventListener("click",settings.closeSettings);
	if (dom.settingsSave) dom.settingsSave.addEventListener("click",()=>{
		settings.saveSettings();
		settings.closeSettings();
	});
	if (dom.settingsReset) dom.settingsReset.addEventListener("click",settings.resetSettings);
	if (dom.settingsModal) dom.settingsModal.addEventListener("click",(e) =>{
		if (e.target===dom.settingsModal) settings.closeSettings();
	});
	if (dom.settingsTheme){
		dom.settingsTheme.addEventListener("change",(e) => settings.previewSetting("theme",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsDefaultMode){
		dom.settingsDefaultMode.addEventListener("change",(e) => settings.previewSetting("defaultMode",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsAutoContinue){
		dom.settingsAutoContinue.addEventListener("change",(e) => settings.previewSetting("autoContinue",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsShuffle){
		dom.settingsShuffle.addEventListener("change",(e) => settings.previewSetting("shuffle",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsScope){
		dom.settingsScope.addEventListener("change",(e) => settings.previewSetting("scope",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsDifficulty){
		dom.settingsDifficulty.addEventListener("change",(e) => settings.previewSetting("difficulty",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsTimer){
		dom.settingsTimer.addEventListener("input",(e) => settings.previewSetting("timer",(e.target as HTMLInputElement).value));
	}
	if (dom.settingsMaxQuestions){
		dom.settingsMaxQuestions.addEventListener("input",(e) => settings.previewSetting("maxQuestions",(e.target as HTMLInputElement).value));
	}
	if (dom.settingsFont){
		dom.settingsFont.addEventListener("change",(e) => settings.previewSetting("font",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsPerfMaster){
		dom.settingsPerfMaster.addEventListener("change",(e) => settings.previewSetting("perfMaster",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsPerfWave){
		dom.settingsPerfWave.addEventListener("change",(e) => settings.previewSetting("perfWave",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsPerfBlur){
		dom.settingsPerfBlur.addEventListener("change",(e) => settings.previewSetting("perfBlur",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsPerfPreview){
		dom.settingsPerfPreview.addEventListener("change",(e) => settings.previewSetting("perfPreview",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsPerfAnimations){
		dom.settingsPerfAnimations.addEventListener("change",(e) => settings.previewSetting("perfAnimations",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsFpsCap){
		dom.settingsFpsCap.addEventListener("change",(e) => settings.previewSetting("fpsCap",(e.target as HTMLSelectElement).value));
	}
	if (dom.settingsNotifications){
		dom.settingsNotifications.addEventListener("change",(e) => settings.previewSetting("notifications",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsAutoCheckDelay){
		dom.settingsAutoCheckDelay.addEventListener("input",(e) => settings.previewSetting("autoCheckDelay",(e.target as HTMLInputElement).value));
	}
	if (dom.settingsDecimalPlaces){
		dom.settingsDecimalPlaces.addEventListener("input",(e) => settings.previewSetting("decimalPlaces",(e.target as HTMLInputElement).value));
	}
	if (dom.settingsSound){
		dom.settingsSound.addEventListener("change",(e) => settings.previewSetting("sound",(e.target as HTMLInputElement).checked));
	}
	if (dom.settingsVibration){
		dom.settingsVibration.addEventListener("change",(e) => settings.previewSetting("vibration",(e.target as HTMLInputElement).checked));
	}
	dom.modeSingleBtn.addEventListener("click",function (){
		if (dom.modeSingleBtn!.classList.contains("disabled")) return;
		dom.modeSingleBtn!.classList.add("active");
		dom.modeMentalBtn!.classList.remove("active");
		currentMode="single";
		dom.mentalControls!.style.display="none";
		dom.singleControls!.style.display="flex";
		if (sessionActive) endMentalSession();
		if (autoTimeout){
			clearTimeout(autoTimeout);
			autoTimeout=null;
		}
		if (dom.mentalScopeSelect) scope=dom.mentalScopeSelect.value;
		if (dom.scopeSelect) dom.scopeSelect.value=scope;
		if (dom.mentalShuffleToggle) shuffle=dom.mentalShuffleToggle.checked;
		if (dom.shuffleToggle) dom.shuffleToggle.checked=shuffle;
		updateAriaPressed();
		renderTopicGrid();
		updateUIState();
	});
	dom.modeMentalBtn.addEventListener("click",function (){
		if (dom.modeMentalBtn!.classList.contains("disabled")) return;
		dom.modeMentalBtn!.classList.add("active");
		dom.modeSingleBtn!.classList.remove("active");
		currentMode="mental";
		dom.mentalControls!.style.display="flex";
		dom.singleControls!.style.display="none";
		if (sessionActive) endMentalSession();
		if (autoTimeout){
			clearTimeout(autoTimeout);
			autoTimeout=null;
		}
		if (dom.scopeSelect) mentalScope=dom.scopeSelect.value;
		if (dom.mentalScopeSelect) dom.mentalScopeSelect.value=mentalScope;
		if (dom.shuffleToggle) mentalShuffle=dom.shuffleToggle.checked;
		if (dom.mentalShuffleToggle) dom.mentalShuffleToggle.checked=mentalShuffle;
		updateAriaPressed();
		renderTopicGrid();
		updateUIState();
	});
	dom.difficultySelect.addEventListener("change",function (e: Event){
		currentDifficulty=(e.target as HTMLSelectElement).value;
	});
	dom.startSessionBtn.addEventListener("click",startMentalSession);
	if (dom.pauseSessionBtn){
		dom.pauseSessionBtn.addEventListener("click",pauseMentalSession);
	}
	if (dom.skipQuestionBtn){
		dom.skipQuestionBtn.addEventListener("click",skipMentalQuestion);
	}
	if (dom.autocontinueToggle){
		dom.autocontinueToggle.addEventListener("change",(e) =>{
			autocontinue=(e.target as HTMLInputElement).checked;
			updateCheckboxAria(dom.autocontinueToggle);
			if (!autocontinue&&autoTimeout){
				clearTimeout(autoTimeout);
				autoTimeout=null;
			}
		});
	}
	if (dom.scopeSelect){
		dom.scopeSelect.addEventListener("change",(e) =>{
			scope=(e.target as HTMLSelectElement).value;
			renderTopicGrid();
			if (autoTimeout){
				clearTimeout(autoTimeout);
				autoTimeout=null;
			}
		});
	}
	if (dom.shuffleToggle){
		dom.shuffleToggle.addEventListener("change",(e) =>{
			shuffle=(e.target as HTMLInputElement).checked;
			updateCheckboxAria(dom.shuffleToggle);
		});
	}
	if (dom.mentalScopeSelect){
		dom.mentalScopeSelect.addEventListener("change",(e) =>{
			mentalScope=(e.target as HTMLSelectElement).value;
			renderTopicGrid();
		});
	}
	if (dom.mentalShuffleToggle){
		dom.mentalShuffleToggle.addEventListener("change",(e) =>{
			mentalShuffle=(e.target as HTMLInputElement).checked;
			updateCheckboxAria(dom.mentalShuffleToggle);
		});
	}
	if (dom.mathToolbar){
		dom.mathToolbar.querySelectorAll(".math-toolbar-btn").forEach(btn=>{
			btn.addEventListener("click",(e) =>{
				const symbol=(e.target as HTMLElement).dataset.symbol||"";
				insertSymbol(symbol);
			});
		});
	}
	if (dom.userAnswer){
		dom.userAnswer.addEventListener("input",updatePreviewDebounced);
	}
	if (dom.copyAnswerBtn){
		dom.copyAnswerBtn.addEventListener("click",copyCorrectAnswer);
	}
	if (dom.userAnswer&&dom.customContextMenu){
		dom.userAnswer.addEventListener("contextmenu",(e) =>{
			e.preventDefault();
			const x=e.clientX;
			const y=e.clientY;
			dom.customContextMenu!.style.display="block";
			dom.customContextMenu!.style.left=x+"px";
			dom.customContextMenu!.style.top=y+"px";
		});
		document.addEventListener("click",() =>{
			if (dom.customContextMenu) dom.customContextMenu.style.display="none";
		});
		dom.customContextMenu.querySelectorAll(".context-menu-item").forEach(item=>{
			item.addEventListener("click",(e) =>{
				const action=(e.target as HTMLElement).dataset.action;
				if (action==="paste"){
					navigator.clipboard.readText().then(text=>{
						if (dom.userAnswer) dom.userAnswer.value=text;
						updatePreviewDebounced();
					});
				} else if (action==="clear"){
					if (dom.userAnswer) dom.userAnswer.value="";
					updatePreviewDebounced();
				}
				if (dom.customContextMenu) dom.customContextMenu.style.display="none";
			});
		});
	}
}
async function initializeTheme(): Promise<void>{
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
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",(e) =>{
			if (settings.settings.theme==="system"){
				settings.applyTheme(e.matches?"dark":"light");
			}
		});
	} else{
		settings.applyTheme(settings.settings.theme as "light"|"dark");
	}
}
function initApp(): void{
	settings.loadSettings();
	setupEventListeners();
	initializeTheme();
	updateUIState();
	restoreSessionSnapshot();
	renderTopicGrid();
}
if (document.readyState==="loading"){
	document.addEventListener("DOMContentLoaded",initApp);
}
else{
	initApp();
}