import { isRecord } from '../../internal/record.js';
import {
  divideAsPercent,
  subtractDecimals
} from '../core/decimal.js';
import {
  parseNamedUnitDecimal,
  parseOptions
} from '../core/input.js';
import { failure } from '../core/result.js';
import type {
  CalculatorExecutionOptions,
  CalculatorResult,
  MarginMarkupInput,
  MarginMarkupOutput
} from '../types.js';

export function calculateMarginMarkup(
  input: MarginMarkupInput,
  options: CalculatorExecutionOptions
): CalculatorResult<MarginMarkupOutput>;
export function calculateMarginMarkup(
  input: unknown,
  options: unknown
): CalculatorResult<MarginMarkupOutput>;
export function calculateMarginMarkup(
  input: unknown,
  options: unknown
): CalculatorResult<MarginMarkupOutput> {
  const parsedOptions = parseOptions(options);
  if (!parsedOptions.ok) {
    return parsedOptions;
  }
  if (!isRecord(input)) {
    return failure('invalid_input');
  }

  const cost = parseNamedUnitDecimal(input.cost, 'cost');
  if (!cost.ok) {
    return cost;
  }
  const sellingPrice = parseNamedUnitDecimal(
    input.sellingPrice,
    'selling_price'
  );
  if (!sellingPrice.ok) {
    return sellingPrice;
  }
  if (cost.decimal.coefficient < 0n) {
    return failure('domain_error', 'cost');
  }
  if (sellingPrice.decimal.coefficient < 0n) {
    return failure('domain_error', 'selling_price');
  }
  if (cost.unit !== sellingPrice.unit) {
    return failure('incompatible_units');
  }
  if (
    cost.decimal.coefficient === 0n ||
    sellingPrice.decimal.coefficient === 0n
  ) {
    return failure('denominator_zero');
  }

  const grossProfit = subtractDecimals(sellingPrice.decimal, cost.decimal);
  const decimalPlaces = parsedOptions.value.decimalPlaces;
  return {
    ok: true,
    value: {
      marginPercentage: {
        value: divideAsPercent(
          grossProfit,
          sellingPrice.decimal,
          decimalPlaces
        ),
        unit: 'percent'
      },
      markupPercentage: {
        value: divideAsPercent(grossProfit, cost.decimal, decimalPlaces),
        unit: 'percent'
      }
    }
  };
}
