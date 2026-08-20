import type { CalculatorErrorCode, CalculatorResult } from '../types.js';
export type CalculatorFailure = Extract<CalculatorResult<never>, {
    readonly ok: false;
}>;
export declare function failure(code: CalculatorErrorCode, field?: string): CalculatorFailure;
//# sourceMappingURL=result.d.ts.map