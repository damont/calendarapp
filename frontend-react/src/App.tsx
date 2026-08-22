import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ForgotPassword } from './components/ForgotPassword';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ResetPassword } from './components/ResetPassword';
import { Header } from './components/Header';
import { UserProfile } from './components/UserProfile';
import { CalendarGrid } from './components/CalendarGrid';
import { MonthCalendar } from './components/MonthCalendar';
import { ViewToggle } from './components/ViewToggle';
import { DateRangeSearch } from './components/DateRangeSearch';
import { WeekEditor } from './components/WeekEditor';
import { WeekPageView } from './components/WeekPageView';
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

function getMonthsAhead(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function Calendar() {
  const { isAuthenticated } = useAuth();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => getWeekStart(new Date()));
  const [endDate, setEndDate] = useState(() => getMonthsAhead(new Date(), 3));
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [pageWeek, setPageWeek] = useState<Week | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>(() => {
    const path = window.location.pathname;
    if (path === '/forgot-password') return 'forgot-password';
    if (path.startsWith('/reset-password/')) return 'reset-password';
    return 'login';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [childGroups, setChildGroups] = useState<ChildGroup[]>([]);
  const [defaultMonthsOut, setDefaultMonthsOut] = useState(3);
  const [settingsReady, setSettingsReady] = useState(false);

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
      setDefaultMonthsOut(settings.default_months_out);
      setStartDate(getWeekStart(new Date()));
      setEndDate(getMonthsAhead(new Date(), settings.default_months_out));
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setSettingsReady(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    } else {
      setSettingsReady(false);
    }
  }, [isAuthenticated, loadSettings]);

  useEffect(() => {
    if (isAuthenticated && settingsReady) {
      loadWeeks();
    }
  }, [isAuthenticated, settingsReady, loadWeeks]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSaveWeek = async (data: WeekUpdate) => {
    if (!selectedWeek) return;
    await apiClient.updateWeek(selectedWeek.week_start, data);
    await loadWeeks();
  };

  const handleCloseWeekEditor = () => {
    const weekStartToRestore = selectedWeek?.week_start;
    setSelectedWeek(null);
    if (weekStartToRestore) {
      const id = `week-card-${weekStartToRestore.split('T')[0]}`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ block: 'start' });
        });
      });
    }
  };

  if (!isAuthenticated) {
    if (authView === 'forgot-password') {
      return <ForgotPassword onBack={() => { setAuthView('login'); window.history.pushState({}, '', '/'); }} />;
    }
    if (authView === 'reset-password') {
      const token = window.location.pathname.split('/reset-password/')[1] || '';
      return <ResetPassword token={token} onBack={() => { setAuthView('login'); window.history.pushState({}, '', '/'); }} />;
    }
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} onForgotPassword={() => { setAuthView('forgot-password'); window.history.pushState({}, '', '/forgot-password'); }} />;
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
                onWeekPageClick={setPageWeek}
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

          {pageWeek && (
            <WeekPageView
              key={pageWeek.week_start}
              week={pageWeek}
              onClose={() => setPageWeek(null)}
            />
          )}

          {selectedWeek && (
            <WeekEditor
              week={selectedWeek}
              childGroups={childGroups}
              onSave={handleSaveWeek}
              onClose={handleCloseWeekEditor}
            />
          )}
        </>
      )}

      {showSettings && (
        <SettingsModal
          childGroups={childGroups}
          defaultMonthsOut={defaultMonthsOut}
          onSave={async (settings) => {
            const saved = await apiClient.updateSettings(settings);
            setChildGroups(saved.child_groups);
            setDefaultMonthsOut(saved.default_months_out);
            setStartDate(getWeekStart(new Date()));
            setEndDate(getMonthsAhead(new Date(), saved.default_months_out));
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
