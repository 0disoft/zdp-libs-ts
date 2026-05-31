import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadApiContractsInput } from './api-source';
import {
  parseApiContractSourceContract,
  parseEnvContract,
  parseErrorContract,
  parseEventContract,
  parseI18nContract,
  parsePackageBoundariesContract,
  parseSchemaContract
} from './parser';
import { validateLibsContracts } from './validator';
import type { LibsContracts } from './types';

export async function runLibsContractCheckCli(
  argv: readonly string[]
): Promise<number> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return 0;
  }

  try {
    const options = readOptions(argv);
    const contracts = await loadContracts(options.root);
    const result = validateLibsContracts(contracts, {
      apiContractsInput: loadApiContractsInput(options.apiContractsRoot)
    });

    if (result.ok) {
      console.log('Libs contract check passed.');
      return 0;
    }

    for (const diagnostic of result.diagnostics) {
      console.error(
        `${diagnostic.code} ${diagnostic.file} ${diagnostic.path}: ${diagnostic.message}`
      );
    }

    return 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function readOptions(argv: readonly string[]): {
  readonly root: string;
  readonly apiContractsRoot: string;
} {
  const root = readStringOption(argv, '--root') ?? process.cwd();

  return {
    root,
    apiContractsRoot:
      readStringOption(argv, '--api-contracts-root') ??
      join(root, '..', 'zdp-api-contracts')
  };
}

function readStringOption(
  argv: readonly string[],
  optionName: string
): string | null {
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== optionName) {
      continue;
    }

    const value = argv[index + 1];
    return value === undefined || value.startsWith('--') ? null : value;
  }

  return null;
}

async function loadContracts(root: string): Promise<LibsContracts> {
  return {
    packageBoundaries: parsePackageBoundariesContract(
      await readContract(root, 'package-boundaries.yaml')
    ),
    apiContractSource: parseApiContractSourceContract(
      await readContract(root, 'api-contract-source.yaml')
    ),
    env: parseEnvContract(await readContract(root, 'env-contract.yaml')),
    error: parseErrorContract(await readContract(root, 'error-contract.yaml')),
    schema: parseSchemaContract(await readContract(root, 'schema-contract.yaml')),
    event: parseEventContract(await readContract(root, 'event-contract.yaml')),
    i18n: parseI18nContract(await readContract(root, 'i18n-contract.yaml'))
  };
}

async function readContract(root: string, fileName: string): Promise<string> {
  return await readFile(join(root, 'contracts', fileName), 'utf8');
}

function printHelp(): void {
  console.log(`Usage:
  bun scripts/check-libs-contracts.ts [--root <path>] [--api-contracts-root <path>]

Checks package boundary, API source handoff, schema, env, event, error, and i18n contract YAML.
Also reads zdp-api-contracts route, error, webhook, and SDK generation input contracts to catch handoff drift.`);
}
