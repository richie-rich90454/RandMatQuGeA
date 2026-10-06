/**
 * @vitest-environment jsdom
 */
import {describe,it,expect,vi,beforeAll,beforeEach,afterEach} from "vitest";
import {WebGLRenderer, PerspectiveCamera, GridHelper, AxesHelper, BufferGeometry, SphereGeometry, MeshStandardMaterial} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {createVisualization, cleanupVisualization} from "../../../modules/Geometry/GeometryVisualization.js";
describe("cleanupVisualization",()=>{
    beforeEach(()=>{
        document.body.innerHTML='<div id="geometry-visualization">vis</div><div id="geometry-info">info</div>';
    });
    it("removes visualization container from DOM",()=>{
        cleanupVisualization();
        expect(document.getElementById("geometry-visualization")).toBeNull();
    });
    it("removes info element from DOM",()=>{
        cleanupVisualization();
        expect(document.getElementById("geometry-info")).toBeNull();
    });
    it("does not throw when no visualization exists",()=>{
        document.body.innerHTML="";
        expect(()=>cleanupVisualization()).not.toThrow();
    });
    it("handles missing info element gracefully",()=>{
        document.body.innerHTML='<div id="geometry-visualization">vis</div>';
        expect(()=>cleanupVisualization()).not.toThrow();
    });
    it("removes both elements when both exist",()=>{
        document.body.innerHTML='<div id="geometry-visualization">vis</div><div id="geometry-info">info</div>';
        cleanupVisualization();
        expect(document.getElementById("geometry-visualization")).toBeNull();
        expect(document.getElementById("geometry-info")).toBeNull();
    });
    it("does not remove unrelated elements",()=>{
        document.body.innerHTML='<div id="other">keep</div><div id="geometry-visualization">vis</div>';
        cleanupVisualization();
        expect(document.getElementById("other")).not.toBeNull();
    });
    it("handles missing visualization element gracefully",()=>{
        document.body.innerHTML='<div id="geometry-info">info</div>';
        expect(()=>cleanupVisualization()).not.toThrow();
        expect(document.getElementById("geometry-info")).toBeNull();
    });
    it("does not throw when called multiple times",()=>{
        document.body.innerHTML='<div id="geometry-visualization">vis</div><div id="geometry-info">info</div>';
        cleanupVisualization();
        expect(()=>cleanupVisualization()).not.toThrow();
    });
    it("cleans up even when DOM has only text nodes",()=>{
        document.body.innerHTML='text<div id="geometry-visualization">vis</div>';
        cleanupVisualization();
        expect(document.getElementById("geometry-visualization")).toBeNull();
    });
});

type MediaListener=(event: {matches: boolean})=>void;
let mediaQueries: {query: string, matches: boolean, listeners: MediaListener[]}[]=[];
let intersectionCallbacks: ((entries: any[])=>void)[]=[];
let observedTargets: Element[]=[];
let disconnectCount=0;
let tabHidden=false;
let questionArea: HTMLElement|null=null;
let realMatchMedia: any=null;
let realDpr: PropertyDescriptor|undefined;

function installMatchMedia(reduced: boolean): void{
    mediaQueries=[];
    Object.defineProperty(window,"matchMedia",{
        writable:true,
        value:vi.fn((query: string)=>{
            const record={query, matches:query==="(prefers-reduced-motion: reduce)"&&reduced, listeners:[] as MediaListener[]};
            mediaQueries.push(record);
            return {
                media:query,
                get matches(){ return record.matches; },
                addEventListener:(type: string, fn: MediaListener)=>{
                    if (type==="change") record.listeners.push(fn);
                },
                removeEventListener:(type: string, fn: MediaListener)=>{
                    if (type!=="change") return;
                    const at=record.listeners.indexOf(fn);
                    if (at!==-1) record.listeners.splice(at,1);
                },
            };
        }),
    });
}

function fireMedia(query: string, matches: boolean): void{
    for (let record of mediaQueries){
        if (record.query!==query) continue;
        record.matches=matches;
        for (let fn of record.listeners.slice()) fn({matches});
    }
}

function installIntersectionObserver(): void{
    intersectionCallbacks=[];
    observedTargets=[];
    disconnectCount=0;
    (globalThis as any).IntersectionObserver=class{
        constructor(callback: (entries: any[])=>void){ intersectionCallbacks.push(callback); }
        observe(target: Element): void{ observedTargets.push(target); }
        unobserve(): void{}
        disconnect(): void{ disconnectCount++; }
    };
}

function fireIntersection(isIntersecting: boolean): void{
    for (let callback of intersectionCallbacks) callback([{isIntersecting, target:observedTargets[0]}]);
}

function setTabHidden(hidden: boolean): void{
    tabHidden=hidden;
    document.dispatchEvent(new Event("visibilitychange"));
}

function setDevicePixelRatio(value: number): void{
    Object.defineProperty(window,"devicePixelRatio",{configurable:true,value});
}

function rendererMock(): any{
    return (vi.mocked(WebGLRenderer).mock.results.at(-1) as any).value;
}
function cameraMock(): any{
    return (vi.mocked(PerspectiveCamera).mock.results.at(-1) as any).value;
}
function controlsMock(): any{
    return (vi.mocked(OrbitControls).mock.results.at(-1) as any).value;
}
function geometryMock(ctor: unknown): any{
    return ((ctor as {mock: {results: {value: unknown}[]}}).mock.results.at(-1) as {value: unknown}).value;
}

/**
 * Simulates a hand drag: real OrbitControls nudges the camera and dispatches
 * change from inside update(), and the first pointer-down is what starts one.
 */
function keepCameraMoving(): void{
    const cam=cameraMock();
    const controls=controlsMock();
    const changes=controls.addEventListener.mock.calls.filter((call: any[])=>call[0]==="change").map((call: any[])=>call[1] as ()=>void);
    controls.update.mockImplementation(()=>{
        cam.position.x+=0.25;
        for (let change of changes) change();
    });
    for (let change of changes) change();
}

async function start(shape: string, params: any = {}): Promise<void>{
    const pending=createVisualization(shape, params);
    await vi.advanceTimersByTimeAsync(80);
    await pending;
}

describe("shape routing",()=>{
    beforeAll(()=>{
        questionArea=document.createElement("div");
        questionArea.id="question-area";
        document.body.replaceChildren(questionArea);
    });
    it("draws a trigonometric graph on the canvas instead of loading WebGL",async()=>{
        // "graph" has always had a canvas implementation. The router did not list
        // it among the 2D shapes, so a trigonometric graph question loaded a WebGL
        // renderer, found no case for the shape, warned, and removed the whole
        // visualization again: the learner saw no graph at all.
        const warn=vi.spyOn(console,"warn").mockImplementation(()=>{});
        const constructed=vi.mocked(WebGLRenderer).mock.calls.length;
        try{
            await createVisualization("graph",{fn:"sin", a:2, b:3, c:1});
            expect(warn).not.toHaveBeenCalledWith("Unknown 3D shape:","graph");
            // The canvas exists, so the 2D path drew it, and no WebGL renderer was
            // constructed, so the 3D path was never entered.
            expect(document.querySelector("#geometry-canvas")).not.toBeNull();
            expect(vi.mocked(WebGLRenderer).mock.calls.length).toBe(constructed);
        }
        finally{
            warn.mockRestore();
            cleanupVisualization();
        }
    });
});

describe("3D render loop on a phone",()=>{
    beforeAll(()=>{
        questionArea=document.createElement("div");
        questionArea.id="question-area";
        document.body.replaceChildren(questionArea);
    });
    beforeEach(()=>{
        vi.useFakeTimers();
        vi.clearAllMocks();
        realMatchMedia=window.matchMedia;
        realDpr=Object.getOwnPropertyDescriptor(window,"devicePixelRatio");
        document.body.replaceChildren(questionArea!);
        tabHidden=false;
        Object.defineProperty(document,"hidden",{configurable:true,get:()=>tabHidden});
        setDevicePixelRatio(1);
        installMatchMedia(false);
        installIntersectionObserver();
    });
    afterEach(()=>{
        cleanupVisualization();
        vi.useRealTimers();
        delete (globalThis as any).IntersectionObserver;
        Object.defineProperty(window,"matchMedia",{writable:true,value:realMatchMedia});
        if (realDpr) Object.defineProperty(window,"devicePixelRatio",realDpr);
    });
    it("caps the device pixel ratio at two on a 3x display",async()=>{
        setDevicePixelRatio(3);
        await start("sphere",{radius:2});
        expect(rendererMock().setPixelRatio).toHaveBeenCalledWith(2);
    });
    it("re-applies the capped pixel ratio when the display resolution changes",async()=>{
        await start("sphere",{radius:2});
        setDevicePixelRatio(4);
        fireMedia("(resolution: 1dppx)",true);
        expect(rendererMock().setPixelRatio).toHaveBeenLastCalledWith(2);
    });
    it("watches the new ratio after a resolution change so a second rotation is caught",async()=>{
        await start("sphere",{radius:2});
        setDevicePixelRatio(4);
        fireMedia("(resolution: 1dppx)",true);
        expect(mediaQueries.at(-1)!.query).toBe("(resolution: 4dppx)");
    });
    it("stops drawing while the container is offscreen and resumes when it returns",async()=>{
        await start("sphere",{radius:2});
        keepCameraMoving();
        await vi.advanceTimersByTimeAsync(1000);
        expect(rendererMock().render.mock.calls.length).toBeGreaterThan(1);
        fireIntersection(false);
        rendererMock().render.mockClear();
        await vi.advanceTimersByTimeAsync(1000);
        expect(rendererMock().render).not.toHaveBeenCalled();
        fireIntersection(true);
        await vi.advanceTimersByTimeAsync(1000);
        expect(rendererMock().render).toHaveBeenCalled();
    });
    it("stops drawing while the tab is hidden",async()=>{
        await start("sphere",{radius:2});
        keepCameraMoving();
        setTabHidden(true);
        rendererMock().render.mockClear();
        await vi.advanceTimersByTimeAsync(1000);
        expect(rendererMock().render).not.toHaveBeenCalled();
    });
    it("draws the graph exactly once and leaves no loop when motion is reduced",async()=>{
        installMatchMedia(true);
        await start("sphere",{radius:2});
        expect(rendererMock().render).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1000);
        expect(rendererMock().render).toHaveBeenCalledTimes(1);
    });
    it("turns off the camera damping that reduced motion asks us to disable",async()=>{
        installMatchMedia(true);
        await start("sphere",{radius:2});
        expect(controlsMock().enableDamping).toBe(false);
    });
    it("keeps drawing while the camera is moving",async()=>{
        await start("sphere",{radius:2});
        keepCameraMoving();
        await vi.advanceTimersByTimeAsync(1000);
        expect(rendererMock().render.mock.calls.length).toBeGreaterThan(20);
    });
    it("caps the frame rate instead of drawing once per vsync",async()=>{
        await start("sphere",{radius:2});
        keepCameraMoving();
        await vi.advanceTimersByTimeAsync(1000);
        const draws=rendererMock().render.mock.calls.length;
        // 1000ms at the 32ms budget is 31 draws. An uncapped loop would be one
        // draw per 16ms vsync, so the ceiling is the claim being made.
        expect(draws).toBeGreaterThan(25);
        expect(draws).toBeLessThan(45);
    });
    it("stops the loop when the motion setting is turned on mid-scene",async()=>{
        await start("sphere",{radius:2});
        keepCameraMoving();
        await vi.advanceTimersByTimeAsync(1000);
        fireMedia("(prefers-reduced-motion: reduce)",true);
        rendererMock().render.mockClear();
        await vi.advanceTimersByTimeAsync(1000);
        expect(rendererMock().render.mock.calls.length).toBeLessThanOrEqual(1);
        rendererMock().render.mockClear();
        await vi.advanceTimersByTimeAsync(1000);
        expect(rendererMock().render).not.toHaveBeenCalled();
    });
    it("redraws once per input event rather than animating while motion is reduced",async()=>{
        installMatchMedia(true);
        await start("sphere",{radius:2});
        rendererMock().render.mockClear();
        keepCameraMoving();
        await vi.advanceTimersByTimeAsync(1000);
        expect(rendererMock().render.mock.calls.length).toBeLessThanOrEqual(2);
    });
    it("starts drawing again when the motion setting is turned off mid-scene",async()=>{
        installMatchMedia(true);
        await start("sphere",{radius:2});
        keepCameraMoving();
        await vi.advanceTimersByTimeAsync(1000);
        rendererMock().render.mockClear();
        fireMedia("(prefers-reduced-motion: reduce)",false);
        await vi.advanceTimersByTimeAsync(1000);
        expect(rendererMock().render.mock.calls.length).toBeGreaterThan(20);
    });
    it("builds one geometry and one material for the whole point cloud",async()=>{
        await start("points3D",{points:[{x:0,y:0,z:0},{x:1,y:0,z:0},{x:2,y:0,z:0}]});
        expect(SphereGeometry).toHaveBeenCalledTimes(1);
        expect(MeshStandardMaterial).toHaveBeenCalledTimes(1);
    });
    it("disposes the GPU buffers of non-mesh objects in the scene",async()=>{
        await start("line3D",{point:[0,0,0],direction:[1,1,1],t:2});
        const lineGeometry=geometryMock(BufferGeometry);
        const grid=geometryMock(GridHelper);
        const axes=geometryMock(AxesHelper);
        cleanupVisualization();
        expect(lineGeometry.dispose).toHaveBeenCalled();
        expect(grid.geometry.dispose).toHaveBeenCalled();
        expect(axes.material.dispose).toHaveBeenCalled();
    });
    it("cancels the loop and disposes the renderer and controls on teardown",async()=>{
        await start("sphere",{radius:2});
        keepCameraMoving();
        const renderer=rendererMock();
        const controls=controlsMock();
        cleanupVisualization();
        expect(renderer.dispose).toHaveBeenCalled();
        expect(controls.dispose).toHaveBeenCalled();
        expect(controls.removeEventListener).toHaveBeenCalledWith("change",expect.any(Function));
        renderer.render.mockClear();
        await vi.advanceTimersByTimeAsync(1000);
        expect(renderer.render).not.toHaveBeenCalled();
    });
    it("removes the motion, resolution and visibility listeners on teardown",async()=>{
        const removeSpy=vi.spyOn(document,"removeEventListener");
        await start("sphere",{radius:2});
        cleanupVisualization();
        expect(removeSpy).toHaveBeenCalledWith("visibilitychange",expect.any(Function));
        expect(mediaQueries.every(record=>record.listeners.length===0)).toBe(true);
        expect(disconnectCount).toBe(1);
        removeSpy.mockRestore();
    });
});
