# zdp-libs-ts Runbook

This repository owns shared TypeScript contract helpers. It must not absorb product-specific models, provider SDK wrappers, or runtime business rules.

## Normal Checks

- Use `zdp_architecture_validate_libs_ts_repository` for repository architecture policy validation.
- Use `zdp_libs_ts_check` after TypeScript library, package boundary, API source handoff, schema, env, event, error, i18n, glossary, public export, or checker changes.
- Use `zdp_libs_ts_build` after source, export, declaration, or build-entry changes.
- Use `zdp_libs_ts_npm_pack_dry_run` or `bun run package:check` to enforce tarball paths, entry count, single-file size, packed size, and unpacked size budgets.
- Use `zdp_libs_ts_package_smoke` or `bun run smoke:package` to install the produced tarball in an empty Node consumer and execute every public subpath.
- Use `zdp_libs_ts_npm_publish_dry_run` only after explicit release approval and token/network gate review.
- Keep `../zdp-api-contracts` available for configured checker coverage; the checker reads its route, error, webhook, SDK generation input, API catalog, and calculator contracts.
- Keep package boundary changes synchronized with `contracts/package-boundaries.yaml`.
- Keep API handoff changes synchronized with `contracts/api-contract-source.yaml`.
- Keep public export changes synchronized with `package.json`, `src/index.ts`, subpath modules, `tests/public-exports.test.ts`, and packed consumer smoke.
- Keep contract `status` values inside the shared `skeleton`, `draft`, `reviewed`, `active` lifecycle.
- Review public package API and artifact changes with `CHANGELOG.md`.
- Treat raw package-manager, install, publish, server, and watcher commands as manual-only or missing command-contract coverage unless the root mustflow command contract exposes an eligible oneshot intent.

## Package Artifact Policy

`package.json.files` is the first package boundary. `scripts/check-packed-package.ts` independently parses `npm pack --json --ignore-scripts` output and rejects undeclared paths, missing public entrypoints, duplicate paths, and budget overruns. `src/libs-contracts/**`, tests, source TypeScript, fixtures, and unrelated `dist/` modules must never enter the tarball.

CI rebuilds `dist/` and fails when the generated tree differs from the committed tree. Package consumers are tested on Node 22 and Node 24; the Node 24 lane also owns the tarball policy gate.

## Release

1. Update `package.json.version` and the matching `CHANGELOG.md` section in the release commit.
2. Merge the verified commit into `main`.
3. Create and push the exact tag `v<package.json.version>` on that `main` commit.
4. Approve the GitHub `npm` environment when the `Publish npm package` workflow requests it.

The npm trusted publisher must be registered for repository `0disoft/zdp-libs-ts`, workflow `release.yml`, and environment `npm`. The workflow uses GitHub OIDC and must not receive a long-lived `NPM_TOKEN`.

Before publish, the workflow reruns contract checks, build reproducibility, tarball policy, and packed consumer smoke. After publish, it verifies npm `gitHead`, integrity, registry signatures, provenance, and a clean installation of the exact published version. Re-pushing an already published version is accepted only when npm `gitHead` equals the tagged commit.

## Failure Response

If validation or package boundary review fails, freeze publish and keep the last reviewed package contract.

If the local checker fails, fix the contract source first. Do not loosen the checker to allow product domain models, secret values, raw provider errors, or translation runtime ownership into common packages.

If API source handoff validation fails, freeze package API changes. This contract exists so shared TypeScript packages consume `zdp-api-contracts` metadata without becoming the source of API truth or a place where authorization headers, raw customer payloads, or screen payloads become reusable types.

If API source input drift validation fails, freeze package API changes and compare `contracts/api-contract-source.yaml` with `../zdp-api-contracts/contracts/*.yaml` and `../zdp-api-contracts/contracts/apis/catalog.yaml`. This check exists so shared packages do not claim `idempotency`, `success_statuses`, `request_id`, `trace_id`, webhook event metadata, API catalog metadata, or SDK generation targets that the API source no longer guarantees.

If public export validation fails, freeze package API changes. If tarball policy fails, remove the unexpected path or explicitly review and raise the narrowest affected budget. Do not disable the policy or broaden it to all of `dist/`.

If npm publish succeeds but registry verification fails, do not retag or republish the same version from another commit. Inspect the published `gitHead`, integrity, provenance, and trusted publisher configuration first.

## Manual Review Required

- Package publish
- Breaking package API changes
- Package file allowlist or size-budget changes
- Changes that move product-specific behavior into shared packages
