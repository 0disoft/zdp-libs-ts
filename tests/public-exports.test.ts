import { describe, expect, it } from 'bun:test';
import {
  SCHEMA_GENERATION_TARGETS,
  defineEnvContractMetadata,
  defineEventContractMetadata,
  defineI18nMessageContract,
  defineSchemaMetadata,
  defineZdpErrorContract
} from '../src/index';
import type { I18nMessageKey } from '../src/index';
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
});
