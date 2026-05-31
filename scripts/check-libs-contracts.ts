import { runLibsContractCheckCli } from '../src/libs-contracts/cli';

const exitCode = await runLibsContractCheckCli(process.argv.slice(2));

process.exitCode = exitCode;
