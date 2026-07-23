import{getCurrentWindow,type Window}from"@tauri-apps/api/window";
export class DomRegistry{
    private cache: Map<string,HTMLElement|null>=new Map();
    private _appWindow: Window|null=null;
    private appWindowChecked: boolean=false;
    getElement<T extends HTMLElement>(id: string): T|null{
        const cached=this.cache.get(id);
        if(cached!==undefined&&cached!==null)return cached as T|null;
        const el=document.getElementById(id);
        this.cache.set(id,el);
        return el as T|null;
    }
    queryElement<T extends HTMLElement>(selector: string): T|null{
        const cached=this.cache.get(selector);
        if(cached!==undefined&&cached!==null)return cached as T|null;
        const el=document.querySelector(selector) as HTMLElement|null;
        this.cache.set(selector,el);
        return el as T|null;
    }
    invalidate(id: string): void{
        this.cache.delete(id);
    }
    invalidateAll(): void{
        this.cache.clear();
    }
    get appWindow(): Window|null{
        if(this.appWindowChecked) return this._appWindow;
        if(!this._appWindow){
            try{
                this._appWindow=getCurrentWindow();
            }
            catch(e){
                this.appWindowChecked=true;
                console.log("Not running in Tauri environment, theme sync disabled.");
            }
        }
        this.appWindowChecked=true;
        return this._appWindow;
    }
    get buttons(){
        let self=this;
        return{
            get generateQuestionButton(){return self.getElement<HTMLButtonElement>("genQ");},
            get checkAnswerButton(){return self.getElement<HTMLButtonElement>("check-answer");},
            get themeToggle(){return self.getElement<HTMLButtonElement>("theme-toggle");},
            get helpButton(){return self.getElement<HTMLButtonElement>("help-button");},
            get settingsButton(){return self.getElement<HTMLButtonElement>("settings-button");},
            get modeSingleBtn(){return self.getElement<HTMLButtonElement>("mode-single");},
            get modeMentalBtn(){return self.getElement<HTMLButtonElement>("mode-mental");},
            get startSessionBtn(){return self.getElement<HTMLButtonElement>("start-session");},
            get pauseSessionBtn(){return self.getElement<HTMLButtonElement>("pause-session");},
            get skipQuestionBtn(){return self.getElement<HTMLButtonElement>("skip-question");},
            get copyAnswerBtn(){return self.getElement<HTMLButtonElement>("copy-answer");},
            get clearAnswerBtn(){return self.getElement<HTMLButtonElement>("clear-answer");},
            get shortcutsButton(){return self.getElement<HTMLButtonElement>("shortcuts-button");},
            get shortcutsClose(){return self.getElement<HTMLButtonElement>("shortcuts-close");},
            get shortcutsGotit(){return self.getElement<HTMLButtonElement>("shortcuts-gotit");},
            get leaderboardClose(){return self.getElement<HTMLButtonElement>("leaderboard-close");},
            get onboardingClose(){return self.getElement<HTMLButtonElement>("onboarding-close");},
            get onboardingGotit(){return self.getElement<HTMLButtonElement>("onboarding-gotit");},
            get settingsTabBasic(){return self.getElement<HTMLButtonElement>("settings-tab-basic");},
            get settingsTabAdvanced(){return self.getElement<HTMLButtonElement>("settings-tab-advanced");},
            get settingsClose(){return self.getElement<HTMLButtonElement>("settings-close");},
            get settingsSave(){return self.getElement<HTMLButtonElement>("settings-save");},
            get settingsReset(){return self.getElement<HTMLButtonElement>("settings-reset");},
            get checkUpdatesBtn(){return self.getElement<HTMLButtonElement>("check-updates");},
        };
    }
    get inputs(){
        let self=this;
        return{
            get userAnswer(){return self.getElement<HTMLTextAreaElement>("answer-box");},
            get difficultySelect(){return self.getElement<HTMLSelectElement>("difficulty-select");},
            get scopeSelect(){return self.getElement<HTMLSelectElement>("scope-select");},
            get mentalScopeSelect(){return self.getElement<HTMLSelectElement>("mental-scope-select");},
            get autocontinueToggle(){return self.getElement<HTMLInputElement>("autocontinue-toggle");},
            get shuffleToggle(){return self.getElement<HTMLInputElement>("shuffle-toggle");},
            get mentalShuffleToggle(){return self.getElement<HTMLInputElement>("mental-shuffle-toggle");},
            get topicSearch(){return self.getElement<HTMLInputElement>("topic-search");},
            get unlimitedToggle(){return self.getElement<HTMLInputElement>("unlimited-toggle");},
            get mcqToggle(){return self.getElement<HTMLInputElement>("mcq-toggle");},
        };
    }
    get displays(){
        let self=this;
        return{
            get questionArea(){return self.getElement<HTMLDivElement>("question-area");},
            get topicGrid(){return self.getElement("topic-grid");},
            get currentTopicDisplay(){return self.getElement("current-topic");},
            get answerResults(){return self.getElement("answer-results");},
            get expectedFormatDiv(){return self.getElement("expected-format");},
            get timerDisplay(){return self.getElement("timer-display");},
            get scoreDisplay(){return self.getElement("score-display");},
            get mentalProgressBar(){return self.getElement("mental-progress-bar");},
            get previewDiv(){return self.getElement("preview");},
            get mathToolbar(){return self.getElement("math-toolbar");},
            get customContextMenu(){return self.getElement("custom-context-menu");},
            get leaderboardContent(){return self.getElement("leaderboard-content");},
            get statisticsPanel(){return self.getElement("statistics-panel");},
            get accuracyStat(){return self.getElement("accuracy-stat");},
            get avgTimeStat(){return self.getElement("avg-time-stat");},
            get mcqChoicesContainer(){return self.getElement("mcq-choices-container");},
        };
    }
    get modals(){
        let self=this;
        return{
            get settingsModal(){return self.getElement("settings-modal");},
            get shortcutsModal(){return self.getElement("shortcuts-modal");},
            get onboardingOverlay(){return self.getElement("onboarding-overlay");},
            get printModal(){return self.getElement("print-modal");},
            get weakTopicsModal(){return self.getElement("weak-topics-modal");},
            get dataModal(){return self.getElement("data-modal");},
            get answerCard(){return self.queryElement(".answer-card");},
        };
    }
    get settings(){
        let self=this;
        return{
            get settingsTheme(){return self.getElement<HTMLSelectElement>("settings-theme");},
            get settingsDefaultMode(){return self.getElement<HTMLSelectElement>("settings-default-mode");},
            get settingsAutoContinue(){return self.getElement<HTMLInputElement>("settings-auto-continue");},
            get settingsShuffle(){return self.getElement<HTMLInputElement>("settings-shuffle");},
            get settingsScope(){return self.getElement<HTMLSelectElement>("settings-scope");},
            get settingsDifficulty(){return self.getElement<HTMLSelectElement>("settings-difficulty");},
            get settingsTimer(){return self.getElement<HTMLInputElement>("settings-timer");},
            get settingsMaxQuestions(){return self.getElement<HTMLInputElement>("settings-max-questions");},
            get settingsFont(){return self.getElement<HTMLSelectElement>("settings-font");},
            get settingsPerfMaster(){return self.getElement<HTMLInputElement>("settings-perf-master");},
            get settingsPerfWave(){return self.getElement<HTMLInputElement>("settings-perf-wave");},
            get settingsPerfBlur(){return self.getElement<HTMLInputElement>("settings-perf-blur");},
            get settingsPerfPreview(){return self.getElement<HTMLInputElement>("settings-perf-preview");},
            get settingsPerfAnimations(){return self.getElement<HTMLInputElement>("settings-perf-animations");},
            get settingsFpsCap(){return self.getElement<HTMLSelectElement>("settings-fps-cap");},
            get settingsNotifications(){return self.getElement<HTMLInputElement>("settings-notifications");},
            get settingsAutoCheckDelay(){return self.getElement<HTMLInputElement>("settings-auto-check-delay");},
            get settingsDecimalPlaces(){return self.getElement<HTMLInputElement>("settings-decimal-places");},
            get settingsSound(){return self.getElement<HTMLInputElement>("settings-sound");},
            get settingsVibration(){return self.getElement<HTMLInputElement>("settings-vibration");},
            get settingsMcqChoices(){return self.getElement<HTMLInputElement>("settings-mcq-choices");},
            get settingsAdaptive(){return self.getElement<HTMLInputElement>("settings-adaptive");},
        };
    }
    get session(){
        let self=this;
        return{
            get mentalControls(){return self.getElement("mental-controls");},
            get singleControls(){return self.getElement("single-controls");},
            get leaderboardCard(){return self.getElement("leaderboard-card");},
            get settingsBasicPanel(){return self.getElement("settings-basic");},
            get settingsAdvancedPanel(){return self.getElement("settings-advanced");},
        };
    }
}
export const dom: DomRegistry=new DomRegistry();