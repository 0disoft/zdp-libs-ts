import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type {
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

export function loadApiContractsInput(
  apiContractsRoot: string
): ApiContractsInput {
  return {
    route: loadRouteContract(apiContractsRoot),
    errorEnvelope: loadErrorEnvelopeContract(apiContractsRoot),
    webhook: loadWebhookContract(apiContractsRoot),
    sdkGenerationInput: loadSdkGenerationInputContract(apiContractsRoot)
  };
}

function loadRouteContract(apiContractsRoot: string): ApiRouteContract {
  const root = readNamedContract(apiContractsRoot, ROUTE_CONTRACT_FILE, 'route_contract');

  return {
    status: readString(root, 'status'),
    requiredPerRoute: readStringArray(root, 'required_per_route'),
    forbiddenShapes: readStringArray(root, 'forbidden_shapes')
  };
}

function loadErrorEnvelopeContract(
  apiContractsRoot: string
): ApiErrorEnvelopeContract {
  const root = readNamedContract(
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

function loadWebhookContract(apiContractsRoot: string): ApiWebhookContract {
  const root = readNamedContract(
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

function loadSdkGenerationInputContract(
  apiContractsRoot: string
): ApiSdkGenerationInputContract {
  const root = readNamedContract(
    apiContractsRoot,
    SDK_GENERATION_INPUT_FILE,
    'sdk_generation_input'
  );

  return {
    status: readString(root, 'status'),
    sourceContracts: readStringArray(root, 'source_contracts'),
    generationTargets: readStringArray(root, 'generation_targets'),
    requiredRouteMetadata: readStringArray(root, 'required_route_metadata'),
    requiredErrorMetadata: readStringArray(root, 'required_error_metadata'),
    requiredWebhookMetadata: readStringArray(root, 'required_webhook_metadata'),
    forbiddenOwnership: readStringArray(root, 'forbidden_ownership'),
    forbiddenValues: readStringArray(root, 'forbidden_values')
  };
}

function readNamedContract(
  root: string,
  file: string,
  contractName: string
): Record<string, unknown> {
  const source = readFileSync(join(root, file), 'utf8');
  const document = parseYamlRecord(source);
  const contract = document[contractName];

  return isRecord(contract) ? contract : {};
}

function parseYamlRecord(source: string): Record<string, unknown> {
  const value = parse(source) as unknown;

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
