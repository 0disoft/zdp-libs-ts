import type {
  ApiContractsInput,
  LibsContractDiagnostic,
  LibsContracts,
  LibsContractValidationResult
} from './types';

const REQUIRED_PACKAGE_NAMES = [
  '@zdp/schema',
  '@zdp/env-contract',
  '@zdp/event-contracts',
  '@zdp/error',
  '@zdp/i18n-contract',
  '@zdp/glossary-contract'
] as const;

const REQUIRED_PACKAGE_FORBIDDEN_OWNERSHIP = [
  'product domain models',
  'secret values',
  'queue provider implementation',
  'provider raw errors',
  'translation runtime',
  'glossary backend CMS',
  'advertising runtime'
] as const;

const REQUIRED_API_CONTRACT_SOURCE_REPO = 'zdp-api-contracts';

const REQUIRED_API_SOURCE_CONTRACTS = [
  'contracts/route-contract.yaml',
  'contracts/error-envelope.yaml',
  'contracts/webhook-contract.yaml',
  'contracts/sdk-generation-input.yaml',
  'contracts/apis/catalog.yaml'
] as const;

const REQUIRED_API_SOURCE_PACKAGES = [
  '@zdp/schema',
  '@zdp/event-contracts',
  '@zdp/error'
] as const;

const REQUIRED_API_SOURCE_HANDOFF_METADATA = [
  'schema_id',
  'operation_id',
  'error_code',
  'event_type',
  'request_id',
  'trace_id',
  'idempotency',
  'success_statuses',
  'sdk_generation_targets'
] as const;

const REQUIRED_API_SOURCE_FORBIDDEN_OWNERSHIP = [
  'API contract source',
  'generated SDK source truth',
  'product domain models',
  'runtime validator competitor',
  'final authorization decisions'
] as const;

const REQUIRED_API_SOURCE_FORBIDDEN_VALUES = [
  'raw_customer_payload',
  'raw_provider_error',
  'provider_secret',
  'authorization_header',
  'cookie_header',
  'screen_component_payload'
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

const REQUIRED_GLOSSARY_METADATA = [
  'id',
  'status',
  'visibility',
  'aliases',
  'match_phrases',
  'locales',
  'owner',
  'interaction'
] as const;

const REQUIRED_GLOSSARY_LOCALE_METADATA = [
  'label',
  'slug',
  'short',
  'translation_status'
] as const;

const FORBIDDEN_GLOSSARY_OWNERSHIP = [
  'glossary_backend_cms',
  'advertising_runtime',
  'product_domain_copy_final_approval',
  'morphology_engine',
  'provider_ad_sdk'
] as const;

const FORBIDDEN_GLOSSARY_VALUES = [
  'private_internal_terms_in_public_manifest',
  'secret_values',
  'internal_urls',
  'raw_customer_payload',
  'hover_trigger_for_public_terms',
  'hover_card_ads'
] as const;

const ALLOWED_CONTRACT_STATUSES = [
  'skeleton',
  'draft',
  'reviewed',
  'active'
] as const;

const REQUIRED_API_CATALOG_ROUTE_FIELDS = [
  'operation_id',
  'service_id',
  'resource',
  'action',
  'method',
  'path',
  'success_statuses',
  'request_schema_ref',
  'response_schema_ref',
  'auth_required',
  'permission_check',
  'audit_event',
  'idempotency',
  'error_codes'
] as const;

export function validateLibsContracts(
  contracts: LibsContracts,
  options: {
    readonly apiContractsInput?: ApiContractsInput;
  } = {}
): LibsContractValidationResult {
  const diagnostics: LibsContractDiagnostic[] = [];

  validatePackageBoundaries(contracts, diagnostics);
  validateApiContractSource(contracts, diagnostics);
  if (options.apiContractsInput !== undefined) {
    validateApiContractInputHandoff(
      contracts,
      options.apiContractsInput,
      diagnostics
    );
  }
  validateSchemaContract(contracts, diagnostics);
  validateEnvContract(contracts, diagnostics);
  validateEventContract(contracts, diagnostics);
  validateErrorContract(contracts, diagnostics);
  validateI18nContract(contracts, diagnostics);
  validateGlossaryContract(contracts, diagnostics);

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

function validateApiContractSource(
  contracts: LibsContracts,
  diagnostics: LibsContractDiagnostic[]
): void {
  validateAllowedStatus({
    actual: contracts.apiContractSource.status,
    diagnostics,
    code: 'LIBS_API_SOURCE_STATUS_INVALID',
    file: 'contracts/api-contract-source.yaml',
    path: 'api_contract_source.status',
    label: 'API contract source handoff status'
  });

  if (contracts.apiContractSource.sourceRepo !== REQUIRED_API_CONTRACT_SOURCE_REPO) {
    diagnostics.push({
      code: 'LIBS_API_SOURCE_REPO_INVALID',
      file: 'contracts/api-contract-source.yaml',
      path: 'api_contract_source.source_repo',
      message: 'API contract source handoff must consume `zdp-api-contracts`.'
    });
  }

  requireAll(
    contracts.apiContractSource.sourceContracts,
    REQUIRED_API_SOURCE_CONTRACTS,
    diagnostics,
    'LIBS_API_SOURCE_CONTRACT_MISSING',
    'contracts/api-contract-source.yaml',
    'api_contract_source.source_contracts'
  );
  requireAll(
    contracts.apiContractSource.consumedByPackages,
    REQUIRED_API_SOURCE_PACKAGES,
    diagnostics,
    'LIBS_API_SOURCE_PACKAGE_MISSING',
    'contracts/api-contract-source.yaml',
    'api_contract_source.consumed_by_packages'
  );
  requireAll(
    contracts.apiContractSource.requiredHandoffMetadata,
    REQUIRED_API_SOURCE_HANDOFF_METADATA,
    diagnostics,
    'LIBS_API_SOURCE_METADATA_MISSING',
    'contracts/api-contract-source.yaml',
    'api_contract_source.required_handoff_metadata'
  );
  requireAll(
    contracts.apiContractSource.mustNotOwn,
    REQUIRED_API_SOURCE_FORBIDDEN_OWNERSHIP,
    diagnostics,
    'LIBS_API_SOURCE_FORBIDDEN_OWNERSHIP_MISSING',
    'contracts/api-contract-source.yaml',
    'api_contract_source.must_not_own'
  );
  requireAll(
    contracts.apiContractSource.forbiddenValues,
    REQUIRED_API_SOURCE_FORBIDDEN_VALUES,
    diagnostics,
    'LIBS_API_SOURCE_FORBIDDEN_VALUE_MISSING',
    'contracts/api-contract-source.yaml',
    'api_contract_source.forbidden_values'
  );
}

function validateApiContractInputHandoff(
  contracts: LibsContracts,
  apiContractsInput: ApiContractsInput,
  diagnostics: LibsContractDiagnostic[]
): void {
  const source = contracts.apiContractSource;
  const route = apiContractsInput.route;
  const errorEnvelope = apiContractsInput.errorEnvelope;
  const webhook = apiContractsInput.webhook;
  const sdkInput = apiContractsInput.sdkGenerationInput;
  const apiCatalog = apiContractsInput.apiCatalog;

  requireAll(
    source.sourceContracts,
    REQUIRED_API_SOURCE_CONTRACTS,
    diagnostics,
    'LIBS_API_INPUT_SOURCE_CONTRACT_MISSING',
    'contracts/api-contract-source.yaml',
    'api_contract_source.source_contracts'
  );
  requireAll(
    sdkInput.sourceContracts,
    REQUIRED_API_SOURCE_CONTRACTS,
    diagnostics,
    'LIBS_API_INPUT_SDK_SOURCE_CONTRACT_MISSING',
    '../zdp-api-contracts/contracts/sdk-generation-input.yaml',
    'sdk_generation_input.source_contracts'
  );

  validateAllowedStatus({
    actual: route.status,
    diagnostics,
    code: 'LIBS_API_INPUT_ROUTE_STATUS_DRIFT',
    file: '../zdp-api-contracts/contracts/route-contract.yaml',
    path: 'route_contract.status',
    label: 'API route contract status'
  });
  validateAllowedStatus({
    actual: webhook.status,
    diagnostics,
    code: 'LIBS_API_INPUT_WEBHOOK_STATUS_DRIFT',
    file: '../zdp-api-contracts/contracts/webhook-contract.yaml',
    path: 'webhook_contract.status',
    label: 'API webhook contract status'
  });
  validateAllowedStatus({
    actual: sdkInput.status,
    diagnostics,
    code: 'LIBS_API_INPUT_SDK_STATUS_DRIFT',
    file: '../zdp-api-contracts/contracts/sdk-generation-input.yaml',
    path: 'sdk_generation_input.status',
    label: 'API SDK generation input status'
  });
  validateExactString({
    actual: apiCatalog.status,
    expected: 'empty-until-service-routes-exist',
    diagnostics,
    code: 'LIBS_API_INPUT_CATALOG_STATUS_DRIFT',
    file: '../zdp-api-contracts/contracts/apis/catalog.yaml',
    path: 'api_catalog.status',
    label: 'API catalog status'
  });
  validateExactNumber({
    actual: errorEnvelope.schemaVersion,
    expected: 1,
    diagnostics,
    code: 'LIBS_API_INPUT_ERROR_SCHEMA_VERSION_DRIFT',
    file: '../zdp-api-contracts/contracts/error-envelope.yaml',
    path: 'error_envelope.schema_version',
    label: 'API error envelope schema version'
  });

  requireAll(
    route.requiredPerRoute,
    [
      'resource',
      'action',
      'method',
      'path',
      'auth_required',
      'permission_check',
      'audit_event',
      'idempotency',
      'success_statuses',
      'error_codes'
    ],
    diagnostics,
    'LIBS_API_INPUT_ROUTE_METADATA_MISSING',
    '../zdp-api-contracts/contracts/route-contract.yaml',
    'route_contract.required_per_route'
  );
  requireAll(
    sdkInput.requiredRouteMetadata,
    [
      'operation_id',
      'method',
      'path',
      'request_schema_ref',
      'response_schema_ref',
      'auth_required',
      'permission_check',
      'audit_event',
      'idempotency',
      'success_statuses',
      'error_codes'
    ],
    diagnostics,
    'LIBS_API_INPUT_SDK_ROUTE_METADATA_MISSING',
    '../zdp-api-contracts/contracts/sdk-generation-input.yaml',
    'sdk_generation_input.required_route_metadata'
  );
  requireAll(
    errorEnvelope.requiredFields,
    ['code', 'message', 'request_id', 'trace_id'],
    diagnostics,
    'LIBS_API_INPUT_ERROR_FIELD_MISSING',
    '../zdp-api-contracts/contracts/error-envelope.yaml',
    'error_envelope.required_fields'
  );
  requireAll(
    sdkInput.requiredErrorMetadata,
    ['code', 'message', 'request_id', 'trace_id'],
    diagnostics,
    'LIBS_API_INPUT_SDK_ERROR_METADATA_MISSING',
    '../zdp-api-contracts/contracts/sdk-generation-input.yaml',
    'sdk_generation_input.required_error_metadata'
  );
  requireAll(
    webhook.requiredControls,
    [
      'event_id',
      'event_type',
      'schema_version',
      'signature_verification',
      'idempotency_key',
      'replay_policy',
      'dead_letter_policy'
    ],
    diagnostics,
    'LIBS_API_INPUT_WEBHOOK_CONTROL_MISSING',
    '../zdp-api-contracts/contracts/webhook-contract.yaml',
    'webhook_contract.required_controls'
  );
  requireAll(
    sdkInput.requiredWebhookMetadata,
    [
      'event_id',
      'event_type',
      'schema_version',
      'signature_verification',
      'idempotency_key',
      'replay_policy',
      'dead_letter_policy'
    ],
    diagnostics,
    'LIBS_API_INPUT_SDK_WEBHOOK_METADATA_MISSING',
    '../zdp-api-contracts/contracts/sdk-generation-input.yaml',
    'sdk_generation_input.required_webhook_metadata'
  );
  for (const target of sdkInput.generationTargets) {
    if (!sdkInput.allowedGenerationTargets.includes(target)) {
      diagnostics.push({
        code: 'LIBS_API_INPUT_SDK_TARGET_NOT_ALLOWED',
        file: '../zdp-api-contracts/contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.generation_targets',
        message: `SDK generation target \`${target}\` must be declared in allowed_generation_targets.`
      });
    }
  }

  requireAll(
    apiCatalog.routeDefinitionRequiredFields,
    REQUIRED_API_CATALOG_ROUTE_FIELDS,
    diagnostics,
    'LIBS_API_INPUT_CATALOG_ROUTE_FIELD_MISSING',
    '../zdp-api-contracts/contracts/apis/catalog.yaml',
    'api_catalog.route_definition_required_fields'
  );
  requireAll(
    apiCatalog.routeDefinitionRequiredFields,
    sdkInput.requiredRouteMetadata,
    diagnostics,
    'LIBS_API_INPUT_CATALOG_SDK_METADATA_MISSING',
    '../zdp-api-contracts/contracts/apis/catalog.yaml',
    'api_catalog.route_definition_required_fields'
  );
  requireAll(
    apiCatalog.forbiddenValues,
    sdkInput.forbiddenValues,
    diagnostics,
    'LIBS_API_INPUT_CATALOG_FORBIDDEN_VALUE_MISSING',
    '../zdp-api-contracts/contracts/apis/catalog.yaml',
    'api_catalog.forbidden_values'
  );

  requireAll(
    combineValues([
      route.forbiddenShapes,
      errorEnvelope.forbiddenFields,
      webhook.forbiddenControls,
      sdkInput.forbiddenValues
    ]),
    [
      'screen_component_payload',
      'raw_provider_error',
      'provider_secret',
      'authorization_header',
      'cookie_header',
      'raw_customer_payload'
    ],
    diagnostics,
    'LIBS_API_INPUT_FORBIDDEN_VALUE_MISSING',
    '../zdp-api-contracts/contracts/sdk-generation-input.yaml',
    'api_contracts.forbidden_values'
  );
}

function validateSchemaContract(
  contracts: LibsContracts,
  diagnostics: LibsContractDiagnostic[]
): void {
  validateAllowedStatus({
    actual: contracts.schema.status,
    diagnostics,
    code: 'LIBS_SCHEMA_STATUS_INVALID',
    file: 'contracts/schema-contract.yaml',
    path: 'schema_contract.status',
    label: 'Schema contract status'
  });

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
  validateAllowedStatus({
    actual: contracts.event.status,
    diagnostics,
    code: 'LIBS_EVENT_STATUS_INVALID',
    file: 'contracts/event-contract.yaml',
    path: 'event_contract.status',
    label: 'Event contract status'
  });

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
  validateAllowedStatus({
    actual: contracts.i18n.status,
    diagnostics,
    code: 'LIBS_I18N_STATUS_INVALID',
    file: 'contracts/i18n-contract.yaml',
    path: 'i18n_contract.status',
    label: 'I18n contract status'
  });

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

function validateGlossaryContract(
  contracts: LibsContracts,
  diagnostics: LibsContractDiagnostic[]
): void {
  validateAllowedStatus({
    actual: contracts.glossary.status,
    diagnostics,
    code: 'LIBS_GLOSSARY_STATUS_INVALID',
    file: 'contracts/glossary-contract.yaml',
    path: 'glossary_contract.status',
    label: 'Glossary contract status'
  });

  if (contracts.glossary.termIdPattern !== 'namespace.concept') {
    diagnostics.push({
      code: 'LIBS_GLOSSARY_TERM_ID_PATTERN_INVALID',
      file: 'contracts/glossary-contract.yaml',
      path: 'glossary_contract.term_id_pattern',
      message: 'Glossary term ids must use the namespace.concept pattern.'
    });
  }

  requireAll(
    contracts.glossary.requiredMetadata,
    REQUIRED_GLOSSARY_METADATA,
    diagnostics,
    'LIBS_GLOSSARY_METADATA_MISSING',
    'contracts/glossary-contract.yaml',
    'glossary_contract.required_metadata'
  );
  requireAll(
    contracts.glossary.requiredLocaleMetadata,
    REQUIRED_GLOSSARY_LOCALE_METADATA,
    diagnostics,
    'LIBS_GLOSSARY_LOCALE_METADATA_MISSING',
    'contracts/glossary-contract.yaml',
    'glossary_contract.required_locale_metadata'
  );
  requireAll(
    contracts.glossary.forbiddenOwnership,
    FORBIDDEN_GLOSSARY_OWNERSHIP,
    diagnostics,
    'LIBS_GLOSSARY_FORBIDDEN_OWNERSHIP_MISSING',
    'contracts/glossary-contract.yaml',
    'glossary_contract.forbidden_ownership'
  );
  requireAll(
    contracts.glossary.forbiddenValues,
    FORBIDDEN_GLOSSARY_VALUES,
    diagnostics,
    'LIBS_GLOSSARY_FORBIDDEN_VALUE_MISSING',
    'contracts/glossary-contract.yaml',
    'glossary_contract.forbidden_values'
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

function validateExactString(input: {
  readonly actual: string | null;
  readonly expected: string;
  readonly diagnostics: LibsContractDiagnostic[];
  readonly code: string;
  readonly file: string;
  readonly path: string;
  readonly label: string;
}): void {
  if (input.actual === input.expected) {
    return;
  }

  input.diagnostics.push({
    code: input.code,
    file: input.file,
    path: input.path,
    message: `${input.label} must be \`${input.expected}\`.`
  });
}

function validateAllowedStatus(input: {
  readonly actual: string | null;
  readonly diagnostics: LibsContractDiagnostic[];
  readonly code: string;
  readonly file: string;
  readonly path: string;
  readonly label: string;
}): void {
  if (isAllowedContractStatus(input.actual)) {
    return;
  }

  input.diagnostics.push({
    code: input.code,
    file: input.file,
    path: input.path,
    message: `${input.label} must be one of ${formatAllowedStatuses()}.`
  });
}

function validateExactNumber(input: {
  readonly actual: number | null;
  readonly expected: number;
  readonly diagnostics: LibsContractDiagnostic[];
  readonly code: string;
  readonly file: string;
  readonly path: string;
  readonly label: string;
}): void {
  if (input.actual === input.expected) {
    return;
  }

  input.diagnostics.push({
    code: input.code,
    file: input.file,
    path: input.path,
    message: `${input.label} must be \`${input.expected}\`.`
  });
}

function combineValues(
  valueGroups: readonly (readonly string[])[]
): readonly string[] {
  return Array.from(new Set(valueGroups.flat()));
}

function formatAllowedStatuses(): string {
  return ALLOWED_CONTRACT_STATUSES.map((status) => `\`${status}\``).join(', ');
}

function isAllowedContractStatus(
  status: string | null
): status is (typeof ALLOWED_CONTRACT_STATUSES)[number] {
  return ALLOWED_CONTRACT_STATUSES.includes(
    status as (typeof ALLOWED_CONTRACT_STATUSES)[number]
  );
}
