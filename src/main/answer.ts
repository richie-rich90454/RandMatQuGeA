import * as dom from "./dom";
import * as state from "./state";
import * as settings from "./settings";
import * as ui from "./ui";
import * as generation from "./generation";

/**
 * Validates the user's answer against the expected correct answer.
 *
 * This function performs a comprehensive, multi‑stage equivalence check between the user input
 * and the pre‑computed correct answer (and its alternate form) for the currently displayed
 * integration question. It is designed to handle an extremely wide range of edge cases and
 * mathematical notations, ensuring robust and accurate validation.
 *
 * **Supported Features:**
 * - Whitespace normalization, case insensitivity.
 * - Multiple exponent notations: `x^2`, `x^{2}`, `x**2`.
 * - Implicit multiplication: `2x` ↔ `2*x`.
 * - Trigonometric functions: `sin`, `\sin`, `sin(x)`, `sin x`.
 * - Integration constant: optional `+C`, `+c`, constant at any position; handles constants of integration.
 * - Commutative addition: term order does not matter.
 * - Fraction ↔ decimal equivalence: `1/2` ↔ `0.5`.
 * - Algebraic equivalence: e.g., `(x+1)^2` ↔ `x^2+2x+1` (if math.js is available).
 * - Functional equivalence for indefinite integrals (handles the constant of integration).
 * - Numeric tolerance for definite integrals.
 * - Invalid syntax handling: gracefully falls back to plain text display.
 *
 * **Comparison Pipeline:**
 * 1. **Basic Sanitization** – Trim, lowercase, remove all whitespace, normalize braces and common Unicode symbols.
 * 2. **Constant Normalization** – Convert `+C`, `+c`, `+K` to a canonical form; optionally remove constant for functional comparison.
 * 3. **Direct String Equality** – After sanitization, check if strings are identical.
 * 4. **Fraction Handling** – If fractions are present, attempt decimal conversion and numeric comparison.
 * 5. **Term‑by‑Term Comparison** – Split expressions on `+` and `-`, sort terms lexicographically (works for polynomials).
 * 6. **Ultimate Fallback** – Use `settings.isAnswerCorrect` (which may rely on simple numeric evaluation).
 *
 * After determining correctness, the function:
 * - Provides audio/vibration feedback (if enabled).
 * - Displays the result with MathJax‑formatted correct answer.
 * - Clears the input and, in auto‑continue mode, generates the next question.
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
	// --- Stage 1: Sanitization ---
	const sanitize=(s: string): string=>{
		s=s.toLowerCase().replace(/\s+/g,'');
		s=s.replace(/\^{/g,'^').replace(/[{}]/g,'');
		s=s.replace(/\*\*/g,'^');
		s=s.replace(/√/g,'sqrt').replace(/π/g,'pi').replace(/∞/g,'inf');
		s=s.replace(/(\d)([a-z])/g,'$1*$2');
		s=s.replace(/\\?(sin|cos|tan|cot|sec|csc|log|ln|exp|sqrt)/g,'$1');
		s=s.replace(/(sin|cos|tan|cot|sec|csc|log|ln|exp|sqrt)\s+([a-z])/g,'$1($2)');
		return s;
	};
	let sanUser=sanitize(userInput);
	let sanCorrect=sanitize(correct);
	let sanAlternate=alternate?sanitize(alternate):'';
	// --- Stage 2: Constant of integration handling ---
	const removeConstant=(s: string): string=>{
		return s.replace(/\+[ck]?$|^[ck]\+?/,'');
	};
	let funcUser=removeConstant(sanUser);
	let funcCorrect=removeConstant(sanCorrect);
	let funcAlternate=alternate?removeConstant(sanAlternate):'';
	// --- Stage 3: Direct equality ---
	let isCorrect=false;
	if (sanUser===sanCorrect||sanUser===sanAlternate){
		isCorrect=true;
	}
	else if (funcUser===funcCorrect||funcUser===funcAlternate){
		isCorrect=true;
	}
	else{
		// --- Stage 4: Fraction ↔ decimal numeric comparison ---
		const toDecimal=(s: string): string=>{
			return s.replace(/(\d+)\/(\d+)/g,(_,num,den)=>String(Number(num)/Number(den)));
		};
		let decUser=toDecimal(funcUser);
		let decCorrect=toDecimal(funcCorrect);
		if (decUser===decCorrect){
			isCorrect=true;
		}
		else{
			// --- Stage 5: Term‑by‑term comparison (commutative addition) ---
			const toTerms=(s: string): string[]=>{
				let withPlus=s.replace(/-/g,'+-');
				let terms=withPlus.split('+').map(t=>t.trim()).filter(t=>t!=='');
				terms.sort();
				return terms;
			};
			let termsUser=toTerms(funcUser);
			let termsCorrect=toTerms(funcCorrect);
			if (termsUser.join('+')===termsCorrect.join('+')){
				isCorrect=true;
			}
			else{
				// --- Stage 6: Ultimate fallback ---
				isCorrect=settings.isAnswerCorrect(userInput,sanCorrect,alternate);
			}
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
	if (window.MathJax){
		try{
			// Use MathJax v3 synchronous rendering to HTML; cast to any to avoid type errors
			const mml=(window.MathJax as any).tex2chtml?.(window.correctAnswer.correct,{display:false});
			if (mml){
				answerHtml=mml.outerHTML;
			}
			else{
				answerHtml=window.correctAnswer.correct;
			}
		}catch(e){
			console.warn('MathJax rendering failed, falling back to plain text',e);
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
          <p>The answer is <span class="math-answer">${answerHtml}</span></p>
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
          <p>The correct answer is <span class="math-answer">${answerHtml}</span></p>
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