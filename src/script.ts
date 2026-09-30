import"./style.css";
import * as settings from"./main/Settings";
import * as ui from"./main/Ui";
import * as session from"./main/Session";
import * as events from"./main/Events";
import * as theme from"./main/Theme";
import * as storage from"./main/services/Storage";
import * as reviewStore from"./main/services/ReviewStore";
import{watchVisualViewport}from"./main/services/Viewport";
import{questionState}from"./main/core/QuestionState";
import{offlineIndicator}from"./main/ui/OfflineIndicator";
questionState.correctAnswer={correct:"",alternate:"",display:""};
questionState.expectedFormat="";
questionState.hasQuestion=false;
async function initApp(): Promise<void>{
    settings.loadSettings();
    // The persistence decision is settled before anything is written, because the
    // rule is about what leaves the device and a write that happens first cannot
    // be taken back.
    await settings.applyPersistence(settings.settings.persistence);
    settings.applyPersistenceVisibility();
    try{
        await reviewStore.loadRecords();
    }
    catch(err){
        console.error("loadRecords failed:",err);
    }
    // A browser that cannot actually write must fall back to a private session
    // rather than leaving the interface promising a record it cannot keep.
    if (!storage.isPersistent()&&settings.settings.persistence==="indexed"){
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
    watchVisualViewport();
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
}
function startApp(): void{
    initApp().catch((err: unknown)=>console.error("initApp failed:",err));
}
if (document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",startApp);
}
else{
    startApp();
}