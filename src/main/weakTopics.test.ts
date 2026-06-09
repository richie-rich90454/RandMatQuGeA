/** @vitest-environment jsdom */
import{describe,it,expect,vi}from"vitest";
vi.mock("./topics.js",()=>({
    selectTopic:vi.fn(),
}));
vi.mock("./generation.js",()=>({
    generateQuestion:vi.fn(),
}));
vi.mock("./settings.js",()=>({
    settings:{showWeakTopicsPopup:true},
}));
import{checkAndShowWeakTopicsPopup}from"./weakTopics.js";
describe("weakTopics",()=>{
    it("should export checkAndShowWeakTopicsPopup",()=>{
        expect(typeof checkAndShowWeakTopicsPopup).toBe("function");
    });
    it("checkAndShowWeakTopicsPopup should not throw",async()=>{
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
});
describe("checkAndShowWeakTopicsPopup",()=>{
    it("should be a function",()=>{
        expect(typeof checkAndShowWeakTopicsPopup).toBe("function");
    });
    it("should not throw when called",async()=>{
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
    it("should invoke get_weak_topics command",async()=>{
        const invokeMock=vi.fn().mockResolvedValue([]);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
        await checkAndShowWeakTopicsPopup();
        expect(invokeMock).toHaveBeenCalledWith("get_weak_topics",{limit:5});
    });
    it("should show popup when weak topics exist",async()=>{
        const invokeMock=vi.fn().mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
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
        const invokeMock=vi.fn().mockResolvedValue([]);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
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
        const invokeMock=vi.fn().mockResolvedValue([
            {topic_id:"algebra",accuracy:0.5,attempts:5},
            {topic_id:"calculus",accuracy:0.4,attempts:6},
            {topic_id:"geometry",accuracy:0.3,attempts:7},
        ]);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
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
        const invokeMock=vi.fn().mockResolvedValue([]);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
    it("should handle null response",async()=>{
        const invokeMock=vi.fn().mockResolvedValue(null);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
    it("should handle single weak topic",async()=>{
        const invokeMock=vi.fn().mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
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
        const invokeMock=vi.fn().mockResolvedValue([
            {topic_id:"algebra",accuracy:0.5,attempts:5},
            {topic_id:"calculus",accuracy:0.4,attempts:6},
        ]);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
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
        const invokeMock=vi.fn().mockRejectedValue(new Error("network error"));
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
    it("should not throw on Tauri error",async()=>{
        const invokeMock=vi.fn().mockRejectedValue(new Error("tauri error"));
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
        await expect(checkAndShowWeakTopicsPopup()).resolves.toBeUndefined();
    });
    it("should display topic names in popup",async()=>{
        const invokeMock=vi.fn().mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
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
        const invokeMock=vi.fn().mockResolvedValue([{topic_id:"algebra",accuracy:0.5,attempts:5}]);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
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
        const invokeMock=vi.fn().mockResolvedValue([
            {topic_id:"algebra",accuracy:0.5,attempts:5},
            {topic_id:"calculus",accuracy:0.4,attempts:6},
        ]);
        vi.doMock("@tauri-apps/api/core",()=>({invoke:invokeMock}));
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
