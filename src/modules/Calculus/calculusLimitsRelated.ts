import {questionArea} from "../../script.js";
import {getMaxCoeff} from "./calculusUtils.js";

/**
 * Generates and displays a random limit question in the global `questionArea`.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, or `"hard"`).
 *                     Influences the maximum coefficient value used in generated expressions
 *                     (via `getMaxCoeff`). If omitted, a moderate default is used.
 * @returns void
 * @date 2026-04-02
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a limit type from a predefined list.
 * 3. Constructs a LaTeX expression and a plain‑text correct answer based on the selected type,
 *    along with plausible distractors for MCQ mode.
 * 4. Appends a `<div>` containing the LaTeX to `questionArea`.
 * 5. Triggers MathJax (if available) to render the math.
 * 6. Sets global variables for answer validation:
 *    - `window.correctAnswer` – an object with `correct`, `alternate`, `display`, and `choices` properties.
 *      `correct` and `alternate` hold the plain‑text answer for validation;
 *      `display` holds a LaTeX‑formatted version for rendering with KaTeX.
 *    - `window.expectedFormat` – a string describing the expected input format.
 *
 * **Limit types**:
 * - `polynomial` – limit of a quadratic polynomial at a random point.
 * - `rational`   – limit of a simple rational function at a random point (answer may be decimal).
 * - `infinity`   – limit of a rational function as x → ∞ (leading coefficient ratio).
 * - `trig`       – fundamental limit lim_{x→0} sin(x)/x = 1.
 * - `conceptual` – average vs. instantaneous rate of change (position function).
 *
 * @example
 * generateLimit();
 * generateLimit("hard");
 */
export function generateLimit(difficulty?: string): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	let types=["polynomial","rational","infinity","trig","conceptual"];
	let type=types[Math.floor(Math.random()*types.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let problemText="";
	let maxCoeff=getMaxCoeff(difficulty);
	let choices: string[]=[];
	switch (type){
		case "polynomial":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let c=Math.floor(Math.random()*10)-5;
			let x0=Math.floor(Math.random()*5);
			let limit=a*x0*x0+c;
			mathExpression=`\\[ \\lim_{x \\to ${x0}} (${a}x^2+${c}) \\]`;
			plainCorrectAnswer=limit.toString();
			latexAnswer=plainCorrectAnswer;
			choices=[plainCorrectAnswer];
			choices.push((limit+1).toString());
			choices.push((limit-1).toString());
			choices.push((a*x0*x0).toString());
			choices.push((c).toString());
			break;
		}
		case "rational":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			let b=Math.floor(Math.random()*maxCoeff)+2;
			let x0=Math.floor(Math.random()*5)+1;
			let limit=(a*x0+1)/(b*x0-1);
			let exactNum=a*x0+1;
			let exactDen=b*x0-1;
			let exactFraction=`${exactNum}/${exactDen}`;
			plainCorrectAnswer=limit.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			let altNum=exactNum+1;
			let altDen=exactDen-1;
			choices=[plainCorrectAnswer];
			choices.push(exactFraction);
			choices.push((limit+0.1).toFixed(2));
			choices.push((limit-0.1).toFixed(2));
			choices.push(`${altNum}/${altDen}`);
			break;
		}
		case "infinity":{
			let a=Math.floor(Math.random()*maxCoeff)+1;
			mathExpression=`\\[ \\lim_{x \\to \\infty} \\frac{${a}x^2+x}{x^2-1} \\]`;
			plainCorrectAnswer=a.toString();
			latexAnswer=plainCorrectAnswer;
			choices=[plainCorrectAnswer];
			choices.push((a+1).toString());
			choices.push((a-1).toString());
			choices.push("0");
			choices.push("∞");
			break;
		}
		case "trig":{
			mathExpression=`\\[ \\lim_{x \\to 0} \\frac{\\sin(x)}{x} \\]`;
			plainCorrectAnswer="1";
			latexAnswer="1";
			choices=["1","0","∞","does not exist"];
			break;
		}
		case "conceptual":{
			let t1=Math.floor(Math.random()*3)+1;
			let t2=t1+Math.floor(Math.random()*2)+1;
			let s=(t: number)=>t*t+t;
			let avgVel=(s(t2)-s(t1))/(t2-t1);
			let instVel=2*t1+1;
			problemText=`The position of a car is given by s(t)=t^2+t (feet). (a) Find the average velocity from t=${t1} to t=${t2}. (b) Find the instantaneous velocity at t=${t1} using the limit definition. (c) Explain why the limit gives the instantaneous rate.`;
			mathExpression=`\\[ \\text{Average velocity: }${avgVel.toFixed(2)} \\text{ ft/s, Instantaneous: }${instVel} \\text{ ft/s} \\]`;
			plainCorrectAnswer=`avg=${avgVel.toFixed(2)} inst=${instVel}`;
			latexAnswer=plainCorrectAnswer;
			choices=[`avg=${avgVel.toFixed(2)} inst=${instVel}`];
			choices.push(`avg=${(avgVel+1).toFixed(2)} inst=${instVel}`);
			choices.push(`avg=${avgVel.toFixed(2)} inst=${instVel+1}`);
			choices.push(`avg=${(avgVel-1).toFixed(2)} inst=${instVel-1}`);
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if (uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if (!uniqueChoices.includes(plainCorrectAnswer)){
		if (uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=plainCorrectAnswer;
		else uniqueChoices=[plainCorrectAnswer];
	}
	let mathContainer=document.createElement("div");
	if (type==="conceptual"){
		let textContainer=document.createElement("div");
		textContainer.textContent=problemText;
		textContainer.classList.add("problem-text");
		questionArea.appendChild(textContainer);
	}
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if (window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	window.correctAnswer={
		correct: plainCorrectAnswer,
		alternate: plainCorrectAnswer,
		display: latexAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a number or 'avg=... inst=...'";
}

/**
 * Generates and displays a random related rates problem in the global `questionArea`.
 * Includes custom multiple‑choice options for MCQ mode.
 *
 * @param difficulty - Optional difficulty level (`"easy"`, `"medium"`, or `"hard"`).
 *                     Scales the numerical values in the problem (ladder length, distances,
 *                     rates, etc.) via `getMaxCoeff`. If omitted, a moderate default is used.
 * @returns void
 * @date 2026-04-18
 *
 * @remarks
 * The function performs the following steps:
 * 1. Clears `questionArea.innerHTML`.
 * 2. Randomly selects a related rates scenario from 8 types.
 * 3. Constructs descriptive problem text and a LaTeX expression for the unknown rate,
 *    along with plausible distractors for MCQ mode.
 * 4. Appends the problem text (with class `"problem-text"`) followed by a `<div>` containing the LaTeX.
 * 5. Triggers MathJax (if available) to render the math.
 * 6. Sets global variables for answer validation.
 *
 * **Problem types**:
 * - `sphere` – inflating balloon: dV/dt given, find dr/dt.
 * - `circleArea` – circular ripple: dr/dt given, find dA/dt.
 * - `ladder` – classic ladder against a wall.
 * - `ladderAdvanced` – same ladder plus rate of change of angle.
 * - `trough` – triangular trough: water flowing in, find dh/dt.
 * - `shadow` – streetlight shadow: woman walking, find tip speed and shadow length rate.
 * - `invertedCone` – conical tank leaking, find dh/dt.
 * - `twoVehicles` – cars approaching intersection, find rate of distance change.
 *
 * @example
 * generateRelatedRates();
 * generateRelatedRates("easy");
 */
export function generateRelatedRates(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["sphere","circleArea","ladder","ladderAdvanced","trough","shadow","invertedCone","twoVehicles"];
	let type=types[Math.floor(Math.random()*types.length)];
	let mathExpression="";
	let plainCorrectAnswer="";
	let latexAnswer="";
	let problemText="";
	let scale=getMaxCoeff(difficulty);
	let choices: string[]=[];
	switch(type){
		case "sphere":{
			let dV_dt=10*scale/5;
			let diam=50*scale/5;
			let r=diam/2;
			let dr_dt=dV_dt/(4*Math.PI*r*r);
			problemText=`A spherical balloon is being inflated at a rate of ${dV_dt.toFixed(1)} cm³/s. How fast is the radius increasing when the diameter is ${diam.toFixed(1)} cm?`;
			mathExpression=`\\[ \\frac{dr}{dt}=? \\]`;
			plainCorrectAnswer=dr_dt.toFixed(4);
			latexAnswer=plainCorrectAnswer;
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum*2).toFixed(4));
			choices.push((correctNum/2).toFixed(4));
			choices.push((dV_dt/(Math.PI*r*r)).toFixed(4));
			choices.push("0");
			break;
		}
		case "circleArea":{
			let dr_dt=0.5*scale/5;
			let r=3*scale/5;
			let dA_dt=2*Math.PI*r*dr_dt;
			problemText=`A rock is dropped into a still pond, creating a circular ripple whose radius increases at ${dr_dt.toFixed(2)} m/s. How fast is the area of the ripple increasing when the radius is ${r.toFixed(1)} m?`;
			mathExpression=`\\[ \\frac{dA}{dt}=? \\]`;
			plainCorrectAnswer=dA_dt.toFixed(4);
			latexAnswer=plainCorrectAnswer;
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+1).toFixed(4));
			choices.push((correctNum-1).toFixed(4));
			choices.push((Math.PI*r*dr_dt).toFixed(4));
			choices.push((4*Math.PI*r*dr_dt).toFixed(4));
			break;
		}
		case "ladder":{
			let ladder=10*scale/5;
			let x=6*scale/5;
			let dx_dt=2*scale/5;
			let y=Math.sqrt(ladder*ladder-x*x);
			let dy_dt=-(x/y)*dx_dt;
			problemText=`A ${ladder.toFixed(1)}-ft ladder leans against a wall. The bottom is ${x.toFixed(1)} ft from the wall, moving away at ${dx_dt.toFixed(1)} ft/s. Find the rate at which the top is sliding down.`;
			mathExpression=`\\[ \\frac{dy}{dt}=? \\]`;
			plainCorrectAnswer=dy_dt.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+0.5).toFixed(2));
			choices.push((correctNum-0.5).toFixed(2));
			choices.push((dx_dt).toFixed(2));
			choices.push((-(x/y)*dx_dt*0.5).toFixed(2));
			break;
		}
		case "ladderAdvanced":{
			let ladder=25*scale/5;
			let x=7*scale/5;
			let dx_dt=2*scale/5;
			let y=Math.sqrt(ladder*ladder-x*x);
			let dy_dt=-(x/y)*dx_dt;
			let angle=Math.asin(y/ladder);
			let dtheta_dt=-(dx_dt)/(ladder*Math.sin(angle));
			problemText=`A ${ladder.toFixed(1)}-ft ladder leans against a wall. The bottom is pulled away at ${dx_dt.toFixed(1)} ft/s. How fast is the top sliding down when the bottom is ${x.toFixed(1)} ft from the wall? At that moment, what is the rate of change of the angle between the ladder and the ground?`;
			mathExpression=`\\[ \\frac{dy}{dt}=? \\quad \\frac{d\\theta}{dt}=? \\]`;
			plainCorrectAnswer=`dy/dt=${dy_dt.toFixed(2)} dtheta/dt=${dtheta_dt.toFixed(4)}`;
			latexAnswer=plainCorrectAnswer;
			choices=[plainCorrectAnswer];
			choices.push(`dy/dt=${(dy_dt+0.2).toFixed(2)} dtheta/dt=${dtheta_dt.toFixed(4)}`);
			choices.push(`dy/dt=${dy_dt.toFixed(2)} dtheta/dt=${(dtheta_dt+0.01).toFixed(4)}`);
			choices.push(`dy/dt=${(dx_dt).toFixed(2)} dtheta/dt=0`);
			break;
		}
		case "trough":{
			let topWidth=3*scale/5;
			let depth=2*scale/5;
			let dV_dt=4*scale/5;
			let waterDepth=1*scale/5;
			let widthAtDepth=topWidth*(waterDepth/depth);
			let area=0.5*waterDepth*widthAtDepth;
			let length=10*scale/5;
			let dA_dt=dV_dt/length;
			let dh_dt=dA_dt/widthAtDepth;
			let volumeAtDepth=area*length;
			problemText=`A water trough has a cross‑section that is an isosceles triangle ${topWidth.toFixed(1)} ft wide at the top and ${depth.toFixed(1)} ft deep. Water is flowing in at ${dV_dt.toFixed(1)} ft³/min. How fast is the water level rising when the water is ${waterDepth.toFixed(1)} ft deep?`;
			mathExpression=`\\[ \\frac{dh}{dt}=? \\]`;
			plainCorrectAnswer=dh_dt.toFixed(4);
			latexAnswer=plainCorrectAnswer;
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum*2).toFixed(4));
			choices.push((correctNum/2).toFixed(4));
			choices.push((dV_dt/(length*topWidth)).toFixed(4));
			choices.push(volumeAtDepth.toFixed(2));
			break;
		}
		case "shadow":{
			let womanHt=6;
			let lightHt=20;
			let dx_dt=5*scale/5;
			let x=10*scale/5;
			let shadowLen=(womanHt*x)/(lightHt-womanHt);
			let tipSpeed=dx_dt*(lightHt/(lightHt-womanHt));
			let dShadow_dt=dx_dt*(womanHt/(lightHt-womanHt));
			problemText=`A ${womanHt}-ft tall woman walks away from a ${lightHt}-ft tall streetlight at ${dx_dt.toFixed(1)} ft/s. How fast is the tip of her shadow moving? How fast is the length of her shadow changing?`;
			mathExpression=`\\[ \\frac{d(\\text{tip})}{dt}=? \\quad \\frac{dL}{dt}=? \\]`;
			plainCorrectAnswer=`tip=${tipSpeed.toFixed(2)} L=${dShadow_dt.toFixed(2)}`;
			latexAnswer=plainCorrectAnswer;
			choices=[plainCorrectAnswer];
			choices.push(`tip=${(tipSpeed+1).toFixed(2)} L=${dShadow_dt.toFixed(2)}`);
			choices.push(`tip=${tipSpeed.toFixed(2)} L=${(dShadow_dt+0.5).toFixed(2)}`);
			choices.push(`tip=${dx_dt.toFixed(2)} L=0`);
			choices.push(`shadowLen=${shadowLen.toFixed(2)}`);
			break;
		}
		case "invertedCone":{
			let radius=4*scale/5;
			let height=10*scale/5;
			let dV_dt=-2*scale/5;
			let waterDepth=6*scale/5;
			let rAtDepth=radius*(waterDepth/height);
			let dV_dh=Math.PI*rAtDepth*rAtDepth;
			let dh_dt=dV_dt/dV_dh;
			problemText=`A cone‑shaped tank (vertex down) has radius ${radius.toFixed(1)} ft and height ${height.toFixed(1)} ft. Water leaks out at ${Math.abs(dV_dt).toFixed(1)} ft³/min. Find the rate at which the water level is dropping when the water is ${waterDepth.toFixed(1)} ft deep.`;
			mathExpression=`\\[ \\frac{dh}{dt}=? \\]`;
			plainCorrectAnswer=dh_dt.toFixed(4);
			latexAnswer=plainCorrectAnswer;
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum*2).toFixed(4));
			choices.push((correctNum/2).toFixed(4));
			choices.push((dV_dt/(Math.PI*radius*radius)).toFixed(4));
			choices.push("0");
			break;
		}
		case "twoVehicles":{
			let speedA=50*scale/5;
			let speedB=60*scale/5;
			let x=0.3*scale/5;
			let y=0.4*scale/5;
			let dx_dt=-speedA;
			let dy_dt=-speedB;
			let dist=Math.sqrt(x*x+y*y);
			let dD_dt=(x*dx_dt+y*dy_dt)/dist;
			problemText=`Car A travels west at ${speedA.toFixed(1)} mph, Car B travels north at ${speedB.toFixed(1)} mph. Both approach the same intersection. At what rate is the distance between them changing when Car A is ${x.toFixed(2)} mi and Car B is ${y.toFixed(2)} mi from the intersection?`;
			mathExpression=`\\[ \\frac{dD}{dt}=? \\]`;
			plainCorrectAnswer=dD_dt.toFixed(2);
			latexAnswer=plainCorrectAnswer;
			let correctNum=parseFloat(plainCorrectAnswer);
			choices=[plainCorrectAnswer];
			choices.push((correctNum+10).toFixed(2));
			choices.push((correctNum-10).toFixed(2));
			choices.push((speedA+speedB).toFixed(2));
			choices.push("0");
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(plainCorrectAnswer)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=plainCorrectAnswer;
		else uniqueChoices=[plainCorrectAnswer];
	}
	let textContainer=document.createElement("div");
	textContainer.textContent=problemText;
	textContainer.classList.add("problem-text");
	questionArea.appendChild(textContainer);
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	window.correctAnswer={
		correct: plainCorrectAnswer,
		alternate: plainCorrectAnswer,
		display: latexAnswer,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter a number or compound answer (e.g., 'dy/dt=-1.5 dtheta/dt=0.2')";
}