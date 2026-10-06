import{dom}from"./core/DomRegistry";
import{appState}from"./core/StateStore";
import{questionState}from"./core/QuestionState";
import * as settings from"./Settings";
import * as ui from"./Ui";
import * as generation from"./Generation";
import{savePerformance}from"./services/Backend";
import{effectivePersistence}from"./Settings";
import{adaptiveAvailable}from"../utils/envUtils";
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
    let isConstant=(term: string): boolean=>{
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
 * Collects the distinct free symbols of an expression, so that a comparison can
 * confirm both sides range over the same variables before it samples them.
 *
 * @param expr The expression to inspect.
 * @returns The distinct symbol names, or an empty array when the expression
 *          cannot be parsed or contains no symbols.
 */
function freeSymbols(expr: string): string[]{
    try{
        let names:string[]=mathjs.parse(expr)
            .filter((node:any)=>node.isSymbolNode)
            .map((node:any)=>node.name);
        return [...new Set(names)];
    }catch{
        return [];
    }
}
/**
 * Rewrites the LaTeX a generator printed into the plain expression the
 * comparison below can read.
 *
 * @param s - The LaTeX or plain text.
 * @returns The plain equivalent.
 */
function convertLatex(s: string): string{
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
}
/**
 * Reports whether two sanitized expressions denote the same thing, which is the
 * comparison a whole answer and one side of an equation are both graded with.
 *
 * **Supported Features:**
 * - Identical text after sanitization.
 * - Fraction ↔ decimal equivalence: `1/2` ↔ `0.5`.
 * - Commutative addition: term order does not matter.
 * - Numeric evaluation for constant expressions, including vectors.
 * - Math.js structural simplification, e.g. `sin^2(x)+cos^2(x)` ↔ `1`.
 * - Numerical sampling when both sides range over the same single free
 *   variable. A constant but non-zero difference is a different expression and is
 *   rejected.
 *
 * @param sanA - The first expression, already sanitized.
 * @param sanB - The second expression, already sanitized.
 * @returns True when the two are the same answer.
 */
function sameExpression(sanA: string, sanB: string): boolean{
    if (sanA===sanB) return true;
    // Decimal conversion
    if (toDecimal(sanA)===toDecimal(sanB)) return true;
    // Term-by-term comparison
    if (toTerms(sanA).join('+')===toTerms(sanB).join('+')) return true;
    // Numeric evaluation for constants (including vectors)
    let valA=tryEvaluate(sanA);
    let valB=tryEvaluate(sanB);
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
    try{
        let simpA=mathjs.simplify(sanA).toString().replace(/\s+/g,'');
        let simpB=mathjs.simplify(sanB).toString().replace(/\s+/g,'');
        if (simpA===simpB) return true;
        // The free symbols are taken from both sides and must match as
        // sets. Sampling a variable that appears on only one side leaves
        // the other expression undefined at every point, so the
        // comparison silently decided nothing.
        let varsA=freeSymbols(sanA);
        let varsB=freeSymbols(sanB);
        if (varsA.length!==varsB.length||!varsA.every(v=>varsB.indexOf(v)>=0)){
            return false;
        }
        if (varsA.length===1){
            let varName=varsA[0];
            let points=[0.5,1,2,3,Math.PI/4,Math.E];
            let match=true;
            for (let x of points){
                try{
                    let scope={[varName]:x};
                    let lv=mathjs.evaluate(sanA,scope);
                    let rv=mathjs.evaluate(sanB,scope);
                    if (!Number.isFinite(lv)||!Number.isFinite(rv)||Math.abs(lv-rv)>=1e-8){
                        match=false;
                        break;
                    }
                }
                catch(e){
                    match=false;
                    break;
                }
            }
            if (match) return true;
        }
        else if (varsA.length===0){
            try{
                let numA=mathjs.evaluate(sanA);
                let numB=mathjs.evaluate(sanB);
                if (Math.abs(numA-numB)<1e-8) return true;
            }
            catch(e){}
        }
    }
    catch(e){
        console.warn("Math.js evaluation failed in side comparison",e);
    }
    return false;
}
/**
 * Reports whether two answer spellings mean the same thing, allowing for the
 * notation a generator printed and the notation a learner typed.
 *
 * @param exprA - The first spelling.
 * @param exprB - The second spelling.
 * @returns True when the two are the same answer.
 */
function compareExpressions(exprA: string, exprB: string): boolean{
    if (exprA===exprB) return true;
    // Convert LaTeX in both expressions, then sanitize both
    let sanA=sanitize(convertLatex(exprA));
    let sanB=sanitize(convertLatex(exprB));
    if (sameExpression(sanA, sanB)) return true;
    // An integration constant is the one constant the hint ladder invites a
    // learner to add, so the constant terms come off and the comparison runs
    // again. It has to be the second attempt and not the first: dropping a
    // constant from one side only turned "x^2+2x" into a different expression
    // from "(x+1)^2", so a factored answer was rejected for carrying the very
    // constant it was supposed to expand.
    let funcA=removeConstants(sanA);
    let funcB=removeConstants(sanB);
    return funcA===funcB||sameExpression(funcA, funcB);
}
/**
 * Reports whether the right-hand side of an equation is a value both sides agree
 * on, which is decided numerically because "5^2" and "25" are the same number
 * rather than the same expression.
 *
 * @param userSide - What the learner wrote on the right.
 * @param correctSide - What the key says the right side is.
 * @returns True when the two are the same value.
 */
function compareConstantSides(userSide: string, correctSide: string): boolean{
    try{
        let varsUser=mathjs.parse(userSide).filter((node:any)=>node.isSymbolNode).length;
        let varsCorrect=mathjs.parse(correctSide).filter((node:any)=>node.isSymbolNode).length;
        if (varsUser===0 && varsCorrect===0){
            return Math.abs(mathjs.evaluate(userSide)-mathjs.evaluate(correctSide))<1e-8;
        }
    }
    catch(e){
        console.warn("Numeric evaluation of right side failed",e);
    }
    return false;
}
/**
 * Grades a typed answer against the key and the alternate spelling of the key.
 * The single-question flow and the mental session both come through here, so an
 * answer accepted in one mode is accepted in the other.
 *
 * **Comparison Pipeline:**
 * 1. **Equation Splitting** – When the answer and the key are both equations,
 *    each side is compared separately, and a right-hand side with no symbols in
 *    it is compared numerically.
 * 2. **Expression Comparison** – Otherwise the answer is compared as a whole
 *    against the key and then against the alternate spelling.
 * 3. **Numeric Comparison** – As a last step `Settings.isAnswerCorrect` decides,
 *    which is the exact-fraction, rounded-value and degree-marked comparison. The
 *    key is handed to it exactly as the generator printed it, because
 *    `latexToPlain` is the one place that decides an answer's spelling and
 *    rewriting the key first is what used to turn `45^{\circ}` into `45^(circ)`.
 *
 * @param userInput - What the learner typed.
 * @param correct - The answer key.
 * @param alternate - An equivalent spelling of the key, if the topic has one.
 * @returns True when the answer is right.
 */
export async function gradeAnswer(userInput: string, correct: string, alternate?: string): Promise<boolean>{
    let answer=userInput.trim();
    if (!answer) return false;
    await ensureMathjs();
    let alt=alternate&&alternate!==""?alternate:"";
    // Check if the expression contains an equals sign (equation)
    if (answer.includes('=') && correct.includes('=')){
        let [userLeft, userRight] = answer.split('=').map(s=>s.trim());
        let [correctLeft, correctRight] = correct.split('=').map(s=>s.trim());
        if (!compareExpressions(userLeft, correctLeft)) return false;
        if (compareConstantSides(userRight, correctRight)) return true;
        return compareExpressions(userRight, correctRight);
    }
    // A single expression is compared by the same routine an equation side uses,
    // against the key and then against the alternate spelling. One side carrying
    // an equals sign and the other not used to be rejected outright, which marked
    // "x=5" wrong against a key of "5" that the learner had answered correctly.
    return compareExpressions(answer, correct)
        || (alt!==""&&compareExpressions(answer, alt))
        || await settings.isAnswerCorrect(answer, correct, alternate);
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
 * The answer itself is graded by `gradeAnswer`, which documents the pipeline and is
 * the same routine the mental session grades with.
 *
 * After determining correctness, the function:
 * - Records performance data for adaptive learning (response time, error type) via Tauri.
 * - Provides audio/vibration feedback (if enabled).
 * - Displays the result with KaTeX‑formatted correct answer (using `window.katex.renderToString`).
 * - Clears the input and, in auto‑continue mode, generates the next question.
 *
 * @throws No exceptions are thrown; errors are caught and logged, with user‑friendly notifications.
 */
let checkInFlight=false;
export async function checkAnswer(userInput?: string): Promise<void>{
    if (checkInFlight) return;
    checkInFlight=true;
    try{
        await checkAnswerImpl(userInput);
    }
    finally{
        checkInFlight=false;
    }
}
async function checkAnswerImpl(userInput?: string): Promise<void>{
    try{
        await ensureMathjs();
    }
    catch(e){
        ui.showNotification("Math engine failed to load. Please reload the app.","warning");
        return;
    }
    if (!appState.selectedTopic){
        ui.showNotification("Please select a topic and generate a question first","warning");
        return;
    }
    if (!dom.inputs.userAnswer||!dom.displays.answerResults) return;
    if (!questionState.hasQuestion){
        dom.displays.answerResults.textContent="No question loaded. Please generate a question first.";
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
    let alternate=questionState.correctAnswer.alternate||"";
    let isCorrect=await gradeAnswer(answer, correct, alternate);
    let responseTime=getResponseTime();
    let errorType=!isCorrect ? detectErrorType(answer, correct, appState.selectedTopic || '') : null;
    let topicId=appState.selectedTopic;
    let adaptive=adaptiveAvailable(effectivePersistence());
    // The review waits for the confidence judgment rather than racing it. The
    // record is queued here and written once the learner answers the confidence
    // question, dismisses it, starts the next question, or a short timeout
    // expires, so answer N carries confidence N instead of nothing. The write
    // still only happens where the scheduler can read it back.
    // The aggregate below carries no confidence, so it is written at once.
    if(topicId&&adaptive){
        savePerformance(topicId,appState.currentDifficulty,isCorrect,responseTime,errorType).catch((e)=>{
            console.warn("[Adaptive] Failed to save performance:", e);
        });
        (await import("./services/Help")).queueReview({topicId:topicId,subSkill:questionState.subSkill,correct:isCorrect,responseMs:responseTime},adaptive);
    }
    if (settings.settings.sound){
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
    if (settings.settings.vibration&&navigator.vibrate){
        navigator.vibrate(isCorrect?50:100);
    }
    // Render the correct answer using KaTeX (fallback to plain text if KaTeX unavailable or errors)
    let answerToDisplay=questionState.correctAnswer.display||questionState.correctAnswer.correct||"(no answer available)";
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
        if (dom.buttons.copyAnswerBtn){dom.buttons.copyAnswerBtn.classList.remove("hidden");dom.buttons.copyAnswerBtn.style.display="";}
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
        if (dom.buttons.copyAnswerBtn){dom.buttons.copyAnswerBtn.classList.remove("hidden");dom.buttons.copyAnswerBtn.style.display="";}
        dom.displays.answerResults.classList.add("incorrect-flash");
        setTimeout(()=>dom.displays.answerResults?.classList.remove("incorrect-flash"),300);
    }
    if(!appState.mcqMode){
        dom.inputs.userAnswer.value="";
        ui.updatePreview();
        dom.inputs.userAnswer.focus();
    }
// Asked after the result is shown rather than before the answer is graded, so
    // the learner is judging what they actually did rather than what they hoped.
    // It is not offered when the next question is already on its way, because a
    // prompt that is replaced before it can be answered is noise.
    let daily=await import("./services/DailyMode");
    let dailyActive=daily.isActive();
    if (!appState.autocontinue||!appState.mcqMode){
        let help=await import("./services/Help");
        help.ask(isCorrect, responseTime, adaptiveAvailable(effectivePersistence()));
    }
    if (dailyActive){
        // The set advances itself, because a daily set that waits to be told to
        // continue is a session with a daily label on it.
        await daily.completeCurrent();
    }
    if (appState.currentMode==="single"&&appState.autocontinue){
        if (appState.autoTimeout) clearTimeout(appState.autoTimeout);
        appState.autoTimeout=setTimeout(()=>{
            generation.generateQuestion().catch((err: unknown)=>console.error("autocontinue generateQuestion failed:",err));
            appState.autoTimeout=null;
        },settings.settings.autoCheckDelay);
    }
}