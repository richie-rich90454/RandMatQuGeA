/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./dom.js",()=>({
    difficultySelect:{value:"medium"},
    answerResults:{innerHTML:"",className:"",classList:{add:vi.fn(),remove:vi.fn()}},
    userAnswer:{value:"",disabled:false,focus:vi.fn(),removeAttribute:vi.fn(),style:{display:""}},
    questionArea:{innerHTML:""},
    checkAnswerButton:{disabled:false,setAttribute:vi.fn()},
    expectedFormatDiv:{textContent:""},
}));
vi.mock("./state.js",()=>{
    let selectedTopic:string|null=null;
    let currentMode="single";
    let currentDifficulty="medium";
    let shuffle=false;
    let autoTimeout:any=null;
    let generateDebounceTimeout:any=null;
    return{
        selectedTopic,
        currentMode,
        currentDifficulty,
        shuffle,
        autoTimeout,
        generateDebounceTimeout,
        mcqMode:false,
        setSelectedTopic:vi.fn((t:string|null)=>{selectedTopic=t;}),
        setCurrentDifficulty:vi.fn((d:string)=>{currentDifficulty=d;}),
        setGenerateDebounceTimeout:vi.fn((t:any)=>{generateDebounceTimeout=t;}),
        setAutoTimeout:vi.fn((t:any)=>{autoTimeout=t;}),
    };
});
vi.mock("./ui.js",()=>({
    showNotification:vi.fn(),
    updatePreview:vi.fn(),
    updateUIState:vi.fn(),
}));
vi.mock("./topics.js",()=>({
    pickRandomTopic:vi.fn(()=>"add"),
    selectTopic:vi.fn(),
}));
vi.mock("./questionGenerator.js",()=>({
    generateQuestion:vi.fn(),
}));
vi.mock("./mcq.js",()=>({
    generateChoicesForCurrentQuestion:vi.fn(),
}));
vi.mock("./settings.js",()=>({
    settings:{adaptive:false},
}));
vi.mock("./answer.js",()=>({
    startQuestionTimer:vi.fn(),
}));
import{debounceGenerate,generateQuestion,practiceWeakAreas}from"./generation.js";
describe("generation",()=>{
    it("should export debounceGenerate",()=>{
        expect(typeof debounceGenerate).toBe("function");
    });
    it("debounceGenerate should not throw",()=>{
        expect(()=>debounceGenerate()).not.toThrow();
    });
    it("should export generateQuestion",()=>{
        expect(typeof generateQuestion).toBe("function");
    });
    it("should export practiceWeakAreas",()=>{
        expect(typeof practiceWeakAreas).toBe("function");
    });
});
