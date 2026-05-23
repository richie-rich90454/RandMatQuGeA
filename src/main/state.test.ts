/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./dom.js",()=>({
    modeSingleBtn:null,
    modeMentalBtn:null,
}));
import*as state from"./state.js";
describe("state",()=>{
    it("should have initial default values",()=>{
        expect(state.selectedTopic).toBeNull();
        expect(state.currentMode).toBe("single");
        expect(state.sessionActive).toBe(false);
        expect(state.sessionPaused).toBe(false);
        expect(state.currentDifficulty).toBe("medium");
        expect(state.scope).toBe("simple");
        expect(state.shuffle).toBe(false);
    });
    it("setSelectedTopic updates selectedTopic",()=>{
        state.setSelectedTopic("fraction");
        expect(state.selectedTopic).toBe("fraction");
        state.setSelectedTopic(null);
        expect(state.selectedTopic).toBeNull();
    });
    it("setCurrentMode updates currentMode",()=>{
        state.setCurrentMode("mental");
        expect(state.currentMode).toBe("mental");
        state.setCurrentMode("single");
    });
    it("setSessionActive updates sessionActive",()=>{
        state.setSessionActive(true);
        expect(state.sessionActive).toBe(true);
        state.setSessionActive(false);
    });
    it("setSessionPaused updates sessionPaused",()=>{
        state.setSessionPaused(true);
        expect(state.sessionPaused).toBe(true);
        state.setSessionPaused(false);
    });
    it("setSessionScore updates sessionScore",()=>{
        state.setSessionScore({correct:5,total:10});
        expect(state.sessionScore.correct).toBe(5);
        expect(state.sessionScore.total).toBe(10);
    });
    it("setTimeLeft updates timeLeft",()=>{
        state.setTimeLeft(60);
        expect(state.timeLeft).toBe(60);
    });
    it("setCurrentDifficulty updates currentDifficulty",()=>{
        state.setCurrentDifficulty("hard");
        expect(state.currentDifficulty).toBe("hard");
    });
    it("setAutocontinue updates autocontinue",()=>{
        state.setAutocontinue(true);
        expect(state.autocontinue).toBe(true);
        state.setAutocontinue(false);
    });
    it("setScope updates scope",()=>{
        state.setScope("algebra");
        expect(state.scope).toBe("algebra");
    });
    it("setShuffle updates shuffle",()=>{
        state.setShuffle(true);
        expect(state.shuffle).toBe(true);
        state.setShuffle(false);
    });
    it("setUnlimitedMode updates unlimitedMode",()=>{
        state.setUnlimitedMode(true);
        expect(state.unlimitedMode).toBe(true);
        state.setUnlimitedMode(false);
    });
    it("setMcqMode updates mcqMode",()=>{
        state.setMcqMode(true);
        expect(state.mcqMode).toBe(true);
        state.setMcqMode(false);
    });
    it("setMcqChoices updates mcqChoices",()=>{
        state.setMcqChoices(["a","b","c"]);
        expect(state.mcqChoices).toEqual(["a","b","c"]);
    });
    it("modeButtons should be an array",()=>{
        expect(Array.isArray(state.modeButtons)).toBe(true);
    });
});
