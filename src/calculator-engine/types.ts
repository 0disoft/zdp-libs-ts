import type {
  CompoundingFrequency,
  DateBoundaryMode,
  DiscountMode,
  FuelEconomyUnit,
  OvernightMode,
  TripMode
} from './constants.js';

export type CalculatorErrorCode =
  | 'invalid_input'
  | 'domain_error'
  | 'limit_exceeded'
  | 'contract_mismatch'
  | 'denominator_zero'
  | 'non_positive_contribution_margin'
  | 'unsupported_unit'
  | 'incompatible_units'
  | 'precision_policy_required'
  | 'rounding_policy_required'
  | 'invalid_date_range';

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

export interface UnitDecimalOutput {
  readonly value: string;
  readonly unit: string;
}

export type CalculatorResult<T> =
  | {
      readonly ok: true;
      readonly value: T;
    }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: CalculatorErrorCode;
        readonly field?: string;
      };
    };

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
