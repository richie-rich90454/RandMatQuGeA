import {describe,it,expect} from "vitest";
import {getRange,matrixToString,getMatrixSize,getVectorDimension,formatMatrix,formatVector,getDeterminant} from "./linearAlgebraUtils.js";
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
describe("getMatrixSize",()=>{
    it("should return 2x2 for easy",()=>{
        expect(getMatrixSize("easy")).toEqual({rows:2,cols:2});
    });
    it("should return 3x3 for medium",()=>{
        expect(getMatrixSize("medium")).toEqual({rows:3,cols:3});
    });
    it("should return 4x4 for hard",()=>{
        expect(getMatrixSize("hard")).toEqual({rows:4,cols:4});
    });
    it("should handle null difficulty",()=>{
        expect(getMatrixSize(null as unknown as string)).toEqual({rows:3,cols:3});
    });
    it("should handle empty difficulty",()=>{
        expect(getMatrixSize("")).toEqual({rows:3,cols:3});
    });
});
describe("getVectorDimension",()=>{
    it("should return 2 for easy",()=>{
        expect(getVectorDimension("easy")).toBe(2);
    });
    it("should return 3 for medium",()=>{
        expect(getVectorDimension("medium")).toBe(3);
    });
    it("should return 4 for hard",()=>{
        expect(getVectorDimension("hard")).toBe(4);
    });
    it("should handle null difficulty",()=>{
        expect(getVectorDimension(null as unknown as string)).toBe(3);
    });
    it("should handle empty difficulty",()=>{
        expect(getVectorDimension("")).toBe(3);
    });
});
describe("formatMatrix",()=>{
    it("should format 2x2 matrix",()=>{
        expect(formatMatrix([[1,2],[3,4]])).toBe("1 2\n3 4");
    });
    it("should format 3x3 matrix",()=>{
        expect(formatMatrix([[1,2,3],[4,5,6],[7,8,9]])).toBe("1 2 3\n4 5 6\n7 8 9");
    });
    it("should format with integers",()=>{
        expect(formatMatrix([[0,0],[0,0]])).toBe("0 0\n0 0");
    });
    it("should format with decimals",()=>{
        expect(formatMatrix([[1.5,2.25],[3.75,4.5]])).toBe("1.5 2.25\n3.75 4.5");
    });
    it("should handle empty matrix",()=>{
        expect(formatMatrix([])).toBe("");
    });
    it("should handle single element",()=>{
        expect(formatMatrix([[42]])).toBe("42");
    });
});
describe("formatVector",()=>{
    it("should format 2D vector",()=>{
        expect(formatVector([1,2])).toBe("(1, 2)");
    });
    it("should format 3D vector",()=>{
        expect(formatVector([1,2,3])).toBe("(1, 2, 3)");
    });
    it("should format with integers",()=>{
        expect(formatVector([0,0,0])).toBe("(0, 0, 0)");
    });
    it("should format with decimals",()=>{
        expect(formatVector([1.5,2.25,3.75])).toBe("(1.5, 2.25, 3.75)");
    });
    it("should handle empty vector",()=>{
        expect(formatVector([])).toBe("()");
    });
    it("should handle single component",()=>{
        expect(formatVector([42])).toBe("(42)");
    });
});
describe("getDeterminant",()=>{
    it("should calculate 2x2 determinant",()=>{
        expect(getDeterminant([[1,2],[3,4]])).toBe(-2);
    });
    it("should calculate 3x3 determinant",()=>{
        expect(getDeterminant([[1,2,3],[0,1,4],[5,6,0]])).toBe(1);
    });
    it("should return 0 for singular matrix",()=>{
        expect(getDeterminant([[1,2],[2,4]])).toBe(0);
    });
    it("should handle 1x1 matrix",()=>{
        expect(getDeterminant([[5]])).toBe(5);
    });
    it("should handle negative values",()=>{
        expect(getDeterminant([[-1,2],[3,-4]])).toBe(-2);
    });
    it("should handle decimal values",()=>{
        expect(getDeterminant([[1.5,2],[3,4]])).toBe(0);
    });
});
