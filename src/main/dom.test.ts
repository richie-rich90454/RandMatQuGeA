/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("@tauri-apps/api/window",()=>({
    getCurrentWindow:vi.fn(()=>({theme:vi.fn(),setTheme:vi.fn()})),
}));
import*as dom from"./dom.js";
describe("dom",()=>{
    it("should export questionArea",()=>{
        expect("questionArea"in dom).toBe(true);
    });
    it("should export topicGrid",()=>{
        expect("topicGrid"in dom).toBe(true);
    });
    it("should export currentTopicDisplay",()=>{
        expect("currentTopicDisplay"in dom).toBe(true);
    });
    it("should export generateQuestionButton",()=>{
        expect("generateQuestionButton"in dom).toBe(true);
    });
    it("should export userAnswer",()=>{
        expect("userAnswer"in dom).toBe(true);
    });
    it("should export answerResults",()=>{
        expect("answerResults"in dom).toBe(true);
    });
    it("should export checkAnswerButton",()=>{
        expect("checkAnswerButton"in dom).toBe(true);
    });
    it("should export themeToggle",()=>{
        expect("themeToggle"in dom).toBe(true);
    });
    it("should export settingsAdaptive",()=>{
        expect("settingsAdaptive"in dom).toBe(true);
    });
    it("should export appWindow (may be null outside Tauri)",()=>{
        expect("appWindow"in dom).toBe(true);
    });
});
describe("DOM element references",()=>{
    it("should export questionArea",()=>{
        expect("questionArea"in dom).toBe(true);
    });
    it("should export topicGrid",()=>{
        expect("topicGrid"in dom).toBe(true);
    });
    it("should export userAnswer",()=>{
        expect("userAnswer"in dom).toBe(true);
    });
    it("should export answerResults",()=>{
        expect("answerResults"in dom).toBe(true);
    });
    it("should export generateBtn",()=>{
        expect("generateBtn"in dom).toBe(true);
    });
    it("should export singleModeBtn",()=>{
        expect("singleModeBtn"in dom).toBe(true);
    });
    it("should export mentalModeBtn",()=>{
        expect("mentalModeBtn"in dom).toBe(true);
    });
    it("should export settingsBtn",()=>{
        expect("settingsBtn"in dom).toBe(true);
    });
    it("should export timerDisplay",()=>{
        expect("timerDisplay"in dom).toBe(true);
    });
    it("should export scoreDisplay",()=>{
        expect("scoreDisplay"in dom).toBe(true);
    });
    it("should export progressBar",()=>{
        expect("progressBar"in dom).toBe(true);
    });
    it("should export topicDisplay",()=>{
        expect("topicDisplay"in dom).toBe(true);
    });
    it("should export expectedFormatDisplay",()=>{
        expect("expectedFormatDisplay"in dom).toBe(true);
    });
    it("should export mcqContainer",()=>{
        expect("mcqContainer"in dom).toBe(true);
    });
    it("should export notificationContainer",()=>{
        expect("notificationContainer"in dom).toBe(true);
    });
});
