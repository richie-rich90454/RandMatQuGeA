/** @vitest-environment jsdom */
import{describe,it,expect,vi,afterEach}from"vitest";
vi.mock("./dom.js",()=>({
    topicGrid:{innerHTML:"",appendChild:vi.fn()},
    topicSearch:{value:""},
    currentTopicDisplay:{textContent:""},
    generateQuestionButton:{disabled:false,setAttribute:vi.fn()},
}));
vi.mock("./state.js",()=>{
    let selectedTopic:string|null=null;
    let currentMode="single";
    let scope="simple";
    let mentalScope="simple";
    return{
        selectedTopic,
        currentMode,
        scope,
        mentalScope,
        setSelectedTopic:vi.fn((t:string|null)=>{selectedTopic=t;}),
        setCurrentMode:vi.fn((m:"single"|"mental")=>{currentMode=m;}),
        setScope:vi.fn((s:string)=>{scope=s;}),
        setMentalScope:vi.fn((s:string)=>{mentalScope=s;}),
    };
});
vi.mock("./ui.js",()=>({
    updateUIState:vi.fn(),
}));
import*as topics from"./topics.js";
describe("topics",()=>{
    afterEach(()=>{
        document.querySelectorAll(".topic-pill").forEach(el=>el.remove());
    });
    it("should export renderTopicGrid",()=>{
        expect(typeof topics.renderTopicGrid).toBe("function");
    });
    it("should export selectTopic",()=>{
        expect(typeof topics.selectTopic).toBe("function");
    });
    it("should export pickRandomTopic",()=>{
        expect(typeof topics.pickRandomTopic).toBe("function");
    });
    it("pickRandomTopic should return a string or null",()=>{
        const result=topics.pickRandomTopic();
        expect(result===null||typeof result==="string").toBe(true);
    });
});
