/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
vi.mock("./core/DomRegistry",()=>{
    const difficultySelect={value:"medium"};
    const answerResults={innerHTML:"",className:"",classList:{add:vi.fn(),remove:vi.fn()}};
    const userAnswer={value:"",disabled:false,focus:vi.fn(),removeAttribute:vi.fn(),style:{display:""}};
    const questionArea={innerHTML:""};
    const checkAnswerButton={disabled:false,setAttribute:vi.fn()};
    const expectedFormatDiv={textContent:""};
    const dom={
        difficultySelect,
        answerResults,
        userAnswer,
        questionArea,
        checkAnswerButton,
        expectedFormatDiv,
        inputs:{difficultySelect,userAnswer},
        displays:{answerResults,questionArea,expectedFormatDiv},
        buttons:{checkAnswerButton}
    };
    return{dom};
});
vi.mock("./core/StateStore",()=>{
    let selectedTopic:string|null=null;
    let currentMode="single";
    let currentDifficulty="medium";
    let shuffle=false;
    let autoTimeout:any=null;
    let generateDebounceTimeout:any=null;
    let mcqMode=false;
    let weakTopicQueue:string[]=[];
    const setSelectedTopic=vi.fn((t:string|null)=>{selectedTopic=t;});
    const setCurrentDifficulty=vi.fn((d:string)=>{currentDifficulty=d;});
    const setGenerateDebounceTimeout=vi.fn((t:any)=>{generateDebounceTimeout=t;});
    const setAutoTimeout=vi.fn((t:any)=>{autoTimeout=t;});
    const setMcqMode=vi.fn((m:boolean)=>{mcqMode=m;});
    const setShuffle=vi.fn((s:boolean)=>{shuffle=s;});
    const setCurrentMode=vi.fn((m:string)=>{currentMode=m;});
    const appState={
        get selectedTopic(){return selectedTopic;},
        set selectedTopic(v:string|null){selectedTopic=v;setSelectedTopic(v);},
        get currentMode(){return currentMode;},
        set currentMode(v:string){currentMode=v;setCurrentMode(v);},
        get currentDifficulty(){return currentDifficulty;},
        set currentDifficulty(v:string){currentDifficulty=v;setCurrentDifficulty(v);},
        get shuffle(){return shuffle;},
        set shuffle(v:boolean){shuffle=v;setShuffle(v);},
        get autoTimeout(){return autoTimeout;},
        set autoTimeout(v:any){autoTimeout=v;setAutoTimeout(v);},
        get generateDebounceTimeout(){return generateDebounceTimeout;},
        set generateDebounceTimeout(v:any){generateDebounceTimeout=v;setGenerateDebounceTimeout(v);},
        get mcqMode(){return mcqMode;},
        set mcqMode(v:boolean){mcqMode=v;setMcqMode(v);},
        get weakTopicQueue(){return weakTopicQueue;},
        set weakTopicQueue(v:string[]){weakTopicQueue=v;},
        setSelectedTopic,
        setCurrentDifficulty,
        setGenerateDebounceTimeout,
        setAutoTimeout,
        setMcqMode,
        setShuffle,
        setCurrentMode
    };
    return{appState};
});
vi.mock("./core/QuestionState",()=>{
    return{
        questionState:{
            get correctAnswer(){return(window as any).correctAnswer;},
            set correctAnswer(v:any){(window as any).correctAnswer=v;},
            get expectedFormat(){return(window as any).expectedFormat;},
            set expectedFormat(v:any){(window as any).expectedFormat=v;},
            get hasQuestion(){return(window as any).hasQuestion;},
            set hasQuestion(v:any){(window as any).hasQuestion=v;}
        }
    };
});
vi.mock("./core/QuestionRenderer",()=>{
    return{
        renderer:{
            render:vi.fn(),
            typeset:vi.fn()
        }
    };
});
vi.mock("./Ui.js",()=>({
    showNotification:vi.fn(),
    updatePreview:vi.fn(),
    updateUIState:vi.fn(),
}));
vi.mock("./Topics.js",()=>({
    pickRandomTopic:vi.fn(()=>"add"),
    selectTopic:vi.fn(),
}));
vi.mock("./QuestionGenerator.js",()=>({
    generateQuestion:vi.fn(),
}));
vi.mock("./Mcq.js",()=>({
    generateChoicesForCurrentQuestion:vi.fn(),
}));
vi.mock("./Settings.js",()=>({
    settings:{adaptive:false},
}));
vi.mock("./Answer.js",()=>({
    startQuestionTimer:vi.fn(),
}));
vi.mock("@tauri-apps/api/core",()=>({
    invoke:vi.fn(()=>Promise.resolve({difficulty:"hard",weak_topic:"add"})),
}));
import{debounceGenerate,generateQuestion}from"./Generation.js";
import*as stateStore from"./core/StateStore";
let state:any=stateStore.appState;
import{invoke}from"@tauri-apps/api/core";
import{generateQuestion as _callGeneratorMock}from"./QuestionGenerator.js";
let callGeneratorMock=_callGeneratorMock as any;
import{generateChoicesForCurrentQuestion as _generateChoicesMock}from"./Mcq.js";
let generateChoicesMock=_generateChoicesMock as any;
import{showNotification,updateUIState}from"./Ui.js";
import{startQuestionTimer as startTimerMock}from"./Answer.js";
import{pickRandomTopic as pickRandomTopicMock}from"./Topics.js";
import*as domRegistry from"./core/DomRegistry";
let dom:any=domRegistry.dom;
import*as settings from"./Settings.js";
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
        callGeneratorMock.mockImplementation(()=>{
            (window as any).correctAnswer={correct:"42",alternate:"42",display:"42"};
            (window as any).expectedFormat="decimal";
        });
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
describe("generateQuestion - edge cases",()=>{
    beforeEach(()=>{
        state.setSelectedTopic(null);
        state.setCurrentDifficulty("medium");
        state.setMcqMode(false);
        state.setShuffle(false);
        (settings as any).settings.adaptive=false;
        (window as any).hasQuestion=false;
        callGeneratorMock.mockReset();
        vi.clearAllMocks();
        callGeneratorMock.mockImplementation(()=>{
            (window as any).correctAnswer={correct:"42",alternate:"42",display:"42"};
            (window as any).expectedFormat="decimal";
        });
    });
    it("should handle null topic gracefully",async()=>{
        state.setSelectedTopic(null);
        await generateQuestion();
        expect(callGeneratorMock).not.toHaveBeenCalled();
    });
    it("should handle empty string topic",async()=>{
        state.setSelectedTopic("");
        await generateQuestion();
        expect(showNotification).toHaveBeenCalledWith("Please select a topic first","warning");
    });
    it("should handle unknown topic id",async()=>{
        state.setSelectedTopic("unknown_topic_xyz");
        await generateQuestion();
        expect(callGeneratorMock).toHaveBeenCalledWith("unknown_topic_xyz","medium");
    });
    it("should generate for every difficulty level",async()=>{
        let difficulties=["easy","medium","hard"];
        state.setSelectedTopic("add");
        for(let i=0;i<difficulties.length;i++){
            state.setCurrentDifficulty(difficulties[i]);
            callGeneratorMock.mockClear();
            await generateQuestion();
            expect(callGeneratorMock).toHaveBeenCalledWith("add",difficulties[i]);
        }
    });
    it("should update expected format display",async()=>{
        state.setSelectedTopic("add");
        await generateQuestion();
        expect(dom.expectedFormatDiv!.textContent).toBe("Expected format: decimal");
    });
    it("should clear previous answer state",async()=>{
        state.setSelectedTopic("add");
        dom.userAnswer!.value="old answer";
        await generateQuestion();
        expect(dom.userAnswer!.value).toBe("");
    });
    it("should set hasQuestion to true",async()=>{
        state.setSelectedTopic("add");
        await generateQuestion();
        expect((window as any).hasQuestion).toBe(true);
    });
    it("should handle generator returning empty string",async()=>{
        state.setSelectedTopic("add");
        callGeneratorMock.mockImplementation(()=>{
            (window as any).correctAnswer={correct:"",alternate:"",display:""};
            (window as any).expectedFormat="";
        });
        await generateQuestion();
        expect((window as any).hasQuestion).toBe(false);
        callGeneratorMock.mockReset();
    });
    it("should handle generator throwing error",async()=>{
        state.setSelectedTopic("add");
        callGeneratorMock.mockImplementation(()=>{
            throw new Error("Generator failed");
        });
        await generateQuestion();
        expect((window as any).hasQuestion).toBe(false);
        expect(updateUIState).toHaveBeenCalled();
        callGeneratorMock.mockReset();
    });
    it("should work with adaptive difficulty",async()=>{
        state.setSelectedTopic("add");
        (settings as any).settings.adaptive=true;
        await generateQuestion();
        expect(invoke).toHaveBeenCalledWith("get_next_question_recommendation",expect.objectContaining({currentTopic:"add",currentDifficulty:expect.any(String)}));
        (settings as any).settings.adaptive=false;
    });
});
