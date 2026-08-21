import { isRecord } from '../../internal/record.js';
import { ageComponents, clampedBirthday, parseCivilDateRecord } from '../core/date.js';
import { parseExactIntegerOptions } from '../core/input.js';
import { failure } from '../core/result.js';
export function calculateAge(input, options) {
    const parsedOptions = parseExactIntegerOptions(options);
    if (!parsedOptions.ok) {
        return parsedOptions;
    }
    if (!isRecord(input)) {
        return failure('invalid_input');
    }
    const birth = parseCivilDateRecord(input.birthDate, 'birth_date');
    if (!birth.ok) {
        return birth;
    }
    const reference = parseCivilDateRecord(input.referenceDate, 'reference_date');
    if (!reference.ok) {
        return reference;
    }
    if (reference.value.dayNumber < birth.value.dayNumber) {
        return failure('invalid_date_range');
    }
    const components = ageComponents(birth.value, reference.value);
    const nextBirthdayYear = clampedBirthday(birth.value, reference.value.year).dayNumber >=
        reference.value.dayNumber
        ? reference.value.year
        : reference.value.year + 1;
    const nextBirthday = clampedBirthday(birth.value, nextBirthdayYear);
    const daysUntilNextBirthday = nextBirthday.dayNumber - reference.value.dayNumber;
    return {
        ok: true,
        value: {
            ageYears: { value: components.years, unit: 'years' },
            ageMonths: { value: components.months, unit: 'months' },
            ageDays: { value: components.days, unit: 'days' },
            daysLived: {
                value: reference.value.dayNumber - birth.value.dayNumber,
                unit: 'days'
            },
            daysUntilNextBirthday: {
                value: daysUntilNextBirthday,
                unit: 'days'
            }
        }
    };
}
//# sourceMappingURL=age.js.map