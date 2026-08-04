import type { Week, ChildGroup } from '../types';
import { WeekCard } from './WeekCard';

interface CalendarGridProps {
  weeks: Week[];
  loading: boolean;
  onWeekClick: (week: Week) => void;
  onWeekPageClick: (week: Week) => void;
  childGroups: ChildGroup[];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function CalendarGrid({ weeks, loading, onWeekClick, onWeekPageClick, childGroups }: CalendarGridProps) {
  const currentWeekStart = getWeekStart(new Date()).toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">No weeks to display</div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1">
      {weeks.map((week) => {
        const weekStartDate = week.week_start.split('T')[0];
        const isCurrentWeek = weekStartDate === currentWeekStart;

        return (
          <WeekCard
            key={week.week_start}
            week={week}
            isCurrentWeek={isCurrentWeek}
            childGroups={childGroups}
            onClick={() => onWeekClick(week)}
            onOpenPage={() => onWeekPageClick(week)}
          />
        );
      })}
    </div>
  );
}
