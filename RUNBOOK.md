# zdp-libs-ts Runbook

This repository owns shared TypeScript contract helpers. It must not absorb product-specific models, provider SDK wrappers, or runtime business rules.

## Normal Checks

- Run `bun run contracts:check` after package boundary, API source handoff, schema, env, event, error, or i18n contract changes.
- Run `bun run check` before locking a TypeScript checker change.
- Validate this repository with `zdp-architecture-linter`.
- Keep package boundary changes synchronized with `contracts/package-boundaries.yaml`.
- Keep API handoff changes synchronized with `contracts/api-contract-source.yaml`.
- Review public package API changes with `CHANGELOG.md`.

## Failure Response

If validation or package boundary review fails, freeze publish and keep the last reviewed package contract.

If the local checker fails, fix the contract source first. Do not loosen the checker to allow product domain models, secret values, raw provider errors, or translation runtime ownership into common packages.

If API source handoff validation fails, freeze package API changes. This contract exists so shared TypeScript packages consume `zdp-api-contracts` metadata without becoming the source of API truth or a place where authorization headers, raw customer payloads, or screen payloads become reusable types.

## Manual Review Required

- Package publish
- Breaking package API changes
- Changes that move product-specific behavior into shared packages
