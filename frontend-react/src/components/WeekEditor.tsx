import { useState } from 'react';
import type { Week, WeekUpdate, WeekendPlan, WeekdayEvent, SportsEvent } from '../types';

interface WeekEditorProps {
  week: Week;
  onSave: (data: WeekUpdate) => Promise<void>;
  onClose: () => void;
}

type Tab = 'kids' | 'weekend' | 'weekday' | 'sports' | 'notes';

export function WeekEditor({ week, onSave, onClose }: WeekEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('kids');
  const [saving, setSaving] = useState(false);

  const [hasLibbyMary, setHasLibbyMary] = useState(week.has_libby_mary);
  const [hasSylvie, setHasSylvie] = useState(week.has_sylvie);
  const [weekendPlans, setWeekendPlans] = useState<WeekendPlan[]>(week.weekend_plans);
  const [weekdayEvents, setWeekdayEvents] = useState<WeekdayEvent[]>(week.weekday_events);
  const [sports, setSports] = useState<SportsEvent[]>(week.sports);
  const [notes, setNotes] = useState(week.notes || '');

  const weekStart = new Date(week.week_start);
  const saturday = new Date(weekStart);
  saturday.setDate(weekStart.getDate() + 5);
  const sunday = new Date(weekStart);
  sunday.setDate(weekStart.getDate() + 6);

  const formatWeekendDates = (): string => {
    const satDay = saturday.getDate();
    const sunDay = sunday.getDate();
    const month = saturday.toLocaleDateString('en-US', { month: 'short' });
    if (saturday.getMonth() !== sunday.getMonth()) {
      const sunMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
      return `${month} ${satDay} - ${sunMonth} ${sunDay}`;
    }
    return `${month} ${satDay}-${sunDay}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        has_libby_mary: hasLibbyMary,
        has_sylvie: hasSylvie,
        weekend_plans: weekendPlans,
        weekday_events: weekdayEvents,
        sports,
        notes: notes || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'kids', label: 'Kids' },
    { id: 'weekend', label: 'Weekend' },
    { id: 'weekday', label: 'Weekday' },
    { id: 'sports', label: 'Sports' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Weekend of {formatWeekendDates()}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm pb-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'kids' && (
            <KidsTab
              hasLibbyMary={hasLibbyMary}
              hasSylvie={hasSylvie}
              onChangeLibbyMary={setHasLibbyMary}
              onChangeSylvie={setHasSylvie}
            />
          )}
          {activeTab === 'weekend' && (
            <WeekendPlansTab plans={weekendPlans} onChange={setWeekendPlans} />
          )}
          {activeTab === 'weekday' && (
            <WeekdayEventsTab events={weekdayEvents} onChange={setWeekdayEvents} />
          )}
          {activeTab === 'sports' && (
            <SportsTab sports={sports} onChange={setSports} />
          )}
          {activeTab === 'notes' && (
            <NotesTab notes={notes} onChange={setNotes} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function KidsTab({
  hasLibbyMary,
  hasSylvie,
  onChangeLibbyMary,
  onChangeSylvie,
}: {
  hasLibbyMary: boolean;
  hasSylvie: boolean;
  onChangeLibbyMary: (v: boolean) => void;
  onChangeSylvie: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={hasLibbyMary}
          onChange={(e) => onChangeLibbyMary(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <span className="text-sm text-gray-900">Libby & Mary Craft</span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={hasSylvie}
          onChange={(e) => onChangeSylvie(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <span className="text-sm text-gray-900">Sylvie</span>
      </label>
    </div>
  );
}

function WeekendPlansTab({
  plans,
  onChange,
}: {
  plans: WeekendPlan[];
  onChange: (plans: WeekendPlan[]) => void;
}) {
  const addPlan = () => {
    onChange([...plans, { title: '', day: 'saturday', time: '' }]);
  };

  const updatePlan = (index: number, updates: Partial<WeekendPlan>) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], ...updates };
    onChange(newPlans);
  };

  const removePlan = (index: number) => {
    onChange(plans.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {plans.map((plan, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-md space-y-3">
          <div className="flex gap-3">
            <select
              value={plan.day}
              onChange={(e) => updatePlan(i, { day: e.target.value as 'saturday' | 'sunday' })}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
            <input
              type="text"
              value={plan.time || ''}
              onChange={(e) => updatePlan(i, { time: e.target.value })}
              placeholder="Time"
              className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
            <button
              onClick={() => removePlan(i)}
              className="ml-auto text-gray-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={plan.title}
            onChange={(e) => updatePlan(i, { title: e.target.value })}
            placeholder="Plan title"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
          />
        </div>
      ))}
      <button
        onClick={addPlan}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        + Add plan
      </button>
    </div>
  );
}

function WeekdayEventsTab({
  events,
  onChange,
}: {
  events: WeekdayEvent[];
  onChange: (events: WeekdayEvent[]) => void;
}) {
  const addEvent = () => {
    onChange([...events, { title: '', day: 'monday', time: '' }]);
  };

  const updateEvent = (index: number, updates: Partial<WeekdayEvent>) => {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], ...updates };
    onChange(newEvents);
  };

  const removeEvent = (index: number) => {
    onChange(events.filter((_, i) => i !== index));
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

  return (
    <div className="space-y-4">
      {events.map((event, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-md space-y-3">
          <div className="flex gap-3">
            <select
              value={event.day}
              onChange={(e) => updateEvent(i, { day: e.target.value as WeekdayEvent['day'] })}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={event.time || ''}
              onChange={(e) => updateEvent(i, { time: e.target.value })}
              placeholder="Time"
              className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
            <button
              onClick={() => removeEvent(i)}
              className="ml-auto text-gray-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={event.title}
            onChange={(e) => updateEvent(i, { title: e.target.value })}
            placeholder="Event title"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
          />
        </div>
      ))}
      <button
        onClick={addEvent}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        + Add event
      </button>
    </div>
  );
}

function SportsTab({
  sports,
  onChange,
}: {
  sports: SportsEvent[];
  onChange: (sports: SportsEvent[]) => void;
}) {
  const addSport = () => {
    onChange([...sports, { child_name: '', sport: '', day: 'saturday', time: '', location: '' }]);
  };

  const updateSport = (index: number, updates: Partial<SportsEvent>) => {
    const newSports = [...sports];
    newSports[index] = { ...newSports[index], ...updates };
    onChange(newSports);
  };

  const removeSport = (index: number) => {
    onChange(sports.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {sports.map((sport, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-md space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Sport {i + 1}</span>
            <button
              onClick={() => removeSport(i)}
              className="text-gray-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={sport.child_name}
              onChange={(e) => updateSport(i, { child_name: e.target.value })}
              placeholder="Child name"
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={sport.sport}
              onChange={(e) => updateSport(i, { sport: e.target.value })}
              placeholder="Sport"
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
            <select
              value={sport.day}
              onChange={(e) => updateSport(i, { day: e.target.value })}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            >
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
            <input
              type="text"
              value={sport.time}
              onChange={(e) => updateSport(i, { time: e.target.value })}
              placeholder="Time"
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>
          <input
            type="text"
            value={sport.location}
            onChange={(e) => updateSport(i, { location: e.target.value })}
            placeholder="Location"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
          />
        </div>
      ))}
      <button
        onClick={addSport}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        + Add sport
      </button>
    </div>
  );
}

function NotesTab({
  notes,
  onChange,
}: {
  notes: string;
  onChange: (notes: string) => void;
}) {
  return (
    <textarea
      value={notes}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Add notes for this week..."
      className="w-full h-48 px-3 py-2 text-sm border border-gray-300 rounded-md resize-none"
    />
  );
}
