/** @vitest-environment jsdom */
import {describe, it, expect} from "vitest";
import {registeredTopicIds} from "./Harness";
import {subSkillsFor, subSkillCount} from "../../modules/shared/SubSkills";

/**
 * The sub-skill table is the authoritative description of a topic's internal
 * branches, because a generator does not return which branch it chose. A topic
 * that is missing from the table therefore has no sub-skills, which means the
 * scheduler cannot record which procedure was practiced and review cannot target
 * the weak one.
 */
describe("sub-skill table",()=>{
    it("covers every registered topic",()=>{
        const missing=registeredTopicIds().filter(id=>subSkillsFor(id).length===0);
        expect(missing).toEqual([]);
    });
    it("declares no empty or duplicated sub-skill",()=>{
        const bad:string[]=[];
        for(let topicId of registeredTopicIds()){
            let skills=subSkillsFor(topicId);
            if (skills.some(s=>s.trim()==="")) bad.push(topicId+" has an empty sub-skill");
            if (new Set(skills).size!==skills.length) bad.push(topicId+" has a repeated sub-skill");
        }
        expect(bad).toEqual([]);
    });
    it("counts every declared sub-skill exactly once",()=>{
        let declared=0;
        for(let topicId of registeredTopicIds()){
            declared+=subSkillsFor(topicId).length;
        }
        expect(subSkillCount()).toBe(declared);
    });
});
