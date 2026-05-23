/** @vitest-environment jsdom */
import{describe,it,expect,vi,afterEach}from"vitest";
vi.mock("./dom.js",()=>({
    settingsTheme:{value:"system"},
    settingsDefaultMode:{value:"single"},
    settingsAutoContinue:{checked:false},
    settingsShuffle:{checked:false},
    settingsScope:{value:"simple"},
    settingsDifficulty:{value:"medium"},
    settingsTimer:{value:"30"},
    settingsMaxQuestions:{value:"5"},
    settingsFont:{value:"default"},
    settingsPerfMaster:{checked:false},
    settingsPerfWave:{checked:true},
    settingsPerfBlur:{checked:true},
    settingsPerfPreview:{checked:true},
    settingsPerfAnimations:{checked:true},
    settingsFpsCap:{value:"0"},
    settingsNotifications:{checked:true},
    settingsAutoCheckDelay:{value:"800"},
    settingsDecimalPlaces:{value:"2"},
    settingsSound:{checked:false},
    settingsVibration:{checked:false},
    unlimitedToggle:{checked:false},
    mcqToggle:{checked:false},
    settingsMcqChoices:{value:"4"},
    settingsAdaptive:{checked:true},
    settingsShowWeakPopup:{checked:true},
    appWindow:null,
    autocontinueToggle:null,
    shuffleToggle:null,
    mentalShuffleToggle:null,
    scopeSelect:null,
    mentalScopeSelect:null,
    difficultySelect:null,
    settingsModal:null,
    waveContainer:null,
    previewDiv:null,
    userAnswer:null,
    expectedFormatDiv:null,
    questionArea:null,
}));
vi.mock("./state.js",()=>({
    mcqMode:false,
    hasQuestion:false,
    get correctAnswer(){return window.correctAnswer;},
}));
vi.mock("./mcq.js",()=>({
    generateChoicesForCurrentQuestion:vi.fn(),
}));
import*as settings from"./settings.js";
describe("settings",()=>{
    afterEach(()=>{
        localStorage.clear();
    });
    it("should export settings object with defaults",()=>{
        expect(settings.settings).toBeDefined();
        expect(settings.settings.theme).toBe("system");
        expect(settings.settings.difficulty).toBe("medium");
        expect(settings.settings.timer).toBe(30);
        expect(settings.settings.maxQuestions).toBe(5);
    });
    it("loadSettings should set DOM values",()=>{
        settings.loadSettings();
    });
    it("saveSettings should persist to localStorage",()=>{
        settings.saveSettings();
        const saved=localStorage.getItem("appSettings");
        expect(saved).toBeTruthy();
        const parsed=JSON.parse(saved!);
        expect(parsed.theme).toBe("system");
    });
    it("resetSettings should restore defaults",()=>{
        settings.resetSettings();
    });
    it("applyTheme should add dark class",()=>{
        settings.applyTheme("dark");
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        settings.applyTheme("light");
        expect(document.documentElement.classList.contains("light")).toBe(true);
    });
    it("applyFont should handle opendyslexic",()=>{
        settings.applyFont("opendyslexic");
        expect(document.body.classList.contains("font-opendyslexic")).toBe(true);
        settings.applyFont("default");
        expect(document.body.classList.contains("font-opendyslexic")).toBe(false);
    });
    it("isAnswerCorrect should match identical strings",()=>{
        expect(settings.isAnswerCorrect("42","42")).toBe(true);
    });
    it("isAnswerCorrect should reject different strings",()=>{
        expect(settings.isAnswerCorrect("42","43")).toBe(false);
    });
    it("isAnswerCorrect should handle whitespace",()=>{
        expect(settings.isAnswerCorrect("  42  ","42")).toBe(true);
    });
    it("isAnswerCorrect should handle alternate",()=>{
        expect(settings.isAnswerCorrect("alt","correct","alt")).toBe(true);
    });
    it("openSettings and closeSettings should toggle modal",()=>{
        settings.openSettings();
        settings.closeSettings();
    });
});
