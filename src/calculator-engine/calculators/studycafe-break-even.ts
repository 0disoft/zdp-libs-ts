import { isRecord } from '../../internal/record.js';
import { decimalToRational } from '../core/decimal.js';
import {
  parseFixedUnitDecimal,
  parseFixedUnitInteger,
  parseNamedUnitDecimal,
  parseOptions,
  parseRatio
} from '../core/input.js';
import { failure } from '../core/result.js';
import {
  divideRationals,
  formatRational,
  multiplyRationals,
  subtractRationals
} from '../core/rational.js';
import type {
  CalculatorExecutionOptions,
  CalculatorResult,
  StudycafeBreakEvenInput,
  StudycafeBreakEvenOutput
} from '../types.js';

export function calculateStudycafeBreakEven(
  input: StudycafeBreakEvenInput,
  options: CalculatorExecutionOptions
): CalculatorResult<StudycafeBreakEvenOutput>;
export function calculateStudycafeBreakEven(
  input: unknown,
  options: unknown
): CalculatorResult<StudycafeBreakEvenOutput>;
export function calculateStudycafeBreakEven(
  input: unknown,
  options: unknown
): CalculatorResult<StudycafeBreakEvenOutput> {
  const parsedOptions = parseOptions(options);
  if (!parsedOptions.ok) {
    return parsedOptions;
  }
  if (!isRecord(input)) {
    return failure('invalid_input');
  }
  const seatCount = parseFixedUnitInteger(
    input.seatCount,
    'seat_count',
    'seats',
    false
  );
  if (!seatCount.ok) {
    return seatCount;
  }
  const openingDays = parseFixedUnitInteger(
    input.openingDaysPerMonth,
    'opening_days_per_month',
    'days',
    false
  );
  if (!openingDays.ok) {
    return openingDays;
  }
  const openingHours = parseFixedUnitDecimal(
    input.openingHoursPerDay,
    'opening_hours_per_day',
    'hours'
  );
  if (!openingHours.ok) {
    return openingHours;
  }
  const price = parseNamedUnitDecimal(
    input.averageSeatHourPrice,
    'average_seat_hour_price'
  );
  if (!price.ok) {
    return price;
  }
  const fixedCost = parseNamedUnitDecimal(
    input.monthlyFixedCost,
    'monthly_fixed_cost'
  );
  if (!fixedCost.ok) {
    return fixedCost;
  }
  const ratio = parseRatio(
    input.variableCostRatio,
    'variable_cost_ratio',
    false
  );
  if (!ratio.ok) {
    return ratio;
  }
  if (openingHours.decimal.coefficient <= 0n) {
    return failure('domain_error', 'opening_hours_per_day');
  }
  if (price.decimal.coefficient <= 0n) {
    return failure('domain_error', 'average_seat_hour_price');
  }
  if (fixedCost.decimal.coefficient < 0n) {
    return failure('domain_error', 'monthly_fixed_cost');
  }
  if (price.unit !== fixedCost.unit) {
    return failure('incompatible_units');
  }
  const available = multiplyRationals(
    { numerator: seatCount.value * openingDays.value, denominator: 1n },
    decimalToRational(openingHours.decimal)
  );
  const fullCapacityRevenue = multiplyRationals(
    available,
    decimalToRational(price.decimal)
  );
  if (fullCapacityRevenue.numerator === 0n) {
    return failure('denominator_zero');
  }
  const contributionRatio = subtractRationals(
    { numerator: 1n, denominator: 1n },
    ratio.value
  );
  const breakEvenRevenue = divideRationals(
    decimalToRational(fixedCost.decimal),
    contributionRatio
  );
  const breakEvenOccupancy = multiplyRationals(
    divideRationals(breakEvenRevenue, fullCapacityRevenue),
    { numerator: 100n, denominator: 1n }
  );
  const places = parsedOptions.value.decimalPlaces;
  return {
    ok: true,
    value: {
      breakEvenRevenue: {
        value: formatRational(breakEvenRevenue, places),
        unit: price.unit
      },
      breakEvenOccupancyPercentage: {
        value: formatRational(breakEvenOccupancy, places),
        unit: 'percent'
      }
    }
  };
}
