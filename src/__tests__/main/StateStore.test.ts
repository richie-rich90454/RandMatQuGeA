/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
vi.mock("@tauri-apps/api/window",()=>({
    getCurrentWindow:vi.fn(()=>({theme:vi.fn(),setTheme:vi.fn()})),
}));
vi.mock("../../main/core/DomRegistry",()=>({
    dom:{
        buttons:{
            modeSingleBtn:null,
            modeMentalBtn:null,
        }
    }
}));
import{AppState}from"./core/StateStore";
describe("AppState",()=>{
    let state: AppState;
    beforeEach(()=>{
        state=new AppState();
    });
    it("should initialize with default values",()=>{
        expect(state.selectedTopic).toBeNull();
        expect(state.currentMode).toBe("single");
        expect(state.sessionActive).toBe(false);
        expect(state.sessionPaused).toBe(false);
        expect(state.timeLeft).toBe(30);
        expect(state.maxQuestions).toBe(5);
        expect(state.currentDifficulty).toBe("medium");
        expect(state.autocontinue).toBe(false);
        expect(state.scope).toBe("simple");
        expect(state.shuffle).toBe(false);
        expect(state.mentalScope).toBe("simple");
        expect(state.mentalShuffle).toBe(false);
        expect(state.unlimitedMode).toBe(false);
        expect(state.totalTimeSpent).toBe(0);
        expect(state.answeredQuestionsCount).toBe(0);
        expect(state.currentQuestionStartTime).toBeNull();
        expect(state.mcqMode).toBe(false);
        expect(state.mcqChoices).toEqual([]);
        expect(state.userPickedDifficulty).toBe(false);
        expect(state.answering).toBe(false);
        expect(state.isGenerating).toBe(false);
        expect(state.weakTopicQueue).toEqual([]);
    });
    it("should allow setting selectedTopic",()=>{
        state.selectedTopic="add";
        expect(state.selectedTopic).toBe("add");
    });
    it("should allow setting currentMode",()=>{
        state.currentMode="mental";
        expect(state.currentMode).toBe("mental");
    });
    it("should allow setting sessionActive",()=>{
        state.sessionActive=true;
        expect(state.sessionActive).toBe(true);
    });
    it("should allow setting sessionScore",()=>{
        state.sessionScore={correct:5,total:10};
        expect(state.sessionScore).toEqual({correct:5,total:10});
    });
    it("should allow setting timeLeft",()=>{
        state.timeLeft=60;
        expect(state.timeLeft).toBe(60);
    });
    it("should allow setting currentDifficulty",()=>{
        state.currentDifficulty="hard";
        expect(state.currentDifficulty).toBe("hard");
    });
    it("should reset all state to defaults",()=>{
        state.selectedTopic="add";
        state.currentMode="mental";
        state.sessionActive=true;
        state.sessionScore={correct:5,total:10};
        state.timeLeft=60;
        state.currentDifficulty="hard";
        state.autocontinue=true;
        state.scope="advanced";
        state.shuffle=true;
        state.unlimitedMode=true;
        state.totalTimeSpent=100;
        state.answeredQuestionsCount=20;
        state.mcqMode=true;
        state.mcqChoices=["a","b","c"];
        state.answering=true;
        state.isGenerating=true;
        state.weakTopicQueue=["topic1","topic2"];
        state.reset();
        expect(state.selectedTopic).toBeNull();
        expect(state.currentMode).toBe("single");
        expect(state.sessionActive).toBe(false);
        expect(state.sessionScore).toEqual({correct:0,total:0});
        expect(state.timeLeft).toBe(30);
        expect(state.currentDifficulty).toBe("medium");
        expect(state.autocontinue).toBe(false);
        expect(state.scope).toBe("simple");
        expect(state.shuffle).toBe(false);
        expect(state.unlimitedMode).toBe(false);
        expect(state.totalTimeSpent).toBe(0);
        expect(state.answeredQuestionsCount).toBe(0);
        expect(state.mcqMode).toBe(false);
        expect(state.mcqChoices).toEqual([]);
        expect(state.answering).toBe(false);
        expect(state.isGenerating).toBe(false);
        expect(state.weakTopicQueue).toEqual([]);
    });
});