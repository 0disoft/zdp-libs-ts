import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
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
    const contracts = await loadContracts(process.cwd());
    const result = validateLibsContracts(contracts);

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
  bun scripts/check-libs-contracts.ts

Checks package boundary, API source handoff, schema, env, event, error, and i18n contract YAML.`);
}
