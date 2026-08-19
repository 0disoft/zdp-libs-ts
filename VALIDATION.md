# VALIDATION.md

이 문서는 `zdp-libs-ts` 변경 후 확인할 기준을 모은다. 실행 권한은 mustflow command contract가 소유한다.

## Configured Validation

| 변경 범위 | 확인 기준 |
| --- | --- |
| TypeScript library, contracts, glossary, package exports | `zdp_libs_ts_check` |
| npm build, declaration, package contents or release readiness | `zdp_libs_ts_build`, `zdp_libs_ts_package_smoke`, `zdp_libs_ts_npm_pack_dry_run` |
| repository architecture contract | `zdp_architecture_validate_libs_ts_repository` |
| architecture catalog or linter rule changes | `zdp_architecture_validate_fast` |
| agent docs only | `docs_validate_fast` |

`zdp_libs_ts_install_frozen`은 dependencies가 없거나 package metadata 변경으로 install evidence가 필요할 때만 쓴다. Publish dry-run과 public publish는 명시적 release approval과 token/network gate가 필요하다.

## Source Of Truth Checks

- service boundary: `service.yaml`
- package boundary: `package.json`, `BOUNDARY.md`, `SECURITY.md`
- package boundary contract: `contracts/package-boundaries.yaml`
- API handoff: `contracts/api-contract-source.yaml`
- schema/env/event/error/i18n/glossary contracts: `contracts/*.yaml`
- glossary sources: `glossary/terms/**`, `glossary/locales/**`
- checker: `scripts/check-libs-contracts.ts`
- public export sources: `src/index.ts`, `src/*/index.ts`; consumer output: generated `dist/`; coverage: `tests/public-exports.test.ts` and tarball smoke
- calculator engine: public surface in `src/calculator-engine/index.ts`, `constants.ts`, `types.ts`; shared internals in `src/calculator-engine/core/**`; calculator implementations in `src/calculator-engine/calculators/**`; sibling `../zdp-api-contracts/contracts/calculators/*.yaml`; coverage in `tests/calculator-engine/**`

## Drift Checks

- Package boundary must not absorb product domain models, runtime validators, framework adapters, provider SDK wrappers, or product policy.
- API source handoff must not claim metadata that `zdp-api-contracts` no longer guarantees.
- Glossary base terms and locale copy must keep canonical-label versus displayed-label separation.
- Error/env/event contracts must not expose secrets, provider payloads, stack traces, or customer payload examples.
- Public export skeleton and `package.json` exports must stay synchronized.
- Packed JavaScript and declarations must import from an empty Node consumer without relying on repository `src/` paths.
- Calculator engine constants, reviewed API contract policies, common conformance cases, package export, tests, and docs must stay synchronized.
- `src/calculator-engine/index.ts`는 public barrel로만 유지하고 각 reviewed calculator는 `src/calculator-engine/calculators/<calculator-id>.ts` 하나에 구현한다.

## Version Impact

`package.json` is the package version source. `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `BOUNDARY.md`, `RUNBOOK.md`, `service.yaml`, `SECURITY.md`, `LICENSE`, `src/**`, `contracts/**`, and `glossary/**` are in the package file allowlist. Changes there require package version impact review. `CHECKLIST.md`, `VALIDATION.md`, `.agents/**`, and `docs/**` are source-only agent guidance under the current allowlist.
