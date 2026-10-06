/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
vi.mock("../../../main/core/DomRegistry",()=>{
    const make=()=>document.createElement("div");
    const dailySummary=make();
    const dailyProgress=make();
    const dailyProgressFill=make();
    const dailySummaryText={textContent:""};
    const dailyStreak=make();
    const dailyStreakCount={textContent:""};
    const dom={
        daily:{
            modeDailyBtn:null,
            dailySummary,
            dailyProgress,
            dailyProgressFill,
            dailySummaryText,
            dailyStreak,
            dailyStreakCount,
            dailyStartBtn:null
        },
        displays:{dailySummary, dailyProgress, dailyProgressFill, dailySummaryText, dailyStreak, dailyStreakCount},
        inputs:{},
        buttons:{},
        modals:{},
        get appWindow(){return null;}
    };
    return{dom};
});
vi.mock("../../../main/core/StateStore",()=>({appState:{currentMode:"single",scope:"simple"}}));
vi.mock("../../../main/Ui.js",()=>({
    showNotification:vi.fn(),
    setHidden:vi.fn()
}));
vi.mock("../../../main/Generation.js",()=>({
    generateQuestion:vi.fn(()=>Promise.resolve()),
    applyAdaptiveRecommendation:vi.fn(()=>Promise.resolve(false))
}));
vi.mock("../../../main/Topics.js",()=>({
    selectTopic:vi.fn(),
    scopeTopicIds:vi.fn(()=>["add","subtrt"]),
    isTopicInScope:vi.fn(()=>true)
}));
vi.mock("../main/services/DailyChallenge.js",()=>({
    buildDaily:vi.fn(),
    localDate:()=>"2026-10-03",
    dailyProgress:vi.fn(()=>0),
    streakAfter:vi.fn(()=>({streak:4}))
}));
import*as dailyMode from"../../../main/services/DailyMode.js";
import*as domRegistry from"../../../main/core/DomRegistry";
let dom:any=(domRegistry as unknown as{dom:unknown}).dom;
describe("dailyMode",()=>{
    let saved: unknown;
    beforeEach(()=>{
        saved=(globalThis as Record<string, unknown>).__TAURI_INTERNALS__;
        // The summary is drawn by a private function, so the cases go through the
        // public entry that draws it rather than reaching past the module's surface.
        dom.displays.dailyStreak.hidden=true;
        dom.displays.dailyStreak.classList.add("hidden");
        dom.displays.dailySummaryText.textContent="";
        dom.displays.dailyStreakCount.textContent="";
    });
    afterEach(()=>{
        (globalThis as Record<string, unknown>).__TAURI_INTERNALS__=saved as Record<string, unknown>;
    });
    describe("the streak badge",()=>{
        it('is hidden in a browser, which cannot keep a streak',async()=>{
            // A browser asked to remember writes its settings, and the review record a
            // streak counts is not written there. Showing the badge anyway would put a
            // number on screen that is always zero, which reads as a fact about the
            // learner rather than as a missing feature.
            delete (globalThis as any).__TAURI_INTERNALS__;
            await dailyMode.enter();
            expect(dom.displays.dailyStreak.classList.contains("hidden")).toBe(true);
        });
        it('is shown in the desktop app, which can',async()=>{
            (globalThis as any).__TAURI_INTERNALS__={};
            await dailyMode.enter();
            expect(dom.displays.dailyStreak.classList.contains("hidden")).toBe(false);
        });
        it('leaves the daily set itself working in a browser',async()=>{
            // The set is derived from the date and needs no record. Hiding the streak
            // must not take the progress with it, which is the difference between
            // removing a badge and breaking the feature.
            delete (globalThis as any).__TAURI_INTERNALS__;
            await dailyMode.enter();
            expect(dom.displays.dailySummaryText.textContent).toContain("done");
        });
    });
});