import { isRecord } from '../internal/record.js';
export const CALCULATOR_ENGINE_VERSION = '0.4.0';
export const CALCULATOR_CONTRACT_VERSION = '1.0.0';
export const CALCULATOR_ROUNDING_MODE = 'half_away_from_zero';
export const CALCULATOR_MAX_INPUT_DIGITS = 1000;
export const CALCULATOR_MAX_DECIMAL_PLACES = 100;
export const DATA_SIZE_UNITS = [
    'bit',
    'byte',
    'kilobit',
    'kilobyte',
    'megabit',
    'megabyte',
    'gigabit',
    'gigabyte',
    'terabit',
    'terabyte',
    'kibibyte',
    'mebibyte',
    'gibibyte',
    'tebibyte'
];
export const DATA_RATE_UNITS = [
    'bits_per_second',
    'kilobits_per_second',
    'megabits_per_second',
    'gigabits_per_second'
];
export const DATE_BOUNDARY_MODES = ['exclusive', 'inclusive'];
export const COMPOUNDING_FREQUENCIES = [
    '1_per_year',
    '2_per_year',
    '4_per_year',
    '12_per_year',
    '365_per_year'
];
export const COMPOUND_INTEREST_MAX_YEARS = 100;
export const COMPOUND_INTEREST_MAX_POWER_DIGITS = 250_000;
const CANONICAL_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const CANONICAL_UNSIGNED_INTEGER_PATTERN = /^(?:0|[1-9]\d*)$/;
const CALENDAR_DATE_PATTERN = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
const UNIT_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/;
const DATA_SIZE_TO_BITS = {
    bit: 1n,
    byte: 8n,
    kilobit: 1000n,
    kilobyte: 8000n,
    megabit: 1000000n,
    megabyte: 8000000n,
    gigabit: 1000000000n,
    gigabyte: 8000000000n,
    terabit: 1000000000000n,
    terabyte: 8000000000000n,
    kibibyte: 8192n,
    mebibyte: 8388608n,
    gibibyte: 8589934592n,
    tebibyte: 8796093022208n
};
const DATA_RATE_TO_BITS_PER_SECOND = {
    bits_per_second: 1n,
    kilobits_per_second: 1000n,
    megabits_per_second: 1000000n,
    gigabits_per_second: 1000000000n
};
const COMPOUNDING_PERIODS_PER_YEAR = {
    '1_per_year': 1,
    '2_per_year': 2,
    '4_per_year': 4,
    '12_per_year': 12,
    '365_per_year': 365
};
export function calculatePercentageChange(input, options) {
    const parsedOptions = parseOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    const initial = parseNamedDecimal(input.initialValue, 'initial_value');
    if (!initial.ok) {
        return initial;
    }
    const final = parseNamedDecimal(input.finalValue, 'final_value');
    if (!final.ok) {
        return final;
    }
    if (initial.value.coefficient === 0n) {
        return failure('denominator_zero', 'initial_value');
    }
    const change = subtractDecimals(final.value, initial.value);
    return {
        ok: true,
        value: {
            percentageChange: {
                value: divideAsPercent(change, initial.value, parsedOptions.value.decimalPlaces),
                unit: 'percent'
            }
        }
    };
}
export function calculateMarginMarkup(input, options) {
    const parsedOptions = parseOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    const cost = parseNamedUnitDecimal(input.cost, 'cost');
    if (!cost.ok) {
        return cost;
    }
    const sellingPrice = parseNamedUnitDecimal(input.sellingPrice, 'selling_price');
    if (!sellingPrice.ok) {
        return sellingPrice;
    }
    if (cost.decimal.coefficient < 0n) {
        return failure('domain_error', 'cost');
    }
    if (sellingPrice.decimal.coefficient < 0n) {
        return failure('domain_error', 'selling_price');
    }
    if (cost.unit !== sellingPrice.unit) {
        return failure('incompatible_units');
    }
    if (cost.decimal.coefficient === 0n ||
        sellingPrice.decimal.coefficient === 0n) {
        return failure('denominator_zero');
    }
    const grossProfit = subtractDecimals(sellingPrice.decimal, cost.decimal);
    const decimalPlaces = parsedOptions.value.decimalPlaces;
    return {
        ok: true,
        value: {
            marginPercentage: {
                value: divideAsPercent(grossProfit, sellingPrice.decimal, decimalPlaces),
                unit: 'percent'
            },
            markupPercentage: {
                value: divideAsPercent(grossProfit, cost.decimal, decimalPlaces),
                unit: 'percent'
            }
        }
    };
}
export function calculateBreakEvenPoint(input, options) {
    const parsedOptions = parseOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    const fixedCost = parseNamedUnitDecimal(input.fixedCost, 'fixed_cost');
    if (!fixedCost.ok) {
        return fixedCost;
    }
    const unitPrice = parseNamedUnitDecimal(input.unitPrice, 'unit_price');
    if (!unitPrice.ok) {
        return unitPrice;
    }
    const unitVariableCost = parseNamedUnitDecimal(input.unitVariableCost, 'unit_variable_cost');
    if (!unitVariableCost.ok) {
        return unitVariableCost;
    }
    if (fixedCost.decimal.coefficient < 0n) {
        return failure('domain_error', 'fixed_cost');
    }
    if (unitPrice.decimal.coefficient <= 0n) {
        return failure('domain_error', 'unit_price');
    }
    if (unitVariableCost.decimal.coefficient < 0n) {
        return failure('domain_error', 'unit_variable_cost');
    }
    if (fixedCost.unit !== unitPrice.unit ||
        fixedCost.unit !== unitVariableCost.unit) {
        return failure('incompatible_units');
    }
    const contributionMargin = subtractDecimals(unitPrice.decimal, unitVariableCost.decimal);
    if (contributionMargin.coefficient <= 0n) {
        return failure('non_positive_contribution_margin');
    }
    const decimalPlaces = parsedOptions.value.decimalPlaces;
    return {
        ok: true,
        value: {
            contributionMarginPerUnit: {
                value: formatDecimal(contributionMargin, decimalPlaces),
                unit: fixedCost.unit
            },
            breakEvenQuantity: {
                value: divideAsDecimal(fixedCost.decimal, contributionMargin, decimalPlaces),
                unit: 'items'
            }
        }
    };
}
export function calculateDataTransferTime(input, options) {
    const parsedOptions = parseOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    const dataSize = parseNamedUnitDecimal(input.dataSize, 'data_size');
    if (!dataSize.ok) {
        return dataSize;
    }
    const dataRate = parseNamedUnitDecimal(input.dataRate, 'data_rate');
    if (!dataRate.ok) {
        return dataRate;
    }
    const sizeMultiplier = ownUnitMultiplier(DATA_SIZE_TO_BITS, dataSize.unit);
    if (sizeMultiplier === undefined) {
        return failure('unsupported_unit', 'data_size.unit');
    }
    const rateMultiplier = ownUnitMultiplier(DATA_RATE_TO_BITS_PER_SECOND, dataRate.unit);
    if (rateMultiplier === undefined) {
        return failure('unsupported_unit', 'data_rate.unit');
    }
    if (dataSize.decimal.coefficient < 0n) {
        return failure('domain_error', 'data_size.value');
    }
    if (dataRate.decimal.coefficient <= 0n) {
        return failure('domain_error', 'data_rate.value');
    }
    return {
        ok: true,
        value: {
            transferDuration: {
                value: divideAsDecimal(multiplyDecimalByInteger(dataSize.decimal, sizeMultiplier), multiplyDecimalByInteger(dataRate.decimal, rateMultiplier), parsedOptions.value.decimalPlaces),
                unit: 'seconds'
            }
        }
    };
}
export function calculateDateDifference(input, options) {
    const parsedOptions = parseExactIntegerOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    if (input.boundaryMode !== 'exclusive' && input.boundaryMode !== 'inclusive') {
        return failure('invalid_input', 'boundary_mode');
    }
    const start = parseCivilDate(input.startDate, 'start_date');
    if (!start.ok) {
        return start;
    }
    const end = parseCivilDate(input.endDate, 'end_date');
    if (!end.ok) {
        return end;
    }
    if (end.value < start.value) {
        return failure('invalid_date_range');
    }
    return {
        ok: true,
        value: {
            calendarDayCount: {
                value: end.value - start.value + (input.boundaryMode === 'inclusive' ? 1 : 0),
                unit: 'days'
            }
        }
    };
}
export function calculateCompoundInterest(input, options) {
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
    const frequency = ownUnitMultiplier(COMPOUNDING_PERIODS_PER_YEAR, input.compoundingFrequency);
    if (frequency === undefined) {
        return failure('invalid_input', 'compounding_frequency');
    }
    const periods = parseCompoundingPeriods(input.compoundingPeriods, frequency);
    if (!periods.ok) {
        return periods;
    }
    const base = normalizeRational({
        numerator: rateRational.numerator + BigInt(frequency) * rateRational.denominator,
        denominator: BigInt(frequency) * rateRational.denominator
    });
    const estimatedDigits = (decimalDigitCount(base.numerator) + decimalDigitCount(base.denominator)) *
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
function parseOptions(options) {
    if (!isRecord(options)) {
        return failure('precision_policy_required');
    }
    if (options.contractVersion !== CALCULATOR_CONTRACT_VERSION) {
        return failure('contract_mismatch');
    }
    if (typeof options.decimalPlaces !== 'number' ||
        !Number.isInteger(options.decimalPlaces) ||
        options.decimalPlaces < 0 ||
        options.decimalPlaces > CALCULATOR_MAX_DECIMAL_PLACES) {
        return failure('precision_policy_required', 'decimal_places');
    }
    return {
        ok: true,
        value: {
            contractVersion: options.contractVersion,
            decimalPlaces: options.decimalPlaces
        }
    };
}
function parseExactIntegerOptions(options) {
    if (!isRecord(options)) {
        return failure('invalid_input');
    }
    if (options.contractVersion !== CALCULATOR_CONTRACT_VERSION) {
        return failure('contract_mismatch');
    }
    return { ok: true, value: { contractVersion: options.contractVersion } };
}
function parseCivilDate(value, field) {
    if (typeof value !== 'string') {
        return failure('invalid_input', field);
    }
    const match = CALENDAR_DATE_PATTERN.exec(value);
    if (!match) {
        return failure('invalid_input', field);
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (year === 0) {
        return failure('limit_exceeded', field);
    }
    if (month < 1 || month > 12) {
        return failure('domain_error', field);
    }
    const monthLengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day < 1 || day > monthLengths[month - 1]) {
        return failure('domain_error', field);
    }
    const yearsBefore = year - 1;
    const daysBeforeYear = 365 * yearsBefore +
        Math.floor(yearsBefore / 4) -
        Math.floor(yearsBefore / 100) +
        Math.floor(yearsBefore / 400);
    let daysBeforeMonth = 0;
    for (let index = 0; index < month - 1; index += 1) {
        daysBeforeMonth += monthLengths[index];
    }
    return { ok: true, value: daysBeforeYear + daysBeforeMonth + day - 1 };
}
function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function parseCompoundingPeriods(value, frequency) {
    if (typeof value !== 'string' || !CANONICAL_UNSIGNED_INTEGER_PATTERN.test(value)) {
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
function parseNamedDecimal(value, field) {
    const parsed = parseDecimal(value);
    return parsed.ok ? { ok: true, value: parsed.value } : failure(parsed.code, field);
}
function parseNamedUnitDecimal(value, field) {
    if (!isRecord(value) || typeof value.unit !== 'string') {
        return failure('invalid_input', field);
    }
    const unit = value.unit;
    if (!UNIT_PATTERN.test(unit)) {
        return failure('invalid_input', `${field}.unit`);
    }
    const decimal = parseDecimal(value.value);
    if (!decimal.ok) {
        return failure(decimal.code, `${field}.value`);
    }
    return { ok: true, decimal: decimal.value, unit };
}
function parseDecimal(value) {
    if (typeof value !== 'string' || !CANONICAL_DECIMAL_PATTERN.test(value)) {
        return { ok: false, code: 'invalid_input' };
    }
    const digits = value.replace(/[-.]/g, '');
    if (digits.length > CALCULATOR_MAX_INPUT_DIGITS) {
        return { ok: false, code: 'limit_exceeded' };
    }
    const negative = value.startsWith('-');
    const unsigned = negative ? value.slice(1) : value;
    const dot = unsigned.indexOf('.');
    const scale = dot === -1 ? 0 : unsigned.length - dot - 1;
    const coefficientDigits = dot === -1 ? unsigned : unsigned.replace('.', '');
    const coefficient = BigInt(coefficientDigits);
    return {
        ok: true,
        value: {
            coefficient: negative && coefficient !== 0n ? -coefficient : coefficient,
            scale
        }
    };
}
function subtractDecimals(left, right) {
    const scale = Math.max(left.scale, right.scale);
    return {
        coefficient: left.coefficient * powerOfTen(scale - left.scale) -
            right.coefficient * powerOfTen(scale - right.scale),
        scale
    };
}
function multiplyDecimalByInteger(value, multiplier) {
    return {
        coefficient: value.coefficient * multiplier,
        scale: value.scale
    };
}
function ownUnitMultiplier(multipliers, unit) {
    return Object.hasOwn(multipliers, unit)
        ? multipliers[unit]
        : undefined;
}
function decimalToRational(value) {
    return normalizeRational({
        numerator: value.coefficient,
        denominator: powerOfTen(value.scale)
    });
}
function normalizeRational(value) {
    if (value.denominator === 0n) {
        throw new Error('Rational denominator must not be zero.');
    }
    const sign = value.denominator < 0n ? -1n : 1n;
    const numerator = value.numerator * sign;
    const denominator = value.denominator * sign;
    const divisor = greatestCommonDivisor(numerator, denominator);
    return {
        numerator: numerator / divisor,
        denominator: denominator / divisor
    };
}
function greatestCommonDivisor(left, right) {
    let a = left < 0n ? -left : left;
    let b = right < 0n ? -right : right;
    while (b !== 0n) {
        const remainder = a % b;
        a = b;
        b = remainder;
    }
    return a === 0n ? 1n : a;
}
function multiplyRationals(left, right) {
    return normalizeRational({
        numerator: left.numerator * right.numerator,
        denominator: left.denominator * right.denominator
    });
}
function subtractRationals(left, right) {
    return normalizeRational({
        numerator: left.numerator * right.denominator - right.numerator * left.denominator,
        denominator: left.denominator * right.denominator
    });
}
function powerRational(value, exponent) {
    let remaining = exponent;
    let base = value;
    let result = { numerator: 1n, denominator: 1n };
    while (remaining > 0) {
        if (remaining % 2 === 1) {
            result = multiplyRationals(result, base);
        }
        remaining = Math.floor(remaining / 2);
        if (remaining > 0) {
            base = multiplyRationals(base, base);
        }
    }
    return result;
}
function decimalDigitCount(value) {
    const absolute = value < 0n ? -value : value;
    return absolute.toString().length;
}
function formatRational(value, decimalPlaces) {
    return formatScaledInteger(divideHalfAwayFromZero(value.numerator * powerOfTen(decimalPlaces), value.denominator), decimalPlaces);
}
function divideAsPercent(numerator, denominator, decimalPlaces) {
    let scaledNumerator = numerator.coefficient * 100n;
    let scaledDenominator = denominator.coefficient;
    const exponent = denominator.scale - numerator.scale + decimalPlaces;
    if (exponent >= 0) {
        scaledNumerator *= powerOfTen(exponent);
    }
    else {
        scaledDenominator *= powerOfTen(-exponent);
    }
    const rounded = divideHalfAwayFromZero(scaledNumerator, scaledDenominator);
    return formatScaledInteger(rounded, decimalPlaces);
}
function divideAsDecimal(numerator, denominator, decimalPlaces) {
    let scaledNumerator = numerator.coefficient;
    let scaledDenominator = denominator.coefficient;
    const exponent = denominator.scale - numerator.scale + decimalPlaces;
    if (exponent >= 0) {
        scaledNumerator *= powerOfTen(exponent);
    }
    else {
        scaledDenominator *= powerOfTen(-exponent);
    }
    return formatScaledInteger(divideHalfAwayFromZero(scaledNumerator, scaledDenominator), decimalPlaces);
}
function formatDecimal(value, decimalPlaces) {
    if (value.scale <= decimalPlaces) {
        return formatScaledInteger(value.coefficient * powerOfTen(decimalPlaces - value.scale), decimalPlaces);
    }
    return formatScaledInteger(divideHalfAwayFromZero(value.coefficient, powerOfTen(value.scale - decimalPlaces)), decimalPlaces);
}
function divideHalfAwayFromZero(numerator, denominator) {
    const negative = (numerator < 0n) !== (denominator < 0n);
    const absoluteNumerator = numerator < 0n ? -numerator : numerator;
    const absoluteDenominator = denominator < 0n ? -denominator : denominator;
    const quotient = absoluteNumerator / absoluteDenominator;
    const remainder = absoluteNumerator % absoluteDenominator;
    const rounded = remainder * 2n >= absoluteDenominator ? quotient + 1n : quotient;
    return negative && rounded !== 0n ? -rounded : rounded;
}
function formatScaledInteger(value, scale) {
    const negative = value < 0n;
    const digits = (negative ? -value : value).toString();
    if (scale === 0) {
        return `${negative ? '-' : ''}${digits}`;
    }
    const padded = digits.padStart(scale + 1, '0');
    const split = padded.length - scale;
    return `${negative ? '-' : ''}${padded.slice(0, split)}.${padded.slice(split)}`;
}
function powerOfTen(exponent) {
    return 10n ** BigInt(exponent);
}
function failure(code, field) {
    return field === undefined
        ? { ok: false, error: { code } }
        : { ok: false, error: { code, field } };
}
//# sourceMappingURL=index.js.map