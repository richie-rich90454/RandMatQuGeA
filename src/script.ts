/**
 * @file script.ts - Main entry point for the math quiz application.
 * @date 2026-04-12
 * @description Initializes the app, loads settings, sets up event listeners, and renders topics.
 * Removed automatic weak topics popup; now manual via button.
 */
import * as settings from "./main/settings";
import * as ui from "./main/ui";
import * as topicsModule from "./main/topics";
import * as session from "./main/session";
import * as events from "./main/events";
import * as theme from "./main/theme";
export * from "./main/dom";
export * from "./main/state";
window.correctAnswer={correct:""};
window.expectedFormat="";
window.hasQuestion=false;
function initApp(): void{
    settings.loadSettings();
    ui.syncSettingsToState();
    if (settings.settings.defaultMode==="mental"){
        events.switchToMental();
    }
    else{
        events.switchToSingle();
    }
    events.setupEventListeners();
    theme.initializeTheme();
    ui.updateUIState();
    session.restoreSessionSnapshot();
    topicsModule.renderTopicGrid();
    session.updateLeaderboard();
    ui.showOnboarding();
    if ("serviceWorker" in navigator){
        navigator.serviceWorker.register("/sw.js").catch(()=>{
            // SW registration failed - app still works
        });
    }
}
if (document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",initApp);
}
else{
    initApp();
}