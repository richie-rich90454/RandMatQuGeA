/** @vitest-environment jsdom */
import{describe,it,expect,beforeEach}from"vitest";
import{TopicRegistry}from"../../main/services/TopicRegistry";
describe("TopicRegistry",()=>{
    let registry: TopicRegistry;
    beforeEach(()=>{
        registry=new TopicRegistry();
    });
    it("should create instance",()=>{
        expect(registry).toBeDefined();
    });
    it("should register a topic",()=>{
        registry.registerTopic("add","arithmetic","generateAddition");
        expect(registry.hasTopic("add")).toBe(true);
    });
    it("should get a topic",()=>{
        registry.registerTopic("add","arithmetic","generateAddition");
        let entry=registry.getTopic("add");
        expect(entry).toBeDefined();
        expect(entry?.id).toBe("add");
        expect(entry?.scope).toBe("arithmetic");
        expect(entry?.fn).toBe("generateAddition");
    });
    it("should return undefined for non-existent topic",()=>{
        let entry=registry.getTopic("nonexistent");
        expect(entry).toBeUndefined();
    });
    it("should return all topics",()=>{
        registry.registerTopic("add","arithmetic","generateAddition");
        registry.registerTopic("sub","arithmetic","generateSubtraction");
        let all=registry.getAllTopics();
        expect(all.size).toBe(2);
    });
    it("should clear all topics",()=>{
        registry.registerTopic("add","arithmetic","generateAddition");
        registry.registerTopic("sub","arithmetic","generateSubtraction");
        registry.clear();
        expect(registry.getAllTopics().size).toBe(0);
    });
    it("should get topics by scope",()=>{
        registry.registerTopic("add","arithmetic","generateAddition");
        registry.registerTopic("sub","arithmetic","generateSubtraction");
        registry.registerTopic("sin","trigonometry","generateSin");
        let arithmeticTopics=registry.getTopicsByScope("arithmetic");
        expect(arithmeticTopics.length).toBe(2);
        let trigTopics=registry.getTopicsByScope("trigonometry");
        expect(trigTopics.length).toBe(1);
    });
    it("should handle duplicate registrations",()=>{
        registry.registerTopic("add","arithmetic","generateAddition");
        registry.registerTopic("add","algebra","generateAdd");
        let entry=registry.getTopic("add");
        expect(entry?.scope).toBe("algebra");
        expect(entry?.fn).toBe("generateAdd");
    });
});