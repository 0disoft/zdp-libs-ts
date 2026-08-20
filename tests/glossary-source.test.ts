import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'bun:test';

interface PublicGlossarySource {
  readonly terms?: readonly PublicGlossaryTerm[];
}

interface PublicGlossaryTerm {
  readonly id?: string;
  readonly canonical_label?: string;
  readonly label?: string;
  readonly slug?: string;
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
  readonly copy_contract_version?: number;
  readonly status?: string;
  readonly visibility?: string;
  readonly owner?: string;
  readonly interaction?: unknown;
  readonly ad_policy?: unknown;
}

interface GlossaryAuthoringContractSource {
  readonly glossary_contract?: {
    readonly copy_contract?: unknown;
  };
}

interface CopyShapeContract {
  readonly shortParagraphs: number;
  readonly shortSentences: number;
  readonly longParagraphs: number;
  readonly longSentencesPerParagraph: number;
  readonly koreanPlainDeclarative: boolean;
}

const COPY_SHAPE_CONTRACTS: Readonly<Record<1 | 2, CopyShapeContract>> = {
  1: {
    shortParagraphs: 1,
    shortSentences: 2,
    longParagraphs: 2,
    longSentencesPerParagraph: 4,
    koreanPlainDeclarative: false
  },
  2: {
    shortParagraphs: 1,
    shortSentences: 3,
    longParagraphs: 3,
    longSentencesPerParagraph: 4,
    koreanPlainDeclarative: true
  }
};
const COMMON_GLOSSARY_PRODUCT_COPY_PATTERNS: readonly RegExp[] = [
  /\bZDP\b/u,
  /8ailors/u,
  /우리\s*(시스템|서비스|제품|앱|플랫폼)/u,
  /이\s*(저장소|사이트|서비스|시스템|제품|앱|플랫폼)/u
];
const EXPECTED_COMMON_GLOSSARY_TERM_IDS = [
  'account.entitlement',
  'account.dormant',
  'account.restriction',
  'commerce.auto-recharge',
  'commerce.chargeback',
  'commerce.lemon',
  'commerce.original-payment-method',
  'commerce.refund',
  'legal.judicial-procedure',
  'legal.jurisdiction',
  'legal.lawful-order',
  'legal.mutual-legal-assistance',
  'legal.objection',
  'legal.political-persecution',
  'legal.post-notification',
  'legal.transparency-report',
  'legal.withdrawal',
  'platform.cdn',
  'platform.cookie',
  'security.api-key',
  'security.audit-log',
  'security.data-minimization',
  'security.decryption',
  'security.masking',
  'security.token'
] as const;

describe('public glossary source data', () => {
  it('pins the current glossary copy authoring contract', async () => {
    const source = await readFile(new URL('../contracts/glossary-contract.yaml', import.meta.url), 'utf8');
    const parsed = Bun.YAML.parse(source) as GlossaryAuthoringContractSource;

    expect(parsed.glossary_contract?.copy_contract).toEqual({
      current_version: 2,
      legacy_default_version: 1,
      human_review_required: true,
      copy_provenance: {
        required_from_version: 2,
        allowed_origins: ['human', 'llm'],
        llm_initial_human_review_status: 'pending',
        human_review_complete_status: 'reviewed',
        unreviewed_llm_severity: 'warning'
      },
      short: {
        paragraphs: 1,
        sentences_per_paragraph: 3
      },
      long: {
        paragraphs: 3,
        sentences_per_paragraph: 4
      },
      locale_style: {
        ko: 'plain-declarative-da'
      }
    });
  });

  it('owns reusable platform terms without site routing or product filters', async () => {
    const source = await readPublicGlossarySource();
    const terms = source.terms ?? [];
    const termIds = terms.map((term) => term.id);

    expect([...termIds].sort()).toEqual([...EXPECTED_COMMON_GLOSSARY_TERM_IDS].sort());

    for (const term of terms) {
      expect(term.canonical_label).toBeString();
      expect(term.canonical_label).not.toBe('undefined');
      expect(term.label).toBeUndefined();
      expect(term.slug).toBeUndefined();
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
    expect([...termIds].sort()).toEqual([...EXPECTED_COMMON_GLOSSARY_TERM_IDS].sort());

    for (const term of terms) {
      const contractVersion = readCopyContractVersion(term);
      const copyShape = COPY_SHAPE_CONTRACTS[contractVersion];
      expect(term.status).toBeUndefined();
      expect(term.visibility).toBeUndefined();
      expect(term.owner).toBeUndefined();
      expect(term.interaction).toBeUndefined();
     expect(term.ad_policy).toBeUndefined();
      if (term.translation_status === 'reviewed') {
        expect(term.short).toBeString();
        expectGeneralPublicCopy(term.id ?? '<missing-id>', 'short', term.short ?? '');
        expectNoBoldMarkdown(term.id ?? '<missing-id>', 'short', term.short ?? '');
        expect(readParagraphs(term.short ?? '')).toHaveLength(copyShape.shortParagraphs);
        expect(countSentences(term.short ?? '')).toBe(copyShape.shortSentences);
        expectKoreanPlainDeclarativeCopy(term.id ?? '<missing-id>', 'short', term.short ?? '', copyShape);
       expect(term.long).toBeString();
        expectGeneralPublicCopy(term.id ?? '<missing-id>', 'long', term.long ?? '');
        expectNoBoldMarkdown(term.id ?? '<missing-id>', 'long', term.long ?? '');
        const paragraphs = readParagraphs(term.long ?? '');
        expect(paragraphs).toHaveLength(copyShape.longParagraphs);

        for (const paragraph of paragraphs) {
          const sentenceCount = countSentences(paragraph);
          expect(sentenceCount).toBe(copyShape.longSentencesPerParagraph);
        }
        expectKoreanPlainDeclarativeCopy(term.id ?? '<missing-id>', 'long', term.long ?? '', copyShape);
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

function readCopyContractVersion(term: PublicGlossaryLocaleTerm): 1 | 2 {
  const version = term.copy_contract_version ?? 1;
  expect([1, 2]).toContain(version);
  return version as 1 | 2;
}

function expectKoreanPlainDeclarativeCopy(
  termId: string,
  field: 'short' | 'long',
  value: string,
  contract: CopyShapeContract
): void {
  if (!contract.koreanPlainDeclarative) {
    return;
  }

  for (const sentence of readSentences(value)) {
    expect(`${termId}.${field}: ${sentence}`).toMatch(/다$/u);
    if (!sentence.endsWith('아니다')) {
      expect(`${termId}.${field}: ${sentence}`).not.toMatch(/니다$/u);
    }
  }
}

function readSentences(value: string): readonly string[] {
  return maskInlineCode(value)
    .split(/[.!?。！？]+/g)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
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
