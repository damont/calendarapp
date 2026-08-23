export const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DayOfWeek = (typeof DAY_ORDER)[number];

/**
 * Accept both canonical API values ("monday") and the descriptive values
 * sometimes supplied by calendar agents ("Monday, September 21").
 */
export function normalizeDayOfWeek(value: string): DayOfWeek | undefined {
  const firstWord = value.trim().toLowerCase().match(/^[a-z]+/)?.[0];
  return DAY_ORDER.find((day) => day === firstWord);
}
