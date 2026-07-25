import{invoke}from"@tauri-apps/api/core";
import{selectTopic}from"./Topics";
import{topics}from"./Constants";
import{generateQuestion}from"./Generation";
import*as settings from"./Settings";
import*as ui from"./Ui";
import {appState} from"./core/StateStore";
let weakTopicsModal:HTMLElement|null=null;
let weakTopicsList:HTMLElement|null=null;
export async function checkAndShowWeakTopicsPopup(){
    if(!settings.settings.showWeakTopicsPopup)return;
    try{
        let weakTopics=await invoke("get_weak_topics",{limit:5})as Array<{topic_id:string,accuracy:number,attempts:number}>;
        if(!weakTopics||weakTopics.length===0){ui.showNotification("No weak topics yet — answer more questions to get recommendations.","info");return;}
        weakTopicsModal=document.getElementById("weak-topics-modal");
        weakTopicsList=document.getElementById("weak-topics-list");
        if(!weakTopicsModal||!weakTopicsList)return;
        weakTopicsList.innerHTML="";
        for(const topic of weakTopics){
            let topicName=topics.find((t:{id:string,name:string})=>t.id===topic.topic_id)?.name||topic.topic_id;
            let accuracyPercent=Math.round(topic.accuracy*100);
            let item=document.createElement("div");
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
        let dismissBtn=document.getElementById("weak-topics-dismiss");
        if(dismissBtn)dismissBtn.onclick=()=>weakTopicsModal?.classList.remove("show");
        let practiceAllBtn=document.getElementById("weak-topics-practice-all");
        if(practiceAllBtn){
            practiceAllBtn.onclick=()=>{
                if(weakTopics.length>0){
                    appState.weakTopicQueue=weakTopics.map((t:{topic_id:string,accuracy:number,attempts:number})=>t.topic_id);
                    let firstTopic=appState.weakTopicQueue.shift();
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