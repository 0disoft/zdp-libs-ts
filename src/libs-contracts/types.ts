export interface LibsContractDiagnostic {
  readonly code: string;
  readonly file: string;
  readonly path: string;
  readonly message: string;
}

export interface LibsContractValidationResult {
  readonly ok: boolean;
  readonly diagnostics: readonly LibsContractDiagnostic[];
}

export interface PackageBoundary {
  readonly name: string;
  readonly status: string;
  readonly owns: readonly string[];
  readonly mustNotOwn: readonly string[];
}

export interface PackageBoundariesContract {
  readonly packages: readonly PackageBoundary[];
}

export interface ApiContractSourceContract {
  readonly status: string;
  readonly sourceRepo: string;
  readonly sourceContracts: readonly string[];
  readonly consumedByPackages: readonly string[];
  readonly requiredHandoffMetadata: readonly string[];
  readonly mustNotOwn: readonly string[];
  readonly forbiddenValues: readonly string[];
}

export interface ApiRouteContract {
  readonly status: string | null;
  readonly requiredPerRoute: readonly string[];
  readonly allowedMethods: readonly string[];
  readonly allowedSuccessStatuses: readonly number[];
  readonly forbiddenShapes: readonly string[];
}

export interface ApiErrorEnvelopeContract {
  readonly schemaVersion: number | null;
  readonly requiredFields: readonly string[];
  readonly optionalFields: readonly string[];
  readonly forbiddenFields: readonly string[];
}

export interface ApiWebhookContract {
  readonly status: string | null;
  readonly requiredControls: readonly string[];
  readonly forbiddenControls: readonly string[];
}

export interface ApiSdkGenerationInputContract {
  readonly status: string | null;
  readonly sourceContracts: readonly string[];
  readonly generationTargets: readonly string[];
  readonly allowedGenerationTargets: readonly string[];
  readonly requiredRouteMetadata: readonly string[];
  readonly requiredErrorMetadata: readonly string[];
  readonly requiredWebhookMetadata: readonly string[];
  readonly forbiddenOwnership: readonly string[];
  readonly forbiddenValues: readonly string[];
}

export interface ApiCatalogInputContract {
  readonly status: string | null;
  readonly routeDefinitionRequiredFields: readonly string[];
  readonly forbiddenValues: readonly string[];
}

export interface ApiContractsInput {
  readonly route: ApiRouteContract;
  readonly errorEnvelope: ApiErrorEnvelopeContract;
  readonly webhook: ApiWebhookContract;
  readonly sdkGenerationInput: ApiSdkGenerationInputContract;
  readonly apiCatalog: ApiCatalogInputContract;
}

export interface EnvContract {
  readonly requiredMetadata: readonly string[];
  readonly forbiddenValues: readonly string[];
}

export interface ErrorContract {
  readonly requiredFields: readonly string[];
  readonly forbiddenFields: readonly string[];
}

export interface SchemaContract {
  readonly status: string;
  readonly requiredMetadata: readonly string[];
  readonly generationTargets: readonly string[];
  readonly forbiddenOwnership: readonly string[];
}

export interface EventContract {
  readonly status: string;
  readonly requiredMetadata: readonly string[];
  readonly requiredTraceFields: readonly string[];
  readonly forbiddenValues: readonly string[];
}

export interface I18nContract {
  readonly status: string;
  readonly messageKeyPattern: string;
  readonly requiredMetadata: readonly string[];
  readonly forbiddenOwnership: readonly string[];
}

export interface GlossaryContract {
  readonly status: string;
  readonly termIdPattern: string;
  readonly requiredMetadata: readonly string[];
  readonly requiredLocaleMetadata: readonly string[];
  readonly forbiddenOwnership: readonly string[];
  readonly forbiddenValues: readonly string[];
}

export interface LibsContracts {
  readonly packageBoundaries: PackageBoundariesContract;
  readonly apiContractSource: ApiContractSourceContract;
  readonly env: EnvContract;
  readonly error: ErrorContract;
  readonly schema: SchemaContract;
  readonly event: EventContract;
  readonly i18n: I18nContract;
  readonly glossary: GlossaryContract;
}
