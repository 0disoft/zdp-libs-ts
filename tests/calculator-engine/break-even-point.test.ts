import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateBreakEvenPoint } from '../../src/calculator-engine/calculators/break-even-point';
import type { BreakEvenPointOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'break-even-point',
  (testCase) =>
    calculateBreakEvenPoint(
      {
        fixedCost: testCase.input.fixed_cost,
        unitPrice: testCase.input.unit_price,
        unitVariableCost: testCase.input.unit_variable_cost
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as BreakEvenPointOutput;
    return {
      contribution_margin_per_unit: output.contributionMarginPerUnit,
      break_even_quantity: output.breakEvenQuantity
    };
  }
);

it('keeps quantity invariant when monetary inputs scale equally', () => {
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
