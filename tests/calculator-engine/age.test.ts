import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateAge } from '../../src/calculator-engine/calculators/age';
import type { AgeOutput } from '../../src/calculator-engine/types';
import {
  describeCalculatorConformance,
  exactOptions
} from './conformance';

describeCalculatorConformance(
  'age',
  (testCase) =>
    calculateAge(
      {
        birthDate: testCase.input.birth_date,
        referenceDate: testCase.input.reference_date
      },
      exactOptions(testCase)
    ),
  (value) => {
    const output = value as AgeOutput;
    return {
      age_years: output.ageYears,
      age_months: output.ageMonths,
      age_days: output.ageDays,
      days_lived: output.daysLived,
      days_until_next_birthday: output.daysUntilNextBirthday
    };
  }
);

it('borrows days from the previous month for month-end birthdays', () => {
  expect(
    calculateAge(
      { birthDate: '2020-01-31', referenceDate: '2020-03-01' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION }
    )
  ).toEqual({
    ok: true,
    value: {
      ageYears: { value: 0, unit: 'years' },
      ageMonths: { value: 1, unit: 'months' },
      ageDays: { value: 1, unit: 'days' },
      daysLived: { value: 30, unit: 'days' },
      daysUntilNextBirthday: { value: 336, unit: 'days' }
    }
  });
});

it('does not report twelve months for a leap-day birthday', () => {
  expect(
    calculateAge(
      { birthDate: '1996-02-29', referenceDate: '2024-02-28' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION }
    )
  ).toEqual({
    ok: true,
    value: {
      ageYears: { value: 27, unit: 'years' },
      ageMonths: { value: 11, unit: 'months' },
      ageDays: { value: 30, unit: 'days' },
      daysLived: { value: 10226, unit: 'days' },
      daysUntilNextBirthday: { value: 1, unit: 'days' }
    }
  });
});

it('rejects timestamps and year zero', () => {
  expect(
    calculateAge(
      { birthDate: '2020-01-01T00:00', referenceDate: '2021-01-01' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION }
    )
  ).toEqual({
    ok: false,
    error: { code: 'invalid_input', field: 'birth_date' }
  });
  expect(
    calculateAge(
      { birthDate: '0000-01-01', referenceDate: '0001-01-01' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION }
    )
  ).toEqual({
    ok: false,
    error: { code: 'limit_exceeded', field: 'birth_date' }
  });
});
