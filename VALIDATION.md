# VALIDATION.md

이 문서는 `zdp-libs-ts` 변경 후 확인할 기준을 모은다. 실행 권한은 mustflow command contract가 소유한다.

## Configured Validation

| 변경 범위 | 확인 기준 |
| --- | --- |
| TypeScript library, contracts, glossary, package exports | `zdp_libs_ts_check` |
| npm package contents or release readiness | `zdp_libs_ts_npm_pack_dry_run` |
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
- public exports: `src/index.ts`, `src/*/index.ts`, `tests/public-exports.test.ts`
- calculator engine: `src/calculator-engine/index.ts`, sibling `../zdp-api-contracts/contracts/calculators/*.yaml`, `tests/calculator-engine.test.ts`

## Drift Checks

- Package boundary must not absorb product domain models, runtime validators, framework adapters, provider SDK wrappers, or product policy.
- API source handoff must not claim metadata that `zdp-api-contracts` no longer guarantees.
- Glossary base terms and locale copy must keep canonical-label versus displayed-label separation.
- Error/env/event contracts must not expose secrets, provider payloads, stack traces, or customer payload examples.
- Public export skeleton and `package.json` exports must stay synchronized.
- Calculator engine constants, reviewed API contract policies, common conformance cases, package export, tests, and docs must stay synchronized.

## Version Impact

`package.json` is the package version source. `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `BOUNDARY.md`, `RUNBOOK.md`, `service.yaml`, `SECURITY.md`, `LICENSE`, `src/**`, `contracts/**`, and `glossary/**` are in the package file allowlist. Changes there require package version impact review. `CHECKLIST.md`, `VALIDATION.md`, `.agents/**`, and `docs/**` are source-only agent guidance under the current allowlist.
