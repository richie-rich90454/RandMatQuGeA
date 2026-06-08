/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
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
    let mcqMode=false;
    return{
        get selectedTopic(){return selectedTopic;},
        get currentMode(){return currentMode;},
        get currentDifficulty(){return currentDifficulty;},
        get shuffle(){return shuffle;},
        get autoTimeout(){return autoTimeout;},
        get generateDebounceTimeout(){return generateDebounceTimeout;},
        get mcqMode(){return mcqMode;},
        setSelectedTopic:vi.fn((t:string|null)=>{selectedTopic=t;}),
        setCurrentDifficulty:vi.fn((d:string)=>{currentDifficulty=d;}),
        setGenerateDebounceTimeout:vi.fn((t:any)=>{generateDebounceTimeout=t;}),
        setAutoTimeout:vi.fn((t:any)=>{autoTimeout=t;}),
        setMcqMode:vi.fn((m:boolean)=>{mcqMode=m;}),
        setShuffle:vi.fn((s:boolean)=>{shuffle=s;}),
        setCurrentMode:vi.fn((m:string)=>{currentMode=m;}),
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
vi.mock("@tauri-apps/api/core",()=>({
    invoke:vi.fn(()=>Promise.resolve({difficulty:"hard",weak_topic:"add"})),
}));
import{debounceGenerate,generateQuestion,practiceWeakAreas}from"./generation.js";
import*as state from"./state.js";
import{invoke}from"@tauri-apps/api/core";
import{generateQuestion as callGeneratorMock}from"./questionGenerator.js";
import{generateChoicesForCurrentQuestion as generateChoicesMock}from"./mcq.js";
import{showNotification,updateUIState}from"./ui.js";
import{startQuestionTimer as startTimerMock}from"./answer.js";
import{pickRandomTopic as pickRandomTopicMock}from"./topics.js";
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
describe("debounceGenerate",()=>{
    beforeEach(()=>{
        state.setSelectedTopic(null);
        state.setCurrentDifficulty("medium");
        state.setMcqMode(false);
        state.setShuffle(false);
        state.setGenerateDebounceTimeout(null);
        vi.clearAllMocks();
        vi.useFakeTimers();
    });
    afterEach(()=>{
        vi.clearAllTimers();
        vi.useRealTimers();
    });
    it("should not throw when called",()=>{
        expect(()=>debounceGenerate()).not.toThrow();
    });
    it("should be a function",()=>{
        expect(typeof debounceGenerate).toBe("function");
    });
    it("should clear previous debounce timeout",()=>{
        debounceGenerate();
        debounceGenerate();
        expect(state.setGenerateDebounceTimeout).toHaveBeenCalledTimes(2);
    });
    it("should set a new debounce timeout",()=>{
        debounceGenerate();
        expect(state.setGenerateDebounceTimeout).toHaveBeenCalledWith(expect.any(Object));
    });
});
describe("generateQuestion",()=>{
    beforeEach(()=>{
        state.setSelectedTopic(null);
        state.setCurrentDifficulty("medium");
        state.setMcqMode(false);
        state.setShuffle(false);
        vi.clearAllMocks();
    });
    it("should be a function",()=>{
        expect(typeof generateQuestion).toBe("function");
    });
    it("should not throw when called",async()=>{
        await expect(generateQuestion()).resolves.toBeUndefined();
    });
    it("should show notification if no topic selected",async()=>{
        state.setSelectedTopic(null);
        await generateQuestion();
        expect(showNotification).toHaveBeenCalledWith("Please select a topic first","warning");
    });
    it("should call questionGenerator when topic is set",async()=>{
        state.setSelectedTopic("add");
        await generateQuestion();
        expect(callGeneratorMock).toHaveBeenCalledWith("add","medium");
    });
    it("should start question timer",async()=>{
        state.setSelectedTopic("add");
        await generateQuestion();
        expect(startTimerMock).toHaveBeenCalled();
    });
    it("should generate MCQ choices when mcqMode is on",async()=>{
        state.setSelectedTopic("add");
        state.setMcqMode(true);
        await generateQuestion();
        expect(generateChoicesMock).toHaveBeenCalled();
    });
    it("should handle easy difficulty",async()=>{
        state.setSelectedTopic("add");
        state.setCurrentDifficulty("easy");
        await generateQuestion();
        expect(callGeneratorMock).toHaveBeenCalledWith("add","easy");
    });
    it("should handle hard difficulty",async()=>{
        state.setSelectedTopic("add");
        state.setCurrentDifficulty("hard");
        await generateQuestion();
        expect(callGeneratorMock).toHaveBeenCalledWith("add","hard");
    });
    it("should handle medium difficulty",async()=>{
        state.setSelectedTopic("add");
        state.setCurrentDifficulty("medium");
        await generateQuestion();
        expect(callGeneratorMock).toHaveBeenCalledWith("add","medium");
    });
    it("should update UI state after generation",async()=>{
        state.setSelectedTopic("add");
        await generateQuestion();
        expect(updateUIState).toHaveBeenCalled();
    });
    it("should pick random topic when shuffle is on",async()=>{
        state.setSelectedTopic("add");
        state.setShuffle(true);
        await generateQuestion();
        expect(pickRandomTopicMock).toHaveBeenCalled();
    });
});
describe("practiceWeakAreas",()=>{
    beforeEach(()=>{
        state.setSelectedTopic(null);
        state.setCurrentDifficulty("medium");
        state.setMcqMode(false);
        state.setShuffle(false);
        vi.clearAllMocks();
    });
    it("should be a function",()=>{
        expect(typeof practiceWeakAreas).toBe("function");
    });
    it("should not throw when called",async()=>{
        await expect(practiceWeakAreas()).resolves.toBeUndefined();
    });
    it("should invoke get_next_question_recommendation",async()=>{
        state.setSelectedTopic("add");
        await practiceWeakAreas();
        expect(invoke).toHaveBeenCalledWith("get_next_question_recommendation",expect.objectContaining({currentTopic:"add",currentDifficulty:expect.any(String)}));
    });
    it("should set recommended difficulty",async()=>{
        state.setSelectedTopic("add");
        await practiceWeakAreas();
        expect(state.setCurrentDifficulty).toHaveBeenCalledWith("hard");
    });
    it("should generate question after recommendation",async()=>{
        state.setSelectedTopic("add");
        await practiceWeakAreas();
        expect(callGeneratorMock).toHaveBeenCalled();
    });
});
