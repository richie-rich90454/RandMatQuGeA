import {describe,it,expect} from "vitest";
import {getRange,matrixToString} from "./linearAlgebraUtils.js";
describe("getRange",()=>{
    it("returns 3 for easy difficulty",()=>{
        expect(getRange("easy")).toBe(3);
    });
    it("returns 5 for medium difficulty",()=>{
        expect(getRange("medium")).toBe(5);
    });
    it("returns 10 for hard difficulty",()=>{
        expect(getRange("hard")).toBe(10);
    });
    it("returns 5 when no difficulty given",()=>{
        expect(getRange()).toBe(5);
    });
    it("returns 5 for unknown difficulty",()=>{
        expect(getRange("extreme")).toBe(5);
    });
});
describe("matrixToString",()=>{
    it("returns bmatrix LaTeX for a 2x2 matrix",()=>{
        expect(matrixToString({a:1,b:2,c:3,d:4})).toBe("\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}");
    });
    it("returns pmatrix LaTeX with custom style",()=>{
        expect(matrixToString({a:1,b:2,c:3,d:4},"pmatrix")).toBe("\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}");
    });
    it("returns vmatrix LaTeX with vmatrix style",()=>{
        expect(matrixToString({a:5,b:6,c:7,d:8},"vmatrix")).toBe("\\begin{vmatrix} 5 & 6 \\\\ 7 & 8 \\end{vmatrix}");
    });
    it("handles negative numbers in matrix",()=>{
        expect(matrixToString({a:-1,b:0,c:3,d:-4})).toBe("\\begin{bmatrix} -1 & 0 \\\\ 3 & -4 \\end{bmatrix}");
    });
    it("handles zero values in matrix",()=>{
        expect(matrixToString({a:0,b:0,c:0,d:0})).toBe("\\begin{bmatrix} 0 & 0 \\\\ 0 & 0 \\end{bmatrix}");
    });
    it("handles decimal values in matrix",()=>{
        expect(matrixToString({a:1.5,b:2.25,c:3.75,d:4.5})).toBe("\\begin{bmatrix} 1.5 & 2.25 \\\\ 3.75 & 4.5 \\end{bmatrix}");
    });
});
