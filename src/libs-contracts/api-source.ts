import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isRecord } from '../internal/record.js';
import type {
  ApiCatalogInputContract,
  ApiCalculatorCatalogInputContract,
  ApiCalculatorConformanceInputContract,
  ApiContractsInput,
  ApiErrorEnvelopeContract,
  ApiRouteContract,
  ApiSdkGenerationInputContract,
  ApiWebhookContract
} from './types.js';

const ROUTE_CONTRACT_FILE = 'contracts/route-contract.yaml';
const ERROR_ENVELOPE_FILE = 'contracts/error-envelope.yaml';
const WEBHOOK_CONTRACT_FILE = 'contracts/webhook-contract.yaml';
const SDK_GENERATION_INPUT_FILE = 'contracts/sdk-generation-input.yaml';
const API_CATALOG_FILE = 'contracts/apis/catalog.yaml';
const CALCULATOR_CATALOG_FILE = 'contracts/calculators/catalog.yaml';
const CALCULATOR_CONFORMANCE_FILE = 'contracts/calculators/conformance.yaml';

export interface ApiContractLoadFailure {
  readonly file: string;
  readonly message: string;
}

export class ApiContractLoadError extends Error {
  readonly failures: readonly ApiContractLoadFailure[];

  constructor(failures: readonly ApiContractLoadFailure[]) {
    super(
      [
        `Failed to load ${failures.length} API contract input file(s):`,
        ...failures.map(
          (failure) => `- ${failure.file}: ${failure.message}`
        )
      ].join('\n')
    );
    this.name = 'ApiContractLoadError';
    this.failures = failures;
  }
}

export async function loadApiContractsInput(
  apiContractsRoot: string
): Promise<ApiContractsInput> {
  const [
    route,
    errorEnvelope,
    webhook,
    sdkGenerationInput,
    apiCatalog,
    calculatorCatalog,
    calculatorConformance
  ] = await Promise.allSettled([
    loadRouteContract(apiContractsRoot),
    loadErrorEnvelopeContract(apiContractsRoot),
    loadWebhookContract(apiContractsRoot),
    loadSdkGenerationInputContract(apiContractsRoot),
    loadApiCatalogInputContract(apiContractsRoot),
    loadCalculatorCatalogInputContract(apiContractsRoot),
    loadCalculatorConformanceInputContract(apiContractsRoot)
  ]);

  const files = [
    ROUTE_CONTRACT_FILE,
    ERROR_ENVELOPE_FILE,
    WEBHOOK_CONTRACT_FILE,
    SDK_GENERATION_INPUT_FILE,
    API_CATALOG_FILE,
    CALCULATOR_CATALOG_FILE,
    CALCULATOR_CONFORMANCE_FILE
  ] as const;
  const results = [
    route,
    errorEnvelope,
    webhook,
    sdkGenerationInput,
    apiCatalog,
    calculatorCatalog,
    calculatorConformance
  ] as const;
  const failures = results.flatMap((result, index) =>
    result.status === 'rejected'
      ? [
          {
            file: files[index] ?? 'unknown API contract input',
            message:
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason)
          }
        ]
      : []
  );

  if (failures.length > 0) {
    throw new ApiContractLoadError(failures);
  }

  return {
    route: requireFulfilled(route),
    errorEnvelope: requireFulfilled(errorEnvelope),
    webhook: requireFulfilled(webhook),
    sdkGenerationInput: requireFulfilled(sdkGenerationInput),
    apiCatalog: requireFulfilled(apiCatalog),
    calculatorCatalog: requireFulfilled(calculatorCatalog),
    calculatorConformance: requireFulfilled(calculatorConformance)
  };
}

function requireFulfilled<T>(result: PromiseSettledResult<T>): T {
  if (result.status === 'fulfilled') {
    return result.value;
  }

  throw new Error(
    'API contract input remained rejected after load failures were aggregated.'
  );
}

async function loadRouteContract(
  apiContractsRoot: string
): Promise<ApiRouteContract> {
  const root = await readNamedContract(
    apiContractsRoot,
    ROUTE_CONTRACT_FILE,
    'route_contract'
  );

  return {
    status: readString(root, 'status'),
    requiredPerRoute: readStringArray(root, 'required_per_route'),
    allowedMethods: readStringArray(root, 'allowed_methods'),
    allowedSuccessStatuses: readNumberArray(root, 'allowed_success_statuses'),
    forbiddenShapes: readStringArray(root, 'forbidden_shapes')
  };
}

async function loadErrorEnvelopeContract(
  apiContractsRoot: string
): Promise<ApiErrorEnvelopeContract> {
  const root = await readNamedContract(
    apiContractsRoot,
    ERROR_ENVELOPE_FILE,
    'error_envelope'
  );

  return {
    schemaVersion: readNumber(root, 'schema_version'),
    requiredFields: readStringArray(root, 'required_fields'),
    optionalFields: readStringArray(root, 'optional_fields'),
    forbiddenFields: readStringArray(root, 'forbidden_fields')
  };
}

async function loadWebhookContract(
  apiContractsRoot: string
): Promise<ApiWebhookContract> {
  const root = await readNamedContract(
    apiContractsRoot,
    WEBHOOK_CONTRACT_FILE,
    'webhook_contract'
  );

  return {
    status: readString(root, 'status'),
    requiredControls: readStringArray(root, 'required_controls'),
    forbiddenControls: readStringArray(root, 'forbidden_controls')
  };
}

async function loadSdkGenerationInputContract(
  apiContractsRoot: string
): Promise<ApiSdkGenerationInputContract> {
  const root = await readNamedContract(
    apiContractsRoot,
    SDK_GENERATION_INPUT_FILE,
    'sdk_generation_input'
  );

  return {
    status: readString(root, 'status'),
    sourceContracts: readStringArray(root, 'source_contracts'),
    generationTargets: readStringArray(root, 'generation_targets'),
    allowedGenerationTargets: readStringArray(root, 'allowed_generation_targets'),
    requiredRouteMetadata: readStringArray(root, 'required_route_metadata'),
    requiredErrorMetadata: readStringArray(root, 'required_error_metadata'),
    requiredWebhookMetadata: readStringArray(root, 'required_webhook_metadata'),
    forbiddenOwnership: readStringArray(root, 'forbidden_ownership'),
    forbiddenValues: readStringArray(root, 'forbidden_values')
  };
}

async function loadApiCatalogInputContract(
  apiContractsRoot: string
): Promise<ApiCatalogInputContract> {
  const root = await readNamedContract(
    apiContractsRoot,
    API_CATALOG_FILE,
    'api_catalog'
  );

  return {
    status: readString(root, 'status'),
    routeDefinitionRequiredFields: readStringArray(
      root,
      'route_definition_required_fields'
    ),
    forbiddenValues: readStringArray(root, 'forbidden_values')
  };
}

async function loadCalculatorCatalogInputContract(
  apiContractsRoot: string
): Promise<ApiCalculatorCatalogInputContract> {
  const source = await readFile(
    join(apiContractsRoot, CALCULATOR_CATALOG_FILE),
    'utf8'
  );
  const document = parseYamlRecord(source);
  const contract = isRecord(document.calculator_contract)
    ? document.calculator_contract
    : {};
  const definitions = readRecordArray(document, 'definitions');

  return {
    status: readString(contract, 'status'),
    contractVersion: readString(contract, 'contract_version'),
    definitions: definitions.map((definition) => ({
      id: readString(definition, 'id'),
      lifecycleStatus: readString(definition, 'lifecycle_status'),
      contractVersion: readString(definition, 'contract_version'),
      compatibleEngineVersions: readStringArray(
        definition,
        'compatible_engine_versions'
      ),
      precisionPolicy: readString(definition, 'precision_policy'),
      roundingPolicy: readString(definition, 'rounding_policy'),
      errorCodes: readStringArray(definition, 'error_codes')
    }))
  };
}

async function loadCalculatorConformanceInputContract(
  apiContractsRoot: string
): Promise<ApiCalculatorConformanceInputContract> {
  const source = await readFile(
    join(apiContractsRoot, CALCULATOR_CONFORMANCE_FILE),
    'utf8'
  );
  const document = parseYamlRecord(source);
  const contract = isRecord(document.calculator_conformance)
    ? document.calculator_conformance
    : {};

  return {
    contractVersion: readString(contract, 'contract_version'),
    engineVersionRange: readString(contract, 'engine_version_range'),
    decimalInputPolicy: readString(contract, 'decimal_input_policy'),
    maxInputDigits: readNumber(contract, 'max_input_digits'),
    maxDecimalPlaces: readNumber(contract, 'max_decimal_places'),
    roundingMode: readString(contract, 'rounding_mode'),
    cases: readRecordArray(document, 'cases').map((testCase) => ({
      id: readString(testCase, 'id'),
      calculatorId: readString(testCase, 'calculator_id')
    }))
  };
}

async function readNamedContract(
  root: string,
  file: string,
  contractName: string
): Promise<Record<string, unknown>> {
  const source = await readFile(join(root, file), 'utf8');
  const document = parseYamlRecord(source);
  const contract = document[contractName];

  return isRecord(contract) ? contract : {};
}

function parseYamlRecord(source: string): Record<string, unknown> {
  const value = Bun.YAML.parse(source) as unknown;

  return isRecord(value) ? value : {};
}

function readString(
  record: Record<string, unknown>,
  field: string
): string | null {
  const value = record[field];

  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function readNumber(
  record: Record<string, unknown>,
  field: string
): number | null {
  const value = record[field];

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readNumberArray(
  record: Record<string, unknown>,
  field: string
): readonly number[] {
  const value = record[field];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) =>
    typeof entry === 'number' && Number.isInteger(entry) ? [entry] : []
  );
}

function readStringArray(
  record: Record<string, unknown>,
  field: string
): readonly string[] {
  const value = record[field];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) =>
    typeof entry === 'string' && entry.trim().length > 0 ? [entry.trim()] : []
  );
}

function readRecordArray(
  record: Record<string, unknown>,
  field: string
): readonly Record<string, unknown>[] {
  const value = record[field];
  return Array.isArray(value) ? value.filter(isRecord) : [];
}
