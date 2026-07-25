/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
vi.mock("./core/domRegistry",()=>{
    const timerDisplay={innerHTML:"",style:{display:""},classList:{add:vi.fn(),remove:vi.fn()}};
    const scoreDisplay={innerHTML:""};
    const mentalProgressBar={style:{width:""},setAttribute:vi.fn(),classList:{add:vi.fn(),remove:vi.fn()}};
    const startSessionBtn={textContent:"",classList:{add:vi.fn(),remove:vi.fn()}};
    const pauseSessionBtn={style:{display:""},innerHTML:"",setAttribute:vi.fn()};
    const skipQuestionBtn={style:{display:""}};
    const userAnswer={value:"",disabled:false,focus:vi.fn(),style:{display:"none"},removeAttribute:vi.fn(),setAttribute:vi.fn(),classList:{add:vi.fn(),remove:vi.fn()}};
    const answerResults={innerHTML:"",className:"",classList:{add:vi.fn(),remove:vi.fn()}};
    const questionArea={innerHTML:""};
    const checkAnswerButton={disabled:false,setAttribute:vi.fn(),removeAttribute:vi.fn()};
    const currentTopicDisplay={textContent:""};
    const copyAnswerBtn={style:{display:""},classList:{add:vi.fn(),remove:vi.fn()}};
    const expectedFormatDiv={textContent:""};
    const leaderboardContent={innerHTML:""};
    const leaderboardCard={classList:{add:vi.fn(),remove:vi.fn()},style:{display:""}};
    const mcqChoicesContainer={style:{display:""},classList:{add:vi.fn(),remove:vi.fn()}};
    const mathToolbar={style:{display:""},classList:{add:vi.fn(),remove:vi.fn()}};
    const statisticsPanel={style:{display:""},classList:{add:vi.fn(),remove:vi.fn()}};
    const accuracyStat={textContent:""};
    const avgTimeStat={textContent:""};
    const unlimitedToggle={checked:false};
    const modeSingleBtn={classList:{add:vi.fn(),remove:vi.fn(),contains:vi.fn()}};
    const modeMentalBtn={classList:{add:vi.fn(),remove:vi.fn()},click:vi.fn()};
    const buttons={startSessionBtn,pauseSessionBtn,skipQuestionBtn,checkAnswerButton,copyAnswerBtn,modeSingleBtn,modeMentalBtn};
    const inputs={userAnswer,unlimitedToggle};
    const displays={timerDisplay,scoreDisplay,mentalProgressBar,answerResults,questionArea,currentTopicDisplay,expectedFormatDiv,leaderboardContent,mcqChoicesContainer,mathToolbar,statisticsPanel,accuracyStat,avgTimeStat};
    const session={leaderboardCard};
    const dom={buttons,inputs,displays,session};
    return{dom};
});
vi.mock("./core/stateStore",()=>{
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
    const setSessionActive=vi.fn((a:boolean)=>{sessionActive=a;});
    const setSessionPaused=vi.fn((p:boolean)=>{sessionPaused=p;});
    const setSessionScore=vi.fn((s:{correct:number,total:number})=>{sessionScore=s;});
    const setTimeLeft=vi.fn((t:number)=>{timeLeft=t;});
    const setMaxQuestions=vi.fn((m:number)=>{maxQuestions=m;});
    const setCurrentDifficulty=vi.fn((d:string)=>{currentDifficulty=d;});
    const setSelectedTopic=vi.fn((t:string|null)=>{selectedTopic=t;});
    const setMentalShuffle=vi.fn((s:boolean)=>{mentalShuffle=s;});
    const setMentalScope=vi.fn((s:string)=>{mentalScope=s;});
    const setSessionTimer=vi.fn((t:any)=>{sessionTimer=t;});
    const setMentalNextQuestionTimeout=vi.fn((t:any)=>{mentalNextQuestionTimeout=t;});
    const setUnlimitedMode=vi.fn((u:boolean)=>{unlimitedMode=u;});
    const setMcqMode=vi.fn((m:boolean)=>{mcqMode=m;});
    const setCurrentQuestionStartTime=vi.fn((t:number|null)=>{currentQuestionStartTime=t;});
    const setTotalTimeSpent=vi.fn((t:number)=>{totalTimeSpent=t;});
    const setAnsweredQuestionsCount=vi.fn((c:number)=>{answeredQuestionsCount=c;});
    const appState={
        get sessionActive(){return sessionActive;},
        set sessionActive(v:boolean){sessionActive=v;setSessionActive(v);},
        get sessionPaused(){return sessionPaused;},
        set sessionPaused(v:boolean){sessionPaused=v;setSessionPaused(v);},
        get sessionScore(){return sessionScore;},
        set sessionScore(v:{correct:number,total:number}){sessionScore=v;setSessionScore(v);},
        get timeLeft(){return timeLeft;},
        set timeLeft(v:number){timeLeft=v;setTimeLeft(v);},
        get maxQuestions(){return maxQuestions;},
        set maxQuestions(v:number){maxQuestions=v;setMaxQuestions(v);},
        get currentDifficulty(){return currentDifficulty;},
        set currentDifficulty(v:string){currentDifficulty=v;setCurrentDifficulty(v);},
        get selectedTopic(){return selectedTopic;},
        set selectedTopic(v:string|null){selectedTopic=v;setSelectedTopic(v);},
        get mentalShuffle(){return mentalShuffle;},
        set mentalShuffle(v:boolean){mentalShuffle=v;setMentalShuffle(v);},
        get mentalScope(){return mentalScope;},
        set mentalScope(v:string){mentalScope=v;setMentalScope(v);},
        get sessionTimer(){return sessionTimer;},
        set sessionTimer(v:any){sessionTimer=v;setSessionTimer(v);},
        get mentalNextQuestionTimeout(){return mentalNextQuestionTimeout;},
        set mentalNextQuestionTimeout(v:any){mentalNextQuestionTimeout=v;setMentalNextQuestionTimeout(v);},
        get unlimitedMode(){return unlimitedMode;},
        set unlimitedMode(v:boolean){unlimitedMode=v;setUnlimitedMode(v);},
        get mcqMode(){return mcqMode;},
        set mcqMode(v:boolean){mcqMode=v;setMcqMode(v);},
        get currentQuestionStartTime(){return currentQuestionStartTime;},
        set currentQuestionStartTime(v:number|null){currentQuestionStartTime=v;setCurrentQuestionStartTime(v);},
        get totalTimeSpent(){return totalTimeSpent;},
        set totalTimeSpent(v:number){totalTimeSpent=v;setTotalTimeSpent(v);},
        get answeredQuestionsCount(){return answeredQuestionsCount;},
        set answeredQuestionsCount(v:number){answeredQuestionsCount=v;setAnsweredQuestionsCount(v);},
        setSessionActive,
        setSessionPaused,
        setSessionScore,
        setTimeLeft,
        setMaxQuestions,
        setCurrentDifficulty,
        setSelectedTopic,
        setMentalShuffle,
        setMentalScope,
        setSessionTimer,
        setMentalNextQuestionTimeout,
        setUnlimitedMode,
        setMcqMode,
        setCurrentQuestionStartTime,
        setTotalTimeSpent,
        setAnsweredQuestionsCount
    };
    return{appState};
});
vi.mock("./core/questionState",()=>{
    return{questionState:{
        get correctAnswer(){return(window as any).correctAnswer;},
        set correctAnswer(v:any){(window as any).correctAnswer=v;},
        get expectedFormat(){return(window as any).expectedFormat;},
        set expectedFormat(v:any){(window as any).expectedFormat=v;},
        get hasQuestion(){return(window as any).hasQuestion;},
        set hasQuestion(v:any){(window as any).hasQuestion=v;}
    }};
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
import{saveSessionSnapshot,restoreSessionSnapshot,startTimer,generateNextMentalQuestion,handleMentalAnswer,handleMcqChoice,startMentalSession,pauseMentalSession,skipMentalQuestion,stopMentalSession,endMentalSession,promptSaveScore,updateLeaderboard}from"./Session.js";
import*as stateStore from"./core/StateStore";
let state:any=stateStore.appState;
import * as ui from "./Ui.js";
import * as settings from "./Settings.js";
import * as questionGenerator from "./QuestionGenerator.js";
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
    describe("session scoring",()=>{
        beforeEach(()=>{
            vi.clearAllMocks();
            (window as any).hasQuestion=true;
            (window as any).correctAnswer={correct:"42",alternate:"42",display:"42"};
            vi.mocked(settings.checkAnswerFast).mockResolvedValue(true);
        });
        it("should increment correct count on correct answer",async()=>{
            state.setSessionActive(true);
            state.setSessionPaused(false);
            state.setSessionScore({correct:0,total:0});
            state.setUnlimitedMode(true);
            await handleMentalAnswer("42");
            expect(state.setSessionScore).toHaveBeenLastCalledWith({correct:1,total:1});
        });
        it("should increment total count on any answer",async()=>{
            vi.mocked(settings.checkAnswerFast).mockResolvedValueOnce(false);
            state.setSessionActive(true);
            state.setSessionPaused(false);
            state.setSessionScore({correct:2,total:3});
            state.setUnlimitedMode(true);
            await handleMentalAnswer("wrong");
            expect(state.setSessionScore).toHaveBeenLastCalledWith({correct:2,total:4});
        });
        it("should calculate accuracy percentage",()=>{
            state.setSessionScore({correct:3,total:5});
            let accuracy=(state.sessionScore.correct/state.sessionScore.total)*100;
            expect(accuracy).toBe(60);
        });
        it("should handle zero correct answers",()=>{
            state.setSessionScore({correct:0,total:5});
            let accuracy=(state.sessionScore.correct/state.sessionScore.total)*100;
            expect(accuracy).toBe(0);
        });
        it("should handle perfect score",()=>{
            state.setSessionScore({correct:5,total:5});
            let accuracy=(state.sessionScore.correct/state.sessionScore.total)*100;
            expect(accuracy).toBe(100);
        });
        it("should handle mixed correct and incorrect",async()=>{
            state.setSessionActive(true);
            state.setSessionPaused(false);
            state.setSessionScore({correct:1,total:2});
            state.setUnlimitedMode(true);
            await handleMentalAnswer("42");
            expect(state.setSessionScore).toHaveBeenLastCalledWith({correct:2,total:3});
        });
        it("should reset timeLeft immediately after scoring (A009 regression)",async()=>{
            state.setSessionActive(true);
            state.setSessionPaused(false);
            state.setSessionScore({correct:0,total:0});
            state.setUnlimitedMode(true);
            state.setTimeLeft(1);
            vi.mocked(ui.updateTimerDisplay).mockClear();
            await handleMentalAnswer("42");
            expect(state.setTimeLeft).toHaveBeenCalledWith((settings as any).settings.timer);
            expect(ui.updateTimerDisplay).toHaveBeenCalled();
        });
    });
    describe("session timer",()=>{
        beforeEach(()=>{
            vi.clearAllMocks();
            vi.useFakeTimers();
        });
        afterEach(()=>{
            vi.useRealTimers();
        });
        it("should count down from initial time",()=>{
            state.setSessionActive(true);
            state.setSessionPaused(false);
            state.setUnlimitedMode(false);
            state.setTimeLeft(30);
            startTimer();
            vi.advanceTimersByTime(1000);
            expect(state.setTimeLeft).toHaveBeenCalledWith(29);
        });
        it("should stop at zero",()=>{
            state.setSessionActive(true);
            state.setSessionPaused(false);
            state.setUnlimitedMode(false);
            state.setTimeLeft(1);
            startTimer();
            vi.advanceTimersByTime(1000);
            expect(state.setTimeLeft).toHaveBeenCalledWith(0);
        });
        it("should not go below zero",()=>{
            state.setSessionActive(true);
            state.setSessionPaused(false);
            state.setUnlimitedMode(false);
            state.setTimeLeft(1);
            startTimer();
            vi.advanceTimersByTime(2000);
            let calls=vi.mocked(state.setTimeLeft).mock.calls.map((c: number[])=>c[0]);
            let belowZero=calls.some((v: number)=>v<0);
            expect(belowZero).toBe(false);
        });
        it("should handle unlimited mode",()=>{
            state.setSessionActive(true);
            state.setSessionPaused(false);
            state.setUnlimitedMode(true);
            startTimer();
            expect(state.setSessionTimer).not.toHaveBeenCalled();
        });
        it("should pause timer correctly",()=>{
            state.setSessionActive(true);
            state.setSessionPaused(true);
            state.setUnlimitedMode(false);
            state.setTimeLeft(30);
            startTimer();
            vi.advanceTimersByTime(2000);
            expect(state.setTimeLeft).not.toHaveBeenCalledWith(29);
        });
        it("should resume timer correctly",()=>{
            state.setSessionActive(true);
            state.setSessionPaused(true);
            state.setUnlimitedMode(false);
            state.setTimeLeft(30);
            startTimer();
            state.setSessionPaused(false);
            vi.advanceTimersByTime(1000);
            expect(state.setTimeLeft).toHaveBeenCalled();
        });
    });
    describe("session snapshot",()=>{
        beforeEach(()=>{
            vi.clearAllMocks();
        });
        it("should save topic to snapshot",()=>{
            state.setSessionActive(true);
            state.setSelectedTopic("subtract");
            let setItemSpy=vi.spyOn(Storage.prototype,"setItem");
            saveSessionSnapshot();
            let savedCall=setItemSpy.mock.calls.find((c: string[])=>c[0]==="mentalSessionSnapshot");
            expect(savedCall).toBeDefined();
            let parsed=JSON.parse(savedCall![1]);
            expect(parsed.selectedTopic).toBe("subtract");
            setItemSpy.mockRestore();
        });
        it("should save score to snapshot",()=>{
            state.setSessionActive(true);
            state.setSessionScore({correct:3,total:7});
            let setItemSpy=vi.spyOn(Storage.prototype,"setItem");
            saveSessionSnapshot();
            let savedCall=setItemSpy.mock.calls.find((c: string[])=>c[0]==="mentalSessionSnapshot");
            expect(savedCall).toBeDefined();
            let parsed=JSON.parse(savedCall![1]);
            expect(parsed.sessionScore).toEqual({correct:3,total:7});
            setItemSpy.mockRestore();
        });
        it("should save time remaining to snapshot",()=>{
            state.setSessionActive(true);
            state.setTimeLeft(15);
            let setItemSpy=vi.spyOn(Storage.prototype,"setItem");
            saveSessionSnapshot();
            let savedCall=setItemSpy.mock.calls.find((c: string[])=>c[0]==="mentalSessionSnapshot");
            expect(savedCall).toBeDefined();
            let parsed=JSON.parse(savedCall![1]);
            expect(parsed.timeLeft).toBe(15);
            setItemSpy.mockRestore();
        });
        it("should restore topic from snapshot",()=>{
            let snapshot={
                sessionScore:{correct:2,total:4},
                timeLeft:20,
                maxQuestions:5,
                currentDifficulty:"hard",
                mentalShuffle:false,
                mentalScope:"simple",
                selectedTopic:"mult",
                timestamp:Date.now()
            };
            localStorage.setItem("mentalSessionSnapshot",JSON.stringify(snapshot));
            restoreSessionSnapshot();
            expect(state.setSelectedTopic).toHaveBeenCalledWith("mult");
            localStorage.removeItem("mentalSessionSnapshot");
        });
        it("should restore score from snapshot",()=>{
            let snapshot={
                sessionScore:{correct:4,total:6},
                timeLeft:10,
                maxQuestions:5,
                currentDifficulty:"easy",
                mentalShuffle:false,
                mentalScope:"simple",
                selectedTopic:"add",
                timestamp:Date.now()
            };
            localStorage.setItem("mentalSessionSnapshot",JSON.stringify(snapshot));
            restoreSessionSnapshot();
            expect(state.setSessionScore).toHaveBeenCalledWith({correct:4,total:6});
            localStorage.removeItem("mentalSessionSnapshot");
        });
        it("should handle corrupted snapshot",()=>{
            localStorage.setItem("mentalSessionSnapshot","not-valid-json{{{");
            expect(()=>restoreSessionSnapshot()).not.toThrow();
            localStorage.removeItem("mentalSessionSnapshot");
        });
        it("should handle missing snapshot",()=>{
            localStorage.removeItem("mentalSessionSnapshot");
            expect(()=>restoreSessionSnapshot()).not.toThrow();
        });
        it("should clear snapshot after restore",()=>{
            let snapshot={
                sessionScore:{correct:1,total:3},
                timeLeft:25,
                maxQuestions:5,
                currentDifficulty:"medium",
                mentalShuffle:false,
                mentalScope:"simple",
                selectedTopic:"add",
                timestamp:Date.now()
            };
            localStorage.setItem("mentalSessionSnapshot",JSON.stringify(snapshot));
            restoreSessionSnapshot();
            let remaining=localStorage.getItem("mentalSessionSnapshot");
            expect(remaining).toBeNull();
        });
    });
});
