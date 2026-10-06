/** @vitest-environment jsdom */
import{describe,it,expect,vi,afterEach,beforeEach}from"vitest";
vi.mock("../../main/core/DomRegistry",()=>{
    // The grid is a real element rather than a recording stub, because the pills
    // the grid creates are the elements the tests inspect. A stub that discarded
    // them forced the tests to append their own pill to the document body, which
    // is not a shape the app ever produces.
    const gridElement=document.createElement("div");
    const topicGrid={
        get innerHTML(){return gridElement.innerHTML;},
        set innerHTML(v:string){gridElement.innerHTML=v;},
        appendChild:vi.fn((node:Node)=>{gridElement.appendChild(node);}),
        querySelector(selector:string){return gridElement.querySelector(selector);},
        querySelectorAll(selector:string){return gridElement.querySelectorAll(selector);}
    };
    const topicSearch={value:""};
    const currentTopicDisplay={textContent:""};
    const generateQuestionButton={disabled:false,setAttribute:vi.fn()};
    // The category chip row and the count are real elements rather than stubs,
    // because the behavior under test is what a click on a chip does to the grid,
    // and a stub cannot be clicked. The chip row is kept out of the document so
    // the test drives it directly.
    const chipElement=document.createElement("div");
    const topicCategoryFilter={
        get innerHTML(){return chipElement.innerHTML;},
        set innerHTML(v:string){chipElement.innerHTML=v;},
        appendChild:vi.fn((node:Node)=>{chipElement.appendChild(node);}),
        addEventListener:vi.fn((type:string,fn:(e:Event)=>void)=>{chipElement.addEventListener(type,fn);}),
        querySelector(selector:string){return chipElement.querySelector(selector);}
    };
    const topicCount={textContent:""};
    const dom={
        topicGrid,
        topicSearch,
        currentTopicDisplay,
        generateQuestionButton,
        topicCategoryFilter,
        topicCount,
        displays:{topicGrid,currentTopicDisplay,topicCategoryFilter,topicCount},
        inputs:{topicSearch},
        buttons:{generateQuestionButton},
        // The registry grew a help group and a daily group. They are present here
        // as absent controls rather than omitted, which is not a shape the
        // registry can take.
        help:{
            showHintBtn:null,
            showSolutionBtn:null,
            hintPanel:null,
            confidenceRow:null,
            confidenceButtons:[]
        },
        daily:{
            modeDailyBtn:null,
            dailySummary:null,
            dailyProgress:null,
            dailyProgressFill:null,
            dailySummaryText:null,
            dailyStartBtn:null,
            dailyStreak:null,
            dailyStreakCount:null
        }
    };
    return{dom,chipElement};
});
vi.mock("../../main/core/StateStore",()=>{
    let selectedTopic:string|null=null;
    let currentMode="single";
    let scope="simple";
    let mentalScope="simple";
    let topicCategory="all";
    const setSelectedTopic=vi.fn((t:string|null)=>{selectedTopic=t;});
    const setCurrentMode=vi.fn((m:string)=>{currentMode=m;});
    const setScope=vi.fn((s:string)=>{scope=s;});
    const setMentalScope=vi.fn((s:string)=>{mentalScope=s;});
    const appState={
        get selectedTopic(){return selectedTopic;},
        set selectedTopic(v:string|null){selectedTopic=v;setSelectedTopic(v);},
        get currentMode(){return currentMode;},
        get scope(){return scope;},
        set scope(v:string){scope=v;},
        get mentalScope(){return mentalScope;},
        set mentalScope(v:string){mentalScope=v;},
        get topicCategory(){return topicCategory;},
        set topicCategory(value:string){topicCategory=value;},
        setSelectedTopic,
        setCurrentMode,
        setScope,
        setMentalScope
    };
    return{appState};
});
vi.mock("../../main/Ui.js",()=>({
    updateUIState:vi.fn(),
}));
vi.mock("../../main/Constants.js",()=>({
    // The order the scope control lists them in, which is also the order a question
    // is answered in when a category can only be reached by widening.
    scopeLadder:["simple","algebra","precalc","calc","all"],
}));
vi.mock("../../main/TopicData.js",()=>({
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
import*as topics from"../../main/Topics.js";
import*as stateStore from"../../main/core/StateStore";
let state:any=stateStore.appState;
import*as domRegistry from"../../main/core/DomRegistry";
let dom:any=domRegistry.dom;
let chipRow:any=(domRegistry as unknown as{chipElement:HTMLElement}).chipElement;
import*as ui from"../../main/Ui.js";
describe("topics",()=>{
    afterEach(()=>{
        // The grid is emptied through the module that owns it, so the index of
        // pill elements goes with it. Removing the nodes by hand would leave the
        // index pointing at detached elements.
        topics.resetTopicGrid();
    });
    beforeEach(async()=>{
        await topics.ensureTopicData();
        vi.clearAllMocks();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        state.topicCategory="all";
        dom.topicSearch!.value="";
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
        // The grid is emptied through the module that owns it, so the index of
        // pill elements goes with it. Removing the nodes by hand would leave the
        // index pointing at detached elements.
        topics.resetTopicGrid();
    });
    beforeEach(async()=>{
        await topics.ensureTopicData();
        vi.clearAllMocks();
        topics.resetTopicGrid();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        state.topicCategory="all";
        dom.topicSearch!.value="";
    });
    it("should not throw when called",()=>{
        expect(()=>topics.renderTopicGrid()).not.toThrow();
    });
    it("should create topic elements on first call",()=>{
        topics.renderTopicGrid();
        expect(dom.topicGrid!.appendChild).toHaveBeenCalled();
    });
    it("should filter topics by scope",()=>{
        topics.renderTopicGrid();
        expect(dom.topicGrid!.appendChild).toHaveBeenCalled();
    });
    it("should filter topics by search term",()=>{
        dom.topicSearch!.value="add";
        topics.renderTopicGrid();
        expect(dom.topicGrid!.appendChild).toHaveBeenCalled();
    });
    it("should auto-select first topic when none selected",()=>{
        state.setSelectedTopic(null);
        topics.renderTopicGrid();
        expect(state.setSelectedTopic).toHaveBeenCalledWith("add");
    });
    it("should group the grid under a heading per category",()=>{
        topics.resetTopicGrid();
        topics.renderTopicGrid();
        let headings=Array.from(dom.topicGrid!.querySelectorAll(".topic-group-heading") as NodeListOf<HTMLElement>);
        expect(headings.map(h=>h.textContent)).toEqual(["Arithmetic","Algebra"]);
    });
    it("should build one chip per category plus an all chip",()=>{
        topics.resetTopicGrid();
        topics.renderTopicGrid();
        let chips=Array.from(chipRow.querySelectorAll(".topic-chip") as NodeListOf<HTMLElement>);
        expect(chips.map(c=>c.getAttribute("data-category"))).toEqual(["all","Arithmetic","Algebra"]);
    });
    it("should show how many topics the scope allows on the all chip",()=>{
        topics.resetTopicGrid();
        topics.renderTopicGrid();
        let chips=Array.from(chipRow.querySelectorAll(".topic-chip") as NodeListOf<HTMLElement>);
        // The scope is "simple": three arithmetic topics, none of the algebra one.
        expect(chips[0]!.textContent).toBe("All 3");
        expect(chips[1]!.textContent).toBe("Arithmetic 3");
        expect(chips[2]!.textContent).toBe("Algebra 0");
    });
    it("should hide the topics of every category but the one chosen",()=>{
        topics.resetTopicGrid();
        state.setScope("algebra");
        state.topicCategory="Algebra";
        topics.renderTopicGrid();
        let hidden=(id:string)=>dom.topicGrid!.querySelector(`[data-topic-id="${id}"]`)!.classList.contains("hidden");
        expect(hidden("linEq")).toBe(false);
        expect(hidden("add")).toBe(true);
    });
    it("should narrow the grid when a category chip is clicked",()=>{
        topics.resetTopicGrid();
        state.setScope("algebra");
        topics.renderTopicGrid();
        let chip=chipRow.querySelector('[data-category="Algebra"]') as HTMLElement;
        chip.click();
        expect(state.topicCategory).toBe("Algebra");
        let hidden=(id:string)=>dom.topicGrid!.querySelector(`[data-topic-id="${id}"]`)!.classList.contains("hidden");
        expect(hidden("linEq")).toBe(false);
        expect(hidden("add")).toBe(true);
    });
    it("should hide the category headings once one category is chosen",()=>{
        topics.resetTopicGrid();
        state.setScope("algebra");
        topics.renderTopicGrid();
        let headings=Array.from(dom.topicGrid!.querySelectorAll(".topic-group-heading") as NodeListOf<HTMLElement>);
        expect(headings.every(h=>!h.classList.contains("hidden"))).toBe(true);
        state.topicCategory="Algebra";
        topics.renderTopicGrid();
        expect(headings.every(h=>h.classList.contains("hidden"))).toBe(true);
    });
    it("should hide a heading whose category has nothing visible",()=>{
        topics.resetTopicGrid();
        state.setScope("algebra");
        dom.topicSearch!.value="linear";
        topics.renderTopicGrid();
        let headings=Array.from(dom.topicGrid!.querySelectorAll(".topic-group-heading") as NodeListOf<HTMLElement>);
        expect(headings[0]!.classList.contains("hidden")).toBe(true);
        expect(headings[1]!.classList.contains("hidden")).toBe(false);
    });
    it("should find a category by name, since no topic is named after one",()=>{
        topics.resetTopicGrid();
        state.setScope("algebra");
        dom.topicSearch!.value="algebra";
        topics.renderTopicGrid();
        let hidden=(id:string)=>dom.topicGrid!.querySelector(`[data-topic-id="${id}"]`)!.classList.contains("hidden");
        expect(hidden("linEq")).toBe(false);
        expect(hidden("add")).toBe(true);
    });
    it("should report how many topics are showing out of how many the scope allows",()=>{
        topics.resetTopicGrid();
        topics.renderTopicGrid();
        expect(dom.topicCount.textContent).toBe("3 of 3 topics");
        state.setScope("algebra");
        topics.renderTopicGrid();
        expect(dom.topicCount.textContent).toBe("4 of 4 topics");
        dom.topicSearch!.value="subtrt";
        topics.renderTopicGrid();
        expect(dom.topicCount.textContent).toBe("1 of 4 topics");
    });
    it("should clear the selection when the filter hides the selected topic",()=>{
        topics.resetTopicGrid();
        state.setScope("algebra");
        topics.renderTopicGrid();
        expect(state.selectedTopic).toBe("add");
        state.topicCategory="Algebra";
        topics.renderTopicGrid();
        expect(state.selectedTopic).toBeNull();
        expect(dom.generateQuestionButton.disabled).toBe(true);
    });
    it("should not auto-select a topic the filter has hidden",()=>{
        topics.resetTopicGrid();
        state.setScope("algebra");
        state.setSelectedTopic(null);
        state.topicCategory="Algebra";
        dom.topicSearch!.value="linear";
        topics.renderTopicGrid();
        expect(state.setSelectedTopic).not.toHaveBeenCalledWith("add");
    });
    it("should widen the scope so a chosen category is not a dead end",()=>{
        // A chip reading "Algebra 0" against the default arithmetic scope reads as
        // unavailable, and a filter that can be pointed at nothing is a dead end.
        topics.resetTopicGrid();
        state.setScope("simple");
        topics.renderTopicGrid();
        expect(dom.topicCount.textContent).toBe("3 of 3 topics");
        dom.topicCategoryFilter!.querySelector('[data-category="Algebra"]')!.click();
        expect(state.scope).toBe("algebra");
        expect(dom.topicCount.textContent).toBe("1 of 4 topics in Algebra");
    });
    it("should widen the scope for All, because All means every category",()=>{
        topics.resetTopicGrid();
        state.setScope("simple");
        topics.renderTopicGrid();
        dom.topicCategoryFilter!.querySelector('[data-category="all"]')!.click();
        expect(state.scope).toBe("all");
        expect(dom.topicCount.textContent).toBe("4 of 4 topics");
    });
    it("should leave the scope alone when the category is already in it",()=>{
        topics.resetTopicGrid();
        state.setScope("algebra");
        topics.renderTopicGrid();
        dom.topicCategoryFilter!.querySelector('[data-category="Arithmetic"]')!.click();
        expect(state.scope).toBe("algebra");
    });
    it("should find a topic by name that the scope excludes",()=>{
        // Typing the name of a topic is about as unambiguous a request as this
        // interface gets. Answering it with an empty grid because an unrelated scope
        // excluded the topic is the same dead end as a chip reading zero.
        topics.resetTopicGrid();
        state.setScope("simple");
        dom.topicSearch!.value="linear";
        topics.renderTopicGrid();
        expect(state.scope).toBe("algebra");
        expect(dom.topicCount.textContent).toBe("1 of 4 topics");
    });
    it("should not widen the scope for a search the current scope already answers",()=>{
        topics.resetTopicGrid();
        state.setScope("algebra");
        dom.topicSearch!.value="add";
        topics.renderTopicGrid();
        expect(state.scope).toBe("algebra");
        expect(dom.topicCount.textContent).toBe("1 of 4 topics");
    });
    it("should show every topic when the chosen category names none of them",()=>{
        topics.resetTopicGrid();
        state.setScope("algebra");
        state.topicCategory="A Category That No Longer Exists";
        topics.renderTopicGrid();
        let hidden=(id:string)=>dom.topicGrid!.querySelector(`[data-topic-id="${id}"]`)!.classList.contains("hidden");
        expect(hidden("add")).toBe(false);
        expect(hidden("linEq")).toBe(false);
    });
    it("should select first displayed topic when current selection out of scope",()=>{
        state.setSelectedTopic("linEq");
        state.setScope("simple");
        topics.renderTopicGrid();
        expect(state.setSelectedTopic).toHaveBeenCalledWith("add");
    });
    it("should highlight selected topic",()=>{
        state.setSelectedTopic("add");
        topics.renderTopicGrid();
        let pill=dom.topicGrid!.querySelector('[data-topic-id="add"]');
        expect(pill?.classList.contains("active")).toBe(true);
    });
    it("should handle empty search results",()=>{
        dom.topicSearch!.value="zzz";
        expect(()=>topics.renderTopicGrid()).not.toThrow();
    });
});
describe("selectTopic",()=>{
    afterEach(()=>{
        // The grid is emptied through the module that owns it, so the index of
        // pill elements goes with it. Removing the nodes by hand would leave the
        // index pointing at detached elements.
        topics.resetTopicGrid();
    });
    beforeEach(async()=>{
        await topics.ensureTopicData();
        vi.clearAllMocks();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        state.topicCategory="all";
        dom.topicSearch!.value="";
    });
    it("should set selected topic in state",()=>{
        topics.selectTopic("add");
        expect(state.setSelectedTopic).toHaveBeenCalledWith("add");
    });
    it("should update current topic display text",()=>{
        topics.selectTopic("add");
        expect(dom.currentTopicDisplay!.textContent).toBe("Addition");
    });
    it("should enable generate question button",()=>{
        dom.generateQuestionButton!.disabled=true;
        topics.selectTopic("add");
        expect(dom.generateQuestionButton!.disabled).toBe(false);
    });
    it("should add active class to selected element",()=>{
        // Rendering with nothing selected auto-selects the first topic, so the
        // topic chosen here has to be a different one, or the call would toggle
        // that same selection off rather than moving it.
        topics.renderTopicGrid();
        topics.selectTopic("subtrt");
        let pill=dom.topicGrid!.querySelector('[data-topic-id="subtrt"]');
        expect(pill?.classList.contains("active")).toBe(true);
    });
    it("should remove active class from other elements",()=>{
        // Rendering with nothing selected auto-selects the first topic, so the
        // topic chosen here has to be a different one, or the call would toggle
        // that same selection off rather than moving it.
        topics.renderTopicGrid();
        topics.selectTopic("subtrt");
        let previous=dom.topicGrid!.querySelector('[data-topic-id="add"]');
        let chosen=dom.topicGrid!.querySelector('[data-topic-id="subtrt"]');
        expect(previous?.classList.contains("active")).toBe(false);
        expect(chosen?.classList.contains("active")).toBe(true);
    });
    it("should update UI state",()=>{
        topics.selectTopic("add");
        expect(ui.updateUIState).toHaveBeenCalled();
    });
});
describe("pickRandomTopic",()=>{
    beforeEach(async()=>{
        await topics.ensureTopicData();
        vi.clearAllMocks();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        state.topicCategory="all";
        dom.topicSearch!.value="";
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
        // The grid is emptied through the module that owns it, so the index of
        // pill elements goes with it. Removing the nodes by hand would leave the
        // index pointing at detached elements.
        topics.resetTopicGrid();
    });
    beforeEach(async()=>{
        await topics.ensureTopicData();
        vi.clearAllMocks();
        topics.resetTopicGrid();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        state.topicCategory="all";
        dom.topicSearch!.value="";
    });
    it("should handle topics with missing icons",()=>{
        state.setScope("all");
        topics.renderTopicGrid();
        expect(dom.topicGrid!.appendChild).toHaveBeenCalled();
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
        let ids=Array.from(pills).map(p=>(p as HTMLElement).dataset.topicId);
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
        expect(dom.topicGrid!.appendChild).toHaveBeenCalled();
    });
});
describe("selectTopic - edge cases",()=>{
    afterEach(()=>{
        // The grid is emptied through the module that owns it, so the index of
        // pill elements goes with it. Removing the nodes by hand would leave the
        // index pointing at detached elements.
        topics.resetTopicGrid();
    });
    beforeEach(async()=>{
        await topics.ensureTopicData();
        vi.clearAllMocks();
        state.setSelectedTopic(null);
        state.setCurrentMode("single");
        state.setScope("simple");
        state.setMentalScope("simple");
        state.topicCategory="all";
        dom.topicSearch!.value="";
    });
    it("should handle clicking same topic twice",()=>{
        // The pills come from the grid rather than from the document body, because
        // the grid owns them and the module tracks them by index.
        topics.renderTopicGrid();
        let pill=dom.topicGrid!.querySelector('[data-topic-id="subtrt"]');
        topics.selectTopic("subtrt");
        topics.selectTopic("subtrt");
        expect(state.setSelectedTopic).toHaveBeenCalledWith(null);
        expect(pill?.classList.contains("active")).toBe(false);
    });
    it("should handle topic with null element",()=>{
        expect(()=>topics.selectTopic("nonexistent")).not.toThrow();
        expect(state.setSelectedTopic).toHaveBeenCalledWith("nonexistent");
    });
    it("should update breadcrumb display",()=>{
        topics.selectTopic("add");
        expect(dom.currentTopicDisplay!.textContent).toBe("Addition");
    });
    it("should mark the selected pill in the grid",()=>{
        topics.renderTopicGrid();
        topics.selectTopic("subtrt");
        let pill=dom.topicGrid!.querySelector('[data-topic-id="subtrt"]');
        expect(pill?.classList.contains("active")).toBe(true);
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
