/** @vitest-environment jsdom */
import {describe, it, expect} from "vitest";
import {registeredTopicIds} from "./Harness";
import {topics, scopeTopics} from "../../main/TopicData";

/**
 * The topic table and the registry are two halves of one fact: the grid offers
 * an id, and the registry has to know what to generate for it. Nothing compared
 * them, so a spelling sweep that renamed an id in the table while the
 * registration kept the old spelling produced a topic the grid could select and
 * the app could not generate — a dead pill, reported only when a learner
 * clicked it. These are the three directions that can disagree.
 */
describe("topic table and registry agree",()=>{
    it("registers every topic the table offers",()=>{
        const registered=new Set(registeredTopicIds());
        const missing=topics.filter(topic=>!registered.has(topic.id)).map(topic=>topic.id);
        expect(missing).toEqual([]);
    });
    it("lists every registered topic in the table",()=>{
        const offered=new Set(topics.map(topic=>topic.id));
        const missing=registeredTopicIds().filter(id=>!offered.has(id));
        expect(missing).toEqual([]);
    });
    it("names only real topics in every scope",()=>{
        const offered=new Set(topics.map(topic=>topic.id));
        const bad:string[]=[];
        for(let scope of Object.keys(scopeTopics)){
            for(let id of scopeTopics[scope as keyof typeof scopeTopics]){
                if (!offered.has(id)) bad.push(scope+" names "+id);
            }
        }
        expect(bad).toEqual([]);
    });
    it("keeps the table free of duplicate ids",()=>{
        const ids=topics.map(topic=>topic.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});