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
export * from "./calculusUtils.js";
export * from "./calculusDerivatives.js";
export * from "./calculusIntegrals.js";
export * from "./calculusLimitsRelated.js";
export * from "./calculusLimitsContinuity.js";
export * from "./calculusApplicationsDiff.js";
export * from "./calculusIntegrationAdvanced.js";
export * from "./calculusGraphical.js";
export * from "./calculusParametricPolarVector.js";
export * from "./calculusSequencesSeries.js";