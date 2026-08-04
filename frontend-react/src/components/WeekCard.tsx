import type { Week, ChildGroup } from '../types';
import { ChildBadges } from './ChildBadges';

interface WeekCardProps {
  week: Week;
  isCurrentWeek: boolean;
  childGroups: ChildGroup[];
  onClick: () => void;
  onOpenPage: () => void;
}

export function WeekCard({ week, isCurrentWeek, childGroups, onClick, onOpenPage }: WeekCardProps) {
  const weekStart = new Date(week.week_start);
  const weekEnd = new Date(week.week_end);

  // Get Saturday and Sunday dates
  const saturday = new Date(weekStart);
  saturday.setDate(weekStart.getDate() + 5);
  const sunday = new Date(weekStart);
  sunday.setDate(weekStart.getDate() + 6);

  const formatWeekendDates = (): string => {
    const satDay = saturday.getDate();
    const sunDay = sunday.getDate();
    const month = saturday.toLocaleDateString('en-US', { month: 'short' });

    // Check if Saturday and Sunday are in different months
    if (saturday.getMonth() !== sunday.getMonth()) {
      const sunMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
      return `${month} ${satDay} - ${sunMonth} ${sunDay}`;
    }
    return `${month} ${satDay}-${sunDay}`;
  };

  const formatWeekRange = (): string => {
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  const hasKids = childGroups.length > 0 && week.children_present.length > 0;
  const hasPage = week.has_html_page;

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
      <div className="flex gap-6">
        {/* Left side - dates, kids, weekend plans, sports */}
        <div className="flex-1 min-w-0">
          {/* Weekend dates - prominent */}
          <div className="mb-3">
            <div className="text-lg font-medium text-gray-900">{formatWeekendDates()}</div>
            <div className="text-xs text-gray-500">Week of {formatWeekRange()}</div>
          </div>

          {/* Kids */}
          {childGroups.length > 0 && (
            <div className="flex gap-2 mb-3">
              {hasKids ? (
                <ChildBadges childrenPresent={week.children_present} childGroups={childGroups} />
              ) : (
                <span className="text-xs text-gray-400">No kids this weekend</span>
              )}
            </div>
          )}

          <div className="flex gap-6">
            {/* Weekend plans */}
            {week.weekend_plans.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Weekend</div>
                <div className="space-y-1">
                  {week.weekend_plans.slice(0, 3).map((plan, i) => (
                    <div key={i} className="text-sm text-gray-700">
                      <span className="text-gray-400 capitalize">{plan.day.slice(0, 3)}</span>{' '}
                      {plan.title}
                    </div>
                  ))}
                  {week.weekend_plans.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{week.weekend_plans.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sports */}
            {week.sports.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Sports</div>
                <div className="space-y-1">
                  {week.sports.slice(0, 3).map((sport, i) => (
                    <div key={i} className="text-sm text-gray-700">
                      {sport.child_name} - {sport.sport}
                      <span className="text-gray-400 ml-1">
                        {sport.time}{sport.location && ` @ ${sport.location.slice(0, 3).toUpperCase()}`}
                      </span>
                    </div>
                  ))}
                  {week.sports.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{week.sports.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes indicator */}
          {week.notes && (
            <div className="mt-2 text-xs text-gray-400">
              Has notes
            </div>
          )}
        </div>

        {/* Right side - weekday events */}
        <div className="flex-1 min-w-0 border-l border-gray-100 pl-6">
          <div className="text-xs text-gray-500 mb-1">Weekday Events</div>
          {week.weekday_events.length > 0 ? (
            <div className="space-y-1">
              {week.weekday_events.map((event, i) => (
                <div key={i} className="text-sm text-gray-700">
                  <span className="text-gray-400 capitalize">{event.day.slice(0, 3)}</span>{' '}
                  {event.title}
                  {event.time && <span className="text-gray-400 ml-1">{event.time}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No events</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 self-start flex flex-col gap-2">
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
              className="px-3 py-1.5 text-sm text-white bg-gray-900 hover:bg-gray-700 rounded-md transition-colors"
            >
              View page
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
