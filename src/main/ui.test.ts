/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./dom.js",()=>({
    modeSingleBtn:{setAttribute:vi.fn()},
    modeMentalBtn:{setAttribute:vi.fn()},
    mentalProgressBar:{setAttribute:vi.fn()},
    timerDisplay:{innerHTML:""},
    scoreDisplay:{innerHTML:""},
    startSessionBtn:{textContent:"",classList:{add:vi.fn(),remove:vi.fn()}},
    pauseSessionBtn:{style:{display:""}},
    skipQuestionBtn:{style:{display:""}},
    userAnswer:{value:"",style:{display:""},selectionStart:0,selectionEnd:0,focus:vi.fn()},
    previewDiv:{innerHTML:"",classList:{add:vi.fn(),remove:vi.fn()},style:{display:""},appendChild:vi.fn()},
    answerResults:{innerHTML:"",className:"",classList:{add:vi.fn(),remove:vi.fn()}},
    questionArea:{innerHTML:""},
    generateQuestionButton:{innerHTML:"",disabled:false,setAttribute:vi.fn()},
    checkAnswerButton:{disabled:false,setAttribute:vi.fn()},
    difficultySelect:{disabled:false,setAttribute:vi.fn()},
    scopeSelect:{value:""},
    mentalScopeSelect:{value:""},
    shuffleToggle:{checked:false},
    mentalShuffleToggle:{checked:false},
    autocontinueToggle:{checked:false},
    mcqToggle:{checked:false},
    mathToolbar:{style:{display:""},querySelectorAll:vi.fn(()=>[])},
    mcqChoicesContainer:{style:{display:""},innerHTML:"",appendChild:vi.fn()},
    expectedFormatDiv:{style:{display:""},textContent:""},
    copyAnswerBtn:{style:{display:""}},
    shortcutsModal:{classList:{add:vi.fn(),remove:vi.fn()}},
    shortcutsClose:null,
    shortcutsGotit:null,
    shortcutsButton:null,
    onboardingOverlay:{classList:{add:vi.fn(),remove:vi.fn()}},
    onboardingClose:null,
    onboardingGotit:null,
    leaderboardClose:null,
    leaderboardCard:{style:{display:""}},
    leaderboardContent:{innerHTML:""},
    accuracyStat:{textContent:""},
    avgTimeStat:{textContent:""},
    answerCard:{classList:{add:vi.fn(),remove:vi.fn()}},
    clearAnswerBtn:null,
    appWindow:null,
}));
vi.mock("./state.js",()=>{
    let autoTimeout:any=null;
    let previewTimeout:any=null;
    let generateDebounceTimeout:any=null;
    let mentalNextQuestionTimeout:any=null;
    let sessionTimer:any=null;
    return{
        autoTimeout,
        previewTimeout,
        generateDebounceTimeout,
        mentalNextQuestionTimeout,
        sessionTimer,
        scope:"simple",
        mentalScope:"simple",
        shuffle:false,
        mentalShuffle:false,
        autocontinue:false,
        currentDifficulty:"medium",
        mcqMode:false,
        sessionScore:{correct:0,total:0},
        maxQuestions:5,
        timeLeft:30,
        totalTimeSpent:0,
        answeredQuestionsCount:0,
        currentQuestionStartTime:null,
        selectedTopic:"fraction",
        currentMode:"single",
        sessionActive:false,
        sessionPaused:false,
        modeButtons:[],
        setAutoTimeout:vi.fn((t:any)=>{autoTimeout=t;}),
        setPreviewTimeout:vi.fn((t:any)=>{previewTimeout=t;}),
        setGenerateDebounceTimeout:vi.fn((t:any)=>{generateDebounceTimeout=t;}),
        setMentalNextQuestionTimeout:vi.fn((t:any)=>{mentalNextQuestionTimeout=t;}),
        setSessionTimer:vi.fn((t:any)=>{sessionTimer=t;}),
        setScope:vi.fn(),
        setShuffle:vi.fn(),
        setAutocontinue:vi.fn(),
        setCurrentDifficulty:vi.fn(),
        setMentalScope:vi.fn(),
        setMentalShuffle:vi.fn(),
        setMaxQuestions:vi.fn(),
        setTimeLeft:vi.fn(),
        setMcqMode:vi.fn(),
        setSessionScore:vi.fn(),
    };
});
vi.mock("./settings.js",()=>({
    settings:{
        notifications:true,
        scope:"simple",
        shuffle:false,
        autoContinue:false,
        difficulty:"medium",
        maxQuestions:5,
        timer:30,
        mcqMode:false,
    },
}));
vi.mock("./mcq.js",()=>({
    generateChoicesForCurrentQuestion:vi.fn(),
}));
vi.mock("./session.js",()=>({
    handleMcqChoice:vi.fn(),
}));
vi.mock("./answer.js",()=>({
    checkAnswer:vi.fn(),
}));
import*as ui from"./ui.js";
describe("ui",()=>{
    it("should export clearAllTimeouts",()=>{
        expect(typeof ui.clearAllTimeouts).toBe("function");
    });
    it("clearAllTimeouts should not throw",()=>{
        expect(()=>ui.clearAllTimeouts()).not.toThrow();
    });
    it("should export syncSettingsToState",()=>{
        expect(typeof ui.syncSettingsToState).toBe("function");
    });
    it("syncSettingsToState should not throw",()=>{
        expect(()=>ui.syncSettingsToState()).not.toThrow();
    });
    it("should export updateAriaPressed",()=>{
        expect(typeof ui.updateAriaPressed).toBe("function");
    });
    it("should export updateCheckboxAria",()=>{
        expect(typeof ui.updateCheckboxAria).toBe("function");
    });
    it("updateCheckboxAria should not throw with null",()=>{
        expect(()=>ui.updateCheckboxAria(null)).not.toThrow();
    });
    it("should export updateProgressBar",()=>{
        expect(typeof ui.updateProgressBar).toBe("function");
    });
    it("should export updateTimerDisplay",()=>{
        expect(typeof ui.updateTimerDisplay).toBe("function");
    });
    it("should export updateScoreDisplay",()=>{
        expect(typeof ui.updateScoreDisplay).toBe("function");
    });
    it("should export disableTopicSelection",()=>{
        expect(typeof ui.disableTopicSelection).toBe("function");
    });
    it("should export disableModeButtons",()=>{
        expect(typeof ui.disableModeButtons).toBe("function");
    });
    it("should export disableDifficulty",()=>{
        expect(typeof ui.disableDifficulty).toBe("function");
    });
    it("should export setSessionButton",()=>{
        expect(typeof ui.setSessionButton).toBe("function");
    });
    it("should export updateUIState",()=>{
        expect(typeof ui.updateUIState).toBe("function");
    });
    it("should export showNotification",()=>{
        expect(typeof ui.showNotification).toBe("function");
    });
    it("showNotification should create a notification element",()=>{
        ui.showNotification("test","info");
        const notif=document.querySelector(".notification");
        expect(notif).toBeTruthy();
        expect(notif?.textContent).toBe("test");
    });
    it("should export updatePreview",()=>{
        expect(typeof ui.updatePreview).toBe("function");
    });
    it("should export updatePreviewDebounced",()=>{
        expect(typeof ui.updatePreviewDebounced).toBe("function");
    });
    it("should export insertSymbol",()=>{
        expect(typeof ui.insertSymbol).toBe("function");
    });
    it("insertSymbol should not throw",()=>{
        expect(()=>ui.insertSymbol("test")).not.toThrow();
    });
    it("should export copyCorrectAnswer",()=>{
        expect(typeof ui.copyCorrectAnswer).toBe("function");
    });
    it("should export clearAnswer",()=>{
        expect(typeof ui.clearAnswer).toBe("function");
    });
    it("should export showShortcutsModal and hideShortcutsModal",()=>{
        expect(typeof ui.showShortcutsModal).toBe("function");
        expect(typeof ui.hideShortcutsModal).toBe("function");
    });
    it("should export showOnboarding and hideOnboarding",()=>{
        expect(typeof ui.showOnboarding).toBe("function");
        expect(typeof ui.hideOnboarding).toBe("function");
    });
    it("should export updateStatistics",()=>{
        expect(typeof ui.updateStatistics).toBe("function");
    });
    it("should export toggleMcqMode",()=>{
        expect(typeof ui.toggleMcqMode).toBe("function");
    });
    it("should export renderMcqChoices",()=>{
        expect(typeof ui.renderMcqChoices).toBe("function");
    });
    it("renderMcqChoices should not throw",()=>{
        expect(()=>ui.renderMcqChoices(["a","b"])).not.toThrow();
    });
});
