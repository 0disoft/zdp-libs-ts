import type { ApiContractSourceContract, EnvContract, ErrorContract, EventContract, GlossaryContract, I18nContract, LibsContracts, PackageBoundariesContract, SchemaContract } from './types.js';
interface ContractLoadFailure {
    readonly name: string;
    readonly file: string;
    readonly message: string;
}
export declare class LibsContractLoadError extends Error {
    readonly failures: readonly ContractLoadFailure[];
    constructor(failures: readonly ContractLoadFailure[]);
}
export declare function loadLibsContracts(root?: string): Promise<LibsContracts>;
export declare function parsePackageBoundariesContract(source: string): PackageBoundariesContract;
export declare function parseApiContractSourceContract(source: string): ApiContractSourceContract;
export declare function parseEnvContract(source: string): EnvContract;
export declare function parseErrorContract(source: string): ErrorContract;
export declare function parseSchemaContract(source: string): SchemaContract;
export declare function parseEventContract(source: string): EventContract;
export declare function parseI18nContract(source: string): I18nContract;
export declare function parseGlossaryContract(source: string): GlossaryContract;
export {};
//# sourceMappingURL=parser.d.ts.map