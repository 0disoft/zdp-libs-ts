import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateStudyRoomScheduleRevenue } from '../../src/calculator-engine/calculators/study-room-schedule-revenue';
import type { StudyRoomScheduleRevenueOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'study-room-schedule-revenue',
  (testCase) =>
    calculateStudyRoomScheduleRevenue(
      {
        bookableRoomHours: testCase.input.bookable_room_hours,
        bookingRatio: testCase.input.booking_ratio,
        averageHourlyPrice: testCase.input.average_hourly_price,
        monthlyOperatingCost: testCase.input.monthly_operating_cost
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as StudyRoomScheduleRevenueOutput;
    return {
      booked_room_hours: output.bookedRoomHours,
      monthly_gross_revenue: output.monthlyGrossRevenue,
      monthly_net_revenue: output.monthlyNetRevenue
    };
  }
);

it('rejects currency drift at its own module boundary', () => {
  expect(
    calculateStudyRoomScheduleRevenue(
      {
        bookableRoomHours: { value: '100', unit: 'room_hours' },
        bookingRatio: '0.5',
        averageHourlyPrice: { value: '20', unit: 'USD' },
        monthlyOperatingCost: { value: '50', unit: 'EUR' }
      },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    )
  ).toEqual({ ok: false, error: { code: 'incompatible_units' } });
});
