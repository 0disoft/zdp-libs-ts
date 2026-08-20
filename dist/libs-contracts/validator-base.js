import { CALCULATOR_CONTRACT_VERSION } from '../calculator-engine/index.js';
const REQUIRED_PACKAGE_NAMES = [
    '@zdp/schema',
    '@zdp/env-contract',
    '@zdp/event-contracts',
    '@zdp/error',
    '@zdp/i18n-contract',
    '@zdp/glossary-contract',
    '@zdp/calculator-engine'
];
const REQUIRED_PACKAGE_FORBIDDEN_OWNERSHIP = [
    'product domain models',
    'secret values',
    'queue provider implementation',
    'provider raw errors',
    'translation runtime',
    'glossary backend CMS',
    'advertising runtime',
    'product calculator pages',
    'locale number parsing or display formatting',
    'tax labor finance or regulatory policy',
    'calculator contract source truth'
];
const REQUIRED_API_CONTRACT_SOURCE_REPO = 'zdp-api-contracts';
const REQUIRED_API_SOURCE_CONTRACTS = [
    'contracts/route-contract.yaml',
    'contracts/error-envelope.yaml',
    'contracts/webhook-contract.yaml',
    'contracts/sdk-generation-input.yaml',
    'contracts/apis/catalog.yaml',
    'contracts/apis/core-api/auth-session.yaml'
];
const REQUIRED_CALCULATOR_SOURCE_CONTRACTS = [
    'contracts/calculators/catalog.yaml',
    'contracts/calculators/conformance.yaml'
];
const REQUIRED_API_SOURCE_PACKAGES = [
    '@zdp/schema',
    '@zdp/event-contracts',
    '@zdp/error',
    '@zdp/calculator-engine'
];
const REQUIRED_API_SOURCE_HANDOFF_METADATA = [
    'schema_id',
    'operation_id',
    'error_code',
    'event_type',
    'request_id',
    'trace_id',
    'idempotency',
    'success_statuses',
    'sdk_generation_targets',
    'calculator_id',
    'contract_version',
    'precision_policy',
    'rounding_policy',
    'conformance_case'
];
const REVIEWED_CALCULATOR_IDS = [
    'percentage-change',
    'margin-markup',
    'break-even-point',
    'data-transfer-time',
    'date-difference',
    'compound-interest',
    'studycafe-seat-occupancy',
    'studycafe-break-even',
    'kiosk-roi',
    'unattended-labor-savings',
    'locker-revenue',
    'study-room-schedule-revenue',
    'security-cost-break-even',
    'discount',
    'age',
    'work-hours',
    'fuel-cost'
];
export const CALCULATOR_REQUIRED_ENGINE_VERSION = {
    'percentage-change': '0.x',
    'margin-markup': '0.x',
    'break-even-point': '0.x',
    'data-transfer-time': '0.6.0',
    'date-difference': '0.6.0',
    'compound-interest': '0.6.0',
    'studycafe-seat-occupancy': '0.5.0',
    'studycafe-break-even': '0.5.0',
    'kiosk-roi': '0.5.0',
    'unattended-labor-savings': '0.5.0',
    'locker-revenue': '0.5.0',
    'study-room-schedule-revenue': '0.5.0',
    'security-cost-break-even': '0.5.0',
    'discount': '0.x',
    'age': '0.x',
    'work-hours': '0.x',
    'fuel-cost': '0.x'
};
const CALCULATOR_REQUIRED_ERROR_CODES = {
    'percentage-change': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'denominator_zero'],
    'margin-markup': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'denominator_zero'],
    'break-even-point': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'non_positive_contribution_margin', 'incompatible_units'],
    'data-transfer-time': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'unsupported_unit', 'precision_policy_required', 'rounding_policy_required'],
    'date-difference': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'invalid_date_range'],
    'compound-interest': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'precision_policy_required', 'rounding_policy_required'],
    'studycafe-seat-occupancy': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'denominator_zero'],
    'studycafe-break-even': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'denominator_zero', 'incompatible_units'],
    'kiosk-roi': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'denominator_zero', 'incompatible_units'],
    'unattended-labor-savings': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'incompatible_units'],
    'locker-revenue': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'incompatible_units'],
    'study-room-schedule-revenue': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'incompatible_units'],
    'security-cost-break-even': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'non_positive_contribution_margin', 'incompatible_units'],
    'discount': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'precision_policy_required', 'rounding_policy_required'],
    'age': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'invalid_date_range'],
    'work-hours': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'precision_policy_required', 'rounding_policy_required'],
    'fuel-cost': ['invalid_input', 'domain_error', 'limit_exceeded', 'contract_mismatch', 'precision_policy_required', 'rounding_policy_required']
};
const CALCULATOR_PRECISION_POLICY = 'canonical_ascii_decimal_string_max_1000_digits';
const CALCULATOR_ROUNDING_POLICY = 'caller_decimal_places_0_to_100_half_away_from_zero';
const REQUIRED_API_SOURCE_FORBIDDEN_OWNERSHIP = [
    'API contract source',
    'generated SDK source truth',
    'product domain models',
    'runtime validator competitor',
    'final authorization decisions'
];
const REQUIRED_API_SOURCE_FORBIDDEN_VALUES = [
    'raw_customer_payload',
    'raw_provider_error',
    'provider_secret',
    'authorization_header',
    'cookie_header',
    'refresh_token_plaintext',
    'stack_trace',
    'screen_component_payload'
];
const REQUIRED_SCHEMA_METADATA = [
    'schema_id',
    'version',
    'owner',
    'json_schema_ref',
    'openapi_ref',
    'sdk_generation_targets'
];
const REQUIRED_SCHEMA_TARGETS = [
    'json_schema',
    'openapi',
    'typescript',
    'rust',
    'dart'
];
const FORBIDDEN_SCHEMA_OWNERSHIP = [
    'product_domain_model',
    'runtime_validator_competitor',
    'provider_payload_raw',
    'database_row_shape'
];
const REQUIRED_ENV_METADATA = [
    'name',
    'owner',
    'environment',
    'secret',
    'required',
    'description'
];
const FORBIDDEN_ENV_VALUES = [
    'actual secret values',
    'account ids',
    'server ips',
    'provider tokens'
];
const REQUIRED_EVENT_METADATA = [
    'event_id',
    'schema_ref',
    'source',
    'privacy_class',
    'replay_safe'
];
const REQUIRED_EVENT_TRACE_FIELDS = ['request_id', 'trace_id'];
const FORBIDDEN_EVENT_VALUES = [
    'raw_customer_payload',
    'provider_secret',
    'authorization_header',
    'cookie',
    'payment_payload',
    'ai_prompt_body'
];
const REQUIRED_ERROR_FIELDS = [
    'code',
    'category',
    'retryable',
    'public_message_key',
    'request_id',
    'trace_id'
];
const FORBIDDEN_ERROR_FIELDS = [
    'stack_trace',
    'raw_provider_error',
    'secret_value',
    'customer_payload'
];
const REQUIRED_I18N_METADATA = [
    'key',
    'default_locale',
    'arguments',
    'owner',
    'fallback_policy'
];
const FORBIDDEN_I18N_OWNERSHIP = [
    'translation_runtime',
    'provider_i18n_sdk',
    'product_copy_final_approval'
];
const REQUIRED_GLOSSARY_METADATA = [
    'id',
    'canonical_label',
    'status',
    'visibility',
    'aliases',
    'match_phrases',
    'locales',
    'owner',
    'interaction'
];
const REQUIRED_GLOSSARY_LOCALE_METADATA = [
    'label',
    'slug',
    'short',
    'translation_status'
];
const FORBIDDEN_GLOSSARY_OWNERSHIP = [
    'glossary_backend_cms',
    'advertising_runtime',
    'product_domain_copy_final_approval',
    'morphology_engine',
    'provider_ad_sdk'
];
const FORBIDDEN_GLOSSARY_VALUES = [
    'private_internal_terms_in_public_manifest',
    'secret_values',
    'internal_urls',
    'raw_customer_payload',
    'hover_trigger_for_public_terms',
    'hover_card_ads'
];
const ALLOWED_CONTRACT_STATUSES = [
    'skeleton',
    'draft',
    'reviewed',
    'active'
];
const ALLOWED_API_CATALOG_STATUSES = [
    'empty-until-service-routes-exist',
    'route-catalog-contract-only'
];
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
    'owner_boundary',
    'tenant_boundary',
    'request_id_required',
    'trace_id_required',
    'session_effect',
    'credential_policy',
    'error_codes'
];
export function validateLibsContracts(contracts, options = {}) {
    const diagnostics = [];
    /**
     * mf:anchor zdp.libs-ts.semantic-validator
     * purpose: Locate the common package semantic gate for package, API, schema, env, event, error, i18n, and glossary drift.
     * search: shared contracts, API handoff, forbidden ownership, metadata, sensitive values
     * invariant: Validation must keep product models, secrets, provider payloads, and final decisions out of common packages.
     * risk: data_consistency, security, secrets
     */
    validatePackageBoundaries(contracts, diagnostics);
    validateApiContractSource(contracts, diagnostics);
    if (options.apiContractsInput !== undefined) {
        validateApiContractInputHandoff(contracts, options.apiContractsInput, diagnostics);
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
function validatePackageBoundaries(contracts, diagnostics) {
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
function validateApiContractSource(contracts, diagnostics) {
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
    requireAll(contracts.apiContractSource.sourceContracts, REQUIRED_API_SOURCE_CONTRACTS, diagnostics, 'LIBS_API_SOURCE_CONTRACT_MISSING', 'contracts/api-contract-source.yaml', 'api_contract_source.source_contracts');
    requireAll(contracts.apiContractSource.sourceContracts, REQUIRED_CALCULATOR_SOURCE_CONTRACTS, diagnostics, 'LIBS_CALCULATOR_SOURCE_CONTRACT_MISSING', 'contracts/api-contract-source.yaml', 'api_contract_source.source_contracts');
    requireAll(contracts.apiContractSource.consumedByPackages, REQUIRED_API_SOURCE_PACKAGES, diagnostics, 'LIBS_API_SOURCE_PACKAGE_MISSING', 'contracts/api-contract-source.yaml', 'api_contract_source.consumed_by_packages');
    requireAll(contracts.apiContractSource.requiredHandoffMetadata, REQUIRED_API_SOURCE_HANDOFF_METADATA, diagnostics, 'LIBS_API_SOURCE_METADATA_MISSING', 'contracts/api-contract-source.yaml', 'api_contract_source.required_handoff_metadata');
    requireAll(contracts.apiContractSource.mustNotOwn, REQUIRED_API_SOURCE_FORBIDDEN_OWNERSHIP, diagnostics, 'LIBS_API_SOURCE_FORBIDDEN_OWNERSHIP_MISSING', 'contracts/api-contract-source.yaml', 'api_contract_source.must_not_own');
    requireAll(contracts.apiContractSource.forbiddenValues, REQUIRED_API_SOURCE_FORBIDDEN_VALUES, diagnostics, 'LIBS_API_SOURCE_FORBIDDEN_VALUE_MISSING', 'contracts/api-contract-source.yaml', 'api_contract_source.forbidden_values');
}
function validateApiContractInputHandoff(contracts, apiContractsInput, diagnostics) {
    const source = contracts.apiContractSource;
    const route = apiContractsInput.route;
    const errorEnvelope = apiContractsInput.errorEnvelope;
    const webhook = apiContractsInput.webhook;
    const sdkInput = apiContractsInput.sdkGenerationInput;
    const apiCatalog = apiContractsInput.apiCatalog;
    const calculatorCatalog = apiContractsInput.calculatorCatalog;
    const calculatorConformance = apiContractsInput.calculatorConformance;
    requireAll(source.sourceContracts, REQUIRED_API_SOURCE_CONTRACTS, diagnostics, 'LIBS_API_INPUT_SOURCE_CONTRACT_MISSING', 'contracts/api-contract-source.yaml', 'api_contract_source.source_contracts');
    requireAll(source.sourceContracts, REQUIRED_CALCULATOR_SOURCE_CONTRACTS, diagnostics, 'LIBS_API_INPUT_CALCULATOR_SOURCE_CONTRACT_MISSING', 'contracts/api-contract-source.yaml', 'api_contract_source.source_contracts');
    requireAll(sdkInput.sourceContracts, REQUIRED_API_SOURCE_CONTRACTS, diagnostics, 'LIBS_API_INPUT_SDK_SOURCE_CONTRACT_MISSING', '../zdp-api-contracts/contracts/sdk-generation-input.yaml', 'sdk_generation_input.source_contracts');
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
    validateAllowedString({
        actual: apiCatalog.status,
        allowed: ALLOWED_API_CATALOG_STATUSES,
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
    requireAll(route.requiredPerRoute, [
        'resource',
        'action',
        'method',
        'path',
        'auth_required',
        'permission_check',
        'audit_event',
        'idempotency',
        'owner_boundary',
        'tenant_boundary',
        'request_id_required',
        'trace_id_required',
        'session_effect',
        'credential_policy',
        'success_statuses',
        'error_codes'
    ], diagnostics, 'LIBS_API_INPUT_ROUTE_METADATA_MISSING', '../zdp-api-contracts/contracts/route-contract.yaml', 'route_contract.required_per_route');
    requireAll(sdkInput.requiredRouteMetadata, [
        'operation_id',
        'resource',
        'action',
        'method',
        'path',
        'request_schema_ref',
        'response_schema_ref',
        'auth_required',
        'permission_check',
        'audit_event',
        'idempotency',
        'owner_boundary',
        'tenant_boundary',
        'request_id_required',
        'trace_id_required',
        'session_effect',
        'credential_policy',
        'success_statuses',
        'error_codes'
    ], diagnostics, 'LIBS_API_INPUT_SDK_ROUTE_METADATA_MISSING', '../zdp-api-contracts/contracts/sdk-generation-input.yaml', 'sdk_generation_input.required_route_metadata');
    requireAll(errorEnvelope.requiredFields, ['code', 'message', 'request_id', 'trace_id'], diagnostics, 'LIBS_API_INPUT_ERROR_FIELD_MISSING', '../zdp-api-contracts/contracts/error-envelope.yaml', 'error_envelope.required_fields');
    requireAll(sdkInput.requiredErrorMetadata, [
        'code',
        'message',
        'request_id',
        'trace_id',
        'retry_after_seconds',
        'documentation_url'
    ], diagnostics, 'LIBS_API_INPUT_SDK_ERROR_METADATA_MISSING', '../zdp-api-contracts/contracts/sdk-generation-input.yaml', 'sdk_generation_input.required_error_metadata');
    requireAll(webhook.requiredControls, [
        'event_id',
        'event_type',
        'schema_version',
        'signature_verification',
        'idempotency_key',
        'replay_policy',
        'dead_letter_policy'
    ], diagnostics, 'LIBS_API_INPUT_WEBHOOK_CONTROL_MISSING', '../zdp-api-contracts/contracts/webhook-contract.yaml', 'webhook_contract.required_controls');
    requireAll(sdkInput.requiredWebhookMetadata, [
        'event_id',
        'event_type',
        'schema_version',
        'signature_verification',
        'idempotency_key',
        'replay_policy',
        'dead_letter_policy'
    ], diagnostics, 'LIBS_API_INPUT_SDK_WEBHOOK_METADATA_MISSING', '../zdp-api-contracts/contracts/sdk-generation-input.yaml', 'sdk_generation_input.required_webhook_metadata');
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
    requireAll(apiCatalog.routeDefinitionRequiredFields, REQUIRED_API_CATALOG_ROUTE_FIELDS, diagnostics, 'LIBS_API_INPUT_CATALOG_ROUTE_FIELD_MISSING', '../zdp-api-contracts/contracts/apis/catalog.yaml', 'api_catalog.route_definition_required_fields');
    requireAll(apiCatalog.routeDefinitionRequiredFields, sdkInput.requiredRouteMetadata, diagnostics, 'LIBS_API_INPUT_CATALOG_SDK_METADATA_MISSING', '../zdp-api-contracts/contracts/apis/catalog.yaml', 'api_catalog.route_definition_required_fields');
    requireAll(apiCatalog.forbiddenValues, sdkInput.forbiddenValues, diagnostics, 'LIBS_API_INPUT_CATALOG_FORBIDDEN_VALUE_MISSING', '../zdp-api-contracts/contracts/apis/catalog.yaml', 'api_catalog.forbidden_values');
    requireAll(route.forbiddenShapes, source.forbiddenValues, diagnostics, 'LIBS_API_INPUT_ROUTE_FORBIDDEN_VALUE_MISSING', '../zdp-api-contracts/contracts/route-contract.yaml', 'route_contract.forbidden_shapes');
    requireAll(errorEnvelope.forbiddenFields, source.forbiddenValues, diagnostics, 'LIBS_API_INPUT_ERROR_FORBIDDEN_VALUE_MISSING', '../zdp-api-contracts/contracts/error-envelope.yaml', 'error_envelope.forbidden_fields');
    requireAll(sdkInput.forbiddenValues, source.forbiddenValues, diagnostics, 'LIBS_API_INPUT_SDK_FORBIDDEN_VALUE_MISSING', '../zdp-api-contracts/contracts/sdk-generation-input.yaml', 'sdk_generation_input.forbidden_values');
    requireAll(combineValues([
        route.forbiddenShapes,
        errorEnvelope.forbiddenFields,
        webhook.forbiddenControls,
        sdkInput.forbiddenValues
    ]), REQUIRED_API_SOURCE_FORBIDDEN_VALUES, diagnostics, 'LIBS_API_INPUT_FORBIDDEN_VALUE_MISSING', '../zdp-api-contracts/contracts/sdk-generation-input.yaml', 'api_contracts.forbidden_values');
    validateCalculatorInputHandoff(calculatorCatalog, calculatorConformance, diagnostics);
}
function validateCalculatorInputHandoff(catalog, conformance, diagnostics) {
    validateAllowedString({
        actual: catalog.status,
        allowed: ['draft'],
        diagnostics,
        code: 'LIBS_CALCULATOR_CATALOG_STATUS_DRIFT',
        file: '../zdp-api-contracts/contracts/calculators/catalog.yaml',
        path: 'calculator_contract.status',
        label: 'Calculator catalog status'
    });
    if (catalog.contractVersion !== CALCULATOR_CONTRACT_VERSION) {
        diagnostics.push({
            code: 'LIBS_CALCULATOR_CONTRACT_VERSION_DRIFT',
            file: '../zdp-api-contracts/contracts/calculators/catalog.yaml',
            path: 'calculator_contract.contract_version',
            message: `Calculator contract version must stay \`${CALCULATOR_CONTRACT_VERSION}\` for this engine release.`
        });
    }
    for (const calculatorId of REVIEWED_CALCULATOR_IDS) {
        const definition = catalog.definitions.find((candidate) => candidate.id === calculatorId);
        if (!definition) {
            diagnostics.push({
                code: 'LIBS_CALCULATOR_DEFINITION_MISSING',
                file: '../zdp-api-contracts/contracts/calculators/catalog.yaml',
                path: 'definitions',
                message: `Calculator engine requires definition \`${calculatorId}\`.`
            });
            continue;
        }
        const requiredEngineVersion = CALCULATOR_REQUIRED_ENGINE_VERSION[calculatorId];
        const requiredPrecisionPolicy = calculatorId === 'date-difference' || calculatorId === 'age'
            ? 'exact_integer_calendar_days_years_0001_to_9999'
            : CALCULATOR_PRECISION_POLICY;
        const requiredRoundingPolicy = calculatorId === 'date-difference' || calculatorId === 'age'
            ? 'not_applicable_exact_integer'
            : CALCULATOR_ROUNDING_POLICY;
        if (definition.lifecycleStatus !== 'reviewed' ||
            definition.contractVersion !== CALCULATOR_CONTRACT_VERSION ||
            !definition.compatibleEngineVersions.includes(requiredEngineVersion) ||
            definition.precisionPolicy !== requiredPrecisionPolicy ||
            definition.roundingPolicy !== requiredRoundingPolicy) {
            diagnostics.push({
                code: 'LIBS_CALCULATOR_DEFINITION_POLICY_DRIFT',
                file: '../zdp-api-contracts/contracts/calculators/catalog.yaml',
                path: `definitions.${calculatorId}`,
                message: `Calculator \`${calculatorId}\` must keep its reviewed 1.0.0 precision and rounding policy for engine ${requiredEngineVersion}.`
            });
        }
        const requiredErrorCodes = CALCULATOR_REQUIRED_ERROR_CODES[calculatorId];
        for (const errorCode of requiredErrorCodes) {
            if (!definition.errorCodes.includes(errorCode)) {
                diagnostics.push({
                    code: 'LIBS_CALCULATOR_ERROR_CODE_DRIFT',
                    file: '../zdp-api-contracts/contracts/calculators/catalog.yaml',
                    path: `definitions.${calculatorId}.error_codes`,
                    message: `Calculator \`${calculatorId}\` must declare engine error \`${errorCode}\`.`
                });
            }
        }
    }
    if (conformance.contractVersion !== CALCULATOR_CONTRACT_VERSION ||
        conformance.engineVersionRange !== '0.x' ||
        conformance.decimalInputPolicy !== 'canonical_ascii_decimal_string' ||
        conformance.maxInputDigits !== 1000 ||
        conformance.maxDecimalPlaces !== 100 ||
        conformance.roundingMode !== 'half_away_from_zero') {
        diagnostics.push({
            code: 'LIBS_CALCULATOR_CONFORMANCE_POLICY_DRIFT',
            file: '../zdp-api-contracts/contracts/calculators/conformance.yaml',
            path: 'calculator_conformance',
            message: 'Calculator conformance metadata must match the engine decimal limits and rounding mode.'
        });
    }
    for (const calculatorId of REVIEWED_CALCULATOR_IDS) {
        if (!conformance.cases.some((testCase) => testCase.calculatorId === calculatorId)) {
            diagnostics.push({
                code: 'LIBS_CALCULATOR_CONFORMANCE_CASE_MISSING',
                file: '../zdp-api-contracts/contracts/calculators/conformance.yaml',
                path: 'cases',
                message: `Calculator \`${calculatorId}\` must have shared conformance cases.`
            });
        }
    }
}
function validateSchemaContract(contracts, diagnostics) {
    validateAllowedStatus({
        actual: contracts.schema.status,
        diagnostics,
        code: 'LIBS_SCHEMA_STATUS_INVALID',
        file: 'contracts/schema-contract.yaml',
        path: 'schema_contract.status',
        label: 'Schema contract status'
    });
    requireAll(contracts.schema.requiredMetadata, REQUIRED_SCHEMA_METADATA, diagnostics, 'LIBS_SCHEMA_METADATA_MISSING', 'contracts/schema-contract.yaml', 'schema_contract.required_metadata');
    requireAll(contracts.schema.generationTargets, REQUIRED_SCHEMA_TARGETS, diagnostics, 'LIBS_SCHEMA_TARGET_MISSING', 'contracts/schema-contract.yaml', 'schema_contract.generation_targets');
    requireAll(contracts.schema.forbiddenOwnership, FORBIDDEN_SCHEMA_OWNERSHIP, diagnostics, 'LIBS_SCHEMA_FORBIDDEN_OWNERSHIP_MISSING', 'contracts/schema-contract.yaml', 'schema_contract.forbidden_ownership');
}
function validateEnvContract(contracts, diagnostics) {
    requireAll(contracts.env.requiredMetadata, REQUIRED_ENV_METADATA, diagnostics, 'LIBS_ENV_METADATA_MISSING', 'contracts/env-contract.yaml', 'env_contract.required_metadata');
    requireAll(contracts.env.forbiddenValues, FORBIDDEN_ENV_VALUES, diagnostics, 'LIBS_ENV_FORBIDDEN_VALUE_MISSING', 'contracts/env-contract.yaml', 'env_contract.forbidden_values');
}
function validateEventContract(contracts, diagnostics) {
    validateAllowedStatus({
        actual: contracts.event.status,
        diagnostics,
        code: 'LIBS_EVENT_STATUS_INVALID',
        file: 'contracts/event-contract.yaml',
        path: 'event_contract.status',
        label: 'Event contract status'
    });
    requireAll(contracts.event.requiredMetadata, REQUIRED_EVENT_METADATA, diagnostics, 'LIBS_EVENT_METADATA_MISSING', 'contracts/event-contract.yaml', 'event_contract.required_metadata');
    requireAll(contracts.event.requiredTraceFields, REQUIRED_EVENT_TRACE_FIELDS, diagnostics, 'LIBS_EVENT_TRACE_FIELD_MISSING', 'contracts/event-contract.yaml', 'event_contract.required_trace_fields');
    requireAll(contracts.event.forbiddenValues, FORBIDDEN_EVENT_VALUES, diagnostics, 'LIBS_EVENT_FORBIDDEN_VALUE_MISSING', 'contracts/event-contract.yaml', 'event_contract.forbidden_values');
}
function validateErrorContract(contracts, diagnostics) {
    requireAll(contracts.error.requiredFields, REQUIRED_ERROR_FIELDS, diagnostics, 'LIBS_ERROR_REQUIRED_FIELD_MISSING', 'contracts/error-contract.yaml', 'error_contract.required_fields');
    requireAll(contracts.error.forbiddenFields, FORBIDDEN_ERROR_FIELDS, diagnostics, 'LIBS_ERROR_FORBIDDEN_FIELD_MISSING', 'contracts/error-contract.yaml', 'error_contract.forbidden_fields');
}
function validateI18nContract(contracts, diagnostics) {
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
    requireAll(contracts.i18n.requiredMetadata, REQUIRED_I18N_METADATA, diagnostics, 'LIBS_I18N_METADATA_MISSING', 'contracts/i18n-contract.yaml', 'i18n_contract.required_metadata');
    requireAll(contracts.i18n.forbiddenOwnership, FORBIDDEN_I18N_OWNERSHIP, diagnostics, 'LIBS_I18N_FORBIDDEN_OWNERSHIP_MISSING', 'contracts/i18n-contract.yaml', 'i18n_contract.forbidden_ownership');
}
function validateGlossaryContract(contracts, diagnostics) {
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
    requireAll(contracts.glossary.requiredMetadata, REQUIRED_GLOSSARY_METADATA, diagnostics, 'LIBS_GLOSSARY_METADATA_MISSING', 'contracts/glossary-contract.yaml', 'glossary_contract.required_metadata');
    requireAll(contracts.glossary.requiredLocaleMetadata, REQUIRED_GLOSSARY_LOCALE_METADATA, diagnostics, 'LIBS_GLOSSARY_LOCALE_METADATA_MISSING', 'contracts/glossary-contract.yaml', 'glossary_contract.required_locale_metadata');
    requireAll(contracts.glossary.forbiddenOwnership, FORBIDDEN_GLOSSARY_OWNERSHIP, diagnostics, 'LIBS_GLOSSARY_FORBIDDEN_OWNERSHIP_MISSING', 'contracts/glossary-contract.yaml', 'glossary_contract.forbidden_ownership');
    requireAll(contracts.glossary.forbiddenValues, FORBIDDEN_GLOSSARY_VALUES, diagnostics, 'LIBS_GLOSSARY_FORBIDDEN_VALUE_MISSING', 'contracts/glossary-contract.yaml', 'glossary_contract.forbidden_values');
}
function requireAll(actual, expected, diagnostics, code, file, path) {
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
function validateAllowedString(input) {
    if (input.actual !== null && input.allowed.includes(input.actual)) {
        return;
    }
    input.diagnostics.push({
        code: input.code,
        file: input.file,
        path: input.path,
        message: `${input.label} must be one of ${formatAllowedValues(input.allowed)}.`
    });
}
function validateAllowedStatus(input) {
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
function validateExactNumber(input) {
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
function combineValues(valueGroups) {
    return Array.from(new Set(valueGroups.flat()));
}
function formatAllowedStatuses() {
    return formatAllowedValues(ALLOWED_CONTRACT_STATUSES);
}
function formatAllowedValues(values) {
    return values.map((value) => `\`${value}\``).join(', ');
}
function isAllowedContractStatus(status) {
    return ALLOWED_CONTRACT_STATUSES.includes(status);
}
//# sourceMappingURL=validator-base.js.map