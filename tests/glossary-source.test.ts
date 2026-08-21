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
  const terms = await Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, 'utf8');
      return Bun.YAML.parse(source) as PublicGlossaryTerm;
    })
  );
  return { terms };
}

async function readPublicGlossaryLocaleSource(
  locale: string
): Promise<PublicGlossaryLocaleSource> {
  const termsRoot = new URL(`../glossary/locales/${locale}/`, import.meta.url);
  const files = await collectYamlFiles(termsRoot);
  const terms = await Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, 'utf8');
      return Bun.YAML.parse(source) as PublicGlossaryLocaleTerm;
    })
  );
  return { locale, terms };
}

async function collectYamlFiles(root: URL): Promise<URL[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: URL[] = [];

  for (const entry of entries) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, root);
    if (entry.isDirectory()) {
      files.push(...(await collectYamlFiles(child)));
    } else if (entry.name.endsWith('.yaml')) {
      files.push(child);
    }
  }

  return files.sort((left, right) => left.href.localeCompare(right.href));
}

function readCopyContractVersion(term: PublicGlossaryLocaleTerm): 1 | 2 {
  return term.copy_contract_version === 2 ? 2 : 1;
}

function readParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function countSentences(value: string): number {
  return value
    .split(/[.!?]+(?:["'’”)]*)?(?=\s|$)/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0).length;
}

function expectGeneralPublicCopy(
  termId: string,
  field: 'short' | 'long',
  value: string
): void {
  for (const pattern of COMMON_GLOSSARY_PRODUCT_COPY_PATTERNS) {
    expect(value).not.toMatch(pattern);
  }

  expect(value, `${termId}.${field} must not contain internal routes`).not.toMatch(
    /\/(?:admin|internal|api|dashboard|settings|billing|account)(?:\/|\b)/u
  );
}

function expectNoBoldMarkdown(
  termId: string,
  field: 'short' | 'long',
  value: string
): void {
  expect(value, `${termId}.${field} must not contain bold markdown`).not.toContain('**');
  expect(value, `${termId}.${field} must not contain 100+ unbroken characters`).not.toMatch(
    /\S{100,}/u
  );
}

function expectKoreanPlainDeclarativeCopy(
  termId: string,
  field: 'short' | 'long',
  value: string,
  shape: CopyShapeContract
): void {
  if (!shape.koreanPlainDeclarative) {
    return;
  }

  const sentences = value
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  for (const sentence of sentences) {
    expect(
      sentence,
      `${termId}.${field} must use Korean plain declarative endings`
    ).toMatch(/(?:다|이다|한다|된다|있다|없다|않다|같다|높다|낮다|크다|작다|쉽다|어렵다|좋다|나쁘다|필요하다|중요하다|가능하다|불가능하다|유효하다|적절하다|안전하다|위험하다|명확하다|복잡하다|단순하다|정확하다|일치하다|포함한다|제공한다|사용한다|의미한다|말한다|가리킨다|뜻한다|설명한다|적용한다|처리한다|보호한다|기록한다|확인한다|제한한다|요구한다|허용한다|금지한다|유지한다|관리한다|저장한다|전달한다|구분한다|정한다|따른다|받는다|보낸다|막는다|줄인다|높인다|낮춘다|찾는다|남긴다|바꾼다|나눈다|묶는다|돕는다|생긴다|발생한다|이어진다|드러난다|정리된다|사용된다|적용된다|처리된다|보호된다|기록된다|확인된다|제한된다|요구된다|허용된다|금지된다|유지된다|관리된다|저장된다|전달된다|구분된다|결정된다|정해진다|따르게 된다)[.!?]$/u);
  }
}
