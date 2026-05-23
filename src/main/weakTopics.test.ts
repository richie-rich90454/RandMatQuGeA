/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./topics.js",()=>({
    selectTopic:vi.fn(),
}));
vi.mock("./generation.js",()=>({
    generateQuestion:vi.fn(),
}));
vi.mock("./settings.js",()=>({
    settings:{showWeakTopicsPopup:true},
}));
import{checkAndShowWeakTopicsPopup}from"./weakTopics.js";
describe("weakTopics",()=>{
    it("should export checkAndShowWeakTopicsPopup",()=>{
        expect(typeof checkAndShowWeakTopicsPopup).toBe("function");
    });
    it("checkAndShowWeakTopicsPopup should not throw",async()=>{
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
});
