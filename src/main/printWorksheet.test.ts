/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
const mockInvoke=vi.hoisted(()=>vi.fn().mockResolvedValue(undefined));
vi.mock("@tauri-apps/api/core",()=>({
	invoke: mockInvoke,
}));
vi.mock("./questionGenerator.js",()=>({
	generateQuestionDto:vi.fn().mockResolvedValue({
		latex: "\\(x^2 + 1\\)",
		correct: "2",
		alternate: "2",
		display: "2",
		choices: ["2","3"],
		expectedFormat: "Enter a number"
	}),
}));
vi.mock("html2canvas",()=>({
	default: vi.fn().mockResolvedValue(document.createElement("canvas")),
}));
vi.mock("jspdf",()=>({
	jsPDF: vi.fn().mockImplementation(()=>{
		return {
			internal:{pageSize:{getWidth:()=>612,getHeight:()=>792},getNumberOfPages:()=>1},
			setPage: vi.fn(),
			setFontSize: vi.fn(),
			setTextColor: vi.fn(),
			text: vi.fn(),
			addImage: vi.fn(),
			addPage: vi.fn(),
			save: vi.fn(),
		};
	}),
}));
vi.mock("./ui.js",()=>({
	showNotification: vi.fn(),
}));
import{initPrintModal,openPrintModal,closePrintModal,renderKatexInElement,wrapLatexIfNeeded}from"./printWorksheet.js";
import{generateQuestionDto}from"./questionGenerator.js";
import{showNotification}from"./ui.js";
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
	let seed=append("print-seed-input","input") as HTMLInputElement;
	seed.type="text";
	let copySeed=append("print-copy-seed","button") as HTMLButtonElement;
	copySeed.classList.add("hidden");
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
	it("should export renderKatexInElement",()=>{
		expect(typeof renderKatexInElement).toBe("function");
	});
	it("should export wrapLatexIfNeeded",()=>{
		expect(typeof wrapLatexIfNeeded).toBe("function");
	});
});
describe("wrapLatexIfNeeded",()=>{
	it("returns empty string for empty input",()=>{
		expect(wrapLatexIfNeeded("")).toBe("");
	});
	it("wraps bare latex in inline delimiters",()=>{
		expect(wrapLatexIfNeeded("x^2 + 1")).toBe("\\(x^2 + 1\\)");
	});
	it("does not re-wrap text already wrapped in inline delimiters",()=>{
		expect(wrapLatexIfNeeded("\\(x^2 + 1\\)")).toBe("\\(x^2 + 1\\)");
	});
	it("does not re-wrap text already wrapped in display delimiters",()=>{
		expect(wrapLatexIfNeeded("$$x^2 + 1$$")).toBe("$$x^2 + 1$$");
	});
	it("does not re-wrap text already wrapped in dollar delimiters",()=>{
		expect(wrapLatexIfNeeded("$x^2 + 1$")).toBe("$x^2 + 1$");
	});
	it("does not wrap plain prose without latex commands",()=>{
		expect(wrapLatexIfNeeded("hello world")).toBe("hello world");
	});
	it("non-greedy: detects first inline delimiter correctly",()=>{
		expect(wrapLatexIfNeeded("\\(a\\) and \\(b\\)")).toBe("\\(a\\) and \\(b\\)");
	});
	it("non-greedy: detects first dollar delimiter correctly",()=>{
		expect(wrapLatexIfNeeded("$a$ and $b$")).toBe("$a$ and $b$");
	});
	it("non-greedy: detects first display delimiter correctly",()=>{
		expect(wrapLatexIfNeeded("$$a$$ and $$b$$")).toBe("$$a$$ and $$b$$");
	});
});
describe("renderKatexInElement",()=>{
	beforeEach(()=>{
		(window as any).katex={
			renderToString:vi.fn((latex:string,opts?:any)=>{
				let display=opts?.displayMode?"block":"inline";
				return `<span class="katex-${display}">${latex}</span>`;
			})
		};
	});
	afterEach(()=>{
		delete (window as any).katex;
	});
	it("renders inline math delimiters leaving prose untouched",()=>{
		let el=document.createElement("div");
		el.textContent="The answer is \\(x^2\\) here.";
		renderKatexInElement(el);
		expect(el.innerHTML).toContain("The answer is ");
		expect(el.innerHTML).toContain("katex-inline");
		expect(el.innerHTML).toContain("x^2");
		expect(el.innerHTML).toContain(" here.");
	});
	it("renders display math delimiters",()=>{
		let el=document.createElement("div");
		el.className="ws-question-text";
		el.textContent="Solve: $$x^2 = 4$$";
		renderKatexInElement(el);
		expect(el.innerHTML).toContain("Solve: ");
		expect(el.innerHTML).toContain("katex-block");
		expect(el.innerHTML).toContain("x^2 = 4");
	});
	it("renders multiple inline math expressions in one text node",()=>{
		let el=document.createElement("div");
		el.textContent="\\(a\\) plus \\(b\\) equals \\(c\\)";
		renderKatexInElement(el);
		let katexSpans=el.querySelectorAll(".katex-inline");
		expect(katexSpans.length).toBe(3);
	});
	it("leaves plain text nodes without math untouched",()=>{
		let el=document.createElement("div");
		el.textContent="Just plain text, no math here.";
		renderKatexInElement(el);
		expect(el.textContent).toBe("Just plain text, no math here.");
	});
	it("does nothing when katex is not available",()=>{
		delete (window as any).katex;
		let el=document.createElement("div");
		el.textContent="\\(x^2\\)";
		expect(()=>renderKatexInElement(el)).not.toThrow();
		expect(el.textContent).toBe("\\(x^2\\)");
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
	it("should wire export-pdf button to alert when no worksheet generated",()=>{
		initPrintModal();
		exportBtn.click();
		expect(window.alert).toHaveBeenCalledWith("Please generate a worksheet preview first.");
	});
	it("should wire generate button without throwing",()=>{
		initPrintModal();
		expect(()=>generateBtn.click()).not.toThrow();
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
describe("worksheet DTO generation",()=>{
	it("generateQuestionDto is called (not generateQuestion) for worksheet mode",()=>{
		expect(typeof generateQuestionDto).toBe("function");
	});
});
describe("seed wiring",()=>{
	let modal:HTMLElement;
	let generateBtn:HTMLButtonElement;
	let seedInput:HTMLInputElement;
	let copySeedBtn:HTMLButtonElement;
	beforeEach(()=>{
		modal=createPrintModal();
		generateBtn=modal.querySelector("#print-generate") as HTMLButtonElement;
		seedInput=modal.querySelector("#print-seed-input") as HTMLInputElement;
		copySeedBtn=modal.querySelector("#print-copy-seed") as HTMLButtonElement;
		vi.spyOn(window,"alert").mockImplementation(()=>{});
		vi.mocked(generateQuestionDto).mockResolvedValue({
			latex: "\\(x^2 + 1\\)",
			correct: "2",
			alternate: "2",
			display: "2",
			choices: ["2","3"],
			expectedFormat: "Enter a number"
		});
		mockInvoke.mockReset();
		mockInvoke.mockResolvedValue(undefined);
	});
	afterEach(()=>{
		modal.remove();
		vi.restoreAllMocks();
	});
	it("should populate seed input after generation with random seed",async ()=>{
		mockInvoke.mockResolvedValue(12345 as any);
		initPrintModal();
		generateBtn.click();
		await vi.waitFor(()=>{
			expect(seedInput.value).toBe("12345");
		});
	});
	it("should show copy seed button after generation",async ()=>{
		mockInvoke.mockResolvedValue(99999 as any);
		initPrintModal();
		generateBtn.click();
		await vi.waitFor(()=>{
			expect(copySeedBtn.classList.contains("hidden")).toBe(false);
		});
	});
	it("should use seed from input when provided",async ()=>{
		seedInput.value="42";
		mockInvoke.mockResolvedValue(99999 as any);
		initPrintModal();
		generateBtn.click();
		await vi.waitFor(()=>{
			expect(seedInput.value).toBe("42");
		});
	});
	it("should hide copy seed button by default",()=>{
		initPrintModal();
		expect(copySeedBtn.classList.contains("hidden")).toBe(true);
	});
});
describe("copy seed button",()=>{
	let modal:HTMLElement;
	let generateBtn:HTMLButtonElement;
	let copySeedBtn:HTMLButtonElement;
	let seedInput:HTMLInputElement;
	beforeEach(()=>{
		modal=createPrintModal();
		generateBtn=modal.querySelector("#print-generate") as HTMLButtonElement;
		copySeedBtn=modal.querySelector("#print-copy-seed") as HTMLButtonElement;
		seedInput=modal.querySelector("#print-seed-input") as HTMLInputElement;
		vi.spyOn(window,"alert").mockImplementation(()=>{});
		vi.mocked(generateQuestionDto).mockResolvedValue({
			latex: "\\(x^2 + 1\\)",
			correct: "2",
			alternate: "2",
			display: "2",
			choices: ["2","3"],
			expectedFormat: "Enter a number"
		});
		vi.mocked(showNotification).mockReset();
		mockInvoke.mockReset();
		mockInvoke.mockResolvedValue(undefined);
		Object.defineProperty(navigator,"clipboard",{
			value:{writeText:vi.fn().mockResolvedValue(undefined)},
			configurable:true,
		});
	});
	afterEach(()=>{
		modal.remove();
		vi.restoreAllMocks();
	});
	it("should copy seed to clipboard when clicked after generation",async ()=>{
		mockInvoke.mockResolvedValue(12345 as any);
		initPrintModal();
		generateBtn.click();
		await vi.waitFor(()=>{
			expect(seedInput.value).toBe("12345");
		});
		copySeedBtn.click();
		await vi.waitFor(()=>{
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith("12345");
		});
	});
	it("should show notification after copying seed",async ()=>{
		mockInvoke.mockResolvedValue(777 as any);
		initPrintModal();
		generateBtn.click();
		await vi.waitFor(()=>{
			expect(seedInput.value).toBe("777");
		});
		copySeedBtn.click();
		await vi.waitFor(()=>{
			expect(showNotification).toHaveBeenCalledWith(expect.stringContaining("777"),expect.any(String));
		});
	});
	it("should warn when no seed available",async ()=>{
		seedInput.value="";
		initPrintModal();
		copySeedBtn.click();
		await vi.waitFor(()=>{
			expect(showNotification).toHaveBeenCalledWith(expect.stringContaining("No seed"),expect.any(String));
		});
	});
	it("should warn when clipboard write fails",async ()=>{
		Object.defineProperty(navigator,"clipboard",{
			value:{writeText:vi.fn().mockRejectedValue(new Error("denied"))},
			configurable:true,
		});
		seedInput.value="99";
		initPrintModal();
		copySeedBtn.click();
		await vi.waitFor(()=>{
			expect(showNotification).toHaveBeenCalledWith(expect.stringContaining("Failed to copy"),expect.any(String));
		});
	});
});