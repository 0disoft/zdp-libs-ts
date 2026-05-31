# zdp-libs-ts

ZDP TypeScript 공통 계약 패키지 저장소다. 초기 목적은 schema, env-contract, event-contracts, error, i18n-contract의 경계와 금지선을 먼저 고정하는 것이다.

## 현재 범위

- 공통 schema metadata 자리
- `zdp-api-contracts` source contract handoff 기준
- 환경변수 계약 기준
- 이벤트 계약 기준
- 표준 error helper 경계
- i18n message key와 argument contract 기준
- 계약 파일을 읽는 one-shot checker
- 최소 public export skeleton

## 현재 제외

- 제품별 domain model
- provider SDK wrapper
- 인증, 권한, 결제, 원장 정책 구현
- 실제 package publish
- runtime framework adapter
- 런타임 validator 구현

## 계약

루트 `service.yaml`이 이 저장소의 서비스 계약이다. `contracts/` 아래 파일은 실제 TypeScript package export가 생기기 전에 패키지 경계를 고정하는 skeleton이다.

## 패키지 표면

현재 public export는 계약 metadata를 받는 얇은 함수와 타입만 제공한다.

- `zdp-libs-ts/schema`
- `zdp-libs-ts/env-contract`
- `zdp-libs-ts/event-contracts`
- `zdp-libs-ts/error`
- `zdp-libs-ts/i18n-contract`

이 export skeleton은 제품 모델을 검증하거나 변환하지 않는다. 대신 import 입구를 먼저 고정해서 나중에 제품 repo가 각자 다른 공통 타입 이름을 만들고, 그 타입이 API/SDK와 어긋나는 일을 줄인다.

## 검증

`contracts:check`는 package boundary, API contract source, schema, env, event, error, i18n 계약을 읽고 공통 패키지가 다음 경계를 잃지 않았는지 확인한다.

- `@zdp/schema`: 제품 domain model이나 DB row shape을 소유하지 않는다.
- API contract source handoff는 `zdp-api-contracts`의 route/error/webhook/`contracts/sdk-generation-input.yaml` 계약을 소비하지만, 원천을 다시 만들지 않는다.
- `idempotency` metadata는 재시도와 중복 요청이 같은 의미를 유지하게 해주고, `request_id`/`trace_id`는 SDK와 API 실패를 같은 추적선으로 묶어준다.
- `@zdp/env-contract`: 실제 secret, account id, server IP, provider token 값을 담지 않는다.
- `@zdp/event-contracts`: `request_id`/`trace_id` 전파 기준과 민감 payload 금지 기준을 유지한다.
- `@zdp/error`: stack trace, raw provider error, secret value, customer payload를 공개 오류 표면에 넣지 않는다.
- `@zdp/i18n-contract`: 번역 런타임이 아니라 message key와 argument contract만 소유한다.

이렇게 해두면 공통 라이브러리가 편의 함수 창고로 변질되거나, 제품별 모델·비밀값·provider 원문 응답이 모든 저장소로 퍼지는 일을 checker 단계에서 먼저 막을 수 있다. 또한 `authorization_header`, `raw_customer_payload`, `screen_component_payload` 같은 값이 공통 타입 재료로 굳어지는 것을 막아 SDK와 API 계약이 민감한 운영 데이터를 끌고 다니지 않게 한다.

```bash
bun run check
bun run contracts:check
```

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소를 대상으로 실행한다.

```bash
bun src/cli.ts validate --architecture ..\..\docs\zdp-architecture --repository ..\..\contracts\zdp-libs-ts --json
```
