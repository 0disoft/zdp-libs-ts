# Security Contracts

Env contracts describe expected environment shape and metadata without storing secret values.

Error contracts must not expose stack traces, SQL, raw provider errors, internal URLs, or customer payloads. Event contracts preserve request id, trace id, and audit references so downstream systems can investigate failures without leaking payloads.

I18n and glossary contracts must not turn internal system names, dashboard URLs, secret names, or operations procedures into public copy.
