/**
 * @file answer.ts - Handles answer validation, performance tracking, and adaptive learning integration.
 * @date 2026-04-04
 * @description This module provides comprehensive answer checking for math questions, including LaTeX conversion,
 * numeric equivalence, algebraic simplification, and vector/matrix handling. It also records user performance
 * (response time, error types) for the adaptive learning system. Updated to support Tauri commands for saving
 * performance data to SQLite and starting question timers, with detailed console logging.
 */
import {dom} from "./core/domRegistry";
import {appState} from "./core/stateStore";
import {questionState} from "./core/questionState";
import * as settings from "./settings";
import * as ui from "./ui";
import * as generation from "./generation";
import {invoke} from "@tauri-apps/api/core";
let _audioCtx: AudioContext|null=null;
export function getAudioContext(): AudioContext{
    if(!_audioCtx){
        _audioCtx=new AudioContext();
    }
    return _audioCtx;
}
let mathjs: any=null;
async function ensureMathjs(): Promise<void>{
	if(mathjs) return;
	mathjs=await import("mathjs");
}
let questionStartTime: number = 0;
export function startQuestionTimer(): void{
    questionStartTime = performance.now();
}
export function getResponseTime(): number{
    return Math.round(performance.now() - questionStartTime);
}
function detectErrorType(userAnswer: string, correctAnswer: string, topicId: string): string | null{
    if (topicId === 'rational_eq'){
        if (!userAnswer.includes('/')) return 'no_common_denominator';
        if (userAnswer.includes('+') && !correctAnswer.includes('+')) return 'sign_error';
    }
    if (topicId === 'linear_eq'){
        if (userAnswer.includes('-') && !correctAnswer.includes('-')) return 'sign_error';
    }
    if (topicId === 'quadratic_eq'){
        if (userAnswer.includes('^2') && !correctAnswer.includes('^2')) return 'missing_exponent';
    }
    return null;
}
function sanitize(s: string): string{
    s=s.toLowerCase();
    s=s.replace(/(sin|cos|tan|cot|sec|csc|log|ln|exp|sqrt|arcsin|arccos|arctan|sinh|cosh|tanh)\s+([a-z\(])/g,'$1($2)');
    s=s.replace(/\s+/g,'');
    s=s.replace(/−/g,'-');
    s=s.replace(/\^{/g,'^(').replace(/}/g,')');
    s=s.replace(/\*\*/g,'^');
    s=s.replace(/√/g,'sqrt').replace(/π/g,'pi').replace(/∞/g,'inf');
    s=s.replace(/\b(sin|cos|tan|cot|sec|csc|log|ln|exp|sqrt|arcsin|arccos|arctan|sinh|cosh|tanh)(\d+[a-z]*)/g,'$1($2)');
    s=s.replace(/(\d)([a-z])/g,'$1*$2');
    s=s.replace(/([a-z])(\d)/g,'$1*$2');
    s=s.replace(/\)(?=\()/g,')*');
    s=s.replace(/1\*([a-z\(])/g,'$1');
    s=s.replace(/\\?(sin|cos|tan|cot|sec|csc|log|ln|exp|sqrt|arcsin|arccos|arctan|sinh|cosh|tanh)/g,'$1');
    s=s.replace(/\bln\b/g,'log');
    s=s.replace(/\barcsin\b/g,'asin');
    s=s.replace(/\barccos\b/g,'acos');
    s=s.replace(/\barctan\b/g,'atan');
    return s;
}
function removeConstants(s: string): string{
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
    return result || s;
}
function toDecimal(s: string): string{
    // Handle fractions from \frac conversion: (1)/(2) -> 0.5, exclude ^ prefix for x^1/2
    return s.replace(/(^|[+\-*\/\(])(\d+) ?\)?\/\(? ?(\d+)([+\-*\/\)]|$)/g,(_,pre,num,den,post)=>{
        let val=Number(num)/Number(den);
        return pre+val+post;
    });
}
function toTerms(s: string): string[]{
    // Only replace - with +- outside of parentheses to avoid garbling sub-expressions
    let result:string[]=[];
    let depth=0;
    let current='';
    for(let i=0;i<s.length;i++){
        let ch=s[i];
        if(ch==='(')depth++;
        else if(ch===')')depth--;
        if(ch==='-'&&depth===0){
            if(current)result.push(current);
            current='-';
        }
        else if(ch==='+'&&depth===0){
            if(current)result.push(current);
            current='';
        }
        else{
            current+=ch;
        }
    }
    if(current)result.push(current);
    // Clean up leading +
    result=result.map(t=>t.replace(/^\+/,'')).filter(t=>t!=='');
    result.sort();
    return result;
}
function tryEvaluate(expr: string): any{
    let normalized=expr.replace(/<([^>]*)>/g,'[$1]');
    normalized=normalized.replace(/−/g,'-');
    try{
        return mathjs.evaluate(normalized);
    }catch{
        return null;
    }
}
/**
 * Validates the user's answer against the expected correct answer.
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
 * - Records performance data for adaptive learning (response time, error type) via Tauri.
 * - Provides audio/vibration feedback (if enabled).
 * - Displays the result with KaTeX‑formatted correct answer (using `window.katex.renderToString`).
 * - Clears the input and, in auto‑continue mode, generates the next question.
 *
 * @throws No exceptions are thrown; errors are caught and logged, with user‑friendly notifications.
 */
export async function checkAnswer(userInput?: string): Promise<void>{
    await ensureMathjs();
    if (!appState.selectedTopic){
        ui.showNotification("Please select a topic and generate a question first","warning");
        return;
    }
    if (!dom.inputs.userAnswer||!dom.displays.answerResults) return;
    if (!questionState.hasQuestion){
        dom.displays.answerResults.className="results-display incorrect";
        return;
    }
    let answer = userInput;
    if (answer === undefined){
        answer = dom.inputs.userAnswer.value.trim();
        if (!answer){
            ui.showNotification("Please enter an answer before checking","warning");
            return;
        }
    }
    let correct=questionState.correctAnswer.correct;
    let alternate=questionState.correctAnswer.alternate;

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
        let sanA=sanitize(exprA);
        let sanB=sanitize(exprB);
        if (sanA===sanB) return true;
        // Remove constants, but preserve purely numeric expressions
        let funcA=removeConstants(sanA);
        let funcB=removeConstants(sanB);
        if (funcA===funcB) return true;
        // Decimal conversion
        let decA=toDecimal(funcA);
        let decB=toDecimal(funcB);
        if (decA===decB) return true;
        // Term comparison
        let termsA=toTerms(funcA);
        let termsB=toTerms(funcB);
        if (termsA.join('+')===termsB.join('+')) return true;
        // Numeric evaluation for constants (including vectors)
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
let simpA=mathjs.simplify(funcA).toString().replace(/\s+/g,'');
let simpB=mathjs.simplify(funcB).toString().replace(/\s+/g,'');
                if (simpA===simpB) return true;
                let vars=mathjs.parse(funcA).filter((node:any)=>node.isSymbolNode).map((node:any)=>node.name);
                if (vars.length===1){
                    let varName=vars[0];
                    let points=[0.5,1,2,3,Math.PI/4,Math.E];
                    let valuesA:number[]=[];
                    let valuesB:number[]=[];
                    let success=true;
                    for (let x of points){
                        try{
                            let scope={[varName]:x};
let valA=mathjs.evaluate(funcA,scope);
let valB=mathjs.evaluate(funcB,scope);
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
let numA=mathjs.evaluate(funcA);
let numB=mathjs.evaluate(funcB);
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
let varsRightUser=mathjs.parse(userRight).filter((node:any)=>node.isSymbolNode).length;
let varsRightCorrect=mathjs.parse(correctRight).filter((node:any)=>node.isSymbolNode).length;
                if (varsRightUser===0 && varsRightCorrect===0){
let valUser=mathjs.evaluate(userRight);
let valCorrect=mathjs.evaluate(correctRight);
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
        let sanUser=sanitize(convertedUser);
        let sanCorrect=sanitize(convertedCorrect);
        let sanAlternate=alternate?sanitize(convertedAlternate):'';
        // Modified removeConstants to preserve purely numeric expressions
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
            let decUser=toDecimal(funcUser);
            let decCorrect=toDecimal(funcCorrect);
            let decAlternate=alternate?toDecimal(funcAlternate):'';
            if (decUser===decCorrect||decUser===decAlternate){
                isCorrect=true;
            }
            else{
                let termsUser=toTerms(funcUser);
                let termsCorrect=toTerms(funcCorrect);
                let termsAlternate=alternate?toTerms(funcAlternate):[];
                if (termsUser.join('+')===termsCorrect.join('+')||(termsAlternate.length&&termsUser.join('+')===termsAlternate.join('+'))){
                    isCorrect=true;
                }
                else{
                    // Try numeric evaluation for constants (including vectors)
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
let simpUser=mathjs.simplify(funcUser).toString().replace(/\s+/g,'');
let simpCorrect=mathjs.simplify(funcCorrect).toString().replace(/\s+/g,'');
                            if (simpUser===simpCorrect){
                                isCorrect=true;
                            }
                            else{
                                let vars=mathjs.parse(funcCorrect).filter((node:any)=>node.isSymbolNode).map((node:any)=>node.name);
                                if (vars.length===1){
                                    let varName=vars[0];
                                    let points=[0.5,1,2,3,Math.PI/4,Math.E];
                                    let valuesUser:number[]=[];
                                    let valuesCorrect:number[]=[];
                                    let success=true;
                                    for (let x of points){
                                        try{
                                            let scope={[varName]:x};
let valUser=mathjs.evaluate(funcUser,scope);
let valCorrect=mathjs.evaluate(funcCorrect,scope);
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
let numUser=mathjs.evaluate(funcUser);
let numCorrect=mathjs.evaluate(funcCorrect);
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
                        isCorrect=await settings.isAnswerCorrect(answer,sanCorrect,alternate);
                    }
                }
            }
        }
    }
    const responseTime=getResponseTime();
    const errorType=!isCorrect ? detectErrorType(answer, correct, appState.selectedTopic || '') : null;
    console.log("[Adaptive] Saving performance:", {
        topicId: appState.selectedTopic,
        difficulty: appState.currentDifficulty,
        correct: isCorrect,
        responseTimeMs: responseTime,
        errorType: errorType
    });
    invoke('save_performance', {
        topicId: appState.selectedTopic,
        difficulty: appState.currentDifficulty,
        correct: isCorrect,
        responseTimeMs: responseTime,
        errorType: errorType
    }).then(()=>{
        console.log("[Adaptive] Performance saved successfully");
    }).catch((e)=>{
        console.warn("[Adaptive] Failed to save performance:", e);
    });
    if (settings.settings.sound){
        const audioCtx=getAudioContext();
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
    const answerToDisplay=(questionState.correctAnswer as any).display||questionState.correctAnswer.correct;
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
        dom.displays.answerResults.innerHTML=`
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
        dom.displays.answerResults.className="results-display correct";
        if (dom.buttons.copyAnswerBtn) dom.buttons.copyAnswerBtn.style.display="inline-flex";
        dom.displays.answerResults.classList.add("correct-flash");
        setTimeout(()=>dom.displays.answerResults?.classList.remove("correct-flash"),300);
    }
    else{
        dom.displays.answerResults.innerHTML=`
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
        dom.displays.answerResults.className="results-display incorrect";
        if (dom.buttons.copyAnswerBtn) dom.buttons.copyAnswerBtn.style.display="inline-flex";
        dom.displays.answerResults.classList.add("incorrect-flash");
        setTimeout(()=>dom.displays.answerResults?.classList.remove("incorrect-flash"),300);
    }
    dom.inputs.userAnswer.value="";
    ui.updatePreview();
    dom.inputs.userAnswer.focus();
    if (appState.currentMode==="single"&&appState.autocontinue){
        if (appState.autoTimeout) clearTimeout(appState.autoTimeout);
        appState.autoTimeout=setTimeout(()=>{
            generation.generateQuestion();
            appState.autoTimeout=null;
        },settings.settings.autoCheckDelay);
    }
}