import { expect, it } from 'bun:test';
import { CALCULATOR_CONTRACT_VERSION } from '../../src/calculator-engine/constants';
import { calculateDataTransferTime } from '../../src/calculator-engine/calculators/data-transfer-time';
import type { DataTransferTimeOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'data-transfer-time',
  (testCase) =>
    calculateDataTransferTime(
      {
        dataSize: testCase.input.data_size,
        dataRate: testCase.input.data_rate
      },
      decimalOptions(testCase)
    ),
  (value) => ({
    transfer_duration: (value as DataTransferTimeOutput).transferDuration
  })
);

it('keeps duration invariant when size and rate scale equally', () => {
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
  expect(base.value.transferDuration).toEqual(scaled.value.transferDuration);
  expect(base.value.transferDuration.value).toBe('80.00');
});

it('requires exact unit tokens without trimming', () => {
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
