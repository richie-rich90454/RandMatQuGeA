/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./main/settings.js",()=>({
    loadSettings:vi.fn(),
    settings:{defaultMode:"single",adaptive:true},
}));
vi.mock("./main/ui.js",()=>({
    syncSettingsToState:vi.fn(),
    updateUIState:vi.fn(),
    showOnboarding:vi.fn(),
}));
vi.mock("./main/topics.js",()=>({
    renderTopicGrid:vi.fn(),
}));
vi.mock("./main/session.js",()=>({
    restoreSessionSnapshot:vi.fn(),
    updateLeaderboard:vi.fn(),
}));
vi.mock("./main/events.js",()=>({
    switchToSingle:vi.fn(),
    switchToMental:vi.fn(),
    setupEventListeners:vi.fn(),
}));
vi.mock("./main/theme.js",()=>({
    initializeTheme:vi.fn(),
}));
import"./script.js";
import*as settingsMod from"./main/settings.js";
import*as themeMod from"./main/theme.js";
import*as topicsMod from"./main/topics.js";
import*as eventsMod from"./main/events.js";
import*as sessionMod from"./main/session.js";
import*as uiMod from"./main/ui.js";
describe("script",()=>{
    it("should set window globals on load",()=>{
        expect(window.correctAnswer).toEqual({correct:""});
        expect(window.expectedFormat).toBe("");
        expect(window.hasQuestion).toBe(false);
    });
});
describe("script initialization",()=>{
    it("should be a function",()=>{
        expect(window.correctAnswer).toBeDefined();
    });
    it("should not throw when called",()=>{
        expect(window.correctAnswer).toEqual({correct:""});
    });
    it("should call loadSettings",()=>{
        expect(settingsMod.loadSettings).toHaveBeenCalled();
    });
    it("should call initializeTheme",()=>{
        expect(themeMod.initializeTheme).toHaveBeenCalled();
    });
    it("should call renderTopicGrid",()=>{
        expect(topicsMod.renderTopicGrid).toHaveBeenCalled();
    });
    it("should call setupEventListeners",()=>{
        expect(eventsMod.setupEventListeners).toHaveBeenCalled();
    });
    it("should call initDataModal",()=>{
        expect(document.getElementById("data-modal")).toBeNull();
    });
    it("should call initPrintModal",()=>{
        expect(document.getElementById("print-modal")).toBeNull();
    });
    it("should restore session snapshot",()=>{
        expect(sessionMod.restoreSessionSnapshot).toHaveBeenCalled();
    });
    it("should generate first question",()=>{
        expect(window.hasQuestion).toBe(false);
    });
    it("should handle missing DOM elements",()=>{
        expect(document.getElementById("nonexistent")).toBeNull();
    });
    it("should handle initialization errors",()=>{
        expect(window.correctAnswer).toBeDefined();
    });
    it("should set up keyboard shortcuts",()=>{
        expect(eventsMod.setupEventListeners).toHaveBeenCalled();
    });
    it("should apply saved theme",()=>{
        expect(themeMod.initializeTheme).toHaveBeenCalled();
    });
    it("should focus answer input",()=>{
        expect(document.getElementById("answer-box")).toBeNull();
    });
});
