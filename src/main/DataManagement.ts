/**
 * @file The place a learner takes their record away from this device, and puts a
 * record from another device into it.
 * @description Export and import carry the whole learning record: the review
 * history, every recorded answer, and the skill schedule. The three are separate
 * stores on the desktop and one store in the browser, so this module asks the
 * platform for the record and hands the same document back whichever platform it
 * is on.
 *
 * Two rules shape everything here:
 *
 * - Data goes where `Storage.ts` puts it. A browser export reads the record
 *   through that module and a browser import writes it back through the same
 *   module, so this file never touches IndexedDB, `localStorage`, or SQLite
 *   directly. The desktop asks Tauri for the document and for the file dialog,
 *   because the desktop database is the backend's business and not this file's.
 * - An import says what it did. Merging and replacing are different acts with
 *   different consequences for a learner's history, so the choice is explicit
 *   rather than inferred, and a document this build cannot read is refused
 *   before a single value is written.
 */

import{invoke}from"@tauri-apps/api/core";
import{open,save}from"@tauri-apps/plugin-dialog";
import{topics}from"./Constants";
import * as ui from"./Ui";
import{updateLeaderboard}from"./Session";
import{isTauri}from"../utils/envUtils";

/** The name the export dialog and the browser download both offer. */
const EXPORT_FILE_NAME="randmatqugea-learning-record.json";

/** What an import does with the record that is already here. */
export type ImportMode="merge"|"replace";

/** One recorded answer, as the record carries it. */
export interface ExportedAttempt{
    id: number;
    topic_id: string;
    sub_skill: string;
    difficulty: string;
    correct: number;
    response_ms: number;
    confidence: string|null;
    error_type: string|null;
    answered_at: number;
}

/** One remembered skill, as the record carries it. */
export interface ExportedSkill{
    topic_id: string;
    sub_skill: string;
    stability: number;
    difficulty: number;
    last_review: number|null;
    due: number|null;
    reviews: number;
    correct_reviews: number;
    aoa: number;
}

/** One row of the aggregate the recommendations read. */
export interface ExportedStat{
    topic_id: string;
    difficulty: string;
    attempts: number;
    correct: number;
    total_response_time_ms: number;
    last_error_type: string|null;
    last_updated: string|null;
}

/** The record as a browser build keeps it, keyed by `topic` or `topic/subSkill`. */
export interface ExportedReviewDocument{
    version: number;
    records: { [key: string]: ExportedReviewRecord };
}

/** One remembered skill in the browser's spelling. */
export interface ExportedReviewRecord{
    stability: number;
    difficulty: number;
    lastReview?: number;
    due?: number;
    reviews: number;
    correctReviews: number;
    aoa: number;
}

/**
 * The whole learning record. The version is stated rather than assumed, so a
 * document from a later build is refused instead of being read as this one.
 */
export interface ExportDocument{
    app: string;
    version: number;
    exported_at: number;
    review: ExportedReviewDocument|null;
    stats: ExportedStat[];
    attempts: ExportedAttempt[];
    skills: ExportedSkill[];
}

/** The shape this build writes, and the earliest it is willing to read. */
const EXPORT_VERSION=1;

/** The name that identifies a document as ours, so a foreign file is refused. */
const EXPORT_APP="randmatqugea";

/** The modal and the list inside it, resolved once when the modal opens. */
let modal:HTMLElement|null=null;
let dataList:HTMLElement|null=null;

/** The one path a document has to satisfy before anything is written from it. */
function isExportDocument(value: unknown): value is ExportDocument{
    if(typeof value!=="object"||value===null) return false;
    let candidate=value as Partial<ExportDocument>;
    if(candidate.app!==EXPORT_APP) return false;
    if(candidate.version!==EXPORT_VERSION) return false;
    if(typeof candidate.exported_at!=="number") return false;
    if(!Array.isArray(candidate.attempts)) return false;
    if(!Array.isArray(candidate.skills)) return false;
    if(!Array.isArray(candidate.stats)) return false;
    return true;
}

/**
 * Reads the whole record out of the desktop database, through the command that
 * owns it.
 *
 * @returns A promise resolving to the record this device holds.
 */
async function readDesktopRecord(): Promise<ExportDocument>{
    return await invoke<ExportDocument>("export_learning_record",{path:null});
}

/**
 * Reads the whole record out of the browser's store, through the storage module
 * that owns where data goes. Only the review record is kept in a browser, so the
 * document carries it under the browser's own spelling and leaves the two tables
 * empty rather than inventing rows the browser never had.
 *
 * @returns A promise resolving to the record this device holds.
 */
async function readBrowserRecord(): Promise<ExportDocument>{
    let reviewStore=await import("./services/ReviewStore");
    let stored=await reviewStore.readDocument();
    return{
        app: EXPORT_APP,
        version: EXPORT_VERSION,
        exported_at: Date.now(),
        review: stored??null,
        stats: [],
        attempts: [],
        skills: []
    };
}

/**
 * Reads the record from wherever this build keeps it.
 *
 * @returns A promise resolving to the record this device holds.
 */
export async function readRecord(): Promise<ExportDocument>{
    if(isTauri()) return await readDesktopRecord();
    return await readBrowserRecord();
}

/**
 * Hands the record to the learner as a file. The desktop asks for a destination
 * and lets the backend write it, so the database is never read into a string the
 * frontend has to trust; the browser has no such backend, so it downloads the
 * text through the platform's own download mechanism.
 *
 * @returns A promise resolving once the file has been written or offered.
 */
export async function exportRecord(): Promise<void>{
    try{
        if(isTauri()){
            let path=await save({
                defaultPath: EXPORT_FILE_NAME,
                filters: [{ name: "Learning record", extensions: ["json"] }]
            });
            if(!path) return;
            let written=await invoke<ExportDocument>("export_learning_record",{path});
            ui.showNotification(`Exported ${written.attempts.length} recorded answers and ${written.skills.length} scheduled skills.`,"info");
            return;
        }
        let record=await readBrowserRecord();
        let text=JSON.stringify(record,null,2);
        let url=URL.createObjectURL(new Blob([text],{type:"application/json"}));
        try{
            let anchor=window.document.createElement("a");
            anchor.href=url;
            anchor.download=EXPORT_FILE_NAME;
            anchor.click();
        }
        finally{
            URL.revokeObjectURL(url);
        }
        ui.showNotification("Your learning record has been exported.","info");
    }
    catch(err){
        console.error("Failed to export the learning record:",err);
        ui.showNotification("Export failed: "+(err instanceof Error?err.message:String(err)),"warning");
    }
}

/**
 * Writes an imported record into the desktop database, through the command that
 * owns it. The backend reads the file, refuses a document this build cannot
 * read, and applies the whole thing or none of it.
 *
 * @param path - The file the learner chose.
 * @param mode - Whether the file merges with or replaces what is here.
 * @returns A promise resolving to what was written.
 */
async function importDesktopRecord(path: string, mode: ImportMode): Promise<string>{
    let summary=await invoke<{mode: ImportMode; attempts: number; skills: number; stats: number; records: number}>("import_learning_record",{path, mode});
    return `Imported ${summary.attempts} recorded answers and ${summary.skills} scheduled skills (${summary.mode}).`;
}

/**
 * Writes an imported record into the browser's store, through the storage module.
 * Merging keeps the skills the file does not mention, because a file written
 * after a learner practiced one more topic should not erase the earlier work;
 * replacing makes the file the whole record. Either way the file's own spelling
 * of a skill wins, which is the same rule the desktop applies per key.
 *
 * @param read - The record that was read.
 * @param mode - Whether the file merges with or replaces what is here.
 * @returns A promise resolving to what was written.
 */
async function importBrowserRecord(read: ExportDocument, mode: ImportMode): Promise<string>{
    let reviewStore=await import("./services/ReviewStore");
    let incoming=read.review;
    if(!incoming||typeof incoming.records!=="object"||incoming.records===null) return "That file carries no review record, so nothing was imported.";
    let existing=mode==="merge"?await reviewStore.readDocument():null;
    let records: { [key: string]: ExportedReviewRecord }={};
    if(existing&&existing.records){
        for(let key of Object.keys(existing.records)) records[key]=existing.records[key];
    }
    let applied=0;
    for(let key of Object.keys(incoming.records)){
        let record=incoming.records[key];
        if(!record||typeof record!=="object") continue;
        if(typeof record.stability!=="number"||typeof record.difficulty!=="number"||typeof record.reviews!=="number"||typeof record.correctReviews!=="number"||typeof record.aoa!=="number") continue;
        records[key]=record;
        applied++;
    }
    await reviewStore.writeDocument({version: incoming.version??EXPORT_VERSION, records});
    return `Imported ${applied} remembered skills (${mode}).`;
}

/**
 * Applies a record the learner chose, and reloads the record from where it now
 * lives so the list, the leaderboard and the schedule all reflect the import
 * rather than the copy that was there a moment ago.
 *
 * @param mode - Whether the file merges with or replaces what is here.
 * @returns A promise resolving once the import has been applied.
 */
export async function importRecord(mode: ImportMode): Promise<void>{
    try{
        if(isTauri()){
            let chosen=await open({
                multiple: false,
                filters: [{ name: "Learning record", extensions: ["json"] }]
            });
            if(!chosen) return;
            let path=Array.isArray(chosen)?chosen[0]:chosen;
            if(typeof path!=="string") return;
            ui.showNotification(await importDesktopRecord(path,mode),"info");
        }
        else{
            let text=await readChosenFile();
            if(text===null) return;
            let parsed: unknown;
            try{
                parsed=JSON.parse(text) as unknown;
            }
            catch(err){
                console.error("The chosen file is not JSON:",err);
                ui.showNotification("That file is not a learning record.","warning");
                return;
            }
            if(!isExportDocument(parsed)){
                console.error("The chosen file is not a learning record this build can read:",parsed);
                ui.showNotification(`That file is not a learning record this build can read (expected ${EXPORT_APP} version ${EXPORT_VERSION}).`,"warning");
                return;
            }
            ui.showNotification(await importBrowserRecord(parsed,mode),"info");
        }
        let reviewStore=await import("./services/ReviewStore");
        await reviewStore.loadRecords();
        await loadData();
        updateLeaderboard();
    }
    catch(err){
        console.error("Failed to import the learning record:",err);
        ui.showNotification("Import failed: "+(err instanceof Error?err.message:String(err)),"warning");
    }
}

/**
 * Asks the browser for a file and reads it, without adding a permanent control
 * to the page for something used once.
 *
 * @returns A promise resolving to the file's text, or null when the learner canceled.
 */
function readChosenFile(): Promise<string|null>{
    return new Promise<string|null>((resolve)=>{
        let input=document.createElement("input");
        input.type="file";
        input.accept=".json,application/json";
        input.style.display="none";
        input.onchange=()=>{
            let file=input.files&&input.files.length>0?input.files[0]:null;
            input.remove();
            if(!file){
                resolve(null);
                return;
            }
            let reader=new FileReader();
            reader.onload=()=>{
                resolve(typeof reader.result==="string"?reader.result:null);
            };
            reader.onerror=()=>{
                console.error("Could not read the chosen file:",reader.error);
                resolve(null);
            };
            reader.readAsText(file);
        };
        document.body.appendChild(input);
        input.click();
    });
}

/**
 * One row of the list, in the shape both builds produce. The desktop sends its
 * aggregate's own field names; the browser derives the same six numbers from the
 * review record, so the list has one shape to render rather than two.
 */
interface PerformanceRow{
    topic_id: string;
    difficulty: string;
    accuracy: number;
    attempts: number;
    avg_time_ms: number;
}

/**
 * Shows the record for the modal, whatever this build keeps. A browser has no
 * aggregate table to show, so it shows the review record instead of pretending
 * the desktop list is empty.
 *
 * @returns A promise resolving once the list has been filled.
 */
async function loadData(){
    if(!dataList)return;
    try{
        let stats: Array<PerformanceRow>=isTauri()
            ?await invoke<Array<PerformanceRow>>("get_performance_stats",{difficulty:null,days:null})
            :await browserSummary();
        if(!stats||stats.length===0){
            dataList.innerHTML="<p>No performance data yet. Answer some questions first.</p>";
        }
        else{
            let names=new Map<string,string>();
            for(let t of topics) names.set(t.id,t.name);
            renderRows(dataList,stats,names);
        }
        wireModalActions();
    }
    catch(err){
        console.error("Failed to load stats:",err);
        if(dataList)dataList.textContent="Error loading data: "+(err instanceof Error?err.message:String(err));
    }
}

/**
 * Builds the rows a browser can honestly show, which is the review record rather
 * than the aggregate the recommendations read.
 *
 * @returns A promise resolving to rows in the same shape the desktop produces.
 */
async function browserSummary(): Promise<Array<PerformanceRow>>{
    let record=await readBrowserRecord();
    let rows: Array<PerformanceRow>=[];
    if(!record.review) return rows;
    for(let key of Object.keys(record.review.records)){
        let state=record.review.records[key];
        let split=key.indexOf("/");
        let topicId=split<0?key:key.slice(0,split);
        let subSkill=split<0?"":key.slice(split+1);
        let attempts=state.reviews;
        let accuracy=attempts>0?state.correctReviews/attempts:0;
        let avg=state.due&&state.lastReview?Math.round((state.due-state.lastReview)/attempts):0;
        rows.push({
            topic_id: topicId,
            difficulty: subSkill||"all",
            accuracy: accuracy,
            attempts: attempts,
            avg_time_ms: avg
        });
    }
    return rows;
}

/**
 * Builds one row per record, with the delete button created alongside it rather
 * than looked up afterwards. A learner clicking delete on one row should not cost
 * a scan of every row on the page, and the button is in hand at the moment it is
 * needed because the row is what created it. Nothing is rebuilt to change one
 * string: the text is written into the parts of the row once, when the row is
 * built.
 *
 * @param list - The list the rows are appended to.
 * @param rows - The records to show, in the shape both builds produce.
 * @param names - The topic id to topic name lookup, so a row is not re-searched.
 */
function renderRows(list: HTMLElement, rows: Array<PerformanceRow>, names: Map<string,string>){
    list.replaceChildren();
    for(const s of rows){
        let topicId=String(s.topic_id);
        let difficulty=String(s.difficulty);
        let topicName=names.get(topicId)??topicId;
        let acc=typeof s.accuracy==="number"&&isFinite(s.accuracy)?(s.accuracy*100).toFixed(1):"0.0";
        let row=document.createElement("div");
        row.className="data-item";
        let info=document.createElement("div");
        info.className="data-info";
        let heading=document.createElement("strong");
        heading.textContent=topicName;
        let label=document.createElement("span");
        label.textContent=` (${difficulty})`;
        let lineBreak=document.createElement("br");
        let numbers=document.createElement("span");
        numbers.textContent=`Accuracy: ${acc}% | Attempts: ${s.attempts} | Avg time: ${Math.round(s.avg_time_ms)}ms`;
        info.append(heading,label,lineBreak,numbers);
        let btn=document.createElement("button");
        btn.className="secondary-button delete-record";
        btn.type="button";
        btn.setAttribute("data-topic",topicId);
        btn.setAttribute("data-diff",difficulty);
        btn.textContent="Delete";
        btn.onclick=()=>{
            deleteRecord(topicId,difficulty).catch((err:unknown)=>console.error("deleteRecord failed:",err));
        };
        row.append(info,btn);
        list.appendChild(row);
    }
}

/**
 * Erases one record and reloads the list, which is the whole behavior of the
 * per-row delete control.
 *
 * @param topicId - The topic whose record is being erased.
 * @param difficulty - The difficulty whose record is being erased.
 * @returns A promise resolving once the list reflects the erasure.
 */
async function deleteRecord(topicId: string, difficulty: string): Promise<void>{
    if(!confirm(`Delete all records for ${topicId} (${difficulty})?`)) return;
    try{
        await invoke("delete_performance_record",{topicId, difficulty});
        ui.showNotification(`Deleted ${topicId} (${difficulty})`,"info");
        await loadData();
    }
    catch(err){
        console.error("Failed to delete record:",err);
        if(dataList)dataList.textContent="Error: "+(err instanceof Error?err.message:String(err));
    }
}

/**
 * Binds the controls that sit outside the list, so they are wired once per
 * render rather than once per click. The export and import controls are bound
 * here because the merge-or-replace choice is read at the moment of the import,
 * which is the only time it means anything.
 */
function wireModalActions(){
    let exportBtn=document.getElementById("export-data-btn");
    if(exportBtn) exportBtn.onclick=()=>{
        exportRecord().catch((err:unknown)=>console.error("exportRecord failed:",err));
    };
    let importBtn=document.getElementById("import-data-btn");
    if(importBtn) importBtn.onclick=()=>{
        let mode=readImportMode();
        importRecord(mode).catch((err:unknown)=>console.error("importRecord failed:",err));
    };
    let deleteAllBtn=document.getElementById("delete-all-btn");
    if(deleteAllBtn){
        deleteAllBtn.onclick=async()=>{
            if(confirm("Delete ALL performance data? This cannot be undone.")){
                try{
                    // The full record, not only the aggregate the table shows:
                    // leaving the schedule or the recorded answers behind would
                    // mean the list a learner is shown is not the whole of
                    // what is being kept. A browser keeps that record in the
                    // storage module rather than in SQLite, so the two erases
                    // are different commands for the same promise: a button
                    // that quietly does nothing in one build is worse than no
                    // button at all.
                    if(isTauri()){
                        await invoke("clear_performance");
                    }
                    else{
                        let storage=await import("./services/Storage");
                        await storage.clear();
                    }
                    let reviewStore=await import("./services/ReviewStore");
                    await reviewStore.forgetEverything();
                    await reviewStore.loadRecords();
                    ui.showNotification("All performance data deleted.","info");
                    await loadData();
                    updateLeaderboard();
                }
                catch(err){
                    console.error("Failed to delete all data:",err);
                    if(dataList)dataList.textContent="Error: "+(err instanceof Error?err.message:String(err));
                }
            }
        };
    }
    let resetAllBtn=document.getElementById("reset-all-btn");
    if(resetAllBtn){
        resetAllBtn.onclick=async()=>{
            if(confirm("HARD RESET: This will delete ALL scores and performance data. This cannot be undone. Are you sure?")){
                try{
                    if(isTauri()){
                        await invoke("reset_all_data");
                    }
                    else{
                        let storage=await import("./services/Storage");
                        await storage.clear();
                        let reviewStore=await import("./services/ReviewStore");
                        await reviewStore.forgetEverything();
                    }
                    ui.showNotification("All data has been reset.","info");
                    await loadData();
                    updateLeaderboard();
                }
                catch(err){
                    console.error("Failed to reset all data:",err);
                    if(dataList)dataList.textContent="Error: "+(err instanceof Error?err.message:String(err));
                }
            }
        };
    }
}

/**
 * Reads the learner's choice of what an import should do, defaulting to merging
 * because a merge cannot lose a record and a replace can.
 *
 * @returns The chosen mode.
 */
function readImportMode(): ImportMode{
    let select=document.getElementById("import-mode") as HTMLSelectElement|null;
    if(select&&select.value==="replace") return "replace";
    return "merge";
}

/**
 * Opens the modal. A browser can manage its record too, so the modal is not
 * desktop-only any more: the aggregate it used to refuse to show without Tauri is
 * replaced by whatever the browser does keep.
 *
 * @returns A promise resolving once the modal is open.
 */
export async function openDataModal(){
    modal=document.getElementById("data-modal");
    if(!modal)return;
    dataList=document.getElementById("data-list");
    await loadData();
    modal.classList.add("show");
    modal.classList.remove("hidden");
}

/**
 * Binds the modal's persistent controls, which are the ones outside the list.
 */
export function initDataModal(){
    modal=document.getElementById("data-modal");
    if(!modal)return;
    let closeBtn=document.getElementById("data-close");
    let refreshBtn=document.getElementById("data-refresh");
    if(closeBtn)closeBtn.onclick=()=>{
        modal?.classList.remove("show");
        modal?.classList.add("hidden");
    };
    if(refreshBtn)refreshBtn.onclick=loadData;
}
