# CHECKLIST.md

이 저장소는 ZDP TypeScript 공통 계약 package와 순수 계산 엔진을 소유한다. 작업 전 변경 대상이 package boundary, API source handoff, schema/env/event/error/i18n/glossary contract, calculator engine, glossary locale copy, public export 중 어디인지 먼저 고른다.

## 공통 경계

- 제품별 domain model, provider SDK wrapper, runtime validator, framework adapter, auth/payment/ledger/privacy business rule을 넣지 않는다.
- 실제 secret, token, API key, webhook secret, customer payload, provider raw response, internal dashboard URL을 source, contract, glossary, tests, docs에 넣지 않는다.
- 이 package는 `zdp-api-contracts` metadata를 소비하지만 API route/error/webhook/SDK input source of truth가 되면 안 된다.
- Helper 함수가 제품별 권한, 결제, 원장, privacy 정책을 숨기면 안 된다.

## Package Exports

- Public exports는 root, `./schema`, `./env-contract`, `./event-contracts`, `./error`, `./i18n-contract`, `./glossary-contract`, `./calculator-engine`이다.
- Export skeleton은 common metadata와 type entry를 고정하기 위한 것이며 runtime framework adapter가 아니다.
- Package API 변경은 downstream SDK와 API contracts에 영향을 주므로 version impact와 changelog review가 필요하다.

## API Source Handoff

- `contracts/api-contract-source.yaml`은 `zdp-api-contracts`의 route/error/webhook/SDK generation input/API catalog 계약을 소비한다.
- `request_id`, `trace_id`, `idempotency`, `success_statuses`, `event_type`, SDK target metadata가 API source와 drift 나면 package work를 멈춘다.
- API 원천을 복사하거나 재정의하지 않는다.

## Calculator Engine

- `percentage-change`, `margin-markup`, `break-even-point`, `data-transfer-time`은 sibling `zdp-api-contracts`의 reviewed 1.0.0 정의와 적합성 벡터를 따른다.
- decimal 입력은 로케일 구분자가 없는 canonical ASCII string이며 내부 비율 계산은 `BigInt`로 정확하게 수행한다.
- 결과 반올림은 호출자가 지정한 0-100 소수 자리에서 half-away-from-zero로 한 번만 수행한다.
- 제품 페이지, 번역, locale parsing, SEO, 광고, 크레딧, 세금·노동·규제 규칙은 엔진 경계 밖이다.

## Glossary

- Base term의 `canonical_label`은 locale-neutral 기준 이름이다.
- Locale label, aliases, match phrases, reviewed copy는 `glossary/locales/<locale>/**`가 소유한다.
- 공통 term에는 site route, product-specific screen, adoption policy를 넣지 않는다.
- Locale `short`/`long` 길이와 문단 규칙은 checker가 강제하는 계약으로 본다.

## Security

- Error contract는 stack trace, raw provider error, SQL, internal URL, customer payload를 public error surface에 넣지 않는다.
- Env contract는 secret value가 아니라 secret shape와 metadata만 다룬다.
- Event contract는 request/trace/audit reference를 잃지 않는다.
