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
  `import {
  CALCULATOR_CONTRACT_VERSION,
  calculatePercentageChange
} from 'zdp-libs-ts/calculator-engine';
import { CALCULATOR_ENGINE_VERSION } from 'zdp-libs-ts';

const result = calculatePercentageChange(
  { initialValue: '100', finalValue: '125' },
  { contractVersion: CALCULATOR_CONTRACT_VERSION, decimalPlaces: 2 }
);
if (
  !result.ok ||
  result.value.percentageChange.value !== '25.00' ||
  CALCULATOR_ENGINE_VERSION !== '0.1.0'
) {
  throw new Error('Calculator engine tarball result was invalid.');
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
