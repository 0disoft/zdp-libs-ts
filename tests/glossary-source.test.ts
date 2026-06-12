import { readdir, readFile } from 'node:fs/promises';
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

interface PublicGlossaryLocaleSource {
  readonly locale?: string;
  readonly terms?: readonly PublicGlossaryLocaleTerm[];
}

interface PublicGlossaryLocaleTerm {
  readonly id?: string;
  readonly short?: string;
  readonly long?: string | null;
  readonly translation_status?: string;
  readonly status?: string;
  readonly visibility?: string;
  readonly owner?: string;
  readonly interaction?: unknown;
  readonly ad_policy?: unknown;
}

const SHORT_COPY_SENTENCES = 2;
const LONG_COPY_MIN_PARAGRAPHS = 2;
const LONG_COPY_MAX_PARAGRAPHS = 3;
const LONG_COPY_SENTENCES_PER_PARAGRAPH = 4;
const COMMON_GLOSSARY_PRODUCT_COPY_PATTERNS: readonly RegExp[] = [
  /\bZDP\b/u,
  /8ailors/u,
  /우리\s*(시스템|서비스|제품|앱|플랫폼)/u,
  /이\s*(저장소|사이트|서비스|시스템|제품|앱|플랫폼)/u
];

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

  it('keeps locale copy separate from canonical term metadata', async () => {
    const source = await readPublicGlossaryLocaleSource('ko');
    const terms = source.terms ?? [];
    const termIds = terms.map((term) => term.id);

    expect(source.locale).toBe('ko');
    expect(termIds).toContain('design.oklch');
    expect(termIds).toContain('security.vault');
    expect(termIds).toContain('security.privacy-access-broker');
    expect(termIds).toContain('operations.rate-limit');
    expect(new Set(termIds).size).toBe(termIds.length);

    for (const term of terms) {
      expect(term.status).toBeUndefined();
      expect(term.visibility).toBeUndefined();
      expect(term.owner).toBeUndefined();
      expect(term.interaction).toBeUndefined();
      expect(term.ad_policy).toBeUndefined();
      expect(term.short).toBeString();
      expectGeneralPublicCopy(term.id ?? '<missing-id>', 'short', term.short ?? '');
      expectNoBoldMarkdown(term.id ?? '<missing-id>', 'short', term.short ?? '');
      expect(readParagraphs(term.short ?? '')).toHaveLength(1);
      expect(countSentences(term.short ?? '')).toBe(SHORT_COPY_SENTENCES);

      if (term.translation_status === 'reviewed') {
        expect(term.long).toBeString();
      }

      if (typeof term.long === 'string') {
        expectGeneralPublicCopy(term.id ?? '<missing-id>', 'long', term.long);
        expectNoBoldMarkdown(term.id ?? '<missing-id>', 'long', term.long);
        const paragraphs = readParagraphs(term.long);
        expect(paragraphs.length).toBeGreaterThanOrEqual(LONG_COPY_MIN_PARAGRAPHS);
        expect(paragraphs.length).toBeLessThanOrEqual(LONG_COPY_MAX_PARAGRAPHS);

        for (const paragraph of paragraphs) {
          const sentenceCount = countSentences(paragraph);
          expect(sentenceCount).toBe(LONG_COPY_SENTENCES_PER_PARAGRAPH);
        }
      }
    }
  });
});

async function readPublicGlossarySource(): Promise<PublicGlossarySource> {
  const termsRoot = new URL('../glossary/terms/', import.meta.url);
  const files = await collectYamlFiles(termsRoot);
  const terms: PublicGlossaryTerm[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const parsed = Bun.YAML.parse(source) as PublicGlossarySource | PublicGlossaryTerm;
    if (Array.isArray((parsed as PublicGlossarySource).terms)) {
      terms.push(...((parsed as PublicGlossarySource).terms ?? []));
    } else if (typeof (parsed as PublicGlossaryTerm).id === 'string') {
      terms.push(parsed as PublicGlossaryTerm);
    }
  }

  return { terms };
}

async function readPublicGlossaryLocaleSource(locale: string): Promise<PublicGlossaryLocaleSource> {
  const localeRoot = new URL(`../glossary/locales/${locale}/`, import.meta.url);
  const files = await collectYamlFiles(localeRoot);
  const terms: PublicGlossaryLocaleTerm[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const parsed = Bun.YAML.parse(source) as PublicGlossaryLocaleSource | PublicGlossaryLocaleTerm;
    if (typeof (parsed as PublicGlossaryLocaleSource).locale === 'string') {
      expect((parsed as PublicGlossaryLocaleSource).locale).toBe(locale);
    }
    if (Array.isArray((parsed as PublicGlossaryLocaleSource).terms)) {
      terms.push(...((parsed as PublicGlossaryLocaleSource).terms ?? []));
    } else if (typeof (parsed as PublicGlossaryLocaleTerm).id === 'string') {
      terms.push(parsed as PublicGlossaryLocaleTerm);
    }
  }

  return { locale, terms };
}

async function collectYamlFiles(root: URL): Promise<URL[]> {
  const result: URL[] = [];
  const rootUrl = root.href.endsWith('/') ? root : new URL(root.href + '/');
  const entries = await readdir(rootUrl, { withFileTypes: true });
  for (const entry of entries) {
    const entryUrl = new URL(entry.name, rootUrl);
    if (entry.isDirectory()) {
      const subFiles = await collectYamlFiles(entryUrl);
      result.push(...subFiles);
    } else if (entry.isFile() && /\.ya?ml$/i.test(entry.name)) {
      result.push(entryUrl);
    }
  }
  return result.sort((left, right) => left.pathname.localeCompare(right.pathname));
}

function readParagraphs(value: string): readonly string[] {
  return value
    .trim()
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter((paragraph) => paragraph.length > 0);
}

function countSentences(value: string): number {
  return maskInlineCode(value)
    .split(/[.!?。！？]+/g)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0).length;
}

function maskInlineCode(value: string): string {
  return value.replace(/`[^`]*`/g, 'code');
}

function expectGeneralPublicCopy(termId: string, field: 'short' | 'long', value: string): void {
  for (const pattern of COMMON_GLOSSARY_PRODUCT_COPY_PATTERNS) {
    expect(`${termId}.${field}: ${value}`).not.toMatch(pattern);
  }
}

function expectNoBoldMarkdown(termId: string, field: 'short' | 'long', value: string): void {
  if (/\*\*[^*]+\*\*/.test(maskInlineCode(value))) {
    throw new Error(`${termId}.${field} contains bold markdown`);
  }
}
