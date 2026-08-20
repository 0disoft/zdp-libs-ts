import { isRecord } from '../../internal/record.js';
import type {
  DataRateUnit,
  DataSizeUnit
} from '../constants.js';
import {
  divideAsDecimal,
  multiplyDecimalByInteger
} from '../core/decimal.js';
import {
  ownUnitMultiplier,
  parseNamedUnitDecimal,
  parseOptions
} from '../core/input.js';
import { failure } from '../core/result.js';
import type {
  CalculatorExecutionOptions,
  CalculatorResult,
  DataTransferTimeInput,
  DataTransferTimeOutput
} from '../types.js';

const DATA_SIZE_TO_BITS: Readonly<Record<DataSizeUnit, bigint>> = {
  bit: 1n,
  byte: 8n,
  kilobit: 1_000n,
  kilobyte: 8_000n,
  megabit: 1_000_000n,
  megabyte: 8_000_000n,
  gigabit: 1_000_000_000n,
  gigabyte: 8_000_000_000n,
  terabit: 1_000_000_000_000n,
  terabyte: 8_000_000_000_000n,
  kibibyte: 8_192n,
  mebibyte: 8_388_608n,
  gibibyte: 8_589_934_592n,
  tebibyte: 8_796_093_022_208n
};

const DATA_RATE_TO_BITS_PER_SECOND: Readonly<Record<DataRateUnit, bigint>> = {
  bits_per_second: 1n,
  kilobits_per_second: 1_000n,
  megabits_per_second: 1_000_000n,
  gigabits_per_second: 1_000_000_000n
};

export function calculateDataTransferTime(
  input: DataTransferTimeInput,
  options: CalculatorExecutionOptions
): CalculatorResult<DataTransferTimeOutput>;
export function calculateDataTransferTime(
  input: unknown,
  options: unknown
): CalculatorResult<DataTransferTimeOutput>;
export function calculateDataTransferTime(
  input: unknown,
  options: unknown
): CalculatorResult<DataTransferTimeOutput> {
  const parsedOptions = parseOptions(options);
  if (!parsedOptions.ok) {
    return parsedOptions;
  }
  if (!isRecord(input)) {
    return failure('invalid_input');
  }

  const dataSize = parseNamedUnitDecimal(input.dataSize, 'data_size');
  if (!dataSize.ok) {
    return dataSize;
  }
  const dataRate = parseNamedUnitDecimal(input.dataRate, 'data_rate');
  if (!dataRate.ok) {
    return dataRate;
  }

  const sizeMultiplier = ownUnitMultiplier(DATA_SIZE_TO_BITS, dataSize.unit);
  if (sizeMultiplier === undefined) {
    return failure('unsupported_unit', 'data_size.unit');
  }
  const rateMultiplier = ownUnitMultiplier(
    DATA_RATE_TO_BITS_PER_SECOND,
    dataRate.unit
  );
  if (rateMultiplier === undefined) {
    return failure('unsupported_unit', 'data_rate.unit');
  }
  if (dataSize.decimal.coefficient < 0n) {
    return failure('domain_error', 'data_size.value');
  }
  if (dataRate.decimal.coefficient <= 0n) {
    return failure('domain_error', 'data_rate.value');
  }

  return {
    ok: true,
    value: {
      transferDuration: {
        value: divideAsDecimal(
          multiplyDecimalByInteger(dataSize.decimal, sizeMultiplier),
          multiplyDecimalByInteger(dataRate.decimal, rateMultiplier),
          parsedOptions.value.decimalPlaces
        ),
        unit: 'seconds'
      }
    }
  };
}
