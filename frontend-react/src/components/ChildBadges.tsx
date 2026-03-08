import type { ChildGroup } from '../types';

const colorMap: Record<string, string> = {
  pink: 'bg-pink-100 text-pink-800',
  purple: 'bg-purple-100 text-purple-800',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  teal: 'bg-teal-100 text-teal-800',
  indigo: 'bg-indigo-100 text-indigo-800',
};

interface ChildBadgesProps {
  childrenPresent: string[];
  childGroups: ChildGroup[];
  size?: 'sm' | 'md';
}

export function ChildBadges({ childrenPresent, childGroups, size = 'md' }: ChildBadgesProps) {
  if (childGroups.length === 0 || childrenPresent.length === 0) return null;

  const sizeClasses = size === 'sm'
    ? 'px-1 py-0.5 text-[10px]'
    : 'px-2 py-0.5 text-xs';

  return (
    <>
      {childGroups
        .filter((group) => childrenPresent.includes(group.id))
        .map((group) => (
          <span
            key={group.id}
            className={`inline-flex items-center rounded font-medium ${sizeClasses} ${colorMap[group.color] || 'bg-gray-100 text-gray-800'}`}
          >
            {size === 'sm' ? group.abbreviation : group.name}
          </span>
        ))}
    </>
  );
}
