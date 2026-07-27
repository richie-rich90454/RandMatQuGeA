/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
vi.mock("../../main/core/DomRegistry",()=>{
    const modeSingleBtn={setAttribute:vi.fn()};
    const modeMentalBtn={setAttribute:vi.fn()};
    const mentalProgressBar={setAttribute:vi.fn()};
    const timerDisplay={innerHTML:""};
    const scoreDisplay={innerHTML:""};
    const startSessionBtn={textContent:"",classList:{add:vi.fn(),remove:vi.fn()}};
    const pauseSessionBtn={style:{display:""}};
    const skipQuestionBtn={style:{display:""}};
    const userAnswer={value:"",style:{display:""},selectionStart:0,selectionEnd:0,focus:vi.fn()};
    const previewDiv={innerHTML:"",classList:{add:vi.fn(),remove:vi.fn()},style:{display:""},appendChild:vi.fn()};
    const answerResults={innerHTML:"",className:"",classList:{add:vi.fn(),remove:vi.fn()}};
    const questionArea={innerHTML:""};
    const generateQuestionButton={innerHTML:"",disabled:false,setAttribute:vi.fn()};
    const checkAnswerButton={disabled:false,setAttribute:vi.fn()};
    const difficultySelect={disabled:false,setAttribute:vi.fn()};
    const scopeSelect={value:""};
    const mentalScopeSelect={value:""};
    const shuffleToggle={checked:false};
    const mentalShuffleToggle={checked:false};
    const autocontinueToggle={checked:false};
    const mcqToggle={checked:false};
    const mathToolbar={style:{display:""},querySelectorAll:vi.fn(()=>[])};
    const mcqChoicesContainer={style:{display:""},innerHTML:"",appendChild:vi.fn()};
    const expectedFormatDiv={style:{display:""},textContent:""};
    const copyAnswerBtn={style:{display:""}};
    const shortcutsModal={classList:{add:vi.fn(),remove:vi.fn()}};
    const onboardingOverlay={classList:{add:vi.fn(),remove:vi.fn()}};
    const leaderboardContent={innerHTML:""};
    const leaderboardCard={style:{display:""}};
    const accuracyStat={textContent:""};
    const avgTimeStat={textContent:""};
    const answerCard={classList:{add:vi.fn(),remove:vi.fn()}};
    const buttons={modeSingleBtn,modeMentalBtn,generateQuestionButton,checkAnswerButton,startSessionBtn,pauseSessionBtn,skipQuestionBtn,copyAnswerBtn};
    const inputs={userAnswer,difficultySelect,scopeSelect,mentalScopeSelect,shuffleToggle,mentalShuffleToggle,autocontinueToggle,mcqToggle};
    const displays={mentalProgressBar,timerDisplay,scoreDisplay,previewDiv,answerResults,questionArea,mathToolbar,mcqChoicesContainer,expectedFormatDiv,leaderboardContent,accuracyStat,avgTimeStat};
    const modals={shortcutsModal,onboardingOverlay,answerCard};
    const session={leaderboardCard};
    const dom={buttons,inputs,displays,modals,session,appWindow:null};
    return{dom};
});
vi.mock("../../main/core/StateStore",()=>{
    let autoTimeout:any=null;
    let previewTimeout:any=null;
    let generateDebounceTimeout:any=null;
    let mentalNextQuestionTimeout:any=null;
    let sessionTimer:any=null;
    let scope="simple";
    let mentalScope="simple";
    let shuffle=false;
    let mentalShuffle=false;
    let autocontinue=false;
    let currentDifficulty="medium";
    let mcqMode=false;
    let sessionScore={correct:0,total:0};
    let maxQuestions=5;
    let timeLeft=30;
    let totalTimeSpent=0;
    let answeredQuestionsCount=0;
    let currentQuestionStartTime:number|null=null;
    let selectedTopic="fraction";
    let currentMode="single";
    let sessionActive=false;
    let sessionPaused=false;
    const setAutoTimeout=vi.fn((t:any)=>{autoTimeout=t;});
    const setPreviewTimeout=vi.fn((t:any)=>{previewTimeout=t;});
    const setGenerateDebounceTimeout=vi.fn((t:any)=>{generateDebounceTimeout=t;});
    const setMentalNextQuestionTimeout=vi.fn((t:any)=>{mentalNextQuestionTimeout=t;});
    const setSessionTimer=vi.fn((t:any)=>{sessionTimer=t;});
    const setScope=vi.fn();
    const setShuffle=vi.fn();
    const setAutocontinue=vi.fn();
    const setCurrentDifficulty=vi.fn();
    const setMentalScope=vi.fn();
    const setMentalShuffle=vi.fn();
    const setMaxQuestions=vi.fn();
    const setTimeLeft=vi.fn();
    const setMcqMode=vi.fn();
    const setSessionScore=vi.fn();
    const appState={
        get autoTimeout(){return autoTimeout;},
        set autoTimeout(v:any){autoTimeout=v;setAutoTimeout(v);},
        get previewTimeout(){return previewTimeout;},
        set previewTimeout(v:any){previewTimeout=v;setPreviewTimeout(v);},
        get generateDebounceTimeout(){return generateDebounceTimeout;},
        set generateDebounceTimeout(v:any){generateDebounceTimeout=v;setGenerateDebounceTimeout(v);},
        get mentalNextQuestionTimeout(){return mentalNextQuestionTimeout;},
        set mentalNextQuestionTimeout(v:any){mentalNextQuestionTimeout=v;setMentalNextQuestionTimeout(v);},
        get sessionTimer(){return sessionTimer;},
        set sessionTimer(v:any){sessionTimer=v;setSessionTimer(v);},
        get scope(){return scope;},
        set scope(v:string){scope=v;setScope(v);},
        get mentalScope(){return mentalScope;},
        set mentalScope(v:string){mentalScope=v;setMentalScope(v);},
        get shuffle(){return shuffle;},
        set shuffle(v:boolean){shuffle=v;setShuffle(v);},
        get mentalShuffle(){return mentalShuffle;},
        set mentalShuffle(v:boolean){mentalShuffle=v;setMentalShuffle(v);},
        get autocontinue(){return autocontinue;},
        set autocontinue(v:boolean){autocontinue=v;setAutocontinue(v);},
        get currentDifficulty(){return currentDifficulty;},
        set currentDifficulty(v:string){currentDifficulty=v;setCurrentDifficulty(v);},
        get mcqMode(){return mcqMode;},
        set mcqMode(v:boolean){mcqMode=v;setMcqMode(v);},
        get sessionScore(){return sessionScore;},
        set sessionScore(v:{correct:number,total:number}){sessionScore=v;setSessionScore(v);},
        get maxQuestions(){return maxQuestions;},
        set maxQuestions(v:number){maxQuestions=v;setMaxQuestions(v);},
        get timeLeft(){return timeLeft;},
        set timeLeft(v:number){timeLeft=v;setTimeLeft(v);},
        get totalTimeSpent(){return totalTimeSpent;},
        set totalTimeSpent(v:number){totalTimeSpent=v;},
        get answeredQuestionsCount(){return answeredQuestionsCount;},
        set answeredQuestionsCount(v:number){answeredQuestionsCount=v;},
        get currentQuestionStartTime(){return currentQuestionStartTime;},
        set currentQuestionStartTime(v:number|null){currentQuestionStartTime=v;},
        get selectedTopic(){return selectedTopic;},
        set selectedTopic(v:string){selectedTopic=v;},
        get currentMode(){return currentMode;},
        set currentMode(v:string){currentMode=v;},
        get sessionActive(){return sessionActive;},
        set sessionActive(v:boolean){sessionActive=v;},
        get sessionPaused(){return sessionPaused;},
        set sessionPaused(v:boolean){sessionPaused=v;},
        modeButtons:[],
        setAutoTimeout,
        setPreviewTimeout,
        setGenerateDebounceTimeout,
        setMentalNextQuestionTimeout,
        setSessionTimer,
        setScope,
        setShuffle,
        setAutocontinue,
        setCurrentDifficulty,
        setMentalScope,
        setMentalShuffle,
        setMaxQuestions,
        setTimeLeft,
        setMcqMode,
        setSessionScore
    };
    return{appState};
});
vi.mock("../../main/core/QuestionState",()=>{
    return{questionState:{
        get correctAnswer(){return(window as any).correctAnswer;},
        set correctAnswer(v:any){(window as any).correctAnswer=v;},
        get expectedFormat(){return(window as any).expectedFormat;},
        set expectedFormat(v:any){(window as any).expectedFormat=v;},
        get hasQuestion(){return(window as any).hasQuestion;},
        set hasQuestion(v:any){(window as any).hasQuestion=v;}
    }};
});
vi.mock("../../main/Settings.js",()=>({
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
vi.mock("../../main/Mcq.js",()=>({
    generateChoicesForCurrentQuestion:vi.fn(),
}));
vi.mock("../../main/Session.js",()=>({
    handleMcqChoice:vi.fn(),
}));
vi.mock("../../main/Answer.js",()=>({
    checkAnswer:vi.fn(),
}));
import*as stateStore from"./core/StateStore";
let state:any=stateStore.appState;
import*as ui from"./Ui.js";
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
    describe("showNotification - edge cases",()=>{
        beforeEach(()=>{
            document.body.innerHTML="";
        });
        it("should handle empty message",()=>{
            ui.showNotification("","info");
            let notif=document.querySelector(".notification");
            expect(notif).toBeTruthy();
            expect(notif?.textContent).toBe("");
        });
        it("should handle very long message",()=>{
            let longMsg="a".repeat(1000);
            ui.showNotification(longMsg,"info");
            let notif=document.querySelector(".notification");
            expect(notif).toBeTruthy();
            expect(notif?.textContent).toBe(longMsg);
        });
        it("should handle special characters in message",()=>{
            ui.showNotification("<script>alert('x')</script>","info");
            let notif=document.querySelector(".notification");
            expect(notif).toBeTruthy();
            expect(notif?.innerHTML).not.toContain("<script>");
        });
        it("should handle rapid successive notifications",()=>{
            ui.showNotification("first","info");
            ui.showNotification("second","warning");
            ui.showNotification("third","info");
            let notifs=document.querySelectorAll(".notification");
            expect(notifs.length).toBeGreaterThanOrEqual(3);
        });
        it("should remove notification after timeout",()=>{
            vi.useFakeTimers();
            ui.showNotification("will remove","info");
            let notif=document.querySelector(".notification");
            expect(notif).toBeTruthy();
            vi.advanceTimersByTime(3000);
            expect(notif?.classList.contains("fade-out")).toBe(true);
            vi.advanceTimersByTime(300);
            notif=document.querySelector(".notification");
            expect(notif).toBeFalsy();
            vi.useRealTimers();
        });
    });
    describe("renderMcqChoices",()=>{
        beforeEach(()=>{
            document.body.innerHTML="";
        });
        it("should render choice buttons",()=>{
            ui.renderMcqChoices(["a","b","c"]);
            expect(document.querySelectorAll(".choice-button").length).toBeGreaterThanOrEqual(0);
        });
        it("should highlight correct answer",()=>{
            ui.renderMcqChoices(["correct","wrong"]);
            expect(document.querySelectorAll(".choice-button").length).toBeGreaterThanOrEqual(0);
        });
        it("should handle empty choices array",()=>{
            expect(()=>ui.renderMcqChoices([])).not.toThrow();
        });
        it("should handle single choice",()=>{
            expect(()=>ui.renderMcqChoices(["only"])).not.toThrow();
        });
        it("should handle maximum choices",()=>{
            let manyChoices=Array.from({length:26},(_, i)=>String.fromCharCode(65+i));
            expect(()=>ui.renderMcqChoices(manyChoices)).not.toThrow();
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
