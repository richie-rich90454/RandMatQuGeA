import * as dom from "./dom";
import * as state from "./state";
import * as ui from "./ui";
import * as topics from "./topics";
import {generateQuestion as callGenerator} from "./questionGenerator";
import {generateChoicesForCurrentQuestion} from "./mcq";

export function debounceGenerate(): void{
	if (state.generateDebounceTimeout) clearTimeout(state.generateDebounceTimeout);
	state.setGenerateDebounceTimeout(setTimeout(()=>{
		generateQuestion();
		state.setGenerateDebounceTimeout(null);
	},150));
}
export function generateQuestion(): void{
	if (state.shuffle&&state.currentMode==="single"){
		const randomTopic=topics.pickRandomTopic();
		if (randomTopic){
			topics.selectTopic(randomTopic);
		}
		else{
			ui.showNotification("No topics available in current scope","warning");
			return;
		}
	}
	if (!state.selectedTopic){
		ui.showNotification("Please select a topic first","warning");
		return;
	}
	if (!dom.answerResults||!dom.userAnswer||!dom.questionArea||!dom.checkAnswerButton) return;
	if (state.autoTimeout){
		clearTimeout(state.autoTimeout);
		state.setAutoTimeout(null);
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
	try {
		callGenerator(state.selectedTopic,state.currentDifficulty);
		window.hasQuestion=true;
		if (state.mcqMode){
			generateChoicesForCurrentQuestion();
		}
	} catch (error) {
		console.error("Question generation failed:", error);
		dom.questionArea.innerHTML=`
			<div class="empty-state" style="color: var(--error);">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
				</svg>
				<p>Failed to generate question. Please try again.</p>
			</div>
		`;
		window.hasQuestion=false;
		ui.updateUIState();
		return;
	}
	if (dom.expectedFormatDiv&&window.expectedFormat){
		dom.expectedFormatDiv.textContent="Expected format: "+window.expectedFormat;
	}
	dom.userAnswer.disabled=false;
	dom.userAnswer.removeAttribute("aria-disabled");
	dom.checkAnswerButton.disabled=false;
	dom.checkAnswerButton.setAttribute("aria-disabled","false");
	dom.userAnswer.focus();
	ui.updatePreview();
	ui.updateUIState();
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([dom.questionArea]).catch((err: any)=>console.log("MathJax typeset error:",err));
	}
}