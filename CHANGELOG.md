# CHANGELOG.md

## 0.12.0

### Added

- `calculateDateDifference`를 추가해 연도 0001~9999의 엄격한 `YYYY-MM-DD` 날짜를 역산 그레고리력 정수 일수로 계산한다.
- `calculateCompoundInterest`를 추가해 원금, 명목 연이율, 복리 횟수와 빈도를 정확한 유리수로 계산하고 최종 결과만 반올림한다.
- 날짜 경계 방식과 복리 빈도 public 타입·상수, 100년 기간 상한과 정확 거듭제곱 작업량 상한을 추가했다.

### Changed

- 계산 엔진 버전을 `0.4.0`으로 올리고 sibling API의 날짜 차이·복리 적합성 벡터까지 드리프트 검사를 확장했다.

## 0.11.0

### Added

- `calculateDataTransferTime`, `DATA_SIZE_UNITS`, `DATA_RATE_UNITS`와 관련 public 타입을 root 및 `./calculator-engine` export에 추가했다.
- 14개 SI·IEC 데이터 크기 단위와 4개 bits-per-second 전송률 단위를 `BigInt` 정수 배율로 정규화하고 초 단위 전송 시간을 계산한다.
- sibling `zdp-api-contracts` 0.18.0의 전체 데이터 전송 적합성 벡터와 크기·속도 균등 배율 성질 테스트를 추가했다.
- 계약 오류 코드에 `unsupported_unit`, `rounding_policy_required`가 추가되므로 완전한 오류 메시지 맵을 가진 소비자는 두 키를 함께 추가해야 한다.

### Changed

- 계산 엔진 버전을 `0.3.0`으로 올리고 reviewed 계산기 드리프트 검사를 `data-transfer-time`까지 확장했다.

## 0.10.0

### Added

- `calculateBreakEvenPoint`를 root와 `./calculator-engine` public export에 추가했다.
- 고정비, 단가, 단위당 변동비의 통화 일치와 비음수 domain을 검증하고 기여이익이 0 이하일 때 안정 오류를 반환한다.
- sibling `zdp-api-contracts`의 손익분기점 적합성 벡터와 균등 금액 배율 성질 테스트를 추가했다.

### Changed

- 계산 엔진 버전을 `0.2.0`으로 올리고 reviewed 계산기 드리프트 검사를 손익분기점까지 확장했다.

## 0.9.0

### Changed

- 공용 glossary authoring contract에 v2와 `umans/umans-kimi-k2.7` LLM 초안 모델, 1문단 3문장 `short`, 문단별 4문장인 3문단 `long`, 한국어 `-다` 평서형을 추가했다.
- v2 locale 설명에 `copy_provenance` 계약을 추가하고, 사람 검수가 끝나지 않은 LLM 초안을 경고 대상으로 정의했다.
- 기존 무표기 locale 문구는 legacy v1로 유지하고, 새로 작성하거나 다시 작성한 문구부터 `copy_contract_version: 2`를 적용한다.
- 공용 glossary는 실제 공통 계약 회귀에 쓰이는 `security.vault`, `operations.rate-limit` 두 개만 남기고 나머지 미사용 용어를 제거했다.

## 0.8.2

### Changed

- calculator engine과 libs contract checker가 같은 contract version 정본을 사용하고, 내부 object 판별 predicate를 하나로 통합했다.

### Fixed

- API source handoff에서 route, error envelope, SDK generation input 각각의 금지값 누락을 다른 계약 배열이 가리지 못하도록 검증을 강화했다.
- sibling `zdp-api-contracts` 입력 여러 개를 읽지 못할 때 첫 실패만 버리지 않고 파일별 로드 오류를 한 번에 보고하도록 정리했다.

## 0.8.1

### Changed

- npm package export와 file whitelist가 TypeScript source 대신 빌드된 Node 호환 ESM과 declaration을 가리키도록 정리했다.
- npm publish는 `prepack`에서 `dist/`를 재생성하고, commit SHA로 고정한 Git dependency는 검증 후 커밋된 같은 `dist/`를 소비하도록 정리했다.
- 실제 tarball을 빈 Node 소비자에 설치해 root와 `calculator-engine` subpath를 검증하는 package smoke를 추가했다.

## 0.8.0

### Added

- `./calculator-engine` public subpath와 root export에 `percentage-change`, `margin-markup` 순수 계산 함수를 추가했다.
- canonical ASCII decimal string을 `BigInt` 비율로 계산하고 호출자 지정 0-100 소수 자리에서 half-away-from-zero로 반올림하는 공통 숫자 경계를 추가했다.
- `zdp-api-contracts` 1.0.0 계산기 정의와 공통 적합성 벡터를 직접 소비하는 테스트와 드리프트 검사를 추가했다.

### Changed

- package boundary와 API source handoff에 `@zdp/calculator-engine`을 추가하고 제품 화면, locale 표시, 광고·크레딧, 국가별 정책 금지선을 명시했다.

## Unreleased

### Changed

- public npm package 후보 메타데이터, MIT license, package file whitelist를 추가했다.
- error contract와 package boundary에 public API error envelope 필드 기준을 명시했다.

## 0.7.1

### Changed

- public npm package surface에 `SECURITY.md`를 포함해 공통 계약 패키지의 secret, credential, provider response 금지 경계를 명시했다.

## 0.7.0

### Changed

- `check:tsgo` fast typecheck 스크립트와 pinned `@typescript/native-preview` 의존성을 추가했다.
- contract loader 실패 타입 가드와 i18n key 타입 테스트를 native TypeScript checker와 호환되게 정리했다.
- `@zdp/glossary-contract` skeleton export, click/right-sheet/bottom-sheet interaction, package boundary 계약을 추가했다.
- 여러 public site가 공유할 수 있는 `glossary/terms/*.yaml` 공통 용어 계약과 `glossary/locales/<locale>/*.yaml` locale 문구 source를 추가했다.
- 공통 glossary base term에 locale-neutral `canonical_label`을 추가해 AI 작업 지시와 10개 locale 리뷰 기준이 locale label과 섞이지 않게 했다.
- glossary locale `short`는 정확히 1문단 2문장, `long`은 2-3문단과 문단별 정확히 4문장으로 유지하도록 source test를 강화했다.
- 공통 glossary 설명문이 특정 제품, 회사, 내부 시스템의 채택 기준을 담지 않도록 source test와 문서 기준을 강화했다.
- 공통 glossary에 OKLCH, Oklab, Semantic Token, Design Token, Primitive Token, Base Token, Component Token, Theme, Color Scheme, Dark Mode, Light Mode, Focus Ring, Focus Visible, Accessibility, WCAG, Contrast Ratio, User Select, Text Selection, Tooltip, Popover, Menu, Toast, Skeleton, Progress, Spinner, Pagination, Accordion, Disclosure, Segmented Control, Avatar, Identity Chip, Command Field, Sort Header, Astro, Island Architecture, Static Site, Static Site Generation, Server Side Rendering, Client Side Rendering, Hydration, Runtime, Build Time, Bundle, Adapter, Virtual DOM, Runes, Single Page App, SEO, Sitemap, robots.txt, llms.txt, RSS, Atom, JSON Feed, Search Index, Web App Manifest, Locale, i18n, Localization, Message Catalog, Fallback Locale, Translation Status, Font Stack, Web Font, Fontsource, Svelte, SvelteKit, Tauri, WebView, Flutter, Flutter Tokens, Vault, Secret, Credential, API Key, OAuth Token, Webhook Secret, Plaintext, Encryption, Masking, Least Privilege, Consent, Data Minimization, Security Audit Log, Audit Trail, Append-Only, Privacy Access Broker, OWASP ASVS, Session, Permission, Access Control, Rate Limit, Deletion Propagation, Cache 한국어 reviewed 설명을 반영했다.
- API source handoff가 실제 route catalog, auth session schema bundle, session/credential route metadata, SDK error metadata, refresh token plaintext와 stack trace 금지값을 따라가도록 드리프트 검사를 맞췄다.

## 0.6.0

### Added

- API source handoff에 `contracts/apis/catalog.yaml`과 `success_statuses` drift 검증을 추가했다.
- i18n message key를 `domain.message_name` 형태의 TypeScript template literal type으로 좁혔다.
- local contract loader가 여러 YAML 포맷 오류를 한 번에 모아 보고하도록 개선했다.

### Changed

- contract status 검증을 `skeleton` 고정값에서 `skeleton`/`draft`/`reviewed`/`active` 생명주기 allowlist로 완화했다.
- sibling `zdp-api-contracts` 로딩을 비동기 I/O로 통일했다.
- YAML 파싱을 Bun 내장 `Bun.YAML.parse`로 통일하고 외부 `yaml` 의존성을 제거했다.

### Added

- TypeScript 공통 계약 패키지 저장소 골격을 추가했다.
- package boundary, env contract, error contract skeleton을 추가했다.
- schema, event, i18n contract skeleton을 추가했다.
- package boundary, schema, env, event, error, i18n 계약을 읽는 repo-local checker skeleton을 추가했다.
- API contract source handoff 계약과 checker 검증을 추가했다.
- `zdp-api-contracts`의 route/error/webhook/SDK input 계약을 읽는 API source input drift 검증을 추가했다.
- `schema`, `env-contract`, `event-contracts`, `error`, `i18n-contract` 최소 public export skeleton을 추가했다.
- package `exports`를 추가해 공통 계약 패키지의 import 입구를 먼저 고정했다.
