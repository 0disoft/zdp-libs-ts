# zdp-libs-ts Runbook

This repository owns shared TypeScript contract helpers. It must not absorb product-specific models, provider SDK wrappers, or runtime business rules.

## Normal Checks

- Run `bun run contracts:check` after package boundary, schema, env, event, error, or i18n contract changes.
- Run `bun run check` before locking a TypeScript checker change.
- Validate this repository with `zdp-architecture-linter`.
- Keep package boundary changes synchronized with `contracts/package-boundaries.yaml`.
- Review public package API changes with `CHANGELOG.md`.

## Failure Response

If validation or package boundary review fails, freeze publish and keep the last reviewed package contract.

If the local checker fails, fix the contract source first. Do not loosen the checker to allow product domain models, secret values, raw provider errors, or translation runtime ownership into common packages.

## Manual Review Required

- Package publish
- Breaking package API changes
- Changes that move product-specific behavior into shared packages
