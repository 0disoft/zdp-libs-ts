import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateSecurityCostBreakEven } from '../../src/calculator-engine/calculators/security-cost-break-even';
import type { SecurityCostBreakEvenOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'security-cost-break-even',
  (testCase) =>
    calculateSecurityCostBreakEven(
      {
        monthlyBaseFixedCost: testCase.input.monthly_base_fixed_cost,
        monthlySecurityCost: testCase.input.monthly_security_cost,
        unitPrice: testCase.input.unit_price,
        unitVariableCost: testCase.input.unit_variable_cost
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as SecurityCostBreakEvenOutput;
    return {
      total_monthly_fixed_cost: output.totalMonthlyFixedCost,
      contribution_margin_per_unit: output.contributionMarginPerUnit,
      break_even_quantity: output.breakEvenQuantity
    };
  }
);

it('keeps break-even quantity invariant under equal monetary scaling', () => {
  const options = {
    contractVersion: CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: 4
  } as const;
  const base = calculateSecurityCostBreakEven(
    {
      monthlyBaseFixedCost: { value: '800', unit: 'USD' },
      monthlySecurityCost: { value: '200', unit: 'USD' },
      unitPrice: { value: '50', unit: 'USD' },
      unitVariableCost: { value: '30', unit: 'USD' }
    },
    options
  );
  const scaled = calculateSecurityCostBreakEven(
    {
      monthlyBaseFixedCost: { value: '8000', unit: 'USD' },
      monthlySecurityCost: { value: '2000', unit: 'USD' },
      unitPrice: { value: '500', unit: 'USD' },
      unitVariableCost: { value: '300', unit: 'USD' }
    },
    options
  );
  expect(base.ok).toBe(true);
  expect(scaled.ok).toBe(true);
  if (!base.ok || !scaled.ok) {
    throw new Error('Expected scaled security break-even inputs to succeed.');
  }
  expect(base.value.breakEvenQuantity).toEqual(scaled.value.breakEvenQuantity);
});
