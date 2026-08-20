import { isRecord } from '../../internal/record.js';
import { decimalToRational } from '../core/decimal.js';
import {
  parseNamedDecimal,
  parseNamedUnitDecimal,
  parseOptions
} from '../core/input.js';
import { failure } from '../core/result.js';
import {
  compareRationals,
  divideRationals,
  formatRational,
  isNegativeRational,
  isZeroRational,
  multiplyRationals,
  percentOfRational,
  subtractRationals,
  type Rational
} from '../core/rational.js';
import type {
  CalculatorExecutionOptions,
  CalculatorResult,
  DiscountInput,
  DiscountOutput
} from '../types.js';

export function calculateDiscount(
  input: DiscountInput,
  options: CalculatorExecutionOptions
): CalculatorResult<DiscountOutput>;
export function calculateDiscount(
  input: unknown,
  options: unknown
): CalculatorResult<DiscountOutput>;
export function calculateDiscount(
  input: unknown,
  options: unknown
): CalculatorResult<DiscountOutput> {
  const parsedOptions = parseOptions(options);
  if (!parsedOptions.ok) {
    return parsedOptions;
  }
  if (!isRecord(input)) {
    return failure('invalid_input');
  }
  const originalPrice = parseNamedUnitDecimal(
    input.originalPrice,
    'original_price'
  );
  if (!originalPrice.ok) {
    return originalPrice;
  }
  const rate1 = parseNamedDecimal(input.discountRate1, 'discount_rate_1');
  if (!rate1.ok) {
    return rate1;
  }
  const rate2 = parseNamedDecimal(input.discountRate2, 'discount_rate_2');
  if (!rate2.ok) {
    return rate2;
  }
  if (input.mode !== 'final-price' && input.mode !== 'original-price') {
    return failure('invalid_input', 'mode');
  }
  if (originalPrice.decimal.coefficient < 0n) {
    return failure('domain_error', 'original_price.value');
  }

  const rate1Rational = decimalToRational(rate1.value);
  const rate2Rational = decimalToRational(rate2.value);
  const hundred = { numerator: 100n, denominator: 1n };
  if (isNegativeRational(rate1Rational)) {
    return failure('domain_error', 'discount_rate_1');
  }
  if (isNegativeRational(rate2Rational)) {
    return failure('domain_error', 'discount_rate_2');
  }
  if (compareRationals(rate1Rational, hundred) >= 0) {
    return failure('domain_error', 'discount_rate_1');
  }
  if (compareRationals(rate2Rational, hundred) >= 0) {
    return failure('domain_error', 'discount_rate_2');
  }

  const remaining = multiplyRationals(
    subtractRationals(hundred, rate1Rational),
    subtractRationals(hundred, rate2Rational)
  );
  const hundredSquared = { numerator: 10000n, denominator: 1n };
  const remainingRatio = divideRationals(remaining, hundredSquared);
  const price = decimalToRational(originalPrice.decimal);

  let original: Rational;
  let final: Rational;
  if (input.mode === 'final-price') {
    original = price;
    final = multiplyRationals(price, remainingRatio);
  } else {
    original = divideRationals(price, remainingRatio);
    final = price;
  }
  const totalSavings = subtractRationals(original, final);
  const places = parsedOptions.value.decimalPlaces;
  return {
    ok: true,
    value: {
      originalPrice: {
        value: formatRational(original, places),
        unit: originalPrice.unit
      },
      finalPrice: {
        value: formatRational(final, places),
        unit: originalPrice.unit
      },
      totalSavings: {
        value: formatRational(totalSavings, places),
        unit: originalPrice.unit
      },
      totalDiscountPercent: {
        value: isZeroRational(original)
          ? formatRational({ numerator: 0n, denominator: 1n }, places)
          : percentOfRational(totalSavings, original, places),
        unit: 'percent'
      }
    }
  };
}
