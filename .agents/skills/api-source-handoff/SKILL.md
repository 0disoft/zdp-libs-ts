# API Source Handoff Skill

## Use When

`contracts/api-contract-source.yaml`, API source input drift checks, route/error/webhook/SDK metadata consumption, or forbidden API value handling changes.

## Procedure

1. Read `contracts/api-contract-source.yaml`, `scripts/check-libs-contracts.ts`, and relevant sibling `../zdp-api-contracts/contracts/**` files.
2. Keep `zdp-api-contracts` as source of truth.
3. Preserve request id, trace id, idempotency, success statuses, event type, webhook replay, SDK generation target, and forbidden value metadata.
4. Do not copy API route, error, webhook, or SDK generation truth into this package.
5. Verify with `zdp_libs_ts_check`.
