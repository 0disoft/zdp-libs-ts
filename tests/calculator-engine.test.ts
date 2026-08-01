import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CALCULATOR_CONTRACT_VERSION,
  calculateBreakEvenPoint,
  calculateMarginMarkup,
  calculatePercentageChange
} from '../src/calculator-engine/index';
import type { CalculatorErrorCode } from '../src/calculator-engine/index';

interface ConformanceCase {
  readonly id: string;
  readonly calculatorId: 'percentage-change' | 'margin-markup' | 'break-even-point';
  readonly input: Readonly<Record<string, unknown>>;
  readonly decimalPlaces: number;
  readonly expected:
    | {
        readonly status: 'success';
        readonly output: Readonly<
          Record<string, { readonly value: string; readonly unit: string }>
        >;
      }
    | {
        readonly status: 'error';
        readonly errorCode: CalculatorErrorCode;
      };
}

describe('calculator engine', () => {
  const cases = loadConformanceCases();

  for (const testCase of cases) {
    it(`matches ${testCase.id}`, () => {
      const result = runConformanceCase(testCase);
      if (testCase.expected.status === 'error') {
        expect(result.ok).toBe(false);
        if (result.ok) {
          throw new Error(`Expected ${testCase.id} to fail.`);
        }
        expect(result.error.code).toBe(testCase.expected.errorCode);
        return;
      }

      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error(`Expected ${testCase.id} to succeed.`);
      }
      expect(toContractOutput(result.value)).toEqual(testCase.expected.output);
    });
  }

  it('rejects a mismatched contract version', () => {
    const result = calculatePercentageChange(
      { initialValue: '100', finalValue: '125' },
      { contractVersion: '2.0.0', decimalPlaces: 2 }
    );

    expect(result).toEqual({
      ok: false,
      error: { code: 'contract_mismatch' }
    });
  });

  it('rejects inputs over the declared digit limit', () => {
    const result = calculatePercentageChange(
      { initialValue: '1'.repeat(1001), finalValue: '2' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    );

    expect(result).toEqual({
      ok: false,
      error: { code: 'limit_exceeded', field: 'initial_value' }
    });
  });

  it('keeps break-even quantity invariant when all monetary inputs scale equally', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 2
    } as const;
    const base = calculateBreakEvenPoint(
      {
        fixedCost: { value: '1000', unit: 'USD' },
        unitPrice: { value: '50', unit: 'USD' },
        unitVariableCost: { value: '30', unit: 'USD' }
      },
      options
    );
    const scaled = calculateBreakEvenPoint(
      {
        fixedCost: { value: '10000', unit: 'USD' },
        unitPrice: { value: '500', unit: 'USD' },
        unitVariableCost: { value: '300', unit: 'USD' }
      },
      options
    );

    expect(base.ok).toBe(true);
    expect(scaled.ok).toBe(true);
    if (!base.ok || !scaled.ok) {
      throw new Error('Expected scaled break-even inputs to succeed.');
    }
    expect(scaled.value.breakEvenQuantity).toEqual(base.value.breakEvenQuantity);
    expect(scaled.value.contributionMarginPerUnit.value).toBe('200.00');
  });
});

function runConformanceCase(testCase: ConformanceCase) {
  const options = {
    contractVersion: CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: testCase.decimalPlaces
  } as const;
  if (testCase.calculatorId === 'percentage-change') {
    return calculatePercentageChange(
      {
        initialValue: testCase.input.initial_value,
        finalValue: testCase.input.final_value
      },
      options
    );
  }
  if (testCase.calculatorId === 'margin-markup') {
    return calculateMarginMarkup(
      {
        cost: testCase.input.cost,
        sellingPrice: testCase.input.selling_price
      },
      options
    );
  }
  return calculateBreakEvenPoint(
    {
      fixedCost: testCase.input.fixed_cost,
      unitPrice: testCase.input.unit_price,
      unitVariableCost: testCase.input.unit_variable_cost
    },
    options
  );
}

function toContractOutput(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error('Calculator output must be an object.');
  }
  if ('percentageChange' in value) {
    return { percentage_change: value.percentageChange };
  }
  if ('breakEvenQuantity' in value) {
    return {
      contribution_margin_per_unit: value.contributionMarginPerUnit,
      break_even_quantity: value.breakEvenQuantity
    };
  }
  return {
    margin_percentage: value.marginPercentage,
    markup_percentage: value.markupPercentage
  };
}

function loadConformanceCases(): readonly ConformanceCase[] {
  const source = readFileSync(
    join(
      process.cwd(),
      '..',
      'zdp-api-contracts',
      'contracts',
      'calculators',
      'conformance.yaml'
    ),
    'utf8'
  );
  const document = Bun.YAML.parse(source) as unknown;
  if (!isRecord(document) || !Array.isArray(document.cases)) {
    throw new Error('Calculator conformance document must contain cases.');
  }
  return document.cases.map(parseConformanceCase);
}

function parseConformanceCase(value: unknown, index: number): ConformanceCase {
  if (!isRecord(value)) {
    throw new Error(`Conformance case ${index} must be an object.`);
  }
  const id = requireString(value.id, `cases[${index}].id`);
  const calculatorId = requireString(
    value.calculator_id,
    `cases[${index}].calculator_id`
  );
  if (
    calculatorId !== 'percentage-change' &&
    calculatorId !== 'margin-markup' &&
    calculatorId !== 'break-even-point'
  ) {
    throw new Error(`Unsupported conformance calculator ${calculatorId}.`);
  }
  if (!isRecord(value.input) || !isRecord(value.options)) {
    throw new Error(`Conformance case ${id} must have input and options.`);
  }
  const decimalPlaces = value.options.decimal_places;
  if (typeof decimalPlaces !== 'number') {
    throw new Error(`Conformance case ${id} needs numeric decimal_places.`);
  }
  if (!isRecord(value.expected)) {
    throw new Error(`Conformance case ${id} must have expected output.`);
  }
  const status = requireString(value.expected.status, `${id}.expected.status`);
  if (status === 'error') {
    const errorCode = requireString(
      value.expected.error_code,
      `${id}.expected.error_code`
    );
    if (!isCalculatorErrorCode(errorCode)) {
      throw new Error(`Conformance case ${id} has unknown error ${errorCode}.`);
    }
    return {
      id,
      calculatorId,
      input: value.input,
      decimalPlaces,
      expected: {
        status,
        errorCode
      }
    };
  }
  if (status !== 'success' || !isRecord(value.expected.output)) {
    throw new Error(`Conformance case ${id} has invalid success output.`);
  }
  return {
    id,
    calculatorId,
    input: value.input,
    decimalPlaces,
    expected: {
      status,
      output: parseExpectedOutput(value.expected.output, id)
    }
  };
}

function parseExpectedOutput(
  output: Record<string, unknown>,
  caseId: string
): Record<string, { readonly value: string; readonly unit: string }> {
  return Object.fromEntries(
    Object.entries(output).map(([key, value]) => {
      if (!isRecord(value)) {
        throw new Error(`${caseId}.expected.output.${key} must be an object.`);
      }
      return [
        key,
        {
          value: requireString(value.value, `${caseId}.${key}.value`),
          unit: requireString(value.unit, `${caseId}.${key}.unit`)
        }
      ];
    })
  );
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${path} must be a non-empty string.`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCalculatorErrorCode(value: string): value is CalculatorErrorCode {
  return [
    'invalid_input',
    'domain_error',
    'limit_exceeded',
    'contract_mismatch',
    'denominator_zero',
    'non_positive_contribution_margin',
    'incompatible_units',
    'precision_policy_required'
  ].includes(value);
}
