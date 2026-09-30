/**
 * @file The review scheduler: when a skill should come back, and which skill
 * should be asked for now.
 * @description Two models are combined, because each covers the other's blind spot.
 *
 * Free Spaced Repetition schedules by memory: a card that was recalled well gains
 * stability and comes back later, one that was forgotten loses it and comes back
 * soon. It knows nothing about the learner, though. Someone who answers correctly
 * while certain they would fail needs to be asked again regardless of how stable
 * the card is, and someone who answers correctly while expecting to fail needs
 * more time, not less.
 *
 * Adaptive Overconfidence Adjustment supplies that. Every answer is recorded with
 * the confidence the learner reported, and the gap between that confidence and
 * the outcome becomes a correction on the retrievability the schedule aims for.
 * A consistently overconfident learner is pulled back sooner and the interval is
 * shortened, and a consistently underconfident learner is given the credit they
 * are due.
 *
 * The result is a single number per skill: the next due date, a priority for
 * choosing the next question, and enough state to explain the decision to the
 * learner, because a schedule the learner cannot see is a schedule they will
 * not trust.
 */

/** The dates and weights the two models share. */
const MS_PER_DAY=86400000;
const MIN_INTERVAL_DAYS=1;
const MAX_INTERVAL_DAYS=365;

/** The proportion of memory still available at the moment of review. */
const TARGET_RETRIEVABILITY=0.9;

/**
 * How strongly a confidence mistake moves the retrievability target, per unit of
 * over or under confidence. One full unit of overconfidence, meaning a learner
 * who was certain and wrong, is worth about a fifth of the target interval, which
 * is roughly the effect of having failed the card outright.
 */
const OVERCONFIDENCE_WEIGHT=0.2;

/** The floor and ceiling on that correction, so a run of luck cannot freeze a skill. */
const MIN_AOA_CORRECTION=-0.05;
const MAX_AOA_CORRECTION=0.15;

/** The default stability of a skill nobody has reviewed yet. */
const INITIAL_STABILITY=1;

/** The bounds on difficulty, which FSRS keeps on a one to ten scale. */
const MIN_DIFFICULTY=1;
const MAX_DIFFICULTY=10;

/** What the learner said they expected when they answered. */
export type Confidence="low"|"medium"|"high";

/** The numeric confidence each report stands for. */
const CONFIDENCE_VALUE: Record<Confidence, number>={
    low: 0.5,
    medium: 0.75,
    high: 0.95
};

/** One review, as the learner performed it. */
export interface ReviewOutcome{
    /** The topic practised. */
    topicId: string;
    /** The procedure inside that topic, when the generator named one. */
    subSkill?: string;
    /** Whether the answer was correct. */
    correct: boolean;
    /** How long the learner took, in milliseconds. */
    responseMs?: number;
    /** The confidence the learner reported, when they reported one. */
    confidence?: Confidence;
    /** When the review happened, in epoch milliseconds. */
    at?: number;
}

/** The remembered state of one skill. */
export interface SkillState{
    /** Memory stability in days. */
    stability: number;
    /** Difficulty on a one to ten scale. */
    difficulty: number;
    /** When the skill was last reviewed, in epoch milliseconds. */
    lastReview?: number;
    /** When the skill should next be asked, in epoch milliseconds. */
    due?: number;
    /** How many times the skill has been reviewed. */
    reviews: number;
    /** How many of those were correct. */
    correctReviews: number;
    /** The running mean of the reported confidence minus the outcome. */
    aoa: number;
}

/** A skill together with the decision the scheduler made about it. */
export interface ScheduleDecision{
    /** The skill being scheduled. */
    topicId: string;
    /** The procedure within the topic, when there is one. */
    subSkill?: string;
    /** When it should next be asked. */
    due: number;
    /** How urgently, where a larger number means sooner. */
    priority: number;
    /** The interval chosen, in days, for the learner-facing explanation. */
    intervalDays: number;
    /** Why the interval is what it is, for the learner-facing explanation. */
    reason: string;
}

/** Builds the state for a skill nobody has reviewed. */
export function newSkillState(): SkillState{
    return {
        stability: INITIAL_STABILITY,
        difficulty: 5,
        reviews: 0,
        correctReviews: 0,
        aoa: 0
    };
}

/**
 * Reports the proportion of a memory still available after a given number of
 * days, which is the exponential forgetting curve a stability parameterises.
 *
 * @param stabilityDays - Stability in days.
 * @param elapsedDays - Days since the last review.
 * @returns Retrievability between zero and one.
 */
export function retrievability(stabilityDays: number, elapsedDays: number): number{
    if (stabilityDays<=0) return 0;
    if (elapsedDays<=0) return 1;
    return Math.pow(0.9, elapsedDays/stabilityDays);
}

/**
 * Returns the number of days after which retrievability falls to the target,
 * given a stability. This is the inverse of the forgetting curve, and it is what
 * turns a memory strength into a calendar interval.
 *
 * @param stabilityDays - Stability in days.
 * @param target - The retrievability to aim for. Defaults to 0.9.
 * @returns The interval in days.
 */
export function intervalFor(stabilityDays: number, target: number=TARGET_RETRIEVABILITY): number{
    if (stabilityDays<=0) return MIN_INTERVAL_DAYS;
    if (target<=0||target>=1) return MIN_INTERVAL_DAYS;
    return Math.max(MIN_INTERVAL_DAYS, Math.min(MAX_INTERVAL_DAYS, stabilityDays*Math.log(target)/Math.log(0.9)));
}

/**
 * Applies a review to a skill and returns the updated state, without mutating
 * the state it was given, so a caller can compare before committing.
 *
 * @param state - The remembered state, or undefined for a skill never seen.
 * @param outcome - What the learner did.
 * @returns The new state.
 */
export function applyReview(state: SkillState|undefined, outcome: ReviewOutcome): SkillState{
    let next: SkillState=state?{...state}:newSkillState();
    let at=outcome.at??Date.now();
    // A first review has no interval to grow from, so it is graded the way a new
    // card is: the outcome sets the starting memory rather than adjusting it.
    let firstReview=next.reviews===0;
    next.reviews++;
    if (outcome.correct) next.correctReviews++;
    let elapsedDays=next.lastReview===undefined?0:(at-next.lastReview)/MS_PER_DAY;
    let retrievabilityBefore=firstReview?0:retrievability(next.stability, elapsedDays);
    if (outcome.correct){
        // A success that was still hard to recall should not grant much memory,
        // which is why the outcome is weighted by how retrievable the card was.
        let recallWeight=firstReview?1:0.5+0.5*retrievabilityBefore;
        let growth=1+Math.max(0.1, (next.stability/INITIAL_STABILITY)**-0.2)*recallWeight*recallWeight;
        next.stability=Math.min(MAX_INTERVAL_DAYS, Math.max(1, next.stability*growth));
        next.difficulty=clampDifficulty(next.difficulty-0.4);
    }
    else{
        // A lapse is proportional to how much was expected to survive, so
        // forgetting an easy card costs more than forgetting a hard one.
        let shortfall=firstReview?1:(1-retrievabilityBefore);
        next.stability=Math.max(0.4, next.stability*Math.max(0.2, 0.6-0.4*shortfall));
        next.difficulty=clampDifficulty(next.difficulty+0.9);
    }
    if (outcome.confidence!==undefined){
        // The signed gap between what was expected and what happened, averaged
        // over the skill's history. A positive value means overconfident.
        let expected=CONFIDENCE_VALUE[outcome.confidence];
        let actual=outcome.correct?1:0;
        let gap=expected-actual;
        let weight=1/next.reviews;
        next.aoa=clampAoa(next.aoa+(gap-next.aoa)*weight);
    }
    next.lastReview=at;
    next.due=at+intervalFor(next.stability)*MS_PER_DAY;
    return next;
}

/**
 * Returns the retrievability target the schedule should aim for, after the
 * overconfidence correction. This is where the two models meet: the memory model
 * proposes an interval and the confidence record adjusts what counts as enough
 * memory.
 *
 * @param state - The remembered state.
 * @returns The target, higher when the learner has been underconfident.
 */
export function correctedTarget(state: SkillState): number{
    let correction=-state.aoa*OVERCONFIDENCE_WEIGHT;
    correction=Math.max(MIN_AOA_CORRECTION, Math.min(MAX_AOA_CORRECTION, correction));
    // A higher target means the interval is shorter, so an overconfident learner
    // is asked again sooner and an underconfident learner gets more credit.
    return Math.max(0.7, Math.min(0.97, TARGET_RETRIEVABILITY-correction));
}

/**
 * Turns a skill's state into the decision the rest of the app acts on.
 *
 * @param state - The remembered state, or undefined for a skill never seen.
 * @param topicId - The topic.
 * @param subSkill - The procedure within the topic.
 * @param now - The current time in epoch milliseconds.
 * @returns The decision.
 */
export function decide(state: SkillState|undefined, topicId: string, subSkill: string|undefined, now: number=Date.now()): ScheduleDecision{
    if (!state||state.reviews===0){
        // Never seen: due immediately and urgent, because a learner who has not
        // met a skill needs it more than one they have half learned.
        return {
            topicId,
            subSkill,
            due: 0,
            priority: 1,
            intervalDays: 0,
            reason: "Not practised yet"
        };
    }
    let target=correctedTarget(state);
    let intervalDays=intervalFor(state.stability, target);
    let due=state.lastReview===undefined?now:state.lastReview+intervalDays*MS_PER_DAY;
    // Overdue skills rise in priority with how overdue they are; skills that are
    // not yet due fall below, and a skill that is far from due falls further.
    let daysOverdue=(now-due)/MS_PER_DAY;
    let priority=0.5+daysOverdue*0.5;
    if (state.aoa>0.15) priority+=0.2;
    if (state.aoa<-0.15) priority-=0.1;
    let accuracy=state.correctReviews/state.reviews;
    priority+=(1-accuracy)*0.3;
    return {
        topicId,
        subSkill,
        due,
        priority,
        intervalDays,
        reason: explain(state, intervalDays)
    };
}

/**
 * Writes the sentence a learner sees next to a due date, so a schedule that
 * looks arbitrary is at least explained.
 *
 * @param state - The remembered state.
 * @param intervalDays - The interval chosen.
 * @returns A short explanation.
 */
function explain(state: SkillState, intervalDays: number): string{
    let accuracy=Math.round((state.correctReviews/state.reviews)*100);
    if (state.aoa>0.2) return `Correct ${accuracy}% of the time, but often more certain than the result warrants, so this comes back sooner`;
    if (state.aoa<-0.2) return `Correct ${accuracy}% of the time and usually doubted it, so this can wait longer`;
    if (accuracy===100) return `Correct every time, so this returns in ${Math.round(intervalDays)} days`;
    return `${accuracy}% correct, returning in ${Math.round(intervalDays)} days`;
}

/** Keeps a difficulty inside its documented range. */
function clampDifficulty(value: number): number{
    return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, value));
}

/** Keeps a correction inside its documented range. */
function clampAoa(value: number): number{
    return Math.max(-1, Math.min(1, value));
}

/**
 * Picks the next skills to practise from a set of candidates, most urgent first.
 * Ties are broken by the candidate's own position so the order is deterministic
 * for a given set of states, which is what makes a daily set reproducible.
 *
 * @param decisions - The candidate decisions.
 * @param count - How many to return.
 * @returns The chosen decisions, most urgent first.
 */
export function selectNext(decisions: ScheduleDecision[], count: number): ScheduleDecision[]{
    return decisions
        .map((decision, index)=>({decision, index}))
        .sort((a, b)=>{
            let byPriority=b.decision.priority-a.decision.priority;
            if (byPriority!==0) return byPriority;
            if (a.decision.due!==b.decision.due) return a.decision.due-b.decision.due;
            return a.index-b.index;
        })
        .slice(0, Math.max(0, count))
        .map(entry=>entry.decision);
}
