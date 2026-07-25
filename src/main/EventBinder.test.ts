/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
const mocks=vi.hoisted(()=>{
    let mockElement=null as any;
    let mockQueryElement=vi.fn((selector: string)=>{
        if(selector==="#test-btn"){
            if(!mocks.mockElement){
                mocks.mockElement=document.createElement("button");
                mocks.mockElement.id="test-btn";
                document.body.appendChild(mocks.mockElement);
            }
            return mocks.mockElement;
        }
        return null;
    });
    return{mockElement,mockQueryElement};
});
vi.mock("./core/DomRegistry",()=>{
    return{
        dom:{
            queryElement:mocks.mockQueryElement
        }
    };
});
import{bindEvents,type EventBinding}from"./services/EventBinder";
describe("EventBinding",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
        if(mocks.mockElement&&mocks.mockElement.parentNode){
            mocks.mockElement.parentNode.removeChild(mocks.mockElement);
        }
        mocks.mockElement=null;
    });
    it("should bind events to existing elements",()=>{
        let handler=vi.fn();
        let bindings: EventBinding[]=[
            {selector:"#test-btn",event:"click",handler}
        ];
        bindEvents(bindings);
        if(mocks.mockElement) mocks.mockElement.click();
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