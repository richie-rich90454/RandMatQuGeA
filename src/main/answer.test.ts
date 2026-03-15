/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('./dom', () => ({
	userAnswer: {
		value: '',
		focus: vi.fn(),
	},
	answerResults: {
		innerHTML: '',
		className: '',
		classList: {
			add: vi.fn(),
			remove: vi.fn(),
			contains: vi.fn(),
		}
	},
	copyAnswerBtn: null,
	previewDiv: null,
	answerCard: null,
	questionArea: null,
	generateQuestionButton: null,
	checkAnswerButton: null,
	modeSingleBtn: null,
	modeMentalBtn: null,
	mentalControls: null,
	singleControls: null,
	scopeSelect: null,
	mentalScopeSelect: null,
	shuffleToggle: null,
	mentalShuffleToggle: null,
	autocontinueToggle: null,
	difficultySelect: null,
	timerDisplay: null,
	scoreDisplay: null,
	startSessionBtn: null,
	pauseSessionBtn: null,
	skipQuestionBtn: null,
	topicSearch: null,
	topicGrid: null,
	currentTopicDisplay: null,
	clearAnswerBtn: null,
	mathToolbar: null,
	shortcutsButton: null,
	shortcutsClose: null,
	shortcutsGotit: null,
	shortcutsModal: null,
	leaderboardClose: null,
	leaderboardCard: null,
	leaderboardContent: null,
	onboardingClose: null,
	onboardingGotit: null,
	onboardingOverlay: null,
	customContextMenu: null,
	themeToggle: null,
	helpButton: null,
	settingsButton: null,
	settingsClose: null,
	settingsSave: null,
	settingsReset: null,
	settingsModal: null,
	settingsTabBasic: null,
	settingsTabAdvanced: null,
	settingsBasicPanel: null,
	settingsAdvancedPanel: null,
	settingsTheme: null,
	settingsDefaultMode: null,
	settingsAutoContinue: null,
	settingsShuffle: null,
	settingsScope: null,
	settingsDifficulty: null,
	settingsTimer: null,
	settingsMaxQuestions: null,
	settingsFont: null,
	settingsPerfMaster: null,
	settingsPerfWave: null,
	settingsPerfBlur: null,
	settingsPerfPreview: null,
	settingsPerfAnimations: null,
	settingsFpsCap: null,
	settingsNotifications: null,
	settingsAutoCheckDelay: null,
	settingsDecimalPlaces: null,
	settingsSound: null,
	settingsVibration: null,
	checkUpdatesBtn: null,
	appWindow: null,
}));
vi.mock('./state', () => {
	const state={
		selectedTopic: 'topic',
		currentMode: 'single',
		sessionActive: false,
		sessionPaused: false,
		sessionScore: { correct:0, total:0 },
		timeLeft: 30,
		maxQuestions: 5,
		currentDifficulty: 'medium',
		autoTimeout: null,
		previewTimeout: null,
		generateDebounceTimeout: null,
		mentalNextQuestionTimeout: null,
		sessionTimer: null,
		autocontinue: false,
		scope: 'simple',
		shuffle: false,
		mentalScope: 'simple',
		mentalShuffle: false,
		modeButtons: [],
		setSelectedTopic: vi.fn((val) => state.selectedTopic = val),
		setAutocontinue: vi.fn((val) => state.autocontinue = val),
		setCurrentMode: vi.fn((val) => state.currentMode = val),
		setAutoTimeout: vi.fn(),
		setPreviewTimeout: vi.fn(),
		setGenerateDebounceTimeout: vi.fn(),
		setMentalNextQuestionTimeout: vi.fn(),
		setSessionTimer: vi.fn(),
		setSessionActive: vi.fn(),
		setSessionPaused: vi.fn(),
		setSessionScore: vi.fn(),
		setTimeLeft: vi.fn(),
		setCurrentDifficulty: vi.fn(),
		setScope: vi.fn(),
		setShuffle: vi.fn(),
		setMentalScope: vi.fn(),
		setMentalShuffle: vi.fn(),
	};
	return state;
});
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
import * as dom from './dom';
import * as state from './state';
import * as settings from './settings';
import * as ui from './ui';
import * as generation from './generation';
import { checkAnswer } from './answer';
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
		(settings.isAnswerCorrect as any).mockImplementation(() => true);
	});
	it('should show notification if no topic selected', () => {
		state.setSelectedTopic(null);
		checkAnswer();
		expect(ui.showNotification).toHaveBeenCalledWith(expect.stringContaining('select a topic'), 'warning');
	});
	it('should show notification if answer empty', () => {
		checkAnswer();
		expect(ui.showNotification).toHaveBeenCalledWith(expect.stringContaining('enter an answer'), 'warning');
	});
	it('should accept identical numbers', () => {
		dom.userAnswer!.value='42';
		window.correctAnswer.correct='42';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept numbers with whitespace', () => {
		dom.userAnswer!.value='  42  ';
		window.correctAnswer.correct='42';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should reject different numbers', () => {
		dom.userAnswer!.value='42';
		window.correctAnswer.correct='43';
		(settings.isAnswerCorrect as any).mockImplementationOnce(() => false);
		checkAnswer();
		expect(dom.answerResults!.className).toContain('incorrect');
	});
	it('should accept fraction equal to decimal', () => {
		dom.userAnswer!.value='0.5';
		window.correctAnswer.correct='1/2';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept decimal equal to fraction', () => {
		dom.userAnswer!.value='1/2';
		window.correctAnswer.correct='0.5';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept polynomial with term reorder', () => {
		dom.userAnswer!.value='x^2+2x+1';
		window.correctAnswer.correct='2x+1+x^2';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept implicit multiplication', () => {
		dom.userAnswer!.value='2x';
		window.correctAnswer.correct='2*x';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept different exponent notation', () => {
		dom.userAnswer!.value='x^{2}';
		window.correctAnswer.correct='x^2';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept x**2', () => {
		dom.userAnswer!.value='x**2';
		window.correctAnswer.correct='x^2';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept sin and sin', () => {
		dom.userAnswer!.value='sin(x)';
		window.correctAnswer.correct='\\sin(x)';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept sin x without parentheses', () => {
		dom.userAnswer!.value='sin x';
		window.correctAnswer.correct='sin(x)';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept arcsin and asin', () => {
		dom.userAnswer!.value='arcsin(x)';
		window.correctAnswer.correct='asin(x)';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept optional +C', () => {
		dom.userAnswer!.value='x^3/3';
		window.correctAnswer.correct='x^3/3 + C';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept +c', () => {
		dom.userAnswer!.value='x^3/3 + c';
		window.correctAnswer.correct='x^3/3 + C';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept angle‑bracket vectors', () => {
		dom.userAnswer!.value='< -0.72, 0.77 >';
		window.correctAnswer.correct='<-0.72,0.77>';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept LaTeX matrix', () => {
		dom.userAnswer!.value='\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}';
		window.correctAnswer.correct='[[1,2],[3,4]]';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept equivalent equations', () => {
		dom.userAnswer!.value='x+3=5';
		window.correctAnswer.correct='x=2';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \frac', () => {
		dom.userAnswer!.value='\\frac{1}{2}';
		window.correctAnswer.correct='1/2';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \sqrt', () => {
		dom.userAnswer!.value='\\sqrt{2}';
		window.correctAnswer.correct='sqrt(2)';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \sqrt[n]', () => {
		dom.userAnswer!.value='\\sqrt[3]{8}';
		window.correctAnswer.correct='8^(1/3)';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \pi', () => {
		dom.userAnswer!.value='\\pi';
		window.correctAnswer.correct='pi';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept \infty', () => {
		dom.userAnswer!.value='\\infty';
		window.correctAnswer.correct='inf';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should accept expanded vs factored', () => {
		dom.userAnswer!.value='x^2+2x+1';
		window.correctAnswer.correct='(x+1)^2';
		checkAnswer();
		expect(dom.answerResults!.className).toContain('correct');
	});
	it('should call generateQuestion if autocontinue true', () => {
		vi.useFakeTimers();
		state.setAutocontinue(true);
		settings.settings.autoCheckDelay=800;
		dom.userAnswer!.value='42';
		window.correctAnswer.correct='42';
		checkAnswer();
		vi.advanceTimersByTime(800);
		expect(generation.generateQuestion).toHaveBeenCalled();
		vi.useRealTimers();
	});
});