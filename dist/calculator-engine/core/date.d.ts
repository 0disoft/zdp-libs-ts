import type { CalculatorResult } from '../types.js';
export interface CivilDate {
    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly dayNumber: number;
}
export declare function parseCivilDateRecord(value: unknown, field: string): CalculatorResult<CivilDate>;
export declare function parseCivilDate(value: unknown, field: string): CalculatorResult<number>;
export declare function clampedBirthday(birth: CivilDate, year: number): CivilDate;
export declare function ageComponents(birth: CivilDate, reference: CivilDate): {
    readonly years: number;
    readonly months: number;
    readonly days: number;
};
//# sourceMappingURL=date.d.ts.map