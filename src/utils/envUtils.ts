/**
 * @file Environment detection: the one place that decides which runtime the app
 * is in.
 * @description Two features depend on a runtime the browser is not. The scheduler
 * decides from performance records that are written over Tauri IPC, and the leaderboard
 * and the updater talk to commands that do not exist in a page. Each of those has to
 * answer the same question, and the rule in the style guide is that a feature either
 * works everywhere or is hidden where it cannot, so the answer is named once here
 * rather than decided again at each call site.
 */

/**
 * Reports whether the app is running inside the Tauri desktop shell.
 *
 * @returns True when the Tauri internals are present.
 */
export function isTauri(): boolean{
    return typeof window.__TAURI_INTERNALS__!=="undefined";
}

/**
 * Reports whether the adaptive features can run in this runtime at all.
 *
 * Two things have to be true, and checking only one of them is how the desktop
 * build came to offer a scheduler with nothing to schedule from.
 *
 * The scheduler decides from performance records written over Tauri IPC, so in a
 * plain browser it would be deciding from data the browser never held: the
 * difficulty would drift on a partial history and the weak-topic list would be
 * confidently wrong.
 *
 * And a private session keeps nothing, so even in the desktop app a record that
 * is discarded when the window closes is no basis for a spaced-repetition
 * schedule. Adaptive learning needs a runtime that can write the record *and* a
 * store that will still have it tomorrow.
 *
 * @param persistence - The store the learner has chosen.
 * @returns True when adaptive learning may run.
 */
export function adaptiveAvailable(persistence: string): boolean{
    return isTauri()&&persistence!=="zdr";
}