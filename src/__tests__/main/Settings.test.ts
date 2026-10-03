/** @vitest-environment jsdom */
import{describe,it,expect,vi,afterEach,beforeEach}from"vitest";
let mockAppWindow:any=null;
vi.mock("../../main/core/DomRegistry",()=>{
    const adaptiveRow=document.createElement("div");
    const recommendBtn=document.createElement("button");
    const weakTopicsModal=document.createElement("div");
    const settings={
        settingsTheme:{value:"system"},
        // The persistence control and its help text are real elements, with real
        // options, because what the mode control claims is itself the thing under
        // test: a desktop build that said "nothing is stored" while writing to disk
        // is the bug these options were added for.
        settingsPersistence:Object.assign(document.createElement("select"),{innerHTML:
            '<option value="desktop">This computer (the desktop app)</option>'
            +'<option value="zdr">Private session (nothing is stored)</option>'
            +'<option value="indexed">Remember me (stored in this browser)</option>'}),
        settingsPersistenceHelp:document.createElement("p"),
        settingEraseData:document.createElement("div"),
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
        settingsShowWeakPopup:{checked:true},
        // The adaptive row is a real element because the visibility rule has to be
        // asserted against something that can actually be hidden.
        settingAdaptive:adaptiveRow
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
        modals:{settingsModal:null,weakTopicsModal:weakTopicsModal},
        get appWindow(){return mockAppWindow;},
        displays:{previewDiv:null},
        buttons:{themeToggle:null,recommendBtn:recommendBtn}
    };
    return{dom};
});
vi.mock("../../main/core/StateStore",()=>({
    appState:{mcqMode:false}
}));
vi.mock("../../main/core/QuestionState",()=>({
    questionState:{
        hasQuestion:false,
        get correctAnswer(){return(window as any).correctAnswer;}
    }
}));
vi.mock("../../main/Mcq.js",()=>({
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
import*as settings from"../../main/Settings.js";
import*as domRegistry from"../../main/core/DomRegistry";
let dom:any=(domRegistry as unknown as{dom:unknown}).dom;
describe("settings",()=>{
    beforeEach(()=>{
        mockAppWindow=null;
    });
    afterEach(async()=>{
        localStorage.clear();
        // The storage module keeps an in-memory map for the lifetime of the tab,
        // which is the behavior the privacy promise depends on and also the
        // reason clearing local storage alone is not enough between cases: a value
        // read by an earlier test would otherwise still be there and the read would
        // never fall through to the legacy copy.
        const storage=await import("../../main/services/Storage.js");
        await storage.clear();
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
    it("saveSettings should keep the settings out of local storage",async()=>{
        // Settings are the learner's own choices and belong in the same promise as
        // their history, so they go through the storage module. A private session
        // leaves no copy in local storage, and the value is still readable for the
        // session through the store.
        settings.saveSettings();
        const storage=await import("../../main/services/Storage.js");
        let stored=await storage.read<{theme:string}>("appSettings");
        expect(stored?.theme).toBe("system");
        expect(localStorage.getItem("appSettings")).toBeNull();
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
    describe("settings persistence",()=>{
        it("should persist theme to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({theme:"dark"}));
            await settings.loadSettings();
            expect(settings.settings.theme).toBe("dark");
        });
        it("should persist font to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({font:"opendyslexic"}));
            await settings.loadSettings();
            expect(settings.settings.font).toBe("opendyslexic");
        });
        it("should persist difficulty to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({difficulty:"hard"}));
            await settings.loadSettings();
            expect(settings.settings.difficulty).toBe("hard");
        });
        it("should persist scope to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({scope:"compound"}));
            await settings.loadSettings();
            expect(settings.settings.scope).toBe("compound");
        });
        it("should persist shuffle to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({shuffle:true}));
            await settings.loadSettings();
            expect(settings.settings.shuffle).toBe(true);
        });
        it("should persist mcqMode to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({mcqMode:true}));
            await settings.loadSettings();
            expect(settings.settings.mcqMode).toBe(true);
        });
        it("should persist mcqChoicesCount to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({mcqChoicesCount:6}));
            await settings.loadSettings();
            expect(settings.settings.mcqChoicesCount).toBe(6);
        });
        it("should persist perfMaster to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({perfMaster:true}));
            await settings.loadSettings();
            expect(settings.settings.perfMaster).toBe(true);
        });
        it("should persist perfWave to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({perfWave:false}));
            await settings.loadSettings();
            expect(settings.settings.perfWave).toBe(false);
        });
        it("should persist perfBlur to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({perfBlur:false}));
            await settings.loadSettings();
            expect(settings.settings.perfBlur).toBe(false);
        });
        it("should persist perfPreview to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({perfPreview:false}));
            await settings.loadSettings();
            expect(settings.settings.perfPreview).toBe(false);
        });
        it("should persist perfAnimations to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({perfAnimations:false}));
            await settings.loadSettings();
            expect(settings.settings.perfAnimations).toBe(false);
        });
        it("should persist fpsCap to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({fpsCap:30}));
            await settings.loadSettings();
            expect(settings.settings.fpsCap).toBe(30);
        });
        it("should persist notifications to localStorage",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({notifications:false}));
            await settings.loadSettings();
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
        it("should handle invalid theme value",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({theme:"invalid"}));
            await expect(settings.loadSettings()).resolves.toBeUndefined();
            expect(settings.settings.theme).toBe("invalid");
        });
        it("should handle invalid difficulty value",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({difficulty:"extreme"}));
            await expect(settings.loadSettings()).resolves.toBeUndefined();
            expect(settings.settings.difficulty).toBe("extreme");
        });
        it("should handle invalid scope value",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({scope:"unknown"}));
            await expect(settings.loadSettings()).resolves.toBeUndefined();
            expect(settings.settings.scope).toBe("unknown");
        });
        it("should handle invalid font value",async()=>{
            localStorage.setItem("appSettings",JSON.stringify({font:"nonexistent"}));
            await expect(settings.loadSettings()).resolves.toBeUndefined();
            expect(settings.settings.font).toBe("nonexistent");
        });
    });
    describe('applyAdaptiveVisibility', ()=>{
        let saved: unknown=(globalThis as Record<string, unknown>).__TAURI_INTERNALS__;
        beforeEach(()=>{
            saved=(globalThis as Record<string, unknown>).__TAURI_INTERNALS__;
        });
        afterEach(()=>{
            (globalThis as Record<string, unknown>).__TAURI_INTERNALS__=saved as Record<string, unknown>;
        });
        it('leaves every adaptive surface in place in the desktop app',()=>{
            (globalThis as any).__TAURI_INTERNALS__={};
            settings.settings.adaptive=true;
            settings.applyAdaptiveVisibility();
            expect(dom.settings.settingAdaptive.classList.contains("hidden")).toBe(false);
            expect(dom.buttons.recommendBtn.classList.contains("hidden")).toBe(false);
            expect(dom.modals.weakTopicsModal.classList.contains("hidden")).toBe(false);
            expect(settings.settings.adaptive).toBe(true);
        });
        it('hides every adaptive surface in a browser',()=>{
            delete (globalThis as any).__TAURI_INTERNALS__;
            settings.settings.adaptive=true;
            settings.applyAdaptiveVisibility();
            expect(dom.settings.settingAdaptive.classList.contains("hidden")).toBe(true);
            expect(dom.buttons.recommendBtn.classList.contains("hidden")).toBe(true);
            expect(dom.modals.weakTopicsModal.classList.contains("hidden")).toBe(true);
        });
        it('turns the preference off where it cannot be honored',()=>{
            // Hiding the control is not enough: a stored true would be read back by
            // the difficulty adjustment and acted on, and nothing on screen would
            // explain why the learner had no way to turn it off again.
            delete (globalThis as any).__TAURI_INTERNALS__;
            settings.settings.adaptive=true;
            settings.applyAdaptiveVisibility();
            expect(settings.settings.adaptive).toBe(false);
        });
        it('does not re-enable a preference the desktop app had turned off',()=>{
            (globalThis as any).__TAURI_INTERNALS__={};
            settings.settings.adaptive=false;
            settings.applyAdaptiveVisibility();
            expect(settings.settings.adaptive).toBe(false);
        });
    });
    describe('effectivePersistence', ()=>{
        let saved: unknown=(globalThis as Record<string, unknown>).__TAURI_INTERNALS__;
        afterEach(()=>{
            (globalThis as Record<string, unknown>).__TAURI_INTERNALS__=saved as Record<string, unknown>;
        });
        it('reports the desktop store, because that is what the desktop build writes to',()=>{
            (globalThis as any).__TAURI_INTERNALS__={};
            settings.settings.persistence='zdr';
            expect(settings.effectivePersistence()).toBe('desktop');
        });
        it('reports the chosen mode in a browser',()=>{
            delete (globalThis as any).__TAURI_INTERNALS__;
            settings.settings.persistence='indexed';
            expect(settings.effectivePersistence()).toBe('indexed');
        });
    });
    describe('applyPersistenceVisibility', ()=>{
        let saved: unknown=(globalThis as Record<string, unknown>).__TAURI_INTERNALS__;
        let previous: unknown;
        beforeEach(()=>{
            saved=(globalThis as Record<string, unknown>).__TAURI_INTERNALS__;
            previous=settings.settings.persistence;
        });
        afterEach(()=>{
            (globalThis as Record<string, unknown>).__TAURI_INTERNALS__=saved as Record<string, unknown>;
            settings.settings.persistence=previous as 'zdr'|'indexed';
        });
        it('never tells the desktop app that nothing is stored',()=>{
            (globalThis as any).__TAURI_INTERNALS__={};
            settings.settings.persistence='zdr';
            settings.applyPersistenceVisibility();
            expect(dom.settings.settingsPersistence.value).toBe('desktop');
            expect(dom.settings.settingsPersistenceHelp.textContent).toContain('this computer');
            expect(dom.settings.settingsPersistenceHelp.textContent).not.toContain('close the tab');
        });
        it('keeps the adaptive surfaces in the desktop app',()=>{
            (globalThis as any).__TAURI_INTERNALS__={};
            settings.settings.adaptive=true;
            settings.applyPersistenceVisibility();
            expect(dom.settings.settingAdaptive.classList.contains('hidden')).toBe(false);
            expect(dom.buttons.recommendBtn.classList.contains('hidden')).toBe(false);
        });
        it('re-decides the adaptive surfaces when the mode changes',()=>{
            // Turning a private session on is the moment the record the scheduler
            // reads disappears, so the switch has to go at that moment rather than at
            // the next start-up.
            delete (globalThis as any).__TAURI_INTERNALS__;
            settings.settings.persistence='indexed';
            settings.settings.adaptive=true;
            settings.applyPersistenceVisibility();
            expect(dom.settings.settingAdaptive.classList.contains('hidden')).toBe(true);
        });
        it('offers the erase control wherever something is kept',()=>{
            delete (globalThis as any).__TAURI_INTERNALS__;
            settings.settings.persistence='indexed';
            settings.applyPersistenceVisibility();
            expect(dom.settings.settingEraseData.classList.contains('hidden')).toBe(false);
            settings.settings.persistence='zdr';
            settings.applyPersistenceVisibility();
            expect(dom.settings.settingEraseData.classList.contains('hidden')).toBe(true);
        });
    });
});