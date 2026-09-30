import{dom}from"./core/DomRegistry";
import{appState}from"./core/StateStore";
import * as ui from"./Ui";
import{topics,scopeTopics}from"./Constants";
import type{Topic}from"../types/global";
let gridInitialized=false;
/** Every pill element, by topic id, so no interaction path has to search the DOM. */
let topicElements: Map<string, HTMLButtonElement>=new Map();
/** Every topic, by id, so a selection does not scan the topic list. */
let topicById: Map<string, Topic>=new Map();
/** The scope lists as sets, so filtering is a lookup per topic rather than a scan. */
let scopeSets: Map<string, Set<string>>=new Map();
/** The one pill that carries the active class, so it never has to be searched for. */
let activeElement: HTMLButtonElement|null=null;
/**
 * Builds the id indexes once. The topic list and the scope lists are static, so
 * indexing them at module load turns every later lookup into a single map read
 * instead of a scan, which is what made a keystroke in the topic search scale
 * with the length of both lists.
 */
function buildIndexes(): void{
    if (topicById.size>0) return;
    for(let topic of topics){
        topicById.set(topic.id, topic);
    }
    for(let key of Object.keys(scopeTopics)){
        let ids=scopeTopics[key as keyof typeof scopeTopics];
        scopeSets.set(key, new Set<string>(ids));
    }
}
/**
 * Reports whether a topic is in a scope, without scanning the scope list.
 *
 * @param scope - The scope name.
 * @param topicId - The topic to test.
 * @returns True when the topic belongs to the scope.
 */
function inScope(scope: string, topicId: string): boolean{
    let set=scopeSets.get(scope);
    return set?set.has(topicId):false;
}
/**
 * Reports whether the mode's current scope has any topic at all.
 *
 * @returns The scope name in effect.
 */
function currentScope(): string{
    return appState.currentMode==="single"?appState.scope:appState.mentalScope;
}
/**
 * Moves the active class onto one pill, clearing it from whichever pill had it.
 * Tracking the element directly is what removes the repeated full-document
 * query from every selection.
 *
 * @param element - The pill to mark active, or null to clear the mark.
 */
function setActive(element: HTMLButtonElement|null): void{
    if (activeElement===element) return;
    if (activeElement) activeElement.classList.remove("active");
    activeElement=element;
    if (activeElement) activeElement.classList.add("active");
}
/**
 * Clears the selection and tells the user there is nothing selected.
 */
function clearSelection(): void{
    appState.selectedTopic=null;
    setActive(null);
    if (dom.displays.currentTopicDisplay){
        dom.displays.currentTopicDisplay.textContent="Select a topic to begin";
    }
    if (dom.buttons.generateQuestionButton){
        dom.buttons.generateQuestionButton.disabled=true;
        dom.buttons.generateQuestionButton.setAttribute("aria-disabled","true");
    }
}
export function resetTopicGrid(): void{
    let grid=dom.displays.topicGrid;
    if(grid)grid.innerHTML="";
    gridInitialized=false;
    topicElements.clear();
    activeElement=null;
}
export function renderTopicGrid(): void{
    buildIndexes();
    if (!dom.displays.topicGrid) return;
    let scope=currentScope();
    let allowed=scopeSets.get(scope)||scopeSets.get("simple")||new Set<string>();
    let searchTerm=(dom.inputs.topicSearch?.value||"").toLowerCase().trim();
    if (!gridInitialized){
        for(let topic of topics){
            let topicElement=document.createElement("button");
            topicElement.className="topic-pill";
            topicElement.dataset.topicId=topic.id;
            topicElement.innerHTML=`
      <span class="topic-pill-icon">${topic.icon}</span>
      <span class="topic-pill-name">${topic.name}</span>
    `;
            topicElement.addEventListener("click",()=>selectTopic(topic.id));
            topicElements.set(topic.id, topicElement);
            dom.displays.topicGrid!.appendChild(topicElement);
        }
        gridInitialized=true;
    }
    for(let [id, element] of topicElements){
        let topic=topicById.get(id);
        let visible=allowed.has(id)
            && (!searchTerm
                || (topic?topic.name.toLowerCase().includes(searchTerm):false)
                || id.includes(searchTerm));
        element.classList.toggle("hidden", !visible);
    }
    if (appState.selectedTopic&&!allowed.has(appState.selectedTopic)){
        appState.selectedTopic=null;
        setActive(null);
        if (dom.displays.currentTopicDisplay){
            dom.displays.currentTopicDisplay.textContent="Select a topic to begin";
        }
        if (dom.buttons.generateQuestionButton){
            dom.buttons.generateQuestionButton.disabled=true;
            dom.buttons.generateQuestionButton.setAttribute("aria-disabled","true");
        }
    }
    if (appState.selectedTopic){
        setActive(topicElements.get(appState.selectedTopic)||null);
    }
    else if (!searchTerm){
        let first=topicById.get(firstVisibleId());
        if (first) selectTopic(first.id);
    }
}
/**
 * Returns the id of the first topic the current scope and search allow, or an
 * empty string when nothing is visible.
 *
 * @returns A topic id, or an empty string.
 */
function firstVisibleId(): string{
    let scope=currentScope();
    let allowed=scopeSets.get(scope)||scopeSets.get("simple")||new Set<string>();
    for(let topic of topics){
        if (allowed.has(topic.id)) return topic.id;
    }
    return "";
}
export function selectTopic(topicId: string): void{
    buildIndexes();
    if (appState.selectedTopic===topicId){
        clearSelection();
        ui.updateUIState();
        return;
    }
    setActive(topicElements.get(topicId)||null);
    appState.selectedTopic=topicId;
    let topic=topicById.get(topicId);
    if (dom.displays.currentTopicDisplay){
        dom.displays.currentTopicDisplay.textContent=topic?topic.name:"Select a topic to begin";
    }
    if (dom.buttons.generateQuestionButton){
        dom.buttons.generateQuestionButton.disabled=false;
        dom.buttons.generateQuestionButton.setAttribute("aria-disabled","false");
    }
    ui.updateUIState();
}
export function pickRandomTopic(): string|null{
    let scope=currentScope();
    let allowed=scopeTopics[scope as keyof typeof scopeTopics]||scopeTopics.simple;
    if (allowed.length===0) return null;
    return allowed[Math.floor(Math.random()*allowed.length)];
}
/**
 * Reports whether a topic belongs to the current scope, which the adaptive and
 * daily pickers use to stay inside what the learner has chosen to study.
 *
 * @param topicId - The topic to test.
 * @returns True when the topic is in scope.
 */
export function isTopicInScope(topicId: string): boolean{
    buildIndexes();
    return inScope(currentScope(), topicId);
}
