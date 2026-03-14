import * as dom from "./dom";
import * as state from "./state";
import * as ui from "./ui";
import {topics,scopeTopics} from "./constants";

export function renderTopicGrid(): void{
	if (!dom.topicGrid) return;
	const currentScope=state.currentMode==="single"?state.scope:state.mentalScope;
	const allowedIds=scopeTopics[currentScope as keyof typeof scopeTopics]||scopeTopics.simple;
	const filteredTopics=topics.filter(t=>allowedIds.includes(t.id));
	const searchTerm=dom.topicSearch?.value.toLowerCase().trim()||"";
	const displayedTopics=searchTerm?filteredTopics.filter(t=>t.name.toLowerCase().includes(searchTerm)||t.id.toLowerCase().includes(searchTerm)):filteredTopics;
	dom.topicGrid.innerHTML="";
	displayedTopics.forEach(topic=>{
		let topicElement=document.createElement("button");
		topicElement.className="topic-pill";
		topicElement.dataset.topicId=topic.id;
		topicElement.innerHTML=`
      <span class="topic-pill-icon">${topic.icon}</span>
      <span class="topic-pill-name">${topic.name}</span>
    `;
		topicElement.addEventListener("click",()=>selectTopic(topic.id));
		dom.topicGrid!.appendChild(topicElement);
	});
	if (state.selectedTopic&&!allowedIds.includes(state.selectedTopic)){
		if (displayedTopics.length>0){
			selectTopic(displayedTopics[0].id);
		}
		else{
			state.setSelectedTopic(null);
			if (dom.currentTopicDisplay) dom.currentTopicDisplay.textContent="Select a topic";
		}
	}
	else if (!state.selectedTopic&&displayedTopics.length>0){
		selectTopic(displayedTopics[0].id);
	}
	else if (state.selectedTopic){
		document.querySelectorAll(".topic-pill").forEach(item=>{
			item.classList.remove("active");
		});
		let selectedElement=document.querySelector(`[data-topic-id="${state.selectedTopic}"]`);
		if (selectedElement) selectedElement.classList.add("active");
	}
}
export function selectTopic(topicId: string): void{
	document.querySelectorAll(".topic-pill").forEach(item=>{
		item.classList.remove("active");
	});
	let selectedElement=document.querySelector(`[data-topic-id="${topicId}"]`);
	if (selectedElement){
		selectedElement.classList.add("active");
	}
	state.setSelectedTopic(topicId);
	let topic=topics.find(t=>t.id===topicId);
	if (dom.currentTopicDisplay){
		dom.currentTopicDisplay.textContent=topic?topic.name:"Select a topic to begin";
	}
	if (dom.generateQuestionButton){
		dom.generateQuestionButton.disabled=false;
		dom.generateQuestionButton.setAttribute("aria-disabled","false");
	}
	ui.updateUIState();
}
export function pickRandomTopic(): string|null{
	const currentScope=state.currentMode==="single"?state.scope:state.mentalScope;
	const allowedIds=scopeTopics[currentScope as keyof typeof scopeTopics]||scopeTopics.simple;
	if (allowedIds.length===0) return null;
	return allowedIds[Math.floor(Math.random()*allowedIds.length)];
}