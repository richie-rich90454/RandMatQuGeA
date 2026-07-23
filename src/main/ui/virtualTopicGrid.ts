import{dom}from"../core/domRegistry";
let container: HTMLElement|null=null;
let visibleStart: number=0;
let visibleEnd: number=0;
let itemHeight: number=40;
let overscan: number=5;
let allElements: HTMLElement[]=[];
export function initVirtualGrid(itemElements: HTMLElement[]): void{
    if(!itemElements||itemElements.length===0)return;
    allElements=itemElements;
    container=dom.displays.topicGrid;
    if(!container)return;
    container.innerHTML="";
    updateVisibleRange();
    renderVisibleItems();
    if(container){
        container.addEventListener("scroll",()=>{
            updateVisibleRange();
            renderVisibleItems();
        });
    }
}
function updateVisibleRange(): void{
    if(!container||allElements.length===0)return;
    let scrollTop=container.scrollTop;
    let viewportHeight=container.clientHeight;
    visibleStart=Math.max(0,Math.floor(scrollTop/itemHeight)-overscan);
    visibleEnd=Math.min(allElements.length-1,Math.ceil((scrollTop+viewportHeight)/itemHeight)+overscan);
}
function renderVisibleItems(): void{
    if(!container)return;
    let fragment=document.createDocumentFragment();
    for(let i=visibleStart;i<=visibleEnd&&i<allElements.length;i++){
        fragment.appendChild(allElements[i]);
    }
    container.innerHTML="";
    container.appendChild(fragment);
}
export function refreshVirtualGrid(): void{
    updateVisibleRange();
    renderVisibleItems();
}