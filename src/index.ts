/*
 * mf:anchor zdp.libs-ts.public-export-surface
 * purpose: Locate the public package barrel that exposes only shared contract metadata helpers.
 * search: schema, env contract, event contracts, error, i18n contract, glossary contract
 * invariant: Public exports stay metadata-oriented and do not become product model, provider SDK, or policy helper ownership.
 * risk: data_consistency, dependency
 */
export type {
  SchemaGenerationTarget,
  SchemaMetadata
} from './schema/index.js';
export {
  SCHEMA_GENERATION_TARGETS,
  defineSchemaMetadata
} from './schema/index.js';

export type { EnvContractMetadata } from './env-contract/index.js';
export { defineEnvContractMetadata } from './env-contract/index.js';

export type {
  EventContractMetadata,
  EventTraceContext
} from './event-contracts/index.js';
export { defineEventContractMetadata } from './event-contracts/index.js';

export type {
  ZdpErrorCategory,
  ZdpErrorContract
} from './error/index.js';
export { defineZdpErrorContract } from './error/index.js';

export type {
  I18nMessageArgument,
  I18nMessageContract,
  I18nMessageKey
} from './i18n-contract/index.js';
export { defineI18nMessageContract } from './i18n-contract/index.js';

export type {
  GlossaryAdPolicy,
  GlossaryAdSurfacePolicy,
  GlossaryLocaleContract,
  GlossaryManifest,
  GlossaryManifestEntry,
  GlossaryMatchPhrase,
  GlossaryTermContract,
  GlossaryTermId,
  GlossaryTermStatus,
  GlossaryTranslationStatus,
  GlossaryVisibility
} from './glossary-contract/index.js';
export { defineGlossaryTermContract } from './glossary-contract/index.js';

export type {
  CalculatorErrorCode,
  CalculatorExecutionOptions,
  CalculatorResult,
  MarginMarkupInput,
  MarginMarkupOutput,
  PercentageChangeInput,
  PercentageChangeOutput,
  UnitDecimalInput,
  UnitDecimalOutput
} from './calculator-engine/index.js';
export {
  CALCULATOR_CONTRACT_VERSION,
  CALCULATOR_ENGINE_VERSION,
  CALCULATOR_MAX_DECIMAL_PLACES,
  CALCULATOR_MAX_INPUT_DIGITS,
  CALCULATOR_ROUNDING_MODE,
  calculateMarginMarkup,
  calculatePercentageChange
} from './calculator-engine/index.js';
