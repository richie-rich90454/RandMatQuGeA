/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
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
import*as state from"./state.js";
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
    describe("showNotification",()=>{
        beforeEach(()=>{
            document.body.innerHTML="";
        });
        it("should create notification with \"info\" type",()=>{
            ui.showNotification("info msg","info");
            let notif=document.querySelector(".notification-info");
            expect(notif).toBeTruthy();
            expect(notif?.textContent).toBe("info msg");
        });
        it("should create notification with \"warning\" type",()=>{
            ui.showNotification("warn msg","warning");
            let notif=document.querySelector(".notification-warning");
            expect(notif).toBeTruthy();
            expect(notif?.textContent).toBe("warn msg");
        });
        it("should create notification with \"error\" type",()=>{
            ui.showNotification("err msg","error" as any);
            let notif=document.querySelector(".notification-error");
            expect(notif).toBeTruthy();
            expect(notif?.textContent).toBe("err msg");
        });
        it("should create notification with \"success\" type",()=>{
            ui.showNotification("ok msg","success" as any);
            let notif=document.querySelector(".notification-success");
            expect(notif).toBeTruthy();
            expect(notif?.textContent).toBe("ok msg");
        });
        it("should auto-remove notification after timeout",()=>{
            vi.useFakeTimers();
            ui.showNotification("auto remove","info");
            let notif=document.querySelector(".notification");
            expect(notif).toBeTruthy();
            vi.advanceTimersByTime(3000);
            expect(notif?.classList.contains("fade-out")).toBe(true);
            vi.advanceTimersByTime(300);
            notif=document.querySelector(".notification");
            expect(notif).toBeFalsy();
            vi.useRealTimers();
        });
        it("should handle multiple notifications",()=>{
            ui.showNotification("first","info");
            ui.showNotification("second","warning");
            let notifs=document.querySelectorAll(".notification");
            expect(notifs.length).toBeGreaterThanOrEqual(2);
        });
    });
    describe("updateTimerDisplay",()=>{
        it("should not throw when called",()=>{
            expect(()=>ui.updateTimerDisplay()).not.toThrow();
        });
        it("should be a function",()=>{
            expect(typeof ui.updateTimerDisplay).toBe("function");
        });
    });
    describe("updateScoreDisplay",()=>{
        it("should not throw when called",()=>{
            expect(()=>ui.updateScoreDisplay()).not.toThrow();
        });
        it("should be a function",()=>{
            expect(typeof ui.updateScoreDisplay).toBe("function");
        });
    });
    describe("updateProgressBar",()=>{
        it("should not throw when called",()=>{
            expect(()=>ui.updateProgressBar()).not.toThrow();
        });
        it("should be a function",()=>{
            expect(typeof ui.updateProgressBar).toBe("function");
        });
    });
    describe("clearAllTimeouts",()=>{
        it("should clear autoTimeout if set",()=>{
            let mockClearTimeout=vi.spyOn(window,"clearTimeout");
            (state as any).autoTimeout=123;
            ui.clearAllTimeouts();
            expect(mockClearTimeout).toHaveBeenCalledWith(123);
            mockClearTimeout.mockRestore();
        });
        it("should clear previewTimeout if set",()=>{
            let mockClearTimeout=vi.spyOn(window,"clearTimeout");
            (state as any).previewTimeout=456;
            ui.clearAllTimeouts();
            expect(mockClearTimeout).toHaveBeenCalledWith(456);
            mockClearTimeout.mockRestore();
        });
        it("should clear generateDebounceTimeout if set",()=>{
            let mockClearTimeout=vi.spyOn(window,"clearTimeout");
            (state as any).generateDebounceTimeout=789;
            ui.clearAllTimeouts();
            expect(mockClearTimeout).toHaveBeenCalledWith(789);
            mockClearTimeout.mockRestore();
        });
        it("should clear mentalNextQuestionTimeout if set",()=>{
            let mockClearTimeout=vi.spyOn(window,"clearTimeout");
            (state as any).mentalNextQuestionTimeout=101;
            ui.clearAllTimeouts();
            expect(mockClearTimeout).toHaveBeenCalledWith(101);
            mockClearTimeout.mockRestore();
        });
        it("should clear sessionTimer if set",()=>{
            let mockClearInterval=vi.spyOn(window,"clearInterval");
            (state as any).sessionTimer=202;
            ui.clearAllTimeouts();
            expect(mockClearInterval).toHaveBeenCalledWith(202);
            mockClearInterval.mockRestore();
        });
        it("should handle all timeouts being null",()=>{
            expect(()=>ui.clearAllTimeouts()).not.toThrow();
        });
    });
    describe("syncSettingsToState",()=>{
        it("should not throw when called",()=>{
            expect(()=>ui.syncSettingsToState()).not.toThrow();
        });
        it("should be a function",()=>{
            expect(typeof ui.syncSettingsToState).toBe("function");
        });
    });
    describe("insertSymbol",()=>{
        it("should not throw with pi symbol",()=>{
            expect(()=>ui.insertSymbol("\\pi")).not.toThrow();
        });
        it("should not throw with sqrt symbol",()=>{
            expect(()=>ui.insertSymbol("\\sqrt{}")).not.toThrow();
        });
        it("should not throw with fraction symbol",()=>{
            expect(()=>ui.insertSymbol("\\frac{}{}")).not.toThrow();
        });
        it("should not throw with empty string",()=>{
            expect(()=>ui.insertSymbol("")).not.toThrow();
        });
    });
    describe("copyCorrectAnswer",()=>{
        it("should be a function",()=>{
            expect(typeof ui.copyCorrectAnswer).toBe("function");
        });
        it("should not throw when called",()=>{
            (window as any).correctAnswer={correct:"42"};
            Object.defineProperty(navigator,"clipboard",{value:{writeText:vi.fn(()=>Promise.resolve())},configurable:true});
            expect(()=>ui.copyCorrectAnswer()).not.toThrow();
        });
    });
    describe("clearAnswer",()=>{
        it("should be a function",()=>{
            expect(typeof ui.clearAnswer).toBe("function");
        });
        it("should not throw when called",()=>{
            expect(()=>ui.clearAnswer()).not.toThrow();
        });
    });
    describe("updateStatistics",()=>{
        it("should be a function",()=>{
            expect(typeof ui.updateStatistics).toBe("function");
        });
        it("should not throw when called",()=>{
            expect(()=>ui.updateStatistics()).not.toThrow();
        });
    });
});
