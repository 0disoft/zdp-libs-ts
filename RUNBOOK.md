# zdp-libs-ts Runbook

This repository owns shared TypeScript contract helpers. It must not absorb product-specific models, provider SDK wrappers, or runtime business rules.

## Normal Checks

- Use `zdp_architecture_validate_libs_ts_repository` for repository architecture policy validation.
- Use `zdp_libs_ts_check` after TypeScript library, package boundary, API source handoff declaration, schema, env, event, error, i18n, glossary, public export, or checker changes. This check is standalone and does not require `zdp-api-contracts` beside the repository.
- Use `bun run check:integration` when actual API source handoff or calculator conformance compatibility must be verified against a sibling `../zdp-api-contracts` checkout.
- Use `zdp_libs_ts_build` after source, export, or declaration changes and `zdp_libs_ts_package_smoke` to install the produced tarball in an empty Node consumer.
- Use `zdp_libs_ts_npm_pack_dry_run` for npm package contents or release-readiness evidence.
- Use `zdp_libs_ts_npm_publish_dry_run` only after explicit release approval and token/network gate review.
- Keep package boundary changes synchronized with `contracts/package-boundaries.yaml`.
- Keep API handoff changes synchronized with `contracts/api-contract-source.yaml`.
- Keep public export skeleton changes synchronized with `package.json`, `src/index.ts`, subpath modules, and `tests/public-exports.test.ts`.
- Keep contract `status` values inside the shared `skeleton`, `draft`, `reviewed`, `active` lifecycle.
- Review public package API changes with `CHANGELOG.md`.
- Treat raw package-manager, install, publish, server, and watcher commands as manual-only or missing command-contract coverage unless the root mustflow command contract exposes an eligible oneshot intent.

## Validation Modes

`bun run check` runs TypeScript checking, local unit and source tests, and committed libs contract validation. It must succeed from a standalone clone without reading paths outside this repository.

`bun run check:integration` requires `../zdp-api-contracts`. It validates actual route, error, webhook, SDK generation, API catalog, calculator catalog, and calculator conformance inputs without copying that source truth into this repository.

A different API contracts checkout can be selected explicitly.

```bash
bun scripts/check-libs-contracts.ts --api-contracts-root <path>
bun scripts/test-api-contract-integration.ts --api-contracts-root <path>
```

## Failure Response

If validation or package boundary review fails, freeze publish and keep the last reviewed package contract.

If the standalone checker fails, fix the committed libs contract or local implementation first. Do not loosen the checker to allow product domain models, secret values, raw provider errors, or translation runtime ownership into common packages.

If API source handoff declaration validation fails, freeze package API changes. This contract exists so shared TypeScript packages consume `zdp-api-contracts` metadata without becoming the source of API truth or a place where authorization headers, raw customer payloads, or screen payloads become reusable types.

If API integration validation fails, freeze package API changes and compare `contracts/api-contract-source.yaml` with the selected `zdp-api-contracts/contracts/**` files. This check exists so shared packages do not claim `idempotency`, `success_statuses`, `request_id`, `trace_id`, webhook event metadata, API catalog metadata, SDK generation targets, or calculator behavior that the API source no longer guarantees. Without it, a package can look type-safe while retries, status handling, logs, generated SDKs, and calculator results quietly stop lining up.

If public export skeleton validation fails, freeze package API changes. The export skeleton fixes import entry names early so product repositories do not invent parallel common types that later drift from API and SDK contracts.

## Manual Review Required

- Package publish
- Breaking package API changes
- Changes that move product-specific behavior into shared packages
