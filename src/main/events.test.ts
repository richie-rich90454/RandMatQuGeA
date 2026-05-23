/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("@tauri-apps/plugin-updater",()=>({
    check:vi.fn(),
}));
vi.mock("@tauri-apps/plugin-process",()=>({
    relaunch:vi.fn(),
}));
vi.mock("semver",()=>({gt:vi.fn(()=>false)}));
vi.mock("../../package.json",()=>({default:{version:"1.0.0"},version:"1.0.0"}));
vi.mock("./dom.js",()=>{
    const btnProps={addEventListener:vi.fn(),classList:{add:vi.fn(),remove:vi.fn(),contains:vi.fn()},disabled:false,textContent:"",setAttribute:vi.fn(),click:vi.fn(),style:{display:""},value:"",checked:false,innerHTML:"",querySelectorAll:vi.fn(()=>[]),dataset:{}};
    const modalProps={classList:{add:vi.fn(),remove:vi.fn(),contains:vi.fn(()=>false)},style:{display:""},addEventListener:vi.fn()};
    const inputProps={value:"",disabled:false,style:{display:""},focus:vi.fn(),addEventListener:vi.fn(),selectionStart:0,selectionEnd:0,setAttribute:vi.fn(),removeAttribute:vi.fn(),checked:false};
    return{
        generateQuestionButton:{...btnProps},
        checkAnswerButton:{...btnProps},
        userAnswer:{...inputProps},
        themeToggle:{...btnProps},
        helpButton:{...btnProps},
        settingsButton:{...btnProps},
        modeSingleBtn:{...btnProps},
        modeMentalBtn:{...btnProps},
        mentalControls:{style:{display:""}},
        singleControls:{style:{display:""}},
        difficultySelect:{...btnProps,value:"medium"},
        timerDisplay:{innerHTML:""},
        scoreDisplay:{innerHTML:""},
        startSessionBtn:{...btnProps},
        pauseSessionBtn:{...btnProps,style:{display:""}},
        skipQuestionBtn:{...btnProps,style:{display:""}},
        autocontinueToggle:{...inputProps},
        scopeSelect:{...btnProps,value:"simple"},
        shuffleToggle:{...inputProps},
        mentalScopeSelect:{...btnProps,value:"simple"},
        mentalShuffleToggle:{...inputProps},
        settingsModal:{...modalProps},
        settingsClose:{...btnProps},
        settingsSave:{...btnProps},
        settingsReset:{...btnProps},
        settingsTheme:{...btnProps,value:"system"},
        settingsDefaultMode:{...btnProps,value:"single"},
        settingsAutoContinue:{...inputProps},
        settingsShuffle:{...inputProps},
        settingsScope:{...btnProps,value:"simple"},
        settingsDifficulty:{...btnProps,value:"medium"},
        settingsTimer:{...inputProps,value:"30"},
        settingsMaxQuestions:{...inputProps,value:"5"},
        settingsFont:{...btnProps,value:"default"},
        settingsPerfMaster:{...inputProps},
        settingsPerfWave:{...inputProps},
        settingsPerfBlur:{...inputProps},
        settingsPerfPreview:{...inputProps},
        settingsPerfAnimations:{...inputProps},
        settingsFpsCap:{...btnProps,value:"0"},
        settingsNotifications:{...inputProps},
        settingsAutoCheckDelay:{...inputProps,value:"800"},
        settingsDecimalPlaces:{...inputProps,value:"2"},
        settingsSound:{...inputProps},
        settingsVibration:{...inputProps},
        mcqToggle:{...inputProps},
        topicSearch:{...inputProps},
        clearAnswerBtn:{...btnProps},
        mathToolbar:{style:{display:""},querySelectorAll:vi.fn(()=>[]),contains:vi.fn(()=>false)},
        copyAnswerBtn:{...btnProps,style:{display:""}},
        shortcutsButton:{...btnProps},
        shortcutsClose:{...btnProps},
        shortcutsGotit:{...btnProps},
        shortcutsModal:{...modalProps},
        leaderboardClose:{...btnProps},
        leaderboardCard:{style:{display:""}},
        onboardingClose:{...btnProps},
        onboardingGotit:{...btnProps},
        onboardingOverlay:{...modalProps},
        answerCard:{classList:{add:vi.fn(),remove:vi.fn()}},
        checkUpdatesBtn:{...btnProps},
        unlimitedToggle:{...inputProps},
        appWindow:null,
        settingsAdaptive:{...inputProps},
        settingsShowWeakPopup:{...inputProps},
        settingsMcqChoices:{...btnProps,value:"4"},
        settingsTabBasic:{...btnProps},
        settingsTabAdvanced:{...btnProps},
        settingsBasicPanel:{style:{display:""}},
        settingsAdvancedPanel:{style:{display:""}},
        mcqChoicesContainer:{style:{display:""}},
        previewDiv:{style:{display:""}},
        expectedFormatDiv:{style:{display:""}},
        mentalProgressBar:{style:{width:""},setAttribute:vi.fn()},
    };
});
vi.mock("./state.js",()=>{
    let sessionActive=false;
    let autoTimeout:any=null;
    let mcqMode=false;
    let currentMode="single";
    let scope="simple";
    let mentalScope="simple";
    let shuffle=false;
    let mentalShuffle=false;
    let selectedTopic=null;
    let currentDifficulty="medium";
    return{
        sessionActive,
        autoTimeout,
        mcqMode,
        currentMode,
        scope,
        mentalScope,
        shuffle,
        mentalShuffle,
        selectedTopic,
        currentDifficulty,
        setSessionActive:vi.fn((a:boolean)=>{sessionActive=a;}),
        setAutoTimeout:vi.fn((t:any)=>{autoTimeout=t;}),
        setCurrentMode:vi.fn((m:"single"|"mental")=>{currentMode=m;}),
        setScope:vi.fn((s:string)=>{scope=s;}),
        setMentalScope:vi.fn((s:string)=>{mentalScope=s;}),
        setShuffle:vi.fn((s:boolean)=>{shuffle=s;}),
        setMentalShuffle:vi.fn((s:boolean)=>{mentalShuffle=s;}),
        setMcqMode:vi.fn((m:boolean)=>{mcqMode=m;}),
        setSelectedTopic:vi.fn((t:string|null)=>{selectedTopic=t;}),
        setCurrentDifficulty:vi.fn((d:string)=>{currentDifficulty=d;}),
    };
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
import{switchToSingle,switchToMental,setupEventListeners}from"./events.js";
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
    it("setupEventListeners should not throw",()=>{
        expect(()=>setupEventListeners()).not.toThrow();
    });
});
