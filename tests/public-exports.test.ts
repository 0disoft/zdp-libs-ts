import { describe, expect, it } from 'bun:test';
import {
  SCHEMA_GENERATION_TARGETS,
  defineEnvContractMetadata,
  defineEventContractMetadata,
  defineGlossaryTermContract,
  defineI18nMessageContract,
  defineSchemaMetadata,
  defineZdpErrorContract
} from '../src/index';
import type { GlossaryTermId, I18nMessageKey } from '../src/index';
import { defineSchemaMetadata as defineSchemaMetadataFromSubpath } from '../src/schema/index';

describe('public contract package exports', () => {
  it('exposes schema metadata without owning product models', () => {
    const metadata = defineSchemaMetadata({
      schemaId: 'public.example',
      version: '1.0.0',
      owner: 'api-contracts',
      jsonSchemaRef: 'schemas/public.example.json',
      openapiRef: 'openapi/public.yaml#/components/schemas/PublicExample',
      sdkGenerationTargets: ['typescript', 'rust']
    });

    expect(metadata.sdkGenerationTargets).toEqual(['typescript', 'rust']);
    expect(SCHEMA_GENERATION_TARGETS).toContain('dart');
    expect(defineSchemaMetadataFromSubpath(metadata)).toBe(metadata);
  });

  it('exposes env, event, error, and i18n contract markers', () => {
    const messageKey: I18nMessageKey = 'example.conflict';
    // @ts-expect-error i18n message keys must include a domain prefix.
    const invalidMessageKey: I18nMessageKey = 'conflict';
    const env = defineEnvContractMetadata({
      name: 'ZDP_EXAMPLE_URL',
      owner: 'platform',
      environment: 'local',
      secret: false,
      required: true,
      description: 'Example endpoint without a secret value.'
    });
    const event = defineEventContractMetadata({
      eventId: 'example.created',
      schemaRef: 'schemas/events/example.created.json',
      source: 'api-contracts',
      privacyClass: 'none',
      replaySafe: true,
      trace: {
        requestId: 'req_123',
        traceId: 'trace_123'
      }
    });
    const error = defineZdpErrorContract({
      code: 'EXAMPLE_CONFLICT',
      category: 'conflict',
      retryable: false,
      publicMessageKey: 'example.conflict',
      requestId: 'req_123',
      traceId: 'trace_123'
    });
    const message = defineI18nMessageContract({
      key: messageKey,
      defaultLocale: 'ko-KR',
      arguments: [
        {
          name: 'resource',
          type: 'string',
          required: true
        }
      ],
      owner: 'api-contracts',
      fallbackPolicy: 'use default locale message key'
    });

    expect(env.secret).toBe(false);
    expect(event.trace.traceId).toBe('trace_123');
    expect(error.publicMessageKey).toBe(message.key);
    expect(message.arguments[0]?.name).toBe('resource');
    expect(String(invalidMessageKey)).toBe('conflict');
  });

  it('exposes glossary term contract markers without owning backend or ad runtime', () => {
    const termId: GlossaryTermId = 'billing.ledger';
    // @ts-expect-error glossary term ids must include a namespace prefix.
    const invalidTermId: GlossaryTermId = 'ledger';
    const term = defineGlossaryTermContract({
      id: termId,
      status: 'active',
      visibility: 'public',
      owner: 'platform-money',
      detailEnabled: true,
      indexable: true,
      monetizable: true,
      deprecated: false,
      aliases: {
        en: ['ledger'],
        ko: ['원장']
      },
      matchPhrases: {
        en: [
          {
            phrase: 'ledger',
            autoMatch: true,
            priority: 20,
            caseSensitive: false,
            wholeWord: true
          }
        ],
        ko: [
          {
            phrase: '원장',
            autoMatch: true,
            priority: 20,
            allowAfterJosa: true
          }
        ]
      },
      locales: {
        en: {
          label: 'Ledger',
          slug: 'ledger',
          short: 'A record of money movements.',
          translationStatus: 'reviewed'
        },
        ko: {
          label: '원장',
          slug: 'ledger',
          short: '돈의 이동을 기록하는 장부.',
          translationStatus: 'reviewed',
          sourceLocale: 'en'
        }
      },
      relatedTerms: ['billing.entitlement'],
      canonicalPath: '/glossary/ledger',
      interaction: {
        trigger: 'click',
        surface: 'term-sheet',
        desktopPlacement: 'right-sheet',
        mobilePlacement: 'bottom-sheet'
      },
      adPolicy: {
        hoverCard: 'forbidden',
        termSheet: 'future-experiment-only',
        detailPage: 'allowed'
      }
    });

    expect(term.id).toBe('billing.ledger');
    expect(term.interaction.mobilePlacement).toBe('bottom-sheet');
    expect(term.adPolicy.termSheet).toBe('future-experiment-only');
    expect(String(invalidTermId)).toBe('ledger');
  });
});
