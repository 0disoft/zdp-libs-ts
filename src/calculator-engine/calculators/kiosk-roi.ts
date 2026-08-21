import { isRecord } from '../../internal/record.js';
import { decimalToRational } from '../core/decimal.js';
import {
  parseNamedUnitDecimal,
  parseOptions,
  sameUnits
} from '../core/input.js';
import { failure } from '../core/result.js';
import {
  addRationals,
  divideRationals,
  formatRational,
  subtractRationals
} from '../core/rational.js';
import type {
  CalculatorExecutionOptions,
  CalculatorResult,
  KioskRoiInput,
  KioskRoiOutput
} from '../types.js';

export function calculateKioskRoi(
  input: KioskRoiInput,
  options: CalculatorExecutionOptions
): CalculatorResult<KioskRoiOutput>;
export function calculateKioskRoi(
  input: unknown,
  options: unknown
): CalculatorResult<KioskRoiOutput>;
export function calculateKioskRoi(
  input: unknown,
  options: unknown
): CalculatorResult<KioskRoiOutput> {
  const parsedOptions = parseOptions(options);
  if (!parsedOptions.ok) {
    return parsedOptions;
  }
  if (!isRecord(input)) {
    return failure('invalid_input');
  }
  const investment = parseNamedUnitDecimal(
    input.initialInvestment,
    'initial_investment'
  );
  if (!investment.ok) {
    return investment;
  }
  const revenue = parseNamedUnitDecimal(
    input.monthlyIncrementalRevenue,
    'monthly_incremental_revenue'
  );
  if (!revenue.ok) {
    return revenue;
  }
  const labor = parseNamedUnitDecimal(
    input.monthlyLaborSavings,
    'monthly_labor_savings'
  );
  if (!labor.ok) {
    return labor;
  }
  const operating = parseNamedUnitDecimal(
    input.monthlyAdditionalOperatingCost,
    'monthly_additional_operating_cost'
  );
  if (!operating.ok) {
    return operating;
  }
  if (
    [investment, revenue, labor, operating].some(
      (value) => value.decimal.coefficient < 0n
    )
  ) {
    return failure('domain_error');
  }
  if (!sameUnits(investment.unit, revenue.unit, labor.unit, operating.unit)) {
    return failure('incompatible_units');
  }
  const net = subtractRationals(
    addRationals(
      decimalToRational(revenue.decimal),
      decimalToRational(labor.decimal)
    ),
    decimalToRational(operating.decimal)
  );
  if (net.numerator <= 0n) {
    return failure('domain_error', 'monthly_net_benefit');
  }
  const payback = divideRationals(decimalToRational(investment.decimal), net);
  const places = parsedOptions.value.decimalPlaces;
  return {
    ok: true,
    value: {
      monthlyNetBenefit: {
        value: formatRational(net, places),
        unit: investment.unit
      },
      paybackMonths: {
        value: formatRational(payback, places),
        unit: 'months'
      }
    }
  };
}
