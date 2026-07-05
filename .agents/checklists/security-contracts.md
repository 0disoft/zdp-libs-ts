# Security Contracts Checklist

- Env contract describes shape and metadata, not secret values.
- Error contract excludes stack traces, SQL, raw provider errors, internal URLs, and customer payloads.
- Event contract preserves request id, trace id, and audit references.
- i18n/glossary text does not reveal private dashboard URLs or secret names.
- Shared helpers do not hide auth, payment, permission, ledger, or privacy policy.
