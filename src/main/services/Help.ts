/**
 * @file The help a learner can ask for, and the confidence they can report.
 * @description Two things happen after an answer is checked and both belong to the
 * question rather than to the checker.
 *
 * The first is help. A hint ladder is revealed one rung at a time, and the next
 * rung is only reachable once the previous has been read, because a list of hints
 * shown at once is a list a learner reads in order and then uses the last one. The
 * concession is a separate control from the rungs, so taking the last hint is a
 * decision rather than something that happens by running out of buttons.
 *
 * The second is confidence. The schedule adjusts for the gap between how sure a
 * learner was and how they actually did, which only works if the confidence is
 * captured, and capturing it after every single answer would make it a habit
 * rather than a judgment. It is therefore asked once a question has been thought
 * about, on the questions where the answer is informative.
 */
import{setHidden}from"../core/DomVisibility";
import{dom}from"../core/DomRegistry";
import{questionState}from"../core/QuestionState";
import type{Confidence}from"./Scheduler";
import{buildHintLadder, buildSolution}from"../../modules/shared/Hints";
import type{QuestionDto}from"../../types/global";

/** The most hints a learner is offered before the concession is the only thing left. */
const MAX_RUNGS=3;

/** How long an answer has to stand unanswered before asking for confidence is worth it. */
const MIN_RESPONSE_MS=2500;

/** The rungs revealed so far for the question on screen. */
let revealed=0;

/** The ladder for the question on screen. */
let ladder: { rungs: string[]; concede: string }|null=null;

/** The solution steps for the question on screen. */
let solution: string[]|null=null;

/**
 * Reports the confidence levels worth offering for an outcome. A learner who was
 * wrong is asked all three, because that is the case where the gap between
 * confidence and outcome is informative. After a correct answer the two extremes
 * are the only ones that carry information, and the middle one is removed rather
 * than shown and ignored.
 *
 * @param correct - Whether the answer was correct.
 * @returns The levels to offer, easiest first.
 */
export function confidenceChoices(correct: boolean): Confidence[]{
    return correct?["low","high"]:["low","medium","high"];
}
export function prepare(dto: QuestionDto): void{
    revealed=0;
    ladder=buildHintLadder(dto);
    solution=buildSolution(dto);
    questionState.subSkill=dto.subskill;
    if (dom.help.hintPanel){
        setHidden(dom.help.hintPanel, true);
        dom.help.hintPanel.innerHTML="";
    }
    if (dom.help.showHintBtn){
        dom.help.showHintBtn.disabled=ladder===null;
        dom.help.showHintBtn.textContent="Hint";
    }
    if (dom.help.showSolutionBtn){
        setHidden(dom.help.showSolutionBtn, solution===null);
    }
    let row=dom.help.confidenceRow;
    setHidden(row, true);
    questionState.confidence=undefined;
}

/**
 * Reveals one more rung, or the concession once the rungs are spent.
 */
export function reveal(): void{
    if (!ladder) return;
    let panel=dom.help.hintPanel;
    if (!panel) return;
    if (revealed<Math.min(MAX_RUNGS, ladder.rungs.length)){
        let text=ladder.rungs[revealed];
        revealed++;
        appendPanelRow(panel, "Hint "+revealed, text);
        setHidden(panel, false);
        let button=dom.help.showHintBtn;
        if (button){
            let rungsLeft=Math.min(MAX_RUNGS, ladder.rungs.length)-revealed;
            button.textContent=rungsLeft>0?"Next hint":"Show the answer";
        }
        return;
    }
    if (revealed===Math.min(MAX_RUNGS, ladder.rungs.length)){
        appendPanelRow(panel, "The answer", ladder.concede);
        revealed++;
        let button=dom.help.showHintBtn;
        if (button) button.disabled=true;
    }
}

/**
 * Shows the worked solution, or says plainly that a one-step question has none.
 */
export function revealSolution(): void{
    let panel=dom.help.hintPanel;
    if (!panel) return;
    if (!solution){
        appendPanelRow(panel, "Solution", "This question has one step, so the answer above is the whole of it.");
        setHidden(panel, false);
        return;
    }
    for(let step of solution){
        appendPanelRow(panel, "Step", step);
    }
    setHidden(panel, false);
}

/**
 * Asks the learner how sure they were, but only when the answer is informative
 * enough to be worth asking about.
 *
 * @param correct - Whether the answer just given was correct.
 * @param responseMs - How long the question was on screen.
 * @param adaptive - Whether adaptive learning can run here. The value is passed in
 *   because the caller owns that decision, and looking it up from here cost five
 *   kilobytes of initial chunk.
 */
export function ask(correct: boolean, responseMs: number, adaptive: boolean): void{
    // Whether adaptive can run is passed in rather than looked up. Asking it here
    // meant importing Settings, and Settings reaches most of the application, so a
    // leaf that draws a row of buttons was made to depend on the whole graph: the
    // initial chunk grew by five kilobytes and the budget gate failed. The caller
    // already knows the answer, because it is the module that owns the predicate.
    if (!adaptive) return;
    if (responseMs<MIN_RESPONSE_MS) return;
    // The confidence has exactly one reader: the scheduler's overconfidence
    // correction, and the scheduler cannot run without a store that outlives the
    // session. Asking in a browser would collect a judgment the learner has no way
    // to know is discarded, so the row stays hidden there.
    let row=dom.help.confidenceRow;
    if (!row) return;
    for(let button of dom.help.confidenceButtons){
        let value=button.dataset.confidence as Confidence|undefined;
        // After a correct answer the two extremes are the informative ones, so the
        // middle one is removed rather than shown and ignored.
        setHidden(button, value!==undefined&&confidenceChoices(correct).indexOf(value)<0);
        button.classList.remove("selected");
    }
    setHidden(row, false);
}

/**
 * Appends one labeled line to the help panel.
 *
 * @param panel - The panel to append to.
 * @param label - The label for the line.
 * @param text - The line's text.
 */
function appendPanelRow(panel: HTMLElement, label: string, text: string): void{
    let row=document.createElement("div");
    row.className="hint-row";
    let tag=document.createElement("span");
    tag.className="hint-label";
    tag.textContent=label;
    let body=document.createElement("span");
    body.className="hint-text";
    body.textContent=text;
    row.appendChild(tag);
    row.appendChild(body);
    panel.appendChild(row);
}
/**
 * Hides the confidence prompt, which is what happens on a new question.
 */
export function hideConfidence(): void{
    let row=dom.help.confidenceRow;
    setHidden(row, true);
    questionState.confidence=undefined;
}

/**
 * Records the confidence the learner reported, so the next review can use it.
 *
 * @param value - What they said.
 * @param adaptive - Whether adaptive learning can run here, for the same reason it is
 *   passed to `ask` rather than looked up.
 */
export function recordConfidence(value: Confidence, adaptive: boolean): void{
    // A button still on screen is not evidence that adaptive can run: the learner
    // can switch to a private session after the row was revealed. Hiding the row is
    // not enough on its own, because a click that has already been bound would
    // still write a confidence no scheduler will ever read.
    if (!adaptive) return;
    questionState.confidence=value;
    for(let button of dom.help.confidenceButtons){
        button.classList.toggle("selected", button.dataset.confidence===value);
    }
    // The row is hidden directly rather than through hideConfidence, because that
    // function clears the value and this call had just set it. Asking the question and
    // then destroying the answer inside one synchronous call is why the confidence
    // never reached a record on any platform: not in a browser, where it is now
    // hidden, and not on the desktop, where it was shown.
    setHidden(dom.help.confidenceRow, true);
}