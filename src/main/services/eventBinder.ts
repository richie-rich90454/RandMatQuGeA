import{dom}from"../core/domRegistry";
export interface EventBinding{
	selector: string;
	event: string;
	handler: (e: Event)=>void;
	scope?: "document"|"window";
}
export function bindEvents(bindings: EventBinding[]): void{
	for(let binding of bindings){
		if(binding.scope==="document"){
			document.addEventListener(binding.event,binding.handler);
			continue;
		}
		if(binding.scope==="window"){
			window.addEventListener(binding.event,binding.handler);
			continue;
		}
		let el=dom.queryElement(binding.selector);
		if(!el){
			console.debug("bindEvents: element not found for selector:",binding.selector);
			continue;
		}
		el.addEventListener(binding.event,binding.handler);
	}
}
export function countBindings(bindings: EventBinding[]): number{
	return bindings.length;
}