/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
let mockElement: HTMLButtonElement|null=null;
vi.mock("./core/domRegistry",()=>{
    return{
        dom:{
            queryElement:vi.fn((selector: string)=>{
                if(selector==="#test-btn"){
                    if(!mockElement){
                        mockElement=document.createElement("button");
                        mockElement.id="test-btn";
                        document.body.appendChild(mockElement);
                    }
                    return mockElement;
                }
                return null;
            })
        }
    };
});
import{bindEvents,type EventBinding}from"./services/eventBinder";
describe("EventBinding",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
        if(mockElement&&mockElement.parentNode){
            mockElement.parentNode.removeChild(mockElement);
        }
        mockElement=null;
    });
    it("should bind events to existing elements",()=>{
        let handler=vi.fn();
        let bindings: EventBinding[]=[
            {selector:"#test-btn",event:"click",handler}
        ];
        bindEvents(bindings);
        if(mockElement) mockElement.click();
        expect(handler).toHaveBeenCalled();
    });
    it("should skip null elements with debug warning",()=>{
        let consoleSpy=vi.spyOn(console,"debug").mockImplementation(()=>{});
        let handler=vi.fn();
        let bindings: EventBinding[]=[
            {selector:"#nonexistent",event:"click",handler}
        ];
        bindEvents(bindings);
        expect(consoleSpy).toHaveBeenCalledWith("bindEvents: element not found for selector:","#nonexistent");
        consoleSpy.mockRestore();
    });
    it("should bind document-level events",()=>{
        let handler=vi.fn();
        let bindings: EventBinding[]=[
            {selector:"",event:"keydown",handler,scope:"document"}
        ];
        bindEvents(bindings);
        let event=new KeyboardEvent("keydown",{key:"Enter"});
        document.dispatchEvent(event);
        expect(handler).toHaveBeenCalled();
    });
    it("should bind window-level events",()=>{
        let handler=vi.fn();
        let bindings: EventBinding[]=[
            {selector:"",event:"resize",handler,scope:"window"}
        ];
        bindEvents(bindings);
        let event=new Event("resize");
        window.dispatchEvent(event);
        expect(handler).toHaveBeenCalled();
    });
});