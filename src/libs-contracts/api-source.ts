import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  ApiCatalogInputContract,
  ApiContractsInput,
  ApiErrorEnvelopeContract,
  ApiRouteContract,
  ApiSdkGenerationInputContract,
  ApiWebhookContract
} from './types';

const ROUTE_CONTRACT_FILE = 'contracts/route-contract.yaml';
const ERROR_ENVELOPE_FILE = 'contracts/error-envelope.yaml';
const WEBHOOK_CONTRACT_FILE = 'contracts/webhook-contract.yaml';
const SDK_GENERATION_INPUT_FILE = 'contracts/sdk-generation-input.yaml';
const API_CATALOG_FILE = 'contracts/apis/catalog.yaml';

export async function loadApiContractsInput(
  apiContractsRoot: string
): Promise<ApiContractsInput> {
  const [route, errorEnvelope, webhook, sdkGenerationInput, apiCatalog] =
    await Promise.all([
      loadRouteContract(apiContractsRoot),
      loadErrorEnvelopeContract(apiContractsRoot),
      loadWebhookContract(apiContractsRoot),
      loadSdkGenerationInputContract(apiContractsRoot),
      loadApiCatalogInputContract(apiContractsRoot)
    ]);

  return {
    route,
    errorEnvelope,
    webhook,
    sdkGenerationInput,
    apiCatalog
  };
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
