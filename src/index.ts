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
} from './schema/index';
export {
  SCHEMA_GENERATION_TARGETS,
  defineSchemaMetadata
} from './schema/index';

export type { EnvContractMetadata } from './env-contract/index';
export { defineEnvContractMetadata } from './env-contract/index';

export type {
  EventContractMetadata,
  EventTraceContext
} from './event-contracts/index';
export { defineEventContractMetadata } from './event-contracts/index';

export type {
  ZdpErrorCategory,
  ZdpErrorContract
} from './error/index';
export { defineZdpErrorContract } from './error/index';

export type {
  I18nMessageArgument,
  I18nMessageContract,
  I18nMessageKey
} from './i18n-contract/index';
export { defineI18nMessageContract } from './i18n-contract/index';

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
} from './glossary-contract/index';
export { defineGlossaryTermContract } from './glossary-contract/index';
