import { isRecord } from '../../internal/record.js';
import { divideAsDecimal, multiplyDecimalByInteger } from '../core/decimal.js';
import { ownUnitMultiplier, parseNamedUnitDecimal, parseOptions } from '../core/input.js';
import { failure } from '../core/result.js';
const DATA_SIZE_TO_BITS = {
    bit: 1n,
    byte: 8n,
    kilobit: 1000n,
    kilobyte: 8000n,
    megabit: 1000000n,
    megabyte: 8000000n,
    gigabit: 1000000000n,
    gigabyte: 8000000000n,
    terabit: 1000000000000n,
    terabyte: 8000000000000n,
    kibibyte: 8192n,
    mebibyte: 8388608n,
    gibibyte: 8589934592n,
    tebibyte: 8796093022208n
};
const DATA_RATE_TO_BITS_PER_SECOND = {
    bits_per_second: 1n,
    kilobits_per_second: 1000n,
    megabits_per_second: 1000000n,
    gigabits_per_second: 1000000000n
};
export function calculateDataTransferTime(input, options) {
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
    const rateMultiplier = ownUnitMultiplier(DATA_RATE_TO_BITS_PER_SECOND, dataRate.unit);
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
                value: divideAsDecimal(multiplyDecimalByInteger(dataSize.decimal, sizeMultiplier), multiplyDecimalByInteger(dataRate.decimal, rateMultiplier), parsedOptions.value.decimalPlaces),
                unit: 'seconds'
            }
        }
    };
}
//# sourceMappingURL=data-transfer-time.js.map