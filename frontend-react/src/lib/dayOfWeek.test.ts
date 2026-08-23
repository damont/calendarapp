import { describe, expect, it } from 'vitest';

import { normalizeDayOfWeek } from './dayOfWeek';

describe('normalizeDayOfWeek', () => {
  it.each([
    ['monday', 'monday'],
    ['Wednesday', 'wednesday'],
    ['Monday, September 21', 'monday'],
    ['Sunday, September 27', 'sunday'],
    ['  Friday  ', 'friday'],
  ])('normalizes %j to %j', (value, expected) => {
    expect(normalizeDayOfWeek(value)).toBe(expected);
  });

  it('rejects a value that does not start with a day of the week', () => {
    expect(normalizeDayOfWeek('September 21')).toBeUndefined();
  });
});