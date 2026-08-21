export function packageConsumerSmokeSource(): string {
  return `import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as root from 'zdp-libs-ts';
import * as schema from 'zdp-libs-ts/schema';
import * as envContract from 'zdp-libs-ts/env-contract';
import * as eventContracts from 'zdp-libs-ts/event-contracts';
import * as errorContract from 'zdp-libs-ts/error';
import * as i18nContract from 'zdp-libs-ts/i18n-contract';
import * as glossaryContract from 'zdp-libs-ts/glossary-contract';
import * as calculator from 'zdp-libs-ts/calculator-engine';

const expectedVersion = process.argv[2];
const installedManifest = JSON.parse(
  await readFile(
    join(process.cwd(), 'node_modules', 'zdp-libs-ts', 'package.json'),
    'utf8'
  )
);
if (installedManifest.version !== expectedVersion) {
  throw new Error(
    \`Expected zdp-libs-ts@\${expectedVersion}, installed \${installedManifest.version}.\`
  );
}

const schemaMetadata = schema.defineSchemaMetadata({
  schemaId: 'smoke.schema',
  version: '1.0.0',
  owner: 'smoke',
  jsonSchemaRef: '#/smoke',
  openapiRef: '#/components/schemas/Smoke',
  sdkGenerationTargets: ['typescript']
});
const envMetadata = envContract.defineEnvContractMetadata({
  name: 'SMOKE_VALUE',
  owner: 'smoke',
  environment: 'test',
  secret: false,
  required: true,
  description: 'Synthetic package smoke value.'
});
const eventMetadata = eventContracts.defineEventContractMetadata({
  eventId: 'smoke.completed',
  schemaRef: '#/smoke',
  source: 'package-smoke',
  privacyClass: 'none',
  replaySafe: true,
  trace: { requestId: 'request-smoke', traceId: 'trace-smoke' }
});
const errorMetadata = errorContract.defineZdpErrorContract({
  code: 'smoke_error',
  category: 'internal',
  retryable: false,
  publicMessageKey: 'error.smoke',
  requestId: 'request-smoke',
  traceId: 'trace-smoke'
});
const i18nMetadata = i18nContract.defineI18nMessageContract({
  key: 'smoke.message',
  defaultLocale: 'en',
  arguments: [],
  owner: 'smoke',
  fallbackPolicy: 'default_locale'
});
const glossaryMetadata = glossaryContract.defineGlossaryTermContract({
  id: 'platform.smoke',
  canonicalLabel: 'smoke',
  status: 'active',
  visibility: 'public',
  owner: 'smoke',
  detailEnabled: false,
  indexable: false,
  monetizable: false,
  deprecated: false,
  aliases: {},
  matchPhrases: {},
  locales: {},
  interaction: {
    trigger: 'click',
    surface: 'term-sheet',
    desktopPlacement: 'right-sheet',
    mobilePlacement: 'bottom-sheet'
  },
  adPolicy: {
    hoverCard: 'forbidden',
    termSheet: 'forbidden',
    detailPage: 'forbidden'
  }
});
const result = calculator.calculatePercentageChange(
  { initialValue: '100', finalValue: '125' },
  {
    contractVersion: calculator.CALCULATOR_CONTRACT_VERSION,
    decimalPlaces: 2
  }
);

const forbiddenRootExports = [
  'CALCULATOR_CONTRACT_VERSION',
  'CALCULATOR_ENGINE_VERSION',
  'CALCULATOR_IDS',
  'calculateById',
  'calculatePercentageChange'
];
for (const exportName of forbiddenRootExports) {
  if (Object.hasOwn(root, exportName)) {
    throw new Error(
      \`Calculator export leaked through package root: \${exportName}.\`
    );
  }
}

if (
  root.defineSchemaMetadata !== schema.defineSchemaMetadata ||
  root.defineEnvContractMetadata !== envContract.defineEnvContractMetadata ||
  root.defineEventContractMetadata !== eventContracts.defineEventContractMetadata ||
  root.defineZdpErrorContract !== errorContract.defineZdpErrorContract ||
  root.defineI18nMessageContract !== i18nContract.defineI18nMessageContract ||
  root.defineGlossaryTermContract !== glossaryContract.defineGlossaryTermContract ||
  schemaMetadata.schemaId !== 'smoke.schema' ||
  envMetadata.name !== 'SMOKE_VALUE' ||
  eventMetadata.eventId !== 'smoke.completed' ||
  errorMetadata.code !== 'smoke_error' ||
  i18nMetadata.key !== 'smoke.message' ||
  glossaryMetadata.id !== 'platform.smoke' ||
  !result.ok ||
  result.value.percentageChange.value !== '25.00'
) {
  throw new Error('Published package exports or runtime result were invalid.');
}

console.log(\`zdp-libs-ts@\${expectedVersion} consumer smoke passed.\`);
`;
}
