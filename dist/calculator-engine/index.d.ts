export declare const CALCULATOR_ENGINE_VERSION: "0.1.0";
export declare const CALCULATOR_CONTRACT_VERSION: "1.0.0";
export declare const CALCULATOR_ROUNDING_MODE: "half_away_from_zero";
export declare const CALCULATOR_MAX_INPUT_DIGITS: 1000;
export declare const CALCULATOR_MAX_DECIMAL_PLACES: 100;
export type CalculatorErrorCode = 'invalid_input' | 'domain_error' | 'limit_exceeded' | 'contract_mismatch' | 'denominator_zero' | 'incompatible_units' | 'precision_policy_required';
export interface CalculatorExecutionOptions {
    readonly contractVersion: string;
    readonly decimalPlaces: number;
}
export interface UnitDecimalInput {
    readonly value: string;
    readonly unit: string;
}
export interface PercentageChangeInput {
    readonly initialValue: string;
    readonly finalValue: string;
}
export interface PercentageChangeOutput {
    readonly percentageChange: UnitDecimalOutput;
}
export interface MarginMarkupInput {
    readonly cost: UnitDecimalInput;
    readonly sellingPrice: UnitDecimalInput;
}
export interface MarginMarkupOutput {
    readonly marginPercentage: UnitDecimalOutput;
    readonly markupPercentage: UnitDecimalOutput;
}
export interface UnitDecimalOutput {
    readonly value: string;
    readonly unit: 'percent';
}
export type CalculatorResult<T> = {
    readonly ok: true;
    readonly value: T;
} | {
    readonly ok: false;
    readonly error: {
        readonly code: CalculatorErrorCode;
        readonly field?: string;
    };
};
export declare function calculatePercentageChange(input: PercentageChangeInput, options: CalculatorExecutionOptions): CalculatorResult<PercentageChangeOutput>;
export declare function calculatePercentageChange(input: unknown, options: unknown): CalculatorResult<PercentageChangeOutput>;
export declare function calculateMarginMarkup(input: MarginMarkupInput, options: CalculatorExecutionOptions): CalculatorResult<MarginMarkupOutput>;
export declare function calculateMarginMarkup(input: unknown, options: unknown): CalculatorResult<MarginMarkupOutput>;
//# sourceMappingURL=index.d.ts.map