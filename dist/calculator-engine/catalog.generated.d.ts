import type { CalculatorErrorCode } from './index.js';
export interface CalculatorCatalogEntry {
    readonly id: string;
    readonly functionName: string;
    readonly lifecycleStatus: 'reviewed';
    readonly contractVersion: string;
    readonly compatibleEngineVersions: readonly string[];
    readonly requiredEngineVersion: string;
    readonly precisionPolicy: string;
    readonly roundingPolicy: string;
    readonly errorCodes: readonly CalculatorErrorCode[];
}
export declare const CALCULATORS: {
    readonly 'percentage-change': {
        readonly id: "percentage-change";
        readonly functionName: "calculatePercentageChange";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.x"];
        readonly requiredEngineVersion: "0.x";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "denominator_zero", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'margin-markup': {
        readonly id: "margin-markup";
        readonly functionName: "calculateMarginMarkup";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.x"];
        readonly requiredEngineVersion: "0.x";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "denominator_zero", "incompatible_units", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'break-even-point': {
        readonly id: "break-even-point";
        readonly functionName: "calculateBreakEvenPoint";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.x"];
        readonly requiredEngineVersion: "0.x";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "non_positive_contribution_margin", "incompatible_units", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'compound-interest': {
        readonly id: "compound-interest";
        readonly functionName: "calculateCompoundInterest";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.4.0", "0.5.0", "0.6.0"];
        readonly requiredEngineVersion: "0.6.0";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'data-transfer-time': {
        readonly id: "data-transfer-time";
        readonly functionName: "calculateDataTransferTime";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.3.0", "0.4.0", "0.5.0", "0.6.0"];
        readonly requiredEngineVersion: "0.6.0";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "unsupported_unit", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'date-difference': {
        readonly id: "date-difference";
        readonly functionName: "calculateDateDifference";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.4.0", "0.5.0", "0.6.0"];
        readonly requiredEngineVersion: "0.6.0";
        readonly precisionPolicy: "exact_integer_calendar_days_years_0001_to_9999";
        readonly roundingPolicy: "not_applicable_exact_integer";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "invalid_date_range"];
    };
    readonly 'studycafe-seat-occupancy': {
        readonly id: "studycafe-seat-occupancy";
        readonly functionName: "calculateStudycafeSeatOccupancy";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.5.0"];
        readonly requiredEngineVersion: "0.5.0";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "denominator_zero", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'studycafe-break-even': {
        readonly id: "studycafe-break-even";
        readonly functionName: "calculateStudycafeBreakEven";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.5.0"];
        readonly requiredEngineVersion: "0.5.0";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "denominator_zero", "incompatible_units", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'kiosk-roi': {
        readonly id: "kiosk-roi";
        readonly functionName: "calculateKioskRoi";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.5.0"];
        readonly requiredEngineVersion: "0.5.0";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "denominator_zero", "incompatible_units", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'unattended-labor-savings': {
        readonly id: "unattended-labor-savings";
        readonly functionName: "calculateUnattendedLaborSavings";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.5.0"];
        readonly requiredEngineVersion: "0.5.0";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "incompatible_units", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'locker-revenue': {
        readonly id: "locker-revenue";
        readonly functionName: "calculateLockerRevenue";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.5.0"];
        readonly requiredEngineVersion: "0.5.0";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "incompatible_units", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'study-room-schedule-revenue': {
        readonly id: "study-room-schedule-revenue";
        readonly functionName: "calculateStudyRoomScheduleRevenue";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.5.0"];
        readonly requiredEngineVersion: "0.5.0";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "incompatible_units", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'security-cost-break-even': {
        readonly id: "security-cost-break-even";
        readonly functionName: "calculateSecurityCostBreakEven";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.5.0"];
        readonly requiredEngineVersion: "0.5.0";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "non_positive_contribution_margin", "incompatible_units", "precision_policy_required", "rounding_policy_required"];
    };
    readonly discount: {
        readonly id: "discount";
        readonly functionName: "calculateDiscount";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.x"];
        readonly requiredEngineVersion: "0.x";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "precision_policy_required", "rounding_policy_required"];
    };
    readonly age: {
        readonly id: "age";
        readonly functionName: "calculateAge";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.x"];
        readonly requiredEngineVersion: "0.x";
        readonly precisionPolicy: "exact_integer_calendar_days_years_0001_to_9999";
        readonly roundingPolicy: "not_applicable_exact_integer";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "invalid_date_range"];
    };
    readonly 'work-hours': {
        readonly id: "work-hours";
        readonly functionName: "calculateWorkHours";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.x"];
        readonly requiredEngineVersion: "0.x";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "precision_policy_required", "rounding_policy_required"];
    };
    readonly 'fuel-cost': {
        readonly id: "fuel-cost";
        readonly functionName: "calculateFuelCost";
        readonly lifecycleStatus: "reviewed";
        readonly contractVersion: "1.0.0";
        readonly compatibleEngineVersions: readonly ["0.x"];
        readonly requiredEngineVersion: "0.x";
        readonly precisionPolicy: "canonical_ascii_decimal_string_max_1000_digits";
        readonly roundingPolicy: "caller_decimal_places_0_to_100_half_away_from_zero";
        readonly errorCodes: readonly ["invalid_input", "domain_error", "limit_exceeded", "contract_mismatch", "precision_policy_required", "rounding_policy_required"];
    };
};
export type CalculatorId = keyof typeof CALCULATORS;
export declare const CALCULATOR_IDS: readonly ("percentage-change" | "margin-markup" | "break-even-point" | "compound-interest" | "data-transfer-time" | "date-difference" | "studycafe-seat-occupancy" | "studycafe-break-even" | "kiosk-roi" | "unattended-labor-savings" | "locker-revenue" | "study-room-schedule-revenue" | "security-cost-break-even" | "discount" | "age" | "work-hours" | "fuel-cost")[];
export declare const CALCULATOR_REQUIRED_ENGINE_VERSION: Readonly<Record<CalculatorId, string>>;
//# sourceMappingURL=catalog.generated.d.ts.map