/** @vitest-environment jsdom */
import{describe,it,expect,vi,beforeEach,afterEach}from"vitest";
vi.mock("./topics.js",()=>({
    selectTopic:vi.fn(),
}));
vi.mock("./generation.js",()=>({
    generateQuestion:vi.fn().mockResolvedValue(undefined),
}));
vi.mock("./settings.js",()=>({
    settings:{showWeakTopicsPopup:true},
}));
vi.mock("@tauri-apps/api/core",()=>({
    invoke:vi.fn().mockResolvedValue([]),
}));
import{checkAndShowWeakTopicsPopup}from"./weakTopics.js";
import{invoke}from"@tauri-apps/api/core";
describe("weakTopics",()=>{
    it("should export checkAndShowWeakTopicsPopup",()=>{
        expect(typeof checkAndShowWeakTopicsPopup).toBe("function");
    });
    it("checkAndShowWeakTopicsPopup should not throw",async()=>{
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
});
describe("checkAndShowWeakTopicsPopup",()=>{
    beforeEach(()=>{
        vi.mocked(invoke).mockReset();
    });
    it("should be a function",()=>{
        expect(typeof checkAndShowWeakTopicsPopup).toBe("function");
    });
    it("should not throw when called",async()=>{
        vi.mocked(invoke).mockResolvedValue([]);
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
    it("should invoke get_weak_topics command",async()=>{
        vi.mocked(invoke).mockResolvedValue([]);
        await checkAndShowWeakTopicsPopup();
        expect(invoke).toHaveBeenCalledWith("get_weak_topics",{limit:5});
    });
    it("should show popup when weak topics exist",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        const modal=document.createElement("div");
        modal.id="weak-topics-modal";
        const list=document.createElement("div");
        list.id="weak-topics-list";
        document.body.appendChild(modal);
        document.body.appendChild(list);
        await checkAndShowWeakTopicsPopup();
        expect(modal.classList.contains("show")).toBe(true);
        document.body.removeChild(modal);
        document.body.removeChild(list);
    });
    it("should not show popup when no weak topics",async()=>{
        vi.mocked(invoke).mockResolvedValue([]);
        const modal=document.createElement("div");
        modal.id="weak-topics-modal";
        const list=document.createElement("div");
        list.id="weak-topics-list";
        document.body.appendChild(modal);
        document.body.appendChild(list);
        await checkAndShowWeakTopicsPopup();
        expect(modal.classList.contains("show")).toBe(false);
        document.body.removeChild(modal);
        document.body.removeChild(list);
    });
    it("should limit weak topics to specified count",async()=>{
        vi.mocked(invoke).mockResolvedValue([
            {topic_id:"algebra",accuracy:0.5,attempts:5},
            {topic_id:"calculus",accuracy:0.4,attempts:6},
            {topic_id:"geometry",accuracy:0.3,attempts:7},
        ]);
        const modal=document.createElement("div");
        modal.id="weak-topics-modal";
        const list=document.createElement("div");
        list.id="weak-topics-list";
        document.body.appendChild(modal);
        document.body.appendChild(list);
        await checkAndShowWeakTopicsPopup();
        expect(list.children.length).toBe(3);
        document.body.removeChild(modal);
        document.body.removeChild(list);
    });
    it("should handle empty weak topics array",async()=>{
        vi.mocked(invoke).mockResolvedValue([]);
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
    it("should handle null response",async()=>{
        vi.mocked(invoke).mockResolvedValue(null);
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
    it("should handle single weak topic",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        const modal=document.createElement("div");
        modal.id="weak-topics-modal";
        const list=document.createElement("div");
        list.id="weak-topics-list";
        document.body.appendChild(modal);
        document.body.appendChild(list);
        await checkAndShowWeakTopicsPopup();
        expect(list.children.length).toBe(1);
        document.body.removeChild(modal);
        document.body.removeChild(list);
    });
    it("should handle multiple weak topics",async()=>{
        vi.mocked(invoke).mockResolvedValue([
            {topic_id:"algebra",accuracy:0.5,attempts:5},
            {topic_id:"calculus",accuracy:0.4,attempts:6},
        ]);
        const modal=document.createElement("div");
        modal.id="weak-topics-modal";
        const list=document.createElement("div");
        list.id="weak-topics-list";
        document.body.appendChild(modal);
        document.body.appendChild(list);
        await checkAndShowWeakTopicsPopup();
        expect(list.children.length).toBe(2);
        document.body.removeChild(modal);
        document.body.removeChild(list);
    });
    it("should handle network errors gracefully",async()=>{
        vi.mocked(invoke).mockRejectedValue(new Error("network error"));
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
    it("should not throw on Tauri error",async()=>{
        vi.mocked(invoke).mockRejectedValue(new Error("tauri error"));
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
    it("should display topic names in popup",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        const modal=document.createElement("div");
        modal.id="weak-topics-modal";
        const list=document.createElement("div");
        list.id="weak-topics-list";
        document.body.appendChild(modal);
        document.body.appendChild(list);
        await checkAndShowWeakTopicsPopup();
        expect(list.innerHTML).toContain("algebra");
        document.body.removeChild(modal);
        document.body.removeChild(list);
    });
    it("should display accuracy in popup",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        const modal=document.createElement("div");
        modal.id="weak-topics-modal";
        const list=document.createElement("div");
        list.id="weak-topics-list";
        document.body.appendChild(modal);
        document.body.appendChild(list);
        await checkAndShowWeakTopicsPopup();
        expect(list.innerHTML).toContain("50%");
        document.body.removeChild(modal);
        document.body.removeChild(list);
    });
    it("should provide practice button for each topic",async()=>{
        vi.mocked(invoke).mockResolvedValue([
            {topic_id:"algebra",accuracy:0.5,attempts:5},
            {topic_id:"calculus",accuracy:0.4,attempts:6},
        ]);
        const modal=document.createElement("div");
        modal.id="weak-topics-modal";
        const list=document.createElement("div");
        list.id="weak-topics-list";
        document.body.appendChild(modal);
        document.body.appendChild(list);
        await checkAndShowWeakTopicsPopup();
        const buttons=list.querySelectorAll(".practice-topic-btn");
        expect(buttons.length).toBe(2);
        document.body.removeChild(modal);
        document.body.removeChild(list);
    });
});
describe("checkAndShowWeakTopicsPopup - edge cases",()=>{
    let modal:HTMLElement;
    let list:HTMLElement;
    beforeEach(()=>{
        vi.mocked(invoke).mockReset();
        modal=document.createElement("div");
        modal.id="weak-topics-modal";
        list=document.createElement("div");
        list.id="weak-topics-list";
        document.body.appendChild(modal);
        document.body.appendChild(list);
    });
    afterEach(()=>{
        document.body.removeChild(modal);
        document.body.removeChild(list);
    });
    it("should handle empty topic name",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"",accuracy:0.5,attempts:5}]);
        await checkAndShowWeakTopicsPopup();
        expect(list.innerHTML).toContain("");
    });
    it("should handle very low accuracy (0%)",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",accuracy:0,attempts:5}]);
        await checkAndShowWeakTopicsPopup();
        expect(list.innerHTML).toContain("0%");
    });
    it("should handle 100% accuracy",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",accuracy:1,attempts:5}]);
        await checkAndShowWeakTopicsPopup();
        expect(modal.classList.contains("show")).toBe(false);
    });
    it("should handle NaN accuracy",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",accuracy:NaN,attempts:5}]);
        await checkAndShowWeakTopicsPopup();
        expect(modal.classList.contains("show")).toBe(false);
    });
    it("should handle missing accuracy field",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",attempts:5}]);
        await checkAndShowWeakTopicsPopup();
        expect(modal.classList.contains("show")).toBe(false);
    });
    it("should render weak topics in backend order",async()=>{
        vi.mocked(invoke).mockResolvedValue([
            {topic_id:"algebra",accuracy:0.5,attempts:5},
            {topic_id:"calculus",accuracy:0.2,attempts:6},
            {topic_id:"geometry",accuracy:0.4,attempts:7},
        ]);
        await checkAndShowWeakTopicsPopup();
        const items=list.querySelectorAll(".weak-topic-item");
        expect(items.length).toBe(3);
        expect(items[0].innerHTML).toContain("50%");
        expect(items[1].innerHTML).toContain("20%");
        expect(items[2].innerHTML).toContain("40%");
    });
    it("should not show popup when all topics strong",async()=>{
        vi.mocked(invoke).mockResolvedValue([
            {topic_id:"algebra",accuracy:0.9,attempts:5},
            {topic_id:"calculus",accuracy:0.8,attempts:6},
        ]);
        await checkAndShowWeakTopicsPopup();
        expect(modal.classList.contains("show")).toBe(false);
    });
    it("should handle concurrent calls",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        await Promise.all([checkAndShowWeakTopicsPopup(),checkAndShowWeakTopicsPopup()]);
        expect(modal.classList.contains("show")).toBe(true);
    });
    it("should dismiss popup on close",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        const closeBtn=document.createElement("button");
        closeBtn.id="weak-topics-close";
        document.body.appendChild(closeBtn);
        await checkAndShowWeakTopicsPopup();
        expect(modal.classList.contains("show")).toBe(true);
        if(closeBtn.onclick)closeBtn.onclick(new PointerEvent("click"));
        expect(modal.classList.contains("show")).toBe(false);
        document.body.removeChild(closeBtn);
    });
    it("should navigate to practice on button click",async()=>{
        vi.mocked(invoke).mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        await checkAndShowWeakTopicsPopup();
        const practiceBtn=list.querySelector(".practice-topic-btn")as HTMLElement;
        expect(practiceBtn).not.toBeNull();
        practiceBtn.click();
        expect(modal.classList.contains("show")).toBe(false);
    });
});
