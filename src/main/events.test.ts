/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
vi.mock("@tauri-apps/plugin-updater",()=>({
    check:vi.fn(),
}));
vi.mock("@tauri-apps/plugin-process",()=>({
    relaunch:vi.fn(),
}));
vi.mock("semver",()=>{
    const gt=vi.fn(()=>false);
    return{gt,default:{gt}};
});
vi.mock("../../package.json",()=>({default:{version:"1.0.0"},version:"1.0.0"}));
vi.mock("./core/domRegistry",()=>{
    const btnProps=(o:any={})=>({addEventListener:vi.fn(),classList:{add:vi.fn(),remove:vi.fn(),contains:vi.fn()},disabled:false,textContent:"",setAttribute:vi.fn(),click:vi.fn(),style:{display:""},value:"",checked:false,innerHTML:"",querySelectorAll:vi.fn(()=>[]),dataset:{},...o});
    const modalProps=()=>({classList:{add:vi.fn(),remove:vi.fn(),contains:vi.fn(()=>false)},style:{display:""},addEventListener:vi.fn()});
    const inputProps=(o:any={})=>({value:"",disabled:false,style:{display:""},focus:vi.fn(),addEventListener:vi.fn(),selectionStart:0,selectionEnd:0,setAttribute:vi.fn(),removeAttribute:vi.fn(),checked:false,...o});
    const generateQuestionButton=btnProps();
    const checkAnswerButton=btnProps();
    const userAnswer=inputProps();
    const themeToggle=btnProps();
    const helpButton=btnProps();
    const settingsButton=btnProps();
    const modeSingleBtn=btnProps();
    const modeMentalBtn=btnProps();
    const mentalControls={style:{display:""}};
    const singleControls={style:{display:""}};
    const difficultySelect=btnProps({value:"medium"});
    const timerDisplay={innerHTML:""};
    const scoreDisplay={innerHTML:""};
    const startSessionBtn=btnProps();
    const pauseSessionBtn=btnProps({style:{display:""}});
    const skipQuestionBtn=btnProps({style:{display:""}});
    const autocontinueToggle=inputProps();
    const scopeSelect=btnProps({value:"simple"});
    const shuffleToggle=inputProps();
    const mentalScopeSelect=btnProps({value:"simple"});
    const mentalShuffleToggle=inputProps();
    const settingsModal=modalProps();
    const settingsClose=btnProps();
    const settingsSave=btnProps();
    const settingsReset=btnProps();
    const settingsTheme=btnProps({value:"system"});
    const settingsDefaultMode=btnProps({value:"single"});
    const settingsAutoContinue=inputProps();
    const settingsShuffle=inputProps();
    const settingsScope=btnProps({value:"simple"});
    const settingsDifficulty=btnProps({value:"medium"});
    const settingsTimer=inputProps({value:"30"});
    const settingsMaxQuestions=inputProps({value:"5"});
    const settingsFont=btnProps({value:"default"});
    const settingsPerfMaster=inputProps();
    const settingsPerfWave=inputProps();
    const settingsPerfBlur=inputProps();
    const settingsPerfPreview=inputProps();
    const settingsPerfAnimations=inputProps();
    const settingsFpsCap=btnProps({value:"0"});
    const settingsNotifications=inputProps();
    const settingsAutoCheckDelay=inputProps({value:"800"});
    const settingsDecimalPlaces=inputProps({value:"2"});
    const settingsSound=inputProps();
    const settingsVibration=inputProps();
    const mcqToggle=inputProps();
    const topicSearch=inputProps();
    const clearAnswerBtn=btnProps();
    const mathToolbar={style:{display:""},querySelectorAll:vi.fn(()=>[]),contains:vi.fn(()=>false)};
    const copyAnswerBtn=btnProps({style:{display:""}});
    const shortcutsButton=btnProps();
    const shortcutsClose=btnProps();
    const shortcutsGotit=btnProps();
    const shortcutsModal=modalProps();
    const leaderboardClose=btnProps();
    const leaderboardCard={style:{display:""}};
    const onboardingClose=btnProps();
    const onboardingGotit=btnProps();
    const onboardingOverlay=modalProps();
    const answerCard={classList:{add:vi.fn(),remove:vi.fn()}};
    const checkUpdatesBtn=btnProps();
    const unlimitedToggle=inputProps();
    const settingsAdaptive=inputProps();
    const settingsShowWeakPopup=inputProps();
    const settingsMcqChoices=btnProps({value:"4"});
    const settingsTabBasic=btnProps();
    const settingsTabAdvanced=btnProps();
    const settingsBasicPanel={style:{display:""}};
    const settingsAdvancedPanel={style:{display:""}};
    const mcqChoicesContainer={style:{display:""}};
    const previewDiv={style:{display:""}};
    const expectedFormatDiv={style:{display:""}};
    const mentalProgressBar={style:{width:""},setAttribute:vi.fn()};
    const buttons={generateQuestionButton,checkAnswerButton,themeToggle,helpButton,settingsButton,modeSingleBtn,modeMentalBtn,startSessionBtn,pauseSessionBtn,skipQuestionBtn,clearAnswerBtn,copyAnswerBtn,shortcutsButton,shortcutsClose,shortcutsGotit,leaderboardClose,onboardingClose,onboardingGotit,settingsClose,settingsSave,settingsReset,checkUpdatesBtn,settingsTabBasic,settingsTabAdvanced};
    const inputs={userAnswer,difficultySelect,autocontinueToggle,scopeSelect,shuffleToggle,mentalScopeSelect,mentalShuffleToggle,mcqToggle,topicSearch,unlimitedToggle};
    const displays={timerDisplay,scoreDisplay,mathToolbar,previewDiv,expectedFormatDiv,mentalProgressBar};
    const modals={settingsModal,shortcutsModal,onboardingOverlay,answerCard};
    const session={mentalControls,singleControls,leaderboardCard,settingsBasicPanel,settingsAdvancedPanel,mentalProgressBar};
    const settings={settingsTheme,settingsDefaultMode,settingsAutoContinue,settingsShuffle,settingsScope,settingsDifficulty,settingsTimer,settingsMaxQuestions,settingsFont,settingsPerfMaster,settingsPerfWave,settingsPerfBlur,settingsPerfPreview,settingsPerfAnimations,settingsFpsCap,settingsNotifications,settingsAutoCheckDelay,settingsDecimalPlaces,settingsSound,settingsVibration,settingsMcqChoices,settingsAdaptive,settingsShowWeakPopup};
    const dom={
        get generateQuestionButton(){return buttons.generateQuestionButton;},
        set generateQuestionButton(v:any){buttons.generateQuestionButton=v;},
        checkAnswerButton,
        userAnswer,
        modeSingleBtn,
        modeMentalBtn,
        settingsModal,
        buttons,
        inputs,
        displays,
        modals,
        session,
        settings,
        appWindow:null
    };
    return{dom};
});
vi.mock("./core/stateStore",()=>{
    let sessionActive=false;
    let autoTimeout:any=null;
    let mcqMode=false;
    let currentMode="single";
    let scope="simple";
    let mentalScope="simple";
    let shuffle=false;
    let mentalShuffle=false;
    let selectedTopic:string|null=null;
    let currentDifficulty="medium";
    let autocontinue=false;
    const setSessionActive=vi.fn((a:boolean)=>{sessionActive=a;});
    const setAutoTimeout=vi.fn((t:any)=>{autoTimeout=t;});
    const setCurrentMode=vi.fn((m:string)=>{currentMode=m;});
    const setScope=vi.fn((s:string)=>{scope=s;});
    const setMentalScope=vi.fn((s:string)=>{mentalScope=s;});
    const setShuffle=vi.fn((s:boolean)=>{shuffle=s;});
    const setMentalShuffle=vi.fn((s:boolean)=>{mentalShuffle=s;});
    const setMcqMode=vi.fn((m:boolean)=>{mcqMode=m;});
    const setSelectedTopic=vi.fn((t:string|null)=>{selectedTopic=t;});
    const setCurrentDifficulty=vi.fn((d:string)=>{currentDifficulty=d;});
    const setAutocontinue=vi.fn((a:boolean)=>{autocontinue=a;});
    const appState={
        get sessionActive(){return sessionActive;},
        set sessionActive(v:boolean){sessionActive=v;},
        get autoTimeout(){return autoTimeout;},
        set autoTimeout(v:any){autoTimeout=v;setAutoTimeout(v);},
        get mcqMode(){return mcqMode;},
        get currentMode(){return"single";},
        set currentMode(v:string){setCurrentMode(v);},
        get scope(){return scope;},
        set scope(v:string){scope=v;setScope(v);},
        get mentalScope(){return mentalScope;},
        set mentalScope(v:string){mentalScope=v;setMentalScope(v);},
        get shuffle(){return shuffle;},
        set shuffle(v:boolean){shuffle=v;setShuffle(v);},
        get mentalShuffle(){return mentalShuffle;},
        set mentalShuffle(v:boolean){mentalShuffle=v;setMentalShuffle(v);},
        get selectedTopic(){return selectedTopic;},
        get currentDifficulty(){return currentDifficulty;},
        set currentDifficulty(v:string){currentDifficulty=v;setCurrentDifficulty(v);},
        get autocontinue(){return autocontinue;},
        set autocontinue(v:boolean){autocontinue=v;setAutocontinue(v);},
        setSessionActive,
        setAutoTimeout,
        setCurrentMode,
        setScope,
        setMentalScope,
        setShuffle,
        setMentalShuffle,
        setMcqMode,
        setSelectedTopic,
        setCurrentDifficulty,
        setAutocontinue
    };
    return{appState};
});
vi.mock("./settings.js",()=>({
    openSettings:vi.fn(),
    closeSettings:vi.fn(),
    saveSettings:vi.fn(),
    resetSettings:vi.fn(),
    applyTheme:vi.fn(),
    previewSetting:vi.fn(),
    settings:{theme:"system",mcqMode:false},
}));
vi.mock("./ui.js",()=>({
    clearAllTimeouts:vi.fn(),
    updateAriaPressed:vi.fn(),
    updateCheckboxAria:vi.fn(),
    updateUIState:vi.fn(),
    showNotification:vi.fn(),
    insertSymbol:vi.fn(),
    updatePreviewDebounced:vi.fn(),
    syncSettingsToState:vi.fn(),
    showShortcutsModal:vi.fn(),
    hideShortcutsModal:vi.fn(),
    showOnboarding:vi.fn(),
    hideOnboarding:vi.fn(),
    clearAnswer:vi.fn(),
    copyCorrectAnswer:vi.fn(),
    toggleMcqMode:vi.fn(),
}));
vi.mock("./topics.js",()=>({
    renderTopicGrid:vi.fn(),
}));
vi.mock("./generation.js",()=>({
    debounceGenerate:vi.fn(),
}));
vi.mock("./answer.js",()=>({
    checkAnswer:vi.fn(),
}));
vi.mock("./session.js",()=>({
    endMentalSession:vi.fn(),
    startMentalSession:vi.fn(),
    stopMentalSession:vi.fn(),
    pauseMentalSession:vi.fn(),
    skipMentalQuestion:vi.fn(),
    handleMentalAnswer:vi.fn(),
}));
vi.mock("./printWorksheet.js",()=>({
    initPrintModal:vi.fn(),
    openPrintModal:vi.fn(),
}));
vi.mock("./weakTopics.js",()=>({
    checkAndShowWeakTopicsPopup:vi.fn(()=>Promise.resolve()),
}));
vi.mock("./dataManagement.js",()=>({
    openDataModal:vi.fn(),
    initDataModal:vi.fn(),
}));
import{switchToSingle,switchToMental,setupEventListeners,isVersionGreater}from"./events.js";
import*as stateStore from"./core/stateStore";
let state:any=stateStore.appState;
import*as domRegistry from"./core/domRegistry";
let dom:any=domRegistry.dom;
import * as session from "./session.js";
import{gt as semverGt}from"semver";
import*as generation from"./generation.js";
import*as answer from"./answer.js";
import*as ui from"./ui.js";
describe("events",()=>{
    it("should export switchToSingle",()=>{
        expect(typeof switchToSingle).toBe("function");
    });
    it("switchToSingle should not throw",()=>{
        expect(()=>switchToSingle()).not.toThrow();
    });
    it("should export switchToMental",()=>{
        expect(typeof switchToMental).toBe("function");
    });
    it("switchToMental should not throw",()=>{
        expect(()=>switchToMental()).not.toThrow();
    });
    it("should export setupEventListeners",()=>{
        expect(typeof setupEventListeners).toBe("function");
    });
    it("setupEventListeners should not throw",async()=>{
        await expect(setupEventListeners()).resolves.not.toThrow();
    });
});
describe("switchToSingle",()=>{
    it("should be a function",()=>{
        expect(typeof switchToSingle).toBe("function");
    });
    it("should set current mode to single",()=>{
        switchToSingle();
        expect(state.setCurrentMode).toHaveBeenCalledWith("single");
    });
    it("should add active class to single button",()=>{
        switchToSingle();
        expect(dom.modeSingleBtn!.classList.add).toHaveBeenCalledWith("active");
    });
    it("should remove active class from mental button",()=>{
        switchToSingle();
        expect(dom.modeMentalBtn!.classList.remove).toHaveBeenCalledWith("active");
    });
    it("should end mental session if active",()=>{
        (state as any).sessionActive=true;
        switchToSingle();
        expect(session.endMentalSession).toHaveBeenCalled();
        (state as any).sessionActive=false;
    });
    it("should clear auto timeout",()=>{
        (state as any).autoTimeout=12345;
        switchToSingle();
        expect(state.setAutoTimeout).toHaveBeenCalledWith(null);
        (state as any).autoTimeout=null;
    });
});
describe("switchToMental",()=>{
    it("should be a function",()=>{
        expect(typeof switchToMental).toBe("function");
    });
    it("should set current mode to mental",()=>{
        switchToMental();
        expect(state.setCurrentMode).toHaveBeenCalledWith("mental");
    });
    it("should add active class to mental button",()=>{
        switchToMental();
        expect(dom.modeMentalBtn!.classList.add).toHaveBeenCalledWith("active");
    });
    it("should remove active class from single button",()=>{
        switchToMental();
        expect(dom.modeSingleBtn!.classList.remove).toHaveBeenCalledWith("active");
    });
    it("should end mental session if active",()=>{
        (state as any).sessionActive=true;
        switchToMental();
        expect(session.endMentalSession).toHaveBeenCalled();
        (state as any).sessionActive=false;
    });
    it("should clear auto timeout",()=>{
        (state as any).autoTimeout=12345;
        switchToMental();
        expect(state.setAutoTimeout).toHaveBeenCalledWith(null);
        (state as any).autoTimeout=null;
    });
});
describe("setupEventListeners",()=>{
    it("should be a function",()=>{
        expect(typeof setupEventListeners).toBe("function");
    });
    it("should not throw when called",async()=>{
        await expect(setupEventListeners()).resolves.not.toThrow();
    });
    it("should return early if required DOM elements missing",async()=>{
        const orig=dom.generateQuestionButton;
        (dom as any).generateQuestionButton=null;
        (dom.checkAnswerButton as any).addEventListener.mockClear();
        await setupEventListeners();
        expect((dom.checkAnswerButton as any).addEventListener).not.toHaveBeenCalled();
        (dom as any).generateQuestionButton=orig;
    });
});
describe("isVersionGreater",()=>{
    it("should compare version strings correctly",async()=>{
        (semverGt as any).mockReturnValueOnce(true);
        expect(await isVersionGreater("2.0.0","1.0.0")).toBe(true);
    });
    it("should handle v-prefixed versions",async()=>{
        (semverGt as any).mockReturnValueOnce(true);
        await isVersionGreater("v2.0.0","v1.0.0");
        expect(semverGt).toHaveBeenCalledWith("2.0.0","1.0.0");
    });
    it("should return false for equal versions",async()=>{
        (semverGt as any).mockReturnValueOnce(false);
        expect(await isVersionGreater("1.0.0","1.0.0")).toBe(false);
    });
    it("should return true for newer version",async()=>{
        (semverGt as any).mockReturnValueOnce(true);
        expect(await isVersionGreater("2.0.0","1.0.0")).toBe(true);
    });
    it("should return false for older version",async()=>{
        (semverGt as any).mockReturnValueOnce(false);
        expect(await isVersionGreater("1.0.0","2.0.0")).toBe(false);
    });
});
describe("keyboard shortcuts",()=>{
    let keyupHandler:any;
    let mathKeydownHandler:any;
    let ctrlKeydownHandler:any;
    let escapeKeydownHandler:any;
    beforeEach(async()=>{
        vi.clearAllMocks();
        let docAddSpy=vi.spyOn(document,"addEventListener");
        await setupEventListeners();
        let userAnswerCalls=(dom.userAnswer!.addEventListener as any).mock.calls;
        let keyupCall=userAnswerCalls.find((c:any[])=>c[0]==="keyup");
        keyupHandler=keyupCall?keyupCall[1]:null;
        let keydownCall=userAnswerCalls.find((c:any[])=>c[0]==="keydown");
        mathKeydownHandler=keydownCall?keydownCall[1]:null;
        let docKeydownCalls=docAddSpy.mock.calls.filter((c:any[])=>c[0]==="keydown");
        ctrlKeydownHandler=docKeydownCalls.length>0?docKeydownCalls[0][1]:null;
        escapeKeydownHandler=docKeydownCalls.length>1?docKeydownCalls[1][1]:null;
        docAddSpy.mockRestore();
    });
    it("should handle Enter key in answer box",()=>{
        expect(keyupHandler).toBeDefined();
        let mockEvent={shiftKey:true,key:"Enter",preventDefault:vi.fn(),ctrlKey:false,metaKey:false};
        keyupHandler(mockEvent);
        expect(answer.checkAnswer).toHaveBeenCalled();
    });
    it("should handle Escape key to close modals",()=>{
        expect(escapeKeydownHandler).toBeDefined();
        vi.mocked(dom.settingsModal!.classList.contains).mockReturnValue(true);
        let mockEvent={key:"Escape",preventDefault:vi.fn()};
        escapeKeydownHandler(mockEvent);
        expect(dom.settingsModal!.classList.remove).toHaveBeenCalledWith("show");
    });
    it("should handle keyboard shortcut for generate",()=>{
        expect(ctrlKeydownHandler).toBeDefined();
        let mockEvent={ctrlKey:true,key:"g",preventDefault:vi.fn(),metaKey:false};
        ctrlKeydownHandler(mockEvent);
        expect(generation.debounceGenerate).toHaveBeenCalled();
    });
    it("should not trigger shortcuts when typing in input",()=>{
        expect(mathKeydownHandler).toBeDefined();
        Object.defineProperty(document,"activeElement",{get:()=>dom.userAnswer,configurable:true});
        let mockEvent={key:"a",preventDefault:vi.fn(),ctrlKey:false,metaKey:false};
        mathKeydownHandler(mockEvent);
        expect(ui.insertSymbol).not.toHaveBeenCalled();
        Object.defineProperty(document,"activeElement",{get:()=>document.body,configurable:true});
    });
    it("should handle Tab key navigation",()=>{
        expect(mathKeydownHandler).toBeDefined();
        Object.defineProperty(document,"activeElement",{get:()=>dom.userAnswer,configurable:true});
        let mockEvent={key:"Tab",preventDefault:vi.fn(),ctrlKey:false,metaKey:false};
        mathKeydownHandler(mockEvent);
        expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        expect(ui.insertSymbol).not.toHaveBeenCalled();
        Object.defineProperty(document,"activeElement",{get:()=>document.body,configurable:true});
    });
});
describe("isVersionGreater - edge cases",()=>{
    it("should handle pre-release versions",async()=>{
        (semverGt as any).mockReturnValueOnce(true);
        expect(await isVersionGreater("2.0.0-alpha","1.0.0")).toBe(true);
        expect(semverGt).toHaveBeenCalledWith("2.0.0-alpha","1.0.0");
    });
    it("should handle build metadata",async()=>{
        (semverGt as any).mockReturnValueOnce(true);
        expect(await isVersionGreater("2.0.0+build.123","1.0.0")).toBe(true);
        expect(semverGt).toHaveBeenCalledWith("2.0.0+build.123","1.0.0");
    });
    it("should handle single digit versions",async()=>{
        (semverGt as any).mockReturnValueOnce(true);
        expect(await isVersionGreater("2","1")).toBe(true);
        expect(semverGt).toHaveBeenCalledWith("2","1");
    });
    it("should handle very long version strings",async()=>{
        (semverGt as any).mockReturnValueOnce(false);
        let longVer="1.0."+("0".repeat(1000));
        await expect(isVersionGreater(longVer,"1.0.0")).resolves.not.toThrow();
    });
    it("should handle null inputs gracefully",async()=>{
        await expect(isVersionGreater(null as any,"1.0.0")).rejects.toThrow();
    });
});
