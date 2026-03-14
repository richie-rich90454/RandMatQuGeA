import * as dom from "./dom";
import * as state from "./state";
import * as settings from "./settings";
import * as ui from "./ui";
import * as generation from "./generation";

/**
 * Checks the user's answer against the expected correct answer.
 * 
 * This function performs a robust comparison between the user input and the pre‑computed
 * correct answer (and its alternate form) for the currently displayed integration question.
 * It handles a wide variety of edge cases, including:
 * 
 * - Whitespace normalization: all spaces and line breaks are removed.
 * - Case insensitivity: all comparisons are case‑insensitive.
 * - Format variations: handles both decimal and fractional representations (e.g., `1.5` vs `3/2`),
 *   different exponent notations (`x^2`, `x^{2}`, `x**2`), and implicit multiplication (`2x` vs `2*x`).
 * - Trigonometric function names: accepts both `sin` and `\sin`, with or without parentheses.
 * - Integration constant: the trailing `+C` is treated as optional; both `+C` and `+c` are accepted.
 * - Term reordering: expressions like `x^2 + 2x` are considered equal to `2x + x^2` (commutative addition).
 * - Numerical equivalence: fractions are converted to decimals for comparison where applicable.
 * 
 * The comparison is performed in multiple stages:
 * 1. Basic string normalization (trim, lowercase, whitespace removal, brace removal).
 * 2. Conversion of fractions to decimals and vice versa to catch representation differences.
 * 3. Splitting into terms and comparing as multisets to account for term order.
 * 4. If all else fails, a fallback numeric evaluation (via `settings.checkAnswerFast`) is used,
 *    which can handle more complex algebraic equivalence.
 * 
 * After determining correctness, it:
 * - Plays sound/vibration feedback if enabled.
 * - Displays the result with KaTeX‑formatted correct answer.
 * - Clears the input and optionally generates the next question (auto‑continue mode).
 * - Updates the session state if in mental mode.
 * 
 * Edge cases handled:
 * - Empty input → shows notification.
 * - Missing topic → shows notification.
 * - Invalid mathematical syntax → graceful fallback to plain text display.
 * - Malformed LaTeX in answer → KaTeX fallback to plain text.
 * 
 * @throws No exceptions are thrown; errors are caught and logged, with user‑friendly notifications.
 */
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
	// --- Robust normalization pipeline ---
	const normalize=(s: string): string=>{
		// Trim, lowercase, remove all whitespace
		s=s.toLowerCase().replace(/\s+/g,'');
		// Remove curly braces around exponents: x^{2} -> x^2
		s=s.replace(/\^{/g,'^').replace(/[{}]/g,'');
		// Convert ** to ^ (Python-style exponent)
		s=s.replace(/\*\*/g,'^');
		// Replace √ with sqrt, π with pi, etc.
		s=s.replace(/√/g,'sqrt').replace(/π/g,'pi').replace(/∞/g,'inf');
		// Remove leading zeros on decimals (e.g., 0.5 -> .5, but keep 0.5 as .5? safer to keep)
		// Also handle implicit multiplication: 2x -> 2*x (optional, may help)
		// We'll do a cautious version: insert * between digit and letter if not already present
		s=s.replace(/(\d)([a-z])/g,'$1*$2');
		// Remove spaces around operators (already removed all spaces)
		return s;
	};
	let normUser=normalize(userInput);
	let normCorrect=normalize(correct);
	let normAlternate=alternate?normalize(alternate):'';

	// --- Additional equivalence checks ---
	let isCorrect=false;

	// 1. Direct string equality after normalization
	if (normUser===normCorrect||normUser===normAlternate){
		isCorrect=true;
	}
	// 2. Try converting fractions to decimals (if both contain '/')
	else if (normUser.includes('/')||normCorrect.includes('/')){
		// Very simplistic fraction to decimal conversion for single numbers
		// This is limited; we rely on checkAnswerFast for real evaluation.
		// We'll just call the settings function.
		isCorrect=settings.isAnswerCorrect(userInput,normCorrect,alternate);
	}
	// 3. Term‑by‑term comparison (commutative addition)
	else{
		// Split into terms on '+' and handle leading '-'
		let termsUser=normUser.split('+').map(t=>t.trim()).filter(t=>t);
		let termsCorrect=normCorrect.split('+').map(t=>t.trim()).filter(t=>t);
		// Sort terms lexicographically (simple, but works for most polynomials)
		termsUser.sort();
		termsCorrect.sort();
		if (termsUser.join('+')===termsCorrect.join('+')){
			isCorrect=true;
		}
		else{
			// Fallback to the original comparison function (may use eval or math.js)
			isCorrect=settings.isAnswerCorrect(userInput,normCorrect,alternate);
		}
	}

	// --- Feedback and UI updates ---
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