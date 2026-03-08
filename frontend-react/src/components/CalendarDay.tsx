import type { Week, DayEvents, ChildGroup } from '../types';
import { isSameDay } from '../utils/dateUtils';
import { ChildBadges } from './ChildBadges';

interface CalendarDayProps {
  date: Date;
  events: DayEvents;
  isCurrentMonth: boolean;
  week: Week | null;
  childGroups: ChildGroup[];
  onDayClick: (date: Date, week: Week, events: DayEvents) => void;
}

export function CalendarDay({
  date,
  events,
  isCurrentMonth,
  week,
  childGroups,
  onDayClick,
}: CalendarDayProps) {
  const today = new Date();
  const isToday = isSameDay(date, today);

  // Combine all events for display
  const allEvents = [
    ...events.weekendPlans.map((p) => ({ title: p.title, type: 'weekend' as const })),
    ...events.weekdayEvents.map((e) => ({ title: e.title, type: 'weekday' as const })),
    ...events.sports.map((s) => ({ title: `${s.child_name} - ${s.sport}`, type: 'sports' as const })),
  ];

  const displayedEvents = allEvents.slice(0, 3);
  const remainingCount = allEvents.length - 3;

  const handleClick = () => {
    if (week) {
      onDayClick(date, week, events);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`min-h-[100px] p-1.5 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
        !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
      } ${isToday ? 'ring-2 ring-inset ring-gray-900' : ''}`}
    >
      {/* Day number and child badges */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-sm font-medium ${
            !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {date.getDate()}
        </span>
        <div className="flex gap-0.5">
          <ChildBadges childrenPresent={events.childrenPresent} childGroups={childGroups} size="sm" />
        </div>
      </div>

      {/* Events */}
      <div className="space-y-0.5">
        {displayedEvents.map((event, i) => (
          <div
            key={i}
            className={`text-[11px] truncate px-1 py-0.5 rounded ${
              event.type === 'weekend'
                ? 'bg-blue-50 text-blue-700'
                : event.type === 'sports'
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {event.title}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-[10px] text-gray-400 px-1">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
}
