import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateLockerRevenue } from '../../src/calculator-engine/calculators/locker-revenue';
import type { LockerRevenueOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'locker-revenue',
  (testCase) =>
    calculateLockerRevenue(
      {
        lockerCount: testCase.input.locker_count,
        monthlyPricePerLocker: testCase.input.monthly_price_per_locker,
        utilizationRatio: testCase.input.utilization_ratio,
        monthlyOperatingCost: testCase.input.monthly_operating_cost
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as LockerRevenueOutput;
    return {
      monthly_gross_revenue: output.monthlyGrossRevenue,
      monthly_net_revenue: output.monthlyNetRevenue
    };
  }
);

it('rejects currency drift at its own module boundary', () => {
  expect(
    calculateLockerRevenue(
      {
        lockerCount: { value: '10', unit: 'lockers' },
        monthlyPricePerLocker: { value: '20', unit: 'USD' },
        utilizationRatio: '0.5',
        monthlyOperatingCost: { value: '50', unit: 'EUR' }
      },
      { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
    )
  ).toEqual({ ok: false, error: { code: 'incompatible_units' } });
});
