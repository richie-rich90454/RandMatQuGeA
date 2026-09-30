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
 * rather than a judgement. It is therefore asked once a question has been thought
 * about, on the questions where the answer is informative.
 */
import{dom}from"../core/DomRegistry";
import{questionState}from"../core/QuestionState";
import * as reviewStore from"./ReviewStore";
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
 * Prepares the help for a newly generated question, closing anything the previous
 * question had open.
 *
 * @param dto - The generated question.
 */
export function prepareHelp(dto: QuestionDto): void{
    revealed=0;
    ladder=buildHintLadder(dto);
    solution=buildSolution(dto);
    questionState.subSkill=dto.subskill;
    if (dom.help.hintPanel){
        dom.help.hintPanel.hidden=true;
        dom.help.hintPanel.innerHTML="";
    }
    if (dom.help.showHintBtn){
        dom.help.showHintBtn.disabled=ladder===null;
        dom.help.showHintBtn.textContent="Hint";
    }
    if (dom.help.showSolutionBtn){
        dom.help.showSolutionBtn.hidden=solution===null;
    }
    hideConfidence();
}

/**
 * Reveals the next rung of the ladder, or the concession once the rungs are spent.
 */
export function revealNextHint(): void{
    if (!ladder) return;
    let panel=dom.help.hintPanel;
    if (!panel) return;
    if (revealed<Math.min(MAX_RUNGS, ladder.rungs.length)){
        let text=ladder.rungs[revealed];
        revealed++;
        appendPanelRow(panel, "Hint "+revealed, text);
        panel.hidden=false;
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
 * Shows the worked solution, or says plainly that this question does not have one
 * rather than showing an empty section.
 */
export function showSolution(): void{
    let panel=dom.help.hintPanel;
    if (!panel) return;
    if (!solution){
        appendPanelRow(panel, "Solution", "This question has one step, so the answer above is the whole of it.");
        panel.hidden=false;
        return;
    }
    for(let step of solution){
        appendPanelRow(panel, "Step", step);
    }
    panel.hidden=false;
}

/**
 * Appends one labelled line to the help panel.
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
 * Asks the learner how sure they were, but only when the answer was informative
 * enough to be worth asking about: long enough that they were not guessing, and on
 * a question where confidence actually changes the schedule.
 *
 * @param correct - Whether the answer just given was correct.
 * @param responseMs - How long the question was on screen.
 */
export function offerConfidence(correct: boolean, responseMs: number): void{
    if (responseMs<MIN_RESPONSE_MS) return;
    let row=dom.help.confidenceRow;
    if (!row) return;
    for(let button of dom.help.confidenceButtons){
        let value=button.dataset.confidence as Confidence|undefined;
        // After a correct answer the two extremes are the informative ones, so the
        // middle one is removed rather than shown and ignored.
        button.hidden=value!==undefined&&reviewStore.confidenceChoices(correct).indexOf(value)<0;
        button.classList.remove("selected");
    }
    row.hidden=false;
}

/**
 * Hides the confidence prompt, which is what happens on a new question.
 */
export function hideConfidence(): void{
    let row=dom.help.confidenceRow;
    if (row) row.hidden=true;
    questionState.confidence=undefined;
}

/**
 * Records the confidence the learner reported, so the next review can use it.
 *
 * @param value - What they said.
 */
export function recordConfidence(value: Confidence): void{
    questionState.confidence=value;
    for(let button of dom.help.confidenceButtons){
        button.classList.toggle("selected", button.dataset.confidence===value);
    }
    hideConfidence();
}
