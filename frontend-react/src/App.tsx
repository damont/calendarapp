import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { CalendarGrid } from './components/CalendarGrid';
import { WeekEditor } from './components/WeekEditor';
import { apiClient } from './api/client';
import type { Week, WeekUpdate } from './types';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getTwoMonthsAhead(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 2);
  return d;
}

function Calendar() {
  const { isAuthenticated } = useAuth();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => getWeekStart(new Date()));
  const [endDate, setEndDate] = useState(() => getTwoMonthsAhead(new Date()));
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);

  const loadWeeks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getWeeks(startDate, endDate);
      setWeeks(data);
    } catch (error) {
      console.error('Failed to load weeks:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWeeks();
    }
  }, [isAuthenticated, loadWeeks]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSaveWeek = async (data: WeekUpdate) => {
    if (!selectedWeek) return;
    await apiClient.updateWeek(selectedWeek.week_start, data);
    await loadWeeks();
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen">
      <Header startDate={startDate} endDate={endDate} onDateRangeChange={handleDateRangeChange} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <CalendarGrid
          weeks={weeks}
          loading={loading}
          onWeekClick={setSelectedWeek}
        />
      </main>

      {selectedWeek && (
        <WeekEditor
          week={selectedWeek}
          onSave={handleSaveWeek}
          onClose={() => setSelectedWeek(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Calendar />
    </AuthProvider>
  );
}
