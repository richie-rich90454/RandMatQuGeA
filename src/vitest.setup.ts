import {vi} from "vitest";
vi.mock("@tauri-apps/api/core",()=>({
    invoke: vi.fn().mockResolvedValue(undefined),
}));
// Mock three.js to prevent OOM from loading the large library.
// Every implementation here is a `function`, not an arrow, because vitest
// builds a constructor out of the implementation and an arrow is not callable
// with `new`.
vi.mock("three",()=>{
    const mockVector3={
        x:0,y:0,z:0,
        set:vi.fn().mockReturnThis(),
        copy:vi.fn().mockReturnThis(),
        clone:vi.fn().mockReturnThis(),
    };
    // GridHelper, AxesHelper and Line are all LineSegments/Line, so they carry
    // GPU buffers just as a Mesh does, and they hold the geometry and material
    // they were constructed with, which is what teardown has to dispose.
    function mockDisposable(geometry: any={dispose:vi.fn()}, material: any={dispose:vi.fn()}){
        return {geometry, material, position:mockVector3};
    }
    function mockMaterial(){
        return {dispose:vi.fn()};
    }
    return {
        Scene:vi.fn().mockImplementation(function(){
            const children: any[]=[];
            return {
                add:(child: any)=>{ children.push(child); },
                traverse:(visit: any)=>{ for (let child of children) visit(child); },
                position:mockVector3,
            };
        }),
        PerspectiveCamera:vi.fn().mockImplementation(function(){
            return {
                position:mockVector3,
                quaternion:{x:0,y:0,z:0,w:1},
                lookAt:vi.fn(),
                updateProjectionMatrix:vi.fn(),
                aspect:1,
            };
        }),
        WebGLRenderer:vi.fn().mockImplementation(function(){
            return {
                setSize:vi.fn(),
                setClearColor:vi.fn(),
                setPixelRatio:vi.fn(),
                render:vi.fn(),
                dispose:vi.fn(),
                domElement:document.createElement("canvas"),
            };
        }),
        Mesh:vi.fn().mockImplementation(function(geometry: any, material: any){ return mockDisposable(geometry, material); }),
        MeshStandardMaterial:vi.fn().mockImplementation(mockMaterial),
        SphereGeometry:vi.fn(),
        BoxGeometry:vi.fn(),
        CylinderGeometry:vi.fn(),
        ConeGeometry:vi.fn(),
        TorusGeometry:vi.fn(),
        BufferGeometry:vi.fn().mockImplementation(function(){
            return {
                setFromPoints:vi.fn().mockReturnThis(),
                dispose:vi.fn(),
            };
        }),
        LineBasicMaterial:vi.fn().mockImplementation(mockMaterial),
        Line:vi.fn().mockImplementation(function(geometry: any, material: any){ return mockDisposable(geometry, material); }),
        Group:vi.fn().mockImplementation(function(){
            return {
                add:vi.fn(),
                position:mockVector3,
            };
        }),
        AmbientLight:vi.fn(),
        DirectionalLight:vi.fn().mockImplementation(function(){
            return {position:mockVector3};
        }),
        GridHelper:vi.fn().mockImplementation(function(){ return mockDisposable(); }),
        AxesHelper:vi.fn().mockImplementation(function(){ return mockDisposable(); }),
        Vector3:vi.fn().mockImplementation(function(x=0, y=0, z=0){
            return {
                x,y,z,
                set:vi.fn().mockReturnThis(),
                copy:vi.fn().mockReturnThis(),
                clone:vi.fn().mockReturnThis(),
            };
        }),
        Box3:vi.fn().mockImplementation(function(){
            return {
                setFromObject:vi.fn().mockReturnThis(),
                getBoundingSphere:vi.fn().mockReturnValue({radius:3, center:{x:0,y:0,z:0,copy:vi.fn()}}),
            };
        }),
        Sphere:vi.fn(),
    };
});
vi.mock("three/examples/jsm/controls/OrbitControls.js",()=>({
    OrbitControls:vi.fn().mockImplementation(function(){
        return {
            enableDamping:true,
            dampingFactor:0.05,
            screenSpacePanning:true,
            maxPolarAngle:Math.PI/2,
            target:{x:0,y:0,z:0,copy:vi.fn()},
            update:vi.fn(),
            addEventListener:vi.fn(),
            removeEventListener:vi.fn(),
            dispose:vi.fn(),
        };
    }),
}));
vi.mock("three/examples/jsm/renderers/CSS2DRenderer.js",()=>({
    CSS2DRenderer:vi.fn().mockImplementation(function(){
        return {
            setSize:vi.fn(),
            render:vi.fn(),
            domElement:document.createElement("div"),
        };
    }),
    CSS2DObject:vi.fn().mockImplementation(function(){
        return {
            position:{x:0,y:0,z:0,set:vi.fn(),copy:vi.fn()},
        };
    }),
}));
(globalThis as any).__TAURI_INTERNALS__={};
(globalThis as any).__TAURI__={};
Object.defineProperty(window,"matchMedia",{
    writable:true,
    value:vi.fn().mockImplementation((query:string)=>({
        matches:false,
        media:query,
        onchange:null,
        addListener:vi.fn(),
        removeListener:vi.fn(),
        addEventListener:vi.fn(),
        removeEventListener:vi.fn(),
        dispatchEvent:vi.fn(),
    })),
});
// Mock ResizeObserver for geometry visualization code
(globalThis as any).ResizeObserver=class ResizeObserver{
    constructor(_callback: ResizeObserverCallback){}
    observe(_target: Element, _options?: ResizeObserverOptions): void{}
    unobserve(_target: Element): void{}
    disconnect(): void{}
};
// Mock HTMLCanvasElement.getContext for geometry visualization
HTMLCanvasElement.prototype.getContext=vi.fn().mockReturnValue({
    canvas:document.createElement("canvas"),
    clearRect:vi.fn(),
    fillRect:vi.fn(),
    fillText:vi.fn(),
    beginPath:vi.fn(),
    arc:vi.fn(),
    fill:vi.fn(),
    stroke:vi.fn(),
    moveTo:vi.fn(),
    lineTo:vi.fn(),
    closePath:vi.fn(),
    translate:vi.fn(),
    scale:vi.fn(),
    rotate:vi.fn(),
    setTransform:vi.fn(),
    drawImage:vi.fn(),
    createLinearGradient:vi.fn().mockReturnValue({addColorStop:vi.fn()}),
    save:vi.fn(),
    restore:vi.fn(),
    measureText:vi.fn().mockReturnValue({width:10}),
    font:"",
    textAlign:"start",
    textBaseline:"alphabetic",
    fillStyle:"#000",
    strokeStyle:"#000",
    lineWidth:1,
    lineCap:"butt",
    lineJoin:"miter",
    miterLimit:10,
    globalAlpha:1,
    globalCompositeOperation:"source-over",
} as unknown as CanvasRenderingContext2D);
