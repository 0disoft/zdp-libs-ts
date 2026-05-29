# zdp-libs-ts Runbook

This repository owns shared TypeScript contract helpers. It must not absorb product-specific models, provider SDK wrappers, or runtime business rules.

## Normal Checks

- Validate this repository with `zdp-architecture-linter`.
- Keep package boundary changes synchronized with `contracts/package-boundaries.yaml`.
- Review public package API changes with `CHANGELOG.md`.

## Failure Response

If validation or package boundary review fails, freeze publish and keep the last reviewed package contract.

## Manual Review Required

- Package publish
- Breaking package API changes
- Changes that move product-specific behavior into shared packages
