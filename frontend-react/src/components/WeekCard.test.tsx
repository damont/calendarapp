import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { Week } from '../types';
import { WeekCard } from './WeekCard';

describe('WeekCard', () => {
  it('renders every event when API day values include formatted dates', () => {
    const week = {
      week_start: '2026-09-21T00:00:00',
      week_end: '2026-09-27T00:00:00',
      children_present: [],
      weekend_plans: [
        {
          title: "Mom's 80th birthday party",
          day: 'Sunday, September 27',
          time: '4:00 PM–6:00 PM',
        },
      ],
      weekday_events: [
        { title: 'Cannon - No school', day: 'Monday, September 21' },
        { title: 'CMS - No school', day: 'Monday, September 21' },
      ],
      sports: [
        {
          child_name: 'Sylvie',
          sport: 'Tennis vs. Covenant Day School',
          day: 'Wednesday',
          time: '4:15 PM',
          location: 'Covenant Day School',
        },
      ],
      notes: null,
      has_html_page: false,
      html_page_updated_at: null,
      created_at: '2026-08-23T00:00:00',
      updated_at: '2026-08-23T00:00:00',
    } as unknown as Week;

    const html = renderToStaticMarkup(
      <WeekCard
        week={week}
        isCurrentWeek={false}
        childGroups={[]}
        onClick={() => undefined}
        onOpenPage={() => undefined}
      />,
    );

    expect(html).toContain('Cannon - No school');
    expect(html).toContain('CMS - No school');
    expect(html).toContain('80th birthday party');
    expect(html).toContain('Tennis vs. Covenant Day School');
  });
});
