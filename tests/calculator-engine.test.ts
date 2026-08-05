import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CALCULATOR_CONTRACT_VERSION,
  calculateAge,
  calculateBreakEvenPoint,
  calculateCompoundInterest,
  calculateDataTransferTime,
  calculateDateDifference,
  calculateDiscount,
  calculateFuelCost,
  calculateKioskRoi,
  calculateLockerRevenue,
  calculateMarginMarkup,
  calculatePercentageChange,
  calculateSecurityCostBreakEven,
  calculateStudycafeBreakEven,
  calculateStudycafeSeatOccupancy,
  calculateStudyRoomScheduleRevenue,
  calculateUnattendedLaborSavings,
  calculateWorkHours
} from '../src/calculator-engine/index';
import type { CalculatorErrorCode } from '../src/calculator-engine/index';

interface ConformanceCase {
  readonly id: string;
  readonly calculatorId:
    | 'percentage-change'
    | 'margin-markup'
    | 'break-even-point'
    | 'data-transfer-time'
    | 'date-difference'
    | 'compound-interest'
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
  readonly input: Readonly<Record<string, unknown>>;
  readonly decimalPlaces: number | undefined;
  readonly expected:
    | {
        readonly status: 'success';
        readonly output: Readonly<
          Record<string, { readonly value: string | number; readonly unit: string }>
        >;
      }
    | {
        readonly status: 'error';
        readonly errorCode: CalculatorErrorCode;
      };
}

describe('calculator engine', () => {
  const cases = loadConformanceCases();

  for (const testCase of cases) {
    it(`matches ${testCase.id}`, () => {
      const result = runConformanceCase(testCase);
      if (testCase.expected.status === 'error') {
        expect(result.ok).toBe(false);
        if (result.ok) {
          throw new Error(`Expected ${testCase.id} to fail.`);
        }
        expect(result.error.code).toBe(testCase.expected.errorCode);
        return;
      }

      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error(`Expected ${testCase.id} to succeed.`);
      }
      expect(toContractOutput(result.value)).toEqual(testCase.expected.output);
    });
  }

  it('rejects a mismatched contract version', () => {
    const result = calculatePercentageChange(
      { initialValue: '100', finalValue: '125' },
      { contractVersion: '2.0.0', decimalPlaces: 2 }
    );

    expect(result).toEqual({
      ok: false,
      error: { code: 'contract_mismatch' }
    });
  });

  it('rejects inputs over the declared digit limit', () => {
    const result = calculatePercentageChange(
      { initialValue: '1'.repeat(1001), finalValue: '2' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    );

    expect(result).toEqual({
      ok: false,
      error: { code: 'limit_exceeded', field: 'initial_value' }
    });
  });

  it('keeps break-even quantity invariant when all monetary inputs scale equally', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 2
    } as const;
    const base = calculateBreakEvenPoint(
      {
        fixedCost: { value: '1000', unit: 'USD' },
        unitPrice: { value: '50', unit: 'USD' },
        unitVariableCost: { value: '30', unit: 'USD' }
      },
      options
    );
    const scaled = calculateBreakEvenPoint(
      {
        fixedCost: { value: '10000', unit: 'USD' },
        unitPrice: { value: '500', unit: 'USD' },
        unitVariableCost: { value: '300', unit: 'USD' }
      },
      options
    );

    expect(base.ok).toBe(true);
    expect(scaled.ok).toBe(true);
    if (!base.ok || !scaled.ok) {
      throw new Error('Expected scaled break-even inputs to succeed.');
    }
    expect(scaled.value.breakEvenQuantity).toEqual(base.value.breakEvenQuantity);
    expect(scaled.value.contributionMarginPerUnit.value).toBe('200.00');
  });

  it('keeps transfer duration invariant when size and rate scale equally', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 2
    } as const;
    const base = calculateDataTransferTime(
      {
        dataSize: { value: '1', unit: 'gigabyte' },
        dataRate: { value: '100', unit: 'megabits_per_second' }
      },
      options
    );
    const scaled = calculateDataTransferTime(
      {
        dataSize: { value: '10', unit: 'gigabyte' },
        dataRate: { value: '1', unit: 'gigabits_per_second' }
      },
      options
    );

    expect(base.ok).toBe(true);
    expect(scaled.ok).toBe(true);
    if (!base.ok || !scaled.ok) {
      throw new Error('Expected scaled data transfer inputs to succeed.');
    }
    expect(base.value.transferDuration).toEqual(
      scaled.value.transferDuration
    );
    expect(base.value.transferDuration.value).toBe('80.00');
  });

  it('requires exact data-transfer unit tokens without trimming', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 2
    } as const;

    expect(
      calculateDataTransferTime(
        {
          dataSize: { value: '1', unit: ' gigabyte ' },
          dataRate: { value: '100', unit: 'megabits_per_second' }
        },
        options
      )
    ).toEqual({
      ok: false,
      error: { code: 'invalid_input', field: 'data_size.unit' }
    });
    expect(
      calculateDataTransferTime(
        {
          dataSize: { value: '1', unit: 'gigabyte' },
          dataRate: { value: '100', unit: 'bits_per_minute' }
        },
        options
      )
    ).toEqual({
      ok: false,
      error: { code: 'unsupported_unit', field: 'data_rate.unit' }
    });
  });

  it('keeps compound-interest principal scaling exact before final rounding', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 4
    } as const;
    const base = calculateCompoundInterest(
      {
        principal: { value: '10', unit: 'USD' },
        nominalAnnualRate: '0.12',
        compoundingPeriods: '6',
        compoundingFrequency: '12_per_year'
      },
      options
    );
    const scaled = calculateCompoundInterest(
      {
        principal: { value: '100', unit: 'USD' },
        nominalAnnualRate: '0.12',
        compoundingPeriods: '6',
        compoundingFrequency: '12_per_year'
      },
      options
    );

    expect(base.ok).toBe(true);
    expect(scaled.ok).toBe(true);
    if (!base.ok || !scaled.ok) {
      throw new Error('Expected scaled compound-interest inputs to succeed.');
    }
    expect(scaled.value.futureValue.value).toBe('106.1520');
    expect(base.value.futureValue.value).toBe('10.6152');
    expect(scaled.value.interestEarned.value).toBe('6.1520');
    expect(base.value.interestEarned.value).toBe('0.6152');
  });

  it('rejects compound powers whose exact rational would exceed the work budget', () => {
    const result = calculateCompoundInterest(
      {
        principal: { value: '1', unit: 'USD' },
        nominalAnnualRate: '9'.repeat(1000),
        compoundingPeriods: '36500',
        compoundingFrequency: '365_per_year'
      },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    );

    expect(result).toEqual({
      ok: false,
      error: { code: 'limit_exceeded', field: 'compounding_periods' }
    });
  });

  it('keeps occupancy percentages invariant when capacity and usage scale together', () => {
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

  it('keeps payback and break-even quantities invariant under equal monetary scaling', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 4
    } as const;
    const kioskBase = calculateKioskRoi(
      {
        initialInvestment: { value: '6000', unit: 'USD' },
        monthlyIncrementalRevenue: { value: '400', unit: 'USD' },
        monthlyLaborSavings: { value: '300', unit: 'USD' },
        monthlyAdditionalOperatingCost: { value: '100', unit: 'USD' }
      },
      options
    );
    const kioskScaled = calculateKioskRoi(
      {
        initialInvestment: { value: '60000', unit: 'USD' },
        monthlyIncrementalRevenue: { value: '4000', unit: 'USD' },
        monthlyLaborSavings: { value: '3000', unit: 'USD' },
        monthlyAdditionalOperatingCost: { value: '1000', unit: 'USD' }
      },
      options
    );
    const securityBase = calculateSecurityCostBreakEven(
      {
        monthlyBaseFixedCost: { value: '800', unit: 'USD' },
        monthlySecurityCost: { value: '200', unit: 'USD' },
        unitPrice: { value: '50', unit: 'USD' },
        unitVariableCost: { value: '30', unit: 'USD' }
      },
      options
    );
    const securityScaled = calculateSecurityCostBreakEven(
      {
        monthlyBaseFixedCost: { value: '8000', unit: 'USD' },
        monthlySecurityCost: { value: '2000', unit: 'USD' },
        unitPrice: { value: '500', unit: 'USD' },
        unitVariableCost: { value: '300', unit: 'USD' }
      },
      options
    );

    expect(kioskBase.ok).toBe(true);
    expect(kioskScaled.ok).toBe(true);
    expect(securityBase.ok).toBe(true);
    expect(securityScaled.ok).toBe(true);
    if (!kioskBase.ok || !kioskScaled.ok || !securityBase.ok || !securityScaled.ok) {
      throw new Error('Expected scaled payback and break-even inputs to succeed.');
    }
    expect(kioskBase.value.paybackMonths).toEqual(kioskScaled.value.paybackMonths);
    expect(securityBase.value.breakEvenQuantity).toEqual(
      securityScaled.value.breakEvenQuantity
    );
  });

  it('rejects currency drift across each new monetary calculator boundary', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 2
    } as const;

    expect(
      calculateUnattendedLaborSavings(
        {
          currentMonthlyLaborCost: { value: '1000', unit: 'USD' },
          unattendedMonthlyLaborCost: { value: '500', unit: 'EUR' },
          additionalMonthlySystemCost: { value: '100', unit: 'USD' }
        },
        options
      )
    ).toEqual({
      ok: false,
      error: { code: 'incompatible_units' }
    });
    expect(
      calculateLockerRevenue(
        {
          lockerCount: { value: '10', unit: 'lockers' },
          monthlyPricePerLocker: { value: '20', unit: 'USD' },
          utilizationRatio: '0.5',
          monthlyOperatingCost: { value: '50', unit: 'EUR' }
        },
        options
      )
    ).toEqual({
      ok: false,
      error: { code: 'incompatible_units' }
    });
    expect(
      calculateStudyRoomScheduleRevenue(
        {
          bookableRoomHours: { value: '100', unit: 'room_hours' },
          bookingRatio: '0.5',
          averageHourlyPrice: { value: '20', unit: 'USD' },
          monthlyOperatingCost: { value: '50', unit: 'EUR' }
        },
        options
      )
    ).toEqual({
      ok: false,
      error: { code: 'incompatible_units' }
    });
  });

  it('keeps discount rates invariant under equal monetary scaling', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 2
    } as const;
    const base = calculateDiscount(
      {
        originalPrice: { value: '80', unit: 'USD' },
        discountRate1: '10',
        discountRate2: '5',
        mode: 'final-price'
      },
      options
    );
    const scaled = calculateDiscount(
      {
        originalPrice: { value: '800000', unit: 'USD' },
        discountRate1: '10',
        discountRate2: '5',
        mode: 'final-price'
      },
      options
    );

    expect(base.ok).toBe(true);
    expect(scaled.ok).toBe(true);
    if (!base.ok || !scaled.ok) {
      throw new Error('Expected scaled discount inputs to succeed.');
    }
    expect(base.value.totalDiscountPercent).toEqual(
      scaled.value.totalDiscountPercent
    );
    expect(base.value.totalDiscountPercent.value).toBe('14.50');
    expect(base.value.finalPrice.value).toBe('68.40');
    expect(scaled.value.finalPrice.value).toBe('684000.00');
  });

  it('round-trips discount reverse mode with consecutive rates', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 4
    } as const;
    const forward = calculateDiscount(
      {
        originalPrice: { value: '100', unit: 'USD' },
        discountRate1: '20',
        discountRate2: '10',
        mode: 'final-price'
      },
      options
    );
    if (!forward.ok) {
      throw new Error('Expected forward discount to succeed.');
    }
    const reverse = calculateDiscount(
      {
        originalPrice: {
          value: forward.value.finalPrice.value,
          unit: 'USD'
        },
        discountRate1: '20',
        discountRate2: '10',
        mode: 'original-price'
      },
      options
    );

    expect(reverse.ok).toBe(true);
    if (!reverse.ok) {
      throw new Error('Expected reverse discount to succeed.');
    }
    expect(reverse.value.originalPrice.value).toBe('100.0000');
  });

  it('rejects full discount and negative discount rates in both modes', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 2
    } as const;

    expect(
      calculateDiscount(
        {
          originalPrice: { value: '80', unit: 'USD' },
          discountRate1: '100',
          discountRate2: '0',
          mode: 'final-price'
        },
        options
      )
    ).toEqual({
      ok: false,
      error: { code: 'domain_error', field: 'discount_rate_1' }
    });
    expect(
      calculateDiscount(
        {
          originalPrice: { value: '80', unit: 'USD' },
          discountRate1: '-1',
          discountRate2: '0',
          mode: 'original-price'
        },
        options
      )
    ).toEqual({
      ok: false,
      error: { code: 'domain_error', field: 'discount_rate_1' }
    });
  });

  it('borrows days from the previous month for month-end birthdays', () => {
    const result = calculateAge(
      { birthDate: '2020-01-31', referenceDate: '2020-03-01' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION }
    );

    expect(result).toEqual({
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

  it('does not report twelve months for a leap-day birthday in a leap year', () => {
    const result = calculateAge(
      { birthDate: '1996-02-29', referenceDate: '2024-02-28' },
      { contractVersion: CALCULATOR_CONTRACT_VERSION }
    );

    expect(result).toEqual({
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

  it('rejects timestamp strings and zero year for age inputs', () => {
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

  it('handles midnight rollover and equal clock times for work hours', () => {
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

  it('rejects breaks over the interval and clock minutes over 1439', () => {
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

  it('keeps fuel consumption equivalent across ratio economy units', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 4
    } as const;
    const perLiter = calculateFuelCost(
      {
        distance: '100',
        economy: '12.5',
        fuelPrice: { value: '1.50', unit: 'USD' },
        peopleCount: { value: '1', unit: 'people' },
        economyUnit: 'km_per_liter',
        trip: 'one-way'
      },
      options
    );
    const per100km = calculateFuelCost(
      {
        distance: '100',
        economy: '8',
        fuelPrice: { value: '1.50', unit: 'USD' },
        peopleCount: { value: '1', unit: 'people' },
        economyUnit: 'liters_per_100km',
        trip: 'one-way'
      },
      options
    );

    expect(perLiter.ok).toBe(true);
    expect(per100km.ok).toBe(true);
    if (!perLiter.ok || !per100km.ok) {
      throw new Error('Expected equivalent fuel economy inputs to succeed.');
    }
    expect(perLiter.value.fuelUsed).toEqual(per100km.value.fuelUsed);
    expect(perLiter.value.fuelUsed).toEqual({
      value: '8.0000',
      unit: 'liters'
    });
  });

  it('rejects malformed, negative, zero economy, and zero people fuel inputs', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 2
    } as const;

    expect(
      calculateFuelCost(
        {
          distance: '1,000',
          economy: '12.5',
          fuelPrice: { value: '1.80', unit: 'USD' },
          peopleCount: { value: '1', unit: 'people' },
          economyUnit: 'km_per_liter',
          trip: 'one-way'
        },
        options
      )
    ).toEqual({
      ok: false,
      error: { code: 'invalid_input', field: 'distance' }
    });
    expect(
      calculateFuelCost(
        {
          distance: '-1',
          economy: '12.5',
          fuelPrice: { value: '1.80', unit: 'USD' },
          peopleCount: { value: '1', unit: 'people' },
          economyUnit: 'km_per_liter',
          trip: 'one-way'
        },
        options
      )
    ).toEqual({
      ok: false,
      error: { code: 'domain_error', field: 'distance' }
    });
    expect(
      calculateFuelCost(
        {
          distance: '100',
          economy: '0',
          fuelPrice: { value: '1.80', unit: 'USD' },
          peopleCount: { value: '0', unit: 'people' },
          economyUnit: 'liters_per_100km',
          trip: 'one-way'
        },
        options
      )
    ).toEqual({
      ok: false,
      error: { code: 'domain_error', field: 'people_count' }
    });
  });

  it('rejects fuel inputs over the declared digit limit', () => {
    const result = calculateFuelCost(
      {
        distance: `1${'0'.repeat(1000)}`,
        economy: '12.5',
        fuelPrice: { value: '1.80', unit: 'USD' },
        peopleCount: { value: '1', unit: 'people' },
        economyUnit: 'km_per_liter',
        trip: 'one-way'
      },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    );

    expect(result).toEqual({
      ok: false,
      error: { code: 'limit_exceeded', field: 'distance' }
    });
  });
});

function runConformanceCase(testCase: ConformanceCase) {
  const contractVersion =
    testCase.expected.status === 'error' &&
    testCase.expected.errorCode === 'contract_mismatch'
      ? '2.0.0'
      : CALCULATOR_CONTRACT_VERSION;
  const options = {
    contractVersion,
    decimalPlaces: testCase.decimalPlaces ?? 0
  } as const;
  if (testCase.calculatorId === 'percentage-change') {
    return calculatePercentageChange(
      {
        initialValue: testCase.input.initial_value,
        finalValue: testCase.input.final_value
      },
      options
    );
  }
  if (testCase.calculatorId === 'margin-markup') {
    return calculateMarginMarkup(
      {
        cost: testCase.input.cost,
        sellingPrice: testCase.input.selling_price
      },
      options
    );
  }
  if (testCase.calculatorId === 'break-even-point') {
    return calculateBreakEvenPoint(
      {
        fixedCost: testCase.input.fixed_cost,
        unitPrice: testCase.input.unit_price,
        unitVariableCost: testCase.input.unit_variable_cost
      },
      options
    );
  }
  if (testCase.calculatorId === 'data-transfer-time') {
    return calculateDataTransferTime(
      {
        dataSize: testCase.input.data_size,
        dataRate: testCase.input.data_rate
      },
      options
    );
  }
  if (testCase.calculatorId === 'date-difference') {
    return calculateDateDifference(
      {
        startDate: testCase.input.start_date,
        endDate: testCase.input.end_date,
        boundaryMode: testCase.input.boundary_mode
      },
      { contractVersion }
    );
  }
  if (testCase.calculatorId === 'compound-interest') {
    return calculateCompoundInterest(
      {
        principal: testCase.input.principal,
        nominalAnnualRate: testCase.input.nominal_annual_rate,
        compoundingPeriods: testCase.input.compounding_periods,
        compoundingFrequency: testCase.input.compounding_frequency
      },
      options
    );
  }
  if (testCase.calculatorId === 'studycafe-seat-occupancy') {
    return calculateStudycafeSeatOccupancy(
      {
        seatCount: testCase.input.seat_count,
        openingDaysPerMonth: testCase.input.opening_days_per_month,
        openingHoursPerDay: testCase.input.opening_hours_per_day,
        occupiedSeatHours: testCase.input.occupied_seat_hours
      },
      options
    );
  }
  if (testCase.calculatorId === 'studycafe-break-even') {
    return calculateStudycafeBreakEven(
      {
        seatCount: testCase.input.seat_count,
        openingDaysPerMonth: testCase.input.opening_days_per_month,
        openingHoursPerDay: testCase.input.opening_hours_per_day,
        averageSeatHourPrice: testCase.input.average_seat_hour_price,
        monthlyFixedCost: testCase.input.monthly_fixed_cost,
        variableCostRatio: testCase.input.variable_cost_ratio
      },
      options
    );
  }
  if (testCase.calculatorId === 'kiosk-roi') {
    return calculateKioskRoi(
      {
        initialInvestment: testCase.input.initial_investment,
        monthlyIncrementalRevenue: testCase.input.monthly_incremental_revenue,
        monthlyLaborSavings: testCase.input.monthly_labor_savings,
        monthlyAdditionalOperatingCost: testCase.input.monthly_additional_operating_cost
      },
      options
    );
  }
  if (testCase.calculatorId === 'unattended-labor-savings') {
    return calculateUnattendedLaborSavings(
      {
        currentMonthlyLaborCost: testCase.input.current_monthly_labor_cost,
        unattendedMonthlyLaborCost: testCase.input.unattended_monthly_labor_cost,
        additionalMonthlySystemCost: testCase.input.additional_monthly_system_cost
      },
      options
    );
  }
  if (testCase.calculatorId === 'locker-revenue') {
    return calculateLockerRevenue(
      {
        lockerCount: testCase.input.locker_count,
        monthlyPricePerLocker: testCase.input.monthly_price_per_locker,
        utilizationRatio: testCase.input.utilization_ratio,
        monthlyOperatingCost: testCase.input.monthly_operating_cost
      },
      options
    );
  }
  if (testCase.calculatorId === 'study-room-schedule-revenue') {
    return calculateStudyRoomScheduleRevenue(
      {
        bookableRoomHours: testCase.input.bookable_room_hours,
        bookingRatio: testCase.input.booking_ratio,
        averageHourlyPrice: testCase.input.average_hourly_price,
        monthlyOperatingCost: testCase.input.monthly_operating_cost
      },
      options
    );
  }
  if (testCase.calculatorId === 'discount') {
    return calculateDiscount(
      {
        originalPrice: testCase.input.original_price,
        discountRate1: testCase.input.discount_rate_1,
        discountRate2: testCase.input.discount_rate_2,
        mode: testCase.input.mode
      },
      options
    );
  }
  if (testCase.calculatorId === 'age') {
    return calculateAge(
      {
        birthDate: testCase.input.birth_date,
        referenceDate: testCase.input.reference_date
      },
      { contractVersion }
    );
  }
  if (testCase.calculatorId === 'work-hours') {
    return calculateWorkHours(
      {
        startMinutes: testCase.input.start_minutes,
        endMinutes: testCase.input.end_minutes,
        overnight: testCase.input.overnight,
        breakMinutes: testCase.input.break_minutes
      },
      options
    );
  }
  if (testCase.calculatorId === 'fuel-cost') {
    return calculateFuelCost(
      {
        distance: testCase.input.distance,
        economy: testCase.input.economy,
        fuelPrice: testCase.input.fuel_price,
        peopleCount: testCase.input.people_count,
        economyUnit: testCase.input.economy_unit,
        trip: testCase.input.trip
      },
      options
    );
  }
  return calculateSecurityCostBreakEven(
    {
      monthlyBaseFixedCost: testCase.input.monthly_base_fixed_cost,
      monthlySecurityCost: testCase.input.monthly_security_cost,
      unitPrice: testCase.input.unit_price,
      unitVariableCost: testCase.input.unit_variable_cost
    },
    options
  );
}

function toContractOutput(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error('Calculator output must be an object.');
  }
  if ('percentageChange' in value) {
    return { percentage_change: value.percentageChange };
  }
  if ('availableSeatHours' in value) {
    return {
      available_seat_hours: value.availableSeatHours,
      occupancy_percentage: value.occupancyPercentage
    };
  }
  if ('breakEvenRevenue' in value) {
    return {
      break_even_revenue: value.breakEvenRevenue,
      break_even_occupancy_percentage: value.breakEvenOccupancyPercentage
    };
  }
  if ('monthlyNetBenefit' in value) {
    return {
      monthly_net_benefit: value.monthlyNetBenefit,
      payback_months: value.paybackMonths
    };
  }
  if ('grossMonthlyLaborSavings' in value) {
    return {
      gross_monthly_labor_savings: value.grossMonthlyLaborSavings,
      net_monthly_savings: value.netMonthlySavings
    };
  }
  if ('bookedRoomHours' in value) {
    return {
      booked_room_hours: value.bookedRoomHours,
      monthly_gross_revenue: value.monthlyGrossRevenue,
      monthly_net_revenue: value.monthlyNetRevenue
    };
  }
  if ('monthlyGrossRevenue' in value) {
    return {
      monthly_gross_revenue: value.monthlyGrossRevenue,
      monthly_net_revenue: value.monthlyNetRevenue
    };
  }
  if ('totalMonthlyFixedCost' in value) {
    return {
      total_monthly_fixed_cost: value.totalMonthlyFixedCost,
      contribution_margin_per_unit: value.contributionMarginPerUnit,
      break_even_quantity: value.breakEvenQuantity
    };
  }
  if ('breakEvenQuantity' in value) {
    return {
      contribution_margin_per_unit: value.contributionMarginPerUnit,
      break_even_quantity: value.breakEvenQuantity
    };
  }
  if ('transferDuration' in value) {
    return { transfer_duration: value.transferDuration };
  }
  if ('calendarDayCount' in value) {
    return { calendar_day_count: value.calendarDayCount };
  }
  if ('futureValue' in value) {
    return {
      future_value: value.futureValue,
      interest_earned: value.interestEarned
    };
  }
  if ('originalPrice' in value) {
    return {
      original_price: value.originalPrice,
      final_price: value.finalPrice,
      total_savings: value.totalSavings,
      total_discount_percent: value.totalDiscountPercent
    };
  }
  if ('ageYears' in value) {
    return {
      age_years: value.ageYears,
      age_months: value.ageMonths,
      age_days: value.ageDays,
      days_lived: value.daysLived,
      days_until_next_birthday: value.daysUntilNextBirthday
    };
  }
  if ('totalMinutes' in value) {
    return {
      total_minutes: value.totalMinutes,
      decimal_hours: value.decimalHours
    };
  }
  if ('fuelUsed' in value) {
    return {
      fuel_used: value.fuelUsed,
      total_cost: value.totalCost,
      cost_per_person: value.costPerPerson
    };
  }
  return {
    margin_percentage: value.marginPercentage,
    markup_percentage: value.markupPercentage
  };
}

function loadConformanceCases(): readonly ConformanceCase[] {
  const source = readFileSync(
    join(
      process.cwd(),
      '..',
      'zdp-api-contracts',
      'contracts',
      'calculators',
      'conformance.yaml'
    ),
    'utf8'
  );
  const document = Bun.YAML.parse(source) as unknown;
  if (!isRecord(document) || !Array.isArray(document.cases)) {
    throw new Error('Calculator conformance document must contain cases.');
  }
  return document.cases.map(parseConformanceCase);
}

function parseConformanceCase(value: unknown, index: number): ConformanceCase {
  if (!isRecord(value)) {
    throw new Error(`Conformance case ${index} must be an object.`);
  }
  const id = requireString(value.id, `cases[${index}].id`);
  const calculatorId = requireString(
    value.calculator_id,
    `cases[${index}].calculator_id`
  );
  if (
    calculatorId !== 'percentage-change' &&
    calculatorId !== 'margin-markup' &&
    calculatorId !== 'break-even-point' &&
    calculatorId !== 'data-transfer-time' &&
    calculatorId !== 'date-difference' &&
    calculatorId !== 'compound-interest' &&
    calculatorId !== 'studycafe-seat-occupancy' &&
    calculatorId !== 'studycafe-break-even' &&
    calculatorId !== 'kiosk-roi' &&
    calculatorId !== 'unattended-labor-savings' &&
    calculatorId !== 'locker-revenue' &&
    calculatorId !== 'study-room-schedule-revenue' &&
    calculatorId !== 'security-cost-break-even' &&
    calculatorId !== 'discount' &&
    calculatorId !== 'age' &&
    calculatorId !== 'work-hours' &&
    calculatorId !== 'fuel-cost'
  ) {
    throw new Error(`Unsupported conformance calculator ${calculatorId}.`);
  }
  if (!isRecord(value.input) || !isRecord(value.options)) {
    throw new Error(`Conformance case ${id} must have input and options.`);
  }
  const decimalPlaces = value.options.decimal_places;
  if (decimalPlaces !== undefined && typeof decimalPlaces !== 'number') {
    throw new Error(`Conformance case ${id} needs numeric decimal_places.`);
  }
  if (!isRecord(value.expected)) {
    throw new Error(`Conformance case ${id} must have expected output.`);
  }
  const status = requireString(value.expected.status, `${id}.expected.status`);
  if (status === 'error') {
    const errorCode = requireString(
      value.expected.error_code,
      `${id}.expected.error_code`
    );
    if (!isCalculatorErrorCode(errorCode)) {
      throw new Error(`Conformance case ${id} has unknown error ${errorCode}.`);
    }
    return {
      id,
      calculatorId,
      input: value.input,
      decimalPlaces,
      expected: {
        status,
        errorCode
      }
    };
  }
  if (status !== 'success' || !isRecord(value.expected.output)) {
    throw new Error(`Conformance case ${id} has invalid success output.`);
  }
  return {
    id,
    calculatorId,
    input: value.input,
    decimalPlaces,
    expected: {
      status,
      output: parseExpectedOutput(value.expected.output, id)
    }
  };
}

function parseExpectedOutput(
  output: Record<string, unknown>,
  caseId: string
): Record<string, { readonly value: string | number; readonly unit: string }> {
  return Object.fromEntries(
    Object.entries(output).map(([key, value]) => {
      if (!isRecord(value)) {
        throw new Error(`${caseId}.expected.output.${key} must be an object.`);
      }
      return [
        key,
        {
          value: requireOutputValue(value.value, `${caseId}.${key}.value`),
          unit: requireString(value.unit, `${caseId}.${key}.unit`)
        }
      ];
    })
  );
}

function requireOutputValue(value: unknown, path: string): string | number {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (typeof value === 'number' && Number.isSafeInteger(value)) {
    return value;
  }
  throw new Error(`${path} must be a non-empty string or safe integer.`);
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${path} must be a non-empty string.`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCalculatorErrorCode(value: string): value is CalculatorErrorCode {
  return [
    'invalid_input',
    'domain_error',
    'limit_exceeded',
    'contract_mismatch',
    'denominator_zero',
    'non_positive_contribution_margin',
    'unsupported_unit',
    'incompatible_units',
    'precision_policy_required',
    'rounding_policy_required',
    'invalid_date_range'
  ].includes(value);
}
