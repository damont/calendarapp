import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Header } from './components/Header';
import { UserProfile } from './components/UserProfile';
import { CalendarGrid } from './components/CalendarGrid';
import { MonthCalendar } from './components/MonthCalendar';
import { ViewToggle } from './components/ViewToggle';
import { DateRangeSearch } from './components/DateRangeSearch';
import { WeekEditor } from './components/WeekEditor';
import { SettingsModal } from './components/SettingsModal';
import { apiClient } from './api/client';
import type { Week, WeekUpdate, ViewMode, ChildGroup } from './types';

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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [childGroups, setChildGroups] = useState<ChildGroup[]>([]);

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

  const loadSettings = useCallback(async () => {
    try {
      const settings = await apiClient.getSettings();
      setChildGroups(settings.child_groups);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadWeeks();
      loadSettings();
    }
  }, [isAuthenticated, loadWeeks, loadSettings]);

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
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="min-h-screen">
      <Header onOpenSettings={() => { setShowSettings(true); setShowProfile(false); }} onProfileClick={() => setShowProfile(true)} />

      {showProfile ? (
        <UserProfile />
      ) : (
        <>
          <main className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
              {viewMode === 'list' && (
                <DateRangeSearch
                  startDate={startDate}
                  endDate={endDate}
                  onSearch={handleDateRangeChange}
                />
              )}
            </div>

            {viewMode === 'list' ? (
              <CalendarGrid
                weeks={weeks}
                loading={loading}
                onWeekClick={setSelectedWeek}
                childGroups={childGroups}
              />
            ) : (
              <MonthCalendar
                weeks={weeks}
                loading={loading}
                onWeekClick={setSelectedWeek}
                childGroups={childGroups}
              />
            )}
          </main>

          {selectedWeek && (
            <WeekEditor
              week={selectedWeek}
              childGroups={childGroups}
              onSave={handleSaveWeek}
              onClose={() => setSelectedWeek(null)}
            />
          )}
        </>
      )}

      {showSettings && (
        <SettingsModal
          childGroups={childGroups}
          onSave={async (groups) => {
            await apiClient.updateSettings({ child_groups: groups });
            setChildGroups(groups);
            await loadWeeks();
          }}
          onClose={() => setShowSettings(false)}
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
