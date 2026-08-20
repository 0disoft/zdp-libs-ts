import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculatePercentageChange } from '../../src/calculator-engine/calculators/percentage-change';
import type { PercentageChangeOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'percentage-change',
  (testCase) =>
    calculatePercentageChange(
      {
        initialValue: testCase.input.initial_value,
        finalValue: testCase.input.final_value
      },
      decimalOptions(testCase)
    ),
  (value) => ({
    percentage_change: (value as PercentageChangeOutput).percentageChange
  })
);

it('rejects a mismatched contract version', () => {
  expect(
    calculatePercentageChange(
      { initialValue: '100', finalValue: '125' },
      { contractVersion: '2.0.0', decimalPlaces: 2 }
    )
  ).toEqual({ ok: false, error: { code: 'contract_mismatch' } });
});

it('rejects inputs over the declared digit limit', () => {
  expect(
    calculatePercentageChange(
      { initialValue: '1'.repeat(1001), finalValue: '2' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    )
  ).toEqual({
    ok: false,
    error: { code: 'limit_exceeded', field: 'initial_value' }
  });
});
