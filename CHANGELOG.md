# CHANGELOG.md

## Unreleased

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
