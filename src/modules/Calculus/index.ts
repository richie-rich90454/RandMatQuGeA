/**
 * Barrel file exporting all calculus question generators and utilities.
 *
 * This file aggregates the various calculus modules, providing a single import entry point
 * for all question generation functions and helper utilities used throughout the application.
 *
 * @remarks
 * **Exported modules**:
 * - `./calculusUtils.js`          – Common utilities: `getMaxCoeff`, trigonometric/ exponential/logarithmic function tables, `latexToPlain`, etc.
 * - `./calculusDerivatives.js`    – Derivative question generator: `generateDerivative`
 * - `./calculusIntegrals.js`       – Integral question generator: `generateIntegral`
 * - `./calculusLimitsRelated.js`   – Limit and related rates generators: `generateLimit`, `generateRelatedRates`
 * - `./calculusLimitsContinuity.js`– Limits and continuity generator: `generateLimitsContinuity`
 * - `./calculusApplicationsDiff.js`– Applications of derivatives generator: `generateApplicationsDiff`
 * - `./calculusIntegrationAdvanced.js`– Advanced integration and differential equations generator: `generateIntegrationAdvanced`
 * - `./calculusGraphical.js`       – Graphical calculus generator: `generateGraphicalCalculus`
 * - `./calculusParametricPolarVector.js`– Parametric, polar, vector generator: `generateParametricPolarVector`
 * - `./calculusSequencesSeries.js` – Sequences and series generator (placeholder or future implementation)
 *
 * **Usage**:
 * ```typescript
 * import { generateDerivative, generateIntegral, getMaxCoeff } from "./calculus/index.js";
 *
 * generateDerivative("hard");
 * ```
 *
 * @packageDocumentation
 */
export * from "./CalculusUtils.js";
export * from "./CalculusDerivatives.js";
export * from "./CalculusIntegrals.js";
export * from "./CalculusLimitsRelated.js";
export * from "./CalculusLimitsContinuity.js";
export * from "./CalculusApplicationsDiff.js";
export * from "./CalculusIntegrationAdvanced.js";
export * from "./CalculusGraphical.js";
export * from "./CalculusParametricPolarVector.js";
export * from "./CalculusSequencesSeries.js";