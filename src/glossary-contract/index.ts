export type GlossaryTermId = `${string}.${string}`;

export type GlossaryTermStatus = 'draft' | 'active' | 'deprecated';

export type GlossaryVisibility = 'public' | 'private' | 'internal';

export type GlossaryTranslationStatus =
  | 'draft'
  | 'machine'
  | 'reviewed'
  | 'stale';

export type GlossaryAdSurfacePolicy =
  | 'forbidden'
  | 'allowed'
  | 'future-experiment-only';

export interface GlossaryMatchPhrase {
  readonly phrase: string;
  readonly autoMatch: boolean;
  readonly priority: number;
  readonly caseSensitive?: boolean;
  readonly wholeWord?: boolean;
  readonly allowAfterJosa?: boolean;
}

export interface GlossaryLocaleContract {
  readonly label: string;
  readonly slug: string;
  readonly short: string;
  readonly long?: string;
  readonly example?: string;
  readonly translationStatus: GlossaryTranslationStatus;
  readonly sourceLocale?: string;
  readonly lastReviewedAt?: string;
}

export interface GlossaryAdPolicy {
  readonly hoverCard: GlossaryAdSurfacePolicy;
  readonly termSheet: GlossaryAdSurfacePolicy;
  readonly detailPage: GlossaryAdSurfacePolicy;
}

export interface GlossaryInteraction {
  readonly trigger: 'click';
  readonly surface: 'term-sheet';
  readonly desktopPlacement: 'right-sheet';
  readonly mobilePlacement: 'bottom-sheet';
}

export interface GlossaryTermContract {
  readonly id: GlossaryTermId;
  readonly canonicalLabel: string;
  readonly status: GlossaryTermStatus;
  readonly visibility: GlossaryVisibility;
  readonly products?: readonly string[];
  readonly sites?: readonly string[];
  readonly owner: string;
  readonly reviewedAt?: string;
  readonly reviewIntervalDays?: number;
  readonly detailEnabled: boolean;
  readonly indexable: boolean;
  readonly monetizable: boolean;
  readonly deprecated: boolean;
  readonly replacedBy?: GlossaryTermId;
  readonly aliases: Readonly<Record<string, readonly string[]>>;
  readonly matchPhrases: Readonly<Record<string, readonly GlossaryMatchPhrase[]>>;
  readonly locales: Readonly<Record<string, GlossaryLocaleContract>>;
  readonly tags?: readonly string[];
  readonly relatedTerms?: readonly GlossaryTermId[];
  readonly canonicalPath?: string;
  readonly interaction: GlossaryInteraction;
  readonly adPolicy: GlossaryAdPolicy;
}

export interface GlossaryManifestEntry {
  readonly id: GlossaryTermId;
  readonly visibility: GlossaryVisibility;
  readonly label: string;
  readonly slug: string;
  readonly short: string;
  readonly long?: string;
  readonly example?: string;
  readonly aliases: readonly string[];
  readonly matchPhrases: readonly GlossaryMatchPhrase[];
  readonly relatedTerms?: readonly GlossaryTermId[];
  readonly canonicalPath?: string;
  readonly interaction: GlossaryInteraction;
  readonly adPolicy: GlossaryAdPolicy;
  readonly detailEnabled: boolean;
  readonly indexable: boolean;
  readonly monetizable: boolean;
}

export interface GlossaryManifest {
  readonly locale: string;
  readonly generatedAt: string;
  readonly terms: readonly GlossaryManifestEntry[];
}

export function defineGlossaryTermContract(
  contract: GlossaryTermContract
): GlossaryTermContract {
  return contract;
}
