/**
 * @file The daily challenge as a mode.
 * @description The daily set is its own mode rather than a button, because it is
 * the only mode where the order of questions is fixed in advance. Single mode asks
 * for whatever the learner selects and the schedule suggests; daily mode walks a
 * set that was decided this morning and will not change if the learner refreshes.
 *
 * Progress and streak are derived from the set itself rather than kept as separate
 * counters, so a streak cannot disagree with the answers that earned it. The set
 * for a day is stored whole, which is what makes a refresh mid-set resume where it
 * left off rather than restarting, and it is stored through the privacy module, so
 * a private session genuinely forgets the streak when the tab closes.
 *
 * The set is derived from the date and needs no record, so it is offered in every
 * runtime. The streak is a record rather than a count, and the scheduler's reason
 * describes spacing decided from one, so both are removed where adaptive learning
 * cannot run rather than shown with a number they cannot stand behind.
 */
import{setHidden}from"../core/DomVisibility";
import{dom}from"../core/DomRegistry";
import{appState}from"../core/StateStore";
import{effectivePersistence}from"../Settings";
import{adaptiveAvailable}from"../../utils/envUtils";
import * as ui from"../Ui";
import * as generation from"../Generation";
import * as topics from"../Topics";
import {buildDaily, localDate, dailyProgress, streakAfter}from"./DailyChallenge";
import type{DailyChallenge, DailySlot}from"./DailyChallenge";
import type{ScheduleDecision}from"./Scheduler";

/** Where today's set and its progress are kept. */
const PROGRESS_KEY="dailyProgress";

/** The set for today, rebuilt whenever the date changes. */
let today: DailyChallenge|null=null;

/** The slots already answered, by their position in the set. */
let answered=new Set<number>();

/** The slot being asked now. */
let current=-1;

/** Whether the daily mode is active. */
let active=false;

/** What mode to return to when the learner leaves daily. */
let previousMode:"single"|"mental"="single";

/**
 * Builds today's set from the topics in scope and the current schedule, and
 * restores however much of it has already been answered.
 *
 * @param reviews - The adaptive decisions for the topics in scope.
 * @returns A promise resolving to today's set.
 */
async function load(reviews: ScheduleDecision[]): Promise<DailyChallenge>{
    let date=localDate();
    if (today&&today.date===date){
        return today;
    }
    today=buildDaily(date, topicsInScope(), reviews);
    current=-1;
    answered=new Set();
    let store=await import("./Storage");
    let stored=await store.read<{ date: string; answered: number[] }>(PROGRESS_KEY);
    if (stored&&stored.date===date){
        answered=new Set(stored.answered);
        // The slot after the last one answered is where to resume, so a refresh
        // mid-set continues rather than starting the day again.
        current=stored.answered.length;
    }
    await persist();
    return today;
}

/**
 * Writes the progress for today, which is what survives a reload.
 */
async function persist(): Promise<void>{
    let store=await import("./Storage");
    await store.write(PROGRESS_KEY, {date: localDate(), answered: [...answered]});
}

/**
 * The topics in the learner's current scope, in a stable order.
 *
 * @returns The topic ids in scope.
 */
function topicsInScope(): string[]{
    let mode=appState.currentMode==="mental"?appState.mentalScope:appState.scope;
    let select=dom.inputs.mentalScopeSelect;
    void select;
    // The scope lists live in the constants module; the scope helpers already
    // know which one is in force, so the ids are taken from the registry rather
    // than reconstructed here.
    return topics.scopeTopicIds(mode);
}

/**
 * Switches into the daily mode.
 *
 * @returns A promise resolving once the set is on screen.
 */
export async function enter(): Promise<void>{
    let reviewStore=await import("./ReviewStore");
    let decisions=reviewStore.planFor(topicsInScope());
    await load(decisions);
    active=true;
    appState.currentMode="single";
    syncModeButtons();
    let summary=dom.daily.dailySummary;
    setHidden(summary, false);
    renderSummary();
    await next();
}

/**
 * Leaves the daily mode and returns to the mode it came from.
 */
export function leave(): void{
    active=false;
    current=-1;
    answered=new Set();
    let summary=dom.daily.dailySummary;
    setHidden(summary, true);
    syncModeButtons();
    void persist();
    appState.currentMode=previousMode;
}

/**
 * Reports whether the daily mode is the one in force.
 *
 * @returns True when active.
 */
export function isActive(): boolean{
    return active;
}

/**
 * Remembers which mode the learner came from, so leaving daily restores it.
 *
 * @param mode - The mode being left.
 */
export function rememberMode(mode: "single"|"mental"): void{
    if (!active) previousMode=mode;
}

/**
 * Marks the daily button pressed so the mode is legible from the toolbar.
 */
function syncModeButtons(): void{
    let single=dom.buttons.modeSingleBtn;
    let mental=dom.buttons.modeMentalBtn;
    let daily=dom.daily.modeDailyBtn;
    if (single){
        single.classList.toggle("active", !active&&appState.currentMode==="single");
        single.setAttribute("aria-pressed", String(!active&&appState.currentMode==="single"));
    }
    if (mental){
        mental.classList.toggle("active", !active&&appState.currentMode==="mental");
        mental.setAttribute("aria-pressed", String(!active&&appState.currentMode==="mental"));
    }
    if (daily){
        daily.classList.toggle("active", active);
        daily.setAttribute("aria-pressed", String(active));
    }
}

/**
 * Shows how much of the day is done and, where something is kept, what the streak
 * is.
 */
function renderSummary(): void{
    if (!today) return;
    let progress=dailyProgress(today, answered.size);
    let track=dom.daily.dailyProgress;
    let fill=dom.daily.dailyProgressFill;
    let text=dom.daily.dailySummaryText;
    if (track) track.setAttribute("aria-valuenow", String(Math.round(progress*100)));
    if (fill) fill.style.width=Math.round(progress*100)+"%";
    let done=answered.size+" of "+today.slots.length+" done";
    // A streak is a record and not a count. The completed days behind it are read
    // from memory, so without somewhere to keep them the badge could only ever
    // report today's own answer and would reset on every reload — a streak the app
    // cannot stand behind. The set itself is derived from the date, so it works
    // everywhere and only the streak is removed.
    if (!adaptiveAvailable(effectivePersistence())){
        setHidden(dom.daily.dailyStreak, true);
        if (text) text.textContent=done;
        return;
    }
    if (text){
        let state=streakAfter(today, answered.size, completedDays());
        text.textContent=done+(state.streak>1?" · "+state.streak+" day streak":"");
    }
    let streak=dom.daily.dailyStreak;
    let count=dom.daily.dailyStreakCount;
    setHidden(streak, false);
    if (count){
        let state=streakAfter(today, answered.size, completedDays());
        count.textContent=String(state.streak);
    }
}

/**
 * The days already completed, read from storage. A private session has none,
 * which is the correct outcome rather than a defect.
 *
 * @returns The completed days as date strings.
 */
function completedDays(): string[]{
    let days=completedCache;
    return days;
}

/** The completed days for the current tab, kept in memory to avoid a read per render. */
let completedCache:string[]=[];

/**
 * Records a completed day once the last slot has been answered.
 */
async function markCompleted(): Promise<void>{
    if (!today) return;
    let date=today.date;
    if (completedCache.indexOf(date)<0){
        completedCache=[...completedCache, date];
    }
    let store=await import("./Storage");
    await store.write("dailyCompleted", completedCache);
}

/**
 * Loads the completed days into memory.
 *
 * @returns A promise resolving once they are loaded.
 */
export async function loadCompleted(): Promise<void>{
    let store=await import("./Storage");
    let stored=await store.read<string[]>("dailyCompleted");
    completedCache=Array.isArray(stored)?stored:[];
}

/**
 * Asks for the next slot in today's set, or says plainly that the day is finished.
 */
export async function next(): Promise<void>{
    if (!today||today.slots.length===0){
        ui.showNotification("No topics are in scope for today's set.");
        return;
    }
    // Before the first question of a day `current` is -1, which is how "nothing
    // answered yet" is recorded, and the first slot to ask is index zero. Without
    // this the first call indexes slots[-1], which is undefined, and the daily
    // challenge throws before a question ever reaches the screen.
    if (current<0) current=0;
    if (current>=today.slots.length){
        await markCompleted();
        renderSummary();
        ui.showNotification("Today's set is complete.");
        return;
    }
    let slot:DailySlot=today.slots[current];
    if (!topics.isTopicInScope(slot.topicId)){
        current++;
        await next();
        return;
    }
    topics.selectTopic(slot.topicId);
    // The reason is scheduler prose about when a skill is due, which describes
    // spacing decided from a review record. Where that record cannot exist there is
    // no schedule running to explain, so only the position in the set is shown.
    let reason=adaptiveAvailable(effectivePersistence())
        ?" · "+(slot.reason?slot.reason:"Part of today's set")
        : "";
    ui.showNotification("Question "+(current+1)+" of "+today.slots.length+reason);
    await generation.generateQuestion(slot.topicId);
}

/**
 * Records that the slot now on screen has been answered, and moves the set along.
 *
 * @returns A promise resolving once the next slot is asked.
 */
export async function completeCurrent(): Promise<void>{
    if (!active||current<0||!today) return;
    answered.add(current);
    current++;
    await persist();
    renderSummary();
    await next();
}

/**
 * Reports how far through the day the learner is, for the progress bar.
 *
 * @returns The proportion complete, or zero when there is no set.
 */
export function progress(): number{
    return today?dailyProgress(today, answered.size):0;
}