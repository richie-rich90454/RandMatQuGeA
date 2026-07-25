export function isTauri(): boolean{
	return typeof(window as any).__TAURI_INTERNALS__!=="undefined";
}
