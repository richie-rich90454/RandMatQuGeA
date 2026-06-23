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
describe("DOM element references matched to actual exports",()=>{
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
	it("should export generateQuestionButton",()=>{
		expect("generateQuestionButton"in dom).toBe(true);
	});
	it("should export modeSingleBtn",()=>{
		expect("modeSingleBtn"in dom).toBe(true);
	});
	it("should export modeMentalBtn",()=>{
		expect("modeMentalBtn"in dom).toBe(true);
	});
	it("should export settingsButton",()=>{
		expect("settingsButton"in dom).toBe(true);
	});
	it("should export timerDisplay",()=>{
		expect("timerDisplay"in dom).toBe(true);
	});
	it("should export scoreDisplay",()=>{
		expect("scoreDisplay"in dom).toBe(true);
	});
	it("should export mentalProgressBar",()=>{
		expect("mentalProgressBar"in dom).toBe(true);
	});
	it("should export currentTopicDisplay",()=>{
		expect("currentTopicDisplay"in dom).toBe(true);
	});
	it("should export expectedFormatDiv",()=>{
		expect("expectedFormatDiv"in dom).toBe(true);
	});
	it("should export mcqChoicesContainer",()=>{
		expect("mcqChoicesContainer"in dom).toBe(true);
	});
});