/** @vitest-environment jsdom */
import{describe,it,expect,vi,afterEach,beforeEach}from"vitest";
let mockAppWindow:any=null;
vi.mock("./core/DomRegistry",()=>{
    const settings={
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
        settingsMcqChoices:{value:"4"},
        settingsAdaptive:{checked:true},
        settingsShowWeakPopup:{checked:true}
    };
    const inputs={
        unlimitedToggle:{checked:false},
        mcqToggle:{checked:false},
        autocontinueToggle:null,
        shuffleToggle:null,
        mentalShuffleToggle:null,
        scopeSelect:null,
        mentalScopeSelect:null,
        difficultySelect:null
    };
    const dom={
        settings,
        inputs,
        modals:{settingsModal:null},
        get appWindow(){return mockAppWindow;},
        displays:{previewDiv:null},
        buttons:{themeToggle:null}
    };
    return{dom};
});
vi.mock("./core/StateStore",()=>({
    appState:{mcqMode:false}
}));
vi.mock("./core/QuestionState",()=>({
    questionState:{
        hasQuestion:false,
        get correctAnswer(){return(window as any).correctAnswer;}
    }
}));
vi.mock("./Mcq.js",()=>({
    generateChoicesForCurrentQuestion:vi.fn(),
}));
vi.mock("mathjs",()=>{
    const evaluate=vi.fn((expr:string)=>{
        try{
            return Function('"use strict";return ('+expr+')')();
        }catch{
            return NaN;
        }
    });
    return{evaluate,default:{evaluate}};
});
import*as settings from"./Settings.js";
describe("settings",()=>{
    beforeEach(()=>{
        mockAppWindow=null;
    });
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
    it("isAnswerCorrect should match identical strings",async()=>{
        expect(await settings.isAnswerCorrect("42","42")).toBe(true);
    });
    it("isAnswerCorrect should reject different strings",async()=>{
        expect(await settings.isAnswerCorrect("42","43")).toBe(false);
    });
    it("isAnswerCorrect should handle whitespace",async()=>{
        expect(await settings.isAnswerCorrect("  42  ","42")).toBe(true);
    });
    it("isAnswerCorrect should handle alternate",async()=>{
        expect(await settings.isAnswerCorrect("alt","correct","alt")).toBe(true);
    });
    it("openSettings and closeSettings should toggle modal",()=>{
        settings.openSettings();
        settings.closeSettings();
    });
    describe("isAnswerCorrect",()=>{
        it("should return false for empty input",async()=>{
            expect(await settings.isAnswerCorrect("","42")).toBe(false);
        });
        it("should return true for exact numeric match",async()=>{
            expect(await settings.isAnswerCorrect("42","42")).toBe(true);
        });
        it("should return true for numeric match within tolerance",async()=>{
            expect(await settings.isAnswerCorrect("3.142","3.14")).toBe(true);
        });
        it("should return false for numeric match outside tolerance",async()=>{
            expect(await settings.isAnswerCorrect("3.2","3.14")).toBe(false);
        });
        it("should handle degree symbol in input",async()=>{
            expect(await settings.isAnswerCorrect("45°","45")).toBe(true);
        });
        it("should handle radian suffix in input",async()=>{
            expect(await settings.isAnswerCorrect("1rad","1")).toBe(true);
        });
        it("should match alternate form numerically",async()=>{
            expect(await settings.isAnswerCorrect("1+1","2","3")).toBe(true);
        });
        it("should match alternate form symbolically",async()=>{
            expect(await settings.isAnswerCorrect("y","x","y")).toBe(true);
        });
        it("should handle pi symbol (π) in expressions",async()=>{
            expect(await settings.isAnswerCorrect("2*π","2*pi")).toBe(true);
        });
        it("should handle Unicode π character",async()=>{
            expect(await settings.isAnswerCorrect("π","pi")).toBe(true);
        });
        it("should handle expressions with spaces",async()=>{
            expect(await settings.isAnswerCorrect("2 + 3","5")).toBe(true);
        });
        it("should handle case-insensitive comparison",async()=>{
            expect(await settings.isAnswerCorrect("X","x")).toBe(true);
        });
        it("should return false for completely different answers",async()=>{
            expect(await settings.isAnswerCorrect("hello","42")).toBe(false);
        });
        it("should handle negative numbers",async()=>{
            expect(await settings.isAnswerCorrect("-5","-5")).toBe(true);
        });
        it("should handle decimal answers",async()=>{
            expect(await settings.isAnswerCorrect("3.14","3.14")).toBe(true);
        });
    });
    describe("previewSetting",()=>{
        it("should preview theme change to dark",async()=>{
            await settings.previewSetting("theme","dark");
            expect(document.documentElement.classList.contains("dark")).toBe(true);
        });
        it("should preview theme change to light",async()=>{
            await settings.previewSetting("theme","light");
            expect(document.documentElement.classList.contains("light")).toBe(true);
        });
        it("should preview theme change to system",async()=>{
            await settings.previewSetting("theme","system");
        });
        it("should preview theme system via Tauri when appWindow is available",async()=>{
            mockAppWindow={theme:vi.fn().mockResolvedValue("dark"),setTheme:vi.fn().mockResolvedValue(undefined)};
            settings.settings.theme="system";
            await settings.previewSetting("theme","system");
            expect(mockAppWindow.theme).toHaveBeenCalled();
            expect(document.documentElement.classList.contains("dark")).toBe(true);
        });
        it("should preview font change to opendyslexic",()=>{
            settings.previewSetting("font","opendyslexic");
            expect(document.body.classList.contains("font-opendyslexic")).toBe(true);
        });
        it("should preview font change to default",()=>{
            settings.previewSetting("font","opendyslexic");
            settings.previewSetting("font","default");
            expect(document.body.classList.contains("font-opendyslexic")).toBe(false);
        });
        it("should preview shuffle toggle",()=>{
            settings.previewSetting("shuffle",true);
        });
        it("should preview scope change",()=>{
            settings.previewSetting("scope","compound");
        });
        it("should preview difficulty change",()=>{
            settings.previewSetting("difficulty","hard");
        });
        it("should preview perfMaster toggle",()=>{
            settings.previewSetting("perfMaster",true);
            expect(settings.settings.perfMaster).toBe(true);
        });
        it("should preview perfWave toggle",()=>{
            settings.settings.perfMaster=false;
            settings.previewSetting("perfWave",false);
            expect(settings.settings.perfWave).toBe(false);
        });
        it("should preview perfBlur toggle",()=>{
            settings.settings.perfMaster=false;
            settings.previewSetting("perfBlur",false);
            expect(settings.settings.perfBlur).toBe(false);
        });
        it("should preview perfPreview toggle",()=>{
            settings.settings.perfMaster=false;
            settings.previewSetting("perfPreview",false);
            expect(settings.settings.perfPreview).toBe(false);
        });
        it("should preview perfAnimations toggle",()=>{
            settings.settings.perfMaster=false;
            settings.previewSetting("perfAnimations",false);
            expect(settings.settings.perfAnimations).toBe(false);
        });
        it("should preview fpsCap change",()=>{
            settings.previewSetting("fpsCap","30");
            expect(settings.settings.fpsCap).toBe(30);
        });
        it("should preview notifications toggle",()=>{
            settings.previewSetting("notifications",false);
            expect(settings.settings.notifications).toBe(false);
        });
    });
    describe("applySettingsToApp",()=>{
        it("should use appWindow.theme() when appWindow is available and theme is system",async()=>{
            mockAppWindow={theme:vi.fn().mockResolvedValue("dark"),setTheme:vi.fn().mockResolvedValue(undefined)};
            settings.settings.theme="system";
            await settings.applySettingsToApp();
            expect(mockAppWindow.theme).toHaveBeenCalled();
            expect(document.documentElement.classList.contains("dark")).toBe(true);
        });
        it("should fall back to matchMedia when appWindow is null and theme is system",async()=>{
            settings.settings.theme="system";
            await settings.applySettingsToApp();
            expect(document.documentElement.classList.contains("light")).toBe(true);
        });
        it("should apply non-system theme directly",async()=>{
            settings.settings.theme="dark";
            await settings.applySettingsToApp();
            expect(document.documentElement.classList.contains("dark")).toBe(true);
        });
        it("should fall back to matchMedia when appWindow.theme() throws",async()=>{
            mockAppWindow={theme:vi.fn().mockRejectedValue(new Error("perm denied")),setTheme:vi.fn().mockResolvedValue(undefined)};
            settings.settings.theme="system";
            await settings.applySettingsToApp();
            expect(document.documentElement.classList.contains("light")).toBe(true);
        });
    });
    describe("checkAnswerFast",()=>{
        it("should fall back to isAnswerCorrect when not in Tauri",async()=>{
            const savedTauri=(window as any).__TAURI__;
            const savedInternals=(window as any).__TAURI_INTERNALS__;
            delete (window as any).__TAURI__;
            delete (window as any).__TAURI_INTERNALS__;
            const result=await settings.checkAnswerFast("42","42");
            expect(result).toBe(true);
            (window as any).__TAURI__=savedTauri;
            (window as any).__TAURI_INTERNALS__=savedInternals;
        });
        it("should return result from isAnswerCorrect",async()=>{
            const savedTauri=(window as any).__TAURI__;
            const savedInternals=(window as any).__TAURI_INTERNALS__;
            delete (window as any).__TAURI__;
            delete (window as any).__TAURI_INTERNALS__;
            const result=await settings.checkAnswerFast("hello","42");
            expect(result).toBe(false);
            (window as any).__TAURI__=savedTauri;
            (window as any).__TAURI_INTERNALS__=savedInternals;
        });
    });
    describe("settings persistence",()=>{
        it("should persist theme to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({theme:"dark"}));
            settings.loadSettings();
            expect(settings.settings.theme).toBe("dark");
        });
        it("should persist font to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({font:"opendyslexic"}));
            settings.loadSettings();
            expect(settings.settings.font).toBe("opendyslexic");
        });
        it("should persist difficulty to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({difficulty:"hard"}));
            settings.loadSettings();
            expect(settings.settings.difficulty).toBe("hard");
        });
        it("should persist scope to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({scope:"compound"}));
            settings.loadSettings();
            expect(settings.settings.scope).toBe("compound");
        });
        it("should persist shuffle to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({shuffle:true}));
            settings.loadSettings();
            expect(settings.settings.shuffle).toBe(true);
        });
        it("should persist mcqMode to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({mcqMode:true}));
            settings.loadSettings();
            expect(settings.settings.mcqMode).toBe(true);
        });
        it("should persist mcqChoicesCount to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({mcqChoicesCount:6}));
            settings.loadSettings();
            expect(settings.settings.mcqChoicesCount).toBe(6);
        });
        it("should persist perfMaster to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({perfMaster:true}));
            settings.loadSettings();
            expect(settings.settings.perfMaster).toBe(true);
        });
        it("should persist perfWave to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({perfWave:false}));
            settings.loadSettings();
            expect(settings.settings.perfWave).toBe(false);
        });
        it("should persist perfBlur to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({perfBlur:false}));
            settings.loadSettings();
            expect(settings.settings.perfBlur).toBe(false);
        });
        it("should persist perfPreview to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({perfPreview:false}));
            settings.loadSettings();
            expect(settings.settings.perfPreview).toBe(false);
        });
        it("should persist perfAnimations to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({perfAnimations:false}));
            settings.loadSettings();
            expect(settings.settings.perfAnimations).toBe(false);
        });
        it("should persist fpsCap to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({fpsCap:30}));
            settings.loadSettings();
            expect(settings.settings.fpsCap).toBe(30);
        });
        it("should persist notifications to localStorage",()=>{
            localStorage.setItem("appSettings",JSON.stringify({notifications:false}));
            settings.loadSettings();
            expect(settings.settings.notifications).toBe(false);
        });
    });
    describe("settings edge cases",()=>{
        it("should handle corrupted localStorage gracefully",()=>{
            localStorage.setItem("appSettings","{invalid json!!!");
            expect(()=>settings.loadSettings()).not.toThrow();
        });
        it("should handle missing localStorage gracefully",()=>{
            localStorage.removeItem("appSettings");
            expect(()=>settings.loadSettings()).not.toThrow();
        });
        it("should handle invalid theme value",()=>{
            localStorage.setItem("appSettings",JSON.stringify({theme:"invalid"}));
            expect(()=>settings.loadSettings()).not.toThrow();
            expect(settings.settings.theme).toBe("invalid");
        });
        it("should handle invalid difficulty value",()=>{
            localStorage.setItem("appSettings",JSON.stringify({difficulty:"extreme"}));
            expect(()=>settings.loadSettings()).not.toThrow();
            expect(settings.settings.difficulty).toBe("extreme");
        });
        it("should handle invalid scope value",()=>{
            localStorage.setItem("appSettings",JSON.stringify({scope:"unknown"}));
            expect(()=>settings.loadSettings()).not.toThrow();
            expect(settings.settings.scope).toBe("unknown");
        });
        it("should handle invalid font value",()=>{
            localStorage.setItem("appSettings",JSON.stringify({font:"nonexistent"}));
            expect(()=>settings.loadSettings()).not.toThrow();
            expect(settings.settings.font).toBe("nonexistent");
        });
    });
});
