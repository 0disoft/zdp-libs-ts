import { isRecord } from '../../internal/record.js';
import { divideAsPercent, subtractDecimals } from '../core/decimal.js';
import { parseNamedDecimal, parseOptions } from '../core/input.js';
import { failure } from '../core/result.js';
export function calculatePercentageChange(input, options) {
    const parsedOptions = parseOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    const initial = parseNamedDecimal(input.initialValue, 'initial_value');
    if (!initial.ok) {
        return initial;
    }
    const final = parseNamedDecimal(input.finalValue, 'final_value');
    if (!final.ok) {
        return final;
    }
    if (initial.value.coefficient === 0n) {
        return failure('denominator_zero', 'initial_value');
    }
    const change = subtractDecimals(final.value, initial.value);
    return {
        ok: true,
        value: {
            percentageChange: {
                value: divideAsPercent(change, initial.value, parsedOptions.value.decimalPlaces),
                unit: 'percent'
            }
        }
    };
}
//# sourceMappingURL=percentage-change.js.map