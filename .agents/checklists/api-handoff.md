# API Handoff Checklist

- `zdp-api-contracts` remains the API source of truth.
- Route, error, webhook, SDK input, and API catalog metadata are consumed, not redefined.
- `request_id`, `trace_id`, `idempotency`, `success_statuses`, `event_type`, and SDK targets stay aligned.
- Drift failures freeze package API changes until the source or handoff contract is fixed.
- Forbidden values are checked bidirectionally.
