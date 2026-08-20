import { calculateStudycafeBreakEven } from '../../src/calculator-engine/calculators/studycafe-break-even';
import type { StudycafeBreakEvenOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'studycafe-break-even',
  (testCase) =>
    calculateStudycafeBreakEven(
      {
        seatCount: testCase.input.seat_count,
        openingDaysPerMonth: testCase.input.opening_days_per_month,
        openingHoursPerDay: testCase.input.opening_hours_per_day,
        averageSeatHourPrice: testCase.input.average_seat_hour_price,
        monthlyFixedCost: testCase.input.monthly_fixed_cost,
        variableCostRatio: testCase.input.variable_cost_ratio
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as StudycafeBreakEvenOutput;
    return {
      break_even_revenue: output.breakEvenRevenue,
      break_even_occupancy_percentage:
        output.breakEvenOccupancyPercentage
    };
  }
);
