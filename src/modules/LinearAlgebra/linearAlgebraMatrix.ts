/**
 * Matrix operations: addition, subtraction, multiplication, inverse, transpose, scalar multiplication, power, row echelon, 2x2 system.
 * @fileoverview Generates 2x2 matrix questions with MCQ distractors.
 * @date 2026-03-29
 */
import {questionArea} from "../../script.js";
import {Matrix2x2, getRange, matrixToString} from "./linearAlgebraUtils.js";

export function generateMatrix(difficulty?: string): void{
	if(!questionArea) return;
	questionArea.innerHTML="";
	let types=["add","subtract","multiply","inverse","system","transpose","scalar_mult","power","row_echelon"];
	let type=types[Math.floor(Math.random()*types.length)];
	let range=getRange(difficulty);
	let generate2x2=(): Matrix2x2=>({
		a: +(Math.random()*range*2-range).toFixed(2),
		b: +(Math.random()*range*2-range).toFixed(2),
		c: +(Math.random()*range*2-range).toFixed(2),
		d: +(Math.random()*range*2-range).toFixed(2)
	});
	let mathExpression="";
	let correctLaTeX="";
	let alternate="";
	let choices: string[]=[];
	switch(type){
		case "add":{
			let A=generate2x2();
			let B=generate2x2();
			let result: Matrix2x2={
				a: +(A.a+B.a).toFixed(2),
				b: +(A.b+B.b).toFixed(2),
				c: +(A.c+B.c).toFixed(2),
				d: +(A.d+B.d).toFixed(2)
			};
			mathExpression=`Add: \\(${matrixToString(A)}+${matrixToString(B)}\\)`;
			correctLaTeX=matrixToString(result);
			alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			choices=[correctLaTeX];
			let wrongAdd1: Matrix2x2={
				a: +(A.a+B.a+1).toFixed(2),
				b: +(A.b+B.b).toFixed(2),
				c: +(A.c+B.c).toFixed(2),
				d: +(A.d+B.d).toFixed(2)
			};
			choices.push(matrixToString(wrongAdd1));
			let wrongAdd2: Matrix2x2={
				a: +(A.a+B.a).toFixed(2),
				b: +(A.b+B.b+1).toFixed(2),
				c: +(A.c+B.c).toFixed(2),
				d: +(A.d+B.d).toFixed(2)
			};
			choices.push(matrixToString(wrongAdd2));
			let wrongAdd3: Matrix2x2={
				a: +(A.a+B.a).toFixed(2),
				b: +(A.b+B.b).toFixed(2),
				c: +(A.c+B.c+1).toFixed(2),
				d: +(A.d+B.d).toFixed(2)
			};
			choices.push(matrixToString(wrongAdd3));
			let wrongAdd4: Matrix2x2={
				a: +(A.a+B.a).toFixed(2),
				b: +(A.b+B.b).toFixed(2),
				c: +(A.c+B.c).toFixed(2),
				d: +(A.d+B.d+1).toFixed(2)
			};
			choices.push(matrixToString(wrongAdd4));
			break;
		}
		case "subtract":{
			let A=generate2x2();
			let B=generate2x2();
			let result: Matrix2x2={
				a: +(A.a-B.a).toFixed(2),
				b: +(A.b-B.b).toFixed(2),
				c: +(A.c-B.c).toFixed(2),
				d: +(A.d-B.d).toFixed(2)
			};
			mathExpression=`Subtract: \\(${matrixToString(A)}-${matrixToString(B)}\\)`;
			correctLaTeX=matrixToString(result);
			alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			choices=[correctLaTeX];
			let wrongSub1: Matrix2x2={
				a: +(A.a-B.a-1).toFixed(2),
				b: +(A.b-B.b).toFixed(2),
				c: +(A.c-B.c).toFixed(2),
				d: +(A.d-B.d).toFixed(2)
			};
			choices.push(matrixToString(wrongSub1));
			let wrongSub2: Matrix2x2={
				a: +(A.a-B.a).toFixed(2),
				b: +(A.b-B.b-1).toFixed(2),
				c: +(A.c-B.c).toFixed(2),
				d: +(A.d-B.d).toFixed(2)
			};
			choices.push(matrixToString(wrongSub2));
			let wrongSub3: Matrix2x2={
				a: +(A.a-B.a).toFixed(2),
				b: +(A.b-B.b).toFixed(2),
				c: +(A.c-B.c-1).toFixed(2),
				d: +(A.d-B.d).toFixed(2)
			};
			choices.push(matrixToString(wrongSub3));
			let wrongSub4: Matrix2x2={
				a: +(A.a-B.a).toFixed(2),
				b: +(A.b-B.b).toFixed(2),
				c: +(A.c-B.c).toFixed(2),
				d: +(A.d-B.d-1).toFixed(2)
			};
			choices.push(matrixToString(wrongSub4));
			break;
		}
		case "multiply":{
			let A=generate2x2();
			let B=generate2x2();
			let result: Matrix2x2={
				a: +(A.a*B.a+A.b*B.c).toFixed(2),
				b: +(A.a*B.b+A.b*B.d).toFixed(2),
				c: +(A.c*B.a+A.d*B.c).toFixed(2),
				d: +(A.c*B.b+A.d*B.d).toFixed(2)
			};
			mathExpression=`Multiply: \\(${matrixToString(A)} \\times ${matrixToString(B)}\\)`;
			correctLaTeX=matrixToString(result);
			alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			choices=[correctLaTeX];
			let wrongMul1: Matrix2x2={
				a: +(A.a*B.a+A.b*B.c+1).toFixed(2),
				b: +(A.a*B.b+A.b*B.d).toFixed(2),
				c: +(A.c*B.a+A.d*B.c).toFixed(2),
				d: +(A.c*B.b+A.d*B.d).toFixed(2)
			};
			choices.push(matrixToString(wrongMul1));
			let wrongMul2: Matrix2x2={
				a: +(A.a*B.a+A.b*B.c).toFixed(2),
				b: +(A.a*B.b+A.b*B.d+1).toFixed(2),
				c: +(A.c*B.a+A.d*B.c).toFixed(2),
				d: +(A.c*B.b+A.d*B.d).toFixed(2)
			};
			choices.push(matrixToString(wrongMul2));
			let wrongMul3: Matrix2x2={
				a: +(A.a*B.a+A.b*B.c).toFixed(2),
				b: +(A.a*B.b+A.b*B.d).toFixed(2),
				c: +(A.c*B.a+A.d*B.c+1).toFixed(2),
				d: +(A.c*B.b+A.d*B.d).toFixed(2)
			};
			choices.push(matrixToString(wrongMul3));
			let wrongMul4: Matrix2x2={
				a: +(A.a*B.a+A.b*B.c).toFixed(2),
				b: +(A.a*B.b+A.b*B.d).toFixed(2),
				c: +(A.c*B.a+A.d*B.c).toFixed(2),
				d: +(A.c*B.b+A.d*B.d+1).toFixed(2)
			};
			choices.push(matrixToString(wrongMul4));
			break;
		}
		case "inverse":{
			let A: Matrix2x2;
			let det: number;
			do{
				A=generate2x2();
				det=A.a*A.d-A.b*A.c;
			} while(Math.abs(det)<0.1);
			let invDet=1/det;
			let inv: Matrix2x2={
				a: +(A.d*invDet).toFixed(2),
				b: +(-A.b*invDet).toFixed(2),
				c: +(-A.c*invDet).toFixed(2),
				d: +(A.a*invDet).toFixed(2)
			};
			mathExpression=`Find inverse of \\(${matrixToString(A)}\\)`;
			correctLaTeX=matrixToString(inv);
			alternate=`[${inv.a},${inv.b},${inv.c},${inv.d}]`;
			choices=[correctLaTeX];
			let wrongInv1: Matrix2x2={
				a: +(A.d*invDet).toFixed(2),
				b: +(-A.b*invDet+0.1).toFixed(2),
				c: +(-A.c*invDet).toFixed(2),
				d: +(A.a*invDet).toFixed(2)
			};
			choices.push(matrixToString(wrongInv1));
			let wrongInv2: Matrix2x2={
				a: +(A.d*invDet).toFixed(2),
				b: +(-A.b*invDet).toFixed(2),
				c: +(-A.c*invDet+0.1).toFixed(2),
				d: +(A.a*invDet).toFixed(2)
			};
			choices.push(matrixToString(wrongInv2));
			let wrongInv3: Matrix2x2={
				a: +(A.d*invDet).toFixed(2),
				b: +(-A.b*invDet).toFixed(2),
				c: +(-A.c*invDet).toFixed(2),
				d: +(A.a*invDet+0.1).toFixed(2)
			};
			choices.push(matrixToString(wrongInv3));
			let wrongInv4: Matrix2x2={
				a: +(A.d*invDet).toFixed(2),
				b: +(-A.b*invDet).toFixed(2),
				c: +(-A.c*invDet).toFixed(2),
				d: +(A.a*invDet).toFixed(2)
			};
			choices.push(matrixToString(wrongInv4));
			break;
		}
		case "system":{
			let A=generate2x2();
			let x=+(Math.random()*range+1).toFixed(2);
			let y=+(Math.random()*range+1).toFixed(2);
			let B={
				a: +(A.a*x+A.b*y).toFixed(2),
				b: +(A.c*x+A.d*y).toFixed(2)
			};
			mathExpression=`Solve:<br>
                \\(${A.a}x+${A.b}y=${B.a}\\)<br>
                \\(${A.c}x+${A.d}y=${B.b}\\)`;
			correctLaTeX=`x=${x}, y=${y}`;
			choices=[correctLaTeX];
			choices.push(`x=${(x+1).toFixed(2)}, y=${y}`);
			choices.push(`x=${x}, y=${(y+1).toFixed(2)}`);
			choices.push(`x=${(x-1).toFixed(2)}, y=${y}`);
			choices.push(`x=${x}, y=${(y-1).toFixed(2)}`);
			alternate=`x=${x}, y=${y}`;
			break;
		}
		case "transpose":{
			let A=generate2x2();
			let result: Matrix2x2={ a: A.a, b: A.c, c: A.b, d: A.d };
			mathExpression=`Find transpose of \\(${matrixToString(A)}\\)`;
			correctLaTeX=matrixToString(result);
			alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			choices=[correctLaTeX];
			let wrongTrans1: Matrix2x2={ a: A.a, b: A.b, c: A.c, d: A.d };
			choices.push(matrixToString(wrongTrans1));
			let wrongTrans2: Matrix2x2={ a: A.b, b: A.a, c: A.d, d: A.c };
			choices.push(matrixToString(wrongTrans2));
			let wrongTrans3: Matrix2x2={ a: A.c, b: A.d, c: A.a, d: A.b };
			choices.push(matrixToString(wrongTrans3));
			let wrongTrans4: Matrix2x2={ a: A.d, b: A.c, c: A.b, d: A.a };
			choices.push(matrixToString(wrongTrans4));
			break;
		}
		case "scalar_mult":{
			let A=generate2x2();
			let k=+(Math.random()*range*2-range).toFixed(1);
			let result: Matrix2x2={
				a: +(k*A.a).toFixed(2),
				b: +(k*A.b).toFixed(2),
				c: +(k*A.c).toFixed(2),
				d: +(k*A.d).toFixed(2)
			};
			mathExpression=`Multiply \\(${matrixToString(A)}\\) by ${k}`;
			correctLaTeX=matrixToString(result);
			alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			choices=[correctLaTeX];
			let wrongScalar1: Matrix2x2={
				a: +((k+0.5)*A.a).toFixed(2),
				b: +((k+0.5)*A.b).toFixed(2),
				c: +((k+0.5)*A.c).toFixed(2),
				d: +((k+0.5)*A.d).toFixed(2)
			};
			choices.push(matrixToString(wrongScalar1));
			let wrongScalar2: Matrix2x2={
				a: +((k-0.5)*A.a).toFixed(2),
				b: +((k-0.5)*A.b).toFixed(2),
				c: +((k-0.5)*A.c).toFixed(2),
				d: +((k-0.5)*A.d).toFixed(2)
			};
			choices.push(matrixToString(wrongScalar2));
			let wrongScalar3: Matrix2x2={
				a: +(k*A.a+1).toFixed(2),
				b: +(k*A.b).toFixed(2),
				c: +(k*A.c).toFixed(2),
				d: +(k*A.d).toFixed(2)
			};
			choices.push(matrixToString(wrongScalar3));
			let wrongScalar4: Matrix2x2={
				a: +(k*A.a).toFixed(2),
				b: +(k*A.b+1).toFixed(2),
				c: +(k*A.c).toFixed(2),
				d: +(k*A.d).toFixed(2)
			};
			choices.push(matrixToString(wrongScalar4));
			break;
		}
		case "power":{
			let A=generate2x2();
			let result: Matrix2x2={
				a: +(A.a*A.a+A.b*A.c).toFixed(2),
				b: +(A.a*A.b+A.b*A.d).toFixed(2),
				c: +(A.c*A.a+A.d*A.c).toFixed(2),
				d: +(A.c*A.b+A.d*A.d).toFixed(2)
			};
			mathExpression=`Compute \\(${matrixToString(A)}^2\\)`;
			correctLaTeX=matrixToString(result);
			alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			choices=[correctLaTeX];
			let wrongPow1: Matrix2x2={
				a: +(A.a*A.a).toFixed(2),
				b: +(A.b*A.b).toFixed(2),
				c: +(A.c*A.c).toFixed(2),
				d: +(A.d*A.d).toFixed(2)
			};
			choices.push(matrixToString(wrongPow1));
			let wrongPow2: Matrix2x2={
				a: +(A.a*A.a+1).toFixed(2),
				b: +(A.a*A.b+A.b*A.d).toFixed(2),
				c: +(A.c*A.a+A.d*A.c).toFixed(2),
				d: +(A.c*A.b+A.d*A.d).toFixed(2)
			};
			choices.push(matrixToString(wrongPow2));
			let wrongPow3: Matrix2x2={
				a: +(A.a*A.a+A.b*A.c).toFixed(2),
				b: +(A.a*A.b+A.b*A.d+1).toFixed(2),
				c: +(A.c*A.a+A.d*A.c).toFixed(2),
				d: +(A.c*A.b+A.d*A.d).toFixed(2)
			};
			choices.push(matrixToString(wrongPow3));
			let wrongPow4: Matrix2x2={
				a: +(A.a*A.a+A.b*A.c).toFixed(2),
				b: +(A.a*A.b+A.b*A.d).toFixed(2),
				c: +(A.c*A.a+A.d*A.c+1).toFixed(2),
				d: +(A.c*A.b+A.d*A.d).toFixed(2)
			};
			choices.push(matrixToString(wrongPow4));
			break;
		}
		case "row_echelon":{
			let A: Matrix2x2;
			do{
				A=generate2x2();
			} while(Math.abs(A.a)<0.1);
			let factor=+(A.c/A.a).toFixed(2);
			let result: Matrix2x2={
				a: A.a,
				b: A.b,
				c: 0,
				d: +(A.d-factor*A.b).toFixed(2)
			};
			mathExpression=`Find row-echelon form of \\(${matrixToString(A)}\\)`;
			correctLaTeX=matrixToString(result);
			alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			choices=[correctLaTeX];
			let wrongRowEch1: Matrix2x2={
				a: A.a,
				b: A.b+1,
				c: 0,
				d: +(A.d-factor*A.b).toFixed(2)
			};
			choices.push(matrixToString(wrongRowEch1));
			let wrongRowEch2: Matrix2x2={
				a: A.a,
				b: A.b,
				c: 0,
				d: +(A.d-factor*A.b+1).toFixed(2)
			};
			choices.push(matrixToString(wrongRowEch2));
			let wrongRowEch3: Matrix2x2={
				a: A.a,
				b: A.b,
				c: 1,
				d: +(A.d-factor*A.b).toFixed(2)
			};
			choices.push(matrixToString(wrongRowEch3));
			let wrongRowEch4: Matrix2x2={
				a: A.a+1,
				b: A.b,
				c: 0,
				d: +(A.d-factor*A.b).toFixed(2)
			};
			choices.push(matrixToString(wrongRowEch4));
			break;
		}
	}
	let uniqueChoices=[...new Set(choices)];
	if(uniqueChoices.length>4) uniqueChoices=uniqueChoices.slice(0,4);
	if(!uniqueChoices.includes(correctLaTeX)){
		if(uniqueChoices.length>0) uniqueChoices[Math.floor(Math.random()*uniqueChoices.length)]=correctLaTeX;
		else uniqueChoices=[correctLaTeX];
	}
	let mathContainer=document.createElement("div");
	mathContainer.innerHTML=mathExpression;
	questionArea.appendChild(mathContainer);
	if(window.MathJax?.typesetPromise){
		window.MathJax.typesetPromise([mathContainer]).catch((err: any)=>console.log("MathJax error:",err));
	}
	window.correctAnswer={
		correct: correctLaTeX,
		alternate: alternate,
		display: correctLaTeX,
		choices: uniqueChoices
	};
	window.expectedFormat="Enter as [a,b,c,d] or a b;c d";
}