import {dom}from"../core/domRegistry";
export interface EventBinding{
    selector: string;
    event: string;
    handler: (e: Event)=>void;
    scope?: "document"|"window";
}
export function bindEvents(bindings: EventBinding[]): void{
    for(let i=0;i<bindings.length;i++){
        let binding=bindings[i];
        if(binding.scope==="document"){
            document.addEventListener(binding.event,binding.handler);
            continue;
        }
        if(binding.scope==="window"){
            window.addEventListener(binding.event,binding.handler);
            continue;
        }
        let element=dom.getElement(binding.selector);
        if(element===null){
            console.warn("Element not found for selector: "+binding.selector);
            continue;
        }
        element.addEventListener(binding.event,binding.handler);
    }
}