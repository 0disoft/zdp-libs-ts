import { calculateDateDifference } from '../../src/calculator-engine/calculators/date-difference';
import type { DateDifferenceOutput } from '../../src/calculator-engine/types';
import {
  describeCalculatorConformance,
  exactOptions
} from './conformance';

describeCalculatorConformance(
  'date-difference',
  (testCase) =>
    calculateDateDifference(
      {
        startDate: testCase.input.start_date,
        endDate: testCase.input.end_date,
        boundaryMode: testCase.input.boundary_mode
      },
      exactOptions(testCase)
    ),
  (value) => ({
    calendar_day_count: (value as DateDifferenceOutput).calendarDayCount
  })
);
