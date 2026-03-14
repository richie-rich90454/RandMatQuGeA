/**
 * Barrel file exporting all arithmetic question generators and utilities.
 *
 * This file aggregates the various arithmetic modules, providing a single import entry point
 * for all arithmetic question generation functions and helper utilities.
 *
 * @remarks
 * **Exported modules**:
 * - `./arithmeticUtils.js`     – Utility functions: `getRangeForDifficulty`, `getMaxForDifficulty`, `gcd`, `isPrime`.
 * - `./arithmeticBasic.js`     – Basic arithmetic operations: `generateAddition`, `generateSubtraction`,
 *                                 `generateMultiplication`, `generateDivision`.
 * - `./arithmeticAdvanced.js`  – Advanced arithmetic topics: `generateWholeNumberPlaceValue`,
 *                                 `generateNumberLineOrdering`, `generateDivisibility`, `generateGCFLCM`.
 *
 * **Usage**:
 * ```typescript
 * import { generateAddition, generateGCFLCM, getRangeForDifficulty } from "./arithmetic/index.js";
 *
 * generateAddition("hard");
 * ```
 *
 * @packageDocumentation
 */
export * from "./arithmeticUtils.js";
export * from "./arithmeticBasic.js";
export * from "./arithmeticAdvanced.js";