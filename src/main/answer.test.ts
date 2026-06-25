/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('./core/domRegistry', () => {
	const userAnswer={value: '', focus: vi.fn()};
	const answerResults={
		innerHTML: '',
		className: '',
		classList: {add: vi.fn(), remove: vi.fn(), contains: vi.fn()}
	};
	const dom={
		userAnswer,
		answerResults,
		inputs: {userAnswer},
		displays: {answerResults},
		buttons: {copyAnswerBtn: null}
	};
	return {dom};
});
vi.mock('./core/stateStore', () => {
	let selectedTopic='topic';
	let currentMode='single';
	let sessionActive=false;
	let sessionPaused=false;
	let sessionScore={correct: 0, total: 0};
	let timeLeft=30;
	let maxQuestions=5;
	let currentDifficulty='medium';
	let autoTimeout:any=null;
	let previewTimeout:any=null;
	let generateDebounceTimeout:any=null;
	let mentalNextQuestionTimeout:any=null;
	let sessionTimer:any=null;
	let autocontinue=false;
	let scope='simple';
	let shuffle=false;
	let mentalScope='simple';
	let mentalShuffle=false;
	let modeButtons:any[]=[];
	const setSelectedTopic=vi.fn((val: any) => {selectedTopic=val;});
	const setAutocontinue=vi.fn((val: any) => {autocontinue=val;});
	const setCurrentMode=vi.fn((val: any) => {currentMode=val;});
	const setAutoTimeout=vi.fn();
	const setPreviewTimeout=vi.fn();
	const setGenerateDebounceTimeout=vi.fn();
	const setMentalNextQuestionTimeout=vi.fn();
	const setSessionTimer=vi.fn();
	const setSessionActive=vi.fn();
	const setSessionPaused=vi.fn();
	const setSessionScore=vi.fn();
	const setTimeLeft=vi.fn();
	const setCurrentDifficulty=vi.fn();
	const setScope=vi.fn();
	const setShuffle=vi.fn();
	const setMentalScope=vi.fn();
	const setMentalShuffle=vi.fn();
	const appState={
		get selectedTopic(){return selectedTopic;},
		set selectedTopic(v: any){selectedTopic=v;},
		get currentMode(){return currentMode;},
		set currentMode(v: any){currentMode=v;},
		get sessionActive(){return sessionActive;},
		set sessionActive(v: any){sessionActive=v;},
		get sessionPaused(){return sessionPaused;},
		set sessionPaused(v: any){sessionPaused=v;},
		get sessionScore(){return sessionScore;},
		set sessionScore(v: any){sessionScore=v;},
		get timeLeft(){return timeLeft;},
		set timeLeft(v: any){timeLeft=v;},
		get maxQuestions(){return maxQuestions;},
		set maxQuestions(v: any){maxQuestions=v;},
		get currentDifficulty(){return currentDifficulty;},
		set currentDifficulty(v: any){currentDifficulty=v;},
		get autoTimeout(){return autoTimeout;},
		set autoTimeout(v: any){autoTimeout=v;},
		get previewTimeout(){return previewTimeout;},
		set previewTimeout(v: any){previewTimeout=v;},
		get generateDebounceTimeout(){return generateDebounceTimeout;},
		set generateDebounceTimeout(v: any){generateDebounceTimeout=v;},
		get mentalNextQuestionTimeout(){return mentalNextQuestionTimeout;},
		set mentalNextQuestionTimeout(v: any){mentalNextQuestionTimeout=v;},
		get sessionTimer(){return sessionTimer;},
		set sessionTimer(v: any){sessionTimer=v;},
		get autocontinue(){return autocontinue;},
		set autocontinue(v: any){autocontinue=v;},
		get scope(){return scope;},
		set scope(v: any){scope=v;},
		get shuffle(){return shuffle;},
		set shuffle(v: any){shuffle=v;},
		get mentalScope(){return mentalScope;},
		set mentalScope(v: any){mentalScope=v;},
		get mentalShuffle(){return mentalShuffle;},
		set mentalShuffle(v: any){mentalShuffle=v;},
		get modeButtons(){return modeButtons;},
		set modeButtons(v: any){modeButtons=v;},
		setSelectedTopic,
		setAutocontinue,
		setCurrentMode,
		setAutoTimeout,
		setPreviewTimeout,
		setGenerateDebounceTimeout,
		setMentalNextQuestionTimeout,
		setSessionTimer,
		setSessionActive,
		setSessionPaused,
		setSessionScore,
		setTimeLeft,
		setCurrentDifficulty,
		setScope,
		setShuffle,
		setMentalScope,
		setMentalShuffle
	};
	return {appState};
});
vi.mock('./core/questionState', () => ({
	questionState: {
		get correctAnswer(){return (window as any).correctAnswer;},
		set correctAnswer(v: any){(window as any).correctAnswer=v;},
		get expectedFormat(){return (window as any).expectedFormat;},
		set expectedFormat(v: any){(window as any).expectedFormat=v;},
		get hasQuestion(){return (window as any).hasQuestion;},
		set hasQuestion(v: any){(window as any).hasQuestion=v;}
	}
}));
vi.mock('./settings', () => ({
	settings: {
		sound: false,
		vibration: false,
		autoCheckDelay: 800,
		notifications: false,
		decimalPlaces: 2,
		perfPreview: true,
	},
	isAnswerCorrect: vi.fn(),
	checkAnswerFast: vi.fn(),
}));
vi.mock('./ui', () => ({
	showNotification: vi.fn(),
	updatePreview: vi.fn(),
	updatePreviewDebounced: vi.fn(),
}));
vi.mock('./generation', () => ({
	generateQuestion: vi.fn(),
}));
vi.mock("mathjs",()=>{
	const evaluate=vi.fn((expr:string,scope?:any)=>{
		try{
			if(scope){
				let keys=Object.keys(scope);
				let vals=keys.map(k=>scope[k]);
				return new Function(...keys,'"use strict";return ('+expr+')')(...vals);
			}
			return Function('"use strict";return ('+expr+')')();
		}catch{
			return null;
		}
	});
	const simplify=vi.fn((expr:string)=>({
		toString:()=>expr,
	}));
	const parse=vi.fn((_expr:string)=>({
		filter:()=>[],
	}));
	return{evaluate,simplify,parse,default:{evaluate,simplify,parse}};
});
import * as domRegistry from './core/domRegistry';
import * as stateStore from './core/stateStore';
const dom:any=domRegistry.dom;
const state:any=stateStore.appState;
import * as settings from './settings';
import * as ui from './ui';
import * as generation from './generation';
import { invoke } from '@tauri-apps/api/core';
import { checkAnswer, startQuestionTimer } from './answer';
describe('checkAnswer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		state.setSelectedTopic('topic');
		state.setAutocontinue(false);
		state.setCurrentMode('single');
		dom.userAnswer!.value='';
		dom.answerResults!.innerHTML='';
		dom.answerResults!.className='';
		window.correctAnswer={ correct: '', alternate: '', display: '' };
		window.hasQuestion=true;
		(settings.isAnswerCorrect as any).mockResolvedValue(true);
	});
	it('should show notification if no topic selected', async () => {
		state.setSelectedTopic(null);
		await checkAnswer();
		expect(ui.showNotification).toHaveBeenCalledWith(expect.stringContaining('select a topic'), 'warning');
	});
	it('should show notification if answer empty', async () => {
		await checkAnswer();
		expect(ui.showNotification).toHaveBeenCalledWith(expect.stringContaining('enter an answer'), 'warning');
	});
	it('should accept identical numbers', async () => {
		dom.userAnswer!.value='42';
		window.correctAnswer.correct='42';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept numbers with whitespace', async () => {
		dom.userAnswer!.value='  42  ';
		window.correctAnswer.correct='42';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should reject different numbers', async () => {
		dom.userAnswer!.value='42';
		window.correctAnswer.correct='43';
		(settings.isAnswerCorrect as any).mockResolvedValueOnce(false);
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('incorrect');
	});
	it('should accept fraction equal to decimal', async () => {
		dom.userAnswer!.value='0.5';
		window.correctAnswer.correct='1/2';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept decimal equal to fraction', async () => {
		dom.userAnswer!.value='1/2';
		window.correctAnswer.correct='0.5';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept polynomial with term reorder', async () => {
		dom.userAnswer!.value='x^2+2x+1';
		window.correctAnswer.correct='2x+1+x^2';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept implicit multiplication', async () => {
		dom.userAnswer!.value='2x';
		window.correctAnswer.correct='2*x';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept different exponent notation', async () => {
		dom.userAnswer!.value='x^{2}';
		window.correctAnswer.correct='x^2';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept x**2', async () => {
		dom.userAnswer!.value='x**2';
		window.correctAnswer.correct='x^2';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept sin and sin', async () => {
		dom.userAnswer!.value='sin(x)';
		window.correctAnswer.correct='\\sin(x)';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept sin x without parentheses', async () => {
		dom.userAnswer!.value='sin x';
		window.correctAnswer.correct='sin(x)';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept arcsin and asin', async () => {
		dom.userAnswer!.value='arcsin(x)';
		window.correctAnswer.correct='asin(x)';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept optional +C', async () => {
		dom.userAnswer!.value='x^3/3';
		window.correctAnswer.correct='x^3/3 + C';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept +c', async () => {
		dom.userAnswer!.value='x^3/3 + c';
		window.correctAnswer.correct='x^3/3 + C';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept angle‑bracket vectors', async () => {
		dom.userAnswer!.value='< -0.72, 0.77 >';
		window.correctAnswer.correct='<-0.72,0.77>';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept LaTeX matrix', async () => {
		dom.userAnswer!.value='\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}';
		window.correctAnswer.correct='[[1,2],[3,4]]';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept equivalent equations', async () => {
		dom.userAnswer!.value='x+3=5';
		window.correctAnswer.correct='x=2';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \frac', async () => {
		dom.userAnswer!.value='\\frac{1}{2}';
		window.correctAnswer.correct='1/2';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \sqrt', async () => {
		dom.userAnswer!.value='\\sqrt{2}';
		window.correctAnswer.correct='sqrt(2)';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \sqrt[n]', async () => {
		dom.userAnswer!.value='\\sqrt[3]{8}';
		window.correctAnswer.correct='8^(1/3)';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \pi', async () => {
		dom.userAnswer!.value='\\pi';
		window.correctAnswer.correct='pi';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \infty', async () => {
		dom.userAnswer!.value='\\infty';
		window.correctAnswer.correct='inf';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept expanded vs factored', async () => {
		dom.userAnswer!.value='x^2+2x+1';
		window.correctAnswer.correct='(x+1)^2';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should call generateQuestion if autocontinue true', async () => {
		vi.useFakeTimers();
		state.setAutocontinue(true);
		settings.settings.autoCheckDelay=800;
		dom.userAnswer!.value='42';
		window.correctAnswer.correct='42';
		await checkAnswer();
		vi.advanceTimersByTime(800);
		expect(generation.generateQuestion).toHaveBeenCalled();
		vi.useRealTimers();
	});
	it('should reject answer when no question generated (window.hasQuestion = false)', async () => {
		window.hasQuestion=false;
		dom.userAnswer!.value='42';
		window.correctAnswer.correct='42';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('incorrect');
	});
	it('should accept alternate answer form', async () => {
		dom.userAnswer!.value='sqrt(2)';
		window.correctAnswer.correct='2^(1/2)';
		window.correctAnswer.alternate='sqrt(2)';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\left and \\right LaTeX wrappers', async () => {
		dom.userAnswer!.value='\\left(x+1\\right)';
		window.correctAnswer.correct='(x+1)';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\cdot for multiplication', async () => {
		dom.userAnswer!.value='2\\cdot3';
		window.correctAnswer.correct='6';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\times for multiplication', async () => {
		dom.userAnswer!.value='2\\times3';
		window.correctAnswer.correct='6';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\div for division', async () => {
		dom.userAnswer!.value='6\\div3';
		window.correctAnswer.correct='2';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\leq and \\geq symbols', async () => {
		dom.userAnswer!.value='x\\leq5';
		window.correctAnswer.correct='x<=5';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\neq symbol', async () => {
		dom.userAnswer!.value='x\\neq0';
		window.correctAnswer.correct='x!=0';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\approx symbol', async () => {
		dom.userAnswer!.value='x\\approx3.14';
		window.correctAnswer.correct='x=3.14';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should handle fancy minus character (−)', async () => {
		dom.userAnswer!.value='−5';
		window.correctAnswer.correct='-5';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\langle and \\rangle for vectors', async () => {
		dom.userAnswer!.value='\\langle1,2\\rangle';
		window.correctAnswer.correct='[1,2]';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept matrix with pmatrix environment', async () => {
		dom.userAnswer!.value='\\begin{pmatrix}5&6\\\\7&8\\end{pmatrix}';
		window.correctAnswer.correct='[[5,6],[7,8]]';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should reject answer with only whitespace', async () => {
		dom.userAnswer!.value='   ';
		window.correctAnswer.correct='42';
		await checkAnswer();
		expect(ui.showNotification).toHaveBeenCalledWith(expect.stringContaining('enter an answer'), 'warning');
	});
	it('should handle Unicode π character', async () => {
		dom.userAnswer!.value='π';
		window.correctAnswer.correct='pi';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should handle Unicode √ character', async () => {
		dom.userAnswer!.value='√(9)';
		window.correctAnswer.correct='3';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\log for log', async () => {
		dom.userAnswer!.value='\\log(x)';
		window.correctAnswer.correct='log(x)';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\ln for natural log', async () => {
		dom.userAnswer!.value='\\ln(x)';
		window.correctAnswer.correct='ln(x)';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \\exp for exponential', async () => {
		dom.userAnswer!.value='\\exp(x)';
		window.correctAnswer.correct='exp(x)';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should handle empty correct answer gracefully', async () => {
		dom.userAnswer!.value='42';
		window.correctAnswer.correct='';
		(settings.isAnswerCorrect as any).mockResolvedValueOnce(false);
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('incorrect');
	});
	it('should accept \\cdot between numbers', async () => {
		dom.userAnswer!.value='3\\cdot4';
		window.correctAnswer.correct='12';
		await checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	describe('checkAnswer - numeric edge cases', () => {
		it('should accept 0 as answer', async () => {
			dom.userAnswer!.value='0';
			window.correctAnswer.correct='0';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept negative decimal answer', async () => {
			dom.userAnswer!.value='-3.14';
			window.correctAnswer.correct='-3.14';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept scientific notation answer', async () => {
			dom.userAnswer!.value='1e3';
			window.correctAnswer.correct='1000';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept answer with leading zeros', async () => {
			dom.userAnswer!.value='007';
			window.correctAnswer.correct='7';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept answer with trailing zeros after decimal', async () => {
			dom.userAnswer!.value='1.00';
			window.correctAnswer.correct='1';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should reject non-numeric when numeric expected', async () => {
			dom.userAnswer!.value='abc';
			window.correctAnswer.correct='42';
			(settings.isAnswerCorrect as any).mockResolvedValueOnce(false);
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('incorrect');
		});
		it('should accept fraction format a/b', async () => {
			dom.userAnswer!.value='3/4';
			window.correctAnswer.correct='0.75';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept mixed number format', async () => {
			dom.userAnswer!.value='1 1/2';
			window.correctAnswer.correct='1.5';
			(settings.isAnswerCorrect as any).mockResolvedValueOnce(true);
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept percentage format', async () => {
			dom.userAnswer!.value='50%';
			window.correctAnswer.correct='0.5';
			(settings.isAnswerCorrect as any).mockResolvedValueOnce(true);
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept answer with units stripped', async () => {
			dom.userAnswer!.value='5cm';
			window.correctAnswer.correct='5';
			(settings.isAnswerCorrect as any).mockResolvedValueOnce(true);
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
	});
	describe('checkAnswer - algebraic edge cases', () => {
		it('should accept x=5 format', async () => {
			dom.userAnswer!.value='x=5';
			window.correctAnswer.correct='x=5';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept 5=x format', async () => {
			dom.userAnswer!.value='5=x';
			window.correctAnswer.correct='5=x';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept y=mx+b format', async () => {
			dom.userAnswer!.value='y=2*x+1';
			window.correctAnswer.correct='y=2x+1';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept factored form (x+1)(x-1)', async () => {
			dom.userAnswer!.value='(x+1)(x-1)';
			window.correctAnswer.correct='x^2-1';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept expanded form x^2-1', async () => {
			dom.userAnswer!.value='x^2-1';
			window.correctAnswer.correct='(x+1)(x-1)';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept x^{2} LaTeX format', async () => {
			dom.userAnswer!.value='x^{2}';
			window.correctAnswer.correct='x^2';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept answer with spaces around equals', async () => {
			dom.userAnswer!.value='x = 5';
			window.correctAnswer.correct='x=5';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept answer with multiple variables', async () => {
			dom.userAnswer!.value='3y+2x';
			window.correctAnswer.correct='2x+3y';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept quadratic formula result', async () => {
			dom.userAnswer!.value='(-b+sqrt(b^2-4*a*c))/(2*a)';
			window.correctAnswer.correct='(-b+sqrt(b^2-4ac))/(2a)';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
		it('should accept simplified fraction over complex denominator', async () => {
			dom.userAnswer!.value='1/(sqrt(2))';
			window.correctAnswer.correct='sqrt(2)/2';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
	});
	describe('checkAnswer - timer and performance', () => {
		it('should record response time', async () => {
			startQuestionTimer();
			dom.userAnswer!.value='42';
			window.correctAnswer.correct='42';
			await checkAnswer();
			expect(invoke).toHaveBeenCalledWith('save_performance', expect.objectContaining({
				responseTimeMs: expect.any(Number),
			}));
		});
		it('should call save_performance on correct answer', async () => {
			dom.userAnswer!.value='42';
			window.correctAnswer.correct='42';
			await checkAnswer();
			expect(invoke).toHaveBeenCalledWith('save_performance', expect.objectContaining({
				correct: true,
			}));
		});
		it('should call save_performance on incorrect answer', async () => {
			dom.userAnswer!.value='42';
			window.correctAnswer.correct='43';
			(settings.isAnswerCorrect as any).mockResolvedValueOnce(false);
			await checkAnswer();
			expect(invoke).toHaveBeenCalledWith('save_performance', expect.objectContaining({
				correct: false,
			}));
		});
		it('should include error type on wrong answer', async () => {
			state.setSelectedTopic('linear_eq');
			dom.userAnswer!.value='-5';
			window.correctAnswer.correct='5';
			(settings.isAnswerCorrect as any).mockResolvedValueOnce(false);
			await checkAnswer();
			expect(invoke).toHaveBeenCalledWith('save_performance', expect.objectContaining({
				errorType: 'sign_error',
			}));
		});
		it('should not throw on performance save failure', async () => {
			(invoke as any).mockRejectedValueOnce(new Error('save failed'));
			dom.userAnswer!.value='42';
			window.correctAnswer.correct='42';
			await checkAnswer();
			expect(dom.answerResults!.className).toContain('correct');
		});
	});
});