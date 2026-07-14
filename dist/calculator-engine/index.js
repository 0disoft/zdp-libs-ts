export const CALCULATOR_ENGINE_VERSION = '0.1.0';
export const CALCULATOR_CONTRACT_VERSION = '1.0.0';
export const CALCULATOR_ROUNDING_MODE = 'half_away_from_zero';
export const CALCULATOR_MAX_INPUT_DIGITS = 1000;
export const CALCULATOR_MAX_DECIMAL_PLACES = 100;
const CANONICAL_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const UNIT_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/;
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
function parseNamedDecimal(value, field) {
    const parsed = parseDecimal(value);
    return parsed.ok ? { ok: true, value: parsed.value } : failure(parsed.code, field);
}
function parseNamedUnitDecimal(value, field) {
    if (!isRecord(value) || typeof value.unit !== 'string') {
        return failure('invalid_input', field);
    }
    const unit = value.unit.trim();
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
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=index.js.map