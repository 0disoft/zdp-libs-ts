import { CALCULATOR_MAX_INPUT_DIGITS } from '../constants.js';
import { divideHalfAwayFromZero, formatScaledInteger, normalizeRational, powerOfTen } from './rational.js';
const CANONICAL_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
export function parseDecimal(value) {
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
export function subtractDecimals(left, right) {
    const scale = Math.max(left.scale, right.scale);
    return {
        coefficient: left.coefficient * powerOfTen(scale - left.scale) -
            right.coefficient * powerOfTen(scale - right.scale),
        scale
    };
}
export function multiplyDecimalByInteger(value, multiplier) {
    return {
        coefficient: value.coefficient * multiplier,
        scale: value.scale
    };
}
export function decimalToRational(value) {
    return normalizeRational({
        numerator: value.coefficient,
        denominator: powerOfTen(value.scale)
    });
}
export function divideAsPercent(numerator, denominator, decimalPlaces) {
    let scaledNumerator = numerator.coefficient * 100n;
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
export function divideAsDecimal(numerator, denominator, decimalPlaces) {
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
export function formatDecimal(value, decimalPlaces) {
    if (value.scale <= decimalPlaces) {
        return formatScaledInteger(value.coefficient * powerOfTen(decimalPlaces - value.scale), decimalPlaces);
    }
    return formatScaledInteger(divideHalfAwayFromZero(value.coefficient, powerOfTen(value.scale - decimalPlaces)), decimalPlaces);
}
//# sourceMappingURL=decimal.js.map