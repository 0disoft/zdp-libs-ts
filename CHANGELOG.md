# CHANGELOG.md

## Unreleased

### Changed

- `check:tsgo` fast typecheck 스크립트와 pinned `@typescript/native-preview` 의존성을 추가했다.
- contract loader 실패 타입 가드와 i18n key 타입 테스트를 native TypeScript checker와 호환되게 정리했다.
- `@zdp/glossary-contract` skeleton export, click/right-sheet/bottom-sheet interaction, package boundary 계약을 추가했다.
- 여러 public site가 공유할 수 있는 `glossary/terms/public.yaml` 공통 용어 source를 추가했다.

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
