import{vi}from"vitest";
import{topicRegistry}from"../main/services/topicRegistry";
export function setupDomMock(): void{
    let elements: Map<string,HTMLElement>=new Map();
    let elementIds=[
        "genQ","check-answer","theme-toggle","help-button","settings-button",
        "mode-single","mode-mental","start-session","pause-session","skip-question",
        "copy-answer","clear-answer","shortcuts-button","shortcuts-close","shortcuts-gotit",
        "leaderboard-close","onboarding-close","onboarding-gotit",
        "settings-tab-basic","settings-tab-advanced","settings-close","settings-save",
        "settings-reset","check-updates","answer-box","difficulty-select","scope-select",
        "mental-scope-select","autocontinue-toggle","shuffle-toggle","mental-shuffle-toggle",
        "topic-search","unlimited-toggle","mcq-toggle",
        "question-area","topic-grid","current-topic","answer-results","expected-format",
        "timer-display","score-display","mental-progress-bar","preview","math-toolbar",
        "custom-context-menu","leaderboard-content","statistics-panel","accuracy-stat",
        "avg-time-stat","mcq-choices-container",
        "settings-modal","shortcuts-modal","onboarding-overlay","print-modal",
        "weak-topics-modal","data-modal",
        "settings-theme","settings-default-mode","settings-auto-continue","settings-shuffle",
        "settings-scope","settings-difficulty","settings-timer","settings-max-questions",
        "settings-font","settings-perf-master","settings-perf-wave","settings-perf-blur",
        "settings-perf-preview","settings-perf-animations","settings-fps-cap",
        "settings-notifications","settings-auto-check-delay","settings-decimal-places",
        "settings-sound","settings-vibration","settings-mcq-choices","settings-adaptive",
        "mental-controls","single-controls","leaderboard-card","settings-basic","settings-advanced"
    ];
    for(let id of elementIds){
        let el=document.createElement("div");
        el.id=id;
        elements.set(id,el);
    }
    vi.spyOn(document,"getElementById").mockImplementation((id: string)=>{
        return elements.get(id)||null;
    });
    vi.spyOn(document,"querySelector").mockImplementation((selector: string)=>{
        if(selector===".answer-card"){
            let el=document.createElement("div");
            el.className="answer-card";
            return el;
        }
        return null;
    });
}
export function createMockQuestionArea(): HTMLDivElement{
    let area=document.createElement("div");
    area.id="question-area";
    return area;
}
export function createMockRenderer(): any{
    return{
        render:vi.fn(),
        applyQuestionDto:vi.fn(),
        setExpectedFormat:vi.fn(),
        typeset:vi.fn().mockResolvedValue(undefined),
        clear:vi.fn(),
        setAnswer:vi.fn(),
        setHasQuestion:vi.fn()
    };
}
export function registerMockTopics(): void{
    topicRegistry.registerTopic("test_topic","algebra","testGenerator");
}