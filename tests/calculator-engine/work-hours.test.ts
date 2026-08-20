import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateWorkHours } from '../../src/calculator-engine/calculators/work-hours';
import type { WorkHoursOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'work-hours',
  (testCase) =>
    calculateWorkHours(
      {
        startMinutes: testCase.input.start_minutes,
        endMinutes: testCase.input.end_minutes,
        overnight: testCase.input.overnight,
        breakMinutes: testCase.input.break_minutes
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as WorkHoursOutput;
    return {
      total_minutes: output.totalMinutes,
      decimal_hours: output.decimalHours
    };
  }
);

it('handles midnight rollover and equal clock times', () => {
  const options = {
    contractVersion: CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: 2
  } as const;
  expect(
    calculateWorkHours(
      {
        startMinutes: { value: '1320', unit: 'minutes' },
        endMinutes: { value: '360', unit: 'minutes' },
        overnight: 'yes',
        breakMinutes: { value: '0', unit: 'minutes' }
      },
      options
    )
  ).toEqual({
    ok: true,
    value: {
      totalMinutes: { value: 480, unit: 'minutes' },
      decimalHours: { value: '8.00', unit: 'hours' }
    }
  });
  expect(
    calculateWorkHours(
      {
        startMinutes: { value: '540', unit: 'minutes' },
        endMinutes: { value: '540', unit: 'minutes' },
        overnight: 'no',
        breakMinutes: { value: '0', unit: 'minutes' }
      },
      options
    )
  ).toEqual({
    ok: true,
    value: {
      totalMinutes: { value: 0, unit: 'minutes' },
      decimalHours: { value: '0.00', unit: 'hours' }
    }
  });
});

it('rejects breaks over the interval and minutes over 1439', () => {
  const options = {
    contractVersion: CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: 2
  } as const;
  expect(
    calculateWorkHours(
      {
        startMinutes: { value: '540', unit: 'minutes' },
        endMinutes: { value: '1020', unit: 'minutes' },
        overnight: 'no',
        breakMinutes: { value: '500', unit: 'minutes' }
      },
      options
    )
  ).toEqual({
    ok: false,
    error: { code: 'domain_error', field: 'break_minutes' }
  });
  expect(
    calculateWorkHours(
      {
        startMinutes: { value: '1440', unit: 'minutes' },
        endMinutes: { value: '1020', unit: 'minutes' },
        overnight: 'no',
        breakMinutes: { value: '0', unit: 'minutes' }
      },
      options
    )
  ).toEqual({
    ok: false,
    error: { code: 'domain_error', field: 'start_minutes' }
  });
});
