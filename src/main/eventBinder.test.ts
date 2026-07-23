/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
vi.mock("./core/domRegistry",()=>({
    dom:{
        queryElement:vi.fn((selector: string)=>{
            if(selector==="#test-btn"){
                let el=document.createElement("button");
                el.id="test-btn";
                return el;
            }
            return null;
        })
    }
}));
import{bindEvents,type EventBinding}from"./services/eventBinder";
describe("EventBinding",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
    });
    it("should bind events to existing elements",()=>{
        let handler=vi.fn();
        let bindings: EventBinding[]=[
            {selector:"#test-btn",event:"click",handler}
        ];
        bindEvents(bindings);
        let btn=document.getElementById("test-btn")||document.createElement("button");
        btn.id="test-btn";
        document.body.appendChild(btn);
        btn.click();
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