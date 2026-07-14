# AGENTS.md

## 읽는 순서

1. `AGENTS.md`
2. `service.yaml`
3. `BOUNDARY.md`
4. `SECURITY.md`
5. `CHECKLIST.md`
6. `VALIDATION.md`
7. `.agents/README.md`
8. `.agents/context-map.md`
9. `README.md`
10. `RUNBOOK.md`
11. `docs/README.md`
12. 작업 범위에 맞는 `.agents/checklists/*.md`
13. 작업 범위에 맞는 `.agents/skills/*/SKILL.md`
14. 작업 범위에 맞는 `.agents/validations/*.md`
15. 관련 `contracts/**`, `glossary/**`, `src/**`, `scripts/**`, `tests/**`, `package.json`

## 역할

이 저장소는 ZDP TypeScript 공통 계약 패키지와 구현 중립 순수 계산 라이브러리를 소유한다. 계약 경계와 계산 엔진은 별도 public subpath로 유지한다.

## 작업 원칙

- 문서는 한국어로 작성한다.
- 범용 Zod/TypeBox 경쟁자를 만들지 않는다.
- 런타임 편의 함수보다 JSON Schema/OpenAPI/SDK/Rust/Dart 모델 생성으로 이어지는 메타데이터를 우선한다.
- 패키지 API는 downstream SDK와 API contracts에 영향을 주므로 변경 내역을 기록한다.
- 계산 엔진은 `zdp-api-contracts`의 reviewed 계산기 정의와 공통 적합성 벡터를 소비하고 계약 원천을 복제하지 않는다.
- `service.yaml`이 이 저장소의 운영 계약이며 변경 시 `zdp-architecture` catalog와 함께 맞춘다.

## 금지

- 제품별 domain model을 공통 패키지에 넣지 않는다.
- 인증, 결제, 권한, 원장 정책을 helper 함수로 숨기지 않는다.
- provider SDK wrapper를 공통 계약 패키지처럼 노출하지 않는다.
- 실제 비밀값, 고객 데이터, provider response 원문 예시를 넣지 않는다.
- 로케일 숫자 파싱, 표시 형식, 제품 화면, 광고, 크레딧, 국가별 정책을 계산 엔진에 넣지 않는다.

## 검증

Agent가 실행하는 검증은 root mustflow command contract에 등록된 intent만 사용한다.

- 저장소 architecture contract: `zdp_architecture_validate_libs_ts_repository`
- TypeScript library, contracts, glossary, package exports: `zdp_libs_ts_check`
- npm package contents 또는 release readiness: `zdp_libs_ts_npm_pack_dry_run`
- 명시적 release approval과 token/network gate가 있는 publish dry-run: `zdp_libs_ts_npm_publish_dry_run`

Raw package-manager, install, publish, watcher, server 명령은 `VALIDATION.md`에 manual-only 또는 missing coverage로 표시된 경계를 따른다.
