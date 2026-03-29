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
	typeset: ()=>void;
	typesetPromise?: (elements?: HTMLElement[])=>Promise<void>;
}
declare global{
	interface Window{
		MathJax: MathJaxConfig;
		correctAnswer: CorrectAnswer;
		expectedFormat: string;
		hasQuestion: boolean;
		__TAURI__?: any;
		katex: any;
	}
}
declare module "three";
declare module "three/addons/controls/OrbitControls.js";
export {};