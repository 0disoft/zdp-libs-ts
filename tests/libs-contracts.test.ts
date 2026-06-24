import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'bun:test';
import { loadApiContractsInput } from '../src/libs-contracts/api-source';
import {
  LibsContractLoadError,
  loadLibsContracts,
  parseApiContractSourceContract,
  parseEnvContract,
  parseErrorContract,
  parseEventContract,
  parseGlossaryContract,
  parseI18nContract,
  parsePackageBoundariesContract,
  parseSchemaContract
} from '../src/libs-contracts/parser';
import { validateLibsContracts } from '../src/libs-contracts/validator';
import type { LibsContracts } from '../src/libs-contracts/types';

describe('libs contract checker', () => {
  it('validates the committed libs contracts', async () => {
    const result = validateLibsContracts(loadCommittedContracts(), {
      apiContractsInput: await loadCommittedApiContractsInput()
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it('fails when a required package boundary disappears', () => {
    const contracts = loadCommittedContracts();
    const result = validateLibsContracts({
      ...contracts,
      packageBoundaries: {
        packages: contracts.packageBoundaries.packages.filter(
          (item) => item.name !== '@zdp/event-contracts'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_PACKAGE_MISSING'
    );
  });

  it('fails when API contract source handoff drifts', () => {
    const contracts = loadCommittedContracts();
    const result = validateLibsContracts({
      ...contracts,
      apiContractSource: {
        ...contracts.apiContractSource,
        sourceRepo: 'zdp-libs-ts',
        sourceContracts: contracts.apiContractSource.sourceContracts.filter(
          (item) => item !== 'contracts/sdk-generation-input.yaml'
        ),
        requiredHandoffMetadata:
          contracts.apiContractSource.requiredHandoffMetadata.filter(
            (item) => item !== 'idempotency'
          ),
        forbiddenValues: contracts.apiContractSource.forbiddenValues.filter(
          (item) => item !== 'authorization_header'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_API_SOURCE_REPO_INVALID'
    );
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_API_SOURCE_CONTRACT_MISSING'
    );
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_API_SOURCE_METADATA_MISSING'
    );
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_API_SOURCE_FORBIDDEN_VALUE_MISSING'
    );
  });

  it('fails when API source input no longer carries handoff metadata', async () => {
    const contracts = loadCommittedContracts();
    const apiContractsInput = await loadCommittedApiContractsInput();
    const result = validateLibsContracts(contracts, {
      apiContractsInput: {
        ...apiContractsInput,
        route: {
          ...apiContractsInput.route,
          forbiddenShapes: apiContractsInput.route.forbiddenShapes.filter(
            (item) => item !== 'authorization_header'
          )
        },
        errorEnvelope: {
          ...apiContractsInput.errorEnvelope,
          forbiddenFields: apiContractsInput.errorEnvelope.forbiddenFields.filter(
            (item) => item !== 'authorization_header'
          )
        },
        sdkGenerationInput: {
          ...apiContractsInput.sdkGenerationInput,
          requiredErrorMetadata:
            apiContractsInput.sdkGenerationInput.requiredErrorMetadata.filter(
              (item) => item !== 'trace_id'
            ),
          forbiddenValues: apiContractsInput.sdkGenerationInput.forbiddenValues.filter(
            (item) => item !== 'authorization_header'
          )
        }
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_API_INPUT_SDK_ERROR_METADATA_MISSING'
    );
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_API_INPUT_FORBIDDEN_VALUE_MISSING'
    );
  });

  it('fails when API catalog input no longer mirrors route metadata', async () => {
    const contracts = loadCommittedContracts();
    const apiContractsInput = await loadCommittedApiContractsInput();
    const result = validateLibsContracts(contracts, {
      apiContractsInput: {
        ...apiContractsInput,
        apiCatalog: {
          ...apiContractsInput.apiCatalog,
          routeDefinitionRequiredFields:
            apiContractsInput.apiCatalog.routeDefinitionRequiredFields.filter(
              (item) => item !== 'success_statuses'
            )
        }
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_API_INPUT_CATALOG_ROUTE_FIELD_MISSING'
    );
  });

  it('allows contracts to move through the reviewed lifecycle', () => {
    const contracts = loadCommittedContracts();
    const result = validateLibsContracts({
      ...contracts,
      apiContractSource: {
        ...contracts.apiContractSource,
        status: 'draft'
      },
      schema: {
        ...contracts.schema,
        status: 'reviewed'
      },
      event: {
        ...contracts.event,
        status: 'active'
      },
      i18n: {
        ...contracts.i18n,
        status: 'draft'
      },
      glossary: {
        ...contracts.glossary,
        status: 'reviewed'
      }
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it('accumulates local contract load errors', async () => {
    const root = mkdtempSync(join(tmpdir(), 'zdp-libs-ts-'));
    const contractsRoot = join(root, 'contracts');

    mkdirSync(contractsRoot, { recursive: true });
    writeFileSync(join(contractsRoot, 'package-boundaries.yaml'), 'packages:\n');
    writeFileSync(
      join(contractsRoot, 'api-contract-source.yaml'),
      'api_contract_source:\n'
    );
    writeFileSync(join(contractsRoot, 'env-contract.yaml'), 'env_contract:\n');
    writeFileSync(join(contractsRoot, 'error-contract.yaml'), 'error_contract:\n');
    writeFileSync(join(contractsRoot, 'schema-contract.yaml'), 'schema_contract:\n');
    writeFileSync(join(contractsRoot, 'event-contract.yaml'), 'event_contract:\n');
    writeFileSync(join(contractsRoot, 'i18n-contract.yaml'), 'i18n_contract:\n');
    writeFileSync(join(contractsRoot, 'glossary-contract.yaml'), 'glossary_contract:\n');

    await expect(loadLibsContracts(root)).rejects.toThrow(LibsContractLoadError);

    try {
      await loadLibsContracts(root);
    } catch (error) {
      expect(error).toBeInstanceOf(LibsContractLoadError);
      expect((error as LibsContractLoadError).failures.length).toBeGreaterThan(1);
    }
  });

  it('fails when schema contracts stop targeting Rust generation', () => {
    const contracts = loadCommittedContracts();
    const result = validateLibsContracts({
      ...contracts,
      schema: {
        ...contracts.schema,
        generationTargets: contracts.schema.generationTargets.filter(
          (item) => item !== 'rust'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_SCHEMA_TARGET_MISSING'
    );
  });

  it('fails when env contracts allow provider tokens as values', () => {
    const contracts = loadCommittedContracts();
    const result = validateLibsContracts({
      ...contracts,
      env: {
        ...contracts.env,
        forbiddenValues: contracts.env.forbiddenValues.filter(
          (item) => item !== 'provider tokens'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_ENV_FORBIDDEN_VALUE_MISSING'
    );
  });

  it('fails when event contracts drop trace fields', () => {
    const contracts = loadCommittedContracts();
    const result = validateLibsContracts({
      ...contracts,
      event: {
        ...contracts.event,
        requiredTraceFields: contracts.event.requiredTraceFields.filter(
          (item) => item !== 'trace_id'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_EVENT_TRACE_FIELD_MISSING'
    );
  });

  it('fails when error contracts allow raw provider errors', () => {
    const contracts = loadCommittedContracts();
    const result = validateLibsContracts({
      ...contracts,
      error: {
        ...contracts.error,
        forbiddenFields: contracts.error.forbiddenFields.filter(
          (item) => item !== 'raw_provider_error'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_ERROR_FORBIDDEN_FIELD_MISSING'
    );
  });

  it('fails when i18n contracts become a translation runtime', () => {
    const contracts = loadCommittedContracts();
    const result = validateLibsContracts({
      ...contracts,
      i18n: {
        ...contracts.i18n,
        forbiddenOwnership: contracts.i18n.forbiddenOwnership.filter(
          (item) => item !== 'translation_runtime'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_I18N_FORBIDDEN_OWNERSHIP_MISSING'
    );
  });

  it('fails when glossary contracts lose public manifest safety metadata', () => {
    const contracts = loadCommittedContracts();
    const result = validateLibsContracts({
      ...contracts,
      glossary: {
        ...contracts.glossary,
        requiredMetadata: contracts.glossary.requiredMetadata.filter(
          (item) => item !== 'visibility'
        ),
        requiredLocaleMetadata:
          contracts.glossary.requiredLocaleMetadata.filter(
            (item) => item !== 'translation_status'
          ),
        forbiddenValues: contracts.glossary.forbiddenValues.filter(
          (item) => item !== 'private_internal_terms_in_public_manifest'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_GLOSSARY_METADATA_MISSING'
    );
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_GLOSSARY_LOCALE_METADATA_MISSING'
    );
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'LIBS_GLOSSARY_FORBIDDEN_VALUE_MISSING'
    );
  });
});

function loadCommittedContracts(): LibsContracts {
  return {
    packageBoundaries: parsePackageBoundariesContract(readContract('package-boundaries.yaml')),
    apiContractSource: parseApiContractSourceContract(
      readContract('api-contract-source.yaml')
    ),
    env: parseEnvContract(readContract('env-contract.yaml')),
    error: parseErrorContract(readContract('error-contract.yaml')),
    schema: parseSchemaContract(readContract('schema-contract.yaml')),
    event: parseEventContract(readContract('event-contract.yaml')),
    i18n: parseI18nContract(readContract('i18n-contract.yaml')),
    glossary: parseGlossaryContract(readContract('glossary-contract.yaml'))
  };
}

async function loadCommittedApiContractsInput() {
  return loadApiContractsInput(join(process.cwd(), '..', 'zdp-api-contracts'));
}

function readContract(fileName: string): string {
  return readFileSync(join(process.cwd(), 'contracts', fileName), 'utf8');
}
