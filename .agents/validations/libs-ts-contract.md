# Libs TS Contract Validation

Before reporting completion, verify:

- Shared package boundaries still exclude product domain models, provider SDK wrappers, runtime validators, and product policy helpers.
- API handoff consumes `zdp-api-contracts` without replacing it.
- Public exports and package metadata agree.
- Glossary canonical labels, locale labels, aliases, and copy rules remain separated.
- Env, event, error, i18n, and glossary contracts do not expose secrets or customer data.
- Package version impact is named when packaged files change.
