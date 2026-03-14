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
}

if (document.readyState==="loading"){
	document.addEventListener("DOMContentLoaded",initApp);
}
else{
	initApp();
}