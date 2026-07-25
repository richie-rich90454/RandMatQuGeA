/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("@tauri-apps/api/window",()=>({
    getCurrentWindow:vi.fn(()=>({theme:vi.fn(),setTheme:vi.fn()})),
}));
import{dom}from"./dom.js";
describe("dom",()=>{
    it("should export the dom singleton",()=>{
        expect(dom).toBeDefined();
    });
    it("should have buttons accessors",()=>{
        expect(dom.buttons).toBeDefined();
    });
    it("should have inputs accessors",()=>{
        expect(dom.inputs).toBeDefined();
    });
    it("should have displays accessors",()=>{
        expect(dom.displays).toBeDefined();
    });
    it("should have modals accessors",()=>{
        expect(dom.modals).toBeDefined();
    });
    it("should have settings accessors",()=>{
        expect(dom.settings).toBeDefined();
    });
    it("should have session accessors",()=>{
        expect(dom.session).toBeDefined();
    });
    it("should lazily resolve DOM elements",()=>{
        let el=document.createElement("div");
        el.id="test-element";
        document.body.appendChild(el);
        let result=dom.getElement("test-element");
        expect(result).toBe(el);
    });
    it("should return null for non-existent elements",()=>{
        let result=dom.getElement("non-existent");
        expect(result).toBeNull();
    });
    it("should cache resolved elements",()=>{
        let el=document.createElement("div");
        el.id="cache-test";
        document.body.appendChild(el);
        let first=dom.getElement("cache-test");
        let second=dom.getElement("cache-test");
        expect(first).toBe(second);
    });
});