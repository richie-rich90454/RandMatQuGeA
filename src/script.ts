import"./style.css";
import * as settings from"./main/Settings";
import * as ui from"./main/Ui";
import * as session from"./main/Session";
import * as events from"./main/Events";
import * as theme from"./main/Theme";
import{watchVisualViewport}from"./main/services/Viewport";
import{questionState}from"./main/core/QuestionState";
import{offlineIndicator}from"./main/ui/OfflineIndicator";
questionState.correctAnswer={correct:"",alternate:"",display:""};
questionState.expectedFormat="";
questionState.hasQuestion=false;
async function initApp(): Promise<void>{
    // The stored settings are read before the persistence choice is applied, and
    // that order is the whole fix. The choice is itself one of the stored settings,
    // so applying it from a document that has not arrived yet means applying the
    // default: a learner who chose to keep their record came back to a private
    // session every time, and nothing was written after that point.
    await settings.loadSettings();
    // The persistence decision is settled before anything is written, because the
    // rule is about what leaves the device and a write that happens first cannot
    // be taken back.
    await settings.applyPersistence(settings.settings.persistence);
    settings.applyPersistenceVisibility();
    // Settled at boot for the same reason as the storage decision above: a surface
    // that must not exist in this runtime should never be painted and then taken
    // away, and a preference that cannot be honoured should not be read back.
    settings.applyAdaptiveVisibility();
    try{
        // Loaded on demand: the schedule and its storage are only needed once
        // there is a record to restore, and keeping them out of the initial
        // payload is what leaves room for the first paint.
        let reviewStore=await import("./main/services/ReviewStore");
        await reviewStore.loadRecords();
        let dailyMode=await import("./main/services/DailyMode");
        await dailyMode.loadCompleted();
    }
    catch(err){
        console.error("loadRecords failed:",err);
    }
    // A browser that cannot actually write must fall back to a private session
    // rather than leaving the interface promising a record it cannot keep.
    let store=await import("./main/services/Storage");
    if (!store.isPersistent()&&settings.settings.persistence==="indexed"){
        await settings.applyPersistence("zdr");
        settings.applyPersistenceVisibility();
    }
    ui.syncSettingsToState();
    if (settings.settings.defaultMode==="mental"){
        events.switchToMental();
    }
    else{
        events.switchToSingle();
    }
    try{
        await events.setupEventListeners();
    }
    catch(err){
        console.error("setupEventListeners failed:",err);
    }
    try{
        await theme.initializeTheme();
    }
    catch(err){
        console.error("initializeTheme failed:",err);
    }
    watchVisualViewport().catch((err:unknown)=>console.warn("viewport watcher unavailable:",err));
    ui.updateUIState();
    try{
        await session.restoreSessionSnapshot();
    }
    catch(err){
        console.error("restoreSessionSnapshot failed:",err);
    }
    try{
        await session.updateLeaderboard();
    }
    catch(err){
        console.error("updateLeaderboard failed:",err);
    }
    ui.showOnboarding();
    offlineIndicator.init();
    if (import.meta.env.PROD && "serviceWorker" in navigator){
        navigator.serviceWorker.register(import.meta.env.BASE_URL+"sw.js").catch(()=>{
            // SW registration failed - app still works
        });
    }
    // Start-up is over. The attribute is the only honest signal that it is: boot
    // reads stored settings and a review record before anything is interactive,
    // so a test that starts acting on the first thing it can see is acting on a
    // half-built app. It is set last, after every step above, and it is set even
    // if some of those steps failed, because a partly working app is still an app
    // and waiting forever for a flag that never arrives is worse than proceeding.
    document.documentElement.setAttribute("data-app-ready","true");
}
function startApp(): void{
    ready=initApp().catch((err: unknown)=>console.error("initApp failed:",err));
}
/**
 * Resolves once start-up has finished. Start-up is asynchronous because the privacy
 * decision is settled before anything is written, so this exists so a test can wait
 * for the app to be up rather than asserting against whatever happened to have run
 * by the time the assertion executed.
 */
export let ready: Promise<void>=Promise.resolve();
if (document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",startApp);
}
else{
    startApp();
}