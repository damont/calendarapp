import { useAuth } from '../context/AuthContext';
import { DateRangeSearch } from './DateRangeSearch';

interface HeaderProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
}

export function Header({ startDate, endDate, onDateRangeChange }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900">Family Calendar</h1>

        <DateRangeSearch
          startDate={startDate}
          endDate={endDate}
          onSearch={onDateRangeChange}
        />

        <button
          onClick={logout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
