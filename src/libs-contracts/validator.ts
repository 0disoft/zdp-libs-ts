import {
  CALCULATORS,
  CALCULATOR_IDS,
  CALCULATOR_REQUIRED_ENGINE_VERSION
} from '../calculator-engine/catalog.generated.js';
import { validateLibsContracts as validateBaseLibsContracts } from './validator-base.js';
import type {
  ApiContractsInput,
  LibsContractDiagnostic,
  LibsContracts,
  LibsContractValidationResult
} from './types.js';

export { CALCULATOR_REQUIRED_ENGINE_VERSION };

export function validateLibsContracts(
  contracts: LibsContracts,
  options: {
    readonly apiContractsInput?: ApiContractsInput;
  } = {}
): LibsContractValidationResult {
  const baseResult = validateBaseLibsContracts(contracts, options);
  if (options.apiContractsInput === undefined) {
    return baseResult;
  }

  const diagnostics = [...baseResult.diagnostics];
  validateGeneratedCalculatorCatalog(options.apiContractsInput, diagnostics);

  return {
    ok: diagnostics.length === 0,
    diagnostics
  };
}

function validateGeneratedCalculatorCatalog(
  apiContractsInput: ApiContractsInput,
  diagnostics: LibsContractDiagnostic[]
): void {
  const catalog = apiContractsInput.calculatorCatalog;
  const conformance = apiContractsInput.calculatorConformance;
  const reviewedDefinitions = catalog.definitions.filter(
    (definition) => definition.lifecycleStatus === 'reviewed'
  );
  const reviewedIds = reviewedDefinitions.flatMap((definition) =>
    definition.id === null ? [] : [definition.id]
  );

  if (!haveSameOrderedValues(reviewedIds, CALCULATOR_IDS)) {
    diagnostics.push({
      code: 'LIBS_CALCULATOR_GENERATED_ID_DRIFT',
      file: '../zdp-api-contracts/contracts/calculators/catalog.yaml',
      path: 'definitions',
      message:
        'Reviewed calculator ids must match the generated calculator registry. Run `bun run calculator-catalog:generate`.'
    });
  }

  for (const calculatorId of CALCULATOR_IDS) {
    const expected = CALCULATORS[calculatorId];
    const definition = catalog.definitions.find(
      (candidate) => candidate.id === calculatorId
    );

    if (definition === undefined) {
      continue;
    }

    if (
      definition.lifecycleStatus !== expected.lifecycleStatus ||
      definition.contractVersion !== expected.contractVersion ||
      !haveSameOrderedValues(
        definition.compatibleEngineVersions,
        expected.compatibleEngineVersions
      ) ||
      definition.precisionPolicy !== expected.precisionPolicy ||
      definition.roundingPolicy !== expected.roundingPolicy
    ) {
      diagnostics.push({
        code: 'LIBS_CALCULATOR_GENERATED_METADATA_DRIFT',
        file: '../zdp-api-contracts/contracts/calculators/catalog.yaml',
        path: `definitions.${calculatorId}`,
        message: `Calculator \`${calculatorId}\` metadata must match the generated registry. Run \`bun run calculator-catalog:generate\`.`
      });
    }

    if (!haveSameOrderedValues(definition.errorCodes, expected.errorCodes)) {
      diagnostics.push({
        code: 'LIBS_CALCULATOR_GENERATED_ERROR_CODE_DRIFT',
        file: '../zdp-api-contracts/contracts/calculators/catalog.yaml',
        path: `definitions.${calculatorId}.error_codes`,
        message: `Calculator \`${calculatorId}\` error codes must match the generated registry. Run \`bun run calculator-catalog:generate\`.`
      });
    }

    if (
      !conformance.cases.some(
        (testCase) => testCase.calculatorId === calculatorId
      )
    ) {
      diagnostics.push({
        code: 'LIBS_CALCULATOR_GENERATED_CONFORMANCE_MISSING',
        file: '../zdp-api-contracts/contracts/calculators/conformance.yaml',
        path: 'cases',
        message: `Calculator \`${calculatorId}\` must have shared conformance cases.`
      });
    }
  }
}

function haveSameOrderedValues(
  actual: readonly string[],
  expected: readonly string[]
): boolean {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}
