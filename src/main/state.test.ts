/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./dom.js",()=>({
    modeSingleBtn:null,
    modeMentalBtn:null,
}));
import*as state from"./state.js";
describe("state initial values",()=>{
    it("autocontinue should default to false",()=>{
        expect(state.autocontinue).toBe(false);
    });
    it("mcqMode should default to false",()=>{
        expect(state.mcqMode).toBe(false);
    });
    it("mcqChoices should default to empty array",()=>{
        expect(state.mcqChoices).toEqual([]);
    });
    it("autoTimeout should default to null",()=>{
        expect(state.autoTimeout).toBeNull();
    });
});
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
describe("state setters with DOM interaction",()=>{
    it("setSelectedTopic should accept any string",()=>{
        state.setSelectedTopic("geometry");
        expect(state.selectedTopic).toBe("geometry");
    });
    it("setSelectedTopic should accept null",()=>{
        state.setSelectedTopic("algebra");
        state.setSelectedTopic(null);
        expect(state.selectedTopic).toBeNull();
    });
    it("setCurrentMode should accept \"single\"",()=>{
        state.setCurrentMode("single");
        expect(state.currentMode).toBe("single");
    });
    it("setCurrentMode should accept \"mental\"",()=>{
        state.setCurrentMode("mental");
        expect(state.currentMode).toBe("mental");
    });
    it("setSessionActive should toggle true/false",()=>{
        state.setSessionActive(true);
        expect(state.sessionActive).toBe(true);
        state.setSessionActive(false);
        expect(state.sessionActive).toBe(false);
    });
    it("setSessionPaused should toggle true/false",()=>{
        state.setSessionPaused(true);
        expect(state.sessionPaused).toBe(true);
        state.setSessionPaused(false);
        expect(state.sessionPaused).toBe(false);
    });
    it("setSessionScore should update correct and total independently",()=>{
        state.setSessionScore({correct:3,total:7});
        expect(state.sessionScore.correct).toBe(3);
        expect(state.sessionScore.total).toBe(7);
        state.setSessionScore({correct:0,total:7});
        expect(state.sessionScore.correct).toBe(0);
        expect(state.sessionScore.total).toBe(7);
        state.setSessionScore({correct:3,total:0});
        expect(state.sessionScore.correct).toBe(3);
        expect(state.sessionScore.total).toBe(0);
    });
    it("setTimeLeft should accept 0",()=>{
        state.setTimeLeft(0);
        expect(state.timeLeft).toBe(0);
    });
    it("setTimeLeft should accept large values",()=>{
        state.setTimeLeft(999999);
        expect(state.timeLeft).toBe(999999);
    });
    it("setCurrentDifficulty should accept \"easy\"",()=>{
        state.setCurrentDifficulty("easy");
        expect(state.currentDifficulty).toBe("easy");
    });
    it("setCurrentDifficulty should accept \"hard\"",()=>{
        state.setCurrentDifficulty("hard");
        expect(state.currentDifficulty).toBe("hard");
    });
    it("setCurrentDifficulty should accept \"medium\"",()=>{
        state.setCurrentDifficulty("medium");
        expect(state.currentDifficulty).toBe("medium");
    });
    it("setAutocontinue should toggle",()=>{
        state.setAutocontinue(true);
        expect(state.autocontinue).toBe(true);
        state.setAutocontinue(false);
        expect(state.autocontinue).toBe(false);
    });
    it("setScope should accept all valid scopes",()=>{
        state.setScope("simple");
        expect(state.scope).toBe("simple");
        state.setScope("algebra");
        expect(state.scope).toBe("algebra");
        state.setScope("calculus");
        expect(state.scope).toBe("calculus");
        state.setScope("geometry");
        expect(state.scope).toBe("geometry");
    });
    it("setShuffle should toggle",()=>{
        state.setShuffle(true);
        expect(state.shuffle).toBe(true);
        state.setShuffle(false);
        expect(state.shuffle).toBe(false);
    });
    it("setMentalScope should update mentalScope",()=>{
        state.setMentalScope("algebra");
        expect(state.mentalScope).toBe("algebra");
    });
    it("setMentalShuffle should update mentalShuffle",()=>{
        state.setMentalShuffle(true);
        expect(state.mentalShuffle).toBe(true);
        state.setMentalShuffle(false);
        expect(state.mentalShuffle).toBe(false);
    });
    it("setUnlimitedMode should toggle",()=>{
        state.setUnlimitedMode(true);
        expect(state.unlimitedMode).toBe(true);
        state.setUnlimitedMode(false);
        expect(state.unlimitedMode).toBe(false);
    });
    it("setMcqMode should toggle",()=>{
        state.setMcqMode(true);
        expect(state.mcqMode).toBe(true);
        state.setMcqMode(false);
        expect(state.mcqMode).toBe(false);
    });
    it("setMcqChoices should accept empty array",()=>{
        state.setMcqChoices([]);
        expect(state.mcqChoices).toEqual([]);
    });
    it("setMcqChoices should accept array with items",()=>{
        state.setMcqChoices(["x","y","z"]);
        expect(state.mcqChoices).toEqual(["x","y","z"]);
    });
});
