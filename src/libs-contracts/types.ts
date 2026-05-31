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

export interface LibsContracts {
  readonly packageBoundaries: PackageBoundariesContract;
  readonly apiContractSource: ApiContractSourceContract;
  readonly env: EnvContract;
  readonly error: ErrorContract;
  readonly schema: SchemaContract;
  readonly event: EventContract;
  readonly i18n: I18nContract;
}
