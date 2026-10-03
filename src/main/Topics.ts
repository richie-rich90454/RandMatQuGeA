import{dom}from"./core/DomRegistry";
import{appState}from"./core/StateStore";
import * as ui from"./Ui";
import{topics,scopeTopics}from"./Constants";
import type{Topic}from"../types/global";
/** The category value that means "do not narrow by category". */
const ALL_CATEGORIES="all";
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
 * The categories in the order the topic list first mentions them, and the topics
 * in each. Derived from `topics` rather than declared beside it, because a second
 * list of the categories would be a second place a topic's category could be
 * written down and the two would eventually disagree.
 */
let categoryOrder: string[]=[];
let topicsByCategory: Map<string, Topic[]>=new Map();
/** The heading element for each category, so a group is hidden by one class toggle. */
let headingElements: Map<string, HTMLElement>=new Map();
/** The category chip for each category, so the active chip is never searched for. */
let chipElements: Map<string, HTMLButtonElement>=new Map();
/** Lower-cased searchable text per topic id: its name, its id and its category. */
let searchTextById: Map<string, string>=new Map();
/**
 * Builds the id indexes once. The topic list and the scope lists are static, so
 * indexing them at module load turns every later lookup into a single map read
 * instead of a scan, which is what made a keystroke in the topic search scale
 * with the length of both lists. The category index is built here for the same
 * reason: a filter that grouped the grid by scanning all 204 topics on every
 * keystroke would be slower than the thing it is meant to make easier.
 */
function buildIndexes(): void{
    if (topicById.size>0) return;
    for(let topic of topics){
        topicById.set(topic.id, topic);
        let category=topic.category;
        let group=topicsByCategory.get(category);
        if (!group){
            group=[];
            topicsByCategory.set(category, group);
            categoryOrder.push(category);
        }
        group.push(topic);
        // A learner who types "trig" or "geometry" is looking for a category, and
        // no topic is named after one, so the category is part of the searchable
        // text. The sub-skill names are deliberately not indexed: they are
        // internal identifiers the learner never sees, and offering a match on
        // text they cannot have read would be a result that cannot be explained.
        searchTextById.set(topic.id, `${topic.name} ${topic.id} ${category}`.toLowerCase());
    }
    for(let key of Object.keys(scopeTopics)){
        let ids=scopeTopics[key as keyof typeof scopeTopics];
        scopeSets.set(key, new Set<string>(ids));
    }
}
/**
 * Reports whether the grid is showing every category.
 *
 * An empty value, or one naming no category the topic list declares, counts as
 * showing everything. State can outlive a release that renamed a category, and a
 * filter that narrowed the grid to nothing because it did not recognise its own
 * value would leave the learner with an empty grid and no way out of it.
 *
 * @returns True when no single category has been chosen.
 */
function isAllCategories(): boolean{
    let value=appState.topicCategory;
    if (!value||value===ALL_CATEGORIES) return true;
    return !topicsByCategory.has(value);
}
/**
 * Reports whether the topic's category is the one the grid is narrowed to.
 *
 * @param topicId - The topic to test.
 * @returns True when the topic's category is the selected one.
 */
function inCategory(topicId: string): boolean{
    if (isAllCategories()) return true;
    let topic=topicById.get(topicId);
    return topic?topic.category===appState.topicCategory:false;
}
/**
 * Reports whether a topic survives the current search text, comparing against
 * the text indexed once per topic rather than lower-casing on every keystroke.
 *
 * @param topicId - The topic to test.
 * @param searchTerm - The lower-cased search text, empty when the box is clear.
 * @returns True when the topic matches, or when nothing has been typed.
 */
function matchesSearch(topicId: string, searchTerm: string): boolean{
    if (searchTerm==="") return true;
    let text=searchTextById.get(topicId);
    return text?text.includes(searchTerm):false;
}
/**
 * Builds one chip per category, once. The counts and the pressed state are
 * updated on every render rather than rebuilt, because this runs on the search
 * path and a keystroke should not throw away and recreate eight buttons.
 */
function ensureCategoryChips(): void{
    let container=dom.displays.topicCategoryFilter;
    if (!container||chipElements.size>0) return;
    container.innerHTML="";
    let addChip=(value: string, label: string):void=>{
        let chip=document.createElement("button");
        chip.type="button";
        chip.className="topic-chip";
        chip.dataset.category=value;
        chip.textContent=label;
        container.appendChild(chip);
        chipElements.set(value, chip);
    };
    // The filter value is "all" and the label is "All": the value is what a stale
    // state or a test reads back, and it never appears on screen.
    addChip(ALL_CATEGORIES, "All");
    for(let category of categoryOrder){
        addChip(category, category);
    }
    // One delegated handler on the row, which outlives the chips inside it. Each
    // chip therefore never needs a listener of its own, and rebuilding a chip
    // cannot leave a second handler attached to it.
    container.addEventListener("click",(event: Event)=>{
        let target=event.target as HTMLElement|null;
        let category=target?.dataset.category;
        if (!category) return;
        appState.topicCategory=category;
        renderTopicGrid();
    });
}
/**
 * Writes the in-scope count onto each chip and marks the chosen one. The counts
 * are what make the filter usable at 204 topics: without them there is no way to
 * tell which category is worth opening, and "Linear Algebra 22" is a different
 * decision from "Calculus 19".
 *
 * @param allowed - The topic ids the current scope permits.
 */
function updateCategoryChips(allowed: Set<string>): void{
    ensureCategoryChips();
    for(let [value, chip] of chipElements){
        let count=0;
        if (value===ALL_CATEGORIES) count=allowed.size;
        else{
            for(let topic of topicsByCategory.get(value)||[]){
                if (allowed.has(topic.id)) count++;
            }
        }
        let label=value===ALL_CATEGORIES?"All":value;
        // The count is printed even when it is zero: a category showing "Algebra 0"
        // tells the learner the category exists and that this scope has none of
        // it, which is a different message from a category that is simply absent.
        chip.textContent=`${label} ${count}`;
        let selected=value===appState.topicCategory;
        chip.setAttribute("aria-pressed", selected?"true":"false");
        chip.classList.toggle("active", selected);
        chip.classList.toggle("empty", count===0);
    }
}
/**
 * Creates the pills and the category headings, once. A heading is a direct child
 * of the grid and forces a line break, so the grid stays a flat list of children
 * that the registry can walk without a document-wide search.
 */
function buildGridContent(): void{
    let grid=dom.displays.topicGrid;
    if (!grid) return;
    for(let category of categoryOrder){
        let heading=document.createElement("div");
        heading.className="topic-group-heading";
        heading.textContent=category;
        grid.appendChild(heading);
        headingElements.set(category, heading);
        for(let topic of topicsByCategory.get(category)||[]){
            let topicElement=document.createElement("button");
            topicElement.className="topic-pill";
            topicElement.dataset.topicId=topic.id;
            topicElement.innerHTML=`
      <span class="topic-pill-icon">${topic.icon}</span>
      <span class="topic-pill-name">${topic.name}</span>
    `;
            topicElement.addEventListener("click",()=>selectTopic(topic.id));
            topicElements.set(topic.id, topicElement);
            grid.appendChild(topicElement);
        }
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
    let chips=dom.displays.topicCategoryFilter;
    if(chips)chips.innerHTML="";
    gridInitialized=false;
    topicElements.clear();
    headingElements.clear();
    chipElements.clear();
    activeElement=null;
}
export function renderTopicGrid(): void{
    buildIndexes();
    if (!dom.displays.topicGrid) return;
    let scope=currentScope();
    let allowed=scopeSets.get(scope)||scopeSets.get("simple")||new Set<string>();
    let searchTerm=(dom.inputs.topicSearch?.value||"").toLowerCase().trim();
    updateCategoryChips(allowed);
    if (!gridInitialized){
        buildGridContent();
        gridInitialized=true;
    }
    // Grouped by category only helps while every category is on screen. With one
    // category chosen the chip already says which, and a heading repeating it
    // would spend a line of a container that fits about eight rows on a phone.
    let grouped=isAllCategories();
    let visibleByCategory: Map<string, number>=new Map();
    let visible=0;
    for(let [id, element] of topicElements){
        let topic=topicById.get(id);
        let show=allowed.has(id)&&inCategory(id)&&matchesSearch(id, searchTerm);
        element.classList.toggle("hidden", !show);
        if (!show||!topic) continue;
        visible++;
        let n=(visibleByCategory.get(topic.category)||0)+1;
        visibleByCategory.set(topic.category, n);
    }
    for(let [category, heading] of headingElements){
        let n=visibleByCategory.get(category)||0;
        heading.classList.toggle("hidden", !grouped||n===0);
    }
    if (dom.displays.topicCount){
        // "N of M" rather than a bare N, because a learner who has just narrowed
        // the grid needs to see how much is still behind the filter, and because a
        // bare count cannot distinguish an empty result from a narrow scope.
        let suffix=grouped?"topics":"topics in "+appState.topicCategory;
        dom.displays.topicCount.textContent=`${visible} of ${allowed.size} ${suffix}`;
    }
    let selected=appState.selectedTopic;
    if (selected){
        // A selected topic the filter has hidden must not stay selected: the
        // learner would press Generate and be answered by a topic whose pill they
        // can no longer see.
        let stillVisible=allowed.has(selected)&&inCategory(selected)&&matchesSearch(selected, searchTerm);
        if (!stillVisible) clearSelection();
        else setActive(topicElements.get(selected)||null);
    }
    if (!appState.selectedTopic&&searchTerm===""&&grouped){
        let first=topicById.get(firstVisibleId());
        if (first) selectTopic(first.id);
    }
}
/**
 * Returns the id of the first topic the current scope, category and search allow,
 * or an empty string when nothing is visible.
 *
 * The three conditions are the three the render uses. Keeping them in one
 * function is what stops the auto-selection from choosing a topic the learner
 * cannot see, which is exactly what happens when the category is dropped from the
 * condition guarding the call.
 *
 * @returns A topic id, or an empty string.
 */
function firstVisibleId(): string{
    let allowed=scopeSets.get(currentScope())||scopeSets.get("simple")||new Set<string>();
    let searchTerm=(dom.inputs.topicSearch?.value||"").toLowerCase().trim();
    for(let topic of topics){
        if (allowed.has(topic.id)&&inCategory(topic.id)&&matchesSearch(topic.id, searchTerm)) return topic.id;
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

/**
 * Returns the topic ids in a scope, in the order the constants declare them. The
 * daily set needs a stable order so that the same date produces the same set on
 * every device, and a set or a sorted copy would not be that order.
 *
 * @param scope - The scope name.
 * @returns The topic ids, which may be empty for an unknown scope.
 */
export function scopeTopicIds(scope: string): string[]{
    let ids=scopeTopics[scope as keyof typeof scopeTopics]||scopeTopics.simple;
    return ids.slice();
}
