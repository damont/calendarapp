import type { Week, ChildGroup } from '../types';
import { DAY_ORDER, normalizeDayOfWeek } from '../lib/dayOfWeek';
import { ChildBadges } from './ChildBadges';

interface WeekCardProps {
  week: Week;
  isCurrentWeek: boolean;
  childGroups: ChildGroup[];
  onClick: () => void;
  onOpenPage: () => void;
}

const DAY_LABELS: Record<(typeof DAY_ORDER)[number], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

interface DayItem {
  key: string;
  title: string;
  time?: string;
  location?: string;
  childGroup?: ChildGroup;
}

export function WeekCard({ week, isCurrentWeek, childGroups, onClick, onOpenPage }: WeekCardProps) {
  const weekStart = new Date(week.week_start);

  const formatWeekRange = (): string => {
    const weekEnd = new Date(week.week_end);
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  const formatDayDate = (dayIndex: number): string => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + dayIndex);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const findChildGroup = (name: string): ChildGroup | undefined =>
    childGroups.find((group) => group.name.toLowerCase() === name.toLowerCase());

  const eventsByDay: Record<string, DayItem[]> = {};
  DAY_ORDER.forEach((day) => {
    eventsByDay[day] = [];
  });

  week.weekend_plans.forEach((plan, i) => {
    const day = normalizeDayOfWeek(plan.day);
    if (day) {
      eventsByDay[day].push({ key: `plan-${i}`, title: plan.title, time: plan.time });
    }
  });
  week.weekday_events.forEach((event, i) => {
    const day = normalizeDayOfWeek(event.day);
    if (day) {
      eventsByDay[day].push({ key: `weekday-${i}`, title: event.title, time: event.time });
    }
  });
  week.sports.forEach((sport, i) => {
    const day = normalizeDayOfWeek(sport.day);
    if (day) {
      eventsByDay[day].push({
        key: `sport-${i}`,
        title: sport.sport,
        time: sport.time,
        location: sport.location,
        childGroup: findChildGroup(sport.child_name),
      });
    }
  });

  const activeDays = DAY_ORDER.filter((day) => eventsByDay[day].length > 0);
  const weekdayDays = activeDays.filter((day) => day !== 'saturday' && day !== 'sunday');
  const weekendDays = activeDays.filter((day) => day === 'saturday' || day === 'sunday');

  const hasKids = childGroups.length > 0 && week.children_present.length > 0;
  const hasPage = week.has_html_page;

  const renderDayGroup = (day: (typeof DAY_ORDER)[number]) => (
    <div key={day} className="py-2.5 first:pt-0 last:pb-0">
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {DAY_LABELS[day]} &middot; {formatDayDate(DAY_ORDER.indexOf(day))}
      </div>
      <div className="space-y-1.5">
        {eventsByDay[day].map((item) => (
          <div key={item.key}>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {item.childGroup && (
                <ChildBadges childrenPresent={[item.childGroup.id]} childGroups={childGroups} />
              )}
              <span className="text-sm text-gray-700 leading-snug">{item.title}</span>
            </div>
            {(item.time || item.location) && (
              <div className="text-xs text-gray-400 mt-0.5">
                {item.time}
                {item.location && ` @ ${item.location}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      onClick={hasPage ? onOpenPage : undefined}
      role={hasPage ? 'button' : undefined}
      tabIndex={hasPage ? 0 : undefined}
      onKeyDown={
        hasPage
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenPage();
              }
            }
          : undefined
      }
      className={`bg-white rounded-lg border border-gray-200 p-4 ${
        isCurrentWeek ? 'ring-2 ring-gray-900 ring-offset-2' : ''
      } ${hasPage ? 'cursor-pointer hover:border-gray-400 transition-colors' : ''}`}
    >
      {/* Header - date range and actions */}
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <div className="text-lg font-medium text-gray-900">{formatWeekRange()}</div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Edit
          </button>
          {hasPage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPage();
              }}
              className="px-3 py-1.5 text-sm text-white bg-gray-900 hover:bg-gray-700 rounded-md transition-colors whitespace-nowrap"
            >
              View page
            </button>
          )}
        </div>
      </div>

      {/* Day-by-day events, Monday through Sunday, with a Weekend banner between the weekday and weekend entries */}
      {weekdayDays.length > 0 || weekendDays.length > 0 || childGroups.length > 0 ? (
        <div className="mt-3.5 flex flex-col gap-3">
          {weekdayDays.length > 0 && (
            <div className="divide-y divide-gray-100">{weekdayDays.map(renderDayGroup)}</div>
          )}

          {childGroups.length > 0 && (
            <div className="border border-gray-200 rounded-lg bg-gray-50 px-3 py-2.5">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Weekend
              </div>
              {hasKids ? (
                <div className="flex gap-1.5 flex-wrap">
                  <ChildBadges childrenPresent={week.children_present} childGroups={childGroups} />
                </div>
              ) : (
                <span className="text-xs text-gray-400">No kids this weekend</span>
              )}
            </div>
          )}

          {weekendDays.length > 0 && (
            <div className="divide-y divide-gray-100">{weekendDays.map(renderDayGroup)}</div>
          )}
        </div>
      ) : (
        <div className="mt-3.5 text-sm text-gray-400">No events this week</div>
      )}

      {/* Notes indicator */}
      {week.notes && <div className="mt-2.5 text-xs text-gray-400">Has notes</div>}
    </div>
  );
}
