import { isRecord } from '../../internal/record.js';
import {
  parseClockUnitMinutes,
  parseFixedUnitInteger,
  parseOptions
} from '../core/input.js';
import { failure } from '../core/result.js';
import { formatRational } from '../core/rational.js';
import type {
  CalculatorExecutionOptions,
  CalculatorResult,
  WorkHoursInput,
  WorkHoursOutput
} from '../types.js';

export function calculateWorkHours(
  input: WorkHoursInput,
  options: CalculatorExecutionOptions
): CalculatorResult<WorkHoursOutput>;
export function calculateWorkHours(
  input: unknown,
  options: unknown
): CalculatorResult<WorkHoursOutput>;
export function calculateWorkHours(
  input: unknown,
  options: unknown
): CalculatorResult<WorkHoursOutput> {
  const parsedOptions = parseOptions(options);
  if (!parsedOptions.ok) {
    return parsedOptions;
  }
  if (!isRecord(input)) {
    return failure('invalid_input');
  }
  if (input.overnight !== 'no' && input.overnight !== 'yes') {
    return failure('invalid_input', 'overnight');
  }
  const start = parseClockUnitMinutes(input.startMinutes, 'start_minutes');
  if (!start.ok) {
    return start;
  }
  const end = parseClockUnitMinutes(input.endMinutes, 'end_minutes');
  if (!end.ok) {
    return end;
  }
  const breakMinutes = parseFixedUnitInteger(
    input.breakMinutes,
    'break_minutes',
    'minutes',
    true
  );
  if (!breakMinutes.ok) {
    return breakMinutes;
  }

  let gross = end.value - start.value;
  if (gross <= 0n) {
    if (input.overnight === 'yes') {
      gross += 1440n;
    } else if (gross < 0n) {
      return failure('domain_error', 'end_minutes');
    }
  }
  if (breakMinutes.value > gross) {
    return failure('domain_error', 'break_minutes');
  }

  const totalMinutes = Number(gross - breakMinutes.value);
  return {
    ok: true,
    value: {
      totalMinutes: { value: totalMinutes, unit: 'minutes' },
      decimalHours: {
        value: formatRational(
          { numerator: BigInt(totalMinutes), denominator: 60n },
          parsedOptions.value.decimalPlaces
        ),
        unit: 'hours'
      }
    }
  };
}
