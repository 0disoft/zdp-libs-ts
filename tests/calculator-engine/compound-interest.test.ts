import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateCompoundInterest } from '../../src/calculator-engine/calculators/compound-interest';
import type { CompoundInterestOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'compound-interest',
  (testCase) =>
    calculateCompoundInterest(
      {
        principal: testCase.input.principal,
        nominalAnnualRate: testCase.input.nominal_annual_rate,
        compoundingPeriods: testCase.input.compounding_periods,
        compoundingFrequency: testCase.input.compounding_frequency
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as CompoundInterestOutput;
    return {
      future_value: output.futureValue,
      interest_earned: output.interestEarned
    };
  }
);

it('keeps principal scaling exact before final rounding', () => {
  const options = {
    contractVersion: CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: 4
  } as const;
  const base = calculateCompoundInterest(
    {
      principal: { value: '10', unit: 'USD' },
      nominalAnnualRate: '0.12',
      compoundingPeriods: '6',
      compoundingFrequency: '12_per_year'
    },
    options
  );
  const scaled = calculateCompoundInterest(
    {
      principal: { value: '100', unit: 'USD' },
      nominalAnnualRate: '0.12',
      compoundingPeriods: '6',
      compoundingFrequency: '12_per_year'
    },
    options
  );
  expect(base.ok).toBe(true);
  expect(scaled.ok).toBe(true);
  if (!base.ok || !scaled.ok) {
    throw new Error('Expected scaled compound-interest inputs to succeed.');
  }
  expect(scaled.value.futureValue.value).toBe('106.1520');
  expect(base.value.futureValue.value).toBe('10.6152');
  expect(scaled.value.interestEarned.value).toBe('6.1520');
  expect(base.value.interestEarned.value).toBe('0.6152');
});

it('rejects exact powers over the work budget', () => {
  expect(
    calculateCompoundInterest(
      {
        principal: { value: '1', unit: 'USD' },
        nominalAnnualRate: '9'.repeat(1000),
        compoundingPeriods: '36500',
        compoundingFrequency: '365_per_year'
      },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    )
  ).toEqual({
    ok: false,
    error: { code: 'limit_exceeded', field: 'compounding_periods' }
  });
});
