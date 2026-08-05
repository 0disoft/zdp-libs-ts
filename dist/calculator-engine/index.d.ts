export declare const CALCULATOR_ENGINE_VERSION: "0.6.0";
export declare const CALCULATOR_CONTRACT_VERSION: "1.0.0";
export declare const CALCULATOR_ROUNDING_MODE: "half_away_from_zero";
export declare const CALCULATOR_MAX_INPUT_DIGITS: 1000;
export declare const CALCULATOR_MAX_DECIMAL_PLACES: 100;
export declare const DATA_SIZE_UNITS: readonly ["bit", "byte", "kilobit", "kilobyte", "megabit", "megabyte", "gigabit", "gigabyte", "terabit", "terabyte", "kibibyte", "mebibyte", "gibibyte", "tebibyte"];
export declare const DATA_RATE_UNITS: readonly ["bits_per_second", "kilobits_per_second", "megabits_per_second", "gigabits_per_second"];
export declare const DATE_BOUNDARY_MODES: readonly ["exclusive", "inclusive"];
export declare const DISCOUNT_MODES: readonly ["final-price", "original-price"];
export declare const OVERNIGHT_MODES: readonly ["no", "yes"];
export declare const FUEL_ECONOMY_UNITS: readonly ["km_per_liter", "liters_per_100km", "miles_per_gallon"];
export declare const TRIP_MODES: readonly ["one-way", "round-trip"];
export declare const COMPOUNDING_FREQUENCIES: readonly ["1_per_year", "2_per_year", "4_per_year", "12_per_year", "365_per_year"];
export declare const COMPOUND_INTEREST_MAX_YEARS: 100;
export declare const COMPOUND_INTEREST_MAX_POWER_DIGITS: 250000;
export type DataSizeUnit = (typeof DATA_SIZE_UNITS)[number];
export type DataRateUnit = (typeof DATA_RATE_UNITS)[number];
export type DateBoundaryMode = (typeof DATE_BOUNDARY_MODES)[number];
export type DiscountMode = (typeof DISCOUNT_MODES)[number];
export type OvernightMode = (typeof OVERNIGHT_MODES)[number];
export type FuelEconomyUnit = (typeof FUEL_ECONOMY_UNITS)[number];
export type TripMode = (typeof TRIP_MODES)[number];
export type CompoundingFrequency = (typeof COMPOUNDING_FREQUENCIES)[number];
export type CalculatorErrorCode = 'invalid_input' | 'domain_error' | 'limit_exceeded' | 'contract_mismatch' | 'denominator_zero' | 'non_positive_contribution_margin' | 'unsupported_unit' | 'incompatible_units' | 'precision_policy_required' | 'rounding_policy_required' | 'invalid_date_range';
export interface CalculatorExecutionOptions {
    readonly contractVersion: string;
    readonly decimalPlaces: number;
}
export interface ExactIntegerExecutionOptions {
    readonly contractVersion: string;
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
export interface DateDifferenceInput {
    readonly startDate: string;
    readonly endDate: string;
    readonly boundaryMode: DateBoundaryMode;
}
export interface DateDifferenceOutput {
    readonly calendarDayCount: {
        readonly value: number;
        readonly unit: 'days';
    };
}
export interface CompoundInterestInput {
    readonly principal: UnitDecimalInput;
    readonly nominalAnnualRate: string;
    readonly compoundingPeriods: string;
    readonly compoundingFrequency: CompoundingFrequency;
}
export interface CompoundInterestOutput {
    readonly futureValue: UnitDecimalOutput;
    readonly interestEarned: UnitDecimalOutput;
}
export interface StudycafeSeatOccupancyInput {
    readonly seatCount: UnitDecimalInput;
    readonly openingDaysPerMonth: UnitDecimalInput;
    readonly openingHoursPerDay: UnitDecimalInput;
    readonly occupiedSeatHours: UnitDecimalInput;
}
export interface StudycafeSeatOccupancyOutput {
    readonly availableSeatHours: UnitDecimalOutput;
    readonly occupancyPercentage: UnitDecimalOutput;
}
export interface StudycafeBreakEvenInput {
    readonly seatCount: UnitDecimalInput;
    readonly openingDaysPerMonth: UnitDecimalInput;
    readonly openingHoursPerDay: UnitDecimalInput;
    readonly averageSeatHourPrice: UnitDecimalInput;
    readonly monthlyFixedCost: UnitDecimalInput;
    readonly variableCostRatio: string;
}
export interface StudycafeBreakEvenOutput {
    readonly breakEvenRevenue: UnitDecimalOutput;
    readonly breakEvenOccupancyPercentage: UnitDecimalOutput;
}
export interface KioskRoiInput {
    readonly initialInvestment: UnitDecimalInput;
    readonly monthlyIncrementalRevenue: UnitDecimalInput;
    readonly monthlyLaborSavings: UnitDecimalInput;
    readonly monthlyAdditionalOperatingCost: UnitDecimalInput;
}
export interface KioskRoiOutput {
    readonly monthlyNetBenefit: UnitDecimalOutput;
    readonly paybackMonths: UnitDecimalOutput;
}
export interface UnattendedLaborSavingsInput {
    readonly currentMonthlyLaborCost: UnitDecimalInput;
    readonly unattendedMonthlyLaborCost: UnitDecimalInput;
    readonly additionalMonthlySystemCost: UnitDecimalInput;
}
export interface UnattendedLaborSavingsOutput {
    readonly grossMonthlyLaborSavings: UnitDecimalOutput;
    readonly netMonthlySavings: UnitDecimalOutput;
}
export interface LockerRevenueInput {
    readonly lockerCount: UnitDecimalInput;
    readonly monthlyPricePerLocker: UnitDecimalInput;
    readonly utilizationRatio: string;
    readonly monthlyOperatingCost: UnitDecimalInput;
}
export interface LockerRevenueOutput {
    readonly monthlyGrossRevenue: UnitDecimalOutput;
    readonly monthlyNetRevenue: UnitDecimalOutput;
}
export interface StudyRoomScheduleRevenueInput {
    readonly bookableRoomHours: UnitDecimalInput;
    readonly bookingRatio: string;
    readonly averageHourlyPrice: UnitDecimalInput;
    readonly monthlyOperatingCost: UnitDecimalInput;
}
export interface StudyRoomScheduleRevenueOutput {
    readonly bookedRoomHours: UnitDecimalOutput;
    readonly monthlyGrossRevenue: UnitDecimalOutput;
    readonly monthlyNetRevenue: UnitDecimalOutput;
}
export interface SecurityCostBreakEvenInput {
    readonly monthlyBaseFixedCost: UnitDecimalInput;
    readonly monthlySecurityCost: UnitDecimalInput;
    readonly unitPrice: UnitDecimalInput;
    readonly unitVariableCost: UnitDecimalInput;
}
export interface SecurityCostBreakEvenOutput {
    readonly totalMonthlyFixedCost: UnitDecimalOutput;
    readonly contributionMarginPerUnit: UnitDecimalOutput;
    readonly breakEvenQuantity: UnitDecimalOutput;
}
export interface DiscountInput {
    readonly originalPrice: UnitDecimalInput;
    readonly discountRate1: string;
    readonly discountRate2: string;
    readonly mode: DiscountMode;
}
export interface DiscountOutput {
    readonly originalPrice: UnitDecimalOutput;
    readonly finalPrice: UnitDecimalOutput;
    readonly totalSavings: UnitDecimalOutput;
    readonly totalDiscountPercent: UnitDecimalOutput;
}
export interface AgeInput {
    readonly birthDate: string;
    readonly referenceDate: string;
}
export interface AgeOutput {
    readonly ageYears: {
        readonly value: number;
        readonly unit: 'years';
    };
    readonly ageMonths: {
        readonly value: number;
        readonly unit: 'months';
    };
    readonly ageDays: {
        readonly value: number;
        readonly unit: 'days';
    };
    readonly daysLived: {
        readonly value: number;
        readonly unit: 'days';
    };
    readonly daysUntilNextBirthday: {
        readonly value: number;
        readonly unit: 'days';
    };
}
export interface WorkHoursInput {
    readonly startMinutes: UnitDecimalInput;
    readonly endMinutes: UnitDecimalInput;
    readonly overnight: OvernightMode;
    readonly breakMinutes: UnitDecimalInput;
}
export interface WorkHoursOutput {
    readonly totalMinutes: {
        readonly value: number;
        readonly unit: 'minutes';
    };
    readonly decimalHours: {
        readonly value: string;
        readonly unit: 'hours';
    };
}
export interface FuelCostInput {
    readonly distance: string;
    readonly economy: string;
    readonly fuelPrice: UnitDecimalInput;
    readonly peopleCount: UnitDecimalInput;
    readonly economyUnit: FuelEconomyUnit;
    readonly trip: TripMode;
}
export interface FuelCostOutput {
    readonly fuelUsed: UnitDecimalOutput;
    readonly totalCost: UnitDecimalOutput;
    readonly costPerPerson: UnitDecimalOutput;
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
export declare function calculateDateDifference(input: DateDifferenceInput, options: ExactIntegerExecutionOptions): CalculatorResult<DateDifferenceOutput>;
export declare function calculateDateDifference(input: unknown, options: unknown): CalculatorResult<DateDifferenceOutput>;
export declare function calculateCompoundInterest(input: CompoundInterestInput, options: CalculatorExecutionOptions): CalculatorResult<CompoundInterestOutput>;
export declare function calculateCompoundInterest(input: unknown, options: unknown): CalculatorResult<CompoundInterestOutput>;
export declare function calculateStudycafeSeatOccupancy(input: StudycafeSeatOccupancyInput, options: CalculatorExecutionOptions): CalculatorResult<StudycafeSeatOccupancyOutput>;
export declare function calculateStudycafeSeatOccupancy(input: unknown, options: unknown): CalculatorResult<StudycafeSeatOccupancyOutput>;
export declare function calculateStudycafeBreakEven(input: StudycafeBreakEvenInput, options: CalculatorExecutionOptions): CalculatorResult<StudycafeBreakEvenOutput>;
export declare function calculateStudycafeBreakEven(input: unknown, options: unknown): CalculatorResult<StudycafeBreakEvenOutput>;
export declare function calculateKioskRoi(input: KioskRoiInput, options: CalculatorExecutionOptions): CalculatorResult<KioskRoiOutput>;
export declare function calculateKioskRoi(input: unknown, options: unknown): CalculatorResult<KioskRoiOutput>;
export declare function calculateUnattendedLaborSavings(input: UnattendedLaborSavingsInput, options: CalculatorExecutionOptions): CalculatorResult<UnattendedLaborSavingsOutput>;
export declare function calculateUnattendedLaborSavings(input: unknown, options: unknown): CalculatorResult<UnattendedLaborSavingsOutput>;
export declare function calculateLockerRevenue(input: LockerRevenueInput, options: CalculatorExecutionOptions): CalculatorResult<LockerRevenueOutput>;
export declare function calculateLockerRevenue(input: unknown, options: unknown): CalculatorResult<LockerRevenueOutput>;
export declare function calculateStudyRoomScheduleRevenue(input: StudyRoomScheduleRevenueInput, options: CalculatorExecutionOptions): CalculatorResult<StudyRoomScheduleRevenueOutput>;
export declare function calculateStudyRoomScheduleRevenue(input: unknown, options: unknown): CalculatorResult<StudyRoomScheduleRevenueOutput>;
export declare function calculateSecurityCostBreakEven(input: SecurityCostBreakEvenInput, options: CalculatorExecutionOptions): CalculatorResult<SecurityCostBreakEvenOutput>;
export declare function calculateSecurityCostBreakEven(input: unknown, options: unknown): CalculatorResult<SecurityCostBreakEvenOutput>;
export declare function calculateDiscount(input: DiscountInput, options: CalculatorExecutionOptions): CalculatorResult<DiscountOutput>;
export declare function calculateDiscount(input: unknown, options: unknown): CalculatorResult<DiscountOutput>;
export declare function calculateAge(input: AgeInput, options: ExactIntegerExecutionOptions): CalculatorResult<AgeOutput>;
export declare function calculateAge(input: unknown, options: unknown): CalculatorResult<AgeOutput>;
export declare function calculateWorkHours(input: WorkHoursInput, options: CalculatorExecutionOptions): CalculatorResult<WorkHoursOutput>;
export declare function calculateWorkHours(input: unknown, options: unknown): CalculatorResult<WorkHoursOutput>;
export declare function calculateFuelCost(input: FuelCostInput, options: CalculatorExecutionOptions): CalculatorResult<FuelCostOutput>;
export declare function calculateFuelCost(input: unknown, options: unknown): CalculatorResult<FuelCostOutput>;
//# sourceMappingURL=index.d.ts.map