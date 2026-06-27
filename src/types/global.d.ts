/// <reference types="vite/client" />
export interface Topic{
	id: string;
	name: string;
	icon: string;
	category: string;
}
export interface CorrectAnswer{
	correct: string;
	alternate?: string;
	display?: string;
	choices?: string[];
}
export interface MathJaxConfig{
	tex:{
		inlineMath: string[][];
		displayMath: string[][]
	};
	svg:{
		fontCache: string;
	};
	typeset?: (els: Element[])=>void;
	typesetPromise?: (els?: Element[])=>Promise<void>;
	startup?:{
		promise: Promise<void>;
	};
}
declare global{
	interface Window{
		MathJax?: MathJaxConfig;
		correctAnswer: CorrectAnswer;
		expectedFormat: string;
		hasQuestion: boolean;
		__TAURI__?: any;
		katex?: any;
	}
}
declare module "three/examples/jsm/controls/OrbitControls.js";
declare module "three/examples/jsm/renderers/CSS2DRenderer.js";
export {};