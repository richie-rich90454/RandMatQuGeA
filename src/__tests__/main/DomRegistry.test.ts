/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach}from"vitest";
vi.mock("@tauri-apps/api/window",()=>({
    getCurrentWindow:vi.fn(()=>({theme:vi.fn(),setTheme:vi.fn()})),
}));
import{DomRegistry}from"../../main/core/DomRegistry";
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
    it("should report the topic pills as the grid's own children",()=>{
        let grid=document.createElement("div");
        grid.id="topic-grid";
        let first=document.createElement("button");
        first.className="topic-pill";
        first.dataset.topicId="add";
        let second=document.createElement("button");
        second.className="topic-pill";
        second.dataset.topicId="sub";
        grid.appendChild(first);
        grid.appendChild(second);
        // The grid carries a heading per category alongside the pills, so the
        // children are not all pills. Returning the heading would hand a caller
        // that toggles the active class an element with no topic on it.
        let heading=document.createElement("div");
        heading.className="topic-group-heading";
        grid.appendChild(heading);
        document.body.appendChild(grid);
        expect(registry.displays.topicPills).toEqual([first,second]);
        document.body.removeChild(grid);
    });
    it("should report no topic pills when the grid is missing",()=>{
        expect(registry.displays.topicPills).toEqual([]);
    });
    it("should resolve the math toolbar's symbol buttons",()=>{
        let toolbar=document.createElement("div");
        toolbar.id="math-toolbar";
        let dropdown=document.createElement("div");
        dropdown.id="math-dropdown";
        let nested=document.createElement("button");
        nested.className="math-toolbar-btn";
        dropdown.appendChild(nested);
        toolbar.appendChild(dropdown);
        document.body.appendChild(toolbar);
        expect(registry.displays.mathToolbarButtons).toEqual([nested]);
        document.body.removeChild(toolbar);
    });
});