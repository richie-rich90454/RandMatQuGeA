/**
 * @file Every surface that only makes sense where something is kept, decided in one place.
 * @description The style guide's rule is that a feature either works in every environment
 * or is hidden where it cannot. Hiding was previously done at each call site, which is how
 * a surface gets missed: three of them were hidden, and the confidence control, the streak
 * badge, the data dialog and the updates section were not, so a browser build offered a
 * control for a record it does not keep and answered a press with a toast.
 *
 * There are three gates, and they are not the same question:
 *
 * - `adaptive` needs the desktop runtime, because the scheduler's inputs are performance
 *   records written over Tauri IPC, and a store that will still hold them tomorrow,
 *   because a private session discards the record when the window closes.
 * - `record` needs a store at all. Anything that exports, imports, erases or displays a
 *   learning record is describing something that does not exist in a private session.
 * - `tauri` needs the desktop runtime, for the updater and the plugins behind it.
 *
 * This module owns the list and applies it. A surface added later is hidden by adding one
 * line here, which is the property that a call-site decision does not have.
 */
import{dom}from"./DomRegistry";
import{setHidden}from"./DomVisibility";

/** What each gate is currently worth. */
export interface GateState{
    /** Adaptive learning can run. */
    adaptive: boolean;
    /** Something is kept, so a record exists to export, import or erase. */
    record: boolean;
    /** The desktop runtime is present. */
    tauri: boolean;
}

/**
 * Surfaces that need adaptive learning, by element id. The confidence control belongs here
 * because its only reader is the scheduler's overconfidence correction: in a browser it is
 * collected, stored and never looked at, which is a question asked for nothing.
 */
const ADAPTIVE_SURFACES: string[]=[
    "setting-adaptive",
    "recommend-btn",
    "weak-topics-modal",
    "confidence-row",
];

/** Surfaces that need a kept record, by element id. */
const RECORD_SURFACES: string[]=[
    "daily-streak",
    "manage-data-btn",
    "data-record-intro",
    "data-list",
    "export-data-btn",
    "import-data-btn",
    "import-mode-label",
    "import-mode",
    "delete-all-btn",
    "reset-all-btn",
    "data-refresh",
    "setting-erase-data",
];

/** Surfaces that need the desktop runtime, by element id. */
const TAURI_SURFACES: string[]=[
    "updates-section",
    "check-updates",
];

/**
 * Shows or hides every gated surface for the state given.
 *
 * Elements are resolved through the registry rather than searched for, so no interaction
 * path runs a document query and an absent element is skipped rather than throwing.
 *
 * @param state - What each gate is currently worth.
 */
export function applyGates(state: GateState): void{
    for(let id of ADAPTIVE_SURFACES){
        setHidden(dom.getElement(id), !state.adaptive);
    }
    for(let id of RECORD_SURFACES){
        setHidden(dom.getElement(id), !state.record);
    }
    for(let id of TAURI_SURFACES){
        setHidden(dom.getElement(id), !state.tauri);
    }
}