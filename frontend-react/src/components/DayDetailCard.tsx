import type { Week, DayEvents, ChildGroup } from '../types';
import { ChildBadges } from './ChildBadges';

interface DayDetailCardProps {
  date: Date;
  events: DayEvents;
  week: Week;
  childGroups: ChildGroup[];
  onEditWeek: (week: Week) => void;
  onClose: () => void;
}

export function DayDetailCard({ date, events, week, childGroups, onEditWeek, onClose }: DayDetailCardProps) {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const hasContent =
    events.weekendPlans.length > 0 ||
    events.weekdayEvents.length > 0 ||
    events.sports.length > 0 ||
    events.childrenPresent.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">{formattedDate}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Child badges */}
          {childGroups.length > 0 && events.childrenPresent.length > 0 && (
            <div className="flex gap-2">
              <ChildBadges childrenPresent={events.childrenPresent} childGroups={childGroups} />
            </div>
          )}

          {/* Weekend Plans */}
          {events.weekendPlans.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Weekend Plans</div>
              <div className="space-y-1">
                {events.weekendPlans.map((plan, i) => (
                  <div key={i} className="text-sm text-gray-700">
                    {plan.title}
                    {plan.time && <span className="text-gray-400 ml-1">{plan.time}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekday Events */}
          {events.weekdayEvents.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Events</div>
              <div className="space-y-1">
                {events.weekdayEvents.map((event, i) => (
                  <div key={i} className="text-sm text-gray-700">
                    {event.title}
                    {event.time && <span className="text-gray-400 ml-1">{event.time}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sports */}
          {events.sports.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Sports</div>
              <div className="space-y-1">
                {events.sports.map((sport, i) => (
                  <div key={i} className="text-sm text-gray-700">
                    {sport.child_name} - {sport.sport}
                    <span className="text-gray-400 ml-1">
                      {sport.time}{sport.location && ` @ ${sport.location}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes indicator */}
          {week.notes && (
            <div className="text-xs text-gray-400">Has notes</div>
          )}

          {!hasContent && !week.notes && (
            <div className="text-sm text-gray-400">Nothing planned for this day</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Close
          </button>
          <button
            onClick={() => onEditWeek(week)}
            className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Edit Week
          </button>
        </div>
      </div>
    </div>
  );
}
