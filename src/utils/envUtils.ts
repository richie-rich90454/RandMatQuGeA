export function isTauri(): boolean{
	return typeof window.__TAURI_INTERNALS__!=="undefined";
}
