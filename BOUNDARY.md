# BOUNDARY.md

## 소유 경계

`zdp-libs-ts`는 TypeScript에서 재사용할 수 있는 ZDP 계약 패키지 경계를 소유한다.

소유한다:

- schema metadata
- API contract source handoff
- env contract
- event contract
- standard error contract
- i18n message key contract
- package contract checker
- public export skeleton

소유하지 않는다:

- 제품별 domain model
- API contract source of truth
- runtime validation engine
- framework adapter
- provider SDK wrapper
- auth, payment, ledger, privacy business rules
- actual secret values, account ids, server IPs, provider tokens
- raw provider errors or customer payload examples

## 분리 트리거

- 특정 package가 독립 versioning과 release cadence를 요구한다.
- SDK 생성과 runtime helper가 서로 다른 compatibility policy를 요구한다.
- package가 특정 framework나 provider에 묶이기 시작한다.
- checker가 특정 제품 domain model을 허용해야만 통과한다.
- 공통 패키지가 `zdp-api-contracts`의 route/error/webhook/SDK input 원천을 대체해야 한다.
