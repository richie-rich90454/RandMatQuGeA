/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./dom.js",()=>({
    appWindow:null,
}));
vi.mock("./settings.js",()=>({
    settings:{theme:"system"},
    applyTheme:vi.fn(),
}));
import{initializeTheme}from"./theme.js";
describe("theme",()=>{
    it("should export initializeTheme",()=>{
        expect(typeof initializeTheme).toBe("function");
    });
    it("initializeTheme should not throw",async()=>{
        await expect(initializeTheme()).resolves.toBeUndefined();
    });
});
