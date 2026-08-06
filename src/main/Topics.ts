import{dom}from"./core/DomRegistry";
import{appState}from"./core/StateStore";
import * as ui from"./Ui";
import{topics,scopeTopics}from"./Constants";
let gridInitialized=false;
let topicElements: Map<string, HTMLButtonElement>=new Map();
export function resetTopicGrid(): void{
	let grid=dom.displays.topicGrid;
	if(grid)grid.innerHTML="";
	gridInitialized=false;
	topicElements.clear();
}
export function renderTopicGrid(): void{
	if (!dom.displays.topicGrid) return;
	let currentScope=appState.currentMode==="single"?appState.scope:appState.mentalScope;
	let allowedIds=scopeTopics[currentScope as keyof typeof scopeTopics]||scopeTopics.simple;
	let filteredTopics=topics.filter(t=>allowedIds.includes(t.id));
	let searchTerm=dom.inputs.topicSearch?.value.toLowerCase().trim()||"";
	let displayedTopics=searchTerm?filteredTopics.filter(t=>t.name.toLowerCase().includes(searchTerm)||t.id.toLowerCase().includes(searchTerm)):filteredTopics;
	if (!gridInitialized){
		topics.forEach(topic=>{
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
		});
		gridInitialized=true;
	}
	let displayedIds=new Set(displayedTopics.map(t=>t.id));
	topicElements.forEach((element, id)=>{
		element.classList.toggle("hidden", !displayedIds.has(id));
	});
	if (appState.selectedTopic&&!displayedIds.has(appState.selectedTopic)){
		appState.selectedTopic=null;
		document.querySelectorAll("[data-topic-id].active").forEach(el=>el.classList.remove("active"));
		if (dom.displays.currentTopicDisplay){
			dom.displays.currentTopicDisplay.textContent="Select a topic to begin";
		}
		if (dom.buttons.generateQuestionButton){
			dom.buttons.generateQuestionButton.disabled=true;
			dom.buttons.generateQuestionButton.setAttribute("aria-disabled","true");
		}
	}
	if (appState.selectedTopic&&!allowedIds.includes(appState.selectedTopic)){
		if (displayedTopics.length>0){
			selectTopic(displayedTopics[0].id);
		}
		else{
			appState.selectedTopic=null;
			if (dom.displays.currentTopicDisplay) dom.displays.currentTopicDisplay.textContent="Select a topic";
		}
	}
	else if (!appState.selectedTopic&&displayedTopics.length>0&&!searchTerm){
		selectTopic(displayedTopics[0].id);
	}
	else if (appState.selectedTopic){
		document.querySelectorAll(".topic-pill").forEach(item=>{
			item.classList.remove("active");
		});
		let selectedElement=document.querySelector(`[data-topic-id="${appState.selectedTopic}"]`);
		if (selectedElement) selectedElement.classList.add("active");
	}
}
export function selectTopic(topicId: string): void{
	if (appState.selectedTopic===topicId){
		appState.selectedTopic=null;
		document.querySelectorAll("[data-topic-id].active").forEach(el=>el.classList.remove("active"));
		if (dom.displays.currentTopicDisplay){
			dom.displays.currentTopicDisplay.textContent="Select a topic to begin";
		}
		if (dom.buttons.generateQuestionButton){
			dom.buttons.generateQuestionButton.disabled=true;
			dom.buttons.generateQuestionButton.setAttribute("aria-disabled","true");
		}
		ui.updateUIState();
		return;
	}
	document.querySelectorAll(".topic-pill").forEach(item=>{
		item.classList.remove("active");
	});
	let selectedElement=document.querySelector(`[data-topic-id="${topicId}"]`);
	if (selectedElement){
		selectedElement.classList.add("active");
	}
	appState.selectedTopic=topicId;
	let topic=topics.find(t=>t.id===topicId);
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
	let currentScope=appState.currentMode==="single"?appState.scope:appState.mentalScope;
	let allowedIds=scopeTopics[currentScope as keyof typeof scopeTopics]||scopeTopics.simple;
	if (allowedIds.length===0) return null;
	return allowedIds[Math.floor(Math.random()*allowedIds.length)];
}