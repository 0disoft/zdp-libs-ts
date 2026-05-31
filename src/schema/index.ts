export const SCHEMA_GENERATION_TARGETS = [
  'json_schema',
  'openapi',
  'typescript',
  'rust',
  'dart'
] as const;

export type SchemaGenerationTarget = (typeof SCHEMA_GENERATION_TARGETS)[number];

export interface SchemaMetadata {
  readonly schemaId: string;
  readonly version: string;
  readonly owner: string;
  readonly jsonSchemaRef: string;
  readonly openapiRef: string;
  readonly sdkGenerationTargets: readonly SchemaGenerationTarget[];
}

export function defineSchemaMetadata(metadata: SchemaMetadata): SchemaMetadata {
  return metadata;
}
