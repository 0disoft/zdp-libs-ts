import type { CalculatorExecutionOptions, CalculatorResult, ExactIntegerExecutionOptions } from '../types.js';
import { type ParsedDecimal } from './decimal.js';
import { type CalculatorFailure } from './result.js';
import { type Rational } from './rational.js';
export interface ParsedUnitDecimal {
    readonly ok: true;
    readonly decimal: ParsedDecimal;
    readonly unit: string;
}
export declare function parseOptions(options: unknown): CalculatorResult<CalculatorExecutionOptions>;
export declare function parseExactIntegerOptions(options: unknown): CalculatorResult<ExactIntegerExecutionOptions>;
export declare function parseNamedDecimal(value: unknown, field: string): CalculatorResult<ParsedDecimal>;
export declare function parseNamedUnitDecimal(value: unknown, field: string): ParsedUnitDecimal | CalculatorFailure;
export declare function parseFixedUnitDecimal(value: unknown, field: string, expectedUnit: string): ParsedUnitDecimal | CalculatorFailure;
export declare function parseFixedUnitInteger(value: unknown, field: string, expectedUnit: string, allowZero: boolean): CalculatorResult<bigint>;
export declare function parseClockUnitMinutes(value: unknown, field: string): CalculatorResult<bigint>;
export declare function parseRatio(value: unknown, field: string, upperInclusive: boolean): CalculatorResult<Rational>;
export declare function ownUnitMultiplier<Unit extends string, Value>(multipliers: Readonly<Record<Unit, Value>>, unit: string): Value | undefined;
export declare function sameUnits(first: string, ...rest: readonly string[]): boolean;
//# sourceMappingURL=input.d.ts.map