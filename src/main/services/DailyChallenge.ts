/**
 * @file The daily challenge: the same ten questions for everyone, on the same day.
 * @description A spaced repetition queue is good at closing a specific gap and bad
 * at giving a learner a reason to come back tomorrow, because what it asks for
 * changes depending on what happened in the last session. The daily set is the
 * opposite: the same questions for every learner, derived only from the date, so
 * two people can compare, a learner can share a link, and a streak has something
 * to be a streak about.
 *
 * The two are layered rather than competing. The daily set provides the spine and
 * the adaptive queue fills the remaining slots, so a learner is never drilled on
 * something due tomorrow at the cost of the day's work, and a learner with nothing
 * due is never left with a set of nine.
 *
 * Determinism is the whole contract. The same day must produce the same set on
 * every device and in every build, so the seed comes from the date alone and the
 * order is derived by sorting, never by iterating a map.
 */

import{seededRng}from"../core/Rng";
import{selectNext}from"./Scheduler";
import type{ScheduleDecision}from"./Scheduler";

/** How many questions a day's set holds. */
export const DAILY_SIZE=10;

/** The largest year the date seed accepts, so a malformed date cannot run the hash off. */
const MAX_YEAR=9999;

/** One question in a day's set. */
export interface DailySlot{
    /** The topic to ask. */
    topicId: string;
    /** The procedure within the topic, when the scheduler supplied one. */
    subSkill?: string;
    /** Whether this slot came from the daily spine or from the adaptive queue. */
    source:"daily"|"review";
    /** Why the learner is being asked, in one short phrase. */
    reason: string;
}

/** A day's set. */
export interface DailyChallenge{
    /** The date the set belongs to, as year, month and day. */
    date: string;
    /** The slots, in the order they should be asked. */
    slots: DailySlot[];
    /** The seed the set was derived from, so the set can be reproduced. */
    seed: number;
}

/**
 * Reports the local calendar day as year, month and day, which is what a person
 * means by "today". UTC would put the set's boundary at the wrong hour for
 * almost everyone, and a set that changes at four in the afternoon is not a daily
 * set.
 *
 * @param at - The instant to take the day from. Defaults to now.
 * @returns The date as year, month and day.
 */
export function localDate(at: number=Date.now()): string{
    let date=new Date(at);
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

/** Pads a number to two digits so the date is a fixed width and sorts as text. */
function pad(value: number): string{
    return value<10?"0"+value:String(value);
}

/**
 * Derives the 32-bit seed for a date. The same day always produces the same seed,
 * on any device, in any build, which is what makes the set reproducible.
 *
 * @param date - The date as year, month and day.
 * @returns A 32-bit seed.
 */
export function seedForDate(date: string): number{
    let [year, month, day]=date.split("-").map(part=>Number(part));
    if (!Number.isFinite(year)||!Number.isFinite(month)||!Number.isFinite(day)){
        // A malformed date must still produce a set rather than a crash, and
        // producing the same set for a malformed date is better than producing a
        // different one every time it is read.
        return 1;
    }
    if (year<0||year>MAX_YEAR){
        return 1;
    }
    // The year is folded into the hash so that the same month and day in different
    // years do not collide, which a day-of-year seed would.
    let seed=(year*10000+month*100+day)>>>0;
    seed^=seed>>>16;
    seed=Math.imul(seed,2246822507)>>>0;
    seed^=seed>>>13;
    seed=Math.imul(seed,3266489909)>>>0;
    seed^=seed>>>16;
    return seed>>>0;
}

/**
 * Builds the day's set. The daily spine is drawn from the topics in scope, one
 * per sub-skill where the scheduler has a record, and the adaptive queue fills
 * whatever slots remain.
 *
 * @param date - The date to build for. Defaults to today.
 * @param inScope - The topics the learner has chosen to study, in a stable order.
 * @param reviews - The adaptive decisions for the topics in scope.
 * @param size - How many slots the set holds. Defaults to ten.
 * @returns The day's challenge.
 */
export function buildDaily(date: string, inScope: string[], reviews: ScheduleDecision[], size: number=DAILY_SIZE): DailyChallenge{
    let seed=seedForDate(date);
    let rng=seededRng(seed);
    let spine=drawSpine(inScope, reviews, Math.max(0, size), rng);
    let chosen=new Set<string>(spine.map(slot=>slot.topicId));
    let slots: DailySlot[]=spine.slice();
    if (slots.length<size){
        // Everything the scheduler wants next, most urgent first, skipping what
        // the spine already covers so the set is not the same topic twice.
        for(let decision of selectNext(reviews, reviews.length)){
            if (slots.length>=size) break;
            if (chosen.has(decision.topicId)) continue;
            chosen.add(decision.topicId);
            slots.push({
                topicId: decision.topicId,
                subSkill: decision.subSkill,
                source: "review",
                reason: decision.reason
            });
        }
    }
    if (slots.length<size&&inScope.length>0){
        // Nothing was due and the spine came up short, which happens with a very
        // narrow scope. The set is topped up from scope rather than left short,
        // because a daily set that is not a full set is not a daily set.
        for(let topicId of rotate(inScope, seed)){
            if (slots.length>=size) break;
            if (chosen.has(topicId)) continue;
            chosen.add(topicId);
            slots.push({topicId, source: "daily", reason: "Part of today's set"});
        }
    }
    return {date, slots, seed};
}

/**
 * Draws the deterministic part of the set: one question per record the learner
 * has, drawn from the topics in scope, chosen by the date's seed.
 *
 * @param inScope - The topics in scope, in a stable order.
 * @param reviews - The adaptive decisions, used for the sub-skill and the reason.
 * @param size - How many slots to aim for.
 * @param rng - The seeded source.
 * @returns The drawn slots.
 */
function drawSpine(inScope: string[], reviews: ScheduleDecision[], size: number, rng: () => number): DailySlot[]{
    let byTopic=new Map<string, ScheduleDecision[]>();
    for(let decision of reviews){
        let list=byTopic.get(decision.topicId);
        if (!list){
            byTopic.set(decision.topicId, [decision]);
        }
        else{
            list.push(decision);
        }
    }
    // Sorting by topic id rather than iterating a map means the draw depends only
    // on the set of topics, never on the order they were recorded in.
    let candidates=inScope.slice().sort();
    let picked: DailySlot[]=[];
    for(let topicId of candidates){
        if (picked.length>=size) break;
        let known=byTopic.get(topicId);
        if (!known||known.length===0) continue;
        let choice=known[Math.floor(rng()*known.length)];
        picked.push({
            topicId,
            subSkill: choice.subSkill,
            source: "review",
            reason: choice.reason
        });
    }
    return picked;
}

/**
 * Returns the topics in a seeded rotation, so topping up a short set visits every
 * topic across successive days rather than always taking the first.
 *
 * @param topicIds - The topics to rotate.
 * @param seed - The day's seed.
 * @returns The rotated order.
 */
function rotate(topicIds: string[], seed: number): string[]{
    if (topicIds.length===0) return [];
    let offset=seed%topicIds.length;
    return topicIds.slice(offset).concat(topicIds.slice(0, offset));
}

/**
 * Reports how much of a day's set the learner has finished, so the interface can
 * show progress and a streak without keeping a separate counter.
 *
 * @param challenge - The day's set.
 * @param answered - How many slots have been answered.
 * @returns The proportion complete, between zero and one.
 */
export function dailyProgress(challenge: DailyChallenge, answered: number): number{
    if (challenge.slots.length===0) return 1;
    return Math.max(0, Math.min(1, answered/challenge.slots.length));
}

/**
 * Reports whether finishing the day's set continues a streak. A streak is counted
 * in days the learner completed, so the caller decides which days already count.
 *
 * @param challenge - The day's set.
 * @param answered - How many slots have been answered.
 * @param completedDays - The days already completed, as date strings.
 * @param at - The instant to take the day from. Defaults to now.
 * @returns The new streak length, and whether the day was completed today.
 */
export function streakAfter(challenge: DailyChallenge, answered: number, completedDays: string[], at: number=Date.now()): { streak: number; completedToday: boolean }{
    let today=localDate(at);
    let complete=answered>=challenge.slots.length&&challenge.slots.length>0;
    let days=new Set(completedDays);
    if (complete) days.add(today);
    else days.delete(today);
    // Counting back from today makes the streak a run of consecutive days rather
    // than a total, which is what a streak means to the person keeping it.
    let streak=0;
    let cursor=new Date(`${today}T00:00:00`);
    while(days.has(localDate(cursor.getTime()))){
        streak++;
        cursor.setDate(cursor.getDate()-1);
    }
    return {streak, completedToday: complete};
}
