import { useState } from 'react';
import type { Week, DayEvents, ChildGroup } from '../types';
import { CalendarDay } from './CalendarDay';
import { DayDetailCard } from './DayDetailCard';
import {
  getCalendarDays,
  findWeekForDate,
  getEventsForDate,
  formatMonthYear,
  isSameMonth,
} from '../utils/dateUtils';

interface MonthCalendarProps {
  weeks: Week[];
  loading: boolean;
  onWeekClick: (week: Week) => void;
  childGroups: ChildGroup[];
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface SelectedDay {
  date: Date;
  week: Week;
  events: DayEvents;
}

export function MonthCalendar({ weeks, loading, onWeekClick, childGroups }: MonthCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);

  const calendarDays = getCalendarDays(currentYear, currentMonth);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handleDayClick = (date: Date, week: Week, events: DayEvents) => {
    setSelectedDay({ date, week, events });
  };

  const handleEditWeek = (week: Week) => {
    setSelectedDay(null);
    onWeekClick(week);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Month navigation header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {formatMonthYear(new Date(currentYear, currentMonth))}
            </h2>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              Today
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-gray-500 bg-gray-50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const week = findWeekForDate(date, weeks);
            const events = getEventsForDate(date, week);
            const isCurrentMonth = isSameMonth(date, currentMonth, currentYear);

            return (
              <CalendarDay
                key={index}
                date={date}
                events={events}
                isCurrentMonth={isCurrentMonth}
                week={week}
                childGroups={childGroups}
                onDayClick={handleDayClick}
              />
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <DayDetailCard
          date={selectedDay.date}
          events={selectedDay.events}
          week={selectedDay.week}
          childGroups={childGroups}
          onEditWeek={handleEditWeek}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
}
