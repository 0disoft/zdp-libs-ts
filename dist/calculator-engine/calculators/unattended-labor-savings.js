import { isRecord } from '../../internal/record.js';
import { decimalToRational } from '../core/decimal.js';
import { parseNamedUnitDecimal, parseOptions, sameUnits } from '../core/input.js';
import { failure } from '../core/result.js';
import { formatRational, subtractRationals } from '../core/rational.js';
export function calculateUnattendedLaborSavings(input, options) {
    const parsedOptions = parseOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    const current = parseNamedUnitDecimal(input.currentMonthlyLaborCost, 'current_monthly_labor_cost');
    if (!current.ok) {
        return current;
    }
    const unattended = parseNamedUnitDecimal(input.unattendedMonthlyLaborCost, 'unattended_monthly_labor_cost');
    if (!unattended.ok) {
        return unattended;
    }
    const system = parseNamedUnitDecimal(input.additionalMonthlySystemCost, 'additional_monthly_system_cost');
    if (!system.ok) {
        return system;
    }
    if ([current, unattended, system].some((value) => value.decimal.coefficient < 0n)) {
        return failure('domain_error');
    }
    if (!sameUnits(current.unit, unattended.unit, system.unit)) {
        return failure('incompatible_units');
    }
    const gross = subtractRationals(decimalToRational(current.decimal), decimalToRational(unattended.decimal));
    const net = subtractRationals(gross, decimalToRational(system.decimal));
    const places = parsedOptions.value.decimalPlaces;
    return {
        ok: true,
        value: {
            grossMonthlyLaborSavings: {
                value: formatRational(gross, places),
                unit: current.unit
            },
            netMonthlySavings: {
                value: formatRational(net, places),
                unit: current.unit
            }
        }
    };
}
//# sourceMappingURL=unattended-labor-savings.js.map