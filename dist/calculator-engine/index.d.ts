export declare const CALCULATOR_ENGINE_VERSION: "0.3.0";
export declare const CALCULATOR_CONTRACT_VERSION: "1.0.0";
export declare const CALCULATOR_ROUNDING_MODE: "half_away_from_zero";
export declare const CALCULATOR_MAX_INPUT_DIGITS: 1000;
export declare const CALCULATOR_MAX_DECIMAL_PLACES: 100;
export declare const DATA_SIZE_UNITS: readonly ["bit", "byte", "kilobit", "kilobyte", "megabit", "megabyte", "gigabit", "gigabyte", "terabit", "terabyte", "kibibyte", "mebibyte", "gibibyte", "tebibyte"];
export declare const DATA_RATE_UNITS: readonly ["bits_per_second", "kilobits_per_second", "megabits_per_second", "gigabits_per_second"];
export type DataSizeUnit = (typeof DATA_SIZE_UNITS)[number];
export type DataRateUnit = (typeof DATA_RATE_UNITS)[number];
export type CalculatorErrorCode = 'invalid_input' | 'domain_error' | 'limit_exceeded' | 'contract_mismatch' | 'denominator_zero' | 'non_positive_contribution_margin' | 'unsupported_unit' | 'incompatible_units' | 'precision_policy_required' | 'rounding_policy_required';
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
export interface BreakEvenPointInput {
    readonly fixedCost: UnitDecimalInput;
    readonly unitPrice: UnitDecimalInput;
    readonly unitVariableCost: UnitDecimalInput;
}
export interface BreakEvenPointOutput {
    readonly contributionMarginPerUnit: UnitDecimalOutput;
    readonly breakEvenQuantity: UnitDecimalOutput;
}
export interface DataTransferTimeInput {
    readonly dataSize: UnitDecimalInput;
    readonly dataRate: UnitDecimalInput;
}
export interface DataTransferTimeOutput {
    readonly transferDuration: UnitDecimalOutput;
}
export interface UnitDecimalOutput {
    readonly value: string;
    readonly unit: string;
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
export declare function calculateBreakEvenPoint(input: BreakEvenPointInput, options: CalculatorExecutionOptions): CalculatorResult<BreakEvenPointOutput>;
export declare function calculateBreakEvenPoint(input: unknown, options: unknown): CalculatorResult<BreakEvenPointOutput>;
export declare function calculateDataTransferTime(input: DataTransferTimeInput, options: CalculatorExecutionOptions): CalculatorResult<DataTransferTimeOutput>;
export declare function calculateDataTransferTime(input: unknown, options: unknown): CalculatorResult<DataTransferTimeOutput>;
//# sourceMappingURL=index.d.ts.map