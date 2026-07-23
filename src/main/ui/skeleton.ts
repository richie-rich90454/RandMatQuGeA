import{dom}from"../core/domRegistry";
let skeletonActive: boolean=false;
export function showQuestionSkeleton(): void{
    let area=dom.displays.questionArea;
    if(!area)return;
    skeletonActive=true;
    area.innerHTML="<div class=\"skeleton-container\">" +
        "<div class=\"skeleton-title\"></div>" +
        "<div class=\"skeleton-line skeleton-line-long\"></div>" +
        "<div class=\"skeleton-line skeleton-line-medium\"></div>" +
        "<div class=\"skeleton-line skeleton-line-short\"></div>" +
        "<div class=\"skeleton-block\"></div>" +
        "</div>";
    area.classList.add("skeleton-active");
}
export function hideQuestionSkeleton(): void{
    if(!skeletonActive)return;
    let area=dom.displays.questionArea;
    if(area){
        area.classList.remove("skeleton-active");
    }
    skeletonActive=false;
}
export function isSkeletonActive(): boolean{
    return skeletonActive;
}