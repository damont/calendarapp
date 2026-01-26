import type { ViewMode } from '../types';

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-md bg-gray-100 p-1">
      <button
        onClick={() => onChange('list')}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          viewMode === 'list'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        List
      </button>
      <button
        onClick={() => onChange('calendar')}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          viewMode === 'calendar'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Calendar
      </button>
    </div>
  );
}
