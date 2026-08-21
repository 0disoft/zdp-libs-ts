import type { CalculatorExecutionOptions, CalculatorResult, ExactIntegerExecutionOptions, PercentageChangeInput, PercentageChangeOutput, MarginMarkupInput, MarginMarkupOutput, BreakEvenPointInput, BreakEvenPointOutput, CompoundInterestInput, CompoundInterestOutput, DataTransferTimeInput, DataTransferTimeOutput, DateDifferenceInput, DateDifferenceOutput, StudycafeSeatOccupancyInput, StudycafeSeatOccupancyOutput, StudycafeBreakEvenInput, StudycafeBreakEvenOutput, KioskRoiInput, KioskRoiOutput, UnattendedLaborSavingsInput, UnattendedLaborSavingsOutput, LockerRevenueInput, LockerRevenueOutput, StudyRoomScheduleRevenueInput, StudyRoomScheduleRevenueOutput, SecurityCostBreakEvenInput, SecurityCostBreakEvenOutput, DiscountInput, DiscountOutput, AgeInput, AgeOutput, WorkHoursInput, WorkHoursOutput, FuelCostInput, FuelCostOutput } from './index.js';
import type { CalculatorId } from './catalog.generated.js';
export interface CalculatorInputById {
    readonly 'percentage-change': PercentageChangeInput;
    readonly 'margin-markup': MarginMarkupInput;
    readonly 'break-even-point': BreakEvenPointInput;
    readonly 'compound-interest': CompoundInterestInput;
    readonly 'data-transfer-time': DataTransferTimeInput;
    readonly 'date-difference': DateDifferenceInput;
    readonly 'studycafe-seat-occupancy': StudycafeSeatOccupancyInput;
    readonly 'studycafe-break-even': StudycafeBreakEvenInput;
    readonly 'kiosk-roi': KioskRoiInput;
    readonly 'unattended-labor-savings': UnattendedLaborSavingsInput;
    readonly 'locker-revenue': LockerRevenueInput;
    readonly 'study-room-schedule-revenue': StudyRoomScheduleRevenueInput;
    readonly 'security-cost-break-even': SecurityCostBreakEvenInput;
    readonly 'discount': DiscountInput;
    readonly 'age': AgeInput;
    readonly 'work-hours': WorkHoursInput;
    readonly 'fuel-cost': FuelCostInput;
}
export interface CalculatorOutputById {
    readonly 'percentage-change': PercentageChangeOutput;
    readonly 'margin-markup': MarginMarkupOutput;
    readonly 'break-even-point': BreakEvenPointOutput;
    readonly 'compound-interest': CompoundInterestOutput;
    readonly 'data-transfer-time': DataTransferTimeOutput;
    readonly 'date-difference': DateDifferenceOutput;
    readonly 'studycafe-seat-occupancy': StudycafeSeatOccupancyOutput;
    readonly 'studycafe-break-even': StudycafeBreakEvenOutput;
    readonly 'kiosk-roi': KioskRoiOutput;
    readonly 'unattended-labor-savings': UnattendedLaborSavingsOutput;
    readonly 'locker-revenue': LockerRevenueOutput;
    readonly 'study-room-schedule-revenue': StudyRoomScheduleRevenueOutput;
    readonly 'security-cost-break-even': SecurityCostBreakEvenOutput;
    readonly 'discount': DiscountOutput;
    readonly 'age': AgeOutput;
    readonly 'work-hours': WorkHoursOutput;
    readonly 'fuel-cost': FuelCostOutput;
}
export interface CalculatorOptionsById {
    readonly 'percentage-change': CalculatorExecutionOptions;
    readonly 'margin-markup': CalculatorExecutionOptions;
    readonly 'break-even-point': CalculatorExecutionOptions;
    readonly 'compound-interest': CalculatorExecutionOptions;
    readonly 'data-transfer-time': CalculatorExecutionOptions;
    readonly 'date-difference': ExactIntegerExecutionOptions;
    readonly 'studycafe-seat-occupancy': CalculatorExecutionOptions;
    readonly 'studycafe-break-even': CalculatorExecutionOptions;
    readonly 'kiosk-roi': CalculatorExecutionOptions;
    readonly 'unattended-labor-savings': CalculatorExecutionOptions;
    readonly 'locker-revenue': CalculatorExecutionOptions;
    readonly 'study-room-schedule-revenue': CalculatorExecutionOptions;
    readonly 'security-cost-break-even': CalculatorExecutionOptions;
    readonly 'discount': CalculatorExecutionOptions;
    readonly 'age': ExactIntegerExecutionOptions;
    readonly 'work-hours': CalculatorExecutionOptions;
    readonly 'fuel-cost': CalculatorExecutionOptions;
}
export declare function calculateById<Id extends CalculatorId>(id: Id, input: CalculatorInputById[Id], options: CalculatorOptionsById[Id]): CalculatorResult<CalculatorOutputById[Id]>;
//# sourceMappingURL=registry.generated.d.ts.map