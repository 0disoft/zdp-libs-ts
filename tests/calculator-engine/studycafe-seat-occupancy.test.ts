import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateStudycafeSeatOccupancy } from '../../src/calculator-engine/calculators/studycafe-seat-occupancy';
import type { StudycafeSeatOccupancyOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'studycafe-seat-occupancy',
  (testCase) =>
    calculateStudycafeSeatOccupancy(
      {
        seatCount: testCase.input.seat_count,
        openingDaysPerMonth: testCase.input.opening_days_per_month,
        openingHoursPerDay: testCase.input.opening_hours_per_day,
        occupiedSeatHours: testCase.input.occupied_seat_hours
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as StudycafeSeatOccupancyOutput;
    return {
      available_seat_hours: output.availableSeatHours,
      occupancy_percentage: output.occupancyPercentage
    };
  }
);

it('keeps occupancy invariant when capacity and usage scale together', () => {
  const options = {
    contractVersion: CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: 4
  } as const;
  const base = calculateStudycafeSeatOccupancy(
    {
      seatCount: { value: '10', unit: 'seats' },
      openingDaysPerMonth: { value: '20', unit: 'days' },
      openingHoursPerDay: { value: '8', unit: 'hours' },
      occupiedSeatHours: { value: '400', unit: 'seat_hours' }
    },
    options
  );
  const scaled = calculateStudycafeSeatOccupancy(
    {
      seatCount: { value: '100', unit: 'seats' },
      openingDaysPerMonth: { value: '20', unit: 'days' },
      openingHoursPerDay: { value: '8', unit: 'hours' },
      occupiedSeatHours: { value: '4000', unit: 'seat_hours' }
    },
    options
  );
  expect(base.ok).toBe(true);
  expect(scaled.ok).toBe(true);
  if (!base.ok || !scaled.ok) {
    throw new Error('Expected scaled seat occupancy inputs to succeed.');
  }
  expect(base.value.occupancyPercentage).toEqual(
    scaled.value.occupancyPercentage
  );
  expect(base.value.occupancyPercentage.value).toBe('25.0000');
});
