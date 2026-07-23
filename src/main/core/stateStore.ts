import {dom} from "./domRegistry";
export class AppState{
	private _selectedTopic: string|null=null;
	private _currentMode: "single"|"mental"="single";
	private _sessionActive: boolean=false;
	private _sessionPaused: boolean=false;
	private _sessionScore={correct:0,total:0};
	private _sessionTimer: ReturnType<typeof setInterval>|null=null;
	private _timeLeft: number=30;
	private _maxQuestions: number=5;
	private _currentDifficulty: string="medium";
	private _mentalNextQuestionTimeout: ReturnType<typeof setTimeout>|null=null;
	private _autocontinue: boolean=false;
	private _scope: string="simple";
	private _shuffle: boolean=false;
	private _mentalScope: string="simple";
	private _mentalShuffle: boolean=false;
	private _autoTimeout: ReturnType<typeof setTimeout>|null=null;
	private _generateDebounceTimeout: ReturnType<typeof setTimeout>|null=null;
	private _previewTimeout: ReturnType<typeof setTimeout>|null=null;
	private _modeButtons: (HTMLButtonElement|null)[]=([] as (HTMLButtonElement|null)[]).concat(dom.buttons.modeSingleBtn,dom.buttons.modeMentalBtn);
	private _unlimitedMode: boolean=false;
	private _totalTimeSpent: number=0;
	private _answeredQuestionsCount: number=0;
	private _currentQuestionStartTime: number|null=null;
	private _mcqMode: boolean=false;
	private _mcqChoices: string[]=[];
	private _userPickedDifficulty: boolean=false;
	private _answering: boolean=false;
	private _isGenerating: boolean=false;
	private _weakTopicQueue: string[]=[];
	get selectedTopic(): string|null{return this._selectedTopic;}
	set selectedTopic(value: string|null){this._selectedTopic=value;}
	get currentMode(): "single"|"mental"{return this._currentMode;}
	set currentMode(value: "single"|"mental"){this._currentMode=value;}
	get sessionActive(): boolean{return this._sessionActive;}
	set sessionActive(value: boolean){this._sessionActive=value;}
	get sessionPaused(): boolean{return this._sessionPaused;}
	set sessionPaused(value: boolean){this._sessionPaused=value;}
	get sessionScore(): {correct:number,total:number}{return this._sessionScore;}
	set sessionScore(value: {correct:number,total:number}){this._sessionScore=value;}
	get sessionTimer(): ReturnType<typeof setInterval>|null{return this._sessionTimer;}
	set sessionTimer(value: ReturnType<typeof setInterval>|null){this._sessionTimer=value;}
	get timeLeft(): number{return this._timeLeft;}
	set timeLeft(value: number){this._timeLeft=value;}
	get maxQuestions(): number{return this._maxQuestions;}
	set maxQuestions(value: number){this._maxQuestions=value;}
	get currentDifficulty(): string{return this._currentDifficulty;}
	set currentDifficulty(value: string){this._currentDifficulty=value;}
	get mentalNextQuestionTimeout(): ReturnType<typeof setTimeout>|null{return this._mentalNextQuestionTimeout;}
	set mentalNextQuestionTimeout(value: ReturnType<typeof setTimeout>|null){this._mentalNextQuestionTimeout=value;}
	get autocontinue(): boolean{return this._autocontinue;}
	set autocontinue(value: boolean){this._autocontinue=value;}
	get scope(): string{return this._scope;}
	set scope(value: string){this._scope=value;}
	get shuffle(): boolean{return this._shuffle;}
	set shuffle(value: boolean){this._shuffle=value;}
	get mentalScope(): string{return this._mentalScope;}
	set mentalScope(value: string){this._mentalScope=value;}
	get mentalShuffle(): boolean{return this._mentalShuffle;}
	set mentalShuffle(value: boolean){this._mentalShuffle=value;}
	get autoTimeout(): ReturnType<typeof setTimeout>|null{return this._autoTimeout;}
	set autoTimeout(value: ReturnType<typeof setTimeout>|null){this._autoTimeout=value;}
	get generateDebounceTimeout(): ReturnType<typeof setTimeout>|null{return this._generateDebounceTimeout;}
	set generateDebounceTimeout(value: ReturnType<typeof setTimeout>|null){this._generateDebounceTimeout=value;}
	get previewTimeout(): ReturnType<typeof setTimeout>|null{return this._previewTimeout;}
	set previewTimeout(value: ReturnType<typeof setTimeout>|null){this._previewTimeout=value;}
	get modeButtons(): (HTMLButtonElement|null)[]{return this._modeButtons;}
	set modeButtons(value: (HTMLButtonElement|null)[]){this._modeButtons=value;}
	get unlimitedMode(): boolean{return this._unlimitedMode;}
	set unlimitedMode(value: boolean){this._unlimitedMode=value;}
	get totalTimeSpent(): number{return this._totalTimeSpent;}
	set totalTimeSpent(value: number){this._totalTimeSpent=value;}
	get answeredQuestionsCount(): number{return this._answeredQuestionsCount;}
	set answeredQuestionsCount(value: number){this._answeredQuestionsCount=value;}
	get currentQuestionStartTime(): number|null{return this._currentQuestionStartTime;}
	set currentQuestionStartTime(value: number|null){this._currentQuestionStartTime=value;}
	get mcqMode(): boolean{return this._mcqMode;}
	set mcqMode(value: boolean){this._mcqMode=value;}
	get mcqChoices(): string[]{return this._mcqChoices;}
	set mcqChoices(value: string[]){this._mcqChoices=value;}
	get userPickedDifficulty(): boolean{return this._userPickedDifficulty;}
	set userPickedDifficulty(value: boolean){this._userPickedDifficulty=value;}
	get answering(): boolean{return this._answering;}
	set answering(value: boolean){this._answering=value;}
	get isGenerating(): boolean{return this._isGenerating;}
	set isGenerating(value: boolean){this._isGenerating=value;}
	get weakTopicQueue(): string[]{return this._weakTopicQueue;}
	set weakTopicQueue(value: string[]){this._weakTopicQueue=value;}
	get hasSelectedTopic(): boolean{
		return this._selectedTopic!==null&&this._selectedTopic.length>0;
	}
	get isMentalMode(): boolean{
		return this._currentMode==="mental";
	}
	get isSingleMode(): boolean{
		return this._currentMode==="single";
	}
	get isSessionActive(): boolean{
		return this._sessionActive;
	}
	get sessionScoreRatio(): number{
		return this._sessionScore.total>0?this._sessionScore.correct/this._sessionScore.total:0;
	}
	get scoreDisplayText(): string{
		return this._sessionScore.correct+"/"+this._sessionScore.total;
	}
	get isUnlimitedMode(): boolean{
		return this._unlimitedMode;
	}
	get hasWeakTopics(): boolean{
		return this._weakTopicQueue.length>0;
	}
	dequeueWeakTopic(): string|undefined{
		return this._weakTopicQueue.shift();
	}
	getWeakTopicCount(): number{
		return this._weakTopicQueue.length;
	}
	reset(): void{
		this._selectedTopic=null;
		this._currentMode="single";
		this._sessionActive=false;
		this._sessionPaused=false;
		this._sessionScore={correct:0,total:0};
		this._timeLeft=30;
		this._maxQuestions=5;
		this._currentDifficulty="medium";
		this._autocontinue=false;
		this._scope="simple";
		this._shuffle=false;
		this._mentalScope="simple";
		this._mentalShuffle=false;
		this._unlimitedMode=false;
		this._totalTimeSpent=0;
		this._answeredQuestionsCount=0;
		this._currentQuestionStartTime=null;
		this._mcqMode=false;
		this._mcqChoices=[];
		this._userPickedDifficulty=false;
		this._answering=false;
		this._isGenerating=false;
		this._weakTopicQueue=[];
	}
}
export let appState: AppState=new AppState();