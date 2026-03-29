import * as dom from "./dom";
import * as state from "./state";
import * as settings from "./settings";
import * as ui from "./ui";
import * as generation from "./generation";
import {evaluate, simplify, parse} from "mathjs";
/**
 * Validates the user's answer against the expected correct answer.
 *
 * This function performs a comprehensive, multi‑stage equivalence check between the user input
 * and the pre‑computed correct answer (and its alternate form) for the currently displayed
 * integration question. It is designed to handle an extremely wide range of edge cases and
 * mathematical notations, ensuring robust and accurate validation.
 *
 * @param userInput Optional answer string. If not provided, reads from the textarea.
 *
 * **Supported Features:**
 * - Whitespace normalization, case insensitivity.
 * - Multiple exponent notations: `x^2`, `x^{2}`, `x**2`.
 * - Implicit multiplication: `2x` ↔ `2*x`, `(x)(y)` ↔ `x*y`.
 * - Trigonometric functions: `sin`, `\sin`, `sin(x)`, `sin x`, `sin^2 x` etc.
 * - Inverse trigonometric and hyperbolic functions.
 * - Integration constant: optional `+C`, `+c`, `+K` anywhere in the expression; constant term is ignored.
 * - Commutative addition: term order does not matter.
 * - Fraction ↔ decimal equivalence: `1/2` ↔ `0.5`.
 * - Algebraic equivalence: e.g., `(x+1)^2` ↔ `x^2+2x+1` (if math.js is available).
 * - Functional equivalence for indefinite integrals: checks if expressions differ by a constant.
 * - Numeric tolerance for definite integrals and constant comparisons.
 * - Parentheses normalization: `sin(x)` ↔ `sin x` (after sanitization).
 * - Special functions: `ln` ↔ `log_e`, `arcsin` ↔ `asin`, etc.
 * - **Equation handling:** expressions containing `=` are split into left and right sides,
 *   and each side is compared separately. Numeric evaluation is used for constant sides
 *   (e.g., `5^2` ↔ `25`).
 * - **Coefficient 1 removal:** a leading coefficient of 1 multiplied by a variable or function
 *   (e.g., `1*ln|x|`) is normalized to `ln|x|` to match user input that omits the 1.
 * - **Vector notation:** angle‑bracket vectors like `<a,b>` are converted to `[a,b]` for evaluation,
 *   allowing numeric comparison of vector answers.
 * - **Matrix notation:** `\begin{pmatrix} a & b \\ c & d \end{pmatrix}` is converted to `[[a,b],[c,d]]` for evaluation.
 * - **LaTeX command conversion:** common LaTeX constructs (`\frac`, `\sqrt`, `\int`, etc.) are transformed
 *   into evaluable math.js expressions where possible. Non‑evaluable constructs (like `\int`, `\sum`, `\lim`)
 *   are stripped of backslashes for symbolic comparison.
 * - Invalid syntax handling: gracefully falls back to plain text display.
 *
 * **Comparison Pipeline:**
 * 1. **LaTeX Preprocessing** – Convert LaTeX commands to math.js‑compatible syntax:
 *    - `\frac{a}{b}` → `(a)/(b)`
 *    - `\sqrt{a}` → `sqrt(a)`
 *    - `\sqrt[n]{a}` → `a^(1/n)`
 *    - `\langle ... \rangle` → `[...]`
 *    - `\begin{pmatrix} a & b \\ c & d \end{pmatrix}` → `[[a,b],[c,d]]`
 *    - Remove backslashes from other commands (e.g., `\sin` → `sin`).
 * 2. **Sanitization** – Trim, lowercase, remove whitespace, normalize braces, Unicode symbols, and implicit multiplication.
 *    Also removes a leading "1*" before a variable or function.
 * 3. **Function Name Normalization** – Convert all function names to a standard form (e.g., `ln` → `log`).
 * 4. **Constant Removal** – Identify and remove any constant term (including numeric constants) to compare only the functional part.
 *    - If the entire expression consists of constants, the original string is preserved (important for purely numeric answers).
 * 5. **Direct String Equality** – After sanitization and constant removal, check if strings are identical.
 * 6. **Fraction Handling** – If fractions are present, attempt decimal conversion and numeric comparison.
 * 7. **Term‑by‑Term Comparison** – Split expressions on `+` and `-`, sort terms lexicographically (works for polynomials).
 * 8. **Numeric Evaluation** – Try to evaluate both expressions as constants (including vectors). If both evaluate to numbers or arrays,
 *    compare with tolerance. This handles vector answers like `<−0.72,0.77>`.
 * 9. **Math.js Structural Simplification** – Use math.js to parse and simplify both expressions to a canonical form.
 * 10. **Numerical Sampling** – If both expressions contain a variable, evaluate at multiple points to check for constant difference or numeric equality.
 * 11. **Equation Splitting** – If the expression contains `=`, split into left and right; compare sides separately using the above steps.
 * 12. **Ultimate Fallback** – Use `settings.isAnswerCorrect` (simple evaluation).
 *
 * After determining correctness, the function:
 * - Provides audio/vibration feedback (if enabled).
 * - Displays the result with KaTeX‑formatted correct answer (using `window.katex.renderToString`).
 * - Clears the input and, in auto‑continue mode, generates the next question.
 *
 * @throws No exceptions are thrown; errors are caught and logged, with user‑friendly notifications.
 */
export function checkAnswer(userInput?: string): void{
	if (!state.selectedTopic){
		ui.showNotification("Please select a topic and generate a question first","warning");
		return;
	}
	if (!dom.userAnswer||!dom.answerResults) return;
	let answer = userInput;
	if (answer === undefined){
		answer = dom.userAnswer.value.trim();
		if (!answer){
			ui.showNotification("Please enter an answer before checking","warning");
			return;
		}
	}
	let correct=window.correctAnswer.correct;
	let alternate=window.correctAnswer.alternate;

	// --- Helper to convert LaTeX to math.js syntax ---
	const convertLatex=(s: string): string=>{
		// Replace fancy minus with hyphen
		s=s.replace(/−/g,'-');
		// Convert \frac{num}{den} to (num)/(den)
		s=s.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g,'($1)/($2)');
		// Convert \sqrt{arg} to sqrt(arg)
		s=s.replace(/\\sqrt\{([^}]*)\}/g,'sqrt($1)');
		// Convert \sqrt[root]{arg} to arg^(1/root)
		s=s.replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g,'($2)^(1/($1))');
		// Convert \langle ... \rangle to [...]
		s=s.replace(/\\langle\s*(.*?)\s*\\rangle/g,'[$1]');
		// Convert angle brackets <...> to [...] (if not already LaTeX)
		s=s.replace(/<([^>]*)>/g,'[$1]');
		// Convert matrix environments to math.js matrix syntax
		// \begin{pmatrix} a & b \\ c & d \end{pmatrix} -> [[a,b],[c,d]]
		// Use [\s\S] instead of . with 's' flag for ES6 compatibility
		s=s.replace(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g,(_,content)=>{
			let rows=content.split('\\\\').map((row:string)=>row.trim());
			let matrixRows=rows.map((row:string)=>{
				let cells=row.split('&').map((cell:string)=>cell.trim());
				return '['+cells.join(',')+']';
			});
			return '['+matrixRows.join(',')+']';
		});
		// Remove backslashes from other commands (e.g., \sin -> sin)
		s=s.replace(/\\([a-zA-Z]+)/g,'$1');
		return s;
	};

	// --- Helper to compare two expressions (used for left/right sides) ---
	const compareExpressions=(exprA: string, exprB: string, useFullPipeline: boolean=true): boolean=>{
		if (exprA===exprB) return true;
		// Convert LaTeX in both expressions
		exprA=convertLatex(exprA);
		exprB=convertLatex(exprB);
		// Sanitize both
		const sanitize=(s: string): string=>{
			s=s.toLowerCase().replace(/\s+/g,'');
			s=s.replace(/\^{/g,'^').replace(/[{}]/g,'');
			s=s.replace(/\*\*/g,'^');
			s=s.replace(/√/g,'sqrt').replace(/π/g,'pi').replace(/∞/g,'inf');
			s=s.replace(/(\d)([a-z])/g,'$1*$2');
			s=s.replace(/([a-z])(\d)/g,'$1*$2');
			s=s.replace(/\)(?=\()/g,')*');
			// Remove a leading coefficient of 1 multiplied by a variable or function (e.g., 1*ln|x| -> ln|x|)
			s=s.replace(/1\*([a-z\(])/g,'$1');
			s=s.replace(/\\?(sin|cos|tan|cot|sec|csc|log|ln|exp|sqrt|arcsin|arccos|arctan|sinh|cosh|tanh)/g,'$1');
			s=s.replace(/\bln\b/g,'log');
			s=s.replace(/\barcsin\b/g,'asin');
			s=s.replace(/\barccos\b/g,'acos');
			s=s.replace(/\barctan\b/g,'atan');
			s=s.replace(/(sin|cos|tan|cot|sec|csc|log|exp|sqrt|asin|acos|atan|sinh|cosh|tanh)\s+([a-z\(])/g,'$1($2)');
			return s;
		};
		let sanA=sanitize(exprA);
		let sanB=sanitize(exprB);
		if (sanA===sanB) return true;
		// Remove constants, but preserve purely numeric expressions
		const removeConstants=(s: string): string=>{
			let withPlus=s.replace(/-/g,'+-');
			let terms=withPlus.split('+').filter(t=>t!=='');
			const isConstant=(term: string): boolean=>{
				term=term.replace(/^[+-]/,'');
				if (term==='') return false;
				return /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(term)||
					   term==='pi'||term==='e';
			};
			let nonConstantTerms=terms.filter(t=>!isConstant(t));
			nonConstantTerms=nonConstantTerms.filter(t=>!/^[+-]?[ck]$/.test(t.replace(/[+-]/,'')));
			let result=nonConstantTerms.join('+');
			// If the result is empty, it means the whole expression was constant (e.g., a number)
			// In that case, return the original sanitized string so we can compare it later.
			return result || s;
		};
		let funcA=removeConstants(sanA);
		let funcB=removeConstants(sanB);
		if (funcA===funcB) return true;
		// Decimal conversion
		const toDecimal=(s: string): string=>{
			return s.replace(/(^|[+\-*/\^\(])(\d+)\/(\d+)([+\-*/\^\)]|$)/g,(_,pre,num,den,post)=>{
				let val=Number(num)/Number(den);
				return pre+val+post;
			});
		};
		let decA=toDecimal(funcA);
		let decB=toDecimal(funcB);
		if (decA===decB) return true;
		// Term comparison
		const toTerms=(s: string): string[]=>{
			let withPlus=s.replace(/-/g,'+-');
			let terms=withPlus.split('+').map(t=>t.trim()).filter(t=>t!=='');
			terms.sort();
			return terms;
		};
		let termsA=toTerms(funcA);
		let termsB=toTerms(funcB);
		if (termsA.join('+')===termsB.join('+')) return true;
		// Numeric evaluation for constants (including vectors)
		const tryEvaluate=(expr: string): any=>{
			// Already converted LaTeX, but ensure angle brackets are handled
			let normalized=expr.replace(/<([^>]*)>/g,'[$1]');
			normalized=normalized.replace(/−/g,'-');
			try{
				return evaluate(normalized);
			}catch{
				return null;
			}
		};
		let valA=tryEvaluate(exprA);
		let valB=tryEvaluate(exprB);
		if (valA!==null && valB!==null){
			if (Array.isArray(valA) && Array.isArray(valB)){
				if (valA.length===valB.length){
					let allMatch=true;
					for (let i=0;i<valA.length;i++){
						if (Math.abs(valA[i]-valB[i])>=1e-8){
							allMatch=false;
							break;
						}
					}
					if (allMatch) return true;
				}
			}
			else if (typeof valA==='number' && typeof valB==='number'){
				if (Math.abs(valA-valB)<1e-8) return true;
			}
		}
		// Math.js if available
		if (useFullPipeline){
			try{
				let simpA=simplify(funcA).toString().replace(/\s+/g,'');
				let simpB=simplify(funcB).toString().replace(/\s+/g,'');
				if (simpA===simpB) return true;
				let vars=parse(funcA).filter((node:any)=>node.isSymbolNode).map((node:any)=>node.name);
				if (vars.length===1){
					let varName=vars[0];
					let points=[0.5,1,2,3,Math.PI/4,Math.E];
					let valuesA:number[]=[];
					let valuesB:number[]=[];
					let success=true;
					for (let x of points){
						try{
							let scope={[varName]:x};
							let valA=evaluate(funcA,scope);
							let valB=evaluate(funcB,scope);
							valuesA.push(valA);
							valuesB.push(valB);
						}catch(e){
							success=false;
							break;
						}
					}
					if (success){
						let diffs=valuesA.map((v,i)=>v-valuesB[i]);
						let firstDiff=diffs[0];
						let constantDiff=diffs.every(d=>Math.abs(d-firstDiff)<1e-8);
						if (constantDiff) return true;
						let numericMatch=valuesA.every((v,i)=>Math.abs(v-valuesB[i])<1e-8);
						if (numericMatch) return true;
					}
				}
				else if (vars.length===0){
					try{
						let numA=evaluate(funcA);
						let numB=evaluate(funcB);
						if (Math.abs(numA-numB)<1e-8) return true;
					}catch(e){}
				}
			}catch(e){
				console.warn("Math.js evaluation failed in side comparison",e);
			}
		}
		return false;
	};

	// --- Main comparison logic ---
	let isCorrect=false;
	// Check if the expression contains an equals sign (equation)
	if (answer.includes('=') && correct.includes('=')){
		let [userLeft, userRight] = answer.split('=').map(s=>s.trim());
		let [correctLeft, correctRight] = correct.split('=').map(s=>s.trim());
		// Compare left sides
		let leftOk=compareExpressions(userLeft, correctLeft, true);
		// Compare right sides: use numeric evaluation if both are constant expressions
		let rightOk=false;
		if (leftOk){
			// Try numeric evaluation first
			try{
				let varsRightUser=parse(userRight).filter((node:any)=>node.isSymbolNode).length;
				let varsRightCorrect=parse(correctRight).filter((node:any)=>node.isSymbolNode).length;
				if (varsRightUser===0 && varsRightCorrect===0){
					let valUser=evaluate(userRight);
					let valCorrect=evaluate(correctRight);
					if (Math.abs(valUser-valCorrect)<1e-8){
						rightOk=true;
					}
				}
			}catch(e){
				console.warn("Numeric evaluation of right side failed",e);
			}
			// If not numeric or failed, compare as expressions
			if (!rightOk){
				rightOk=compareExpressions(userRight, correctRight, true);
			}
		}
		isCorrect = leftOk && rightOk;
	}
	else if (answer.includes('=') || correct.includes('=')){
		// One is equation, other is not -> incorrect
		isCorrect=false;
	}
	else{
		// No equals sign: treat as single expression (original logic)
		// Convert LaTeX in userInput and correct/alternate
		let convertedUser=convertLatex(answer);
		let convertedCorrect=convertLatex(correct);
		let convertedAlternate=alternate?convertLatex(alternate):'';
		const sanitize=(s: string): string=>{
			s=s.toLowerCase().replace(/\s+/g,'');
			s=s.replace(/−/g,'-');
			s=s.replace(/\^{/g,'^').replace(/[{}]/g,'');
			s=s.replace(/\*\*/g,'^');
			s=s.replace(/√/g,'sqrt').replace(/π/g,'pi').replace(/∞/g,'inf');
			s=s.replace(/(\d)([a-z])/g,'$1*$2');
			s=s.replace(/([a-z])(\d)/g,'$1*$2');
			s=s.replace(/\)(?=\()/g,')*');
			// Remove a leading coefficient of 1 multiplied by a variable or function (e.g., 1*ln|x| -> ln|x|)
			s=s.replace(/1\*([a-z\(])/g,'$1');
			s=s.replace(/\\?(sin|cos|tan|cot|sec|csc|log|ln|exp|sqrt|arcsin|arccos|arctan|sinh|cosh|tanh)/g,'$1');
			s=s.replace(/\bln\b/g,'log');
			s=s.replace(/\barcsin\b/g,'asin');
			s=s.replace(/\barccos\b/g,'acos');
			s=s.replace(/\barctan\b/g,'atan');
			s=s.replace(/(sin|cos|tan|cot|sec|csc|log|exp|sqrt|asin|acos|atan|sinh|cosh|tanh)\s+([a-z\(])/g,'$1($2)');
			return s;
		};
		let sanUser=sanitize(convertedUser);
		let sanCorrect=sanitize(convertedCorrect);
		let sanAlternate=alternate?sanitize(convertedAlternate):'';
		// Modified removeConstants to preserve purely numeric expressions
		const removeConstants=(s: string): string=>{
			let withPlus=s.replace(/-/g,'+-');
			let terms=withPlus.split('+').filter(t=>t!=='');
			const isConstant=(term: string): boolean=>{
				term=term.replace(/^[+-]/,'');
				if (term==='') return false;
				return /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(term)||
					   term==='pi'||term==='e';
			};
			let nonConstantTerms=terms.filter(t=>!isConstant(t));
			nonConstantTerms=nonConstantTerms.filter(t=>!/^[+-]?[ck]$/.test(t.replace(/[+-]/,'')));
			let result=nonConstantTerms.join('+');
			// If the result is empty, the whole expression was constant (e.g., a number)
			// Return the original string so it can be compared numerically later.
			return result || s;
		};
		let funcUser=removeConstants(sanUser);
		let funcCorrect=removeConstants(sanCorrect);
		let funcAlternate=alternate?removeConstants(sanAlternate):'';
		if (funcUser===funcCorrect||funcUser===funcAlternate){
			isCorrect=true;
		}
		else if (sanUser===sanCorrect||sanUser===sanAlternate){
			isCorrect=true;
		}
		else{
			const toDecimal=(s: string): string=>{
				return s.replace(/(^|[+\-*/\^\(])(\d+)\/(\d+)([+\-*/\^\)]|$)/g,(_,pre,num,den,post)=>{
					let val=Number(num)/Number(den);
					return pre+val+post;
				});
			};
			let decUser=toDecimal(funcUser);
			let decCorrect=toDecimal(funcCorrect);
			if (decUser===decCorrect){
				isCorrect=true;
			}
			else{
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
					// Try numeric evaluation for constants (including vectors)
					const tryEvaluate=(expr: string): any=>{
						let normalized=expr.replace(/<([^>]*)>/g,'[$1]');
						normalized=normalized.replace(/−/g,'-');
						try{
							return evaluate(normalized);
						}catch{
							return null;
						}
					};
					let valUser=tryEvaluate(convertedUser);
					let valCorrect=tryEvaluate(convertedCorrect);
					if (valUser!==null && valCorrect!==null){
						if (Array.isArray(valUser) && Array.isArray(valCorrect)){
							if (valUser.length===valCorrect.length){
								let allMatch=true;
								for (let i=0;i<valUser.length;i++){
									if (Math.abs(valUser[i]-valCorrect[i])>=1e-8){
										allMatch=false;
										break;
									}
								}
								if (allMatch){
									isCorrect=true;
								}
							}
						}
						else if (typeof valUser==='number' && typeof valCorrect==='number'){
							if (Math.abs(valUser-valCorrect)<1e-8){
								isCorrect=true;
							}
						}
					}
					if (!isCorrect){
						try{
							let simpUser=simplify(funcUser).toString().replace(/\s+/g,'');
							let simpCorrect=simplify(funcCorrect).toString().replace(/\s+/g,'');
							if (simpUser===simpCorrect){
								isCorrect=true;
							}
							else{
								let vars=parse(funcCorrect).filter((node:any)=>node.isSymbolNode).map((node:any)=>node.name);
								if (vars.length===1){
									let varName=vars[0];
									let points=[0.5,1,2,3,Math.PI/4,Math.E];
									let valuesUser:number[]=[];
									let valuesCorrect:number[]=[];
									let success=true;
									for (let x of points){
										try{
											let scope={[varName]:x};
											let valUser=evaluate(funcUser,scope);
											let valCorrect=evaluate(funcCorrect,scope);
											valuesUser.push(valUser);
											valuesCorrect.push(valCorrect);
										}catch(e){
											success=false;
											break;
										}
									}
									if (success){
										let diffs=valuesUser.map((v,i)=>v-valuesCorrect[i]);
										let firstDiff=diffs[0];
										let constantDiff=diffs.every(d=>Math.abs(d-firstDiff)<1e-8);
										if (constantDiff){
											isCorrect=true;
										}
										else{
											let numericMatch=valuesUser.every((v,i)=>Math.abs(v-valuesCorrect[i])<1e-8);
											if (numericMatch){
												isCorrect=true;
											}
										}
									}
								}
								else if (vars.length===0){
									try{
										let numUser=evaluate(funcUser);
										let numCorrect=evaluate(funcCorrect);
										if (Math.abs(numUser-numCorrect)<1e-8){
											isCorrect=true;
										}
									}catch(e){}
								}
							}
						}catch(e){
							console.warn("Math.js evaluation failed, falling back",e);
						}
					}
					if (!isCorrect){
						isCorrect=settings.isAnswerCorrect(answer,sanCorrect,alternate);
					}
				}
			}
		}
	}
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
	// Render the correct answer using KaTeX (fallback to plain text if KaTeX unavailable or errors)
	const answerToDisplay=(window.correctAnswer as any).display||window.correctAnswer.correct;
	let answerHtml='';
	if (window.katex){
		try{
			answerHtml=window.katex.renderToString(answerToDisplay,{throwOnError:false,displayMode:false});
		}catch(e){
			console.warn('KaTeX rendering failed, falling back to plain text',e);
			answerHtml=answerToDisplay;
		}
	}else{
		answerHtml=answerToDisplay;
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