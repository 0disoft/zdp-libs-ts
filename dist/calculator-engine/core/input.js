import { isRecord } from '../../internal/record.js';
import { CALCULATOR_CONTRACT_VERSION, CALCULATOR_MAX_DECIMAL_PLACES, CALCULATOR_MAX_INPUT_DIGITS } from '../constants.js';
import { decimalToRational, parseDecimal } from './decimal.js';
import { failure } from './result.js';
import { compareRationals } from './rational.js';
const CANONICAL_UNSIGNED_INTEGER_PATTERN = /^(?:0|[1-9]\d*)$/;
const UNIT_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/;
export function parseOptions(options) {
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
export function parseExactIntegerOptions(options) {
    if (!isRecord(options)) {
        return failure('invalid_input');
    }
    if (options.contractVersion !== CALCULATOR_CONTRACT_VERSION) {
        return failure('contract_mismatch');
    }
    return { ok: true, value: { contractVersion: options.contractVersion } };
}
export function parseNamedDecimal(value, field) {
    const parsed = parseDecimal(value);
    return parsed.ok
        ? { ok: true, value: parsed.value }
        : failure(parsed.code, field);
}
export function parseNamedUnitDecimal(value, field) {
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
export function parseFixedUnitDecimal(value, field, expectedUnit) {
    const parsed = parseNamedUnitDecimal(value, field);
    if (!parsed.ok) {
        return parsed;
    }
    return parsed.unit === expectedUnit
        ? parsed
        : failure('invalid_input', `${field}.unit`);
}
export function parseFixedUnitInteger(value, field, expectedUnit, allowZero) {
    if (!isRecord(value) || value.unit !== expectedUnit) {
        return failure('invalid_input', `${field}.unit`);
    }
    if (typeof value.value !== 'string' ||
        !CANONICAL_UNSIGNED_INTEGER_PATTERN.test(value.value)) {
        return failure('invalid_input', field);
    }
    if (value.value.length > CALCULATOR_MAX_INPUT_DIGITS) {
        return failure('limit_exceeded', field);
    }
    const parsed = BigInt(value.value);
    if (!allowZero && parsed === 0n) {
        return failure('domain_error', field);
    }
    return { ok: true, value: parsed };
}
export function parseClockUnitMinutes(value, field) {
    const parsed = parseFixedUnitInteger(value, field, 'minutes', true);
    if (!parsed.ok) {
        return parsed;
    }
    if (parsed.value > 1439n) {
        return failure('domain_error', field);
    }
    return parsed;
}
export function parseRatio(value, field, upperInclusive) {
    const parsed = parseNamedDecimal(value, field);
    if (!parsed.ok) {
        return parsed;
    }
    const ratio = decimalToRational(parsed.value);
    const comparedToZero = compareRationals(ratio, {
        numerator: 0n,
        denominator: 1n
    });
    const comparedToOne = compareRationals(ratio, {
        numerator: 1n,
        denominator: 1n
    });
    if (comparedToZero < 0 ||
        (upperInclusive ? comparedToOne > 0 : comparedToOne >= 0)) {
        return failure('domain_error', field);
    }
    return { ok: true, value: ratio };
}
export function ownUnitMultiplier(multipliers, unit) {
    return Object.hasOwn(multipliers, unit)
        ? multipliers[unit]
        : undefined;
}
export function sameUnits(first, ...rest) {
    return rest.every((unit) => unit === first);
}
//# sourceMappingURL=input.js.map