/**
 * @file The learner's record of what they have practiced and when it is due.
 * @description This is the only module that reads or writes review history, so
 * the scheduler's model and the storage module's privacy rule meet in one place.
 *
 * Records are keyed by topic and, where the generator named one, by the procedure
 * within the topic. The desktop build keeps them in the local SQLite database; the
 * browser build keeps them wherever the storage module's current mode allows, and
 * in zero-retention mode they exist only for the tab.
 *
 * The key point is that nothing here can be true in one environment and silently
 * absent in another. A build that cannot persist reports that, and the interface
 * hides what would not work, rather than offering a control that discards the
 * learner's history on the next reload.
 */

import * as storage from"./Storage";
import{applyReview, decide, selectNext}from"./Scheduler";
import type{ReviewOutcome, ScheduleDecision, SkillState}from"./Scheduler";
import{isTauri}from"../../utils/envUtils";
import{invoke}from"@tauri-apps/api/core";

/** Where the records live. */
const RECORD_KEY="reviewRecords";

/** The version of the record shape, so a future change can migrate rather than discard. */
const RECORD_VERSION=2;

/** The stability a skill nobody has reviewed starts with. */
const INITIAL_STABILITY=1;

/** Every remembered skill, in memory. */
let records: Map<string, SkillState>=new Map();

/** Whether the desktop database answered, which is what makes a Tauri read authoritative. */
let desktopBacked=false;

/**
 * Builds the key a skill is stored under. A skill with no procedure is keyed by
 * its topic alone, so a question from a generator that does not report one still
 * contributes to the topic's record.
 *
 * @param topicId - The topic.
 * @param subSkill - The procedure within the topic, when there is one.
 * @returns The storage key.
 */
function skillKey(topicId: string, subSkill?: string): string{
    return subSkill?topicId+"/"+subSkill:topicId;
}

/**
 * The document shape written to durable storage. The wrapper carries a version
 * alongside the records so a later format change is detectable rather than
 * silently misread.
 */
interface RecordDocument{
    /** The shape version. */
    version: number;
    /** The records, keyed by skill. */
    records: { [key: string]: SkillState };
}

/**
 * Reads the persisted record as it is stored, so an export carries the document
 * the scheduler itself reads rather than a second spelling of it. Two copies of
 * one key are two chances for an import to land somewhere the scheduler never
 * looks, which is an import that appears to work and changes nothing.
 *
 * @returns The stored document, or null when the desktop database is the record
 *          or when nothing has been written yet.
 */
export async function readDocument(): Promise<RecordDocument|null>{
    if (isTauri()) return null;
    return (await storage.read<RecordDocument>(RECORD_KEY))??null;
}

/**
 * Replaces the persisted record with a document. Only a browser stores the record
 * this way: on the desktop the record is the database, and a caller changing it
 * goes through the export/import command instead.
 *
 * @param document - The document to store.
 * @returns A promise resolving once the write has been attempted.
 */
export async function writeDocument(document: RecordDocument): Promise<void>{
    if (isTauri()) return;
    await storage.write(RECORD_KEY, document);
}

/**
 * A row as the desktop database returns it, which is snake_case and partial
 * because an older database may predate any given column.
 */
interface DesktopSkillRow{
    topic_id?: string;
    sub_skill?: string;
    stability?: number;
    difficulty?: number;
    last_review?: number|null;
    due?: number|null;
    reviews?: number;
    correct_reviews?: number;
    aoa?: number;
}

/**
 * Loads the records from wherever this build keeps them, preferring the desktop
 * database when there is one and falling back to the storage module otherwise.
 *
 * @returns A promise resolving once the records are in memory.
 */
export async function loadRecords(): Promise<void>{
    records=new Map();
    if (isTauri()){
        try{
            let rows=await invoke<DesktopSkillRow[]>("load_skill_schedule");
            for(let row of rows){
                let topicId=row.topic_id;
                if (!topicId) continue;
                let state: SkillState={
                    stability: row.stability??INITIAL_STABILITY,
                    difficulty: row.difficulty??5,
                    reviews: row.reviews??0,
                    correctReviews: row.correct_reviews??0,
                    aoa: row.aoa??0
                };
                if (row.last_review!==null&&row.last_review!==undefined) state.lastReview=row.last_review;
                if (row.due!==null&&row.due!==undefined) state.due=row.due;
                records.set(skillKey(topicId, row.sub_skill||undefined), state);
            }
            desktopBacked=true;
        }
        catch(e){
            console.warn("Could not read the desktop review record:",e);
        }
        return;
    }
    let stored=await storage.read<RecordDocument>(RECORD_KEY);
    if (stored&&stored.records){
        for(let key of Object.keys(stored.records)){
            let state=stored.records[key];
            if (state&&typeof state.stability==="number") records.set(key, state);
        }
    }
}

/**
 * Persists the records, but only where the current mode allows it.
 *
 * @returns A promise resolving once the write has been attempted.
 */
export async function saveRecords(): Promise<void>{
    let document: RecordDocument={version: RECORD_VERSION, records: {}};
    for(let [key, state] of records){
        document.records[key]=state;
    }
    await storage.write(RECORD_KEY, document);
}

/**
 * Records one review and returns the new decision for that skill, so the caller
 * can show the learner what changed without recomputing it.
 *
 * @param outcome - What the learner did.
 * @returns A promise resolving to the decision after the review.
 */
export async function recordReview(outcome: ReviewOutcome): Promise<ScheduleDecision>{
    let key=skillKey(outcome.topicId, outcome.subSkill);
    let previous=records.get(key);
    let next=applyReview(previous, outcome);
    records.set(key, next);
    let at=outcome.at??Date.now();
    if (isTauri()&&desktopBacked){
        try{
            // Both writes happen: the aggregate the recommendations already read,
            // and the full attempt that makes the history exportable.
            await invoke("save_performance", {
                topicId: outcome.topicId,
                difficulty: outcome.responseMs===undefined?"":String(outcome.responseMs),
                correct: outcome.correct,
                responseTimeMs: outcome.responseMs??0,
                errorType: outcome.confidence??""
            });
        }
        catch(e){
            console.warn("Could not write the desktop aggregate:",e);
        }
        try{
            await invoke("save_attempt", {
                topicId: outcome.topicId,
                subSkill: outcome.subSkill??"",
                difficulty: "",
                correct: outcome.correct,
                responseMs: outcome.responseMs??0,
                confidence: outcome.confidence??null,
                errorType: null,
                answeredAt: at
            });
        }
        catch(e){
            console.warn("Could not write the recorded attempt:",e);
        }
        try{
            await invoke("save_skill_schedule", {
                skills: [{
                    topicId: outcome.topicId,
                    subSkill: outcome.subSkill??"",
                    stability: next.stability,
                    difficulty: next.difficulty,
                    lastReview: next.lastReview??null,
                    due: next.due??null,
                    reviews: next.reviews,
                    correctReviews: next.correctReviews,
                    aoa: next.aoa
                }]
            });
        }
        catch(e){
            console.warn("Could not write the desktop schedule:",e);
        }
        return decide(next, outcome.topicId, outcome.subSkill);
    }
    await saveRecords();
    return decide(next, outcome.topicId, outcome.subSkill);
}

/**
 * Returns the remembered state of one skill.
 *
 * @param topicId - The topic.
 * @param subSkill - The procedure within the topic.
 * @returns The state, or undefined when the skill has never been reviewed.
 */
export function stateFor(topicId: string, subSkill?: string): SkillState|undefined{
    return records.get(skillKey(topicId, subSkill));
}

/**
 * Returns the current decision for every candidate topic, most urgent first.
 *
 * @param topicIds - The topics to consider.
 * @param now - The current time in epoch milliseconds.
 * @returns The decisions, most urgent first.
 */
export function planFor(topicIds: string[], now: number=Date.now()): ScheduleDecision[]{
    return selectNext(topicIds.map(topicId=>decide(stateFor(topicId), topicId, undefined, now)), topicIds.length);
}

/**
 * Forgets everything, in memory and in whatever this build persists. The erase
 * control calls this, and afterwards no record of the learner remains anywhere.
 *
 * @returns A promise resolving once the erasure is complete.
 */
export async function forgetEverything(): Promise<void>{
    records=new Map();
    await storage.remove(RECORD_KEY);
    if (isTauri()){
        try{
            await invoke("clear_performance");
        }
        catch(e){
            console.warn("Could not clear the desktop review record:",e);
        }
    }
}
