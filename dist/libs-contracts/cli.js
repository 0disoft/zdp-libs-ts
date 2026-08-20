import { loadApiContractsInput } from './api-source.js';
import { loadLibsContracts } from './parser.js';
import { validateLibsContracts } from './validator.js';
export async function runLibsContractCheckCli(argv) {
    if (argv.includes('--help') || argv.includes('-h')) {
        printHelp();
        return 0;
    }
    try {
        const options = readOptions(argv);
        const contracts = await loadLibsContracts(options.root);
        const apiContractsInput = options.apiContractsRoot === null
            ? undefined
            : await loadApiContractsInput(options.apiContractsRoot);
        const result = validateLibsContracts(contracts, apiContractsInput === undefined ? {} : { apiContractsInput });
        if (result.ok) {
            console.log(apiContractsInput === undefined
                ? 'Libs local contract check passed.'
                : 'Libs API contract integration check passed.');
            return 0;
        }
        for (const diagnostic of result.diagnostics) {
            console.error(`${diagnostic.code} ${diagnostic.file} ${diagnostic.path}: ${diagnostic.message}`);
        }
        return 1;
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        return 1;
    }
}
function readOptions(argv) {
    return {
        root: readOptionalPathOption(argv, '--root') ?? process.cwd(),
        apiContractsRoot: readOptionalPathOption(argv, '--api-contracts-root')
    };
}
function readOptionalPathOption(argv, optionName) {
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
function printHelp() {
    console.log(`Usage:
  bun scripts/check-libs-contracts.ts [--root <path>]
  bun scripts/check-libs-contracts.ts [--root <path>] --api-contracts-root <path>

Without --api-contracts-root, checks only contracts committed to zdp-libs-ts.
With --api-contracts-root, also checks route, error, webhook, SDK generation, API catalog, and calculator contract drift against zdp-api-contracts.`);
}
//# sourceMappingURL=cli.js.map