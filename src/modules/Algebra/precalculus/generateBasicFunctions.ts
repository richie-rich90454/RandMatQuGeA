import {questionArea} from "../../../script.js";
/**
 * Basic functions: identify or give property.
 * @fileoverview Generates basic function questions with MCQ distractors.
 * @date 2026-04-18
 */
export function generateBasicFunctions(): void{
	if(!questionArea) return;
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
	let expectedFormat="";
	let correct="";
	let alternate="";
	let display="";
	let mathExpression="";
	let choices:string[]=[];
	if(type==="identify"){
		mathExpression=`Identify the function: \\( ${chosen.expr} \\). (Enter name)`;
		correct=chosen.name;
		alternate=chosen.name;
		display=chosen.name;
		choices=[correct];
		for(let f of functions){
			if(f.name!==chosen.name){
				choices.push(f.name);
				if(choices.length>=4) break;
			}
		}
		expectedFormat="Enter the function name";
	}
	else{
		mathExpression=`Give one key property of \\( ${chosen.expr} \\).`;
		correct=chosen.props;
		alternate=chosen.props;
		display=chosen.props;
		let wrongProps: string[]=[];
		for(let f of functions){
			if(f.name!==chosen.name){
				let firstProp=f.props.split(", ")[0];
				if(!wrongProps.includes(firstProp)) wrongProps.push(firstProp);
				if(wrongProps.length>=3) break;
			}
		}
		choices=[correct];
		choices.push(...wrongProps.slice(0,3));
		if(choices.length<4){
			choices.push("increasing","decreasing","even","odd","periodic");
		}
		expectedFormat="Enter a property (e.g., 'even', 'increasing')";
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correct)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correct;
		else uniqueChoices=[correct];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax&&window.MathJax.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>
			console.log("MathJax typeset error:", err)
		);
	}
	window.correctAnswer={
		correct: correct,
		alternate: alternate,
		display: display,
		choices: uniqueChoices
	};
	window.expectedFormat=expectedFormat;
}