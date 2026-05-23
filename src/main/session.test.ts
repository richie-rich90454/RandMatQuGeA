/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./dom.js",()=>({
    timerDisplay:{innerHTML:""},
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
        sessionActive,
        sessionPaused,
        sessionScore,
        timeLeft,
        maxQuestions,
        currentDifficulty,
        selectedTopic,
        mentalShuffle,
        mentalScope,
        sessionTimer,
        mentalNextQuestionTimeout,
        unlimitedMode,
        mcqMode,
        currentQuestionStartTime,
        totalTimeSpent,
        answeredQuestionsCount,
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
});
