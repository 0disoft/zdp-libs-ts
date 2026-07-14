export declare const SCHEMA_GENERATION_TARGETS: readonly ["json_schema", "openapi", "typescript", "rust", "dart"];
export type SchemaGenerationTarget = (typeof SCHEMA_GENERATION_TARGETS)[number];
export interface SchemaMetadata {
    readonly schemaId: string;
    readonly version: string;
    readonly owner: string;
    readonly jsonSchemaRef: string;
    readonly openapiRef: string;
    readonly sdkGenerationTargets: readonly SchemaGenerationTarget[];
}
export declare function defineSchemaMetadata(metadata: SchemaMetadata): SchemaMetadata;
//# sourceMappingURL=index.d.ts.map