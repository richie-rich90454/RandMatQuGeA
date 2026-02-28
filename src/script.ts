import * as Algebra from "./modules/Algebra/index";
import * as Arithmetic from "./modules/Arithmetic/index";
import * as Calculus from "./modules/Calculus/index";
import * as DiscreteMathematics from "./modules/DiscreteMathematics/index";
import * as LinearAlgebra from "./modules/LinearAlgebra/index";
import * as Trigonometry from "./modules/Trigonometry/index";
import * as Geometry from "./modules/Geometry/index";
import type {Topic} from "./types/global";
import * as math from "mathjs";
import {getCurrentWindow, type Window} from "@tauri-apps/api/window";
import {invoke} from "@tauri-apps/api/core";

export let questionArea: HTMLElement|null=document.getElementById("question-area");
let topicGrid: HTMLElement|null=document.getElementById("topic-grid");
let currentTopicDisplay: HTMLElement|null=document.getElementById("current-topic");
let generateQuestionButton: HTMLButtonElement|null=document.getElementById("genQ") as HTMLButtonElement|null;
let userAnswer: HTMLTextAreaElement|null=document.getElementById("answer-box") as HTMLTextAreaElement|null;
let answerResults: HTMLElement|null=document.getElementById("answer-results");
let checkAnswerButton: HTMLButtonElement|null=document.getElementById("check-answer") as HTMLButtonElement|null;
let themeToggle: HTMLButtonElement|null=document.getElementById("theme-toggle") as HTMLButtonElement|null;
let helpButton: HTMLButtonElement|null=document.getElementById("help-button") as HTMLButtonElement|null;
let settingsButton: HTMLButtonElement|null=document.getElementById("settings-button") as HTMLButtonElement|null;
let expectedFormatDiv: HTMLElement|null=document.getElementById("expected-format");
let modeSingleBtn: HTMLButtonElement|null=document.getElementById("mode-single") as HTMLButtonElement|null;
let modeMentalBtn: HTMLButtonElement|null=document.getElementById("mode-mental") as HTMLButtonElement|null;
let mentalControls: HTMLElement|null=document.getElementById("mental-controls");
let singleControls: HTMLElement|null=document.getElementById("single-controls");
let difficultySelect: HTMLSelectElement|null=document.getElementById("difficulty-select") as HTMLSelectElement|null;
let timerDisplay: HTMLElement|null=document.getElementById("timer-display");
let scoreDisplay: HTMLElement|null=document.getElementById("score-display");
let startSessionBtn: HTMLButtonElement|null=document.getElementById("start-session") as HTMLButtonElement|null;
let autocontinueToggle: HTMLInputElement|null=document.getElementById("autocontinue-toggle") as HTMLInputElement|null;
let scopeSelect: HTMLSelectElement|null=document.getElementById("scope-select") as HTMLSelectElement|null;
let shuffleToggle: HTMLInputElement|null=document.getElementById("shuffle-toggle") as HTMLInputElement|null;
let mentalScopeSelect: HTMLSelectElement|null=document.getElementById("mental-scope-select") as HTMLSelectElement|null;
let mentalShuffleToggle: HTMLInputElement|null=document.getElementById("mental-shuffle-toggle") as HTMLInputElement|null;
let mentalProgressBar: HTMLElement|null=document.getElementById("mental-progress-bar");
let settingsModal: HTMLElement|null=document.getElementById("settings-modal");
let settingsClose: HTMLElement|null=document.getElementById("settings-close");
let settingsSave: HTMLElement|null=document.getElementById("settings-save");
let settingsReset: HTMLElement|null=document.getElementById("settings-reset");
let settingsTheme: HTMLSelectElement|null=document.getElementById("settings-theme") as HTMLSelectElement|null;
let settingsDefaultMode: HTMLSelectElement|null=document.getElementById("settings-default-mode") as HTMLSelectElement|null;
let settingsAutoContinue: HTMLInputElement|null=document.getElementById("settings-auto-continue") as HTMLInputElement|null;
let settingsShuffle: HTMLInputElement|null=document.getElementById("settings-shuffle") as HTMLInputElement|null;
let settingsScope: HTMLSelectElement|null=document.getElementById("settings-scope") as HTMLSelectElement|null;
let settingsDifficulty: HTMLSelectElement|null=document.getElementById("settings-difficulty") as HTMLSelectElement|null;
let settingsTimer: HTMLInputElement|null=document.getElementById("settings-timer") as HTMLInputElement|null;
let settingsMaxQuestions: HTMLInputElement|null=document.getElementById("settings-max-questions") as HTMLInputElement|null;
let settingsFont: HTMLSelectElement|null=document.getElementById("settings-font") as HTMLSelectElement|null;
let settingsPerfMaster: HTMLInputElement|null=document.getElementById("settings-perf-master") as HTMLInputElement|null;
let settingsPerfWave: HTMLInputElement|null=document.getElementById("settings-perf-wave") as HTMLInputElement|null;
let settingsPerfBlur: HTMLInputElement|null=document.getElementById("settings-perf-blur") as HTMLInputElement|null;
let settingsPerfPreview: HTMLInputElement|null=document.getElementById("settings-perf-preview") as HTMLInputElement|null;
let settingsPerfAnimations: HTMLInputElement|null=document.getElementById("settings-perf-animations") as HTMLInputElement|null;
let settingsFpsCap: HTMLSelectElement|null=document.getElementById("settings-fps-cap") as HTMLSelectElement|null;
let settingsNotifications: HTMLInputElement|null=document.getElementById("settings-notifications") as HTMLInputElement|null;
let settingsAutoCheckDelay: HTMLInputElement|null=document.getElementById("settings-auto-check-delay") as HTMLInputElement|null;
let settingsDecimalPlaces: HTMLInputElement|null=document.getElementById("settings-decimal-places") as HTMLInputElement|null;
let settingsSound: HTMLInputElement|null=document.getElementById("settings-sound") as HTMLInputElement|null;
let settingsVibration: HTMLInputElement|null=document.getElementById("settings-vibration") as HTMLInputElement|null;
let pauseSessionBtn: HTMLButtonElement|null=document.getElementById("pause-session") as HTMLButtonElement|null;
let skipQuestionBtn: HTMLButtonElement|null=document.getElementById("skip-question") as HTMLButtonElement|null;
let customContextMenu: HTMLElement|null=document.getElementById("custom-context-menu");
let previewDiv: HTMLElement|null=document.getElementById("preview");
let mathToolbar: HTMLElement|null=document.getElementById("math-toolbar");
let copyAnswerBtn: HTMLButtonElement|null=document.getElementById("copy-answer") as HTMLButtonElement|null;

window.correctAnswer={correct:""};
window.expectedFormat="";

let selectedTopic: string|null=null;

let topics: Topic[]=[
	{id:"add",name:"Addition",icon:"+",category:"Arithmetic"},
	{id:"subtrt",name:"Subtraction",icon:"-",category:"Arithmetic"},
	{id:"mult",name:"Multiplication",icon:"×",category:"Arithmetic"},
	{id:"divid",name:"Division",icon:"÷",category:"Arithmetic"},
	{id:"real_ops",name:"Real Number Ops",icon:"| |",category:"Algebra"},
	{id:"cartesian",name:"Cartesian Plane",icon:"(x,y)",category:"Algebra"},
	{id:"linear_special",name:"Special Linear Eq",icon:"=?=",category:"Algebra"},
	{id:"rational_eq",name:"Rational Equations",icon:"x/1",category:"Algebra"},
	{id:"root",name:"Roots",icon:"√",category:"Algebra"},
	{id:"log",name:"Logarithm",icon:"log",category:"Algebra"},
	{id:"exp",name:"Exponential",icon:"eˣ",category:"Algebra"},
	{id:"fact",name:"Factorial",icon:"!",category:"Algebra"},
	{id:"ser",name:"Series",icon:"Σ",category:"Algebra"},
	{id:"func_props",name:"Function Props",icon:"f()",category:"Algebra"},
	{id:"basic_funcs",name:"Basic Functions",icon:"f(x) B",category:"Algebra"},
	{id:"func_ops",name:"Function Ops",icon:"f∘g",category:"Algebra"},
	{id:"inverse_funcs",name:"Inverse Funcs",icon:"f⁻¹",category:"Algebra"},
	{id:"transformations",name:"Transformations",icon:"↔",category:"Algebra"},
	{id:"power_model",name:"Power Model",icon:"xⁿ",category:"Algebra"},
	{id:"poly_ineq",name:"Polynomial Ineq",icon:">",category:"Algebra"},
	{id:"poly_end",name:"Poly End Behavior",icon:"↗↘",category:"Algebra"},
	{id:"synth_div",name:"Synthetic Div",icon:"÷ₛ",category:"Algebra"},
	{id:"complex_zeros",name:"Complex Zeros",icon:"i",category:"Algebra"},
	{id:"rational_analysis",name:"Rational Graphs",icon:"1/x",category:"Algebra"},
	{id:"circle_eq",name:"Circle Equations",icon:"◯ E",category:"Algebra"},
	{id:"logistic",name:"Logistic Funcs",icon:"S",category:"Algebra"},
	{id:"exp_model",name:"Exp Modeling",icon:"eᵗ",category:"Algebra"},
	{id:"log_model",name:"Log Modeling",icon:"log(t)",category:"Algebra"},
	{id:"finance",name:"Finance",icon:"$",category:"Algebra"},
	{id:"lim",name:"Limits",icon:"lim",category:"Calculus"},
	{id:"deri",name:"Differentiation",icon:"∂",category:"Calculus"},
	{id:"inte",name:"Integration",icon:"∫",category:"Calculus"},
	{id:"relRates",name:"Related Rates",icon:"dx/dt",category:"Calculus"},
	{id:"mtrx",name:"Matrix Operations",icon:"[ ]",category:"Linear Algebra"},
	{id:"vctr",name:"Vector Operations",icon:"→",category:"Linear Algebra"},
	{id:"system3x3",name:"3x3 Systems",icon:"3×3",category:"Linear Algebra"},
	{id:"row_echelon3x3",name:"Row Echelon",icon:"REF",category:"Linear Algebra"},
	{id:"partial_fractions",name:"Partial Fractions",icon:"1/(x+a)",category:"Linear Algebra"},
	{id:"linear_programming",name:"Linear Programming",icon:"LP",category:"Linear Algebra"},
	{id:"vector3d",name:"3D Vectors",icon:"⟨x,y,z⟩",category:"Linear Algebra"},
	{id:"line3d",name:"3D Lines",icon:"L3",category:"Linear Algebra"},
	{id:"plane3d",name:"3D Planes",icon:"⌂",category:"Linear Algebra"},
	{id:"sin",name:"Sine",icon:"sin",category:"Trigonometry"},
	{id:"cos",name:"Cosine",icon:"cos",category:"Trigonometry"},
	{id:"tan",name:"Tangent",icon:"tan",category:"Trigonometry"},
	{id:"cosec",name:"Cosecant",icon:"csc",category:"Trigonometry"},
	{id:"sec",name:"Secant",icon:"sec",category:"Trigonometry"},
	{id:"cot",name:"Cotangent",icon:"cot",category:"Trigonometry"},
	{id:"trig_graph",name:"Trig Graphs",icon:"f(x)",category:"Trigonometry"},
	{id:"deg_to_rad",name:"Degrees → Radians",icon:"°→rad",category:"Trigonometry"},
	{id:"rad_to_deg",name:"Radians → Degrees",icon:"rad→°",category:"Trigonometry"},
	{id:"arc_length",name:"Arc Length",icon:"s=rθ",category:"Trigonometry"},
	{id:"angular_speed",name:"Angular/Linear Speed",icon:"ω,v",category:"Trigonometry"},
	{id:"right_triangle_defs",name:"Triangle Definitions",icon:"SOH CAH",category:"Trigonometry"},
	{id:"special_triangle",name:"Special Triangles",icon:"30-60-90",category:"Trigonometry"},
	{id:"elev_dep",name:"Elevation/Depression",icon:"∠↑↓",category:"Trigonometry"},
	{id:"reference_angle",name:"Reference Angle",icon:"θ'",category:"Trigonometry"},
	{id:"astc_sign",name:"ASTC Signs",icon:"±",category:"Trigonometry"},
	{id:"sum_diff",name:"Sum/Difference",icon:"sin(A±B)",category:"Trigonometry"},
	{id:"double_angle",name:"Double-Angle",icon:"sin2θ",category:"Trigonometry"},
	{id:"half_angle",name:"Half-Angle",icon:"sin(θ/2)",category:"Trigonometry"},
	{id:"polar_to_rect",name:"Polar → Rectangular",icon:"(r,θ)",category:"Trigonometry"},
	{id:"rect_to_polar",name:"Rectangular → Polar",icon:"R→P",category:"Trigonometry"},
	{id:"polar_distance",name:"Polar Distance",icon:"dist",category:"Trigonometry"},
	{id:"polar_graph",name:"Polar Graphs",icon:"r=f(θ)",category:"Trigonometry"},
	{id:"parametric_to_cartesian",name:"Parametric → Cartesian",icon:"x=f(t)",category:"Trigonometry"},
	{id:"parametric_motion",name:"Parametric Motion",icon:"projectile",category:"Trigonometry"},
	{id:"complex_polar",name:"Complex Polar Form",icon:"r cis θ",category:"Trigonometry"},
	{id:"complex_mult_div",name:"Complex ×/÷",icon:"z1·z2",category:"Trigonometry"},
	{id:"demoivre",name:"De Moivre",icon:"(r cisθ)ⁿ",category:"Trigonometry"},
	{id:"complex_roots",name:"Complex Roots",icon:"ⁿ√z",category:"Trigonometry"},
	{id:"perm",name:"Permutation",icon:"P",category:"Discrete Math"},
	{id:"comb",name:"Combination",icon:"C",category:"Discrete Math"},
	{id:"prob",name:"Probability",icon:"%",category:"Discrete Math"},
	{id:"stats",name:"Statistics",icon:"σ",category:"Discrete Math"},
	{id:"arithmetic_sequence",name:"Arithmetic Seq",icon:"aₙ",category:"Discrete Math"},
	{id:"geometric_sequence",name:"Geometric Seq",icon:"a·rⁿ",category:"Discrete Math"},
	{id:"sequence_limit",name:"Sequence Limits",icon:"seq→",category:"Discrete Math"},
	{id:"infinite_series",name:"Infinite Series",icon:"∑∞",category:"Discrete Math"},
	{id:"induction",name:"Induction",icon:"n→n+1",category:"Discrete Math"},
	{id:"binomial",name:"Binomial Theorem",icon:"(a+b)ⁿ",category:"Discrete Math"},
	{id:"area_circle",name:"Area of Circle",icon:"◯ A",category:"Geometry"},
	{id:"pythag",name:"Pythagorean Theorem",icon:"△",category:"Geometry"},
	{id:"volume_sphere",name:"Volume of Sphere",icon:"○",category:"Geometry"},
	{id:"parabola",name:"Parabola",icon:"⤵",category:"Geometry"},
	{id:"ellipse",name:"Ellipse",icon:"⬭",category:"Geometry"},
	{id:"hyperbola",name:"Hyperbola",icon:"⤴",category:"Geometry"},
	{id:"polar_conics",name:"Polar Conics",icon:"r(θ)",category:"Geometry"},
	{id:"coord3d",name:"3D Coordinates",icon:"(x,y,z)",category:"Geometry"},
	{id:"sphere_eq",name:"Sphere Equation",icon:"○ E",category:"Geometry"},
	{id:"line_plane_3d",name:"Lines & Planes 3D",icon:"L+P",category:"Geometry"}
];
const scopeTopics={
	simple:["add","subtrt","mult","divid"],
	algebra:["add","subtrt","mult","divid","root","log","exp","fact","ser","perm","comb","prob"],
	precalc:[
		"add","subtrt","mult","divid","root","log","exp","fact","ser","perm","comb","prob",
		"sin","cos","tan","cosec","sec","cot","stats","trig_graph",
		"mtrx","vctr","area_circle","pythag","volume_sphere",
		"real_ops","cartesian","circle_eq","linear_special","rational_eq","poly_ineq",
		"func_props","basic_funcs","func_ops","inverse_funcs","transformations",
		"power_model","poly_end","synth_div","complex_zeros","rational_analysis",
		"logistic","exp_model","log_model","finance",
		"parabola","ellipse","hyperbola","polar_conics","coord3d","sphere_eq","line_plane_3d",
		"arithmetic_sequence","geometric_sequence","sequence_limit","infinite_series","induction","binomial",
		"system3x3","row_echelon3x3","partial_fractions","linear_programming","vector3d","line3d","plane3d",
		"deg_to_rad","rad_to_deg","arc_length","angular_speed",
		"right_triangle_defs","special_triangle","elev_dep",
		"reference_angle","astc_sign",
		"sum_diff","double_angle","half_angle",
		"polar_to_rect","rect_to_polar","polar_distance","polar_graph",
		"parametric_to_cartesian","parametric_motion",
		"complex_polar","complex_mult_div","demoivre","complex_roots"
	],
	calc:[
		"add","subtrt","mult","divid","root","log","exp","fact","ser","perm","comb","prob",
		"deri","inte","lim","relRates",
		"mtrx","vctr","area_circle","pythag","volume_sphere"
	],
	all:topics.map(t=>t.id)
};
let appWindow: Window|null=null;
try{
	appWindow=getCurrentWindow();
}
catch(e){
	console.log("Not running in Tauri environment, theme sync disabled.");
}
let currentMode:"single"|"mental"="single";
let sessionActive:boolean=false;
let sessionPaused:boolean=false;
let sessionScore={correct:0,total:0};
let sessionTimer:ReturnType<typeof setInterval>|null=null;
let timeLeft:number=30;
let maxQuestions:number=5;
let currentDifficulty:string="medium";
let mentalNextQuestionTimeout:ReturnType<typeof setTimeout>|null=null;
let autocontinue:boolean=false;
let scope:string="simple";
let shuffle:boolean=false;
let mentalScope:string="simple";
let mentalShuffle:boolean=false;
let autoTimeout:ReturnType<typeof setTimeout>|null=null;
let generateDebounceTimeout:ReturnType<typeof setTimeout>|null=null;
let previewTimeout:ReturnType<typeof setTimeout>|null=null;
let modeButtons=[modeSingleBtn,modeMentalBtn];
let settings={
	theme:"system",
	defaultMode:"single",
	autoContinue:false,
	shuffle:false,
	scope:"simple",
	difficulty:"medium",
	timer:30,
	maxQuestions:5,
	font:"default",
	perfMaster:false,
	perfWave:true,
	perfBlur:true,
	perfPreview:true,
	perfAnimations:true,
	fpsCap:0,
	notifications:true,
	autoCheckDelay:800,
	decimalPlaces:2,
	sound:false,
	vibration:false
};

function updateAriaPressed():void{
	if (modeSingleBtn) modeSingleBtn.setAttribute("aria-pressed",String(currentMode==="single"));
	if (modeMentalBtn) modeMentalBtn.setAttribute("aria-pressed",String(currentMode==="mental"));
}

function updateCheckboxAria(checkbox:HTMLInputElement|null):void{
	if (checkbox) checkbox.setAttribute("aria-checked",String(checkbox.checked));
}

function updateProgressBar():void{
	if (mentalProgressBar){
		const now=sessionScore.total/maxQuestions*100;
		mentalProgressBar.setAttribute("aria-valuenow",String(now));
	}
}

function applyFont(font:string):void{
	document.body.classList.remove("font-opendyslexic");
	if (font==="opendyslexic"){
		document.body.classList.add("font-opendyslexic");
	}
}

function insertSymbol(symbol:string):void{
	if (!userAnswer) return;
	const start=userAnswer.selectionStart;
	const end=userAnswer.selectionEnd;
	const text=userAnswer.value;
	const newText=text.substring(0,start)+symbol+text.substring(end);
	userAnswer.value=newText;
	userAnswer.selectionStart=userAnswer.selectionEnd=start+symbol.length;
	userAnswer.focus();
	updatePreviewDebounced();
}

function updatePreview():void{
	if (!previewDiv||!userAnswer) return;
	const input=userAnswer.value.trim();
	if (!input){
		previewDiv.innerHTML="";
		previewDiv.classList.remove("has-content");
		return;
	}
	try{
		window.katex.render(input,previewDiv,{
			throwOnError:false,
			displayMode:false
		});
		previewDiv.classList.add("has-content");
	}
    catch(e){
		const errorMessage=e instanceof Error?e.message:String(e);
		previewDiv.innerHTML=`<span style="color: var(--error);">${errorMessage}</span>`;
		previewDiv.classList.add("has-content");
	}
}

function updatePreviewDebounced():void{
	if (previewTimeout) clearTimeout(previewTimeout);
	previewTimeout=setTimeout(()=>{
		updatePreview();
		previewTimeout=null;
	},200);
}

function copyCorrectAnswer():void{
	if (!window.correctAnswer.correct) return;
	navigator.clipboard.writeText(window.correctAnswer.correct).then(()=>{
		showNotification("Answer copied to clipboard","info");
	}).catch(()=>{
		showNotification("Failed to copy","warning");
	});
}

function applyWaveBackground(enabled:boolean):void{
	const wave=document.getElementById("wave-container");
	if (wave) wave.style.display=enabled?"block":"none";
}

function applyBlurEffects(enabled:boolean):void{
	const root=document.documentElement;
	if (enabled) root.classList.remove("no-blur");
	else root.classList.add("no-blur");
}

function applyLivePreview(enabled:boolean):void{
	if (previewDiv) previewDiv.style.display=enabled?"block":"none";
}

function applyAnimations(enabled:boolean):void{
	const root=document.documentElement;
	if (enabled) root.classList.remove("reduce-motion");
	else root.classList.add("reduce-motion");
}

function applyFPSCap(value:number):void{
	const wave=document.querySelector(".liquid-bg") as HTMLElement;
	if (wave){
		if (value>0){
			const baseFlow=18;
			const baseDrift=[22,19,26];
			const scale=60/value;
			wave.style.animationDuration=
				(baseFlow*scale)+"s, "+
				(baseDrift[0]*scale)+"s, "+
				(baseDrift[1]*scale)+"s";
		}
        else{
			wave.style.animationDuration="";
		}
	}
}

function applyPerformanceMaster(enabled:boolean):void{
	if (enabled){
		applyWaveBackground(false);
		applyBlurEffects(false);
		applyLivePreview(false);
		applyAnimations(false);
	}
    else{
		applyWaveBackground(settings.perfWave);
		applyBlurEffects(settings.perfBlur);
		applyLivePreview(settings.perfPreview);
		applyAnimations(settings.perfAnimations);
	}
}

const SESSION_STORAGE_KEY="mentalSessionSnapshot";

function saveSessionSnapshot():void{
	if (!sessionActive) return;
	const snapshot={
		sessionScore,
		timeLeft,
		maxQuestions,
		currentDifficulty,
		mentalShuffle,
		mentalScope,
		selectedTopic,
		timestamp:Date.now()
	};
	localStorage.setItem(SESSION_STORAGE_KEY,JSON.stringify(snapshot));
}

function restoreSessionSnapshot():void{
	const saved=localStorage.getItem(SESSION_STORAGE_KEY);
	if (!saved) return;
	try{
		const snap=JSON.parse(saved);
		if (Date.now()-snap.timestamp>60*60*1000){
			localStorage.removeItem(SESSION_STORAGE_KEY);
			return;
		}
		sessionActive=true;
		sessionPaused=false;
		sessionScore=snap.sessionScore;
		timeLeft=snap.timeLeft;
		maxQuestions=snap.maxQuestions;
		currentDifficulty=snap.currentDifficulty;
		mentalShuffle=snap.mentalShuffle;
		mentalScope=snap.mentalScope;
		selectedTopic=snap.selectedTopic;
		if (modeMentalBtn) modeMentalBtn.click();
		if (selectedTopic) selectTopic(selectedTopic);
		updateScoreDisplay();
		updateTimerDisplay();
		updateProgressBar();
		startTimer();
		disableTopicSelection(true);
		disableModeButtons(true);
		disableDifficulty(true);
		setSessionButton(true);
		generateNextMentalQuestion();
		localStorage.removeItem(SESSION_STORAGE_KEY);
	}
    catch(e){
		console.warn("Failed to restore session",e);
	}
}

window.addEventListener("error",(event)=>{
	showNotification(`Error: ${event.message}`,"warning");
});

window.addEventListener("unhandledrejection",(event)=>{
	showNotification(`Async error: ${event.reason}`,"warning");
});

function loadSettings():void{
	const saved=localStorage.getItem("appSettings");
	if (saved){
		try{
			settings=JSON.parse(saved);
		}
        catch(e){}
	}
	if (settingsTheme) settingsTheme.value=settings.theme;
	if (settingsDefaultMode) settingsDefaultMode.value=settings.defaultMode;
	if (settingsAutoContinue) settingsAutoContinue.checked=settings.autoContinue;
	if (settingsShuffle) settingsShuffle.checked=settings.shuffle;
	if (settingsScope) settingsScope.value=settings.scope;
	if (settingsDifficulty) settingsDifficulty.value=settings.difficulty;
	if (settingsTimer) settingsTimer.value=settings.timer.toString();
	if (settingsMaxQuestions) settingsMaxQuestions.value=settings.maxQuestions.toString();
	if (settingsFont) settingsFont.value=settings.font;
	if (settingsPerfMaster) settingsPerfMaster.checked=settings.perfMaster;
	if (settingsPerfWave) settingsPerfWave.checked=settings.perfWave;
	if (settingsPerfBlur) settingsPerfBlur.checked=settings.perfBlur;
	if (settingsPerfPreview) settingsPerfPreview.checked=settings.perfPreview;
	if (settingsPerfAnimations) settingsPerfAnimations.checked=settings.perfAnimations;
	if (settingsFpsCap) settingsFpsCap.value=settings.fpsCap.toString();
	if (settingsNotifications) settingsNotifications.checked=settings.notifications;
	if (settingsAutoCheckDelay) settingsAutoCheckDelay.value=settings.autoCheckDelay.toString();
	if (settingsDecimalPlaces) settingsDecimalPlaces.value=settings.decimalPlaces.toString();
	if (settingsSound) settingsSound.checked=settings.sound;
	if (settingsVibration) settingsVibration.checked=settings.vibration;
	applySettingsToApp();
}

function saveSettings():void{
	if (settingsTheme) settings.theme=settingsTheme.value as "system"|"light"|"dark";
	if (settingsDefaultMode) settings.defaultMode=settingsDefaultMode.value as "single"|"mental";
	if (settingsAutoContinue) settings.autoContinue=settingsAutoContinue.checked;
	if (settingsShuffle) settings.shuffle=settingsShuffle.checked;
	if (settingsScope) settings.scope=settingsScope.value;
	if (settingsDifficulty) settings.difficulty=settingsDifficulty.value;
	if (settingsTimer) settings.timer=parseInt(settingsTimer.value)||30;
	if (settingsMaxQuestions) settings.maxQuestions=parseInt(settingsMaxQuestions.value)||5;
	if (settingsFont) settings.font=settingsFont.value;
	if (settingsPerfMaster) settings.perfMaster=settingsPerfMaster.checked;
	if (settingsPerfWave) settings.perfWave=settingsPerfWave.checked;
	if (settingsPerfBlur) settings.perfBlur=settingsPerfBlur.checked;
	if (settingsPerfPreview) settings.perfPreview=settingsPerfPreview.checked;
	if (settingsPerfAnimations) settings.perfAnimations=settingsPerfAnimations.checked;
	if (settingsFpsCap) settings.fpsCap=parseInt(settingsFpsCap.value)||0;
	if (settingsNotifications) settings.notifications=settingsNotifications.checked;
	if (settingsAutoCheckDelay) settings.autoCheckDelay=parseInt(settingsAutoCheckDelay.value)||800;
	if (settingsDecimalPlaces) settings.decimalPlaces=parseInt(settingsDecimalPlaces.value)||2;
	if (settingsSound) settings.sound=settingsSound.checked;
	if (settingsVibration) settings.vibration=settingsVibration.checked;
	localStorage.setItem("appSettings",JSON.stringify(settings));
	applySettingsToApp();
}

function previewSetting(field:string,value:any):void{
	switch (field){
		case "theme":
			if (value==="system"){
				let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
				applyTheme(prefersDark?"dark":"light");
			}
            else{
				applyTheme(value);
			}
			break;
		case "defaultMode":
			if (!sessionActive){
				if (value==="single"&&modeSingleBtn) modeSingleBtn.click();
				else if (value==="mental"&&modeMentalBtn) modeMentalBtn.click();
			}
			break;
		case "autoContinue":
			if (autocontinueToggle) autocontinueToggle.checked=value;
			autocontinue=value;
			updateCheckboxAria(autocontinueToggle);
			break;
		case "shuffle":
			if (shuffleToggle) shuffleToggle.checked=value;
			shuffle=value;
			if (mentalShuffleToggle) mentalShuffleToggle.checked=value;
			mentalShuffle=value;
			updateCheckboxAria(shuffleToggle);
			updateCheckboxAria(mentalShuffleToggle);
			break;
		case "scope":
			if (scopeSelect) scopeSelect.value=value;
			scope=value;
			if (mentalScopeSelect) mentalScopeSelect.value=value;
			mentalScope=value;
			renderTopicGrid();
			break;
		case "difficulty":
			if (difficultySelect) difficultySelect.value=value;
			currentDifficulty=value;
			break;
		case "timer":
			timeLeft=parseInt(value)||30;
			updateTimerDisplay();
			break;
		case "maxQuestions":
			maxQuestions=parseInt(value)||5;
			break;
		case "font":
			applyFont(value);
			break;
		case "perfMaster":
			settings.perfMaster=value;
			applyPerformanceMaster(value);
			break;
		case "perfWave":
			settings.perfWave=value;
			if (!settings.perfMaster) applyWaveBackground(value);
			break;
		case "perfBlur":
			settings.perfBlur=value;
			if (!settings.perfMaster) applyBlurEffects(value);
			break;
		case "perfPreview":
			settings.perfPreview=value;
			if (!settings.perfMaster) applyLivePreview(value);
			break;
		case "perfAnimations":
			settings.perfAnimations=value;
			if (!settings.perfMaster) applyAnimations(value);
			break;
		case "fpsCap":
			settings.fpsCap=parseInt(value)||0;
			applyFPSCap(settings.fpsCap);
			break;
		case "notifications":
			settings.notifications=value;
			break;
		case "autoCheckDelay":
			settings.autoCheckDelay=parseInt(value)||800;
			break;
		case "decimalPlaces":
			settings.decimalPlaces=parseInt(value)||2;
			break;
		case "sound":
			settings.sound=value;
			break;
		case "vibration":
			settings.vibration=value;
			break;
	}
}

function applySettingsToApp():void{
	if (settings.theme==="system"){
		const prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
		applyTheme(prefersDark?"dark":"light");
	}
    else{
		applyTheme(settings.theme as "light"|"dark");
	}
	applyFont(settings.font);
	if (!sessionActive&&settings.defaultMode!==currentMode){
		if (settings.defaultMode==="single"&&modeSingleBtn){
			modeSingleBtn.click();
		}
        else if (settings.defaultMode==="mental"&&modeMentalBtn){
			modeMentalBtn.click();
		}
	}
	if (autocontinueToggle) autocontinueToggle.checked=settings.autoContinue;
	autocontinue=settings.autoContinue;
	if (shuffleToggle) shuffleToggle.checked=settings.shuffle;
	shuffle=settings.shuffle;
	if (mentalShuffleToggle) mentalShuffleToggle.checked=settings.shuffle;
	mentalShuffle=settings.shuffle;
	if (scopeSelect) scopeSelect.value=settings.scope;
	scope=settings.scope;
	if (mentalScopeSelect) mentalScopeSelect.value=settings.scope;
	mentalScope=settings.scope;
	if (difficultySelect) difficultySelect.value=settings.difficulty;
	currentDifficulty=settings.difficulty;
	timeLeft=settings.timer;
	maxQuestions=settings.maxQuestions;
	if (settings.perfMaster){
		applyPerformanceMaster(true);
	}
    else{
		applyWaveBackground(settings.perfWave);
		applyBlurEffects(settings.perfBlur);
		applyLivePreview(settings.perfPreview);
		applyAnimations(settings.perfAnimations);
	}
	applyFPSCap(settings.fpsCap);
	updateTimerDisplay();
	renderTopicGrid();
	updateUIState();
	updateCheckboxAria(autocontinueToggle);
	updateCheckboxAria(shuffleToggle);
	updateCheckboxAria(mentalShuffleToggle);
}

function resetSettings():void{
	if (settingsTheme) settingsTheme.value="system";
	if (settingsDefaultMode) settingsDefaultMode.value="single";
	if (settingsAutoContinue) settingsAutoContinue.checked=false;
	if (settingsShuffle) settingsShuffle.checked=false;
	if (settingsScope) settingsScope.value="simple";
	if (settingsDifficulty) settingsDifficulty.value="medium";
	if (settingsTimer) settingsTimer.value="30";
	if (settingsMaxQuestions) settingsMaxQuestions.value="5";
	if (settingsFont) settingsFont.value="default";
	if (settingsPerfMaster) settingsPerfMaster.checked=false;
	if (settingsPerfWave) settingsPerfWave.checked=true;
	if (settingsPerfBlur) settingsPerfBlur.checked=true;
	if (settingsPerfPreview) settingsPerfPreview.checked=true;
	if (settingsPerfAnimations) settingsPerfAnimations.checked=true;
	if (settingsFpsCap) settingsFpsCap.value="0";
	if (settingsNotifications) settingsNotifications.checked=true;
	if (settingsAutoCheckDelay) settingsAutoCheckDelay.value="800";
	if (settingsDecimalPlaces) settingsDecimalPlaces.value="2";
	if (settingsSound) settingsSound.checked=false;
	if (settingsVibration) settingsVibration.checked=false;
	saveSettings();
}

function openSettings():void{
	loadSettings();
	if (settingsModal) settingsModal.classList.add("show");
}

function closeSettings():void{
	if (settingsModal) settingsModal.classList.remove("show");
}

function disableModeButtons(disabled:boolean):void{
	modeButtons.forEach(btn=>{
		if (btn){
			btn.disabled=disabled;
			if (disabled) btn.classList.add("disabled");
			else btn.classList.remove("disabled");
			btn.setAttribute("aria-disabled",String(disabled));
		}
	});
}

function disableDifficulty(disabled:boolean):void{
	if (difficultySelect){
		difficultySelect.disabled=disabled;
		difficultySelect.setAttribute("aria-disabled",String(disabled));
	}
}

function setSessionButton(isActive:boolean):void{
	if (!startSessionBtn) return;
	if (isActive){
		startSessionBtn.textContent="Stop Session";
		startSessionBtn.classList.add("stop-session");
		startSessionBtn.removeEventListener("click",startMentalSession);
		startSessionBtn.addEventListener("click",stopMentalSession);
		if (pauseSessionBtn) pauseSessionBtn.style.display="inline-flex";
		if (skipQuestionBtn) skipQuestionBtn.style.display="inline-flex";
	}
    else{
		startSessionBtn.textContent="Start Session";
		startSessionBtn.classList.remove("stop-session");
		startSessionBtn.removeEventListener("click",stopMentalSession);
		startSessionBtn.addEventListener("click",startMentalSession);
		if (pauseSessionBtn) pauseSessionBtn.style.display="none";
		if (skipQuestionBtn) skipQuestionBtn.style.display="none";
	}
}

function stopMentalSession():void{
	endMentalSession();
}

function applyTheme(theme:"light"|"dark"):void{
	let root=document.documentElement;
	if (theme==="dark"){
		root.classList.add("dark");
		root.classList.remove("light");
	}
    else{
		root.classList.add("light");
		root.classList.remove("dark");
	}
	localStorage.setItem("theme",theme);
	updateMathJaxColors();
	if (appWindow){
		appWindow.setTheme(theme).catch(err=>console.log("Failed to set window theme:",err));
	}
}

async function initializeTheme():Promise<void>{
	if (appWindow){
		try{
			let tauriTheme=await appWindow.theme();
			if (settings.theme==="system"){
				applyTheme(tauriTheme??"light");
			}
			return;
		}
        catch(e){
			console.log("Failed to get Tauri theme, falling back.");
		}
	}
	if (settings.theme==="system"){
		let prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
		applyTheme(prefersDark?"dark":"light");
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",(e)=>{
			if (settings.theme==="system"){
				applyTheme(e.matches?"dark":"light");
			}
		});
	}
    else{
		applyTheme(settings.theme as "light"|"dark");
	}
}

function initApp():void{
	loadSettings();
	setupEventListeners();
	initializeTheme();
	updateUIState();
	restoreSessionSnapshot();
}

function renderTopicGrid():void{
	if (!topicGrid) return;
	const currentScope=currentMode==="single"?scope:mentalScope;
	const allowedIds=scopeTopics[currentScope as keyof typeof scopeTopics]||scopeTopics.simple;
	const filteredTopics=topics.filter(t=>allowedIds.includes(t.id));
	topicGrid.innerHTML="";
	filteredTopics.forEach(topic=>{
		let topicElement=document.createElement("button");
		topicElement.className="topic-pill";
		topicElement.dataset.topicId=topic.id;
		topicElement.innerHTML=`
      <span class="topic-pill-icon">${topic.icon}</span>
      <span class="topic-pill-name">${topic.name}</span>
    `;
		topicElement.addEventListener("click",()=>selectTopic(topic.id));
		topicGrid!.appendChild(topicElement);
	});
	if (selectedTopic&&!allowedIds.includes(selectedTopic)){
		if (filteredTopics.length>0){
			selectTopic(filteredTopics[0].id);
		}
        else{
			selectedTopic=null;
			if (currentTopicDisplay) currentTopicDisplay.textContent="Select a topic";
		}
	}
    else if (!selectedTopic&&filteredTopics.length>0){
		selectTopic(filteredTopics[0].id);
	}
    else if (selectedTopic){
		document.querySelectorAll(".topic-pill").forEach(item=>{
			item.classList.remove("active");
		});
		let selectedElement=document.querySelector(`[data-topic-id="${selectedTopic}"]`);
		if (selectedElement) selectedElement.classList.add("active");
	}
}

function selectTopic(topicId:string):void{
	document.querySelectorAll(".topic-pill").forEach(item=>{
		item.classList.remove("active");
	});
	let selectedElement=document.querySelector(`[data-topic-id="${topicId}"]`);
	if (selectedElement){
		selectedElement.classList.add("active");
	}
	selectedTopic=topicId;
	let topic=topics.find(t=>t.id===topicId);
	if (currentTopicDisplay){
		currentTopicDisplay.textContent=topic?topic.name:"Select a topic to begin";
	}
	if (generateQuestionButton){
		generateQuestionButton.disabled=false;
		generateQuestionButton.setAttribute("aria-disabled","false");
	}
	updateUIState();
}

function pickRandomTopic():string|null{
	const currentScope=currentMode==="single"?scope:mentalScope;
	const allowedIds=scopeTopics[currentScope as keyof typeof scopeTopics]||scopeTopics.simple;
	if (allowedIds.length===0) return null;
	const randomId=allowedIds[Math.floor(Math.random()*allowedIds.length)];
	return randomId;
}

function debounceGenerate():void{
	if (generateDebounceTimeout) clearTimeout(generateDebounceTimeout);
	generateDebounceTimeout=setTimeout(()=>{
		generateQuestion();
		generateDebounceTimeout=null;
	},150);
}

function generateQuestion():void{
	if (shuffle&&currentMode==="single"){
		const randomTopic=pickRandomTopic();
		if (randomTopic){
			selectTopic(randomTopic);
		}
        else{
			showNotification("No topics available in current scope","warning");
			return;
		}
	}
	if (!selectedTopic){
		showNotification("Please select a topic first","warning");
		return;
	}
	if (!answerResults||!userAnswer||!questionArea||!checkAnswerButton) return;
	if (autoTimeout){
		clearTimeout(autoTimeout);
		autoTimeout=null;
	}
	answerResults.innerHTML=`
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
      </svg>
      <p>Your results will appear here after checking your answer</p>
    </div>
  `;
	answerResults.className="results-display";
	userAnswer.value="";
	if (expectedFormatDiv) expectedFormatDiv.textContent="";
	questionArea.innerHTML=`
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Generating question...</p>
    </div>
  `;
	switch (selectedTopic){
		case "add":
			Arithmetic.generateAddition();
			break;
		case "subtrt":
			Arithmetic.generateSubtraction();
			break;
		case "mult":
			Arithmetic.generateMultiplication();
			break;
		case "divid":
			Arithmetic.generateDivision();
			break;
		case "root":
			Algebra.generateRoot(currentDifficulty);
			break;
		case "log":
			Algebra.generateLogarithm(currentDifficulty);
			break;
		case "exp":
			Algebra.generateExponent(currentDifficulty);
			break;
		case "fact":
			Algebra.generateFactorial(currentDifficulty);
			break;
		case "ser":
			Algebra.generateSeries(currentDifficulty);
			break;
		case "real_ops":
			Algebra.generateRealNumberOperations(currentDifficulty);
			break;
		case "cartesian":
			Algebra.generateCartesianConcepts(currentDifficulty);
			break;
		case "circle_eq":
			Algebra.generateCircleEquations(currentDifficulty);
			break;
		case "linear_special":
			Algebra.generateLinearEquationSpecial(currentDifficulty);
			break;
		case "rational_eq":
			Algebra.generateRationalEquation(currentDifficulty);
			break;
		case "poly_ineq":
			Algebra.generatePolynomialInequality(currentDifficulty);
			break;
		case "func_props":
			Algebra.generateFunctionProperties(currentDifficulty);
			break;
		case "basic_funcs":
			Algebra.generateBasicFunctions();
			break;
		case "func_ops":
			Algebra.generateFunctionOperations(currentDifficulty);
			break;
		case "inverse_funcs":
			Algebra.generateInverseFunctions(currentDifficulty);
			break;
		case "transformations":
			Algebra.generateTransformations(currentDifficulty);
			break;
		case "power_model":
			Algebra.generatePowerFunctionModeling(currentDifficulty);
			break;
		case "poly_end":
			Algebra.generatePolynomialEndBehavior(currentDifficulty);
			break;
		case "synth_div":
			Algebra.generateSyntheticDivision(currentDifficulty);
			break;
		case "complex_zeros":
			Algebra.generateComplexZeros(currentDifficulty);
			break;
		case "rational_analysis":
			Algebra.generateRationalGraphAnalysis(currentDifficulty);
			break;
		case "logistic":
			Algebra.generateLogisticFunctions(currentDifficulty);
			break;
		case "exp_model":
			Algebra.generateExponentialModeling(currentDifficulty);
			break;
		case "log_model":
			Algebra.generateLogarithmicModeling();
			break;
		case "finance":
			Algebra.generateFinance();
			break;
		case "deri":
			Calculus.generateDerivative(currentDifficulty);
			break;
		case "inte":
			Calculus.generateIntegral(currentDifficulty);
			break;
		case "lim":
			Calculus.generateLimit(currentDifficulty);
			break;
		case "relRates":
			Calculus.generateRelatedRates(currentDifficulty);
			break;
		case "mtrx":
			LinearAlgebra.generateMatrix(currentDifficulty);
			break;
		case "vctr":
			LinearAlgebra.generateVector(currentDifficulty);
			break;
		case "system3x3":
			LinearAlgebra.generateSystem3x3(currentDifficulty);
			break;
		case "row_echelon3x3":
			LinearAlgebra.generateRowEchelon3x3(currentDifficulty);
			break;
		case "partial_fractions":
			LinearAlgebra.generatePartialFractions(currentDifficulty);
			break;
		case "linear_programming":
			LinearAlgebra.generateLinearProgramming(currentDifficulty);
			break;
		case "vector3d":
			LinearAlgebra.generateVector3D(currentDifficulty);
			break;
		case "line3d":
			LinearAlgebra.generateLine3D(currentDifficulty);
			break;
		case "plane3d":
			LinearAlgebra.generatePlane3D(currentDifficulty);
			break;
		case "sin":
			Trigonometry.generateSin(currentDifficulty);
			break;
		case "cos":
			Trigonometry.generateCosine(currentDifficulty);
			break;
		case "tan":
			Trigonometry.generateTangent(currentDifficulty);
			break;
		case "cosec":
			Trigonometry.generateCosecant(currentDifficulty);
			break;
		case "sec":
			Trigonometry.generateSecant(currentDifficulty);
			break;
		case "cot":
			Trigonometry.generateCotangent(currentDifficulty);
			break;
		case "trig_graph":
			Trigonometry.generateTrigGraphs(currentDifficulty);
			break;
		case "deg_to_rad":
			Trigonometry.generateDegreesToRadians(currentDifficulty);
			break;
		case "rad_to_deg":
			Trigonometry.generateRadiansToDegrees(currentDifficulty);
			break;
		case "arc_length":
			Trigonometry.generateArcLength(currentDifficulty);
			break;
		case "angular_speed":
			Trigonometry.generateAngularLinearSpeed(currentDifficulty);
			break;
		case "right_triangle_defs":
			Trigonometry.generateRightTriangleDefs(currentDifficulty);
			break;
		case "special_triangle":
			Trigonometry.generateSpecialTriangle(currentDifficulty);
			break;
		case "elev_dep":
			Trigonometry.generateElevationDepression(currentDifficulty);
			break;
		case "reference_angle":
			Trigonometry.generateReferenceAngle(currentDifficulty);
			break;
		case "astc_sign":
			Trigonometry.generateASTCSign(currentDifficulty);
			break;
		case "sum_diff":
			Trigonometry.generateSumDifference(currentDifficulty);
			break;
		case "double_angle":
			Trigonometry.generateDoubleAngle(currentDifficulty);
			break;
		case "half_angle":
			Trigonometry.generateHalfAngle(currentDifficulty);
			break;
		case "polar_to_rect":
			Trigonometry.generatePolarToRectangular(currentDifficulty);
			break;
		case "rect_to_polar":
			Trigonometry.generateRectangularToPolar(currentDifficulty);
			break;
		case "polar_distance":
			Trigonometry.generatePolarDistance(currentDifficulty);
			break;
		case "polar_graph":
			Trigonometry.generatePolarGraphEquation(currentDifficulty);
			break;
		case "parametric_to_cartesian":
			Trigonometry.generateParametricToCartesian(currentDifficulty);
			break;
		case "parametric_motion":
			Trigonometry.generateParametricMotion(currentDifficulty);
			break;
		case "complex_polar":
			Trigonometry.generateComplexPolarForm(currentDifficulty);
			break;
		case "complex_mult_div":
			Trigonometry.generateComplexMultiplyDivide(currentDifficulty);
			break;
		case "demoivre":
			Trigonometry.generateDeMoivre(currentDifficulty);
			break;
		case "complex_roots":
			Trigonometry.generateComplexRoots(currentDifficulty);
			break;
		case "perm":
			DiscreteMathematics.generatePermutation(currentDifficulty);
			break;
		case "comb":
			DiscreteMathematics.generateCombination(currentDifficulty);
			break;
		case "prob":
			DiscreteMathematics.generateProbability(currentDifficulty);
			break;
		case "stats":
			DiscreteMathematics.generateStatistics(currentDifficulty);
			break;
		case "arithmetic_sequence":
			DiscreteMathematics.generateArithmeticSequence(currentDifficulty);
			break;
		case "geometric_sequence":
			DiscreteMathematics.generateGeometricSequence(currentDifficulty);
			break;
		case "sequence_limit":
			DiscreteMathematics.generateSequenceLimit(currentDifficulty);
			break;
		case "infinite_series":
			DiscreteMathematics.generateInfiniteGeometricSeries(currentDifficulty);
			break;
		case "induction":
			DiscreteMathematics.generateMathematicalInduction(currentDifficulty);
			break;
		case "binomial":
			DiscreteMathematics.generateBinomialTheorem(currentDifficulty);
			break;
		case "area_circle":
			Geometry.generateAreaCircle(currentDifficulty);
			break;
		case "pythag":
			Geometry.generatePythagorean(currentDifficulty);
			break;
		case "volume_sphere":
			Geometry.generateVolumeSphere(currentDifficulty);
			break;
		case "parabola":
			Geometry.generateParabola(currentDifficulty);
			break;
		case "ellipse":
			Geometry.generateEllipse(currentDifficulty);
			break;
		case "hyperbola":
			Geometry.generateHyperbola(currentDifficulty);
			break;
		case "polar_conics":
			Geometry.generatePolarConic(currentDifficulty);
			break;
		case "coord3d":
			Geometry.generate3DDistanceMidpoint(currentDifficulty);
			break;
		case "sphere_eq":
			Geometry.generateSphereEquation(currentDifficulty);
			break;
		case "line_plane_3d":
			Geometry.generateLinePlane3D(currentDifficulty);
			break;

		default:
			questionArea.innerHTML=`<div class="empty-state"><p>Please select a topic to generate a question</p></div>`;
			return;
	}
	if (expectedFormatDiv&&window.expectedFormat){
		expectedFormatDiv.textContent="Expected format: "+window.expectedFormat;
	}
	userAnswer.disabled=false;
	userAnswer.removeAttribute("aria-disabled");
	checkAnswerButton.disabled=false;
	checkAnswerButton.setAttribute("aria-disabled","false");
	userAnswer.focus();
	updatePreview();
	updateUIState();
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([questionArea]).catch((err:any)=>console.log("MathJax typeset error:",err));
	}
}

function isAnswerCorrect(userInput:string,correct:string,alternate?:string):boolean{
	function prepareForEval(expr:string):string{
		return expr.replace(/\\?π/g,"pi").replace(/[°˚]|deg(rees?)?/g,"").replace(/rad(ians?)?/g,"").replace(/\s+/g,"");
	}
	function evaluateExpression(expr:string):number|null{
		try{
			const cleaned=prepareForEval(expr);
			const result=math.evaluate(cleaned);
			if (typeof result==="number"&&!isNaN(result)){
				return result;
			}
			return null;
		}
        catch{
			return null;
		}
	}
	function getTolerance():number{
		return 0.5*Math.pow(10,-settings.decimalPlaces);
	}
	const trimmedInput=userInput.trim();
	if (!trimmedInput) return false;
	const userNum=evaluateExpression(trimmedInput);
	if (userNum!==null){
		const correctNum=evaluateExpression(correct);
		if (correctNum!==null){
			const tol=getTolerance();
			if (Math.abs(userNum-correctNum)<tol) return true;
		}
		if (alternate){
			const altNum=evaluateExpression(alternate);
			if (altNum!==null){
				const tol=getTolerance();
				if (Math.abs(userNum-altNum)<tol) return true;
			}
		}
	}
	function normalizeSymbolic(input:string):string{
		return input.replace(/\s+/g,"").toLowerCase()
			.replace(/\\?π/g,"pi")
			.replace(/[°˚]|deg(rees?)?/g,"")
			.replace(/rad(ians?)?/g,"");
	}
	const userSym=normalizeSymbolic(trimmedInput);
	const correctSym=normalizeSymbolic(correct);
	if (userSym===correctSym) return true;
	if (alternate){
		const altSym=normalizeSymbolic(alternate);
		if (userSym===altSym) return true;
	}
	const userSimple=trimmedInput.replace(/\s+/g,"").toLowerCase();
	const correctSimple=correct.replace(/\s+/g,"").toLowerCase();
	if (userSimple===correctSimple) return true;
	if (alternate){
		const altSimple=alternate.replace(/\s+/g,"").toLowerCase();
		if (userSimple===altSimple) return true;
	}
	return false;
}

function checkAnswer():void{
	if (!selectedTopic){
		showNotification("Please select a topic and generate a question first","warning");
		return;
	}
	if (!userAnswer||!answerResults) return;
	let userInput=userAnswer.value.trim();
	if (!userInput){
		showNotification("Please enter an answer before checking","warning");
		return;
	}
	let correct=window.correctAnswer.correct;
	let alternate=window.correctAnswer.alternate;
	let isCorrect=isAnswerCorrect(userInput,correct,alternate);
	if (settings.sound){
		const audioCtx=new (window.AudioContext||(window as any).webkitAudioContext)();
		const oscillator=audioCtx.createOscillator();
		const gainNode=audioCtx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);
		oscillator.frequency.value=isCorrect?880:440;
		gainNode.gain.setValueAtTime(0.1,audioCtx.currentTime);
		oscillator.start();
		oscillator.stop(audioCtx.currentTime+0.1);
	}
	if (settings.vibration&&navigator.vibrate){
		navigator.vibrate(isCorrect?50:100);
	}
	if (isCorrect){
		answerResults.innerHTML=`
      <div class="result-success">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <div>
          <h3>Correct!</h3>
          <p>The answer is <strong>${window.correctAnswer.correct}</strong></p>
        </div>
      </div>
    `;
		answerResults.className="results-display correct";
		if (copyAnswerBtn) copyAnswerBtn.style.display="inline-flex";
	}
    else{
		answerResults.innerHTML=`
      <div class="result-error">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <div>
          <h3>Incorrect</h3>
          <p>The correct answer is <strong>${window.correctAnswer.correct}</strong></p>
        </div>
      </div>
    `;
		answerResults.className="results-display incorrect";
		if (copyAnswerBtn) copyAnswerBtn.style.display="inline-flex";
	}
	userAnswer.value="";
	updatePreview();
	userAnswer.focus();
	if (currentMode==="single"&&autocontinue){
		if (autoTimeout) clearTimeout(autoTimeout);
		autoTimeout=setTimeout(()=>{
			generateQuestion();
			autoTimeout=null;
		},3000);
	}
}

function updateUIState():void{
	if (!generateQuestionButton||!checkAnswerButton||!questionArea) return;
	let hasTopic=selectedTopic!==null;
	let hasQuestion=questionArea.innerHTML.includes("mjx-container")||!questionArea.innerHTML.includes("empty-state");
	generateQuestionButton.disabled=!hasTopic;
	generateQuestionButton.setAttribute("aria-disabled",String(!hasTopic));
	checkAnswerButton.disabled=!hasTopic||!hasQuestion;
	checkAnswerButton.setAttribute("aria-disabled",String(!hasTopic||!hasQuestion));
	if (hasTopic&&hasQuestion){
		generateQuestionButton.innerHTML=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      New Question
      <kbd class="shortcut-hint">Ctrl+G</kbd>
    `;
	}
    else{
		generateQuestionButton.innerHTML=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      Generate Question
      <kbd class="shortcut-hint">Ctrl+G</kbd>
    `;
	}
}

function showNotification(message:string,type:"info"|"warning"="info"):void{
	if (!settings.notifications) return;
	let notification=document.createElement("div");
	notification.className=`notification notification-${type}`;
	notification.textContent=message;
	notification.setAttribute("role","alert");
	document.body.appendChild(notification);
	setTimeout(()=>{
		notification.classList.add("fade-out");
		setTimeout(()=>{
			if (notification.parentNode){
				notification.parentNode.removeChild(notification);
			}
		},300);
	},3000);
}

function setupEventListeners():void{
	if (!generateQuestionButton||!checkAnswerButton||!userAnswer||!themeToggle||!helpButton||!settingsButton||!modeSingleBtn||!modeMentalBtn||!mentalControls||!singleControls||!difficultySelect||!timerDisplay||!scoreDisplay||!startSessionBtn) return;

	generateQuestionButton.addEventListener("click",debounceGenerate);
	checkAnswerButton.addEventListener("click",checkAnswer);
	userAnswer.addEventListener("keyup",function(e:KeyboardEvent){
		if (e.shiftKey&&e.key==="Enter"){
			if (currentMode==="single") checkAnswer();
			else if (sessionActive) handleMentalAnswer();
		}
	});
	document.addEventListener("keydown",(e:KeyboardEvent)=>{
		if (e.ctrlKey||e.metaKey){
			switch (e.key){
				case "g": case "G":
					e.preventDefault();
					if (currentMode==="single") debounceGenerate();
					break;
				case "Enter":
					if (e.shiftKey) break;
					e.preventDefault();
					if (currentMode==="single") checkAnswer();
					else if (sessionActive) handleMentalAnswer();
					break;
				case "1":
					e.preventDefault();
					if (!modeSingleBtn?.classList.contains("disabled")) modeSingleBtn?.click();
					break;
				case "2":
					e.preventDefault();
					if (!modeMentalBtn?.classList.contains("disabled")) modeMentalBtn?.click();
					break;
				case ",":
					e.preventDefault();
					openSettings();
					break;
				case "t": case "T":
					if (e.shiftKey){
						e.preventDefault();
						themeToggle?.click();
					}
					break;
			}
		}
	});
	themeToggle.addEventListener("click",function(){
		let isDark=document.documentElement.classList.contains("dark");
		applyTheme(isDark?"light":"dark");
		if (settingsTheme){
			settingsTheme.value=isDark?"light":"dark";
			settings.theme=settingsTheme.value as "light"|"dark";
			saveSettings();
		}
	});
	helpButton.addEventListener("click",function(){
		showNotification("Select a topic, generate a question, enter your answer, and check it!","info");
	});
	settingsButton.addEventListener("click",openSettings);
	if (settingsClose) settingsClose.addEventListener("click",closeSettings);
	if (settingsSave) settingsSave.addEventListener("click",()=>{
		saveSettings();
		closeSettings();
	});
	if (settingsReset) settingsReset.addEventListener("click",resetSettings);
	if (settingsModal) settingsModal.addEventListener("click",(e)=>{
		if (e.target===settingsModal) closeSettings();
	});
	if (settingsTheme){
		settingsTheme.addEventListener("change",(e)=>previewSetting("theme",(e.target as HTMLSelectElement).value));
	}
	if (settingsDefaultMode){
		settingsDefaultMode.addEventListener("change",(e)=>previewSetting("defaultMode",(e.target as HTMLSelectElement).value));
	}
	if (settingsAutoContinue){
		settingsAutoContinue.addEventListener("change",(e)=>previewSetting("autoContinue",(e.target as HTMLInputElement).checked));
	}
	if (settingsShuffle){
		settingsShuffle.addEventListener("change",(e)=>previewSetting("shuffle",(e.target as HTMLInputElement).checked));
	}
	if (settingsScope){
		settingsScope.addEventListener("change",(e)=>previewSetting("scope",(e.target as HTMLSelectElement).value));
	}
	if (settingsDifficulty){
		settingsDifficulty.addEventListener("change",(e)=>previewSetting("difficulty",(e.target as HTMLSelectElement).value));
	}
	if (settingsTimer){
		settingsTimer.addEventListener("input",(e)=>previewSetting("timer",(e.target as HTMLInputElement).value));
	}
	if (settingsMaxQuestions){
		settingsMaxQuestions.addEventListener("input",(e)=>previewSetting("maxQuestions",(e.target as HTMLInputElement).value));
	}
	if (settingsFont){
		settingsFont.addEventListener("change",(e)=>previewSetting("font",(e.target as HTMLSelectElement).value));
	}
	if (settingsPerfMaster){
		settingsPerfMaster.addEventListener("change",(e)=>previewSetting("perfMaster",(e.target as HTMLInputElement).checked));
	}
	if (settingsPerfWave){
		settingsPerfWave.addEventListener("change",(e)=>previewSetting("perfWave",(e.target as HTMLInputElement).checked));
	}
	if (settingsPerfBlur){
		settingsPerfBlur.addEventListener("change",(e)=>previewSetting("perfBlur",(e.target as HTMLInputElement).checked));
	}
	if (settingsPerfPreview){
		settingsPerfPreview.addEventListener("change",(e)=>previewSetting("perfPreview",(e.target as HTMLInputElement).checked));
	}
	if (settingsPerfAnimations){
		settingsPerfAnimations.addEventListener("change",(e)=>previewSetting("perfAnimations",(e.target as HTMLInputElement).checked));
	}
	if (settingsFpsCap){
		settingsFpsCap.addEventListener("change",(e)=>previewSetting("fpsCap",(e.target as HTMLSelectElement).value));
	}
	if (settingsNotifications){
		settingsNotifications.addEventListener("change",(e)=>previewSetting("notifications",(e.target as HTMLInputElement).checked));
	}
	if (settingsAutoCheckDelay){
		settingsAutoCheckDelay.addEventListener("input",(e)=>previewSetting("autoCheckDelay",(e.target as HTMLInputElement).value));
	}
	if (settingsDecimalPlaces){
		settingsDecimalPlaces.addEventListener("input",(e)=>previewSetting("decimalPlaces",(e.target as HTMLInputElement).value));
	}
	if (settingsSound){
		settingsSound.addEventListener("change",(e)=>previewSetting("sound",(e.target as HTMLInputElement).checked));
	}
	if (settingsVibration){
		settingsVibration.addEventListener("change",(e)=>previewSetting("vibration",(e.target as HTMLInputElement).checked));
	}
	modeSingleBtn.addEventListener("click",function(){
		if (modeSingleBtn!.classList.contains("disabled")) return;
		modeSingleBtn!.classList.add("active");
		modeMentalBtn!.classList.remove("active");
		currentMode="single";
		mentalControls!.style.display="none";
		singleControls!.style.display="flex";
		if (sessionActive) endMentalSession();
		if (autoTimeout){
			clearTimeout(autoTimeout);
			autoTimeout=null;
		}
		if (mentalScopeSelect) scope=mentalScopeSelect.value;
		if (scopeSelect) scopeSelect.value=scope;
		if (mentalShuffleToggle) shuffle=mentalShuffleToggle.checked;
		if (shuffleToggle) shuffleToggle.checked=shuffle;
		updateAriaPressed();
		renderTopicGrid();
		updateUIState();
	});
	modeMentalBtn.addEventListener("click",function(){
		if (modeMentalBtn!.classList.contains("disabled")) return;
		modeMentalBtn!.classList.add("active");
		modeSingleBtn!.classList.remove("active");
		currentMode="mental";
		mentalControls!.style.display="flex";
		singleControls!.style.display="none";
		if (sessionActive) endMentalSession();
		if (autoTimeout){
			clearTimeout(autoTimeout);
			autoTimeout=null;
		}
		if (scopeSelect) mentalScope=scopeSelect.value;
		if (mentalScopeSelect) mentalScopeSelect.value=mentalScope;
		if (shuffleToggle) mentalShuffle=shuffleToggle.checked;
		if (mentalShuffleToggle) mentalShuffleToggle.checked=mentalShuffle;
		updateAriaPressed();
		renderTopicGrid();
		updateUIState();
	});
	difficultySelect.addEventListener("change",function(e:Event){
		currentDifficulty=(e.target as HTMLSelectElement).value;
	});
	startSessionBtn.addEventListener("click",startMentalSession);
	if (pauseSessionBtn){
		pauseSessionBtn.addEventListener("click",pauseMentalSession);
	}
	if (skipQuestionBtn){
		skipQuestionBtn.addEventListener("click",skipMentalQuestion);
	}
	if (autocontinueToggle){
		autocontinueToggle.addEventListener("change",(e)=>{
			autocontinue=(e.target as HTMLInputElement).checked;
			updateCheckboxAria(autocontinueToggle);
			if (!autocontinue&&autoTimeout){
				clearTimeout(autoTimeout);
				autoTimeout=null;
			}
		});
	}
	if (scopeSelect){
		scopeSelect.addEventListener("change",(e)=>{
			scope=(e.target as HTMLSelectElement).value;
			renderTopicGrid();
			if (autoTimeout){
				clearTimeout(autoTimeout);
				autoTimeout=null;
			}
		});
	}
	if (shuffleToggle){
		shuffleToggle.addEventListener("change",(e)=>{
			shuffle=(e.target as HTMLInputElement).checked;
			updateCheckboxAria(shuffleToggle);
		});
	}
	if (mentalScopeSelect){
		mentalScopeSelect.addEventListener("change",(e)=>{
			mentalScope=(e.target as HTMLSelectElement).value;
			renderTopicGrid();
		});
	}
	if (mentalShuffleToggle){
		mentalShuffleToggle.addEventListener("change",(e)=>{
			mentalShuffle=(e.target as HTMLInputElement).checked;
			updateCheckboxAria(mentalShuffleToggle);
		});
	}
	if (mathToolbar){
		mathToolbar.querySelectorAll(".math-toolbar-btn").forEach(btn=>{
			btn.addEventListener("click",(e)=>{
				const symbol=(e.target as HTMLElement).dataset.symbol||"";
				insertSymbol(symbol);
			});
		});
	}
	if (userAnswer){
		userAnswer.addEventListener("input",updatePreviewDebounced);
	}
	if (copyAnswerBtn){
		copyAnswerBtn.addEventListener("click",copyCorrectAnswer);
	}
	if (userAnswer&&customContextMenu){
		userAnswer.addEventListener("contextmenu",(e)=>{
			e.preventDefault();
			const x=e.clientX;
			const y=e.clientY;
			customContextMenu.style.display="block";
			customContextMenu.style.left=x+"px";
			customContextMenu.style.top=y+"px";
		});
		document.addEventListener("click",()=>{
			customContextMenu.style.display="none";
		});
		customContextMenu.querySelectorAll(".context-menu-item").forEach(item=>{
			item.addEventListener("click",(e)=>{
				const action=(e.target as HTMLElement).dataset.action;
				if (action==="paste"){
					navigator.clipboard.readText().then(text=>{
						if (userAnswer) userAnswer.value=text;
						updatePreviewDebounced();
					});
				}
                else if (action==="clear"){
					if (userAnswer) userAnswer.value="";
					updatePreviewDebounced();
				}
				customContextMenu.style.display="none";
			});
		});
	}
}

function updateMathJaxColors():void{
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise().catch((_err:any)=>console.log("MathJax re-render error:",_err));
	}
}

function pauseMentalSession():void{
	if (!sessionActive) return;
	sessionPaused=!sessionPaused;
	if (pauseSessionBtn){
		pauseSessionBtn.innerHTML=sessionPaused?"<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M8 5v14l11-7z\"/></svg>":"<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M6 19h4V5H6v14zm8-14v14h4V5h-4z\"/></svg>";
		pauseSessionBtn.setAttribute("aria-label",sessionPaused?"Resume":"Pause");
	}
	if (userAnswer) userAnswer.disabled=sessionPaused;
}

function skipMentalQuestion():void{
	if (!sessionActive||sessionPaused) return;
	if (mentalNextQuestionTimeout){
		clearTimeout(mentalNextQuestionTimeout);
		mentalNextQuestionTimeout=null;
	}
	if (answerResults){
		answerResults.innerHTML=`<div class="result-info">⏩ Skipped</div>`;
		answerResults.className="results-display";
	}
	sessionScore.total++;
	updateScoreDisplay();
	updateProgressBar();
	if (mentalProgressBar){
		let percent=(sessionScore.total/maxQuestions)*100;
		mentalProgressBar.style.width=percent+"%";
	}
	if (sessionScore.total>=maxQuestions){
		endMentalSession();
		return;
	}
	timeLeft=settings.timer;
	updateTimerDisplay();
	saveSessionSnapshot();
	mentalNextQuestionTimeout=setTimeout(()=>{
		if (sessionActive&&!sessionPaused){
			generateNextMentalQuestion();
		}
		mentalNextQuestionTimeout=null;
	},settings.autoCheckDelay);
}

function startMentalSession():void{
	if (!selectedTopic&&!mentalShuffle){
		showNotification("Please select a topic or enable shuffle","warning");
		return;
	}
	if (mentalShuffle&&!pickRandomTopic()){
		showNotification("No topics available in current scope","warning");
		return;
	}
	if (mentalNextQuestionTimeout){
		clearTimeout(mentalNextQuestionTimeout);
		mentalNextQuestionTimeout=null;
	}
	sessionActive=true;
	sessionPaused=false;
	sessionScore={correct:0,total:0};
	timeLeft=settings.timer;
	maxQuestions=settings.maxQuestions;
	updateScoreDisplay();
	updateTimerDisplay();
	if (mentalProgressBar) mentalProgressBar.style.width="0%";
	updateProgressBar();
	startTimer();
	disableTopicSelection(true);
	disableModeButtons(true);
	disableDifficulty(true);
	setSessionButton(true);
	generateNextMentalQuestion();
}

function generateNextMentalQuestion():void{
	if (!sessionActive||sessionPaused) return;
	if (mentalShuffle){
		const randomTopic=pickRandomTopic();
		if (randomTopic){
			selectedTopic=randomTopic;
			document.querySelectorAll(".topic-pill").forEach(item=>{
				item.classList.remove("active");
			});
			let selectedElement=document.querySelector(`[data-topic-id="${selectedTopic}"]`);
			if (selectedElement) selectedElement.classList.add("active");
			let topic=topics.find(t=>t.id===selectedTopic);
			if (currentTopicDisplay){
				currentTopicDisplay.textContent=topic?topic.name:"Topic";
			}
		}
        else{
			endMentalSession();
			showNotification("No topics available","warning");
			return;
		}
	}
	if (!selectedTopic){
		endMentalSession();
		return;
	}
	if (!questionArea||!userAnswer||!checkAnswerButton) return;
	if (answerResults){
		answerResults.innerHTML=`<div class="empty-state">...</div>`;
	}
	if (copyAnswerBtn) copyAnswerBtn.style.display="none";
	questionArea.innerHTML=`
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Generating...</p>
    </div>
  `;
	switch (selectedTopic){
		case "add":
			Arithmetic.generateAddition(currentDifficulty);
			break;
		case "subtrt":
			Arithmetic.generateSubtraction(currentDifficulty);
			break;
		case "mult":
			Arithmetic.generateMultiplication(currentDifficulty);
			break;
		case "divid":
			Arithmetic.generateDivision(currentDifficulty);
			break;
		case "root":
			Algebra.generateRoot(currentDifficulty);
			break;
		case "log":
			Algebra.generateLogarithm(currentDifficulty);
			break;
		case "exp":
			Algebra.generateExponent(currentDifficulty);
			break;
		case "fact":
			Algebra.generateFactorial(currentDifficulty);
			break;
		case "ser":
			Algebra.generateSeries(currentDifficulty);
			break;
		case "real_ops":
			Algebra.generateRealNumberOperations(currentDifficulty);
			break;
		case "cartesian":
			Algebra.generateCartesianConcepts(currentDifficulty);
			break;
		case "circle_eq":
			Algebra.generateCircleEquations(currentDifficulty);
			break;
		case "linear_special":
			Algebra.generateLinearEquationSpecial(currentDifficulty);
			break;
		case "rational_eq":
			Algebra.generateRationalEquation(currentDifficulty);
			break;
		case "poly_ineq":
			Algebra.generatePolynomialInequality(currentDifficulty);
			break;
		case "func_props":
			Algebra.generateFunctionProperties(currentDifficulty);
			break;
		case "basic_funcs":
			Algebra.generateBasicFunctions();
			break;
		case "func_ops":
			Algebra.generateFunctionOperations(currentDifficulty);
			break;
		case "inverse_funcs":
			Algebra.generateInverseFunctions(currentDifficulty);
			break;
		case "transformations":
			Algebra.generateTransformations(currentDifficulty);
			break;
		case "power_model":
			Algebra.generatePowerFunctionModeling(currentDifficulty);
			break;
		case "poly_end":
			Algebra.generatePolynomialEndBehavior(currentDifficulty);
			break;
		case "synth_div":
			Algebra.generateSyntheticDivision(currentDifficulty);
			break;
		case "complex_zeros":
			Algebra.generateComplexZeros(currentDifficulty);
			break;
		case "rational_analysis":
			Algebra.generateRationalGraphAnalysis(currentDifficulty);
			break;
		case "logistic":
			Algebra.generateLogisticFunctions(currentDifficulty);
			break;
		case "exp_model":
			Algebra.generateExponentialModeling(currentDifficulty);
			break;
		case "log_model":
			Algebra.generateLogarithmicModeling();
			break;
		case "finance":
			Algebra.generateFinance();
			break;
		case "deri":
			Calculus.generateDerivative(currentDifficulty);
			break;
		case "inte":
			Calculus.generateIntegral(currentDifficulty);
			break;
		case "lim":
			Calculus.generateLimit(currentDifficulty);
			break;
		case "relRates":
			Calculus.generateRelatedRates(currentDifficulty);
			break;
		case "mtrx":
			LinearAlgebra.generateMatrix(currentDifficulty);
			break;
		case "vctr":
			LinearAlgebra.generateVector(currentDifficulty);
			break;
		case "system3x3":
			LinearAlgebra.generateSystem3x3(currentDifficulty);
			break;
		case "row_echelon3x3":
			LinearAlgebra.generateRowEchelon3x3(currentDifficulty);
			break;
		case "partial_fractions":
			LinearAlgebra.generatePartialFractions(currentDifficulty);
			break;
		case "linear_programming":
			LinearAlgebra.generateLinearProgramming(currentDifficulty);
			break;
		case "vector3d":
			LinearAlgebra.generateVector3D(currentDifficulty);
			break;
		case "line3d":
			LinearAlgebra.generateLine3D(currentDifficulty);
			break;
		case "plane3d":
			LinearAlgebra.generatePlane3D(currentDifficulty);
			break;
		case "sin":
			Trigonometry.generateSin(currentDifficulty);
			break;
		case "cos":
			Trigonometry.generateCosine(currentDifficulty);
			break;
		case "tan":
			Trigonometry.generateTangent(currentDifficulty);
			break;
		case "cosec":
			Trigonometry.generateCosecant(currentDifficulty);
			break;
		case "sec":
			Trigonometry.generateSecant(currentDifficulty);
			break;
		case "cot":
			Trigonometry.generateCotangent(currentDifficulty);
			break;
		case "trig_graph":
			Trigonometry.generateTrigGraphs(currentDifficulty);
			break;
		case "deg_to_rad":
			Trigonometry.generateDegreesToRadians(currentDifficulty);
			break;
		case "rad_to_deg":
			Trigonometry.generateRadiansToDegrees(currentDifficulty);
			break;
		case "arc_length":
			Trigonometry.generateArcLength(currentDifficulty);
			break;
		case "angular_speed":
			Trigonometry.generateAngularLinearSpeed(currentDifficulty);
			break;
		case "right_triangle_defs":
			Trigonometry.generateRightTriangleDefs(currentDifficulty);
			break;
		case "special_triangle":
			Trigonometry.generateSpecialTriangle(currentDifficulty);
			break;
		case "elev_dep":
			Trigonometry.generateElevationDepression(currentDifficulty);
			break;
		case "reference_angle":
			Trigonometry.generateReferenceAngle(currentDifficulty);
			break;
		case "astc_sign":
			Trigonometry.generateASTCSign(currentDifficulty);
			break;
		case "sum_diff":
			Trigonometry.generateSumDifference(currentDifficulty);
			break;
		case "double_angle":
			Trigonometry.generateDoubleAngle(currentDifficulty);
			break;
		case "half_angle":
			Trigonometry.generateHalfAngle(currentDifficulty);
			break;
		case "polar_to_rect":
			Trigonometry.generatePolarToRectangular(currentDifficulty);
			break;
		case "rect_to_polar":
			Trigonometry.generateRectangularToPolar(currentDifficulty);
			break;
		case "polar_distance":
			Trigonometry.generatePolarDistance(currentDifficulty);
			break;
		case "polar_graph":
			Trigonometry.generatePolarGraphEquation(currentDifficulty);
			break;
		case "parametric_to_cartesian":
			Trigonometry.generateParametricToCartesian(currentDifficulty);
			break;
		case "parametric_motion":
			Trigonometry.generateParametricMotion(currentDifficulty);
			break;
		case "complex_polar":
			Trigonometry.generateComplexPolarForm(currentDifficulty);
			break;
		case "complex_mult_div":
			Trigonometry.generateComplexMultiplyDivide(currentDifficulty);
			break;
		case "demoivre":
			Trigonometry.generateDeMoivre(currentDifficulty);
			break;
		case "complex_roots":
			Trigonometry.generateComplexRoots(currentDifficulty);
			break;
		case "perm":
			DiscreteMathematics.generatePermutation(currentDifficulty);
			break;
		case "comb":
			DiscreteMathematics.generateCombination(currentDifficulty);
			break;
		case "prob":
			DiscreteMathematics.generateProbability(currentDifficulty);
			break;
		case "stats":
			DiscreteMathematics.generateStatistics(currentDifficulty);
			break;
		case "arithmetic_sequence":
			DiscreteMathematics.generateArithmeticSequence(currentDifficulty);
			break;
		case "geometric_sequence":
			DiscreteMathematics.generateGeometricSequence(currentDifficulty);
			break;
		case "sequence_limit":
			DiscreteMathematics.generateSequenceLimit(currentDifficulty);
			break;
		case "infinite_series":
			DiscreteMathematics.generateInfiniteGeometricSeries(currentDifficulty);
			break;
		case "induction":
			DiscreteMathematics.generateMathematicalInduction(currentDifficulty);
			break;
		case "binomial":
			DiscreteMathematics.generateBinomialTheorem(currentDifficulty);
			break;
		case "area_circle":
			Geometry.generateAreaCircle(currentDifficulty);
			break;
		case "pythag":
			Geometry.generatePythagorean(currentDifficulty);
			break;
		case "volume_sphere":
			Geometry.generateVolumeSphere(currentDifficulty);
			break;
		case "parabola":
			Geometry.generateParabola(currentDifficulty);
			break;
		case "ellipse":
			Geometry.generateEllipse(currentDifficulty);
			break;
		case "hyperbola":
			Geometry.generateHyperbola(currentDifficulty);
			break;
		case "polar_conics":
			Geometry.generatePolarConic(currentDifficulty);
			break;
		case "coord3d":
			Geometry.generate3DDistanceMidpoint(currentDifficulty);
			break;
		case "sphere_eq":
			Geometry.generateSphereEquation(currentDifficulty);
			break;
		case "line_plane_3d":
			Geometry.generateLinePlane3D(currentDifficulty);
			break;

		default:
			questionArea.innerHTML=`<div class="empty-state"><p>Unknown topic</p></div>`;
			return;
	}
	if (expectedFormatDiv&&window.expectedFormat){
		expectedFormatDiv.textContent="Expected format: "+window.expectedFormat;
	}
	userAnswer.disabled=false;
	userAnswer.removeAttribute("aria-disabled");
	userAnswer.focus();
	updatePreview();
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([questionArea]).catch((err:any)=>console.log("MathJax typeset error:",err));
	}
}

async function handleMentalAnswer():Promise<void>{
	if (!sessionActive||sessionPaused) return;
	if (!userAnswer||!answerResults) return;
	if (mentalNextQuestionTimeout){
		clearTimeout(mentalNextQuestionTimeout);
		mentalNextQuestionTimeout=null;
	}
	let userInput=userAnswer.value.trim();
	if (!userInput){
		showNotification("Please enter an answer","warning");
		return;
	}
	let correct=window.correctAnswer.correct;
	let alternate=window.correctAnswer.alternate;
	let isCorrect=await checkAnswerFast(userInput,correct,alternate);
	if (!sessionActive) return;
	if (settings.sound){
		const audioCtx=new (window.AudioContext||(window as any).webkitAudioContext)();
		const oscillator=audioCtx.createOscillator();
		const gainNode=audioCtx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);
		oscillator.frequency.value=isCorrect?880:440;
		gainNode.gain.setValueAtTime(0.1,audioCtx.currentTime);
		oscillator.start();
		oscillator.stop(audioCtx.currentTime+0.1);
	}
	if (settings.vibration&&navigator.vibrate){
		navigator.vibrate(isCorrect?50:100);
	}
	if (isCorrect) sessionScore.correct++;
	sessionScore.total++;
	updateScoreDisplay();
	updateProgressBar();
	if (mentalProgressBar){
		let percent=(sessionScore.total/maxQuestions)*100;
		mentalProgressBar.style.width=percent+"%";
	}
	if (answerResults){
		answerResults.innerHTML=isCorrect
			?`<div class="result-success">✅ Correct!</div>`
			:`<div class="result-error">❌ Incorrect. The answer was ${correct}</div>`;
		answerResults.className=isCorrect?"results-display correct":"results-display incorrect";
	}
	if (copyAnswerBtn) copyAnswerBtn.style.display="inline-flex";
	if (userAnswer) userAnswer.value="";
	updatePreview();
	saveSessionSnapshot();
	if (sessionScore.total>=maxQuestions){
		endMentalSession();
		return;
	}
	mentalNextQuestionTimeout=setTimeout(()=>{
		if (sessionActive&&!sessionPaused){
			timeLeft=settings.timer;
			updateTimerDisplay();
			generateNextMentalQuestion();
		}
		mentalNextQuestionTimeout=null;
	},settings.autoCheckDelay);
}

async function checkAnswerFast(userInput:string,correct:string,alternate?:string):Promise<boolean>{
	if (window.__TAURI__){
		try{
			return await invoke("check_math",{userExpr:userInput,correctExpr:correct});
		}
        catch(e){
			console.warn("Rust check failed, falling back to JS",e);
		}
	}
	return isAnswerCorrect(userInput,correct,alternate);
}

function endMentalSession():void{
	sessionActive=false;
	sessionPaused=false;
	localStorage.removeItem(SESSION_STORAGE_KEY);
	if (sessionTimer){
		clearInterval(sessionTimer);
		sessionTimer=null;
	}
	if (mentalNextQuestionTimeout){
		clearTimeout(mentalNextQuestionTimeout);
		mentalNextQuestionTimeout=null;
	}
	if (mentalProgressBar) mentalProgressBar.style.width="0%";
	updateProgressBar();
	disableTopicSelection(false);
	disableModeButtons(false);
	disableDifficulty(false);
	setSessionButton(false);
	if (userAnswer){
		userAnswer.disabled=true;
		userAnswer.value="";
		userAnswer.setAttribute("aria-disabled","true");
	}
	if (checkAnswerButton){
		checkAnswerButton.disabled=true;
		checkAnswerButton.setAttribute("aria-disabled","true");
	}
	if (answerResults){
		answerResults.innerHTML=`<div class="empty-state">...</div>`;
		answerResults.className="results-display";
	}
	if (copyAnswerBtn) copyAnswerBtn.style.display="none";
	if (expectedFormatDiv) expectedFormatDiv.textContent="";
	showNotification(`Session finished! Score: ${sessionScore.correct}/${sessionScore.total}`,"info");
	promptSaveScore();
}

function promptSaveScore():void{
	if (!window.__TAURI__){
		let scores=JSON.parse(localStorage.getItem("leaderboard")||"[]");
		scores.push({
			topic:selectedTopic,
			score:sessionScore.correct,
			total:sessionScore.total,
			difficulty:currentDifficulty,
			date:new Date().toISOString()
		});
		localStorage.setItem("leaderboard",JSON.stringify(scores));
		showNotification("Score saved locally!","info");
	}
    else{
		invoke("save_score",{
			entry:{
				topic:selectedTopic,
				score:sessionScore.correct,
				total:sessionScore.total,
				difficulty:currentDifficulty,
				date:new Date().toISOString()
			}
		}).then(()=>showNotification("Score saved!","info"))
			.catch(_err=>showNotification("Failed to save score","warning"));
	}
}

function startTimer():void{
	if (sessionTimer) clearInterval(sessionTimer);
	sessionTimer=setInterval(()=>{
		if (!sessionActive||sessionPaused) return;
		timeLeft--;
		updateTimerDisplay();
		saveSessionSnapshot();
		if (timeLeft<=0){
			sessionScore.total++;
			updateScoreDisplay();
			updateProgressBar();
			showNotification("Time is up!","warning");
			if (mentalProgressBar){
				let percent=(sessionScore.total/maxQuestions)*100;
				mentalProgressBar.style.width=percent+"%";
			}
			if (sessionScore.total>=maxQuestions){
				endMentalSession();
				return;
			}
			timeLeft=settings.timer;
			updateTimerDisplay();
			saveSessionSnapshot();
			if (mentalNextQuestionTimeout){
				clearTimeout(mentalNextQuestionTimeout);
				mentalNextQuestionTimeout=null;
			}
			mentalNextQuestionTimeout=setTimeout(()=>{
				if (sessionActive&&!sessionPaused){
					generateNextMentalQuestion();
				}
				mentalNextQuestionTimeout=null;
			},settings.autoCheckDelay);
		}
	},1000);
}
function updateTimerDisplay():void{
	if (!timerDisplay) return;
	let mins=Math.floor(Math.max(0,timeLeft)/60);
	let secs=Math.max(0,timeLeft)%60;
	timerDisplay.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg> ${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
}
function updateScoreDisplay():void{
	if (!scoreDisplay) return;
	scoreDisplay.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${sessionScore.correct} / ${sessionScore.total}`;
}
function disableTopicSelection(disabled:boolean):void{
	document.querySelectorAll(".topic-pill").forEach(el=>{
		(el as HTMLButtonElement).disabled=disabled;
		(el as HTMLButtonElement).setAttribute("aria-disabled",String(disabled));
	});
}
if (document.readyState==="loading"){
	document.addEventListener("DOMContentLoaded",initApp);
}
else{
	initApp();
}