import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateFuelCost } from '../../src/calculator-engine/calculators/fuel-cost';
import type { FuelCostOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'fuel-cost',
  (testCase) =>
    calculateFuelCost(
      {
        distance: testCase.input.distance,
        economy: testCase.input.economy,
        fuelPrice: testCase.input.fuel_price,
        peopleCount: testCase.input.people_count,
        economyUnit: testCase.input.economy_unit,
        trip: testCase.input.trip
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as FuelCostOutput;
    return {
      fuel_used: output.fuelUsed,
      total_cost: output.totalCost,
      cost_per_person: output.costPerPerson
    };
  }
);

it('keeps fuel use equivalent across ratio economy units', () => {
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

it('rejects malformed distance, negative distance, and zero people', () => {
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

it('rejects distance over the declared digit limit', () => {
  expect(
    calculateFuelCost(
      {
        distance: `1${'0'.repeat(1000)}`,
        economy: '12.5',
        fuelPrice: { value: '1.80', unit: 'USD' },
        peopleCount: { value: '1', unit: 'people' },
        economyUnit: 'km_per_liter',
        trip: 'one-way'
      },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    )
  ).toEqual({
    ok: false,
    error: { code: 'limit_exceeded', field: 'distance' }
  });
});
