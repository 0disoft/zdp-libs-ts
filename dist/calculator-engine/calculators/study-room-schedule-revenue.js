import { isRecord } from '../../internal/record.js';
import { decimalToRational } from '../core/decimal.js';
import { parseFixedUnitDecimal, parseNamedUnitDecimal, parseOptions, parseRatio } from '../core/input.js';
import { failure } from '../core/result.js';
import { formatRational, multiplyRationals, subtractRationals } from '../core/rational.js';
export function calculateStudyRoomScheduleRevenue(input, options) {
    const parsedOptions = parseOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    const hours = parseFixedUnitDecimal(input.bookableRoomHours, 'bookable_room_hours', 'room_hours');
    if (!hours.ok) {
        return hours;
    }
    const ratio = parseRatio(input.bookingRatio, 'booking_ratio', true);
    if (!ratio.ok) {
        return ratio;
    }
    const price = parseNamedUnitDecimal(input.averageHourlyPrice, 'average_hourly_price');
    if (!price.ok) {
        return price;
    }
    const operating = parseNamedUnitDecimal(input.monthlyOperatingCost, 'monthly_operating_cost');
    if (!operating.ok) {
        return operating;
    }
    if (hours.decimal.coefficient < 0n) {
        return failure('domain_error', 'bookable_room_hours');
    }
    if (price.decimal.coefficient < 0n) {
        return failure('domain_error', 'average_hourly_price');
    }
    if (operating.decimal.coefficient < 0n) {
        return failure('domain_error', 'monthly_operating_cost');
    }
    if (price.unit !== operating.unit) {
        return failure('incompatible_units');
    }
    const booked = multiplyRationals(decimalToRational(hours.decimal), ratio.value);
    const gross = multiplyRationals(booked, decimalToRational(price.decimal));
    const net = subtractRationals(gross, decimalToRational(operating.decimal));
    const places = parsedOptions.value.decimalPlaces;
    return {
        ok: true,
        value: {
            bookedRoomHours: {
                value: formatRational(booked, places),
                unit: 'room_hours'
            },
            monthlyGrossRevenue: {
                value: formatRational(gross, places),
                unit: price.unit
            },
            monthlyNetRevenue: {
                value: formatRational(net, places),
                unit: price.unit
            }
        }
    };
}
//# sourceMappingURL=study-room-schedule-revenue.js.map