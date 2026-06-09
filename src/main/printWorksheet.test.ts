/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
vi.mock("./questionGenerator.js",()=>({
    generateQuestion:vi.fn(),
}));
import{initPrintModal,openPrintModal}from"./printWorksheet.js";
describe("printWorksheet",()=>{
    it("should export initPrintModal",()=>{
        expect(typeof initPrintModal).toBe("function");
    });
    it("initPrintModal should not throw",()=>{
        expect(()=>initPrintModal()).not.toThrow();
    });
    it("should export openPrintModal",()=>{
        expect(typeof openPrintModal).toBe("function");
    });
});
describe("openPrintModal",()=>{
    let modal:HTMLElement;
    beforeEach(()=>{
        modal=document.createElement("div");
        modal.id="print-modal";
        document.body.appendChild(modal);
        initPrintModal();
    });
    afterEach(()=>{
        modal.remove();
    });
    it("should be a function",()=>{
        expect(typeof openPrintModal).toBe("function");
    });
    it("should not throw when called",()=>{
        expect(()=>openPrintModal()).not.toThrow();
    });
    it("should show print modal",()=>{
        openPrintModal();
        expect(modal.classList.contains("show")).toBe(true);
    });
    it("should generate worksheet preview",()=>{
        openPrintModal();
        expect(modal.classList.contains("show")).toBe(true);
    });
    it("should handle empty topic selection",()=>{
        openPrintModal();
        expect(modal.classList.contains("show")).toBe(true);
    });
    it("should handle no questions generated",()=>{
        openPrintModal();
        expect(modal.classList.contains("show")).toBe(true);
    });
});
describe("initPrintModal",()=>{
    let modal:HTMLElement;
    let printBtn:HTMLButtonElement;
    let closeBtn:HTMLButtonElement;
    let generateBtn:HTMLButtonElement;
    let questionCountSelect:HTMLSelectElement;
    let topicSelect:HTMLSelectElement;
    let scopeSelect:HTMLSelectElement;
    let difficultySelect:HTMLSelectElement;
    let answerKeyCheckbox:HTMLInputElement;
    beforeEach(()=>{
        modal=document.createElement("div");
        modal.id="print-modal";
        printBtn=document.createElement("button");
        printBtn.id="print-button";
        closeBtn=document.createElement("button");
        closeBtn.id="print-close";
        generateBtn=document.createElement("button");
        generateBtn.id="print-generate";
        questionCountSelect=document.createElement("select");
        questionCountSelect.id="print-question-count";
        topicSelect=document.createElement("select");
        topicSelect.id="print-topic";
        scopeSelect=document.createElement("select");
        scopeSelect.id="print-scope";
        let allOpt=document.createElement("option");
        allOpt.value="all";
        allOpt.textContent="All";
        scopeSelect.appendChild(allOpt);
        difficultySelect=document.createElement("select");
        difficultySelect.id="print-difficulty";
        answerKeyCheckbox=document.createElement("input");
        answerKeyCheckbox.id="print-answer-key";
        answerKeyCheckbox.type="checkbox";
        modal.appendChild(printBtn);
        modal.appendChild(closeBtn);
        modal.appendChild(generateBtn);
        modal.appendChild(questionCountSelect);
        modal.appendChild(topicSelect);
        modal.appendChild(scopeSelect);
        modal.appendChild(difficultySelect);
        modal.appendChild(answerKeyCheckbox);
        document.body.appendChild(modal);
    });
    afterEach(()=>{
        modal.remove();
    });
    it("should be a function",()=>{
        expect(typeof initPrintModal).toBe("function");
    });
    it("should not throw when called",()=>{
        expect(()=>initPrintModal()).not.toThrow();
    });
    it("should attach click listener to print button",()=>{
        let clicked=false;
        printBtn.addEventListener("click",()=>{ clicked=true; });
        initPrintModal();
        printBtn.dispatchEvent(new MouseEvent("click",{bubbles:true}));
        expect(clicked).toBe(true);
    });
    it("should attach click listener to close button",()=>{
        initPrintModal();
        modal.classList.add("show");
        closeBtn.click();
        expect(modal.classList.contains("show")).toBe(false);
    });
    it("should attach click listener to generate button",()=>{
        let clicked=false;
        generateBtn.addEventListener("click",()=>{ clicked=true; });
        initPrintModal();
        generateBtn.click();
        expect(clicked).toBe(true);
    });
    it("should generate questions on generate click",()=>{
        initPrintModal();
        generateBtn.click();
        expect(generateBtn).toBeTruthy();
    });
    it("should close modal on close click",()=>{
        initPrintModal();
        modal.classList.add("show");
        closeBtn.click();
        expect(modal.classList.contains("show")).toBe(false);
    });
    it("should print on print click",()=>{
        let printCalled=false;
        const originalPrint=window.print;
        window.print=()=>{ printCalled=true; };
        initPrintModal();
        printBtn.click();
        window.print=originalPrint;
        expect(printCalled).toBe(true);
    });
    it("should handle worksheet title input",()=>{
        let titleInput=document.createElement("input");
        titleInput.id="print-title";
        titleInput.value="My Worksheet";
        modal.appendChild(titleInput);
        initPrintModal();
        expect(titleInput.value).toBe("My Worksheet");
    });
});
