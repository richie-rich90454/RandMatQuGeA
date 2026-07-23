import{dom}from"../core/domRegistry";
let skeletonActive: boolean=false;
let lastSkeletonTime: number=0;
const MIN_SKELETON_DURATION: number=200;
export function showQuestionSkeleton(): void{
    let area=dom.displays.questionArea;
    if(!area)return;
    skeletonActive=true;
    lastSkeletonTime=Date.now();
    area.innerHTML="<div class=\"skeleton-container\">" +
        "<div class=\"skeleton-title\"></div>" +
        "<div class=\"skeleton-line skeleton-line-long\"></div>" +
        "<div class=\"skeleton-line skeleton-line-medium\"></div>" +
        "<div class=\"skeleton-line skeleton-line-short\"></div>" +
        "<div class=\"skeleton-block\"></div>" +
        "</div>";
    if(area.classList) area.classList.add("skeleton-active");
}
export function hideQuestionSkeleton(): void{
    if(!skeletonActive)return;
    let elapsed=Date.now()-lastSkeletonTime;
    if(elapsed<MIN_SKELETON_DURATION){
        setTimeout(()=>hideQuestionSkeleton(),MIN_SKELETON_DURATION-elapsed);
        return;
    }
    let area=dom.displays.questionArea;
    if(area){
        if(area.classList) area.classList.remove("skeleton-active");
    }
    skeletonActive=false;
}
export function isSkeletonActive(): boolean{
    return skeletonActive;
}
export function getLastSkeletonTime(): number{
    return lastSkeletonTime;
}