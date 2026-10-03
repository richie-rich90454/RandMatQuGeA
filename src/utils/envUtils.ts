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
 * The scheduler's inputs are performance records written over Tauri IPC, so in a
 * plain browser it would be deciding from data the browser never held: the
 * difficulty would drift on a partial history and the weak-topic list would be
 * confidently wrong. The difficulty adjustment already refused to run outside
 * Tauri, which was the right call made in one place; this names the whole feature
 * so the remaining surfaces ask the same question instead of each re-deciding it,
 * and so a surface added later inherits the decision by calling this.
 *
 * @returns True when adaptive learning may run, which is the desktop app only.
 */
export function adaptiveAvailable(): boolean{
    return isTauri();
}