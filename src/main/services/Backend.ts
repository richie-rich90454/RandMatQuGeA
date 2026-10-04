/**
 * @file Every Tauri call the app makes, behind one capability-checked seam.
 * @description Application code never touches a Tauri plugin directly. Each
 * function here checks whether the desktop runtime is present and either
 * invokes the command or returns the typed fallback the caller already
 * handles, so a surface that is hidden where it cannot work stays hidden and
 * a caller that toasted on failure still toasts. The camelCase names map to
 * the snake_case commands in `src-tauri/src/lib.rs`, and the IPC argument
 * keys are passed exactly as each call site passed them before the move.
 */
import{invoke}from"@tauri-apps/api/core";
import{open as openDialog,save as saveDialog}from"@tauri-apps/plugin-dialog";
import type{OpenDialogOptions,SaveDialogOptions}from"@tauri-apps/plugin-dialog";
import{check as checkUpdateCommand}from"@tauri-apps/plugin-updater";
import type{Update}from"@tauri-apps/plugin-updater";
import{relaunch as relaunchCommand}from"@tauri-apps/plugin-process";
import{getCurrentWindow}from"@tauri-apps/api/window";
import type{Window}from"@tauri-apps/api/window";
import{isTauri}from"../../utils/envUtils";
import type{ExportDocument,ImportMode}from"../DataManagement";
/** A difficulty recommendation with the weakest topic, as the backend sends it. */
export interface Recommendation{
    difficulty: string;
    weak_topic: string|null;
}
/** One weak topic row, as the backend sends it. */
export interface WeakTopic{
    topic_id: string;
    accuracy: number;
    attempts: number;
}
/** One aggregate row, as the backend sends it. */
export interface PerformanceStat{
    topic_id: string;
    difficulty: string;
    accuracy: number;
    attempts: number;
    avg_time_ms?: number;
}
/** One saved score, as the backend sends it. */
export interface ScoreEntry{
    id: number;
    topic: string;
    score: number;
    total: number;
    difficulty: string;
    date: string;
}
/** A score as it is handed to the backend, before it has an id. */
export interface NewScoreEntry{
    topic: string;
    score: number;
    total: number;
    difficulty: string;
    date: string;
}
/** A remembered skill row, as the desktop database returns it. */
export interface DesktopSkillRow{
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
/** One remembered skill, as the schedule is written back. */
export interface SkillScheduleInput{
    topicId: string;
    subSkill: string;
    stability: number;
    difficulty: number;
    lastReview: number|null;
    due: number|null;
    reviews: number;
    correctReviews: number;
    aoa: number;
}
/** What an import wrote, as the backend reports it. */
export interface ImportSummary{
    mode: ImportMode;
    attempts: number;
    skills: number;
    stats: number;
    records: number;
}
/**
 * Records one answer in the aggregate the recommendations read.
 *
 * @param topicId - The topic practiced.
 * @param difficulty - The difficulty met.
 * @param correct - Whether the answer was right.
 * @param responseTimeMs - How long the answer took.
 * @param errorType - The classified error, if any.
 * @returns A promise resolving once the write has been attempted.
 */
export async function savePerformance(topicId: string, difficulty: string, correct: boolean, responseTimeMs: number, errorType: string|null): Promise<void>{
    if(!isTauri()) return;
    await invoke("save_performance",{topicId:topicId,difficulty:difficulty,correct:correct,responseTimeMs:responseTimeMs,errorType:errorType});
}
/**
 * Asks what to practice next.
 *
 * @param currentTopic - The topic on screen, if any.
 * @param currentDifficulty - The difficulty on screen.
 * @returns A promise resolving to the recommendation.
 */
export async function getNextQuestionRecommendation(currentTopic: string|null, currentDifficulty: string): Promise<Recommendation>{
    if(!isTauri()) throw new Error("Not running in Tauri environment");
    return await invoke<Recommendation>("get_next_question_recommendation",{currentTopic:currentTopic,currentDifficulty:currentDifficulty});
}
/**
 * Lists the weakest topics.
 *
 * @param limit - How many to return.
 * @returns A promise resolving to the rows, or an empty list outside Tauri.
 */
export async function getWeakTopics(limit: number): Promise<Array<WeakTopic>>{
    if(!isTauri()) return [];
    return await invoke<Array<WeakTopic>>("get_weak_topics",{limit:limit});
}
/**
 * Lists the aggregate the data dialog shows.
 *
 * @param difficulty - An optional difficulty filter.
 * @param days - An optional recency filter.
 * @returns A promise resolving to the rows, or an empty list outside Tauri.
 */
export async function getPerformanceStats(difficulty: string|null, days: number|null): Promise<Array<PerformanceStat>>{
    if(!isTauri()) return [];
    return await invoke<Array<PerformanceStat>>("get_performance_stats",{difficulty:difficulty,days:days});
}
/**
 * Erases one aggregate row.
 *
 * @param topicId - The topic whose record is being erased.
 * @param difficulty - The difficulty whose record is being erased.
 * @returns A promise resolving once the erasure has been attempted.
 */
export async function deletePerformanceRecord(topicId: string, difficulty: string): Promise<void>{
    if(!isTauri()) return;
    await invoke("delete_performance_record",{topicId:topicId,difficulty:difficulty});
}
/**
 * Erases the whole learning record from the desktop database.
 *
 * @returns A promise resolving once the erasure has been attempted.
 */
export async function clearPerformance(): Promise<void>{
    if(!isTauri()) return;
    await invoke("clear_performance");
}
/**
 * Deletes every score and aggregate row.
 *
 * @returns A promise resolving once the reset has been attempted.
 */
export async function resetAllData(): Promise<void>{
    if(!isTauri()) return;
    await invoke("reset_all_data");
}
/**
 * Saves one session score.
 *
 * @param entry - The score to save.
 * @returns A promise resolving once the save has been attempted.
 */
export async function saveScore(entry: NewScoreEntry): Promise<void>{
    if(!isTauri()) throw new Error("Score saving is only available in the desktop app.");
    await invoke("save_score",{entry:entry});
}
/**
 * Loads every saved score, newest first.
 *
 * @returns A promise resolving to the scores, or an empty list outside Tauri.
 */
export async function loadScores(): Promise<Array<ScoreEntry>>{
    if(!isTauri()) return [];
    return await invoke<Array<ScoreEntry>>("load_scores");
}
/**
 * Deletes one saved score.
 *
 * @param id - The score to delete.
 * @returns A promise resolving once the deletion has been attempted.
 */
export async function deleteScore(id: number): Promise<void>{
    if(!isTauri()) return;
    await invoke("delete_score",{id:id});
}
/**
 * Reads the whole learning record out of the desktop database, optionally
 * writing it to a file.
 *
 * @param path - The destination, or null to only read the record.
 * @returns A promise resolving to the record this device holds.
 */
export async function exportLearningRecord(path: string|null): Promise<ExportDocument>{
    if(!isTauri()) throw new Error("Not running in Tauri environment");
    return await invoke<ExportDocument>("export_learning_record",{path:path});
}
/**
 * Applies a learning record file to the desktop database.
 *
 * @param path - The file the learner chose.
 * @param mode - Whether the file merges with or replaces what is here.
 * @returns A promise resolving to what was written.
 */
export async function importLearningRecord(path: string, mode: ImportMode): Promise<ImportSummary>{
    if(!isTauri()) throw new Error("Not running in Tauri environment");
    return await invoke<ImportSummary>("import_learning_record",{path:path,mode:mode});
}
/**
 * Loads every remembered skill from the desktop database.
 *
 * @returns A promise resolving to the rows, or an empty list outside Tauri.
 */
export async function loadSkillSchedule(): Promise<Array<DesktopSkillRow>>{
    if(!isTauri()) return [];
    return await invoke<Array<DesktopSkillRow>>("load_skill_schedule");
}
/**
 * Records one answer in full, as well as in the aggregate.
 *
 * @param topicId - The topic practiced.
 * @param subSkill - The procedure within the topic.
 * @param difficulty - The difficulty met.
 * @param correct - Whether the answer was right.
 * @param responseMs - How long the answer took.
 * @param confidence - The confidence the learner reported, if any.
 * @param errorType - The classified error, if any.
 * @param answeredAt - When the answer happened, in epoch milliseconds.
 * @returns A promise resolving to the new row id.
 */
export async function saveAttempt(topicId: string, subSkill: string, difficulty: string, correct: boolean, responseMs: number, confidence: string|null, errorType: string|null, answeredAt: number): Promise<number>{
    if(!isTauri()) throw new Error("Not running in Tauri environment");
    return await invoke<number>("save_attempt",{topicId:topicId,subSkill:subSkill,difficulty:difficulty,correct:correct,responseMs:responseMs,confidence:confidence,errorType:errorType,answeredAt:answeredAt});
}
/**
 * Writes the computed schedule back to the desktop database.
 *
 * @param skills - The skills to write.
 * @returns A promise resolving once the write has been attempted.
 */
export async function saveSkillSchedule(skills: Array<SkillScheduleInput>): Promise<void>{
    if(!isTauri()) return;
    await invoke("save_skill_schedule",{skills:skills});
}
/**
 * Draws a worksheet seed from the backend.
 *
 * @returns A promise resolving to the seed.
 */
export async function generateWorksheetSeed(): Promise<number>{
    if(!isTauri()) throw new Error("Not running in Tauri environment");
    return await invoke<number>("generate_worksheet_seed");
}
/**
 * Exports a worksheet to a PDF through the backend.
 *
 * @param questions - The question DTOs to render.
 * @param opts - The worksheet options.
 * @param filepath - Where to write the file.
 * @returns A promise resolving once the export has finished.
 */
export async function exportWorksheetPdf(questions: unknown, opts: unknown, filepath: string): Promise<void>{
    if(!isTauri()) throw new Error("Not running in Tauri environment");
    await invoke("export_worksheet_pdf",{questions:questions,opts:opts,filepath:filepath});
}
/**
 * Opens a file dialog.
 *
 * @param options - The dialog options.
 * @returns A promise resolving to the chosen path, or null outside Tauri.
 */
export async function openFileDialog(options: OpenDialogOptions): Promise<string|string[]|null>{
    if(!isTauri()) return null;
    return await openDialog(options);
}
/**
 * Opens a save dialog.
 *
 * @param options - The dialog options.
 * @returns A promise resolving to the chosen path, or null outside Tauri.
 */
export async function saveFileDialog(options: SaveDialogOptions): Promise<string|null>{
    if(!isTauri()) return null;
    return await saveDialog(options);
}
/**
 * Checks the configured endpoints for an available update.
 *
 * @returns A promise resolving to the update, or null where updates cannot run.
 */
export async function checkForUpdate(): Promise<Update|null>{
    if(!isTauri()) return null;
    return await checkUpdateCommand();
}
/**
 * Relaunches the app, which is what happens after an update is installed.
 *
 * @returns A promise resolving once the relaunch has been requested.
 */
export async function relaunchApp(): Promise<void>{
    if(!isTauri()) return;
    await relaunchCommand();
}
/**
 * Returns the current window, or null where there is none.
 *
 * @returns The window, or null outside Tauri.
 */
export function getAppWindow(): Window|null{
    if(!isTauri()) return null;
    try{
        return getCurrentWindow();
    }
    catch(e){
        console.warn("[Backend] Could not get the current window:",e);
        return null;
    }
}
