import * as dom from "./dom";
import * as state from "./state";
import * as settings from "./settings";
import * as ui from "./ui";
import * as generation from "./generation";

export function checkAnswer(): void{
	if (!state.selectedTopic){
		ui.showNotification("Please select a topic and generate a question first","warning");
		return;
	}
	if (!dom.userAnswer||!dom.answerResults) return;
	let userInput=dom.userAnswer.value.trim();
	if (!userInput){
		ui.showNotification("Please enter an answer before checking","warning");
		return;
	}
	let correct=window.correctAnswer.correct;
	let alternate=window.correctAnswer.alternate;
	let normalizedCorrect=correct.replace(/\s+/g,'').toLowerCase();
	let isCorrect=settings.isAnswerCorrect(userInput,normalizedCorrect,alternate);
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
	if (isCorrect){
		dom.answerResults.innerHTML=`
      <div class="result-success">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <div>
          <h3>Correct!</h3>
          <p>The answer is <span class="katex-answer">${answerHtml}</span></p>
        </div>
      </div>
    `;
		dom.answerResults.className="results-display correct";
		if (dom.copyAnswerBtn) dom.copyAnswerBtn.style.display="inline-flex";
		dom.answerResults.classList.add("correct-flash");
		setTimeout(()=>dom.answerResults?.classList.remove("correct-flash"),300);
	}
	else{
		dom.answerResults.innerHTML=`
      <div class="result-error">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <div>
          <h3>Incorrect</h3>
          <p>The correct answer is <span class="katex-answer">${answerHtml}</span></p>
        </div>
      </div>
    `;
		dom.answerResults.className="results-display incorrect";
		if (dom.copyAnswerBtn) dom.copyAnswerBtn.style.display="inline-flex";
		dom.answerResults.classList.add("incorrect-flash");
		setTimeout(()=>dom.answerResults?.classList.remove("incorrect-flash"),300);
	}
	dom.userAnswer.value="";
	ui.updatePreview();
	dom.userAnswer.focus();
	if (state.currentMode==="single"&&state.autocontinue){
		if (state.autoTimeout) clearTimeout(state.autoTimeout);
		state.setAutoTimeout(setTimeout(()=>{
			generation.generateQuestion();
			state.setAutoTimeout(null);
		},settings.settings.autoCheckDelay));
	}
}