import { describe, expect, it } from 'bun:test';
import {
  SCHEMA_GENERATION_TARGETS,
  CALCULATOR_CONTRACT_VERSION,
  calculateBreakEvenPoint,
  calculateCompoundInterest,
  calculateDataTransferTime,
  calculateDateDifference,
  calculateDiscount,
  calculatePercentageChange,
  calculateSecurityCostBreakEven,
  calculateStudycafeSeatOccupancy,
  defineEnvContractMetadata,
  defineEventContractMetadata,
  defineGlossaryTermContract,
  defineI18nMessageContract,
  defineSchemaMetadata,
  defineZdpErrorContract
} from '../src/index';
import type { GlossaryTermId, I18nMessageKey } from '../src/index';
import { defineSchemaMetadata as defineSchemaMetadataFromSubpath } from '../src/schema/index';
import {
  calculateMarginMarkup as calculateMarginMarkupFromSubpath,
  calculateStudyRoomScheduleRevenue as calculateStudyRoomScheduleRevenueFromSubpath,
  calculateDiscount as calculateDiscountFromSubpath
} from '../src/calculator-engine/index';

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
      canonicalLabel: 'Ledger',
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

  it('exposes calculator functions through root and calculator-engine subpath', () => {
    const options = {
      contractVersion: CALCULATOR_CONTRACT_VERSION,
      decimalPlaces: 2
    };

    expect(
      calculatePercentageChange(
        { initialValue: '100', finalValue: '125' },
        options
      )
    ).toEqual({
      ok: true,
      value: {
        percentageChange: { value: '25.00', unit: 'percent' }
      }
    });
    expect(
      calculateMarginMarkupFromSubpath(
        {
          cost: { value: '80', unit: 'USD' },
          sellingPrice: { value: '100', unit: 'USD' }
        },
        options
      )
    ).toEqual({
      ok: true,
      value: {
        marginPercentage: { value: '20.00', unit: 'percent' },
        markupPercentage: { value: '25.00', unit: 'percent' }
      }
    });
    expect(
      calculateBreakEvenPoint(
        {
          fixedCost: { value: '1000', unit: 'USD' },
          unitPrice: { value: '50', unit: 'USD' },
          unitVariableCost: { value: '30', unit: 'USD' }
        },
        options
      )
    ).toEqual({
      ok: true,
      value: {
        contributionMarginPerUnit: { value: '20.00', unit: 'USD' },
        breakEvenQuantity: { value: '50.00', unit: 'items' }
      }
    });
    expect(
      calculateDataTransferTime(
        {
          dataSize: { value: '1', unit: 'gigabyte' },
          dataRate: { value: '100', unit: 'megabits_per_second' }
        },
        options
      )
    ).toEqual({
      ok: true,
      value: {
        transferDuration: { value: '80.00', unit: 'seconds' }
      }
    });
    expect(
      calculateDiscountFromSubpath(
        {
          originalPrice: { value: '80', unit: 'USD' },
          discountRate1: '25',
          discountRate2: '0',
          mode: 'final-price'
        },
        options
      )
    ).toEqual({
      ok: true,
      value: {
        originalPrice: { value: '80.00', unit: 'USD' },
        finalPrice: { value: '60.00', unit: 'USD' },
        totalSavings: { value: '20.00', unit: 'USD' },
        totalDiscountPercent: { value: '25.00', unit: 'percent' }
      }
    });
    expect(calculateDiscount).toBe(calculateDiscountFromSubpath);
    expect(
      calculateDateDifference(
        {
          startDate: '2024-02-28',
          endDate: '2024-03-01',
          boundaryMode: 'exclusive'
        },
        { contractVersion: CALCULATOR_CONTRACT_VERSION }
      )
    ).toEqual({
      ok: true,
      value: {
        calendarDayCount: { value: 2, unit: 'days' }
      }
    });
    expect(
      calculateCompoundInterest(
        {
          principal: { value: '100', unit: 'USD' },
          nominalAnnualRate: '0.05',
          compoundingPeriods: '2',
          compoundingFrequency: '1_per_year'
        },
        options
      )
    ).toEqual({
      ok: true,
      value: {
        futureValue: { value: '110.25', unit: 'USD' },
        interestEarned: { value: '10.25', unit: 'USD' }
      }
    });
    expect(
      calculateStudycafeSeatOccupancy(
        {
          seatCount: { value: '50', unit: 'seats' },
          openingDaysPerMonth: { value: '30', unit: 'days' },
          openingHoursPerDay: { value: '12', unit: 'hours' },
          occupiedSeatHours: { value: '9000', unit: 'seat_hours' }
        },
        options
      )
    ).toEqual({
      ok: true,
      value: {
        availableSeatHours: { value: '18000.00', unit: 'seat_hours' },
        occupancyPercentage: { value: '50.00', unit: 'percent' }
      }
    });
    expect(
      calculateStudyRoomScheduleRevenueFromSubpath(
        {
          bookableRoomHours: { value: '200', unit: 'room_hours' },
          bookingRatio: '0.75',
          averageHourlyPrice: { value: '20', unit: 'USD' },
          monthlyOperatingCost: { value: '500', unit: 'USD' }
        },
        options
      )
    ).toEqual({
      ok: true,
      value: {
        bookedRoomHours: { value: '150.00', unit: 'room_hours' },
        monthlyGrossRevenue: { value: '3000.00', unit: 'USD' },
        monthlyNetRevenue: { value: '2500.00', unit: 'USD' }
      }
    });
    expect(
      calculateSecurityCostBreakEven(
        {
          monthlyBaseFixedCost: { value: '800', unit: 'USD' },
          monthlySecurityCost: { value: '200', unit: 'USD' },
          unitPrice: { value: '50', unit: 'USD' },
          unitVariableCost: { value: '30', unit: 'USD' }
        },
        options
      )
    ).toEqual({
      ok: true,
      value: {
        totalMonthlyFixedCost: { value: '1000.00', unit: 'USD' },
        contributionMarginPerUnit: { value: '20.00', unit: 'USD' },
        breakEvenQuantity: { value: '50.00', unit: 'items' }
      }
    });
  });
});
