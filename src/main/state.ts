import * as dom from "./dom";
export let selectedTopic: string|null=null;
export let currentMode: "single"|"mental"="single";
export let sessionActive: boolean=false;
export let sessionPaused: boolean=false;
export let sessionScore={correct:0,total:0};
export let sessionTimer: ReturnType<typeof setInterval>|null=null;
export let timeLeft: number=30;
export let maxQuestions: number=5;
export let currentDifficulty: string="medium";
export let mentalNextQuestionTimeout: ReturnType<typeof setTimeout>|null=null;
export let autocontinue: boolean=false;
export let scope: string="simple";
export let shuffle: boolean=false;
export let mentalScope: string="simple";
export let mentalShuffle: boolean=false;
export let autoTimeout: ReturnType<typeof setTimeout>|null=null;
export let generateDebounceTimeout: ReturnType<typeof setTimeout>|null=null;
export let previewTimeout: ReturnType<typeof setTimeout>|null=null;
export let modeButtons=[dom.modeSingleBtn,dom.modeMentalBtn];
export let unlimitedMode: boolean=false;
export let totalTimeSpent: number=0;
export let answeredQuestionsCount: number=0;
export let currentQuestionStartTime: number|null=null;
export let mcqMode: boolean=false;
export let mcqChoices: string[]=[];

export function setSelectedTopic(topicId: string|null): void{
	selectedTopic=topicId;
}
export function setCurrentMode(mode: "single"|"mental"): void{
	currentMode=mode;
}
export function setSessionActive(active: boolean): void{
	sessionActive=active;
}
export function setSessionPaused(paused: boolean): void{
	sessionPaused=paused;
}
export function setSessionScore(score: {correct:number,total:number}): void{
	sessionScore=score;
}
export function setSessionTimer(timer: ReturnType<typeof setInterval>|null): void{
	sessionTimer=timer;
}
export function setTimeLeft(time: number): void{
	timeLeft=time;
}
export function setMaxQuestions(max: number): void{
	maxQuestions=max;
}
export function setCurrentDifficulty(diff: string): void{
	currentDifficulty=diff;
}
export function setMentalNextQuestionTimeout(timeout: ReturnType<typeof setTimeout>|null): void{
	mentalNextQuestionTimeout=timeout;
}
export function setAutocontinue(value: boolean): void{
	autocontinue=value;
}
export function setScope(value: string): void{
	scope=value;
}
export function setShuffle(value: boolean): void{
	shuffle=value;
}
export function setMentalScope(value: string): void{
	mentalScope=value;
}
export function setMentalShuffle(value: boolean): void{
	mentalShuffle=value;
}
export function setAutoTimeout(timeout: ReturnType<typeof setTimeout>|null): void{
	autoTimeout=timeout;
}
export function setGenerateDebounceTimeout(timeout: ReturnType<typeof setTimeout>|null): void{
	generateDebounceTimeout=timeout;
}
export function setPreviewTimeout(timeout: ReturnType<typeof setTimeout>|null): void{
	previewTimeout=timeout;
}
export function setUnlimitedMode(value: boolean): void{
	unlimitedMode=value;
}
export function setTotalTimeSpent(value: number): void{
	totalTimeSpent=value;
}
export function setAnsweredQuestionsCount(value: number): void{
	answeredQuestionsCount=value;
}
export function setCurrentQuestionStartTime(value: number|null): void{
	currentQuestionStartTime=value;
}
export function setMcqMode(value: boolean): void{
	mcqMode=value;
}
export function setMcqChoices(choices: string[]): void{
	mcqChoices=choices;
}