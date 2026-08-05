import type { ApiContractsInput, LibsContracts, LibsContractValidationResult } from './types.js';
export declare const CALCULATOR_REQUIRED_ENGINE_VERSION: Readonly<Record<string, string>>;
export declare function validateLibsContracts(contracts: LibsContracts, options?: {
    readonly apiContractsInput?: ApiContractsInput;
}): LibsContractValidationResult;
//# sourceMappingURL=validator.d.ts.map