/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
vi.mock("@tauri-apps/api/window",()=>({
    getCurrentWindow:vi.fn(()=>({theme:vi.fn(),setTheme:vi.fn()})),
}));
import{DomRegistry}from"./core/domRegistry";
describe("DomRegistry",()=>{
    let registry: DomRegistry;
    beforeEach(()=>{
        registry=new DomRegistry();
    });
    it("should create instance",()=>{
        expect(registry).toBeDefined();
    });
    it("should resolve elements by ID",()=>{
        let el=document.createElement("div");
        el.id="test-el";
        document.body.appendChild(el);
        let result=registry.getElement("test-el");
        expect(result).toBe(el);
        document.body.removeChild(el);
    });
    it("should return null for non-existent elements",()=>{
        let result=registry.getElement("non-existent");
        expect(result).toBeNull();
    });
    it("should cache resolved elements",()=>{
        let el=document.createElement("div");
        el.id="cache-el";
        document.body.appendChild(el);
        let first=registry.getElement("cache-el");
        let second=registry.getElement("cache-el");
        expect(first).toBe(second);
        document.body.removeChild(el);
    });
    it("should invalidate single element",()=>{
        let el=document.createElement("div");
        el.id="inv-el";
        document.body.appendChild(el);
        registry.getElement("inv-el");
        registry.invalidate("inv-el");
        let result=registry.getElement("inv-el");
        expect(result).not.toBeNull();
        expect(result!.id).toBe("inv-el");
        document.body.removeChild(el);
    });
    it("should invalidate all elements",()=>{
        let el=document.createElement("div");
        el.id="inv-all";
        document.body.appendChild(el);
        registry.getElement("inv-all");
        registry.invalidateAll();
        let result=registry.getElement("inv-all");
        expect(result).not.toBeNull();
        expect(result!.id).toBe("inv-all");
        document.body.removeChild(el);
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