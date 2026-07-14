# BOUNDARY.md

## 소유 경계

`zdp-libs-ts`는 TypeScript에서 재사용할 수 있는 ZDP 계약 패키지 경계를 소유한다.

소유한다:

- schema metadata
- API contract source handoff
- API source input drift check
- env contract
- event contract
- standard error contract
- i18n message key contract
- package contract checker
- public export skeleton
- jurisdiction-neutral pure calculator engine
- exact decimal ratio arithmetic and shared conformance consumption

소유하지 않는다:

- 제품별 domain model
- API contract source of truth
- runtime validation engine
- framework adapter
- provider SDK wrapper
- auth, payment, ledger, privacy business rules
- actual secret values, account ids, server IPs, provider tokens
- raw provider errors or customer payload examples
- copied API route, error, webhook, or SDK generation truth
- product calculator pages, locale parsing or display formatting
- tax, labor, finance, regulatory, advertising, credit, or payment policy
- calculator definition and conformance source truth

## 분리 트리거

- 특정 package가 독립 versioning과 release cadence를 요구한다.
- SDK 생성과 runtime helper가 서로 다른 compatibility policy를 요구한다.
- package가 특정 framework나 provider에 묶이기 시작한다.
- checker가 특정 제품 domain model을 허용해야만 통과한다.
- 공통 패키지가 `zdp-api-contracts`의 route/error/webhook/SDK input 원천을 대체해야 한다.
- API source input drift check 없이 `request_id`, `trace_id`, `idempotency`, `event_type`, SDK target을 공통 패키지 쪽에서 새로 정의해야 한다.
- 계산 엔진이 독립 배포 주기, 다른 언어 구현, 또는 별도 호환 정책을 요구하면 전용 calculator engine 저장소로 분리한다.
