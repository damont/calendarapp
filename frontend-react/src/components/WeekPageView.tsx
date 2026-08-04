import { useEffect, useState } from 'react';
import type { Week } from '../types';
import { apiClient } from '../api/client';

interface WeekPageViewProps {
  week: Week;
  onClose: () => void;
}

export function WeekPageView({ week, onClose }: WeekPageViewProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weekStart = new Date(week.week_start);
  const weekEnd = new Date(week.week_end);

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

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getWeekPage(week.week_start)
      .then((page) => {
        if (cancelled) return;
        setHtml(page.html);
        setUpdatedAt(page.updated_at);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load page');
      });

    return () => {
      cancelled = true;
    };
  }, [week.week_start]);

  // Escape closes the page, matching the back button.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          ← Back
        </button>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            Week of {formatWeekRange()}
          </div>
          {updatedAt && (
            <div className="text-xs text-gray-500">
              Updated {new Date(updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {error ? (
          <div className="flex items-center justify-center h-full text-gray-500">{error}</div>
        ) : html === null ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
        ) : (
          <iframe
            title={`Week of ${formatWeekRange()}`}
            srcDoc={html}
            // No allow-same-origin: the page is agent-authored, so keep it
            // isolated from this app's origin and its stored token.
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            className="w-full h-full border-0"
          />
        )}
      </div>
    </div>
  );
}
