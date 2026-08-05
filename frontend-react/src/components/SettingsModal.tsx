import { useState } from 'react';
import type { ChildGroup, UserSettings } from '../types';

const PRESET_COLORS = ['pink', 'purple', 'blue', 'green', 'amber', 'red', 'teal', 'indigo'];

const colorRingMap: Record<string, string> = {
  pink: 'bg-pink-400 ring-pink-600',
  purple: 'bg-purple-400 ring-purple-600',
  blue: 'bg-blue-400 ring-blue-600',
  green: 'bg-green-400 ring-green-600',
  amber: 'bg-amber-400 ring-amber-600',
  red: 'bg-red-400 ring-red-600',
  teal: 'bg-teal-400 ring-teal-600',
  indigo: 'bg-indigo-400 ring-indigo-600',
};

interface SettingsModalProps {
  childGroups: ChildGroup[];
  defaultMonthsOut: number;
  onSave: (settings: UserSettings) => Promise<void>;
  onClose: () => void;
}

function generateId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'group';
}

export function SettingsModal({ childGroups, defaultMonthsOut, onSave, onClose }: SettingsModalProps) {
  const [groups, setGroups] = useState<ChildGroup[]>(childGroups);
  const [monthsOut, setMonthsOut] = useState(defaultMonthsOut);
  const [saving, setSaving] = useState(false);

  const addGroup = () => {
    setGroups([...groups, { id: `group-${Date.now()}`, name: '', abbreviation: '', color: 'pink' }]);
  };

  const updateGroup = (index: number, updates: Partial<ChildGroup>) => {
    const newGroups = [...groups];
    const updated = { ...newGroups[index], ...updates };
    // Auto-generate ID from name when name changes
    if (updates.name !== undefined) {
      const newId = generateId(updates.name);
      // Only update id if it was auto-generated (not manually set by user previously)
      if (newId) {
        updated.id = newId;
      }
    }
    newGroups[index] = updated;
    setGroups(newGroups);
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        child_groups: groups.filter((g) => g.name.trim()),
        default_months_out: monthsOut,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <label htmlFor="default-months-out" className="block text-sm font-medium text-gray-900 mb-1">
              Default months shown
            </label>
            <p className="text-xs text-gray-500 mb-2">Date range used when opening the calendar list.</p>
            <input
              id="default-months-out"
              type="number"
              min={1}
              max={24}
              value={monthsOut}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isInteger(value) && value >= 1 && value <= 24) {
                  setMonthsOut(value);
                }
              }}
              className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Child Groups</h3>
            <p className="text-xs text-gray-500">Track which children you have each weekend. Leave empty to hide this feature.</p>
          </div>

          <div className="space-y-4">
            {groups.map((group, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-md space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateGroup(i, { name: e.target.value })}
                      placeholder="Name"
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={group.abbreviation}
                      onChange={(e) => updateGroup(i, { abbreviation: e.target.value })}
                      placeholder="Abbrev."
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    onClick={() => removeGroup(i)}
                    className="ml-2 mt-1 text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateGroup(i, { color })}
                      className={`w-6 h-6 rounded-full ${colorRingMap[color]?.split(' ')[0] || 'bg-gray-400'} ${
                        group.color === color ? 'ring-2 ring-offset-1 ' + (colorRingMap[color]?.split(' ')[1] || '') : ''
                      }`}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addGroup}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900"
          >
            + Add group
          </button>
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
