import { isRecord } from '../../internal/record.js';
import {
  divideAsDecimal,
  formatDecimal,
  subtractDecimals
} from '../core/decimal.js';
import {
  parseNamedUnitDecimal,
  parseOptions
} from '../core/input.js';
import { failure } from '../core/result.js';
import type {
  BreakEvenPointInput,
  BreakEvenPointOutput,
  CalculatorExecutionOptions,
  CalculatorResult
} from '../types.js';

export function calculateBreakEvenPoint(
  input: BreakEvenPointInput,
  options: CalculatorExecutionOptions
): CalculatorResult<BreakEvenPointOutput>;
export function calculateBreakEvenPoint(
  input: unknown,
  options: unknown
): CalculatorResult<BreakEvenPointOutput>;
export function calculateBreakEvenPoint(
  input: unknown,
  options: unknown
): CalculatorResult<BreakEvenPointOutput> {
  const parsedOptions = parseOptions(options);
  if (!parsedOptions.ok) {
    return parsedOptions;
  }
  if (!isRecord(input)) {
    return failure('invalid_input');
  }

  const fixedCost = parseNamedUnitDecimal(input.fixedCost, 'fixed_cost');
  if (!fixedCost.ok) {
    return fixedCost;
  }
  const unitPrice = parseNamedUnitDecimal(input.unitPrice, 'unit_price');
  if (!unitPrice.ok) {
    return unitPrice;
  }
  const unitVariableCost = parseNamedUnitDecimal(
    input.unitVariableCost,
    'unit_variable_cost'
  );
  if (!unitVariableCost.ok) {
    return unitVariableCost;
  }

  if (fixedCost.decimal.coefficient < 0n) {
    return failure('domain_error', 'fixed_cost');
  }
  if (unitPrice.decimal.coefficient <= 0n) {
    return failure('domain_error', 'unit_price');
  }
  if (unitVariableCost.decimal.coefficient < 0n) {
    return failure('domain_error', 'unit_variable_cost');
  }
  if (
    fixedCost.unit !== unitPrice.unit ||
    fixedCost.unit !== unitVariableCost.unit
  ) {
    return failure('incompatible_units');
  }

  const contributionMargin = subtractDecimals(
    unitPrice.decimal,
    unitVariableCost.decimal
  );
  if (contributionMargin.coefficient <= 0n) {
    return failure('non_positive_contribution_margin');
  }

  const decimalPlaces = parsedOptions.value.decimalPlaces;
  return {
    ok: true,
    value: {
      contributionMarginPerUnit: {
        value: formatDecimal(contributionMargin, decimalPlaces),
        unit: fixedCost.unit
      },
      breakEvenQuantity: {
        value: divideAsDecimal(
          fixedCost.decimal,
          contributionMargin,
          decimalPlaces
        ),
        unit: 'items'
      }
    }
  };
}
