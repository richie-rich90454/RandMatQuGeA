import {vi} from "vitest";
vi.mock("@tauri-apps/api/core",()=>({
	invoke: vi.fn().mockResolvedValue(undefined),
}));
(globalThis as any).__TAURI_INTERNALS__={};
(globalThis as any).__TAURI__={};
