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
export type RngFn=()=>number;
/**
 * The hint ladder attached to a question. Rungs are revealed on demand and the
 * ladder always bottoms out, because a hint sequence that never concedes the
 * answer is the assistance dilemma: the learner learns to wait for help rather
 * than to attempt.
 */
export interface HintLadder{
    /** Each rung names the decision without performing it. Three rungs, then a concession. */
    rungs: string[];
    /** The final rung, which gives the answer and is always present. */
    concede: string;
}
export interface QuestionDto{
    latex: string;
    correct: string;
    alternate?: string;
    display?: string;
    choices?: string[];
    expectedFormat?: string;
    hint?: string;
    /** The sub-skill within the topic that was actually practised, used for per-skill scheduling. */
    subskill?: string;
    /** A worked solution shown on request, separate from the hint ladder. */
    solution?: string[];
    /** The misconception this question is designed to surface, when one applies. */
    misconception?: string;
    /** On-demand hints, revealed one rung at a time. */
    hints?: HintLadder;
    /** Whether the learner may skip this question without penalty, for MCQ only. */
    skippable?: boolean;
    visualization?: { shape: string; params?: Record<string, unknown> };
}
export interface MathJaxConfig{
    tex:{
        inlineMath: string[][];
        displayMath: string[][]
    };
    chtml:{
        fontCache: string;
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
        __TAURI_INTERNALS__?: Record<string, unknown>;
        katex?: any;
    }
}
declare module "three/examples/jsm/controls/OrbitControls.js";
declare module "three/examples/jsm/renderers/CSS2DRenderer.js";
export {};