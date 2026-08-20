import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import type {
  CalculatorErrorCode,
  CalculatorResult
} from '../../src/calculator-engine/types';
import {
  CALCULATOR_IDS,
  type CalculatorId
} from '../../src/calculator-engine/catalog.generated';

export interface ConformanceCase {
  readonly id: string;
  readonly calculatorId: CalculatorId;
  readonly input: Readonly<Record<string, unknown>>;
  readonly decimalPlaces: number | undefined;
  readonly expected:
    | {
        readonly status: 'success';
        readonly output: Readonly<
          Record<string, { readonly value: string | number; readonly unit: string }>
        >;
      }
    | {
        readonly status: 'error';
        readonly errorCode: CalculatorErrorCode;
      };
}

type ConformanceRunner = (
  testCase: ConformanceCase
) => CalculatorResult<unknown>;

type OutputAdapter = (value: unknown) => Record<string, unknown>;

const apiContractsRoot = process.env.ZDP_API_CONTRACTS_ROOT;
const conformanceCases =
  apiContractsRoot === undefined ? [] : loadConformanceCases(apiContractsRoot);

export function describeCalculatorConformance(
  calculatorId: CalculatorId,
  run: ConformanceRunner,
  toContractOutput: OutputAdapter
): void {
  const cases = conformanceCases.filter(
    (testCase) => testCase.calculatorId === calculatorId
  );

  describe(`${calculatorId} conformance`, () => {
    for (const testCase of cases) {
      it(`matches ${testCase.id}`, () => {
        const result = run(testCase);
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
  });
}

export function decimalOptions(testCase: ConformanceCase): {
  readonly contractVersion: string;
  readonly decimalPlaces: number;
} {
  return {
    contractVersion: contractVersion(testCase),
    decimalPlaces: testCase.decimalPlaces ?? 0
  };
}

export function exactOptions(testCase: ConformanceCase): {
  readonly contractVersion: string;
} {
  return { contractVersion: contractVersion(testCase) };
}

function contractVersion(testCase: ConformanceCase): string {
  return testCase.expected.status === 'error' &&
    testCase.expected.errorCode === 'contract_mismatch'
    ? '2.0.0'
    : CALCULATOR_CONTRACT_VERSION;
}

function loadConformanceCases(root: string): readonly ConformanceCase[] {
  const source = readFileSync(
    join(
      root,
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
  if (!isCalculatorId(calculatorId)) {
    throw new Error(`Unsupported conformance calculator ${calculatorId}.`);
  }
  if (!isRecord(value.input) || !isRecord(value.options)) {
    throw new Error(`Conformance case ${id} must have input and options.`);
  }
  const decimalPlaces = value.options.decimal_places;
  if (decimalPlaces !== undefined && typeof decimalPlaces !== 'number') {
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
      expected: { status, errorCode }
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
): Record<string, { readonly value: string | number; readonly unit: string }> {
  return Object.fromEntries(
    Object.entries(output).map(([key, value]) => {
      if (!isRecord(value)) {
        throw new Error(`${caseId}.expected.output.${key} must be an object.`);
      }
      return [
        key,
        {
          value: requireOutputValue(value.value, `${caseId}.${key}.value`),
          unit: requireString(value.unit, `${caseId}.${key}.unit`)
        }
      ];
    })
  );
}

function requireOutputValue(value: unknown, path: string): string | number {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (typeof value === 'number' && Number.isSafeInteger(value)) {
    return value;
  }
  throw new Error(`${path} must be a non-empty string or safe integer.`);
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
    'unsupported_unit',
    'incompatible_units',
    'precision_policy_required',
    'rounding_policy_required',
    'invalid_date_range'
  ].includes(value);
}

function isCalculatorId(value: string): value is CalculatorId {
  return (CALCULATOR_IDS as readonly string[]).includes(value);
}
