# Package Boundary Contract

The package surface is intentionally thin. It exposes built ESM and declarations for root metadata plus schema, env contract, event contract, error, i18n contract, glossary contract, and calculator engine entrypoints. TypeScript source remains the implementation input rather than the consumer runtime surface.

It does not own product domain models, runtime validators, framework adapters, provider SDK wrappers, auth policy, payment policy, permission policy, ledger policy, or privacy policy.

Packaged files require version impact review because downstream SDK and API contract work can depend on the public export contract. `prepare` builds the same `dist/` for npm packaging and commit-SHA-pinned Git dependency installs. A tarball smoke must install the package into an empty Node consumer so source-layout or Bun-only runtime leakage cannot pass as a valid release.
