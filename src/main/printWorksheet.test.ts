/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
vi.mock("./questionGenerator.js",()=>({
    generateQuestion:vi.fn(),
}));
import{initPrintModal,openPrintModal,closePrintModal}from"./printWorksheet.js";
function createPrintModal():HTMLElement{
    let modal=document.createElement("div");
    modal.id="print-modal";
    modal.classList.add("hidden");
    let append=(id:string,tag:string)=>{
        let el=document.createElement(tag);
        el.id=id;
        modal.appendChild(el);
        return el;
    };
    append("print-close","button");
    append("print-generate","button");
    append("print-export-pdf","button");
    let qCount=append("print-question-count","select") as HTMLSelectElement;
    qCount.innerHTML='<option value="10" selected>10</option>';
    let topic=append("print-topic","select") as HTMLSelectElement;
    topic.innerHTML='<option value="all">All</option>';
    let scope=append("print-scope","select") as HTMLSelectElement;
    scope.innerHTML='<option value="all" selected>All</option>';
    let diff=append("print-difficulty","select") as HTMLSelectElement;
    diff.innerHTML='<option value="easy">Easy</option><option value="medium" selected>Medium</option>';
    let ak=append("print-answer-key-mode","select") as HTMLSelectElement;
    ak.innerHTML='<option value="none">None</option><option value="append" selected>Append</option>';
    let pn=append("print-page-numbers","input") as HTMLInputElement;
    pn.type="checkbox";
    let sm=append("print-show-metadata","input") as HTMLInputElement;
    sm.type="checkbox";
    sm.checked=true;
    let title=append("print-title-input","input") as HTMLInputElement;
    title.type="text";
    title.value="Math Worksheet";
    let name=append("print-name-input","input") as HTMLInputElement;
    name.type="text";
    let date=append("print-date-input","input") as HTMLInputElement;
    date.type="date";
    let period=append("print-period-input","input") as HTMLInputElement;
    period.type="text";
    append("print-preview","div");
    document.body.appendChild(modal);
    return modal;
}
describe("printWorksheet exports",()=>{
    it("should export initPrintModal",()=>{
        expect(typeof initPrintModal).toBe("function");
    });
    it("should export openPrintModal",()=>{
        expect(typeof openPrintModal).toBe("function");
    });
    it("should export closePrintModal",()=>{
        expect(typeof closePrintModal).toBe("function");
    });
});
describe("initPrintModal",()=>{
    let modal:HTMLElement;
    let closeBtn:HTMLButtonElement;
    let generateBtn:HTMLButtonElement;
    let exportBtn:HTMLButtonElement;
    let scopeSelect:HTMLSelectElement;
    let topicSelect:HTMLSelectElement;
    beforeEach(()=>{
        modal=createPrintModal();
        closeBtn=modal.querySelector("#print-close") as HTMLButtonElement;
        generateBtn=modal.querySelector("#print-generate") as HTMLButtonElement;
        exportBtn=modal.querySelector("#print-export-pdf") as HTMLButtonElement;
        scopeSelect=modal.querySelector("#print-scope") as HTMLSelectElement;
        topicSelect=modal.querySelector("#print-topic") as HTMLSelectElement;
        vi.spyOn(window,"alert").mockImplementation(()=>{});
    });
    afterEach(()=>{
        modal.remove();
        vi.restoreAllMocks();
    });
    it("should not throw when modal is missing",()=>{
        modal.remove();
        expect(()=>initPrintModal()).not.toThrow();
    });
    it("should not throw when called with full modal",()=>{
        expect(()=>initPrintModal()).not.toThrow();
    });
    it("should wire close button to closePrintModal",()=>{
        initPrintModal();
        modal.classList.add("show");
        closeBtn.click();
        expect(modal.classList.contains("show")).toBe(false);
        expect(modal.classList.contains("hidden")).toBe(true);
    });
    it("should wire generate button without throwing",()=>{
        initPrintModal();
        expect(()=>generateBtn.click()).not.toThrow();
    });
    it("should wire export-pdf button to alert when no worksheet generated",()=>{
        initPrintModal();
        exportBtn.click();
        expect(window.alert).toHaveBeenCalledWith("Please generate a worksheet preview first.");
    });
    it("should wire scope change to update topic dropdown",()=>{
        initPrintModal();
        scopeSelect.value="all";
        scopeSelect.dispatchEvent(new Event("change",{bubbles:true}));
        expect(topicSelect.options.length).toBeGreaterThan(0);
    });
    it("should populate topic dropdown on init",()=>{
        initPrintModal();
        expect(topicSelect.options.length).toBeGreaterThan(0);
    });
});
describe("openPrintModal",()=>{
    let modal:HTMLElement;
    let dateInput:HTMLInputElement;
    beforeEach(()=>{
        modal=createPrintModal();
        dateInput=modal.querySelector("#print-date-input") as HTMLInputElement;
        initPrintModal();
    });
    afterEach(()=>{
        modal.remove();
    });
    it("should show modal",()=>{
        openPrintModal();
        expect(modal.classList.contains("show")).toBe(true);
        expect(modal.classList.contains("hidden")).toBe(false);
    });
    it("should set today's date when date input is empty",()=>{
        openPrintModal();
        let today=new Date().toISOString().split("T")[0];
        expect(dateInput.value).toBe(today);
    });
    it("should not overwrite date when already set",()=>{
        dateInput.value="2026-01-01";
        openPrintModal();
        expect(dateInput.value).toBe("2026-01-01");
    });
});
describe("closePrintModal",()=>{
    let modal:HTMLElement;
    beforeEach(()=>{
        modal=createPrintModal();
        initPrintModal();
        openPrintModal();
    });
    afterEach(()=>{
        modal.remove();
    });
    it("should hide modal",()=>{
        closePrintModal();
        expect(modal.classList.contains("show")).toBe(false);
        expect(modal.classList.contains("hidden")).toBe(true);
    });
});
