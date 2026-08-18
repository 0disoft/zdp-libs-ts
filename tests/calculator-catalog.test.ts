import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadApiContractsInput } from '../src/libs-contracts/api-source';
import { loadLibsContracts } from '../src/libs-contracts/parser';
import { validateLibsContracts } from '../src/libs-contracts/validator';
import {
  CALCULATORS,
  CALCULATOR_CONTRACT_VERSION,
  CALCULATOR_IDS,
  CALCULATOR_REQUIRED_ENGINE_VERSION,
  calculateById
} from '../src/index';

describe('generated calculator catalog', () => {
  it('keeps registry, version ledger, and generated docs aligned', () => {
    expect(CALCULATOR_IDS).toHaveLength(17);
    expect(new Set(CALCULATOR_IDS).size).toBe(CALCULATOR_IDS.length);
    expect(Object.keys(CALCULATORS)).toEqual([...CALCULATOR_IDS]);

    const document = readFileSync(
      join(process.cwd(), 'docs/generated/calculator-catalog.md'),
      'utf8'
    );
    for (const calculatorId of CALCULATOR_IDS) {
      const definition = CALCULATORS[calculatorId];
      expect(CALCULATOR_REQUIRED_ENGINE_VERSION[calculatorId]).toBe(
        definition.requiredEngineVersion
      );
      expect(document).toContain(`\`${calculatorId}\``);
      expect(document).toContain(`\`${definition.functionName}\``);
    }
  });

  it('dispatches decimal calculators with id-specific input and output types', () => {
    const result = calculateById(
      'percentage-change',
      { initialValue: '100', finalValue: '125' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    );

    expect(result).toEqual({
      ok: true,
      value: {
        percentageChange: {
          value: '25.00',
          unit: 'percent'
        }
      }
    });
  });

  it('dispatches exact integer calculators without decimal precision options', () => {
    const result = calculateById(
      'age',
      { birthDate: '2000-02-29', referenceDate: '2025-02-28' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION }
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('Expected age dispatch to succeed.');
    }
    expect(result.value.ageYears.value).toBe(25);
  });

  it('fails when generated calculator metadata drifts from the API source', async () => {
    const contracts = await loadLibsContracts(process.cwd());
    const apiContractsInput = await loadApiContractsInput(
      join(process.cwd(), '..', 'zdp-api-contracts')
    );
    const definitions = apiContractsInput.calculatorCatalog.definitions.map(
      (definition) =>
        definition.id === 'percentage-change'
          ? { ...definition, errorCodes: [...definition.errorCodes].reverse() }
          : definition
    );
    const result = validateLibsContracts(contracts, {
      apiContractsInput: {
        ...apiContractsInput,
        calculatorCatalog: {
          ...apiContractsInput.calculatorCatalog,
          definitions
        }
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'LIBS_CALCULATOR_GENERATED_ERROR_CODE_DRIFT'
    );
  });

  it('keeps exact integer options distinct at compile time', () => {
    if (false) {
      calculateById(
        'age',
        { birthDate: '2000-02-29', referenceDate: '2025-02-28' },
        // @ts-expect-error age does not accept decimalPlaces.
        { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
      );
    }

    expect(true).toBe(true);
  });
});
