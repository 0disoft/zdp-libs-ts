import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'bun:test';

interface PublicGlossarySource {
  readonly terms?: readonly PublicGlossaryTerm[];
}

interface PublicGlossaryTerm {
  readonly id?: string;
  readonly products?: readonly string[];
  readonly sites?: readonly string[];
  readonly canonical_path?: string | null;
}

describe('public glossary source data', () => {
  it('owns reusable platform terms without site routing or product filters', async () => {
    const source = await readPublicGlossarySource();
    const terms = source.terms ?? [];
    const termIds = terms.map((term) => term.id);

    expect(termIds).toContain('design.oklch');
    expect(termIds).toContain('security.vault');
    expect(termIds).toContain('security.privacy-access-broker');
    expect(termIds).toContain('operations.rate-limit');
    expect(new Set(termIds).size).toBe(termIds.length);

    for (const term of terms) {
      expect(term.products ?? []).toEqual([]);
      expect(term.sites ?? []).toEqual([]);
      expect(term.canonical_path ?? null).toBeNull();
    }
  });
});

async function readPublicGlossarySource(): Promise<PublicGlossarySource> {
  const sourceUrl = new URL('../glossary/terms/public.yaml', import.meta.url);
  const source = await readFile(sourceUrl, 'utf8');
  return Bun.YAML.parse(source) as PublicGlossarySource;
}
