# VALIDATION.md

이 문서는 `zdp-libs-ts` 변경 후 확인할 기준을 모은다. 실행 권한은 mustflow command contract가 소유한다.

## Configured Validation

| 변경 범위 | 확인 기준 |
| --- | --- |
| TypeScript library, local contracts, glossary, package exports | `zdp_libs_ts_check` |
| 실제 API handoff와 calculator conformance integration | `bun run check:integration` |
| npm build와 committed `dist/` 재현성 | `zdp_libs_ts_build` |
| tarball 경로·파일 수·크기 예산 | `zdp_libs_ts_npm_pack_dry_run`, `bun run package:check` |
| Node 22·24 packed consumer와 release readiness | `zdp_libs_ts_package_smoke`, `bun run smoke:package` |
| repository architecture contract | `zdp_architecture_validate_libs_ts_repository` |
| architecture catalog or linter rule changes | `zdp_architecture_validate_fast` |
| agent docs only | `docs_validate_fast` |

`zdp_libs_ts_install_frozen`은 dependencies가 없거나 package metadata 변경으로 install evidence가 필요할 때만 쓴다. Publish dry-run과 public publish는 명시적 release approval과 token/network gate가 필요하다.

## Validation Modes

`bun run check`는 이 저장소 내부만 읽는다. TypeScript 검사, 로컬 테스트, package boundary, API source handoff 선언, schema, env, event, error, i18n, glossary 계약 검사를 실행하며 sibling 저장소가 없어도 통과해야 한다.

`bun run check:integration`은 sibling `../zdp-api-contracts`가 필요하다. 실제 route, error envelope, webhook, SDK generation input, API catalog, calculator catalog와 conformance 벡터를 읽어 두 저장소의 드리프트를 검사한다.

API 원천이나 계산기 적합성 벡터를 `zdp-libs-ts`에 스냅샷으로 복제하지 않는다. 다른 checkout 경로가 필요하면 `--api-contracts-root <path>`를 명시한다.

## Source Of Truth Checks

- service boundary: `service.yaml`
- package boundary and artifact allowlist: `package.json`, `BOUNDARY.md`, `SECURITY.md`
- package boundary contract: `contracts/package-boundaries.yaml`
- API handoff declaration: `contracts/api-contract-source.yaml`
- schema/env/event/error/i18n/glossary contracts: `contracts/*.yaml`
- glossary sources: `glossary/terms/**`, `glossary/locales/**`
- standalone checker: `scripts/check-libs-contracts.ts`
- integration test runner: `scripts/test-api-contract-integration.ts`
- build entry and output: `tsconfig.build.json`, `scripts/build-package.ts`, committed `dist/`
- tarball policy: `scripts/check-packed-package.ts`
- shared consumer program: `scripts/package-consumer-smoke.ts`
- local tarball smoke: `scripts/smoke-packed-package.ts`
- registry smoke: `scripts/smoke-published-package.ts`
- public export sources: `src/index.ts`, `src/*/index.ts`; consumer output: generated `dist/`; coverage: `tests/public-exports.test.ts` and tarball smoke
- calculator engine: public surface in `src/calculator-engine/index.ts`, `constants.ts`, `types.ts`; shared internals in `src/calculator-engine/core/**`; calculator implementations in `src/calculator-engine/calculators/**`; sibling `../zdp-api-contracts/contracts/calculators/*.yaml`; coverage in `tests/calculator-engine/**`
- CI and release gates: `.github/workflows/ci.yml`, `.github/workflows/release.yml`

## Drift Checks

- Package boundary must not absorb product domain models, runtime validators, framework adapters, provider SDK wrappers, or product policy.
- Local API source handoff declaration must preserve the required source repo, source contract paths, metadata, ownership exclusions, and forbidden values without reading another repository.
- Integration validation must fail when actual `zdp-api-contracts` inputs no longer guarantee the declared route, error, webhook, SDK, catalog, or calculator metadata.
- Glossary base terms and locale copy must keep canonical-label versus displayed-label separation.
- Error/env/event contracts must not expose secrets, provider payloads, stack traces, or customer payload examples.
- Public exports, explicit `package.json.files`, generated `dist/`, and required tarball paths must stay synchronized.
- Source-only `src/libs-contracts/**` output must not exist under committed or packed `dist/`.
- Packed JavaScript and declarations must import from an empty Node 22 and Node 24 consumer without relying on repository `src/` paths.
- Calculator engine constants, reviewed API contract policies, common conformance cases, package subpath export, tests, and docs must stay synchronized in integration mode.
- `src/calculator-engine/index.ts`는 public barrel로만 유지하고 각 reviewed calculator는 `src/calculator-engine/calculators/<calculator-id>.ts` 하나에 구현한다.
- Release tag, package version, verified tarball SHA-256, npm integrity, and published package version must identify the same artifact.

## Version Impact

`package.json` is the package version source. `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `BOUNDARY.md`, `RUNBOOK.md`, `service.yaml`, `SECURITY.md`, `LICENSE`, public `dist/**`, `contracts/**`, and `glossary/**` are in the package file allowlist. Changes there require package version impact review. `CHECKLIST.md`, `VALIDATION.md`, `.agents/**`, `docs/**`, source-only checker code, and CI workflows are source-only guidance or automation, but changes that alter the packed artifact still require a package version and changelog entry.
