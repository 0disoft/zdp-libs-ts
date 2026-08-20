import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const apiContractsRoot = resolve(
  repositoryRoot,
  readOptionalPathOption(process.argv.slice(2), '--api-contracts-root') ??
    '../zdp-api-contracts'
);

const processHandle = Bun.spawn(
  [
    'bun',
    'test',
    'tests/calculator-engine',
    'tests/libs-contracts.test.ts'
  ],
  {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      ZDP_API_CONTRACTS_ROOT: apiContractsRoot
    },
    stdin: 'ignore',
    stdout: 'inherit',
    stderr: 'inherit'
  }
);

const exitCode = await processHandle.exited;
if (exitCode !== 0) {
  throw new Error(`API contract integration tests failed with exit code ${exitCode}.`);
}

function readOptionalPathOption(
  argv: readonly string[],
  optionName: string
): string | null {
  const optionIndex = argv.indexOf(optionName);
  if (optionIndex === -1) {
    return null;
  }

  const value = argv[optionIndex + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${optionName} requires a path.`);
  }

  return value;
}
