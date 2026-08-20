import { isRecord } from '../../internal/record.js';
import { decimalToRational } from '../core/decimal.js';
import {
  parseFixedUnitInteger,
  parseNamedDecimal,
  parseNamedUnitDecimal,
  parseOptions
} from '../core/input.js';
import { failure } from '../core/result.js';
import {
  divideRationals,
  formatRational,
  multiplyRationals,
  type Rational
} from '../core/rational.js';
import type {
  CalculatorExecutionOptions,
  CalculatorResult,
  FuelCostInput,
  FuelCostOutput
} from '../types.js';

export function calculateFuelCost(
  input: FuelCostInput,
  options: CalculatorExecutionOptions
): CalculatorResult<FuelCostOutput>;
export function calculateFuelCost(
  input: unknown,
  options: unknown
): CalculatorResult<FuelCostOutput>;
export function calculateFuelCost(
  input: unknown,
  options: unknown
): CalculatorResult<FuelCostOutput> {
  const parsedOptions = parseOptions(options);
  if (!parsedOptions.ok) {
    return parsedOptions;
  }
  if (!isRecord(input)) {
    return failure('invalid_input');
  }
  const economyUnit = input.economyUnit;
  const trip = input.trip;
  if (
    economyUnit !== 'km_per_liter' &&
    economyUnit !== 'liters_per_100km' &&
    economyUnit !== 'miles_per_gallon'
  ) {
    return failure('invalid_input', 'economy_unit');
  }
  if (trip !== 'one-way' && trip !== 'round-trip') {
    return failure('invalid_input', 'trip');
  }
  const distance = parseNamedDecimal(input.distance, 'distance');
  if (!distance.ok) {
    return distance;
  }
  if (distance.value.coefficient < 0n) {
    return failure('domain_error', 'distance');
  }
  const economy = parseNamedDecimal(input.economy, 'economy');
  if (!economy.ok) {
    return economy;
  }
  if (
    economy.value.coefficient < 0n ||
    (economyUnit !== 'liters_per_100km' && economy.value.coefficient === 0n)
  ) {
    return failure('domain_error', 'economy');
  }
  const fuelPrice = parseNamedUnitDecimal(input.fuelPrice, 'fuel_price');
  if (!fuelPrice.ok) {
    return fuelPrice;
  }
  if (fuelPrice.decimal.coefficient < 0n) {
    return failure('domain_error', 'fuel_price.value');
  }
  const peopleCount = parseFixedUnitInteger(
    input.peopleCount,
    'people_count',
    'people',
    false
  );
  if (!peopleCount.ok) {
    return peopleCount;
  }

  const distanceValue = decimalToRational(distance.value);
  const economyValue = decimalToRational(economy.value);
  const price = decimalToRational(fuelPrice.decimal);
  const hundred = { numerator: 100n, denominator: 1n };
  const traveled =
    trip === 'round-trip'
      ? multiplyRationals(distanceValue, {
          numerator: 2n,
          denominator: 1n
        })
      : distanceValue;

  let fuelUsed: Rational;
  let fuelUnit: 'liters' | 'gallons';
  if (economyUnit === 'km_per_liter') {
    fuelUsed = divideRationals(traveled, economyValue);
    fuelUnit = 'liters';
  } else if (economyUnit === 'liters_per_100km') {
    fuelUsed = divideRationals(
      multiplyRationals(traveled, economyValue),
      hundred
    );
    fuelUnit = 'liters';
  } else {
    fuelUsed = divideRationals(traveled, economyValue);
    fuelUnit = 'gallons';
  }

  const totalCost = multiplyRationals(fuelUsed, price);
  const costPerPerson = divideRationals(totalCost, {
    numerator: peopleCount.value,
    denominator: 1n
  });
  const places = parsedOptions.value.decimalPlaces;
  return {
    ok: true,
    value: {
      fuelUsed: {
        value: formatRational(fuelUsed, places),
        unit: fuelUnit
      },
      totalCost: {
        value: formatRational(totalCost, places),
        unit: fuelPrice.unit
      },
      costPerPerson: {
        value: formatRational(costPerPerson, places),
        unit: fuelPrice.unit
      }
    }
  };
}
