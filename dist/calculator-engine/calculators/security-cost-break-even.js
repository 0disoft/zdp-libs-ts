import { isRecord } from '../../internal/record.js';
import { decimalToRational } from '../core/decimal.js';
import { parseNamedUnitDecimal, parseOptions, sameUnits } from '../core/input.js';
import { failure } from '../core/result.js';
import { addRationals, divideRationals, formatRational, subtractRationals } from '../core/rational.js';
export function calculateSecurityCostBreakEven(input, options) {
    const parsedOptions = parseOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    const base = parseNamedUnitDecimal(input.monthlyBaseFixedCost, 'monthly_base_fixed_cost');
    if (!base.ok) {
        return base;
    }
    const security = parseNamedUnitDecimal(input.monthlySecurityCost, 'monthly_security_cost');
    if (!security.ok) {
        return security;
    }
    const price = parseNamedUnitDecimal(input.unitPrice, 'unit_price');
    if (!price.ok) {
        return price;
    }
    const variable = parseNamedUnitDecimal(input.unitVariableCost, 'unit_variable_cost');
    if (!variable.ok) {
        return variable;
    }
    if (base.decimal.coefficient < 0n) {
        return failure('domain_error', 'monthly_base_fixed_cost');
    }
    if (security.decimal.coefficient < 0n) {
        return failure('domain_error', 'monthly_security_cost');
    }
    if (price.decimal.coefficient <= 0n) {
        return failure('domain_error', 'unit_price');
    }
    if (variable.decimal.coefficient < 0n) {
        return failure('domain_error', 'unit_variable_cost');
    }
    if (!sameUnits(base.unit, security.unit, price.unit, variable.unit)) {
        return failure('incompatible_units');
    }
    const total = addRationals(decimalToRational(base.decimal), decimalToRational(security.decimal));
    const contribution = subtractRationals(decimalToRational(price.decimal), decimalToRational(variable.decimal));
    if (contribution.numerator <= 0n) {
        return failure('non_positive_contribution_margin');
    }
    const quantity = divideRationals(total, contribution);
    const places = parsedOptions.value.decimalPlaces;
    return {
        ok: true,
        value: {
            totalMonthlyFixedCost: {
                value: formatRational(total, places),
                unit: base.unit
            },
            contributionMarginPerUnit: {
                value: formatRational(contribution, places),
                unit: base.unit
            },
            breakEvenQuantity: {
                value: formatRational(quantity, places),
                unit: 'items'
            }
        }
    };
}
//# sourceMappingURL=security-cost-break-even.js.map