import { isRecord } from '../../internal/record.js';
import { decimalToRational } from '../core/decimal.js';
import {
  parseFixedUnitDecimal,
  parseFixedUnitInteger,
  parseOptions
} from '../core/input.js';
import { failure } from '../core/result.js';
import {
  compareRationals,
  divideRationals,
  formatRational,
  multiplyRationals
} from '../core/rational.js';
import type {
  CalculatorExecutionOptions,
  CalculatorResult,
  StudycafeSeatOccupancyInput,
  StudycafeSeatOccupancyOutput
} from '../types.js';

export function calculateStudycafeSeatOccupancy(
  input: StudycafeSeatOccupancyInput,
  options: CalculatorExecutionOptions
): CalculatorResult<StudycafeSeatOccupancyOutput>;
export function calculateStudycafeSeatOccupancy(
  input: unknown,
  options: unknown
): CalculatorResult<StudycafeSeatOccupancyOutput>;
export function calculateStudycafeSeatOccupancy(
  input: unknown,
  options: unknown
): CalculatorResult<StudycafeSeatOccupancyOutput> {
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
  const occupied = parseFixedUnitDecimal(
    input.occupiedSeatHours,
    'occupied_seat_hours',
    'seat_hours'
  );
  if (!occupied.ok) {
    return occupied;
  }
  if (openingHours.decimal.coefficient <= 0n) {
    return failure('domain_error', 'opening_hours_per_day');
  }
  if (occupied.decimal.coefficient < 0n) {
    return failure('domain_error', 'occupied_seat_hours');
  }
  const available = multiplyRationals(
    { numerator: seatCount.value * openingDays.value, denominator: 1n },
    decimalToRational(openingHours.decimal)
  );
  const occupiedRational = decimalToRational(occupied.decimal);
  if (compareRationals(occupiedRational, available) > 0) {
    return failure('domain_error', 'occupied_seat_hours');
  }
  const places = parsedOptions.value.decimalPlaces;
  return {
    ok: true,
    value: {
      availableSeatHours: {
        value: formatRational(available, places),
        unit: 'seat_hours'
      },
      occupancyPercentage: {
        value: formatRational(
          multiplyRationals(
            divideRationals(occupiedRational, available),
            { numerator: 100n, denominator: 1n }
          ),
          places
        ),
        unit: 'percent'
      }
    }
  };
}
