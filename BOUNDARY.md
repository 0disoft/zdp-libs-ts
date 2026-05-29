# BOUNDARY.md

## 소유 경계

`zdp-libs-ts`는 TypeScript에서 재사용할 수 있는 ZDP 계약 패키지 경계를 소유한다.

소유한다:

- schema metadata
- env contract
- event contract
- standard error contract
- i18n message key contract

소유하지 않는다:

- 제품별 domain model
- framework adapter
- provider SDK wrapper
- auth, payment, ledger, privacy business rules

## 분리 트리거

- 특정 package가 독립 versioning과 release cadence를 요구한다.
- SDK 생성과 runtime helper가 서로 다른 compatibility policy를 요구한다.
- package가 특정 framework나 provider에 묶이기 시작한다.
