import type { Week, DayEvents } from '../types';

/**
 * Get Monday of the week containing the given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the first day of the month
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the last day of the month
 */
export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Generate 42 days for month grid (6 weeks starting from Monday)
 */
export function getCalendarDays(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const startDate = getWeekStart(firstOfMonth);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
}

/**
 * Find which Week a date belongs to
 */
export function findWeekForDate(date: Date, weeks: Week[]): Week | null {
  const dateStr = date.toISOString().split('T')[0];

  for (const week of weeks) {
    const weekStart = week.week_start.split('T')[0];
    const weekEnd = week.week_end.split('T')[0];

    if (dateStr >= weekStart && dateStr <= weekEnd) {
      return week;
    }
  }
  return null;
}

/**
 * Map day index (0-6, Mon-Sun) to day name
 */
const dayIndexToName: Record<number, string> = {
  0: 'monday',
  1: 'tuesday',
  2: 'wednesday',
  3: 'thursday',
  4: 'friday',
  5: 'saturday',
  6: 'sunday',
};

/**
 * Get events for a specific date from a week
 */
export function getEventsForDate(date: Date, week: Week | null): DayEvents {
  const events: DayEvents = {
    weekendPlans: [],
    weekdayEvents: [],
    sports: [],
    childrenPresent: [],
  };

  if (!week) return events;

  // Get day of week (0 = Monday, 6 = Sunday)
  const jsDay = date.getDay();
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
  const dayName = dayIndexToName[dayIndex];

  const isWeekend = dayIndex >= 5; // Saturday or Sunday

  // Filter weekend plans for this day
  events.weekendPlans = week.weekend_plans.filter(
    (plan) => plan.day === dayName
  );

  // Filter weekday events for this day
  events.weekdayEvents = week.weekday_events.filter(
    (event) => event.day === dayName
  );

  // Filter sports for this day
  events.sports = week.sports.filter(
    (sport) => sport.day.toLowerCase() === dayName
  );

  // Children present only shown on weekends
  if (isWeekend) {
    events.childrenPresent = week.children_present;
  }

  return events;
}

/**
 * Format date as "January 2026"
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is in the given month
 */
export function isSameMonth(date: Date, month: number, year: number): boolean {
  return date.getMonth() === month && date.getFullYear() === year;
}
