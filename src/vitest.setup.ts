import {vi} from "vitest";
vi.mock("@tauri-apps/api/core",()=>({
	invoke: vi.fn().mockResolvedValue(undefined),
}));
(globalThis as any).__TAURI_INTERNALS__={};
(globalThis as any).__TAURI__={};
Object.defineProperty(window,"matchMedia",{
	writable:true,
	value:vi.fn().mockImplementation((query:string)=>({
		matches:false,
		media:query,
		onchange:null,
		addListener:vi.fn(),
		removeListener:vi.fn(),
		addEventListener:vi.fn(),
		removeEventListener:vi.fn(),
		dispatchEvent:vi.fn(),
	})),
});
