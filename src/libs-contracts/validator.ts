import type {
  LibsContractDiagnostic,
  LibsContracts,
  LibsContractValidationResult
} from './types';

const REQUIRED_PACKAGE_NAMES = [
  '@zdp/schema',
  '@zdp/env-contract',
  '@zdp/event-contracts',
  '@zdp/error',
  '@zdp/i18n-contract'
] as const;

const REQUIRED_PACKAGE_FORBIDDEN_OWNERSHIP = [
  'product domain models',
  'secret values',
  'queue provider implementation',
  'provider raw errors',
  'translation runtime'
] as const;

const REQUIRED_SCHEMA_METADATA = [
  'schema_id',
  'version',
  'owner',
  'json_schema_ref',
  'openapi_ref',
  'sdk_generation_targets'
] as const;

const REQUIRED_SCHEMA_TARGETS = [
  'json_schema',
  'openapi',
  'typescript',
  'rust',
  'dart'
] as const;

const FORBIDDEN_SCHEMA_OWNERSHIP = [
  'product_domain_model',
  'runtime_validator_competitor',
  'provider_payload_raw',
  'database_row_shape'
] as const;

const REQUIRED_ENV_METADATA = [
  'name',
  'owner',
  'environment',
  'secret',
  'required',
  'description'
] as const;

const FORBIDDEN_ENV_VALUES = [
  'actual secret values',
  'account ids',
  'server ips',
  'provider tokens'
] as const;

const REQUIRED_EVENT_METADATA = [
  'event_id',
  'schema_ref',
  'source',
  'privacy_class',
  'replay_safe'
] as const;

const REQUIRED_EVENT_TRACE_FIELDS = ['request_id', 'trace_id'] as const;

const FORBIDDEN_EVENT_VALUES = [
  'raw_customer_payload',
  'provider_secret',
  'authorization_header',
  'cookie',
  'payment_payload',
  'ai_prompt_body'
] as const;

const REQUIRED_ERROR_FIELDS = [
  'code',
  'category',
  'retryable',
  'public_message_key',
  'request_id',
  'trace_id'
] as const;

const FORBIDDEN_ERROR_FIELDS = [
  'stack_trace',
  'raw_provider_error',
  'secret_value',
  'customer_payload'
] as const;

const REQUIRED_I18N_METADATA = [
  'key',
  'default_locale',
  'arguments',
  'owner',
  'fallback_policy'
] as const;

const FORBIDDEN_I18N_OWNERSHIP = [
  'translation_runtime',
  'provider_i18n_sdk',
  'product_copy_final_approval'
] as const;

export function validateLibsContracts(
  contracts: LibsContracts
): LibsContractValidationResult {
  const diagnostics: LibsContractDiagnostic[] = [];

  validatePackageBoundaries(contracts, diagnostics);
  validateSchemaContract(contracts, diagnostics);
  validateEnvContract(contracts, diagnostics);
  validateEventContract(contracts, diagnostics);
  validateErrorContract(contracts, diagnostics);
  validateI18nContract(contracts, diagnostics);

  return {
    ok: diagnostics.length === 0,
    diagnostics
  };
}

function validatePackageBoundaries(
  contracts: LibsContracts,
  diagnostics: LibsContractDiagnostic[]
): void {
  const packageNames = contracts.packageBoundaries.packages.map((item) => item.name);

  for (const packageName of REQUIRED_PACKAGE_NAMES) {
    if (!packageNames.includes(packageName)) {
      diagnostics.push({
        code: 'LIBS_PACKAGE_MISSING',
        file: 'contracts/package-boundaries.yaml',
        path: 'packages',
        message: `Package boundary must include \`${packageName}\`.`
      });
    }
  }

  for (const forbidden of REQUIRED_PACKAGE_FORBIDDEN_OWNERSHIP) {
    if (!contracts.packageBoundaries.packages.some((item) => item.mustNotOwn.includes(forbidden))) {
      diagnostics.push({
        code: 'LIBS_PACKAGE_FORBIDDEN_BOUNDARY_MISSING',
        file: 'contracts/package-boundaries.yaml',
        path: 'packages[].must_not_own',
        message: `Package boundaries must keep \`${forbidden}\` out of common packages.`
      });
    }
  }
}

function validateSchemaContract(
  contracts: LibsContracts,
  diagnostics: LibsContractDiagnostic[]
): void {
  if (contracts.schema.status !== 'skeleton') {
    diagnostics.push({
      code: 'LIBS_SCHEMA_STATUS_INVALID',
      file: 'contracts/schema-contract.yaml',
      path: 'schema_contract.status',
      message: 'Schema contract must stay skeleton until real package exports exist.'
    });
  }

  requireAll(
    contracts.schema.requiredMetadata,
    REQUIRED_SCHEMA_METADATA,
    diagnostics,
    'LIBS_SCHEMA_METADATA_MISSING',
    'contracts/schema-contract.yaml',
    'schema_contract.required_metadata'
  );
  requireAll(
    contracts.schema.generationTargets,
    REQUIRED_SCHEMA_TARGETS,
    diagnostics,
    'LIBS_SCHEMA_TARGET_MISSING',
    'contracts/schema-contract.yaml',
    'schema_contract.generation_targets'
  );
  requireAll(
    contracts.schema.forbiddenOwnership,
    FORBIDDEN_SCHEMA_OWNERSHIP,
    diagnostics,
    'LIBS_SCHEMA_FORBIDDEN_OWNERSHIP_MISSING',
    'contracts/schema-contract.yaml',
    'schema_contract.forbidden_ownership'
  );
}

function validateEnvContract(
  contracts: LibsContracts,
  diagnostics: LibsContractDiagnostic[]
): void {
  requireAll(
    contracts.env.requiredMetadata,
    REQUIRED_ENV_METADATA,
    diagnostics,
    'LIBS_ENV_METADATA_MISSING',
    'contracts/env-contract.yaml',
    'env_contract.required_metadata'
  );
  requireAll(
    contracts.env.forbiddenValues,
    FORBIDDEN_ENV_VALUES,
    diagnostics,
    'LIBS_ENV_FORBIDDEN_VALUE_MISSING',
    'contracts/env-contract.yaml',
    'env_contract.forbidden_values'
  );
}

function validateEventContract(
  contracts: LibsContracts,
  diagnostics: LibsContractDiagnostic[]
): void {
  if (contracts.event.status !== 'skeleton') {
    diagnostics.push({
      code: 'LIBS_EVENT_STATUS_INVALID',
      file: 'contracts/event-contract.yaml',
      path: 'event_contract.status',
      message: 'Event contract must stay skeleton until event package exports exist.'
    });
  }

  requireAll(
    contracts.event.requiredMetadata,
    REQUIRED_EVENT_METADATA,
    diagnostics,
    'LIBS_EVENT_METADATA_MISSING',
    'contracts/event-contract.yaml',
    'event_contract.required_metadata'
  );
  requireAll(
    contracts.event.requiredTraceFields,
    REQUIRED_EVENT_TRACE_FIELDS,
    diagnostics,
    'LIBS_EVENT_TRACE_FIELD_MISSING',
    'contracts/event-contract.yaml',
    'event_contract.required_trace_fields'
  );
  requireAll(
    contracts.event.forbiddenValues,
    FORBIDDEN_EVENT_VALUES,
    diagnostics,
    'LIBS_EVENT_FORBIDDEN_VALUE_MISSING',
    'contracts/event-contract.yaml',
    'event_contract.forbidden_values'
  );
}

function validateErrorContract(
  contracts: LibsContracts,
  diagnostics: LibsContractDiagnostic[]
): void {
  requireAll(
    contracts.error.requiredFields,
    REQUIRED_ERROR_FIELDS,
    diagnostics,
    'LIBS_ERROR_REQUIRED_FIELD_MISSING',
    'contracts/error-contract.yaml',
    'error_contract.required_fields'
  );
  requireAll(
    contracts.error.forbiddenFields,
    FORBIDDEN_ERROR_FIELDS,
    diagnostics,
    'LIBS_ERROR_FORBIDDEN_FIELD_MISSING',
    'contracts/error-contract.yaml',
    'error_contract.forbidden_fields'
  );
}

function validateI18nContract(
  contracts: LibsContracts,
  diagnostics: LibsContractDiagnostic[]
): void {
  if (contracts.i18n.status !== 'skeleton') {
    diagnostics.push({
      code: 'LIBS_I18N_STATUS_INVALID',
      file: 'contracts/i18n-contract.yaml',
      path: 'i18n_contract.status',
      message: 'I18n contract must stay skeleton until message package exports exist.'
    });
  }

  if (contracts.i18n.messageKeyPattern !== 'domain.message_name') {
    diagnostics.push({
      code: 'LIBS_I18N_KEY_PATTERN_INVALID',
      file: 'contracts/i18n-contract.yaml',
      path: 'i18n_contract.message_key_pattern',
      message: 'I18n message keys must use the domain.message_name pattern.'
    });
  }

  requireAll(
    contracts.i18n.requiredMetadata,
    REQUIRED_I18N_METADATA,
    diagnostics,
    'LIBS_I18N_METADATA_MISSING',
    'contracts/i18n-contract.yaml',
    'i18n_contract.required_metadata'
  );
  requireAll(
    contracts.i18n.forbiddenOwnership,
    FORBIDDEN_I18N_OWNERSHIP,
    diagnostics,
    'LIBS_I18N_FORBIDDEN_OWNERSHIP_MISSING',
    'contracts/i18n-contract.yaml',
    'i18n_contract.forbidden_ownership'
  );
}

function requireAll(
  actual: readonly string[],
  expected: readonly string[],
  diagnostics: LibsContractDiagnostic[],
  code: string,
  file: string,
  path: string
): void {
  for (const value of expected) {
    if (!actual.includes(value)) {
      diagnostics.push({
        code,
        file,
        path,
        message: `Contract must include \`${value}\`.`
      });
    }
  }
}
