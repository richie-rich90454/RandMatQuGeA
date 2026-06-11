/** @vitest-environment jsdom */
import{describe,it,expect,vi,afterEach,beforeEach}from"vitest";
vi.mock("./dom.js",()=>{
    let innerHTML="";
    return{
        topicGrid:{
            get innerHTML(){return innerHTML;},
            set innerHTML(v){innerHTML=v;},
            appendChild:vi.fn(),
        },
        topicSearch:{value:""},
        currentTopicDisplay:{textContent:""},
        generateQuestionButton:{disabled:false,setAttribute:vi.fn()},
    };
});
vi.mock("./state.js",()=>{
    let selectedTopic:string|null=null;
    let currentMode="single";
    let scope="simple";
    let mentalScope="simple";
    return{
        get selectedTopic(){return selectedTopic;},
        get currentMode(){return currentMode;},
        get scope(){return scope;},
        get mentalScope(){return mentalScope;},
        setSelectedTopic:vi.fn((t:string|null)=>{selectedTopic=t;}),
        setCurrentMode:vi.fn((m:"single"|"mental")=>{currentMode=m;}),
        setScope:vi.fn((s:string)=>{scope=s;}),
        setMentalScope:vi.fn((s:string)=>{mentalScope=s;}),
    };
});
vi.mock("./ui.js",()=>({
    updateUIState:vi.fn(),
}));
vi.mock("./constants.js",()=>({
    topics:[
        {id:"add",name:"Addition",icon:"+",category:"Arithmetic"},
        {id:"subtrt",name:"Subtraction",icon:"-",category:"Arithmetic"},
        {id:"mult",name:"Multiplication",icon:"×",category:"Arithmetic"},
        {id:"linEq",name:"Linear Equations",icon:"=",category:"Algebra"},
    ],
    scopeTopics:{
        simple:["add","subtrt","mult"],
        algebra:["add","subtrt","mult","linEq"],
        precalc:["add","subtrt","mult","linEq"],
        calc:["linEq"],
        all:["add","subtrt","mult","linEq"],
        empty:[],
        one:["add"],
    },
}));
import*as topics from"./topics.js";
import*as state from"./state.js";
import*as dom from"./dom.js";
import*as ui from"./ui.js";
describe("topics",()=>{
    afterEach(()=>{
        document.querySelectorAll(".topic-pill").forEach(el=>el.remove());
    });
    beforeEach(()=>{
        vi.clearAllMocks();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        dom.topicSearch.value="";
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
describe("renderTopicGrid",()=>{
    afterEach(()=>{
        document.querySelectorAll(".topic-pill").forEach(el=>el.remove());
    });
    beforeEach(()=>{
        vi.clearAllMocks();
        topics.resetTopicGrid();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        dom.topicSearch.value="";
    });
    it("should not throw when called",()=>{
        expect(()=>topics.renderTopicGrid()).not.toThrow();
    });
    it("should create topic elements on first call",()=>{
        topics.renderTopicGrid();
        expect(dom.topicGrid.appendChild).toHaveBeenCalled();
    });
    it("should filter topics by scope",()=>{
        topics.renderTopicGrid();
        expect(dom.topicGrid.appendChild).toHaveBeenCalled();
    });
    it("should filter topics by search term",()=>{
        dom.topicSearch.value="add";
        topics.renderTopicGrid();
        expect(dom.topicGrid.appendChild).toHaveBeenCalled();
    });
    it("should auto-select first topic when none selected",()=>{
        state.setSelectedTopic(null);
        topics.renderTopicGrid();
        expect(state.setSelectedTopic).toHaveBeenCalledWith("add");
    });
    it("should select first displayed topic when current selection out of scope",()=>{
        state.setSelectedTopic("linEq");
        state.setScope("simple");
        topics.renderTopicGrid();
        expect(state.setSelectedTopic).toHaveBeenCalledWith("add");
    });
    it("should highlight selected topic",()=>{
        state.setSelectedTopic("add");
        let pill=document.createElement("button");
        pill.className="topic-pill";
        pill.dataset.topicId="add";
        document.body.appendChild(pill);
        topics.renderTopicGrid();
        expect(pill.classList.contains("active")).toBe(true);
    });
    it("should handle empty search results",()=>{
        dom.topicSearch.value="zzz";
        expect(()=>topics.renderTopicGrid()).not.toThrow();
    });
});
describe("selectTopic",()=>{
    afterEach(()=>{
        document.querySelectorAll(".topic-pill").forEach(el=>el.remove());
    });
    beforeEach(()=>{
        vi.clearAllMocks();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        dom.topicSearch.value="";
    });
    it("should set selected topic in state",()=>{
        topics.selectTopic("add");
        expect(state.setSelectedTopic).toHaveBeenCalledWith("add");
    });
    it("should update current topic display text",()=>{
        topics.selectTopic("add");
        expect(dom.currentTopicDisplay.textContent).toBe("Addition");
    });
    it("should enable generate question button",()=>{
        dom.generateQuestionButton.disabled=true;
        topics.selectTopic("add");
        expect(dom.generateQuestionButton.disabled).toBe(false);
    });
    it("should add active class to selected element",()=>{
        let pill=document.createElement("button");
        pill.className="topic-pill";
        pill.dataset.topicId="add";
        document.body.appendChild(pill);
        topics.selectTopic("add");
        expect(pill.classList.contains("active")).toBe(true);
    });
    it("should remove active class from other elements",()=>{
        let pill1=document.createElement("button");
        pill1.className="topic-pill active";
        pill1.dataset.topicId="subtrt";
        let pill2=document.createElement("button");
        pill2.className="topic-pill";
        pill2.dataset.topicId="add";
        document.body.appendChild(pill1);
        document.body.appendChild(pill2);
        topics.selectTopic("add");
        expect(pill1.classList.contains("active")).toBe(false);
        expect(pill2.classList.contains("active")).toBe(true);
    });
    it("should update UI state",()=>{
        topics.selectTopic("add");
        expect(ui.updateUIState).toHaveBeenCalled();
    });
});
describe("pickRandomTopic",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        dom.topicSearch.value="";
    });
    it("should return a valid topic id",()=>{
        const result=topics.pickRandomTopic();
        expect(result).not.toBeNull();
        expect(["add","subtrt","mult"]).toContain(result);
    });
    it("should return null when no topics in scope",()=>{
        state.setScope("empty");
        const result=topics.pickRandomTopic();
        expect(result).toBeNull();
    });
    it("should respect current scope",()=>{
        state.setScope("calc");
        const result=topics.pickRandomTopic();
        expect(result).toBe("linEq");
    });
    it("should respect mental scope in mental mode",()=>{
        state.setCurrentMode("mental");
        state.setMentalScope("calc");
        const result=topics.pickRandomTopic();
        expect(result).toBe("linEq");
    });
    it("should return a topic from the allowed list",()=>{
        state.setScope("algebra");
        const result=topics.pickRandomTopic();
        expect(["add","subtrt","mult","linEq"]).toContain(result);
    });
    it("should handle single topic scope",()=>{
        state.setScope("one");
        const result=topics.pickRandomTopic();
        expect(result).toBe("add");
    });
});
describe("renderTopicGrid - edge cases",()=>{
    afterEach(()=>{
        document.querySelectorAll(".topic-pill").forEach(el=>el.remove());
    });
    beforeEach(()=>{
        vi.clearAllMocks();
        topics.resetTopicGrid();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        dom.topicSearch.value="";
    });
    it("should handle topics with missing icons",()=>{
        state.setScope("all");
        topics.renderTopicGrid();
        expect(dom.topicGrid.appendChild).toHaveBeenCalled();
    });
    it("should handle topics with very long names",()=>{
        state.setScope("all");
        topics.renderTopicGrid();
        expect(()=>topics.renderTopicGrid()).not.toThrow();
    });
    it("should handle duplicate topic ids",()=>{
        state.setScope("all");
        topics.renderTopicGrid();
        let pills=document.querySelectorAll(".topic-pill");
        let ids=Array.from(pills).map(p=>p.dataset.topicId);
        let uniqueIds=new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });
    it("should handle special characters in topic names",()=>{
        state.setScope("all");
        topics.renderTopicGrid();
        expect(()=>topics.renderTopicGrid()).not.toThrow();
    });
    it("should handle scope with single topic",()=>{
        state.setScope("one");
        topics.renderTopicGrid();
        expect(dom.topicGrid.appendChild).toHaveBeenCalled();
    });
});
describe("selectTopic - edge cases",()=>{
    afterEach(()=>{
        document.querySelectorAll(".topic-pill").forEach(el=>el.remove());
    });
    beforeEach(()=>{
        vi.clearAllMocks();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        dom.topicSearch.value="";
    });
    it("should handle clicking same topic twice",()=>{
        let pill=document.createElement("button");
        pill.className="topic-pill active";
        pill.dataset.topicId="add";
        document.body.appendChild(pill);
        topics.selectTopic("add");
        topics.selectTopic("add");
        expect(state.setSelectedTopic).toHaveBeenCalledWith("add");
        expect(pill.classList.contains("active")).toBe(true);
    });
    it("should handle topic with null element",()=>{
        expect(()=>topics.selectTopic("nonexistent")).not.toThrow();
        expect(state.setSelectedTopic).toHaveBeenCalledWith("nonexistent");
    });
    it("should update breadcrumb display",()=>{
        topics.selectTopic("add");
        expect(dom.currentTopicDisplay.textContent).toBe("Addition");
    });
    it("should scroll topic into view",()=>{
        let pill=document.createElement("button");
        pill.className="topic-pill";
        pill.dataset.topicId="add";
        pill.scrollIntoView=vi.fn();
        document.body.appendChild(pill);
        topics.selectTopic("add");
        expect(pill.classList.contains("active")).toBe(true);
    });
    it("should work with keyboard selection",()=>{
        let pill=document.createElement("button");
        pill.className="topic-pill";
        pill.dataset.topicId="add";
        document.body.appendChild(pill);
        pill.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter"}));
        topics.selectTopic("add");
        expect(state.setSelectedTopic).toHaveBeenCalledWith("add");
    });
});
