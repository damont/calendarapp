import type { Week } from '../types';

interface WeekCardProps {
  week: Week;
  isCurrentWeek: boolean;
  onClick: () => void;
}

export function WeekCard({ week, isCurrentWeek, onClick }: WeekCardProps) {
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

  const hasKids = week.has_libby_mary || week.has_sylvie;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${
        isCurrentWeek ? 'ring-2 ring-gray-900 ring-offset-2' : ''
      }`}
    >
      {/* Weekend dates - prominent */}
      <div className="mb-3">
        <div className="text-lg font-medium text-gray-900">{formatWeekendDates()}</div>
        <div className="text-xs text-gray-500">Week of {formatWeekRange()}</div>
      </div>

      {/* Kids */}
      <div className="flex gap-2 mb-3">
        {week.has_libby_mary && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
            L&M
          </span>
        )}
        {week.has_sylvie && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Sylvie
          </span>
        )}
        {!hasKids && (
          <span className="text-xs text-gray-400">No kids this weekend</span>
        )}
      </div>

      {/* Weekend plans */}
      {week.weekend_plans.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1">Plans</div>
          <div className="space-y-1">
            {week.weekend_plans.slice(0, 2).map((plan, i) => (
              <div key={i} className="text-sm text-gray-700">
                <span className="text-gray-400 capitalize">{plan.day.slice(0, 3)}</span>{' '}
                {plan.title}
              </div>
            ))}
            {week.weekend_plans.length > 2 && (
              <div className="text-xs text-gray-400">
                +{week.weekend_plans.length - 2} more
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
            {week.sports.slice(0, 2).map((sport, i) => (
              <div key={i} className="text-sm text-gray-700">
                {sport.child_name} - {sport.sport}
              </div>
            ))}
            {week.sports.length > 2 && (
              <div className="text-xs text-gray-400">
                +{week.sports.length - 2} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes indicator */}
      {week.notes && (
        <div className="mt-2 text-xs text-gray-400">
          Has notes
        </div>
      )}

      {/* Edit button */}
      <button
        onClick={onClick}
        className="mt-3 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        Edit
      </button>
    </div>
  );
}
