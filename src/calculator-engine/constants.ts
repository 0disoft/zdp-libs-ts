export const CALCULATOR_ENGINE_VERSION = '0.6.0' as const;
export const CALCULATOR_CONTRACT_VERSION = '1.0.0' as const;
export const CALCULATOR_ROUNDING_MODE = 'half_away_from_zero' as const;
export const CALCULATOR_MAX_INPUT_DIGITS = 1000 as const;
export const CALCULATOR_MAX_DECIMAL_PLACES = 100 as const;

export const DATA_SIZE_UNITS = [
  'bit',
  'byte',
  'kilobit',
  'kilobyte',
  'megabit',
  'megabyte',
  'gigabit',
  'gigabyte',
  'terabit',
  'terabyte',
  'kibibyte',
  'mebibyte',
  'gibibyte',
  'tebibyte'
] as const;

export const DATA_RATE_UNITS = [
  'bits_per_second',
  'kilobits_per_second',
  'megabits_per_second',
  'gigabits_per_second'
] as const;

export const DATE_BOUNDARY_MODES = ['exclusive', 'inclusive'] as const;
export const DISCOUNT_MODES = ['final-price', 'original-price'] as const;
export const OVERNIGHT_MODES = ['no', 'yes'] as const;
export const FUEL_ECONOMY_UNITS = [
  'km_per_liter',
  'liters_per_100km',
  'miles_per_gallon'
] as const;
export const TRIP_MODES = ['one-way', 'round-trip'] as const;
export const COMPOUNDING_FREQUENCIES = [
  '1_per_year',
  '2_per_year',
  '4_per_year',
  '12_per_year',
  '365_per_year'
] as const;
export const COMPOUND_INTEREST_MAX_YEARS = 100 as const;
export const COMPOUND_INTEREST_MAX_POWER_DIGITS = 250_000 as const;

export type DataSizeUnit = (typeof DATA_SIZE_UNITS)[number];
export type DataRateUnit = (typeof DATA_RATE_UNITS)[number];
export type DateBoundaryMode = (typeof DATE_BOUNDARY_MODES)[number];
export type DiscountMode = (typeof DISCOUNT_MODES)[number];
export type OvernightMode = (typeof OVERNIGHT_MODES)[number];
export type FuelEconomyUnit = (typeof FUEL_ECONOMY_UNITS)[number];
export type TripMode = (typeof TRIP_MODES)[number];
export type CompoundingFrequency = (typeof COMPOUNDING_FREQUENCIES)[number];
