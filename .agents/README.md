# Libs TS Agent Notes

Start with `BOUNDARY.md`, `SECURITY.md`, `CHECKLIST.md`, and `VALIDATION.md`. This package is a thin contract package, not a product model or provider SDK home.

## High-Risk Mistakes

- Moving product domain models into shared contracts.
- Recreating API source truth instead of consuming `zdp-api-contracts`.
- Putting secrets, provider raw responses, or internal URLs into env/error/glossary fixtures.
- Treating glossary copy as product-specific adoption policy.
- Changing package exports without downstream impact review.
- Copying calculator definitions into the engine or mixing locale parsing, UI, ads, credits, or jurisdiction policy into pure calculations.

## Local Routes

- `.agents/checklists/package-boundary.md`
- `.agents/checklists/api-handoff.md`
- `.agents/checklists/glossary-contract.md`
- `.agents/checklists/security-contracts.md`
- `docs/contracts/calculator-engine.md`
- `.agents/skills/api-source-handoff/SKILL.md`
- `.agents/skills/glossary-contract/SKILL.md`
- `.agents/validations/libs-ts-contract.md`
