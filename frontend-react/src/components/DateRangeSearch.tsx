interface DateRangeSearchProps {
  startDate: Date;
  endDate: Date;
  onSearch: (start: Date, end: Date) => void;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function DateRangeSearch({ startDate, endDate, onSearch }: DateRangeSearchProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(e.target.value + 'T00:00:00');
    if (!isNaN(newStart.getTime())) {
      onSearch(newStart, endDate);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = new Date(e.target.value + 'T00:00:00');
    if (!isNaN(newEnd.getTime())) {
      onSearch(startDate, newEnd);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm text-gray-600">From</label>
      <input
        type="date"
        value={formatDateForInput(startDate)}
        onChange={handleStartChange}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
      <label className="text-sm text-gray-600">To</label>
      <input
        type="date"
        value={formatDateForInput(endDate)}
        onChange={handleEndChange}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </div>
  );
}
