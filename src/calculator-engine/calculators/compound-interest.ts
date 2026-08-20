import { isRecord } from '../../internal/record.js';
import {
  CALCULATOR_MAX_INPUT_DIGITS,
  COMPOUND_INTEREST_MAX_POWER_DIGITS,
  COMPOUND_INTEREST_MAX_YEARS,
  type CompoundingFrequency
} from '../constants.js';
import { decimalToRational } from '../core/decimal.js';
import {
  ownUnitMultiplier,
  parseNamedDecimal,
  parseNamedUnitDecimal,
  parseOptions
} from '../core/input.js';
import { failure } from '../core/result.js';
import {
  decimalDigitCount,
  formatRational,
  multiplyRationals,
  normalizeRational,
  powerRational,
  subtractRationals
} from '../core/rational.js';
import type {
  CalculatorExecutionOptions,
  CalculatorResult,
  CompoundInterestInput,
  CompoundInterestOutput
} from '../types.js';

const CANONICAL_UNSIGNED_INTEGER_PATTERN = /^(?:0|[1-9]\d*)$/;
const COMPOUNDING_PERIODS_PER_YEAR: Readonly<
  Record<CompoundingFrequency, number>
> = {
  '1_per_year': 1,
  '2_per_year': 2,
  '4_per_year': 4,
  '12_per_year': 12,
  '365_per_year': 365
};

export function calculateCompoundInterest(
  input: CompoundInterestInput,
  options: CalculatorExecutionOptions
): CalculatorResult<CompoundInterestOutput>;
export function calculateCompoundInterest(
  input: unknown,
  options: unknown
): CalculatorResult<CompoundInterestOutput>;
export function calculateCompoundInterest(
  input: unknown,
  options: unknown
): CalculatorResult<CompoundInterestOutput> {
  const parsedOptions = parseOptions(options);
  if (!parsedOptions.ok) {
    return parsedOptions;
  }
  if (!isRecord(input)) {
    return failure('invalid_input');
  }
  const principal = parseNamedUnitDecimal(input.principal, 'principal');
  if (!principal.ok) {
    return principal;
  }
  const rate = parseNamedDecimal(input.nominalAnnualRate, 'nominal_annual_rate');
  if (!rate.ok) {
    return rate;
  }
  if (principal.decimal.coefficient < 0n) {
    return failure('domain_error', 'principal.value');
  }
  const rateRational = decimalToRational(rate.value);
  if (rateRational.numerator <= -rateRational.denominator) {
    return failure('domain_error', 'nominal_annual_rate');
  }
  if (typeof input.compoundingFrequency !== 'string') {
    return failure('invalid_input', 'compounding_frequency');
  }
  const frequency = ownUnitMultiplier(
    COMPOUNDING_PERIODS_PER_YEAR,
    input.compoundingFrequency
  );
  if (frequency === undefined) {
    return failure('invalid_input', 'compounding_frequency');
  }
  const periods = parseCompoundingPeriods(input.compoundingPeriods, frequency);
  if (!periods.ok) {
    return periods;
  }
  const base = normalizeRational({
    numerator:
      rateRational.numerator +
      BigInt(frequency) * rateRational.denominator,
    denominator: BigInt(frequency) * rateRational.denominator
  });
  const estimatedDigits =
    (decimalDigitCount(base.numerator) + decimalDigitCount(base.denominator)) *
    periods.value;
  if (estimatedDigits > COMPOUND_INTEREST_MAX_POWER_DIGITS) {
    return failure('limit_exceeded', 'compounding_periods');
  }
  const principalRational = decimalToRational(principal.decimal);
  const growth = powerRational(base, periods.value);
  const future = multiplyRationals(principalRational, growth);
  const interest = subtractRationals(future, principalRational);
  const decimalPlaces = parsedOptions.value.decimalPlaces;
  return {
    ok: true,
    value: {
      futureValue: {
        value: formatRational(future, decimalPlaces),
        unit: principal.unit
      },
      interestEarned: {
        value: formatRational(interest, decimalPlaces),
        unit: principal.unit
      }
    }
  };
}

function parseCompoundingPeriods(
  value: unknown,
  frequency: number
): CalculatorResult<number> {
  if (
    typeof value !== 'string' ||
    !CANONICAL_UNSIGNED_INTEGER_PATTERN.test(value)
  ) {
    return failure('invalid_input', 'compounding_periods');
  }
  if (value.length > CALCULATOR_MAX_INPUT_DIGITS) {
    return failure('limit_exceeded', 'compounding_periods');
  }
  const periods = BigInt(value);
  const maximum = BigInt(frequency * COMPOUND_INTEREST_MAX_YEARS);
  if (periods > maximum) {
    return failure('limit_exceeded', 'compounding_periods');
  }
  return { ok: true, value: Number(periods) };
}
