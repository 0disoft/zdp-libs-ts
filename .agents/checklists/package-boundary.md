# Package Boundary Checklist

- Public exports stay limited to root, schema, env-contract, event-contracts, error, i18n-contract, and glossary-contract.
- No product domain model, provider SDK wrapper, framework adapter, or runtime validator is added.
- `package.json`, source exports, tests, and package boundary contract agree.
- Package file allowlist does not include generated output or sensitive fixtures.
- Version impact is reviewed when packaged files change.
