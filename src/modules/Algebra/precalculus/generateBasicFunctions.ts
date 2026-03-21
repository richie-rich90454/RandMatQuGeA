/**
 * Basic functions: identify or give property.
 * @fileoverview Generates basic function questions.
 * @date 2026-03-15
 */
import {questionArea} from "../../../script.js";

export function generateBasicFunctions(): void{
	if (!questionArea) return;
	questionArea.innerHTML="";
	const functions=[
		{name:"identity",expr:"f(x)=x",props:"linear, odd, increasing"},
		{name:"squaring",expr:"f(x)=x^2",props:"even, decreasing then increasing, vertex at (0,0)"},
		{name:"cubing",expr:"f(x)=x^3",props:"odd, increasing, origin"},
		{name:"reciprocal",expr:"f(x)=1/x",props:"odd, two branches, asymptotes x=0, y=0"},
		{name:"square root",expr:"f(x)=√x",props:"increasing, domain [0,∞), range [0,∞)"},
		{name:"exponential",expr:"f(x)=e^x",props:"increasing, horizontal asymptote y=0, passes (0,1)"},
		{name:"logarithmic",expr:"f(x)=ln x",props:"increasing, vertical asymptote x=0, passes (1,0)"},
		{name:"logistic",expr:"f(x)=1/(1+e^{-x})",props:"increasing, horizontal asymptotes y=0 and y=1, sigmoid"},
		{name:"sine",expr:"f(x)=sin x",props:"odd, periodic, range [-1,1]"},
		{name:"cosine",expr:"f(x)=cos x",props:"even, periodic, range [-1,1]"},
		{name:"absolute value",expr:"f(x)=|x|",props:"even, V-shape, decreasing then increasing"},
		{name:"greatest integer",expr:"f(x)=⌊x⌋",props:"step function, constant on intervals [n,n+1)"}
	];
	const chosen=functions[Math.floor(Math.random()*functions.length)];
	const types=["identify","properties"];
	const type=types[Math.floor(Math.random()*types.length)];
	let hint="";
	if (type==="identify"){
		questionArea.innerHTML=`Identify the function: \\( ${chosen.expr} \\). (Enter name)`;
		window.correctAnswer={
			correct:chosen.name,
			alternate:chosen.name,
			display:chosen.name
		};
		hint="Enter the function name";
	}
	else{
		questionArea.innerHTML=`Give one key property of \\( ${chosen.expr} \\).`;
		window.correctAnswer={
			correct:chosen.props,
			alternate:chosen.props,
			display:chosen.props
		};
		hint="Enter a property (e.g., 'even', 'increasing')";
	}
	window.expectedFormat=hint;
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}