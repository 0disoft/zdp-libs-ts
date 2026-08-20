import type { CalculatorErrorCode } from './index.js';

export interface CalculatorCatalogEntry {
    readonly id: CalculatorId;
    readonly functionName: string;
    readonly lifecycleStatus: 'reviewed';
    readonly contractVersion: string;
    readonly compatibleEngineVersions: readonly string[];
    readonly requiredEngineVersion: string;
    readonly precisionPolicy: string;
    readonly roundingPolicy: string;
    readonly errorCodes: readonly CalculatorErrorCode[];
}

export type CalculatorId =
    | 'percentage-change'
    | 'margin-markup'
    | 'break-even-point'
    | 'compound-interest'
    | 'data-transfer-time'
    | 'date-difference'
    | 'studycafe-seat-occupancy'
    | 'studycafe-break-even'
    | 'kiosk-roi'
    | 'unattended-labor-savings'
    | 'locker-revenue'
    | 'study-room-schedule-revenue'
    | 'security-cost-break-even'
    | 'discount'
    | 'age'
    | 'work-hours'
    | 'fuel-cost';

export declare const CALCULATORS: Readonly<
    Record<CalculatorId, CalculatorCatalogEntry>
>;
export declare const CALCULATOR_IDS: readonly CalculatorId[];
export declare const CALCULATOR_REQUIRED_ENGINE_VERSION: Readonly<
    Record<CalculatorId, string>
>;
