import type { ApiContractsInput } from './types.js';
export interface ApiContractLoadFailure {
    readonly file: string;
    readonly message: string;
}
export declare class ApiContractLoadError extends Error {
    readonly failures: readonly ApiContractLoadFailure[];
    constructor(failures: readonly ApiContractLoadFailure[]);
}
export declare function loadApiContractsInput(apiContractsRoot: string): Promise<ApiContractsInput>;
//# sourceMappingURL=api-source.d.ts.map