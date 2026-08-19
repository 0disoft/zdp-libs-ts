import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateDiscount } from '../../src/calculator-engine/calculators/discount';
import type { DiscountOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'discount',
  (testCase) =>
    calculateDiscount(
      {
        originalPrice: testCase.input.original_price,
        discountRate1: testCase.input.discount_rate_1,
        discountRate2: testCase.input.discount_rate_2,
        mode: testCase.input.mode
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as DiscountOutput;
    return {
      original_price: output.originalPrice,
      final_price: output.finalPrice,
      total_savings: output.totalSavings,
      total_discount_percent: output.totalDiscountPercent
    };
  }
);

it('keeps effective rates invariant under equal monetary scaling', () => {
  const options = {
    contractVersion: CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: 2
  } as const;
  const base = calculateDiscount(
    {
      originalPrice: { value: '80', unit: 'USD' },
      discountRate1: '10',
      discountRate2: '5',
      mode: 'final-price'
    },
    options
  );
  const scaled = calculateDiscount(
    {
      originalPrice: { value: '800000', unit: 'USD' },
      discountRate1: '10',
      discountRate2: '5',
      mode: 'final-price'
    },
    options
  );
  expect(base.ok).toBe(true);
  expect(scaled.ok).toBe(true);
  if (!base.ok || !scaled.ok) {
    throw new Error('Expected scaled discount inputs to succeed.');
  }
  expect(base.value.totalDiscountPercent).toEqual(
    scaled.value.totalDiscountPercent
  );
  expect(base.value.totalDiscountPercent.value).toBe('14.50');
  expect(base.value.finalPrice.value).toBe('68.40');
  expect(scaled.value.finalPrice.value).toBe('684000.00');
});

it('round-trips reverse mode with consecutive rates', () => {
  const options = {
    contractVersion: CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: 4
  } as const;
  const forward = calculateDiscount(
    {
      originalPrice: { value: '100', unit: 'USD' },
      discountRate1: '20',
      discountRate2: '10',
      mode: 'final-price'
    },
    options
  );
  if (!forward.ok) {
    throw new Error('Expected forward discount to succeed.');
  }
  const reverse = calculateDiscount(
    {
      originalPrice: { value: forward.value.finalPrice.value, unit: 'USD' },
      discountRate1: '20',
      discountRate2: '10',
      mode: 'original-price'
    },
    options
  );
  expect(reverse.ok).toBe(true);
  if (!reverse.ok) {
    throw new Error('Expected reverse discount to succeed.');
  }
  expect(reverse.value.originalPrice.value).toBe('100.0000');
});

it('rejects full and negative rates in both modes', () => {
  const options = {
    contractVersion: CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: 2
  } as const;
  expect(
    calculateDiscount(
      {
        originalPrice: { value: '80', unit: 'USD' },
        discountRate1: '100',
        discountRate2: '0',
        mode: 'final-price'
      },
      options
    )
  ).toEqual({
    ok: false,
    error: { code: 'domain_error', field: 'discount_rate_1' }
  });
  expect(
    calculateDiscount(
      {
        originalPrice: { value: '80', unit: 'USD' },
        discountRate1: '-1',
        discountRate2: '0',
        mode: 'original-price'
      },
      options
    )
  ).toEqual({
    ok: false,
    error: { code: 'domain_error', field: 'discount_rate_1' }
  });
});
