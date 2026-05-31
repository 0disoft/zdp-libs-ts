# zdp-libs-ts Runbook

This repository owns shared TypeScript contract helpers. It must not absorb product-specific models, provider SDK wrappers, or runtime business rules.

## Normal Checks

- Run `bun run contracts:check` after package boundary, API source handoff, schema, env, event, error, or i18n contract changes.
- Run `bun run check` before locking a TypeScript checker change.
- Keep `../zdp-api-contracts` available when running `contracts:check`; the checker reads its route, error, webhook, and SDK generation input contracts.
- Validate this repository with `zdp-architecture-linter`.
- Keep package boundary changes synchronized with `contracts/package-boundaries.yaml`.
- Keep API handoff changes synchronized with `contracts/api-contract-source.yaml`.
- Keep public export skeleton changes synchronized with `package.json`, `src/index.ts`, subpath modules, and `tests/public-exports.test.ts`.
- Review public package API changes with `CHANGELOG.md`.

## Failure Response

If validation or package boundary review fails, freeze publish and keep the last reviewed package contract.

If the local checker fails, fix the contract source first. Do not loosen the checker to allow product domain models, secret values, raw provider errors, or translation runtime ownership into common packages.

If API source handoff validation fails, freeze package API changes. This contract exists so shared TypeScript packages consume `zdp-api-contracts` metadata without becoming the source of API truth or a place where authorization headers, raw customer payloads, or screen payloads become reusable types.

If API source input drift validation fails, freeze package API changes and compare `contracts/api-contract-source.yaml` with `../zdp-api-contracts/contracts/*.yaml`. This check exists so shared packages do not claim `idempotency`, `request_id`, `trace_id`, webhook event metadata, or SDK generation targets that the API source no longer guarantees. Without it, a package can look type-safe while retries, logs, and generated SDKs quietly stop lining up.

If public export skeleton validation fails, freeze package API changes. The export skeleton fixes import entry names early so product repositories do not invent parallel common types that later drift from API and SDK contracts.

## Manual Review Required

- Package publish
- Breaking package API changes
- Changes that move product-specific behavior into shared packages
