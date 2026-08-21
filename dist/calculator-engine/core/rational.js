export function normalizeRational(value) {
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
export function multiplyRationals(left, right) {
    return normalizeRational({
        numerator: left.numerator * right.numerator,
        denominator: left.denominator * right.denominator
    });
}
export function addRationals(left, right) {
    return normalizeRational({
        numerator: left.numerator * right.denominator + right.numerator * left.denominator,
        denominator: left.denominator * right.denominator
    });
}
export function divideRationals(left, right) {
    if (right.numerator === 0n) {
        throw new Error('Rational divisor must not be zero.');
    }
    return normalizeRational({
        numerator: left.numerator * right.denominator,
        denominator: left.denominator * right.numerator
    });
}
export function compareRationals(left, right) {
    const difference = left.numerator * right.denominator - right.numerator * left.denominator;
    return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}
export function isZeroRational(value) {
    return value.numerator === 0n;
}
export function isNegativeRational(value) {
    return value.numerator < 0n;
}
export function subtractRationals(left, right) {
    return normalizeRational({
        numerator: left.numerator * right.denominator - right.numerator * left.denominator,
        denominator: left.denominator * right.denominator
    });
}
export function powerRational(value, exponent) {
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
export function decimalDigitCount(value) {
    const absolute = value < 0n ? -value : value;
    return absolute.toString().length;
}
export function formatRational(value, decimalPlaces) {
    return formatScaledInteger(divideHalfAwayFromZero(value.numerator * powerOfTen(decimalPlaces), value.denominator), decimalPlaces);
}
export function percentOfRational(numerator, denominator, decimalPlaces) {
    return formatRational(multiplyRationals(divideRationals(numerator, denominator), { numerator: 100n, denominator: 1n }), decimalPlaces);
}
export function divideHalfAwayFromZero(numerator, denominator) {
    const negative = (numerator < 0n) !== (denominator < 0n);
    const absoluteNumerator = numerator < 0n ? -numerator : numerator;
    const absoluteDenominator = denominator < 0n ? -denominator : denominator;
    const quotient = absoluteNumerator / absoluteDenominator;
    const remainder = absoluteNumerator % absoluteDenominator;
    const rounded = remainder * 2n >= absoluteDenominator ? quotient + 1n : quotient;
    return negative && rounded !== 0n ? -rounded : rounded;
}
export function formatScaledInteger(value, scale) {
    const negative = value < 0n;
    const digits = (negative ? -value : value).toString();
    if (scale === 0) {
        return `${negative ? '-' : ''}${digits}`;
    }
    const padded = digits.padStart(scale + 1, '0');
    const split = padded.length - scale;
    return `${negative ? '-' : ''}${padded.slice(0, split)}.${padded.slice(split)}`;
}
export function powerOfTen(exponent) {
    return 10n ** BigInt(exponent);
}
//# sourceMappingURL=rational.js.map