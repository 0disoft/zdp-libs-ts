import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateUnattendedLaborSavings } from '../../src/calculator-engine/calculators/unattended-labor-savings';
import type { UnattendedLaborSavingsOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'unattended-labor-savings',
  (testCase) =>
    calculateUnattendedLaborSavings(
      {
        currentMonthlyLaborCost: testCase.input.current_monthly_labor_cost,
        unattendedMonthlyLaborCost:
          testCase.input.unattended_monthly_labor_cost,
        additionalMonthlySystemCost:
          testCase.input.additional_monthly_system_cost
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as UnattendedLaborSavingsOutput;
    return {
      gross_monthly_labor_savings: output.grossMonthlyLaborSavings,
      net_monthly_savings: output.netMonthlySavings
    };
  }
);

it('rejects currency drift at its own module boundary', () => {
  expect(
    calculateUnattendedLaborSavings(
      {
        currentMonthlyLaborCost: { value: '1000', unit: 'USD' },
        unattendedMonthlyLaborCost: { value: '500', unit: 'EUR' },
        additionalMonthlySystemCost: { value: '100', unit: 'USD' }
      },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    )
  ).toEqual({ ok: false, error: { code: 'incompatible_units' } });
});
