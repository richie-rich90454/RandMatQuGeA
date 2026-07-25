/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import{topics,scopeTopics,SESSION_STORAGE_KEY}from"./Constants.js";
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
describe("topics array structure",()=>{
    it("should have unique topic ids",()=>{
        let ids=topics.map(t=>t.id);
        let uniqueIds=[...new Set(ids)];
        expect(uniqueIds.length).toBe(ids.length);
    });
    it("should have non-empty names for all topics",()=>{
        topics.forEach(t=>{
            expect(t.name.length).toBeGreaterThan(0);
        });
    });
    it("should have non-empty icons for all topics",()=>{
        topics.forEach(t=>{
            expect(t.icon.length).toBeGreaterThan(0);
        });
    });
    it("should have valid categories for all topics",()=>{
        let validCategories=["Arithmetic","Algebra","Calculus","Linear Algebra","Trigonometry","Discrete Math","Geometry"];
        topics.forEach(t=>{
            expect(validCategories).toContain(t.category);
        });
    });
    it("should have at least 100 topics",()=>{
        expect(topics.length).toBeGreaterThanOrEqual(100);
    });
    it("should have string ids",()=>{
        topics.forEach(t=>{
            expect(typeof t.id).toBe("string");
        });
    });
    it("should have string names",()=>{
        topics.forEach(t=>{
            expect(typeof t.name).toBe("string");
        });
    });
    it("should have string icons",()=>{
        topics.forEach(t=>{
            expect(typeof t.icon).toBe("string");
        });
    });
    it("should have string categories",()=>{
        topics.forEach(t=>{
            expect(typeof t.category).toBe("string");
        });
    });
});
describe("scopeTopics",()=>{
    it("should have algebra scope with algebra topics",()=>{
        let algebraIds=topics.filter(t=>t.category==="Algebra").map(t=>t.id);
        let included=algebraIds.filter(id=>scopeTopics.algebra.includes(id));
        expect(included.length).toBeGreaterThan(algebraIds.length/2);
    });
    it("should have precalc scope with precalculus topics",()=>{
        let precalcCategories=["Algebra","Trigonometry","Linear Algebra","Discrete Math","Geometry"];
        let precalcIds=topics.filter(t=>precalcCategories.includes(t.category)).map(t=>t.id);
        precalcIds.forEach(id=>{
            expect(scopeTopics.precalc).toContain(id);
        });
    });
    it("should have calc scope with calculus topics",()=>{
        let calcIds=topics.filter(t=>t.category==="Calculus").map(t=>t.id);
        calcIds.forEach(id=>{
            expect(scopeTopics.calc).toContain(id);
        });
    });
    it("should have all scope include every topic id",()=>{
        topics.forEach(t=>{
            expect(scopeTopics.all).toContain(t.id);
        });
    });
    it("should have simple scope with basic arithmetic topics",()=>{
        expect(scopeTopics.simple).toContain("add");
        expect(scopeTopics.simple).toContain("subtrt");
        expect(scopeTopics.simple).toContain("mult");
        expect(scopeTopics.simple).toContain("divid");
        let arithmeticIds=topics.filter(t=>t.category==="Arithmetic").map(t=>t.id);
        arithmeticIds.forEach(id=>{
            expect(scopeTopics.simple).toContain(id);
        });
    });
    it("should have non-overlapping simple and calc scopes mostly",()=>{
        let simpleSet=new Set(scopeTopics.simple);
        let calcOnly=scopeTopics.calc.filter(id=>!simpleSet.has(id));
        expect(calcOnly.length).toBeGreaterThan(0);
    });
    it("should have algebra scope larger than simple scope",()=>{
        expect(scopeTopics.algebra.length).toBeGreaterThan(scopeTopics.simple.length);
    });
    it("should have all scope be the largest",()=>{
        expect(scopeTopics.all.length).toBeGreaterThan(scopeTopics.simple.length);
        expect(scopeTopics.all.length).toBeGreaterThan(scopeTopics.algebra.length);
        expect(scopeTopics.all.length).toBeGreaterThan(scopeTopics.precalc.length);
        expect(scopeTopics.all.length).toBeGreaterThan(scopeTopics.calc.length);
    });
});
describe("SESSION_STORAGE_KEY",()=>{
    it("should be a non-empty string",()=>{
        expect(SESSION_STORAGE_KEY.length).toBeGreaterThan(0);
    });
    it('should be "mentalSessionSnapshot"',()=>{
        expect(SESSION_STORAGE_KEY).toBe("mentalSessionSnapshot");
    });
    it("should be a string type",()=>{
        expect(typeof SESSION_STORAGE_KEY).toBe("string");
    });
});
