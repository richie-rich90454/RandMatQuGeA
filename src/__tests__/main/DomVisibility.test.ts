/** @vitest-environment jsdom */
import{describe,it,expect}from"vitest";
import{setHidden}from"../../main/core/DomVisibility";

describe('setHidden',()=>{
    /**
     * jsdom applies no stylesheet, so the class cannot be observed taking effect
     * here. What this file asserts is the mechanism, because the mechanism is what
     * went wrong: an element carrying a class that sets `display` keeps that display
     * when the attribute alone is set, because a class selector outranks the
     * user-agent rule for `[hidden]`. A browser is where that is visible; this is
     * where the mistake is made.
     */
    function element(cls:string):HTMLElement{
        let node=document.createElement("div");
        node.className=cls;
        document.body.appendChild(node);
        return node;
    }
    it('sets the hidden attribute as well as the class',()=>{
        let node=element("icon-button");
        setHidden(node, true);
        expect(node.hidden).toBe(true);
        expect(node.classList.contains("hidden")).toBe(true);
    });
    it('clears both when showing again',()=>{
        let node=element("setting-item");
        setHidden(node, true);
        setHidden(node, false);
        expect(node.hidden).toBe(false);
        expect(node.classList.contains("hidden")).toBe(false);
    });
    it('survives being called on an element that is not there',()=>{
        expect(()=>setHidden(null, true)).not.toThrow();
        expect(()=>setHidden(undefined, true)).not.toThrow();
    });
    it('leaves the other classes alone',()=>{
        // The class this function adds is `hidden`, and nothing else. An earlier
        // version that rewrote className would take the element's own styling with
        // it, which is how a control loses its shape while being hidden.
        let node=element("icon-button active");
        setHidden(node, true);
        expect(node.classList.contains("icon-button")).toBe(true);
        expect(node.classList.contains("active")).toBe(true);
        setHidden(node, false);
        expect(node.classList.contains("hidden")).toBe(false);
        expect(node.classList.contains("icon-button")).toBe(true);
    });
});