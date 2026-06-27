/**
 * @file weakTopics.ts - Shows popup with weak topics based on performance data.
 * @date 2026-04-12
 * @description Fetches weak topics from backend and displays a modal with practice buttons.
 * Now triggered manually by the user via the "Recommend Topics" button.
 */
import {invoke} from"@tauri-apps/api/core";
import {selectTopic} from"./topics";
import {topics} from"./constants";
import {generateQuestion} from"./generation";
import*as settings from"./settings";
import*as ui from"./ui";
import {appState} from"./core/stateStore";
let weakTopicsModal:HTMLElement|null=null;
let weakTopicsList:HTMLElement|null=null;
export async function checkAndShowWeakTopicsPopup(){
    if(!settings.settings.showWeakTopicsPopup)return;
    try{
        const weakTopics=await invoke("get_weak_topics",{limit:5})as Array<{topic_id:string,accuracy:number,attempts:number}>;
        if(!weakTopics||weakTopics.length===0){ui.showNotification("No weak topics yet — answer more questions to get recommendations.","info");return;}
        const weak=weakTopics.filter((t:{topic_id:string,accuracy:number,attempts:number})=>t.accuracy<0.7&&t.attempts>=3);
        if(weak.length===0){ui.showNotification("No weak topics yet — answer more questions to get recommendations.","info");return;}
        weakTopicsModal=document.getElementById("weak-topics-modal");
        weakTopicsList=document.getElementById("weak-topics-list");
        if(!weakTopicsModal||!weakTopicsList)return;
        weakTopicsList.innerHTML="";
        for(const topic of weak){
            const topicName=topics.find((t:{id:string,name:string})=>t.id===topic.topic_id)?.name||topic.topic_id;
            const accuracyPercent=Math.round(topic.accuracy*100);
            const item=document.createElement("div");
            item.className="weak-topic-item";
            item.innerHTML=`
                <div class="weak-topic-info">
                    <div class="weak-topic-name">${topicName}</div>
                    <div class="weak-topic-stats">Accuracy: ${accuracyPercent}% (${topic.attempts} attempts)</div>
                </div>
                <button class="secondary-button practice-topic-btn" data-topic="${topic.topic_id}">Practice</button>
            `;
            weakTopicsList.appendChild(item);
        }
        document.querySelectorAll(".practice-topic-btn").forEach((btn:Element)=>{
            btn.addEventListener("click",(e:Event)=>{
                const topicId=(e.currentTarget as HTMLElement).getAttribute("data-topic");
                if(topicId){
                    selectTopic(topicId);
                    generateQuestion(topicId).catch((err:unknown)=>ui.showNotification("Failed to generate question: "+((err as Error)?.message||err),"warning"));
                    weakTopicsModal?.classList.remove("show");
                }
            });
        });
        const dismissBtn=document.getElementById("weak-topics-dismiss");
        if(dismissBtn)dismissBtn.onclick=()=>weakTopicsModal?.classList.remove("show");
        const practiceAllBtn=document.getElementById("weak-topics-practice-all");
        if(practiceAllBtn){
            practiceAllBtn.onclick=()=>{
                if(weak.length>0){
                    appState.weakTopicQueue=weak.map((t:{topic_id:string,accuracy:number,attempts:number})=>t.topic_id);
                    const firstTopic=appState.weakTopicQueue.shift();
                    if(firstTopic){
                        selectTopic(firstTopic);
                        generateQuestion(firstTopic).catch((err:unknown)=>ui.showNotification("Failed to generate question: "+((err as Error)?.message||err),"warning"));
                        ui.showNotification("Practicing all weak topics — click Generate to continue through the queue.","info");
                    }
                }
                weakTopicsModal?.classList.remove("show");
            };
        }
        const closeBtn=document.getElementById("weak-topics-close");
        if(closeBtn)closeBtn.onclick=()=>weakTopicsModal?.classList.remove("show");
        weakTopicsModal.classList.add("show");
    }
    catch(e){
        console.warn("Failed to load weak topics popup:",e);
    }
}