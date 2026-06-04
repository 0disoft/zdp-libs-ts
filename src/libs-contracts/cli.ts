import { join } from 'node:path';
import { loadApiContractsInput } from './api-source';
import { loadLibsContracts } from './parser';
import { validateLibsContracts } from './validator';

export async function runLibsContractCheckCli(
  argv: readonly string[]
): Promise<number> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return 0;
  }

  try {
    const options = readOptions(argv);
    const contracts = await loadLibsContracts(options.root);
    const result = validateLibsContracts(contracts, {
      apiContractsInput: await loadApiContractsInput(options.apiContractsRoot)
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

function printHelp(): void {
  console.log(`Usage:
  bun scripts/check-libs-contracts.ts [--root <path>] [--api-contracts-root <path>]

Checks package boundary, API source handoff, schema, env, event, error, and i18n contract YAML.
Also reads zdp-api-contracts route, error, webhook, SDK generation input, and API catalog contracts to catch handoff drift.`);
}
