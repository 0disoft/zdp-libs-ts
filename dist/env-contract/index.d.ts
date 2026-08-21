export interface EnvContractMetadata {
    readonly name: string;
    readonly owner: string;
    readonly environment: string;
    readonly secret: boolean;
    readonly required: boolean;
    readonly description: string;
}
export declare function defineEnvContractMetadata<const Metadata extends EnvContractMetadata>(metadata: Metadata): Metadata;
//# sourceMappingURL=index.d.ts.map