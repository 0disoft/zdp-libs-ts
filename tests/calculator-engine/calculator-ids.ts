export const CALCULATOR_IDS = [
  'percentage-change',
  'margin-markup',
  'break-even-point',
  'data-transfer-time',
  'date-difference',
  'compound-interest',
  'studycafe-seat-occupancy',
  'studycafe-break-even',
  'kiosk-roi',
  'unattended-labor-savings',
  'locker-revenue',
  'study-room-schedule-revenue',
  'security-cost-break-even',
  'discount',
  'age',
  'work-hours',
  'fuel-cost'
] as const;

export type CalculatorId = (typeof CALCULATOR_IDS)[number];

export function isCalculatorId(value: string): value is CalculatorId {
  return (CALCULATOR_IDS as readonly string[]).includes(value);
}
