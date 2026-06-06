import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  ApiContractSourceContract,
  EnvContract,
  ErrorContract,
  EventContract,
  GlossaryContract,
  I18nContract,
  LibsContracts,
  PackageBoundariesContract,
  PackageBoundary,
  SchemaContract
} from './types';

interface ContractLoadFailure {
  readonly name: string;
  readonly file: string;
  readonly message: string;
}

type ContractLoadResult<T> =
  | {
      readonly ok: true;
      readonly name: string;
      readonly file: string;
      readonly value: T;
    }
  | {
      readonly ok: false;
      readonly name: string;
      readonly file: string;
      readonly message: string;
    };

type ContractLoadFailureResult = Extract<
  ContractLoadResult<unknown>,
  { readonly ok: false }
>;

export class LibsContractLoadError extends Error {
  readonly failures: readonly ContractLoadFailure[];

  constructor(failures: readonly ContractLoadFailure[]) {
    super(
      [
        'Libs contract load failed.',
        ...failures.map(
          (failure) => `- ${failure.file}: ${failure.message}`
        )
      ].join('\n')
    );
    this.name = 'LibsContractLoadError';
    this.failures = failures;
  }
}

export async function loadLibsContracts(root = process.cwd()): Promise<LibsContracts> {
  const [
    packageBoundaries,
    apiContractSource,
    env,
    error,
    schema,
    event,
    i18n,
    glossary
  ] =
    await Promise.all([
      loadContract(
        root,
        'package-boundaries',
        'package-boundaries.yaml',
        parsePackageBoundariesContract
      ),
      loadContract(
        root,
        'api-contract-source',
        'api-contract-source.yaml',
        parseApiContractSourceContract
      ),
      loadContract(root, 'env', 'env-contract.yaml', parseEnvContract),
      loadContract(root, 'error', 'error-contract.yaml', parseErrorContract),
      loadContract(root, 'schema', 'schema-contract.yaml', parseSchemaContract),
      loadContract(root, 'event', 'event-contract.yaml', parseEventContract),
      loadContract(root, 'i18n', 'i18n-contract.yaml', parseI18nContract),
      loadContract(
        root,
        'glossary',
        'glossary-contract.yaml',
        parseGlossaryContract
      )
    ]);

  const results = [
    packageBoundaries,
    apiContractSource,
    env,
    error,
    schema,
    event,
    i18n,
    glossary
  ] as const;
  const failures = results.filter(isContractLoadFailure);
  if (failures.length > 0) {
    throw new LibsContractLoadError(failures);
  }

  return {
    packageBoundaries: requireLoadedContract(packageBoundaries).value,
    apiContractSource: requireLoadedContract(apiContractSource).value,
    env: requireLoadedContract(env).value,
    error: requireLoadedContract(error).value,
    schema: requireLoadedContract(schema).value,
    event: requireLoadedContract(event).value,
    i18n: requireLoadedContract(i18n).value,
    glossary: requireLoadedContract(glossary).value
  };
}

export function parsePackageBoundariesContract(
  source: string
): PackageBoundariesContract {
  const root = parseYamlRecord(source, 'contracts/package-boundaries.yaml');
  const packages = readArray(root, 'packages', 'contracts/package-boundaries.yaml');

  return {
    packages: packages.map((value, index) =>
      parsePackageBoundary(value, `packages[${index}]`)
    )
  };
}

export function parseApiContractSourceContract(
  source: string
): ApiContractSourceContract {
  const root = parseNamedContract(
    source,
    'api_contract_source',
    'contracts/api-contract-source.yaml'
  );

  return {
    status: readString(root, 'status', 'api_contract_source.status'),
    sourceRepo: readString(
      root,
      'source_repo',
      'api_contract_source.source_repo'
    ),
    sourceContracts: readStringArray(
      root,
      'source_contracts',
      'api_contract_source.source_contracts'
    ),
    consumedByPackages: readStringArray(
      root,
      'consumed_by_packages',
      'api_contract_source.consumed_by_packages'
    ),
    requiredHandoffMetadata: readStringArray(
      root,
      'required_handoff_metadata',
      'api_contract_source.required_handoff_metadata'
    ),
    mustNotOwn: readStringArray(
      root,
      'must_not_own',
      'api_contract_source.must_not_own'
    ),
    forbiddenValues: readStringArray(
      root,
      'forbidden_values',
      'api_contract_source.forbidden_values'
    )
  };
}

export function parseEnvContract(source: string): EnvContract {
  const root = parseNamedContract(source, 'env_contract', 'contracts/env-contract.yaml');

  return {
    requiredMetadata: readStringArray(
      root,
      'required_metadata',
      'env_contract.required_metadata'
    ),
    forbiddenValues: readStringArray(
      root,
      'forbidden_values',
      'env_contract.forbidden_values'
    )
  };
}

export function parseErrorContract(source: string): ErrorContract {
  const root = parseNamedContract(source, 'error_contract', 'contracts/error-contract.yaml');

  return {
    requiredFields: readStringArray(
      root,
      'required_fields',
      'error_contract.required_fields'
    ),
    forbiddenFields: readStringArray(
      root,
      'forbidden_fields',
      'error_contract.forbidden_fields'
    )
  };
}

export function parseSchemaContract(source: string): SchemaContract {
  const root = parseNamedContract(
    source,
    'schema_contract',
    'contracts/schema-contract.yaml'
  );

  return {
    status: readString(root, 'status', 'schema_contract.status'),
    requiredMetadata: readStringArray(
      root,
      'required_metadata',
      'schema_contract.required_metadata'
    ),
    generationTargets: readStringArray(
      root,
      'generation_targets',
      'schema_contract.generation_targets'
    ),
    forbiddenOwnership: readStringArray(
      root,
      'forbidden_ownership',
      'schema_contract.forbidden_ownership'
    )
  };
}

export function parseEventContract(source: string): EventContract {
  const root = parseNamedContract(source, 'event_contract', 'contracts/event-contract.yaml');

  return {
    status: readString(root, 'status', 'event_contract.status'),
    requiredMetadata: readStringArray(
      root,
      'required_metadata',
      'event_contract.required_metadata'
    ),
    requiredTraceFields: readStringArray(
      root,
      'required_trace_fields',
      'event_contract.required_trace_fields'
    ),
    forbiddenValues: readStringArray(
      root,
      'forbidden_values',
      'event_contract.forbidden_values'
    )
  };
}

export function parseI18nContract(source: string): I18nContract {
  const root = parseNamedContract(source, 'i18n_contract', 'contracts/i18n-contract.yaml');

  return {
    status: readString(root, 'status', 'i18n_contract.status'),
    messageKeyPattern: readString(
      root,
      'message_key_pattern',
      'i18n_contract.message_key_pattern'
    ),
    requiredMetadata: readStringArray(
      root,
      'required_metadata',
      'i18n_contract.required_metadata'
    ),
    forbiddenOwnership: readStringArray(
      root,
      'forbidden_ownership',
      'i18n_contract.forbidden_ownership'
    )
  };
}

export function parseGlossaryContract(source: string): GlossaryContract {
  const root = parseNamedContract(
    source,
    'glossary_contract',
    'contracts/glossary-contract.yaml'
  );

  return {
    status: readString(root, 'status', 'glossary_contract.status'),
    termIdPattern: readString(
      root,
      'term_id_pattern',
      'glossary_contract.term_id_pattern'
    ),
    requiredMetadata: readStringArray(
      root,
      'required_metadata',
      'glossary_contract.required_metadata'
    ),
    requiredLocaleMetadata: readStringArray(
      root,
      'required_locale_metadata',
      'glossary_contract.required_locale_metadata'
    ),
    forbiddenOwnership: readStringArray(
      root,
      'forbidden_ownership',
      'glossary_contract.forbidden_ownership'
    ),
    forbiddenValues: readStringArray(
      root,
      'forbidden_values',
      'glossary_contract.forbidden_values'
    )
  };
}

function parsePackageBoundary(value: unknown, path: string): PackageBoundary {
  const record = asRecord(value, path);

  return {
    name: readString(record, 'name', `${path}.name`),
    status: readString(record, 'status', `${path}.status`),
    owns: readStringArray(record, 'owns', `${path}.owns`),
    mustNotOwn: readStringArray(record, 'must_not_own', `${path}.must_not_own`)
  };
}

function parseNamedContract(
  source: string,
  name: string,
  file: string
): Record<string, unknown> {
  const root = parseYamlRecord(source, file);
  const value = root[name];

  if (value === undefined) {
    throw new Error(`${file}: missing \`${name}\` root object.`);
  }

  return asRecord(value, name);
}

function parseYamlRecord(source: string, file: string): Record<string, unknown> {
  const value = Bun.YAML.parse(source) as unknown;

  return asRecord(value, file);
}

async function loadContract<T>(
  root: string,
  name: string,
  fileName: string,
  parseContract: (source: string) => T
): Promise<ContractLoadResult<T>> {
  const file = `contracts/${fileName}`;

  try {
    return {
      ok: true,
      name,
      file,
      value: parseContract(await readFile(join(root, file), 'utf8'))
    };
  } catch (error) {
    return {
      ok: false,
      name,
      file,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

function isContractLoadFailure(
  result: ContractLoadResult<unknown>
): result is ContractLoadFailureResult {
  return !result.ok;
}

function requireLoadedContract<T>(
  result: ContractLoadResult<T>
): Extract<ContractLoadResult<T>, { readonly ok: true }> {
  if (!result.ok) {
    throw new LibsContractLoadError([result]);
  }
  return result;
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path}: expected object.`);
  }

  return value as Record<string, unknown>;
}

function readString(
  record: Record<string, unknown>,
  key: string,
  path: string
): string {
  const value = record[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${path}: expected non-empty string.`);
  }

  return value;
}

function readArray(
  record: Record<string, unknown>,
  key: string,
  path: string
): readonly unknown[] {
  const value = record[key];

  if (!Array.isArray(value)) {
    throw new Error(`${path}.${key}: expected array.`);
  }

  return value;
}

function readStringArray(
  record: Record<string, unknown>,
  key: string,
  path: string
): readonly string[] {
  const values = readArray(record, key, path);

  return values.map((value, index) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`${path}[${index}]: expected non-empty string.`);
    }

    return value;
  });
}
