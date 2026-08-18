# 계산기 카탈로그

> 이 문서는 `zdp-api-contracts/contracts/calculators/catalog.yaml`에서 자동 생성된다. 직접 수정하지 않는다.

| 계산기 ID | 함수 | 계약 | 호환 엔진 | 요구 엔진 | 오류 코드 |
| --- | --- | --- | --- | --- | --- |
| `percentage-change` | `calculatePercentageChange` | `1.0.0` | `0.x` | `0.x` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `denominator_zero`, `precision_policy_required`, `rounding_policy_required` |
| `margin-markup` | `calculateMarginMarkup` | `1.0.0` | `0.x` | `0.x` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `denominator_zero`, `incompatible_units`, `precision_policy_required`, `rounding_policy_required` |
| `break-even-point` | `calculateBreakEvenPoint` | `1.0.0` | `0.x` | `0.x` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `non_positive_contribution_margin`, `incompatible_units`, `precision_policy_required`, `rounding_policy_required` |
| `compound-interest` | `calculateCompoundInterest` | `1.0.0` | `0.4.0`, `0.5.0`, `0.6.0` | `0.6.0` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `precision_policy_required`, `rounding_policy_required` |
| `data-transfer-time` | `calculateDataTransferTime` | `1.0.0` | `0.3.0`, `0.4.0`, `0.5.0`, `0.6.0` | `0.6.0` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `unsupported_unit`, `precision_policy_required`, `rounding_policy_required` |
| `date-difference` | `calculateDateDifference` | `1.0.0` | `0.4.0`, `0.5.0`, `0.6.0` | `0.6.0` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `invalid_date_range` |
| `studycafe-seat-occupancy` | `calculateStudycafeSeatOccupancy` | `1.0.0` | `0.5.0` | `0.5.0` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `denominator_zero`, `precision_policy_required`, `rounding_policy_required` |
| `studycafe-break-even` | `calculateStudycafeBreakEven` | `1.0.0` | `0.5.0` | `0.5.0` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `denominator_zero`, `incompatible_units`, `precision_policy_required`, `rounding_policy_required` |
| `kiosk-roi` | `calculateKioskRoi` | `1.0.0` | `0.5.0` | `0.5.0` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `denominator_zero`, `incompatible_units`, `precision_policy_required`, `rounding_policy_required` |
| `unattended-labor-savings` | `calculateUnattendedLaborSavings` | `1.0.0` | `0.5.0` | `0.5.0` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `incompatible_units`, `precision_policy_required`, `rounding_policy_required` |
| `locker-revenue` | `calculateLockerRevenue` | `1.0.0` | `0.5.0` | `0.5.0` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `incompatible_units`, `precision_policy_required`, `rounding_policy_required` |
| `study-room-schedule-revenue` | `calculateStudyRoomScheduleRevenue` | `1.0.0` | `0.5.0` | `0.5.0` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `incompatible_units`, `precision_policy_required`, `rounding_policy_required` |
| `security-cost-break-even` | `calculateSecurityCostBreakEven` | `1.0.0` | `0.5.0` | `0.5.0` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `non_positive_contribution_margin`, `incompatible_units`, `precision_policy_required`, `rounding_policy_required` |
| `discount` | `calculateDiscount` | `1.0.0` | `0.x` | `0.x` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `precision_policy_required`, `rounding_policy_required` |
| `age` | `calculateAge` | `1.0.0` | `0.x` | `0.x` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `invalid_date_range` |
| `work-hours` | `calculateWorkHours` | `1.0.0` | `0.x` | `0.x` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `precision_policy_required`, `rounding_policy_required` |
| `fuel-cost` | `calculateFuelCost` | `1.0.0` | `0.x` | `0.x` | `invalid_input`, `domain_error`, `limit_exceeded`, `contract_mismatch`, `precision_policy_required`, `rounding_policy_required` |

생성 명령은 `bun run calculator-catalog:generate`, 동기화 검사는 `bun run calculator-catalog:check`다.
