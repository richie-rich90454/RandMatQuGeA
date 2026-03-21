/**
 * Matrix operations: addition, subtraction, multiplication, inverse, transpose, scalar multiplication, power, row echelon, 2x2 system.
 * @fileoverview Generates 2x2 matrix questions. Sets window.correctAnswer with LaTeX matrix display (pure LaTeX) and plain text alternate.
 * @date 2026-03-15
 */
import {questionArea} from "../../script.js";
import {Matrix2x2, getRange, matrixToString} from "./linearAlgebraUtils.js";

/**
 * Generates a random 2×2 matrix question of a specified type.
 * @param difficulty - optional difficulty level.
 */
export function generateMatrix(difficulty?: string): void{
	if (!questionArea) return;
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
	switch (type){
		case "add":{
			let A=generate2x2();
			let B=generate2x2();
			let result: Matrix2x2={
				a: +(A.a+B.a).toFixed(2),
				b: +(A.b+B.b).toFixed(2),
				c: +(A.c+B.c).toFixed(2),
				d: +(A.d+B.d).toFixed(2)
			};
			questionArea.innerHTML=`Add: \\(${matrixToString(A)}+${matrixToString(B)}\\)`;
			let correctLaTeX=matrixToString(result);
			let alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			window.correctAnswer={ correct: correctLaTeX, alternate: alternate, display: correctLaTeX };
			window.expectedFormat="Enter as [a,b,c,d] or a b;c d";
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
			questionArea.innerHTML=`Subtract: \\(${matrixToString(A)}-${matrixToString(B)}\\)`;
			let correctLaTeX=matrixToString(result);
			let alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			window.correctAnswer={ correct: correctLaTeX, alternate: alternate, display: correctLaTeX };
			window.expectedFormat="Enter as [a,b,c,d] or a b;c d";
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
			questionArea.innerHTML=`Multiply: \\(${matrixToString(A)} \\times ${matrixToString(B)}\\)`;
			let correctLaTeX=matrixToString(result);
			let alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			window.correctAnswer={ correct: correctLaTeX, alternate: alternate, display: correctLaTeX };
			window.expectedFormat="Enter as [a,b,c,d] or a b;c d";
			break;
		}
		case "inverse":{
			let A: Matrix2x2;
			let det: number;
			do{
				A=generate2x2();
				det=A.a*A.d-A.b*A.c;
			} while (Math.abs(det)<0.1);
			let invDet=1/det;
			let inv: Matrix2x2={
				a: +(A.d*invDet).toFixed(2),
				b: +(-A.b*invDet).toFixed(2),
				c: +(-A.c*invDet).toFixed(2),
				d: +(A.a*invDet).toFixed(2)
			};
			questionArea.innerHTML=`Find inverse of \\(${matrixToString(A)}\\)`;
			let correctLaTeX=matrixToString(inv);
			let alternate=`[${inv.a},${inv.b},${inv.c},${inv.d}]`;
			window.correctAnswer={ correct: correctLaTeX, alternate: alternate, display: correctLaTeX };
			window.expectedFormat="Enter as [a,b,c,d] or a b;c d";
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
			questionArea.innerHTML=`Solve:<br>
                \\(${A.a}x+${A.b}y=${B.a}\\)<br>
                \\(${A.c}x+${A.d}y=${B.b}\\)`;
			let correctLaTeX=`x=${x}, y=${y}`;
			window.correctAnswer={
				correct: correctLaTeX,
				alternate: `x=${x}, y=${y}`,
				display: correctLaTeX
			};
			window.expectedFormat="Enter as \"x=..., y=...\" or (x,y)";
			break;
		}
		case "transpose":{
			let A=generate2x2();
			let result: Matrix2x2={ a: A.a, b: A.c, c: A.b, d: A.d };
			questionArea.innerHTML=`Find transpose of \\(${matrixToString(A)}\\)`;
			let correctLaTeX=matrixToString(result);
			let alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			window.correctAnswer={ correct: correctLaTeX, alternate: alternate, display: correctLaTeX };
			window.expectedFormat="Enter as [a,b,c,d] or a b;c d";
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
			questionArea.innerHTML=`Multiply \\(${matrixToString(A)}\\) by ${k}`;
			let correctLaTeX=matrixToString(result);
			let alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			window.correctAnswer={ correct: correctLaTeX, alternate: alternate, display: correctLaTeX };
			window.expectedFormat="Enter as [a,b,c,d] or a b;c d";
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
			questionArea.innerHTML=`Compute \\(${matrixToString(A)}^2\\)`;
			let correctLaTeX=matrixToString(result);
			let alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			window.correctAnswer={ correct: correctLaTeX, alternate: alternate, display: correctLaTeX };
			window.expectedFormat="Enter as [a,b,c,d] or a b;c d";
			break;
		}
		case "row_echelon":{
			let A: Matrix2x2;
			do{
				A=generate2x2();
			} while (Math.abs(A.a)<0.1);
			let factor=+(A.c/A.a).toFixed(2);
			let result: Matrix2x2={
				a: A.a,
				b: A.b,
				c: 0,
				d: +(A.d-factor*A.b).toFixed(2)
			};
			questionArea.innerHTML=`Find row-echelon form of \\(${matrixToString(A)}\\)`;
			let correctLaTeX=matrixToString(result);
			let alternate=`[${result.a},${result.b},${result.c},${result.d}]`;
			window.correctAnswer={ correct: correctLaTeX, alternate: alternate, display: correctLaTeX };
			window.expectedFormat="Enter as [a,b,c,d] or a b;c d";
			break;
		}
	}
	if (window.MathJax&&window.MathJax.typeset){
		window.MathJax.typeset();
	}
}