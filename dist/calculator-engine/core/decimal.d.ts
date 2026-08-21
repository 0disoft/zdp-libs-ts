import { type Rational } from './rational.js';
export interface ParsedDecimal {
    readonly coefficient: bigint;
    readonly scale: number;
}
export type DecimalParseResult = {
    readonly ok: true;
    readonly value: ParsedDecimal;
} | {
    readonly ok: false;
    readonly code: 'invalid_input' | 'limit_exceeded';
};
export declare function parseDecimal(value: unknown): DecimalParseResult;
export declare function subtractDecimals(left: ParsedDecimal, right: ParsedDecimal): ParsedDecimal;
export declare function multiplyDecimalByInteger(value: ParsedDecimal, multiplier: bigint): ParsedDecimal;
export declare function decimalToRational(value: ParsedDecimal): Rational;
export declare function divideAsPercent(numerator: ParsedDecimal, denominator: ParsedDecimal, decimalPlaces: number): string;
export declare function divideAsDecimal(numerator: ParsedDecimal, denominator: ParsedDecimal, decimalPlaces: number): string;
export declare function formatDecimal(value: ParsedDecimal, decimalPlaces: number): string;
//# sourceMappingURL=decimal.d.ts.map