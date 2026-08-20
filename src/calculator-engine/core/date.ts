import type { CalculatorResult } from '../types.js';
import { failure } from './result.js';

const CALENDAR_DATE_PATTERN = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;

export interface CivilDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly dayNumber: number;
}

export function parseCivilDateRecord(
  value: unknown,
  field: string
): CalculatorResult<CivilDate> {
  if (typeof value !== 'string') {
    return failure('invalid_input', field);
  }
  const match = CALENDAR_DATE_PATTERN.exec(value);
  if (!match) {
    return failure('invalid_input', field);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year === 0) {
    return failure('limit_exceeded', field);
  }
  if (month < 1 || month > 12) {
    return failure('domain_error', field);
  }
  const monthLengths = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];
  if (day < 1 || day > monthLengths[month - 1]!) {
    return failure('domain_error', field);
  }
  return {
    ok: true,
    value: {
      year,
      month,
      day,
      dayNumber: civilDayNumber(year, month, day)
    }
  };
}

export function parseCivilDate(
  value: unknown,
  field: string
): CalculatorResult<number> {
  const parsed = parseCivilDateRecord(value, field);
  return parsed.ok
    ? { ok: true, value: parsed.value.dayNumber }
    : parsed;
}

function civilDayNumber(year: number, month: number, day: number): number {
  const yearsBefore = year - 1;
  const daysBeforeYear =
    365 * yearsBefore +
    Math.floor(yearsBefore / 4) -
    Math.floor(yearsBefore / 100) +
    Math.floor(yearsBefore / 400);
  let daysBeforeMonth = 0;
  for (let index = 0; index < month - 1; index += 1) {
    daysBeforeMonth += daysInMonth(year, index + 1);
  }
  return daysBeforeYear + daysBeforeMonth + day - 1;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]!;
}

export function clampedBirthday(birth: CivilDate, year: number): CivilDate {
  const day = Math.min(birth.day, daysInMonth(year, birth.month));
  return {
    year,
    month: birth.month,
    day,
    dayNumber: civilDayNumber(year, birth.month, day)
  };
}

function addMonthsForAge(
  value: CivilDate,
  months: number,
  birthdayDay: number
): CivilDate {
  const totalMonths = value.year * 12 + value.month - 1 + months;
  const year = Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  return clampedBirthday({ ...value, month, day: birthdayDay }, year);
}

export function ageComponents(
  birth: CivilDate,
  reference: CivilDate
): {
  readonly years: number;
  readonly months: number;
  readonly days: number;
} {
  const anchor = clampedBirthday(birth, reference.year);
  let years = reference.year - birth.year;
  if (reference.dayNumber < anchor.dayNumber) {
    years -= 1;
  }
  const yearAnchor = clampedBirthday(birth, birth.year + years);
  let months =
    (reference.year - yearAnchor.year) * 12 +
    (reference.month - yearAnchor.month);
  const monthCandidate = addMonthsForAge(yearAnchor, months, birth.day);
  if (monthCandidate.dayNumber > reference.dayNumber) {
    months -= 1;
  }
  const monthAnchor = addMonthsForAge(yearAnchor, months, birth.day);
  return {
    years,
    months,
    days: reference.dayNumber - monthAnchor.dayNumber
  };
}
