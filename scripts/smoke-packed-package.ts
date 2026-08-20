import {
  mkdir,
  readdir,
  rm,
  writeFile
} from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const smokeRoot = join(repositoryRoot, '.tmp', 'package-smoke');
const packageRoot = join(smokeRoot, 'package');
const consumerRoot = join(smokeRoot, 'consumer');

await rm(smokeRoot, { recursive: true, force: true });
await mkdir(packageRoot, { recursive: true });
await run(npmCommand(), [
  'pack',
  '--json',
  '--pack-destination',
  packageRoot
], repositoryRoot);

const tarballs = (await readdir(packageRoot)).filter((file) => file.endsWith('.tgz'));
if (tarballs.length !== 1 || tarballs[0] === undefined) {
  throw new Error(`Expected exactly one package tarball, found ${tarballs.length}.`);
}

await mkdir(consumerRoot, { recursive: true });
await writeFile(
  join(consumerRoot, 'package.json'),
  `${JSON.stringify({ name: 'zdp-libs-ts-smoke', private: true, type: 'module' }, null, 2)}\n`,
  'utf8'
);
await writeFile(
  join(consumerRoot, 'smoke.mjs'),
  `import * as rootPackage from 'zdp-libs-ts';
import {
  CALCULATOR_CONTRACT_VERSION,
  CALCULATOR_ENGINE_VERSION,
  CALCULATOR_IDS,
  calculateAge,
  calculateById,
  calculateBreakEvenPoint,
  calculateCompoundInterest,
  calculateDataTransferTime,
  calculateDateDifference,
  calculateDiscount,
  calculatePercentageChange,
  calculateStudycafeSeatOccupancy
} from 'zdp-libs-ts/calculator-engine';

const forbiddenRootExports = [
  'CALCULATOR_CONTRACT_VERSION',
  'CALCULATOR_ENGINE_VERSION',
  'CALCULATOR_IDS',
  'calculateById',
  'calculatePercentageChange',
  'calculateBreakEvenPoint'
];
for (const exportName of forbiddenRootExports) {
  if (Object.hasOwn(rootPackage, exportName)) {
    throw new Error(\`Calculator export leaked through package root: \${exportName}.\`);
  }
}
const schemaMetadata = rootPackage.defineSchemaMetadata({
  schemaId: 'smoke.example',
  version: '1.0.0',
  owner: 'package-smoke',
  jsonSchemaRef: 'schemas/smoke.example.json',
  openapiRef: 'openapi/smoke.yaml#/components/schemas/SmokeExample',
  sdkGenerationTargets: ['typescript']
});
const result = calculatePercentageChange(
  { initialValue: '100', finalValue: '125' },
  { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
);
const dispatched = calculateById(
  'percentage-change',
  { initialValue: '100', finalValue: '125' },
  { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
);
const breakEven = calculateBreakEvenPoint(
  {
    fixedCost: { value: '1000', unit: 'USD' },
    unitPrice: { value: '50', unit: 'USD' },
    unitVariableCost: { value: '30', unit: 'USD' }
  },
  { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
);
const transferTime = calculateDataTransferTime(
  {
    dataSize: { value: '1', unit: 'gigabyte' },
    dataRate: { value: '100', unit: 'megabits_per_second' }
  },
  { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
);
const dateDifference = calculateDateDifference(
  {
    startDate: '2024-02-28',
    endDate: '2024-03-01',
    boundaryMode: 'exclusive'
  },
  { contractVersion: CALCULATOR_CONTRACT_VERSION }
);
const compoundInterest = calculateCompoundInterest(
  {
    principal: { value: '100', unit: 'USD' },
    nominalAnnualRate: '0.05',
    compoundingPeriods: '2',
    compoundingFrequency: '1_per_year'
  },
  { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
);
const seatOccupancy = calculateStudycafeSeatOccupancy(
  {
    seatCount: { value: '50', unit: 'seats' },
    openingDaysPerMonth: { value: '30', unit: 'days' },
    openingHoursPerDay: { value: '12', unit: 'hours' },
    occupiedSeatHours: { value: '9000', unit: 'seat_hours' }
  },
  { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
);
const discount = calculateDiscount(
  {
    originalPrice: { value: '80', unit: 'USD' },
    discountRate1: '25',
    discountRate2: '0',
    mode: 'final-price'
  },
  { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
);
const age = calculateAge(
  { birthDate: '2000-02-29', referenceDate: '2025-02-28' },
  { contractVersion: CALCULATOR_CONTRACT_VERSION }
);
if (
  schemaMetadata.schemaId !== 'smoke.example' ||
  !result.ok ||
  result.value.percentageChange.value !== '25.00' ||
  !dispatched.ok ||
  dispatched.value.percentageChange.value !== '25.00' ||
  CALCULATOR_IDS.length === 0 ||
  !CALCULATOR_IDS.includes('percentage-change') ||
  !breakEven.ok ||
  breakEven.value.breakEvenQuantity.value !== '50.00' ||
  !transferTime.ok ||
  transferTime.value.transferDuration.value !== '80.00' ||
  !dateDifference.ok ||
  dateDifference.value.calendarDayCount.value !== 2 ||
  !compoundInterest.ok ||
  compoundInterest.value.futureValue.value !== '110.25' ||
  !seatOccupancy.ok ||
  seatOccupancy.value.occupancyPercentage.value !== '50.00' ||
  !discount.ok ||
  discount.value.finalPrice.value !== '60.00' ||
  !age.ok ||
  age.value.ageYears.value !== 25 ||
  CALCULATOR_ENGINE_VERSION !== '0.6.0'
) {
  throw new Error('Package root boundary or calculator engine tarball result was invalid.');
}
console.log('zdp-libs-ts tarball smoke passed.');
`,
  'utf8'
);

const tarball = join(packageRoot, tarballs[0]);
await run(
  npmCommand(),
  [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--package-lock=false',
    tarball
  ],
  consumerRoot
);
await run('node', ['smoke.mjs'], consumerRoot);

function npmCommand(): string {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

async function run(
  command: string,
  args: readonly string[],
  cwd: string
): Promise<void> {
  const processHandle = Bun.spawn([command, ...args], {
    cwd,
    stdin: 'ignore',
    stdout: 'inherit',
    stderr: 'inherit'
  });
  const exitCode = await processHandle.exited;
  if (exitCode !== 0) {
    throw new Error(`${command} failed with exit code ${exitCode}.`);
  }
}
