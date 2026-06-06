# zdp-libs-ts

ZDP TypeScript 공통 계약 패키지 저장소다. 초기 목적은 schema, env-contract, event-contracts, error, i18n-contract, glossary-contract의 경계와 금지선을 먼저 고정하는 것이다.

## 현재 범위

- 공통 schema metadata 자리
- `zdp-api-contracts` source contract handoff 기준
- 환경변수 계약 기준
- 이벤트 계약 기준
- 표준 error helper 경계
- i18n message key와 argument contract 기준
- glossary term, manifest, 공개 범위, click sheet interaction contract 기준
- 플랫폼 공통 public glossary term source
- 계약 파일을 읽는 one-shot checker
- `zdp-api-contracts` 실제 route/error/webhook/SDK input/API catalog 계약 드리프트 검사
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

계약 `status`는 현재 대부분 `skeleton`이지만 checker는 `skeleton`, `draft`, `reviewed`, `active` 생명주기 값을 허용한다. 패키지 표면이 성숙해져도 status 문자열 하나 때문에 검증기가 깨지지 않게 하기 위해서다.

## 패키지 표면

현재 public export는 계약 metadata를 받는 얇은 함수와 타입만 제공한다.

- `zdp-libs-ts/schema`
- `zdp-libs-ts/env-contract`
- `zdp-libs-ts/event-contracts`
- `zdp-libs-ts/error`
- `zdp-libs-ts/i18n-contract`
- `zdp-libs-ts/glossary-contract`

이 export skeleton은 제품 모델을 검증하거나 변환하지 않는다. 대신 import 입구를 먼저 고정해서 나중에 제품 repo가 각자 다른 공통 타입 이름을 만들고, 그 타입이 API/SDK와 어긋나는 일을 줄인다.

## 검증

`contracts:check`는 package boundary, API contract source, schema, env, event, error, i18n 계약을 읽고 공통 패키지가 다음 경계를 잃지 않았는지 확인한다. 또한 sibling `zdp-api-contracts`의 route, error envelope, webhook, SDK generation input, API catalog 계약을 읽어 공통 TypeScript 패키지가 실제 API 원천과 다른 메타데이터를 믿지 않는지 확인한다.

- `@zdp/schema`: 제품 domain model이나 DB row shape을 소유하지 않는다.
- API contract source handoff는 `zdp-api-contracts`의 route/error/webhook/`contracts/sdk-generation-input.yaml`/`contracts/apis/catalog.yaml` 계약을 소비하지만, 원천을 다시 만들지 않는다.
- `idempotency` metadata는 재시도와 중복 요청이 같은 의미를 유지하게 해주고, `success_statuses`는 생성 SDK와 문서가 같은 성공 응답 기준을 쓰게 하며, `request_id`/`trace_id`는 SDK와 API 실패를 같은 추적선으로 묶어준다.
- `@zdp/env-contract`: 실제 secret, account id, server IP, provider token 값을 담지 않는다.
- `@zdp/event-contracts`: `request_id`/`trace_id` 전파 기준과 민감 payload 금지 기준을 유지한다.
- `@zdp/error`: stack trace, raw provider error, secret value, customer payload를 공개 오류 표면에 넣지 않는다.
- `@zdp/i18n-contract`: 번역 런타임이 아니라 message key와 argument contract만 소유한다.
- `@zdp/glossary-contract`: 용어 backend, 광고 runtime, 제품별 문구 최종 승인 시스템이 아니라 term metadata, manifest type, click/right-sheet/bottom-sheet interaction 경계만 소유한다.

`glossary/terms/*.yaml`은 여러 공개 사이트에서 반복되는 플랫폼 공통 용어 계약을 namespace별로 소유한다. `glossary/locales/<locale>/*.yaml`은 같은 namespace의 locale 문구, alias, match phrase, 번역 검수 상태를 소유한다. 공통 term 파일에는 사이트별 route나 관련 화면 경로를 넣지 않고, 소비 앱이 manifest 생성 단계에서 붙인다. 공통 파일에 `products`, `sites`, `canonical_path`를 넣지 않는 이유는 새 public site가 같은 용어를 다시 쓰면서도 자기 화면 구조를 따로 결정하게 하기 위해서다.

공통 glossary 문구는 특정 제품, 회사, 내부 시스템의 채택 기준을 설명하지 않는다. 대중적으로 널리 통용될 수 있는 개념 설명만 두고, 제품별 적용 방식이나 관련 화면 설명은 소비 앱의 local glossary나 페이지 콘텐츠가 소유한다.

Glossary locale 문구에서 `short`는 정확히 1문단, 1-2문장으로 쓴다. `long`은 상세 sheet 본문이므로 2-3문단으로 쓰고, 각 문단은 3-5문장으로 유지한다. 설명은 일반적인 중학교 교육을 받은 사람이 충분히 이해할 수 있는 말로 쓴다. `detail_enabled: true`이고 `translation_status: reviewed`인 용어는 `long`을 비워둘 수 없다.

API source input drift 검사는 `idempotency`, `success_statuses`, `request_id`, `trace_id`, `event_type`, SDK generation target, API catalog route metadata 같은 값이 API repo와 libs repo에서 서로 다르게 선언되는 일을 막는다. `idempotency`가 맞아야 재시도와 중복 요청이 한 번 처리된 것처럼 유지되고, `success_statuses`가 맞아야 클라이언트가 성공 응답을 제멋대로 해석하지 않으며, `request_id`/`trace_id`가 맞아야 SDK 오류를 서버 로그와 같은 추적선에서 찾을 수 있다.

이렇게 해두면 공통 라이브러리가 편의 함수 창고로 변질되거나, 제품별 모델·비밀값·provider 원문 응답이 모든 저장소로 퍼지는 일을 checker 단계에서 먼저 막을 수 있다. 또한 `authorization_header`, `raw_customer_payload`, `screen_component_payload` 같은 값이 공통 타입 재료로 굳어지는 것을 막아 SDK와 API 계약이 민감한 운영 데이터를 끌고 다니지 않게 한다.

```bash
bun run check
bun run contracts:check
bun scripts/check-libs-contracts.ts --api-contracts-root ../zdp-api-contracts
```

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소를 대상으로 실행한다.

```bash
bun src/cli.ts validate --architecture ..\..\docs\zdp-architecture --repository ..\..\contracts\zdp-libs-ts --json
```
