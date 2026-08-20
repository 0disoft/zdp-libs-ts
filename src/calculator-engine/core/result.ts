import type {
  CalculatorErrorCode,
  CalculatorResult
} from '../types.js';

export type CalculatorFailure = Extract<
  CalculatorResult<never>,
  { readonly ok: false }
>;

export function failure(
  code: CalculatorErrorCode,
  field?: string
): CalculatorFailure {
  return field === undefined
    ? { ok: false, error: { code } }
    : { ok: false, error: { code, field } };
}
