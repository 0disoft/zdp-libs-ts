import { calculateMarginMarkup } from '../../src/calculator-engine/calculators/margin-markup';
import type { MarginMarkupOutput } from '../../src/calculator-engine/types';
import {
  decimalOptions,
  describeCalculatorConformance
} from './conformance';

describeCalculatorConformance(
  'margin-markup',
  (testCase) =>
    calculateMarginMarkup(
      {
        cost: testCase.input.cost,
        sellingPrice: testCase.input.selling_price
      },
      decimalOptions(testCase)
    ),
  (value) => {
    const output = value as MarginMarkupOutput;
    return {
      margin_percentage: output.marginPercentage,
      markup_percentage: output.markupPercentage
    };
  }
);
