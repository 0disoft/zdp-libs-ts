# Package Boundary Contract

The package surface is intentionally thin. It exposes root metadata plus schema, env contract, event contract, error, i18n contract, and glossary contract entrypoints.

It does not own product domain models, runtime validators, framework adapters, provider SDK wrappers, auth policy, payment policy, permission policy, ledger policy, or privacy policy.

Packaged files require version impact review because downstream SDK and API contract work can depend on the public export skeleton.
