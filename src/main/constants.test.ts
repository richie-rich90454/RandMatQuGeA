/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import{topics,scopeTopics,SESSION_STORAGE_KEY}from"./constants.js";
describe("constants",()=>{
    it("should export topics as a non-empty array",()=>{
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBeGreaterThan(0);
    });
    it("should have topic objects with id, name, icon, category",()=>{
        const t=topics[0];
        expect(t).toHaveProperty("id");
        expect(t).toHaveProperty("name");
        expect(t).toHaveProperty("icon");
        expect(t).toHaveProperty("category");
    });
    it("should export scopeTopics with simple, algebra, precalc, calc, all",()=>{
        expect(scopeTopics).toHaveProperty("simple");
        expect(scopeTopics).toHaveProperty("algebra");
        expect(scopeTopics).toHaveProperty("precalc");
        expect(scopeTopics).toHaveProperty("calc");
        expect(scopeTopics).toHaveProperty("all");
    });
    it("should have simple scope with add, subtrt, mult, divid",()=>{
        expect(scopeTopics.simple).toContain("add");
        expect(scopeTopics.simple).toContain("subtrt");
        expect(scopeTopics.simple).toContain("mult");
        expect(scopeTopics.simple).toContain("divid");
    });
    it("scopeTopics.all should include all topic ids",()=>{
        expect(scopeTopics.all.length).toBe(topics.length);
        topics.forEach(t=>{
            expect(scopeTopics.all).toContain(t.id);
        });
    });
    it("should export SESSION_STORAGE_KEY",()=>{
        expect(SESSION_STORAGE_KEY).toBe("mentalSessionSnapshot");
    });
});
