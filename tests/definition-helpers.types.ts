import {
  defineEnvContractMetadata,
  defineEventContractMetadata,
  defineGlossaryTermContract,
  defineI18nMessageContract,
  defineSchemaMetadata,
  defineZdpErrorContract
} from '../dist/index.js';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;

type Expect<Value extends true> = Value;

const schema = defineSchemaMetadata({
  schemaId: 'billing.invoice',
  version: '1.2.0',
  owner: 'api-contracts',
  jsonSchemaRef: 'schemas/billing.invoice.json',
  openapiRef: 'openapi/public.yaml#/components/schemas/BillingInvoice',
  sdkGenerationTargets: ['typescript', 'rust'],
  sourceKind: 'generated'
});

type SchemaIdStaysLiteral = Expect<
  Equal<typeof schema.schemaId, 'billing.invoice'>
>;
type SchemaTargetsStayTuple = Expect<
  Equal<typeof schema.sdkGenerationTargets, readonly ['typescript', 'rust']>
>;
type SchemaExtensionStaysLiteral = Expect<
  Equal<typeof schema.sourceKind, 'generated'>
>;

const env = defineEnvContractMetadata({
  name: 'ZDP_API_ORIGIN',
  owner: 'platform',
  environment: 'production',
  secret: false,
  required: true,
  description: 'Public API origin.'
});

type EnvNameStaysLiteral = Expect<Equal<typeof env.name, 'ZDP_API_ORIGIN'>>;
type EnvFlagsStayLiteral = Expect<
  Equal<readonly [typeof env.secret, typeof env.required], readonly [false, true]>
>;

const event = defineEventContractMetadata({
  eventId: 'invoice.created',
  schemaRef: 'schemas/events/invoice.created.json',
  source: 'billing-api',
  privacyClass: 'financial',
  replaySafe: true,
  trace: {
    requestId: 'req_example',
    traceId: 'trace_example'
  }
});

type EventIdStaysLiteral = Expect<
  Equal<typeof event.eventId, 'invoice.created'>
>;
type NestedTraceStaysLiteral = Expect<
  Equal<typeof event.trace.traceId, 'trace_example'>
>;

const error = defineZdpErrorContract({
  code: 'INVOICE_CONFLICT',
  category: 'conflict',
  retryable: false,
  publicMessageKey: 'invoice.conflict',
  requestId: 'req_example',
  traceId: 'trace_example'
});

type ErrorCodeStaysLiteral = Expect<
  Equal<typeof error.code, 'INVOICE_CONFLICT'>
>;
type ErrorCategoryStaysLiteral = Expect<
  Equal<typeof error.category, 'conflict'>
>;

const message = defineI18nMessageContract({
  key: 'invoice.conflict',
  defaultLocale: 'ko-KR',
  arguments: [
    {
      name: 'invoiceId',
      type: 'string',
      required: true
    }
  ],
  owner: 'billing-api',
  fallbackPolicy: 'use-default-locale'
});

type MessageKeyStaysLiteral = Expect<
  Equal<typeof message.key, 'invoice.conflict'>
>;
type MessageArgumentsStayTuple = Expect<
  Equal<typeof message.arguments['length'], 1>
>;
type MessageArgumentNameStaysLiteral = Expect<
  Equal<typeof message.arguments[0]['name'], 'invoiceId'>
>;

const glossary = defineGlossaryTermContract({
  id: 'billing.invoice',
  canonicalLabel: 'Invoice',
  status: 'active',
  visibility: 'public',
  owner: 'billing',
  detailEnabled: true,
  indexable: true,
  monetizable: false,
  deprecated: false,
  aliases: {
    en: ['invoice', 'bill']
  },
  matchPhrases: {
    en: [
      {
        phrase: 'invoice',
        autoMatch: true,
        priority: 10
      }
    ]
  },
  locales: {
    en: {
      label: 'Invoice',
      slug: 'invoice',
      short: 'A payment request document.',
      translationStatus: 'reviewed'
    }
  },
  interaction: {
    trigger: 'click',
    surface: 'term-sheet',
    desktopPlacement: 'right-sheet',
    mobilePlacement: 'bottom-sheet'
  },
  adPolicy: {
    hoverCard: 'forbidden',
    termSheet: 'forbidden',
    detailPage: 'allowed'
  }
});

type GlossaryIdStaysLiteral = Expect<
  Equal<typeof glossary.id, 'billing.invoice'>
>;
type GlossaryAliasesStayTuple = Expect<
  Equal<typeof glossary.aliases.en, readonly ['invoice', 'bill']>
>;
type GlossaryNestedPolicyStaysLiteral = Expect<
  Equal<typeof glossary.adPolicy.detailPage, 'allowed'>
>;
