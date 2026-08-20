export interface Rational {
    readonly numerator: bigint;
    readonly denominator: bigint;
}
export declare function normalizeRational(value: Rational): Rational;
export declare function multiplyRationals(left: Rational, right: Rational): Rational;
export declare function addRationals(left: Rational, right: Rational): Rational;
export declare function divideRationals(left: Rational, right: Rational): Rational;
export declare function compareRationals(left: Rational, right: Rational): -1 | 0 | 1;
export declare function isZeroRational(value: Rational): boolean;
export declare function isNegativeRational(value: Rational): boolean;
export declare function subtractRationals(left: Rational, right: Rational): Rational;
export declare function powerRational(value: Rational, exponent: number): Rational;
export declare function decimalDigitCount(value: bigint): number;
export declare function formatRational(value: Rational, decimalPlaces: number): string;
export declare function percentOfRational(numerator: Rational, denominator: Rational, decimalPlaces: number): string;
export declare function divideHalfAwayFromZero(numerator: bigint, denominator: bigint): bigint;
export declare function formatScaledInteger(value: bigint, scale: number): string;
export declare function powerOfTen(exponent: number): bigint;
//# sourceMappingURL=rational.d.ts.map