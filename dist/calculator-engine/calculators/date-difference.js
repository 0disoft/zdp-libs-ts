import { isRecord } from '../../internal/record.js';
import { parseCivilDate } from '../core/date.js';
import { parseExactIntegerOptions } from '../core/input.js';
import { failure } from '../core/result.js';
export function calculateDateDifference(input, options) {
    const parsedOptions = parseExactIntegerOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    if (input.boundaryMode !== 'exclusive' && input.boundaryMode !== 'inclusive') {
        return failure('invalid_input', 'boundary_mode');
    }
    const start = parseCivilDate(input.startDate, 'start_date');
    if (!start.ok) {
        return start;
    }
    const end = parseCivilDate(input.endDate, 'end_date');
    if (!end.ok) {
        return end;
    }
    if (end.value < start.value) {
        return failure('invalid_date_range');
    }
    return {
        ok: true,
        value: {
            calendarDayCount: {
                value: end.value -
                    start.value +
                    (input.boundaryMode === 'inclusive' ? 1 : 0),
                unit: 'days'
            }
        }
    };
}
//# sourceMappingURL=date-difference.js.map