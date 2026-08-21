import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateKioskRoi } from '../../src/calculator-engine/calculators/kiosk-roi';
import type { KioskRoiOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'kiosk-roi',
  (testCase) =>
    calculateKioskRoi(
      {
        initialInvestment: testCase.input.initial_investment,
        monthlyIncrementalRevenue:
          testCase.input.monthly_incremental_revenue,
        monthlyLaborSavings: testCase.input.monthly_labor_savings,
        monthlyAdditionalOperatingCost:
          testCase.input.monthly_additional_operating_cost
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as KioskRoiOutput;
    return {
      monthly_net_benefit: output.monthlyNetBenefit,
      payback_months: output.paybackMonths
    };
  }
);

it('keeps payback invariant under equal monetary scaling', () => {
  const options = {
    contractVersion: CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: 4
  } as const;
  const base = calculateKioskRoi(
    {
      initialInvestment: { value: '6000', unit: 'USD' },
      monthlyIncrementalRevenue: { value: '400', unit: 'USD' },
      monthlyLaborSavings: { value: '300', unit: 'USD' },
      monthlyAdditionalOperatingCost: { value: '100', unit: 'USD' }
    },
    options
  );
  const scaled = calculateKioskRoi(
    {
      initialInvestment: { value: '60000', unit: 'USD' },
      monthlyIncrementalRevenue: { value: '4000', unit: 'USD' },
      monthlyLaborSavings: { value: '3000', unit: 'USD' },
      monthlyAdditionalOperatingCost: { value: '1000', unit: 'USD' }
    },
    options
  );
  expect(base.ok).toBe(true);
  expect(scaled.ok).toBe(true);
  if (!base.ok || !scaled.ok) {
    throw new Error('Expected scaled kiosk inputs to succeed.');
  }
  expect(base.value.paybackMonths).toEqual(scaled.value.paybackMonths);
});
