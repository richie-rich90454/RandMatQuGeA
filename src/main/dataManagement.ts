/**
 * @file dataManagement.ts - Handles viewing, deleting, and resetting performance records.
 * @date 2026-04-12
 * @description Provides a modal to list all user_topic_stats entries with delete buttons for each,
 * a delete all button, and a hard reset button that clears all scores and performance data.
 */
import {invoke} from"@tauri-apps/api/core";
import {topics} from"./constants";
import*as ui from"./ui";
import {updateLeaderboard} from "./session";
let modal:HTMLElement|null=null;
let dataList:HTMLElement|null=null;
export async function openDataModal(){
    modal=document.getElementById("data-modal");
    if(!modal)return;
    dataList=document.getElementById("data-list");
    await loadData();
    modal.classList.add("show");
}
async function loadData(){
    if(!dataList)return;
    try{
        const stats=await invoke("get_performance_stats",{difficulty:null,days:null})as Array<any>;
        if(!stats||stats.length===0){
            dataList.innerHTML="<p>No performance data yet. Answer some questions first.</p>";
            return;
        }
        dataList.innerHTML="";
        for(const s of stats){
            const topicName=topics.find(t=>t.id===s.topic_id)?.name||s.topic_id;
            const acc=isFinite(s.accuracy)?(s.accuracy*100).toFixed(1):"0.0";
            const div=document.createElement("div");
            div.className="data-item";
            div.innerHTML=`
                <div class="data-info">
                    <strong>${topicName}</strong> (${s.difficulty})<br>
                    Accuracy: ${acc}% | Attempts: ${s.attempts} | Avg time: ${Math.round(s.avg_time_ms)}ms
                </div>
                <button class="secondary-button delete-record" data-topic="${s.topic_id}" data-diff="${s.difficulty}">Delete</button>
            `;
            dataList.appendChild(div);
        }
        attachDeleteEvents();
        const deleteAllBtn=document.getElementById("delete-all-btn");
        if(deleteAllBtn){
            deleteAllBtn.onclick=async()=>{
                if(confirm("Delete ALL performance data? This cannot be undone.")){
                    for(const s of stats){
                        await invoke("delete_performance_record",{topicId:s.topic_id,difficulty:s.difficulty});
                    }
                    ui.showNotification("All performance data deleted.","info");
                    await loadData();
                    updateLeaderboard();
                }
            };
        }
        const resetAllBtn=document.getElementById("reset-all-btn");
        if(resetAllBtn){
            resetAllBtn.onclick=async()=>{
                if(confirm("HARD RESET: This will delete ALL scores and performance data. This cannot be undone. Are you sure?")){
                    await invoke("reset_all_data");
                    ui.showNotification("All data has been reset.","info");
                    await loadData();
                    updateLeaderboard();
                }
            };
        }
    }
    catch(err){
        console.error("Failed to load stats:",err);
        dataList.innerHTML=`<p style="color:var(--error);">Error loading data: ${err}</p>`;
    }
}
function attachDeleteEvents(){
    document.querySelectorAll(".delete-record").forEach(btn=>{
        btn.addEventListener("click",async(e)=>{
            const topic=(e.currentTarget as HTMLElement).getAttribute("data-topic");
            const diff=(e.currentTarget as HTMLElement).getAttribute("data-diff");
            if(topic&&diff&&confirm(`Delete all records for ${topic} (${diff})?`)){
                await invoke("delete_performance_record",{topicId:topic,difficulty:diff});
                ui.showNotification(`Deleted ${topic} (${diff})`,"info");
                await loadData();
            }
        });
    });
}
export function initDataModal(){
    modal=document.getElementById("data-modal");
    if(!modal)return;
    const closeBtn=document.getElementById("data-close");
    const refreshBtn=document.getElementById("data-refresh");
    if(closeBtn)closeBtn.onclick=()=>modal?.classList.remove("show");
    if(refreshBtn)refreshBtn.onclick=loadData;
}