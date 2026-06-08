/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./dom.js",()=>({
    timerDisplay:{innerHTML:"",style:{display:""}},
    scoreDisplay:{innerHTML:""},
    mentalProgressBar:{style:{width:""},setAttribute:vi.fn()},
    startSessionBtn:{textContent:"",classList:{add:vi.fn(),remove:vi.fn()}},
    pauseSessionBtn:{style:{display:""},innerHTML:"",setAttribute:vi.fn()},
    skipQuestionBtn:{style:{display:""}},
    userAnswer:{value:"",disabled:false,focus:vi.fn(),style:{display:"none"},removeAttribute:vi.fn(),setAttribute:vi.fn()},
    answerResults:{innerHTML:"",className:"",classList:{add:vi.fn(),remove:vi.fn()}},
    questionArea:{innerHTML:""},
    checkAnswerButton:{disabled:false,setAttribute:vi.fn(),removeAttribute:vi.fn()},
    currentTopicDisplay:{textContent:""},
    copyAnswerBtn:{style:{display:""}},
    expectedFormatDiv:{textContent:""},
    leaderboardContent:{innerHTML:""},
    leaderboardCard:{classList:{add:vi.fn(),remove:vi.fn()},style:{display:""}},
    mcqChoicesContainer:{style:{display:""}},
    mathToolbar:{style:{display:""}},
    statisticsPanel:{style:{display:""}},
    accuracyStat:{textContent:""},
    avgTimeStat:{textContent:""},
    unlimitedToggle:{checked:false},
    modeSingleBtn:{classList:{add:vi.fn(),remove:vi.fn(),contains:vi.fn()}},
    modeMentalBtn:{classList:{add:vi.fn(),remove:vi.fn()}},
}));
vi.mock("./state.js",()=>{
    let sessionActive=false;
    let sessionPaused=false;
    let sessionScore={correct:0,total:0};
    let timeLeft=30;
    let maxQuestions=5;
    let currentDifficulty="medium";
    let selectedTopic:string|null="add";
    let mentalShuffle=false;
    let mentalScope="simple";
    let sessionTimer:any=null;
    let mentalNextQuestionTimeout:any=null;
    let unlimitedMode=false;
    let mcqMode=false;
    let currentQuestionStartTime:number|null=null;
    let totalTimeSpent=0;
    let answeredQuestionsCount=0;
    return{
        get sessionActive(){return sessionActive;},
        get sessionPaused(){return sessionPaused;},
        get sessionScore(){return sessionScore;},
        get timeLeft(){return timeLeft;},
        get maxQuestions(){return maxQuestions;},
        get currentDifficulty(){return currentDifficulty;},
        get selectedTopic(){return selectedTopic;},
        get mentalShuffle(){return mentalShuffle;},
        get mentalScope(){return mentalScope;},
        get sessionTimer(){return sessionTimer;},
        get mentalNextQuestionTimeout(){return mentalNextQuestionTimeout;},
        get unlimitedMode(){return unlimitedMode;},
        get mcqMode(){return mcqMode;},
        get currentQuestionStartTime(){return currentQuestionStartTime;},
        get totalTimeSpent(){return totalTimeSpent;},
        get answeredQuestionsCount(){return answeredQuestionsCount;},
        setSessionActive:vi.fn((a:boolean)=>{sessionActive=a;}),
        setSessionPaused:vi.fn((p:boolean)=>{sessionPaused=p;}),
        setSessionScore:vi.fn((s:{correct:number,total:number})=>{sessionScore=s;}),
        setTimeLeft:vi.fn((t:number)=>{timeLeft=t;}),
        setMaxQuestions:vi.fn((m:number)=>{maxQuestions=m;}),
        setCurrentDifficulty:vi.fn((d:string)=>{currentDifficulty=d;}),
        setSelectedTopic:vi.fn((t:string|null)=>{selectedTopic=t;}),
        setMentalShuffle:vi.fn((s:boolean)=>{mentalShuffle=s;}),
        setMentalScope:vi.fn((s:string)=>{mentalScope=s;}),
        setSessionTimer:vi.fn((t:any)=>{sessionTimer=t;}),
        setMentalNextQuestionTimeout:vi.fn((t:any)=>{mentalNextQuestionTimeout=t;}),
        setUnlimitedMode:vi.fn((u:boolean)=>{unlimitedMode=u;}),
        setMcqMode:vi.fn((m:boolean)=>{mcqMode=m;}),
        setCurrentQuestionStartTime:vi.fn((t:number|null)=>{currentQuestionStartTime=t;}),
        setTotalTimeSpent:vi.fn((t:number)=>{totalTimeSpent=t;}),
        setAnsweredQuestionsCount:vi.fn((c:number)=>{answeredQuestionsCount=c;}),
    };
});
vi.mock("./settings.js",()=>({
    settings:{
        timer:30,
        maxQuestions:5,
        sound:false,
        vibration:false,
        autoCheckDelay:800,
        notifications:true,
        mcqMode:false,
    },
    checkAnswerFast:vi.fn(()=>Promise.resolve(true)),
}));
vi.mock("./ui.js",()=>({
    showNotification:vi.fn(),
    clearAllTimeouts:vi.fn(),
    updateScoreDisplay:vi.fn(),
    updateTimerDisplay:vi.fn(),
    updateProgressBar:vi.fn(),
    disableTopicSelection:vi.fn(),
    disableModeButtons:vi.fn(),
    disableDifficulty:vi.fn(),
    setSessionButton:vi.fn(),
    updateUIState:vi.fn(),
    updatePreview:vi.fn(),
    updateStatistics:vi.fn(),
}));
vi.mock("./topics.js",()=>({
    pickRandomTopic:vi.fn(()=>"add"),
    selectTopic:vi.fn(),
    default:{},
}));
vi.mock("./questionGenerator.js",()=>({
    generateQuestion:vi.fn(),
}));
vi.mock("./mcq.js",()=>({
    generateChoicesForCurrentQuestion:vi.fn(),
}));
import{saveSessionSnapshot,restoreSessionSnapshot,startTimer,generateNextMentalQuestion,handleMentalAnswer,handleMcqChoice,startMentalSession,pauseMentalSession,skipMentalQuestion,stopMentalSession,endMentalSession,promptSaveScore,updateLeaderboard}from"./session.js";
import * as state from "./state.js";
import * as ui from "./ui.js";
import * as questionGenerator from "./questionGenerator.js";
describe("session",()=>{
    window.correctAnswer={correct:"42",alternate:"42",display:"42"};
    window.hasQuestion=true;
    it("should export saveSessionSnapshot",()=>{
        expect(typeof saveSessionSnapshot).toBe("function");
    });
    it("saveSessionSnapshot should not throw",()=>{
        expect(()=>saveSessionSnapshot()).not.toThrow();
    });
    it("should export restoreSessionSnapshot",()=>{
        expect(typeof restoreSessionSnapshot).toBe("function");
    });
    it("should export startTimer",()=>{
        expect(typeof startTimer).toBe("function");
    });
    it("should export generateNextMentalQuestion",()=>{
        expect(typeof generateNextMentalQuestion).toBe("function");
    });
    it("should export handleMentalAnswer",()=>{
        expect(typeof handleMentalAnswer).toBe("function");
    });
    it("should export handleMcqChoice",()=>{
        expect(typeof handleMcqChoice).toBe("function");
    });
    it("should export startMentalSession",()=>{
        expect(typeof startMentalSession).toBe("function");
    });
    it("should export pauseMentalSession",()=>{
        expect(typeof pauseMentalSession).toBe("function");
    });
    it("should export skipMentalQuestion",()=>{
        expect(typeof skipMentalQuestion).toBe("function");
    });
    it("should export stopMentalSession",()=>{
        expect(typeof stopMentalSession).toBe("function");
    });
    it("should export endMentalSession",()=>{
        expect(typeof endMentalSession).toBe("function");
    });
    it("should export promptSaveScore",()=>{
        expect(typeof promptSaveScore).toBe("function");
    });
    it("should export updateLeaderboard",()=>{
        expect(typeof updateLeaderboard).toBe("function");
    });
    describe("startMentalSession",()=>{
        it("should be a function",()=>{
            expect(typeof startMentalSession).toBe("function");
        });
        it("should set session active",()=>{
            startMentalSession();
            expect(state.setSessionActive).toHaveBeenCalledWith(true);
        });
        it("should reset session score",()=>{
            startMentalSession();
            expect(state.setSessionScore).toHaveBeenCalledWith({correct:0,total:0});
        });
        it("should start timer",()=>{
            startMentalSession();
            expect(state.setSessionTimer).toHaveBeenCalled();
        });
        it("should generate first question",()=>{
            startMentalSession();
            expect(questionGenerator.generateQuestion).toHaveBeenCalled();
        });
        it("should disable topic selection during session",()=>{
            startMentalSession();
            expect(ui.disableTopicSelection).toHaveBeenCalledWith(true);
        });
    });
    describe("endMentalSession",()=>{
        it("should be a function",()=>{
            expect(typeof endMentalSession).toBe("function");
        });
        it("should set session inactive",async()=>{
            await endMentalSession();
            expect(state.setSessionActive).toHaveBeenCalledWith(false);
        });
        it("should clear session timer",async()=>{
            await endMentalSession();
            expect(state.setSessionPaused).toHaveBeenCalledWith(false);
        });
        it("should show final score",async()=>{
            await endMentalSession();
            expect(ui.showNotification).toHaveBeenCalled();
        });
    });
    describe("pauseMentalSession",()=>{
        it("should be a function",()=>{
            expect(typeof pauseMentalSession).toBe("function");
        });
        it("should not throw when called",()=>{
            expect(()=>pauseMentalSession()).not.toThrow();
        });
    });
    describe("skipMentalQuestion",()=>{
        it("should be a function",()=>{
            expect(typeof skipMentalQuestion).toBe("function");
        });
        it("should not throw when called",()=>{
            expect(()=>skipMentalQuestion()).not.toThrow();
        });
    });
    describe("handleMentalAnswer",()=>{
        it("should be a function",()=>{
            expect(typeof handleMentalAnswer).toBe("function");
        });
        it("should not throw when called",async()=>{
            await expect(handleMentalAnswer()).resolves.not.toThrow();
        });
    });
    describe("handleMcqChoice",()=>{
        it("should be a function",()=>{
            expect(typeof handleMcqChoice).toBe("function");
        });
        it("should not throw when called",()=>{
            expect(()=>handleMcqChoice("42")).not.toThrow();
        });
    });
    describe("saveSessionSnapshot",()=>{
        it("should save to sessionStorage",()=>{
            const setItemSpy=vi.spyOn(Storage.prototype,"setItem");
            state.setSessionActive(true);
            saveSessionSnapshot();
            expect(setItemSpy).toHaveBeenCalled();
            setItemSpy.mockRestore();
        });
        it("should not throw when called",()=>{
            expect(()=>saveSessionSnapshot()).not.toThrow();
        });
    });
    describe("restoreSessionSnapshot",()=>{
        it("should be a function",()=>{
            expect(typeof restoreSessionSnapshot).toBe("function");
        });
        it("should not throw when called",()=>{
            expect(()=>restoreSessionSnapshot()).not.toThrow();
        });
    });
    describe("updateLeaderboard",()=>{
        it("should be a function",()=>{
            expect(typeof updateLeaderboard).toBe("function");
        });
        it("should not throw when called",async()=>{
            await expect(updateLeaderboard()).resolves.not.toThrow();
        });
    });
    describe("promptSaveScore",()=>{
        it("should be a function",()=>{
            expect(typeof promptSaveScore).toBe("function");
        });
    });
});
