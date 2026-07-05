# API Handoff Contract

`zdp-libs-ts` consumes API metadata from `zdp-api-contracts`. It does not recreate route, error, webhook, SDK generation input, or API catalog source truth.

The handoff must preserve request id, trace id, idempotency, success statuses, event type, webhook replay fields, SDK target metadata, and forbidden value checks.

When drift appears, fix the API source or the handoff contract before changing package exports.
