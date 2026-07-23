/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
vi.mock("@tauri-apps/api/window",()=>({
    getCurrentWindow:vi.fn(()=>({theme:vi.fn(),setTheme:vi.fn()})),
}));
import{DomRegistry}from"./core/domRegistry";
describe("DomRegistry",()=>{
    let registry: DomRegistry;
    let testElements: HTMLElement[]=[];
    beforeEach(()=>{
        registry=new DomRegistry();
        testElements=[];
    });
    afterEach(()=>{
        for(let el of testElements){
            if(el.parentNode) el.parentNode.removeChild(el);
        }
    });
    function addElement(id: string): HTMLElement{
        let el=document.createElement("div");
        el.id=id;
        document.body.appendChild(el);
        testElements.push(el);
        return el;
    }
    it("should create instance",()=>{
        expect(registry).toBeDefined();
    });
    it("should resolve elements by ID",()=>{
        let el=addElement("test-el");
        let result=registry.getElement("test-el");
        expect(result).toBe(el);
    });
    it("should return null for non-existent elements",()=>{
        let result=registry.getElement("non-existent");
        expect(result).toBeNull();
    });
    it("should cache resolved elements",()=>{
        let el=addElement("cache-el");
        let first=registry.getElement("cache-el");
        let second=registry.getElement("cache-el");
        expect(first).toBe(second);
    });
    it("should invalidate single element",()=>{
        let el=addElement("inv-el");
        registry.getElement("inv-el");
        registry.invalidate("inv-el");
        let el2=addElement("inv-el");
        let result=registry.getElement("inv-el");
        expect(result).toBe(el2);
    });
    it("should invalidate all elements",()=>{
        let el=addElement("inv-all");
        registry.getElement("inv-all");
        registry.invalidateAll();
        let el2=addElement("inv-all");
        let result=registry.getElement("inv-all");
        expect(result).toBe(el2);
    });
    it("should have buttons accessor",()=>{
        expect(registry.buttons).toBeDefined();
    });
    it("should have inputs accessor",()=>{
        expect(registry.inputs).toBeDefined();
    });
    it("should have displays accessor",()=>{
        expect(registry.displays).toBeDefined();
    });
    it("should have modals accessor",()=>{
        expect(registry.modals).toBeDefined();
    });
    it("should have settings accessor",()=>{
        expect(registry.settings).toBeDefined();
    });
    it("should have session accessor",()=>{
        expect(registry.session).toBeDefined();
    });
});