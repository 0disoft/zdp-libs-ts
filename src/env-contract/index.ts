export interface EnvContractMetadata {
  readonly name: string;
  readonly owner: string;
  readonly environment: string;
  readonly secret: boolean;
  readonly required: boolean;
  readonly description: string;
}

export function defineEnvContractMetadata(
  metadata: EnvContractMetadata
): EnvContractMetadata {
  return metadata;
}
