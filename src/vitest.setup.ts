import {vi} from "vitest";
vi.mock("@tauri-apps/api/core",()=>({
	invoke: vi.fn().mockResolvedValue(undefined),
}));
// Mock three.js to prevent OOM from loading the large library
vi.mock("three",()=>{
	const mockVector3={
		x:0,y:0,z:0,
		set:vi.fn().mockReturnThis(),
		copy:vi.fn().mockReturnThis(),
		clone:vi.fn().mockReturnThis(),
	};
	return {
		Scene:vi.fn().mockImplementation(()=>({
			add:vi.fn(),
			traverse:vi.fn(),
			position:mockVector3,
		})),
		PerspectiveCamera:vi.fn().mockImplementation(()=>({
			position:mockVector3,
			lookAt:vi.fn(),
			updateProjectionMatrix:vi.fn(),
			aspect:1,
		})),
		WebGLRenderer:vi.fn().mockImplementation(()=>({
			setSize:vi.fn(),
			setClearColor:vi.fn(),
			setPixelRatio:vi.fn(),
			render:vi.fn(),
			dispose:vi.fn(),
			domElement:document.createElement("canvas"),
		})),
		Mesh:vi.fn().mockImplementation(()=>({
			position:mockVector3,
			geometry:{dispose:vi.fn()},
			material:{dispose:vi.fn()},
		})),
		MeshStandardMaterial:vi.fn(),
		SphereGeometry:vi.fn(),
		BoxGeometry:vi.fn(),
		CylinderGeometry:vi.fn(),
		ConeGeometry:vi.fn(),
		TorusGeometry:vi.fn(),
		BufferGeometry:vi.fn().mockImplementation(()=>({
			setFromPoints:vi.fn().mockReturnThis(),
		})),
		LineBasicMaterial:vi.fn(),
		Line:vi.fn(),
		Group:vi.fn().mockImplementation(()=>({
			add:vi.fn(),
			position:mockVector3,
		})),
		AmbientLight:vi.fn(),
		DirectionalLight:vi.fn().mockImplementation(()=>({
			position:mockVector3,
		})),
		GridHelper:vi.fn(),
		AxesHelper:vi.fn(),
		Vector3:vi.fn().mockImplementation((x=0,y=0,z=0)=>({
			x,y,z,
			set:vi.fn().mockReturnThis(),
			copy:vi.fn().mockReturnThis(),
			clone:vi.fn().mockReturnThis(),
		})),
		Box3:vi.fn().mockImplementation(()=>({
			setFromObject:vi.fn().mockReturnThis(),
			getBoundingSphere:vi.fn().mockReturnValue({radius:3}),
		})),
		Sphere:vi.fn(),
	};
});
vi.mock("three/examples/jsm/controls/OrbitControls.js",()=>({
	OrbitControls:vi.fn().mockImplementation(()=>({
		enableDamping:true,
		dampingFactor:0.05,
		screenSpacePanning:true,
		maxPolarAngle:Math.PI/2,
		target:{x:0,y:0,z:0},
		update:vi.fn(),
		dispose:vi.fn(),
	})),
}));
vi.mock("three/examples/jsm/renderers/CSS2DRenderer.js",()=>({
	CSS2DRenderer:vi.fn().mockImplementation(()=>({
		setSize:vi.fn(),
		render:vi.fn(),
		domElement:document.createElement("div"),
	})),
	CSS2DObject:vi.fn().mockImplementation(()=>({
		position:{x:0,y:0,z:0,set:vi.fn(),copy:vi.fn()},
	})),
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
