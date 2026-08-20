import { isRecord } from '../../internal/record.js';
import { decimalToRational } from '../core/decimal.js';
import {
  parseFixedUnitInteger,
  parseNamedUnitDecimal,
  parseOptions,
  parseRatio
} from '../core/input.js';
import { failure } from '../core/result.js';
import {
  formatRational,
  multiplyRationals,
  subtractRationals
} from '../core/rational.js';
import type {
  CalculatorExecutionOptions,
  CalculatorResult,
  LockerRevenueInput,
  LockerRevenueOutput
} from '../types.js';

export function calculateLockerRevenue(
  input: LockerRevenueInput,
  options: CalculatorExecutionOptions
): CalculatorResult<LockerRevenueOutput>;
export function calculateLockerRevenue(
  input: unknown,
  options: unknown
): CalculatorResult<LockerRevenueOutput>;
export function calculateLockerRevenue(
  input: unknown,
  options: unknown
): CalculatorResult<LockerRevenueOutput> {
  const parsedOptions = parseOptions(options);
  if (!parsedOptions.ok) {
    return parsedOptions;
  }
  if (!isRecord(input)) {
    return failure('invalid_input');
  }
  const count = parseFixedUnitInteger(
    input.lockerCount,
    'locker_count',
    'lockers',
    true
  );
  if (!count.ok) {
    return count;
  }
  const price = parseNamedUnitDecimal(
    input.monthlyPricePerLocker,
    'monthly_price_per_locker'
  );
  if (!price.ok) {
    return price;
  }
  const ratio = parseRatio(input.utilizationRatio, 'utilization_ratio', true);
  if (!ratio.ok) {
    return ratio;
  }
  const operating = parseNamedUnitDecimal(
    input.monthlyOperatingCost,
    'monthly_operating_cost'
  );
  if (!operating.ok) {
    return operating;
  }
  if (price.decimal.coefficient < 0n) {
    return failure('domain_error', 'monthly_price_per_locker');
  }
  if (operating.decimal.coefficient < 0n) {
    return failure('domain_error', 'monthly_operating_cost');
  }
  if (price.unit !== operating.unit) {
    return failure('incompatible_units');
  }
  const gross = multiplyRationals(
    multiplyRationals(
      { numerator: count.value, denominator: 1n },
      decimalToRational(price.decimal)
    ),
    ratio.value
  );
  const net = subtractRationals(gross, decimalToRational(operating.decimal));
  const places = parsedOptions.value.decimalPlaces;
  return {
    ok: true,
    value: {
      monthlyGrossRevenue: {
        value: formatRational(gross, places),
        unit: price.unit
      },
      monthlyNetRevenue: {
        value: formatRational(net, places),
        unit: price.unit
      }
    }
  };
}
