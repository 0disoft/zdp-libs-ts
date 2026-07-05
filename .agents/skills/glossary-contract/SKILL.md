# Glossary Contract Skill

## Use When

Glossary contract files, base terms, locale labels, aliases, match phrases, review status, or glossary public exports change.

## Procedure

1. Read `contracts/glossary-contract.yaml`, relevant `glossary/terms/**`, `glossary/locales/**`, and `scripts/check-libs-contracts.ts`.
2. Keep common terms product-neutral.
3. Keep `canonical_label` in base terms and displayed text in locale files.
4. Preserve checker-enforced `short` and `long` body rules.
5. Verify with `zdp_libs_ts_check`.
