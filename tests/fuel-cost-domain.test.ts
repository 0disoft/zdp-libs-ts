import { describe, expect, it } from 'bun:test';
import {
  CALCULATOR_CONTRACT_VERSION,
  calculateFuelCost
} from '../src/calculator-engine/index';

const options = {
  contractVersion: CALCULATOR_CONTRACT_VERSION,
  decimalPlaces: 2
} as const;

const baseInput = {
  distance: '100',
  fuelPrice: { value: '1.50', unit: 'USD' },
  peopleCount: { value: '1', unit: 'people' },
  economyUnit: 'liters_per_100km',
  trip: 'one-way'
} as const;

describe('fuel cost economy domain', () => {
  it('rejects negative liters-per-100km consumption', () => {
    const result = calculateFuelCost(
      { ...baseInput, economy: '-8' },
      options
    );

    expect(result).toEqual({
      ok: false,
      error: { code: 'domain_error', field: 'economy' }
    });
  });

  it('keeps zero liters-per-100km consumption valid', () => {
    const result = calculateFuelCost(
      { ...baseInput, economy: '0' },
      options
    );

    expect(result).toEqual({
      ok: true,
      value: {
        fuelUsed: { value: '0.00', unit: 'liters' },
        totalCost: { value: '0.00', unit: 'USD' },
        costPerPerson: { value: '0.00', unit: 'USD' }
      }
    });
  });
});
