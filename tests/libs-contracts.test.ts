import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'bun:test';
import {
  parseApiContractSourceContract,
  parseEnvContract,
  parseErrorContract,
  parseEventContract,
  parseI18nContract,
  parsePackageBoundariesContract,
  parseSchemaContract
} from '../src/libs-contracts/parser';
import { validateLibsContracts } from '../src/libs-contracts/validator';
import type { LibsContracts } from '../src/libs-contracts/types';

describe('libs contract checker', () => {
  it('validates the committed libs contracts', () => {
    const result = validateLibsContracts(loadCommittedContracts());

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
    i18n: parseI18nContract(readContract('i18n-contract.yaml'))
  };
}

function readContract(fileName: string): string {
  return readFileSync(join(process.cwd(), 'contracts', fileName), 'utf8');
}
