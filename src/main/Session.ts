import * as settings from"./settings";
import * as ui from"./ui";
import * as topicsModule from"./topics";
import{topics as topicList,scopeTopics,SESSION_STORAGE_KEY}from"./constants";
import{generateQuestion as callGenerator}from"./questionGenerator";
import{invoke}from"@tauri-apps/api/core";
import{generateChoicesForCurrentQuestion}from"./mcq";
import{getAudioContext}from"./answer";
import{appState}from"./core/stateStore";
import{dom}from"./core/domRegistry";
import{questionState}from"./core/questionState";
import{renderer}from"./core/questionRenderer";
let _previousDeleteHandler: ((e: Event)=>void)|null=null;
export function saveSessionSnapshot(): void{
    if(!appState.sessionActive)return;
    let snapshot={
        sessionScore:appState.sessionScore,
        timeLeft:appState.timeLeft,
        maxQuestions:appState.maxQuestions,
        currentDifficulty:appState.currentDifficulty,
        mentalShuffle:appState.mentalShuffle,
        mentalScope:appState.mentalScope,
        selectedTopic:appState.selectedTopic,
        timestamp:Date.now()
    };
    localStorage.setItem(SESSION_STORAGE_KEY,JSON.stringify(snapshot));
}
export function restoreSessionSnapshot(): void{
    let saved=localStorage.getItem(SESSION_STORAGE_KEY);
    if(!saved)return;
    try{
        let snap=JSON.parse(saved);
        if(Date.now()-snap.timestamp>60*60*1000){
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return;
        }
        appState.mentalShuffle=snap.mentalShuffle;
        appState.mentalScope=snap.mentalScope;
        appState.currentDifficulty=snap.currentDifficulty;
        let restoredScope: string=snap.mentalScope;
        let allowedIds: string[]=scopeTopics[restoredScope as keyof typeof scopeTopics]||scopeTopics.simple;
        if(typeof snap.selectedTopic==="string"&&allowedIds.includes(snap.selectedTopic)){
            appState.selectedTopic=snap.selectedTopic;
        }
        else{
            appState.selectedTopic=null;
        }
        appState.maxQuestions=snap.maxQuestions;
        appState.sessionScore=snap.sessionScore;
        appState.timeLeft=snap.timeLeft;
        if(dom.buttons.modeMentalBtn)dom.buttons.modeMentalBtn.click();
        appState.sessionActive=true;
        appState.sessionPaused=false;
        ui.updateScoreDisplay();
        ui.updateTimerDisplay();
        ui.updateProgressBar();
        startTimer();
        ui.disableTopicSelection(true);
        ui.disableModeButtons(true);
        ui.disableDifficulty(true);
        ui.setSessionButton(true);
        generateNextMentalQuestion().catch((err:unknown)=>console.error("generateNextMentalQuestion failed:",err));
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    catch(e){
        console.warn("Failed to restore session",e);
    }
}
export function startTimer(): void{
    if(appState.unlimitedMode)return;
    if(appState.sessionTimer)clearInterval(appState.sessionTimer);
    let saveTimer: ReturnType<typeof setTimeout>|null=null;
    function debouncedSave(): void{
        if(saveTimer)clearTimeout(saveTimer);
        saveTimer=setTimeout(()=>{
            saveSessionSnapshot();
            saveTimer=null;
        },5000);
    }
    appState.sessionTimer=setInterval(()=>{
        if(!appState.sessionActive||appState.sessionPaused)return;
        appState.timeLeft=appState.timeLeft-1;
        requestAnimationFrame(()=>{
            ui.updateTimerDisplay();
        });
        debouncedSave();
        if(appState.timeLeft<=0){
            if(appState.answering){
                appState.timeLeft=settings.settings.timer;
                requestAnimationFrame(()=>{
                    ui.updateTimerDisplay();
                });
                return;
            }
            appState.sessionScore={correct:appState.sessionScore.correct,total:appState.sessionScore.total+1};
            requestAnimationFrame(()=>{
                ui.updateScoreDisplay();
                ui.updateProgressBar();
                ui.updateStatistics();
            });
            ui.showNotification("Time is up!","warning");
            if(dom.displays.mentalProgressBar){
                let percent=(appState.sessionScore.total/appState.maxQuestions)*100;
                dom.displays.mentalProgressBar.style.width=percent+"%";
            }
            if(appState.sessionScore.total>=appState.maxQuestions&&!appState.unlimitedMode){
                endMentalSession().catch((err:unknown)=>console.error("endMentalSession failed:",err));
                return;
            }
            appState.timeLeft=settings.settings.timer;
            requestAnimationFrame(()=>{
                ui.updateTimerDisplay();
            });
            saveSessionSnapshot();
            if(appState.mentalNextQuestionTimeout){
                clearTimeout(appState.mentalNextQuestionTimeout);
                appState.mentalNextQuestionTimeout=null;
            }
            appState.mentalNextQuestionTimeout=setTimeout(()=>{
                if(appState.sessionActive&&!appState.sessionPaused){
                    generateNextMentalQuestion().catch((err:unknown)=>console.error("generateNextMentalQuestion failed:",err));
                }
                appState.mentalNextQuestionTimeout=null;
            },settings.settings.autoCheckDelay);
        }
    },1000);
}
export async function generateNextMentalQuestion(): Promise<void>{
    if(!appState.sessionActive||appState.sessionPaused)return;
    if(appState.isGenerating)return;
    appState.isGenerating=true;
    try{
    if(appState.mentalShuffle){
        let randomTopic=topicsModule.pickRandomTopic();
        if(randomTopic){
            appState.selectedTopic=randomTopic;
            document.querySelectorAll(".topic-pill").forEach(item=>{
                item.classList.remove("active");
            });
            let selectedElement=document.querySelector('[data-topic-id="' + appState.selectedTopic + '"]');
            if(selectedElement)selectedElement.classList.add("active");
            let topic=topicList.find(t=>t.id===appState.selectedTopic);
            if(dom.displays.currentTopicDisplay){
                dom.displays.currentTopicDisplay.textContent=topic?topic.name:"Topic";
            }
        }
        else{
            endMentalSession();
            ui.showNotification("No topics available","warning");
            return;
        }
    }
    if(!appState.selectedTopic){
        endMentalSession();
        return;
    }
    if(!dom.displays.questionArea||!dom.inputs.userAnswer||!dom.buttons.checkAnswerButton)return;
    if(dom.displays.answerResults){
        dom.displays.answerResults.innerHTML='<div class="empty-state">...</div>';
    }
    if(dom.buttons.copyAnswerBtn)dom.buttons.copyAnswerBtn.classList.add("hidden");
    questionState.correctAnswer={correct:"",alternate:"",display:""};
    questionState.expectedFormat="";
    questionState.hasQuestion=false;
    dom.buttons.checkAnswerButton.disabled=true;
    dom.inputs.userAnswer.disabled=true;
    dom.displays.questionArea.innerHTML=`\n    <div class="loading-state">\n      <div class="spinner"></div>\n      <p>Generating...</p>\n    </div>\n  `;
    try{
        await callGenerator(appState.selectedTopic,appState.currentDifficulty);
        if(!questionState.correctAnswer.correct){
            dom.displays.questionArea.innerHTML='<div class="empty-state">Could not generate question. Please try another topic.</div>';
            questionState.hasQuestion=false;
            endMentalSession();
            return;
        }
        questionState.hasQuestion=true;
        ui.updateUIState();
        appState.currentQuestionStartTime=Date.now();
        if(appState.mcqMode){
            await generateChoicesForCurrentQuestion();
            if(dom.inputs.userAnswer)dom.inputs.userAnswer.classList.add("hidden");
            if(dom.displays.mathToolbar)dom.displays.mathToolbar.classList.add("hidden");
            if(dom.displays.mcqChoicesContainer)dom.displays.mcqChoicesContainer.classList.remove("hidden");
        }
        else{
            if(dom.inputs.userAnswer)dom.inputs.userAnswer.classList.remove("hidden");
            if(dom.displays.mathToolbar)dom.displays.mathToolbar.classList.remove("hidden");
            if(dom.displays.mcqChoicesContainer)dom.displays.mcqChoicesContainer.classList.add("hidden");
        }
    }
    catch(error){
        console.error("Mental question generation failed:",error);
        dom.displays.questionArea.innerHTML='<div class="empty-state">Generation failed</div>';
        questionState.hasQuestion=false;
        endMentalSession();
        return;
    }
    if(dom.displays.expectedFormatDiv&&questionState.expectedFormat){
        dom.displays.expectedFormatDiv.textContent="Expected format: "+questionState.expectedFormat;
    }
    dom.inputs.userAnswer.disabled=false;
    dom.inputs.userAnswer.removeAttribute("aria-disabled");
    dom.inputs.userAnswer.focus();
    ui.updatePreview();
    renderer.typeset();
    }
    finally{
        appState.isGenerating=false;
    }
}
export async function handleMentalAnswer(answer?: string): Promise<void>{
    if(!appState.sessionActive||appState.sessionPaused)return;
    if(!dom.inputs.userAnswer||!dom.displays.answerResults)return;
    if(!questionState.hasQuestion)return;
    appState.answering=true;
    try{
    if(dom.buttons.checkAnswerButton) dom.buttons.checkAnswerButton.disabled=true;
    if(appState.mentalNextQuestionTimeout){
        clearTimeout(appState.mentalNextQuestionTimeout);
        appState.mentalNextQuestionTimeout=null;
    }
    let userInput=answer;
    if(userInput===undefined){
        userInput=dom.inputs.userAnswer.value.trim();
        if(!userInput){
            ui.showNotification("Please enter an answer","warning");
            if(dom.buttons.checkAnswerButton) dom.buttons.checkAnswerButton.disabled=false;
            return;
        }
    }
    let correct=questionState.correctAnswer.correct;
    let alternate=questionState.correctAnswer.alternate;
    let isCorrect=await settings.checkAnswerFast(userInput,correct,alternate);
    if(!appState.sessionActive)return;
    if(settings.settings.sound){
        let audioCtx=getAudioContext();
        let oscillator=audioCtx.createOscillator();
        let gainNode=audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value=isCorrect?880:440;
        gainNode.gain.setValueAtTime(0.1,audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime+0.1);
    }
    if(settings.settings.vibration&&navigator.vibrate){
        navigator.vibrate(isCorrect?50:100);
    }
    if(appState.currentQuestionStartTime){
        let elapsed=Date.now()-appState.currentQuestionStartTime;
        appState.totalTimeSpent=appState.totalTimeSpent+elapsed;
        appState.answeredQuestionsCount=appState.answeredQuestionsCount+1;
        ui.updateStatistics();
        appState.currentQuestionStartTime=null;
    }
    let newCorrect=appState.sessionScore.correct+(isCorrect?1:0);
    let newTotal=appState.sessionScore.total+1;
    appState.sessionScore={correct:newCorrect,total:newTotal};
    ui.updateScoreDisplay();
    ui.updateProgressBar();
    if(dom.displays.mentalProgressBar){
        let percent=(newTotal/appState.maxQuestions)*100;
        dom.displays.mentalProgressBar.style.width=percent+"%";
    }
    let answerHtml="";
    if(window.katex){
        try{
            answerHtml=window.katex.renderToString(questionState.correctAnswer.correct,{throwOnError:false,displayMode:false});
        }
        catch(e){
            console.warn("KaTeX rendering failed, falling back to plain text",e);
            answerHtml=questionState.correctAnswer.correct;
        }
    }
    else{
        answerHtml=questionState.correctAnswer.correct;
    }
    if(dom.displays.answerResults){
        dom.displays.answerResults.innerHTML=isCorrect
            ?'<div class="result-success">Correct! <span class="katex-answer">' + answerHtml + '</span></div>'
            :'<div class="result-error">Incorrect. The answer was <span class="katex-answer">' + answerHtml + '</span></div>';
        dom.displays.answerResults.className=isCorrect?"results-display correct":"results-display incorrect";
        dom.displays.answerResults.classList.add(isCorrect?"correct-flash":"incorrect-flash");
        setTimeout(()=>dom.displays.answerResults?.classList.remove(isCorrect?"correct-flash":"incorrect-flash"),300);
    }
    if(dom.buttons.copyAnswerBtn){dom.buttons.copyAnswerBtn.classList.remove("hidden");dom.buttons.copyAnswerBtn.style.display="";}
    if(dom.inputs.userAnswer)dom.inputs.userAnswer.value="";
    ui.updatePreview();
    saveSessionSnapshot();
    if(newTotal>=appState.maxQuestions&&!appState.unlimitedMode){
        endMentalSession();
        return;
    }
    appState.timeLeft=settings.settings.timer;
    ui.updateTimerDisplay();
    appState.mentalNextQuestionTimeout=setTimeout(()=>{
        if(appState.sessionActive&&!appState.sessionPaused){
            generateNextMentalQuestion().catch((err:unknown)=>console.error("generateNextMentalQuestion failed:",err));
        }
        appState.mentalNextQuestionTimeout=null;
    },settings.settings.autoCheckDelay);
    }
    finally{
        appState.answering=false;
    }
}
export async function handleMcqChoice(choice: string): Promise<void>{
    await handleMentalAnswer(choice);
}
export function startMentalSession(): void{
    if(!appState.selectedTopic&&!appState.mentalShuffle){
        ui.showNotification("Please select a topic or enable shuffle","warning");
        return;
    }
    if(appState.mentalShuffle&&!topicsModule.pickRandomTopic()){
        ui.showNotification("No topics available in current scope","warning");
        return;
    }
    if(appState.mentalNextQuestionTimeout){
        clearTimeout(appState.mentalNextQuestionTimeout);
        appState.mentalNextQuestionTimeout=null;
    }
    appState.unlimitedMode=dom.inputs.unlimitedToggle?.checked??false;
    if(dom.displays.statisticsPanel)dom.displays.statisticsPanel.classList.remove("hidden");
    appState.totalTimeSpent=0;
    appState.answeredQuestionsCount=0;
    appState.currentQuestionStartTime=null;
    ui.updateStatistics();
    appState.sessionActive=true;
    appState.sessionPaused=false;
    appState.sessionScore={correct:0,total:0};
    appState.timeLeft=settings.settings.timer;
    appState.maxQuestions=settings.settings.maxQuestions;
    ui.updateScoreDisplay();
    ui.updateTimerDisplay();
    if(dom.displays.mentalProgressBar)dom.displays.mentalProgressBar.style.width="0%";
    ui.updateProgressBar();
    if(appState.unlimitedMode){
        if(dom.displays.mentalProgressBar)dom.displays.mentalProgressBar.classList.add("hidden");
        if(dom.displays.timerDisplay)dom.displays.timerDisplay.classList.add("hidden");
    }
    else{
        if(dom.displays.mentalProgressBar)dom.displays.mentalProgressBar.classList.remove("hidden");
        if(dom.displays.timerDisplay)dom.displays.timerDisplay.classList.remove("hidden");
    }
    startTimer();
    ui.disableTopicSelection(true);
    ui.disableModeButtons(true);
    ui.disableDifficulty(true);
    ui.setSessionButton(true);
    generateNextMentalQuestion().catch((err:unknown)=>console.error("generateNextMentalQuestion failed:",err));
}
export function pauseMentalSession(): void{
    if(!appState.sessionActive)return;
    appState.sessionPaused=!appState.sessionPaused;
    if(dom.buttons.pauseSessionBtn){
        dom.buttons.pauseSessionBtn.innerHTML=appState.sessionPaused
            ?'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
            :'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        dom.buttons.pauseSessionBtn.setAttribute("aria-label",appState.sessionPaused?"Resume":"Pause");
    }
    if(dom.inputs.userAnswer)dom.inputs.userAnswer.disabled=appState.sessionPaused;
}
export function skipMentalQuestion(): void{
    if(!questionState.hasQuestion)return;
    if(!appState.sessionActive||appState.sessionPaused)return;
    if(appState.mentalNextQuestionTimeout){
        clearTimeout(appState.mentalNextQuestionTimeout);
        appState.mentalNextQuestionTimeout=null;
    }
    if(dom.displays.answerResults){
        dom.displays.answerResults.innerHTML='<div class="result-info">Skipped</div>';
        dom.displays.answerResults.className="results-display";
    }
    appState.currentQuestionStartTime=null;
    let newTotal=appState.sessionScore.total+1;
    appState.sessionScore={correct:appState.sessionScore.correct,total:newTotal};
    ui.updateScoreDisplay();
    ui.updateProgressBar();
    if(dom.displays.mentalProgressBar){
        let percent=(newTotal/appState.maxQuestions)*100;
        dom.displays.mentalProgressBar.style.width=percent+"%";
    }
    if(newTotal>=appState.maxQuestions&&!appState.unlimitedMode){
        endMentalSession().catch((err:unknown)=>console.error("endMentalSession failed:",err));
        return;
    }
    appState.timeLeft=settings.settings.timer;
    ui.updateTimerDisplay();
    saveSessionSnapshot();
    appState.mentalNextQuestionTimeout=setTimeout(()=>{
        if(appState.sessionActive&&!appState.sessionPaused){
            generateNextMentalQuestion().catch((err:unknown)=>console.error("generateNextMentalQuestion failed:",err));
        }
        appState.mentalNextQuestionTimeout=null;
    },settings.settings.autoCheckDelay);
}
export function stopMentalSession(): void{
    endMentalSession().catch((err:unknown)=>console.error("endMentalSession failed:",err));
}
export async function endMentalSession(): Promise<void>{
    if(!appState.sessionActive)return;
    ui.clearAllTimeouts();
    appState.sessionActive=false;
    appState.sessionPaused=false;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    if(dom.displays.mentalProgressBar)dom.displays.mentalProgressBar.style.width="0%";
    ui.updateProgressBar();
    if(dom.displays.statisticsPanel)dom.displays.statisticsPanel.classList.add("hidden");
    ui.disableTopicSelection(false);
    ui.disableModeButtons(false);
    ui.disableDifficulty(false);
    ui.setSessionButton(false);
    if(dom.inputs.userAnswer){
        dom.inputs.userAnswer.disabled=true;
        dom.inputs.userAnswer.value="";
        dom.inputs.userAnswer.setAttribute("aria-disabled","true");
    }
    if(dom.buttons.checkAnswerButton){
        dom.buttons.checkAnswerButton.disabled=true;
        dom.buttons.checkAnswerButton.setAttribute("aria-disabled","true");
    }
    if(dom.displays.answerResults){
        dom.displays.answerResults.innerHTML='<div class="empty-state">...</div>';
        dom.displays.answerResults.className="results-display";
    }
    if(dom.buttons.copyAnswerBtn)dom.buttons.copyAnswerBtn.classList.add("hidden");
    if(dom.displays.expectedFormatDiv)dom.displays.expectedFormatDiv.textContent="";
    ui.showNotification('Session finished! Score: ' + appState.sessionScore.correct + '/' + appState.sessionScore.total,'info');
    await promptSaveScore();
    await updateLeaderboard();
}
export async function promptSaveScore(): Promise<void>{
    if(!appState.selectedTopic){
        ui.showNotification("No topic selected. Score not saved.","warning");
        return;
    }
    try{
        await invoke("save_score",{
            entry:{
                topic:appState.selectedTopic,
                score:appState.sessionScore.correct,
                total:appState.sessionScore.total,
                difficulty:appState.currentDifficulty,
                date:new Date().toISOString()
            }
        });
        ui.showNotification("Score saved!","info");
        await updateLeaderboard();
    }
    catch(err){
        console.error("Save score error details:",err);
        let errorMsg="Failed to save score";
        if(typeof err==="string") errorMsg = err;
        else if(err && typeof err==="object" && "message" in err) errorMsg = (err as any).message;
        ui.showNotification(errorMsg,"warning");
    }
}
export async function updateLeaderboard(): Promise<void>{
    if(!dom.displays.leaderboardContent)return;
    try{
        let scores: any[] = await invoke("load_scores");
        if(!scores||scores.length===0){
            dom.displays.leaderboardContent.innerHTML='<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z"/></svg><p>No scores yet. Complete a mental session to see your results.</p></div>';
            if(dom.session.leaderboardCard)dom.session.leaderboardCard.classList.add("hidden");
            return;
        }
        let recent=scores.slice(0,10);
        let html='<div style="display:flex; flex-direction:column; gap:var(--spacing-xs);">';
        for(const s of recent){
            let topicName=topicList.find(t=>t.id===s.topic)?.name||s.topic;
            html+='<div class="leaderboard-item" data-id="' + s.id + '"><span>' + topicName + ' (' + s.difficulty + ')</span><div style="display:flex; gap:8px; align-items:center;"><span class="leaderboard-score">' + s.score + '/' + s.total + '</span><button class="icon-button delete-score-btn" data-id="' + s.id + '" style="width:20px; height:20px;">✕</button></div></div>';
        }
        html+='</div>';
        dom.displays.leaderboardContent.innerHTML=html;
        let deleteHandler=async (e: Event)=>{
            let target=e.target as HTMLElement;
            if(!target.classList.contains("delete-score-btn")) return;
            e.stopPropagation();
            let id=parseInt(target.getAttribute("data-id")||"0");
            if(id && confirm("Delete this score entry?")){
                try{
                    await invoke("delete_score",{id});
                    ui.showNotification("Score deleted","info");
                    await updateLeaderboard();
                }
                catch(err){
                    console.error("Delete failed:",err);
                    ui.showNotification("Failed to delete score","warning");
                }
            }
        };
        if(_previousDeleteHandler) dom.displays.leaderboardContent.removeEventListener("click",_previousDeleteHandler);
        _previousDeleteHandler=deleteHandler;
        dom.displays.leaderboardContent.addEventListener("click",deleteHandler);
        if(dom.session.leaderboardCard){
            dom.session.leaderboardCard.classList.remove("hidden");
            dom.session.leaderboardCard.style.display="block";
        }
    }
    catch(err){
        console.error("Failed to load leaderboard:",err);
        dom.displays.leaderboardContent.innerHTML='<div class="empty-state"><p>Failed to load scores</p></div>';
    }
}
