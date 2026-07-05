# Context Map

| Work type | Read first | Validate with |
| --- | --- | --- |
| Package exports | `package.json`, `src/index.ts`, `src/*/index.ts`, `tests/public-exports.test.ts` | `zdp_libs_ts_check`, `zdp_libs_ts_npm_pack_dry_run` when package surface changes |
| API handoff | `contracts/api-contract-source.yaml`, sibling `../zdp-api-contracts/contracts/**` | `zdp_libs_ts_check` |
| Schema/env/event/error/i18n contracts | Matching `contracts/*.yaml`, `scripts/check-libs-contracts.ts` | `zdp_libs_ts_check` |
| Glossary base or locale copy | `contracts/glossary-contract.yaml`, `glossary/terms/**`, `glossary/locales/**` | `zdp_libs_ts_check` |
| Security-sensitive text | `SECURITY.md`, env/error/event/glossary contracts | `zdp_libs_ts_check` |
| Agent docs only | `CHECKLIST.md`, `VALIDATION.md`, `.agents/**`, `docs/**` | `docs_validate_fast` |
